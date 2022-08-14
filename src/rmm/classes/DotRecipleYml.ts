import { BaseFileReader, BaseFileReaderOptions } from './base/BaseFileReader';
import { IDotRecipleYml } from '../types/files';
import { cwd } from '../util/cli';
import yml from 'yaml';
import path from 'path';
import semver from 'semver';
import { toArray } from '../util/converters';
import { existsSync } from 'fs';
import chalk from 'chalk';

export class DotRecipleYml extends BaseFileReader<IDotRecipleYml> {
    public filePath: string = path.join(cwd, '.reciple.yml');
    public data: IDotRecipleYml;

    constructor(options?: BaseFileReaderOptions) {
        super(options);

        this.filePath =  options?.filePath ?? this.filePath;
        this.data = yml.parse(this.read());
    }

    public update(): void {
        this.save(yml.stringify(this.data));
    }

    public read(): string {
        if (!existsSync(this.filePath)) throw new Error(`${chalk.blue('.reciple.yml')} does not exists`);

        return super.read();
    }

    public static validateDotReciple(data: any): null {
        if (!data?.name) throw new TypeError("Module name is undefined");
        if (!data?.name.match(/^[\w-]{1,32}$/)) throw new TypeError("Invalid module name");
        if (!data?.supportedRecipleVersions?.length) throw new Error("Module does not have supported versions");
        if (toArray(data.supportedRecipleVersions).every(v => !semver.valid(semver.coerce(v)))) throw new TypeError("Module does not have any valid supported versions");
        if (!data?.files.length) throw new Error("Module files is undefined or empty");
        if (!data?.version || !semver.valid(data.version)) throw new TypeError("Undefined or invalid module version");
        if (data?.dependencies && typeof data.dependencies !== 'object') throw new Error("Invalid module dependency list");
        if (data?.scripts && typeof data.scripts !== 'object') throw new Error("Invalid script list");
        
        return null;
    }
}