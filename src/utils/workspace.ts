import * as vscode from 'vscode';
import path from 'path';

export const isHugoWorkspace = async (workspace: vscode.WorkspaceFolder): Promise<boolean> => {
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
