import { BaseFileReader, BaseFileReaderOptions } from './base/BaseFileReader';
import { IDotReciple, IRecipleModulesYml, IRepository } from '../types/files';
import { cwd } from '../util/cli';
import path from 'path';
import yml from 'yaml';
import { DotReciple } from './DotReciple';
import { RestOrArray } from '../types/commands';
import { normalizeArray } from '../util/converters';
import chalk from 'chalk';

export class RecipleModulesYml extends BaseFileReader<IRecipleModulesYml> {
    public filePath: string = path.join(cwd, 'reciple-modules.yml');
    public defaultData: string = this.getDefaultData();
    public data: IRecipleModulesYml = { modules: [] };

    constructor(options?: BaseFileReaderOptions) {
        super(options);
        this.fetch();
    }
    
    public fetch(): void {
        this.data = yml.parse(this.read());
    }

    public add(module: IRecipleModulesYml["modules"][0]): IRecipleModulesYml["modules"];
    public add(...modules: RestOrArray<IRecipleModulesYml["modules"][0]>): IRecipleModulesYml["modules"] {
        modules = normalizeArray(modules);
        modules.forEach(mod => DotReciple.validateDotReciple(mod));

        for (const mod of modules) {
            this.data.modules.push(mod);
        }

        this.update();
        return modules;
    }

    public remove(name: string): IRecipleModulesYml["modules"];
    public remove(module: IDotReciple): IRecipleModulesYml["modules"];
    public remove(...names: RestOrArray<string>): IRecipleModulesYml["modules"];
    public remove(...modules: RestOrArray<IDotReciple>): IRecipleModulesYml["modules"];
    public remove(...modules: RestOrArray<IDotReciple|string>): IRecipleModulesYml["modules"] {
        const names: string[] = normalizeArray(modules).map(m => typeof m !== 'string' ? m.name : m);

        names.forEach(name => {
            if (!this.data.modules.some(mod => mod.name == name)) throw new TypeError(`Cannot find installed module with name ${chalk.blue(name)}`);
        });

        const removed = this.data.modules.filter(mod => names.some(name => name == mod.name));
        this.data.modules = this.data.modules.filter(mod => !removed.some(rmd => rmd.name == mod.name));

        this.update();
        return removed;
    }

    public update() {
        this.save(yml.stringify(this.data));
    }

    public getDefaultData(): string {
        const data: IRecipleModulesYml = {
            modules: []
        };
        
        return yml.stringify(data);
    }
}