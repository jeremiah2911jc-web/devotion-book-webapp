# Reader Progress And Bookmarks Backup

Backup date: 2026-04-29

Corresponding commit:

`3580f7d5d1e05fd2209e2d7477288641bc000336`

## Purpose

This snapshot preserves the working reader implementation after reading progress memory, local manual bookmarks, and clearer "reading position vs. bookmarks" panel copy were added.

It is intended as a reference point before adding reader search functionality. If the search work causes regressions, compare against this snapshot or return to the corresponding Git commit.

## Included In This Version

- localStorage reading progress memory
- `devotion-reader-progress-v1`
- localStorage manual bookmarks
- `devotion-reader-bookmarks-v1`
- clarified reading position and bookmarks panel copy
- distinct "currently reading position" and "manual bookmarks" panel sections
- mobile TOC panel can scroll to the end
- stable column-based pagination core

## Notes

This is a documentation snapshot, not runtime source. The canonical recoverable version is the Git commit listed above.

Do not edit this backup as part of reader search work. Future reader changes should be made in `app.js` or other live application files.
