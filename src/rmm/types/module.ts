export interface Module {
    name: string;
    version: string;
    repository: string;
    supportedVersions: string[];
    description?: string;
    lisence?: string;
    funding?: string;
    url?: string;
    bugs?: string;
    files?: string[];
    scripts?: string[];
    dependencies?: {
        [dependency: string]: string;
    }
}

export interface DotReciple extends Omit<Module, "repository"> {}

export interface Repository {}

// @repository/module@verion
// @repository/module
// module@version
// module

export interface ModuleQueryResult {
    name: string;
    author: string;
    zipUrl: string;
}