import axios from 'axios';
import chalk from 'chalk';
import path from 'path';
import { IRegistry, IRepository } from '../types/files';
import { opts, rmmDir } from '../util/cli';
import { BaseFileReader, BaseFileReaderOptions } from './base/BaseFileReader';

export interface RepositoryCache {
    name: string;
    url: string;
    data: IRepository;
}

export class Registry extends BaseFileReader<IRegistry> {
    public filePath: string = opts.RegistryJson ?? path.join(rmmDir, 'registry.json');
    public defaultData: string = this.getDefaultData();
    public data: IRegistry = JSON.parse(this.read());
    public repositories: RepositoryCache[] = [];

    constructor (options?: BaseFileReaderOptions) {
        super(options);
        this.fetch();
    }

    public async fetchRepository(name: string): Promise<IRepository|null>;
    public async fetchRepository(repository: IRegistry["repositories"][0]): Promise<IRepository>;
    public async fetchRepository(name: string|IRegistry["repositories"][0]): Promise<IRepository|null> {
        const data = typeof name == 'string' ? this.data.repositories.find(r => r.name == name) : name;
        if (!data) return null;

        const repository: IRepository = await axios({
            url: data.url,
            method: 'GET'
        })
        .then(res => res.data as IRepository);

        return repository;
    }

    public async fetch(): Promise<IRepository[]> {
        const repositories: IRepository[] = [];
        const cache: RepositoryCache[] = [];

        for (const data of this.data.repositories) {
            const repository = await this.fetchRepository(data);

            repositories.push(repository);
            cache.push({
                name: data.name,
                url: data.url,
                data: repository
            });
        }

        this.repositories = cache;
        return repositories;
    }

    public async findModule(name: string, repository?: string): Promise<string|null> {
        if (!this.repositories.length) await this.fetch();

        const repo = this.repositories.find(r => typeof r.data[name] == 'string' && (repository && r.name === repository || !repository));
        if (!repo) return null;

        return repo["data"][name] ?? null;
    }

    public addRepository(data: Omit<IRegistry["repositories"][0], 'createdAt'>): this {
        if (!data.name || !/^[\w-]{1,32}$/.test(data.name)) throw new TypeError("Invalid repository name");
        if (!data.url) throw new TypeError("Repository URL is undefined");
        if (!data.url.startsWith('http://') && data.url.startsWith('https://')) throw new TypeError("Invalid repository URL");
        if (this.data.repositories.some(r => data.name === r.name)) throw new Error(`Repository with name ${chalk.blue(data.name)} already exists.`);

        this.data.repositories.push({ ...data, createdAt: Date.now() });

        this.update();
        return this;
    }

    public removeRepository(name: string): this;
    public removeRepository(url: string): this;
    public removeRepository(data: string): this {
        if (!this.data.repositories.some(r => r.name === data || r.url === data)) throw new Error("No repository found");

        this.data.repositories = this.data.repositories.filter(r => r.name !== data || r.url !== data);

        this.update();
        return this;
    }

    public update(): void {
        this.save(JSON.stringify(this.data));
        this.fetch();
    }

    public getDefaultData(): string {
        const data: IRegistry = {
            repositories: [
                {
                    name: 'reciple',
                    url: 'https://raw.githubusercontent.com/FalloutStudios/reciple-modules/main/repository.json',
                    createdAt: Date.now(),
                }
            ]
        };

        return JSON.stringify(data);
    }
}