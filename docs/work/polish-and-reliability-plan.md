# CodeClipper Polish and Reliability Plan

## Goal

Make CodeClipper feel finished, predictable, and easy to maintain. The extension is already published and the Marketplace path works, so this plan focuses on command behavior, tests, documentation, and release hygiene.

## Current Baseline

- Extension: `CodeClipper`
- Marketplace id: `kanine.codeclipper`
- Command id: `copy-reference.copyLineRef`
- Current output: `filename line X` or `filename lines X-Y`
- Current trigger: editor context menu when text is selected
- Current implementation: command logic is inline in `src/extension.ts`
- Current tests: scaffold sample test only

## Product Decisions

Use these decisions unless a future issue or user need changes them.

- Default keybinding: add `ctrl+alt+c` on Windows/Linux and `cmd+alt+c` on macOS.
- Context requirement: keep the shortcut and context menu limited to `editorTextFocus`.
- No selection behavior: copy the current line. This makes the command useful from the keyboard and avoids a dead end.
- Partial-line selection behavior: output line numbers only. CodeClipper is a reference copier, not a text range copier.
- Multi-cursor behavior: merge all selected line ranges into one copied reference, preserving editor selection order and deduplicating overlapping lines.
- Default output format: keep the current human-readable format.
- Configurable output format: add a setting after the basic behavior is tested.

## Phase 1: Command Behavior

1. Extract pure formatting logic from `src/extension.ts`.
   - Add a helper that receives a file name and one or more line ranges.
   - Return the copied string without touching VS Code APIs.
   - Keep the extension command thin: read editor state, call helper, write clipboard, show feedback.

2. Add no-selection support.
   - Treat an empty selection as the active line.
   - Keep context menu visibility tied to selection if desired, but allow the command and keybinding to work without one.

3. Normalize selected ranges.
   - Convert VS Code zero-based lines to one-based line numbers.
   - Treat reversed selections safely.
   - Merge overlapping or adjacent line ranges.
   - Avoid producing duplicate references for multi-cursor selections on the same line.

4. Improve feedback.
   - Keep the information toast for now.
   - Include the exact copied value: `Copied: example.ts lines 12-18`.
   - Consider switching to `window.setStatusBarMessage` later if the toast feels too noisy.

## Phase 2: Keybinding and Configuration

1. Add contributed keybindings in `package.json`.
   - Windows/Linux: `ctrl+alt+c`
   - macOS: `cmd+alt+c`
   - `when`: `editorTextFocus`

2. Add a format setting.
   - Suggested setting: `codeclipper.format`
   - Suggested values:
     - `words`: `example.ts line 22`, `example.ts lines 22-23`
     - `colon`: `example.ts:22`, `example.ts:22-23`
   - Default: `words`

3. Keep configuration validation simple.
   - Use VS Code configuration schema enum values.
   - Fall back to `words` if an unexpected value is read.

## Phase 3: Tests

1. Replace the scaffold sample test.
   - Remove the placeholder array assertions.
   - Test pure formatting and range normalization without needing a full VS Code window.

2. Cover expected selection cases.
   - Single-line selection: `example.ts line 22`
   - Multi-line selection: `example.ts lines 22-23`
   - Empty selection/current line: `example.ts line 22`
   - Partial-line selection on one line: `example.ts line 22`
   - Multi-cursor separate lines: stable merged output
   - Multi-cursor overlapping ranges: no duplicate ranges

3. Add command-level coverage only if needed.
   - Prefer pure tests first because they are faster and less brittle.
   - Add VS Code integration tests if clipboard behavior or contributed command wiring becomes risky.

## Phase 4: Documentation Polish

1. Update `README.md`.
   - State what the extension does in one sentence.
   - Show context menu usage.
   - Show keyboard shortcut usage.
   - Include output examples for default and configured formats.
   - Keep requirements short.

2. Update `CHANGELOG.md`.
   - Add an `Unreleased` section with behavior changes.
   - Keep version entries in descending order.
   - Remove scaffold wording.

3. Decide whether to keep or replace `TEST.md`.
   - If kept, update it to include the keybinding and no-selection behavior.
   - If replaced, move testing instructions into `README.md` or a docs file.

## Phase 5: Packaging and Release Hygiene

1. Confirm `package.json` `files` includes runtime files only.
   - Keep `out/extension.js`
   - Keep `out/extension.js.map`
   - Keep `media/icon.png`
   - Keep `README.md`, `CHANGELOG.md`, `LICENSE`, and `package.json`
   - Do not ship tests, scripts, or generator helpers.

2. Add a release checklist.
   - Run `npm run lint`
   - Run `npm test`
   - Run `npm run compile`
   - Bump version
   - Update `CHANGELOG.md`
   - Run `npm run package:local`
   - Install and smoke test the VSIX
   - Publish

3. Keep `START_HERE.md` as a session handoff note.
   - Treat this file as the working implementation plan.
   - Update this plan when scope decisions change.

## Suggested Implementation Order

1. Extract and test formatting helpers.
2. Implement no-selection and multi-cursor handling.
3. Add keybindings.
4. Add format configuration.
5. Polish README, changelog, and manual test notes.
6. Run lint, compile, and tests.
7. Package and smoke test the VSIX.

## Acceptance Criteria

- The command works with a selection, multiple selections, and no selection.
- The keybinding works in an editor without requiring selected text.
- The copied value is deterministic and covered by tests.
- The README describes the real product behavior.
- The package contents stay limited to runtime and Marketplace files.
- The release checklist is clear enough to follow without reconstructing steps from memory.
