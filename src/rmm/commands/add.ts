import { Command } from 'commander';
import { FetchGitHub } from '../classes/FetchGitHub';
import { RecipleModulesYml } from '../classes/RecipleModulesYml';
import { Registry } from '../classes/Registry';
import { CommandFileParam } from '../types/commands';
import { program } from '../util/cli';
import { resolveModuleQuery } from '../util/converters';

export default (data: CommandFileParam) => program
    .command("add [modules]")
    .description("install modules")
    .aliases(["install", "i"])
    .action(async (args, e, command: Command) => {
        const queries = command.args.map(q => resolveModuleQuery(q));
        const registry = new Registry();

        console.log(`Fetching registry...`);
        await registry.fetch();

        for (const query of queries) {
            console.log(query);
        }
    });