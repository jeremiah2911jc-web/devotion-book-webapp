# Reader CSS Snapshot

Baseline commit:

```text
7abb1d89f71654240189c7752ab5a993a39b1b85
Fix EPUB reader pagination overflow
```

This snapshot records reader-related CSS responsibilities in the working column-based pagination version.

Most active reader CSS is injected at runtime by `injectReaderViewStyles()` in `app.js`. `styles.css` still contains older reader selectors that are retained in the codebase, but the paged reader shell replaces the original `#view-reader` markup at runtime.

## Legacy `styles.css` Reader Selectors

These selectors exist in `styles.css` around the library/reader section:

```css
.library-progress div,
.reader-progress div { height: 8px; border-radius: 999px; background: rgba(191,211,208,0.45); overflow: hidden; }

.library-progress i,
.reader-progress i { display: block; height: 100%; width: 0; border-radius: inherit; background: linear-gradient(135deg, var(--primary), #7cc6c2); }

.reader-view { margin: -28px; min-height: calc(100vh - 56px); background: #fbfaf6; }
.reader-view.reader-dark { background: #171b1d; color: #e7eceb; }
.reader-layout { display: grid; grid-template-columns: 260px 1fr; min-height: calc(100vh - 56px); }
.reader-sidebar { padding: 22px; border-right: 1px solid rgba(191,211,208,0.55); background: rgba(255,255,255,0.72); display: flex; flex-direction: column; gap: 16px; }
.reader-dark .reader-sidebar { background: rgba(27,32,34,0.9); border-color: rgba(255,255,255,0.1); }
.reader-page { width: min(100%, 880px); margin: 0 auto; padding: 42px 34px 80px; }
.reader-header { display: flex; justify-content: space-between; gap: 20px; align-items: start; margin-bottom: 28px; }
.reader-progress { min-width: 150px; display: grid; gap: 8px; color: var(--muted); text-align: right; }
.reader-content { font-family: "Noto Serif TC", "PMingLiU", serif; color: #243437; max-width: 720px; margin: 0 auto; }
.reader-dark .reader-content,
.reader-dark .reader-header h2 { color: #edf3f1; }
.reader-dark .muted,
.reader-dark .reader-progress { color: #aebcbd; }
.reader-content main { padding: 0; }
.reader-content h1 { font-size: 1.7em; color: inherit; margin: 0 0 1em; }
.reader-content p { margin: 0 0 1em; }
.reader-content .title-page { background: rgba(255,255,255,0.55); border-radius: 12px; padding: 1.4em; }
.reader-dark .reader-content .title-page { background: rgba(255,255,255,0.08); }
```

Mobile legacy rules:

```css
@media (max-width: 840px) {
  .reader-view { margin: -18px; }
  .reader-layout { grid-template-columns: 1fr; }
  .reader-sidebar { border-right: none; border-bottom: 1px solid rgba(191,211,208,0.55); }
  .reader-page { padding: 28px 20px 60px; }
  .reader-header { display: grid; }
}
```

## Runtime Overlay And Shell

Injected by `injectReaderViewStyles()`:

```css
body.reader-active { overflow: hidden !important; }
body.reader-active .app-shell { overflow: hidden; }
body.reader-active #view-reader.reader-view.active {
  position: fixed;
  inset: 0;
  z-index: 4000;
  display: block;
  width: 100vw;
  height: 100dvh;
  margin: 0;
  padding: 0;
}
body.reader-active #view-reader.reader-view.active ~ .view { display: none !important; }
body.reader-active .sidebar,
body.reader-active .topbar,
body.reader-active #view-title,
body.reader-active #view-subtitle { visibility: hidden; pointer-events: none; }
body.reader-active #view-reader.reader-view.active::before {
  content: "";
  position: absolute;
  inset: 0;
  background: #f8f5ef;
}
body.reader-active #view-reader.reader-view.active.reader-dark::before { background: #171717; }
#view-reader.reader-view { padding: 0; }
#view-reader .reader-app-shell {
  --reader-stage-top: 0px;
  --reader-stage-bottom: 0px;
  position: relative;
  min-height: 100dvh;
  height: 100dvh;
  overflow: hidden;
  background: #f8f5ef;
  color: #2f2a24;
}
#view-reader.reader-dark .reader-app-shell { background: #171717; color: #eee7dd; }
```

Responsibilities:

- Locks the body while reader is active.
- Makes reader a full-viewport fixed overlay.
- Hides the app shell chrome behind the reader.
- Defines `--reader-stage-top` and `--reader-stage-bottom`, which are updated by `updateReaderViewportInsets()`.

## Toolbar And Footer Controls

