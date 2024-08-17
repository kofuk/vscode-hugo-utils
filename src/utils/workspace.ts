import * as vscode from 'vscode';

import path from 'path';

export const getHugoWorkspaceFolder = async (): Promise<vscode.WorkspaceFolder|null> => {
    const workspace = vscode.workspace.workspaceFolders?.[0];
    if (!workspace) {
        return null;
    }

	const workspaceUri = workspace.uri;
	for (const name of ['config.toml', 'hugo.toml']) {
		const hugoConfigUri = workspaceUri.with({path: path.join(workspaceUri.path, name)});
		try {
			await vscode.workspace.fs.stat(hugoConfigUri);
			return workspace;
		} catch (error) {}
	}

    return null;
};
