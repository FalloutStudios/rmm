import { Awaitable, CommandFileParam } from '../types/commands';
import { Command } from 'commander';
import { version } from './version';
import path from 'path';

export const program = new Command()
    .name("rmm")
    .version(`v${version}`, '-v, --version')
    .option('-p, --package-json <packageJsonLocation>', 'Set package.json path', './package.json')
    .option('-c --reciple-yml <recipleYmlLocation>', 'Set reciple.yml path', './reciple.yml')
    .description("Reciple module manager");

export const cwd = process.cwd();
export const rmmDir = path.join(__dirname, '../');
export const commandsDir = path.join(rmmDir, 'commands');
export const opts = program.parse().opts();

export type CommandFile = (data: CommandFileParam) => Awaitable<Command>;