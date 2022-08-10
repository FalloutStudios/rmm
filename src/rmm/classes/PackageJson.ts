import { BaseFileReader, BaseFileReaderOptions } from './base/BaseFileReader';
import { IPackageJson } from '../types/files';
import { cwd } from '../util/cli';
import path from 'path';

export class PackageJson extends BaseFileReader<IPackageJson> {
    public filePath: string = path.join(cwd, 'package.json');

    constructor(options?: BaseFileReaderOptions) {
        super(options);
    }
}