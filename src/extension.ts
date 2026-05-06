import * as vscode from 'vscode';
import * as path from 'path';
import { formatReference, LineRange, Format } from './reference';

interface PromptItem {
    name: string;
    prompt: string;
    active?: boolean;
}

function applyPathStyle(fsPathOrDoc: string, uri: vscode.Uri | undefined, config: vscode.WorkspaceConfiguration): string {
    const pathStyle = config.get<string>('pathStyle') ?? 'basename';
    if (pathStyle === 'full') {return fsPathOrDoc;}
    if (pathStyle === 'relative') {return vscode.workspace.asRelativePath(uri ?? fsPathOrDoc);}
    return path.basename(fsPathOrDoc);
}

function resolveFilenameFromUri(uri: vscode.Uri, config: vscode.WorkspaceConfiguration): string {
    return applyPathStyle(uri.fsPath, uri, config);
}

function resolveFilename(editor: vscode.TextEditor | undefined, config: vscode.WorkspaceConfiguration): string {
    if (!editor) {return '{filename}';}

    const format = (config.get<string>('format') ?? 'words') as Format;
    const fileName = applyPathStyle(editor.document.fileName, editor.document.uri, config);

    const hasSelection = editor.selections.some(sel => !sel.isEmpty);
    if (!hasSelection) {return fileName;}

    const ranges: LineRange[] = editor.selections.map(sel => ({
        start: sel.start.line + 1,
        end: sel.end.line + 1,
    }));
    return formatReference(fileName, ranges, format);
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('copy-reference.copyLineRef', (uri?: vscode.Uri) => {
            const config = vscode.workspace.getConfiguration('codeclipper');
            const result = uri
                ? resolveFilenameFromUri(uri, config)
                : resolveFilename(vscode.window.activeTextEditor, config);
            vscode.env.clipboard.writeText(result);
            vscode.window.showInformationMessage(`Copied: ${result}`);
        }),

        vscode.commands.registerCommand('copy-reference.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', '@ext:kanine.codeclipper');
        }),

        vscode.commands.registerCommand('copy-reference.selectPrompt', async (uri?: vscode.Uri) => {
            const config = vscode.workspace.getConfiguration('codeclipper');
            const prompts = (config.get<PromptItem[]>('prompts') ?? []).filter(p => p.active !== false);

            if (prompts.length === 0) {
                vscode.window.showInformationMessage(
                    'No prompts configured. Add prompts via Settings → CodeClipper → Prompts.'
                );
                return;
            }

            const pick = await vscode.window.showQuickPick(
                prompts.map(p => ({ label: p.name, detail: p.prompt.slice(0, 80) + (p.prompt.length > 80 ? '…' : '') })),
                { placeHolder: 'Select a prompt to copy' }
            );
            if (!pick) {return;}

            const selected = prompts.find(p => p.name === pick.label);
            if (!selected) {return;}

            const filename = uri
                ? resolveFilenameFromUri(uri, config)
                : resolveFilename(vscode.window.activeTextEditor, config);
            const resolved = selected.prompt.replace(/\{filename\}/g, filename);

            await vscode.env.clipboard.writeText(resolved);
            vscode.window.showInformationMessage(`Copied: ${selected.name}`);
        })
    );
}

export function deactivate() {}
