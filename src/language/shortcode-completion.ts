import * as vscode from 'vscode';

type Shortcode = {
    args?: string[]|null;
    unnamedArgs?: boolean;
};

const EMBEDDED_SHORTCODES: Readonly<Record<string, Shortcode>> = {
    'figure': {
        args: ['src', 'link', 'target', 'rel', 'alt', 'title', 'caption', 'class', 'height', 'width', 'loading', 'attr', 'attrlink'],
    },
    'gist': {
        args: ['user', 'id', 'file'],
        unnamedArgs: true,
    },
    'highlight': {
        args: ['lang', 'options'],
        unnamedArgs: true,
    },
    'instagram': {
        args: ['id'],
    },
    'param': {
        args: ['name'],
        unnamedArgs: true,
    },
    'ref': {
        args: ['pageRef'],
        unnamedArgs: true,
    },
    'relref': {
        args: ['pageRef'],
        unnamedArgs: true,
    },
    'twitter': {
        args: ['user', 'id'],
    },
    'tweet': {
        args: ['user', 'id'],
    },
    'vimeo': {
        args: ['id'],
        unnamedArgs: true,
    },
    'youtube': {
        args: ['id', 'allowFullScreen', 'autoplay', 'class', 'controls', 'end', 'loading', 'loop', 'mute', 'start', 'title'],
    },
};

type ShortcodeState = {
    shortcode: string;
    args: string;
};

export class ShortcodeCompletionProvider implements vscode.CompletionItemProvider {
    private shortcodes: Record<string, Shortcode> = EMBEDDED_SHORTCODES;

    private completeShortcodeName(): vscode.CompletionItem[] {
        return Object.keys(this.shortcodes).map((shortcode) => {
            const item = new vscode.CompletionItem(shortcode, vscode.CompletionItemKind.Function);
            item.insertText = new vscode.SnippetString(`${shortcode} $1`);
            return item;
        });
    }

    private isBeginningOfShortcode(linePrefix: string): boolean {
        return linePrefix.endsWith('{{< ');
    }

    private isInShortcode(linePrefix: string): boolean {
        return linePrefix.includes('{{< ') && !linePrefix.includes('}}');
    }

    private getCurrentShortcodeState(linePrefix: string): ShortcodeState {
        const shortcode = linePrefix.match(/{{< ([^\s]+)/)?.[1] || '';
        const args = linePrefix.match(/{{< [^\s]+ (.*)/)?.[1] || '';
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

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] {
        const linePrefix = document.lineAt(position).text.substring(0, position.character);

        if (!this.isInShortcode(linePrefix)) {
            return [];
        }

        if (this.isBeginningOfShortcode(linePrefix)) {
            return this.completeShortcodeName();
        }

        const {shortcode: name, args} = this.getCurrentShortcodeState(linePrefix);

        const shortcode = this.shortcodes[name];
        const existingArgs = this.parseArgs(args);

        console.log(existingArgs);

        if (shortcode.args) {
            if (shortcode.unnamedArgs) {
                if (existingArgs.length === shortcode.args.length) {
                    return [
                        new vscode.CompletionItem('>}}', vscode.CompletionItemKind.Operator),
                    ];
                }
                return [];
            }

            return shortcode.args.filter((arg) => !existingArgs.includes(arg)).map((arg) => {
                const item = new vscode.CompletionItem(arg, vscode.CompletionItemKind.Field);
                item.insertText = new vscode.SnippetString(`${arg}="$1"`);
                return item;
            });
        }

        const arbitraryArgCompletion = new vscode.CompletionItem('Attribute', vscode.CompletionItemKind.Field);
        arbitraryArgCompletion.insertText = new vscode.SnippetString('$1="$2"$0');

        return [
            arbitraryArgCompletion,
        ];
    }

}
