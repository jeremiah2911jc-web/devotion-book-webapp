# Reader `app.js` Snapshot

Baseline commit:

```text
7abb1d89f71654240189c7752ab5a993a39b1b85
Fix EPUB reader pagination overflow
```

This snapshot records the working reader logic after the column-based pagination fix. It is intentionally a focused implementation map, not a full copy of `app.js`.

## Reader State

Reader state currently lives inside `cloudLibrary`.

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
  readerControlsVisible: false,
  readerControlsTimer: null,
  readerSettings: loadJson('devotion-app-reader-settings', { fontSize: 18, lineHeight: 1.8, theme: 'light' }),
};
```

Important state relationships:

- `readerChapters` is the sanitized EPUB spine content used by the reader.
- `readerChapterPages` is an array per chapter. In this baseline each page entry is an object like `{ html, pageIndex }`.
- `readerChapterPageCounts` is the page count per chapter and drives total page count, global page index, and progress.
- `readerPaginationSignature` caches layout-affecting dimensions and settings.
- `readerPageIndex` is local to the current chapter.
- Desktop normalizes `readerPageIndex` to even indexes because it displays two pages per spread.

## Opening Books

There are three reader entry points.

### Cloud Library EPUB

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
  await openReaderChapter(Math.min(book.current_chapter || 0, Math.max(cloudLibrary.readerChapters.length - 1, 0)), { restoreProgress: true });
  await stabilizeReaderAfterOpen();
}
```

### System Bible EPUB

```js
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
  await openReaderChapter(Math.min(book.current_chapter || 0, Math.max(cloudLibrary.readerChapters.length - 1, 0)), { restoreProgress: true });
  await stabilizeReaderAfterOpen();
}
```

### Imported EPUB

```js
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
  await openReaderChapter(Math.min(book.current_chapter || 0, Math.max(cloudLibrary.readerChapters.length - 1, 0)), { restoreProgress: true });
  await stabilizeReaderAfterOpen();
}
```

Open-flow invariant:

1. Load the EPUB blob.
2. Reset pagination cache.
3. Set `readerBook` and `readerChapters`.
4. Switch to reader view.
5. Render the shell.
6. Wait for layout.
7. Open the saved chapter and restore progress.
8. Re-paginate after layout stabilizes.

## Reader Shell

`renderReaderShell()` updates the dynamic reader shell, title, metadata, chapter dropdown, controls state, and settings.

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
}
```

`ensureReaderViewShell()` replaces `#view-reader` with the paged reader shell once per session.

Key DOM:

```html
<div class="reader-app-shell">
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
  </footer>
</div>
```

