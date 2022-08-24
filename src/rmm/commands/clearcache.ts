import chalk from 'chalk';
import { existsSync, linkSync, lstatSync, readdirSync, rmSync } from 'fs';
import path from 'path';
import { CommandFileParam } from '../types/commands';
import { cacheDir, program } from '../util/cli';
import { formatBytes } from '../util/converters';
import { createSpinner } from '../util/createSpinner';

export default (data: CommandFileParam) => program
    .command('clearcache')
    .description(`Clear rmm cache`)
    .aliases(["cc"])
    .action(() => {
        const spinner = createSpinner(`Clearing cache from ${chalk.dim(cacheDir)}`);
        const files = readdirSync(cacheDir).filter(f => lstatSync(path.join(cacheDir, f)).isDirectory());

        spinner.text = `Deleting cache from ${chalk.blue(files.length)} modules author(s)`;
        spinner.stop();

        let cacheSize: number = 0;

        for (const folder of files) {
            const dir = path.join(cacheDir, folder);
            const folderSpinner = createSpinner(`Deleting ${chalk.green(dir)}`);

            cacheSize = cacheSize + lstatSync(dir).size;
            rmSync(dir, { recursive: true, force: true });

            folderSpinner.succeed(`Deleted cache from ${chalk.blue(folder)}`);
        }

        spinner.succeed(`Deleted ${chalk.green(formatBytes(cacheSize))} of cached modules`);
    });