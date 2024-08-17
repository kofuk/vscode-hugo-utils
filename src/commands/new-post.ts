import * as vscode from 'vscode';

import path from 'path';

import {hugo} from '../utils/command';
import {isHugoWorkspace} from '../utils/workspace';

const newPost = async () => {
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
};

export default newPost;
