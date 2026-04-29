# Reader App.js Snapshot: Controls Layout 9ff280a

對應 commit：

`9ff280a0805d10d819412134c4c5871d7829426b`

此 snapshot 摘錄閱讀器 controls / panels 相關核心區塊。完整可執行版本仍以 Git commit 為準。

## Reader State

```js
const cloudLibrary = {
  selectedBookId: '',
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
};
```

## Reader Shell DOM

```js
function ensureReaderViewShell() {
  injectReaderViewStyles();
  const view = document.getElementById('view-reader');
  if (!view || view.dataset.readerShell === 'paged') return;
  view.dataset.readerShell = 'paged';
  view.innerHTML = `
    <div class="reader-app-shell">
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
      <main class="reader-stage">
        <button class="reader-turn-zone reader-turn-left" data-reader-prev-page type="button" aria-label="上一頁"></button>
        <section id="reader-page-viewport" class="reader-page-viewport">
          <div class="reader-page-clip">
            <div id="reader-content" class="reader-content reader-flow"></div>
          </div>
        </section>
        <button class="reader-turn-zone reader-turn-right" data-reader-next-page type="button" aria-label="下一頁"></button>
      </main>
      <footer class="reader-footer">
        <button class="ghost-btn" data-reader-prev-page type="button">上一頁</button>
        <div class="reader-progress">
          <span id="reader-progress-text">0%</span>
          <span id="reader-page-text">第 1 / 1 頁</span>
          <div><i id="reader-progress-bar"></i></div>
        </div>
        <button class="primary-btn" data-reader-next-page type="button">下一頁</button>
      </footer>
      <button class="reader-action-button" type="button" data-reader-toggle-panel="menu" aria-label="閱讀功能">功能</button>
      <div id="reader-panel-root" class="reader-panel-root" aria-live="polite"></div>
    </div>
  `;
}
```

## Runtime CSS: Hidden Controls / Footer / Action Button / Panels

```js
#view-reader .reader-hidden-controls { display: none !important; }
#view-reader .reader-stage { position: absolute; top: var(--reader-stage-top); right: 0; bottom: var(--reader-stage-bottom); left: 0; z-index: 1; display: flex; align-items: stretch; justify-content: center; padding: clamp(10px, 2.5vw, 28px) clamp(12px, 4vw, 42px); overflow: hidden; }
#view-reader .reader-footer { position: absolute; left: 0; right: 0; bottom: 0; z-index: 4; display: grid; grid-template-columns: auto minmax(180px, 520px) auto; align-items: center; gap: 14px; padding: 12px clamp(12px, 3vw, 28px); border-top: 1px solid rgba(80,70,55,.18); background: rgba(255,255,255,.7); transition: opacity .2s ease, transform .2s ease; }
#view-reader.reader-controls-hidden .reader-footer { display: grid; opacity: .92; transform: none; pointer-events: auto; padding-block: 8px; }
#view-reader .reader-close-button { position: absolute; top: 14px; right: clamp(12px, 3vw, 28px); z-index: 8; min-height: 38px; padding: 0 14px; border: 1px solid rgba(80,70,55,.16); border-radius: 999px; background: rgba(255,255,255,.82); color: #26494c; font-weight: 700; box-shadow: 0 10px 28px rgba(45,35,25,.12); backdrop-filter: blur(12px); }
#view-reader .reader-action-button { position: absolute; right: clamp(18px, 6vw, 88px); bottom: calc(var(--reader-stage-bottom) + clamp(18px, 3vh, 28px)); z-index: 6; min-height: 46px; padding: 0 18px; border: 0; border-radius: 999px; background: #3f9890; color: #fff; font-weight: 800; box-shadow: 0 12px 28px rgba(42,112,106,.26); }
#view-reader .reader-panel-root { position: absolute; inset: 0; z-index: 7; pointer-events: none; }
#view-reader .reader-action-menu { position: absolute; right: clamp(18px, 6vw, 88px); bottom: calc(var(--reader-stage-bottom) + 76px); z-index: 8; width: min(240px, calc(100vw - 28px)); padding: 8px; border: 1px solid rgba(80,70,55,.14); border-radius: 16px; background: rgba(255,253,248,.96); box-shadow: 0 18px 44px rgba(45,35,25,.2); pointer-events: auto; backdrop-filter: blur(14px); }
#view-reader .reader-panel { position: absolute; top: 24px; right: clamp(16px, 4vw, 48px); bottom: calc(var(--reader-stage-bottom) + 20px); z-index: 8; width: min(430px, calc(100vw - 32px)); display: flex; flex-direction: column; overflow: hidden; border: 1px solid rgba(80,70,55,.14); border-radius: 18px; background: rgba(255,253,248,.98); color: #2f2a24; box-shadow: 0 24px 60px rgba(45,35,25,.24); pointer-events: auto; backdrop-filter: blur(18px); }
```

