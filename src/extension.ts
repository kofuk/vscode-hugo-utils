import * as vscode from 'vscode';

import convertToBundle from './commands/convert-to-bundle';
import newPost from './commands/new-post';
import updateLastmod from './commands/update-lastmod';
import {ShortcodeCompletionProvider} from './languages/shortcode-completion';
import {getHugoWorkspaceFolder} from './utils';

const initializeContext = async () => {
  const workspace = await getHugoWorkspaceFolder();
  vscode.commands.executeCommand('setContext', 'hugo-utils.inHugoWorkspace', !!workspace);
};

export async function activate(context: vscode.ExtensionContext) {
  await initializeContext();

  context.subscriptions.push(
    vscode.commands.registerCommand('hugo-utils.newPost', newPost),
    vscode.commands.registerCommand('hugo-utils.convertToBundle', convertToBundle),
    vscode.commands.registerCommand('hugo-utils.updateLastmod', updateLastmod),
    vscode.languages.registerCompletionItemProvider('markdown', new ShortcodeCompletionProvider(), ' ')
  );
}

export function deactivate() {}
