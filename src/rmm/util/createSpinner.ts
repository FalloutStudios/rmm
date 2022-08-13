import cliSpinners from 'cli-spinners';
import ora, { Ora } from 'ora';

export function createSpinner(text: string): Ora {
    // dots11
    return ora({ color: 'white', spinner: cliSpinners.dots11, text });
}