## Panel State Helpers

```js
const READER_PANEL_TYPES = new Set(['menu', 'toc', 'search', 'settings', 'bookmarks']);

function isReaderPanel(panel) {
  return READER_PANEL_TYPES.has(panel);
}

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

## Panel Render Flow

```js
function renderReaderPanels() {
  const root = document.getElementById('reader-panel-root');
  const view = document.getElementById('view-reader');
  if (!root || !view) return;
  const panel = cloudLibrary.readerActivePanel;
  view.classList.toggle('reader-panel-open', Boolean(panel));
  if (panel) view.dataset.readerPanel = panel;
  else delete view.dataset.readerPanel;
  if (!isReaderPanel(panel)) {
    root.innerHTML = '';
    return;
  }
  if (panel === 'menu') root.innerHTML = renderReaderActionMenu();
  else root.innerHTML = `
    <button class="reader-panel-backdrop" type="button" data-reader-close-panel aria-label="關閉閱讀面板"></button>
    ${renderReaderPanel(panel)}
  `;
}

function renderReaderActionMenu() {
  return `
    <button class="reader-panel-backdrop" type="button" data-reader-close-panel aria-label="關閉閱讀功能"></button>
    <div class="reader-action-menu" role="menu" aria-label="閱讀功能">
      <button class="reader-action-menu-item" type="button" data-reader-open-panel="toc" role="menuitem"><span>目錄</span><span>&gt;</span></button>
      <button class="reader-action-menu-item" type="button" data-reader-open-panel="search" role="menuitem"><span>搜尋</span><span>&gt;</span></button>
      <button class="reader-action-menu-item" type="button" data-reader-open-panel="settings" role="menuitem"><span>主題與設定</span><span>&gt;</span></button>
      <button class="reader-action-menu-item" type="button" data-reader-open-panel="bookmarks" role="menuitem"><span>書籤</span><span>&gt;</span></button>
    </div>
  `;
}
```

## TOC / Search / Settings / Bookmarks Panels

```js
function renderReaderPanel(panel) {
  const titles = {
    toc: '目錄',
    search: '搜尋書籍',
    settings: '主題與設定',
    bookmarks: '書籤',
  };
  const body = panel === 'toc'
    ? renderReaderTocPanel()
    : panel === 'search'
      ? renderReaderSearchPanel()
      : panel === 'settings'
        ? renderReaderSettingsPanel()
        : renderReaderBookmarksPanel();
  return `
    <section class="reader-panel reader-panel-${panel}" role="dialog" aria-modal="true" aria-label="${escapeHtml(titles[panel])}">
      <header class="reader-panel-header">
        <h3 class="reader-panel-title">${escapeHtml(titles[panel])}</h3>
        <button class="reader-panel-close" type="button" data-reader-close-panel aria-label="關閉">關閉</button>
      </header>
      <div class="reader-panel-body">${body}</div>
    </section>
  `;
}
```

```js
function renderReaderTocPanel() {
  const book = cloudLibrary.readerBook;
  const totalPages = getReaderTotalPages();
  const pageCounts = cloudLibrary.readerChapterPageCounts || [];
  let pageStart = 1;
  const items = cloudLibrary.readerChapters.map((chapter, index) => {
    const count = Math.max(1, Number(pageCounts[index] || 1));
    const start = pageStart;
    pageStart += count;
    const active = index === cloudLibrary.readerChapterIndex;
    return `
      <button class="reader-panel-toc-item${active ? ' active' : ''}" type="button" data-reader-toc-index="${index}" aria-current="${active ? 'true' : 'false'}">
        <span>${escapeHtml(chapter.title || `第 ${index + 1} 章`)}</span>
        <small>${totalPages > 1 ? `第 ${start} 頁` : `第 ${index + 1}`}</small>
      </button>
    `;
  }).join('');
  return `
    <p class="reader-panel-book-title">${escapeHtml(book?.title || '閱讀模式')}</p>
    <p class="reader-panel-muted">${getReaderCurrentPageLabel()}</p>
    <div class="reader-panel-toc">${items || '<p class="reader-panel-muted">目前沒有可用章節。</p>'}</div>
  `;
}

