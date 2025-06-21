import path from 'path';
import * as vscode from 'vscode';

const convertToBundle = async () => {
  const oldUri = vscode.window.activeTextEditor?.document.uri;
  if (!oldUri) {
    vscode.window.showErrorMessage('Hugo post is not opened');
    return;
  }

  if (path.basename(oldUri.path) === 'index.md') {
    vscode.window.showInformationMessage('Current page is already a page bundle');
    return;
  }

  const directoryUri = oldUri.with({path: oldUri.path.replace(/\.md$/, '')});
  const newUri = directoryUri.with({path: path.join(directoryUri.path, 'index.md')});
  await vscode.workspace.fs.createDirectory(directoryUri);
  await vscode.workspace.fs.rename(oldUri, newUri);
};

export default convertToBundle;
