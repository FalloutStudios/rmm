import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync } from 'fs';
import AdmZip from 'adm-zip';
import path from 'path';
import yml from 'yaml';
import { DotRecipleYml } from '../classes/DotRecipleYml';
import { IDotRecipleYml } from '../types/files';
import chalk from 'chalk';
import { FetchGitHub } from '../classes/FetchGitHub';

export interface ValidatedZip {
    dotRecipleYml: IDotRecipleYml;
    tempDir: string;
}

export async function validateZip(filePath: string, github: FetchGitHub): Promise<ValidatedZip> {
    if (!filePath || !existsSync(filePath)) throw new TypeError('Zip file does not exists');

    try {
        const zip = new AdmZip(filePath, { readEntries: true });
        let tempDir = path.join(path.dirname(filePath), path.parse(filePath).name);

        if (existsSync(tempDir)) rmSync(tempDir, { recursive: true, force: true });

        mkdirSync(tempDir, { recursive: true });

        zip.extractAllTo(tempDir, true);

        let dotRecipleYml: IDotRecipleYml;
        const files = readdirSync(tempDir);
        
        if (files.length) {
            if (files.length == 1 && lstatSync(path.join(tempDir, files[0])).isDirectory()) {
                const moveFiles = readdirSync(path.join(tempDir, files[0]));

                for (const file of moveFiles) {
                    renameSync(path.join(tempDir, files[0], file), path.join(tempDir, file));
                }

                rmSync(files[0], { recursive: true, force: true });
            }

            if (!existsSync(path.join(tempDir, '.reciple.yml'))) throw new Error(`Cannot find module ${chalk.blue('.reciple.yml')}`);
            const data = yml.parse(readFileSync(path.join(tempDir, '.reciple.yml'), 'utf-8'));
            DotRecipleYml.validateDotReciple(data);

            dotRecipleYml = data;
        } else {
            throw new Error("Zip is empty");
        }

        const data: ValidatedZip = {
            tempDir,
            dotRecipleYml
        };

        return data;
    } catch (err) {
        if ((err as Error)?.message !== 'Invalid or unsupported zip format. No END header found') throw err;
        if (existsSync(filePath)) rmSync(filePath, { force: true, recursive: true });

        return validateZip(await github.cacheAsset(), github);
    }
}