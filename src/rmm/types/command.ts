import PackageJSON from './packageJSON';

import { Command } from 'commander';

export interface RmmCommandMetadata {
    unloadedCommandFiles: { file: string; error: Error; }[];
    commandFiles: string[];
    packageJSON: Required<PackageJSON>;
}

export type RmmCommand<T extends RmmCommandMetadata = RmmCommandMetadata> = (program: Command, metadata?: T) => void|Promise<void>;