import { Awaitable, CommandFileParam } from '../types/commands';
import { Command, program as Program } from 'commander';
import { version } from './version';
import path from 'path';

export const program = new Command()
    .name("rmm")
    .version(`v${version}`, '-v, --version')
    .option('-p, --package-json <packageJsonLocation>', 'Set package.json path', './package.json')
    .option('-c --reciple-yml <recipleYmlLocation>', 'Set reciple.yml path', './reciple.yml')
    .option('-r, --registry-json <registryJsonLocation>', 'Set registry.json location', path.join(__dirname, '../registry.json'))
    .description("Reciple module manager")
    .enablePositionalOptions(true);

export const cwd = process.cwd();
export const rmmDir = path.join(__dirname, '../../../');
export const commandsDir = path.join(rmmDir, './bin/rmm/', 'commands');
export const cacheDir = path.join(rmmDir, 'cache');
export const opts = program.parse().opts();

export type CommandFile = (data: CommandFileParam) => Awaitable<Command>;