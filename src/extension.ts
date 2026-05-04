import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('copy-reference.copyLineRef', () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            const fileName = path.basename(editor.document.fileName);
            const selection = editor.selection;

            const startLine = selection.start.line + 1;
            const endLine = selection.end.line + 1;

            const lineRef = startLine === endLine ? `line ${startLine}` : `lines ${startLine}-${endLine}`;
            const finalString = `${fileName} ${lineRef}`;

            vscode.env.clipboard.writeText(finalString);
            vscode.window.showInformationMessage(`Copied: ${finalString}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
