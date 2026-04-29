# Reader App.js Snapshot: Panel Scaffold 2096e58

對應 commit：

`2096e58d244f511bd71bed4249767b05fc4d5e4a`

此 snapshot 摘錄閱讀器控制面板 scaffold 的核心區塊。完整可執行版本仍以 Git commit 為準。

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

## Reader Shell / Toolbar / Footer / Panel Root

```js
function renderReaderShell() {
  const book = cloudLibrary.readerBook;
  if (!book) return;
  ensureReaderViewShell();
  document.getElementById('reader-title').textContent = book.title;
  const metaParts = [book.author || '未填作者'];
  metaParts.push(book.source === 'imported_epub' ? '外部匯入 EPUB' : (book.source === 'system' ? '系統預設聖經' : `版本 ${book.version}`));
  document.getElementById('reader-meta').textContent = metaParts.join(' · ');
  document.getElementById('reader-chapter-nav').innerHTML = cloudLibrary.readerChapters.map((chapter, index) => `<option value="${index}">${escapeHtml(chapter.title || `第 ${index + 1} 章`)}</option>`).join('');
  hideReaderControls();
  renderReaderSettings();
  renderReaderPanels();
}

function ensureReaderViewShell() {
  injectReaderViewStyles();
  const view = document.getElementById('view-reader');
  if (!view || view.dataset.readerShell === 'paged') return;
  view.dataset.readerShell = 'paged';
  view.innerHTML = `
    <div class="reader-app-shell">
      <button id="reader-close-button" class="reader-close-button" type="button" data-reader-close aria-label="關閉閱讀器">關閉</button>
      <header class="reader-toolbar">
        <button id="reader-back-library" class="ghost-btn" type="button">返回書櫃</button>
        <div class="reader-book-heading">
          <h2 id="reader-title">閱讀模式</h2>
          <p id="reader-meta" class="muted"></p>
        </div>
        <label>章節<select id="reader-chapter-nav"></select></label>
        <label>字體<input id="reader-font-size" type="range" min="15" max="28" step="1" /></label>
        <label>行距<input id="reader-line-height" type="range" min="1.4" max="2.4" step="0.1" /></label>
        <label>背景<select id="reader-theme"><option value="light">淺色</option><option value="dark">深色</option></select></label>
      </header>
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
        <button class="reader-action-button" type="button" data-reader-toggle-panel="menu" aria-label="閱讀功能">功能</button>
      </footer>
      <div id="reader-panel-root" class="reader-panel-root" aria-live="polite"></div>
    </div>
  `;
}
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
function getReaderCurrentChapterTitle() {
  const chapter = cloudLibrary.readerChapters[cloudLibrary.readerChapterIndex];
  return chapter?.title || `第 ${cloudLibrary.readerChapterIndex + 1} 章`;
}

function getReaderCurrentPageLabel() {
  return document.getElementById('reader-page-text')?.textContent || `第 ${cloudLibrary.readerPageIndex + 1} 頁`;
}

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
```

## Menu Panel

```js
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

## Panel Wrapper

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

## TOC Panel

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
```

## Search Panel

```js
function renderReaderSearchPanel() {
  return `
    <label class="reader-panel-muted" for="reader-search-field">輸入關鍵字</label>
    <input id="reader-search-field" class="reader-search-field" type="search" placeholder="搜尋書籍內容" autocomplete="off" />
    <p class="reader-panel-muted">全文搜尋功能將於後續版本加入。本階段先保留面板入口，不建立全文索引。</p>
  `;
}
```

## Settings Panel

```js
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
```

## Bookmarks Panel

```js
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

## Settings Wiring

```js
function renderReaderSettings() {
  const content = document.getElementById('reader-content');
  if (!content) return;
  const settings = { fontSize: 18, lineHeight: 1.8, theme: 'light', ...cloudLibrary.readerSettings };
  const font = document.getElementById('reader-font-size');
  const line = document.getElementById('reader-line-height');
  const theme = document.getElementById('reader-theme');
  if (font) font.value = settings.fontSize;
  if (line) line.value = settings.lineHeight;
  if (theme) theme.value = settings.theme;
  content.style.fontSize = `${settings.fontSize}px`;
  content.style.lineHeight = String(settings.lineHeight);
  document.getElementById('view-reader')?.classList.toggle('reader-dark', settings.theme === 'dark');
  if (cloudLibrary.readerBook) {
    const hasExistingPagination = cloudLibrary.readerChapterPageCounts.some(count => Number(count) > 0);
    paginateCurrentReaderChapter(false, { allChapters: true, preserveProgress: hasExistingPagination, force: true });
  }
}

function updateReaderSetting(key, value) {
  cloudLibrary.readerSettings = { fontSize: 18, lineHeight: 1.8, theme: 'light', ...cloudLibrary.readerSettings, [key]: value };
  saveJson(cloudLibrary.readerSettingsKey, cloudLibrary.readerSettings);
  renderReaderSettings();
  renderReaderPanels();
  showReaderControls();
}
```

## Panel Event Wiring

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
  if (event.target.id === 'reader-chapter-nav') openReaderChapter(Number(event.target.value) || 0, { pageIndex: 0 }).catch(handleError);
  if (event.target.id === 'reader-theme') updateReaderSetting('theme', event.target.value);
  if (event.target.dataset.readerSetting === 'theme') updateReaderSetting('theme', event.target.value);
});

document.addEventListener('input', event => {
  if (event.target.id === 'reader-font-size') updateReaderSetting('fontSize', Number(event.target.value));
  if (event.target.id === 'reader-line-height') updateReaderSetting('lineHeight', Number(event.target.value));
  if (event.target.dataset.readerSetting === 'fontSize') updateReaderSetting('fontSize', Number(event.target.value));
  if (event.target.dataset.readerSetting === 'lineHeight') updateReaderSetting('lineHeight', Number(event.target.value));
});

document.addEventListener('keydown', event => {
  if (document.getElementById('view-reader')?.classList.contains('active')) {
    if (event.key === 'Escape' && cloudLibrary.readerActivePanel) {
      event.preventDefault();
      closeReaderPanel();
      return;
    }
  }
});
```
