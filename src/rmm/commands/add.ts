import { CommandFileParam } from '../types/commands';
import { program } from '../util/cli';

export default (data: CommandFileParam) => program
    .command("add [modules]")
    .description("install modules")
    .aliases(["install", "i"])
    .action(args => {
        console.log('eee');
        throw new TypeError("hi");
    });