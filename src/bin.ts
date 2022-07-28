#!/usr/bin/env node
import { RmmCommandMetadata } from './rmm/types/command';
import PackageJSON from './rmm/types/packageJSON';

import { Command } from 'commander';
import { mkdirSync, readdirSync } from 'fs';
import path from 'path';

const unloadedCommandFiles: RmmCommandMetadata["unloadedCommandFiles"] = [];
const packageJSON: Required<PackageJSON> = require('../package.json');
const program = new Command()
    .name('rmm')
    .description(packageJSON.description)
    .version(packageJSON.version, '-v, --version');

mkdirSync(path.join(__dirname, './rmm/commands'), { recursive: true });

const commandFiles = readdirSync(path.join(__dirname, './rmm/commands')).filter(file => file.endsWith('.js'));

(async () => {
    for (const commandFile of commandFiles) {
        try {
            const file = path.join(__dirname, './rmm/commands', commandFile);
            const command = require(file);

            await Promise.resolve((command?.default ? command.default : command)(program, {
                commandFiles,
                packageJSON,
                unloadedCommandFiles
            }));
        } catch (err) {
            unloadedCommandFiles.push({
                file: path.join(__dirname, commandFile),
                error: err as Error
            });
        }
    }
    program.parse();
})();