## Settings And Pagination Cache

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
```

```js
function resetReaderPaginationCache() {
  cloudLibrary.readerChapterPages = [];
  cloudLibrary.readerChapterPageCounts = [];
  cloudLibrary.readerPaginationSignature = '';
}
```

```js
function getReaderPaginationSignature() {
  const viewport = document.querySelector('#reader-page-viewport .reader-page-clip') || document.getElementById('reader-page-viewport');
  const pageViewport = document.getElementById('reader-page-viewport');
  const settings = { fontSize: 18, lineHeight: 1.8, theme: 'light', ...cloudLibrary.readerSettings };
  const width = Math.max(1, Math.round(pageViewport?.clientWidth || viewport?.clientWidth || window.innerWidth || 1));
  const height = Math.max(1, Math.round(viewport?.clientHeight || window.innerHeight || 1));
  return [
    isSinglePageReaderLayout() ? 'single' : 'spread',
    width,
    height,
    Number(settings.fontSize || 18),
    Number(settings.lineHeight || 1.8),
  ].join('|');
}
```

Signature invariant:

- Layout mode, viewport width, viewport height, font size, and line height all affect pagination.
- Theme currently does not affect pagination unless future theme changes affect layout metrics.

## Chapter Open And Repagination

```js
async function stabilizeReaderAfterOpen() {
  await waitForReaderLayout();
  paginateCurrentReaderChapter(false, { allChapters: true, preserveProgress: true, force: true });
}
```

```js
async function openReaderChapter(index, options = {}) {
  const book = cloudLibrary.readerBook;
  const chapter = cloudLibrary.readerChapters[index];
  if (!book || !chapter) return;
  cloudLibrary.readerChapterIndex = index;
  cloudLibrary.readerPageIndex = Number(options.pageIndex || 0);
  document.getElementById('reader-chapter-nav').value = String(index);
  document.getElementById('reader-content').innerHTML = chapter.html || '<p>這個章節目前沒有內容。</p>';
  paginateCurrentReaderChapter(options.restoreProgress, {
    allChapters: !!options.restoreProgress,
    force: !!options.restoreProgress,
  });
  await persistCurrentReaderProgress();
}
```

```js
function ensureReaderPagination(options = {}) {
  const signature = getReaderPaginationSignature();
  const shouldRebuild = !!options.force
    || cloudLibrary.readerPaginationSignature !== signature
    || cloudLibrary.readerChapterPages.length !== cloudLibrary.readerChapters.length;
  if (shouldRebuild) {
    cloudLibrary.readerPaginationSignature = signature;
    buildAllReaderChapterPages();
  }
}
```

## Column-Based Pagination

This is the key fixed implementation. It measures rendered column width and the full `scrollWidth`, then creates a page entry for each column.

```js
function buildAllReaderChapterPages() {
  cloudLibrary.readerChapterPages = cloudLibrary.readerChapters.map(chapter => buildReaderColumnPages(chapter.html || '<p>這個章節目前沒有內容。</p>'));
  cloudLibrary.readerChapterPageCounts = cloudLibrary.readerChapterPages.map(pages => Math.max(1, pages.length));
}
```

```js
function buildReaderColumnPages(html) {
  const content = document.getElementById('reader-content');
  if (!content) return [html];
  const metrics = applyReaderPageMetrics();
  const bodyWidth = Math.max(1, metrics.bodyWidth || metrics.width || 1);
  content.innerHTML = '';
  content.style.transform = 'none';
  content.innerHTML = renderReaderPageColumn(html, 0, false, bodyWidth);
  const flow = content.querySelector('.reader-column-flow');
  const scrollWidth = Math.max(bodyWidth, Math.ceil(flow?.scrollWidth || bodyWidth));
  const pageCount = Math.max(1, Math.ceil((scrollWidth - 1) / bodyWidth));
  content.innerHTML = '';
  return Array.from({ length: pageCount }, (_, pageIndex) => ({ html, pageIndex }));
}
```

```js
function renderReaderPageColumn(html, pageIndex = 0, empty = false, bodyWidth = 1) {
  if (empty) return '';
  const safeIndex = Math.max(0, Number(pageIndex) || 0);
  const offset = Math.max(0, Math.round((Number(bodyWidth) || 1) * safeIndex));
  return `
    <div class="reader-column-page">
      <div class="reader-column-flow" style="transform: translateX(-${offset}px);">
        ${html || '<p>這個章節目前沒有內容。</p>'}
      </div>
    </div>
  `;
}
```

Do not replace this with top-level-node splitting. The regression fixed by this commit was caused by treating a long inline paragraph as a single unsplittable page node.

## Rendering Pages

Mobile renders one page index.

```js
function renderMobileReaderPage() {
  const content = document.getElementById('reader-content');
  if (!content) return;
  const pages = cloudLibrary.readerChapterPages[cloudLibrary.readerChapterIndex] || [];
  const metrics = applyReaderPageMetrics();
  const page = pages[cloudLibrary.readerPageIndex] || pages[0] || { html: '<p>這個章節目前沒有內容。</p>', pageIndex: 0 };
  content.innerHTML = renderReaderPageColumn(getReaderPageHtml(page), page.pageIndex || 0, false, metrics.bodyWidth);
}
```

Desktop renders two page indexes as a spread.

```js
function renderDesktopReaderSpread() {
  const content = document.getElementById('reader-content');
  if (!content) return;
  const pages = cloudLibrary.readerChapterPages[cloudLibrary.readerChapterIndex] || [];
  const leftIndex = normalizeReaderPageIndex(cloudLibrary.readerPageIndex);
  const leftPage = pages[leftIndex] || pages[0] || { html: '<p>這個章節目前沒有內容。</p>', pageIndex: 0 };
  const rightPage = pages[leftIndex + 1] || null;
  const leftHtml = getReaderPageHtml(leftPage);
  const rightHtml = getReaderPageHtml(rightPage);
  const metrics = applyReaderPageMetrics();
  content.innerHTML = `
    <div class="reader-spread">
      <article class="reader-page-surface reader-page-left">${renderReaderPageColumn(leftHtml, leftPage.pageIndex || 0, false, metrics.bodyWidth)}</article>
      <article class="reader-page-surface reader-page-right${rightHtml ? '' : ' is-empty'}">${renderReaderPageColumn(rightHtml, rightPage?.pageIndex || 0, !rightHtml, metrics.bodyWidth)}</article>
    </div>
  `;
  applyReaderPageMetrics();
}
```

## Page Metrics

`applyReaderPageMetrics()` is where the usable page body width and height are derived. These values drive column pagination and continuation offsets.

```js
function applyReaderPageMetrics() {
  const viewport = document.querySelector('#reader-page-viewport .reader-page-clip') || document.getElementById('reader-page-viewport');
  const pageViewport = document.getElementById('reader-page-viewport');
  const content = document.getElementById('reader-content');
  if (!viewport || !content) return { width: 1, height: 1, pageStep: 1 };
  updateReaderViewportInsets();
  const view = document.getElementById('view-reader');
  const singlePage = isSinglePageReaderLayout();
  const spreadGap = singlePage ? 0 : Math.max(28, Math.min(56, Math.round((pageViewport?.clientWidth || viewport.clientWidth) * 0.04)));
  const spreadWidth = Math.max(1, Math.floor(pageViewport?.clientWidth || viewport.clientWidth));
  const width = singlePage ? spreadWidth : Math.max(1, Math.floor((spreadWidth - spreadGap) / 2));
  const height = Math.max(1, Math.floor(viewport.clientHeight));
  const horizontalPadding = Math.max(24, Math.min(74, Math.round(width * 0.1)));
  const topPadding = Math.max(34, Math.min(72, Math.round(height * 0.09)));
  const bottomPadding = Math.max(30, Math.min(64, Math.round(height * 0.08)));
  const bodyWidth = Math.max(1, width - (horizontalPadding * 2));
  const bodyHeight = Math.max(1, height - topPadding - bottomPadding);
  view?.classList.toggle('reader-spread-mode', !singlePage);
  content.style.height = `${height}px`;
  content.style.width = singlePage ? `${width}px` : `${spreadWidth}px`;
  content.style.minWidth = singlePage ? `${width}px` : `${spreadWidth}px`;
  content.style.maxWidth = 'none';
  content.style.padding = singlePage ? `${topPadding}px ${horizontalPadding}px ${bottomPadding}px` : '0px';
  content.style.setProperty('--reader-spread-gap', `${spreadGap}px`);
  content.style.setProperty('--reader-page-padding-top', `${topPadding}px`);
  content.style.setProperty('--reader-page-padding-x', `${horizontalPadding}px`);
  content.style.setProperty('--reader-page-padding-bottom', `${bottomPadding}px`);
  content.style.setProperty('--reader-page-body-width', `${bodyWidth}px`);
  content.style.setProperty('--reader-page-body-height', `${bodyHeight}px`);
  content.style.overflow = 'hidden';
  content.style.transform = 'translateX(0)';
  viewport.scrollLeft = 0;
  return { width, height, pageStep: width + spreadGap, spreadGap, spreadWidth, bodyWidth, bodyHeight };
}
```

Critical variables:

- `bodyWidth`: column width and page continuation offset unit.
- `bodyHeight`: visible page content height.
- `spreadGap`: desktop gap between page surfaces.
- `--reader-stage-bottom`: reserves footer height so bottom controls do not cover page content.

## Turning Pages

```js
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
  const nextChapter = cloudLibrary.readerChapterIndex + direction;
  if (nextChapter < 0 || nextChapter >= cloudLibrary.readerChapters.length) return;
  await openReaderChapter(nextChapter, { pageIndex: direction > 0 ? 0 : Number.MAX_SAFE_INTEGER });
  if (direction < 0) {
    cloudLibrary.readerPageIndex = normalizeReaderPageIndex(Math.max(0, cloudLibrary.readerPageCount - 1));
    applyReaderPagePosition();
    await persistCurrentReaderProgress();
  }
}
```

Invariant:

- Only move to next chapter after the current chapter page count is exhausted.
- Desktop increments by two pages; mobile increments by one.

## Progress

Progress is global across all chapter page counts.

```js
function getReaderTotalPages() {
  return Math.max(1, cloudLibrary.readerChapterPageCounts.reduce((sum, count) => sum + Math.max(1, count || 0), 0));
}

