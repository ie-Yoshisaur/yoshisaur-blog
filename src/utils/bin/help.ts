import * as bin from './index';

export const help = async (args: string[]): Promise<string> => {
    const commands = Object.keys(bin).sort().join(', ');

    return `Available commands:\n${commands}\n\n[tab]\t trigger completion.\n[ctrl+l] clear terminal.\n[ctrl+c] cancel command.`;
};
