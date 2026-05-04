# CodeClipper

Copy a file name and selected line numbers from the editor context menu.

## Features

- Right-click a selection in the editor.
- Choose `Copy File and Line Reference`.
- Paste a result like `example.ts lines 12-18`.

## Usage

1. Open a file in VS Code.
2. Select one or more lines.
3. Right-click and run `Copy File and Line Reference`.
4. Paste the copied reference wherever you need it.

## Local Deployment

Build and install the extension as a local `.vsix` with:

```bash
npm run deploy:local
```

If you want to split the steps:

```bash
npm run compile
npm run package:local
npm run install:local
```

The packaged file is written to `codeclipper.vsix` in the repository root.

## Requirements

- VS Code `^1.118.0`

## Release Notes

### 0.0.1

- Initial release with editor context-menu copy support.
