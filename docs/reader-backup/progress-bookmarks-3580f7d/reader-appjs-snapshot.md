# app.js Reader Snapshot

Corresponding commit:

`3580f7d5d1e05fd2209e2d7477288641bc000336`

This snapshot records the relevant reader progress, bookmarks, panels, search stub, and settings flow before adding first-stage in-book search.

## Reader State

```js
const cloudLibrary = {
  bucket: 'library-books',
  epubCacheDb: 'devotion-library-cache',
  epubCacheStore: 'epubs',
  readerSettingsKey: 'devotion-app-reader-settings',
  pendingKey: 'devotion-app-reading-progress-pending',
  books: [],
  chapters: new Map(),
  coverUrls: new Map(),
  error: '',
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
  readerProgressKey: 'devotion-reader-progress-v1',
  readerBookmarksKey: 'devotion-reader-bookmarks-v1',
  readerSettings: loadJson('devotion-app-reader-settings', { fontSize: 18, lineHeight: 1.8, theme: 'light' }),
};
```

## Open Book Restore Progress Flow

Cloud books, system Bible, and imported EPUB books all reset pagination, set `readerBook` / `readerChapters`, render the reader shell, wait for layout, then restore local progress when available.

```js
async function openLibraryBook(bookId) {
  requireCloudLibrary();
  const book = getLibraryBook(bookId);
  if (!book) throw new Error('找不到這本書。');
  const chapters = cloudLibrary.chapters.get(book.id) || [];
  if (!chapters.length) throw new Error('找不到章節 metadata，請重新匯出 EPUB。');
  const epubBlob = await loadEpubForReading(book);
  resetReaderPaginationCache();
  cloudLibrary.selectedBookId = book.id;
  cloudLibrary.readerBook = book;
  cloudLibrary.readerChapters = await readEpubChapters(epubBlob, chapters);
  setView('reader');
  renderReaderShell();
  await waitForReaderLayout();
  const savedProgress = getValidReaderProgress(book);
  const startChapter = savedProgress?.chapterIndex ?? Math.min(book.current_chapter || 0, Math.max(cloudLibrary.readerChapters.length - 1, 0));
  await openReaderChapter(startChapter, savedProgress ? { pageIndex: savedProgress.pageIndex } : { restoreProgress: true });
  await stabilizeReaderAfterOpen();
}

async function openSystemLibraryBook(bookId) {
  const book = getSystemLibraryBook(bookId);
  if (!book) throw new Error('找不到這本系統預設書籍。');
  const epubBlob = await loadSystemLibraryEpub(book);
  const parsed = await parseExternalEpub(epubBlob);
  const chapters = normalizeLibraryChapters((parsed.chapters || []).map((chapter, index) => ({
    ...chapter,
    id: `${book.id}_chapter_${index}`,
    book_id: book.id,
  })));
  const readerBook = {
    ...book,
    total_chapters: chapters.length,
    totalChapters: chapters.length,
    source: 'system',
  };
  resetReaderPaginationCache();
  cloudLibrary.selectedBookId = book.id;
  cloudLibrary.readerBook = readerBook;
  cloudLibrary.readerChapters = await readEpubChapters(epubBlob, chapters, { source: 'system' });
  setView('reader');
  renderReaderShell();
  await waitForReaderLayout();
  const savedProgress = getValidReaderProgress(readerBook);
  const startChapter = savedProgress?.chapterIndex ?? Math.min(book.current_chapter || 0, Math.max(cloudLibrary.readerChapters.length - 1, 0));
  await openReaderChapter(startChapter, savedProgress ? { pageIndex: savedProgress.pageIndex } : { restoreProgress: true });
  await stabilizeReaderAfterOpen();
}

async function openImportedLibraryBook(bookId) {
  const book = getImportedBook(bookId);
  if (!book) throw new Error('找不到這本外部 EPUB。');
  if (!book.chapters?.length) throw new Error('這本 EPUB 沒有可讀章節，可能是格式不支援。');
  const stored = await getImportedBookBlob(bookId);
  if (!stored?.epubBlob) throw new Error('找不到這本 EPUB 的本機檔案，請重新匯入。');
  resetReaderPaginationCache();
  cloudLibrary.selectedBookId = book.id;
  cloudLibrary.readerBook = { ...book, source: 'imported_epub' };
  cloudLibrary.readerChapters = await readEpubChapters(stored.epubBlob, book.chapters, { source: 'imported_epub' });
  setView('reader');
  renderReaderShell();
  await waitForReaderLayout();
  const savedProgress = getValidReaderProgress(cloudLibrary.readerBook);
  const startChapter = savedProgress?.chapterIndex ?? Math.min(book.current_chapter || 0, Math.max(cloudLibrary.readerChapters.length - 1, 0));
  await openReaderChapter(startChapter, savedProgress ? { pageIndex: savedProgress.pageIndex } : { restoreProgress: true });
  await stabilizeReaderAfterOpen();
}
```

## Panel State And Rendering

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

## Search Panel Stub