function renderReaderSearchPanel() {
  return `
    <label class="reader-panel-muted" for="reader-search-field">輸入關鍵字</label>
    <input id="reader-search-field" class="reader-search-field" type="search" placeholder="搜尋書籍內容" autocomplete="off" />
    <p class="reader-panel-muted">全文搜尋功能將於後續版本加入。本階段先保留面板入口，不建立全文索引。</p>
  `;
}

function renderReaderSettingsPanel() {
  const settings = { fontSize: 18, lineHeight: 1.8, theme: 'light', ...cloudLibrary.readerSettings };
  return `
    <div class="reader-settings-sheet">
      <label>字體大小
        <input data-reader-setting="fontSize" type="range" min="15" max="28" step="1" value="${Number(settings.fontSize || 18)}" />
      </label>
      <label>行距
        <input data-reader-setting="lineHeight" type="range" min="1.4" max="2.4" step="0.1" value="${Number(settings.lineHeight || 1.8)}" />
      </label>
      <label>背景主題
        <select data-reader-setting="theme">
          <option value="light"${settings.theme === 'light' ? ' selected' : ''}>淺色</option>
          <option value="dark"${settings.theme === 'dark' ? ' selected' : ''}>深色</option>
        </select>
      </label>
    </div>
  `;
}

function renderReaderBookmarksPanel() {
  const book = cloudLibrary.readerBook;
  return `
    <p class="reader-panel-book-title">${escapeHtml(book?.title || '閱讀模式')}</p>
    <div class="reader-bookmark-summary">
      <span>目前位置</span>
      <strong>${escapeHtml(getReaderCurrentChapterTitle())}｜${escapeHtml(getReaderCurrentPageLabel())}</strong>
    </div>
    <p class="reader-panel-muted">書籤功能將於後續版本加入。本階段先顯示目前閱讀位置，不寫入 Supabase。</p>
  `;
}
```

## Controls Visibility

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

```js
if (event.target.id === 'reader-back-library' || event.target.closest('[data-reader-close]')) {
  closeReaderPanel();
  setView('library');
  return;
}
const panelToggle = event.target.closest('[data-reader-toggle-panel]');
if (panelToggle) {
  event.preventDefault();
  event.stopPropagation();
  toggleReaderPanel(panelToggle.dataset.readerTogglePanel);
  return;
}
const panelOpen = event.target.closest('[data-reader-open-panel]');
if (panelOpen) {
  event.preventDefault();
  event.stopPropagation();
  openReaderPanel(panelOpen.dataset.readerOpenPanel);
  return;
}
if (event.target.closest('[data-reader-close-panel]')) {
  event.preventDefault();
  event.stopPropagation();
  closeReaderPanel();
  return;
}
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

```js
document.addEventListener('change', event => {
  if (event.target.id === 'library-sort') renderLibrary();
  if (event.target.id === 'reader-chapter-nav') openReaderChapter(Number(event.target.value) || 0, { pageIndex: 0 }).catch(handleError);
  if (event.target.id === 'reader-theme') updateReaderSetting('theme', event.target.value);
  if (event.target.dataset.readerSetting === 'theme') updateReaderSetting('theme', event.target.value);
  if (event.target.closest('#view-reader')) showReaderControls();
});

document.addEventListener('input', event => {
  if (event.target.id === 'reader-font-size') updateReaderSetting('fontSize', Number(event.target.value));
  if (event.target.id === 'reader-line-height') updateReaderSetting('lineHeight', Number(event.target.value));
  if (event.target.dataset.readerSetting === 'fontSize') updateReaderSetting('fontSize', Number(event.target.value));
  if (event.target.dataset.readerSetting === 'lineHeight') updateReaderSetting('lineHeight', Number(event.target.value));
  if (event.target.closest('#view-reader')) showReaderControls();
});
```
