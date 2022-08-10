import { RecipleModulesYml } from '../classes/RecipleModulesYml';
import { CommandFileParam } from '../types/commands';
import { program } from '../util/cli';
import yml from 'yaml';
import { IRecipleModulesYml } from '../types/files';

export default (data: CommandFileParam) => program
    .command("list [filter]")
    .description("list modules")
    .aliases(["ls"])
    .action(args => {
        const modules: IRecipleModulesYml["modules"] = yml.parse(new RecipleModulesYml().read()).modules;
        
        for (const _module of modules) {
            console.log(JSON.stringify(_module));
        }
    });