import chalk from 'chalk';
import { Command } from 'commander';
import { existsSync } from 'fs';
import { FetchGitHub } from '../classes/FetchGitHub';
import { RecipleModulesYml } from '../classes/RecipleModulesYml';
import { Registry } from '../classes/Registry';
import { CommandFileParam } from '../types/commands';
import { program } from '../util/cli';
import { resolveModuleQuery, toArray } from '../util/converters';
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
        modulesSpinner.info(`${command.args.join(', ')}`);
        
        const additional = (data.recipleModulesYml.modules ?? []).filter(m => !existsSync(m.containingFolder) || m.files.every(f => !existsSync(f))).map(m => m.repositoryURL);
        const modules = await Promise.all([...toArray(command.args), ...toArray(additional)].map(async query => {
            if (!query) return;
            const q = resolveModuleQuery(query);

            if (q.type == 'github') {
                const fetch = new FetchGitHub(`https://github.com/${q.owner}/${q.repository}/`, q.tag);

                modulesSpinner.text = `Resolving ${chalk.dim('github:') + chalk.blue(q.owner + '/' + q.repository) + chalk.dim('@') + chalk.green(q.tag)}...`;
                await fetch.fetch();

                const asset = (await fetch.cacheAsset());

                modulesSpinner.info(`Cached ${chalk.dim('github:') + chalk.blue(q.owner + '/' + q.repository) + chalk.dim('@') + chalk.green(q.tag)}: ${chalk.dim(asset)}`);
                return asset;
            }
            
            modulesSpinner.text = `Resolving ${q.repository ? chalk.dim(q.repository) + chalk.dim(':') : ''}${chalk.blue(q.module) + chalk.dim('@') + chalk.green(q.tag)}...`;

            const asset = await (await FetchGitHub.fetch(q.module, q.repository, q.tag)).cacheAsset();
            modulesSpinner.info(`Cached ${q.repository ? chalk.dim(q.repository) + chalk.dim(':') : ''}${chalk.blue(q.module) + chalk.dim('@') + chalk.green(q.tag)}: ${chalk.dim(asset)}`);
            return asset;
        }));

        modulesSpinner.succeed(`Cached ${modules.length} module(s)`);
        installSpinner.start();
    });