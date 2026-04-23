const STORAGE_KEYS = {
  config: 'devotion-app-config',
  user: 'devotion-app-local-user',
  notes: 'devotion-app-notes',
  books: 'devotion-app-books',
  snapshots: 'devotion-app-snapshots',
  accounts: 'devotion-app-local-accounts',
  deviceId: 'devotion-app-device-id',
};

const TEMPLATE_LABELS = {
  devotion: '靈修札記版',
  sermon: '講章整理版',
  testimony: '見證合集版',
};

const DEFAULT_BOOK_LANGUAGE = 'mul';

const DEFAULT_CONFIG = {
  supabaseUrl: 'https://kknyldzvgvuewkpwkwyj.supabase.co',
  supabaseAnonKey: 'sb_publishable_7dOBDTLOfsppsElw5tTIrQ_luCT8vVh',
};

function buildMergedConfig(raw = {}) {
  return {
    supabaseUrl: String(raw.supabaseUrl || DEFAULT_CONFIG.supabaseUrl || '').trim(),
    supabaseAnonKey: String(raw.supabaseAnonKey || DEFAULT_CONFIG.supabaseAnonKey || '').trim(),
  };
}

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
  selectedNotePreview: document.getElementById('selected-note-preview'),
  addChapterBtn: document.getElementById('add-chapter-btn'),
  tocPreviewList: document.getElementById('toc-preview-list'),
  chaptersList: document.getElementById('chapters-list'),
  createSnapshotBtn: document.getElementById('create-snapshot-btn'),
  exportEpubBtn: document.getElementById('export-epub-btn'),
  snapshotsList: document.getElementById('snapshots-list'),
  statusStorage: document.getElementById('status-storage'),
  statusSync: document.getElementById('status-sync'),
  statusCurrentBook: document.getElementById('status-current-book'),
  statusChapterCount: document.getElementById('status-chapter-count'),
  cloudSyncPanel: document.getElementById('cloud-sync-panel'),
  syncStatusText: document.getElementById('sync-status-text'),
  syncLastTime: document.getElementById('sync-last-time'),
  syncDetailText: document.getElementById('sync-detail-text'),
  forceSyncBtn: document.getElementById('force-sync-btn'),
  pushLocalToCloudBtn: document.getElementById('push-local-to-cloud-btn'),
  downloadBackupBtn: document.getElementById('download-backup-btn'),
  toast: document.getElementById('toast'),
  supportBtn: document.getElementById('support-btn'),
  supportModal: document.getElementById('support-modal'),
  supportModalBackdrop: document.getElementById('support-modal-backdrop'),
  closeSupportModal: document.getElementById('close-support-modal'),
  authGate: document.getElementById('auth-gate'),
  authSettingsBtn: document.getElementById('auth-settings-btn'),
  authMenuBtn: document.getElementById('auth-menu-btn'),
  openRegisterBtn: document.getElementById('open-register-btn'),
  openLoginBtn: document.getElementById('open-login-btn'),
  authInlinePanel: document.getElementById('auth-inline-panel'),
  authInlineTitle: document.getElementById('auth-inline-title'),
  authInlineHint: document.getElementById('auth-inline-hint'),
  closeAuthInlineBtn: document.getElementById('close-auth-inline-btn'),
  authInlineBackdrop: document.getElementById('auth-inline-backdrop'),
  gateAuthEmail: document.getElementById('gate-auth-email'),
  gateAuthPassword: document.getElementById('gate-auth-password'),
  gateSubmitBtn: document.getElementById('gate-submit-btn'),
  gateMagicLinkBtn: document.getElementById('gate-magic-link-btn'),
  authFeatureSheet: document.getElementById('auth-feature-sheet'),
  authSettingsSheet: document.getElementById('auth-settings-sheet'),
  closeAuthSettingsBtn: document.getElementById('close-auth-settings-btn'),
  gateSupabaseUrl: document.getElementById('gate-supabase-url'),
  gateSupabaseAnonKey: document.getElementById('gate-supabase-anon-key'),
  gateSaveConfigBtn: document.getElementById('gate-save-config-btn'),
  gateClearConfigBtn: document.getElementById('gate-clear-config-btn'),
};

