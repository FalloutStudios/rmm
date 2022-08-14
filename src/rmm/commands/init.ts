import { Command } from 'commander';
import { input } from 'fallout-utility';
import { CommandFileParam } from '../types/commands';
import { IDotRecipleYml } from '../types/files';
import { cwd, program } from '../util/cli';
import semver from 'semver';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import path from 'path';
import chalk from 'chalk';
import yml from 'yaml';
import { boolean } from 'boolean';

export default (data: CommandFileParam) => program
    .command('init [location]')
    .description('Create .reciple.yml file')
    .option('--remove-old-file', 'Remove existing .reciple.yml')
    .action((args, i, command: Command) => {
        const location = command.args[0] ?? path.join(cwd, '.reciple.yml');

        if (!command.opts().removeOldFile && existsSync(location)) throw new Error(`${chalk.blue('.reciple.yml')} already exists`);

        const dotReciple: IDotRecipleYml = {
            name: (() => {
                const _: string = input({ repeatIfEmpty: false, text: "name (reciple-module): " });

                return /^[\w-]{1,32}$/.test(_) ? _ : null;
            })() || 'reciple-module',
            version: (() => {
                const _ : string = input({ repeatIfEmpty: false, text: "version (1.0.0): " });

                return semver.valid(_) ? _ : null;
            })() || '1.0.0',
            description: input({ repeatIfEmpty: false, text: "description: " }) || undefined,
            license: input({ repeatIfEmpty: false, text: "license: " })|| undefined,
            author: input({ repeatIfEmpty: false, text: "author: " }) || undefined,
            files: (() => {
                const _ : string[] = String(input({ repeatIfEmpty: false, text: "files [separated by comma \",\"]: " }))
                    .split(",")
                    .filter(f => f && existsSync(f));

                return _;
            })(),
            supportedRecipleVersions: (() => {
                const _ : string[] = String(input({ repeatIfEmpty: false, text: "supported reciple versions [separated by comma \",\"]: " }))
                    .split(",")
                    .filter(v => semver.valid(v));

                return _;
            })(),
        };

        const dotRecipleYml = yml.stringify(dotReciple);
        console.log('\n' + dotRecipleYml.trim() + '\n');

        const confirm = boolean(input({ repeatIfEmpty: false, text: "Is this OK? (yes)" }) || 'no');
        if (!confirm) return;

        rmSync(location, { recursive: true, force: true });
        mkdirSync(path.dirname(location), { recursive: true });
        writeFileSync(location, dotRecipleYml);
    })