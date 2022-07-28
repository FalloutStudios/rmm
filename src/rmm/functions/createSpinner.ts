import cliSpinners from 'cli-spinners';
import ora from 'ora';

export default (options: string|ora.Options, spinner?: ora.Options["spinner"]|cliSpinners.SpinnerName) => {
    if (typeof options === 'string') options = { text: options };
    
    return ora({
        ...options,
        spinner: spinner ?? cliSpinners.boxBounce2
    });
}