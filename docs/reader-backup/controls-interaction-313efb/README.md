# Reader Controls Interaction Backup

Backup date: 2026-04-29

Corresponding commit:

`313efb269104ad92d0a2bec40adf9bc6cdd0f4db`

## Purpose

This backup preserves the usable reader version where reader controls appear only after tapping or clicking the page, panels no longer overlap the main close control, and font size / line height are fixed six-step controls.

It is a reference snapshot for comparing or restoring behavior if later reading progress or bookmark work regresses the reader UI.

## Included Behavior

- Desktop and mobile initially hide the main close button and action button.
- Tapping or clicking the reading page shows the close button and action button.
- Opening a reader panel hides the main close button and action button.
- The bottom-right action button position is refined.
- Font size uses six levels: `16`, `17`, `18`, `20`, `22`, `24`.
- Line height uses six levels: `1.55`, `1.65`, `1.75`, `1.85`, `1.95`, `2.05`.
- Background theme keeps the existing reader settings logic.
- Column-based pagination remains stable.

## Note

This is a documentation snapshot, not executable application code.

If later reader UI changes break controls, settings, or panel behavior, compare against this snapshot or return to commit `313efb269104ad92d0a2bec40adf9bc6cdd0f4db`.
