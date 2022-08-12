import { RecipleModulesYml } from '../classes/RecipleModulesYml';
import { CommandFileParam } from '../types/commands';
import { program } from '../util/cli';

export default (data: CommandFileParam) => program
    .command("add [modules]")
    .description("install modules")
    .aliases(["install", "i"])
    .action(args => {
        const recipleModulesYml = new RecipleModulesYml();
    });