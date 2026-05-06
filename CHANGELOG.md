# Change Log

All notable changes to CodeClipper are documented here.

## [Unreleased]

## [0.0.6]

### Fixed
- `codeclipper.pathStyle: "relative"` (and `"full"`) now works correctly when copying a line reference — previously the path style setting was ignored and the basename was always used.

## [0.0.4]

### Added
- Keyboard shortcut `Ctrl+Alt+C` (Windows/Linux) and `Cmd+Alt+C` (macOS).
- No-selection support: command now copies the current line when nothing is selected.
- Multi-cursor support: all selections are merged and deduplicated into one reference.
- `codeclipper.format` setting with `words` (default) and `colon` values.
- `codeclipper.pathStyle` setting: `basename`, `relative`, or `full`.
- `codeclipper.showInContextMenu` setting to hide the context menu entry.
- `codeclipper.prompts` setting: configurable list of named prompt templates.
- **CodeClipper** submenu in the editor context menu containing all commands.
- **Select Prompt...** command: pick a prompt from a quick-pick list and copy it to the clipboard.
- **Settings...** command: opens the CodeClipper settings page directly.
- `{filename}` placeholder in prompts — resolves to file path and line numbers at copy time.
- Seven built-in prompts: Handoff, Explain Code, Code Review, Refactor, Write Tests, Bug Report, Run as prompt.
- Context menu is now visible even without a text selection.

### Changed
- Extracted pure formatting and range normalization logic into a testable helper.
- Feedback toast now shows the exact copied value: `Copied: example.ts lines 12-18`.
- Context menu entry moved to `z_commands` group (near bottom) to avoid dominating the menu.

### Fixed
- Reversed selections (cursor before anchor) are normalized correctly.

## [0.0.3]

- Removed private repository metadata from the Marketplace manifest.

## [0.0.2]

- Removed README boilerplate and tightened the extension landing page.

## [0.0.1]

- Initial release with editor context-menu copy support.
