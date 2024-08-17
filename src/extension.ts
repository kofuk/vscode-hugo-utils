import * as vscode from 'vscode';
import path from 'path';

const isHugoWorkspace = async (workspace: vscode.WorkspaceFolder): Promise<boolean> => {
	const workspaceUri = workspace.uri;
	for (const name of ['config.toml', 'hugo.toml']) {
		const hugoConfigUri = workspaceUri.with({path: path.join(workspaceUri.path, name)});
		try {
			await vscode.workspace.fs.stat(hugoConfigUri);
			return true;
		} catch (error) {}
	}
	return false;
};

const hugo = async (args: string[], cwd: string): Promise<void> => {
	const channel = vscode.window.createOutputChannel('Hugo');

	return new Promise((resolve, reject) => {
		const process = require('child_process').spawn('hugo', args, {cwd});
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

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('hugo-utils.newPost', async () => {
		const workspace = vscode.workspace.workspaceFolders?.[0];
		if (!workspace || !await isHugoWorkspace(workspace)) {
			vscode.window.showErrorMessage('No Hugo workspace detected');
			return;
		}

		// Prompt for the new post path
		const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
		const postName = await vscode.window.showInputBox({prompt: 'Path to the new post', value: `blog/${date}-title.md`, valueSelection: [14, 19]});
		if (!postName) {
			return;
		}

		// Create the new post using Hugo command
		try {
			await hugo(['new', postName], workspace.uri.fsPath);
		} catch (error) {
			console.error(error);
			vscode.window.showErrorMessage('Failed to create a new post');
		}

		// Open the new post
		const postUri = workspace.uri.with({path: path.join(workspace.uri.path, 'content', postName)});
		const document = await vscode.workspace.openTextDocument(postUri);
		await vscode.window.showTextDocument(document);
	}));
};

export function deactivate() {};
