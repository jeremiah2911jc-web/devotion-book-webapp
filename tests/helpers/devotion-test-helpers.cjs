const fs = require('fs');

const STORAGE_KEYS = {
  config: 'devotion-app-config',
  user: 'devotion-app-local-user',
  accounts: 'devotion-app-local-accounts',
  notes: 'devotion-app-notes',
  books: 'devotion-app-books',
  snapshots: 'devotion-app-snapshots',
  importedLibraryBooks: 'devotion-app-imported-library-books',
  currentNoteDraft: 'devotion-current-note-draft',
  installPromptPrefs: 'devotion-app-install-prompt-prefs',
};

const NOTE_STATUS_DRAFT = 'draft';
const NOTE_STATUS_PUBLISHED = 'published';
const NOTE_SUMMARY_SETTINGS_PREFIX = 'devotion-note-summary-settings:';
const PRAYER_STATUS_ACTIVE = 'active';
const PRAYER_STATUS_REVIEWING = 'reviewing';
const PRAYER_STATUS_ANSWERED = 'answered';

const DEFAULT_TEST_USER = {
  id: 'local_user_test',
  email: 'reader@example.com',
  created_at: '2026-05-12T00:00:00.000Z',
};

function nowIso() {
  return new Date().toISOString();
}

function encodeSettings(settings = {}) {
  return Buffer.from(JSON.stringify(settings), 'utf8').toString('base64');
}

function buildNoteSummaryValue({
  summary = '',
  showSummary = false,
  status = NOTE_STATUS_PUBLISHED,
  prayerText = '',
  showPrayer = false,
} = {}) {
  const visible = String(summary || '').trim();
  const normalizedStatus = status === NOTE_STATUS_DRAFT ? NOTE_STATUS_DRAFT : NOTE_STATUS_PUBLISHED;
  const prayer = String(prayerText || '').trim();
  const includeMarker = normalizedStatus === NOTE_STATUS_DRAFT || !showSummary || !!prayer || !!showPrayer;
  if (!includeMarker) return visible;
  const marker = `<!-- ${NOTE_SUMMARY_SETTINGS_PREFIX}${encodeSettings({
    show_summary: !!showSummary,
    status: normalizedStatus,
    prayer_text: prayer,
    show_prayer: !!showPrayer,
  })} -->`;
  return visible ? `${visible}\n\n${marker}` : marker;
}

