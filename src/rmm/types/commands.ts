import { IPackageJson, IRecipleYml, IRecipleModulesYml } from './files';

export type Awaitable<T> = PromiseLike<T>|T;

export interface UnloadedCommand {
    file: string;
    error: Error;
}

export interface CommandFileParam {
    unloadedCommands: UnloadedCommand[];
    commandFiles: string[];
    packageJson: IPackageJson;
    recipleYml: IRecipleYml;
    recipleModulesYml: IRecipleModulesYml;
}