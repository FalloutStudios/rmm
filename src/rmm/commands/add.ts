import { RecipleModulesYml } from '../classes/RecipleModulesYml';
import { Registry } from '../classes/Registry';
import { CommandFileParam } from '../types/commands';
import { program } from '../util/cli';

export default (data: CommandFileParam) => program
    .command("add [modules]")
    .description("install modules")
    .aliases(["install", "i"])
    .action(async args => {
        const registry = new Registry();
        if (!registry.repositories.length) {
            console.log('Fetching repositories...');
            await registry.fetch();
        }

        console.log(registry);
    });