```css
#view-reader .reader-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 4;
  display: grid;
  grid-template-columns: auto minmax(180px, 1fr) minmax(160px, 260px) repeat(3, auto);
  align-items: center;
  gap: 12px;
  padding: 12px clamp(12px, 3vw, 28px);
  border-bottom: 1px solid rgba(80,70,55,.18);
  background: rgba(255,255,255,.72);
  backdrop-filter: blur(12px);
  transition: opacity .2s ease, transform .2s ease;
}
#view-reader.reader-dark .reader-toolbar { background: rgba(25,25,25,.78); border-color: rgba(255,255,255,.12); }
#view-reader.reader-controls-hidden .reader-toolbar { display: none; opacity: 0; transform: translateY(-100%); pointer-events: none; }
#view-reader .reader-book-heading h2 { margin: 0; font-size: 1rem; line-height: 1.2; }
#view-reader .reader-book-heading p { margin: 2px 0 0; }
#view-reader .reader-toolbar label { display: grid; gap: 3px; font-size: .78rem; color: inherit; }
#view-reader .reader-toolbar select,
#view-reader .reader-toolbar input { max-width: 100%; }
```

```css
#view-reader .reader-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 4;
  display: grid;
  grid-template-columns: auto minmax(180px, 520px) auto;
  align-items: center;
  gap: 14px;
  padding: 12px clamp(12px, 3vw, 28px);
  border-top: 1px solid rgba(80,70,55,.18);
  background: rgba(255,255,255,.7);
  transition: opacity .2s ease, transform .2s ease;
}
#view-reader.reader-dark .reader-footer { background: rgba(25,25,25,.78); border-color: rgba(255,255,255,.12); }
#view-reader.reader-controls-hidden .reader-footer { display: grid; opacity: .92; transform: none; pointer-events: auto; padding-block: 8px; }
#view-reader .reader-progress { display: grid; grid-template-columns: auto auto; gap: 6px 12px; align-items: center; font-size: .9rem; }
#view-reader .reader-progress div { grid-column: 1 / -1; height: 4px; border-radius: 999px; overflow: hidden; background: rgba(120,100,70,.22); }
#view-reader .reader-progress i { display: block; height: 100%; width: 0; background: #9b7a48; }
```

Responsibilities:

- Toolbar height contributes to `--reader-stage-top` only when controls are visible.
- Footer height always contributes to `--reader-stage-bottom`.
- The bottom bar should not overlap page content because the stage bottom inset is updated from footer height.

## Reader Stage And Viewport

```css
#view-reader .reader-stage {
  position: absolute;
  top: var(--reader-stage-top);
  right: 0;
  bottom: var(--reader-stage-bottom);
  left: 0;
  z-index: 1;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: clamp(10px, 2.5vw, 28px) clamp(12px, 4vw, 42px);
  overflow: hidden;
}
#view-reader .reader-page-viewport {
  flex: 0 1 min(1120px, 100%);
  width: min(1120px, 100%);
  height: 100%;
  overflow: hidden;
  contain: layout paint size;
  isolation: isolate;
  border-radius: 10px;
  background: #fffdf8;
  box-shadow: 0 18px 48px rgba(45,35,25,.14);
}
#view-reader.reader-dark .reader-page-viewport { background: #202020; box-shadow: 0 18px 48px rgba(0,0,0,.28); }
#view-reader .reader-page-clip {
  width: 100%;
  height: 100%;
  overflow: hidden;
  contain: layout paint size;
  clip-path: inset(0);
}
```

Responsibilities:

- Stage consumes all available overlay space except toolbar/footer insets.
- `reader-page-viewport` and `reader-page-clip` intentionally hide overflow.
- Pagination, not scrolling, must expose overflow content through continuation pages.

## Desktop Spread Rules

```css
#view-reader.reader-spread-mode .reader-page-clip {
  background: linear-gradient(90deg, transparent calc(50% - 18px), rgba(80,70,55,.08) 50%, transparent calc(50% + 18px));
}
#view-reader.reader-dark.reader-spread-mode .reader-page-clip {
  background: linear-gradient(90deg, transparent calc(50% - 18px), rgba(255,255,255,.08) 50%, transparent calc(50% + 18px));
}
#view-reader.reader-spread-mode .reader-flow {
  padding: 0;
  display: block;
  overflow: hidden;
  transition: none;
}
#view-reader .reader-spread {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--reader-spread-gap, 44px);
}
#view-reader .reader-page-surface {
  height: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  padding: var(--reader-page-padding-top, 64px) var(--reader-page-padding-x, 56px) var(--reader-page-padding-bottom, 54px);
  background: transparent;
}
#view-reader .reader-page-surface.is-empty { opacity: .35; }
```

Responsibilities:

- `.reader-spread` displays two page surfaces.
- `.reader-page-surface` has padding; the usable text area is smaller than the surface.
- `--reader-page-body-width` and `--reader-page-body-height` are calculated in JS from surface dimensions minus padding.

## Column Pagination Rules

These are the most important rules for the fixed overflow behavior.

```css
#view-reader .reader-flow {
  height: 100%;
  box-sizing: border-box;
  display: block;
  max-width: none;
  padding: clamp(48px, 8vh, 88px) clamp(36px, 7vw, 86px) clamp(40px, 7vh, 76px);
  overflow: visible;
  column-fill: auto;
  transition: transform .18s ease;
  will-change: transform;
  overflow-wrap: anywhere;
  word-break: break-word;
}
#view-reader .reader-column-page {
  width: 100%;
  height: var(--reader-page-body-height, 1px);
  overflow: hidden;
}
#view-reader .reader-column-flow {
  width: var(--reader-page-body-width, 1px);
  height: var(--reader-page-body-height, 1px);
  column-width: var(--reader-page-body-width, 1px);
  column-gap: 0;
  column-fill: auto;
  overflow: visible;
  transition: transform .18s ease;
  will-change: transform;
}
#view-reader .reader-column-flow > * {
  max-width: var(--reader-page-body-width, 100%);
}
```

