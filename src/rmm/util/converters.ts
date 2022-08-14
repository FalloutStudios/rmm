import { escapeRegExp, trimChars } from 'fallout-utility';
import semver from 'semver';
import { GitHubModuleQuery, RestOrArray, StringModuleQuery, version } from '../types/commands';

export function toArray<T> (data: T|T[]): T[] {
    return Array.isArray(data) ? data : [data];
}

export function normalizeArray<T>(arr: RestOrArray<T>): T[] {
	return Array.isArray(arr[0]) ? arr[0] : arr as T[];
}

export function resolveModuleQuery(query: string): StringModuleQuery|GitHubModuleQuery {
    if (query.startsWith('https://') || query.startsWith('http://')) {
        const split = trimChars(query, ["http://", "https://"].map(s => escapeRegExp(s))).split('/', 3);
        const name = split[1];
        const repository = split[2];

        const tagSplit = query.split('@');
        const tag: version = tagSplit.length > 1 ? tagSplit.pop()! : 'latest';

        if (!name || !repository) throw new TypeError('Invalid URL');
        return {
            type: 'github',
            owner: name,
            repository,
            tag
        };
    }

    const [name, tag] = query.split('@', 2) as (string|undefined)[];
    const repository = ((name?.split(':').length ?? 0) > 1 ? name?.split(':')[0] : undefined) || undefined;
    
    if (!name) throw new TypeError("Module name must be specified");
    if (tag) throw new TypeError("Invalid module tag");

    return {
        type: 'string',
        repository,
        module: name.split(':').pop()!,
        tag: tag ?? 'latest'
    };
}