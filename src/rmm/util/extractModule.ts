import chalk from 'chalk';
import { existsSync } from 'fs';

export function extractModule(path: string) {
    if (!existsSync(path)) throw new TypeError(`Module cache '${chalk.dim(path)}' not found`);
}