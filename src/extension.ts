import * as vscode from 'vscode';

import newPost from './commands/new-post';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('hugo-utils.newPost', newPost));
};

export function deactivate() {};