function createNote({
  id = `note_${Date.now()}`,
  userId = DEFAULT_TEST_USER.id,
  title = '在恩典中重新學會感恩',
  scripture = '',
  category = '',
  tags = [],
  summary = '',
  showSummary = false,
  content = '今天讀經時再次被提醒，感恩不是等環境順利才開始，而是在主的信實中重新看見祂的保守。',
  status = NOTE_STATUS_PUBLISHED,
  prayerText = '',
  showPrayer = false,
  createdAt = nowIso(),
  updatedAt = createdAt,
} = {}) {
  return {
    id,
    user_id: userId,
    title,
    scripture_reference: scripture,
    category,
    tags,
    summary: buildNoteSummaryValue({ summary, showSummary, status, prayerText, showPrayer }),
    content,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

function seedNoteDraftScenario(options = {}) {
  const user = { ...DEFAULT_TEST_USER, ...(options.user || {}) };
  const draftNote = createNote({
    id: options.id || 'draft_note_test',
    userId: user.id,
    title: options.title ?? '',
    scripture: options.scripture || '詩篇 23:1',
    category: options.category || '靈修',
    tags: options.tags || ['感恩'],
    summary: options.summary || '',
    showSummary: !!options.showSummary,
    content: options.content || '今天讀經時再次被提醒，感恩不是等環境順利才開始，而是在主的信實中重新看見祂的保守。',
    status: NOTE_STATUS_DRAFT,
    prayerText: options.prayerText || '主啊，求你幫助我在每天的小事中看見你的恩典，也以感恩回應你的信實。',
    showPrayer: options.showPrayer !== false,
    createdAt: options.createdAt || '2026-05-12T01:00:00.000Z',
    updatedAt: options.updatedAt || '2026-05-12T01:10:00.000Z',
  });
  return {
    user,
    notes: [draftNote, ...(options.notes || [])],
    books: options.books || [],
    snapshots: options.snapshots || [],
    importedLibraryBooks: options.importedLibraryBooks || [],
    draftNote,
  };
}

function seedPublishedNoteScenario(options = {}) {
  const user = { ...DEFAULT_TEST_USER, ...(options.user || {}) };
  const publishedNote = createNote({
    id: options.id || 'published_note_test',
    userId: user.id,
    title: options.title || '在信實中向前走',
    scripture: options.scripture || '約翰福音 3:16',
    category: options.category || '靈修',
    tags: options.tags || ['信心'],
    summary: options.summary || '在平凡的一天裡，再次思想神的信實與愛。',
    showSummary: options.showSummary !== false,
    content: options.content || '今天的經文提醒我，神的愛不是抽象的概念，而是在每一次回轉與等待中真實扶持我的力量。',
    status: NOTE_STATUS_PUBLISHED,
    prayerText: options.prayerText || '',
    showPrayer: !!options.showPrayer,
    createdAt: options.createdAt || '2026-05-12T02:00:00.000Z',
    updatedAt: options.updatedAt || '2026-05-12T02:10:00.000Z',
  });
  return {
    user,
    notes: [publishedNote, ...(options.notes || [])],
    books: options.books || [],
    snapshots: options.snapshots || [],
    importedLibraryBooks: options.importedLibraryBooks || [],
    publishedNote,
  };
}

function seedBookshelfScenario(options = {}) {
  const user = { ...DEFAULT_TEST_USER, ...(options.user || {}) };
  const note = options.note || createNote({
    id: 'bookshelf_note_test',
    userId: user.id,
    title: '安靜中聽見主的聲音',
    content: '安靜不是停止所有聲音，而是把心重新轉向主，聽見祂在日常裡溫柔的提醒。',
    status: NOTE_STATUS_PUBLISHED,
  });
  const book = {
    id: options.bookId || 'book_project_test',
    user_id: user.id,
    title: options.title || '每日恩典札記',
    subtitle: options.subtitle || '',
    author_name: options.author || '靈修作者',
    description: options.description || '整理每日讀經、禱告與回應的札記集。',
    template_code: options.template || 'devotion',
    language: options.language || 'mul',
    cover_data_url: '',
    preface: '',
    afterword: '',
    toc_enabled: true,
    include_chapter_summary: !!options.includeChapterSummary,
    chapters: [{
      id: options.chapterId || 'chapter_test',
      source_note_id: note.id,
      note_id: note.id,
      chapter_title: note.title,
      include_in_toc: true,
      chapter_order: 0,
    }],
    created_at: options.createdAt || '2026-05-12T03:00:00.000Z',
    updated_at: options.updatedAt || '2026-05-12T03:10:00.000Z',
  };
  return {
    user,
    notes: [note, ...(options.notes || [])],
    books: [book, ...(options.books || [])],
    snapshots: options.snapshots || [],
    importedLibraryBooks: options.importedLibraryBooks || [],
    note,
    book,
  };
}

function createPrayerRecord({
  id = 'prayer_test',
  userId = DEFAULT_TEST_USER.id,
  title = '為家人的平安禱告',
  prayerRequest = '求主保守家人在每一天的工作與生活中都有平安，也在需要時賜下智慧與力量。',
  status = PRAYER_STATUS_ACTIVE,
  relatedNoteId = '',
  reviewText = '',
  graceReflection = '',
  lastReviewedAt = '',
  createdAt = nowIso(),
  updatedAt = createdAt,
} = {}) {
  const legacyStatusMap = { reviewed: PRAYER_STATUS_REVIEWING, closed: PRAYER_STATUS_ANSWERED };
  const mappedStatus = legacyStatusMap[status] || status;
  const normalizedStatus = [PRAYER_STATUS_ACTIVE, PRAYER_STATUS_REVIEWING, PRAYER_STATUS_ANSWERED].includes(mappedStatus)
    ? mappedStatus
    : PRAYER_STATUS_ACTIVE;
  return {
    id,
    user_id: userId,
    title,
    prayer_request: prayerRequest,
    status: normalizedStatus,
    related_note_id: relatedNoteId,
    review_text: reviewText,
    grace_reflection: graceReflection,
    last_reviewed_at: lastReviewedAt,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

function seedPrayerReviewScenario(options = {}) {
  const user = { ...DEFAULT_TEST_USER, ...(options.user || {}) };
  const publishedNote = options.note || createNote({
    id: options.noteId || 'prayer_related_note_test',
    userId: user.id,
    title: options.noteTitle || '在禱告中交託',
    status: NOTE_STATUS_PUBLISHED,
  });
  const draftNote = createNote({
    id: options.draftNoteId || 'prayer_draft_note_test',
    userId: user.id,
    title: options.draftNoteTitle || '',
    status: NOTE_STATUS_DRAFT,
  });
  const prayer = createPrayerRecord({
    id: options.prayerId || 'prayer_record_test',
    userId: user.id,
    title: options.title || '為家人的平安禱告',
    prayerRequest: options.prayerRequest || '求主保守家人在每一天的工作與生活中都有平安，也在需要時賜下智慧與力量。',
    relatedNoteId: publishedNote.id,
    createdAt: options.createdAt || '2026-05-12T04:00:00.000Z',
    updatedAt: options.updatedAt || '2026-05-12T04:10:00.000Z',
  });
  return {
    user,
    notes: [publishedNote, draftNote, ...(options.notes || [])],
    prayers: [prayer, ...(options.prayers || [])],
    books: options.books || [],
    snapshots: options.snapshots || [],
    importedLibraryBooks: options.importedLibraryBooks || [],
    publishedNote,
    draftNote,
    prayer,
  };
}

async function seedLocalUserState(page, {
  user = DEFAULT_TEST_USER,
  notes = [],
  books = [],
  snapshots = [],
  importedLibraryBooks = [],
  config = { mode: 'local', supabaseUrl: '', supabaseAnonKey: '' },
  clear = true,
} = {}) {
  await page.evaluate((payload) => {
    if (payload.clear) localStorage.clear();
    localStorage.setItem(payload.keys.config, JSON.stringify(payload.config));
    localStorage.setItem(payload.keys.user, JSON.stringify(payload.user));
    localStorage.setItem(payload.keys.accounts, JSON.stringify([payload.user]));
    localStorage.setItem(payload.keys.notes, JSON.stringify(payload.notes));
    localStorage.setItem(payload.keys.books, JSON.stringify(payload.books));
    localStorage.setItem(payload.keys.snapshots, JSON.stringify(payload.snapshots));
    localStorage.setItem(payload.keys.importedLibraryBooks, JSON.stringify(payload.importedLibraryBooks));
    localStorage.removeItem(payload.keys.currentNoteDraft);
  }, { keys: STORAGE_KEYS, user, notes, books, snapshots, importedLibraryBooks, config, clear });
}

async function installLocalUserState(context, state = {}) {
  await context.addInitScript((payload) => {
    localStorage.clear();
    localStorage.setItem(payload.keys.config, JSON.stringify(payload.config));
    localStorage.setItem(payload.keys.user, JSON.stringify(payload.user));
    localStorage.setItem(payload.keys.accounts, JSON.stringify([payload.user]));
    localStorage.setItem(payload.keys.notes, JSON.stringify(payload.notes));
    localStorage.setItem(payload.keys.books, JSON.stringify(payload.books));
    localStorage.setItem(payload.keys.snapshots, JSON.stringify(payload.snapshots));
    localStorage.setItem(payload.keys.importedLibraryBooks, JSON.stringify(payload.importedLibraryBooks));
    localStorage.removeItem(payload.keys.currentNoteDraft);
  }, {
    keys: STORAGE_KEYS,
    user: state.user || DEFAULT_TEST_USER,
    notes: state.notes || [],
    books: state.books || [],
    snapshots: state.snapshots || [],
    importedLibraryBooks: state.importedLibraryBooks || [],
    config: state.config || { mode: 'local', supabaseUrl: '', supabaseAnonKey: '' },
  });
}

function attachConsoleErrorCollector(page, { includeWarnings = true } = {}) {
  const collector = { errors: [], warnings: [], pageErrors: [], failedRequests: [], badResponses: [] };
  page.on('console', (message) => {
    const type = message.type();
    if (type === 'error') collector.errors.push(message.text());
    if (includeWarnings && (type === 'warning' || type === 'warn')) collector.warnings.push(message.text());
  });
  page.on('pageerror', (error) => collector.pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    collector.failedRequests.push({ url: request.url(), failure: request.failure()?.errorText || '' });
  });
  page.on('response', (response) => {
    const status = response.status();
    if ([402, 429, 500, 502, 503, 504].includes(status)) {
      collector.badResponses.push({ status, url: response.url() });
    }
  });
  return collector;
}

function assertNoConsoleErrors(collector) {
  const problems = [
    ...(collector?.errors || []).map((message) => `console.error: ${message}`),
    ...(collector?.pageErrors || []).map((message) => `pageerror: ${message}`),
  ];
  if (problems.length) throw new Error(problems.join('\n'));
}

async function assertNoHorizontalScroll(page, { maxOverflow = 2, label = 'page' } = {}) {
  const overflow = await page.evaluate(() => Math.ceil(document.documentElement.scrollWidth - document.documentElement.clientWidth));
  if (overflow > maxOverflow) throw new Error(`${label} has horizontal overflow: ${overflow}px`);
  return overflow;
}

async function openReader(page, triggerSelector = '[data-testid="library-open-reader"]') {
  const trigger = page.locator(triggerSelector).first();
  await trigger.waitFor({ state: 'visible', timeout: 10000 });
  await trigger.click();
  await page.locator('[data-testid="reader-view"].active, #view-reader.active').waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('[data-testid="reader-close"]').waitFor({ state: 'visible', timeout: 10000 });
}

async function closeReader(page) {
  const closeButton = page.locator('[data-testid="reader-close"]');
  await closeButton.waitFor({ state: 'visible', timeout: 10000 });
  await closeButton.evaluate((button) => button.scrollIntoView({ block: 'center', inline: 'center' }));
  await closeButton.click({ force: false, timeout: 10000 });
  await page.locator('[data-testid="reader-view"].active, #view-reader.active').waitFor({ state: 'hidden', timeout: 10000 }).catch(async () => {
    await page.locator('[data-testid="library-view"].active, #view-library.active').waitFor({ state: 'visible', timeout: 10000 });
  });
}

async function exportEpubAndCaptureDownload(page, buttonSelector = '[data-testid="download-exported-book"]') {
  const button = page.locator(buttonSelector).first();
  await button.waitFor({ state: 'visible', timeout: 10000 });
  const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
  await button.click();
  const download = await downloadPromise;
  const filename = download.suggestedFilename();
  const filePath = await download.path();
  const size = filePath ? fs.statSync(filePath).size : 0;
  if (!filename || !/\.epub$/i.test(filename)) throw new Error(`Unexpected EPUB filename: ${filename}`);
  if (size <= 0) throw new Error('Downloaded EPUB is empty');
  return { download, filename, filePath, size };
}

module.exports = {
  STORAGE_KEYS,
  NOTE_STATUS_DRAFT,
  NOTE_STATUS_PUBLISHED,
  DEFAULT_TEST_USER,
  buildNoteSummaryValue,
  createNote,
  seedLocalUserState,
  installLocalUserState,
  seedNoteDraftScenario,
  seedPublishedNoteScenario,
  seedBookshelfScenario,
  createPrayerRecord,
  seedPrayerReviewScenario,
  attachConsoleErrorCollector,
  assertNoConsoleErrors,
  assertNoHorizontalScroll,
  openReader,
  closeReader,
  exportEpubAndCaptureDownload,
};
