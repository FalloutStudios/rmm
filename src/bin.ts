import { cacheDir, CommandFile, commandsDir, program } from './rmm/util/cli';
import { UnloadedCommand } from './rmm/types/commands';
import { mkdirSync, readdirSync } from 'fs'
import yml from 'yaml';
import path from 'path';
import chalk from 'chalk';
import { version } from './rmm/util/version';
import { unhandledError } from './rmm/util/error';
import { RecipleYml } from './rmm/classes/RecipleYml';
import { RecipleModulesYml } from './rmm/classes/RecipleModulesYml';
import { Registry } from './rmm/classes/Registry';

mkdirSync(commandsDir, { recursive: true });
mkdirSync(cacheDir, { recursive: true })

const unloadedCommands: UnloadedCommand[] = [];
const commandFiles = readdirSync(commandsDir).filter(f => f.endsWith('.js')).map(f => path.join(commandsDir, f));

console.log(chalk.bold(`Reciple module manager v${version}`));

(async () => {
    for (const commandFile of commandFiles) {
        try {
            const commandInit = require(commandFile);
            const command: CommandFile = commandInit?.default ?? commandInit;
            if (typeof command !== 'function') throw new Error('Invalid command file');

            await Promise.resolve(command({
                unloadedCommands,
                commandFiles
            })).catch(err => { throw err; });
        } catch (err) {
            unloadedCommands.push({
                file: commandFile,
                error: err as Error
            });
        }
    }

    await program.parseAsync();
})();

process.on('uncaughtException', (err: Error) => unhandledError(err));
process.on('unhandledRejection', (err: Error) => unhandledError(err));