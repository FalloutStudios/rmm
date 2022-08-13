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
        const registry = new Registry();

        console.log(`Fetching registry...`);
        await registry.fetch();

        const modules = await Promise.all(command.args.map(async query => {
            const q = resolveModuleQuery(query);
            
            return await FetchGitHub.fetch(q.module, q.repository, q.tag);
        }));

        for (const mod of modules) {
            console.log(mod.cacheAsset());
        }
    });