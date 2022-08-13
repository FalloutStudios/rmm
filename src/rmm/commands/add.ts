import chalk from 'chalk';
import { Command } from 'commander';
import { input } from 'fallout-utility';
import { existsSync, fstat, mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from 'fs';
import path from 'path';
import semver from 'semver';
import { FetchGitHub } from '../classes/FetchGitHub';
import { PackageJson } from '../classes/PackageJson';
import { RecipleModulesYml } from '../classes/RecipleModulesYml';
import { Registry } from '../classes/Registry';
import { CommandFileParam } from '../types/commands';
import { IRecipleModulesYml } from '../types/files';
import { cacheDir, program } from '../util/cli';
import { resolveModuleQuery, toArray } from '../util/converters';
import { createSpinner } from '../util/createSpinner';
import { runScript } from '../util/runScript';
import { validateZip } from '../util/validateZip';

export default (data: CommandFileParam) => program
    .command("add [modules]")
    .description("install modules")
    .aliases(["install", "i"])
    .action(async (args, e, command: Command) => {
        const registry = new Registry();
        const recipleModulesYml = new RecipleModulesYml();
        const packageJson = new PackageJson();

        let modifiedPackageJson = false;

        const registrySpinner = createSpinner('Fetching registry...');
        const modulesSpinner = createSpinner('Resolving modules...');
        const installSpinner = createSpinner('Installing modules...');

        registrySpinner.start();

        await registry.fetch();
        registrySpinner.succeed("Fetched registry!");
        
        modulesSpinner.start();
        modulesSpinner.info(`${command.args.join(', ')}`);
        
        const additional = (data.recipleModulesYml.modules ?? []).filter(m => !existsSync(m.containingFolder) || m.files.every(f => !existsSync(path.join(m.containingFolder, f))));
        const modules = await Promise.all([...command.args, ...additional].map(async query => {
            const q = resolveModuleQuery(typeof query !== 'string' ? `${query.repositoryURL}@${query.tag}` : query);

            if (q.type == 'github') {
                const fetch = new FetchGitHub(`https://github.com/${q.owner}/${q.repository}/`, q.tag);

                modulesSpinner.text = `Resolving ${chalk.dim('github:') + chalk.blue(q.owner + '/' + q.repository) + chalk.dim('@') + chalk.green(q.tag)}...`;
                await fetch.fetch();

                const asset = await fetch.cacheAsset();

                modulesSpinner.info(`Cached ${chalk.dim('github:') + chalk.blue(q.owner + '/' + q.repository) + chalk.dim('@') + chalk.green(q.tag)}: ${chalk.dim(asset)}`);
                return fetch;
            }
            
            modulesSpinner.text = `Resolving ${q.repository ? chalk.dim(q.repository) + chalk.dim(':') : ''}${chalk.blue(q.module) + chalk.dim('@') + chalk.green(q.tag)}...`;

            const fetch = await FetchGitHub.fetch(q.module, q.repository, q.tag);
            const asset = await fetch.cacheAsset();
            modulesSpinner.info(`Cached ${q.repository ? chalk.dim(q.repository) + chalk.dim(':') : ''}${chalk.blue(q.module) + chalk.dim('@') + chalk.green(q.tag)}: ${chalk.dim(asset)}`);
            return fetch;
        }));

        modulesSpinner.succeed(`Cached ${modules.length} module(s)`);

        if (toArray(data.recipleYml.modulesFolder).length > 1) {
            console.log(`Choose module installation folder.`);
            console.log(toArray(data.recipleYml.modulesFolder).map((v, i) => `${v}: ${chalk.dim('[') + chalk.blue(`${i}`) + chalk.dim(']')}`).join('\n'));
        }

        const containingFolder = toArray(data.recipleYml.modulesFolder)[(toArray(data.recipleYml.modulesFolder).length > 1 ? Number(input('folder index: ')) || 0 : 0)];
        if (!containingFolder) throw new Error('Invalid containing folder');
        
        installSpinner.start();
        for (const mod of modules) {
            const cachePath = path.join(cacheDir, mod.filename!);
            const existingData = data.recipleModulesYml.modules.find(m => m.name === mod.name || m.repositoryURL.includes(`github.com/${mod.owner}/${mod.repository}`));
            const isUpdate = !!existingData ?? additional.some(m => m.name === mod.name || m.repositoryURL.includes(`github.com/${mod.owner}/${mod.repository}`));
            const folder = (isUpdate ? existingData?.containingFolder : containingFolder) ?? containingFolder;

            mkdirSync(folder, { recursive: true });

            installSpinner.text = `Extracting: ${chalk.blue(cachePath)}`;
            const res = await validateZip(cachePath);
            const modData: IRecipleModulesYml["modules"][0] = {
                ...res.dotRecipleYml,
                containingFolder: folder,
                repositoryURL: `https://github.com/${mod.owner}/${mod.repository}/`,
                tag: mod.tag
            };

            installSpinner.text = `Installing: ${chalk.blue(modData.name)}`;

            if (!toArray(modData.supportedRecipleVersions).some(v => semver.satisfies(`${semver.coerce(data.recipleYml.version)}`, v))) throw new Error(`${chalk.blue(modData.name)} does not support ${chalk.blue('reciple') + chalk.dim('@') + chalk.green(String(semver.coerce(data.recipleYml.version)))}`);
            if ((!isUpdate && existingData) && semver.satisfies(modData.version, `<${existingData.version}`)) throw new Error(`Newer version of ${chalk.blue(modData.name)} already exists. Remove the current version before installing older version of this module`);
            if (!isUpdate && !existingData) {
                const conflictingFiles = modData.files.map(f => path.join(folder, f)).filter(f => existsSync(f));
                if (conflictingFiles.length) throw new Error(`Installation has conficting files from module ${chalk.blue(modData.name)}: ${conflictingFiles.map(f => chalk.red(f)).join(', ')}`);
            } else if (isUpdate && existingData) {
                for (const file of existingData.files) {
                    rmSync(path.join(existingData.containingFolder, file), { recursive: true, force: true });
                }
            }

            recipleModulesYml.add(modData);

            const files = readdirSync(res.tempDir).filter(f => modData.files.some(i => i == f));
            
            for (const file of files) {
                renameSync(path.join(res.tempDir, file), path.join(folder, file));
            }

            for (const dependency of Object.keys(modData.dependencies ?? {})) {
                if (packageJson.data.dependencies!["dependency"]) {
                    installSpinner.warn(`A different version of ${chalk.blue(dependency)} dependent by ${chalk.blue(modData.name)} was already installed`);
                } else {
                    packageJson.data.dependencies = packageJson.data.dependencies ?? {};
                    packageJson.data.dependencies[dependency] = modData.dependencies![dependency];

                    modifiedPackageJson = true;
                }
            }

            installSpinner.stop();

            await runScript(modData.scripts ?? {}, 'installed');
            installSpinner.start();
            installSpinner.info(`Installed ${chalk.blue(modData.name)}`);
        }

        if (modifiedPackageJson) {
            installSpinner.warn(`${chalk.blue(`package.json`)} was modified. Install new dependencies using your package manager`);

            writeFileSync(path.join(path.dirname(packageJson.filePath), 'package.json.old'), packageJson.read());
            writeFileSync(packageJson.filePath, JSON.stringify(packageJson.data, null, 2));
        }
        
        installSpinner.succeed(`Modules installed successfuly!`);
    });