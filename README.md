# CodeClipper

Copy a filename and line numbers to the clipboard, or paste a ready-made prompt — from the context menu, keyboard shortcut, or command palette.

## Commands

Both commands are available via right-click **CodeClipper** submenu, the command palette (`Shift+Ctrl+P`), and keyboard shortcuts.

| Command | Palette name | Shortcut |
|---|---|---|
| Copy file and line reference | `CodeClipper: Copy File and Line Reference` | `Ctrl+Alt+C` / `Cmd+Alt+C` |
| Pick and copy a prompt | `CodeClipper: Select Prompt...` | — |
| Open extension settings | `CodeClipper: Settings...` | — |

## Copy File and Line Reference

Copies the current filename and line numbers to the clipboard.

- **With a selection:** copies the selected line range.
- **Without a selection:** copies the current line.
- **Multi-cursor:** all selections are merged and deduplicated into one reference.

**Output examples**

```
example.ts line 22
example.ts lines 22-23
example.ts lines 5-8, 20-25
```

With `codeclipper.format` set to `colon`:

```
example.ts:22
example.ts:22-23
example.ts:5-8, 20-25
```

## Select Prompt

Opens a quick-pick list of named prompts. Selecting one copies the full prompt text to the clipboard, ready to paste into an AI chat or any other tool.

Prompts support a `{filename}` placeholder that is resolved at copy time using the active editor and current selection.

**`{filename}` resolution**

| State | Example output |
|---|---|
| No selection | `example.ts` |
| Text selected on line 22 | `example.ts line 22` |
| Text selected on lines 22–25 | `example.ts lines 22-25` |

The path style and line number format follow the `codeclipper.pathStyle` and `codeclipper.format` settings.

**Default prompts**

| Name | Uses `{filename}` |
|---|---|
| Handoff | No — generates a session handoff document |
| Explain Code | Yes |
| Code Review | Yes |
| Refactor | Yes |
| Write Tests | Yes |
| Bug Report | Yes |
| Run as prompt | Yes |

## Settings

Open via **CodeClipper → Settings...** in the context menu, or search `codeclipper` in VS Code Settings.

| Setting | Values | Default | Description |
|---|---|---|---|
| `codeclipper.format` | `words`, `colon` | `words` | Line number format for copied references and `{filename}` |
| `codeclipper.pathStyle` | `basename`, `relative`, `full` | `basename` | Path style used when `{filename}` is resolved in prompts |
| `codeclipper.showInContextMenu` | `true`, `false` | `true` | Show the CodeClipper submenu in the right-click menu |
| `codeclipper.prompts` | array | see below | List of named prompts available in Select Prompt |

### Configuring prompts

Add or override prompts in `settings.json`. Each entry requires a `name` and a `prompt`. The `active` field defaults to `true`; set it to `false` to hide a prompt without deleting it.

```json
"codeclipper.prompts": [
  {
    "name": "Handoff",
    "prompt": "Review the current state of this project and generate a HANDOFF.md ...",
    "active": true
  },
  {
    "name": "Write Tests",
    "prompt": "Write tests for {filename}. Cover the happy path, edge cases, and expected failure modes.",
    "active": true
  },
  {
    "name": "My Custom Prompt",
    "prompt": "Do something useful with {filename}.",
    "active": true
  }
]
```

> **Note:** once `codeclipper.prompts` is saved to your `settings.json`, extension updates will not change it. Reset the setting to default to pick up new built-in prompts.

### Hiding the context menu entry

Set `codeclipper.showInContextMenu` to `false` to remove CodeClipper from the right-click menu entirely. All commands remain accessible via the command palette and keyboard shortcuts.

```json
"codeclipper.showInContextMenu": false
```

## Requirements

VS Code `^1.118.0`
