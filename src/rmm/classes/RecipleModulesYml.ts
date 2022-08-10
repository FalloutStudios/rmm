import { BaseFileReader, BaseFileReaderOptions } from './base/BaseFileReader';
import { IRecipleModulesYml } from '../types/files';
import { cwd } from '../util/cli';
import path from 'path';
import yml from 'yaml';

export class RecipleYml extends BaseFileReader<IRecipleModulesYml> {
    public filePath: string = path.join(cwd, 'reciple-modules.yml');
    public defaultData: string = this.getDefaultData();

    constructor(options?: BaseFileReaderOptions) {
        super(options);
    }

    public getDefaultData(): string {
        const data: IRecipleModulesYml = {
            modules: []
        };
        
        return yml.stringify(data);
    }
}