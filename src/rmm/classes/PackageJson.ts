import { BaseFileReader, BaseFileReaderOptions } from './base/BaseFileReader';
import { IPackageJson } from '../types/files';
import { cwd, opts } from '../util/cli';
import path from 'path';
import { existsSync } from 'fs';
import chalk from 'chalk';

export class PackageJson extends BaseFileReader<IPackageJson> {
    public filePath: string = opts.packageJson ?? path.join(cwd, 'package.json');
    public data: IPackageJson;

    constructor(options?: BaseFileReaderOptions) {
        super(options);

        this.data = JSON.parse(this.read());
    }

    public read(): string {
        if (!existsSync(this.filePath)) throw new Error(`Could not find ${chalk.bold.blue("package.json")}`);

        return super.read();
    }
}