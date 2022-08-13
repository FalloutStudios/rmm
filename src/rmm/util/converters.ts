import semver from 'semver';
import { ModuleQuery, RestOrArray } from '../types/commands';

export function toArray<T> (data: T|T[]): T[] {
    return Array.isArray(data) ? data : [data];
}

export function normalizeArray<T>(arr: RestOrArray<T>): T[] {
	return Array.isArray(arr[0]) ? arr[0] : arr as T[];
}

export function resolveModuleQuery(query: string): ModuleQuery {
    const [name, tag] = query.split('@', 2) as (string|undefined)[];
    const repository = ((name?.split(':').length ?? 0) > 1 ? name?.split(':')[0] : undefined) || undefined;
    
    if (!name) throw new TypeError("Module name must be specified");
    if (tag && !semver.valid(tag)) throw new TypeError("Invalid module version");

    return {
        repository,
        module: name.split(':').pop()!,
        tag: tag ?? 'latest'
    };
}