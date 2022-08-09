import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { cwd } from '../../util/cli';

export interface BaseFileReaderOptions {
    filePath: string;
}

export class BaseFileReader<T> {
    public filePath: string = cwd;
    public data?: T;

    constructor(options?: BaseFileReaderOptions) {
        this.filePath = options?.filePath ?? this.filePath;
    }

    public read(): string {
        if (!existsSync(this.filePath)) return this.save();

        return readFileSync(this.filePath, 'utf-8');
    }

    public save(data?: string): string {
        mkdirSync(path.dirname(this.filePath), { recursive: true });
        writeFileSync(this.filePath, data ?? this.defaultData());

        return this.read();
    }

    public defaultData(): string {
        return '';
    }
}