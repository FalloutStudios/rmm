import { BaseFileReader, BaseFileReaderOptions } from './base/BaseFileReader';
import { IPackageJson, IRecipleYml } from '../types/files';
import { cwd } from '../util/cli';
import yml from 'yaml';
import path from 'path';
import chalk from 'chalk';
import semver from 'semver';
import { existsSync } from 'fs';
import { PackageJson } from './PackageJson';

export class RecipleYml extends BaseFileReader<IRecipleYml> {
    public filePath: string = path.join(cwd, 'reciple.yml');
    public modulesFolder: string[];
    public version: string;
    public packageJson: IPackageJson;
    public recipleYml: IRecipleYml;

    constructor(options?: BaseFileReaderOptions) {
        super(options);

        const recipleYml: IRecipleYml = yml.parse(this.read());
        const packageJson: IPackageJson = JSON.parse(new PackageJson().read());

        this.modulesFolder = Array.isArray(recipleYml.modulesFolder) ? recipleYml.modulesFolder : [recipleYml.modulesFolder];
        this.version = String(semver.coerce(packageJson.version));
        this.packageJson = packageJson;
        this.recipleYml = recipleYml;
    }

    public read(): string {
        if (!existsSync(this.filePath)) throw new Error(`Could not find ${chalk.bold.blue("reciple.yml")}`);

        return super.read();
    }
}