import * as vscode from 'vscode';
import cp from 'child_process';

export const hugo = async (args: string[], cwd: string): Promise<void> => {
	const channel = vscode.window.createOutputChannel('Hugo');

	return new Promise((resolve, reject) => {
		const process = cp.spawn('hugo', args, {cwd});
		process.stdout.on('data', (data: Buffer) => channel.append(data.toString('utf-8')));
		process.stderr.on('data', (data: Buffer) => channel.append(data.toString('utf-8')));
		process.on('close', (code: number) => {
			if (code === 0) {
				resolve();
			} else {
				reject(`Command "hugo ${args.join(' ')}" failed with code ${code}`);
			}
		});
	});
};
