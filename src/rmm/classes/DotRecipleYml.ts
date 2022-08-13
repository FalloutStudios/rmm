import { BaseFileReader, BaseFileReaderOptions } from './base/BaseFileReader';
import { IDotRecipleYml } from '../types/files';
import { cwd } from '../util/cli';
import path from 'path';
import semver from 'semver';
import { toArray } from '../util/converters';

export class DotRecipleYml extends BaseFileReader<IDotRecipleYml> {
    public filePath: string = path.join(cwd, 'reciple.yml');

    constructor(options?: BaseFileReaderOptions) {
        super(options);
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