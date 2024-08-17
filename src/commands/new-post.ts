import * as vscode from 'vscode';

import path from 'path';

import {hugo} from '../utils/command';
import {getHugoWorkspaceFolder} from '../utils/workspace';

const getOffsetDateString = (): string => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 10).replace(/-/g, '');
};

const newPost = async () => {
    const workspace = await getHugoWorkspaceFolder();
    if (!workspace) {
        vscode.window.showErrorMessage('Current workspace is not Hugo workspace');
        return;
    }

    vscode.commands.executeCommand('setContext', 'hugo-utils.inHugoWorkspace', true);

    // Prompt for the new post path
    const date = getOffsetDateString();
    const section = vscode.workspace.getConfiguration('hugo-utils').get<string>('mainSectionName')!;
    const postName = await vscode.window.showInputBox({
        prompt: 'Path to the new post',
        value: `${section}/${date}-title.md`,
        valueSelection: [section.length + 10, section.length + 15],
    });
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
