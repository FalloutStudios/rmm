import axios from 'axios';
import path from 'path';
import { IRegistry, IRepository } from '../types/files';
import { opts, rmmDir } from '../util/cli';
import { BaseFileReader, BaseFileReaderOptions } from './base/BaseFileReader';

export class Registry extends BaseFileReader<IRegistry> {
    public filePath: string = opts.RegistryJson ?? path.join(rmmDir, 'registry.json');
    public defaultData: string = this.getDefaultData();
    public data: IRegistry = JSON.parse(this.read());

    constructor (options?: BaseFileReaderOptions) {
        super(options);
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

        for (const data of this.data.repositories) {
            repositories.push(await this.fetchRepository(data));
        }

        return repositories;
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