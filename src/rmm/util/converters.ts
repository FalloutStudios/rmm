import { escapeRegExp, trimChars } from 'fallout-utility';
import semver from 'semver';
import { GitHubModuleQuery, RestOrArray, StringModuleQuery, version } from '../types/commands';

export function toArray<T> (data: T|T[]): T[] {
    return Array.isArray(data) ? data : [data];
}

export function normalizeArray<T>(arr: RestOrArray<T>): T[] {
	return Array.isArray(arr[0]) ? arr[0] : arr as T[];
}

export function formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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

    return {
        type: 'string',
        repository,
        module: name.split(':').pop()!,
        tag: tag ?? 'latest'
    };
}