import { IPackageJson, IRecipleYml, IRecipleModulesYml, IRegistry } from './files';

export type Awaitable<T> = PromiseLike<T>|T;
export type RestOrArray<T> = T[]|[T[]];

export interface UnloadedCommand {
    file: string;
    error: Error;
}

export interface CommandFileParam {
    unloadedCommands: UnloadedCommand[];
    commandFiles: string[];
    registry: IRegistry;
    packageJson: IPackageJson;
    recipleYml: IRecipleYml;
    recipleModulesYml: IRecipleModulesYml;
}