import { BaseFileReader, BaseFileReaderOptions } from './base/BaseFileReader';
import { IRecipleYml } from '../types/files';
import { cwd } from '../util/cli';
import path from 'path';

export class RecipleYml extends BaseFileReader<IRecipleYml> {
    public filePath: string = path.join(cwd, 'reciple.yml');

    constructor(options?: BaseFileReaderOptions) {
        super(options);
    }
}