const state = {
  config: buildMergedConfig(loadJson(STORAGE_KEYS.config, {})),
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
  scriptureAppliedBlocks: [],
  authInlineMode: 'register',
  deviceId: getOrCreateDeviceId(),
  realtimeChannel: null,
  syncStatus: '本機模式',
  syncDetail: '目前資料只保存在這台裝置。',
  lastSyncAt: '',
  syncReloadTimer: null,
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
function getOrCreateDeviceId() {
  let deviceId = localStorage.getItem(STORAGE_KEYS.deviceId);
  if (!deviceId) {
    deviceId = uid('device');
    localStorage.setItem(STORAGE_KEYS.deviceId, deviceId);
  }
  return deviceId;
}
function setSyncState({ status, detail, at } = {}) {
  if (typeof status === 'string') state.syncStatus = status;
  if (typeof detail === 'string') state.syncDetail = detail;
  if (typeof at === 'string') state.lastSyncAt = at;
}
function markCloudSynced(detail = '雲端資料已同步。') {
  setSyncState({ status: '已同步', detail, at: nowIso() });
}
function teardownCloudRealtime() {
  if (!state.realtimeChannel || !state.supabase) {
    state.realtimeChannel = null;
    return;
  }
  try {
    state.supabase.removeChannel(state.realtimeChannel);
  } catch (error) {
    console.warn('removeChannel failed', error);
  }
  state.realtimeChannel = null;
}
function scheduleCloudReload(reason = '雲端更新') {
  clearTimeout(state.syncReloadTimer);
  state.syncReloadTimer = setTimeout(() => {
    loadAllData({ silent: true, syncReason: reason }).catch(handleError);
  }, 450);
}
function setupCloudRealtime() {
  teardownCloudRealtime();
  if (!(state.supabase && state.currentUser)) return;
  const userId = state.currentUser.id;
  const channel = state.supabase.channel(`devotion-sync-${userId}`);
  ['devotion_notes', 'book_projects', 'book_snapshots'].forEach((table) => {
    channel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table,
      filter: `user_id=eq.${userId}`,
    }, () => scheduleCloudReload('其他裝置有更新，已重新同步。'));
  });
  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      setSyncState({ status: '即時同步中', detail: '已連線雲端，資料會自動保持同步。' });
      refreshUi();
    }
    if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      setSyncState({ status: '同步異常', detail: '雲端同步暫時不穩，請稍後再試或按立即同步。' });
      refreshUi();
    }
  });
  state.realtimeChannel = channel;
}
function collectMatchingLocalDataForCloudUser() {
  const email = String(state.currentUser?.email || '').trim().toLowerCase();
  if (!email) return { notes: [], books: [], snapshots: [], localUserId: null };
  const localAccount = findLocalAccountByEmail(email);
  const localUserId = localAccount?.id || null;
  if (!localUserId) return { notes: [], books: [], snapshots: [], localUserId: null };
  return {
    localUserId,
    notes: loadJson(STORAGE_KEYS.notes, []).filter(item => item.user_id === localUserId),
    books: loadJson(STORAGE_KEYS.books, []).filter(item => item.user_id === localUserId),
    snapshots: loadJson(STORAGE_KEYS.snapshots, []).filter(item => item.user_id === localUserId),
  };
}
function isIncomingNewer(localItem, remoteItem, timeField = 'updated_at') {
  if (!remoteItem) return true;
  const localTime = new Date(localItem?.[timeField] || localItem?.created_at || 0).getTime();
  const remoteTime = new Date(remoteItem?.[timeField] || remoteItem?.created_at || 0).getTime();
  return localTime >= remoteTime;
}
async function uploadLocalDataToCloud() {
  requireUser();
  if (!state.supabase) throw new Error('請先完成 Supabase 設定並登入同一個雲端帳號。');
  const localPack = collectMatchingLocalDataForCloudUser();
  if (!localPack.localUserId) throw new Error('這台裝置找不到同 Email 的本機資料可上傳。');

  const remoteNotes = new Map(state.notes.map(item => [item.id, item]));
  const remoteBooks = new Map(state.books.map(item => [item.id, item]));
  const remoteSnapshots = new Map(state.snapshots.map(item => [item.id, item]));

  const notesToUpload = localPack.notes
    .filter(item => isIncomingNewer(item, remoteNotes.get(item.id)))
    .map(item => ({ ...item, user_id: state.currentUser.id }));
  const booksToUpload = localPack.books
    .filter(item => isIncomingNewer(item, remoteBooks.get(item.id)))
    .map(item => ({
      ...item,
      user_id: state.currentUser.id,
      language: resolveBookLanguage(item.language),
      chapters: JSON.stringify(item.chapters || []),
    }));
  const snapshotsToUpload = localPack.snapshots
    .filter(item => !remoteSnapshots.has(item.id))
    .map(item => ({
      ...item,
      user_id: state.currentUser.id,
      snapshot_json: JSON.stringify(item.snapshot_json || null),
    }));

  if (!notesToUpload.length && !booksToUpload.length && !snapshotsToUpload.length) {
    throw new Error('本機沒有比雲端更新的資料可上傳。');
  }

  setSyncState({ status: '同步中', detail: '正在把本機資料上傳到雲端…' });
  refreshUi();
  if (notesToUpload.length) {
    const { error } = await state.supabase.from('devotion_notes').upsert(notesToUpload);
    if (error) throw error;
  }
  if (booksToUpload.length) {
    const { error } = await state.supabase.from('book_projects').upsert(booksToUpload);
    if (error) throw error;
  }
  if (snapshotsToUpload.length) {
    const { error } = await state.supabase.from('book_snapshots').upsert(snapshotsToUpload);
    if (error) throw error;
  }
  await loadAllData({ silent: true, syncReason: '本機資料已上傳到雲端。' });
  showToast(`已上傳：札記 ${notesToUpload.length}、書籍 ${booksToUpload.length}、快照 ${snapshotsToUpload.length}`);
}
function downloadBackupJson() {
  requireUser();
  const payload = {
    exported_at: nowIso(),
    device_id: state.deviceId,
    user: { id: state.currentUser?.id, email: state.currentUser?.email || '' },
    notes: state.notes,
    books: state.books,
    snapshots: state.snapshots,
  };
  const stamp = nowIso().slice(0, 19).replace(/[T:]/g, '-');
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  downloadBlob(`devotion-backup-${stamp}.json`, blob);
  showToast('備份 JSON 已下載。');
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
function loadLocalAccounts() {
  return loadJson(STORAGE_KEYS.accounts, []);
}
function saveLocalAccounts(accounts) {
  saveJson(STORAGE_KEYS.accounts, accounts);
}
function findLocalAccountByEmail(email = '') {
  const normalized = email.trim().toLowerCase();
  return loadLocalAccounts().find(account => String(account.email || '').trim().toLowerCase() === normalized) || null;
}
function sanitizeLocalUser(account) {
  if (!account) return null;
  return { id: account.id, email: account.email, mode: 'local' };
}
function syncConfigInputs() {
  const { supabaseUrl = '', supabaseAnonKey = '' } = state.config || {};
  if (els.supabaseUrl) els.supabaseUrl.value = supabaseUrl;
  if (els.supabaseAnonKey) els.supabaseAnonKey.value = supabaseAnonKey;
  if (els.gateSupabaseUrl) els.gateSupabaseUrl.value = supabaseUrl;
  if (els.gateSupabaseAnonKey) els.gateSupabaseAnonKey.value = supabaseAnonKey;
}
function syncAuthInputs({ email = '', password = '' } = {}) {
  if (typeof email === 'string') {
    if (els.authEmail) els.authEmail.value = email;
    if (els.gateAuthEmail) els.gateAuthEmail.value = email;
  }
  if (typeof password === 'string') {
    if (els.authPassword) els.authPassword.value = password;
    if (els.gateAuthPassword) els.gateAuthPassword.value = password;
  }
}
function getAuthCredentials() {
  const gateEmail = els.gateAuthEmail?.value?.trim() || '';
  const gatePassword = els.gateAuthPassword?.value?.trim() || '';
  const sidebarEmail = els.authEmail?.value?.trim() || '';
  const sidebarPassword = els.authPassword?.value?.trim() || '';
  const email = gateEmail || sidebarEmail;
  const password = gatePassword || sidebarPassword;
  syncAuthInputs({ email, password });
  return { email, password };
}
function openAuthInline(mode = 'register') {
  state.authInlineMode = mode;
  const isRegister = mode === 'register';
  els.authInlinePanel?.classList.remove('hidden');
  els.authInlinePanel?.setAttribute('aria-hidden', 'false');
  if (els.authInlineTitle) els.authInlineTitle.textContent = isRegister ? '建立帳戶' : '登入';
  const intro = document.getElementById('auth-inline-intro');
  if (intro) intro.textContent = isRegister
    ? '輸入 Email 與密碼後即可建立帳戶。'
    : '輸入 Email 與密碼後即可登入。';
  if (els.gateSubmitBtn) {
    els.gateSubmitBtn.textContent = isRegister ? '建立帳戶' : '登入';
    els.gateSubmitBtn.classList.toggle('secondary-btn', !isRegister);
    els.gateSubmitBtn.classList.toggle('primary-btn', isRegister);
  }
  els.gateAuthEmail?.focus();
}
function closeAuthInline() {
  els.authInlinePanel?.classList.add('hidden');
  els.authInlinePanel?.setAttribute('aria-hidden', 'true');
}
function toggleAuthFeatures() {
  els.authFeatureSheet?.classList.toggle('hidden');
}
function openAuthSettings() {
  syncConfigInputs();
  els.authSettingsSheet?.classList.remove('hidden');
}
function closeAuthSettings() {
  els.authSettingsSheet?.classList.add('hidden');
}
async function applyConnectionSettings({ supabaseUrl = '', supabaseAnonKey = '' } = {}, successMessage = '') {
  teardownCloudRealtime();

  const overrideConfig = {
    supabaseUrl: supabaseUrl.trim(),
    supabaseAnonKey: supabaseAnonKey.trim(),
  };

  saveJson(STORAGE_KEYS.config, overrideConfig);
  state.config = buildMergedConfig(overrideConfig);

  syncConfigInputs();
  initSupabase();

  if (state.supabase) {
    const { data } = await state.supabase.auth.getSession();
    state.currentUser = data.session?.user || null;
    if (state.currentUser) setupCloudRealtime();
    if (!state.currentUser) {
      setSyncState({ status: '尚未登入', detail: '雲端已啟用，但目前還沒有登入帳號。', at: '' });
    }
  } else {
    state.currentUser = getLocalUser();
    setSyncState({ status: '本機模式', detail: '目前資料只保存在這台裝置。', at: '' });
  }

  await loadAllData({ silent: true, syncReason: state.supabase ? '雲端設定已更新。' : '已切回本機模式。' });
  refreshUi();
  if (successMessage) showToast(successMessage);
}
async function clearConnectionSettings() {
  teardownCloudRealtime();

  localStorage.removeItem(STORAGE_KEYS.config);
  state.config = buildMergedConfig({});
  syncConfigInputs();
  initSupabase();

  if (state.supabase) {
    const { data } = await state.supabase.auth.getSession();
    state.currentUser = data.session?.user || null;
    if (state.currentUser) setupCloudRealtime();
    if (!state.currentUser) {
      setSyncState({ status: '尚未登入', detail: '已恢復預設雲端設定，請登入帳號。', at: '' });
    }
    await loadAllData({ silent: true, syncReason: '已恢復預設雲端設定。' });
    refreshUi();
    showToast('已恢復預設雲端設定。');
    return;
  }

  state.currentUser = getLocalUser();
  setSyncState({ status: '本機模式', detail: '目前資料只保存在這台裝置。', at: '' });
  await loadAllData({ silent: true, syncReason: '已切回本機模式。' });
  refreshUi();
  showToast('已切回本機模式。');
}

async function bootstrap() {
  syncConfigInputs();
  initSupabase();
  bindEvents();
  if (state.supabase) {
    const { data } = await state.supabase.auth.getSession();
    state.currentUser = data.session?.user || null;
    if (state.currentUser) setupCloudRealtime();
    state.supabase.auth.onAuthStateChange((_event, session) => {
      state.currentUser = session?.user || null;
      teardownCloudRealtime();
      if (state.currentUser) {
        setupCloudRealtime();
      } else if (state.supabase) {
        setSyncState({ status: '尚未登入', detail: '已設定雲端，但目前還沒有登入帳號。', at: '' });
      }
      refreshUi();
      loadAllData({ silent: true, syncReason: session?.user ? '已連線到雲端帳號。' : '已登出雲端帳號。' }).catch(console.error);
    });
  } else {
    state.currentUser = getLocalUser();
    setSyncState({ status: '本機模式', detail: '目前資料只保存在這台裝置。', at: '' });
  }
  await loadAllData({ silent: true });
  refreshUi();
}

function bindEvents() {
  els.toggleConfigBtn.addEventListener('click', () => {
    els.configPanel.classList.toggle('hidden');
    els.toggleConfigBtn.textContent = els.configPanel.classList.contains('hidden') ? '展開' : '收合';
  });
  els.saveConfigBtn.addEventListener('click', () => applyConnectionSettings({
    supabaseUrl: els.supabaseUrl.value,
    supabaseAnonKey: els.supabaseAnonKey.value,
  }, 'Supabase 設定已儲存。').catch(handleError));
  els.clearConfigBtn.addEventListener('click', () => clearConnectionSettings().catch(handleError));

  els.registerBtn.addEventListener('click', () => handleRegister().catch(handleError));
  els.loginBtn.addEventListener('click', () => handleLogin().catch(handleError));
  els.magicLinkBtn.addEventListener('click', () => handleMagicLink().catch(handleError));
  els.authSettingsBtn?.addEventListener('click', openAuthSettings);
  els.closeAuthSettingsBtn?.addEventListener('click', closeAuthSettings);
  els.authMenuBtn?.addEventListener('click', toggleAuthFeatures);
  els.openRegisterBtn?.addEventListener('click', () => openAuthInline('register'));
  els.openLoginBtn?.addEventListener('click', () => openAuthInline('login'));
  els.closeAuthInlineBtn?.addEventListener('click', closeAuthInline);
  els.authInlineBackdrop?.addEventListener('click', closeAuthInline);
  els.gateSubmitBtn?.addEventListener('click', () => (state.authInlineMode === 'register' ? handleRegister() : handleLogin()).catch(handleError));
  els.gateMagicLinkBtn?.addEventListener('click', () => handleMagicLink().catch(handleError));
  els.gateSaveConfigBtn?.addEventListener('click', () => applyConnectionSettings({
    supabaseUrl: els.gateSupabaseUrl.value,
    supabaseAnonKey: els.gateSupabaseAnonKey.value,
  }, 'Supabase 設定已儲存。').then(closeAuthSettings).catch(handleError));
  els.gateClearConfigBtn?.addEventListener('click', () => clearConnectionSettings().then(closeAuthSettings).catch(handleError));
  els.signoutBtn.addEventListener('click', () => handleSignOut().catch(handleError));
  els.refreshBtn?.addEventListener('click', () => loadAllData({ syncReason: '已手動重新整理雲端資料。' }).then(refreshUi).then(() => showToast('資料已重新整理。')).catch(handleError));
  els.forceSyncBtn?.addEventListener('click', () => loadAllData({ syncReason: '已手動同步雲端資料。' }).then(() => showToast('同步完成。')).catch(handleError));
  els.pushLocalToCloudBtn?.addEventListener('click', () => uploadLocalDataToCloud().catch(handleError));
  els.downloadBackupBtn?.addEventListener('click', () => { try { downloadBackupJson(); } catch (error) { handleError(error); } });

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
  els.chapterSourceNote.addEventListener('change', renderSelectedNotePreview);
  els.createSnapshotBtn.addEventListener('click', () => createSnapshotForSelectedBook().catch(handleError));
  els.exportEpubBtn.addEventListener('click', () => exportSelectedBookEpub().catch(handleError));
  els.supportBtn?.addEventListener('click', openSupportModal);
  els.closeSupportModal?.addEventListener('click', closeSupportModal);
  els.supportModalBackdrop?.addEventListener('click', closeSupportModal);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !els.supportModal?.classList.contains('hidden')) closeSupportModal();
    if (event.key === 'Escape' && !els.authSettingsSheet?.classList.contains('hidden')) closeAuthSettings();
    if (event.key === 'Escape' && !els.authInlinePanel?.classList.contains('hidden')) closeAuthInline();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && state.supabase && state.currentUser) {
      loadAllData({ silent: true, syncReason: '已重新連線並同步最新資料。' }).catch(console.error);
    }
  });
  window.addEventListener('online', () => {
    if (state.supabase && state.currentUser) {
      loadAllData({ silent: true, syncReason: '網路恢復後已重新同步。' }).catch(console.error);
    }
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
  const { email, password } = getAuthCredentials();
  if (!email) throw new Error('請輸入 Email。');
  if (!password || password.length < 6) throw new Error('密碼至少需要 6 碼。');
  if (state.supabase) {
    const { error } = await state.supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + window.location.pathname },
    });
    if (error) throw error;
    showToast('註冊完成，請依 Supabase 設定確認信箱。');
    return;
  }
  if (findLocalAccountByEmail(email)) throw new Error('這個 Email 已經註冊過。');
  const account = { id: uid('local_user'), email, password, created_at: nowIso() };
  const accounts = loadLocalAccounts();
  accounts.unshift(account);
  saveLocalAccounts(accounts);
  const user = sanitizeLocalUser(account);
  setLocalUser(user);
  state.currentUser = user;
  await loadAllData();
  refreshUi();
  setView('dashboard');
  showToast('本機帳號已建立，已為你登入。');
}

