import chalk from 'chalk';
import { CommandFileParam } from '../types/commands';
import { program } from '../util/cli';

export default (data: CommandFileParam) => program
    .command('unloaded-commands', { hidden: true })
    .description('Show failed to load commands.')
    .action(() => {
        for (const unloadedCommand of data.unloadedCommands) {
            console.log(`${chalk.bold.red("Failed to load")}: ${unloadedCommand.file}`);
            console.log(`                ${chalk.gray(String(unloadedCommand.error?.stack).split('\n').join(`\n                `))}`);
        }
    });