import { RecipleModulesYml } from '../classes/RecipleModulesYml';
import { CommandFileParam } from '../types/commands';
import { program } from '../util/cli';
import semver from 'semver';
import yml from 'yaml';
import { IRecipleModulesYml } from '../types/files';
import chalk from 'chalk';
import { toArray } from '../util/converters';
import { RecipleYml } from '../classes/RecipleYml';

export default (data: CommandFileParam) => program
    .command("list [filter]")
    .description("list modules")
    .aliases(["ls"])
    .action(args => {
        const recipleYml = new RecipleYml();
        const modules: IRecipleModulesYml["modules"] = yml.parse(new RecipleModulesYml().read()).modules;

        for (const mod of modules) {
            console.log(`${chalk.blue(mod.name) + chalk.dim('@') + chalk.green(mod.version)} — ${mod.description ?? 'No description.'}`);
            console.log(`    supported versions: ${toArray(mod.supportedRecipleVersions).map(v => semver.satisfies(`${semver.coerce(recipleYml.recipleYml.version)}`, v) ? chalk.green(v) : chalk.dim(v)).join(' ')}`);
            console.log(`    repository: ${chalk.blue(mod.repositoryURL)}`);
            console.log(`    folder: ${chalk.blue(mod.containingFolder)}`);
            console.log(`    tag: ${chalk.blue(mod.tag)}`)
            console.log(`    files: ${chalk.green('Includes '+ mod.files.length + ' file(s)')}`);

            if (mod.author) console.log(`    author: ${chalk.blue(mod.author)}`);
            if (mod.license) console.log(`    license: ${chalk.blue(mod.license)}`);
            if (mod.dependencies) console.log(`    dependencies: ${chalk.blue(Object.keys(mod.dependencies).join(', '))}`);
        }
    });