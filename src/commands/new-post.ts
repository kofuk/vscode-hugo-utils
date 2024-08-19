import * as vscode from 'vscode';

import path from 'path';

import {getHugoWorkspaceFolder, hugo} from '../utils';

type DateFormat = 'yyyymmdd'|'yyyy-mm-dd';

const getOffsetDateString = (dateFormat: DateFormat|string): string => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    const dateString = date.toISOString().slice(0, 10);
    switch (dateFormat) {
        case 'yyyymmdd':
            return dateString.replace(/-/g, '');
        case 'yyyy-mm-dd':
            return dateString;
    };
    return dateString;
};

const newPost = async () => {
    const workspace = await getHugoWorkspaceFolder();
    if (!workspace) {
        vscode.window.showErrorMessage('Current workspace is not Hugo workspace');
        return;
    }

    // Prompt for the new post path
    const section = vscode.workspace.getConfiguration('hugo-utils').get<string>('mainSectionName')!;

    const dateFormat = vscode.workspace.getConfiguration('hugo-utils').get<DateFormat|string>('dateFormat')!;
    const date = getOffsetDateString(dateFormat);

    const postName = await vscode.window.showInputBox({
        prompt: 'Path to the new post',
        value: `${section}/${date}-title.md`,
        valueSelection: [section.length + date.length + 2, section.length + date.length + 2 + 5],
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
