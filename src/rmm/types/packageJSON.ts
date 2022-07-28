export default interface PackageJSON {
    name?: string;
    version?: string;
    license?: string;
    description?: string;
    dependencies?: {
        [dependency: string]: string;
    },
    devDependencies?: {
        [devDependecy: string]: string;
    },
}