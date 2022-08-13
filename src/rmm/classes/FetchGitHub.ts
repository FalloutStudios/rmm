import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import chalk from 'chalk';
import { version } from '../types/commands';
import { Registry } from './Registry';
import { escapeRegExp, trimChars } from 'fallout-utility';
import path from 'path';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { cacheDir } from '../util/cli';
import axios from 'axios';

export const octokit = new Octokit();

export class FetchGitHub {
    public url: string;
    public owner: string;
    public repository: string;
    public tag: version;
    public data?: RestEndpointMethodTypes["repos"]["getLatestRelease"]["response"]["data"];
    public filename?: string;
    
    constructor(url: string, tag: version = 'latest') {
        this.url = url;
        this.tag = tag;
        
        const split = trimChars(this.url, ["http://", "https://"].map(s => escapeRegExp(s))).split("/");
        this.owner = split[1];
        this.repository = trimChars(split[2], escapeRegExp(".git"));
    }

    public async fetch(): Promise<void> {
        if (this.tag !== 'latest') {
            this.data = await octokit.repos.getReleaseByTag({
                owner: this.owner,
                repo: this.repository,
                tag: this.tag
            }).then(res => res.data);
        } else {
            this.data = await octokit.repos.getLatestRelease({
                owner: this.owner,
                repo: this.repository
            }).then(res => res.data);
        }

        this.filename = path.join(this.owner, this.repository, this.data.node_id + '.zip');
    }

    public async getAsset(): Promise<string> {

        if (!this.data || !this.filename) throw new Error("Repository is not fetched");

        const cachePath = path.join(cacheDir, this.filename);
        if (existsSync(cachePath)) return cachePath;

        mkdirSync(path.dirname(path.join(cacheDir, this.filename)), { recursive: true });
        const zipUrl = (this.data.assets.length ? (this.data.assets.find((a: { [key: string]: any }) => a.name.toLowerCase() == 'module.zip')?.browser_download_url ?? null) : null) ?? this.data.zipball_url;
        if (!zipUrl) throw new Error(`No ${chalk.blue('module.zip')} found in repository release`);

        const zipHttp = await axios.get(zipUrl, { responseType: 'stream' }).catch(err => {throw err});

        zipHttp.data.pipe(createWriteStream(cacheDir));
        zipHttp.data.on('error', (err: Error) => { throw err; });

        await new Promise((res, rej) => zipHttp.data.on('end', res(void 0)));

        return cachePath;
    }

    public static async fetch(name: string, repository?: string, tag: version = 'latest'): Promise<FetchGitHub> {
        const registry = new Registry();

        await registry.fetch();
        const url = await registry.findModule(name, repository);
        if (!url) throw new Error(`Cannot find module named ${chalk.red(name)}`);

        return new FetchGitHub(url, tag);
    }
}