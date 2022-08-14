import { Registry } from '../classes/Registry';
import { IPackageJson, IRecipleYml, IRecipleModulesYml, IRegistry } from './files';

export type Awaitable<T> = PromiseLike<T>|T;
export type RestOrArray<T> = T[]|[T[]];

export type version = 'latest'|string;

export interface UnloadedCommand {
    file: string;
    error: Error;
}

export interface CommandFileParam {
    unloadedCommands: UnloadedCommand[];
    commandFiles: string[];
}

export interface StringModuleQuery {
    type: 'string';
    repository?: string;
    module: string;
    tag: version;
}

export interface GitHubModuleQuery {
    type: 'github';
    owner: string;
    repository: string;
    tag: version;
}