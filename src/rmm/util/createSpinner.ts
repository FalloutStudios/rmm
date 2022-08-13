import cliSpinners from 'cli-spinners';
import ora, { Ora } from 'ora';

export function createSpinner(text: string): Ora {
    // dots11
    const spinner = ora({ color: 'white', spinner: cliSpinners.dots11, text, stream: process.stdout });

    process.once('exit', () => {
        if (spinner.isSpinning) spinner.fail('Abborted');
    });

    process.once('SIGINT', () => {
        if (spinner.isSpinning) spinner.fail('Abborted');
    });

    process.once('SIGTERM', () => {
        if (spinner.isSpinning) spinner.fail('Abborted');
    });

    return spinner;
}