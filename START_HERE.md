# Start Here

This extension is published and working. The next session should focus on polish, reliability, and making the UX feel finished.

## Current State

- Extension name: `CodeClipper`
- Published Marketplace id: `kanine.codeclipper`
- Current command id: `copy-reference.copyLineRef`
- Local packaging and Marketplace publishing both work
- The extension currently copies `filename line X` or `filename lines X-Y`

## Recommended Polish

1. Add a default keybinding
- Bind `copy-reference.copyLineRef` to a sensible shortcut.
- Example: `ctrl+alt+c` on Windows/Linux, `cmd+alt+c` on macOS.
- Keep the `when` clause limited to `editorTextFocus && editorHasSelection`.

2. Improve selection handling
- If there is no selection, either:
  - copy the current line automatically, or
  - show a clear warning and do nothing.
- If the selection spans only part of a line, decide whether the output should still use the full line number range or only the line numbers.

3. Make line formatting configurable
- Add a setting for output format.
- Examples:
  - `filename line 22`
  - `filename lines 22-23`
  - `filename:22-23`
- This would make the extension more useful for different workflows and chat tools.

4. Handle multi-cursor cases
- Decide whether the command should:
  - use the primary selection only
  - merge all selections into one output
  - refuse multi-selection and prompt the user

5. Add tests
- Add unit tests for:
  - single-line selection
  - multi-line selection
  - no selection
  - selection that starts and ends on the same line
- This will prevent regressions if the formatting logic changes later.

6. Polish the README
- Replace the scaffold content with a short, finished product page.
- Include:
  - what the extension does
  - how to install
  - how to use the command
  - the hotkey if one is added
  - one small screenshot or icon preview

7. Tighten the user feedback
- The current toast message is fine, but it could be more specific:
  - include the exact copied text
  - mention when nothing was selected
- Consider using `window.setStatusBarMessage` for a subtle confirmation.

8. Check packaging hygiene
- Keep the VSIX limited to runtime files only.
- Avoid shipping test artifacts, scripts, or generator helpers unless they are needed at runtime.

9. Add a tiny release workflow
- Add a simple release checklist:
  - bump version
  - update changelog
  - package VSIX
  - publish
- This will make future releases faster and less error-prone.

## Suggested Next Session Order

1. Add the default keybinding.
2. Decide the no-selection behavior.
3. Add tests for line formatting.
4. Clean up the README and release notes.
5. If needed, refine the icon again after the UX is locked.

## Notes

- The Marketplace release path is already working.
- The current priority is not publication mechanics.
- The priority is making the extension feel intentional, consistent, and hard to break.