```js
function renderReaderSearchPanel() {
  return `
    <label class="reader-panel-muted" for="reader-search-field">輸入關鍵字</label>
    <input id="reader-search-field" class="reader-search-field" type="search" placeholder="搜尋書籍內容" autocomplete="off" />
    <p class="reader-panel-muted">全文搜尋功能將於後續版本加入。本階段先保留面板入口，不建立全文索引。</p>
  `;
}
```

## TOC Panel Structure

The panel body is a scrollable flex child, and the TOC list uses `.reader-panel-toc` inside that body.

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

## Progress Helpers

```js
function getReaderBookKey(book = cloudLibrary.readerBook) {
  if (!book) return '';
  if (book.id === 'system-bible' || book.source === 'system') return 'system-bible';
  if (book.source === 'imported_epub') return `imported:${book.id}`;
  return `cloud:${book.id}`;
}

function loadReaderProgressMap() {
  const data = loadJson(cloudLibrary.readerProgressKey, {});
  return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
}

function saveReaderProgressMap(map) {
  saveJson(cloudLibrary.readerProgressKey, map && typeof map === 'object' ? map : {});
}

function getValidReaderProgress(book = cloudLibrary.readerBook) {
  const progress = getReaderProgress(getReaderBookKey(book));
  if (!progress) return null;
  const chapterCount = cloudLibrary.readerChapters.length;
  const chapterIndex = Math.trunc(Number(progress.chapterIndex));
  const pageIndex = Math.trunc(Number(progress.pageIndex));
  if (!Number.isFinite(chapterIndex) || chapterIndex < 0 || chapterIndex >= chapterCount) return null;
  return {
    ...progress,
    chapterIndex,
    pageIndex: Number.isFinite(pageIndex) && pageIndex >= 0 ? pageIndex : 0,
  };
}

function saveCurrentReaderProgressLocal() {
  const book = cloudLibrary.readerBook;
  const bookKey = getReaderBookKey(book);
  if (!book || !bookKey) return null;
  const map = loadReaderProgressMap();
  const pageCount = Math.max(1, Number(cloudLibrary.readerPageCount || 1));
  const chapterIndex = Math.max(0, Math.min(Math.trunc(Number(cloudLibrary.readerChapterIndex) || 0), Math.max(0, cloudLibrary.readerChapters.length - 1)));
  const pageIndex = normalizeReaderPageIndex(cloudLibrary.readerPageIndex, pageCount);
  const payload = {
    bookKey,
    source: getReaderBookSource(book),
    bookTitle: book.title || '',
    chapterIndex,
    pageIndex,
    updatedAt: nowIso(),
  };
  map[bookKey] = payload;
  saveReaderProgressMap(map);
  return payload;
}
```

## Bookmark Helpers

```js
function loadReaderBookmarks() {
  const data = loadJson(cloudLibrary.readerBookmarksKey, []);
  return Array.isArray(data) ? data.filter(item => item && typeof item === 'object') : [];
}

function saveReaderBookmarks(bookmarks) {
  saveJson(cloudLibrary.readerBookmarksKey, Array.isArray(bookmarks) ? bookmarks : []);
}

function getCurrentBookBookmarks() {
  const bookKey = getReaderBookKey();
  if (!bookKey) return [];
  return loadReaderBookmarks()
    .filter(bookmark => bookmark.bookKey === bookKey)
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
}

function buildCurrentReaderBookmark() {
  const book = cloudLibrary.readerBook;
  const bookKey = getReaderBookKey(book);
  if (!book || !bookKey) return null;
  const chapterTitle = getReaderCurrentChapterTitle();
  const pageLabel = getReaderCurrentPageLabel();
  return {
    id: uid('reader_bookmark'),
    bookKey,
    source: getReaderBookSource(book),
    bookTitle: book.title || '閱讀模式',
    chapterIndex: Math.trunc(Number(cloudLibrary.readerChapterIndex) || 0),
    pageIndex: normalizeReaderPageIndex(cloudLibrary.readerPageIndex),
    chapterTitle,
    label: `${chapterTitle} · ${pageLabel}`,
    createdAt: nowIso(),
  };
}

async function jumpToReaderBookmark(bookmarkId) {
  const bookmark = loadReaderBookmarks().find(item => item.id === bookmarkId);
  if (!bookmark || bookmark.bookKey !== getReaderBookKey()) return;
  const chapterIndex = Math.trunc(Number(bookmark.chapterIndex));
  if (!Number.isFinite(chapterIndex) || chapterIndex < 0 || chapterIndex >= cloudLibrary.readerChapters.length) return;
  await openReaderChapter(chapterIndex, { pageIndex: Math.max(0, Number(bookmark.pageIndex) || 0) });
  closeReaderPanel();
  showReaderControls();
}
```

## Bookmarks Panel

