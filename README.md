# CodeClipper

**Copy file and line references to the clipboard. Build and fire reusable AI prompts — straight from the editor.**

CodeClipper is a lightweight VS Code extension for developers who work with AI assistants. It eliminates the friction of manually typing file names and line numbers into chat windows, and lets you maintain a personal library of prompts that resolve context automatically.

Works with any AI tool: Claude, ChatGPT, GitHub Copilot Chat, Cursor, or any chat interface you paste into.

---

## Features

### Copy File and Line Reference

Copy the current file name and line number(s) to the clipboard in one keystroke — ready to paste into an AI chat, a GitHub comment, a Slack message, or a bug report.

- **Single line** — copies the current cursor line
- **Selection** — copies the selected line range
- **Multi-cursor** — merges and deduplicates all selections into one reference

**Output examples**

```
utils.ts line 42
utils.ts lines 42-58
utils.ts lines 5-8, 20-25
```

With `codeclipper.format` set to `colon`:

```
utils.ts:42
utils.ts:42-58
utils.ts:5-8, 20-25
```

---

### Select Prompt

Open a searchable quick-pick list of named prompts. Select one and the full prompt text is copied to your clipboard — with `{filename}` automatically resolved to the active file and current selection.

Prompts are defined in your `settings.json` so they stay consistent across projects and sessions.

**`{filename}` resolution**

| Editor state | Resolved value |
|---|---|
| No selection | `utils.ts` |
| Cursor on line 42 | `utils.ts line 42` |
| Selection across lines 42–58 | `utils.ts lines 42-58` |

**Built-in prompts**

| Name | Description |
|---|---|
| Handoff | Generates a session handoff document for the current project |
| Explain Code | Asks the AI to explain the selected file or range |
| Code Review | Requests a code review with feedback |
| Refactor | Asks for a refactored version with reasoning |
| Write Tests | Generates tests covering happy path, edge cases, and failure modes |
| Bug Report | Formats a structured bug report from the current context |
| Run as prompt | Treats the file content itself as a prompt |

---

## Usage

All commands are available via:

- **Right-click → CodeClipper** submenu
- **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`)
- **Keyboard shortcuts**

| Command | Shortcut |
|---|---|
| Copy File and Line Reference | `Ctrl+Alt+C` / `Cmd+Alt+C` |
| Select Prompt... | — |
| Settings... | — |

---

## Settings

| Setting | Values | Default | Description |
|---|---|---|---|
| `codeclipper.format` | `words`, `colon` | `words` | Line number format: `line 42` vs `42` |
| `codeclipper.pathStyle` | `basename`, `relative`, `full` | `basename` | Path style used in `{filename}` resolution |
| `codeclipper.showInContextMenu` | `true`, `false` | `true` | Show or hide the right-click submenu |
| `codeclipper.prompts` | array | see below | Custom prompt library |

### Configuring prompts

Add or override prompts in `settings.json`. Each entry requires a `name` and a `prompt`. Set `active: false` to hide a prompt without removing it.

```json
"codeclipper.prompts": [
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

> **Note:** Once `codeclipper.prompts` is set in your `settings.json`, extension updates will not override it. Reset the setting to default to pick up new built-in prompts.

### Hiding the context menu entry

```json
"codeclipper.showInContextMenu": false
```

All commands remain accessible via the command palette and keyboard shortcuts.

---

## Requirements

VS Code `^1.118.0`

---

## Why CodeClipper

Referencing code in AI chats typically means switching windows, reading the file name, noting the line numbers, typing them out, then switching back. For a task you do dozens of times a day, the overhead adds up.

CodeClipper handles the reference in one keystroke and keeps a ready-made prompt library one key-press away — so you stay in the editor and in flow.