async function handleLogin() {
  const { email, password } = getAuthCredentials();
  if (!email) throw new Error('請輸入 Email。');
  if (state.supabase) {
    const { error } = await state.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    showToast('登入成功。');
    return;
  }
  const account = findLocalAccountByEmail(email);
  if (!account || account.password !== password) throw new Error('Email 或密碼不正確。');
  const user = sanitizeLocalUser(account);
  setLocalUser(user);
  state.currentUser = user;
  await loadAllData();
  refreshUi();
  setView('dashboard');
  showToast('登入成功。');
}

async function handleMagicLink() {
  const { email } = getAuthCredentials();
  if (!email) throw new Error('請先輸入 Email。');
  if (!state.supabase) throw new Error('Magic Link 需要先設定 Supabase。');
  const { error } = await state.supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + window.location.pathname },
  });
  if (error) throw error;
  showToast('Magic Link 已寄出。');
}

async function handleSignOut() {
  teardownCloudRealtime();
  if (state.supabase) {
    const { error } = await state.supabase.auth.signOut();
    if (error) throw error;
  } else {
    clearLocalUser();
    state.currentUser = null;
  }
  setSyncState({ status: state.supabase ? '尚未登入' : '本機模式', detail: state.supabase ? '雲端設定仍在，但目前尚未登入帳號。' : '目前資料只保存在這台裝置。', at: '' });
  state.selectedBookId = null;
  await loadAllData({ silent: true });
  setView('dashboard');
  refreshUi();
  showToast('已登出。');
}

