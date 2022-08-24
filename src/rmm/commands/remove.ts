import chalk from 'chalk';
import { Command } from 'commander';
import { existsSync, rmSync } from 'fs';
import path from 'path';
import { RecipleModulesYml } from '../classes/RecipleModulesYml';
import { CommandFileParam } from '../types/commands';
import { program } from '../util/cli';
import { resolveModuleQuery } from '../util/converters';
import { createSpinner } from '../util/createSpinner';
import { runScript } from '../util/runScript';

export default (data: CommandFileParam) => program
    .command("remove <modules>")
    .description("remove modules")
    .aliases(["uninstall", "un"])
    .action(async (args, i, command: Command) => {
        const recipleModulesYml = new RecipleModulesYml();
        const modules = command.args.map(m => {
            const query = resolveModuleQuery(m);
            if (query.type == 'github') throw new TypeError(`Use module name to remove a module.`);

            const mod = recipleModulesYml.data.modules.find(m => m.name === query.module);
            if (!mod) throw new TypeError(`Can't find module named ${chalk.blue(query.module)}`);

            return mod;
        });

        for (const mod of modules) {
            const removeSpinner = createSpinner(`Removing ${chalk.blue(mod.name) + chalk.dim('@') + chalk.green(mod.version)}...`).start();

            const files = mod.files.map(p => path.join(mod.containingFolder, p));

            for (const file of files) {
                if (!existsSync(file)) continue;

                rmSync(file, { recursive: true, force: true });
            }

            recipleModulesYml.remove(mod);
            removeSpinner.stop();

            await runScript(mod.scripts ?? {}, 'uninstalled');

            removeSpinner.succeed(`Removed ${chalk.blue(mod.name) + chalk.dim('@') + chalk.green(mod.version)}`);
        }
    });