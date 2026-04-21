const STORAGE_KEYS = {
  config: 'devotion-app-config',
  user: 'devotion-app-local-user',
  notes: 'devotion-app-notes',
  books: 'devotion-app-books',
  snapshots: 'devotion-app-snapshots',
};

const TEMPLATE_LABELS = {
  devotion: '靈修札記版',
  sermon: '講章整理版',
  testimony: '見證合集版',
};

const els = {
  toggleConfigBtn: document.getElementById('toggle-config-btn'),
  configPanel: document.getElementById('config-panel'),
  supabaseUrl: document.getElementById('supabase-url'),
  supabaseAnonKey: document.getElementById('supabase-anon-key'),
  saveConfigBtn: document.getElementById('save-config-btn'),
  clearConfigBtn: document.getElementById('clear-config-btn'),
  authModeBadge: document.getElementById('auth-mode-badge'),
  authEmail: document.getElementById('auth-email'),
  authPassword: document.getElementById('auth-password'),
  registerBtn: document.getElementById('register-btn'),
  loginBtn: document.getElementById('login-btn'),
  magicLinkBtn: document.getElementById('magic-link-btn'),
  signoutBtn: document.getElementById('signout-btn'),
  refreshBtn: document.getElementById('refresh-btn'),
  authForms: document.getElementById('auth-forms'),
  authUser: document.getElementById('auth-user'),
  currentUserText: document.getElementById('current-user-text'),
  navLinks: [...document.querySelectorAll('.nav-link')],
  viewTitle: document.getElementById('view-title'),
  viewSubtitle: document.getElementById('view-subtitle'),
  views: [...document.querySelectorAll('.view')],
  quickNewNote: document.getElementById('quick-new-note'),
  quickNewBook: document.getElementById('quick-new-book'),
  summaryNotesCount: document.getElementById('summary-notes-count'),
  summaryBooksCount: document.getElementById('summary-books-count'),
  summarySnapshotsCount: document.getElementById('summary-snapshots-count'),
  recentNotes: document.getElementById('recent-notes'),
  recentBooks: document.getElementById('recent-books'),
  noteForm: document.getElementById('note-form'),
  noteId: document.getElementById('note-id'),
  noteTitle: document.getElementById('note-title'),
  noteScripture: document.getElementById('note-scripture'),
  fetchScriptureBtn: document.getElementById('fetch-scripture-btn'),
  scriptureAppendToContent: document.getElementById('scripture-append-to-content'),
  scriptureFetchStatus: document.getElementById('scripture-fetch-status'),
  scripturePreview: document.getElementById('scripture-preview'),
  noteCategory: document.getElementById('note-category'),
  noteTags: document.getElementById('note-tags'),
  noteSummary: document.getElementById('note-summary'),
  noteContent: document.getElementById('note-content'),
  newNoteBtn: document.getElementById('new-note-btn'),
  deleteNoteBtn: document.getElementById('delete-note-btn'),
  noteSearch: document.getElementById('note-search'),
  notesList: document.getElementById('notes-list'),
  bookForm: document.getElementById('book-form'),
  bookId: document.getElementById('book-id'),
  bookTitle: document.getElementById('book-title'),
  bookSubtitle: document.getElementById('book-subtitle'),
  bookAuthor: document.getElementById('book-author'),
  bookDescription: document.getElementById('book-description'),
  bookTemplate: document.getElementById('book-template'),
  bookLanguage: document.getElementById('book-language'),
  bookCover: document.getElementById('book-cover'),
  bookPreface: document.getElementById('book-preface'),
  bookAfterword: document.getElementById('book-afterword'),
  bookTocEnabled: document.getElementById('book-toc-enabled'),
  newBookBtn: document.getElementById('new-book-btn'),
  deleteBookBtn: document.getElementById('delete-book-btn'),
  booksList: document.getElementById('books-list'),
  selectedBookEmpty: document.getElementById('selected-book-empty'),
  selectedBookPanel: document.getElementById('selected-book-panel'),
  bookCoverPreview: document.getElementById('book-cover-preview'),
  chapterSourceNote: document.getElementById('chapter-source-note'),
  addChapterBtn: document.getElementById('add-chapter-btn'),
  chaptersList: document.getElementById('chapters-list'),
  createSnapshotBtn: document.getElementById('create-snapshot-btn'),
  exportEpubBtn: document.getElementById('export-epub-btn'),
  snapshotsList: document.getElementById('snapshots-list'),
  statusStorage: document.getElementById('status-storage'),
  statusCurrentBook: document.getElementById('status-current-book'),
  statusChapterCount: document.getElementById('status-chapter-count'),
  toast: document.getElementById('toast'),
  supportBtn: document.getElementById('support-btn'),
  supportModal: document.getElementById('support-modal'),
  supportModalBackdrop: document.getElementById('support-modal-backdrop'),
  closeSupportModal: document.getElementById('close-support-modal'),
};

const state = {
  config: loadJson(STORAGE_KEYS.config, { supabaseUrl: '', supabaseAnonKey: '' }),
  supabase: null,
  currentUser: null,
  storageMode: 'local',
  notes: [],
  books: [],
  snapshots: [],
  selectedBookId: null,
  noteSearch: '',
  scriptureCache: new Map(),
  scriptureFetchTimer: null,
  scriptureAbortController: null,
  scriptureLastAppliedBlock: '',
};

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function nowIso() {
  return new Date().toISOString();
}
function escapeHtml(input = '') {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove('hidden');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.add('hidden'), 2600);
}
function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve('');
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function initSupabase() {
  const { supabaseUrl, supabaseAnonKey } = state.config;
  if (!supabaseUrl || !supabaseAnonKey || !window.supabase?.createClient) {
    state.supabase = null;
    state.storageMode = 'local';
    return;
  }
  try {
    state.supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    state.storageMode = 'cloud';
  } catch (error) {
    console.error(error);
    state.supabase = null;
    state.storageMode = 'local';
  }
}

function getLocalUser() {
  return loadJson(STORAGE_KEYS.user, null);
}
function setLocalUser(user) {
  saveJson(STORAGE_KEYS.user, user);
}
function clearLocalUser() {
  localStorage.removeItem(STORAGE_KEYS.user);
}

