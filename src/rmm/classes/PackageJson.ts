import { BaseFileReader, BaseFileReaderOptions } from './base/BaseFileReader';
import { IPackageJson } from '../types/files';
import { cwd } from '../util/cli';
import path from 'path';
import { existsSync } from 'fs';
import chalk from 'chalk';

export class PackageJson extends BaseFileReader<IPackageJson> {
    public filePath: string = path.join(cwd, 'package.json');

    constructor(options?: BaseFileReaderOptions) {
        super(options);
    }

    public read(): string {
        if (!existsSync(this.filePath)) throw new Error(`Could not find ${chalk.bold.blue("package.json")}`);

        return super.read();
    }
}