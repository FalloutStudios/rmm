export interface IDotRecipleScripts {
    installed?: string;
    uninstalled?: string;
}

export interface IPackageJson {
    name?: string;
    displayName?: string;
    description?: string;
    version?: string;
    author?: string;
    license?: string;
    dependencies?: { [dependency: string]: string; };
    devDependencies?: { [dependency: string]: string; };
}

export interface IRecipleYml {
    token: string;
    modulesFolder: string|string[];
    version: string;
}

export interface IDotReciple {
    name: string;
    version: string;
    files: string[];
    supportedRecipleVersions: string|string[];
    dependencies?: { [dependency: string]: string; };
    scripts?: IDotRecipleScripts;
    description?: string;
    license?: string;
    author?: string;
}

export interface IRecipleModulesYml {
    modules: (IDotReciple & { repositoryURL: string; containingFolder: string; })[];
}

export interface IRegistry {
    repositories: {
        name: string;
        url: string;
        createdAt: number;
    }[];
}

export interface IRepository {
    [name: string]: string;
}