function getReaderGlobalPageIndex() {
  const previousPages = cloudLibrary.readerChapterPageCounts
    .slice(0, cloudLibrary.readerChapterIndex)
    .reduce((sum, count) => sum + Math.max(1, count || 0), 0);
  return previousPages + cloudLibrary.readerPageIndex;
}
```

Progress persistence routes through:

- `persistCurrentReaderProgress()`
- `persistReadingProgress(book.id, cloudLibrary.readerChapterIndex, getCurrentReaderProgress())`

System Bible progress is local via `systemLibrary.progressKey`; imported EPUB progress is local via imported library storage; generated/cloud books can queue pending cloud progress when offline.

## EPUB Loading And Parsing For Reader

The reader path uses:

- `loadEpubForReading(book)` for generated/cloud EPUB.
- `loadSystemLibraryEpub(book)` for system Bible.
- `getImportedBookBlob(bookId)` for imported EPUB.
- `readEpubChapters(epubBlob, manifestChapters, options)` to produce reader chapters.

```js
async function readEpubChapters(epubBlob, manifestChapters = [], options = {}) {
  const entries = await unzipStoredEntries(epubBlob);
  const epubChapters = extractEpubSpineChapters(entries);
  const sourceChapters = epubChapters.length > manifestChapters.length ? epubChapters : manifestChapters;
  return sourceChapters.map(chapter => {
    const entry = entries.get(chapter.chapter_path) || entries.get(chapter.href) || entries.get(`OEBPS/${chapter.href}`);
    const html = entry ? sanitizeReaderHtml(entry.text, options) : '<p>找不到 EPUB 內的章節內容。</p>';
    return { ...chapter, html };
  });
}
```

Parsing support:

- `unzipStoredEntries(blob)` reads stored or deflated EPUB entries.
- `extractEpubSpineChapters(entries)` reads OPF spine order.
- `parseExternalEpub(epubBlob)` validates external EPUB, metadata, cover, and chapter list.
- `sanitizeReaderHtml(xhtml, options)` removes script/style/link and strips unsafe attributes for imported EPUB.

Do not modify EPUB export or imported EPUB write flow when only changing reader UI.

## Event Wiring

Reader interactions are delegated globally:

- `[data-open-library-book]` opens the right source through `openLibraryBookBySource()`.
- `#reader-back-library` returns to library.
- `[data-reader-prev-page]` and `[data-reader-next-page]` call `turnReaderPage()`.
- `#reader-chapter-nav` calls `openReaderChapter()`.
- `#reader-theme`, `#reader-font-size`, and `#reader-line-height` update settings.
- Arrow keys call `turnReaderPage(-1/1)`.
- Touch swipes call `turnReaderPage(-1/1)`.
- `resize` repaginates with `{ allChapters: true, preserveProgress: true, force: true }`.

Resize invariant:

```js
window.addEventListener('resize', () => {
  if (!document.getElementById('view-reader')?.classList.contains('active')) return;
  clearTimeout(readerResizeTimer);
  readerResizeTimer = setTimeout(() => {
    paginateCurrentReaderChapter(false, { allChapters: true, preserveProgress: true, force: true });
    persistCurrentReaderProgress().catch(console.error);
  }, 120);
});
```

## Known Baseline Behavior

- Desktop spread uses two visible page indexes.
- Mobile uses one visible page index.
- Long inline Bible chapter text is rendered by column continuation, not by scroll.
- `.reader-column-flow` may have large `scrollWidth`; this is expected.
- Reader shell and runtime CSS are injected by JS; `styles.css` still contains older reader selectors that are mostly historical/fallback.
