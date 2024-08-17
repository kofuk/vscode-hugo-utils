import * as vscode from 'vscode';

const getISODateTimeWithTZ = () => {
    const date = new Date();
    const tzOffset = date.getTimezoneOffset();
    if (tzOffset === 0) {
        return date.toISOString();
    }

    // Offset the date by the timezone offset
    // XXX: Is it correct with the daylight saving time?
    date.setMinutes(date.getMinutes() - tzOffset);

    const withoutTZ = date.toISOString().replace(/\.\d+Z$/, '');
    const tzOffsetHH = Math.abs(Math.floor(tzOffset / 60)).toString().padStart(2, '0');
    const tzOffsetMM = (tzOffset % 60).toString().padStart(2, '0');
    const tzOffsetSign = tzOffset > 0 ? '-' : '+';
    const isoDateTimeWithTZAndOffset = `${withoutTZ}${tzOffsetSign}${tzOffsetHH}:${tzOffsetMM}`;

    return isoDateTimeWithTZAndOffset;
};

const updateLastmod = async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    editor.edit((editBuilder: vscode.TextEditorEdit) => {
        const document = editor.document;
        if (document.lineCount === 0) {
            return;
        }

        // Local timezone ISO string. Do not hard-code the timezone.
        const lastmod = getISODateTimeWithTZ();

        const frontmatterDelimiter = document.lineAt(0).text;
        if (frontmatterDelimiter !== '---') {
            // Invalid frontmatter delimiter
            return;
        }

        // Only check the first 10 lines
        let lastmodLine = null;
        let dateLine = null;
        for (let i = 1; i < 10 && i < document.lineCount; i++) {
            const line = document.lineAt(i);
            if (line.text.match(/^date: (.*)$/)) {
                dateLine = line;
            }
            if (line.text.match(/^lastmod: (.*)$/)) {
                lastmodLine = line;
                break;
            }
            if (line.text === frontmatterDelimiter) {
                break;
            }
        }

        if (lastmodLine) {
            // If there is a `lastmod` line, replace it.
            editBuilder.replace(lastmodLine.range, `lastmod: ${lastmod}`);
        } else if (dateLine) {
            // If there is no `lastmod` line, insert it after the `date` line.
            editBuilder.insert(dateLine.range.end, `\nlastmod: ${lastmod}`);
        } else {
            // If there is no `date` line, insert it after the frontmatter delimiter.
            editBuilder.insert(document.lineAt(0).range.end, `\nlastmod: ${lastmod}`);
        }
    });
};

export default updateLastmod;
