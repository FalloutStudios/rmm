import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import chalk from 'chalk';
import { version } from '../types/commands';
import { Registry } from './Registry';
import { escapeRegExp, trimChars } from 'fallout-utility';
import path from 'path';
import { createWriteStream, existsSync, lstatSync, mkdirSync, rmSync } from 'fs';
import { cacheDir } from '../util/cli';
import axios from 'axios';

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
        const rest = `https://api.github.com/repos/${this.owner}/${this.repository}/releases/${this.tag == 'latest' ? 'latest' : 'tags/' + this.tag}`;

        this.data = await axios.get(rest)
            .then(res => res.data)
            .catch(err => { throw err; });

        if (!this.data) throw new Error("Can't fetch repository");
        this.filename = path.join(this.owner, this.repository, this.data.node_id + '.zip');
    }

    public async cacheAsset(): Promise<string> {

        if (!this.data || !this.filename) throw new Error("Repository is not fetched");

        const cachePath = path.join(cacheDir, this.filename);
        if (existsSync(cachePath)) {
            if (!lstatSync(cachePath).isDirectory()) return cachePath;

            rmSync(cachePath, { recursive: true });
        }

        mkdirSync(path.dirname(cachePath), { recursive: true });
        const zipUrl = (this.data.assets.length ? (this.data.assets.find((a: { [key: string]: any }) => a.name.toLowerCase() == 'module.zip')?.browser_download_url ?? null) : null) ?? this.data.zipball_url;
        if (!zipUrl) throw new Error(`No ${chalk.blue('module.zip')} found in repository release`);

        const zipHttp = await axios.get(zipUrl, { responseType: 'stream' }).catch(err => {throw err});

        zipHttp.data.pipe(createWriteStream(cachePath));
        zipHttp.data.on('error', (err: Error) => { throw err; });

        await new Promise((res, rej) => zipHttp.data.on('end', res(void 0)));

        return cachePath;
    }

    public static async fetch(name: string, repository?: string, tag: version = 'latest'): Promise<FetchGitHub> {
        const registry = new Registry();

        await registry.fetch();
        const url = await registry.findModule(name, repository);
        if (!url) throw new Error(`Cannot find module named ${chalk.red(name)}`);
        
        const fetch = new FetchGitHub(url, tag);
        await fetch.fetch();

        return fetch;
    }
}