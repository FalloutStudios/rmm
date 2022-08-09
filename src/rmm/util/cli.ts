import { Awaitable, CommandFileParam } from '../types/commands';
import { Command } from 'commander';
import { version } from './version';
import path from 'path';

export const program = new Command()
    .name("rmm")
    .version(`v${version}`, '-v, --version')
    .description("Reciple module manager");

export const cwd = process.cwd();
export const rmmDir = path.join(__dirname, '../');
export const commandsDir = path.join(rmmDir, 'commands');

export type CommandFile = (data: CommandFileParam) => Awaitable<Command>;