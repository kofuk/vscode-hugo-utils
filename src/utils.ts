import cp from 'child_process';
import path from 'path';
import * as vscode from 'vscode';

let channel: vscode.OutputChannel | null = null;

export const getOutputChannel = (): vscode.OutputChannel => {
  if (!channel) {
    channel = vscode.window.createOutputChannel('Hugo');
  }
  return channel;
};

export const hugo = async (args: string[], cwd: string): Promise<void> => {
  const channel = getOutputChannel();

  return new Promise((resolve, reject) => {
    const process = cp.spawn('hugo', args, {cwd});
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

export const getHugoWorkspaceFolder = async (): Promise<vscode.WorkspaceFolder | null> => {
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
