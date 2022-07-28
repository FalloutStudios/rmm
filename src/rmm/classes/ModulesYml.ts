import { DotReciple, Module } from '../types/module';

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import yml from 'yaml';

export interface IModulesYml {
    modules: Module[];
}

export interface ModulesYmlOptions {
    location: string;
    data?: IModulesYml;
}

export class ModulesYml {
    public location: string = path.join(process.cwd(), 'modules.yml');
    public data: IModulesYml = ModulesYml.getDefault();

    constructor (location?: string);
    constructor (options?: string|ModulesYmlOptions) {
        if (typeof options == 'string') options = { location: options };
        
        this.location = options?.location ?? this.location;
        this.read(options?.data);
    }

    public add(moduleData: Module, save: boolean = true): ModulesYml {
        this.data.modules.push(moduleData);

        if (save) this.save();
        return this;
    }

    public remove(moduleName: string, save: boolean): ModulesYml;
    public remove(moduleData: string|Partial<Module> & { name: string; }, save: boolean = true): ModulesYml {
        const moduleName: string = typeof moduleData == 'string' ? moduleData : moduleData.name;
        const index = this.data.modules.findIndex(m => m.name === moduleName);
        
        if (index < 0) throw new Error(`Coudn't find a module named "${moduleName}"`);

        this.data.modules.splice(index);

        if (save) this.save();
        return this;
    }

    public read(defaultModulesYml?: IModulesYml): IModulesYml {
        if (!existsSync(this.location)) return this.save(defaultModulesYml ?? ModulesYml.getDefault());
        
        this.data = JSON.parse(readFileSync(this.location, 'utf-8'));
        return this.data;
    }

    public save(modulesYml?: IModulesYml): IModulesYml {
        const data = modulesYml ?? this.data ?? ModulesYml.getDefault();

        mkdirSync(path.dirname(this.location), { recursive: true });
        writeFileSync(this.location, yml.stringify(data), 'utf-8');

        this.data = JSON.parse(readFileSync(this.location, 'utf-8'));
        return this.data;
    }

    public static validateDotReciple(dotReciple: DotReciple): boolean {
        if (!dotReciple) return false;
        if (!dotReciple.name) return false;
        if (!dotReciple.version) return false;
        if (!dotReciple.supportedVersions || !Array.isArray(dotReciple.supportedVersions)) return false;
        if (dotReciple.files && !Array.isArray(dotReciple.files)) return false;
        if (dotReciple.scripts && !Array.isArray(dotReciple.scripts)) return false;

        return true;
    }

    public static validateModule(moduleData: Module): boolean {
        const validateDotReciple = this.validateDotReciple(moduleData);
        
        if (!validateDotReciple) return false;
        if (!moduleData.repository) return false;

        return true;
    }

    public static getDefault(): IModulesYml {
        return { modules: [] };
    }
}