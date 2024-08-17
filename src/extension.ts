import * as vscode from 'vscode';

import newPost from './commands/new-post';
import convertToBundle from './commands/convert-to-bundle';
import { getHugoWorkspaceFolder } from './utils/workspace';

const initializeContext = async () => {
	const workspace = await getHugoWorkspaceFolder();
	vscode.commands.executeCommand('setContext', 'hugo-utils.inHugoWorkspace', !!workspace);
};

export async function activate(context: vscode.ExtensionContext) {
	await initializeContext();

	context.subscriptions.push(
		vscode.commands.registerCommand('hugo-utils.newPost', newPost),
		vscode.commands.registerCommand('hugo-utils.convertToBundle', convertToBundle)
	);
};

export function deactivate() {};
