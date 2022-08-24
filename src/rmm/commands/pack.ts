import AdmZip from 'adm-zip';
import chalk from 'chalk';
import { Command } from 'commander';
import { existsSync, lstatSync, rmSync } from 'fs';
import path from 'path';
import { DotRecipleYml } from '../classes/DotRecipleYml';
import { CommandFileParam } from '../types/commands';
import { cwd, program } from '../util/cli';
import { createSpinner } from '../util/createSpinner';

export default (data: CommandFileParam) => program
    .command("pack [outFile]")
    .description("Make a zip file of a module")
    .option('--module-dir <moduleDirectory>', 'Directory of module that contains the .reciple.yml')
    .option('--remove-old-file <boolean>', 'Remove existing zip file')
    .action(async (args, i, command: Command) => {
        let outFile = command.args[0] ?? path.join(cwd, 'module.zip');
        let moduleDir = command.opts().moduleDir ?? cwd;
        
        if (!lstatSync(moduleDir).isDirectory()) throw new Error("Module dir is not a directory");
        if (!command.opts().removeOldFile && existsSync(outFile)) throw new Error("Module file already exists");
        if (!existsSync(path.join(moduleDir, ".reciple.yml"))) throw new Error(`Module dir does not have ${chalk.blue(".reciple.yml")}`);
        if (existsSync(outFile) && lstatSync(outFile).isDirectory()) outFile = path.join(outFile, 'module.zip');

        const dotRecipleYml = new DotRecipleYml({ filePath: path.join(moduleDir, ".reciple.yml") }).data;

        DotRecipleYml.validateDotReciple(dotRecipleYml);
        if (!dotRecipleYml.files.length) throw new Error("Module does not include any files");
        
        const missing = dotRecipleYml.files.filter(f => !existsSync(path.join(moduleDir, f)));
        if (missing.length) throw new Error(`Module has missing included files: ${missing.map(f => chalk.red(f)).join(' ')}`);

        const spinner = createSpinner("Creating module archive...");
        const zip = new AdmZip();

        spinner.start();
        
        zip.addLocalFile(path.join(moduleDir, '.reciple.yml'));

        for (const file of dotRecipleYml.files.map(f => path.join(moduleDir, f))) {
            spinner.text = `Adding ${chalk.blue(file)}`;

            if (lstatSync(file).isDirectory()) {
                zip.addLocalFolder(file);
            } else {
                zip.addLocalFile(file);
            }

            spinner.stop();
            createSpinner().info(`Added ${chalk.blue(file)}`);
            spinner.start();
        }

        spinner.text = `Creating output file...`;

        rmSync(outFile, { force: true, recursive: true });
        zip.writeZip(outFile);

        spinner.succeed(`Module archive successfuly created: ${chalk.dim(outFile)}`);
    })