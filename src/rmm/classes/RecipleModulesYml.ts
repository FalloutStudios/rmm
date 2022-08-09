import { BaseFileReader, BaseFileReaderOptions } from './base/BaseFileReader';
import { IRecipleModulesYml } from '../types/reciple-modulesYml';
import { cwd } from '../util/cli';
import path from 'path';

export class RecipleYml extends BaseFileReader<IRecipleModulesYml> {
    public filePath: string = path.join(cwd, 'reciple.yml');

    constructor(options?: BaseFileReaderOptions) {
        super(options);
    }
}