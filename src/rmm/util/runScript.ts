import chalk from 'chalk';
import { ChildProcess, spawn } from 'child_process';
import { splitString } from 'fallout-utility';
import { IDotRecipleScripts } from '../types/files';
import { cwd } from './cli';

export async function runScript(scripts: IDotRecipleScripts, run: keyof IDotRecipleScripts) {
    const script = scripts[run] ? splitString(scripts[run]!, false, ' ') : null;

    if (!script) return;
    
    console.log(chalk.dim(`${chalk.bold('$')} ${script.join(' ')}`))
    const child: ChildProcess = spawn(script.shift() ?? 'exit', script, { cwd, env: { ...process.env, FORCE_COLOR: '1' }, stdio: ['inherit', 'inherit', 'inherit'] });

    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);

    if (child.stdin) process.stdin.pipe(child.stdin);

    return new Promise((res) => child.on('close', () => res(void 0)));
}