import * as vscode from 'vscode';
import * as path from 'path';
import { formatReference, LineRange, Format } from './reference';

interface PromptItem {
    name: string;
    prompt: string;
    active?: boolean;
}

function resolveFilename(editor: vscode.TextEditor | undefined, config: vscode.WorkspaceConfiguration): string {
    if (!editor) {return '{filename}';}

    const pathStyle = config.get<string>('pathStyle') ?? 'basename';
    const format = (config.get<string>('format') ?? 'words') as Format;

    let fileName: string;
    if (pathStyle === 'full') {
        fileName = editor.document.fileName;
    } else if (pathStyle === 'relative') {
        fileName = vscode.workspace.asRelativePath(editor.document.fileName);
    } else {
        fileName = path.basename(editor.document.fileName);
    }

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
        vscode.commands.registerCommand('copy-reference.copyLineRef', () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {return;}

            const fileName = path.basename(editor.document.fileName);
            const config = vscode.workspace.getConfiguration('codeclipper');
            const format = (config.get<string>('format') ?? 'words') as Format;

            const ranges: LineRange[] = editor.selections.map(sel => ({
                start: sel.start.line + 1,
                end: sel.end.line + 1,
            }));

            const result = formatReference(fileName, ranges, format);
            vscode.env.clipboard.writeText(result);
            vscode.window.showInformationMessage(`Copied: ${result}`);
        }),

        vscode.commands.registerCommand('copy-reference.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', '@ext:kanine.codeclipper');
        }),

        vscode.commands.registerCommand('copy-reference.selectPrompt', async () => {
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

            const editor = vscode.window.activeTextEditor;
            const resolved = selected.prompt.replace(/\{filename\}/g, resolveFilename(editor, config));

            await vscode.env.clipboard.writeText(resolved);
            vscode.window.showInformationMessage(`Copied: ${selected.name}`);
        })
    );
}

export function deactivate() {}