function getUserId() {
  return state.currentUser?.id || 'guest';
}
function requireUser() {
  if (!state.currentUser) throw new Error('請先登入或以本機模式建立測試帳號。');
}

async function loadAllData({ silent = false, syncReason = '' } = {}) {
  if (state.supabase && state.currentUser) {
    const userId = state.currentUser.id;
    setSyncState({ status: '同步中', detail: '正在從雲端讀取資料…' });
    if (!silent) refreshUi();
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
      language: resolveBookLanguage(book.language),
    }));
    state.snapshots = (snapshotsRes.data || []).map(s => ({ ...s, snapshot_json: parseMaybeJson(s.snapshot_json, null) }));
    await loadCloudLibrary(userId);
    await syncPendingReadingProgress();
    markCloudSynced(syncReason || '雲端資料已讀取完成。');
  } else {
    const userId = getUserId();
    state.notes = loadJson(STORAGE_KEYS.notes, []).filter(item => item.user_id === userId);
    state.books = loadJson(STORAGE_KEYS.books, []).filter(item => item.user_id === userId).map(book => ({ ...book, language: resolveBookLanguage(book.language) }));
    state.snapshots = loadJson(STORAGE_KEYS.snapshots, []).filter(item => item.user_id === userId);
    clearCloudLibrary('書櫃同步需要登入 Supabase 帳號。');
    setSyncState({
      status: state.supabase ? '尚未登入' : '本機模式',
      detail: state.supabase ? '已設定雲端，但目前還沒有登入帳號。' : '目前資料只保存在這台裝置。',
      at: state.supabase ? state.lastSyncAt : '',
    });
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
function resolveBookLanguage(value = '') {
  const lang = String(value || '').trim();
  return lang || DEFAULT_BOOK_LANGUAGE;
}

function refreshUi() {
  if (els.authModeBadge) els.authModeBadge.textContent = state.supabase ? '雲端模式' : '本機模式';
  if (els.statusStorage) els.statusStorage.textContent = state.supabase ? 'Supabase' : 'Local';
  if (els.statusSync) els.statusSync.textContent = state.syncStatus || '未啟用';
  els.authForms.classList.toggle('hidden', !!state.currentUser);
  els.authUser.classList.toggle('hidden', !state.currentUser);
  els.currentUserText.textContent = state.currentUser ? `目前使用者：${state.currentUser.email || state.currentUser.id}` : '尚未登入';
  document.body.classList.toggle('auth-locked', !state.currentUser);
  els.authGate?.classList.toggle('hidden', !!state.currentUser);
  els.authGate?.setAttribute('aria-hidden', state.currentUser ? 'true' : 'false');
  if (els.authInlineHint) {
    els.authInlineHint.textContent = state.supabase
      ? '目前已啟用 Supabase Auth，建立帳戶與登入都會走雲端驗證。'
      : '尚未設定 Supabase，現在會先使用本機模式建立或登入帳號。';
  }
  if (els.gateSupabaseUrl && document.activeElement !== els.gateSupabaseUrl && document.activeElement !== els.gateSupabaseAnonKey) syncConfigInputs();
  const showCloudSyncTools = !!(state.supabase && state.currentUser);
  els.cloudSyncPanel?.classList.toggle('hidden', !showCloudSyncTools);
  if (els.syncStatusText) els.syncStatusText.textContent = state.syncStatus || '未啟用';
  if (els.syncLastTime) els.syncLastTime.textContent = state.lastSyncAt ? formatDate(state.lastSyncAt) : '尚未同步';
  if (els.syncDetailText) els.syncDetailText.textContent = state.syncDetail || '登入同一個雲端帳號後，可在多裝置同步。';
  if (state.currentUser) {
    closeAuthInline();
    closeAuthSettings();
    els.authFeatureSheet?.classList.add('hidden');
    syncAuthInputs({ email: state.currentUser.email || '', password: '' });
  }
  els.summaryNotesCount.textContent = state.notes.length;
  els.summaryBooksCount.textContent = state.books.length;
  els.summarySnapshotsCount.textContent = state.snapshots.length;
  renderRecentCards();
  renderNotes();
  renderBooks();
  renderSelectedBookPanel();
  renderSnapshots();
  renderLibrary();
  renderReaderSettings();
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

function resetScripturePreview({ clearApplied = false } = {}) {
  if (state.scriptureAbortController) {
    state.scriptureAbortController.abort();
    state.scriptureAbortController = null;
  }
  state.scriptureLastAppliedBlock = '';
  if (clearApplied) state.scriptureAppliedBlocks = [];
  els.scripturePreview.innerHTML = '';
  els.scripturePreview.classList.add('hidden');
  delete els.scripturePreview.dataset.serialized;
  delete els.scripturePreview.dataset.lastRefs;
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
      ? `${verseNo}`
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

function removeKnownScriptureBlocksFromTop(content = '') {
  let next = String(content || '').trimStart();
  const knownBlocks = [...new Set([
    ...(Array.isArray(state.scriptureAppliedBlocks) ? state.scriptureAppliedBlocks : []),
    state.scriptureLastAppliedBlock,
  ].filter(Boolean))].sort((a, b) => b.length - a.length);

  let removed = false;
  do {
    removed = false;
    for (const block of knownBlocks) {
      const withSpacing = `${block}\n\n`;
      if (next.startsWith(withSpacing)) {
        next = next.slice(withSpacing.length).trimStart();
        removed = true;
        break;
      }
      if (next === block) {
        next = '';
        removed = true;
        break;
      }
    }
  } while (removed);

  return next;
}

function applyScriptureBlockToNoteContent(items) {
  let content = stripScriptureMarkers(els.noteContent.value || '');
  const scriptureBlock = buildScriptureBlock(items);
  const oldMarkedBlockPattern = /【經文引用開始】[\s\S]*?【經文引用結束】\n*/;
  content = content.replace(oldMarkedBlockPattern, '').trimStart();
  content = removeKnownScriptureBlocksFromTop(content);

  const sameBlockWithSpacing = `${scriptureBlock}\n\n`;
  if (content.startsWith(sameBlockWithSpacing)) {
    content = content.slice(sameBlockWithSpacing.length).trimStart();
  } else if (content === scriptureBlock) {
    content = '';
  }

  const next = content ? `${scriptureBlock}\n\n${content}` : scriptureBlock;
  state.scriptureLastAppliedBlock = scriptureBlock;
  state.scriptureAppliedBlocks = [
    scriptureBlock,
    ...(Array.isArray(state.scriptureAppliedBlocks) ? state.scriptureAppliedBlocks : []).filter(block => block && block !== scriptureBlock),
  ].slice(0, 12);
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
  state.scriptureAppliedBlocks = [];
  state.scriptureLastAppliedBlock = '';
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
  resetScripturePreview({ clearApplied: true });
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
  await loadAllData({ silent: true, syncReason: state.supabase ? '札記已同步到雲端。' : '' });
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
  await loadAllData({ silent: true, syncReason: state.supabase ? '札記已從雲端刪除。' : '' });
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
  els.bookLanguage.value = resolveBookLanguage(book.language);
  els.bookPreface.value = book.preface || '';
  els.bookAfterword.value = book.afterword || '';
  els.bookTocEnabled.checked = !!book.toc_enabled;
  els.deleteBookBtn.classList.remove('hidden');
  refreshUi();
}

function clearBookForm() {
  els.bookForm.reset();
  els.bookId.value = '';
  els.bookLanguage.value = DEFAULT_BOOK_LANGUAGE;
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
    language: resolveBookLanguage(els.bookLanguage.value),
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
  await loadAllData({ silent: true, syncReason: state.supabase ? '書籍已同步到雲端。' : '' });
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
  await loadAllData({ silent: true, syncReason: state.supabase ? '書籍已從雲端刪除。' : '' });
  showToast('書籍已刪除。');
}

function updateChapterSourceOptions() {
  const selectedNoteId = els.chapterSourceNote.value;
  els.chapterSourceNote.innerHTML = [
    '<option value="">請先選擇一篇札記</option>',
    ...state.notes.map(note => `<option value="${note.id}">${escapeHtml(note.title)}</option>`),
  ].join('');
  if (state.notes.some(note => note.id === selectedNoteId)) {
    els.chapterSourceNote.value = selectedNoteId;
  }
  renderSelectedNotePreview();
}

function previewText(text = '', maxLength = 100) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}...` : normalized;
}

function renderSelectedNotePreview() {
  if (!els.selectedNotePreview) return;
  const note = getNoteById(els.chapterSourceNote.value);
  if (!note) {
    els.selectedNotePreview.className = 'selected-note-preview empty-note-preview';
    els.selectedNotePreview.textContent = '請先選擇一篇札記';
    return;
  }
  const excerpt = previewText(note.summary || note.content || '', 100);
  els.selectedNotePreview.className = 'selected-note-preview';
  els.selectedNotePreview.innerHTML = `
    <h4>${escapeHtml(note.title || '未命名札記')}</h4>
    <div class="card-meta"><span>${escapeHtml(note.scripture_reference || '未填經文')}</span></div>
    <p>${escapeHtml(excerpt || '這篇札記尚未填寫摘要。')}</p>
  `;
}

function renderTocPreview(book) {
  if (!els.tocPreviewList) return;
  const tocChapters = (book.chapters || [])
    .map((chapter, index) => ({ chapter, index }))
    .filter(item => item.chapter.include_in_toc);
  if (!tocChapters.length) {
    els.tocPreviewList.className = 'toc-preview-list empty-state';
    els.tocPreviewList.textContent = '尚未有列入目錄的章節。';
    return;
  }
  els.tocPreviewList.className = 'toc-preview-list';
  els.tocPreviewList.innerHTML = `<ol>${tocChapters.map(({ chapter, index }) => `
    <li><span>第 ${index + 1} 章</span><strong>${escapeHtml(chapter.chapter_title || '未命名章節')}</strong></li>
  `).join('')}</ol>`;
}

function getSelectedBook() {
  return state.books.find(book => book.id === state.selectedBookId) || null;
}

function renderSelectedBookPanel() {
  const book = getSelectedBook();
  const chapterCount = (book?.chapters || []).length;
  if (els.statusCurrentBook) els.statusCurrentBook.textContent = book?.title || '未選取';
  if (els.statusChapterCount) els.statusChapterCount.textContent = String(chapterCount);
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
  renderSelectedNotePreview();
  renderTocPreview(book);
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
      <div class="chapter-row">
        <input value="${escapeHtml(chapter.chapter_title || '')}" data-chapter-title="${chapter.id}" />
        <div class="chapter-controls">
          <button class="ghost-btn small" data-move-up="${chapter.id}" ${index === 0 ? 'disabled' : ''}>上移</button>
          <button class="ghost-btn small" data-move-down="${chapter.id}" ${index === chapters.length - 1 ? 'disabled' : ''}>下移</button>
          <button class="danger-btn small" data-remove-chapter="${chapter.id}">移除</button>
        </div>
      </div>
      <div class="chapter-meta-row">
        <div class="caption">來源札記：${escapeHtml(getNoteById(chapter.source_note_id)?.title || '手動章節')}</div>
        <label class="checkbox-row"><input type="checkbox" data-chapter-toc="${chapter.id}" ${chapter.include_in_toc ? 'checked' : ''} /><span>列入目錄</span></label>
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
  await loadAllData({ silent: true, syncReason: state.supabase ? '章節編排已同步到雲端。' : '' });
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
  await loadAllData({ silent: true, syncReason: state.supabase ? '快照已同步到雲端。' : '' });
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
      language: resolveBookLanguage(book.language),
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
    dashboard: ['總覽', ''],
    notes: ['札記庫', '建立、編輯並整理靈修札記。'],
    books: ['書籍專案', '設定書籍並編排章節與匯出。'],
    snapshots: ['快照備份', '查看每次建立的書籍快照。'],
    library: ['書櫃', '收藏已輸出的固定版本作品，直接開啟閱讀。'],
    reader: ['閱讀模式', '安靜閱讀已加入書櫃的 EPUB。'],
  };
  els.navLinks.forEach(link => link.classList.toggle('active', link.dataset.view === viewName));
  els.views.forEach(view => view.classList.toggle('active', view.id === `view-${viewName}`));
  const viewTitle = titleMap[viewName] || titleMap.dashboard;
  els.viewTitle.textContent = viewTitle[0];
  els.viewSubtitle.textContent = viewTitle[1];
  els.viewSubtitle.classList.toggle('hidden', viewName === 'dashboard');
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
  if (!book) throw new Error('請先選取一本書籍專案。');
  if (!book.chapters?.length) throw new Error('至少要有一個章節才能匯出 EPUB。');
  const snapshot = buildBookSnapshot(book);
  const epubBlob = await buildEpub(snapshot);
  const libraryBook = await createCloudLibraryBook(book, snapshot, epubBlob);
  downloadBlob(`${book.title || 'book'}.epub`, epubBlob);
  renderExportSuccessActions(libraryBook);
  showToast('EPUB 已完成，並已加入書櫃');
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
  if (book.preface) files.push({ name: 'OEBPS/text/preface.xhtml', content: encoder.encode(simpleSection('前言', book.preface, book.language)) });
  chapters.forEach((chapter, index) => {
    files.push({ name: `OEBPS/text/chapter-${index + 1}.xhtml`, content: encoder.encode(chapterXhtml(chapter, index + 1, book.language)) });
  });
  if (book.afterword) files.push({ name: 'OEBPS/text/afterword.xhtml', content: encoder.encode(simpleSection('後記', book.afterword, book.language)) });
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
  `, false, "../styles/book.css", resolveBookLanguage(book.language));
}
function simpleSection(title, content, language = DEFAULT_BOOK_LANGUAGE) {
  return xhtmlWrap(title, `<main><h1>${escapeHtml(title)}</h1>${paragraphs(content)}</main>`, false, "../styles/book.css", resolveBookLanguage(language));
}
function chapterXhtml(chapter, order, language = DEFAULT_BOOK_LANGUAGE) {
  return xhtmlWrap(chapter.chapter_title, `
    <main>
      <h1>第 ${order} 章　${escapeHtml(chapter.chapter_title)}</h1>
      ${chapter.scripture_reference ? `<p class="scripture">${escapeHtml(chapter.scripture_reference)}</p>` : ''}
      ${paragraphs(chapter.content || '')}
    </main>
  `, false, "../styles/book.css", resolveBookLanguage(language));
}
function navXhtml(book, chapters) {
  const items = [];
  items.push(`<li><a href="text/title.xhtml">書名頁</a></li>`);
  if (book.preface) items.push(`<li><a href="text/preface.xhtml">前言</a></li>`);
  chapters.filter(ch => ch.include_in_toc).forEach((chapter, index) => items.push(`<li><a href="text/chapter-${index + 1}.xhtml">${escapeHtml(chapter.chapter_title)}</a></li>`));
  if (book.afterword) items.push(`<li><a href="text/afterword.xhtml">後記</a></li>`);
  return xhtmlWrap('目錄', `<main><nav epub:type="toc" id="toc"><h1>目錄</h1><ol>${items.join('')}</ol></nav></main>`, true, 'styles/book.css', resolveBookLanguage(book.language));
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
    <dc:language>${escapeHtml(resolveBookLanguage(book.language))}</dc:language>
    <dc:creator>${escapeHtml(book.author_name || 'Unknown')}</dc:creator>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}</meta>
  </metadata>
  <manifest>${manifest.join('')}</manifest>
  <spine toc="ncx">${spine.join('')}</spine>
