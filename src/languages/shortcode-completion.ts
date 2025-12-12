import path from 'path';
import * as vscode from 'vscode';
import {getHugoWorkspaceFolder} from '../utils';
import {EMBEDDED_SHORTCODES, Shortcode} from './shortcodes';

type ShortcodeState = {
  shortcode: string;
  args: string;
};

export class ShortcodeCompletionProvider implements vscode.CompletionItemProvider {
  private shortcodes: Record<string, Shortcode> = EMBEDDED_SHORTCODES;

  private completeShortcodeName(): vscode.CompletionItem[] {
    return Object.keys(this.shortcodes).map((name) => {
      const shortcode = this.shortcodes[name];
      const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Function);
      item.insertText = new vscode.SnippetString(`${name} $1`);
      let doc = shortcode.doc?.concat('\n') ?? '';
      if (shortcode.deprecated) {
        item.tags = [vscode.CompletionItemTag.Deprecated];
        doc += `- Deprecated in ${shortcode.deprecated}.\n`;
      }
      if (shortcode.removed) {
        item.tags = [vscode.CompletionItemTag.Deprecated];
        doc += `- Removed in ${shortcode.removed}.\n`;
      }
      if (doc.length > 0) {
        item.documentation = new vscode.MarkdownString(doc);
      }
      return item;
    });
  }

  private isBeginningOfShortcode(linePrefix: string): boolean {
    return linePrefix.endsWith('{{< ') || linePrefix.endsWith('{{% ');
  }

  private isInShortcode(linePrefix: string): boolean {
    return (linePrefix.includes('{{< ') || linePrefix.includes('{{% ')) && !linePrefix.includes('}}');
  }

  private getCurrentShortcodeState(linePrefix: string): ShortcodeState {
    const shortcode = linePrefix.match(/{{[<%] ([^\s]+)/)?.[1] || '';
    const args = linePrefix.match(/{{[<%] [^\s]+ (.*)/)?.[1] || '';
    return {shortcode, args};
  }

  private parseArgs(args: string): string[] {
    const result: string[] = [];
    while (true) {
      const match = args.match(/^\s*([^\s=]+)(=([^"\s]+|"[^"]*"))?\s*/);
      if (!match) {
        return result;
      }
      result.push(match[1]);
      args = args.slice(match[0].length);
    }
  }

  private async scanShortcode(uri: vscode.Uri): Promise<{name: string; doc: string; args: string[]}[]> {
    try {
      const stat = await vscode.workspace.fs.stat(uri);
      if (stat.type !== vscode.FileType.Directory) {
        return [];
      }
    } catch (_) {
      return [];
    }

    const entries = await vscode.workspace.fs.readDirectory(uri);

    const result: {name: string; doc: string; args: string[]}[] = [];

    for (const entry of entries) {
      const [fileName, fileType] = entry;

      if (fileType !== vscode.FileType.File || path.extname(fileName) !== '.html') {
        continue;
      }

      const baseName = path.basename(fileName, '.html');
      const fileUri = vscode.Uri.joinPath(uri, fileName);

      let content = '';
      try {
        const fileData = await vscode.workspace.fs.readFile(fileUri);
        content = Buffer.from(fileData).toString('utf8');
      } catch {
        continue;
      }

      const lines = content.split(/\r?\n/);

      // ------- @description -------
      let description = '';
      const descriptionLine = lines.find((l) => l.trim().startsWith('@description'));
      if (descriptionLine) {
        description = descriptionLine.replace('@description', '').trim();
      }

      // ------- @param lines -------
      const params: string[] = [];
      for (const l of lines) {
        const match = l.trim().match(/^@param\s+([A-Za-z0-9_\-]+)/);
        if (match) {
          params.push(match[1]);
        }
      }

      result.push({
        name: baseName,
        doc: description,
        args: params
      });
    }

    return result;
  }

  private async refreshShortcodes(): Promise<void> {
    const shortcodes = [];

    const workspace = (await getHugoWorkspaceFolder())!;
    const localShortcodeDir = workspace.uri.with({path: path.join(workspace.uri.path, 'layouts/shortcodes')});
    shortcodes.push(...(await this.scanShortcode(localShortcodeDir)));

    const themes = await vscode.workspace.fs.readDirectory(workspace.uri.with({path: path.join(workspace.uri.path, 'themes')}));
    for (const [themeDir] of themes) {
      const uri = vscode.Uri.parse(themeDir);
      shortcodes.push(...(await this.scanShortcode(uri.with({path: path.join(uri.path, 'layouts/shortcodes')}))));
    }

    this.shortcodes = Object.assign({}, EMBEDDED_SHORTCODES);
    for (const shortcode of shortcodes) {
      this.shortcodes[shortcode.name] = {doc: shortcode.doc, args: shortcode.args};
    }
  }

  private isAfterShortcode(linePrefix: string): boolean {
    return linePrefix.endsWith('>}} ') || linePrefix.endsWith('%}} ');
  }

  private getPreviousShortcodeName(linePrefix: string): string | null {
    const match = linePrefix.match(/{{[<%] (\w+)/);
    if (!match) {
      return null;
    }

    return match[1];
  }

  async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.CompletionItem[]> {
    const linePrefix = document.lineAt(position).text.substring(0, position.character);

    if (this.isAfterShortcode(linePrefix)) {
      const name = this.getPreviousShortcodeName(linePrefix);
      if (name && !name.startsWith('/')) {
        return [new vscode.CompletionItem(`{{< /${name} >}}`), new vscode.CompletionItem(`{{% /${name} %}}`)];
      }
    }

    if (!this.isInShortcode(linePrefix)) {
      return [];
    }

    if (this.isBeginningOfShortcode(linePrefix)) {
      await this.refreshShortcodes();

      return this.completeShortcodeName();
    }

    const {shortcode: name, args} = this.getCurrentShortcodeState(linePrefix);

    const shortcode = this.shortcodes[name];
    const existingArgs = this.parseArgs(args);

    if (shortcode.args) {
      if (shortcode.unnamedArgs) {
        if (existingArgs.length === shortcode.args.length) {
          return [
            new vscode.CompletionItem('>}}', vscode.CompletionItemKind.Operator),
            new vscode.CompletionItem('%}}', vscode.CompletionItemKind.Operator)
          ];
        }
        return [];
      }

      return shortcode.args
        .filter((arg) => !existingArgs.includes(arg))
        .map((arg) => {
          const item = new vscode.CompletionItem(arg, vscode.CompletionItemKind.Field);
          item.insertText = new vscode.SnippetString(`${arg}="$1"`);
          return item;
        });
    }

    const arbitraryArgCompletion = new vscode.CompletionItem('Attribute', vscode.CompletionItemKind.Field);
    arbitraryArgCompletion.insertText = new vscode.SnippetString('$1="$2"$0');

    return [arbitraryArgCompletion];
  }
}
