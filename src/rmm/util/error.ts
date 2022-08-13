import chalk from 'chalk';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import stripAnsi from 'strip-ansi';
import { cwd } from './cli';

export function unhandledError (error: Error) {const file = path.join(cwd, 'rmm-err.log');
    let data = existsSync(file) ? readFileSync(file, 'utf-8') : '';

    console.error(`\n${chalk.bold.red(error.name)}: ${error.message}`);
    console.log(chalk.gray(`Logged to ${chalk.blue('rmm-err.log:'+ (data.split('\n').length + 3))}`));

    if (!data) mkdirSync(path.dirname(file), { recursive: true });

    writeFileSync(file, (data + `\n\n\n${new Date()}:\n\n  Execute: ${process.argv.join(' ')}\n\n  Exec Args: ${process.execArgv.join(' ')}\n\n  ${(stripAnsi(error.stack ?? String(error))).split('\n').join('\n')}`).trim());

    process.exit(1);
}