import chalk from 'chalk';
import { Command } from 'commander';
import { FetchGitHub } from '../classes/FetchGitHub';
import { RecipleModulesYml } from '../classes/RecipleModulesYml';
import { Registry } from '../classes/Registry';
import { CommandFileParam } from '../types/commands';
import { program } from '../util/cli';
import { resolveModuleQuery } from '../util/converters';
import { createSpinner } from '../util/createSpinner';

export default (data: CommandFileParam) => program
    .command("add [modules]")
    .description("install modules")
    .aliases(["install", "i"])
    .action(async (args, e, command: Command) => {
        const registry = new Registry();
        const registrySpinner = createSpinner('Fetching registry...');
        const modulesSpinner = createSpinner('Resolving modules...');
        const installSpinner = createSpinner('Installing modules...');

        registrySpinner.start();

        await registry.fetch();
        registrySpinner.succeed("Fetched registry!");
        
        modulesSpinner.start();
        const modules = await Promise.all(command.args.map(async query => {
            const q = resolveModuleQuery(query);
            modulesSpinner.text = `Resolving ${q.repository ? chalk.gray(q.repository) + chalk.dim(':') : ''}${chalk.blue(q.module) + chalk.dim('@') + chalk.green(q.tag)}...`;
            
            const asset = await (await FetchGitHub.fetch(q.module, q.repository, q.tag)).cacheAsset();
            modulesSpinner.info(`Cached ${q.repository ? chalk.gray(q.repository) + chalk.dim(':') : ''}${chalk.blue(q.module) + chalk.dim('@') + chalk.green(q.tag)}: ${chalk.dim(asset)}`);
            return asset;
        }));

        modulesSpinner.succeed(`Cached ${modules.length} module(s)`);
        installSpinner.start();
    });