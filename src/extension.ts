import * as vscode from 'vscode';

import newPost from './commands/new-post';
import convertToBundle from './commands/convert-to-bundle';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('hugo-utils.newPost', newPost),
		vscode.commands.registerCommand('hugo-utils.convertToBundle', convertToBundle)
	);
};

export function deactivate() {};