Do not break these invariants:

- `reader-column-flow` width and column width must match `--reader-page-body-width`.
- `reader-column-page` height must match `--reader-page-body-height`.
- Continuation is shown by translating `.reader-column-flow` horizontally by `pageIndex * bodyWidth`.
- Do not replace this with `overflow: auto` for reader content.
- Do not add column gap unless JS also accounts for the gap in page count and transform offsets.

## Reader Content Rules

```css
#view-reader .reader-flow * { box-sizing: border-box; max-width: 100%; }
#view-reader .reader-flow img,
#view-reader .reader-flow svg,
#view-reader .reader-flow video,
#view-reader .reader-flow table { max-width: 100%; height: auto; }
#view-reader .reader-flow pre,
#view-reader .reader-flow code { white-space: pre-wrap; overflow-wrap: anywhere; }
#view-reader .reader-flow h1 { margin: 0; font-size: 1.72em; line-height: 1.34; letter-spacing: .01em; color: #21484c; }
#view-reader .reader-flow h2 { margin: 1.9em 0 .72em; font-size: 1.14em; line-height: 1.48; letter-spacing: .01em; color: #21484c; }
#view-reader .reader-flow p { margin: 0 0 1.12em; line-height: 1.9; }
#view-reader .reader-flow ul { margin: 0 0 1.38em; padding-left: 1.5em; }
#view-reader .reader-flow li { margin: .42em 0; line-height: 1.86; padding-left: .12em; }
```

These rules affect pagination because margins, line-height, and max-width affect measured `scrollWidth`.

## Reader Turn Zones

```css
#view-reader .reader-turn-zone {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 34%;
  border: 0;
  background: transparent;
  cursor: pointer;
}
#view-reader .reader-turn-zone:disabled,
#view-reader .reader-footer button:disabled { cursor: default; opacity: .35; }
#view-reader .reader-turn-left { left: 0; }
#view-reader .reader-turn-right { right: 0; }
```

Responsibilities:

- Large invisible page-turn targets.
- These should not alter page layout or viewport measurement.

## Mobile Rules

```css
@media (max-width: 1023px) {
  body.reader-active #view-reader.reader-view.active { inset: 0; }
  #view-reader .reader-toolbar { grid-template-columns: auto 1fr; }
  #view-reader .reader-toolbar label { grid-column: span 1; }
  #view-reader .reader-stage { padding: 0; }
  #view-reader .reader-page-viewport {
    flex-basis: 100vw;
    width: 100vw;
    height: 100%;
    min-height: 0;
    border-radius: 0;
    box-shadow: none;
  }
  #view-reader .reader-flow {
    padding: clamp(34px, 7vh, 58px) clamp(24px, 8vw, 40px) clamp(30px, 6vh, 50px);
  }
  #view-reader .reader-flow h1 { font-size: 1.54em; }
  #view-reader .reader-flow h2 { font-size: 1.08em; margin-top: 1.72em; }
  #view-reader .reader-flow p { margin-bottom: 1em; line-height: 1.82; }
  #view-reader .reader-flow hr { width: 46%; margin: 1.7em auto; }
  #view-reader .reader-footer { grid-template-columns: auto 1fr auto; }
  #view-reader .reader-book-heading h2 { font-size: .95rem; }
  #view-reader .reader-turn-zone { width: 28%; }
}
```

Mobile invariants:

- Reader viewport width is exactly `100vw`.
- Stage padding is zero to avoid horizontal overflow.
- Footer remains outside the measured stage because `--reader-stage-bottom` is set from the footer height.

## Layout Variables

These CSS variables are assigned in JS by `applyReaderPageMetrics()`:

- `--reader-stage-top`
- `--reader-stage-bottom`
- `--reader-spread-gap`
- `--reader-page-padding-top`
- `--reader-page-padding-x`
- `--reader-page-padding-bottom`
- `--reader-page-body-width`
- `--reader-page-body-height`

The column pagination fix depends most on:

- `--reader-page-body-width`
- `--reader-page-body-height`
- `--reader-spread-gap`

## Refactor Warnings

- Do not move `.reader-column-flow` into a container whose measured width differs from `--reader-page-body-width`.
- Do not let toolbar, footer, drawer, or sheet elements become children of `.reader-page-viewport` or `.reader-page-clip`.
- Do not use `overflow: auto` as a substitute for pagination.
- Do not animate `.reader-column-flow` with a second transform unless it composes with the existing page offset.
- If adding themes, avoid changing font metrics, padding, or column width without invalidating `readerPaginationSignature`.
- If moving runtime CSS to `styles.css`, preserve selector specificity against old legacy `.reader-content` rules.
