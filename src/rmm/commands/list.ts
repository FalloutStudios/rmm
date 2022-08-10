import { CommandFileParam } from '../types/commands';
import { program } from '../util/cli';

export default (data: CommandFileParam) => program
    .command("list [filter]")
    .description("list modules")
    .aliases(["ls"])
    .action(args => {});