</package>`;
}
function xhtmlWrap(title, body, includeEpubNs = false, cssPath = "../styles/book.css", language = DEFAULT_BOOK_LANGUAGE) {
  const lang = resolveBookLanguage(language);
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" ${includeEpubNs ? 'xmlns:epub="http://www.idpf.org/2007/ops"' : ''} lang="${escapeHtml(lang)}" xml:lang="${escapeHtml(lang)}">
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


// CLOUD_LIBRARY_MARKER
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
  readerSettings: loadJson('devotion-app-reader-settings', { fontSize: 18, lineHeight: 1.8, theme: 'light' }),
};

function clearCloudLibrary(message = '') {
  cloudLibrary.books = [];
  cloudLibrary.chapters = new Map();
  cloudLibrary.coverUrls = new Map();
  cloudLibrary.error = message;
  cloudLibrary.selectedBookId = '';
  cloudLibrary.readerBook = null;
  cloudLibrary.readerChapters = [];
}

function buildLibrarySetupError(error) {
  const message = error?.message || String(error || '');
  if (/library_books|library_book_chapters|does not exist|schema cache/i.test(message)) {
    return '書櫃資料表尚未建立，請先執行 schema.sql 裡的 library_books 與 library_book_chapters 建置 SQL。';
  }
  return `書櫃資料讀取失敗：${message}`;
}

function requireCloudLibrary() {
  requireUser();
  if (!state.supabase) throw new Error('書櫃同步需要 Supabase 連線設定。');
  if (!state.currentUser) throw new Error('請先登入後再使用雲端書櫃。');
}

function normalizeLibraryBook(book) {
  return {
    ...book,
    title: book.title || '未命名書籍',
    author: book.author || '',
    description: book.description || '',
    cover_image_path: book.cover_image_path || '',
    epub_file_path: book.epub_file_path || '',
    reading_progress: Number(book.reading_progress || 0),
    total_chapters: Number(book.total_chapters || 0),
    current_chapter: Number(book.current_chapter || 0),
    version: book.version || '1.0.0',
    is_archived: !!book.is_archived,
  };
}

function normalizeLibraryChapters(chapters = []) {
  return [...chapters].map(chapter => ({
    ...chapter,
    chapter_order: Number(chapter.chapter_order || 0),
    progress: Number(chapter.progress || 0),
    title: chapter.title || '未命名章節',
    href: chapter.href || chapter.chapter_path || '',
    chapter_path: chapter.chapter_path || chapter.href || '',
  })).sort((a, b) => a.chapter_order - b.chapter_order);
}

async function loadCloudLibrary(userId) {
  const { data, error } = await state.supabase
    .from('library_books')
    .select('*, library_book_chapters(*)')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('last_read_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (error) {
    clearCloudLibrary(buildLibrarySetupError(error));
    return;
  }
  cloudLibrary.error = '';
  cloudLibrary.books = (data || []).map(normalizeLibraryBook);
  cloudLibrary.chapters = new Map(cloudLibrary.books.map(book => [book.id, normalizeLibraryChapters(book.library_book_chapters || [])]));
  cloudLibrary.books = cloudLibrary.books.map(({ library_book_chapters, ...book }) => book);
  refreshLibraryCoverUrls().catch(console.warn);
}

function makeLibraryChapters(snapshot, bookId, userId) {
  const rows = [];
  const push = (title, chapterPath) => rows.push({
    id: uid('library_chapter'),
    user_id: userId,
    book_id: bookId,
    title,
    chapter_order: rows.length,
    href: chapterPath.replace(/^OEBPS\//, ''),
    chapter_path: chapterPath,
    progress: 0,
  });
  push('書名頁', 'OEBPS/text/title.xhtml');
  if (snapshot.book.preface) push('序言', 'OEBPS/text/preface.xhtml');
  snapshot.chapters.forEach((chapter, index) => push(chapter.chapter_title || `第 ${index + 1} 章`, `OEBPS/text/chapter-${index + 1}.xhtml`));
  if (snapshot.book.afterword) push('後記', 'OEBPS/text/afterword.xhtml');
  return rows;
}

function storagePathForBook(userId, bookId, filename) {
  return `users/${userId}/books/${bookId}/${filename}`;
}

function nextLibraryVersionForSource(sourceProjectId) {
  return `1.0.${cloudLibrary.books.filter(book => book.source_project_id === sourceProjectId).length + 1}`;
}

async function createCloudLibraryBook(sourceBook, snapshot, epubBlob) {
  requireCloudLibrary();
  const userId = getUserId();
  const bookId = uid('library_book');
  const epubFilePath = storagePathForBook(userId, bookId, 'book.epub');
  const coverUpload = snapshot.book.cover_data_url ? dataUrlToUpload(snapshot.book.cover_data_url) : null;
  const coverImagePath = coverUpload ? storagePathForBook(userId, bookId, `cover.${coverUpload.ext}`) : '';
  const chapters = makeLibraryChapters(snapshot, bookId, userId);
  const now = nowIso();
  const bookRow = {
    id: bookId,
    user_id: userId,
    title: snapshot.book.title || sourceBook.title || '未命名書籍',
    author: snapshot.book.author_name || sourceBook.author_name || '',
    description: snapshot.book.description || sourceBook.description || '',
    cover_image_path: coverImagePath,
    epub_file_path: epubFilePath,
    last_read_at: null,
    reading_progress: 0,
    total_chapters: chapters.length,
    current_chapter: 0,
    source_project_id: sourceBook.id,
    source_compilation_id: null,
    version: nextLibraryVersionForSource(sourceBook.id),
    is_archived: false,
    created_at: now,
    updated_at: now,
  };
  const { error: bookError } = await state.supabase.from('library_books').insert(bookRow);
  if (bookError) throw new Error(`建立書櫃資料失敗：${bookError.message}`);
  try {
    await uploadStorageFile(epubFilePath, epubBlob, 'application/epub+zip');
    if (coverUpload) await uploadStorageFile(coverImagePath, coverUpload.blob, coverUpload.mime);
    const { error: chapterError } = await state.supabase.from('library_book_chapters').insert(chapters);
    if (chapterError) throw new Error(`建立章節資料失敗：${chapterError.message}`);
    await cacheEpubBlob(bookId, epubBlob);
  } catch (error) {
    await state.supabase.from('library_book_chapters').delete().eq('book_id', bookId).eq('user_id', userId);
    await state.supabase.from('library_books').delete().eq('id', bookId).eq('user_id', userId);
    await state.supabase.storage.from(cloudLibrary.bucket).remove([epubFilePath, coverImagePath].filter(Boolean));
    throw error;
  }
  cloudLibrary.selectedBookId = bookId;
  await loadAllData({ silent: true, syncReason: 'EPUB 已加入書櫃。' });
  return getLibraryBook(bookId) || normalizeLibraryBook(bookRow);
}

async function uploadStorageFile(storagePath, file, contentType) {
  const { error } = await state.supabase.storage.from(cloudLibrary.bucket).upload(storagePath, file, { contentType, upsert: true });
  if (error) throw new Error(buildStorageError(error, '上傳檔案失敗'));
}

function buildStorageError(error, prefix) {
  const message = error?.message || String(error || '');
  if (/bucket/i.test(message) && /not found|does not exist/i.test(message)) {
    return `${prefix}：找不到 private Storage bucket「${cloudLibrary.bucket}」，請先依 schema.sql 指引建立。`;
  }
  if (/row-level security|permission|policy|unauthorized|403/i.test(message)) {
    return `${prefix}：Storage 權限不足，請確認 bucket 是 private 並已建立對應 RLS policy。`;
  }
  return `${prefix}：${message}`;
}

function dataUrlToUpload(dataUrl) {
  const parsed = dataUrlToBytes(dataUrl);
  const ext = parsed.mime.includes('png') ? 'png' : parsed.mime.includes('webp') ? 'webp' : 'jpg';
  return { blob: new Blob([parsed.bytes], { type: parsed.mime }), mime: parsed.mime, ext };
}

function getLibraryBook(bookId) {
  return cloudLibrary.books.find(book => book.id === bookId) || null;
}

async function refreshLibraryCoverUrls() {
  if (!(state.supabase && state.currentUser)) return;
  const entries = await Promise.all(cloudLibrary.books.map(async book => {
    if (!book.cover_image_path) return [book.id, ''];
    const { data, error } = await state.supabase.storage.from(cloudLibrary.bucket).createSignedUrl(book.cover_image_path, 60 * 20);
    return [book.id, error ? '' : data?.signedUrl || ''];
  }));
  cloudLibrary.coverUrls = new Map(entries);
  renderLibrary();
}

function renderLibrary() {
  const list = document.getElementById('library-list');
  const count = document.getElementById('library-count');
  if (!list) return;
  if (count) count.textContent = cloudLibrary.books.length;
  if (cloudLibrary.error) {
    list.className = 'library-list empty-state';
    list.innerHTML = `<h3>書櫃暫時無法同步</h3><p>${escapeHtml(cloudLibrary.error)}</p>`;
    return;
  }
  if (!cloudLibrary.books.length) {
    list.className = 'library-list empty-state';
    list.innerHTML = '<h3>書櫃裡還沒有書</h3><p>先到出書整理模式完成章節編排，輸出 EPUB 後會自動加入雲端書櫃。</p>';
    return;
  }
  const sortMode = document.getElementById('library-sort')?.value || 'recent-read';
  const books = [...cloudLibrary.books].sort((a, b) => sortMode === 'title'
    ? String(a.title).localeCompare(String(b.title), 'zh-Hant')
    : sortMode === 'recent-created'
      ? String(b.created_at).localeCompare(String(a.created_at))
      : String(b.last_read_at || b.created_at).localeCompare(String(a.last_read_at || a.created_at)));
  list.className = 'library-list';
  list.innerHTML = books.map(book => {
    const coverUrl = cloudLibrary.coverUrls.get(book.id) || '';
    const progress = Math.max(0, Math.min(1, book.reading_progress || 0));
    return `<article class="library-book ${book.id === cloudLibrary.selectedBookId ? 'selected' : ''}"><div class="library-cover">${coverUrl ? `<img src="${coverUrl}" alt="${escapeHtml(book.title)}封面" />` : `<span>${escapeHtml((book.title || '書').slice(0, 2))}</span>`}</div><div class="library-book-main"><div><h3>${escapeHtml(book.title)}</h3><div class="card-meta"><span>${escapeHtml(book.author || '未填作者')}</span><span>建立：${formatDate(book.created_at)}</span><span>最後閱讀：${book.last_read_at ? formatDate(book.last_read_at) : '尚未閱讀'}</span><span>版本 ${escapeHtml(book.version)}</span></div><p>${escapeHtml(book.description || '這本書已保存於雲端書櫃，可在登入後跨裝置閱讀。')}</p></div><div class="library-progress"><span>${Math.round(progress * 100)}%</span><div><i style="width:${Math.round(progress * 100)}%"></i></div></div><div class="card-actions"><button class="primary-btn" data-open-library-book="${book.id}">開啟閱讀</button><button class="ghost-btn" data-info-library-book="${book.id}">查看資訊</button><button class="ghost-btn" data-reexport-library-book="${book.id}">重新匯出</button><button class="danger-btn" data-delete-library-book="${book.id}">刪除書籍</button></div></div></article>`;
  }).join('');
}

async function deleteLibraryBook(bookId) {
  requireCloudLibrary();
  const book = getLibraryBook(bookId);
  if (!book) return;
  if (!confirm(`確定要從書櫃刪除「${book.title}」嗎？雲端 EPUB 與封面也會一併移除。`)) return;
  const userId = getUserId();
  const paths = [book.epub_file_path, book.cover_image_path].filter(Boolean);
  if (paths.length) await state.supabase.storage.from(cloudLibrary.bucket).remove(paths);
  await state.supabase.from('library_book_chapters').delete().eq('book_id', bookId).eq('user_id', userId);
  const { error } = await state.supabase.from('library_books').delete().eq('id', bookId).eq('user_id', userId);
  if (error) throw new Error(`刪除書籍失敗：${error.message}`);
  await deleteCachedEpub(bookId);
  if (cloudLibrary.readerBook?.id === bookId) cloudLibrary.readerBook = null;
  await loadAllData({ silent: true, syncReason: '書櫃已更新。' });
  showToast('書籍已從書櫃刪除。');
}

async function openLibraryBook(bookId) {
  requireCloudLibrary();
  const book = getLibraryBook(bookId);
  if (!book) throw new Error('找不到這本書。');
  const chapters = cloudLibrary.chapters.get(book.id) || [];
  if (!chapters.length) throw new Error('找不到章節 metadata，請重新匯出 EPUB。');
  const epubBlob = await loadEpubForReading(book);
  cloudLibrary.selectedBookId = book.id;
  cloudLibrary.readerBook = book;
  cloudLibrary.readerChapters = await readEpubChapters(epubBlob, chapters);
  setView('reader');
  renderReaderShell();
  await openReaderChapter(Math.min(book.current_chapter || 0, Math.max(cloudLibrary.readerChapters.length - 1, 0)));
}

async function loadEpubForReading(book) {
  const cached = await getCachedEpub(book.id);
  if (cached) return cached;
  if (!book.epub_file_path) throw new Error('這本書沒有 EPUB 儲存路徑，請重新匯出。');
  const { data, error } = await state.supabase.storage.from(cloudLibrary.bucket).download(book.epub_file_path);
  if (error) throw new Error(buildStorageError(error, '下載 EPUB 失敗'));
  await cacheEpubBlob(book.id, data);
  return data;
}

function renderReaderShell() {
  const book = cloudLibrary.readerBook;
  if (!book) return;
  document.getElementById('reader-title').textContent = book.title;
  document.getElementById('reader-meta').textContent = [book.author || '未填作者', `版本 ${book.version}`].join(' · ');
  document.getElementById('reader-chapter-nav').innerHTML = cloudLibrary.readerChapters.map((chapter, index) => `<option value="${index}">${escapeHtml(chapter.title || `第 ${index + 1} 章`)}</option>`).join('');
  renderReaderSettings();
}

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
}

function updateReaderSetting(key, value) {
  cloudLibrary.readerSettings = { fontSize: 18, lineHeight: 1.8, theme: 'light', ...cloudLibrary.readerSettings, [key]: value };
  saveJson(cloudLibrary.readerSettingsKey, cloudLibrary.readerSettings);
  renderReaderSettings();
}

async function openReaderChapter(index) {
  const book = cloudLibrary.readerBook;
  const chapter = cloudLibrary.readerChapters[index];
  if (!book || !chapter) return;
  document.getElementById('reader-chapter-nav').value = String(index);
  document.getElementById('reader-content').innerHTML = chapter.html || '<p>這個章節目前沒有內容。</p>';
  const total = Math.max(cloudLibrary.readerChapters.length, 1);
  const progress = total <= 1 ? 1 : index / (total - 1);
  document.getElementById('reader-progress-text').textContent = `${Math.round(progress * 100)}%`;
  document.getElementById('reader-progress-bar').style.width = `${Math.round(progress * 100)}%`;
  await persistReadingProgress(book.id, index, progress);
}

async function persistReadingProgress(bookId, currentChapter, readingProgress) {
  const payload = { current_chapter: currentChapter, reading_progress: readingProgress, last_read_at: nowIso(), updated_at: nowIso() };
  const localBook = cloudLibrary.books.find(book => book.id === bookId);
  if (localBook) Object.assign(localBook, payload);
  renderLibrary();
  if (!(state.supabase && state.currentUser && navigator.onLine)) return queuePendingReadingProgress(bookId, payload);
  const { error } = await state.supabase.from('library_books').update(payload).eq('id', bookId).eq('user_id', getUserId());
  if (error) {
    queuePendingReadingProgress(bookId, payload);
    showToast(`閱讀進度暫存於本機，稍後會再同步：${error.message}`);
  }
}

function queuePendingReadingProgress(bookId, payload) {
  const pending = loadJson(cloudLibrary.pendingKey, []);
  const idx = pending.findIndex(item => item.bookId === bookId && item.userId === getUserId());
  const item = { bookId, userId: getUserId(), payload };
  if (idx >= 0) pending[idx] = item; else pending.push(item);
  saveJson(cloudLibrary.pendingKey, pending);
}

async function syncPendingReadingProgress() {
  if (!(state.supabase && state.currentUser)) return;
  const userId = getUserId();
  const pending = loadJson(cloudLibrary.pendingKey, []);
  for (const item of pending.filter(entry => entry.userId === userId)) {
    const { error } = await state.supabase.from('library_books').update(item.payload).eq('id', item.bookId).eq('user_id', userId);
    if (error) return;
  }
  saveJson(cloudLibrary.pendingKey, pending.filter(item => item.userId !== userId));
}

async function readEpubChapters(epubBlob, manifestChapters = []) {
  const entries = await unzipStoredEntries(epubBlob);
  return manifestChapters.map(chapter => {
    const entry = entries.get(chapter.chapter_path) || entries.get(chapter.href) || entries.get(`OEBPS/${chapter.href}`);
    return { ...chapter, html: entry ? sanitizeReaderHtml(entry) : '<p>找不到 EPUB 內的章節內容。</p>' };
  });
}

function sanitizeReaderHtml(xhtml) {
  const doc = new DOMParser().parseFromString(xhtml, 'application/xhtml+xml');
  const parserError = doc.querySelector('parsererror');
  const body = parserError ? new DOMParser().parseFromString(xhtml, 'text/html').body : doc.querySelector('body');
  if (!body) return '<p>章節內容無法解析。</p>';
  body.querySelectorAll('script, style, link').forEach(node => node.remove());
  return body.innerHTML;
}

async function unzipStoredEntries(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const entries = new Map();
  let offset = 0;
  const decoder = new TextDecoder();
  while (offset + 30 <= bytes.length) {
    const view = new DataView(bytes.buffer, bytes.byteOffset + offset);
    if (view.getUint32(0, true) !== 0x04034b50) break;
    const compression = view.getUint16(8, true);
    const compressedSize = view.getUint32(18, true);
    const fileNameLength = view.getUint16(26, true);
    const extraLength = view.getUint16(28, true);
    const nameStart = offset + 30;
    const nameEnd = nameStart + fileNameLength;
    const contentStart = nameEnd + extraLength;
    const contentEnd = contentStart + compressedSize;
    const name = decoder.decode(bytes.slice(nameStart, nameEnd));
    if (compression === 0) entries.set(name, decoder.decode(bytes.slice(contentStart, contentEnd)));
    offset = contentEnd;
  }
  return entries;
}

function openEpubCacheDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(cloudLibrary.epubCacheDb, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(cloudLibrary.epubCacheStore)) db.createObjectStore(cloudLibrary.epubCacheStore);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function cacheEpubBlob(bookId, blob) {
  const db = await openEpubCacheDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(cloudLibrary.epubCacheStore, 'readwrite');
    tx.objectStore(cloudLibrary.epubCacheStore).put(blob, bookId);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function getCachedEpub(bookId) {
  const db = await openEpubCacheDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(cloudLibrary.epubCacheStore, 'readonly');
    const request = tx.objectStore(cloudLibrary.epubCacheStore).get(bookId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

async function deleteCachedEpub(bookId) {
  const db = await openEpubCacheDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(cloudLibrary.epubCacheStore, 'readwrite');
    tx.objectStore(cloudLibrary.epubCacheStore).delete(bookId);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

function renderExportSuccessActions(libraryBook) {
  const box = document.getElementById('export-success-actions');
  if (!box) return;
  cloudLibrary.selectedBookId = libraryBook.id;
  box.classList.remove('hidden');
}

document.addEventListener('click', event => {
  const openBook = event.target.closest('[data-open-library-book]');
  if (openBook) openLibraryBook(openBook.dataset.openLibraryBook).catch(handleError);
  const infoBook = event.target.closest('[data-info-library-book]');
  if (infoBook) {
    const book = getLibraryBook(infoBook.dataset.infoLibraryBook);
    if (book) showToast(`${book.title}｜${book.total_chapters} 個閱讀段落｜版本 ${book.version}`);
  }
  const reexportBook = event.target.closest('[data-reexport-library-book]');
  if (reexportBook) showToast('重新匯出入口已保留，請先回到出書整理頁重新輸出 EPUB。');
  const deleteBookBtn = event.target.closest('[data-delete-library-book]');
  if (deleteBookBtn) deleteLibraryBook(deleteBookBtn.dataset.deleteLibraryBook).catch(handleError);
  if (event.target.id === 'read-exported-book-btn' && cloudLibrary.selectedBookId) openLibraryBook(cloudLibrary.selectedBookId).catch(handleError);
  if (event.target.id === 'go-library-btn') setView('library');
  if (event.target.id === 'library-empty-action') setView('books');
  if (event.target.id === 'reader-back-library') setView('library');
});

document.addEventListener('change', event => {
  if (event.target.id === 'library-sort') renderLibrary();
  if (event.target.id === 'reader-chapter-nav') openReaderChapter(Number(event.target.value) || 0).catch(handleError);
  if (event.target.id === 'reader-theme') updateReaderSetting('theme', event.target.value);
});

document.addEventListener('input', event => {
  if (event.target.id === 'reader-font-size') updateReaderSetting('fontSize', Number(event.target.value));
  if (event.target.id === 'reader-line-height') updateReaderSetting('lineHeight', Number(event.target.value));
});

window.addEventListener('online', () => syncPendingReadingProgress().catch(console.error));

bootstrap().catch(handleError);