```js
function renderReaderBookmarksPanel() {
  const book = cloudLibrary.readerBook;
  const currentBookmark = getCurrentReaderBookmark();
  const bookmarks = getCurrentBookBookmarks();
  const bookmarkItems = bookmarks.map(bookmark => `
    <div class="reader-bookmark-item">
      <button class="reader-bookmark-jump" type="button" data-reader-bookmark-jump="${escapeHtml(bookmark.id)}">
        ${escapeHtml(bookmark.label || bookmark.chapterTitle || '未命名書籤')}
        <small>${escapeHtml(bookmark.createdAt ? new Date(bookmark.createdAt).toLocaleString('zh-TW') : '')}</small>
      </button>
      <button class="reader-bookmark-remove" type="button" data-reader-bookmark-remove="${escapeHtml(bookmark.id)}" aria-label="移除書籤">×</button>
    </div>
  `).join('');
  return `
    <section class="reader-panel-section" aria-labelledby="reader-progress-section-title">
      <h4 id="reader-progress-section-title" class="reader-panel-section-title">目前閱讀位置</h4>
      <p class="reader-panel-book-title">${escapeHtml(book?.title || '閱讀模式')}</p>
      <div class="reader-bookmark-summary">
        <span>目前章節與頁碼</span>
        <strong>${escapeHtml(getReaderCurrentChapterTitle())}｜${escapeHtml(getReaderCurrentPageLabel())}</strong>
      </div>
      <p class="reader-panel-muted">系統會自動記住你最後閱讀的位置；不需要按加入書籤。下次使用同一台裝置與同一個瀏覽器開啟這本書時，會回到這裡。</p>
      <p class="reader-panel-muted">目前閱讀位置只保存在這台裝置與這個瀏覽器，尚未同步到帳號。</p>
    </section>
    <section class="reader-panel-section" aria-labelledby="reader-manual-bookmarks-title">
      <h4 id="reader-manual-bookmarks-title" class="reader-panel-section-title">手動書籤</h4>
      <p class="reader-panel-muted">手動書籤可用來標記重要頁面，之後可從列表快速跳回。</p>
      <div class="reader-bookmark-actions">
        <button class="reader-bookmark-action${currentBookmark ? ' is-remove' : ''}" type="button" data-reader-bookmark-toggle>
          ${currentBookmark ? '移除目前位置書籤' : '加入目前位置書籤'}
        </button>
      </div>
      <p class="reader-panel-muted">手動書籤目前只保存在這台裝置與這個瀏覽器，尚未同步到帳號。</p>
      <div class="reader-bookmark-list" aria-label="手動書籤列表">
        ${bookmarkItems || '<p class="reader-panel-muted">這本書目前沒有手動書籤。</p>'}
      </div>
    </section>
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
        ${renderReaderSettingLevelButtons('fontSize', READER_FONT_SIZE_LEVELS, settings.fontSize)}
      </label>
      <label>行距
        ${renderReaderSettingLevelButtons('lineHeight', READER_LINE_HEIGHT_LEVELS, settings.lineHeight)}
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

function updateReaderSetting(key, value) {
  cloudLibrary.readerSettings = { fontSize: 18, lineHeight: 1.8, theme: 'light', ...cloudLibrary.readerSettings, [key]: value };
  saveJson(cloudLibrary.readerSettingsKey, cloudLibrary.readerSettings);
  renderReaderSettings();
  saveCurrentReaderProgressLocal();
  renderReaderPanels();
  showReaderControls();
}
```

## Save Progress On Page Turn, Chapter Jump, Close

```js
async function openReaderChapter(index, options = {}) {
  cloudLibrary.readerChapterIndex = Math.max(0, Math.min(index, cloudLibrary.readerChapters.length - 1));
  cloudLibrary.readerPageIndex = Math.max(0, Number(options.pageIndex) || 0);
  paginateCurrentReaderChapter(options.restoreProgress, {
    allChapters: !!options.restoreProgress,
    preserveProgress: !!options.preserveProgress,
    force: !!options.restoreProgress,
  });
  await persistCurrentReaderProgress();
}

async function turnReaderPage(direction) {
  if (!cloudLibrary.readerBook) return;
  const step = getReaderPagesPerSpread();
  const currentPage = normalizeReaderPageIndex(cloudLibrary.readerPageIndex);
  const nextPage = currentPage + (direction * step);
  if (nextPage >= 0 && nextPage < cloudLibrary.readerPageCount) {
    cloudLibrary.readerPageIndex = normalizeReaderPageIndex(nextPage);
    applyReaderPagePosition();
    await persistCurrentReaderProgress();
    return;
  }
  // chapter transition logic continues in runtime source
}

async function persistCurrentReaderProgress() {
  if (!cloudLibrary.readerBook) return;
  saveCurrentReaderProgressLocal();
  await persistReadingProgress(
    cloudLibrary.readerBook.id,
    cloudLibrary.readerChapterIndex,
    getCurrentReaderProgress()
  );
}
```

## Event Wiring

```js
document.addEventListener('click', event => {
  if (event.target.id === 'reader-back-library' || event.target.closest('[data-reader-close]')) {
    persistCurrentReaderProgress().catch(console.error);
    closeReaderPanel();
    setView('library');
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

  const bookmarkJump = event.target.closest('[data-reader-bookmark-jump]');
  if (bookmarkJump) {
    event.preventDefault();
    event.stopPropagation();
    jumpToReaderBookmark(bookmarkJump.dataset.readerBookmarkJump).catch(handleError);
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
});
```
