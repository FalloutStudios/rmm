import { BaseFileReader, BaseFileReaderOptions } from './base/BaseFileReader';
import { IRecipleModulesYml } from '../types/files';
import { cwd } from '../util/cli';
import path from 'path';
import yml from 'yaml';

export class RecipleModulesYml extends BaseFileReader<IRecipleModulesYml> {
    public filePath: string = path.join(cwd, 'reciple-modules.yml');
    public defaultData: string = this.getDefaultData();
    public data: IRecipleModulesYml = { modules: [] };

    constructor(options?: BaseFileReaderOptions) {
        super(options);
        this.fetch();
    }

    public fetch(): void {
        this.data = yml.parse(this.read());
    }

    public add(...module: IRecipleModulesYml["modules"]): IRecipleModulesYml {
        

        return this.data;
    }

    public getDefaultData(): string {
        const data: IRecipleModulesYml = {
            modules: []
        };
        
        return yml.stringify(data);
    }
}