import { RestOrArray } from '../types/commands';

export function toArray<T> (data: T|T[]): T[] {
    return Array.isArray(data) ? data : [data];
}

export function normalizeArray<T>(arr: RestOrArray<T>): T[] {
	return Array.isArray(arr[0]) ? arr[0] : arr as T[];
}