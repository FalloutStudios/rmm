import { BaseFileReader, BaseFileReaderOptions } from './base/BaseFileReader';
import { IDotReciple } from '../types/files';
import { cwd } from '../util/cli';
import path from 'path';

export class DotReciple extends BaseFileReader<IDotReciple> {
    public filePath: string = path.join(cwd, 'reciple.yml');

    constructor(options?: BaseFileReaderOptions) {
        super(options);
    }
}