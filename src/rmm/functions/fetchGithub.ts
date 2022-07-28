import axios from 'axios';

export interface FetchGithubOptions {
    username: string;
    repository: string;
    tag?: string|'latest';
}

export interface PartialGithubRelease {
    url: string;
    html_url: string;
    id: number;
    author: {
        login: string;
        id: number;
        avatar_url: string;
        url: string;
        html_url: string;
        gists_url: string;
        type: string;
        site_admin: boolean;
    }
    tarball_url: string;
    zipball_url: string;
    body: string;
}

export default async function fetchGithub(options: FetchGithubOptions): Promise<PartialGithubRelease> {
    const api = `https://api.github.com/repos/${options.username}/${options.repository}/releases${options.tag && options.tag !== 'latest' ? '/tags/' + options.tag : '/latest' }`;
    const data: PartialGithubRelease = await axios({
        url: api,
        responseType: 'json',
        method: 'GET'
    })
    .then(res => res.data as PartialGithubRelease)
    .catch(err => { throw err; });

    return data;
}