import { ModuleQueryResult } from '../types/module';

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import yml from 'yaml';

export interface IRepositoriesJson {
    [repositoryName: string]: string;
}

export interface RepositoriesJsonOptions {
    location: string;
    data?: IRepositoriesJson;
}

export class RepositoriesJson {
    public location: string = path.join(__dirname, '../../../repositories.json');
    public data: IRepositoriesJson = RepositoriesJson.getDefault();

    constructor(location?: string);
    constructor(options?: string|RepositoriesJsonOptions) {
        if (typeof options == 'string') options = { location: options };

        this.location = options?.location ?? this.location;
        this.read(options?.data);
    }

    public add(...repositories: { name: string; repository: string; }[]): RepositoriesJson {
        const newData = this.data;

        for (const repository of repositories) {
            if (!repository.name.match(/^[\w-]{1,32}$/)) throw new TypeError('Repository name does not match /^[\\w-]{1,32}$/ regex');
            if (!repository.repository.startsWith('https://') || !repository.repository.startsWith('http://')) {
                throw new TypeError('Ivalid repository url');
            }

            newData[repository.name] = repository.repository;
        }

        this.data = newData;
        this.save();

        return this;
    }

    public remove(...repository: string[]): RepositoriesJson {
        const newData: IRepositoriesJson = {};

        for (const repositoryName in this.data) {
            if (repository.some(n => n == repositoryName)) continue;

            newData[repositoryName] = this.data[repositoryName];
        }

        this.data = newData;
        this.save();

        return this;
    }

    public read(defaultRepositories?: IRepositoriesJson): IRepositoriesJson {
        if (!existsSync(this.location)) return this.save(defaultRepositories ?? RepositoriesJson.getDefault());
        
        this.data = JSON.parse(readFileSync(this.location, 'utf-8'));
        return this.data;
    }

    public save(repositories?: IRepositoriesJson): IRepositoriesJson {
        const data = repositories ?? this.data ?? RepositoriesJson.getDefault();

        mkdirSync(path.dirname(this.location), { recursive: true });
        writeFileSync(this.location, yml.stringify(data), 'utf-8');

        this.data = JSON.parse(readFileSync(this.location, 'utf-8'));
        this.save();

        return this.data;
    }

    public async fetch(query: string): Promise<ModuleQueryResult[]> {
        return [];
    }

    public static getDefault(): IRepositoriesJson {
        return {
            "reciple-modules": "https://raw.githubusercontent.com/FalloutStudios/reciple-modules/main/repository.json"
        };
    }
}