async function bootstrap() {
  els.supabaseUrl.value = state.config.supabaseUrl || '';
  els.supabaseAnonKey.value = state.config.supabaseAnonKey || '';
  initSupabase();
  bindEvents();
  if (state.supabase) {
    const { data } = await state.supabase.auth.getSession();
    state.currentUser = data.session?.user || null;
    state.supabase.auth.onAuthStateChange((_event, session) => {
      state.currentUser = session?.user || null;
      refreshUi();
      loadAllData().catch(console.error);
    });
  } else {
    state.currentUser = getLocalUser();
  }
  await loadAllData();
  refreshUi();
}

function bindEvents() {
  els.toggleConfigBtn.addEventListener('click', () => {
    els.configPanel.classList.toggle('hidden');
    els.toggleConfigBtn.textContent = els.configPanel.classList.contains('hidden') ? '展開' : '收合';
  });
  els.saveConfigBtn.addEventListener('click', async () => {
    state.config = {
      supabaseUrl: els.supabaseUrl.value.trim(),
      supabaseAnonKey: els.supabaseAnonKey.value.trim(),
    };
    saveJson(STORAGE_KEYS.config, state.config);
    initSupabase();
    if (state.supabase) {
      const { data } = await state.supabase.auth.getSession();
      state.currentUser = data.session?.user || null;
      showToast('Supabase 設定已儲存。');
    } else {
      state.currentUser = getLocalUser();
      showToast('已切回本機模式。');
    }
    await loadAllData();
    refreshUi();
  });
  els.clearConfigBtn.addEventListener('click', async () => {
    state.config = { supabaseUrl: '', supabaseAnonKey: '' };
    saveJson(STORAGE_KEYS.config, state.config);
    els.supabaseUrl.value = '';
    els.supabaseAnonKey.value = '';
    initSupabase();
    state.currentUser = getLocalUser();
    await loadAllData();
    refreshUi();
    showToast('Supabase 設定已清除。');
  });

  els.registerBtn.addEventListener('click', () => handleRegister().catch(handleError));
  els.loginBtn.addEventListener('click', () => handleLogin().catch(handleError));
  els.magicLinkBtn.addEventListener('click', () => handleMagicLink().catch(handleError));
  els.signoutBtn.addEventListener('click', () => handleSignOut().catch(handleError));
  els.refreshBtn.addEventListener('click', () => loadAllData().then(refreshUi).then(() => showToast('資料已重新整理。')).catch(handleError));

  els.navLinks.forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));
  els.quickNewNote.addEventListener('click', () => { setView('notes'); clearNoteForm(); });
  els.quickNewBook.addEventListener('click', () => { setView('books'); clearBookForm(); });
  els.newNoteBtn.addEventListener('click', clearNoteForm);
  els.newBookBtn.addEventListener('click', clearBookForm);
  els.noteForm.addEventListener('submit', event => { event.preventDefault(); saveNote().catch(handleError); });
  els.bookForm.addEventListener('submit', event => { event.preventDefault(); saveBook().catch(handleError); });
  els.deleteNoteBtn.addEventListener('click', () => deleteNote().catch(handleError));
  els.deleteBookBtn.addEventListener('click', () => deleteBook().catch(handleError));
  els.noteSearch.addEventListener('input', () => { state.noteSearch = els.noteSearch.value.trim().toLowerCase(); renderNotes(); });
  els.noteScripture.addEventListener('input', handleScriptureInput);
  els.fetchScriptureBtn.addEventListener('click', () => fetchAndRenderScriptures({ force: true }).catch(handleError));
  els.scriptureAppendToContent.addEventListener('change', () => {
    if (els.scriptureAppendToContent.checked && els.scripturePreview.dataset.serialized) {
      applyScriptureBlockToNoteContent(JSON.parse(els.scripturePreview.dataset.serialized));
    }
  });
  els.addChapterBtn.addEventListener('click', () => addChapterFromSelectedNote().catch(handleError));
  els.createSnapshotBtn.addEventListener('click', () => createSnapshotForSelectedBook().catch(handleError));
  els.exportEpubBtn.addEventListener('click', () => exportSelectedBookEpub().catch(handleError));
  els.supportBtn?.addEventListener('click', openSupportModal);
  els.closeSupportModal?.addEventListener('click', closeSupportModal);
  els.supportModalBackdrop?.addEventListener('click', closeSupportModal);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !els.supportModal?.classList.contains('hidden')) closeSupportModal();
  });
}


function openSupportModal() {
  els.supportModal?.classList.remove('hidden');
  els.supportModal?.setAttribute('aria-hidden', 'false');
}
function closeSupportModal() {
  els.supportModal?.classList.add('hidden');
  els.supportModal?.setAttribute('aria-hidden', 'true');
}

async function handleRegister() {
  const email = els.authEmail.value.trim();
  const password = els.authPassword.value.trim();
  if (!email) throw new Error('請輸入 Email。');
  if (state.supabase) {
    const { error } = await state.supabase.auth.signUp({ email, password });
    if (error) throw error;
    showToast('註冊完成，請依 Supabase 設定確認信箱。');
    return;
  }
  const user = { id: uid('local_user'), email };
  setLocalUser(user);
  state.currentUser = user;
  await loadAllData();
  refreshUi();
  showToast('本機測試帳號已建立。');
}

async function handleLogin() {
  const email = els.authEmail.value.trim();
  const password = els.authPassword.value.trim();
  if (!email) throw new Error('請輸入 Email。');
  if (state.supabase) {
    const { error } = await state.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    showToast('登入成功。');
    return;
  }
  const user = { id: uid('local_user'), email };
  setLocalUser(user);
  state.currentUser = user;
  await loadAllData();
  refreshUi();
  showToast('已進入本機模式。');
}

async function handleMagicLink() {
  const email = els.authEmail.value.trim();
  if (!email) throw new Error('請先輸入 Email。');
  if (!state.supabase) throw new Error('Magic Link 需要先設定 Supabase。');
  const { error } = await state.supabase.auth.signInWithOtp({ email });
  if (error) throw error;
  showToast('Magic Link 已寄出。');
}

async function handleSignOut() {
  if (state.supabase) {
    const { error } = await state.supabase.auth.signOut();
    if (error) throw error;
  } else {
    clearLocalUser();
    state.currentUser = null;
  }
  state.selectedBookId = null;
  await loadAllData();
  refreshUi();
  showToast('已登出。');
}

