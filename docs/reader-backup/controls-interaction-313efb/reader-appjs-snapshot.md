# Reader app.js Snapshot: Controls Interaction 313efb

Corresponding commit: `313efb269104ad92d0a2bec40adf9bc6cdd0f4db`

This snapshot records the reader controls, panels, and settings structure after the controls interaction refinement.

## Reader State

```js
readerBook: null,
readerChapters: [],
readerChapterIndex: 0,
readerPageIndex: 0,
readerPageCount: 1,
readerChapterPageCounts: [],
readerChapterPages: [],
readerPaginationSignature: '',
readerActivePanel: null,
readerControlsVisible: false,
readerControlsTimer: null,
readerSettings: loadJson('devotion-app-reader-settings', { fontSize: 18, lineHeight: 1.8, theme: 'light' }),
```

`resetReaderPaginationCache()` resets reader pagination, active panel, visible controls, and control timer:

```js
cloudLibrary.readerChapterPages = [];
cloudLibrary.readerPaginationSignature = '';
cloudLibrary.readerActivePanel = null;
cloudLibrary.readerControlsVisible = false;
clearTimeout(cloudLibrary.readerControlsTimer);
cloudLibrary.readerControlsTimer = null;
```

## Reader Shell Controls

The hidden toolbar remains in the DOM for legacy event wiring, but it is not visible in the reading surface:

```js
<button id="reader-close-button" class="reader-close-button" type="button" data-reader-close aria-label="關閉閱讀器">關閉</button>
<div class="reader-hidden-controls" aria-hidden="true">
  <button id="reader-back-library" class="ghost-btn" type="button">返回書櫃</button>
  <div class="reader-book-heading">
    <h2 id="reader-title">閱讀模式</h2>
    <p id="reader-meta" class="muted"></p>
  </div>
  <label>章節<select id="reader-chapter-nav"></select></label>
  <label>字體<input id="reader-font-size" type="range" min="15" max="28" step="1" /></label>
  <label>行距<input id="reader-line-height" type="range" min="1.4" max="2.4" step="0.1" /></label>
  <label>背景<select id="reader-theme"><option value="light">淺色</option><option value="dark">深色</option></select></label>
</div>
```

The action button is outside the footer and opens the reader menu:

```js
<button class="reader-action-button" type="button" data-reader-toggle-panel="menu" aria-label="閱讀功能">功能</button>
<div id="reader-panel-root" class="reader-panel-root" aria-live="polite"></div>
```

## Controls Visibility CSS

```css
#view-reader .reader-hidden-controls { display: none !important; }
#view-reader .reader-close-button { position: absolute; top: 14px; right: clamp(12px, 3vw, 28px); z-index: 8; transition: opacity .18s ease, transform .18s ease; }
#view-reader .reader-action-button { position: absolute; right: clamp(16px, 3vw, 36px); bottom: calc(var(--reader-stage-bottom) + clamp(18px, 3vh, 28px)); z-index: 6; transition: opacity .18s ease, transform .18s ease; }
#view-reader.reader-controls-hidden .reader-close-button,
#view-reader.reader-controls-hidden .reader-action-button,
#view-reader.reader-panel-open .reader-close-button,
#view-reader.reader-panel-open .reader-action-button { opacity: 0; pointer-events: none; transform: translateY(8px); }
```

Mobile overrides keep the action and close buttons inside the viewport:

```css
#view-reader .reader-action-button { right: 14px; bottom: calc(var(--reader-stage-bottom) + 14px); min-height: 42px; padding-inline: 14px; }
#view-reader .reader-close-button { top: 10px; right: 10px; min-height: 34px; padding-inline: 12px; font-size: .82rem; }
```

## Panel State and Rendering

```js
const READER_PANEL_TYPES = new Set(['menu', 'toc', 'search', 'settings', 'bookmarks']);

function openReaderPanel(panel) {
  if (!isReaderPanel(panel)) return;
  cloudLibrary.readerActivePanel = panel;
  renderReaderPanels();
}

function closeReaderPanel() {
  cloudLibrary.readerActivePanel = null;
  renderReaderPanels();
}

function toggleReaderPanel(panel) {
  if (cloudLibrary.readerActivePanel === panel) closeReaderPanel();
  else openReaderPanel(panel);
}
```

`renderReaderPanels()` toggles `reader-panel-open` to hide the main close/action buttons while a panel is active:

```js
const panel = cloudLibrary.readerActivePanel;
view.classList.toggle('reader-panel-open', Boolean(panel));
if (panel) view.dataset.readerPanel = panel;
else delete view.dataset.readerPanel;
```

The panel body renders one of:

- Menu panel
- TOC panel
- Search panel
- Settings panel
- Bookmarks panel skeleton

## Settings Controls

```js
const READER_FONT_SIZE_LEVELS = [16, 17, 18, 20, 22, 24];
const READER_LINE_HEIGHT_LEVELS = [1.55, 1.65, 1.75, 1.85, 1.95, 2.05];
```

