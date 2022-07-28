import { RmmCommandMetadata } from '../types/command';

import chalk from 'chalk';
import { Command } from 'commander';

export default (program: Command, metadata?: RmmCommandMetadata) => {
    program
        .command('unloaded-commands', { hidden: true })
        .description('List unloaded rmm commands')
        .action(() => {
            for (const unloadedCommand of metadata?.unloadedCommandFiles ?? []) {
                console.log(`- ${chalk.green(unloadedCommand.file)}`);
                console.log(`  ${chalk.gray((unloadedCommand.error.stack ?? String(unloadedCommand.error)).split('\n').join('\n  '))}`);
            }
        });
}