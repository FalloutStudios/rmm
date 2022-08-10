import { CommandFileParam } from '../types/commands';
import { program } from '../util/cli';

export default (data: CommandFileParam) => program
    .command("remove <modules>")
    .description("remove modules")
    .aliases(["uninstall", "un"])
    .action(args => {});