Six-step setting buttons are rendered by:

```js
function getClosestReaderSettingLevel(value, levels) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return levels[0];
  return levels.reduce((closest, level) => Math.abs(level - numeric) < Math.abs(closest - numeric) ? level : closest, levels[0]);
}

function renderReaderSettingLevelButtons(key, levels, currentValue) {
  const activeValue = getClosestReaderSettingLevel(currentValue, levels);
  return `
    <div class="reader-setting-levels" role="group" aria-label="${key === 'fontSize' ? '字體大小' : '行距'}">
      ${levels.map((level, index) => {
        const active = level === activeValue;
        return `<button class="reader-setting-level-button${active ? ' active' : ''}" type="button" data-reader-setting-option="${key}" data-reader-setting-value="${level}" aria-pressed="${active ? 'true' : 'false'}">${key === 'fontSize' ? level : level.toFixed(2)}</button>`;
      }).join('')}
    </div>
  `;
}
```

`renderReaderSettingsPanel()` uses the fixed controls for font size and line height and keeps the background select:

```js
<label>字體大小
  ${renderReaderSettingLevelButtons('fontSize', READER_FONT_SIZE_LEVELS, settings.fontSize)}
</label>
<label>行距
  ${renderReaderSettingLevelButtons('lineHeight', READER_LINE_HEIGHT_LEVELS, settings.lineHeight)}
</label>
<label>背景主題
  <select data-reader-setting="theme">
    <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>淺色</option>
    <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>深色</option>
  </select>
</label>
```

`updateReaderSetting()` keeps the existing local settings key and refresh flow:

```js
function updateReaderSetting(key, value) {
  cloudLibrary.readerSettings = { fontSize: 18, lineHeight: 1.8, theme: 'light', ...cloudLibrary.readerSettings, [key]: value };
  saveJson(cloudLibrary.readerSettingsKey, cloudLibrary.readerSettings);
  renderReaderSettings();
  renderReaderPanels();
  showReaderControls();
}
```

## Controls Show / Hide

```js
function showReaderControls() {
  const view = document.getElementById('view-reader');
  if (!view) return;
  cloudLibrary.readerControlsVisible = true;
  view.classList.remove('reader-controls-hidden');
  applyReaderPageMetrics();
  applyReaderPagePosition();
  clearTimeout(cloudLibrary.readerControlsTimer);
  cloudLibrary.readerControlsTimer = setTimeout(() => hideReaderControls(), 3200);
}

function hideReaderControls() {
  const view = document.getElementById('view-reader');
  if (!view) return;
  cloudLibrary.readerControlsVisible = false;
  view.classList.add('reader-controls-hidden');
  applyReaderPageMetrics();
  applyReaderPagePosition();
  clearTimeout(cloudLibrary.readerControlsTimer);
  cloudLibrary.readerControlsTimer = null;
}

function toggleReaderControls() {
  if (cloudLibrary.readerControlsVisible) hideReaderControls();
  else showReaderControls();
}
```

## Event Wiring

Reader panel toggles:

```js
const panelToggle = event.target.closest('[data-reader-toggle-panel]');
if (panelToggle) {
  event.preventDefault();
  event.stopPropagation();
  toggleReaderPanel(panelToggle.dataset.readerTogglePanel);
  return;
}
```

Panel backdrop and close:

```js
if (event.target.matches('[data-reader-panel-close], .reader-panel-backdrop')) {
  event.preventDefault();
  event.stopPropagation();
  closeReaderPanel();
  return;
}
```

Settings option buttons:

```js
const settingOption = event.target.closest('[data-reader-setting-option]');
if (settingOption) {
  event.preventDefault();
  event.stopPropagation();
  const key = settingOption.dataset.readerSettingOption;
  const value = Number(settingOption.dataset.readerSettingValue);
  if (key && Number.isFinite(value)) updateReaderSetting(key, value);
  return;
}
```

TOC chapter jump:

```js
const tocItem = event.target.closest('[data-reader-toc-index]');
if (tocItem) {
  event.preventDefault();
  event.stopPropagation();
  openReaderChapter(Number(tocItem.dataset.readerTocIndex) || 0, { pageIndex: 0 })
    .then(() => {
      closeReaderPanel();
      showReaderControls();
    })
    .catch(handleError);
  return;
}
```

Reading stage click toggles controls without hijacking explicit prev/next buttons:

```js
if (document.getElementById('view-reader')?.classList.contains('active')) {
  if (event.target.closest('.reader-toolbar')) showReaderControls();
  if (event.target.closest('.reader-stage') && !event.target.closest('[data-reader-prev-page], [data-reader-next-page]')) toggleReaderControls();
}
```

Escape closes the active reader panel before other keyboard handling:

```js
if (event.key === 'Escape' && cloudLibrary.readerActivePanel) {
  event.preventDefault();
  closeReaderPanel();
  return;
}
```
