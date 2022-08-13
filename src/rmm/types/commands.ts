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
    registry: Registry;
    packageJson: IPackageJson;
    recipleYml: IRecipleYml;
    recipleModulesYml: IRecipleModulesYml;
}

export interface ModuleQuery {
    repository?: string;
    module: string;
    tag: version;
}