function getUserId() {
  return state.currentUser?.id || 'guest';
}
function requireUser() {
  if (!state.currentUser) throw new Error('請先登入或以本機模式建立測試帳號。');
}

async function loadAllData() {
  if (state.supabase && state.currentUser) {
    const userId = state.currentUser.id;
    const [notesRes, booksRes, snapshotsRes] = await Promise.all([
      state.supabase.from('devotion_notes').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
      state.supabase.from('book_projects').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
      state.supabase.from('book_snapshots').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);
    if (notesRes.error) throw notesRes.error;
    if (booksRes.error) throw booksRes.error;
    if (snapshotsRes.error) throw snapshotsRes.error;
    state.notes = notesRes.data || [];
    state.books = (booksRes.data || []).map(book => ({
      ...book,
      chapters: parseMaybeJson(book.chapters, []),
      cover_data_url: book.cover_data_url || '',
    }));
    state.snapshots = (snapshotsRes.data || []).map(s => ({ ...s, snapshot_json: parseMaybeJson(s.snapshot_json, null) }));
  } else {
    const userId = getUserId();
    state.notes = loadJson(STORAGE_KEYS.notes, []).filter(item => item.user_id === userId);
    state.books = loadJson(STORAGE_KEYS.books, []).filter(item => item.user_id === userId);
    state.snapshots = loadJson(STORAGE_KEYS.snapshots, []).filter(item => item.user_id === userId);
  }
  if (!state.books.find(b => b.id === state.selectedBookId)) {
    state.selectedBookId = state.books[0]?.id || null;
  }
  refreshUi();
}

function parseMaybeJson(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function refreshUi() {
  els.authModeBadge.textContent = state.supabase ? '雲端模式' : '本機模式';
  els.statusStorage.textContent = state.supabase ? 'Supabase' : 'Local';
  els.authForms.classList.toggle('hidden', !!state.currentUser);
  els.authUser.classList.toggle('hidden', !state.currentUser);
  els.currentUserText.textContent = state.currentUser ? `目前使用者：${state.currentUser.email || state.currentUser.id}` : '尚未登入';
  els.summaryNotesCount.textContent = state.notes.length;
  els.summaryBooksCount.textContent = state.books.length;
  els.summarySnapshotsCount.textContent = state.snapshots.length;
  renderRecentCards();
  renderNotes();
  renderBooks();
  renderSelectedBookPanel();
  renderSnapshots();
}

function renderRecentCards() {
  renderCardList(els.recentNotes, state.notes.slice(0, 3), note => `
    <div class="card">
      <h3>${escapeHtml(note.title || '未命名札記')}</h3>
      <div class="card-meta"><span>${escapeHtml(note.scripture_reference || '未填經文')}</span><span>${formatDate(note.updated_at)}</span></div>
      <div>${escapeHtml((note.summary || note.content || '').slice(0, 90))}</div>
    </div>`);
  renderCardList(els.recentBooks, state.books.slice(0, 3), book => `
    <div class="card">
      <h3>${escapeHtml(book.title || '未命名書籍')}</h3>
      <div class="card-meta"><span>${escapeHtml(TEMPLATE_LABELS[book.template_code] || '模板')}</span><span>${(book.chapters || []).length} 章</span></div>
      <div>${escapeHtml((book.description || '').slice(0, 90) || '尚未填寫簡介')}</div>
    </div>`);
}
function renderCardList(container, items, renderer) {
  if (!items.length) {
    container.className = 'list-stack empty-state';
    container.textContent = '還沒有資料。';
    return;
  }
  container.className = 'list-stack';
  container.innerHTML = items.map(renderer).join('');
}


function normalizeScriptureReferences(raw = '') {
  return raw
    .split(/[;；]+/)
    .map(item => item.trim())
    .filter(Boolean);
}

function handleScriptureInput() {
  clearTimeout(state.scriptureFetchTimer);
  const refs = normalizeScriptureReferences(els.noteScripture.value);
  if (!refs.length) {
    resetScripturePreview();
    return;
  }
  state.scriptureFetchTimer = setTimeout(() => {
    fetchAndRenderScriptures().catch(handleError);
  }, 650);
}

function setScriptureStatus(message = '', isError = false) {
  if (!message) {
    els.scriptureFetchStatus.textContent = '';
    els.scriptureFetchStatus.classList.add('hidden');
    els.scriptureFetchStatus.classList.remove('error-text');
    return;
  }
  els.scriptureFetchStatus.textContent = message;
  els.scriptureFetchStatus.classList.remove('hidden');
  els.scriptureFetchStatus.classList.toggle('error-text', !!isError);
}

function resetScripturePreview() {
  if (state.scriptureAbortController) {
    state.scriptureAbortController.abort();
    state.scriptureAbortController = null;
  }
  state.scriptureLastAppliedBlock = '';
  els.scripturePreview.innerHTML = '';
  els.scripturePreview.classList.add('hidden');
  delete els.scripturePreview.dataset.serialized;
  setScriptureStatus('');
}

function stripScriptureMarkers(text = '') {
  return String(text || '')
    .replace(/【經文引用開始】\s*\n?/g, '')
    .replace(/\n?\s*【經文引用結束】/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeScriptureText(text = '') {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function formatFetchedVerses(verses = []) {
  if (!Array.isArray(verses) || !verses.length) return '';
  return verses.map((verse, index) => {
    const previous = verses[index - 1];
    const chapter = verse.chapter ?? '';
    const verseNo = verse.verse ?? '';
    const prefix = index === 0
      ? `${verse.book_name || ''}${chapter}:${verseNo}`
      : previous && previous.chapter === chapter
        ? `${verseNo}`
        : `${chapter}:${verseNo}`;
    return `${prefix} ${normalizeScriptureText(verse.text)}`.trim();
  }).join(' ');
}

async function fetchScriptureReference(reference, signal) {
  if (state.scriptureCache.has(reference)) return state.scriptureCache.get(reference);
  const url = `https://bible-api.com/${encodeURIComponent(reference)}?translation=cuv`;
  const response = await fetch(url, { signal });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(`找不到經文：${reference}`);
  }
  const result = {
    query: data.reference || reference,
    text: formatFetchedVerses(data.verses) || normalizeScriptureText(data.text),
  };
  state.scriptureCache.set(reference, result);
  return result;
}

async function fetchAndRenderScriptures({ force = false } = {}) {
  const references = normalizeScriptureReferences(els.noteScripture.value);
  if (!references.length) {
    resetScripturePreview();
    return;
  }
  if (!force && els.scripturePreview.dataset.lastRefs === references.join('|')) return;
  if (state.scriptureAbortController) state.scriptureAbortController.abort();
  const controller = new AbortController();
  state.scriptureAbortController = controller;
  setScriptureStatus('正在抓取經文…');
  const fetched = [];
  try {
    for (const reference of references) {
      fetched.push(await fetchScriptureReference(reference, controller.signal));
    }
    els.scripturePreview.dataset.lastRefs = references.join('|');
    els.scripturePreview.dataset.serialized = JSON.stringify(fetched);
    els.scripturePreview.classList.remove('hidden');
    els.scripturePreview.innerHTML = fetched.map(item => `
      <article class="scripture-card">
        <h4>${escapeHtml(item.query)}</h4>
        <div class="scripture-text">${escapeHtml(item.text)}</div>
      </article>
    `).join('');
    setScriptureStatus(`已帶出 ${fetched.length} 處經文。`);
    if (els.scriptureAppendToContent.checked) {
      applyScriptureBlockToNoteContent(fetched);
    }
  } catch (error) {
    if (error.name === 'AbortError') return;
    resetScripturePreview();
    setScriptureStatus(error.message || '抓取經文失敗。', true);
    throw error;
  } finally {
    if (state.scriptureAbortController === controller) state.scriptureAbortController = null;
  }
}

function buildScriptureBlock(items) {
  return items.map(item => `${item.query}\n${item.text}`).join('\n\n');
}

function applyScriptureBlockToNoteContent(items) {
  let content = stripScriptureMarkers(els.noteContent.value || '');
  const scriptureBlock = buildScriptureBlock(items);
  const oldMarkedBlockPattern = /【經文引用開始】[\s\S]*?【經文引用結束】\n*/;
  content = content.replace(oldMarkedBlockPattern, '').trimStart();

  if (state.scriptureLastAppliedBlock) {
    const lastAppliedWithSpacing = `${state.scriptureLastAppliedBlock}\n\n`;
    if (content.startsWith(lastAppliedWithSpacing)) {
      content = content.slice(lastAppliedWithSpacing.length).trimStart();
    } else if (content === state.scriptureLastAppliedBlock) {
      content = '';
    }
  }

  const sameBlockWithSpacing = `${scriptureBlock}\n\n`;
  if (content.startsWith(sameBlockWithSpacing)) {
    content = content.slice(sameBlockWithSpacing.length).trimStart();
  } else if (content === scriptureBlock) {
    content = '';
  }

  const next = content ? `${scriptureBlock}\n\n${content}` : scriptureBlock;
  state.scriptureLastAppliedBlock = scriptureBlock;
  els.noteContent.value = next;
}

function renderNotes() {
  const query = state.noteSearch;
  const filtered = !query ? state.notes : state.notes.filter(note => [note.title, note.scripture_reference, note.summary, note.content].join(' ').toLowerCase().includes(query));
  if (!filtered.length) {
    els.notesList.className = 'list-stack empty-state';
    els.notesList.textContent = '還沒有札記。';
    updateChapterSourceOptions();
    return;
  }
  els.notesList.className = 'list-stack';
  els.notesList.innerHTML = filtered.map(note => `
    <article class="card">
      <h3>${escapeHtml(note.title)}</h3>
      <div class="card-meta">
        <span>${escapeHtml(note.scripture_reference || '未填經文')}</span>
        <span>${escapeHtml(note.category || '未分類')}</span>
        <span>${formatDate(note.updated_at)}</span>
      </div>
      <div>${escapeHtml((note.summary || note.content || '').slice(0, 140))}</div>
      <div class="card-actions">
        <button class="secondary-btn" data-edit-note="${note.id}">編輯</button>
      </div>
    </article>
  `).join('');
  els.notesList.querySelectorAll('[data-edit-note]').forEach(btn => btn.addEventListener('click', () => populateNoteForm(btn.dataset.editNote)));
  updateChapterSourceOptions();
}

function populateNoteForm(noteId) {
  const note = state.notes.find(item => item.id === noteId);
  if (!note) return;
  setView('notes');
  els.noteId.value = note.id;
  els.noteTitle.value = note.title || '';
  els.noteScripture.value = note.scripture_reference || '';
  els.noteCategory.value = note.category || '';
  els.noteTags.value = (note.tags || []).join(', ');
  els.noteSummary.value = note.summary || '';
  els.noteContent.value = stripScriptureMarkers(note.content || '');
  els.deleteNoteBtn.classList.remove('hidden');
  if (note.scripture_reference) {
    fetchAndRenderScriptures({ force: true }).catch(() => setScriptureStatus('經文預覽暫時無法載入。', true));
  } else {
    resetScripturePreview();
  }
}

function clearNoteForm() {
  els.noteForm.reset();
  els.noteId.value = '';
  els.deleteNoteBtn.classList.add('hidden');
  resetScripturePreview();
  els.scriptureAppendToContent.checked = true;
}

async function saveNote() {
  requireUser();
  const payload = {
    id: els.noteId.value || uid('note'),
    user_id: getUserId(),
    title: els.noteTitle.value.trim(),
    scripture_reference: els.noteScripture.value.trim(),
    category: els.noteCategory.value.trim(),
    tags: els.noteTags.value.split(',').map(v => v.trim()).filter(Boolean),
    summary: els.noteSummary.value.trim(),
    content: stripScriptureMarkers(els.noteContent.value.trim()),
    updated_at: nowIso(),
    created_at: els.noteId.value ? (state.notes.find(n => n.id === els.noteId.value)?.created_at || nowIso()) : nowIso(),
  };
  if (!payload.title || !payload.content) throw new Error('請填入標題與內容。');
  if (state.supabase) {
    const { error } = await state.supabase.from('devotion_notes').upsert(payload);
    if (error) throw error;
  } else {
    const notes = loadJson(STORAGE_KEYS.notes, []);
    const idx = notes.findIndex(item => item.id === payload.id && item.user_id === payload.user_id);
    if (idx >= 0) notes[idx] = payload; else notes.unshift(payload);
    saveJson(STORAGE_KEYS.notes, notes);
  }
  clearNoteForm();
  await loadAllData();
  setView('notes');
  showToast('札記已儲存。');
}

async function deleteNote() {
  requireUser();
  const noteId = els.noteId.value;
  if (!noteId) return;
  if (!confirm('確定要刪除這篇札記嗎？')) return;
  if (state.supabase) {
    const { error } = await state.supabase.from('devotion_notes').delete().eq('id', noteId).eq('user_id', getUserId());
    if (error) throw error;
  } else {
    const notes = loadJson(STORAGE_KEYS.notes, []).filter(item => !(item.id === noteId && item.user_id === getUserId()));
    saveJson(STORAGE_KEYS.notes, notes);
  }
  clearNoteForm();
  await loadAllData();
  showToast('札記已刪除。');
}

function renderBooks() {
  if (!state.books.length) {
    els.booksList.className = 'list-stack empty-state';
    els.booksList.textContent = '還沒有書籍專案。';
    return;
  }
  els.booksList.className = 'list-stack';
  els.booksList.innerHTML = state.books.map(book => `
    <article class="card ${book.id === state.selectedBookId ? 'selected' : ''}">
      <h3>${escapeHtml(book.title || '未命名書籍')}</h3>
      <div class="card-meta">
        <span>${escapeHtml(book.author_name || '未填作者')}</span>
        <span>${escapeHtml(TEMPLATE_LABELS[book.template_code] || '模板')}</span>
        <span>${(book.chapters || []).length} 章</span>
      </div>
      <div>${escapeHtml((book.description || '').slice(0, 120) || '尚未填寫書籍簡介')}</div>
      <div class="card-actions">
        <button class="secondary-btn" data-edit-book="${book.id}">編輯</button>
        <button class="ghost-btn" data-select-book="${book.id}">選取</button>
      </div>
    </article>
  `).join('');
  els.booksList.querySelectorAll('[data-edit-book]').forEach(btn => btn.addEventListener('click', () => populateBookForm(btn.dataset.editBook)));
  els.booksList.querySelectorAll('[data-select-book]').forEach(btn => btn.addEventListener('click', () => { state.selectedBookId = btn.dataset.selectBook; refreshUi(); }));
}

function populateBookForm(bookId) {
  const book = state.books.find(item => item.id === bookId);
  if (!book) return;
  setView('books');
  state.selectedBookId = book.id;
  els.bookId.value = book.id;
  els.bookTitle.value = book.title || '';
  els.bookSubtitle.value = book.subtitle || '';
  els.bookAuthor.value = book.author_name || '';
  els.bookDescription.value = book.description || '';
  els.bookTemplate.value = book.template_code || 'devotion';
  els.bookLanguage.value = book.language || 'zh-Hant';
  els.bookPreface.value = book.preface || '';
  els.bookAfterword.value = book.afterword || '';
  els.bookTocEnabled.checked = !!book.toc_enabled;
  els.deleteBookBtn.classList.remove('hidden');
  refreshUi();
}

function clearBookForm() {
  els.bookForm.reset();
  els.bookId.value = '';
  els.bookLanguage.value = 'zh-Hant';
  els.bookTemplate.value = 'devotion';
  els.bookTocEnabled.checked = true;
  els.deleteBookBtn.classList.add('hidden');
}

async function saveBook() {
  requireUser();
  const existing = state.books.find(item => item.id === els.bookId.value);
  const coverDataUrl = els.bookCover.files[0] ? await fileToDataUrl(els.bookCover.files[0]) : (existing?.cover_data_url || '');
  const payload = {
    id: els.bookId.value || uid('book'),
    user_id: getUserId(),
    title: els.bookTitle.value.trim(),
    subtitle: els.bookSubtitle.value.trim(),
    author_name: els.bookAuthor.value.trim(),
    description: els.bookDescription.value.trim(),
    template_code: els.bookTemplate.value,
    language: els.bookLanguage.value.trim() || 'zh-Hant',
    cover_data_url: coverDataUrl,
    preface: els.bookPreface.value.trim(),
    afterword: els.bookAfterword.value.trim(),
    toc_enabled: els.bookTocEnabled.checked,
    chapters: existing?.chapters || [],
    updated_at: nowIso(),
    created_at: existing?.created_at || nowIso(),
  };
  if (!payload.title) throw new Error('請填入書名。');
  if (state.supabase) {
    const dbPayload = { ...payload, chapters: JSON.stringify(payload.chapters) };
    const { error } = await state.supabase.from('book_projects').upsert(dbPayload);
    if (error) throw error;
  } else {
    const books = loadJson(STORAGE_KEYS.books, []);
    const idx = books.findIndex(item => item.id === payload.id && item.user_id === payload.user_id);
    if (idx >= 0) books[idx] = payload; else books.unshift(payload);
    saveJson(STORAGE_KEYS.books, books);
  }
  clearBookForm();
  state.selectedBookId = payload.id;
  await loadAllData();
  setView('books');
  showToast('書籍已儲存。');
}

async function deleteBook() {
  requireUser();
  const bookId = els.bookId.value;
  if (!bookId) return;
  if (!confirm('確定要刪除這本書嗎？')) return;
  if (state.supabase) {
    const { error } = await state.supabase.from('book_projects').delete().eq('id', bookId).eq('user_id', getUserId());
    if (error) throw error;
  } else {
    const books = loadJson(STORAGE_KEYS.books, []).filter(item => !(item.id === bookId && item.user_id === getUserId()));
    saveJson(STORAGE_KEYS.books, books);
  }
  clearBookForm();
  if (state.selectedBookId === bookId) state.selectedBookId = null;
  await loadAllData();
  showToast('書籍已刪除。');
}

function updateChapterSourceOptions() {
  els.chapterSourceNote.innerHTML = state.notes.map(note => `<option value="${note.id}">${escapeHtml(note.title)}</option>`).join('') || '<option value="">請先建立札記</option>';
}

function getSelectedBook() {
  return state.books.find(book => book.id === state.selectedBookId) || null;
}

function renderSelectedBookPanel() {
  const book = getSelectedBook();
  const chapterCount = (book?.chapters || []).length;
  els.statusCurrentBook.textContent = book?.title || '未選取';
  els.statusChapterCount.textContent = String(chapterCount);
  els.selectedBookEmpty.classList.toggle('hidden', !!book);
  els.selectedBookPanel.classList.toggle('hidden', !book);
  if (!book) return;
  updateChapterSourceOptions();
  els.bookCoverPreview.innerHTML = `
    ${book.cover_data_url ? `<img src="${book.cover_data_url}" alt="封面" />` : ''}
    <div class="cover-overlay">
      <div class="caption">${escapeHtml(TEMPLATE_LABELS[book.template_code] || '模板')}</div>
      <h2>${escapeHtml(book.title)}</h2>
      <div>${escapeHtml(book.subtitle || '')}</div>
      <div class="caption">${escapeHtml(book.author_name || '')}</div>
    </div>
  `;
  renderChaptersList(book);
}

function renderChaptersList(book) {
  const chapters = book.chapters || [];
  if (!chapters.length) {
    els.chaptersList.className = 'list-stack empty-state';
    els.chaptersList.textContent = '尚未加入任何章節。';
    return;
  }
  els.chaptersList.className = 'list-stack';
  els.chaptersList.innerHTML = chapters.map((chapter, index) => `
    <div class="chapter-item">
      <div class="chapter-title-row">
        <input value="${escapeHtml(chapter.chapter_title || '')}" data-chapter-title="${chapter.id}" />
        <label class="checkbox-row"><input type="checkbox" data-chapter-toc="${chapter.id}" ${chapter.include_in_toc ? 'checked' : ''} /><span>列入目錄</span></label>
      </div>
      <div class="caption">來源札記：${escapeHtml(getNoteById(chapter.source_note_id)?.title || '手動章節')}</div>
      <div class="chapter-controls">
        <button class="ghost-btn small" data-move-up="${chapter.id}" ${index === 0 ? 'disabled' : ''}>上移</button>
        <button class="ghost-btn small" data-move-down="${chapter.id}" ${index === chapters.length - 1 ? 'disabled' : ''}>下移</button>
        <button class="danger-btn small" data-remove-chapter="${chapter.id}">移除</button>
      </div>
    </div>
  `).join('');
  els.chaptersList.querySelectorAll('[data-chapter-title]').forEach(input => input.addEventListener('change', event => updateChapterTitle(event.target.dataset.chapterTitle, event.target.value).catch(handleError)));
  els.chaptersList.querySelectorAll('[data-chapter-toc]').forEach(input => input.addEventListener('change', event => updateChapterToc(event.target.dataset.chapterToc, event.target.checked).catch(handleError)));
  els.chaptersList.querySelectorAll('[data-move-up]').forEach(btn => btn.addEventListener('click', () => moveChapter(btn.dataset.moveUp, -1).catch(handleError)));
  els.chaptersList.querySelectorAll('[data-move-down]').forEach(btn => btn.addEventListener('click', () => moveChapter(btn.dataset.moveDown, 1).catch(handleError)));
  els.chaptersList.querySelectorAll('[data-remove-chapter]').forEach(btn => btn.addEventListener('click', () => removeChapter(btn.dataset.removeChapter).catch(handleError)));
}

function getNoteById(noteId) {
  return state.notes.find(note => note.id === noteId) || null;
}

async function addChapterFromSelectedNote() {
  requireUser();
  const book = getSelectedBook();
  if (!book) throw new Error('請先選取一本書。');
  const noteId = els.chapterSourceNote.value;
  const note = getNoteById(noteId);
  if (!note) throw new Error('請先選取要加入的札記。');
  const nextChapters = [...(book.chapters || []), {
    id: uid('chapter'),
    source_note_id: note.id,
    chapter_title: note.title,
    include_in_toc: true,
  }];
  await persistBookChanges(book.id, { chapters: nextChapters });
  showToast('章節已加入。');
}

async function updateChapterTitle(chapterId, title) {
  const book = getSelectedBook();
  if (!book) return;
  const nextChapters = book.chapters.map(chapter => chapter.id === chapterId ? { ...chapter, chapter_title: title } : chapter);
  await persistBookChanges(book.id, { chapters: nextChapters });
}

async function updateChapterToc(chapterId, checked) {
  const book = getSelectedBook();
  if (!book) return;
  const nextChapters = book.chapters.map(chapter => chapter.id === chapterId ? { ...chapter, include_in_toc: checked } : chapter);
  await persistBookChanges(book.id, { chapters: nextChapters });
}

async function moveChapter(chapterId, direction) {
  const book = getSelectedBook();
  if (!book) return;
  const chapters = [...book.chapters];
  const index = chapters.findIndex(ch => ch.id === chapterId);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= chapters.length) return;
  [chapters[index], chapters[target]] = [chapters[target], chapters[index]];
  await persistBookChanges(book.id, { chapters });
}

async function removeChapter(chapterId) {
  const book = getSelectedBook();
  if (!book) return;
  const nextChapters = book.chapters.filter(ch => ch.id !== chapterId);
  await persistBookChanges(book.id, { chapters: nextChapters });
  showToast('章節已移除。');
}

async function persistBookChanges(bookId, changes) {
  const book = state.books.find(item => item.id === bookId);
  if (!book) return;
  const payload = { ...book, ...changes, updated_at: nowIso() };
  if (state.supabase) {
    const { error } = await state.supabase.from('book_projects').upsert({ ...payload, chapters: JSON.stringify(payload.chapters) });
    if (error) throw error;
  } else {
    const books = loadJson(STORAGE_KEYS.books, []);
    const idx = books.findIndex(item => item.id === bookId && item.user_id === getUserId());
    if (idx >= 0) books[idx] = payload;
    saveJson(STORAGE_KEYS.books, books);
  }
  await loadAllData();
}

async function createSnapshotForSelectedBook() {
  requireUser();
  const book = getSelectedBook();
  if (!book) throw new Error('請先選取一本書。');
  const snapshot = buildBookSnapshot(book);
  const record = {
    id: uid('snapshot'),
    user_id: getUserId(),
    book_project_id: book.id,
    created_at: nowIso(),
    snapshot_json: snapshot,
  };
  if (state.supabase) {
    const { error } = await state.supabase.from('book_snapshots').insert({ ...record, snapshot_json: JSON.stringify(record.snapshot_json) });
    if (error) throw error;
  } else {
    const snapshots = loadJson(STORAGE_KEYS.snapshots, []);
    snapshots.unshift(record);
    saveJson(STORAGE_KEYS.snapshots, snapshots);
  }
  await loadAllData();
  showToast('快照已建立。');
}

function buildBookSnapshot(book) {
  return {
    exported_at: nowIso(),
    book: {
      title: book.title,
      subtitle: book.subtitle,
      author_name: book.author_name,
      description: book.description,
      template_code: book.template_code,
      language: book.language,
      preface: book.preface,
      afterword: book.afterword,
      toc_enabled: book.toc_enabled,
      cover_data_url: book.cover_data_url,
    },
    chapters: (book.chapters || []).map(chapter => {
      const note = getNoteById(chapter.source_note_id);
      return {
        id: chapter.id,
        chapter_title: chapter.chapter_title,
        include_in_toc: chapter.include_in_toc,
        source_note_id: chapter.source_note_id,
        note_title: note?.title || '',
        scripture_reference: note?.scripture_reference || '',
        content: note?.content || '',
      };
    }),
  };
}

function renderSnapshots() {
  if (!state.snapshots.length) {
    els.snapshotsList.className = 'list-stack empty-state';
    els.snapshotsList.textContent = '還沒有快照。';
    return;
  }
  els.snapshotsList.className = 'list-stack';
  els.snapshotsList.innerHTML = state.snapshots.map(snapshot => {
    const title = snapshot.snapshot_json?.book?.title || '未命名書籍';
    const chapterCount = snapshot.snapshot_json?.chapters?.length || 0;
    return `
      <article class="card">
        <h3>${escapeHtml(title)}</h3>
        <div class="card-meta"><span>${formatDate(snapshot.created_at)}</span><span>${chapterCount} 章</span></div>
        <div>${escapeHtml(snapshot.snapshot_json?.book?.description || '快照內容')}</div>
      </article>
    `;
  }).join('');
}

function setView(viewName) {
  const titleMap = {
    dashboard: ['總覽', '先登入，再建立札記與書籍專案。'],
    notes: ['札記庫', '建立、編輯並整理靈修札記。'],
    books: ['書籍專案', '設定書籍並編排章節與匯出。'],
    snapshots: ['快照備份', '查看每次建立的書籍快照。'],
  };
  els.navLinks.forEach(link => link.classList.toggle('active', link.dataset.view === viewName));
  els.views.forEach(view => view.classList.toggle('active', view.id === `view-${viewName}`));
  els.viewTitle.textContent = titleMap[viewName][0];
  els.viewSubtitle.textContent = titleMap[viewName][1];
}

function formatDate(value) {
  if (!value) return '未記錄';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function handleError(error) {
  console.error(error);
  showToast(error?.message || '發生錯誤，請檢查設定。');
}

async function exportSelectedBookEpub() {
  requireUser();
  const book = getSelectedBook();
  if (!book) throw new Error('請先選取一本書。');
  if (!book.chapters?.length) throw new Error('至少要有一個章節才能匯出。');
  const snapshot = buildBookSnapshot(book);
  const epubBlob = await buildEpub(snapshot);
  downloadBlob(`${book.title || 'book'}.epub`, epubBlob);
  showToast('EPUB 已匯出。');
}

async function buildEpub(snapshot) {
  const book = snapshot.book;
  const chapters = snapshot.chapters;
  const files = [];
  const css = buildTemplateCss(book.template_code);
  const uidValue = crypto.randomUUID();
  const coverImage = snapshot.book.cover_data_url ? dataUrlToBytes(snapshot.book.cover_data_url) : null;
  const coverExt = coverImage?.mime.includes('png') ? 'png' : 'jpg';

  files.push({ name: 'mimetype', content: encoder.encode('application/epub+zip'), store: true });
  files.push({ name: 'META-INF/container.xml', content: encoder.encode(containerXml()) });
  files.push({ name: 'OEBPS/styles/book.css', content: encoder.encode(css) });
  files.push({ name: 'OEBPS/nav.xhtml', content: encoder.encode(navXhtml(book, chapters)) });
  files.push({ name: 'OEBPS/toc.ncx', content: encoder.encode(tocNcx(book, chapters, uidValue)) });
  files.push({ name: 'OEBPS/text/title.xhtml', content: encoder.encode(titlePage(book)) });
  if (book.preface) files.push({ name: 'OEBPS/text/preface.xhtml', content: encoder.encode(simpleSection('前言', book.preface)) });
  chapters.forEach((chapter, index) => {
    files.push({ name: `OEBPS/text/chapter-${index + 1}.xhtml`, content: encoder.encode(chapterXhtml(chapter, index + 1)) });
  });
  if (book.afterword) files.push({ name: 'OEBPS/text/afterword.xhtml', content: encoder.encode(simpleSection('後記', book.afterword)) });
  if (coverImage) files.push({ name: `OEBPS/images/cover.${coverExt}`, content: coverImage.bytes });
  files.push({ name: 'OEBPS/content.opf', content: encoder.encode(contentOpf(book, chapters, uidValue, !!coverImage, coverExt)) });
  return zipStore(files);
}

const encoder = new TextEncoder();

function buildTemplateCss(templateCode) {
  const theme = {
    devotion: ['#f6f0e6', '#44362b'],
    sermon: ['#f0f3f7', '#253648'],
    testimony: ['#f7ecef', '#5b2f3a'],
  }[templateCode] || ['#f6f0e6', '#44362b'];
  return `body{font-family:"Noto Serif TC","PingFang TC",serif;line-height:1.8;color:#222;margin:0;padding:0;}main{padding:1.6em;}h1,h2{color:${theme[1]};}a{color:${theme[1]};text-decoration:none;}nav ol{padding-left:1.2em;}.title-page{background:${theme[0]};padding:2em;border-radius:18px;margin-top:2em;} .meta{color:#666;font-size:.95em;} .scripture{margin:.8em 0;color:#555;font-style:italic;} p{margin:0 0 1em;} `;
}

function containerXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
}

function titlePage(book) {
  return xhtmlWrap('title', `
    <main>
      <div class="title-page">
        <h1>${escapeHtml(book.title)}</h1>
        ${book.subtitle ? `<p class="meta">${escapeHtml(book.subtitle)}</p>` : ''}
        ${book.author_name ? `<p class="meta">作者：${escapeHtml(book.author_name)}</p>` : ''}
        ${book.description ? `<p>${paragraphs(book.description)}</p>` : ''}
      </div>
    </main>
  `);
}
function simpleSection(title, content) {
  return xhtmlWrap(title, `<main><h1>${escapeHtml(title)}</h1>${paragraphs(content)}</main>`);
}
function chapterXhtml(chapter, order) {
  return xhtmlWrap(chapter.chapter_title, `
    <main>
      <h1>第 ${order} 章　${escapeHtml(chapter.chapter_title)}</h1>
      ${chapter.scripture_reference ? `<p class="scripture">${escapeHtml(chapter.scripture_reference)}</p>` : ''}
      ${paragraphs(chapter.content || '')}
    </main>
  `);
}
function navXhtml(book, chapters) {
  const items = [];
  items.push(`<li><a href="text/title.xhtml">書名頁</a></li>`);
  if (book.preface) items.push(`<li><a href="text/preface.xhtml">前言</a></li>`);
  chapters.filter(ch => ch.include_in_toc).forEach((chapter, index) => items.push(`<li><a href="text/chapter-${index + 1}.xhtml">${escapeHtml(chapter.chapter_title)}</a></li>`));
  if (book.afterword) items.push(`<li><a href="text/afterword.xhtml">後記</a></li>`);
  return xhtmlWrap('目錄', `<main><nav epub:type="toc" id="toc"><h1>目錄</h1><ol>${items.join('')}</ol></nav></main>`, true, 'styles/book.css');
}
function tocNcx(book, chapters, uidValue) {
  const points = [];
  let playOrder = 1;
  points.push(ncxPoint(playOrder++, '書名頁', 'text/title.xhtml'));
  if (book.preface) points.push(ncxPoint(playOrder++, '前言', 'text/preface.xhtml'));
  chapters.filter(ch => ch.include_in_toc).forEach((chapter, index) => points.push(ncxPoint(playOrder++, chapter.chapter_title, `text/chapter-${index + 1}.xhtml`)));
  if (book.afterword) points.push(ncxPoint(playOrder++, '後記', 'text/afterword.xhtml'));
  return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${uidValue}"/>
  </head>
  <docTitle><text>${escapeHtml(book.title)}</text></docTitle>
  <navMap>${points.join('')}</navMap>
</ncx>`;
}
function ncxPoint(playOrder, title, src) {
  return `<navPoint id="navPoint-${playOrder}" playOrder="${playOrder}"><navLabel><text>${escapeHtml(title)}</text></navLabel><content src="${src}"/></navPoint>`;
}
function contentOpf(book, chapters, uidValue, hasCover, coverExt) {
  const manifest = [
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`,
    `<item id="css" href="styles/book.css" media-type="text/css"/>`,
    `<item id="title" href="text/title.xhtml" media-type="application/xhtml+xml"/>`,
  ];
  const spine = ['<itemref idref="nav" linear="no"/>', '<itemref idref="title"/>'];
  if (book.preface) { manifest.push(`<item id="preface" href="text/preface.xhtml" media-type="application/xhtml+xml"/>`); spine.push('<itemref idref="preface"/>'); }
  chapters.forEach((chapter, index) => { manifest.push(`<item id="chapter-${index + 1}" href="text/chapter-${index + 1}.xhtml" media-type="application/xhtml+xml"/>`); spine.push(`<itemref idref="chapter-${index + 1}"/>`); });
  if (book.afterword) { manifest.push(`<item id="afterword" href="text/afterword.xhtml" media-type="application/xhtml+xml"/>`); spine.push('<itemref idref="afterword"/>'); }
  if (hasCover) manifest.push(`<item id="cover-image" href="images/cover.${coverExt}" media-type="image/${coverExt === 'png' ? 'png' : 'jpeg'}" properties="cover-image"/>`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<package version="3.0" unique-identifier="bookid" xmlns="http://www.idpf.org/2007/opf">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${uidValue}</dc:identifier>
    <dc:title>${escapeHtml(book.title)}</dc:title>
    <dc:language>${escapeHtml(book.language || 'zh-Hant')}</dc:language>
    <dc:creator>${escapeHtml(book.author_name || 'Unknown')}</dc:creator>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}</meta>
  </metadata>
  <manifest>${manifest.join('')}</manifest>
  <spine toc="ncx">${spine.join('')}</spine>
</package>`;
}
function xhtmlWrap(title, body, includeEpubNs = false, cssPath = "../styles/book.css") {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" ${includeEpubNs ? 'xmlns:epub="http://www.idpf.org/2007/ops"' : ''} lang="zh-Hant" xml:lang="zh-Hant">
  <head>
    <meta charset="utf-8"/>
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" type="text/css" href="${cssPath}"/>
  </head>
  <body>${body}</body>
</html>`;
}
function paragraphs(text) {
  return String(text || '').split(/\n{2,}/).map(part => `<p>${escapeHtml(part).replaceAll('\n', '<br/>')}</p>`).join('');
}
function dataUrlToBytes(dataUrl) {
  const [meta, data] = dataUrl.split(',');
  const mime = meta.match(/data:(.*?);base64/)?.[1] || 'image/jpeg';
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { mime, bytes };
}

async function zipStore(files) {
  let offset = 0;
  const localParts = [];
  const centralParts = [];
  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const content = ensureBytes(file.content);
    const crc = crc32(content);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint16(12, 0, true);
    localView.setUint32(14, crc >>> 0, true);
    localView.setUint32(18, content.length, true);
    localView.setUint32(22, content.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localView.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);
    localParts.push(localHeader, content);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0, true);
    centralView.setUint32(16, crc >>> 0, true);
    centralView.setUint32(20, content.length, true);
    centralView.setUint32(24, content.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);
    centralParts.push(centralHeader);
    offset += localHeader.length + content.length;
  }
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const centralOffset = offset;
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, centralOffset, true);
  endView.setUint16(20, 0, true);
  return new Blob([...localParts, ...centralParts, end], { type: 'application/epub+zip' });
}
function ensureBytes(content) {
  return content instanceof Uint8Array ? content : encoder.encode(String(content));
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c >>> 0;
  }
  return table;
})();
function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

bootstrap().catch(handleError);
