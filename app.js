const STORAGE_KEYS = {
  config: 'devotion-app-config',
  user: 'devotion-app-local-user',
  notes: 'devotion-app-notes',
  books: 'devotion-app-books',
  snapshots: 'devotion-app-snapshots',
  importedLibraryBooks: 'devotion-app-imported-library-books',
  accounts: 'devotion-app-local-accounts',
  deviceId: 'devotion-app-device-id',
  autoBackupMeta: 'devotion-auto-backup-meta',
  autoBackups: 'devotion-auto-backups',
};

const TEMPLATE_LABELS = {
  devotion: '靈修札記版',
  sermon: '講章整理版',
  testimony: '見證合集版',
};

const DEFAULT_BOOK_LANGUAGE = 'mul';
const ADMIN_EMAILS = ['allen680552@gmail.com'];
const MAX_IMPORTED_EPUB_BYTES = 10 * 1024 * 1024;
const MAX_IMPORTED_EPUB_UNZIPPED_BYTES = 30 * 1024 * 1024;
const MAX_IMPORTED_EPUB_CHAPTER_CHARS = 300_000;
const PROFILE_AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const PROFILE_AVATAR_SIZE = 512;
const PROFILE_AVATAR_BUCKET = 'library-books';
const PROFILE_AVATAR_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const SUPPORT_EMAIL = 'devotionbook.tw@gmail.com';
const SUPPORT_PAYMENT_INFO = {
  bank: '台北富邦銀行',
  code: '012',
  account: '82110000769095',
};
const CURRENT_NOTE_DRAFT_KEY = 'devotion-current-note-draft';
const CURRENT_NOTE_DRAFT_DEBOUNCE_MS = 700;
const SIGNED_URL_CACHE_TTL_SECONDS = 6 * 60 * 60;
const SIGNED_URL_CACHE_REFRESH_BUFFER_MS = 10 * 60 * 1000;
const TRANSPARENT_IMAGE_PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const EGRESS_DEBUG = false;
const CLOUD_RELOAD_DEBOUNCE_MS = 15 * 1000;
const PASSIVE_CLOUD_RELOAD_MIN_INTERVAL_MS = 5 * 60 * 1000;
const IMPORTED_EPUB_SAFE_TAGS = new Set([
  'p',
  'br',
  'strong',
  'em',
  'b',
  'i',
  'u',
  'blockquote',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'span',
  'div',
  'section',
  'article',
  'small',
  'sup',
  'sub',
  'a',
  'hr',
]);
const HTML_REMOVE_WITH_CONTENT_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'svg']);
const EMPTY_ADMIN_USAGE = {
  database: {
    used: null,
    limit: null,
    error: null,
  },
  storage: {
    used: null,
    limit: null,
    error: null,
  },
  egress: {
    used: null,
    limit: null,
    error: null,
  },
};

const DEFAULT_CONFIG = {
  supabaseUrl: 'https://kknyldzvgvuewkpwkwyj.supabase.co',
  supabaseAnonKey: 'sb_publishable_7dOBDTLOfsppsElw5tTIrQ_luCT8vVh',
};

const BOOK_PROJECT_METADATA_SELECT = 'id,user_id,title,subtitle,author_name,description,template_code,language,toc_enabled,include_chapter_summary,created_at,updated_at';

const AUTO_BACKUP_SLOTS = ['08', '14', '20'];
const AUTO_BACKUP_MAX_ITEMS = 3;

function isLocalDevelopmentHost() {
  if (typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}

function buildMergedConfig(raw = null) {
  const next = raw && typeof raw === 'object' ? raw : {};
  const hasStoredConfig = !!raw && typeof raw === 'object';
  const mode = next.mode === 'local' || (!hasStoredConfig && isLocalDevelopmentHost())
    ? 'local'
    : (typeof next.supabaseUrl === 'string' || typeof next.supabaseAnonKey === 'string' || next.mode === 'custom')
      ? 'custom'
      : 'default';

  if (mode === 'local') {
    return {
      mode,
      supabaseUrl: '',
      supabaseAnonKey: '',
    };
  }

  if (mode === 'custom') {
    return {
      mode,
      supabaseUrl: String(next.supabaseUrl || '').trim(),
      supabaseAnonKey: String(next.supabaseAnonKey || '').trim(),
    };
  }

  return {
    mode,
    supabaseUrl: String(DEFAULT_CONFIG.supabaseUrl || '').trim(),
    supabaseAnonKey: String(DEFAULT_CONFIG.supabaseAnonKey || '').trim(),
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
  accountEmail: document.getElementById('account-email'),
  desktopAccountEmail: document.getElementById('desktop-account-email'),
  viewNavLinks: [...document.querySelectorAll('.desktop-sidebar-link[data-view], .mobile-bottom-link[data-view], .nav-link[data-view]')],
  viewTitle: document.getElementById('view-title'),
  viewSubtitle: document.getElementById('view-subtitle'),
  views: [...document.querySelectorAll('.view')],
  quickNewNote: document.getElementById('quick-new-note'),
  quickNewBook: document.getElementById('quick-new-book'),
  summaryNotesCard: document.getElementById('summary-notes-card'),
  summaryBooksCard: document.getElementById('summary-books-card'),
  summaryLibraryCard: document.getElementById('summary-library-card'),
  summaryNotesCount: document.getElementById('summary-notes-count'),
  summaryBooksCount: document.getElementById('summary-books-count'),
  summarySnapshotsCount: document.getElementById('summary-snapshots-count'),
  recentNotes: document.getElementById('recent-notes'),
  recentBooks: document.getElementById('recent-books'),
  noteReaderSearch: document.getElementById('note-reader-search'),
  noteReaderClearSearch: document.getElementById('note-reader-clear-search'),
  noteReaderCategory: document.getElementById('note-reader-category'),
  noteReaderTag: document.getElementById('note-reader-tag'),
  noteReaderSort: document.getElementById('note-reader-sort'),
  noteReaderResultCount: document.getElementById('note-reader-result-count'),
  noteReaderResetFilters: document.getElementById('note-reader-reset-filters'),
  noteReaderList: document.getElementById('note-reader-list'),
  noteReaderDetail: document.getElementById('note-reader-detail'),
  noteReaderWriteBtn: document.getElementById('note-reader-write-btn'),
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
  markdownHeadingBtn: document.getElementById('markdown-heading-btn'),
  markdownBoldBtn: document.getElementById('markdown-bold-btn'),
  markdownQuoteBtn: document.getElementById('markdown-quote-btn'),
  markdownScriptureBtn: document.getElementById('markdown-scripture-btn'),
  markdownListBtn: document.getElementById('markdown-list-btn'),
  markdownDividerBtn: document.getElementById('markdown-divider-btn'),
  markdownRedBtn: document.getElementById('markdown-red-btn'),
  markdownBlueBtn: document.getElementById('markdown-blue-btn'),
  markdownGoldBtn: document.getElementById('markdown-gold-btn'),
  markdownPurpleBtn: document.getElementById('markdown-purple-btn'),
  markdownSyntaxHint: document.getElementById('markdown-syntax-hint'),
  noteContent: document.getElementById('note-content'),
  notePreviewBtn: document.getElementById('note-preview-btn'),
  notePreview: document.getElementById('note-preview'),
  notePreviewModal: document.getElementById('note-preview-modal'),
  notePreviewBackdrop: document.getElementById('note-preview-backdrop'),
  closeNotePreviewBtn: document.getElementById('close-note-preview-btn'),
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
  bookIncludeChapterSummary: document.getElementById('book-include-chapter-summary'),
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
  exportSuccessActions: document.getElementById('export-success-actions'),
  exportSuccessMessage: document.getElementById('export-success-message'),
  downloadExportedBookBtn: document.getElementById('download-exported-book-btn'),
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
  openRegisterBtn: document.getElementById('open-register-btn'),
  openLoginBtn: document.getElementById('open-login-btn'),
  authInlinePanel: document.getElementById('auth-inline-panel'),
  authInlineTitle: document.getElementById('auth-inline-title'),
  closeAuthInlineBtn: document.getElementById('close-auth-inline-btn'),
  authInlineBackdrop: document.getElementById('auth-inline-backdrop'),
  gateAuthEmail: document.getElementById('gate-auth-email'),
  gateAuthPassword: document.getElementById('gate-auth-password'),
  gateAuthPasswordConfirmLabel: document.getElementById('gate-auth-password-confirm-label'),
  gateAuthPasswordConfirm: document.getElementById('gate-auth-password-confirm'),
  gateSubmitBtn: document.getElementById('gate-submit-btn'),
  gateResetPasswordBtn: document.getElementById('gate-reset-password-btn'),
  authSettingsSheet: document.getElementById('auth-settings-sheet'),
  closeAuthSettingsBtn: document.getElementById('close-auth-settings-btn'),
  gateSupabaseUrl: document.getElementById('gate-supabase-url'),
  gateSupabaseAnonKey: document.getElementById('gate-supabase-anon-key'),
  gateSaveConfigBtn: document.getElementById('gate-save-config-btn'),
  gateClearConfigBtn: document.getElementById('gate-clear-config-btn'),
  openSnapshotsBtn: document.getElementById('open-snapshots-btn'),
  openAccountSettingsBtn: document.getElementById('open-account-settings-btn'),
  openAccountSettingsButtons: [...document.querySelectorAll('[data-open-account-settings]')],
  accountSignoutBtn: document.getElementById('account-signout-btn'),
  desktopSidebarSignoutBtn: document.getElementById('desktop-sidebar-signout-btn'),
  accountSettingsModal: document.getElementById('account-settings-modal'),
  accountSettingsBackdrop: document.getElementById('account-settings-backdrop'),
  closeAccountSettingsBtn: document.getElementById('close-account-settings-btn'),
  accountSettingsEmail: document.getElementById('account-settings-email'),
  profileAvatarInput: document.getElementById('profile-avatar-input'),
  profileAvatarUploadBtn: document.getElementById('profile-avatar-upload-btn'),
  profileAvatarRemoveBtn: document.getElementById('profile-avatar-remove-btn'),
  profileAvatarMessage: document.getElementById('profile-avatar-message'),
  accountPasswordToggleBtn: document.getElementById('account-password-toggle-btn'),
  accountPasswordForm: document.getElementById('account-password-form'),
  accountNewPassword: document.getElementById('account-new-password'),
  accountConfirmPassword: document.getElementById('account-confirm-password'),
  accountUpdatePasswordBtn: document.getElementById('account-update-password-btn'),
  accountCancelPasswordBtn: document.getElementById('account-cancel-password-btn'),
  accountPasswordMessage: document.getElementById('account-password-message'),
  accountCloudActions: document.getElementById('account-cloud-actions'),
  accountCloudHint: document.getElementById('account-cloud-hint'),
  goSnapshotsBtn: document.getElementById('go-snapshots-btn'),
  dashboardFlowCard: document.getElementById('dashboard-flow-card'),
  desktopBookshelfList: document.getElementById('desktop-bookshelf-list'),
  todayDevotionDate: document.getElementById('today-devotion-date'),
  todayDevotionScripture: document.getElementById('today-devotion-scripture'),
  todayDevotionTheme: document.getElementById('today-devotion-theme'),
  todayDevotionSummary: document.getElementById('today-devotion-summary'),
  todayDevotionNoteBtn: document.getElementById('today-devotion-note-btn'),
  topbarForceSyncBtn: document.getElementById('topbar-force-sync-btn'),
  resetPasswordBtn: document.getElementById('reset-password-btn'),
  bookSaveFeedback: document.getElementById('book-save-feedback'),
  importEpubBtn: document.getElementById('import-epub-btn'),
  importEpubInput: document.getElementById('import-epub-input'),
};

function removeRetiredInterfaceElements() {
  document.querySelectorAll('[data-view="snapshots"]').forEach(element => element.remove());
  document.getElementById('view-snapshots')?.remove();
  document.getElementById('summary-snapshots-count')?.closest('.summary-card')?.remove();
  document.getElementById('create-snapshot-btn')?.remove();
  document.querySelectorAll('.desktop-sidebar-nav > [data-open-account-settings]').forEach(element => element.remove());
  document.getElementById('gate-reset-password-btn')?.replaceChildren(document.createTextNode('忘記密碼'));
  document.getElementById('reset-password-btn')?.replaceChildren(document.createTextNode('忘記密碼'));
  document.querySelector('.sidebar h1 + .muted')?.remove();
  const authSyncHint = document.querySelector('.auth-sync-hint');
  if (authSyncHint) authSyncHint.textContent = '建立免費帳戶後，可在手機與桌機間同步資料。';

  document.querySelectorAll('.auth-feature-item span').forEach(span => {
    if (span.textContent.includes('快照')) span.textContent = span.textContent.replace('、快照', '').replace('與快照', '');
  });

  document.querySelectorAll('#view-dashboard .steps li').forEach(item => {
    if (item.textContent.includes('快照')) item.textContent = '調整章節順序，確認後直接匯出 EPUB。';
  });
}

const state = {
  config: buildMergedConfig(loadJson(STORAGE_KEYS.config, null)),
  supabase: null,
  currentUser: null,
  profileAvatar: {
    path: '',
    url: '',
    updatedAt: '',
  },
  storageMode: 'local',
  notes: [],
  books: [],
  snapshots: [],
  selectedBookId: null,
  noteSearch: '',
  noteReaderSelectedId: null,
  noteReaderSearch: '',
  noteReaderCategory: '',
  noteReaderTag: '',
  noteReaderSort: 'updated-desc',
  noteReaderListScrollTop: 0,
  contentLibrarySearch: '',
  contentLibraryCategory: '',
  contentLibraryTag: '',
  contentLibraryDateFrom: '',
  contentLibraryDateTo: '',
  contentLibrarySelectedNoteIds: [],
  scriptureCache: new Map(),
  scriptureFetchTimer: null,
  scriptureAbortController: null,
  scriptureLastAppliedBlock: '',
  scriptureAppliedBlocks: [],
  authInlineMode: 'register',
  passwordRecoveryActive: false,
  deviceId: getOrCreateDeviceId(),
  realtimeChannel: null,
  noteDraftSaveTimer: null,
  noteDraftDirty: false,
  currentNoteDraftNotice: null,
  profileAvatarUrlCache: new Map(),
  libraryCoverUrlCache: new Map(),
  libraryCoverSignedUrlPromises: new Map(),
  libraryCoverObjectUrlCache: new Map(),
  libraryCoverObjectUrlPromises: new Map(),
  libraryCoverImageObserver: null,
  libraryCoverRefreshPromise: null,
  syncStatus: '本機模式',
  syncDetail: '目前資料只保存在這台裝置。',
  lastSyncAt: '',
  syncReloadTimer: null,
  cloudReloadPromise: null,
  pendingCloudReloadReason: '',
  lastPassiveCloudReloadAt: 0,
  loadAllDataPromise: null,
  lastCloudFullLoadAt: 0,
  todayDevotions: null,
  todayDevotionsStatus: 'idle',
  todayDevotionsPromise: null,
  bookArrangementDirty: false,
  bookArrangementSaving: false,
  bookArrangementDrafts: {},
  bookProjectDetailIds: new Set(),
  bookProjectDetailPromises: new Map(),
  bookDraftModalOpen: false,
  bookDraftModalBookId: null,
  bookDraftSettingsModalOpen: false,
  bookDraftSettingsBookId: null,
  bookExportSettingsModalOpen: false,
  isExporting: false,
  latestExportedBook: null,
  adminUsage: {
    status: 'idle',
    data: { ...EMPTY_ADMIN_USAGE },
    promise: null,
  },
  epubDownloadPromises: new Map(),
  backupImportPreview: {
    status: 'idle',
    error: '',
    data: null,
    backup: null,
    result: null,
  },
  isRestoring: false,
  restoreStatusMessage: '',
  isAutoBackingUp: false,
  autoBackupFailedSlots: new Set(),
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
function estimatePayloadBytes(value) {
  try {
    return JSON.stringify(value ?? null).length;
  } catch {
    return 0;
  }
}
function egressDebugLog(label, detail = {}) {
  if (!EGRESS_DEBUG) return;
  console.info(`[egress] ${label}`, detail);
}
function egressGuardInfo(label, detail = {}) {
  console.info(`[egress-guard] ${label}`, detail);
}
function egressGuardWarn(label, detail = {}) {
  console.warn(`[egress-guard] ${label}`, detail);
}
function resolveLoadReason({ reason = '', syncReason = '' } = {}) {
  return String(reason || syncReason || 'unspecified');
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

function getCurrentUserEmail() {
  return String(state.currentUser?.email || '').trim().toLowerCase();
}

function isAdminUser() {
  return !!(state.supabase && state.currentUser && ADMIN_EMAILS.includes(getCurrentUserEmail()));
}

function isAdminView(viewName = '') {
  return viewName === 'admin' || viewName === 'admin-dashboard';
}

function bindViewTriggers(scope = document) {
  scope.querySelectorAll('[data-view], [data-admin-view]').forEach(button => {
    if (!(button instanceof HTMLElement) || button.dataset.viewBound === 'true') return;
    const targetView = button.dataset.adminView || button.dataset.view;
    if (!targetView) return;
    button.dataset.viewBound = 'true';
    button.addEventListener('click', () => setView(targetView));
  });
}

function getAdminDashboardStats() {
  const allLibraryBooks = getAllLibraryBooksForView();
  const importedEpubCount = Array.isArray(importedLibrary?.books) ? importedLibrary.books.length : 0;
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const isToday = (value) => {
    const date = new Date(value || 0);
    return !Number.isNaN(date.getTime())
      && date.getFullYear() === today.getFullYear()
      && date.getMonth() === today.getMonth()
      && date.getDate() === today.getDate();
  };
  const isInLastSevenDays = (value) => {
    const date = new Date(value || 0);
    return !Number.isNaN(date.getTime()) && date >= sevenDaysAgo;
  };
  const todayNewNotes = state.notes.filter(note => isToday(note.created_at || note.updated_at)).length;
  const lastSevenDaysNotes = state.notes.filter(note => isInLastSevenDays(note.created_at || note.updated_at)).length;
  return [
    {
      label: '總使用者數',
      value: '尚未接入',
      detail: '目前前端無法直接從 Supabase Auth 取得所有使用者清單，需後續安全接入後台 API。',
      valueClass: 'admin-stat-value-placeholder',
    },
    { label: '總札記數', value: String(state.notes.length), detail: '目前登入帳號可存取的札記總數' },
    { label: '總書籍數', value: String(allLibraryBooks.length), detail: '書櫃中的已匯出與外部匯入書籍總數' },
    { label: '總選稿編排數', value: String(state.books.length), detail: '目前登入帳號的選稿編排總數' },
    { label: '今日新增札記數', value: String(todayNewNotes), detail: '以札記 created_at / updated_at 推估今日新增' },
    { label: '近 7 天新增札記數', value: String(lastSevenDaysNotes), detail: '最近七天新增或建立的札記數' },
    {
      label: '資料庫目前用量提醒',
      value: '尚未接入平台 API',
      detail: '需透過 Supabase 平台 API 或 Dashboard 取得資料庫用量後，才能依比例顯示提醒。',
      valueClass: 'admin-stat-value-placeholder',
      healthClass: 'is-normal',
    },
    {
      label: '最近錯誤紀錄',
      value: '尚無資料',
      detail: '目前前端沒有集中錯誤紀錄資料來源，後續若接入監控再顯示。',
      valueClass: 'admin-stat-value-placeholder',
    },
    {
      label: 'Storage 使用提醒',
      value: '尚未接入平台 API',
      detail: '需透過 Supabase Storage / 平台 Dashboard 取得用量後，才能依比例顯示提醒。',
      valueClass: 'admin-stat-value-placeholder',
      healthClass: 'is-normal',
    },
    {
      label: '匯入 EPUB 數量',
      value: String(importedEpubCount),
      detail: '依目前裝置 imported_epub 本機資料統計，可用於查看已匯入 EPUB 數量',
    },
    {
      label: '目前登入使用者 email',
      value: getCurrentUserEmail() || '未登入',
      detail: state.supabase ? 'Supabase Auth 目前登入帳號' : '目前不是 Supabase 雲端登入模式',
      valueClass: 'admin-stat-value-email',
    },
    { label: '最後同步時間', value: state.lastSyncAt ? formatDate(state.lastSyncAt) : '尚未同步', detail: state.lastSyncAt ? '最後一次同步完成時間' : '目前尚未記錄雲端同步完成時間' },
  ];
}

function renderAdminHealthLegend() {
  return `
    <div class="admin-health-legend" aria-label="監控警告狀態樣式">
      <span class="admin-health-badge is-normal">正常：低於 70%</span>
      <span class="admin-health-badge is-attention">注意：70%～89%</span>
      <span class="admin-health-badge is-warning">警告：90% 以上</span>
      <span class="admin-health-badge is-critical">危急：超過上限</span>
    </div>
  `;
}

function formatUsageAmount(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = value;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  const digits = size >= 100 || Number.isInteger(size) ? 0 : size >= 10 ? 1 : 2;
  return `${size.toFixed(digits)} ${units[unitIndex]}`;
}

function getAdminUsageStateClass(ratio) {
  if (typeof ratio !== 'number' || !Number.isFinite(ratio)) return 'admin-usage-danger';
  if (ratio > 1) return 'admin-usage-critical';
  if (ratio >= 0.9) return 'admin-usage-danger';
  if (ratio >= 0.7) return 'admin-usage-warning';
  return 'admin-usage-normal';
}

function getAdminUsageBadgeClass(levelClass = '') {
  return {
    'admin-usage-normal': 'is-normal',
    'admin-usage-warning': 'is-attention',
    'admin-usage-danger': 'is-warning',
    'admin-usage-critical': 'is-critical',
  }[levelClass] || 'is-warning';
}

function normalizeUsageNumber(value) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getAdminUsageErrorText(errorCode = '') {
  return {
    unauthorized: '權限錯誤',
    timeout: '連線逾時',
    server_error: '伺服器錯誤',
    query_error: '查詢錯誤',
    unknown: '未知錯誤',
  }[errorCode] || '未知錯誤';
}

function buildUsageMetricCard(label, metric = {}, status = 'ready') {
  if (status === 'loading') {
    return {
      label,
      value: '讀取中...',
      detail: '資料將透過後端 /api/admin-usage 安全代理取得，前端不會直接持有平台 Token。',
      badgeText: '讀取中...',
      badgeClass: 'is-normal',
      levelClass: 'admin-usage-normal',
    };
  }

  if (metric?.error) {
    const errorText = getAdminUsageErrorText(metric.error);
    return {
      label,
      value: errorText,
      detail: '此卡片目前以錯誤狀態為主，不顯示任何用量數值或百分比。請依錯誤類型檢查權限、查詢語法、平台狀態或連線情況。',
      badgeText: errorText,
      badgeClass: 'is-warning',
      levelClass: 'admin-usage-danger',
    };
  }

  const used = normalizeUsageNumber(metric?.used);
  const limit = normalizeUsageNumber(metric?.limit);

  if (
    typeof used !== 'number'
    || !Number.isFinite(used)
    || typeof limit !== 'number'
    || !Number.isFinite(limit)
    || limit <= 0
  ) {
    return {
      label,
      value: '尚無資料',
      detail: '目前後端尚未回傳這項用量數值；若此指標暫不支援，前端會先保留卡片位置。',
      badgeText: '尚無資料',
      badgeClass: 'is-normal',
      levelClass: 'admin-usage-normal',
    };
  }

  const ratio = used / limit;
  const percent = Math.round(ratio * 100);
  const levelClass = getAdminUsageStateClass(ratio);
  const levelText = {
    'admin-usage-normal': '正常',
    'admin-usage-warning': '注意',
    'admin-usage-danger': '警告',
    'admin-usage-critical': '危急',
  }[levelClass];

  return {
    label,
    value: `${formatUsageAmount(used)} / ${formatUsageAmount(limit)}（${percent}%）`,
    detail: '資料由 /api/admin-usage 透過後端安全代理取得，前端不直接持有 Supabase / Vercel 平台 Token。',
    badgeText: levelText,
    badgeClass: getAdminUsageBadgeClass(levelClass),
    levelClass,
  };
}

function getAdminSupabaseUsageCards() {
  const { status, data } = state.adminUsage;
  return [
    buildUsageMetricCard('Database Size', data.database, status),
    buildUsageMetricCard('Storage 用量', data.storage, status),
    buildUsageMetricCard('Bandwidth / Egress', data.egress, status),
    {
      label: 'Auth Users',
      value: '尚未接入平台 API',
      detail: '此項需透過 Supabase / Vercel 後台 API 或 Dashboard 取得，不能把平台 Token 放在前端。',
      badgeText: '尚未接入平台 API',
      badgeClass: 'is-normal',
      levelClass: 'admin-usage-normal',
    },
    {
      label: 'API Requests',
      value: '尚未接入平台 API',
      detail: '此項需透過 Supabase / Vercel 後台 API 或 Dashboard 取得，不能把平台 Token 放在前端。',
      badgeText: '尚未接入平台 API',
      badgeClass: 'is-normal',
      levelClass: 'admin-usage-normal',
    },
    {
      label: 'Logs / Error Logs',
      value: '尚未接入平台 API',
      detail: '此項需透過 Supabase / Vercel 後台 API 或 Dashboard 取得，不能把平台 Token 放在前端。',
      badgeText: '尚未接入平台 API',
      badgeClass: 'is-normal',
      levelClass: 'admin-usage-normal',
    },
  ];
}

function renderAdminPlatformCards(items = []) {
  return items.map(item => `
    <article class="admin-usage-card ${escapeHtml(item.levelClass || 'admin-usage-normal')}" data-health-level="${escapeHtml(item.levelClass || 'admin-usage-normal')}">
      <div class="admin-usage-card-head">
        <h4>${escapeHtml(item.label)}</h4>
        <span class="admin-health-badge ${escapeHtml(item.badgeClass || 'is-normal')}">${escapeHtml(item.badgeText || '尚未接入平台 API')}</span>
      </div>
      <p class="admin-usage-placeholder">${escapeHtml(item.value || '尚未接入平台 API')}</p>
      <p class="caption">${escapeHtml(item.detail || '此項需透過 Supabase / Vercel 後台 API 或 Dashboard 取得，不能把平台 Token 放在前端。')}</p>
    </article>
  `).join('');
}

async function loadAdminUsage() {
  if (!isAdminUser()) return { ...EMPTY_ADMIN_USAGE };
  if (state.adminUsage.status === 'loading' && state.adminUsage.promise) return state.adminUsage.promise;

  const request = (async () => {
    state.adminUsage.status = 'loading';
    refreshUi();
    try {
      if (!state.supabase) throw new Error('admin usage requires Supabase session');
      const { data } = await state.supabase.auth.getSession();
      const sessionAccessToken = String(data?.session?.access_token || '').trim();
      if (!sessionAccessToken) throw new Error('admin usage requires active session');
      const response = await fetch('/api/admin-usage', {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${sessionAccessToken}`,
        },
      });
      if (!response.ok) throw new Error(`admin usage request failed: ${response.status}`);
      const payload = await response.json();
      state.adminUsage.status = 'ready';
      state.adminUsage.data = {
        database: {
          used: normalizeUsageNumber(payload?.database?.used),
          limit: normalizeUsageNumber(payload?.database?.limit),
          error: typeof payload?.database?.error === 'string' ? payload.database.error : null,
        },
        storage: {
          used: normalizeUsageNumber(payload?.storage?.used),
          limit: normalizeUsageNumber(payload?.storage?.limit),
          error: typeof payload?.storage?.error === 'string' ? payload.storage.error : null,
        },
        egress: {
          used: normalizeUsageNumber(payload?.egress?.used),
          limit: normalizeUsageNumber(payload?.egress?.limit),
          error: typeof payload?.egress?.error === 'string' ? payload.egress.error : null,
        },
      };
      return state.adminUsage.data;
    } catch {
      state.adminUsage.status = 'ready';
      state.adminUsage.data = { ...EMPTY_ADMIN_USAGE };
      return state.adminUsage.data;
    } finally {
      state.adminUsage.promise = null;
      refreshUi();
    }
  })();

  state.adminUsage.promise = request;
  return request;
}

function renderAdminDashboard() {
  const summaryContainer = document.getElementById('admin-summary-cards');
  const monitoringContainer = document.getElementById('admin-monitoring-groups');
  if (!summaryContainer || !monitoringContainer) return;

  const stats = getAdminDashboardStats();
  summaryContainer.innerHTML = stats.map(item => `
    <article class="admin-stat-card">
      <span class="admin-stat-label">${escapeHtml(item.label)}</span>
      <strong class="admin-stat-value${item.valueClass ? ` ${item.valueClass}` : ''}">${escapeHtml(item.value)}</strong>
      ${item.healthClass ? `<span class="admin-health-badge ${item.healthClass}">待接入後可顯示比例警示</span>` : ''}
      <p class="caption">${escapeHtml(item.detail)}</p>
    </article>
  `).join('');

  monitoringContainer.innerHTML = `
    <section class="admin-monitoring-group">
      <div class="panel-header">
        <div>
          <h3>資料備份</h3>
          <p class="muted">下載目前登入使用者的札記、選稿編排與書櫃資料 JSON 備份。</p>
        </div>
        <div class="row gap-sm wrap">
          <button id="admin-export-backup-btn" type="button" class="secondary-btn">匯出備份（JSON）</button>
          <button id="admin-export-system-backup-btn" type="button" class="secondary-btn">下載系統備份</button>
          <button id="admin-import-backup-btn" type="button" class="ghost-btn">匯入備份（JSON）</button>
          <input id="admin-import-backup-input" type="file" accept=".json,application/json" class="hidden" />
        </div>
      </div>
      <p class="caption">匯出內容包含 notes、drafts、library；若某資料目前不存在，會以空陣列輸出。</p>
      <section class="admin-dashboard-section">
        <div>
          <h3>備份預覽</h3>
          <p class="muted">只讀取並驗證備份內容，不會寫入任何資料，也不會覆蓋目前系統資料。</p>
        </div>
        <div class="row gap-sm wrap">
          <button id="admin-restore-backup-btn" type="button" class="secondary-btn">開始還原（安全模式）</button>
          <button id="admin-danger-restore-backup-btn" type="button" class="danger-btn" ${state.isRestoring ? 'disabled' : ''}>${state.isRestoring ? '還原中…' : '覆蓋還原（危險）'}</button>
        </div>
        ${renderBackupImportPreview()}
      </section>
      ${renderAutoBackupSection()}
    </section>
    <section class="admin-monitoring-group">
      <div class="panel-header">
        <div>
          <h3>Supabase</h3>
          <p class="muted">透過後端 /api/admin-usage 讀取平台用量，前端不直接持有平台 Token。</p>
        </div>
      </div>
      ${renderAdminHealthLegend()}
      <div class="admin-usage-grid">
        ${renderAdminPlatformCards(getAdminSupabaseUsageCards())}
      </div>
    </section>
    <section class="admin-monitoring-group">
      <div class="panel-header">
        <div>
          <h3>Vercel</h3>
          <p class="muted">先保留監控卡位置，後續若要接資料，需走後端安全代理，不可把平台 Token 放在前端。</p>
        </div>
      </div>
      ${renderAdminHealthLegend()}
      <div class="admin-usage-grid">
        ${renderAdminPlatformCards([
          {
            label: 'Visitors',
            value: '尚未接入平台 API',
            detail: '此項需透過 Supabase / Vercel 後台 API 或 Dashboard 取得，不能把平台 Token 放在前端。',
            badgeText: '尚未接入平台 API',
            badgeClass: 'is-normal',
            levelClass: 'admin-usage-normal',
          },
          {
            label: 'Bandwidth',
            value: '尚未接入平台 API',
            detail: '此項需透過 Supabase / Vercel 後台 API 或 Dashboard 取得，不能把平台 Token 放在前端。',
            badgeText: '尚未接入平台 API',
            badgeClass: 'is-normal',
            levelClass: 'admin-usage-normal',
          },
          {
            label: 'Function Usage',
            value: '尚未接入平台 API',
            detail: '此項需透過 Supabase / Vercel 後台 API 或 Dashboard 取得，不能把平台 Token 放在前端。',
            badgeText: '尚未接入平台 API',
            badgeClass: 'is-normal',
            levelClass: 'admin-usage-normal',
          },
          {
            label: 'Build / Deployment 狀態',
            value: '尚未接入平台 API',
            detail: '此項需透過 Supabase / Vercel 後台 API 或 Dashboard 取得，不能把平台 Token 放在前端。',
            badgeText: '尚未接入平台 API',
            badgeClass: 'is-normal',
            levelClass: 'admin-usage-normal',
          },
        ])}
      </div>
    </section>
  `;
  document.getElementById('admin-export-backup-btn')?.addEventListener('click', () => downloadBackupJson(), { once: true });
  document.getElementById('admin-export-system-backup-btn')?.addEventListener('click', () => {
    downloadSystemBackup().catch(handleError);
  }, { once: true });
  document.getElementById('admin-import-backup-btn')?.addEventListener('click', () => {
    document.getElementById('admin-import-backup-input')?.click();
  }, { once: true });
  document.getElementById('admin-import-backup-input')?.addEventListener('change', handleBackupImportSelection, { once: true });
  document.getElementById('admin-restore-backup-btn')?.addEventListener('click', () => {
    restoreBackupMerge().catch(handleError);
  }, { once: true });
  document.getElementById('admin-danger-restore-backup-btn')?.addEventListener('click', () => {
    restoreBackupDanger().catch(handleError);
  }, { once: true });
  document.querySelectorAll('[data-download-auto-backup]').forEach(button => {
    button.addEventListener('click', () => {
      try {
        downloadAutoBackupById(button.dataset.downloadAutoBackup || '');
      } catch (error) {
        handleError(error);
      }
    }, { once: true });
  });
}

function ensureContentLibraryUi() {
  const desktopNav = document.querySelector('.desktop-sidebar-nav');
  if (desktopNav && !desktopNav.querySelector('[data-view="content-library"]')) {
    const booksLink = desktopNav.querySelector('[data-view="books"]');
    const button = document.createElement('button');
      button.className = 'desktop-sidebar-link';
      button.type = 'button';
      button.dataset.view = 'content-library';
      button.innerHTML = `
        <span class="nav-icon asset-icon asset-sprite-system icon-note" aria-hidden="true"></span>
        <span>札記庫</span>
      `;
    booksLink?.insertAdjacentElement('beforebegin', button);
  }

  if (!document.getElementById('view-content-library')) {
    const booksView = document.getElementById('view-books');
    const section = document.createElement('section');
    section.id = 'view-content-library';
    section.className = 'view';
    section.innerHTML = `
        <section class="panel">
        <div class="row gap-sm wrap">
          <input id="content-library-search" class="search" placeholder="搜尋標題、摘要、內容、經文" />
          <label class="compact-control">
            <span class="caption">日期起</span>
            <input id="content-library-date-from" type="date" />
          </label>
          <label class="compact-control">
            <span class="caption">日期迄</span>
            <input id="content-library-date-to" type="date" />
          </label>
          <label class="compact-control">
            <span class="caption">分類</span>
            <select id="content-library-category"></select>
          </label>
          <label class="compact-control">
            <span class="caption">標籤</span>
            <select id="content-library-tag"></select>
          </label>
          <button id="content-library-clear-filters" class="ghost-btn" type="button">清除篩選</button>
        </div>
        <div class="row gap-sm wrap mt-md">
          <strong id="content-library-selection-count">已選 0 篇</strong>
          <span id="content-library-book-hint" class="caption">請先到選稿編排建立或選擇一份書稿。</span>
          <button id="content-library-add-selected" class="secondary-btn" type="button">請先選擇編排</button>
          <button id="content-library-go-workbench" class="ghost-btn hidden" type="button">前往選稿編排</button>
          <button id="content-library-clear-selection" class="ghost-btn" type="button">清除選取</button>
        </div>
        <div id="content-library-list" class="list-stack mt-md empty-state">目前還沒有可整理的札記。</div>
      </section>
    `;
    booksView?.insertAdjacentElement('beforebegin', section);
  }

  els.viewNavLinks = [...document.querySelectorAll('.desktop-sidebar-link[data-view], .mobile-bottom-link[data-view], .nav-link[data-view]')];
  els.views = [...document.querySelectorAll('.view')];
  els.contentLibrarySearch = document.getElementById('content-library-search');
  els.contentLibraryDateFrom = document.getElementById('content-library-date-from');
  els.contentLibraryDateTo = document.getElementById('content-library-date-to');
  els.contentLibraryCategory = document.getElementById('content-library-category');
  els.contentLibraryTag = document.getElementById('content-library-tag');
  els.contentLibraryClearFilters = document.getElementById('content-library-clear-filters');
  els.contentLibrarySelectionCount = document.getElementById('content-library-selection-count');
  els.contentLibraryBookHint = document.getElementById('content-library-book-hint');
  els.contentLibraryAddSelected = document.getElementById('content-library-add-selected');
  els.contentLibraryGoWorkbench = document.getElementById('content-library-go-workbench');
  els.contentLibraryClearSelection = document.getElementById('content-library-clear-selection');
  els.contentLibraryList = document.getElementById('content-library-list');

  document.querySelector('#view-content-library .panel-header')?.remove();

  if (els.contentLibrarySearch && !els.contentLibrarySearch.dataset.bound) {
    els.contentLibrarySearch.dataset.bound = 'true';
    els.contentLibrarySearch.addEventListener('input', event => {
      state.contentLibrarySearch = String(event.target.value || '');
      renderContentLibrary();
    });
  }
  if (els.contentLibraryDateFrom && !els.contentLibraryDateFrom.dataset.bound) {
    els.contentLibraryDateFrom.dataset.bound = 'true';
    els.contentLibraryDateFrom.addEventListener('change', event => {
      state.contentLibraryDateFrom = String(event.target.value || '');
      renderContentLibrary();
    });
  }
  if (els.contentLibraryDateTo && !els.contentLibraryDateTo.dataset.bound) {
    els.contentLibraryDateTo.dataset.bound = 'true';
    els.contentLibraryDateTo.addEventListener('change', event => {
      state.contentLibraryDateTo = String(event.target.value || '');
      renderContentLibrary();
    });
  }
  if (els.contentLibraryCategory && !els.contentLibraryCategory.dataset.bound) {
    els.contentLibraryCategory.dataset.bound = 'true';
    els.contentLibraryCategory.addEventListener('change', event => {
      state.contentLibraryCategory = String(event.target.value || '');
      renderContentLibrary();
    });
  }
  if (els.contentLibraryTag && !els.contentLibraryTag.dataset.bound) {
    els.contentLibraryTag.dataset.bound = 'true';
    els.contentLibraryTag.addEventListener('change', event => {
      state.contentLibraryTag = String(event.target.value || '');
      renderContentLibrary();
    });
  }
  if (els.contentLibraryClearFilters && !els.contentLibraryClearFilters.dataset.bound) {
    els.contentLibraryClearFilters.dataset.bound = 'true';
    els.contentLibraryClearFilters.addEventListener('click', () => {
      state.contentLibrarySearch = '';
      state.contentLibraryCategory = '';
      state.contentLibraryTag = '';
      state.contentLibraryDateFrom = '';
      state.contentLibraryDateTo = '';
      renderContentLibrary();
    });
  }
  if (els.contentLibraryClearSelection && !els.contentLibraryClearSelection.dataset.bound) {
    els.contentLibraryClearSelection.dataset.bound = 'true';
    els.contentLibraryClearSelection.addEventListener('click', () => {
      state.contentLibrarySelectedNoteIds = [];
      renderContentLibrary();
    });
  }
  if (els.contentLibraryAddSelected && !els.contentLibraryAddSelected.dataset.bound) {
    els.contentLibraryAddSelected.dataset.bound = 'true';
    els.contentLibraryAddSelected.addEventListener('click', () => addSelectedNotesToCurrentBookDraft().catch(handleError));
  }
  if (els.contentLibraryGoWorkbench && !els.contentLibraryGoWorkbench.dataset.bound) {
    els.contentLibraryGoWorkbench.dataset.bound = 'true';
    els.contentLibraryGoWorkbench.addEventListener('click', () => {
      setView('books');
      refreshUi();
    });
  }
}

function ensureOperationManualUi() {
  const siteFooter = document.querySelector('.site-footer');
  if (siteFooter && !document.getElementById('footer-support-contact')) {
    const contact = document.createElement('p');
    contact.id = 'footer-support-contact';
    contact.className = 'footer-support-text';
    contact.innerHTML = `使用問題與意見回饋：<button class="footer-email-copy" type="button" data-copy-support-email>${SUPPORT_EMAIL}</button>`;
    const copyright = siteFooter.querySelector('.footer-copyright');
    if (copyright) siteFooter.insertBefore(contact, copyright);
    else siteFooter.appendChild(contact);
  }

  const desktopNav = document.querySelector('.desktop-sidebar-nav');
  if (desktopNav && !desktopNav.querySelector('[data-view="manual"]')) {
    const settingsLink = desktopNav.querySelector('[data-open-account-settings]');
    const button = document.createElement('button');
    button.className = 'desktop-sidebar-link';
    button.type = 'button';
    button.dataset.view = 'manual';
    button.innerHTML = `
      <span class="nav-icon asset-icon asset-sprite-system icon-book" aria-hidden="true"></span>
      <span>操作手冊</span>
    `;
    if (settingsLink) {
      settingsLink.insertAdjacentElement('beforebegin', button);
    } else {
      desktopNav.appendChild(button);
    }
  }

  if (!document.getElementById('view-manual')) {
    const libraryView = document.getElementById('view-library');
    const section = document.createElement('section');
    section.id = 'view-manual';
    section.className = 'view manual-view';
    section.innerHTML = `
      <section class="panel manual-panel">
        <section class="manual-hero">
          <p class="manual-kicker">給每一天的靈修留下路徑</p>
          <h1>讓你的靈修，不再只是零散筆記。</h1>
          <div class="manual-value-lines">
            <p>每天的領受與記錄，慢慢整理成一本屬於你的書。</p>
            <p>留下你與神同行的軌跡，也成為日後回顧的恩典記號。</p>
          </div>
          <p>這套系統幫助你把每天與神同行的領受、禱告、代禱、感恩、悔改、講道筆記與查經心得，整理成可以閱讀、可以下載、可以保存的電子書。</p>
          <p class="manual-flow-line">總覽 → 寫札記 → 札記閱讀與札記庫 → 選稿編排 → 整理章節 → 成書匯出設定 → 書櫃閱讀</p>
        </section>

        <section class="manual-toc" aria-labelledby="manual-toc-title">
          <h3 id="manual-toc-title">目錄</h3>
          <ul>
            <li><a href="#manual-purpose">一、系統是做什麼的</a></li>
            <li><a href="#manual-flow">二、快速開始</a></li>
            <li><a href="#manual-dashboard">三、總覽 Dashboard</a></li>
            <li><a href="#manual-writing-note">四、寫札記</a></li>
            <li><a href="#manual-note-reader">五、札記閱讀</a></li>
            <li><a href="#manual-content-library">六、札記庫</a></li>
            <li><a href="#manual-selection-workbench">七、選稿編排</a></li>
            <li><a href="#manual-chapter-arrangement">八、整理章節</a></li>
            <li><a href="#manual-export">九、成書匯出設定與 EPUB 匯出</a></li>
            <li><a href="#manual-library">十、書櫃</a></li>
            <li><a href="#manual-reader">十一、閱讀器</a></li>
            <li><a href="#manual-today-devotion">十二、今日默想</a></li>
            <li><a href="#manual-mobile">十三、手機 / 平板使用方式</a></li>
            <li><a href="#manual-account-data">十四、帳號設定與資料</a></li>
            <li><a href="#manual-support-receipt">十五、支持平台與收款證明</a></li>
            <li><a href="#manual-faq">十六、常見問題</a></li>
            <li><a href="#manual-feedback">十七、使用問題與意見回饋</a></li>
            <li><a href="#manual-admin-backup">十八、管理者附錄</a></li>
            <li><a href="#manual-closing-note">十九、給使用者的一點提醒</a></li>
          </ul>
        </section>

        <article class="manual-article">
          <section id="manual-purpose" class="manual-section">
            <h2>一、系統是做什麼的</h2>
            <p>靈修札記成書系統是一個幫助你整理信仰文字的地方。你可以把每日靈修、講道筆記、小組查經、禱告、代禱、感恩、悔改反思和生命見證寫下來，日後再挑選、編排、匯出成書。</p>
            <p>它會保存單篇文字，也幫助你看見一段時間裡神如何帶領你、提醒你、安慰你。當札記慢慢累積，你可以把它整理成一本可以自己閱讀、分享或留存的電子書。</p>
            <div class="manual-callout">
              <strong>核心流程</strong>
              <p>總覽 → 寫札記 → 札記閱讀與札記庫 → 選稿編排 → 整理章節 → 成書匯出設定 → 書櫃閱讀</p>
            </div>
          </section>

          <section id="manual-flow" class="manual-section">
            <h2>二、快速開始</h2>
            <p>登入後可以先看「總覽」。總覽會把最近的札記、選稿編排、書櫃與今日默想集中在同一頁，適合快速判斷今天要繼續寫、閱讀，或整理成書。</p>
            <p>總覽上方的三張統計卡可以直接點擊：</p>
            <ul>
              <li>札記：進入「札記閱讀」，安靜重讀自己寫過的札記。</li>
              <li>書稿：進入「選稿編排」，整理正在成書的內容。</li>
              <li>書櫃：進入「書櫃」，閱讀已匯出的書或 EPUB。</li>
            </ul>
            <p>常用流程可以這樣走：</p>
            <ol>
              <li>進入「寫札記」，建立一篇札記並儲存。</li>
              <li>想單純閱讀時，進入「札記閱讀」搜尋、篩選或重讀單篇札記。</li>
              <li>想整理成書時，進入「札記庫」，用搜尋、日期、分類、標籤找到適合整理的文章。</li>
              <li>進入「選稿編排」，建立新的選稿編排，或從既有編排點選「開始編這本」。</li>
              <li>回到「札記庫」，勾選文章後加入目前正在編排的選稿編排。</li>
              <li>回到「選稿編排」，點選「整理章節」，調整順序、標題與是否列入目錄。</li>
              <li>點選「成書匯出設定」，補齊書名、作者、封面、前言等資訊。</li>
              <li>點「儲存並匯出 EPUB」。完成後可以「立即閱讀」、「下載 EPUB」或「前往書櫃」。</li>
            </ol>
            <p>「目前正在編排」是整個成書流程的工作狀態。札記庫的加入按鈕會把勾選文章加入這一份選稿編排。</p>
          </section>

          <section id="manual-dashboard" class="manual-section">
            <h2>三、總覽 Dashboard</h2>
            <p>「總覽」是登入後的起點。這裡會顯示札記、書稿與書櫃統計，也會整理最近編輯札記、最近編輯書冊、書櫃預覽與今日默想。</p>
            <p>三張統計卡本身就是快速入口：</p>
            <ul>
              <li>「札記」卡：進入「札記閱讀」，適合回顧和查找自己已寫下的內容。</li>
              <li>「書稿」卡：進入「選稿編排」，繼續整理目前正在編排的內容。</li>
              <li>「書櫃」卡：進入「書櫃」，開啟已完成或已匯入的電子書。</li>
            </ul>
            <p>總覽也提供常用快捷按鈕，例如「寫一篇札記」與「建立編排」。若今日默想有內容，也可以從卡片上的「寫成札記」開始記錄今天的回應。</p>
            <p>手機版主要使用底部導覽切換總覽、寫札記、札記庫、選稿編排、書櫃與操作手冊；桌機版則使用左側側欄切換。</p>
          </section>

          <section id="manual-writing-note" class="manual-section">
            <h2>四、寫札記</h2>
            <p>「寫札記」是整套系統的起點。你可以從總覽的「寫一篇札記」、側邊欄或手機底部導覽進入。寫完後按「儲存札記」，這篇內容就會進入札記庫，之後可以被挑選、編排、整理成書。</p>

            <div class="manual-card-grid manual-card-grid-three">
              <div class="manual-card">
                <h3>不只可以寫每日靈修</h3>
                <ul>
                  <li>每日靈修、講道筆記、小組查經整理。</li>
                  <li>禱告內容、代禱事項、感恩記錄、悔改反思。</li>
                  <li>生命見證、讀書心得、主題文章、信仰操練紀錄。</li>
                </ul>
              </div>
              <div class="manual-card">
                <h3>分類可以怎麼用？</h3>
                <p>分類適合放大方向，讓札記庫日後容易篩選。</p>
                <p class="manual-chip-line">靈修、講道、查經、見證、禱告、代禱、感恩、悔改、操練</p>
              </div>
              <div class="manual-card">
                <h3>標籤可以怎麼用？</h3>
                <p>標籤適合補充主題、對象或狀態。</p>
                <p class="manual-chip-line">信心、禱告、悔改、盼望、家庭、工作、服事、教會、福音對象、長期代禱、已蒙應允</p>
              </div>
            </div>

            <h3>欄位怎麼填</h3>
            <div class="manual-card-grid">
              <div class="manual-card"><h3>標題</h3><p>寫成日後容易辨認的名稱，也可以當作未來章節標題。例：在等待中學習信靠。</p></div>
              <div class="manual-card"><h3>經文</h3><p>可以填經文範圍，也可以用經文抓取功能帶入內容。若經文很長，建議分段放進正文。</p></div>
              <div class="manual-card"><h3>分類</h3><p>選一個主要方向，例如靈修、講道、查經、代禱或感恩。</p></div>
              <div class="manual-card"><h3>標籤</h3><p>用逗號分隔多個標籤，幫助日後搜尋同一個主題、對象或禱告狀態。</p></div>
              <div class="manual-card"><h3>摘要</h3><p>用二到四句整理重點。日後在札記庫瀏覽或成書時，可以快速知道這篇在說什麼。</p></div>
              <div class="manual-card"><h3>內容</h3><p>完整寫下觀察、默想、禱告、回應與操練。段落短一點，手機閱讀會更舒服。</p></div>
            </div>

            <section id="manual-voice-input" class="manual-subsection">
              <h3>語音輸入</h3>
              <p>如果你不方便打字，也可以使用手機或電腦內建的語音輸入法。</p>
              <p>在手機上，點進「摘要」或「內容」欄位後，可以使用鍵盤上的麥克風按鈕，直接用中文或英文說出想記錄的內容。</p>
              <p>在 Windows 電腦上，可以先點進輸入欄位，再按 Windows 鍵 + H，開啟系統語音輸入。</p>
              <p>在 Mac 上，可以使用系統內建的聽寫功能。</p>
              <p>語音輸入完成後，建議再檢查一次文字，特別是人名、經文、標點與專有名詞。確認無誤後，再按「儲存札記」。</p>
            </section>

            <section id="manual-toolbar-guide" class="manual-subsection">
              <h3>工具列怎麼用</h3>
              <p>內容欄上方的工具列會幫你插入常用格式。先選取一段文字再按工具，或把游標放在想插入的位置後按工具，都可以快速加入格式標記。</p>
              <div class="manual-toolbar-grid">
                <div class="manual-tool-card"><strong>小標題</strong><p>插入 <code>## 小標題</code>。適合建立文章架構，例如經文觀察、默想反思、今日禱告、感恩記錄、代禱事項、回應與操練。</p></div>
                <div class="manual-tool-card"><strong>粗體</strong><p>適合強調一句核心提醒、重要結論或需要再次思想的短句。</p></div>
                <div class="manual-tool-card"><strong>引用</strong><p>適合放講道中的一句話、書摘、短句提醒或別人分享的內容。</p></div>
                <div class="manual-tool-card"><strong>經文</strong><p>適合放完整經文段落。經文較長時，建議分成幾段，讓閱讀時不會太擠。</p></div>
                <div class="manual-tool-card"><strong>清單</strong><p>適合整理觀察重點、禱告事項、代禱名單、今日回應或下一步行動。</p></div>
                <div class="manual-tool-card"><strong>分隔線</strong><p>適合分開不同段落，例如默想結束後進入禱告，或把感恩與代禱分開。</p></div>
                <div class="manual-tool-card"><strong>紅字</strong><p>適合標記今天特別扎心、需要立刻回應或需要警醒的提醒。</p></div>
                <div class="manual-tool-card"><strong>藍字</strong><p>適合標記安慰、應許、盼望或讓心安定下來的句子。</p></div>
                <div class="manual-tool-card"><strong>金字</strong><p>適合標記感恩、恩典、已蒙應允或值得紀念的內容。</p></div>
                <div class="manual-tool-card"><strong>紫字</strong><p>適合標記敬拜、尊榮、奉獻、呼召或生命方向的提醒。</p></div>
              </div>
            </section>

            <section id="manual-format-markers" class="manual-subsection">
              <h3>為什麼編輯區會出現 ##、{red}、{/red} 這些符號？</h3>
              <p>這些符號是格式標記，是系統用來產生預覽與成書樣式的記號。在編輯區會先看到文字形式的標記，按下「預覽文章」後，系統會把它們轉成比較接近閱讀時的樣式。</p>
              <div class="manual-card-grid">
                <div class="manual-card"><h3><code>##</code></h3><p>代表小標題。小標題建議單獨一行使用，而且 <code>##</code> 必須放在那一行最前面，才會正常顯示成小標題。</p></div>
                <div class="manual-card"><h3><code>{red}文字{/red}</code></h3><p>代表紅色重點字。</p></div>
                <div class="manual-card"><h3><code>{blue}文字{/blue}</code></h3><p>代表藍色重點字。</p></div>
                <div class="manual-card"><h3><code>{gold}文字{/gold}</code></h3><p>代表金色重點字。</p></div>
                <div class="manual-card"><h3><code>{purple}文字{/purple}</code></h3><p>代表紫色重點字。</p></div>
              </div>
            </section>

            <section id="manual-heading-color" class="manual-subsection manual-warning">
              <h3>小標題與重點色怎麼搭配</h3>
              <p>小標題是用來整理文章架構。重點色是用來強調正文短句。兩者建議分開使用。</p>
              <div class="manual-example-grid">
                <div class="manual-example good"><strong>正確小標題</strong><code>## 重點整理</code></div>
                <div class="manual-example good"><strong>正確重點色</strong><code>{red}這一句是今天特別提醒我的重點。{/red}</code></div>
                <div class="manual-example good"><strong>建議搭配方式</strong><code>## 重點整理<br><br>{red}這一句是今天特別提醒我的重點。{/red}</code></div>
              </div>
              <div class="manual-example-grid">
                <div class="manual-example bad"><strong>請避免</strong><code>{red}##重點{/red}</code><p>這樣會把 <code>##</code> 包進顏色標記裡，系統可能無法正常判斷成小標題。預覽或成書時，可能只會顯示成一般文字，或樣式不如預期。</p></div>
                <div class="manual-example bad"><strong>也不建議</strong><code>## {red}重點{/red}</code><p>即使某些情況看起來可以顯示，仍容易讓格式不穩定，之後預覽、成書或手機閱讀時，可能出現標題大小、顏色或間距不如預期的情況。</p></div>
              </div>
              <p><strong>簡單記法：</strong>如果要做段落標題，就讓小標題單獨一行。如果要標記一句重要提醒，就另起一行使用重點色。</p>
            </section>

            <p>完成後可以先點「預覽文章」，檢查小標題、重點色、經文區塊和段落間距，再儲存札記。若從札記庫點「編輯」，系統會回到寫札記並載入該篇內容，儲存時會更新原本的札記。</p>
          </section>

          <section id="manual-note-reader" class="manual-section">
            <h2>五、札記閱讀</h2>
            <p>「札記閱讀」是專門用來重讀與查找札記的閱讀頁，不是編輯器。你可以從總覽點「札記」統計卡進入，也可以在需要安靜回顧時使用它。</p>
            <p>札記閱讀支援這些方式找到內容：</p>
            <ul>
              <li>搜尋：可搜尋標題、經文、分類、標籤、摘要與內容。</li>
              <li>經文搜尋：在搜尋框輸入經文卷名、章節或關鍵字，就能一起比對經文欄位。</li>
              <li>分類篩選：只看某一類札記。</li>
              <li>標籤篩選：只看帶有特定標籤的札記。</li>
              <li>排序：可依最近更新、最早建立或標題順序檢視。</li>
              <li>結果數：畫面會顯示目前符合條件與全部札記的篇數。</li>
            </ul>
            <p>若沒有符合條件的札記，畫面會出現無結果提示，可調整搜尋字、分類、標籤，或使用「重設篩選」回到完整列表。</p>
            <p>點一篇札記後會進入單篇閱讀。單篇閱讀中可以點「返回札記閱讀列表」回到列表，也可以點「前往編輯」回到寫札記頁修改內容。前往編輯只會載入該篇札記，仍需按「儲存札記」才會更新資料。</p>
            <p>手機版流程是「列表 → 單篇閱讀 → 返回列表」。桌機版則較接近左右分欄，左側用來搜尋、篩選與選擇札記，右側閱讀單篇內容。</p>
            <p>若只是想閱讀與查找，建議使用「札記閱讀」。若要批次挑選文章加入選稿編排，請使用「札記庫」。</p>
          </section>

          <section id="manual-content-library" class="manual-section">
            <h2>六、札記庫</h2>
            <p>「札記庫」保存已儲存的札記，也是管理、搜尋、編輯與挑選成書素材的地方。它和「札記閱讀」的用途不同：札記閱讀偏向安靜閱讀與查找；札記庫偏向整理、編輯與加入選稿編排。</p>
            <p>你可以用以下方式找到文章：</p>
            <ul>
              <li>搜尋：搜尋標題、摘要、內容與經文。</li>
              <li>日期篩選：依建立或更新日期縮小範圍。</li>
              <li>分類篩選：只看某一類札記。</li>
              <li>標籤篩選：只看帶有特定標籤的札記。</li>
              <li>清除篩選：回到完整列表。</li>
            </ul>
            <p>每張札記卡片可勾選，也可點「編輯」回到寫札記修改。若卡片顯示「已在書中」，代表這篇札記已被收錄在目前正在編排的選稿編排中，系統會避免重複加入。</p>
            <p>札記庫上方會顯示目前狀態：</p>
            <ul>
              <li>沒有目前正在編排：按鈕顯示「請先選擇編排」，可點「前往選稿編排」。</li>
              <li>已選 0 篇：提示先勾選札記，按鈕顯示「先勾選札記」。</li>
              <li>已選 1 篇以上：按鈕顯示「加入「{title}」（已選 {count} 篇）」。</li>
            </ul>
            <p>加入成功後，系統會清除勾選狀態並更新目前正在編排的章節數。若有重複札記，系統會略過並提示略過數量。</p>
          </section>

          <section id="manual-selection-workbench" class="manual-section">
            <h2>七、選稿編排</h2>
            <p>「選稿編排」用來管理成書前的內容安排。頁面分成三個區塊：目前正在編排、其他選稿編排、新增選稿編排。</p>
            <h3>目前正在編排</h3>
            <p>這是目前會接收札記庫文章的編排。卡片會顯示「正在編排」、已收錄幾篇札記、更新時間、日期範圍、分類、標籤與整理說明。</p>
            <p>目前正在編排的卡片提供「加入札記」、「整理章節」、「編輯設定」、「成書匯出設定」。這張卡片不會顯示「開始編這本」。</p>
            <h3>其他選稿編排</h3>
            <p>這裡顯示目前沒有被選為工作狀態的編排。每張卡片可點「開始編這本」切換成目前正在編排，也可點「整理章節」、「加入札記」、「編輯設定」或「刪除」。</p>
            <p>點選「開始編這本」後，該卡片會移到「目前正在編排」，原本的目前編排會回到其他選稿編排。畫面會立即更新並顯示切換提示。</p>
            <p>若建立選稿編排後，想修改編排代稱、整理說明、日期範圍、分類或標籤，可以在選稿編排卡片上點「編輯設定」。「編輯設定」只修改這份選稿編排的基本資料，不會直接改動已收錄的札記內容，也不會改變章節排序。若要調整章節順序或章節標題，請使用「整理章節」。</p>
            <h3>新增選稿編排</h3>
            <p>這裡可以建立新的編排，只需要先填「編排代稱」與「整理說明」。若目前沒有正在編排，新建立的編排會直接成為目前正在編排。若已經有目前編排，新編排會先放在其他選稿編排中。</p>
          </section>

          <section id="manual-chapter-arrangement" class="manual-section">
            <h2>八、整理章節</h2>
            <p>點「整理章節」會開啟章節整理視窗。若整理的是目前正在編排，標題會顯示「目前選稿編排：{title}」。若整理的是其他編排，標題會顯示「整理章節：{title}」，視窗內也會提供「開始編這本」。</p>
            <p>章節整理中可以做這些事：</p>
            <ul>
              <li>修改章節標題。</li>
              <li>使用「上移」與「下移」調整閱讀順序。</li>
              <li>使用「移除」把不適合的章節拿掉。</li>
              <li>勾選或取消「列入目錄」。</li>
              <li>點「儲存編排」保存章節調整。</li>
            </ul>
            <p>整理時建議先排出讀者容易理解的順序，再微調章節標題。手機版視窗可上下滑動，儲存前請確認調整已完成。</p>
          </section>

          <section id="manual-export" class="manual-section">
            <h2>九、成書匯出設定與 EPUB 匯出</h2>
            <p>成書匯出從「選稿編排」進入。先在目前正在編排的卡片或章節整理視窗中點「成書匯出設定」。</p>
            <p>成書匯出設定可補齊：</p>
            <ul>
              <li>書名與副標。</li>
              <li>作者。</li>
              <li>模板。</li>
              <li>書籍簡介。</li>
              <li>封面圖片。</li>
              <li>前言與後記。</li>
            </ul>
            <p>若只想先保存設定，可以點「儲存設定」。若要直接產生電子書，請點「儲存並匯出 EPUB」。匯出完成後，系統會把書加入書櫃，並在畫面提供「立即閱讀」、「下載 EPUB」與「前往書櫃」。</p>
            <p>下載後的 EPUB 可用 iOS「書籍」、Android「Google Play 圖書」或其他 EPUB 閱讀器開啟。</p>
          </section>

          <section id="manual-library" class="manual-section">
            <h2>十、書櫃</h2>
            <p>「書櫃」放的是已完成或已匯入的電子書。選稿編排是成書前的工作區，書櫃是成書後的閱讀與管理區。</p>
            <p>書櫃目前可看到預設聖經、系統匯出的書籍，以及外部匯入的 EPUB。書籍卡片會顯示封面、書名、來源、閱讀進度與操作按鈕。</p>
            <p>常用操作包含：</p>
            <ul>
              <li>開啟閱讀：進入內建 Reader 閱讀。</li>
              <li>下載 EPUB：下載可保存或分享的 EPUB 檔案。</li>
              <li>匯入 EPUB：選擇安全、正常的 EPUB 檔加入書櫃。</li>
              <li>刪除書籍：移除不需要的書籍。刪除前請先確認是否需要保留或下載。</li>
              <li>排序：依最近閱讀、最近建立或書名檢視。</li>
            </ul>
            <p>外部匯入 EPUB 通常保存在目前裝置與瀏覽器中。重要檔案建議另外保留原始 EPUB。</p>
          </section>

          <section id="manual-reader" class="manual-section">
            <h2>十一、閱讀器</h2>
            <p>從書櫃點「開啟閱讀」會進入 Reader。Reader 會顯示書名、章節內容、目前閱讀進度與頁碼。</p>
            <p>可以用以下方式操作：</p>
            <ul>
              <li>翻頁：使用上一頁、下一頁按鈕；桌機也可用左右方向鍵；手機可左右滑動翻頁。</li>
              <li>功能選單：點閱讀畫面可顯示或收合右上關閉按鈕與右下功能按鈕。</li>
              <li>目錄：從目錄快速跳到指定章節。</li>
              <li>搜尋：輸入中文關鍵字搜尋書內內容，點結果可跳到對應位置。</li>
              <li>閱讀設定：調整字級、行距與背景主題。</li>
              <li>目前閱讀位置：系統會記住最後閱讀位置，方便下次回來接續閱讀。</li>
              <li>手動書籤：可將目前位置加入書籤，之後從書籤列表快速跳回。</li>
            </ul>
            <p>閱讀完成或想回到書籍列表時，可使用「返回書櫃」或關閉閱讀器。手機版閱讀時，畫面會盡量保留閱讀空間，底部導覽不會遮住主要閱讀內容。若看不到目錄、搜尋或書籤按鈕，先點一下閱讀畫面讓功能按鈕顯示。</p>
          </section>

          <section id="manual-today-devotion" class="manual-section">
            <h2>十二、今日默想</h2>
            <p>「今日默想」會在總覽中顯示當日的靈修提醒或內容，幫助你從今天的經文與主題開始安靜思想。</p>
            <p>若今日默想內容已載入，卡片會顯示主題、經文或摘要。你可以點「寫成札記」，把今天的領受帶到寫札記頁，繼續補上自己的觀察、禱告與回應。</p>
            <p>若暫時看不到內容，可能是資料尚未載入或網路狀態不穩。可以稍候重新整理頁面，再回到總覽查看。</p>
          </section>

          <section id="manual-mobile" class="manual-section">
            <h2>十三、手機 / 平板使用方式</h2>
            <p>手機與平板主要使用底部導覽切換頁面，常見項目包含總覽、寫札記、札記庫、選稿編排、書櫃、操作手冊與管理。若項目較多，可以在底部導覽列左右滑動尋找。桌機版主要使用左側側欄。</p>
            <p>札記閱讀在手機上是單欄流程：先看列表，點一篇札記進入單篇閱讀，再用「返回札記閱讀列表」回到列表。桌機版則比較像左右分欄，左側選札記，右側閱讀內容。</p>
            <p>書櫃與 Reader 在手機上也可以正常閱讀。Reader 會把控制項收得比較精簡，讓閱讀內容不被底部導覽遮住。若沒有看到功能按鈕，可以先點一下閱讀畫面。</p>
            <p>在手機上編輯札記、整理章節或設定成書資料時，建議先確認儲存成功再離開頁面。若遇到畫面沒有更新，可先重新整理頁面，再回到原本功能確認。</p>
          </section>

          <section id="manual-account-data" class="manual-section">
            <h2>十四、帳號設定與資料</h2>
            <p>登入後，畫面會顯示帳號資訊與同步狀態。桌機可從側邊欄帳號卡進入「帳號設定」或「登出」；手機可在總覽中的帳號區塊操作。</p>
            <p>「帳號設定」可以查看目前帳號、上傳或移除頭像、修改密碼、上傳本機資料、下載雲端備份，也可以登出。若目前帳號有管理權限，帳號設定中也會顯示前往管理後台的入口。</p>
            <p>若目前使用雲端登入，札記、選稿編排與書櫃資料會依同步狀態與網路狀況保存。若使用本機模式、離線，或某些外部匯入資料，資料可能只保存在目前裝置與瀏覽器中。</p>
            <p>閱讀位置、外部 EPUB 與部分使用偏好可能依目前裝置保存。清除瀏覽器資料、更換裝置或更換瀏覽器前，建議先確認重要資料已有備份或下載檔案。</p>
          </section>

          <section id="manual-support-receipt" class="manual-section">
            <h2>十五、支持平台與收款證明</h2>
            <p>頁面下方有「支持平台／支持事工」入口。點開後可以查看支持資訊，也可以使用「申請收款證明」填寫申請表。</p>
            <p>收款證明申請表會請你填寫姓名或收據抬頭、Email、支持金額、轉帳日期、匯款帳號後五碼與備註。送出後，系統會通知平台管理端，再依你填寫的 Email 聯繫與處理。</p>
            <p>收款證明是支持款項收款紀錄，不作為稅務扣抵憑證。送出前請確認金額、日期與 Email 正確。</p>
          </section>

          <section id="manual-faq" class="manual-section">
            <h2>十六、常見問題</h2>
            <div class="manual-faq-list">
              <div class="manual-faq-item"><h3>找不到剛寫的札記怎麼辦？</h3><p>先到「札記閱讀」或「札記庫」確認。若有使用搜尋或篩選，請點「重設篩選」或「清除篩選」。也可以回到「寫札記」確認是否已儲存成功。</p></div>
              <div class="manual-faq-item"><h3>札記閱讀和札記庫有什麼差別？</h3><p>札記閱讀適合單純重讀、搜尋和查看單篇札記；札記庫適合管理札記、回到編輯器修改，或勾選文章加入目前正在編排。</p></div>
              <div class="manual-faq-item"><h3>禱告或代禱事項要寫在哪裡？</h3><p>可以直接寫在「寫札記」裡。分類可以選「禱告」或「代禱」，再用標籤補充對象或主題。日後可以在札記庫用分類或標籤搜尋，也可以整理成禱告操練或代禱紀錄。</p></div>
              <div class="manual-faq-item"><h3>可以用語音輸入寫札記嗎？</h3><p>可以。你可以使用手機或電腦內建的語音輸入法。手機可使用鍵盤上的麥克風；Windows 可按 Windows 鍵 + H；Mac 可使用系統聽寫。語音輸入後，建議再檢查文字內容，避免經文、人名或標點辨識錯誤。</p></div>
              <div class="manual-faq-item"><h3>如何申請支持款項收款證明？</h3><p>完成轉帳後，可在「支持平台／支持事工」中點選「申請收款證明」，填寫姓名或抬頭、Email、支持金額、轉帳日期與匯款帳號後五碼。系統會通知平台端處理，確認後會再依你填寫的 Email 聯繫。本證明為支持款項收款紀錄，不作為稅務扣抵憑證。</p></div>
              <div class="manual-faq-item"><h3>為什麼編輯區會出現 ##、{red}、{/red} 這些符號？</h3><p>這些是格式標記，用來讓系統在預覽與成書時轉成小標題或重點色。寫作時會先看到標記，點「預覽文章」後可以確認實際效果。</p></div>
              <div class="manual-faq-item"><h3>為什麼 {red}##重點{/red} 沒有正常變成小標題？</h3><p>小標題的 <code>##</code> 需要放在一行最前面，不能被顏色標記包住。如果想使用小標題，請寫成「## 重點整理」。如果想標記紅字，請另起一行寫「{red}這一句是重點。{/red}」。</p></div>
              <div class="manual-faq-item"><h3>小標題和重點色可以一起用嗎？</h3><p>建議分開使用。小標題用來整理文章結構，重點色用來強調正文短句。比較好的方式是讓小標題獨立一行，重點句另起一行。</p></div>
              <div class="manual-faq-item"><h3>為什麼預覽排版和我想像的不一樣？</h3><p>請先檢查是否有過多空白行、過長段落，或把小標題與重點色混在同一行。可以用「預覽文章」調整後再儲存。</p></div>
              <div class="manual-faq-item"><h3>經文很長時要怎麼放？</h3><p>可以使用經文區塊，但長經文建議分段，讓手機閱讀更舒服。</p></div>
              <div class="manual-faq-item"><h3>什麼時候用引用，什麼時候用經文區塊？</h3><p>引用適合短句或摘錄。經文區塊適合放完整經文段落。</p></div>
              <div class="manual-faq-item"><h3>為什麼加入按鈕不能按？</h3><p>可能尚未選擇目前正在編排，或目前已選 0 篇。請先到「選稿編排」建立或選擇一份編排，再回到札記庫勾選札記。</p></div>
              <div class="manual-faq-item"><h3>文章加入到哪一份編排？</h3><p>札記庫會加入目前正在編排的那一份選稿編排。狀態列會顯示「目前正在編排：{title}」。</p></div>
              <div class="manual-faq-item"><h3>如何切換目前正在編排？</h3><p>到「選稿編排」的「其他選稿編排」區塊，點想整理的卡片上的「開始編這本」。切換後該卡片會移到「目前正在編排」。</p></div>
              <div class="manual-faq-item"><h3>建立選稿編排後，可以修改標題或整理說明嗎？</h3><p>可以。到「選稿編排」頁，在該卡片點「編輯設定」，即可修改編排代稱、整理說明、日期範圍、分類與標籤。儲存後，卡片會立即更新。</p></div>
              <div class="manual-faq-item"><h3>刪除資料前會再確認嗎？</h3><p>會。刪除札記、選稿編排、書櫃書籍、移除頭像或執行較危險的還原操作前，系統會先顯示確認提示。確認前請先看清楚刪除對象，避免誤刪。</p></div>
              <div class="manual-faq-item"><h3>如果還沒儲存就關掉頁面，內容會不見嗎？</h3><p>系統會盡量暫存目前正在編輯的札記草稿。若瀏覽器重新整理、意外關閉或儲存失敗，回到「寫札記」頁時，會提示是否恢復尚未儲存的草稿。仍建議長篇內容寫到一段落就先儲存一次。</p></div>
              <div class="manual-faq-item"><h3>書櫃跟選稿編排有什麼差別？</h3><p>選稿編排用來整理成書前的章節與設定。書櫃用來閱讀、下載與管理已完成或已匯入的電子書。</p></div>
              <div class="manual-faq-item"><h3>為什麼手機底部選單可以左右滑動？</h3><p>手機螢幕較窄，底部導覽包含多個功能。可以左右滑動底部導覽列，找到書櫃、操作手冊或管理等項目。桌機版則使用左側側欄。</p></div>
              <div class="manual-faq-item"><h3>EPUB 下載後怎麼打開？</h3><p>iPhone / iPad 可用「書籍」App。Android 可用「Google Play 圖書」或其他支援 EPUB 的閱讀器。桌機可用支援 EPUB 的閱讀軟體或瀏覽器擴充功能。</p></div>
              <div class="manual-faq-item"><h3>外部 EPUB 匯入失敗怎麼辦？</h3><p>請確認檔案是 EPUB、大小未超過限制，且沒有 DRM 保護。若檔案結構特殊或已損壞，系統可能無法解析。</p></div>
            </div>
          </section>

          <section id="manual-feedback" class="manual-section">
            <h2>十七、使用問題與意見回饋</h2>
            <p>如果你在使用靈修札記成書系統時遇到問題，或有功能建議，歡迎來信：</p>
            <p class="manual-feedback-email"><button class="footer-email-copy" type="button" data-copy-support-email>${SUPPORT_EMAIL}</button></p>
            <p>來信時可以簡單附上使用裝置、遇到的頁面、問題描述。若方便，也可以附上截圖，方便我們判斷問題。</p>
          </section>

          <section id="manual-admin-backup" class="manual-section">
            <h2>十八、管理者附錄</h2>
            <p>管理後台主要供授權管理者使用，一般使用者平常不需要進入，也不需要操作備份、還原或平台用量等管理功能。</p>
            <p>若帳號沒有管理權限，系統會回到一般頁面或顯示無權限提示。若你只是撰寫、閱讀或整理自己的札記，可以略過本節。</p>
            <p>備份、還原與平台用量檢查都屬於管理操作，請由管理者在確認目的與影響後再使用。</p>
          </section>

          <section id="manual-closing-note" class="manual-section manual-closing">
            <h2>十九、給使用者的一點提醒</h2>
            <p>這套系統的目的，是幫助你把平常寫下的內容好好保存下來。</p>
            <p>不用一開始就想著要完成一本很完整的書。可以先從一篇札記開始，慢慢累積，慢慢整理。</p>
            <p>當那些日子裡的領受、禱告、眼淚、感恩與提醒被留下來，它們有一天可能就會成為一本值得回頭閱讀的書。</p>
          </section>
        </article>
      </section>
    `;
    libraryView?.insertAdjacentElement('beforebegin', section);
  }

  els.viewNavLinks = [...document.querySelectorAll('.desktop-sidebar-link[data-view], .mobile-bottom-link[data-view], .nav-link[data-view]')];
  els.views = [...document.querySelectorAll('.view')];
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
function shouldSkipPassiveCloudReload(reason, minIntervalMs = 0) {
  if (!minIntervalMs) return false;
  const now = Date.now();
  const elapsed = now - Number(state.lastPassiveCloudReloadAt || 0);
  if (elapsed < minIntervalMs) {
    egressGuardInfo('cloudReload:skip-passive', { reason, elapsed, minIntervalMs });
    return true;
  }
  state.lastPassiveCloudReloadAt = now;
  return false;
}
function requestCloudReload(reason = '雲端更新', options = {}) {
  if (!(state.supabase && state.currentUser)) return Promise.resolve();
  if (shouldSkipPassiveCloudReload(reason, options.minIntervalMs || 0)) return Promise.resolve();
  if (state.cloudReloadPromise) {
    egressDebugLog('cloudReload:coalesced', { reason });
    return state.cloudReloadPromise;
  }
  egressDebugLog('cloudReload:start', { reason });
  state.cloudReloadPromise = loadAllData({
    silent: options.silent ?? true,
    syncReason: reason,
    reason,
    minIntervalMs: options.minIntervalMs || 0,
    force: !!options.force,
  }).catch(error => {
    if (options.handleError === false) {
      console.error(error);
      return;
    }
    handleError(error);
  }).finally(() => {
    state.cloudReloadPromise = null;
    egressDebugLog('cloudReload:end', { reason });
  });
  return state.cloudReloadPromise;
}
function scheduleCloudReload(reason = '雲端更新', options = {}) {
  state.pendingCloudReloadReason = reason;
  clearTimeout(state.syncReloadTimer);
  state.syncReloadTimer = setTimeout(() => {
    const nextReason = state.pendingCloudReloadReason || reason;
    state.pendingCloudReloadReason = '';
    requestCloudReload(nextReason, options);
  }, options.debounceMs ?? CLOUD_RELOAD_DEBOUNCE_MS);
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
    }, () => {
      setSyncState({ status: '等待同步', detail: '背景資料有更新，稍後會自動同步。' });
      scheduleCloudReload('其他裝置有更新，已重新同步。', {
        minIntervalMs: PASSIVE_CLOUD_RELOAD_MIN_INTERVAL_MS,
        debounceMs: CLOUD_RELOAD_DEBOUNCE_MS,
      });
    });
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
  showToast(`已上傳：札記 ${notesToUpload.length}、書籍 ${booksToUpload.length}`);
}
function buildBackupPayload(exportedAtIso = nowIso()) {
  const drafts = Array.isArray(state.books) ? state.books : [];
  const library = getAllLibraryBooksForView({ includeSystem: false }).map(book => {
    const source = book.source === 'imported_epub' ? 'imported_epub' : 'generated';
    const clone = JSON.parse(JSON.stringify(book || {}));
    return {
      ...clone,
      source,
    };
  });
  return {
    version: 'v1',
    exportedAt: formatDate(exportedAtIso),
    user: state.currentUser?.email || '',
    notes: Array.isArray(state.notes) ? state.notes : [],
    drafts,
    library: Array.isArray(library) ? library : [],
  };
}

function getBackupFilename(prefix = 'devotion-backup', stampSource = nowIso()) {
  const date = new Date(stampSource);
  const stamp = Number.isNaN(date.getTime())
    ? 'backup'
    : `${String(date.getFullYear())}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`;
  return `${prefix}-${stamp}.json`;
}

function downloadBackupJson() {
  requireUser();
  const exportedAtIso = nowIso();
  const payload = buildBackupPayload(exportedAtIso);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  downloadBlob(getBackupFilename('devotion-backup', exportedAtIso), blob);
  showToast('備份 JSON 已下載。');
}

async function downloadSystemBackup() {
  requireUser();
  if (!isAdminUser()) throw new Error('只有管理者可以下載系統備份。');
  if (!state.supabase) throw new Error('系統備份需要 Supabase 雲端模式。');
  const confirmed = await openTwoStepConfirmDialog({
    first: {
      title: '確定要執行系統備份嗎？',
      message: '系統備份會下載大量雲端資料，可能增加 Supabase Egress。確定要繼續嗎？',
      confirmText: '繼續備份',
      danger: true,
    },
    second: {
      title: '再次確認系統備份',
      message: '請再次確認是否執行系統備份。若目前正在處理流量異常，建議暫停備份。',
      confirmText: '確認執行備份',
      danger: true,
    },
  });
  if (!confirmed) {
    egressGuardWarn('systemBackup:cancelled-before-fetch');
    return;
  }
  const { data } = await state.supabase.auth.getSession();
  const sessionAccessToken = String(data?.session?.access_token || '').trim();
  if (!sessionAccessToken) throw new Error('目前找不到有效的登入 session，請重新登入後再試。');
  const exportedAtIso = nowIso();
  const response = await fetch('/api/system-backup', {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${sessionAccessToken}`,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const missing = Array.isArray(payload?.missing)
      ? payload.missing.filter(item => typeof item === 'string' && item.trim())
      : [];
    const table = String(payload?.table || '').trim();
    const errorCode = String(payload?.error || '').trim();
    let detail = '';

    if (errorCode === 'missing_env' && missing.length) {
      detail = `缺少環境變數 ${missing.join(', ')}`;
    } else if (errorCode === 'db_backup_query_failed' && table) {
      detail = `資料表 ${table} 查詢失敗`;
    } else if (response.status === 403 || errorCode === 'forbidden') {
      detail = '權限不足';
    } else if (response.status === 401 || errorCode === 'unauthorized') {
      detail = '登入已失效或驗證失敗';
    } else if (errorCode === 'auth_verification_failed') {
      detail = '管理者驗證失敗';
    } else if (typeof payload?.message === 'string' && payload.message.trim()) {
      detail = payload.message.trim();
    } else {
      detail = `HTTP ${response.status}`;
    }

    throw new Error(`系統備份下載失敗：${detail}`);
  }
  const dbBackup = payload?.dbBackup && typeof payload.dbBackup === 'object' ? payload.dbBackup : {
    devotion_notes: [],
    book_projects: [],
    library_books: [],
    library_book_chapters: [],
  };
  const bundle = {
    systemInfo: {
      version: 'v1',
      exportedAt: formatDate(exportedAtIso),
      project: 'devotion-book',
      note: 'System backup bundle',
    },
    envTemplate: {
      SUPABASE_URL: '',
      SUPABASE_ANON_KEY: '',
      SUPABASE_PROJECT_REF: '',
    },
    appBackup: buildBackupPayload(exportedAtIso),
    dbBackup,
  };
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json;charset=utf-8' });
  downloadBlob(getBackupFilename('devotion-system-backup', exportedAtIso), blob);
  showToast('系統備份已下載。');
}

function loadAutoBackupMeta() {
  const raw = loadJson(STORAGE_KEYS.autoBackupMeta, {});
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
}

function saveAutoBackupMeta(meta = {}) {
  saveJson(STORAGE_KEYS.autoBackupMeta, meta && typeof meta === 'object' ? meta : {});
}

function trimAutoBackupMeta(meta = {}, now = new Date()) {
  const next = meta && typeof meta === 'object' && !Array.isArray(meta) ? { ...meta } : {};
  const base = new Date(now);
  base.setHours(0, 0, 0, 0);
  const keep = new Set();
  for (let index = 0; index < 7; index += 1) {
    const current = new Date(base);
    current.setDate(base.getDate() - index);
    keep.add(`${String(current.getFullYear())}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`);
  }
  Object.keys(next).forEach((dateKey) => {
    if (!keep.has(dateKey)) delete next[dateKey];
  });
  return next;
}

function loadAutoBackups() {
  const raw = loadJson(STORAGE_KEYS.autoBackups, []);
  if (!Array.isArray(raw)) return [];
  return raw.filter(entry => {
    if (!entry || typeof entry !== 'object') return false;
    if (!entry.data || typeof entry.data !== 'object') return false;
    return isValidBackupJson(entry.data);
  });
}

function isStorageQuotaError(error) {
  const name = String(error?.name || '');
  const message = String(error?.message || error || '');
  return name === 'QuotaExceededError'
    || name === 'NS_ERROR_DOM_QUOTA_REACHED'
    || error?.code === 22
    || error?.code === 1014
    || /quota|exceeded/i.test(message);
}

function saveAutoBackups(backups = []) {
  let list = Array.isArray(backups) ? backups.slice(-AUTO_BACKUP_MAX_ITEMS) : [];
  while (list.length) {
    try {
      saveJson(STORAGE_KEYS.autoBackups, list);
      return true;
    } catch (error) {
      if (!isStorageQuotaError(error)) throw error;
      console.warn('auto backup storage quota reached; dropping older backup and retrying', error);
      list = list.slice(1);
    }
  }
  try {
    localStorage.removeItem(STORAGE_KEYS.autoBackups);
  } catch (error) {
    console.warn('auto backup storage cleanup skipped', error);
  }
  return false;
}

function getCurrentAutoBackupSlot(date = new Date()) {
  const hour = Number(date.getHours());
  if (hour >= 20) return '20';
  if (hour >= 14) return '14';
  if (hour >= 8) return '08';
  return '';
}

function performAutoBackup(slot = '') {
  if (!slot || !state.currentUser) return false;
  const exportedAtIso = nowIso();
  const payload = buildBackupPayload(exportedAtIso);
  const backups = loadAutoBackups();
  backups.push({
    id: Date.now(),
    exportedAt: payload.exportedAt,
    user: payload.user || '',
    slot,
    data: payload,
  });
  return saveAutoBackups(backups);
}

function runAutoBackupCheck() {
  if (!state.currentUser || state.isAutoBackingUp) return;
  const now = new Date();
  const slot = getCurrentAutoBackupSlot(now);
  if (!slot) return;
  const currentUserEmail = String(state.currentUser?.email || '').trim().toLowerCase();
  if (!currentUserEmail) return;
  const currentDate = `${String(now.getFullYear())}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const failedSlotKey = `${state.currentUser?.id || currentUserEmail}|${currentDate}|${slot}`;
  if (state.autoBackupFailedSlots.has(failedSlotKey)) return;
  state.isAutoBackingUp = true;
  try {
    const meta = trimAutoBackupMeta(loadAutoBackupMeta(), now);
    const dayMeta = meta[currentDate] && typeof meta[currentDate] === 'object' && !Array.isArray(meta[currentDate])
      ? { ...meta[currentDate] }
      : {};
    const userMeta = dayMeta[currentUserEmail] && typeof dayMeta[currentUserEmail] === 'object' && !Array.isArray(dayMeta[currentUserEmail])
      ? { ...dayMeta[currentUserEmail] }
      : { '08': false, '14': false, '20': false };
    if (userMeta[slot]) return;
    const saved = performAutoBackup(slot);
    if (!saved) {
      state.autoBackupFailedSlots.add(failedSlotKey);
      return;
    }
    userMeta[slot] = true;
    dayMeta[currentUserEmail] = userMeta;
    meta[currentDate] = dayMeta;
    saveAutoBackupMeta(trimAutoBackupMeta(meta, now));
  } catch (error) {
    state.autoBackupFailedSlots.add(failedSlotKey);
    console.warn('auto backup skipped', error);
  } finally {
    state.isAutoBackingUp = false;
  }
}

function downloadAutoBackupById(backupId = '') {
  const item = loadAutoBackups().find(entry => String(entry.id || '') === String(backupId || ''));
  if (!item?.data) throw new Error('找不到指定的自動備份資料。');
  const blob = new Blob([JSON.stringify(item.data, null, 2)], { type: 'application/json;charset=utf-8' });
  downloadBlob(getBackupFilename('devotion-auto-backup', item.id || item.exportedAt || nowIso()), blob);
}

function renderAutoBackupSection() {
  const backups = loadAutoBackups().slice().reverse();
  if (!backups.length) {
    return `
      <section class="admin-dashboard-section">
        <div>
          <h3>自動備份（每日三次）</h3>
          <p class="muted">系統會在 08:00 / 14:00 / 20:00 自動備份（需開啟網站）。</p>
        </div>
        <div class="empty-state">尚無自動備份</div>
      </section>
    `;
  }
  return `
    <section class="admin-dashboard-section">
      <div>
        <h3>自動備份（每日三次）</h3>
        <p class="muted">系統會在 08:00 / 14:00 / 20:00 自動備份（需開啟網站）。</p>
      </div>
      <div class="list-stack">
        ${backups.map(item => `
          <article class="card">
            <div class="card-main">
              <strong>${escapeHtml(String(item.exportedAt || '未記錄'))}</strong>
              <div class="card-meta">
                <span>${escapeHtml(String(item.user || '未顯示帳號'))}</span>
                <span>slot ${escapeHtml(String(item.slot || ''))}</span>
              </div>
            </div>
            <div class="card-actions">
              <button class="ghost-btn" type="button" data-download-auto-backup="${escapeHtml(String(item.id || ''))}">下載</button>
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function isValidBackupJson(payload) {
  return !!(
    payload
    && typeof payload === 'object'
    && typeof payload.version === 'string'
    && Array.isArray(payload.notes)
    && Array.isArray(payload.drafts)
    && Array.isArray(payload.library)
  );
}

function setBackupImportPreview(next = {}) {
  state.backupImportPreview = {
    status: next.status || 'idle',
    error: next.error || '',
    data: next.data || null,
    backup: next.backup || null,
    result: next.result || null,
  };
}

function renderBackupImportPreview() {
  const preview = state.backupImportPreview;
  const restoreStatusBlock = state.restoreStatusMessage
    ? `<div class="panel compact"><p class="caption">${escapeHtml(state.restoreStatusMessage)}</p></div>`
    : '';
  if (preview.status === 'error') {
    return `${restoreStatusBlock}<div class="empty-state">${escapeHtml(preview.error || '備份格式不正確')}</div>`;
  }
  if (preview.status !== 'ready' || !preview.data) {
    return `${restoreStatusBlock}<div class="empty-state">尚未選擇備份檔，匯入後會先顯示預覽資訊，不會寫入任何資料。</div>`;
  }

  const data = preview.data;
  const currentEmail = getCurrentUserEmail();
  const backupEmail = String(data.user || '').trim().toLowerCase();
  const userMismatchWarning = currentEmail && backupEmail && currentEmail !== backupEmail
    ? `<div class="panel compact"><p class="caption">警告：這份備份的使用者是 ${escapeHtml(String(data.user || ''))}，與目前登入帳號 ${escapeHtml(String(state.currentUser?.email || ''))} 不一致。系統不會阻擋，但請再次確認是否要還原。</p></div>`
    : '';
  return `
    ${restoreStatusBlock}
    <div class="admin-summary-grid">
      <article class="admin-stat-card">
        <span class="admin-stat-label">version</span>
        <strong class="admin-stat-value admin-stat-value-placeholder">${escapeHtml(String(data.version || ''))}</strong>
      </article>
      <article class="admin-stat-card">
        <span class="admin-stat-label">exportedAt</span>
        <strong class="admin-stat-value admin-stat-value-placeholder">${escapeHtml(String(data.exportedAt || '未記錄'))}</strong>
      </article>
      <article class="admin-stat-card">
        <span class="admin-stat-label">user</span>
        <strong class="admin-stat-value admin-stat-value-email">${escapeHtml(String(data.user || ''))}</strong>
      </article>
      <article class="admin-stat-card">
        <span class="admin-stat-label">notes</span>
        <strong class="admin-stat-value">${escapeHtml(String(data.notesCount || 0))}</strong>
      </article>
      <article class="admin-stat-card">
        <span class="admin-stat-label">drafts</span>
        <strong class="admin-stat-value">${escapeHtml(String(data.draftsCount || 0))}</strong>
      </article>
      <article class="admin-stat-card">
        <span class="admin-stat-label">library</span>
        <strong class="admin-stat-value">${escapeHtml(String(data.libraryCount || 0))}</strong>
        <p class="caption">generated：${escapeHtml(String(data.generatedCount || 0))}｜imported_epub：${escapeHtml(String(data.importedEpubCount || 0))}</p>
      </article>
    </div>
    ${userMismatchWarning}
    ${preview.result ? `
      <div class="panel compact">
        <h4>還原結果</h4>
        <p class="caption">新增 notes：${escapeHtml(String(preview.result.addedNotes || 0))} 筆｜跳過 notes：${escapeHtml(String(preview.result.skippedNotes || 0))} 筆</p>
        <p class="caption">新增 drafts：${escapeHtml(String(preview.result.addedDrafts || 0))} 筆｜跳過 drafts：${escapeHtml(String(preview.result.skippedDrafts || 0))} 筆</p>
        <p class="caption">新增 library：${escapeHtml(String(preview.result.addedLibrary || 0))} 筆｜跳過 library：${escapeHtml(String(preview.result.skippedLibrary || 0))} 筆</p>
      </div>
    ` : ''}
  `;
}

function handleBackupImportSelection(event) {
  const input = event?.target;
  const file = input?.files?.[0];
  if (!file) return;

  const resetInput = () => {
    if (input) input.value = '';
  };

  if (!/\.json$/i.test(file.name)) {
    setBackupImportPreview({ status: 'error', error: '備份格式不正確' });
    refreshUi();
    showToast('備份格式不正確');
    resetInput();
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(String(reader.result || '{}'));
      if (!isValidBackupJson(payload)) {
        setBackupImportPreview({ status: 'error', error: '備份格式不正確' });
        refreshUi();
        showToast('備份格式不正確');
        resetInput();
        return;
      }
      if (payload.version !== 'v1') {
        setBackupImportPreview({ status: 'error', error: '不支援的備份版本' });
        refreshUi();
        showToast('不支援的備份版本');
        resetInput();
        return;
      }
      const library = Array.isArray(payload.library) ? payload.library : [];
      const generatedCount = library.filter(item => String(item?.source || 'generated') === 'generated').length;
      const importedEpubCount = library.filter(item => String(item?.source || '') === 'imported_epub').length;
      setBackupImportPreview({
        status: 'ready',
        backup: payload,
        data: {
          version: payload.version,
          exportedAt: payload.exportedAt || '',
          user: payload.user || '',
          notesCount: Array.isArray(payload.notes) ? payload.notes.length : 0,
          draftsCount: Array.isArray(payload.drafts) ? payload.drafts.length : 0,
          libraryCount: library.length,
          generatedCount,
          importedEpubCount,
        },
      });
      refreshUi();
      showToast('已載入備份預覽。');
    } catch {
      setBackupImportPreview({ status: 'error', error: '備份格式不正確' });
      refreshUi();
      showToast('備份格式不正確');
    } finally {
      resetInput();
    }
  };
  reader.onerror = () => {
    setBackupImportPreview({ status: 'error', error: '備份格式不正確' });
    refreshUi();
    showToast('備份格式不正確');
    resetInput();
  };
  reader.readAsText(file, 'utf-8');
}

async function getExistingNoteIdsForRestore() {
  const userId = getUserId();
  if (state.supabase) {
    const { data, error } = await state.supabase.from('devotion_notes').select('id').eq('user_id', userId);
    if (error) throw error;
    return new Set((data || []).map(item => String(item.id || '')).filter(Boolean));
  }
  return new Set(
    loadJson(STORAGE_KEYS.notes, [])
      .filter(item => item.user_id === userId)
      .map(item => String(item.id || ''))
      .filter(Boolean),
  );
}

async function getExistingDraftIdsForRestore() {
  const userId = getUserId();
  if (state.supabase) {
    const { data, error } = await state.supabase.from('book_projects').select('id').eq('user_id', userId);
    if (error) throw error;
    return new Set((data || []).map(item => String(item.id || '')).filter(Boolean));
  }
  return new Set(
    loadJson(STORAGE_KEYS.books, [])
      .filter(item => item.user_id === userId)
      .map(item => String(item.id || ''))
      .filter(Boolean),
  );
}

async function getExistingGeneratedLibraryIdsForRestore() {
  const userId = getUserId();
  if (state.supabase) {
    const { data, error } = await state.supabase.from('library_books').select('id').eq('user_id', userId);
    if (error) throw error;
    return new Set((data || []).map(item => String(item.id || '')).filter(Boolean));
  }
  return new Set(cloudLibrary.books.map(book => String(book.id || '')).filter(Boolean));
}

async function getExistingLibraryChapterIdsForRestore() {
  const userId = getUserId();
  if (!state.supabase) return new Set();
  const { data, error } = await state.supabase.from('library_book_chapters').select('id').eq('user_id', userId);
  if (error) throw error;
  return new Set((data || []).map(item => String(item.id || '')).filter(Boolean));
}

function createRestoredImportedBook(item = {}, suffix = `${Date.now()}`) {
  const originalId = String(item?.id || createImportedBookId());
  const restoredId = `${originalId}-restored-${suffix}`;
  const chapters = Array.isArray(item?.chapters) ? item.chapters : [];
  return normalizeImportedBook({
    ...item,
    id: restoredId,
    chapters: chapters.map((chapter, index) => ({
      ...chapter,
      id: `${String(chapter?.id || `imported_chapter_${originalId}_${index}`)}-restored-${suffix}`,
      book_id: restoredId,
    })),
  });
}

function buildGeneratedLibraryBookRow(item = {}, userId = '') {
  return {
    id: item.id,
    user_id: userId,
    title: item.title || '未命名書籍',
    author: item.author || '',
    description: item.description || '',
    cover_image_path: item.cover_image_path || '',
    epub_file_path: item.epub_file_path || '',
    last_read_at: item.last_read_at || item.lastReadAt || null,
    reading_progress: Number(item.reading_progress || item.readingProgress || 0),
    total_chapters: Number(item.total_chapters || item.totalChapters || 0),
    current_chapter: Number(item.current_chapter || item.currentChapter || 0),
    source_project_id: item.source_project_id || null,
    source_compilation_id: item.source_compilation_id || null,
    version: item.version || '1.0.0',
    is_archived: !!item.is_archived,
    created_at: item.created_at || nowIso(),
    updated_at: item.updated_at || item.created_at || nowIso(),
  };
}

function buildGeneratedLibraryChapterRows(item = {}, userId = '') {
  const chapters = Array.isArray(item.library_book_chapters)
    ? item.library_book_chapters
    : (Array.isArray(item.chapters) ? item.chapters : []);
  return normalizeLibraryChapters(chapters).map((chapter, index) => ({
    id: String(chapter.id || uid('library_chapter')),
    user_id: userId,
    book_id: item.id,
    title: chapter.title || `第 ${index + 1} 章`,
    chapter_order: Number(chapter.chapter_order || index),
    href: chapter.href || chapter.chapter_path || '',
    chapter_path: chapter.chapter_path || chapter.href || '',
    progress: Number(chapter.progress || 0),
  }));
}

async function clearImportedLibraryBlobs() {
  const db = await openImportedLibraryDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(importedLibrary.storeName, 'readwrite');
    tx.objectStore(importedLibrary.storeName).clear();
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function captureImportedLibraryBlobSnapshot(books = []) {
  const entries = await Promise.all(books.map(async (book) => {
    const stored = await getImportedBookBlob(book.id);
    return stored ? { id: book.id, epubBlob: stored.epubBlob || null, coverBlob: stored.coverBlob || null } : null;
  }));
  return entries.filter(Boolean);
}

async function restoreImportedLibraryBlobSnapshot(entries = []) {
  await clearImportedLibraryBlobs();
  for (const entry of entries) {
    if (!entry?.id || !entry.epubBlob) continue;
    await saveImportedBookBlob(entry.id, entry.epubBlob, entry.coverBlob || null);
  }
}

async function captureDangerRestoreSnapshot() {
  const snapshot = {
    notes: JSON.parse(JSON.stringify(state.notes || [])),
    drafts: JSON.parse(JSON.stringify(state.books || [])),
    generatedLibrary: [],
    importedLibrary: JSON.parse(JSON.stringify(importedLibrary.books || [])),
    importedBlobs: await captureImportedLibraryBlobSnapshot(importedLibrary.books || []),
  };
  if (state.supabase) {
    const generatedLibrary = [];
    for (const book of cloudLibrary.books) {
      let chapters = cloudLibrary.chapters.get(book.id) || [];
      if (!chapters.length) {
        try {
          chapters = await loadLibraryBookChapters(book.id);
        } catch (error) {
          console.warn('讀取書櫃章節快照失敗', error);
        }
      }
      generatedLibrary.push({
        ...JSON.parse(JSON.stringify(book || {})),
        library_book_chapters: JSON.parse(JSON.stringify(chapters || [])),
        source: 'generated',
      });
    }
    snapshot.generatedLibrary = generatedLibrary;
  }
  return snapshot;
}

async function clearDangerRestoreData(userId = '') {
  if (state.supabase) {
    await state.supabase.from('library_book_chapters').delete().eq('user_id', userId);
    await state.supabase.from('library_books').delete().eq('user_id', userId);
    await state.supabase.from('devotion_notes').delete().eq('user_id', userId);
    await state.supabase.from('book_projects').delete().eq('user_id', userId);
  } else {
    saveJson(STORAGE_KEYS.notes, loadJson(STORAGE_KEYS.notes, []).filter(item => item.user_id !== userId));
    saveJson(STORAGE_KEYS.books, loadJson(STORAGE_KEYS.books, []).filter(item => item.user_id !== userId));
  }
  saveImportedLibraryBooks([]);
  await clearImportedLibraryBlobs();
}

async function writeDangerRestoreNotes(notes = [], userId = '') {
  const payloadNotes = (Array.isArray(notes) ? notes : []).map(note => ({ ...note, user_id: userId }));
  if (state.supabase) {
    if (payloadNotes.length) {
      const { error } = await state.supabase.from('devotion_notes').insert(payloadNotes);
      if (error) throw error;
    }
  } else {
    const otherNotes = loadJson(STORAGE_KEYS.notes, []).filter(item => item.user_id !== userId);
    saveJson(STORAGE_KEYS.notes, [...payloadNotes, ...otherNotes]);
  }
}

async function writeDangerRestoreDrafts(drafts = [], userId = '') {
  const payloadDrafts = (Array.isArray(drafts) ? drafts : []).map(draft => ({ ...draft, user_id: userId }));
  if (state.supabase) {
    if (payloadDrafts.length) {
      const payload = payloadDrafts.map(draft => ({ ...draft, chapters: JSON.stringify(draft.chapters || []) }));
      const { error } = await state.supabase.from('book_projects').insert(payload);
      if (error) throw error;
    }
  } else {
    const otherDrafts = loadJson(STORAGE_KEYS.books, []).filter(item => item.user_id !== userId);
    saveJson(STORAGE_KEYS.books, [...payloadDrafts, ...otherDrafts]);
  }
}

async function writeDangerRestoreLibrary(library = [], userId = '') {
  const list = Array.isArray(library) ? library : [];
  const generatedLibraryItems = list.filter(item => String(item?.source || 'generated') === 'generated');
  const importedLibraryItems = list.filter(item => String(item?.source || '') === 'imported_epub').map(item => normalizeImportedBook(item));
  if (state.supabase) {
    if (generatedLibraryItems.length) {
      const bookRows = generatedLibraryItems.map(item => buildGeneratedLibraryBookRow(item, userId));
      const { error: libraryError } = await state.supabase.from('library_books').insert(bookRows);
      if (libraryError) throw libraryError;
      const chapterRows = generatedLibraryItems.flatMap(item => buildGeneratedLibraryChapterRows(item, userId));
      if (chapterRows.length) {
        const { error: chapterError } = await state.supabase.from('library_book_chapters').insert(chapterRows);
        if (chapterError) throw chapterError;
      }
    }
  }
  saveImportedLibraryBooks(importedLibraryItems);
}

async function rollbackDangerRestore(snapshot, userId = '') {
  await clearDangerRestoreData(userId);
  await writeDangerRestoreNotes(snapshot.notes || [], userId);
  await writeDangerRestoreDrafts(snapshot.drafts || [], userId);
  await writeDangerRestoreLibrary([
    ...(snapshot.generatedLibrary || []),
    ...(snapshot.importedLibrary || []),
  ], userId);
  await restoreImportedLibraryBlobSnapshot(snapshot.importedBlobs || []);
}

async function requestDangerRestoreConfirmation(backup = {}) {
  const notesCount = Array.isArray(backup.notes) ? backup.notes.length : 0;
  const draftsCount = Array.isArray(backup.drafts) ? backup.drafts.length : 0;
  const libraryCount = Array.isArray(backup.library) ? backup.library.length : 0;
  const currentEmail = getCurrentUserEmail();
  const backupEmail = String(backup.user || '').trim().toLowerCase();
  const mismatchWarning = currentEmail && backupEmail && currentEmail !== backupEmail
    ? `\n\n警告：備份使用者 ${String(backup.user || '')} 與目前登入帳號 ${String(state.currentUser?.email || '')} 不一致。`
    : '';
  return openConfirmDialog({
    title: '確定要執行覆蓋還原嗎？',
    message: `這可能會覆蓋目前資料。請確認已經備份後再繼續。\n\n備份內容：札記 ${notesCount} 筆、選稿編排 ${draftsCount} 份、書櫃 ${libraryCount} 本。${mismatchWarning}`,
    confirmText: '確認還原',
    danger: true,
    requiredText: 'RESTORE',
    requiredTextLabel: '請輸入 RESTORE 以確認還原',
  });
}

function setRestoreStatusMessage(message = '') {
  state.restoreStatusMessage = String(message || '');
  refreshUi();
}

async function restoreBackupMerge() {
  requireUser();
  const backup = state.backupImportPreview.backup;
  if (!backup || state.backupImportPreview.status !== 'ready') {
    throw new Error('請先匯入並預覽有效的備份 JSON。');
  }

  const userId = getUserId();
  const result = {
    addedNotes: 0,
    skippedNotes: 0,
    addedDrafts: 0,
    skippedDrafts: 0,
    addedLibrary: 0,
    skippedLibrary: 0,
  };

  const backupNotes = Array.isArray(backup.notes) ? backup.notes : [];
  const backupDrafts = Array.isArray(backup.drafts) ? backup.drafts : [];
  const backupLibrary = Array.isArray(backup.library) ? backup.library : [];

  const existingNoteIds = await getExistingNoteIdsForRestore();
  const newNotes = backupNotes
    .filter(note => {
      const id = String(note?.id || '');
      const exists = !id || existingNoteIds.has(id);
      if (exists) result.skippedNotes += 1;
      if (!exists) existingNoteIds.add(id);
      return !exists;
    })
    .map(note => ({ ...note, user_id: userId }));
  result.addedNotes = newNotes.length;

  if (newNotes.length) {
    if (state.supabase) {
      const { error } = await state.supabase.from('devotion_notes').insert(newNotes);
      if (error) throw error;
    } else {
      const notes = loadJson(STORAGE_KEYS.notes, []);
      saveJson(STORAGE_KEYS.notes, [...newNotes, ...notes]);
    }
  }

  const existingDraftIds = await getExistingDraftIdsForRestore();
  const newDrafts = backupDrafts
    .filter(draft => {
      const id = String(draft?.id || '');
      const exists = !id || existingDraftIds.has(id);
      if (exists) result.skippedDrafts += 1;
      if (!exists) existingDraftIds.add(id);
      return !exists;
    })
    .map(draft => ({ ...draft, user_id: userId }));
  result.addedDrafts = newDrafts.length;

  if (newDrafts.length) {
    if (state.supabase) {
      const payload = newDrafts.map(draft => ({ ...draft, chapters: JSON.stringify(draft.chapters || []) }));
      const { error } = await state.supabase.from('book_projects').insert(payload);
      if (error) throw error;
    } else {
      const books = loadJson(STORAGE_KEYS.books, []);
      saveJson(STORAGE_KEYS.books, [...newDrafts, ...books]);
    }
  }

  const generatedLibraryItems = backupLibrary.filter(item => String(item?.source || 'generated') === 'generated');
  const importedLibraryItems = backupLibrary.filter(item => String(item?.source || '') === 'imported_epub');

  const existingGeneratedIds = await getExistingGeneratedLibraryIdsForRestore();
  const newGeneratedBooks = generatedLibraryItems.filter(item => {
    const id = String(item?.id || '');
    const exists = !id || existingGeneratedIds.has(id);
    if (exists) result.skippedLibrary += 1;
    if (!exists) existingGeneratedIds.add(id);
    return !exists;
  });

  if (newGeneratedBooks.length && state.supabase) {
    const existingChapterIds = await getExistingLibraryChapterIdsForRestore();
    const bookRows = newGeneratedBooks.map(item => ({
      id: item.id,
      user_id: userId,
      title: item.title || '未命名書籍',
      author: item.author || '',
      description: item.description || '',
      cover_image_path: item.cover_image_path || '',
      epub_file_path: item.epub_file_path || '',
      last_read_at: item.last_read_at || null,
      reading_progress: Number(item.reading_progress || 0),
      total_chapters: Number(item.total_chapters || item.totalChapters || 0),
      current_chapter: Number(item.current_chapter || item.currentChapter || 0),
      source_project_id: item.source_project_id || null,
      source_compilation_id: item.source_compilation_id || null,
      version: item.version || '1.0.0',
      is_archived: !!item.is_archived,
      created_at: item.created_at || nowIso(),
      updated_at: item.updated_at || item.created_at || nowIso(),
    }));
    const { error: libraryError } = await state.supabase.from('library_books').insert(bookRows);
    if (libraryError) throw libraryError;

    const chapterRows = newGeneratedBooks.flatMap(item => {
      const chapters = Array.isArray(item.library_book_chapters)
        ? item.library_book_chapters
        : (Array.isArray(item.chapters) ? item.chapters : []);
      return normalizeLibraryChapters(chapters).flatMap((chapter, index) => {
        const chapterId = String(chapter.id || uid('library_chapter'));
        if (existingChapterIds.has(chapterId)) return [];
        existingChapterIds.add(chapterId);
        return [{
          id: chapterId,
          user_id: userId,
          book_id: item.id,
          title: chapter.title || `第 ${index + 1} 章`,
          chapter_order: Number(chapter.chapter_order || index),
          href: chapter.href || chapter.chapter_path || '',
          chapter_path: chapter.chapter_path || chapter.href || '',
          progress: Number(chapter.progress || 0),
        }];
      });
    });
    if (chapterRows.length) {
      const { error: chapterError } = await state.supabase.from('library_book_chapters').insert(chapterRows);
      if (chapterError) throw chapterError;
    }
    result.addedLibrary += newGeneratedBooks.length;
  } else {
    result.skippedLibrary += newGeneratedBooks.length;
  }

  const existingImportedIds = new Set(importedLibrary.books.map(book => String(book.id || '')));
  const restoreSuffix = `${Date.now()}`;
  const newImportedBooks = importedLibraryItems.map((item, index) => {
    const id = String(item?.id || '');
    if (!id) return createRestoredImportedBook(item, `${restoreSuffix}-${index}`);
    if (existingImportedIds.has(id)) return createRestoredImportedBook(item, `${restoreSuffix}-${index}`);
    existingImportedIds.add(id);
    return normalizeImportedBook(item);
  });
  if (newImportedBooks.length) {
    saveImportedLibraryBooks([...newImportedBooks, ...importedLibrary.books]);
    result.addedLibrary += newImportedBooks.length;
  }

  await loadAllData({ silent: true, syncReason: state.supabase ? '備份安全還原完成。' : '' });
  setBackupImportPreview({
    status: 'ready',
    backup,
    data: state.backupImportPreview.data,
    result,
  });
  refreshUi();
  showToast(`新增 notes：${result.addedNotes}｜跳過 notes：${result.skippedNotes}｜新增 drafts：${result.addedDrafts}｜新增 library：${result.addedLibrary}`);
}

async function restoreBackupDanger() {
  requireUser();
  const backup = state.backupImportPreview.backup;
  if (!backup || state.backupImportPreview.status !== 'ready') {
    throw new Error('請先匯入並預覽有效的備份 JSON。');
  }
  if (state.isRestoring) {
    showToast('覆蓋還原進行中，請稍候。');
    return;
  }
  if (!(await requestDangerRestoreConfirmation(backup))) {
    showToast('已取消覆蓋還原。');
    return;
  }

  state.isRestoring = true;
  setRestoreStatusMessage('正在備份目前資料…');
  let userId = '';
  let snapshot = null;
  try {
    userId = getUserId();
    snapshot = await captureDangerRestoreSnapshot();
    setRestoreStatusMessage('正在清除資料…');
    await clearDangerRestoreData(userId);
    setRestoreStatusMessage('正在還原 notes…');
    await writeDangerRestoreNotes(backup.notes || [], userId);
    setRestoreStatusMessage('正在還原 drafts…');
    await writeDangerRestoreDrafts(backup.drafts || [], userId);
    setRestoreStatusMessage('正在還原 library…');
    await writeDangerRestoreLibrary(backup.library || [], userId);
    await loadAllData({ silent: true, syncReason: state.supabase ? '覆蓋還原完成。' : '' });
    setBackupImportPreview({
      status: 'ready',
      backup,
      data: state.backupImportPreview.data,
      result: null,
    });
    state.restoreStatusMessage = '覆蓋還原完成';
    refreshUi();
    showToast('覆蓋還原完成');
  } catch (error) {
    if (userId && snapshot) {
      try {
        await rollbackDangerRestore(snapshot, userId);
      } catch (rollbackError) {
        throw new Error(`覆蓋還原失敗，且回復原資料失敗：${rollbackError.message || rollbackError}`);
      }
    }
    throw error;
  } finally {
    state.isRestoring = false;
    refreshUi();
  }
}

function escapeHtml(input = '') {
  return String(input ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function isSafeHtmlUrl(value = '') {
  const trimmed = String(value || '').trim();
  if (!trimmed) return false;
  const normalized = trimmed.replace(/[\u0000-\u001F\u007F\s]+/g, '').toLowerCase();
  if (
    normalized.startsWith('javascript:')
    || normalized.startsWith('data:')
    || normalized.startsWith('vbscript:')
  ) return false;
  if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) return true;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return true;
  return /^(https?:|mailto:|tel:)/i.test(trimmed);
}

function stripUnsafeHtmlAttributes(root) {
  root.querySelectorAll('*').forEach(node => {
    [...node.attributes].forEach(attribute => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value || '';
      if (name.startsWith('on')) {
        node.removeAttribute(attribute.name);
        return;
      }
      if (['href', 'src', 'xlink:href', 'action', 'formaction'].includes(name) && !isSafeHtmlUrl(value)) {
        node.removeAttribute(attribute.name);
      }
    });
  });
}

function unwrapHtmlElement(node) {
  const parent = node.parentNode;
  if (!parent) return;
  while (node.firstChild) parent.insertBefore(node.firstChild, node);
  node.remove();
}

function sanitizeImportedHtmlFragment(html = '') {
  const template = document.createElement('template');
  template.innerHTML = String(html || '');
  template.content.querySelectorAll([...HTML_REMOVE_WITH_CONTENT_TAGS].join(',')).forEach(node => node.remove());
  [...template.content.querySelectorAll('*')].forEach(node => {
    const tagName = node.tagName.toLowerCase();
    if (!IMPORTED_EPUB_SAFE_TAGS.has(tagName)) {
      unwrapHtmlElement(node);
      return;
    }
    [...node.attributes].forEach(attribute => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value || '';
      if (name === 'href' && tagName === 'a' && isSafeHtmlUrl(value)) {
        node.setAttribute('href', value.trim());
        return;
      }
      node.removeAttribute(attribute.name);
    });
    if (tagName === 'a' && node.hasAttribute('href')) {
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
  return template.innerHTML;
}
function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove('hidden');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.add('hidden'), 2600);
}

function ensureConfirmDialogUi() {
  let modal = document.getElementById('confirm-dialog');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'confirm-dialog';
    modal.className = 'modal confirm-dialog hidden';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="modal-backdrop confirm-dialog-backdrop" data-confirm-cancel></div>
      <div class="modal-card confirm-dialog-card" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <div class="confirm-dialog-header">
          <div>
            <p class="confirm-dialog-kicker">二次確認</p>
            <h2 id="confirm-dialog-title">確定要刪除嗎？</h2>
          </div>
          <button class="ghost-btn small" type="button" data-confirm-cancel aria-label="關閉確認視窗">關閉</button>
        </div>
        <p id="confirm-dialog-message" class="confirm-dialog-message">這個動作無法復原。</p>
        <label id="confirm-dialog-phrase-field" class="confirm-dialog-phrase-field hidden">
          <span id="confirm-dialog-phrase-label" class="caption">請輸入指定文字以繼續</span>
          <input id="confirm-dialog-phrase-input" type="text" autocomplete="off" />
        </label>
        <div class="confirm-dialog-actions">
          <button id="confirm-dialog-cancel-btn" class="ghost-btn" type="button" data-confirm-cancel>取消</button>
          <button id="confirm-dialog-confirm-btn" class="danger-btn" type="button">確認刪除</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  return {
    modal,
    title: modal.querySelector('#confirm-dialog-title'),
    message: modal.querySelector('#confirm-dialog-message'),
    phraseField: modal.querySelector('#confirm-dialog-phrase-field'),
    phraseLabel: modal.querySelector('#confirm-dialog-phrase-label'),
    phraseInput: modal.querySelector('#confirm-dialog-phrase-input'),
    cancelBtn: modal.querySelector('#confirm-dialog-cancel-btn'),
    confirmBtn: modal.querySelector('#confirm-dialog-confirm-btn'),
    cancelButtons: [...modal.querySelectorAll('[data-confirm-cancel]')],
  };
}

function openConfirmDialog({
  title = '確定要刪除嗎？',
  message = '這個動作無法復原。',
  confirmText = '確認刪除',
  cancelText = '取消',
  danger = true,
  requiredText = '',
  requiredTextLabel = '',
} = {}) {
  const dialog = ensureConfirmDialogUi();
  dialog.title.textContent = title;
  dialog.message.textContent = message;
  dialog.confirmBtn.textContent = confirmText;
  dialog.cancelBtn.textContent = cancelText;
  dialog.confirmBtn.className = danger ? 'danger-btn' : 'primary-btn';
  const phrase = String(requiredText || '');
  dialog.phraseField.classList.toggle('hidden', !phrase);
  dialog.phraseInput.value = '';
  dialog.phraseInput.placeholder = phrase;
  dialog.phraseLabel.textContent = requiredTextLabel || `請輸入 ${phrase} 以繼續`;
  dialog.confirmBtn.disabled = !!phrase;
  dialog.modal.classList.remove('hidden');
  dialog.modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('confirm-dialog-open');

  return new Promise(resolve => {
    const updateConfirmState = () => {
      dialog.confirmBtn.disabled = !!phrase && dialog.phraseInput.value.trim() !== phrase;
    };
    const close = result => {
      dialog.modal.classList.add('hidden');
      dialog.modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('confirm-dialog-open');
      dialog.cancelButtons.forEach(button => button.removeEventListener('click', handleCancel));
      dialog.confirmBtn.removeEventListener('click', handleConfirm);
      dialog.phraseInput.removeEventListener('input', updateConfirmState);
      document.removeEventListener('keydown', handleKeydown);
      resolve(result);
    };
    const handleCancel = () => close(false);
    const handleConfirm = () => {
      if (dialog.confirmBtn.disabled) return;
      close(true);
    };
    const handleKeydown = event => {
      if (event.key === 'Escape') close(false);
    };
    dialog.cancelButtons.forEach(button => button.addEventListener('click', handleCancel));
    dialog.confirmBtn.addEventListener('click', handleConfirm);
    dialog.phraseInput.addEventListener('input', updateConfirmState);
    document.addEventListener('keydown', handleKeydown);
    if (phrase) dialog.phraseInput.focus();
    else dialog.cancelBtn.focus();
  });
}

async function openTwoStepConfirmDialog({ first = {}, second = {} } = {}) {
  const firstConfirmed = await openConfirmDialog(first);
  if (!firstConfirmed) return false;
  return openConfirmDialog(second);
}

function copyTextFallback(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } finally {
    textarea.remove();
  }
  return copied;
}

async function copySupportEmail() {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
    } else if (!copyTextFallback(SUPPORT_EMAIL)) {
      throw new Error('Clipboard fallback failed');
    }
    showToast(`已複製信箱：${SUPPORT_EMAIL}`);
  } catch (error) {
    showToast('無法自動複製，請手動複製信箱');
  }
}

async function copySupportPaymentValue(value, label = '轉帳資訊') {
  const text = String(value || '').trim();
  if (!text) return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else if (!copyTextFallback(text)) {
      throw new Error('Clipboard fallback failed');
    }
    showToast(`已複製${label}：${text}`);
  } catch (error) {
    showToast(`無法自動複製，請手動複製${label}`);
  }
}

function setSupportReceiptView(view = 'payment') {
  const isReceipt = view === 'receipt';
  document.getElementById('support-payment-section')?.classList.toggle('hidden', isReceipt);
  document.getElementById('support-receipt-section')?.classList.toggle('hidden', !isReceipt);
  if (!isReceipt) clearSupportReceiptMessage();
}

function clearSupportReceiptMessage() {
  const message = document.getElementById('support-receipt-message');
  if (!message) return;
  message.textContent = '';
  message.classList.add('hidden');
  message.classList.remove('is-error', 'is-success');
}

function setSupportReceiptMessage(text, type = 'error') {
  const message = document.getElementById('support-receipt-message');
  if (!message) return;
  message.textContent = text;
  message.classList.remove('hidden', 'is-error', 'is-success');
  message.classList.add(type === 'success' ? 'is-success' : 'is-error');
}

function readSupportReceiptRequestForm() {
  const name = document.getElementById('support-receipt-name')?.value.trim() || '';
  const email = document.getElementById('support-receipt-email')?.value.trim() || '';
  const amountInput = document.getElementById('support-receipt-amount')?.value.trim() || '';
  const transferDate = document.getElementById('support-receipt-transfer-date')?.value || '';
  const bankLast5 = document.getElementById('support-receipt-bank-last5')?.value.trim() || '';
  const note = document.getElementById('support-receipt-note')?.value.trim() || '';
  const amount = Number(amountInput);
  return { name, email, amountInput, amount, transfer_date: transferDate, bank_last5: bankLast5, note };
}

function validateSupportReceiptRequest(input) {
  if (!input.name) return '請填寫姓名或收據抬頭。';
  if (!input.email) return '請填寫 Email。';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) return 'Email 格式不正確，請再確認一次。';
  if (!input.amountInput) return '請填寫支持金額。';
  if (!Number.isFinite(input.amount) || input.amount <= 0) return '支持金額必須是正數。';
  if (!input.transfer_date) return '請選擇轉帳日期。';
  if (!/^\d{5}$/.test(input.bank_last5)) return '匯款帳號後五碼請填寫 5 碼數字。';
  return '';
}

function buildSupportReceiptRequestPayload(input) {
  return {
    name: input.name,
    email: input.email,
    amount: input.amount,
    transferDate: input.transfer_date,
    bankLast5: input.bank_last5,
    note: input.note,
  };
}

async function submitSupportReceiptRequest(payload) {
  const response = await fetch('/api/support-receipt-request', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    const message = String(data.message || data.error || '').trim();
    throw new Error(message || '收款證明申請送出失敗，請稍後再試，或聯絡 devotionbook.tw@gmail.com。');
  }
  return data;
}

async function handleSupportReceiptSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  clearSupportReceiptMessage();
  const input = readSupportReceiptRequestForm();
  const validationError = validateSupportReceiptRequest(input);
  if (validationError) {
    setSupportReceiptMessage(validationError, 'error');
    return;
  }
  const payload = buildSupportReceiptRequestPayload(input);
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton?.textContent || '';
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = '送出中...';
  }
  try {
    await submitSupportReceiptRequest(payload);
    form.reset();
    const successMessage = '收款證明申請已送出。我們確認入帳後，會依您填寫的 Email 聯繫並寄送支持款項收款證明。';
    setSupportReceiptMessage(successMessage, 'success');
    showToast(successMessage);
  } catch (error) {
    const failureMessage = '收款證明申請送出失敗，請稍後再試，或聯絡 devotionbook.tw@gmail.com。';
    setSupportReceiptMessage(failureMessage, 'error');
    showToast(failureMessage);
    console.warn('support receipt request failed', error);
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalText || '送出申請';
    }
  }
}

function getErrorText(error) {
  return String([
    error?.message,
    error?.code,
    error?.name,
    error?.status,
    error?.error_description,
  ].filter(Boolean).join(' ')).toLowerCase();
}
function localizeAuthError(error, fallback = '操作失敗，請稍後再試。') {
  const text = getErrorText(error);
  if (!text) return fallback;
  if (text.includes('invalid login credentials')) return 'Email 或密碼錯誤，請重新輸入。';
  if (text.includes('email not confirmed') || text.includes('email_not_confirmed')) return '這個 Email 尚未完成驗證，請先到信箱點擊驗證連結。';
  if (text.includes('email rate limit')
    || text.includes('rate limit exceeded')
    || text.includes('too many requests')
    || text.includes('over_email_send_rate_limit')) return '重設密碼信寄送過於頻繁，請稍後再試。';
  if (text.includes('user not found') || text.includes('user_not_found')) return '找不到此帳號，請確認 Email 是否正確。';
  if (text.includes('password should be at least 6 characters')
    || text.includes('password too short')
    || text.includes('weak_password')) return '密碼至少需要 6 碼。';
  if (text.includes('same password')
    || text.includes('new password should be different')
    || text.includes('password should be different')
    || text.includes('different from the old password')) return '新密碼不可與目前密碼相同，請改用另一組新密碼。';
  if (text.includes('recovery token expired')
    || text.includes('invalid token')
    || text.includes('otp expired')
    || text.includes('otp_expired')
    || text.includes('link is invalid')) return '重設密碼連結已失效，請重新寄送忘記密碼信。';
  return fallback;
}
function createAuthError(error, fallback) {
  return new Error(localizeAuthError(error, fallback));
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
  const { mode, supabaseUrl, supabaseAnonKey } = state.config;
  if (mode === 'local') {
    state.supabase = null;
    state.storageMode = 'local';
    return;
  }
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
    if (els.gateAuthPasswordConfirm && password === '') els.gateAuthPasswordConfirm.value = '';
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

async function completeLocalAuth(user, successMessage) {
  setLocalUser(user);
  state.currentUser = user;
  ensureAdminUi();
  settleMobileViewport();
  await loadAllData();
  refreshUi();
  setView('dashboard');
  showToast(successMessage);
}
function settleMobileViewport() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const active = document.activeElement;
  if (active && typeof active.blur === 'function' && /INPUT|TEXTAREA|SELECT/.test(active.tagName)) active.blur();
  if (window.innerWidth <= 900) {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }
}
function openAuthInline(mode = 'register') {
  state.authInlineMode = mode;
  const isRegister = mode === 'register';
  const isPasswordRecovery = mode === 'password-recovery';
  els.authInlinePanel?.classList.remove('hidden');
  els.authInlinePanel?.setAttribute('aria-hidden', 'false');
  if (els.authInlineTitle) {
    els.authInlineTitle.textContent = isPasswordRecovery ? '設定新密碼' : (isRegister ? '建立帳戶' : '登入');
  }
  const intro = document.getElementById('auth-inline-intro');
  if (intro) {
    intro.textContent = isPasswordRecovery
      ? '請輸入新密碼，更新後會回到登入頁。'
      : (isRegister ? '輸入 Email 與密碼後即可建立帳戶。' : '輸入 Email 與密碼後即可登入。');
  }
  syncPasswordRecoveryForm(isPasswordRecovery);
  if (els.gateSubmitBtn) {
    els.gateSubmitBtn.textContent = isPasswordRecovery ? '更新密碼' : (isRegister ? '建立帳戶' : '登入');
    els.gateSubmitBtn.classList.toggle('secondary-btn', !isRegister && !isPasswordRecovery);
    els.gateSubmitBtn.classList.toggle('primary-btn', isRegister || isPasswordRecovery);
  }
  if (els.gateResetPasswordBtn) {
    els.gateResetPasswordBtn.classList.toggle('hidden', isPasswordRecovery);
    els.gateResetPasswordBtn.textContent = '忘記密碼';
  }
  els.closeAuthInlineBtn?.classList.toggle('hidden', isPasswordRecovery);
  (isPasswordRecovery ? els.gateAuthPassword : els.gateAuthEmail)?.focus();
}
function closeAuthInline() {
  if (state.passwordRecoveryActive) return;
  els.authInlinePanel?.classList.add('hidden');
  els.authInlinePanel?.setAttribute('aria-hidden', 'true');
}
function setLabelTextForInput(input, text) {
  const label = input?.closest('label');
  const node = label ? [...label.childNodes].find(item => item.nodeType === Node.TEXT_NODE) : null;
  if (node) node.textContent = `${text}\n                `;
}
function syncPasswordRecoveryForm(isPasswordRecovery = false) {
  els.gateAuthEmail?.closest('label')?.classList.toggle('hidden', isPasswordRecovery);
  els.gateAuthPasswordConfirmLabel?.classList.toggle('hidden', !isPasswordRecovery);
  if (els.gateAuthPassword) {
    els.gateAuthPassword.value = '';
    els.gateAuthPassword.autocomplete = isPasswordRecovery ? 'new-password' : 'current-password';
    els.gateAuthPassword.placeholder = isPasswordRecovery ? '至少 6 碼' : '至少 6 碼';
    setLabelTextForInput(els.gateAuthPassword, isPasswordRecovery ? '新密碼' : 'Password');
  }
  if (els.gateAuthPasswordConfirm) els.gateAuthPasswordConfirm.value = '';
}
function getPasswordRecoveryUrlState() {
  const hashParams = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
  const searchParams = new URLSearchParams((window.location.search || '').replace(/^\?/, ''));
  const type = hashParams.get('type') || searchParams.get('type') || '';
  const error = hashParams.get('error') || searchParams.get('error') || hashParams.get('error_code') || searchParams.get('error_code') || '';
  const errorDescription = hashParams.get('error_description') || searchParams.get('error_description') || '';
  return {
    isRecovery: type === 'recovery',
    hasError: !!error,
    error,
    errorDescription,
  };
}
function clearAuthRecoveryUrl() {
  if (!window.history?.replaceState) return;
  window.history.replaceState({}, document.title, `${window.location.origin}${window.location.pathname}`);
}
function getAuthRedirectUrlState() {
  const hashParams = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
  const searchParams = new URLSearchParams((window.location.search || '').replace(/^\?/, ''));
  const getParam = key => searchParams.get(key) || hashParams.get(key) || '';
  const type = getParam('type');
  const error = getParam('error') || getParam('error_code');
  const errorDescription = getParam('error_description');
  const code = getParam('code');
  const tokenHash = getParam('token_hash');
  const accessToken = getParam('access_token');
  const refreshToken = getParam('refresh_token');
  return {
    type,
    isRecovery: type === 'recovery',
    hasError: !!error,
    error,
    errorDescription,
    code,
    tokenHash,
    accessToken,
    refreshToken,
    hasAuthParams: !!(error || code || tokenHash || accessToken || refreshToken),
  };
}
function clearAuthCallbackUrl() {
  if (!window.history?.replaceState) return;
  window.history.replaceState({}, document.title, `${window.location.origin}${window.location.pathname}`);
}
function normalizeAuthOtpType(type = '') {
  const normalized = String(type || '').trim().toLowerCase();
  if (['signup', 'magiclink', 'recovery', 'invite', 'email_change', 'email'].includes(normalized)) return normalized;
  return 'signup';
}
async function handleSupabaseAuthRedirect(urlState = getAuthRedirectUrlState()) {
  if (!state.supabase || !urlState.hasAuthParams || urlState.isRecovery) return { handled: false };
  if (urlState.hasError) {
    clearAuthCallbackUrl();
    return {
      handled: true,
      success: false,
      message: 'Email 驗證連結無效或已過期，請重新申請驗證信。',
    };
  }

  try {
    if (urlState.code) {
      if (typeof state.supabase.auth.exchangeCodeForSession !== 'function') throw new Error('unsupported_auth_callback');
      const { error } = await state.supabase.auth.exchangeCodeForSession(urlState.code);
      if (error) throw error;
    } else if (urlState.tokenHash) {
      if (typeof state.supabase.auth.verifyOtp !== 'function') throw new Error('unsupported_auth_callback');
      const { error } = await state.supabase.auth.verifyOtp({
        token_hash: urlState.tokenHash,
        type: normalizeAuthOtpType(urlState.type),
      });
      if (error) throw error;
    } else if (urlState.accessToken && urlState.refreshToken) {
      if (typeof state.supabase.auth.setSession !== 'function') throw new Error('unsupported_auth_callback');
      const { error } = await state.supabase.auth.setSession({
        access_token: urlState.accessToken,
        refresh_token: urlState.refreshToken,
      });
      if (error) throw error;
    } else {
      return { handled: false };
    }

    clearAuthCallbackUrl();
    const { data } = await state.supabase.auth.getSession();
    const session = data?.session || null;
    return {
      handled: true,
      success: true,
      session,
      message: session?.user ? 'Email 驗證完成，已登入。' : 'Email 驗證完成，請登入。',
    };
  } catch (error) {
    clearAuthCallbackUrl();
    return {
      handled: true,
      success: false,
      message: 'Email 驗證連結無效或已過期，請重新申請驗證信。',
    };
  }
}
function enterPasswordRecoveryMode() {
  state.passwordRecoveryActive = true;
  state.currentUser = null;
  resetProfileAvatarState();
  teardownCloudRealtime();
  setSyncState({ status: '尚未登入', detail: '請先設定新密碼後再重新登入。', at: '' });
  clearAuthRecoveryUrl();
  refreshUi();
  openAuthInline('password-recovery');
}
function showInvalidPasswordRecoveryLink() {
  state.passwordRecoveryActive = false;
  state.currentUser = null;
  resetProfileAvatarState();
  teardownCloudRealtime();
  setSyncState({ status: '尚未登入', detail: '重設密碼連結已失效，請重新寄送忘記密碼信。', at: '' });
  clearAuthRecoveryUrl();
  refreshUi();
  openAuthInline('login');
  showToast('重設密碼連結已失效，請重新寄送忘記密碼信');
}
function handleSupabaseAuthStateChange(event, session) {
  if (event === 'PASSWORD_RECOVERY') {
    enterPasswordRecoveryMode();
    return;
  }
  if (state.passwordRecoveryActive) return;
  state.currentUser = session?.user || null;
  ensureAdminUi();
  if (state.currentUser) settleMobileViewport();
  teardownCloudRealtime();
  if (state.currentUser) {
    setupCloudRealtime();
  } else if (state.supabase) {
    setSyncState({ status: '尚未登入', detail: '已設定雲端，但目前還沒有登入帳號。', at: '' });
  }
  refreshUi();
  loadAllData({ silent: true, syncReason: session?.user ? '已連線到雲端帳號。' : '已登出雲端帳號。' }).catch(console.error);
}
function openAuthSettings() {
  syncConfigInputs();
  els.authSettingsSheet?.classList.remove('hidden');
}
function closeAuthSettings() {
  els.authSettingsSheet?.classList.add('hidden');
}
function syncAccountSettingsModal() {
  if (els.accountSettingsEmail) {
    els.accountSettingsEmail.textContent = state.currentUser?.email || '尚未登入';
  }
  syncProfileAvatarMessage();
}

function getProfileAvatarMetadata(user = state.currentUser) {
  const metadata = user?.user_metadata || {};
  return {
    path: String(metadata.avatar_path || '').trim(),
    url: String(metadata.avatar_url || '').trim(),
    updatedAt: String(metadata.avatar_updated_at || '').trim(),
  };
}

function getProfileAvatarStoragePath(userId = getUserId()) {
  return `users/${userId}/profile/avatar.webp`;
}

function getAccountInitial() {
  const source = String(state.currentUser?.email || state.currentUser?.id || 'A').trim();
  const letter = source.match(/[A-Za-z0-9]/)?.[0] || source[0] || 'A';
  return letter.toUpperCase();
}

function appendAvatarCacheBust(url = '', updatedAt = '') {
  const src = String(url || '').trim();
  if (!src) return '';
  if (/^(data|blob):/i.test(src)) return src;
  const token = encodeURIComponent(updatedAt || state.profileAvatar.updatedAt || '');
  if (!token) return src;
  return `${src}${src.includes('?') ? '&' : '?'}v=${token}`;
}

function getSignedUrlCacheKey(path = '', version = '') {
  const normalizedPath = String(path || '').trim();
  if (!normalizedPath) return '';
  return `${normalizedPath}|${String(version || '').trim()}`;
}

function getCachedSignedUrl(cache, key) {
  if (!(cache instanceof Map) || !key) return '';
  const entry = cache.get(key);
  if (!entry?.url) return '';
  if (Number(entry.expiresAt || 0) <= Date.now() + SIGNED_URL_CACHE_REFRESH_BUFFER_MS) {
    cache.delete(key);
    return '';
  }
  return entry.url;
}

function setCachedSignedUrl(cache, key, url) {
  if (!(cache instanceof Map) || !key || !url) return '';
  const createdAt = Date.now();
  cache.set(key, {
    url,
    createdAt,
    expiresAt: createdAt + SIGNED_URL_CACHE_TTL_SECONDS * 1000,
  });
  return url;
}

function getLibraryCoverVersion(book = {}) {
  return book.cover_updated_at || book.updated_at || book.updatedAt || book.created_at || book.createdAt || '';
}

function getLibraryCoverCacheKey(book = {}) {
  if (!book?.cover_image_path) return '';
  return getSignedUrlCacheKey(book.cover_image_path, getLibraryCoverVersion(book));
}

function shouldUseCloudCoverLoader(book = {}, coverUrl = '') {
  return !!(
    book
    && coverUrl
    && book.cover_image_path
    && book.source !== 'imported_epub'
    && !isSystemLibraryBook(book)
  );
}

function getCachedLibraryCoverObjectUrl(cacheKey = '') {
  if (!cacheKey) return '';
  const entry = state.libraryCoverObjectUrlCache.get(cacheKey);
  if (!entry?.url) return '';
  if (Number(entry.expiresAt || 0) <= Date.now() + SIGNED_URL_CACHE_REFRESH_BUFFER_MS) {
    URL.revokeObjectURL(entry.url);
    state.libraryCoverObjectUrlCache.delete(cacheKey);
    return '';
  }
  return entry.url;
}

function setCachedLibraryCoverObjectUrl(cacheKey = '', objectUrl = '') {
  if (!cacheKey || !objectUrl) return '';
  const existing = state.libraryCoverObjectUrlCache.get(cacheKey);
  if (existing?.url && existing.url !== objectUrl) URL.revokeObjectURL(existing.url);
  const createdAt = Date.now();
  state.libraryCoverObjectUrlCache.set(cacheKey, {
    url: objectUrl,
    createdAt,
    expiresAt: createdAt + SIGNED_URL_CACHE_TTL_SECONDS * 1000,
  });
  return objectUrl;
}

function clearLibraryCoverObjectUrlCache() {
  state.libraryCoverObjectUrlCache.forEach(entry => {
    if (entry?.url) URL.revokeObjectURL(entry.url);
  });
  state.libraryCoverObjectUrlCache.clear();
  state.libraryCoverObjectUrlPromises.clear();
}

async function resolveLibraryCoverObjectUrl(cacheKey = '', signedUrl = '') {
  if (!cacheKey || !signedUrl) return '';
  const cachedUrl = getCachedLibraryCoverObjectUrl(cacheKey);
  if (cachedUrl) return cachedUrl;
  const pendingUrlPromise = state.libraryCoverObjectUrlPromises.get(cacheKey);
  if (pendingUrlPromise) return pendingUrlPromise;
  const objectUrlPromise = fetch(signedUrl)
    .then(response => {
      if (!response.ok) throw new Error(`cover fetch failed: ${response.status}`);
      return response.blob();
    })
    .then(blob => setCachedLibraryCoverObjectUrl(cacheKey, URL.createObjectURL(blob)));
  state.libraryCoverObjectUrlPromises.set(cacheKey, objectUrlPromise);
  try {
    return await objectUrlPromise;
  } finally {
    if (state.libraryCoverObjectUrlPromises.get(cacheKey) === objectUrlPromise) {
      state.libraryCoverObjectUrlPromises.delete(cacheKey);
    }
  }
}

async function loadDeferredLibraryCoverImage(img) {
  if (!(img instanceof HTMLImageElement)) return;
  const signedUrl = img.dataset.libraryCoverSrc || '';
  const cacheKey = img.dataset.libraryCoverKey || '';
  if (!signedUrl || !cacheKey) return;
  const cachedUrl = getCachedLibraryCoverObjectUrl(cacheKey);
  if (cachedUrl) {
    img.src = cachedUrl;
    return;
  }
  try {
    const objectUrl = await resolveLibraryCoverObjectUrl(cacheKey, signedUrl);
    if (objectUrl && img.isConnected && img.dataset.libraryCoverKey === cacheKey) {
      img.src = objectUrl;
    }
  } catch (error) {
    console.warn('書櫃封面快取載入失敗，改用 signed URL', error);
    if (img.isConnected && img.dataset.libraryCoverKey === cacheKey) img.src = signedUrl;
  }
}

function hydrateLibraryCoverImages(scope = document) {
  if (!scope?.querySelectorAll) return;
  const images = [...scope.querySelectorAll('img[data-library-cover-src][data-library-cover-key]')];
  if (!images.length) return;
  if ('IntersectionObserver' in window) {
    if (!state.libraryCoverImageObserver) {
      state.libraryCoverImageObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          state.libraryCoverImageObserver.unobserve(entry.target);
          loadDeferredLibraryCoverImage(entry.target).catch(console.warn);
        });
      }, { rootMargin: '160px' });
    }
    images.forEach(img => {
      if (img.dataset.libraryCoverObserved === 'true') return;
      img.dataset.libraryCoverObserved = 'true';
      state.libraryCoverImageObserver.observe(img);
    });
    return;
  }
  images.forEach(img => loadDeferredLibraryCoverImage(img).catch(console.warn));
}

function buildLibraryCoverImage(book, coverUrl, alt, className = '') {
  const classAttr = className ? ` class="${escapeHtml(className)}"` : '';
  const baseAttrs = `${classAttr} alt="${escapeHtml(alt)}" loading="lazy" decoding="async" fetchpriority="low"`;
  if (!shouldUseCloudCoverLoader(book, coverUrl)) {
    return `<img${baseAttrs} src="${escapeHtml(coverUrl)}" />`;
  }
  const cacheKey = getLibraryCoverCacheKey(book);
  const cachedObjectUrl = getCachedLibraryCoverObjectUrl(cacheKey);
  if (cachedObjectUrl) return `<img${baseAttrs} src="${escapeHtml(cachedObjectUrl)}" />`;
  return `<img${baseAttrs} src="${TRANSPARENT_IMAGE_PLACEHOLDER}" data-library-cover-src="${escapeHtml(coverUrl)}" data-library-cover-key="${escapeHtml(cacheKey)}" />`;
}

function resetProfileAvatarState() {
  state.profileAvatar = { path: '', url: '', updatedAt: '' };
}

async function refreshProfileAvatar({ updateUi = false } = {}) {
  const metadata = getProfileAvatarMetadata();
  if (!state.currentUser || state.passwordRecoveryActive) {
    resetProfileAvatarState();
    if (updateUi) syncProfileAvatarUi();
    return;
  }
  if (metadata.url) {
    state.profileAvatar = {
      path: metadata.path,
      url: appendAvatarCacheBust(metadata.url, metadata.updatedAt),
      updatedAt: metadata.updatedAt,
    };
    if (updateUi) syncProfileAvatarUi();
    return;
  }
  if (!(state.supabase && metadata.path)) {
    resetProfileAvatarState();
    if (updateUi) syncProfileAvatarUi();
    return;
  }
  const cacheKey = getSignedUrlCacheKey(metadata.path, metadata.updatedAt);
  const cachedUrl = getCachedSignedUrl(state.profileAvatarUrlCache, cacheKey);
  if (cachedUrl) {
    egressDebugLog('avatarSignedUrl:hit', { path: metadata.path });
    state.profileAvatar = { path: metadata.path, url: cachedUrl, updatedAt: metadata.updatedAt };
    if (updateUi) syncProfileAvatarUi();
    return;
  }
  egressDebugLog('avatarSignedUrl:miss', { path: metadata.path });
  const { data, error } = await state.supabase.storage.from(PROFILE_AVATAR_BUCKET).createSignedUrl(metadata.path, SIGNED_URL_CACHE_TTL_SECONDS);
  const signedUrl = appendAvatarCacheBust(data?.signedUrl || '', metadata.updatedAt);
  state.profileAvatar = error
    ? { path: metadata.path, url: '', updatedAt: metadata.updatedAt }
    : { path: metadata.path, url: setCachedSignedUrl(state.profileAvatarUrlCache, cacheKey, signedUrl), updatedAt: metadata.updatedAt };
  if (updateUi) syncProfileAvatarUi();
}

function syncProfileAvatarUi() {
  const initial = getAccountInitial();
  const avatarUrl = state.profileAvatar.url;
  document.querySelectorAll('[data-account-avatar]').forEach((avatar) => {
    avatar.dataset.initial = initial;
    avatar.classList.toggle('has-avatar', !!avatarUrl);
    const image = avatar.querySelector('img');
    if (!image) return;
    image.alt = avatarUrl ? '個人頭像' : '';
    image.onerror = () => {
      if (state.profileAvatar.url) {
        state.profileAvatar.url = '';
        syncProfileAvatarUi();
      }
    };
    if (avatarUrl) {
      image.src = avatarUrl;
    } else {
      image.removeAttribute('src');
    }
  });
  syncProfileAvatarMessage();
}

function syncProfileAvatarMessage(message = '', isError = false) {
  if (els.profileAvatarMessage) {
    els.profileAvatarMessage.textContent = message;
    els.profileAvatarMessage.classList.toggle('hidden', !message);
    els.profileAvatarMessage.classList.toggle('is-error', !!isError);
  }
  const cloudReady = !!(state.supabase && state.currentUser && !state.passwordRecoveryActive);
  els.profileAvatarUploadBtn?.toggleAttribute('disabled', !cloudReady);
  els.profileAvatarRemoveBtn?.toggleAttribute('disabled', !cloudReady || !getProfileAvatarMetadata().path);
  if (!message && els.profileAvatarMessage && !cloudReady && state.currentUser) {
    els.profileAvatarMessage.textContent = '頭像同步需要登入雲端帳號。';
    els.profileAvatarMessage.classList.remove('hidden', 'is-error');
  }
}

function validateProfileAvatarFile(file) {
  if (!file) throw new Error('請先選擇圖片。');
  if (!PROFILE_AVATAR_MIME_TYPES.has(file.type)) throw new Error('請上傳 JPG、PNG 或 WEBP 圖片');
  if (file.size > PROFILE_AVATAR_MAX_BYTES) throw new Error('請上傳 2MB 以下的圖片');
}

function loadImageElementFromFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('請上傳 JPG、PNG 或 WEBP 圖片'));
    };
    image.src = objectUrl;
  });
}

async function prepareProfileAvatarBlob(file) {
  validateProfileAvatarFile(file);
  const image = await loadImageElementFromFile(file);
  const size = Math.min(image.naturalWidth || image.width, image.naturalHeight || image.height);
  if (!size) throw new Error('請上傳 JPG、PNG 或 WEBP 圖片');
  const sx = Math.max(0, ((image.naturalWidth || image.width) - size) / 2);
  const sy = Math.max(0, ((image.naturalHeight || image.height) - size) / 2);
  const canvas = document.createElement('canvas');
  canvas.width = PROFILE_AVATAR_SIZE;
  canvas.height = PROFILE_AVATAR_SIZE;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('頭像上傳失敗，請稍後再試');
  context.drawImage(image, sx, sy, size, size, 0, 0, PROFILE_AVATAR_SIZE, PROFILE_AVATAR_SIZE);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('頭像上傳失敗，請稍後再試'));
        return;
      }
      resolve(blob);
    }, 'image/webp', 0.86);
  });
}

async function updateProfileAvatarMetadata(nextMetadata) {
  if (!(state.supabase && state.currentUser)) throw new Error('頭像同步需要登入雲端帳號。');
  const metadata = { ...(state.currentUser.user_metadata || {}), ...nextMetadata };
  const { data, error } = await state.supabase.auth.updateUser({ data: metadata });
  if (error) throw createAuthError(error);
  state.currentUser = data?.user || { ...state.currentUser, user_metadata: metadata };
}

async function handleProfileAvatarSelection(event) {
  const input = event.target;
  const file = input?.files?.[0] || null;
  if (!file) return;
  try {
    syncProfileAvatarMessage('');
    if (!(state.supabase && state.currentUser)) throw new Error('頭像同步需要登入雲端帳號。');
    const avatarBlob = await prepareProfileAvatarBlob(file);
    const avatarPath = getProfileAvatarStoragePath();
    const { error } = await state.supabase.storage.from(PROFILE_AVATAR_BUCKET).upload(avatarPath, avatarBlob, {
      contentType: 'image/webp',
      upsert: true,
    });
    if (error) throw new Error('頭像上傳失敗，請稍後再試');
    const updatedAt = nowIso();
    await updateProfileAvatarMetadata({
      avatar_path: avatarPath,
      avatar_url: null,
      avatar_updated_at: updatedAt,
    });
    state.profileAvatarUrlCache.clear();
    await refreshProfileAvatar({ updateUi: true });
    refreshUi();
    showToast('頭像已更新');
  } catch (error) {
    syncProfileAvatarMessage(error?.message || '頭像上傳失敗，請稍後再試', true);
    showToast(error?.message || '頭像上傳失敗，請稍後再試');
  } finally {
    if (input) input.value = '';
  }
}

async function removeProfileAvatar() {
  if (!(state.supabase && state.currentUser)) throw new Error('頭像同步需要登入雲端帳號。');
  const confirmed = await openConfirmDialog({
    title: '確定要移除頭像嗎？',
    message: '移除後會恢復為字母頭像。',
    confirmText: '確認移除',
    danger: true,
  });
  if (!confirmed) return;
  const metadata = getProfileAvatarMetadata();
  const avatarPath = metadata.path || getProfileAvatarStoragePath();
  if (avatarPath) {
    await state.supabase.storage.from(PROFILE_AVATAR_BUCKET).remove([avatarPath]).catch(() => {});
  }
  await updateProfileAvatarMetadata({
    avatar_path: null,
    avatar_url: null,
    avatar_updated_at: nowIso(),
  });
  state.profileAvatarUrlCache.clear();
  resetProfileAvatarState();
  refreshUi();
  showToast('頭像已移除');
}

function clearAccountPasswordFields() {
  if (els.accountNewPassword) els.accountNewPassword.value = '';
  if (els.accountConfirmPassword) els.accountConfirmPassword.value = '';
  clearAccountPasswordMessage();
}
function clearAccountPasswordMessage() {
  if (!els.accountPasswordMessage) return;
  els.accountPasswordMessage.textContent = '';
  els.accountPasswordMessage.classList.add('hidden');
  els.accountPasswordMessage.classList.remove('error-text');
}
function showAccountPasswordMessage(message) {
  if (!els.accountPasswordMessage) return;
  els.accountPasswordMessage.textContent = message;
  els.accountPasswordMessage.classList.remove('hidden');
  els.accountPasswordMessage.classList.add('error-text');
}
function setAccountPasswordFormExpanded(expanded = false) {
  els.accountPasswordForm?.classList.toggle('hidden', !expanded);
  els.accountPasswordToggleBtn?.classList.toggle('hidden', expanded);
  els.accountPasswordToggleBtn?.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  if (!expanded) {
    clearAccountPasswordFields();
    return;
  }
  els.accountNewPassword?.focus();
}
function openAccountSettingsModal() {
  if (!state.currentUser) {
    showToast('請先登入後再進入帳號設定。');
    return;
  }
  syncAccountSettingsModal();
  setAccountPasswordFormExpanded(false);
  document.body.classList.add('account-settings-open');
  els.accountSettingsModal?.classList.remove('hidden');
  els.accountSettingsModal?.setAttribute('aria-hidden', 'false');
}
function closeAccountSettingsModal() {
  setAccountPasswordFormExpanded(false);
  document.body.classList.remove('account-settings-open');
  els.accountSettingsModal?.classList.add('hidden');
  els.accountSettingsModal?.setAttribute('aria-hidden', 'true');
}
async function applyConnectionSettings({ supabaseUrl = '', supabaseAnonKey = '' } = {}, successMessage = '') {
  teardownCloudRealtime();

  const trimmedUrl = supabaseUrl.trim();
  const trimmedAnonKey = supabaseAnonKey.trim();
  const overrideConfig = {
    mode: trimmedUrl && trimmedAnonKey ? 'custom' : 'local',
    supabaseUrl: trimmedUrl,
    supabaseAnonKey: trimmedAnonKey,
  };

  saveJson(STORAGE_KEYS.config, overrideConfig);
  state.config = buildMergedConfig(overrideConfig);

  syncConfigInputs();
  initSupabase();

  if (state.supabase) {
    const { data } = await state.supabase.auth.getSession();
    state.currentUser = data.session?.user || null;
    ensureAdminUi();
    if (state.currentUser) setupCloudRealtime();
    if (!state.currentUser) {
      setSyncState({ status: '尚未登入', detail: '雲端已啟用，但目前還沒有登入帳號。', at: '' });
    }
  } else {
    state.currentUser = getLocalUser();
    ensureAdminUi();
    setSyncState({ status: '本機模式', detail: '目前資料只保存在這台裝置。', at: '' });
  }

  await loadAllData({ silent: true, syncReason: state.supabase ? '雲端設定已更新。' : '已切回本機模式。' });
  refreshUi();
  if (successMessage) showToast(successMessage);
}
async function clearConnectionSettings() {
  teardownCloudRealtime();

  const localModeConfig = { mode: 'local', supabaseUrl: '', supabaseAnonKey: '' };
  saveJson(STORAGE_KEYS.config, localModeConfig);
  state.config = buildMergedConfig(localModeConfig);
  syncConfigInputs();
  initSupabase();

  state.currentUser = getLocalUser();
  ensureAdminUi();
  setSyncState({ status: '本機模式', detail: '目前資料只保存在這台裝置。', at: '' });
  await loadAllData({ silent: true, syncReason: '已切回本機模式。' });
  refreshUi();
  showToast('已切回本機模式。');
}

async function bootstrap() {
  removeRetiredInterfaceElements();
  ensureContentLibraryUi();
  ensureOperationManualUi();
  ensureBookDraftWorkspaceUi();
  document.body.dataset.currentView = document.querySelector('.view.active')?.id?.replace('view-', '') || 'dashboard';
  syncConfigInputs();
  initSupabase();
  bindEvents();
  if (state.supabase) {
    const recoveryUrlState = getPasswordRecoveryUrlState();
    const authRedirectResult = await handleSupabaseAuthRedirect();
    if (recoveryUrlState.isRecovery) state.passwordRecoveryActive = true;
    state.supabase.auth.onAuthStateChange((event, session) => {
      handleSupabaseAuthStateChange(event, session);
    });
    const { data } = await state.supabase.auth.getSession();
    if (recoveryUrlState.isRecovery) {
      if (recoveryUrlState.hasError || !data.session) {
        showInvalidPasswordRecoveryLink();
      } else {
        enterPasswordRecoveryMode();
      }
    } else if (!state.passwordRecoveryActive) {
      state.currentUser = data.session?.user || null;
      ensureAdminUi();
      if (state.currentUser) setupCloudRealtime();
    }
    if (authRedirectResult.handled) {
      if (authRedirectResult.success && authRedirectResult.session?.user) {
        state.currentUser = authRedirectResult.session.user;
        ensureAdminUi();
        setupCloudRealtime();
      } else if (!authRedirectResult.success) {
        state.currentUser = null;
        setSyncState({ status: '尚未登入', detail: authRedirectResult.message, at: '' });
        openAuthInline('login');
      }
      showToast(authRedirectResult.message);
    }
  } else {
    state.currentUser = getLocalUser();
    ensureAdminUi();
    setSyncState({ status: '本機模式', detail: '目前資料只保存在這台裝置。', at: '' });
  }
  if (!state.passwordRecoveryActive) await loadAllData({ silent: true });
  runAutoBackupCheck();
  refreshUi();
  if (state.passwordRecoveryActive) openAuthInline('password-recovery');
  renderNotePreview();
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
  els.closeAuthSettingsBtn?.addEventListener('click', closeAuthSettings);
  els.openRegisterBtn?.addEventListener('click', () => openAuthInline('register'));
  els.openLoginBtn?.addEventListener('click', () => openAuthInline('login'));
  els.closeAuthInlineBtn?.addEventListener('click', closeAuthInline);
  els.authInlineBackdrop?.addEventListener('click', closeAuthInline);
  els.gateSubmitBtn?.addEventListener('click', () => {
    const action = state.authInlineMode === 'password-recovery'
      ? handleUpdateRecoveryPassword
      : (state.authInlineMode === 'register' ? handleRegister : handleLogin);
    action().catch(handleError);
  });
  els.gateResetPasswordBtn?.addEventListener('click', () => handleResetPassword().catch(handleError));
  els.resetPasswordBtn?.addEventListener('click', () => handleResetPassword().catch(handleError));
  els.gateSaveConfigBtn?.addEventListener('click', () => applyConnectionSettings({
    supabaseUrl: els.gateSupabaseUrl.value,
    supabaseAnonKey: els.gateSupabaseAnonKey.value,
  }, 'Supabase 設定已儲存。').then(closeAuthSettings).catch(handleError));
  els.gateClearConfigBtn?.addEventListener('click', () => clearConnectionSettings().then(closeAuthSettings).catch(handleError));
  els.openAccountSettingsBtn?.addEventListener('click', openAccountSettingsModal);
  els.openAccountSettingsButtons.forEach(button => button.addEventListener('click', openAccountSettingsModal));
  els.accountSettingsBackdrop?.addEventListener('click', closeAccountSettingsModal);
  els.closeAccountSettingsBtn?.addEventListener('click', closeAccountSettingsModal);
  els.accountPasswordToggleBtn?.addEventListener('click', () => setAccountPasswordFormExpanded(true));
  els.accountCancelPasswordBtn?.addEventListener('click', () => setAccountPasswordFormExpanded(false));
  els.accountUpdatePasswordBtn?.addEventListener('click', () => handleAccountPasswordUpdate().catch(handleError));
  els.profileAvatarUploadBtn?.addEventListener('click', () => els.profileAvatarInput?.click());
  els.profileAvatarInput?.addEventListener('change', event => handleProfileAvatarSelection(event).catch(handleError));
  els.profileAvatarRemoveBtn?.addEventListener('click', () => removeProfileAvatar().catch(handleError));
  els.signoutBtn.addEventListener('click', () => handleSignOut().catch(handleError));
  els.accountSignoutBtn?.addEventListener('click', () => handleSignOut().catch(handleError));
  els.desktopSidebarSignoutBtn?.addEventListener('click', () => handleSignOut().catch(handleError));
  els.refreshBtn?.addEventListener('click', () => loadAllData({ syncReason: '已手動重新整理雲端資料。' }).then(refreshUi).then(() => showToast('資料已重新整理。')).catch(handleError));
  els.forceSyncBtn?.addEventListener('click', () => loadAllData({ syncReason: '已手動同步雲端資料。' }).then(() => showToast('同步完成。')).catch(handleError));
  els.topbarForceSyncBtn?.addEventListener('click', () => loadAllData({ syncReason: '已手動同步雲端資料。' }).then(() => showToast('同步完成。')).catch(handleError));
  els.pushLocalToCloudBtn?.addEventListener('click', () => uploadLocalDataToCloud().catch(handleError));
  els.downloadBackupBtn?.addEventListener('click', () => { try { downloadBackupJson(); } catch (error) { handleError(error); } });

  bindViewTriggers();
  els.summaryNotesCard?.addEventListener('click', openNoteReader);
  els.summaryBooksCard?.addEventListener('click', () => setView('books'));
  els.summaryLibraryCard?.addEventListener('click', () => setView('library'));
  els.quickNewNote.addEventListener('click', () => { setView('notes'); clearNoteForm(); });
  els.quickNewBook.addEventListener('click', () => { setView('books'); clearBookForm(); });
  els.noteReaderWriteBtn?.addEventListener('click', () => { setView('notes'); clearNoteForm(); });
  els.noteReaderSearch?.addEventListener('input', event => {
    state.noteReaderSearch = String(event.target.value || '');
    renderNoteReader({ preserveScroll: true });
  });
  els.noteReaderClearSearch?.addEventListener('click', () => {
    state.noteReaderSearch = '';
    renderNoteReader();
    els.noteReaderSearch?.focus();
  });
  els.noteReaderCategory?.addEventListener('change', event => {
    state.noteReaderCategory = String(event.target.value || '');
    renderNoteReader();
  });
  els.noteReaderTag?.addEventListener('change', event => {
    state.noteReaderTag = String(event.target.value || '');
    renderNoteReader();
  });
  els.noteReaderSort?.addEventListener('change', event => {
    state.noteReaderSort = String(event.target.value || 'updated-desc');
    renderNoteReader();
  });
  els.noteReaderResetFilters?.addEventListener('click', () => {
    resetNoteReaderFilters();
    renderNoteReader();
    els.noteReaderSearch?.focus();
  });
  els.todayDevotionNoteBtn?.addEventListener('click', () => { setView('notes'); clearNoteForm(); });
  els.viewAllNotesBtn?.addEventListener('click', () => setView('notes'));
  els.newNoteBtn.addEventListener('click', clearNoteForm);
  els.newBookBtn.addEventListener('click', clearBookForm);
  els.markdownHeadingBtn?.addEventListener('click', () => applyMarkdownHeading());
  els.markdownBoldBtn?.addEventListener('click', () => applyMarkdownBold());
  els.markdownQuoteBtn?.addEventListener('click', () => applyMarkdownQuote());
  els.markdownScriptureBtn?.addEventListener('click', () => applyMarkdownScripture());
  els.markdownListBtn?.addEventListener('click', () => applyMarkdownList());
  els.markdownDividerBtn?.addEventListener('click', () => applyMarkdownDivider());
  els.markdownRedBtn?.addEventListener('click', () => applyMarkdownRedText());
  els.markdownBlueBtn?.addEventListener('click', () => applyMarkdownBlueText());
  els.markdownGoldBtn?.addEventListener('click', () => applyMarkdownGoldText());
  els.markdownPurpleBtn?.addEventListener('click', () => applyMarkdownPurpleText());
  els.noteForm.addEventListener('submit', event => { event.preventDefault(); saveNote().catch(handleNoteSaveError); });
  els.noteForm.addEventListener('input', event => {
    if (isNoteFormField(event.target)) {
      renderNotePreview();
      scheduleCurrentNoteDraftSave();
    }
  });
  els.noteForm.addEventListener('change', event => {
    if (isNoteFormField(event.target)) {
      renderNotePreview();
      scheduleCurrentNoteDraftSave();
    }
  });
  els.notePreviewBtn?.addEventListener('click', openNotePreview);
  els.notePreviewBackdrop?.addEventListener('click', closeNotePreview);
  els.closeNotePreviewBtn?.addEventListener('click', closeNotePreview);
  els.bookForm.addEventListener('submit', event => { event.preventDefault(); saveBook().catch(handleError); });
  els.deleteNoteBtn.addEventListener('click', () => deleteNote().catch(handleError));
  els.deleteBookBtn.addEventListener('click', () => deleteBook().catch(handleError));
  els.noteSearch.addEventListener('input', () => { state.noteSearch = els.noteSearch.value.trim().toLowerCase(); renderNotes(); });
  els.noteScripture.addEventListener('input', handleScriptureInput);
  els.fetchScriptureBtn.addEventListener('click', () => fetchAndRenderScriptures({ force: true, syncToContent: true }).catch(handleError));
  els.scriptureAppendToContent.addEventListener('change', () => {
    renderNotePreview();
  });
  els.addChapterBtn.addEventListener('click', () => addChapterFromSelectedNote().catch(handleError));
  els.chapterSourceNote.addEventListener('change', renderSelectedNotePreview);
  els.exportEpubBtn.addEventListener('click', () => exportSelectedBookEpub().catch(handleError));
  els.importEpubBtn?.addEventListener('click', () => handleImportEpubClick());
  els.importEpubInput?.addEventListener('change', event => handleImportEpubSelection(event).catch(handleError));
  els.supportBtn?.addEventListener('click', openSupportModal);
  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('[data-copy-support-email]')) copySupportEmail().catch(handleError);
    const supportCopyTarget = target?.closest('[data-copy-support-payment]');
    if (supportCopyTarget) {
      copySupportPaymentValue(
        supportCopyTarget.dataset.copySupportPayment,
        supportCopyTarget.dataset.copyLabel || '轉帳資訊',
      ).catch(handleError);
    }
  });
  document.getElementById('open-support-receipt-form-btn')?.addEventListener('click', () => setSupportReceiptView('receipt'));
  document.getElementById('back-support-payment-btn')?.addEventListener('click', () => setSupportReceiptView('payment'));
  document.getElementById('support-receipt-form')?.addEventListener('submit', handleSupportReceiptSubmit);
  els.closeSupportModal?.addEventListener('click', closeSupportModal);
  els.supportModalBackdrop?.addEventListener('click', closeSupportModal);
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (state.bookDraftSettingsModalOpen) {
      closeBookDraftSettingsModal();
      return;
    }
    if (state.bookExportSettingsModalOpen) {
      closeBookExportSettingsModal();
      return;
    }
    if (event.key === 'Escape' && !els.supportModal?.classList.contains('hidden')) closeSupportModal();
    if (event.key === 'Escape' && !els.authSettingsSheet?.classList.contains('hidden')) closeAuthSettings();
    if (event.key === 'Escape' && !els.authInlinePanel?.classList.contains('hidden')) closeAuthInline();
    if (event.key === 'Escape' && !els.accountSettingsModal?.classList.contains('hidden')) closeAccountSettingsModal();
    if (event.key === 'Escape' && !els.notePreviewModal?.classList.contains('hidden')) closeNotePreview();
    if (event.key === 'Escape' && state.bookDraftModalOpen) closeBookDraftModal();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && state.supabase && state.currentUser) {
      requestCloudReload('已重新連線並同步最新資料。', {
        minIntervalMs: PASSIVE_CLOUD_RELOAD_MIN_INTERVAL_MS,
        handleError: false,
      });
    }
  });
  window.addEventListener('online', () => {
    if (state.supabase && state.currentUser) {
      requestCloudReload('網路恢復後已重新同步。', {
        minIntervalMs: PASSIVE_CLOUD_RELOAD_MIN_INTERVAL_MS,
        handleError: false,
      });
    }
  });
  window.addEventListener('beforeunload', event => {
    if (!hasUnsavedCurrentNoteDraft()) return;
    persistCurrentNoteDraft({ immediate: true });
    event.preventDefault();
    event.returnValue = '';
  });
}

function openSupportModal() {
  setSupportReceiptView('payment');
  els.supportModal?.classList.remove('hidden');
  els.supportModal?.setAttribute('aria-hidden', 'false');
}
function closeSupportModal() {
  els.supportModal?.classList.add('hidden');
  els.supportModal?.setAttribute('aria-hidden', 'true');
}

function isDuplicateRegistrationError(error) {
  const message = String(error?.message || error?.code || error?.name || '').toLowerCase();
  return message.includes('already registered')
    || message.includes('already exists')
    || message.includes('user_already_exists')
    || message.includes('email_exists')
    || message.includes('email address already');
}

function isEmailRateLimitError(error) {
  const message = String(error?.message || error?.code || error?.name || '').toLowerCase();
  return message.includes('email rate limit')
    || message.includes('rate limit exceeded')
    || message.includes('too many requests')
    || message.includes('over_email_send_rate_limit');
}

async function handleRegister() {
  const { email, password } = getAuthCredentials();
  if (!email) throw new Error('\u8acb\u5148\u8f38\u5165 Email\u3002');
  if (!password || password.length < 6) throw new Error('\u5bc6\u78bc\u81f3\u5c11\u9700\u8981 6 \u78bc\u3002');
  if (state.supabase) {
    const { data, error } = await state.supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + window.location.pathname },
    });
    if (error) {
      if (isDuplicateRegistrationError(error)) throw new Error('\u6b64\u5e33\u865f\u5df2\u8a3b\u518a\u3002');
      throw createAuthError(error);
    }
    if (Array.isArray(data?.user?.identities) && data.user.identities.length === 0) {
      throw new Error('\u6b64\u5e33\u865f\u5df2\u8a3b\u518a\u3002');
    }
    showToast('帳戶已建立，請到信箱點擊驗證連結完成 Email 驗證。若沒看到信件，請檢查垃圾郵件匣。');
    return;
  }
  if (findLocalAccountByEmail(email)) throw new Error('\u9019\u500b Email \u5df2\u7d93\u5efa\u7acb\u904e\u5e33\u6236\u3002');
  const account = { id: uid('local_user'), email, password, created_at: nowIso() };
  const accounts = loadLocalAccounts();
  accounts.unshift(account);
  saveLocalAccounts(accounts);
  const user = sanitizeLocalUser(account);
  await completeLocalAuth(user, '\u672c\u6a5f\u5e33\u6236\u5df2\u5efa\u7acb\uff0c\u5df2\u9032\u5165\u9996\u9801\u3002');
}

async function handleLogin() {
  const { email, password } = getAuthCredentials();
  if (!email) throw new Error('\u8acb\u5148\u8f38\u5165 Email\u3002');
  if (state.supabase) {
    const { error } = await state.supabase.auth.signInWithPassword({ email, password });
    if (error) throw createAuthError(error);
    showToast('\u767b\u5165\u6210\u529f\u3002');
    return;
  }
  const account = findLocalAccountByEmail(email);
  if (!account || account.password !== password) throw new Error('Email \u6216\u5bc6\u78bc\u932f\u8aa4\u3002');
  const user = sanitizeLocalUser(account);
  await completeLocalAuth(user, '\u5df2\u767b\u5165\u672c\u6a5f\u5e33\u6236\u3002');
}

async function handleResetPassword() {
  const { email } = getAuthCredentials();
  if (!email) throw new Error('\u8acb\u5148\u8f38\u5165 Email\u3002');
  if (!state.supabase) throw new Error('\u91cd\u8a2d\u5bc6\u78bc\u9700\u8981\u5148\u8a2d\u5b9a Supabase\u3002');
  const { error } = await state.supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname,
  });
  if (error) throw createAuthError(error);
  showToast('\u91cd\u8a2d\u5bc6\u78bc\u4fe1\u5df2\u5bc4\u51fa\uff0c\u8acb\u6aa2\u67e5\u4fe1\u7bb1\u3002');
}

async function handleUpdateRecoveryPassword() {
  if (!state.supabase || !state.passwordRecoveryActive) {
    throw new Error('重設密碼連結已失效，請重新寄送忘記密碼信');
  }
  const newPassword = els.gateAuthPassword?.value?.trim() || '';
  const confirmPassword = els.gateAuthPasswordConfirm?.value?.trim() || '';
  if (!newPassword || newPassword.length < 6) throw new Error('新密碼至少需要 6 碼。');
  if (newPassword !== confirmPassword) throw new Error('新密碼與確認新密碼不一致。');
  const { error } = await state.supabase.auth.updateUser({ password: newPassword });
  if (error) {
    throw createAuthError(error, '重設密碼連結已失效，請重新寄送忘記密碼信。');
  }
  state.passwordRecoveryActive = false;
  state.currentUser = null;
  syncAuthInputs({ password: '' });
  showToast('密碼已更新，請重新登入');
  await state.supabase.auth.signOut();
  setSyncState({ status: '尚未登入', detail: '密碼已更新，請使用新密碼重新登入。', at: '' });
  refreshUi();
  openAuthInline('login');
}

async function handleAccountPasswordUpdate() {
  if (!state.supabase || !state.currentUser) throw new Error('請先登入後再修改密碼。');
  const newPassword = els.accountNewPassword?.value?.trim() || '';
  const confirmPassword = els.accountConfirmPassword?.value?.trim() || '';
  clearAccountPasswordMessage();
  if (!newPassword || newPassword.length < 6) {
    showAccountPasswordMessage('密碼至少需要 6 碼。');
    return;
  }
  if (newPassword !== confirmPassword) {
    showAccountPasswordMessage('新密碼與確認新密碼不一致。');
    return;
  }
  const { error } = await state.supabase.auth.updateUser({ password: newPassword });
  if (error) throw createAuthError(error);
  clearAccountPasswordFields();
  closeAccountSettingsModal();
  showToast('密碼已更新，請重新登入。');
  await state.supabase.auth.signOut();
  state.currentUser = null;
  resetProfileAvatarState();
  setSyncState({ status: '尚未登入', detail: '密碼已更新，請使用新密碼重新登入。', at: '' });
  await loadAllData({ silent: true });
  refreshUi();
  openAuthInline('login');
}

async function handleMagicLink() {
  const { email } = getAuthCredentials();
  if (!email) throw new Error('\u8acb\u5148\u8f38\u5165 Email\u3002');
  if (!state.supabase) throw new Error('Magic Link \u9700\u8981\u5148\u8a2d\u5b9a Supabase\u3002');
  const { error } = await state.supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + window.location.pathname },
  });
  if (error) throw createAuthError(error);
  showToast('Magic Link \u5df2\u5bc4\u51fa\u3002');
}

async function handleForgotPassword() {
  await handleResetPassword();
}

async function handleSignOut() {
  teardownCloudRealtime();
  closeAccountSettingsModal();
  if (state.supabase) {
    const { error } = await state.supabase.auth.signOut();
    if (error) throw createAuthError(error);
  } else {
    clearLocalUser();
    state.currentUser = null;
  }
  resetProfileAvatarState();
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

function normalizeBookProjectRow(book = {}, { detailLoaded = false } = {}) {
  return {
    ...book,
    chapters: detailLoaded ? parseMaybeJson(book.chapters, []) : [],
    cover_data_url: detailLoaded ? (book.cover_data_url || '') : '',
    preface: detailLoaded ? (book.preface || '') : '',
    afterword: detailLoaded ? (book.afterword || '') : '',
    language: resolveBookLanguage(book.language),
    include_chapter_summary: !!book.include_chapter_summary,
  };
}

function rememberBookProjectDetail(bookId = '') {
  if (bookId) state.bookProjectDetailIds.add(bookId);
}

function forgetBookProjectDetails() {
  state.bookProjectDetailIds = new Set();
  state.bookProjectDetailPromises = new Map();
}

function hasBookProjectDetail(bookId = '') {
  if (!bookId) return false;
  if (!(state.supabase && state.currentUser)) return true;
  return state.bookProjectDetailIds.has(bookId);
}

async function loadBookProjectDetail(bookId = '') {
  const existing = state.books.find(item => item.id === bookId) || null;
  if (!bookId || !(state.supabase && state.currentUser)) return existing;
  if (hasBookProjectDetail(bookId)) return existing;
  const inFlight = state.bookProjectDetailPromises.get(bookId);
  if (inFlight) {
    egressGuardInfo('bookProjectDetail:reuse-in-flight', { bookId });
    return inFlight;
  }
  const detailTask = (async () => {
    egressDebugLog('bookProjectDetail:start', { bookId });
    const { data, error } = await state.supabase
      .from('book_projects')
      .select('*')
      .eq('user_id', getUserId())
      .eq('id', bookId)
      .single();
    if (error) throw error;
    const fullBook = normalizeBookProjectRow(data || {}, { detailLoaded: true });
    const idx = state.books.findIndex(item => item.id === bookId);
    if (idx >= 0) state.books[idx] = { ...state.books[idx], ...fullBook };
    else state.books.unshift(fullBook);
    rememberBookProjectDetail(bookId);
    egressDebugLog('bookProjectDetail:loaded', { bookId, bytes: estimatePayloadBytes(data || {}) });
    return state.books.find(item => item.id === bookId) || fullBook;
  })().finally(() => {
    state.bookProjectDetailPromises.delete(bookId);
  });
  state.bookProjectDetailPromises.set(bookId, detailTask);
  return detailTask;
}

async function loadAllData({ silent = false, syncReason = '', reason = '', minIntervalMs = 0, force = false } = {}) {
  const loadReason = resolveLoadReason({ reason, syncReason });
  const isCloudLoad = !!(state.supabase && state.currentUser);
  if (isCloudLoad && state.loadAllDataPromise) {
    egressGuardInfo('loadAllData:reuse-in-flight', { reason: loadReason });
    return state.loadAllDataPromise;
  }
  if (isCloudLoad && state.cloudReloadPromise && state.cloudReloadPromise !== state.loadAllDataPromise) {
    egressGuardInfo('loadAllData:reuse-cloud-reload', { reason: loadReason });
    return state.cloudReloadPromise;
  }
  if (isCloudLoad && !force && minIntervalMs) {
    const elapsed = Date.now() - Number(state.lastCloudFullLoadAt || 0);
    if (elapsed < minIntervalMs) {
      egressGuardInfo('loadAllData:skip-recent-cloud-load', { reason: loadReason, elapsed, minIntervalMs });
      return false;
    }
  }
  const loadTask = (async () => {
    egressDebugLog('loadAllData:start', { reason: loadReason, silent });
    if (isCloudLoad) state.lastCloudFullLoadAt = Date.now();
    await refreshImportedLibraryState();
    if (state.supabase && state.currentUser) {
      const userId = state.currentUser.id;
      setSyncState({ status: '同步中', detail: '正在從雲端讀取資料…' });
      if (!silent) refreshUi();
      const [notesRes, booksRes, snapshotsRes] = await Promise.all([
        state.supabase.from('devotion_notes').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
        state.supabase.from('book_projects').select(BOOK_PROJECT_METADATA_SELECT).eq('user_id', userId).order('updated_at', { ascending: false }),
        state.supabase.from('book_snapshots').select('id,user_id,book_project_id,book_id:book_project_id,created_at').eq('user_id', userId).order('created_at', { ascending: false }),
      ]);
      if (notesRes.error) throw notesRes.error;
      if (booksRes.error) throw booksRes.error;
      if (snapshotsRes.error) throw snapshotsRes.error;
      egressDebugLog('loadAllData:tables', {
        reason: loadReason,
        notes: { count: (notesRes.data || []).length, bytes: estimatePayloadBytes(notesRes.data || []) },
        books: { count: (booksRes.data || []).length, bytes: estimatePayloadBytes(booksRes.data || []) },
        snapshots: { count: (snapshotsRes.data || []).length, bytes: estimatePayloadBytes(snapshotsRes.data || []) },
      });
      state.notes = notesRes.data || [];
      forgetBookProjectDetails();
      state.books = (booksRes.data || []).map(book => normalizeBookProjectRow(book, { detailLoaded: false }));
      state.snapshots = (snapshotsRes.data || []).map(s => ({ ...s, snapshot_json: parseMaybeJson(s.snapshot_json, null) }));
      await loadCloudLibrary(userId, { reason: loadReason });
      await syncPendingReadingProgress();
      markCloudSynced(syncReason || '雲端資料已讀取完成。');
    } else {
      const userId = getUserId();
      state.notes = loadJson(STORAGE_KEYS.notes, []).filter(item => item.user_id === userId);
      state.books = loadJson(STORAGE_KEYS.books, []).filter(item => item.user_id === userId).map(book => ({
        ...book,
        language: resolveBookLanguage(book.language),
        include_chapter_summary: !!book.include_chapter_summary,
      }));
      state.bookProjectDetailIds = new Set(state.books.map(book => book.id));
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
    const validBookIds = new Set(state.books.map(book => book.id));
    Object.keys(state.bookArrangementDrafts).forEach(bookId => {
      if (!validBookIds.has(bookId)) delete state.bookArrangementDrafts[bookId];
    });
    syncBookArrangementState(state.selectedBookId || '');
    await refreshProfileAvatar();
    refreshUi();
  })();
  if (!isCloudLoad) return loadTask;
  const guardedPromise = loadTask.finally(() => {
    if (state.loadAllDataPromise === guardedPromise) state.loadAllDataPromise = null;
  });
  state.loadAllDataPromise = guardedPromise;
  return state.loadAllDataPromise;
}

function parseMaybeJson(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

const BOOK_DRAFT_SETTINGS_MARKER_RE = /\n*<!--\s*devotion-book-draft-settings:([A-Za-z0-9+/=_-]+)\s*-->\s*$/;

function encodeBookDraftSettings(settings = {}) {
  try {
    const json = JSON.stringify(settings);
    return btoa(unescape(encodeURIComponent(json)));
  } catch {
    return '';
  }
}

function decodeBookDraftSettings(raw = '') {
  try {
    const json = decodeURIComponent(escape(atob(String(raw || ''))));
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function splitBookDraftDescription(description = '') {
  const raw = String(description || '');
  const match = raw.match(BOOK_DRAFT_SETTINGS_MARKER_RE);
  if (!match) return { visibleDescription: raw.trim(), settings: normalizeBookDraftSettings({}) };
  return {
    visibleDescription: raw.replace(BOOK_DRAFT_SETTINGS_MARKER_RE, '').trim(),
    settings: normalizeBookDraftSettings(decodeBookDraftSettings(match[1])),
  };
}

function normalizeBookDraftSettings(settings = {}) {
  const tags = Array.isArray(settings.tags)
    ? settings.tags
    : String(settings.tags || '').split(',');
  return {
    startDate: String(settings.startDate || '').trim(),
    endDate: String(settings.endDate || '').trim(),
    category: String(settings.category || '').trim(),
    tags: [...new Set(tags.map(tag => String(tag || '').trim()).filter(Boolean))],
  };
}

function hasBookDraftSettings(settings = {}) {
  const normalized = normalizeBookDraftSettings(settings);
  return !!(normalized.startDate || normalized.endDate || normalized.category || normalized.tags.length);
}

function buildBookDraftDescription(visibleDescription = '', settings = {}) {
  const visible = String(visibleDescription || '').trim();
  const normalized = normalizeBookDraftSettings(settings);
  if (!hasBookDraftSettings(normalized)) return visible;
  const encoded = encodeBookDraftSettings(normalized);
  if (!encoded) return visible;
  const marker = `<!-- devotion-book-draft-settings:${encoded} -->`;
  return visible ? `${visible}\n\n${marker}` : marker;
}

function getBookDraftDescription(book) {
  return splitBookDraftDescription(book?.description || '').visibleDescription;
}

function getBookDraftSettings(book) {
  return splitBookDraftDescription(book?.description || '').settings;
}

function formatBookDraftSettingsDateRange(settings = {}) {
  const { startDate, endDate } = normalizeBookDraftSettings(settings);
  if (startDate && endDate && startDate !== endDate) return `${startDate} ～ ${endDate}`;
  return startDate || endDate || '';
}

function resolveBookLanguage(value = '') {
  const lang = String(value || '').trim();
  return lang || DEFAULT_BOOK_LANGUAGE;
}

function ensureAdminUi() {
  const canAccessAdmin = isAdminUser();
  const desktopNav = document.querySelector('.desktop-sidebar-nav');
  const existingNavLink = document.getElementById('desktop-admin-dashboard-link');
  if (canAccessAdmin) {
    if (desktopNav && !existingNavLink) {
      const button = document.createElement('button');
      button.id = 'desktop-admin-dashboard-link';
      button.className = 'desktop-sidebar-link';
      button.type = 'button';
      button.dataset.view = 'admin-dashboard';
      button.innerHTML = `
        <span class="nav-icon asset-icon asset-sprite-system icon-gear" aria-hidden="true"></span>
        <span>管理後台</span>
      `;
      desktopNav.appendChild(button);
    }
  } else {
    existingNavLink?.remove();
  }

  const accountActionsSection = document.querySelector('#account-settings-modal .account-settings-section:last-of-type');
  const adminAccessSection = document.getElementById('account-admin-access-section');
  if (canAccessAdmin) {
    if (accountActionsSection && !adminAccessSection) {
      const section = document.createElement('div');
      section.id = 'account-admin-access-section';
      section.className = 'account-settings-section';
      section.innerHTML = `
        <span class="account-settings-label">管理後台</span>
        <div class="account-settings-actions">
          <button id="open-admin-dashboard-btn" class="ghost-btn" type="button" data-admin-view="admin-dashboard">前往管理後台</button>
        </div>
        <p class="caption">目前登入帳號已列入第一階段白名單，可進入管理後台。</p>
      `;
      accountActionsSection.insertAdjacentElement('beforebegin', section);
    }
  } else {
    adminAccessSection?.remove();
  }

  const adminView = document.getElementById('view-admin-dashboard');
  if (canAccessAdmin) {
    if (!adminView) {
      const libraryView = document.getElementById('view-library');
      const section = document.createElement('section');
      section.id = 'view-admin-dashboard';
      section.className = 'view admin-dashboard-view';
      section.innerHTML = `
        <section class="panel admin-dashboard-panel">
          <div class="panel-header">
            <div>
              <h2>管理後台</h2>
              <p class="muted">第一階段白名單入口，僅限授權管理者帳號可見。</p>
            </div>
          </div>
          <section class="admin-dashboard-section">
            <div class="panel-header">
              <div>
                <h3>站內內容統計</h3>
                <p class="muted">使用目前前端 state 與現有 Supabase / 本機資料來源彙整。</p>
              </div>
            </div>
            <div id="admin-summary-cards" class="admin-summary-grid"></div>
          </section>
          <section class="admin-dashboard-section">
            <div class="panel-header">
              <div>
                <h3>平台用量監控</h3>
                <p class="muted">先做監控卡佔位與狀態樣式，暫不直連任何平台 API。</p>
                <p class="caption">目前尚未接入 Supabase / Vercel 平台 API，因此本區尚非即時監控。後續接入後，將於開啟管理後台時更新，並可依用量比例顯示正常、注意、警告或危急。</p>
              </div>
            </div>
            <div id="admin-monitoring-groups" class="admin-monitoring-stack"></div>
          </section>
        </section>
      `;
      libraryView?.insertAdjacentElement('beforebegin', section);
    }
  } else {
    adminView?.remove();
  }

  els.viewNavLinks = [...document.querySelectorAll('.desktop-sidebar-link[data-view], .mobile-bottom-link[data-view], .nav-link[data-view]')];
  els.views = [...document.querySelectorAll('.view')];
  bindViewTriggers();
  const adminEntryButton = document.getElementById('open-admin-dashboard-btn');
  if (adminEntryButton && adminEntryButton.dataset.adminEntryBound !== 'true') {
    adminEntryButton.dataset.adminEntryBound = 'true';
    adminEntryButton.addEventListener('click', () => {
      els.accountSettingsModal?.classList.add('hidden');
      els.accountSettingsModal?.setAttribute('aria-hidden', 'true');
    });
  }
}

function sanitizeDisplayText(value, fallback = '') {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (!text) return fallback;
  if (text.includes('??') || text.includes('\uFFFD')) return fallback;
  const stripped = text.replace(/[?\uFFFD]/g, '');
  if (!stripped.trim()) return fallback;
  return text;
}

function getPrimaryViewLabel(viewName = '') {
  return {
    dashboard: '總覽',
    notes: '寫札記',
    'content-library': '札記庫',
    books: '選稿編排',
    'admin-dashboard': '管理後台',
    library: '書櫃',
    manual: '操作手冊',
  }[viewName] || '';
}

function getPrimaryViewIconClass(viewName = '') {
  return {
    dashboard: 'icon-home',
    notes: 'icon-note',
    'content-library': 'icon-note',
    books: 'icon-book',
    library: 'icon-library',
    manual: 'icon-book',
    'admin-dashboard': 'icon-gear',
  }[viewName] || 'icon-home';
}

function getMobileBottomNavItems() {
  const items = [
    { view: 'dashboard', label: '總覽' },
    { view: 'notes', label: '寫札記' },
    { view: 'content-library', label: '札記庫' },
    { view: 'books', label: '選稿編排' },
    { view: 'library', label: '書櫃' },
    { view: 'manual', label: '操作手冊' },
  ];
  if (isAdminUser()) {
    items.push({ view: 'admin-dashboard', label: '管理', id: 'mobile-admin-dashboard-link' });
  }
  return items;
}

function renderMobileBottomNav() {
  const mobileNav = document.querySelector('.bottom-nav');
  if (!mobileNav) return;
  const currentView = document.body.dataset.currentView || document.querySelector('.view.active')?.id?.replace('view-', '') || 'dashboard';
  mobileNav.innerHTML = getMobileBottomNavItems().map(item => `
    <button
      ${item.id ? `id="${item.id}"` : ''}
      class="nav-link mobile-bottom-link ${item.view === currentView ? 'active' : ''}"
      data-view="${escapeHtml(item.view)}"
      type="button"
    >
      <span class="nav-icon asset-icon asset-sprite-system ${escapeHtml(getPrimaryViewIconClass(item.view))}" aria-hidden="true"></span>
      <span>${escapeHtml(item.label)}</span>
    </button>
  `).join('');
  els.viewNavLinks = [...document.querySelectorAll('.desktop-sidebar-link[data-view], .mobile-bottom-link[data-view], .nav-link[data-view]')];
  bindViewTriggers(mobileNav);
}

function ensureWritingWorkspaceUi() {
  const notesView = document.getElementById('view-notes');
  if (!notesView) return;
  notesView.classList.add('note-writing-workspace');
  const panels = notesView.querySelectorAll('.panel');
  const [editorPanel, listPanel] = panels;
  editorPanel?.classList.add('note-writing-form-panel');
  listPanel?.classList.add('note-writing-list-panel', 'hidden');
  const editorHeader = editorPanel?.querySelector('.panel-header');
  editorHeader?.classList.add('panel-header-actions-only');
  editorHeader?.querySelector('h2')?.remove();
}

function getBookDraftSettingsElements() {
  return {
    modal: document.getElementById('book-draft-settings-modal'),
    backdrop: document.getElementById('book-draft-settings-backdrop'),
    body: document.getElementById('book-draft-settings-body'),
    title: document.getElementById('book-draft-settings-title'),
    closeBtn: document.getElementById('close-book-draft-settings-btn'),
    cancelBtn: document.getElementById('cancel-book-draft-settings-btn'),
    form: document.getElementById('book-draft-settings-form'),
    draftTitle: document.getElementById('book-draft-settings-draft-title'),
    description: document.getElementById('book-draft-settings-description'),
    startDate: document.getElementById('book-draft-settings-start-date'),
    endDate: document.getElementById('book-draft-settings-end-date'),
    category: document.getElementById('book-draft-settings-category'),
    tags: document.getElementById('book-draft-settings-tags'),
    saveBtn: document.getElementById('save-book-draft-settings-btn'),
  };
}

function closeBookDraftSettingsModal() {
  const { modal, form, body } = getBookDraftSettingsElements();
  state.bookDraftSettingsModalOpen = false;
  state.bookDraftSettingsBookId = null;
  modal?.classList.add('hidden');
  modal?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('book-draft-settings-open');
  if (form) form.dataset.bookId = '';
  if (body) body.scrollTop = 0;
}

function populateBookDraftSettingsModal(book) {
  const modalEls = getBookDraftSettingsElements();
  if (!book || !modalEls.form) return;
  const settings = getBookDraftSettings(book);
  modalEls.form.dataset.bookId = book.id;
  modalEls.title.textContent = `編輯選稿設定：${getBookDraftLabel(book)}`;
  modalEls.draftTitle.value = book.title || '';
  modalEls.description.value = getBookDraftDescription(book);
  modalEls.startDate.value = settings.startDate || '';
  modalEls.endDate.value = settings.endDate || '';
  modalEls.category.value = settings.category || '';
  modalEls.tags.value = (settings.tags || []).join(', ');
}

function openBookDraftSettingsModal(bookId = '') {
  const book = state.books.find(item => item.id === bookId);
  if (!book) throw new Error('找不到要編輯的選稿編排。');
  ensureBookDraftSettingsUi();
  state.bookDraftSettingsModalOpen = true;
  state.bookDraftSettingsBookId = bookId;
  populateBookDraftSettingsModal(book);
  const { modal, body } = getBookDraftSettingsElements();
  modal?.classList.remove('hidden');
  modal?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('book-draft-settings-open');
  if (body) body.scrollTop = 0;
}

function syncBookDraftSettingsActionState(isSaving = false) {
  const { saveBtn } = getBookDraftSettingsElements();
  if (!saveBtn) return;
  saveBtn.disabled = isSaving;
  saveBtn.textContent = isSaving ? '儲存中...' : '儲存設定';
}

async function saveBookDraftSettings() {
  const modalEls = getBookDraftSettingsElements();
  const bookId = modalEls.form?.dataset.bookId || '';
  const book = state.books.find(item => item.id === bookId);
  if (!book) throw new Error('找不到要更新的選稿編排。');
  const nextTitle = modalEls.draftTitle.value.trim();
  if (!nextTitle) throw new Error('請先輸入編排代稱。');
  const settings = normalizeBookDraftSettings({
    startDate: modalEls.startDate.value,
    endDate: modalEls.endDate.value,
    category: modalEls.category.value,
    tags: modalEls.tags.value,
  });
  syncBookDraftSettingsActionState(true);
  try {
    await persistBookChanges(bookId, {
      title: nextTitle,
      description: buildBookDraftDescription(modalEls.description.value.trim(), settings),
    });
    if (state.bookDraftModalBookId === bookId) state.bookDraftModalBookId = bookId;
    closeBookDraftSettingsModal();
    refreshUi();
    showToast('選稿編排設定已更新');
  } finally {
    syncBookDraftSettingsActionState(false);
  }
}

function ensureBookDraftSettingsUi() {
  if (document.getElementById('book-draft-settings-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'book-draft-settings-modal';
  modal.className = 'modal book-draft-settings-modal hidden';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div id="book-draft-settings-backdrop" class="modal-backdrop"></div>
    <div class="modal-card book-draft-settings-card" role="dialog" aria-modal="true" aria-labelledby="book-draft-settings-title">
      <div class="panel-header book-draft-settings-header">
        <div>
          <h2 id="book-draft-settings-title">編輯選稿設定</h2>
          <p class="modal-intro">這裡只更新這份選稿編排的基本資料；章節順序請到「整理章節」調整。</p>
        </div>
        <button id="close-book-draft-settings-btn" class="ghost-btn small" type="button">關閉</button>
      </div>
      <form id="book-draft-settings-form" class="book-draft-settings-form">
        <div id="book-draft-settings-body" class="book-draft-settings-scroll">
          <div class="book-draft-settings-grid">
            <label class="book-draft-settings-span-2">編排代稱
              <input id="book-draft-settings-draft-title" required placeholder="例：5月份靈修進度" />
            </label>
            <label class="book-draft-settings-span-2">整理說明
              <textarea id="book-draft-settings-description" rows="4" placeholder="簡短記下這份編排的方向或收錄範圍"></textarea>
            </label>
            <label>日期起
              <input id="book-draft-settings-start-date" type="date" />
            </label>
            <label>日期迄
              <input id="book-draft-settings-end-date" type="date" />
            </label>
            <label>分類
              <input id="book-draft-settings-category" placeholder="例：活潑生命" />
            </label>
            <label>標籤
              <input id="book-draft-settings-tags" placeholder="例：信心, 禱告, 盼望" />
            </label>
          </div>
        </div>
        <div class="book-draft-settings-actions" role="group" aria-label="編輯選稿設定操作">
          <button id="cancel-book-draft-settings-btn" class="ghost-btn" type="button">取消</button>
          <button id="save-book-draft-settings-btn" class="secondary-btn" type="submit">儲存設定</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  const modalEls = getBookDraftSettingsElements();
  modalEls.backdrop?.addEventListener('click', closeBookDraftSettingsModal);
  modalEls.closeBtn?.addEventListener('click', closeBookDraftSettingsModal);
  modalEls.cancelBtn?.addEventListener('click', closeBookDraftSettingsModal);
  modalEls.form?.addEventListener('submit', event => {
    event.preventDefault();
    saveBookDraftSettings().catch(handleError);
  });
}

function getBookExportSettingsElements() {
  return {
    modal: document.getElementById('book-export-settings-modal'),
    backdrop: document.getElementById('book-export-settings-backdrop'),
    body: document.getElementById('book-export-settings-body'),
    title: document.getElementById('book-export-settings-title'),
    intro: document.getElementById('book-export-settings-intro'),
    closeBtn: document.getElementById('close-book-export-settings-btn'),
    dismissBtn: document.getElementById('dismiss-book-export-settings-btn'),
    form: document.getElementById('book-export-settings-form'),
    bookTitle: document.getElementById('book-export-settings-book-title'),
    subtitle: document.getElementById('book-export-settings-subtitle'),
    author: document.getElementById('book-export-settings-author'),
    description: document.getElementById('book-export-settings-description'),
    template: document.getElementById('book-export-settings-template'),
    cover: document.getElementById('book-export-settings-cover'),
    coverPreview: document.getElementById('book-export-settings-cover-preview'),
    preface: document.getElementById('book-export-settings-preface'),
    afterword: document.getElementById('book-export-settings-afterword'),
    saveBtn: document.getElementById('save-book-export-settings-btn'),
    saveAndExportBtn: document.getElementById('save-and-export-book-btn'),
  };
}

function renderBookExportCoverPreview(coverDataUrl = '', fallbackTitle = '目前封面') {
  const { coverPreview } = getBookExportSettingsElements();
  if (!coverPreview) return;
  if (coverDataUrl) {
    coverPreview.innerHTML = `
      <img src="${coverDataUrl}" alt="${escapeHtml(fallbackTitle)}" />
      <div class="book-export-settings-cover-copy">
        <strong>目前封面</strong>
        <span>已沿用既有封面欄位</span>
      </div>
    `;
    coverPreview.classList.remove('is-empty');
    return;
  }
  coverPreview.innerHTML = `
    <div class="book-export-settings-cover-copy">
      <strong>尚未設定封面</strong>
      <span>可沿用既有封面欄位，上傳後只更新目前編排設定。</span>
    </div>
  `;
  coverPreview.classList.add('is-empty');
}

function closeBookExportSettingsModal() {
  const { modal, form, body } = getBookExportSettingsElements();
  state.bookExportSettingsModalOpen = false;
  modal?.classList.add('hidden');
  modal?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('book-export-settings-open');
  if (form) form.dataset.bookId = '';
  if (body) body.scrollTop = 0;
}

function populateBookExportSettingsModal(book) {
  const modalEls = getBookExportSettingsElements();
  if (!book || !modalEls.form) return;
  modalEls.form.dataset.bookId = book.id;
  modalEls.form.dataset.coverDataUrl = book.cover_data_url || '';
  modalEls.title.textContent = '成書匯出設定';
  modalEls.intro.textContent = `設定「${getBookDraftLabel(book)}」的正式成書資訊，儲存後不會立即匯出 EPUB。`;
  modalEls.bookTitle.value = book.title || '';
  modalEls.subtitle.value = book.subtitle || '';
  modalEls.author.value = book.author_name || '';
  modalEls.description.value = getBookDraftDescription(book);
  modalEls.template.value = book.template_code || 'devotion';
  modalEls.preface.value = book.preface || '';
  modalEls.afterword.value = book.afterword || '';
  modalEls.cover.value = '';
  renderBookExportCoverPreview(book.cover_data_url || '', getBookDraftLabel(book));
}

async function openBookExportSettingsModal(bookId = '') {
  if (bookId) state.selectedBookId = bookId;
  let book = getSelectedBook();
  if (!book) throw new Error('請先選取一份選稿編排。');
  book = await loadBookProjectDetail(book.id) || book;
  ensureBookExportSettingsUi();
  populateBookExportSettingsModal(book);
  const { modal, body } = getBookExportSettingsElements();
  state.bookExportSettingsModalOpen = true;
  modal?.classList.remove('hidden');
  modal?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('book-export-settings-open');
  if (body) body.scrollTop = 0;
}

function syncBookExportSettingsActionState(mode = 'idle') {
  const modalEls = getBookExportSettingsElements();
  const isBusy = mode !== 'idle';
  if (modalEls.saveBtn) {
    modalEls.saveBtn.disabled = isBusy;
    modalEls.saveBtn.textContent = mode === 'saving' ? '儲存中...' : '儲存設定';
  }
  if (modalEls.saveAndExportBtn) {
    modalEls.saveAndExportBtn.disabled = isBusy;
    modalEls.saveAndExportBtn.textContent = mode === 'exporting' ? '儲存並匯出中...' : '儲存並匯出 EPUB';
  }
}

async function saveBookExportSettings({ closeAfterSave = false, silent = false, actionMode = 'saving' } = {}) {
  const modalEls = getBookExportSettingsElements();
  const bookId = modalEls.form?.dataset.bookId || '';
  const book = await loadBookProjectDetail(bookId) || state.books.find(item => item.id === bookId);
  if (!book) throw new Error('找不到要更新的選稿編排。');
  const existingCover = modalEls.form?.dataset.coverDataUrl || book.cover_data_url || '';
  const coverDataUrl = modalEls.cover?.files?.[0] ? await fileToDataUrl(modalEls.cover.files[0]) : existingCover;
  const nextTitle = modalEls.bookTitle.value.trim();
  if (!nextTitle) throw new Error('請先輸入書名。');
  syncBookExportSettingsActionState(actionMode);
  try {
    await persistBookChanges(bookId, {
      title: nextTitle,
      subtitle: modalEls.subtitle.value.trim(),
      author_name: modalEls.author.value.trim(),
      description: buildBookDraftDescription(modalEls.description.value.trim(), getBookDraftSettings(book)),
      template_code: modalEls.template.value,
      cover_data_url: coverDataUrl,
      preface: modalEls.preface.value.trim(),
      afterword: modalEls.afterword.value.trim(),
    });
    state.selectedBookId = bookId;
    refreshUi();
    const refreshedBook = getSelectedBook();
    if (refreshedBook && state.bookExportSettingsModalOpen && !closeAfterSave) {
      populateBookExportSettingsModal(refreshedBook);
    }
    if (closeAfterSave) closeBookExportSettingsModal();
    if (!silent) showToast(`已儲存「${nextTitle}」的成書設定。`);
    return refreshedBook || book;
  } finally {
    syncBookExportSettingsActionState('idle');
  }
}

async function saveBookExportSettingsAndExport() {
  await saveBookExportSettings({ closeAfterSave: true, silent: true, actionMode: 'exporting' });
  await exportSelectedBookEpub();
}

function ensureBookExportSettingsUi() {
  if (document.getElementById('book-export-settings-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'book-export-settings-modal';
  modal.className = 'modal book-export-settings-modal hidden';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div id="book-export-settings-backdrop" class="modal-backdrop"></div>
    <div class="modal-card book-export-settings-card" role="dialog" aria-modal="true" aria-labelledby="book-export-settings-title">
      <div class="panel-header book-export-settings-header">
        <div>
          <h2 id="book-export-settings-title">成書匯出設定</h2>
          <p id="book-export-settings-intro" class="modal-intro">設定目前編排的正式成書資訊，儲存後不會立即匯出 EPUB。</p>
        </div>
        <button id="close-book-export-settings-btn" class="ghost-btn small" type="button">關閉</button>
      </div>
      <form id="book-export-settings-form" class="book-export-settings-form">
        <div id="book-export-settings-body" class="book-export-settings-scroll">
          <div class="book-export-settings-grid">
            <label>書名
              <input id="book-export-settings-book-title" required placeholder="例：五月靈修選集" />
            </label>
            <label>副標
              <input id="book-export-settings-subtitle" placeholder="例：安靜同行的三十天" />
            </label>
            <label>作者
              <input id="book-export-settings-author" placeholder="例：Jeremiah" />
            </label>
            <label>模板
              <select id="book-export-settings-template">
                <option value="devotion">靈修札記版</option>
                <option value="sermon">講章整理版</option>
                <option value="testimony">見證合集版</option>
              </select>
            </label>
            <label class="book-export-settings-span-2">書籍簡介
              <textarea id="book-export-settings-description" rows="4" placeholder="介紹這本書的主題、收錄範圍與閱讀方向"></textarea>
            </label>
            <div class="book-export-settings-span-2 book-export-settings-cover-block">
              <div id="book-export-settings-cover-preview" class="book-export-settings-cover-preview is-empty"></div>
              <label>封面圖片
                <input id="book-export-settings-cover" type="file" accept="image/*" />
              </label>
            </div>
            <label class="book-export-settings-span-2">前言
              <textarea id="book-export-settings-preface" rows="5" placeholder="寫下這本書的前言"></textarea>
            </label>
            <label class="book-export-settings-span-2">後記
              <textarea id="book-export-settings-afterword" rows="5" placeholder="寫下這本書的後記"></textarea>
            </label>
          </div>
        </div>
        <div class="book-export-settings-actions" role="group" aria-label="成書匯出設定操作">
          <button id="dismiss-book-export-settings-btn" class="ghost-btn" type="button">取消 / 關閉</button>
          <div class="book-export-settings-actions-primary">
            <button id="save-book-export-settings-btn" class="secondary-btn" type="submit">儲存設定</button>
            <button id="save-and-export-book-btn" class="primary-btn" type="button">儲存並匯出 EPUB</button>
          </div>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  const modalEls = getBookExportSettingsElements();
  modalEls.backdrop?.addEventListener('click', closeBookExportSettingsModal);
  modalEls.closeBtn?.addEventListener('click', closeBookExportSettingsModal);
  modalEls.dismissBtn?.addEventListener('click', closeBookExportSettingsModal);
  modalEls.form?.addEventListener('submit', event => {
    event.preventDefault();
    saveBookExportSettings().catch(handleError);
  });
  modalEls.saveAndExportBtn?.addEventListener('click', () => saveBookExportSettingsAndExport().catch(handleError));
  modalEls.cover?.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    const fallbackTitle = modalEls.bookTitle?.value?.trim() || '目前封面';
    if (!file) {
      renderBookExportCoverPreview(modalEls.form?.dataset.coverDataUrl || '', fallbackTitle);
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    renderBookExportCoverPreview(dataUrl, fallbackTitle);
  });
}

function syncDesktopDashboardStaticCopy() {
  document.querySelector('.sidebar-brand-copy h1')?.replaceChildren(document.createTextNode('我的靈修書房'));
  document.querySelector('.sidebar-brand-copy .muted')?.replaceChildren(document.createTextNode('Desktop Dashboard'));
  document.querySelectorAll('.desktop-sidebar-link, .mobile-bottom-link, .nav-link[data-view]').forEach(link => {
    const label = link.querySelector('span:last-child');
    if (!label) return;
    const copy = getPrimaryViewLabel(link.dataset.view)
      || (link.classList.contains('is-muted')
        ? ['標籤', '統計', '成書匯出'][[...link.parentElement.querySelectorAll('.desktop-sidebar-link.is-muted')].indexOf(link)]
        : (link.dataset.openAccountSettings != null ? '設定' : '設定'));
    label.textContent = copy;
  });
  document.querySelector('.desktop-sidebar-footer-label')?.replaceChildren(document.createTextNode('帳號'));
  document.querySelector('.desktop-sidebar-account-copy p')?.replaceChildren(document.createTextNode('願你的文字成為祝福'));
  document.querySelector('.desktop-sidebar-account-actions [data-open-account-settings]')?.replaceChildren(document.createTextNode('帳號設定'));
  document.querySelector('#force-sync-btn .sync-btn-content span:last-child')?.replaceChildren(document.createTextNode('立即同步'));
  document.querySelector('#desktop-sidebar-signout-btn')?.replaceChildren(document.createTextNode('登出'));
  document.querySelector('.hero-copy h1')?.replaceChildren(document.createTextNode('我的靈修書房'));
  document.querySelector('.hero-copy p')?.replaceChildren(document.createTextNode('整理每日札記，慢慢編成一本書'));
  document.querySelectorAll('.home-summary-cards .summary-card')[0]?.querySelector('.summary-content span')?.replaceChildren(document.createTextNode('札記'));
  document.querySelectorAll('.home-summary-cards .summary-card')[1]?.querySelector('.summary-content span')?.replaceChildren(document.createTextNode('書稿'));
  document.querySelectorAll('.home-summary-cards .summary-card')[2]?.querySelector('.summary-content span')?.replaceChildren(document.createTextNode('書櫃'));
  document.querySelector('#summary-notes-count + small')?.replaceChildren(document.createTextNode('篇'));
  document.querySelector('#summary-books-count + small')?.replaceChildren(document.createTextNode('本'));
  document.querySelector('#library-count + small')?.replaceChildren(document.createTextNode('本'));
  document.querySelector('#quick-new-note strong')?.replaceChildren(document.createTextNode('寫一篇札記'));
  document.querySelector('#quick-new-book strong')?.replaceChildren(document.createTextNode('建立一本書'));
  document.querySelector('.home-recent-panel .panel-header h2')?.replaceChildren(document.createTextNode('最近編輯札記'));
  document.querySelector('#recent-books-heading')?.replaceChildren(document.createTextNode('最近編輯書冊'));
  document.querySelector('#dashboard-bookshelf-card .panel-header h2')?.replaceChildren(document.createTextNode('書櫃'));
  document.querySelector('.home-today-devotion-card .panel-header h2')?.replaceChildren(document.createTextNode('今日默想'));
}

function refreshUi() {
  runAutoBackupCheck();
  const isPasswordRecovery = state.passwordRecoveryActive;
  const isSignedIn = !!state.currentUser && !isPasswordRecovery;
  const accountEmail = String(state.currentUser?.email || state.currentUser?.id || '').trim() || '未顯示帳號';
  syncDesktopDashboardStaticCopy();
  ensureWritingWorkspaceUi();
  ensureOperationManualUi();
  ensureBookDraftWorkspaceUi();
  renderMobileBottomNav();
  ensureAdminUi();
  ensureBookDraftSettingsUi();
  ensureBookExportSettingsUi();
  if (isAdminView(document.body.dataset.currentView || 'dashboard') && !isAdminUser()) {
    setView('dashboard');
  }
  if (els.authModeBadge) els.authModeBadge.textContent = state.supabase ? '雲端模式' : '本機模式';
  if (els.statusStorage) els.statusStorage.textContent = state.supabase ? 'Supabase' : 'Local';
  if (els.statusSync) els.statusSync.textContent = state.syncStatus || '未啟用';
  els.authForms.classList.toggle('hidden', isSignedIn);
  els.authUser.classList.toggle('hidden', !isSignedIn);
  els.currentUserText.textContent = isSignedIn ? `目前使用者：${accountEmail}` : '尚未登入';
  if (els.accountEmail) els.accountEmail.textContent = accountEmail;
  if (els.desktopAccountEmail) els.desktopAccountEmail.textContent = isSignedIn ? accountEmail : '尚未登入';
  syncProfileAvatarUi();
  syncAccountSettingsModal();
  els.accountSignoutBtn?.toggleAttribute('disabled', !isSignedIn);
  els.desktopSidebarSignoutBtn?.toggleAttribute('disabled', !isSignedIn);
  document.body.classList.toggle('auth-locked', !isSignedIn);
  els.authGate?.classList.toggle('hidden', isSignedIn);
  els.authGate?.setAttribute('aria-hidden', isSignedIn ? 'true' : 'false');
  if (els.authInlineHint) {
    els.authInlineHint.textContent = state.supabase
      ? '\u76ee\u524d\u4f7f\u7528 Supabase Auth\uff0c\u8acb\u4f7f\u7528\u4fe1\u7bb1\u8207\u5bc6\u78bc\u767b\u5165\uff0c\u6216\u6539\u7528 Magic Link\u3002'
      : '\u76ee\u524d\u70ba\u672c\u6a5f\u6a21\u5f0f\uff0c\u4e0d\u9700\u8a2d\u5b9a Supabase \uff0c\u53ef\u76f4\u63a5\u5efa\u7acb\u6216\u767b\u5165\u672c\u6a5f\u5e33\u6236\u3002';
  }
  if (els.authInlineResetHint) {
    els.authInlineResetHint.classList.toggle('hidden', state.authInlineMode !== 'login');
  }
  if (els.gateSupabaseUrl && document.activeElement !== els.gateSupabaseUrl && document.activeElement !== els.gateSupabaseAnonKey) syncConfigInputs();
  const showSyncPanel = isSignedIn;
  els.cloudSyncPanel?.classList.toggle('hidden', !showSyncPanel);
  const cloudActionsAvailable = !!(state.supabase && isSignedIn);
  els.accountCloudActions?.classList.remove('hidden');
  els.pushLocalToCloudBtn?.toggleAttribute('disabled', !cloudActionsAvailable);
  els.downloadBackupBtn?.toggleAttribute('disabled', !cloudActionsAvailable);
  if (els.accountCloudHint) {
    els.accountCloudHint.textContent = cloudActionsAvailable
      ? '登入雲端帳號後，可把本機資料上傳或下載雲端備份。'
      : '本機模式下會保留這兩個入口；若要使用雲端同步與備份，請先設定並登入 Supabase。';
  }
  if (els.syncStatusText) els.syncStatusText.textContent = state.syncStatus || '未啟用';
  if (els.syncLastTime) els.syncLastTime.textContent = state.lastSyncAt ? formatDate(state.lastSyncAt) : '尚未同步';
  if (els.syncDetailText) els.syncDetailText.textContent = state.syncDetail || '登入同一個雲端帳號後，可在多裝置同步。';
  if (isSignedIn) {
    closeAuthInline();
    closeAuthSettings();
    syncAuthInputs({ email: state.currentUser.email || '', password: '' });
  }
  els.summaryNotesCount.textContent = state.notes.length;
  els.summaryBooksCount.textContent = state.books.length;
  const libraryCount = document.getElementById('library-count');
  if (libraryCount) libraryCount.textContent = String(getAllLibraryBooksForView().length);
  renderRecentCards();
  renderDesktopBookshelfCard();
  renderTodayDevotionCard();
  renderNotes();
  renderNoteReader();
  renderContentLibrary();
  renderBooks();
  renderSelectedBookPanel();
  renderLibrary();
  renderAdminDashboard();
  renderReaderSettings();
  syncCurrentNoteDraftNotice();
}

function renderRecentCards() {
  renderCardList(els.recentNotes, state.notes.slice(0, 3), note => {
    const title = sanitizeDisplayText(note.title, '未命名札記');
    const scripture = sanitizeDisplayText(note.scripture_reference, '未設定經文');
    const summary = sanitizeDisplayText(note.summary, '')
      || sanitizeDisplayText(note.content, '')
      || '尚無摘要';
    return `
      <div class="card">
        <h3>${escapeHtml(title)}</h3>
        <div class="card-meta"><span>${escapeHtml(scripture)}</span><span>${formatDate(note.updated_at)}</span></div>
        <div>${escapeHtml(summary.slice(0, 90))}</div>
      </div>`;
  }, '目前還沒有札記。');
  renderCardList(els.recentBooks, state.books.slice(0, 3), book => {
    const title = sanitizeDisplayText(book.title, '未命名書籍');
    const template = sanitizeDisplayText(TEMPLATE_LABELS[book.template_code], '一般書籍');
    const summary = sanitizeDisplayText(getBookDraftDescription(book), '尚無摘要');
    return `
      <div class="card">
        <h3>${escapeHtml(title)}</h3>
        <div class="card-meta"><span>${escapeHtml(template)}</span><span>${(book.chapters || []).length} 章</span></div>
        <div>${escapeHtml(summary.slice(0, 90))}</div>
      </div>`;
  }, '目前還沒有書籍。');
}

function getContentLibraryNoteDateValue(note) {
  const raw = note?.updated_at || note?.created_at || '';
  if (!raw) return '';
  const match = String(raw).match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

function getNoteTagList(note) {
  if (Array.isArray(note?.tags)) return note.tags.map(tag => String(tag || '').trim()).filter(Boolean);
  if (typeof note?.tags === 'string') return note.tags.split(',').map(tag => tag.trim()).filter(Boolean);
  return [];
}

function getChapterSourceNoteId(chapter = {}) {
  return String(chapter?.source_note_id || chapter?.note_id || '').trim();
}

function getContentLibraryFilteredNotes() {
  const query = state.contentLibrarySearch.trim().toLowerCase();
  return state.notes.filter(note => {
    const searchHaystack = [
      note.title,
      note.content,
      note.summary,
      note.scripture_reference,
    ].join(' ').toLowerCase();
    if (query && !searchHaystack.includes(query)) return false;
    if (state.contentLibraryCategory && String(note.category || '').trim() !== state.contentLibraryCategory) return false;
    if (state.contentLibraryTag && !getNoteTagList(note).includes(state.contentLibraryTag)) return false;
    const noteDate = getContentLibraryNoteDateValue(note);
    if (state.contentLibraryDateFrom && (!noteDate || noteDate < state.contentLibraryDateFrom)) return false;
    if (state.contentLibraryDateTo && (!noteDate || noteDate > state.contentLibraryDateTo)) return false;
    return true;
  });
}

function renderContentLibrary() {
  if (!els.contentLibraryList) return;
  const categories = [...new Set(state.notes.map(note => String(note.category || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-Hant'));
  const tags = [...new Set(state.notes.flatMap(note => getNoteTagList(note)).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-Hant'));
  const validNoteIds = new Set(state.notes.map(note => note.id));
  state.contentLibrarySelectedNoteIds = state.contentLibrarySelectedNoteIds.filter(id => validNoteIds.has(id));

  if (els.contentLibrarySearch && els.contentLibrarySearch.value !== state.contentLibrarySearch) els.contentLibrarySearch.value = state.contentLibrarySearch;
  if (els.contentLibraryDateFrom && els.contentLibraryDateFrom.value !== state.contentLibraryDateFrom) els.contentLibraryDateFrom.value = state.contentLibraryDateFrom;
  if (els.contentLibraryDateTo && els.contentLibraryDateTo.value !== state.contentLibraryDateTo) els.contentLibraryDateTo.value = state.contentLibraryDateTo;
  if (els.contentLibraryCategory) {
    els.contentLibraryCategory.innerHTML = ['<option value="">全部分類</option>', ...categories.map(category => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)].join('');
    els.contentLibraryCategory.value = state.contentLibraryCategory;
  }
  if (els.contentLibraryTag) {
    els.contentLibraryTag.innerHTML = ['<option value="">全部標籤</option>', ...tags.map(tag => `<option value="${escapeHtml(tag)}">${escapeHtml(tag)}</option>`)].join('');
    els.contentLibraryTag.value = state.contentLibraryTag;
  }

  const selectedBook = getSelectedBook();
  const displayChapters = getBookDisplayChapters(selectedBook);
  const chapterSourceIds = new Set(displayChapters.map(chapter => getChapterSourceNoteId(chapter)).filter(Boolean));
  const filteredNotes = getContentLibraryFilteredNotes();
  const selectedCount = state.contentLibrarySelectedNoteIds.length;
  const selectedBookTitle = getBookDraftLabel(selectedBook);
  if (els.contentLibrarySelectionCount) {
    els.contentLibrarySelectionCount.textContent = selectedBook
      ? `已選 ${selectedCount} 篇｜目前正在編排：${selectedBookTitle}｜已收錄 ${displayChapters.length} 章`
      : '尚未選擇目前正在編排的書稿';
  }
  if (els.contentLibraryBookHint) {
    els.contentLibraryBookHint.textContent = selectedBook
      ? (selectedCount
        ? `將把勾選的札記加入「${selectedBookTitle}」${hasBookArrangementDraft(selectedBook.id) ? '（含尚未儲存的章節調整）' : ''}`
        : `請先勾選要加入「${selectedBookTitle}」的札記`)
      : '請先到選稿編排建立或選擇一份書稿。';
  }
  if (els.contentLibraryAddSelected) {
    els.contentLibraryAddSelected.disabled = !selectedBook || !selectedCount || state.bookArrangementSaving;
    els.contentLibraryAddSelected.textContent = !selectedBook
      ? '請先選擇編排'
      : selectedCount
        ? `加入「${selectedBookTitle}」（已選 ${selectedCount} 篇）`
        : '先勾選札記';
    els.contentLibraryAddSelected.classList.toggle('primary-btn', !!selectedBook && !!selectedCount && !state.bookArrangementSaving);
    els.contentLibraryAddSelected.classList.toggle('secondary-btn', !selectedBook || !selectedCount || state.bookArrangementSaving);
  }
  if (els.contentLibraryGoWorkbench) els.contentLibraryGoWorkbench.classList.toggle('hidden', !!selectedBook);
  if (els.contentLibraryClearSelection) els.contentLibraryClearSelection.disabled = !selectedCount;

  if (!filteredNotes.length) {
    els.contentLibraryList.className = 'list-stack empty-state';
    els.contentLibraryList.textContent = state.notes.length ? '找不到符合條件的文章。' : '目前還沒有可整理的札記。';
    return;
  }

  els.contentLibraryList.className = 'list-stack';
  els.contentLibraryList.innerHTML = filteredNotes.map(note => {
    const tagsText = getNoteTagList(note).join('、');
    const isSelected = state.contentLibrarySelectedNoteIds.includes(note.id);
    const inBook = chapterSourceIds.has(note.id);
    return `
      <article class="card">
        <div class="row gap-sm wrap">
          <label class="checkbox-row">
            <input type="checkbox" data-content-library-note="${note.id}" ${isSelected ? 'checked' : ''} />
            <span>選取</span>
          </label>
          ${inBook ? '<span class="badge">已在書中</span>' : ''}
        </div>
        <h3>${escapeHtml(note.title || '未命名札記')}</h3>
        <div class="card-meta">
          <span>${escapeHtml(note.scripture_reference || '未填經文')}</span>
          <span>${escapeHtml(note.category || '未分類')}</span>
          <span>${escapeHtml(tagsText || '未設標籤')}</span>
          <span>${escapeHtml(formatDate(note.updated_at || note.created_at))}</span>
        </div>
        <div>${escapeHtml((note.summary || note.content || '').slice(0, 160) || '尚未填寫摘要。')}</div>
        <div class="card-actions">
          <button class="secondary-btn" type="button" data-content-library-edit-note="${note.id}">編輯</button>
        </div>
      </article>
    `;
  }).join('');

  els.contentLibraryList.querySelectorAll('[data-content-library-note]').forEach(input => input.addEventListener('change', event => {
    const noteId = event.target.dataset.contentLibraryNote;
    if (!noteId) return;
    const next = new Set(state.contentLibrarySelectedNoteIds);
    if (event.target.checked) next.add(noteId); else next.delete(noteId);
    state.contentLibrarySelectedNoteIds = [...next];
    renderContentLibrary();
  }));
  els.contentLibraryList.querySelectorAll('[data-content-library-edit-note]').forEach(btn => btn.addEventListener('click', () => populateNoteForm(btn.dataset.contentLibraryEditNote)));
}

function getBookDraftLabel(book) {
  return sanitizeDisplayText(book?.title, '未命名編排');
}

function getBookDraftSourceNotes(book) {
  return getBookDisplayChapters(book)
    .map(chapter => getNoteById(getChapterSourceNoteId(chapter)))
    .filter(Boolean);
}

function getBookDraftScopeSummary(book) {
  const settings = getBookDraftSettings(book);
  const settingsScopeParts = [];
  const settingsDateRange = formatBookDraftSettingsDateRange(settings);
  if (settingsDateRange) settingsScopeParts.push(`日期 ${settingsDateRange}`);
  if (settings.category) settingsScopeParts.push(`分類 ${settings.category}`);
  if (settings.tags.length) settingsScopeParts.push(`標籤 ${settings.tags.slice(0, 3).map(tag => `#${tag}`).join(' ')}`);
  if (settingsScopeParts.length) return settingsScopeParts.join('｜');

  const notes = getBookDraftSourceNotes(book);
  if (!notes.length) return '尚未收錄札記';
  const dates = notes.map(note => getContentLibraryNoteDateValue(note)).filter(Boolean).sort();
  const categories = [...new Set(notes.map(note => String(note.category || '').trim()).filter(Boolean))];
  const tags = [...new Set(notes.flatMap(note => getNoteTagList(note)).filter(Boolean))];
  const scopeParts = [];
  if (dates.length) {
    const dateText = dates[0] === dates[dates.length - 1]
      ? dates[0]
      : `${dates[0]} ～ ${dates[dates.length - 1]}`;
    scopeParts.push(`日期 ${dateText}`);
  }
  if (categories.length) scopeParts.push(`分類 ${categories.slice(0, 2).join('、')}`);
  if (tags.length) scopeParts.push(`標籤 ${tags.slice(0, 3).map(tag => `#${tag}`).join(' ')}`);
  return scopeParts.join('｜') || '已加入札記，待進一步整理';
}

function getBookDraftStatus(book) {
  const chapterCount = getBookDisplayChapters(book).length;
  if (hasBookArrangementDraft(book.id)) return '尚未儲存';
  if (!chapterCount) return '待整理';
  return '待成書設定';
}

function getBookDraftStatusTone(book) {
  const status = getBookDraftStatus(book);
  if (status === '尚未儲存') return 'is-warning';
  if (status === '待整理') return 'is-muted';
  return 'is-ready';
}

async function openBookDraftModal(bookId = '', { focusChapters = false } = {}) {
  state.bookDraftModalBookId = bookId || state.selectedBookId || null;
  state.bookDraftModalOpen = true;
  const detailPromise = state.bookDraftModalBookId ? loadBookProjectDetail(state.bookDraftModalBookId) : Promise.resolve(null);
  refreshUi();
  await detailPromise;
  refreshUi();
  if (focusChapters) {
    requestAnimationFrame(() => {
      const overviewPanel = document.getElementById('book-draft-modal-right-body') || document.querySelector('.book-draft-overview-panel');
      const chaptersList = document.getElementById('chapters-list');
      if (!overviewPanel || !chaptersList) return;
      overviewPanel.scrollTo({
        top: Math.max(chaptersList.offsetTop - 96, 0),
        behavior: 'smooth',
      });
    });
  }
}

function closeBookDraftModal() {
  state.bookDraftModalOpen = false;
  state.bookDraftModalBookId = null;
  refreshUi();
}

async function focusSelectedDraftPanel(bookId = '') {
  await openBookDraftModal(bookId, { focusChapters: true });
}

function setCurrentBookDraft(bookId = '') {
  if (!bookId) return;
  const book = state.books.find(item => item.id === bookId);
  state.selectedBookId = bookId;
  if (state.bookDraftModalOpen) state.bookDraftModalBookId = bookId;
  refreshUi();
  showToast(`已切換目前編排：${getBookDraftLabel(book)}`);
}

async function goToContentLibraryForBookDraft(bookId = '') {
  if (bookId) state.selectedBookId = bookId;
  if (state.selectedBookId) await loadBookProjectDetail(state.selectedBookId);
  state.bookDraftModalOpen = false;
  setView('content-library');
  refreshUi();
}

function ensureBookDraftWorkspaceUi() {
  document.querySelectorAll('[data-view="books"] span:last-child').forEach(label => {
    label.textContent = '選稿編排';
  });
  els.quickNewBook?.replaceChildren(document.createTextNode('建立編排'));

  const booksView = document.getElementById('view-books');
  if (!booksView) return;
  booksView.classList.add('book-draft-workspace');
  const booksGrid = booksView.querySelector('.grid.layout-books');
  let currentPanel = document.getElementById('book-draft-current-panel');
  if (booksGrid && !currentPanel) {
    currentPanel = document.createElement('section');
    currentPanel.id = 'book-draft-current-panel';
    currentPanel.className = 'panel book-draft-current-panel';
    currentPanel.innerHTML = `
      <div class="panel-header">
        <div>
          <h2>目前正在編排</h2>
          <p class="muted">這份書稿會接收從札記庫加入的文章。</p>
        </div>
      </div>
      <div id="current-book-draft-card" class="empty-state">尚未選擇目前正在編排的書稿</div>
    `;
    booksGrid.prepend(currentPanel);
  }
  const draftFormPanel = els.bookForm?.closest('.panel');
  const draftListPanel = els.booksList?.closest('.panel');
  const draftOverviewPanel = els.selectedBookPanel?.closest('.panel');
  if (booksGrid && currentPanel && draftListPanel && draftFormPanel) {
    booksGrid.insertBefore(currentPanel, booksGrid.firstElementChild);
    booksGrid.insertBefore(draftListPanel, draftFormPanel);
    if (draftOverviewPanel) booksGrid.appendChild(draftOverviewPanel);
  }
  currentPanel?.classList.remove('book-draft-form-panel', 'book-draft-list-panel', 'book-draft-overview-panel', 'book-draft-modal-shell');
  draftFormPanel?.classList.remove('book-draft-list-panel', 'book-draft-overview-panel', 'book-draft-modal-shell');
  draftListPanel?.classList.remove('book-draft-form-panel', 'book-draft-overview-panel', 'book-draft-modal-shell');
  draftOverviewPanel?.classList.remove('book-draft-form-panel', 'book-draft-list-panel');
  currentPanel?.querySelector('.panel-header h2')?.replaceChildren(document.createTextNode('目前正在編排'));
  draftFormPanel?.classList.add('book-draft-form-panel');
  draftListPanel?.classList.add('book-draft-list-panel');
  draftOverviewPanel?.classList.add('book-draft-overview-panel');
  draftOverviewPanel?.classList.add('book-draft-modal-shell');
  els.bookForm?.classList.add('book-draft-form');
  els.booksList?.classList.add('book-draft-list');
  els.selectedBookPanel?.classList.add('book-draft-overview-body');
  els.bookCoverPreview?.classList.add('book-draft-summary');
  els.tocPreviewList?.closest('.toc-preview')?.classList.add('book-draft-preview-panel');
  els.chaptersList?.classList.add('book-draft-chapters-list');
  document.querySelector('#view-books .chapter-list-heading')?.classList.add('book-draft-chapter-heading');

  draftFormPanel?.querySelector('.panel-header h2')?.replaceChildren(document.createTextNode('新增選稿編排'));
  els.newBookBtn?.classList.add('hidden');
  const titleLabel = els.bookTitle?.closest('label');
  if (titleLabel) {
    titleLabel.childNodes[0].textContent = '編排代稱';
    els.bookTitle.placeholder = '例：5 月份靈修選稿';
  }
  const descriptionLabel = els.bookDescription?.closest('label');
  if (descriptionLabel) {
    descriptionLabel.childNodes[0].textContent = '整理說明';
    els.bookDescription.placeholder = '記下這份編排目前想整理的方向';
  }
  els.bookSubtitle?.closest('label')?.classList.add('hidden');
  els.bookAuthor?.closest('label')?.classList.add('hidden');
  els.bookTemplate?.closest('label')?.classList.add('hidden');
  els.bookLanguage?.closest('label')?.classList.add('hidden');
  els.bookCover?.closest('label')?.classList.add('hidden');
  els.bookPreface?.closest('label')?.classList.add('hidden');
  els.bookAfterword?.closest('label')?.classList.add('hidden');
  document.querySelector('.book-export-options')?.classList.add('hidden');
  const submitBtn = els.bookForm?.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.textContent = els.bookId?.value ? '更新選稿編排' : '建立選稿編排';
    submitBtn.classList.add('book-draft-submit-btn');
  }
  if (els.deleteBookBtn) els.deleteBookBtn.textContent = '刪除編排';

  draftListPanel?.querySelector('.panel-header h2')?.replaceChildren(document.createTextNode('其他選稿編排'));
  draftOverviewPanel?.querySelector('.panel-header h2')?.replaceChildren(document.createTextNode('整理章節'));
  if (els.selectedBookEmpty) els.selectedBookEmpty.textContent = '請先建立或選取一份編排。';
  document.querySelector('#view-books .chapter-picker')?.classList.add('hidden');
  document.querySelector('#view-books .toc-preview h3')?.replaceChildren(document.createTextNode('前幾篇章節預覽'));
  document.querySelector('#view-books .chapter-list-heading h3')?.replaceChildren(document.createTextNode('章節編排'));
  els.createSnapshotBtn?.classList.add('hidden');
  els.exportEpubBtn?.classList.add('hidden');
  els.exportSuccessActions?.classList.add('hidden');

    if (!document.getElementById('go-content-library-btn') && els.createSnapshotBtn?.parentElement) {
      const goLibraryBtn = document.createElement('button');
      goLibraryBtn.id = 'go-content-library-btn';
      goLibraryBtn.type = 'button';
      goLibraryBtn.className = 'secondary-btn';
      goLibraryBtn.textContent = '前往札記庫加入文章';
      goLibraryBtn.addEventListener('click', () => goToContentLibraryForBookDraft(state.selectedBookId).catch(handleError));

      const focusChaptersBtn = document.createElement('button');
      focusChaptersBtn.id = 'focus-draft-chapters-btn';
      focusChaptersBtn.type = 'button';
      focusChaptersBtn.className = 'ghost-btn';
      focusChaptersBtn.textContent = '整理章節';
      focusChaptersBtn.addEventListener('click', () => focusSelectedDraftPanel().catch(handleError));

    els.createSnapshotBtn.parentElement.prepend(focusChaptersBtn);
    els.createSnapshotBtn.parentElement.prepend(goLibraryBtn);
  }

  const actionRow = els.exportEpubBtn?.parentElement;
  const tocPreviewPanel = els.tocPreviewList?.closest('.toc-preview');
  const chapterHeading = document.querySelector('#view-books .chapter-list-heading');
  if (els.selectedBookPanel && els.bookCoverPreview && tocPreviewPanel && els.chaptersList && actionRow && chapterHeading) {
    let leftCol = document.getElementById('book-draft-modal-left');
    if (!leftCol) {
      leftCol = document.createElement('div');
      leftCol.id = 'book-draft-modal-left';
      leftCol.className = 'book-draft-modal-left';
      els.selectedBookPanel.appendChild(leftCol);
    }
    let leftActions = document.getElementById('book-draft-modal-left-actions');
    if (!leftActions) {
      leftActions = document.createElement('div');
      leftActions.id = 'book-draft-modal-left-actions';
      leftActions.className = 'row gap-sm wrap book-draft-modal-left-actions';
      leftCol.appendChild(leftActions);
    }
    let rightCol = document.getElementById('book-draft-modal-right');
    if (!rightCol) {
      rightCol = document.createElement('section');
      rightCol.id = 'book-draft-modal-right';
      rightCol.className = 'book-draft-modal-right';
      els.selectedBookPanel.appendChild(rightCol);
    }
    let mobileActions = document.getElementById('book-draft-modal-mobile-actions');
    if (!mobileActions) {
      mobileActions = document.createElement('div');
      mobileActions.id = 'book-draft-modal-mobile-actions';
      mobileActions.className = 'book-draft-modal-mobile-actions';
      rightCol.appendChild(mobileActions);
    }
    let rightBody = document.getElementById('book-draft-modal-right-body');
    if (!rightBody) {
      rightBody = document.createElement('div');
      rightBody.id = 'book-draft-modal-right-body';
      rightBody.className = 'book-draft-modal-right-body';
      rightCol.appendChild(rightBody);
    }
    let rightFooter = document.getElementById('book-draft-modal-right-footer');
    if (!rightFooter) {
      rightFooter = document.createElement('div');
      rightFooter.id = 'book-draft-modal-right-footer';
      rightFooter.className = 'book-draft-modal-right-footer';
      rightCol.appendChild(rightFooter);
    }

    leftCol.prepend(els.bookCoverPreview);
    leftCol.appendChild(tocPreviewPanel);
    const goLibraryBtn = document.getElementById('go-content-library-btn');
    if (goLibraryBtn) leftActions.appendChild(goLibraryBtn);

    rightBody.appendChild(chapterHeading);
    rightBody.appendChild(els.chaptersList);
    const arrangementStatus = document.getElementById('book-arrangement-status');
    if (arrangementStatus) rightFooter.appendChild(arrangementStatus);
    let exportSettingsBtn = document.getElementById('open-book-export-settings-btn');
    if (!exportSettingsBtn) {
      exportSettingsBtn = document.createElement('button');
      exportSettingsBtn.id = 'open-book-export-settings-btn';
      exportSettingsBtn.type = 'button';
      exportSettingsBtn.className = 'ghost-btn';
      exportSettingsBtn.textContent = '成書匯出設定';
      exportSettingsBtn.addEventListener('click', () => openBookExportSettingsModal(getActiveBookDraftId()).catch(handleError));
    }
    rightFooter.prepend(exportSettingsBtn);
    let mobileExportSettingsBtn = document.getElementById('open-book-export-settings-mobile-btn');
    if (!mobileExportSettingsBtn) {
      mobileExportSettingsBtn = document.createElement('button');
      mobileExportSettingsBtn.id = 'open-book-export-settings-mobile-btn';
      mobileExportSettingsBtn.type = 'button';
      mobileExportSettingsBtn.className = 'ghost-btn';
      mobileExportSettingsBtn.textContent = '成書匯出設定';
      mobileExportSettingsBtn.addEventListener('click', () => openBookExportSettingsModal(getActiveBookDraftId()).catch(handleError));
    }
    let modalStartBtn = document.getElementById('modal-start-current-book-btn');
    if (!modalStartBtn) {
      modalStartBtn = document.createElement('button');
      modalStartBtn.id = 'modal-start-current-book-btn';
      modalStartBtn.type = 'button';
      modalStartBtn.className = 'secondary-btn';
      modalStartBtn.textContent = '開始編這本';
      modalStartBtn.addEventListener('click', () => setCurrentBookDraft(getActiveBookDraftId()));
    }
    rightFooter.prepend(modalStartBtn);
    let mobileStartBtn = document.getElementById('modal-start-current-book-mobile-btn');
    if (!mobileStartBtn) {
      mobileStartBtn = document.createElement('button');
      mobileStartBtn.id = 'modal-start-current-book-mobile-btn';
      mobileStartBtn.type = 'button';
      mobileStartBtn.className = 'secondary-btn';
      mobileStartBtn.textContent = '開始編這本';
      mobileStartBtn.addEventListener('click', () => setCurrentBookDraft(getActiveBookDraftId()));
    }
    const saveBtn = document.getElementById('save-book-arrangement-btn');
    if (saveBtn) rightFooter.prepend(saveBtn);
    let mobileSaveBtn = document.getElementById('save-book-arrangement-mobile-btn');
    if (!mobileSaveBtn) {
      mobileSaveBtn = document.createElement('button');
      mobileSaveBtn.id = 'save-book-arrangement-mobile-btn';
      mobileSaveBtn.type = 'button';
      mobileSaveBtn.className = 'secondary-btn';
      mobileSaveBtn.textContent = '儲存編排';
      mobileSaveBtn.addEventListener('click', () => saveBookArrangement().catch(handleError));
    }
    mobileActions.appendChild(mobileSaveBtn);
    mobileActions.appendChild(mobileExportSettingsBtn);
    mobileActions.appendChild(mobileStartBtn);
    const focusBtn = document.getElementById('focus-draft-chapters-btn');
    if (focusBtn) focusBtn.classList.add('hidden');
    actionRow.classList.add('hidden');
  }

  if (!document.getElementById('book-draft-modal-backdrop') && draftOverviewPanel?.parentElement) {
    const backdrop = document.createElement('button');
    backdrop.id = 'book-draft-modal-backdrop';
    backdrop.type = 'button';
    backdrop.className = 'book-draft-modal-backdrop hidden';
    backdrop.setAttribute('aria-label', '關閉目前選稿編排');
    backdrop.addEventListener('click', () => closeBookDraftModal());
    draftOverviewPanel.parentElement.appendChild(backdrop);
  }

  if (!document.getElementById('close-book-draft-modal-btn') && draftOverviewPanel?.querySelector('.panel-header')) {
    const closeBtn = document.createElement('button');
    closeBtn.id = 'close-book-draft-modal-btn';
    closeBtn.type = 'button';
    closeBtn.className = 'ghost-btn small';
    closeBtn.textContent = '關閉';
    closeBtn.addEventListener('click', () => closeBookDraftModal());
    draftOverviewPanel.querySelector('.panel-header')?.appendChild(closeBtn);
  }

  document.getElementById('book-draft-modal-backdrop')?.classList.toggle('hidden', !state.bookDraftModalOpen);
  draftOverviewPanel?.classList.toggle('is-open', !!state.bookDraftModalOpen);
  draftOverviewPanel?.classList.toggle('hidden', !state.bookDraftModalOpen);
  document.body.classList.toggle('book-draft-modal-open', !!state.bookDraftModalOpen);
}

async function addSelectedNotesToCurrentBookDraft() {
  let book = getSelectedBook();
  if (!book) throw new Error('請先到選稿編排建立或選擇一份書稿。');
  book = await loadBookProjectDetail(book.id) || book;
  if (!state.contentLibrarySelectedNoteIds.length) throw new Error('請先勾選至少一篇文章。');
  if (state.bookArrangementSaving) return;
  const selectedNotes = state.notes.filter(note => state.contentLibrarySelectedNoteIds.includes(note.id));
  const baseChapters = getBookDisplayChapters(book);
  const existingSourceIds = new Set(baseChapters.map(chapter => getChapterSourceNoteId(chapter)).filter(Boolean));
  const nextChapters = cloneBookChapters(baseChapters);
  let addedCount = 0;
  let skippedCount = 0;
  selectedNotes.forEach(note => {
    if (existingSourceIds.has(note.id)) {
      skippedCount += 1;
      return;
    }
    nextChapters.push({
      id: uid('chapter'),
      source_note_id: note.id,
      note_id: note.id,
      chapter_title: note.title,
      include_in_toc: true,
    });
    existingSourceIds.add(note.id);
    addedCount += 1;
  });
  state.contentLibrarySelectedNoteIds = [];
  if (addedCount) setBookArrangementDraft(book.id, nextChapters);
  refreshUi();
  const totalChapters = getBookArrangementDraft(book.id)?.length || nextChapters.length;
  const bookTitle = getBookDraftLabel(book);
  if (!addedCount) {
    showToast(skippedCount ? `已略過重複札記：${skippedCount} 篇` : '沒有可加入的札記。');
    return;
  }
  showToast(skippedCount
    ? `已加入「${bookTitle}」：${addedCount} 篇札記；已略過重複札記：${skippedCount} 篇`
    : `已加入「${bookTitle}」：${addedCount} 篇札記`);
}
function renderCardList(container, items, renderer, emptyText = '還沒有資料。') {
  if (!items.length) {
    container.className = 'list-stack empty-state';
    container.textContent = emptyText;
    return;
  }
  container.className = 'list-stack';
  container.innerHTML = items.map(renderer).join('');
}

function setElementHtmlIfChanged(element, html) {
  if (!element) return false;
  const nextHtml = String(html || '');
  if (element.__devotionRenderedHtml === nextHtml) return false;
  element.querySelectorAll?.('img[data-library-cover-key]').forEach(img => {
    state.libraryCoverImageObserver?.unobserve(img);
  });
  element.innerHTML = nextHtml;
  element.__devotionRenderedHtml = nextHtml;
  return true;
}

function renderDesktopBookshelfCard() {
  if (!els.desktopBookshelfList) return;
  const books = getAllLibraryBooksForView().slice(0, 4);
  if (!books.length) {
    setElementHtmlIfChanged(els.desktopBookshelfList, `
      <div class="bookshelf-empty-state">
        <strong>尚未建立書籍</strong>
        <p>建立一本書，開始整理你的札記</p>
      </div>`);
    return;
  }
  const snapshotBookIds = new Set(state.snapshots.map(snapshot => snapshot.book_id).filter(Boolean));
  const nextHtml = books.map((book, index) => {
    const title = sanitizeDisplayText(book.title, `書籍 ${index + 1}`);
    const chapterCount = Number(book.total_chapters || book.totalChapters || (Array.isArray(book.chapters) ? book.chapters.length : 0));
    const isSystemBook = isSystemLibraryBook(book);
    const status = isSystemBook
      ? '系統預設'
      : book.source === 'imported_epub'
        ? '外部匯入'
        : snapshotBookIds.has(book.id)
          ? '已完成'
          : (chapterCount > 0 ? '整理中' : '已建立');
    const metaItems = [
      ...(!isSystemBook ? [`${chapterCount} 章`] : []),
      status,
    ];
    const coverUrl = getLibraryCoverUrl(book);
    return `
      <article class="bookshelf-book-card">
        ${coverUrl
          ? buildLibraryCoverImage(book, coverUrl, `${title}封面`, 'bookshelf-cover-thumb')
          : `<div class="bookshelf-cover-placeholder" aria-hidden="true">封面</div>`}
        <div class="bookshelf-book-copy">
          <div class="bookshelf-book-heading">
            <strong>${escapeHtml(title)}</strong>
            <div class="bookshelf-book-meta">
              ${metaItems.map(item => `<span>${escapeHtml(item)}</span>`).join('')}
            </div>
          </div>
        </div>
      </article>`;
  }).join('');
  setElementHtmlIfChanged(els.desktopBookshelfList, nextHtml);
  hydrateLibraryCoverImages(els.desktopBookshelfList);
}

function renderTodayDevotionCard() {
  const today = new Date();
  const todayLabel = new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(today);
  applyTodayDevotionFallback(todayLabel);
  const devotion = getTodayDevotionByDate(today);
  if (devotion) applyTodayDevotionContent(devotion, todayLabel);
  if (els.todayDevotionNoteBtn) els.todayDevotionNoteBtn.textContent = '寫成札記';
  ensureTodayDevotionsLoaded();
}

function applyTodayDevotionFallback(todayLabel) {
  if (els.todayDevotionDate) els.todayDevotionDate.textContent = todayLabel;
  if (els.todayDevotionTheme) els.todayDevotionTheme.textContent = '尚未載入今日默想內容';
  if (els.todayDevotionScripture) els.todayDevotionScripture.textContent = '今日默想';
  if (els.todayDevotionSummary) els.todayDevotionSummary.textContent = '請先建立或匯入今日默想資料庫';
}

function applyTodayDevotionContent(devotion, todayLabel) {
  const quote = sanitizeDisplayText(devotion?.quote, '');
  const scripture = sanitizeDisplayText(devotion?.scripture, '');
  const title = sanitizeDisplayText(devotion?.title, '');
  const summary = sanitizeDisplayText(devotion?.summary, '');
  if (els.todayDevotionDate) els.todayDevotionDate.textContent = todayLabel;
  if (els.todayDevotionScripture) els.todayDevotionScripture.textContent = quote || scripture || '今日默想';
  if (els.todayDevotionTheme) els.todayDevotionTheme.textContent = title || '尚未載入今日默想內容';
  if (els.todayDevotionSummary) els.todayDevotionSummary.textContent = summary || '請先建立或匯入今日默想資料庫';
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeTodayDevotionRecord(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const date = String(entry.date || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  return {
    date,
    month: Number.isFinite(entry.month) ? entry.month : Number.parseInt(entry.month, 10) || null,
    weekday: String(entry.weekday || '').trim(),
    title: String(entry.title || '').trim(),
    scripture: String(entry.scripture || '').trim(),
    quote: String(entry.quote || '').trim(),
    summary: String(entry.summary || '').trim(),
    theme: String(entry.theme || '').trim(),
    specialDay: String(entry.specialDay || '').trim(),
    specialGroup: String(entry.specialGroup || '').trim(),
    isSpecial: entry.isSpecial === true,
    cssTag: String(entry.cssTag || '').trim(),
    signature: String(entry.signature || '').trim(),
    sourceNote: String(entry.sourceNote || '').trim(),
  };
}

function getTodayDevotionByDate(date = new Date()) {
  if (!Array.isArray(state.todayDevotions)) return null;
  const todayKey = getLocalDateKey(date);
  return state.todayDevotions.find(entry => entry.date === todayKey) || null;
}

async function ensureTodayDevotionsLoaded() {
  if (state.todayDevotionsStatus === 'loaded' || state.todayDevotionsStatus === 'loading') {
    return state.todayDevotionsPromise;
  }

  state.todayDevotionsStatus = 'loading';
  state.todayDevotionsPromise = fetch('./data/today-devotions-2026.json')
    .then(response => {
      if (!response.ok) throw new Error(`Failed to fetch today devotions: ${response.status}`);
      return response.json();
    })
    .then(payload => {
      if (!Array.isArray(payload)) throw new Error('Today devotions JSON must be an array.');
      state.todayDevotions = payload
        .map(normalizeTodayDevotionRecord)
        .filter(Boolean);
      state.todayDevotionsStatus = 'loaded';
      refreshUi();
      return state.todayDevotions;
    })
    .catch(error => {
      console.error(error);
      state.todayDevotions = [];
      state.todayDevotionsStatus = 'error';
      return state.todayDevotions;
    });

  return state.todayDevotionsPromise;
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
    fetchAndRenderScriptures({ syncToContent: false }).catch(handleError);
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

async function fetchAndRenderScriptures({ force = false, syncToContent = false } = {}) {
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
    if (syncToContent && els.scriptureAppendToContent.checked) {
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
  renderNotePreview();
  scheduleCurrentNoteDraftSave();
}

function renderNotes() {
  if (!els.notesList) return;
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

const NOTE_READER_UNCATEGORIZED_VALUE = '__uncategorized__';

function getNoteReaderDateValue(note, field = 'updated') {
  const raw = field === 'created'
    ? (note?.created_at || note?.updated_at || '')
    : (note?.updated_at || note?.created_at || '');
  const time = new Date(raw || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function getNoteReaderCategoryValue(note) {
  return String(note?.category || '').trim() || NOTE_READER_UNCATEGORIZED_VALUE;
}

function getNoteReaderCategoryLabel(value = '') {
  return value === NOTE_READER_UNCATEGORIZED_VALUE ? '未分類' : value;
}

function getNoteReaderFilterOptions() {
  const categoryValues = new Set();
  const tags = new Set();
  state.notes.forEach(note => {
    categoryValues.add(getNoteReaderCategoryValue(note));
    getNoteTagList(note).forEach(tag => tags.add(tag));
  });
  return {
    categories: [...categoryValues].sort((left, right) => getNoteReaderCategoryLabel(left).localeCompare(getNoteReaderCategoryLabel(right), 'zh-Hant')),
    tags: [...tags].sort((left, right) => left.localeCompare(right, 'zh-Hant')),
  };
}

function getNoteReaderSearchHaystack(note) {
  return [
    note.title,
    note.scripture_reference,
    note.category,
    getNoteTagList(note).join(' '),
    note.summary,
    stripScriptureMarkers(note.content || ''),
  ].join(' ').toLowerCase();
}

function compareNotesForReading(left, right) {
  if (state.noteReaderSort === 'created-asc') {
    return getNoteReaderDateValue(left, 'created') - getNoteReaderDateValue(right, 'created');
  }
  if (state.noteReaderSort === 'title-asc') {
    const leftTitle = sanitizeDisplayText(left.title, '未命名札記');
    const rightTitle = sanitizeDisplayText(right.title, '未命名札記');
    return leftTitle.localeCompare(rightTitle, 'zh-Hant');
  }
  return getNoteReaderDateValue(right, 'updated') - getNoteReaderDateValue(left, 'updated');
}

function getNotesForReading() {
  const query = state.noteReaderSearch.trim().toLowerCase();
  return state.notes
    .filter(note => {
      if (query && !getNoteReaderSearchHaystack(note).includes(query)) return false;
      if (state.noteReaderCategory && getNoteReaderCategoryValue(note) !== state.noteReaderCategory) return false;
      if (state.noteReaderTag && !getNoteTagList(note).includes(state.noteReaderTag)) return false;
      return true;
    })
    .sort(compareNotesForReading);
}

function resetNoteReaderFilters() {
  state.noteReaderSearch = '';
  state.noteReaderCategory = '';
  state.noteReaderTag = '';
  state.noteReaderSort = 'updated-desc';
}

function syncNoteReaderControls({ filteredCount = 0, totalCount = 0 } = {}) {
  const { categories, tags } = getNoteReaderFilterOptions();
  if (state.noteReaderCategory && !categories.includes(state.noteReaderCategory)) state.noteReaderCategory = '';
  if (state.noteReaderTag && !tags.includes(state.noteReaderTag)) state.noteReaderTag = '';
  if (!['updated-desc', 'created-asc', 'title-asc'].includes(state.noteReaderSort)) state.noteReaderSort = 'updated-desc';

  if (els.noteReaderSearch && els.noteReaderSearch.value !== state.noteReaderSearch) {
    els.noteReaderSearch.value = state.noteReaderSearch;
  }
  if (els.noteReaderCategory) {
    els.noteReaderCategory.innerHTML = [
      '<option value="">全部分類</option>',
      ...categories.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(getNoteReaderCategoryLabel(value))}</option>`),
    ].join('');
    els.noteReaderCategory.value = state.noteReaderCategory;
  }
  if (els.noteReaderTag) {
    els.noteReaderTag.innerHTML = [
      '<option value="">全部標籤</option>',
      ...tags.map(tag => `<option value="${escapeHtml(tag)}">${escapeHtml(tag)}</option>`),
    ].join('');
    els.noteReaderTag.value = state.noteReaderTag;
  }
  if (els.noteReaderSort) els.noteReaderSort.value = state.noteReaderSort;
  if (els.noteReaderResultCount) {
    els.noteReaderResultCount.textContent = `顯示 ${filteredCount} / ${totalCount} 篇`;
  }
  els.noteReaderClearSearch?.toggleAttribute('disabled', !state.noteReaderSearch.trim());
  els.noteReaderResetFilters?.toggleAttribute('disabled', !state.noteReaderSearch && !state.noteReaderCategory && !state.noteReaderTag && state.noteReaderSort === 'updated-desc');
}

function syncNoteReaderDetailMode() {
  document.getElementById('view-note-reader')?.classList.toggle('note-reader-detail-open', !!state.noteReaderSelectedId);
}

function isNoteReaderNarrowView() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches;
}

function scrollNoteReaderIntoView(target = 'detail') {
  if (!isNoteReaderNarrowView()) return;
  const element = target === 'list'
    ? document.querySelector('#view-note-reader .note-reader-list-panel')
    : els.noteReaderDetail;
  requestAnimationFrame(() => {
    (element || document.getElementById('view-note-reader'))?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
}

function getNoteReaderMetaItems(note, { includeDate = true } = {}) {
  const tags = getNoteTagList(note);
  const items = [
    `經文｜${sanitizeDisplayText(note.scripture_reference, '未填經文')}`,
    `分類｜${sanitizeDisplayText(note.category, '未分類')}`,
    `標籤｜${tags.length ? tags.map(tag => `#${tag}`).join(' ') : '未設標籤'}`,
  ];
  if (includeDate) items.push(`日期｜${formatDate(note.updated_at || note.created_at)}`);
  return items;
}

function renderNoteReaderMeta(note, options = {}) {
  return `<div class="note-reader-meta">${getNoteReaderMetaItems(note, options)
    .map(item => `<span>${escapeHtml(item)}</span>`)
    .join('')}</div>`;
}

function renderNoteReaderListCard(note) {
  const noteId = String(note.id);
  const title = sanitizeDisplayText(note.title, '未命名札記');
  const excerpt = sanitizeDisplayText(note.summary, '')
    || sanitizeDisplayText(stripScriptureMarkers(note.content || ''), '')
    || '尚未填寫摘要。';
  const isSelected = state.noteReaderSelectedId === noteId;
  return `
    <button class="note-reader-list-card ${isSelected ? 'active' : ''}" type="button" data-note-reader-open="${escapeHtml(noteId)}">
      <span class="note-reader-card-title">${escapeHtml(title)}</span>
      ${renderNoteReaderMeta(note)}
      <span class="note-reader-summary">${escapeHtml(excerpt.slice(0, 180))}</span>
    </button>
  `;
}

function renderNoteReaderNoResultsState(totalCount = 0) {
  state.noteReaderSelectedId = null;
  syncNoteReaderDetailMode();
  if (els.noteReaderList) {
    els.noteReaderList.className = 'note-reader-list note-reader-empty-state empty-state';
    els.noteReaderList.innerHTML = `
      <strong>找不到符合條件的札記</strong>
      <p class="caption">試試清除搜尋、調整分類或標籤篩選。</p>
      <div class="note-reader-empty-actions">
        <button class="ghost-btn" type="button" data-note-reader-reset-empty>重設篩選</button>
      </div>
    `;
  }
  if (els.noteReaderDetail) {
    els.noteReaderDetail.innerHTML = `<div class="note-reader-detail-placeholder">目前顯示 0 / ${totalCount} 篇。調整條件後再選擇札記閱讀。</div>`;
  }
}

function renderNoteReaderEmptyState() {
  state.noteReaderSelectedId = null;
  syncNoteReaderDetailMode();
  if (els.noteReaderList) {
    els.noteReaderList.className = 'note-reader-list note-reader-empty-state empty-state';
    els.noteReaderList.innerHTML = `
      <strong>目前還沒有札記，可以先寫一篇札記。</strong>
      <div class="note-reader-empty-actions">
        <button class="primary-btn" type="button" data-note-reader-write>寫一篇札記</button>
      </div>
    `;
  }
  if (els.noteReaderDetail) {
    els.noteReaderDetail.innerHTML = '<div class="note-reader-detail-placeholder">寫下第一篇札記後，就可以在這裡安靜閱讀。</div>';
  }
}

function renderNoteReaderDetail(notes) {
  if (!els.noteReaderDetail) return;
  if (!state.noteReaderSelectedId) {
    syncNoteReaderDetailMode();
    els.noteReaderDetail.innerHTML = '<div class="note-reader-detail-placeholder">請先從列表選擇一篇札記。</div>';
    return;
  }
  const note = notes.find(item => String(item.id) === state.noteReaderSelectedId);
  if (!note) {
    syncNoteReaderDetailMode();
    els.noteReaderDetail.innerHTML = `
      <div class="note-reader-detail-placeholder">
        <strong>找不到這篇札記。</strong>
        <button class="ghost-btn" type="button" data-note-reader-back>返回札記閱讀列表</button>
      </div>
    `;
    return;
  }
  syncNoteReaderDetailMode();

  const title = sanitizeDisplayText(note.title, '未命名札記');
  const summary = sanitizeDisplayText(note.summary, '尚未填寫摘要。');
  const content = stripScriptureMarkers(note.content || '');
  const contentBlocks = content
    ? renderMarkdownContent(content)
    : '<p class="note-preview-placeholder">這篇札記尚未填寫內容。</p>';

  els.noteReaderDetail.innerHTML = `
    <article class="note-preview-article note-reader-article">
      <div class="note-reader-detail-actions">
        <button class="ghost-btn" type="button" data-note-reader-back>返回札記閱讀列表</button>
        <button class="secondary-btn" type="button" data-note-reader-edit="${escapeHtml(String(note.id))}">前往編輯</button>
      </div>
      <header class="note-preview-header">
        <h4>${escapeHtml(title)}</h4>
        ${renderNoteReaderMeta(note)}
      </header>
      <section class="note-preview-summary">
        <span class="note-preview-kicker">摘要</span>
        <p>${escapeHtml(summary)}</p>
      </section>
      <section class="note-preview-content">
        ${contentBlocks}
      </section>
    </article>
  `;
}

function bindNoteReaderActions({ scrollToDetail = false } = {}) {
  els.noteReaderList?.querySelectorAll('[data-note-reader-open]').forEach(button => {
    button.addEventListener('click', () => {
      state.noteReaderListScrollTop = els.noteReaderList?.scrollTop || 0;
      openNoteReaderNote(button.dataset.noteReaderOpen, { scrollToDetail: true });
    });
  });
  els.noteReaderList?.querySelector('[data-note-reader-write]')?.addEventListener('click', () => {
    setView('notes');
    clearNoteForm();
  });
  els.noteReaderList?.querySelector('[data-note-reader-reset-empty]')?.addEventListener('click', () => {
    resetNoteReaderFilters();
    renderNoteReader();
    els.noteReaderSearch?.focus();
  });
  els.noteReaderDetail?.querySelector('[data-note-reader-back]')?.addEventListener('click', () => {
    const restoreListScrollTop = state.noteReaderListScrollTop || 0;
    state.noteReaderSelectedId = null;
    renderNoteReader({ restoreListScrollTop });
    scrollNoteReaderIntoView('list');
  });
  els.noteReaderDetail?.querySelector('[data-note-reader-edit]')?.addEventListener('click', event => {
    const noteId = event.currentTarget?.dataset?.noteReaderEdit;
    if (noteId) populateNoteForm(noteId);
  });
  if (scrollToDetail) scrollNoteReaderIntoView('detail');
}

function renderNoteReader(options = {}) {
  if (!els.noteReaderList || !els.noteReaderDetail) return;
  const previousScrollTop = options.preserveScroll ? els.noteReaderList.scrollTop : 0;
  const notes = getNotesForReading();
  const totalCount = state.notes.length;
  syncNoteReaderControls({ filteredCount: notes.length, totalCount });
  if (!totalCount) {
    renderNoteReaderEmptyState();
    bindNoteReaderActions();
    return;
  }
  if (!notes.length) {
    renderNoteReaderNoResultsState(totalCount);
    bindNoteReaderActions();
    return;
  }
  if (state.noteReaderSelectedId && !notes.some(note => String(note.id) === state.noteReaderSelectedId)) {
    state.noteReaderSelectedId = null;
  }
  els.noteReaderList.className = 'note-reader-list';
  els.noteReaderList.innerHTML = notes.map(renderNoteReaderListCard).join('');
  renderNoteReaderDetail(notes);
  bindNoteReaderActions(options);
  if (options.preserveScroll) requestAnimationFrame(() => { els.noteReaderList.scrollTop = previousScrollTop; });
  if (Number.isFinite(options.restoreListScrollTop)) {
    requestAnimationFrame(() => { els.noteReaderList.scrollTop = Math.max(0, options.restoreListScrollTop); });
  }
}

function openNoteReader() {
  state.noteReaderSelectedId = null;
  setView('note-reader');
}

function openNoteReaderNote(noteId, options = {}) {
  state.noteReaderSelectedId = noteId || null;
  if (document.body.dataset.currentView !== 'note-reader') setView('note-reader');
  renderNoteReader(options);
}

function renderNotePreview() {
  if (!els.notePreview) return;
  const title = els.noteTitle?.value.trim() || '未命名札記';
  const scripture = els.noteScripture?.value.trim();
  const category = els.noteCategory?.value.trim();
  const tags = (els.noteTags?.value || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
  const summary = els.noteSummary?.value.trim();
  const content = els.noteContent?.value.trim();

  const metaItems = [
    `<span>經文｜${escapeHtml(scripture || '尚未填寫經文')}</span>`,
    `<span>分類｜${escapeHtml(category || '尚未分類')}</span>`,
    `<span>標籤｜${tags.length ? tags.map(tag => `#${escapeHtml(tag)}`).join(' ') : '尚未設定標籤'}</span>`,
  ];

  const summaryBlock = `
    <section class="note-preview-summary">
      <span class="note-preview-kicker">摘要</span>
      <p>${escapeHtml(summary || '尚未填寫摘要')}</p>
    </section>
  `;

  const contentBlocks = content
    ? renderMarkdownContent(content)
    : '<p class="note-preview-placeholder">尚未輸入內容</p>';

  els.notePreview.innerHTML = `
    <header class="note-preview-header">
      <h4>${escapeHtml(title)}</h4>
      <div class="note-preview-meta">${metaItems.join('')}</div>
    </header>
    ${summaryBlock}
    <section class="note-preview-content">
      ${contentBlocks}
    </section>
  `;
  updateMarkdownSyntaxHint();
}

function getMarkdownSyntaxHintMessage(text = '') {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^\{(red|blue|gold|purple)\}##(?!#)\s*.+\{\/\1\}$/);
    if (!match) continue;
    const colorName = match[1];
    return `語法提醒：若要讓小標題變色，請使用 \`## {${colorName}}標題{/${colorName}}\`\uFF0C不要使用 \`{${colorName}}## 標題{/${colorName}}\`。`;
  }
  return '';
}

function updateMarkdownSyntaxHint() {
  if (!els.markdownSyntaxHint) return;
  const message = getMarkdownSyntaxHintMessage(els.noteContent?.value || '');
  els.markdownSyntaxHint.textContent = message;
  els.markdownSyntaxHint.classList.toggle('hidden', !message);
}

function renderMarkdownInline(text = '') {
  const escaped = escapeHtml(String(text || ''));
  const colorized = escaped
    .replace(/\{red\}([\s\S]*?)\{\/red\}/g, '<span class="text-red">$1</span>')
    .replace(/\{blue\}([\s\S]*?)\{\/blue\}/g, '<span class="text-blue">$1</span>')
    .replace(/\{gold\}([\s\S]*?)\{\/gold\}/g, '<span class="text-gold">$1</span>')
    .replace(/\{purple\}([\s\S]*?)\{\/purple\}/g, '<span class="text-purple">$1</span>');
  return colorized.replace(/\*\*([^*\n][^*\n]*?)\*\*/g, '<strong>$1</strong>');
}

function renderMarkdownSpacer(blankLineCount = 0) {
  const extraBlankLines = Math.max(0, Number(blankLineCount || 0) - 1);
  if (!extraBlankLines) return '';
  const level = Math.min(extraBlankLines, 2);
  return `<div class="markdown-spacer markdown-spacer-${level}" aria-hidden="true"></div>`;
}

function renderMarkdownContent(text = '') {
  const normalized = String(text || '').replace(/\r\n/g, '\n');
  if (!normalized.trim()) return '';

  const lines = normalized.split('\n');
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const trimmed = lines[index].trim();

    if (!trimmed) {
      let blankLineCount = 0;
      while (index < lines.length && !lines[index].trim()) {
        blankLineCount += 1;
        index += 1;
      }
      if (blocks.length && index < lines.length && blankLineCount > 1) {
        blocks.push(renderMarkdownSpacer(blankLineCount));
      }
      continue;
    }

    if (/^##(?!#)\s*/.test(trimmed)) {
      blocks.push(`<h2>${renderMarkdownInline(trimmed.replace(/^##(?!#)\s*/, '').trim())}</h2>`);
      index += 1;
      continue;
    }

    if (trimmed === '---') {
      blocks.push('<hr />');
      index += 1;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quoteLines = [];
      while (index < lines.length) {
        const currentLine = lines[index];
        const currentTrimmed = currentLine.trim();
        if (!currentTrimmed || !/^>\s?/.test(currentTrimmed)) break;
        quoteLines.push(currentTrimmed.replace(/^>\s?/, ''));
        index += 1;
      }
      blocks.push(`<blockquote>${renderMarkdownInline(quoteLines.join('\n')).replaceAll('\n', '<br/>')}</blockquote>`);
      continue;
    }

    if (/^-\s+/.test(trimmed)) {
      const items = [];
      while (index < lines.length) {
        const currentLine = lines[index];
        const currentTrimmed = currentLine.trim();
        if (!currentTrimmed || !/^-\s+/.test(currentTrimmed)) break;
        items.push(`<li>${renderMarkdownInline(currentTrimmed.replace(/^-\s+/, '').trim())}</li>`);
        index += 1;
      }
      blocks.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    const paragraphLines = [];
    while (index < lines.length) {
      const currentLine = lines[index];
      const currentTrimmed = currentLine.trim();
      if (!currentTrimmed) break;
      if (
        currentTrimmed === '---'
        || /^##(?!#)\s*/.test(currentTrimmed)
        || /^>\s?/.test(currentTrimmed)
        || /^-\s+/.test(currentTrimmed)
      ) break;
      paragraphLines.push(currentLine.trimEnd());
      index += 1;
    }
    blocks.push(`<p>${renderMarkdownInline(paragraphLines.join('\n')).replaceAll('\n', '<br/>')}</p>`);
  }

  return blocks.join('');
}

function getNoteContentTextarea() {
  if (!els.noteContent || els.noteContent.tagName !== 'TEXTAREA') {
    throw new Error('找不到札記內容輸入框。');
  }
  return els.noteContent;
}

function isNoteFormField(target) {
  return !!target?.matches?.('input, textarea');
}

function getNoteContentSelection() {
  const textarea = getNoteContentTextarea();
  const value = textarea.value || '';
  const start = typeof textarea.selectionStart === 'number' ? textarea.selectionStart : value.length;
  const end = typeof textarea.selectionEnd === 'number' ? textarea.selectionEnd : start;
  return {
    textarea,
    value,
    start,
    end,
    selectedText: value.slice(start, end),
    hasSelection: end > start,
  };
}

function updateNoteContentSelection(nextValue, selectionStart, selectionEnd = selectionStart) {
  const textarea = getNoteContentTextarea();
  textarea.value = nextValue;
  textarea.focus();
  textarea.setSelectionRange(selectionStart, selectionEnd);
  renderNotePreview();
  scheduleCurrentNoteDraftSave();
}

function replaceNoteContentSelection(replacement, options = {}) {
  const {
    selectionStartOffset = replacement.length,
    selectionEndOffset = selectionStartOffset,
  } = options;
  const { value, start, end } = getNoteContentSelection();
  const nextValue = `${value.slice(0, start)}${replacement}${value.slice(end)}`;
  updateNoteContentSelection(nextValue, start + selectionStartOffset, start + selectionEndOffset);
}

function prefixSelectedLines(text, prefix) {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => `${prefix}${line}`)
    .join('\n');
}

function applyMarkdownHeading() {
  const { hasSelection, selectedText } = getNoteContentSelection();
  const headingText = (hasSelection ? selectedText : '小標題').trim() || '小標題';
  const replacement = `## ${headingText}`;
  replaceNoteContentSelection(replacement, hasSelection
    ? {}
    : {
        selectionStartOffset: 3,
        selectionEndOffset: replacement.length,
      });
}

function applyMarkdownBold() {
  const { hasSelection, selectedText } = getNoteContentSelection();
  const content = hasSelection ? selectedText : '文字';
  const replacement = `**${content}**`;
  replaceNoteContentSelection(replacement, hasSelection
    ? {}
    : {
        selectionStartOffset: 2,
        selectionEndOffset: replacement.length - 2,
      });
}

function applyMarkdownQuote() {
  const { hasSelection, selectedText } = getNoteContentSelection();
  const replacement = hasSelection ? prefixSelectedLines(selectedText, '> ') : '> 引用內容';
  replaceNoteContentSelection(replacement, hasSelection
    ? {}
    : {
        selectionStartOffset: 2,
        selectionEndOffset: replacement.length,
      });
}

function applyMarkdownScripture() {
  const { hasSelection, selectedText } = getNoteContentSelection();
  const replacement = hasSelection ? prefixSelectedLines(selectedText, '> ') : '> 經文內容';
  replaceNoteContentSelection(replacement, hasSelection
    ? {}
    : {
        selectionStartOffset: 2,
        selectionEndOffset: replacement.length,
      });
}

function applyMarkdownList() {
  const { hasSelection, selectedText } = getNoteContentSelection();
  const replacement = hasSelection ? prefixSelectedLines(selectedText, '- ') : '- 項目';
  replaceNoteContentSelection(replacement, hasSelection
    ? {}
    : {
        selectionStartOffset: 2,
        selectionEndOffset: replacement.length,
      });
}

function applyMarkdownDivider() {
  const { value, start } = getNoteContentSelection();
  const before = value.slice(0, start);
  const after = value.slice(start);
  const prefix = !before
    ? ''
    : before.endsWith('\n\n')
      ? ''
      : before.endsWith('\n')
        ? '\n'
        : '\n\n';
  const suffix = !after
    ? '\n\n'
    : after.startsWith('\n\n')
      ? ''
      : after.startsWith('\n')
        ? '\n'
        : '\n\n';
  const replacement = `${prefix}---${suffix}`;
  const nextValue = `${before}${replacement}${after}`;
  const cursorOffset = replacement.length;
  updateNoteContentSelection(nextValue, before.length + cursorOffset);
}

function applyMarkdownColorTag(colorName, placeholderText) {
  const { hasSelection, selectedText } = getNoteContentSelection();
  const content = hasSelection ? selectedText : placeholderText;
  const replacement = `{${colorName}}${content}{/${colorName}}`;
  replaceNoteContentSelection(replacement, hasSelection
    ? {}
    : {
        selectionStartOffset: colorName.length + 2,
        selectionEndOffset: replacement.length - (colorName.length + 3),
      });
}

function applyMarkdownRedText() {
  applyMarkdownColorTag('red', '紅色重點');
}

function applyMarkdownBlueText() {
  applyMarkdownColorTag('blue', '藍色重點');
}

function applyMarkdownGoldText() {
  applyMarkdownColorTag('gold', '金色重點');
}

function applyMarkdownPurpleText() {
  applyMarkdownColorTag('purple', '紫色重點');
}

function openNotePreview() {
  renderNotePreview();
  els.notePreviewModal?.classList.remove('hidden');
  els.notePreviewModal?.setAttribute('aria-hidden', 'false');
}

function closeNotePreview() {
  els.notePreviewModal?.classList.add('hidden');
  els.notePreviewModal?.setAttribute('aria-hidden', 'true');
}

function getCurrentNoteDraftPayload() {
  return {
    title: els.noteTitle?.value || '',
    scripture: els.noteScripture?.value || '',
    category: els.noteCategory?.value || '',
    tags: els.noteTags?.value || '',
    summary: els.noteSummary?.value || '',
    content: els.noteContent?.value || '',
    editingNoteId: els.noteId?.value || '',
    userId: getUserId(),
    updatedAt: nowIso(),
  };
}

function hasCurrentNoteDraftContent(draft) {
  if (!draft || typeof draft !== 'object') return false;
  return ['title', 'scripture', 'category', 'tags', 'summary', 'content']
    .some(key => String(draft[key] || '').trim());
}

function isCurrentUserNoteDraft(draft) {
  return !draft?.userId || draft.userId === getUserId();
}

function readCurrentNoteDraftFromStorage(storage) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(CURRENT_NOTE_DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (!draft || typeof draft !== 'object' || !isCurrentUserNoteDraft(draft)) return null;
    return draft;
  } catch (error) {
    console.warn('note draft read skipped', error);
    return null;
  }
}

function loadCurrentNoteDraft() {
  return readCurrentNoteDraftFromStorage(localStorage) || readCurrentNoteDraftFromStorage(sessionStorage);
}

function writeCurrentNoteDraftToStorage(draft) {
  try {
    localStorage.setItem(CURRENT_NOTE_DRAFT_KEY, JSON.stringify(draft));
    try { sessionStorage.removeItem(CURRENT_NOTE_DRAFT_KEY); } catch (_) {}
    return true;
  } catch (error) {
    console.warn('note draft localStorage write skipped', error);
    try {
      localStorage.removeItem(STORAGE_KEYS.autoBackups);
      localStorage.setItem(CURRENT_NOTE_DRAFT_KEY, JSON.stringify(draft));
      try { sessionStorage.removeItem(CURRENT_NOTE_DRAFT_KEY); } catch (_) {}
      return true;
    } catch (retryError) {
      console.warn('note draft localStorage retry skipped', retryError);
    }
    try {
      sessionStorage.setItem(CURRENT_NOTE_DRAFT_KEY, JSON.stringify(draft));
      return true;
    } catch (sessionError) {
      console.warn('note draft sessionStorage write skipped', sessionError);
      return false;
    }
  }
}

function clearCurrentNoteDraft() {
  clearTimeout(state.noteDraftSaveTimer);
  state.noteDraftSaveTimer = null;
  state.noteDraftDirty = false;
  try { localStorage.removeItem(CURRENT_NOTE_DRAFT_KEY); } catch (error) { console.warn('note draft localStorage clear skipped', error); }
  try { sessionStorage.removeItem(CURRENT_NOTE_DRAFT_KEY); } catch (error) { console.warn('note draft sessionStorage clear skipped', error); }
  syncCurrentNoteDraftNotice();
}

function persistCurrentNoteDraft({ immediate = false } = {}) {
  const draft = getCurrentNoteDraftPayload();
  const hasContent = hasCurrentNoteDraftContent(draft);
  if (!hasContent && !draft.editingNoteId) {
    clearCurrentNoteDraft();
    return false;
  }
  if (immediate) {
    clearTimeout(state.noteDraftSaveTimer);
    state.noteDraftSaveTimer = null;
  }
  writeCurrentNoteDraftToStorage(draft);
  syncCurrentNoteDraftNotice();
  return true;
}

function scheduleCurrentNoteDraftSave() {
  state.noteDraftDirty = true;
  clearTimeout(state.noteDraftSaveTimer);
  state.noteDraftSaveTimer = setTimeout(() => {
    state.noteDraftSaveTimer = null;
    persistCurrentNoteDraft();
  }, CURRENT_NOTE_DRAFT_DEBOUNCE_MS);
  syncCurrentNoteDraftNotice();
}

function hasUnsavedCurrentNoteDraft() {
  return state.noteDraftDirty && hasCurrentNoteDraftContent(getCurrentNoteDraftPayload());
}

function isCurrentNoteFormEmpty() {
  return !String(els.noteId?.value || '').trim()
    && !hasCurrentNoteDraftContent(getCurrentNoteDraftPayload());
}

function ensureCurrentNoteDraftNotice() {
  if (state.currentNoteDraftNotice || !els.noteForm?.parentElement) return state.currentNoteDraftNotice;
  const notice = document.createElement('div');
  notice.id = 'current-note-draft-notice';
  notice.className = 'current-note-draft-notice hidden';
  notice.innerHTML = `
    <div class="current-note-draft-copy">
      <strong>偵測到尚未儲存的札記草稿，是否恢復？</strong>
      <p>恢復後會回填上次尚未儲存的標題、經文、分類、標籤、摘要與內容。</p>
    </div>
    <div class="current-note-draft-actions">
      <button type="button" class="primary-btn small" data-restore-current-note-draft>恢復草稿</button>
      <button type="button" class="ghost-btn small" data-ignore-current-note-draft>忽略</button>
    </div>
  `;
  notice.querySelector('[data-restore-current-note-draft]')?.addEventListener('click', restoreCurrentNoteDraft);
  notice.querySelector('[data-ignore-current-note-draft]')?.addEventListener('click', ignoreCurrentNoteDraft);
  els.noteForm.parentElement.insertBefore(notice, els.noteForm);
  state.currentNoteDraftNotice = notice;
  return notice;
}

function syncCurrentNoteDraftNotice() {
  if (!els.noteForm) return;
  const notice = ensureCurrentNoteDraftNotice();
  const draft = loadCurrentNoteDraft();
  const shouldShow = document.body.dataset.currentView === 'notes'
    && draft
    && (hasCurrentNoteDraftContent(draft) || draft.editingNoteId)
    && isCurrentUserNoteDraft(draft)
    && isCurrentNoteFormEmpty();
  notice?.classList.toggle('hidden', !shouldShow);
}

function restoreCurrentNoteDraft() {
  const draft = loadCurrentNoteDraft();
  if (!draft || !isCurrentUserNoteDraft(draft)) return;
  els.noteId.value = draft.editingNoteId || '';
  els.noteTitle.value = draft.title || '';
  els.noteScripture.value = draft.scripture || '';
  els.noteCategory.value = draft.category || '';
  els.noteTags.value = draft.tags || '';
  els.noteSummary.value = draft.summary || '';
  els.noteContent.value = draft.content || '';
  state.scriptureAppliedBlocks = [];
  state.scriptureLastAppliedBlock = '';
  if (draft.editingNoteId) els.deleteNoteBtn.classList.remove('hidden');
  else els.deleteNoteBtn.classList.add('hidden');
  if (draft.scripture) {
    fetchAndRenderScriptures({ force: true, syncToContent: false }).catch(() => setScriptureStatus('經文預覽暫時無法載入。', true));
  } else {
    resetScripturePreview({ clearApplied: true });
  }
  renderNotePreview();
  state.noteDraftDirty = true;
  persistCurrentNoteDraft({ immediate: true });
  showToast('已恢復尚未儲存的草稿。');
}

function ignoreCurrentNoteDraft() {
  clearCurrentNoteDraft();
  showToast('已忽略草稿。');
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
    fetchAndRenderScriptures({ force: true, syncToContent: false }).catch(() => setScriptureStatus('經文預覽暫時無法載入。', true));
  } else {
    resetScripturePreview();
  }
  renderNotePreview();
  state.noteDraftDirty = false;
  syncCurrentNoteDraftNotice();
}

function clearNoteForm({ clearDraft = false } = {}) {
  els.noteForm.reset();
  els.noteId.value = '';
  els.deleteNoteBtn.classList.add('hidden');
  resetScripturePreview({ clearApplied: true });
  els.scriptureAppendToContent.checked = true;
  renderNotePreview();
  state.noteDraftDirty = false;
  if (clearDraft) clearCurrentNoteDraft();
  else syncCurrentNoteDraftNotice();
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
  persistCurrentNoteDraft({ immediate: true });
  try {
    if (state.supabase) {
      const { error } = await state.supabase.from('devotion_notes').upsert(payload);
      if (error) throw error;
    } else {
      const notes = loadJson(STORAGE_KEYS.notes, []);
      const idx = notes.findIndex(item => item.id === payload.id && item.user_id === payload.user_id);
      if (idx >= 0) notes[idx] = payload; else notes.unshift(payload);
      saveJson(STORAGE_KEYS.notes, notes);
    }
  } catch (error) {
    console.warn('note save failed', error);
    persistCurrentNoteDraft({ immediate: true });
    throw new Error('札記儲存失敗，內容已保留，請稍後再試。');
  }

  els.noteId.value = payload.id;
  try {
    await loadAllData({ silent: true, syncReason: state.supabase ? '札記已同步到雲端。' : '' });
  } catch (error) {
    console.warn('note saved but refresh failed', error);
    persistCurrentNoteDraft({ immediate: true });
    showToast('札記已儲存，但畫面刷新暫時失敗，內容已保留。');
    return;
  }
  setView('notes');
  clearNoteForm({ clearDraft: true });
  showToast('札記已儲存。');
}

async function deleteNote() {
  requireUser();
  const noteId = els.noteId.value;
  if (!noteId) return;
  const confirmed = await openConfirmDialog({
    title: '確定要刪除這篇札記嗎？',
    message: '刪除後將無法復原。若這篇札記已加入選稿編排，也可能影響後續整理。',
    confirmText: '確認刪除',
    danger: true,
  });
  if (!confirmed) return;
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

function renderBookDraftCard(book, { current = false } = {}) {
  const detailLoaded = hasBookProjectDetail(book.id);
  const chapterCount = detailLoaded ? getBookDisplayChapters(book).length : 0;
  const isEmptyDraft = detailLoaded && chapterCount === 0;
  const chapterLabel = detailLoaded ? `已收錄 ${chapterCount} 篇札記` : '章節開啟後載入';
  const description = getBookDraftDescription(book).slice(0, 180)
    || (isEmptyDraft ? '尚未收錄札記，請先前往札記庫加入文章。' : '尚未填寫整理說明');
  const statusLabel = current ? '正在編排' : '待成書設定';
  const statusTone = current ? 'is-current' : getBookDraftStatusTone(book);
  return `
    <article class="card book-draft-card ${current ? 'is-current-draft selected' : ''}" data-book-draft-card="${book.id}">
      <div class="book-draft-card-header">
        <h3>${escapeHtml(getBookDraftLabel(book))}</h3>
        <span class="badge book-draft-status-badge ${statusTone}">${escapeHtml(statusLabel)}</span>
      </div>
      <div class="card-meta book-draft-meta-row">
        <span>${escapeHtml(chapterLabel)}</span>
        <span>更新於 ${escapeHtml(formatDate(book.updated_at || book.created_at))}</span>
      </div>
      <div class="book-draft-scope">${escapeHtml(getBookDraftScopeSummary(book))}</div>
      <div class="caption book-draft-description ${isEmptyDraft ? 'is-empty-hint' : ''}">${escapeHtml(description)}</div>
      <div class="card-actions book-draft-actions">
        ${current
          ? `
            <button class="secondary-btn" data-go-content-library="${book.id}">加入札記</button>
            <button class="ghost-btn" data-open-book-draft="${book.id}">整理章節</button>
            <button class="ghost-btn" data-open-selection-settings="${book.id}">編輯設定</button>
            <button class="ghost-btn" data-open-export-settings="${book.id}">成書匯出設定</button>
          `
          : `
            <button class="secondary-btn" data-select-book="${book.id}">開始編這本</button>
            <button class="ghost-btn" data-open-book-draft="${book.id}">整理章節</button>
            <button class="ghost-btn" data-go-content-library="${book.id}">加入札記</button>
            <button class="ghost-btn" data-open-selection-settings="${book.id}">編輯設定</button>
            <button class="ghost-btn book-draft-delete-btn" data-delete-book-draft="${book.id}">刪除</button>
          `}
      </div>
    </article>
  `;
}

function bindBookDraftCardActions(scope) {
  scope.querySelectorAll('[data-select-book]').forEach(btn => btn.addEventListener('click', () => setCurrentBookDraft(btn.dataset.selectBook)));
  scope.querySelectorAll('[data-go-content-library]').forEach(btn => btn.addEventListener('click', () => goToContentLibraryForBookDraft(btn.dataset.goContentLibrary).catch(handleError)));
  scope.querySelectorAll('[data-open-book-draft]').forEach(btn => btn.addEventListener('click', () => focusSelectedDraftPanel(btn.dataset.openBookDraft).catch(handleError)));
  scope.querySelectorAll('[data-open-selection-settings]').forEach(btn => btn.addEventListener('click', () => openBookDraftSettingsModal(btn.dataset.openSelectionSettings)));
  scope.querySelectorAll('[data-open-export-settings]').forEach(btn => btn.addEventListener('click', () => openBookExportSettingsModal(btn.dataset.openExportSettings).catch(handleError)));
  scope.querySelectorAll('[data-delete-book-draft]').forEach(btn => btn.addEventListener('click', () => deleteBook(btn.dataset.deleteBookDraft).catch(handleError)));
}

function renderCurrentBookDraftCard() {
  const container = document.getElementById('current-book-draft-card');
  if (!container) return;
  const currentBook = state.books.find(book => book.id === state.selectedBookId) || null;
  if (!currentBook) {
    container.className = 'empty-state book-draft-current-empty';
    container.innerHTML = `
      <strong>尚未選擇目前正在編排的書稿</strong>
      <p>請先建立新的選稿編排，或從下方既有書稿中選擇一個開始編輯。</p>
    `;
    return;
  }
  container.className = 'book-draft-current-card-wrap';
  container.innerHTML = renderBookDraftCard(currentBook, { current: true });
  bindBookDraftCardActions(container);
}

function renderBooks() {
  if (!els.booksList) return;
  renderCurrentBookDraftCard();
  const otherBooks = state.books.filter(book => book.id !== state.selectedBookId);
  if (!otherBooks.length) {
    els.booksList.className = 'list-stack empty-state';
    els.booksList.textContent = state.books.length ? '目前沒有其他選稿編排。' : '還沒有選稿編排。';
    return;
  }
  els.booksList.className = 'list-stack';
  els.booksList.innerHTML = otherBooks.map(book => renderBookDraftCard(book)).join('');
  bindBookDraftCardActions(els.booksList);
}

function populateBookForm(bookId) {
  const book = state.books.find(item => item.id === bookId);
  if (!book) return;
  setView('books');
  state.selectedBookId = book.id;
  if (els.bookSaveFeedback) {
    els.bookSaveFeedback.textContent = '';
    els.bookSaveFeedback.classList.add('hidden');
  }
  els.bookId.value = book.id;
  els.bookTitle.value = book.title || '';
  els.bookSubtitle.value = book.subtitle || '';
  els.bookAuthor.value = book.author_name || '';
  els.bookDescription.value = getBookDraftDescription(book);
  els.bookTemplate.value = book.template_code || 'devotion';
  els.bookLanguage.value = resolveBookLanguage(book.language);
  els.bookPreface.value = book.preface || '';
  els.bookAfterword.value = book.afterword || '';
  els.bookTocEnabled.checked = !!book.toc_enabled;
  els.bookIncludeChapterSummary.checked = !!book.include_chapter_summary;
  els.deleteBookBtn.classList.remove('hidden');
  refreshUi();
}

function clearBookForm() {
  els.bookForm.reset();
  els.bookId.value = '';
  els.bookLanguage.value = DEFAULT_BOOK_LANGUAGE;
  els.bookTemplate.value = 'devotion';
  els.bookTocEnabled.checked = true;
  els.bookIncludeChapterSummary.checked = false;
  els.deleteBookBtn.classList.add('hidden');
  if (els.bookSaveFeedback) {
    els.bookSaveFeedback.textContent = '';
    els.bookSaveFeedback.classList.add('hidden');
  }
}

async function saveBook() {
  requireUser();
  let existing = state.books.find(item => item.id === els.bookId.value);
  if (existing) existing = await loadBookProjectDetail(existing.id) || existing;
  const isNewDraft = !existing;
  const previousSelectedBookId = state.selectedBookId;
  const coverDataUrl = els.bookCover.files[0] ? await fileToDataUrl(els.bookCover.files[0]) : (existing?.cover_data_url || '');
  const payload = {
    id: els.bookId.value || uid('book'),
    user_id: getUserId(),
    title: els.bookTitle.value.trim(),
    subtitle: els.bookSubtitle.value.trim(),
    author_name: els.bookAuthor.value.trim(),
    description: buildBookDraftDescription(els.bookDescription.value.trim(), getBookDraftSettings(existing)),
    template_code: els.bookTemplate.value,
    language: resolveBookLanguage(els.bookLanguage.value),
    cover_data_url: coverDataUrl,
    preface: els.bookPreface.value.trim(),
    afterword: els.bookAfterword.value.trim(),
    toc_enabled: els.bookTocEnabled.checked,
    include_chapter_summary: els.bookIncludeChapterSummary.checked,
    chapters: existing?.chapters || [],
    updated_at: nowIso(),
    created_at: existing?.created_at || nowIso(),
  };
  if (!payload.title) throw new Error('請先輸入編排代稱。');
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
  state.selectedBookId = isNewDraft && previousSelectedBookId ? previousSelectedBookId : payload.id;
  if (els.bookSaveFeedback) {
    els.bookSaveFeedback.textContent = isNewDraft
      ? (previousSelectedBookId ? `已建立選稿編排：${payload.title}` : `已建立並開始編排：${payload.title}`)
      : '編排已儲存';
    els.bookSaveFeedback.classList.remove('hidden');
  }
  await loadAllData({ silent: true, syncReason: state.supabase ? '編排儲存後同步' : '' });
  state.selectedBookId = isNewDraft && previousSelectedBookId ? previousSelectedBookId : payload.id;
  setView('books');
  showToast(isNewDraft
    ? (previousSelectedBookId ? `已建立選稿編排：${payload.title}` : `已建立並開始編排：${payload.title}`)
    : '編排已儲存');
}

async function deleteBook(targetBookId = els.bookId.value) {
  requireUser();
  const bookId = targetBookId || els.bookId.value;
  if (!bookId) return;
  const book = state.books.find(item => item.id === bookId);
  const bookTitle = getBookDraftLabel(book);
  const confirmed = await openConfirmDialog({
    title: '確定要刪除這份選稿編排嗎？',
    message: `「${bookTitle}」會被刪除。這會移除這份編排與其中的章節安排，但不會刪除原本的札記。`,
    confirmText: '確認刪除',
    danger: true,
  });
  if (!confirmed) return;
  if (state.supabase) {
    const { error } = await state.supabase.from('book_projects').delete().eq('id', bookId).eq('user_id', getUserId());
    if (error) throw error;
  } else {
    const books = loadJson(STORAGE_KEYS.books, []).filter(item => !(item.id === bookId && item.user_id === getUserId()));
    saveJson(STORAGE_KEYS.books, books);
  }
  const nextSelectedBookId = state.books.find(item => item.id !== bookId)?.id || null;
  clearBookForm();
  state.bookProjectDetailIds.delete(bookId);
  state.bookProjectDetailPromises.delete(bookId);
  if (state.selectedBookId === bookId) state.selectedBookId = nextSelectedBookId;
  await loadAllData({ silent: true, syncReason: state.supabase ? '選稿編排已從雲端刪除。' : '' });
  if (state.selectedBookId === bookId || !state.books.find(item => item.id === state.selectedBookId)) {
    state.selectedBookId = state.books[0]?.id || null;
  }
  refreshUi();
  showToast('選稿編排已刪除，原始札記仍保留在札記庫。');
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
  const previewChapters = tocChapters.slice(0, 5);
  const hiddenCount = tocChapters.length - previewChapters.length;
  els.tocPreviewList.className = 'toc-preview-list';
  els.tocPreviewList.innerHTML = `<ol>${previewChapters.map(({ chapter, index }) => `
    <li><span>第 ${index + 1} 章</span><strong>${escapeHtml(chapter.chapter_title || '未命名章節')}</strong></li>
  `).join('')}</ol>${hiddenCount > 0 ? `<p class="caption toc-preview-more">另有 ${hiddenCount} 章未顯示，完整順序請看右側章節編排。</p>` : ''}`;
}

function getActiveBookDraftId() {
  return state.bookDraftModalOpen && state.bookDraftModalBookId
    ? state.bookDraftModalBookId
    : state.selectedBookId;
}

function getSelectedBook() {
  const activeId = getActiveBookDraftId();
  return state.books.find(book => book.id === activeId) || null;
}

function getBookArrangementDraft(bookId = '') {
  if (!bookId) return null;
  const draft = state.bookArrangementDrafts[bookId];
  return Array.isArray(draft) ? cloneBookChapters(draft) : null;
}

function hasBookArrangementDraft(bookId = '') {
  return Array.isArray(state.bookArrangementDrafts[bookId]);
}

function syncBookArrangementState(bookId = state.selectedBookId) {
  state.bookArrangementDirty = !!(bookId && hasBookArrangementDraft(bookId));
}

function getBookDisplayChapters(book) {
  if (!book) return [];
  return getBookArrangementDraft(book.id) || normalizeBookChapters(book.chapters || []);
}

function getSelectedBookForDisplay() {
  const book = getSelectedBook();
  if (!book) return null;
  return { ...book, chapters: getBookDisplayChapters(book) };
}

function setBookArrangementDraft(bookId, chapters) {
  if (!bookId) return;
  state.bookArrangementDrafts[bookId] = normalizeBookChapters(chapters);
  syncBookArrangementState(bookId);
}

function clearBookArrangementDraft(bookId) {
  if (!bookId) return;
  delete state.bookArrangementDrafts[bookId];
  syncBookArrangementState(bookId);
}

function ensureBookArrangementControls() {
  const actionRow = els.exportEpubBtn?.parentElement;
  if (!actionRow || !actionRow.parentElement) return;
  let saveBtn = document.getElementById('save-book-arrangement-btn');
  if (!saveBtn) {
    saveBtn = document.createElement('button');
    saveBtn.id = 'save-book-arrangement-btn';
    saveBtn.type = 'button';
    saveBtn.className = 'secondary-btn';
    saveBtn.addEventListener('click', () => saveBookArrangement().catch(handleError));
    actionRow.insertBefore(saveBtn, els.exportEpubBtn);
  }
  let statusText = document.getElementById('book-arrangement-status');
  if (!statusText) {
    statusText = document.createElement('p');
    statusText.id = 'book-arrangement-status';
    statusText.className = 'caption hidden';
    actionRow.insertAdjacentElement('afterend', statusText);
  }
  saveBtn.disabled = !state.bookArrangementDirty || state.bookArrangementSaving;
  saveBtn.textContent = state.bookArrangementSaving ? '儲存中...' : '儲存編排';
  const mobileSaveBtn = document.getElementById('save-book-arrangement-mobile-btn');
  if (mobileSaveBtn) {
    mobileSaveBtn.disabled = saveBtn.disabled;
    mobileSaveBtn.textContent = saveBtn.textContent;
  }
  statusText.textContent = state.bookArrangementSaving ? '正在儲存章節編排...' : '章節編排尚未儲存';
  statusText.classList.toggle('hidden', !(state.bookArrangementDirty || state.bookArrangementSaving));
}

function renderSelectedBookPanel() {
  const rawBook = getSelectedBook();
  syncBookArrangementState(rawBook?.id || '');
  const book = getSelectedBookForDisplay();
  const chapterCount = (book?.chapters || []).length;
  if (els.statusCurrentBook) els.statusCurrentBook.textContent = getBookDraftLabel(book) || '未選取';
  if (els.statusChapterCount) els.statusChapterCount.textContent = String(chapterCount);
  syncExportButtonState();
  els.selectedBookEmpty.classList.toggle('hidden', !!book);
  els.selectedBookPanel.classList.toggle('hidden', !book);
  if (!book) {
    state.bookDraftModalOpen = false;
    state.bookDraftModalBookId = null;
    renderExportSuccessActions(null);
    return;
  }
  const isCurrentDraft = book.id === state.selectedBookId;
  document.querySelector('#view-books .book-draft-modal-shell .panel-header h2')?.replaceChildren(
    document.createTextNode(isCurrentDraft ? `目前選稿編排：${getBookDraftLabel(book)}` : `整理章節：${getBookDraftLabel(book)}`),
  );
  document.getElementById('modal-start-current-book-btn')?.classList.toggle('hidden', isCurrentDraft);
  document.getElementById('modal-start-current-book-mobile-btn')?.classList.toggle('hidden', isCurrentDraft);
  ensureBookArrangementControls();
  if (els.addChapterBtn) els.addChapterBtn.disabled = state.bookArrangementDirty || state.bookArrangementSaving;
  updateChapterSourceOptions();
  const notes = getBookDraftSourceNotes(book);
  const draftStatus = state.bookArrangementSaving
    ? '正在儲存'
    : hasBookArrangementDraft(book.id)
      ? '尚未儲存'
      : chapterCount
        ? '待成書設定'
        : '待整理';
  els.bookCoverPreview.innerHTML = `
    <div class="cover-overlay">
      <div class="caption">${isCurrentDraft ? '目前正在編排' : '選稿編排'}</div>
      ${isCurrentDraft ? '<span class="badge book-draft-status-badge is-current">正在編排</span>' : ''}
      <h2>${escapeHtml(getBookDraftLabel(book))}</h2>
      <div>${escapeHtml(getBookDraftDescription(book) || '尚未填寫整理說明')}</div>
      <div class="caption">已收錄 ${chapterCount} 篇｜${escapeHtml(draftStatus)}｜更新於 ${escapeHtml(formatDate(book.updated_at || book.created_at))}</div>
      <div class="caption">${escapeHtml(getBookDraftScopeSummary(book))}</div>
      ${notes.length ? `<div class="caption">預覽：${escapeHtml(notes.slice(0, 3).map(note => note.title || '未命名札記').join('、'))}</div>` : ''}
    </div>
  `;
  renderSelectedNotePreview();
  renderTocPreview(book);
  renderChaptersList(book);
  renderExportSuccessActions(state.latestExportedBook?.sourceBookId === book.id ? state.latestExportedBook : null);
}

function renderChaptersList(book) {
  const chapters = book.chapters || [];
  const actionDisabled = state.bookArrangementSaving ? 'disabled' : '';
  const fieldDisabled = state.bookArrangementDirty || state.bookArrangementSaving ? 'disabled' : '';
  if (state.bookProjectDetailPromises.has(book.id)) {
    els.chaptersList.className = 'list-stack book-draft-chapters-list empty-state';
    els.chaptersList.textContent = '正在載入完整章節...';
    return;
  }
  if (!chapters.length) {
    els.chaptersList.className = 'list-stack book-draft-chapters-list empty-state';
    if (state.bookArrangementSaving) {
      els.chaptersList.textContent = '正在儲存章節編排...';
      return;
    }
    const draftLabel = getBookDraftLabel(book);
    els.chaptersList.innerHTML = `
        <div class="book-draft-empty-guide">
          <h4>這份選稿編排目前還沒有收錄文章。</h4>
          <p>請先到札記庫挑選札記，加入目前正在編排的書稿。</p>
          <button type="button" class="secondary-btn" data-empty-draft-go-library="${book.id}">前往札記庫加入文章</button>
        </div>
    `;
    els.chaptersList.querySelector('[data-empty-draft-go-library]')?.addEventListener('click', () => {
      showToast(`請先為「${draftLabel}」加入文章。`);
      goToContentLibraryForBookDraft(book.id).catch(handleError);
    });
      return;
  }
  els.chaptersList.className = 'list-stack book-draft-chapters-list';
  els.chaptersList.innerHTML = chapters.map((chapter, index) => `
    <div class="chapter-item">
      <div class="chapter-row">
        <input value="${escapeHtml(chapter.chapter_title || '')}" data-chapter-title="${chapter.id}" ${fieldDisabled} />
        <div class="chapter-controls">
          <button class="ghost-btn small" data-move-up="${chapter.id}" ${index === 0 || state.bookArrangementSaving ? 'disabled' : ''}>上移</button>
          <button class="ghost-btn small" data-move-down="${chapter.id}" ${index === chapters.length - 1 || state.bookArrangementSaving ? 'disabled' : ''}>下移</button>
          <button class="danger-btn small" data-remove-chapter="${chapter.id}" ${actionDisabled}>移除</button>
        </div>
      </div>
      <div class="chapter-meta-row">
        <div class="caption">來源札記：${escapeHtml(getNoteById(getChapterSourceNoteId(chapter))?.title || '手動章節')}</div>
        <label class="checkbox-row"><input type="checkbox" data-chapter-toc="${chapter.id}" ${chapter.include_in_toc ? 'checked' : ''} ${fieldDisabled} /><span>列入目錄</span></label>
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
  let book = getSelectedBook();
  if (!book) throw new Error('請先選取一本書。');
  book = await loadBookProjectDetail(book.id) || book;
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
  let book = getSelectedBook();
  if (!book) return;
  book = await loadBookProjectDetail(book.id) || book;
  const nextChapters = book.chapters.map(chapter => chapter.id === chapterId ? { ...chapter, chapter_title: title } : chapter);
  await persistBookChanges(book.id, { chapters: nextChapters });
}

async function updateChapterToc(chapterId, checked) {
  let book = getSelectedBook();
  if (!book) return;
  book = await loadBookProjectDetail(book.id) || book;
  const nextChapters = book.chapters.map(chapter => chapter.id === chapterId ? { ...chapter, include_in_toc: checked } : chapter);
  await persistBookChanges(book.id, { chapters: nextChapters });
}

function syncExportButtonState() {
  if (!els.exportEpubBtn) return;
  els.exportEpubBtn.disabled = state.isExporting;
  els.exportEpubBtn.textContent = state.isExporting ? '匯出中...' : '匯出 EPUB';
}

function cloneBookChapters(chapters = []) {
  return (chapters || []).map(chapter => ({ ...chapter }));
}

function normalizeBookChapters(chapters = []) {
  return cloneBookChapters(chapters).map((chapter, index) => ({
    ...chapter,
    source_note_id: getChapterSourceNoteId(chapter),
    chapter_order: index,
  }));
}

function stageBookArrangementChange(updater, pendingMessage = '章節編排尚未儲存') {
  if (state.bookArrangementSaving) return;
  const book = getSelectedBook();
  if (!book) return;
  const baseChapters = getBookArrangementDraft(book.id) || cloneBookChapters(book.chapters || []);
  const nextChapters = updater(cloneBookChapters(baseChapters));
  if (!Array.isArray(nextChapters)) return;
  setBookArrangementDraft(book.id, nextChapters);
  refreshUi();
  if (pendingMessage) showToast(pendingMessage);
}

async function saveBookArrangement() {
  if (state.bookArrangementSaving) return;
  let book = getSelectedBook();
  if (!book) return;
  book = await loadBookProjectDetail(book.id) || book;
  if (!hasBookArrangementDraft(book.id)) return;
  const draftChapters = getBookArrangementDraft(book.id) || [];
  state.bookArrangementSaving = true;
  refreshUi();
  try {
    await persistBookChanges(book.id, { chapters: normalizeBookChapters(draftChapters) });
    clearBookArrangementDraft(book.id);
    showToast('章節編排已儲存');
  } finally {
    state.bookArrangementSaving = false;
    refreshUi();
  }
}

async function moveChapter(chapterId, direction) {
  stageBookArrangementChange(chapters => {
    const index = chapters.findIndex(ch => ch.id === chapterId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= chapters.length) return null;
    [chapters[index], chapters[target]] = [chapters[target], chapters[index]];
    return chapters;
  });
}

async function removeChapter(chapterId) {
  const book = getSelectedBook();
  const chapter = getBookDisplayChapters(book).find(item => item.id === chapterId);
  const confirmed = await openConfirmDialog({
    title: '確定要移除這個章節嗎？',
    message: `「${chapter?.chapter_title || '未命名章節'}」只會從目前編排中移除，不會刪除原本的札記。`,
    confirmText: '確認移除',
    danger: true,
  });
  if (!confirmed) return;
  stageBookArrangementChange(chapters => {
    const nextChapters = chapters.filter(ch => ch.id !== chapterId);
    return nextChapters.length === chapters.length ? null : nextChapters;
  }, '章節編排尚未儲存');
}

async function persistBookChanges(bookId, changes) {
  const book = await loadBookProjectDetail(bookId) || state.books.find(item => item.id === bookId);
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
  let book = getSelectedBook();
  if (!book) throw new Error('請先選取一本書。');
  book = await loadBookProjectDetail(book.id) || book;
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
  const chapters = getBookProjectChapters(book);
  return {
    exported_at: nowIso(),
    book: {
      title: book.title,
      subtitle: book.subtitle,
      author_name: book.author_name,
      description: getBookDraftDescription(book),
      template_code: book.template_code,
      language: resolveBookLanguage(book.language),
      preface: book.preface,
      afterword: book.afterword,
      toc_enabled: book.toc_enabled,
      include_chapter_summary: !!book.include_chapter_summary,
      cover_data_url: book.cover_data_url,
    },
    chapters: chapters.map(chapter => {
      const sourceNoteId = getChapterSourceNoteId(chapter);
      const note = getNoteById(sourceNoteId);
      return {
        id: chapter.id,
        chapter_title: chapter.chapter_title,
        include_in_toc: chapter.include_in_toc,
        source_note_id: sourceNoteId,
        note_title: note?.title || '',
        scripture_reference: note?.scripture_reference || '',
        summary: note?.summary || '',
        content: note?.content || '',
      };
    }),
  };
}

function getBookProjectChapters(book) {
  const raw = book?.chapters ?? book?.chapters_json ?? [];
  const parsed = parseMaybeJson(raw, []);
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.chapters)) return parsed.chapters;
  if (Array.isArray(parsed.items)) return parsed.items;
  return [];
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
  if (viewName === 'admin') viewName = 'admin-dashboard';
  if (isAdminView(viewName) && !isAdminUser()) {
    showToast('目前帳號沒有管理後台權限。');
    viewName = 'dashboard';
  }
  if (viewName === 'snapshots') viewName = 'dashboard';
  if (viewName !== 'books') state.bookDraftModalOpen = false;
  if (viewName !== 'books' && state.bookDraftSettingsModalOpen) closeBookDraftSettingsModal();
  if (viewName !== 'books' && state.bookExportSettingsModalOpen) closeBookExportSettingsModal();
  const isReaderView = viewName === 'reader';
  const titleMap = {
    dashboard: ['總覽', ''],
    'note-reader': ['札記閱讀', '單純閱讀已寫下的札記，不進入編輯器。'],
    notes: ['寫札記', '專注寫下今天的領受、禱告與整理。'],
    'content-library': ['札記庫', '搜尋、篩選並挑選已寫下的札記，加入目前正在編排的書稿。'],
    books: ['選稿編排', '管理成書前的選稿編排，整理章節順序並進行成書設定。'],
    'admin-dashboard': ['管理後台', '第一階段白名單入口，僅授權管理者可使用。'],
    snapshots: ['快照備份', '查看每次建立的書籍快照。'],
    library: ['書櫃', '收藏已匯出的固定版本作品，直接開啟閱讀。'],
    manual: ['操作手冊', '了解靈修札記成書系統的使用方式與整理流程。'],
    reader: ['閱讀模式', '安靜閱讀已加入書櫃的 EPUB。'],
  };
  document.body.dataset.currentView = viewName;
  els.viewNavLinks.forEach(link => link.classList.toggle('active', link.dataset.view === viewName));
  els.views.forEach(view => view.classList.toggle('active', view.id === `view-${viewName}`));
  const viewTitle = titleMap[viewName] || titleMap.dashboard;
  if (els.viewTitle) els.viewTitle.textContent = viewTitle[0];
  if (els.viewSubtitle) {
    els.viewSubtitle.textContent = viewTitle[1];
    els.viewSubtitle.classList.toggle('hidden', viewName === 'dashboard');
  }
  if (viewName === 'admin-dashboard') {
    loadAdminUsage().catch(() => {});
  }
  if (viewName === 'library') {
    refreshLibraryCoverUrls().catch(console.warn);
  }
  if (viewName === 'note-reader') {
    renderNoteReader();
  }
  if (isReaderView) {
    document.body.dataset.readerScrollY = String(window.scrollY || 0);
    document.body.classList.add('reader-active');
    document.body.style.overflow = 'hidden';
    window.scrollTo({ top: 0, behavior: 'auto' });
  } else {
    const restoreY = Number(document.body.dataset.readerScrollY || 0);
    document.body.classList.remove('reader-active');
    document.body.style.overflow = '';
    if (restoreY > 0) window.scrollTo({ top: restoreY, behavior: 'auto' });
  }
  syncCurrentNoteDraftNotice();
}

function formatDate(value) {
  if (!value) return '未記錄';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}/${month}/${day} ${hour}:${minute}`;
}

function handleError(error) {
  console.error(error);
  showToast(error?.message || '發生錯誤，請檢查設定。');
}

function handleNoteSaveError(error) {
  console.error(error);
  persistCurrentNoteDraft({ immediate: true });
  if (error?.message === '請填入標題與內容。') {
    showToast(error.message);
    return;
  }
  showToast('札記儲存失敗，內容已保留，請稍後再試。');
}

async function exportSelectedBookEpub() {
  if (state.isExporting) return;
  requireUser();
  let book = getSelectedBook();
  if (!book) throw new Error('\u8acb\u5148\u9078\u64c7\u8981\u532f\u51fa\u7684\u66f8\u7c4d\u3002');
  book = await loadBookProjectDetail(book.id) || book;
  if (!getBookProjectChapters(book).length) throw new Error('\u8acb\u81f3\u5c11\u52a0\u5165\u4e00\u7ae0\u5167\u5bb9\u5f8c\u518d\u532f\u51fa EPUB\u3002');
  state.isExporting = true;
  syncExportButtonState();
  renderExportSuccessActions(null);
  showToast('正在匯出 EPUB...');
  try {
    const snapshot = buildBookSnapshot(book);
    const epubBlob = await buildEpub(snapshot);
    const exportFilename = `${slugifyFilename(book.title || 'devotion-book')}.epub`;
    let libraryBook = null;
    let exportMessage = 'EPUB 已完成，請點選下載 EPUB 保存檔案。';
    if (state.supabase && state.currentUser) {
      try {
        libraryBook = await createCloudLibraryBook(book, snapshot, epubBlob);
        exportMessage = 'EPUB 已完成，並已加入書櫃。';
      } catch (error) {
        console.warn('cloud library sync skipped after EPUB export', error);
        exportMessage = `EPUB 已完成，但加入書櫃失敗：${error.message}`;
      }
    }
    state.latestExportedBook = {
      sourceBookId: book.id,
      filename: exportFilename,
      blob: epubBlob,
      libraryBookId: libraryBook?.id || '',
      message: exportMessage,
    };
    renderExportSuccessActions(state.latestExportedBook);
    showToast(exportMessage);
  } finally {
    state.isExporting = false;
    syncExportButtonState();
  }
}

function slugifyFilename(value = '') {
  const safe = String(value || '')
    .trim()
    .replace(/[\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return safe || 'devotion-book';
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
    files.push({ name: `OEBPS/text/chapter-${index + 1}.xhtml`, content: encoder.encode(chapterXhtml(chapter, index + 1, book)) });
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
  return `
body{font-family:"Noto Serif TC","PingFang TC",serif;line-height:1.92;color:#2e2823;margin:0;padding:0;background:#fffdf9;}
main{max-width:38em;margin:0 auto;padding:2.35em 1.8em 2.7em;}
h1,h2{color:${theme[1]};}
h1{margin:0;font-size:1.7em;line-height:1.34;font-weight:700;letter-spacing:.01em;}
h2{margin:1.95em 0 .72em;font-size:1.14em;line-height:1.5;font-weight:700;letter-spacing:.01em;}
a{color:${theme[1]};text-decoration:none;}
nav ol{padding-left:1.3em;}
.title-page{background:${theme[0]};padding:2.4em 2.2em;border-radius:22px;margin-top:2.2em;box-shadow:inset 0 0 0 1px rgba(140,118,90,.08);}
.meta{color:#6b6259;font-size:.95em;line-height:1.75;}
.chapter-head{margin:0 0 2.05em;padding:1.1em 0 1.25em;border-bottom:1px solid rgba(166,143,115,.18);text-align:left;}
.chapter-kicker{margin:0 0 .8em;color:#6f5b47;font-size:1.42em;line-height:1.36;font-weight:700;letter-spacing:.11em;text-align:center;}
.chapter-head h1{margin:0;font-size:1.28em;line-height:1.54;font-weight:700;letter-spacing:.01em;text-align:left;}
.chapter-head .scripture{margin:.95em 0 0;}
.scripture{color:#736453;font-size:.96em;line-height:1.78;letter-spacing:.04em;font-style:italic;}
.chapter-summary{margin:1.15em 0 1.95em;padding:1.15em 1.2em 1.08em;border:1px solid rgba(160,142,112,.22);border-radius:18px;background:linear-gradient(180deg, rgba(248,244,237,.96), rgba(243,236,226,.82));box-shadow:0 10px 24px rgba(94,76,54,.06);}
.chapter-summary .kicker{display:block;margin-bottom:.45em;color:#7a6753;font-size:.8em;font-weight:700;letter-spacing:.08em;text-transform:uppercase;}
.chapter-summary p{margin:0;line-height:1.86;color:#4d4339;}
blockquote{margin:1.35em 0 1.55em;padding:1.05em 1.2em 1.05em 1.3em;border-left:4px solid rgba(155,122,72,.42);border-radius:0 18px 18px 0;background:linear-gradient(180deg, rgba(247,242,234,.92), rgba(243,236,226,.7));color:#4a4034;line-height:1.92;}
hr{width:38%;margin:2em auto 1.9em;border:0;border-top:1px solid rgba(155,122,72,.34);}
ul{margin:0 0 1.45em;padding-left:1.5em;}
li{margin:.45em 0;line-height:1.86;padding-left:.12em;}
.markdown-spacer{height:1rem;}
.markdown-spacer-2{height:1.8rem;}
strong{font-weight:700;color:${theme[1]};}
.text-red,.text-red strong{color:#8a3b3b !important;}
.text-blue,.text-blue strong{color:#355d8d !important;}
.text-gold,.text-gold strong{color:#8a6a1f !important;}
.text-purple,.text-purple strong{color:#6a4a82 !important;}
p{margin:0 0 1.18em;line-height:1.92;}
`;
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
        ${getBookDraftDescription(book) ? renderMarkdownContent(getBookDraftDescription(book)) : ''}
      </div>
    </main>
  `, false, "../styles/book.css", resolveBookLanguage(book.language));
}
function simpleSection(title, content, language = DEFAULT_BOOK_LANGUAGE) {
  return xhtmlWrap(title, `<main><h1>${escapeHtml(title)}</h1>${renderMarkdownContent(content)}</main>`, false, "../styles/book.css", resolveBookLanguage(language));
}
function chapterXhtml(chapter, order, book = {}) {
  const language = resolveBookLanguage(book.language);
  const summaryHtml = escapeHtml(chapter.summary || '').replaceAll('\n', '<br/>');
  const summaryBlock = book.include_chapter_summary && chapter.summary
    ? `<section class="chapter-summary"><span class="kicker">本章摘要</span><p>${summaryHtml}</p></section>`
    : '';
  return xhtmlWrap(chapter.chapter_title, `
    <main>
      <header class="chapter-head">
        <p class="chapter-kicker">第 ${order} 章</p>
        <h1>${escapeHtml(chapter.chapter_title)}</h1>
        ${chapter.scripture_reference ? `<p class="scripture">${escapeHtml(chapter.scripture_reference)}</p>` : ''}
      </header>
      ${summaryBlock}
      ${renderMarkdownContent(chapter.content || '')}
    </main>
  `, false, "../styles/book.css", language);
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
  return renderMarkdownContent(text);
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
  readerSearchQuery: '',
  readerSearchStatus: 'idle',
  readerSearchResults: [],
  readerSearchCache: [],
  readerSearchCacheKey: '',
  readerSearchTimer: null,
  readerSearchRunId: 0,
  readerSearchTruncated: false,
  readerSearchComposing: false,
  readerSettings: loadJson('devotion-app-reader-settings', { fontSize: 18, lineHeight: 1.8, theme: 'light' }),
};

const systemLibrary = {
  progressKey: 'devotion-system-library-progress',
  bible: Object.freeze({
    id: 'system-bible',
    source: 'system',
    system_book_key: 'bible',
    is_default: true,
    title: '聖經',
    author: '和合本',
    description: '系統預設聖經電子書，可作為靈修閱讀參考。',
    cover_image_path: '/assets/default-books/bible-cover.png',
    epub_file_path: '/assets/default-books/bible.epub',
    version: 'system',
    total_chapters: 0,
    current_chapter: 0,
    reading_progress: 0,
    last_read_at: null,
    created_at: '1970-01-01T00:00:00.000Z',
    updated_at: '1970-01-01T00:00:00.000Z',
    source_project_id: null,
    source_compilation_id: null,
    is_archived: false,
  }),
};

function clearCloudLibrary(message = '') {
  cloudLibrary.books = [];
  cloudLibrary.chapters = new Map();
  cloudLibrary.coverUrls = new Map();
  state.libraryCoverUrlCache.clear();
  state.libraryCoverSignedUrlPromises.clear();
  clearLibraryCoverObjectUrlCache();
  state.libraryCoverImageObserver?.disconnect();
  state.libraryCoverImageObserver = null;
  cloudLibrary.error = message;
  cloudLibrary.selectedBookId = '';
  cloudLibrary.readerBook = null;
  cloudLibrary.readerChapters = [];
  cloudLibrary.readerChapterIndex = 0;
  cloudLibrary.readerPageIndex = 0;
  cloudLibrary.readerPageCount = 1;
  cloudLibrary.readerChapterPageCounts = [];
  cloudLibrary.readerChapterPages = [];
  cloudLibrary.readerPaginationSignature = '';
  cloudLibrary.readerActivePanel = null;
  cloudLibrary.readerControlsVisible = false;
  clearTimeout(cloudLibrary.readerControlsTimer);
  cloudLibrary.readerControlsTimer = null;
}

const importedLibrary = {
  source: 'imported_epub',
  storageKey: STORAGE_KEYS.importedLibraryBooks,
  dbName: 'devotion-imported-library',
  storeName: 'importedBooks',
  books: [],
  coverUrls: new Map(),
};

function revokeImportedCoverUrls() {
  importedLibrary.coverUrls.forEach(url => {
    if (url) URL.revokeObjectURL(url);
  });
  importedLibrary.coverUrls = new Map();
}

function getSystemLibraryProgressMap() {
  return loadJson(systemLibrary.progressKey, {});
}

function saveSystemLibraryProgress(bookId, payload = {}) {
  const progressMap = getSystemLibraryProgressMap();
  progressMap[bookId] = {
    ...(progressMap[bookId] || {}),
    ...payload,
  };
  saveJson(systemLibrary.progressKey, progressMap);
}

function isSystemLibraryBook(book) {
  return String(book?.source || '') === 'system'
    || String(book?.system_book_key || '') === 'bible'
    || String(book?.id || '') === systemLibrary.bible.id;
}

function buildSystemLibraryBook() {
  const saved = getSystemLibraryProgressMap()[systemLibrary.bible.id] || {};
  return normalizeLibraryBook({
    ...systemLibrary.bible,
    ...saved,
    source: 'system',
    system_book_key: 'bible',
    is_default: true,
    total_chapters: Number(saved.total_chapters || systemLibrary.bible.total_chapters || 0),
    current_chapter: Number(saved.current_chapter || systemLibrary.bible.current_chapter || 0),
    reading_progress: Number(saved.reading_progress || systemLibrary.bible.reading_progress || 0),
    last_read_at: saved.last_read_at || systemLibrary.bible.last_read_at || null,
    updated_at: saved.updated_at || systemLibrary.bible.updated_at,
  });
}

function getSystemLibraryBooks() {
  return [buildSystemLibraryBook()];
}

function getSystemLibraryBook(bookId) {
  return getSystemLibraryBooks().find(book => book.id === bookId) || null;
}

function normalizeImportedChapter(chapter = {}, index = 0, bookId = '') {
  const order = Number.isFinite(Number(chapter.chapter_order)) ? Number(chapter.chapter_order) : index;
  return {
    id: String(chapter.id || `imported_chapter_${bookId}_${order}`),
    user_id: null,
    book_id: String(chapter.book_id || bookId),
    title: sanitizeDisplayText(chapter.title, `第 ${order + 1} 章`),
    chapter_order: order,
    href: String(chapter.href || chapter.chapter_path || ''),
    chapter_path: String(chapter.chapter_path || chapter.href || ''),
    progress: Number(chapter.progress || 0),
  };
}

function normalizeImportedBook(raw = {}) {
  const importedAt = String(raw.importedAt || raw.created_at || nowIso());
  const updatedAt = String(raw.updatedAt || raw.updated_at || importedAt);
  const bookId = String(raw.id || createImportedBookId());
  const chapters = Array.isArray(raw.chapters)
    ? raw.chapters.map((chapter, index) => normalizeImportedChapter(chapter, index, bookId)).sort((a, b) => a.chapter_order - b.chapter_order)
    : [];
  return {
    id: bookId,
    source: 'imported_epub',
    title: sanitizeDisplayText(raw.title, '未命名 EPUB'),
    author: sanitizeDisplayText(raw.author, '未填作者'),
    description: sanitizeDisplayText(raw.description, ''),
    fileName: String(raw.fileName || 'book.epub'),
    fileSize: Number(raw.fileSize || 0),
    importedAt,
    updatedAt,
    created_at: importedAt,
    updated_at: updatedAt,
    totalChapters: Number(raw.totalChapters || chapters.length),
    total_chapters: Number(raw.totalChapters || chapters.length),
    currentChapter: Number(raw.currentChapter || raw.current_chapter || 0),
    current_chapter: Number(raw.currentChapter || raw.current_chapter || 0),
    readingProgress: Number(raw.readingProgress || raw.reading_progress || 0),
    reading_progress: Number(raw.readingProgress || raw.reading_progress || 0),
    lastReadAt: raw.lastReadAt || raw.last_read_at || null,
    last_read_at: raw.lastReadAt || raw.last_read_at || null,
    hasCover: !!raw.hasCover,
    version: raw.version || 'imported',
    user_id: null,
    chapters,
  };
}

function createImportedBookId() {
  return uid('imported_book');
}

function loadImportedLibraryBooks() {
  const books = loadJson(importedLibrary.storageKey, []);
  importedLibrary.books = Array.isArray(books) ? books.map(normalizeImportedBook) : [];
  return importedLibrary.books;
}

function saveImportedLibraryBooks(books = importedLibrary.books) {
  const payload = books.map(book => ({
    id: book.id,
    source: 'imported_epub',
    title: book.title,
    author: book.author,
    description: book.description,
    fileName: book.fileName,
    fileSize: book.fileSize,
    importedAt: book.importedAt || book.created_at || nowIso(),
    updatedAt: book.updatedAt || book.updated_at || nowIso(),
    totalChapters: Number(book.totalChapters || book.total_chapters || 0),
    currentChapter: Number(book.currentChapter || book.current_chapter || 0),
    readingProgress: Number(book.readingProgress || book.reading_progress || 0),
    lastReadAt: book.lastReadAt || book.last_read_at || null,
    hasCover: !!book.hasCover,
    chapters: (book.chapters || []).map((chapter, index) => ({
      id: chapter.id || `imported_chapter_${book.id}_${index}`,
      user_id: null,
      book_id: book.id,
      title: chapter.title || `第 ${index + 1} 章`,
      chapter_order: Number(chapter.chapter_order || index),
      href: chapter.href || chapter.chapter_path || '',
      chapter_path: chapter.chapter_path || chapter.href || '',
      progress: Number(chapter.progress || 0),
    })),
  }));
  saveJson(importedLibrary.storageKey, payload);
  importedLibrary.books = payload.map(normalizeImportedBook);
}

function getImportedBook(bookId) {
  return importedLibrary.books.find(book => book.id === bookId) || null;
}

async function openImportedLibraryDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(importedLibrary.dbName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(importedLibrary.storeName)) {
        db.createObjectStore(importedLibrary.storeName, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveImportedBookBlob(bookId, epubBlob, coverBlob = null) {
  const db = await openImportedLibraryDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(importedLibrary.storeName, 'readwrite');
    tx.objectStore(importedLibrary.storeName).put({ id: bookId, epubBlob, coverBlob: coverBlob || null });
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function getImportedBookBlob(bookId) {
  const db = await openImportedLibraryDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(importedLibrary.storeName, 'readonly');
    const request = tx.objectStore(importedLibrary.storeName).get(bookId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

async function deleteImportedBookBlob(bookId) {
  const db = await openImportedLibraryDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(importedLibrary.storeName, 'readwrite');
    tx.objectStore(importedLibrary.storeName).delete(bookId);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function refreshImportedLibraryCoverUrls() {
  revokeImportedCoverUrls();
  const entries = await Promise.all(importedLibrary.books.map(async book => {
    if (!book.hasCover) return [book.id, ''];
    try {
      const stored = await getImportedBookBlob(book.id);
      return [book.id, stored?.coverBlob ? URL.createObjectURL(stored.coverBlob) : ''];
    } catch {
      return [book.id, ''];
    }
  }));
  importedLibrary.coverUrls = new Map(entries);
}

async function refreshImportedLibraryState() {
  loadImportedLibraryBooks();
  try {
    await refreshImportedLibraryCoverUrls();
  } catch (error) {
    console.warn('無法讀取 imported EPUB 封面', error);
    revokeImportedCoverUrls();
  }
}

function getAllLibraryBooksForView(options = {}) {
  const includeSystem = options.includeSystem !== false;
  const generatedBooks = cloudLibrary.books
    .filter(book => !isSystemLibraryBook(book))
    .map(book => ({ ...book, source: 'generated' }));
  const importedBooks = importedLibrary.books.map(book => ({ ...book, source: 'imported_epub' }));
  const merged = includeSystem ? [...getSystemLibraryBooks(), ...generatedBooks, ...importedBooks] : [...generatedBooks, ...importedBooks];
  const seen = new Set();
  return merged.filter(book => {
    const id = String(book?.id || '');
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function compareLibraryBooks(a, b, sortMode = 'recent-read') {
  const priorityA = isSystemLibraryBook(a) ? 0 : 1;
  const priorityB = isSystemLibraryBook(b) ? 0 : 1;
  if (priorityA !== priorityB) return priorityA - priorityB;
  if (sortMode === 'title') return String(a.title || '').localeCompare(String(b.title || ''), 'zh-Hant');
  if (sortMode === 'recent-created') {
    return String((b.updated_at || b.created_at || b.importedAt || ''))
      .localeCompare(String(a.updated_at || a.created_at || a.importedAt || ''));
  }
  return String((b.last_read_at || b.created_at || b.importedAt || ''))
    .localeCompare(String(a.last_read_at || a.created_at || a.importedAt || ''));
}

function getLibraryCoverUrl(book) {
  if (!book) return '';
  if (book.source === 'imported_epub') return importedLibrary.coverUrls.get(book.id) || '';
  if (isSystemLibraryBook(book)) return cloudLibrary.coverUrls.get(book.id) || book.cover_image_path || '';
  return cloudLibrary.coverUrls.get(book.id) || '';
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
    source: book.source || 'generated',
    title: book.title || '未命名書籍',
    author: book.author || '',
    description: getBookDraftDescription(book) || '',
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

async function loadCloudLibrary(userId, { reason = '' } = {}) {
  const { data, error } = await state.supabase
    .from('library_books')
    .select('id,user_id,title,author,description,cover_image_path,epub_file_path,created_at,updated_at,last_read_at,reading_progress,total_chapters,current_chapter,source_project_id,source_compilation_id,version,is_archived')
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
  const validBookIds = new Set(cloudLibrary.books.map(book => book.id));
  [...cloudLibrary.chapters.keys()].forEach(bookId => {
    if (!validBookIds.has(bookId)) cloudLibrary.chapters.delete(bookId);
  });
  egressDebugLog('loadCloudLibrary:books', {
    reason,
    count: cloudLibrary.books.length,
    bytes: estimatePayloadBytes(data || []),
  });
  if (document.body.dataset.currentView === 'library') {
    refreshLibraryCoverUrls().catch(console.warn);
  }
}

async function loadLibraryBookChapters(bookId, { force = false } = {}) {
  requireCloudLibrary();
  const existing = cloudLibrary.chapters.get(bookId) || [];
  if (!force && existing.length) {
    egressDebugLog('loadLibraryBookChapters:cache-hit', { bookId, count: existing.length });
    return existing;
  }
  const { data, error } = await state.supabase
    .from('library_book_chapters')
    .select('id,user_id,book_id,title,chapter_order,href,chapter_path,progress,created_at,updated_at')
    .eq('user_id', getUserId())
    .eq('book_id', bookId)
    .order('chapter_order', { ascending: true });
  if (error) throw new Error(`讀取章節失敗：${error.message}`);
  const chapters = normalizeLibraryChapters(data || []);
  cloudLibrary.chapters.set(bookId, chapters);
  egressDebugLog('loadLibraryBookChapters:loaded', {
    bookId,
    count: chapters.length,
    bytes: estimatePayloadBytes(data || []),
  });
  return chapters;
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
    description: snapshot.book.description || getBookDraftDescription(sourceBook) || '',
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
  cloudLibrary.chapters.set(bookId, normalizeLibraryChapters(chapters));
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
  return getAllLibraryBooksForView().find(book => book.id === bookId) || null;
}

async function refreshLibraryCoverUrls() {
  if (state.libraryCoverRefreshPromise) {
    egressGuardInfo('libraryCoverSignedUrls:reuse-in-flight');
    return state.libraryCoverRefreshPromise;
  }
  const refreshTask = (async () => {
    const entries = getSystemLibraryBooks().map(book => [book.id, book.cover_image_path || '']);
    if (state.supabase && state.currentUser) {
      let hits = 0;
      let misses = 0;
      let pendingHits = 0;
      let errors = 0;
      const cloudEntries = await Promise.all(cloudLibrary.books.map(async book => {
        if (!book.cover_image_path) return [book.id, ''];
        const cacheKey = getSignedUrlCacheKey(book.cover_image_path, book.cover_updated_at || book.updated_at || book.created_at || '');
        const cachedUrl = getCachedSignedUrl(state.libraryCoverUrlCache, cacheKey);
        if (cachedUrl) {
          hits += 1;
          return [book.id, cachedUrl];
        }
        const pendingUrlPromise = state.libraryCoverSignedUrlPromises.get(cacheKey);
        if (pendingUrlPromise) {
          pendingHits += 1;
          const pendingUrl = await pendingUrlPromise.catch(() => '');
          return [book.id, pendingUrl || ''];
        }
        misses += 1;
        const signedUrlPromise = state.supabase.storage
          .from(cloudLibrary.bucket)
          .createSignedUrl(book.cover_image_path, SIGNED_URL_CACHE_TTL_SECONDS)
          .then(({ data, error }) => {
            if (error) throw error;
            return setCachedSignedUrl(state.libraryCoverUrlCache, cacheKey, data?.signedUrl || '');
          });
        state.libraryCoverSignedUrlPromises.set(cacheKey, signedUrlPromise);
        try {
          const signedUrl = await signedUrlPromise;
          return [book.id, signedUrl || ''];
        } catch {
          errors += 1;
          state.libraryCoverUrlCache.delete(cacheKey);
          return [book.id, ''];
        } finally {
          if (state.libraryCoverSignedUrlPromises.get(cacheKey) === signedUrlPromise) {
            state.libraryCoverSignedUrlPromises.delete(cacheKey);
          }
        }
      }));
      egressDebugLog('libraryCoverSignedUrls', { books: cloudLibrary.books.length, hits, misses, pendingHits, errors });
      entries.push(...cloudEntries);
    }
    cloudLibrary.coverUrls = new Map(entries);
    renderLibrary();
    renderDesktopBookshelfCard();
  })();
  const guardedRefreshPromise = refreshTask.finally(() => {
    if (state.libraryCoverRefreshPromise === guardedRefreshPromise) {
      state.libraryCoverRefreshPromise = null;
    }
  });
  state.libraryCoverRefreshPromise = guardedRefreshPromise;
  return guardedRefreshPromise;
}

function renderLibrary() {
  const list = document.getElementById('library-list');
  const count = document.getElementById('library-count');
  if (!list) return;
  const booksForView = getAllLibraryBooksForView();
  if (count) count.textContent = String(booksForView.length);
  if (cloudLibrary.error && !booksForView.length) {
    list.className = 'library-list empty-state';
    setElementHtmlIfChanged(list, `<h3>書櫃暫時無法同步</h3><p>${escapeHtml(cloudLibrary.error)}</p>`);
    return;
  }
  if (!booksForView.length) {
    list.className = 'library-list empty-state';
    setElementHtmlIfChanged(list, '<h3>書櫃裡還沒有書</h3><p>可以先匯出自製 EPUB，或按上方「匯入 EPUB」把外部電子書加入書櫃。</p>');
    return;
  }
  const sortMode = document.getElementById('library-sort')?.value || 'recent-read';
  const books = [...booksForView].sort((a, b) => compareLibraryBooks(a, b, sortMode));
  list.className = 'library-list';
  const nextHtml = books.map(book => {
    const coverUrl = getLibraryCoverUrl(book);
    const progress = Math.max(0, Math.min(1, book.reading_progress || 0));
    const sourceBadge = book.source === 'imported_epub'
      ? '<span class="library-badge library-badge-imported">外部匯入</span>'
      : isSystemLibraryBook(book)
        ? '<span class="library-badge library-badge-system">系統預設</span>'
        : '';
    const createdAt = book.created_at || book.importedAt || '';
    const selected = book.id === cloudLibrary.selectedBookId || book.id === cloudLibrary.readerBook?.id;
    const description = getBookDraftDescription(book)
      || (book.source === 'imported_epub'
        ? '這本 EPUB 已匯入本機書櫃，可直接開啟閱讀。'
        : isSystemLibraryBook(book)
          ? '這是系統內建的聖經電子書，可直接開啟閱讀。'
        : '這本書已保存於雲端書櫃，可在登入後跨裝置閱讀。');
    const fallbackCover = book.source === 'imported_epub'
      ? `<div class="library-cover-fallback"><strong>${escapeHtml((book.title || '書').slice(0, 18))}</strong><small>EPUB 匯入書</small></div>`
      : `<span>${escapeHtml((book.title || '書').slice(0, 2))}</span>`;
    const detailLabel = book.source === 'imported_epub'
      ? `檔案 ${(book.fileSize / 1024 / 1024 || 0).toFixed(1)} MB`
      : isSystemLibraryBook(book)
        ? '系統內建電子書'
        : `版本 ${escapeHtml(book.version)}`;
    const deleteAction = isSystemLibraryBook(book)
      ? ''
      : `<button class="danger-btn" data-delete-library-book="${book.id}" data-library-source="${book.source}">刪除書籍</button>`;
    return `<article class="library-book ${selected ? 'selected' : ''} ${book.source === 'imported_epub' ? 'imported-book' : ''}"><div class="library-cover">${coverUrl ? buildLibraryCoverImage(book, coverUrl, `${book.title}封面`) : fallbackCover}</div><div class="library-book-main"><div><div class="library-book-top"><h3>${escapeHtml(book.title)}</h3>${sourceBadge}</div><div class="card-meta"><span>${escapeHtml(book.author || '未填作者')}</span><span>建立：${createdAt ? formatDate(createdAt) : '未記錄'}</span><span>最後閱讀：${book.last_read_at ? formatDate(book.last_read_at) : '尚未閱讀'}</span><span>${detailLabel}</span></div><p class="library-book-description">${escapeHtml(description)}</p></div><div class="library-progress"><span>${Math.round(progress * 100)}%</span><div><i style="width:${Math.round(progress * 100)}%"></i></div></div><div class="card-actions"><button class="primary-btn" data-open-library-book="${book.id}" data-library-source="${book.source}">開啟閱讀</button><button class="ghost-btn" data-download-library-epub="${book.id}" data-library-source="${book.source}">下載 EPUB</button>${deleteAction}</div></div></article>`;
  }).join('');
  setElementHtmlIfChanged(list, nextHtml);
  hydrateLibraryCoverImages(list);
}

async function deleteLibraryBook(bookId) {
  requireCloudLibrary();
  const book = getLibraryBook(bookId);
  if (!book) return;
  const confirmed = await openConfirmDialog({
    title: '確定要刪除這本書嗎？',
    message: `「${book.title || '未命名書籍'}」刪除後會從書櫃移除。若需要保留，請先下載 EPUB。`,
    confirmText: '確認刪除',
    danger: true,
  });
  if (!confirmed) return;
  const userId = getUserId();
  const paths = [book.epub_file_path, book.cover_image_path].filter(Boolean);
  if (paths.length) await state.supabase.storage.from(cloudLibrary.bucket).remove(paths);
  await state.supabase.from('library_book_chapters').delete().eq('book_id', bookId).eq('user_id', userId);
  const { error } = await state.supabase.from('library_books').delete().eq('id', bookId).eq('user_id', userId);
  if (error) throw new Error(`刪除書籍失敗：${error.message}`);
  await deleteCachedEpub(bookId);
  cloudLibrary.chapters.delete(bookId);
  if (cloudLibrary.readerBook?.id === bookId) cloudLibrary.readerBook = null;
  await loadAllData({ silent: true, syncReason: '書櫃已更新。' });
  showToast('書籍已從書櫃刪除。');
}

async function deleteImportedLibraryBook(bookId) {
  const book = getImportedBook(bookId);
  if (!book) return;
  const confirmed = await openConfirmDialog({
    title: '確定要刪除這本書嗎？',
    message: `「${book.title || '未命名書籍'}」刪除後會從書櫃移除。若需要保留，請先下載 EPUB。`,
    confirmText: '確認刪除',
    danger: true,
  });
  if (!confirmed) return;
  try {
    await deleteImportedBookBlob(bookId);
  } catch (error) {
    console.warn('刪除 imported EPUB blob 失敗', error);
  }
  const nextBooks = importedLibrary.books.filter(item => item.id !== bookId);
  saveImportedLibraryBooks(nextBooks);
  await refreshImportedLibraryCoverUrls();
  if (cloudLibrary.readerBook?.id === bookId) cloudLibrary.readerBook = null;
  if (cloudLibrary.selectedBookId === bookId) cloudLibrary.selectedBookId = '';
  renderLibrary();
  showToast('外部 EPUB 已從本機書櫃移除。');
}

async function openLibraryBook(bookId) {
  requireCloudLibrary();
  const book = getLibraryBook(bookId);
  if (!book) throw new Error('找不到這本書。');
  const chapters = await loadLibraryBookChapters(book.id);
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

async function fetchPublicAssetBlob(assetPath, errorPrefix = '下載檔案失敗') {
  const response = await fetch(assetPath, { cache: 'force-cache' });
  if (!response.ok) throw new Error(`${errorPrefix}：HTTP ${response.status}`);
  return response.blob();
}

async function loadSystemLibraryEpub(book) {
  const cached = await getCachedEpub(book.id);
  if (cached) return cached;
  if (!book.epub_file_path) throw new Error('這本系統書籍沒有 EPUB 路徑。');
  const blob = await fetchPublicAssetBlob(book.epub_file_path, '下載 EPUB 失敗');
  await cacheEpubBlob(book.id, blob);
  return blob;
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

async function downloadLibraryBookEpub(bookId) {
  requireCloudLibrary();
  const book = getLibraryBook(bookId);
  if (!book) throw new Error('找不到這本書。');
  if (!book.epub_file_path) throw new Error('這本書沒有 EPUB 儲存路徑，請重新匯出後再下載。');
  const data = await downloadCloudEpubBlob(book, { prompt: true });
  const safeTitle = String(book.title || 'book').replace(/[\\/:*?"<>|]+/g, '').trim() || 'book';
  downloadBlob(`${safeTitle}.epub`, data);
  showToast('EPUB 已下載。');
}

async function downloadSystemLibraryBookEpub(bookId) {
  const book = getSystemLibraryBook(bookId);
  if (!book) throw new Error('找不到這本系統預設書籍。');
  const epubBlob = await loadSystemLibraryEpub(book);
  const safeTitle = String(book.title || 'book').replace(/[\\/:*?"<>|]+/g, '').trim() || 'book';
  downloadBlob(`${safeTitle}.epub`, epubBlob);
  showToast('EPUB 已下載。');
}

async function downloadImportedLibraryBookEpub(bookId) {
  const book = getImportedBook(bookId);
  if (!book) throw new Error('找不到這本外部 EPUB。');
  const stored = await getImportedBookBlob(bookId);
  if (!stored?.epubBlob) throw new Error('找不到這本 EPUB 的本機檔案，請重新匯入。');
  const safeTitle = String(book.title || book.fileName || 'book').replace(/[\\/:*?"<>|]+/g, '').trim() || 'book';
  downloadBlob(`${safeTitle}.epub`, stored.epubBlob);
  showToast('EPUB 已下載。');
}

async function confirmCloudEpubDownload(book) {
  const bookId = book?.id || '';
  const confirmed = await openConfirmDialog({
    title: '從雲端下載 EPUB？',
    message: '此書需要從雲端下載 EPUB 檔案，可能增加流量。是否繼續？',
    confirmText: '繼續下載',
    danger: false,
  });
  if (!confirmed) egressGuardWarn('cloudEpubDownload:cancelled', { bookId });
  return confirmed;
}

async function downloadCloudEpubBlob(book, { prompt = true } = {}) {
  requireCloudLibrary();
  if (!book?.id) throw new Error('找不到這本書。');
  const cached = await getCachedEpub(book.id);
  if (cached) {
    egressGuardInfo('cloudEpubDownload:cache-hit', { bookId: book.id });
    return cached;
  }
  const existing = state.epubDownloadPromises.get(book.id);
  if (existing) {
    egressGuardInfo('cloudEpubDownload:reuse-in-flight', { bookId: book.id });
    return existing;
  }
  const downloadTask = (async () => {
    if (prompt && !(await confirmCloudEpubDownload(book))) {
      throw new Error('已取消雲端 EPUB 下載。');
    }
    if (!book.epub_file_path) throw new Error('這本書沒有 EPUB 儲存路徑，請重新匯出。');
    const { data, error } = await state.supabase.storage.from(cloudLibrary.bucket).download(book.epub_file_path);
    if (error) throw new Error(buildStorageError(error, '下載 EPUB 失敗'));
    await cacheEpubBlob(book.id, data);
    return data;
  })().finally(() => {
    state.epubDownloadPromises.delete(book.id);
  });
  state.epubDownloadPromises.set(book.id, downloadTask);
  return downloadTask;
}

async function loadEpubForReading(book) {
  return downloadCloudEpubBlob(book, { prompt: true });
}

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

function injectReaderViewStyles() {
  if (document.getElementById('reader-view-runtime-styles')) return;
  const style = document.createElement('style');
  style.id = 'reader-view-runtime-styles';
  style.textContent = `
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
    #view-reader .reader-app-shell { --reader-stage-top: 0px; --reader-stage-bottom: 0px; position: relative; min-height: 100dvh; height: 100dvh; overflow: hidden; background: #f8f5ef; color: #2f2a24; }
    #view-reader.reader-dark .reader-app-shell { background: #171717; color: #eee7dd; }
    #view-reader .reader-hidden-controls { display: none !important; }
    #view-reader .reader-book-heading h2 { margin: 0; font-size: 1rem; line-height: 1.2; }
    #view-reader .reader-book-heading p { margin: 2px 0 0; }
    #view-reader .reader-stage { position: absolute; top: var(--reader-stage-top); right: 0; bottom: var(--reader-stage-bottom); left: 0; z-index: 1; display: flex; align-items: stretch; justify-content: center; padding: clamp(10px, 2.5vw, 28px) clamp(12px, 4vw, 42px); overflow: hidden; }
    #view-reader .reader-page-viewport { flex: 0 1 min(1120px, 100%); width: min(1120px, 100%); height: 100%; overflow: hidden; contain: layout paint size; isolation: isolate; border-radius: 10px; background: #fffdf8; box-shadow: 0 18px 48px rgba(45,35,25,.14); }
    #view-reader.reader-dark .reader-page-viewport { background: #202020; box-shadow: 0 18px 48px rgba(0,0,0,.28); }
    #view-reader .reader-page-clip { width: 100%; height: 100%; overflow: hidden; contain: layout paint size; clip-path: inset(0); }
    #view-reader.reader-spread-mode .reader-page-clip { background: linear-gradient(90deg, transparent calc(50% - 18px), rgba(80,70,55,.08) 50%, transparent calc(50% + 18px)); }
    #view-reader.reader-dark.reader-spread-mode .reader-page-clip { background: linear-gradient(90deg, transparent calc(50% - 18px), rgba(255,255,255,.08) 50%, transparent calc(50% + 18px)); }
    #view-reader .reader-flow { height: 100%; box-sizing: border-box; display: block; max-width: none; padding: clamp(48px, 8vh, 88px) clamp(36px, 7vw, 86px) clamp(40px, 7vh, 76px); overflow: visible; column-fill: auto; transition: transform .18s ease; will-change: transform; overflow-wrap: anywhere; word-break: break-word; }
    #view-reader.reader-spread-mode .reader-flow { padding: 0; display: block; overflow: hidden; transition: none; }
    #view-reader .reader-spread { width: 100%; height: 100%; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--reader-spread-gap, 44px); }
    #view-reader .reader-page-surface { height: 100%; min-width: 0; box-sizing: border-box; overflow: hidden; padding: var(--reader-page-padding-top, 64px) var(--reader-page-padding-x, 56px) var(--reader-page-padding-bottom, 54px); background: transparent; }
    #view-reader .reader-page-surface.is-empty { opacity: .35; }
    #view-reader .reader-column-page { width: 100%; height: var(--reader-page-body-height, 1px); overflow: hidden; }
    #view-reader .reader-column-flow { width: var(--reader-page-body-width, 1px); height: var(--reader-page-body-height, 1px); column-width: var(--reader-page-body-width, 1px); column-gap: 0; column-fill: auto; overflow: visible; transition: transform .18s ease; will-change: transform; }
    #view-reader .reader-column-flow > * { max-width: var(--reader-page-body-width, 100%); }
      #view-reader .reader-flow * { box-sizing: border-box; max-width: 100%; }
      #view-reader .reader-flow img, #view-reader .reader-flow svg, #view-reader .reader-flow video, #view-reader .reader-flow table { max-width: 100%; height: auto; }
      #view-reader .reader-flow pre, #view-reader .reader-flow code { white-space: pre-wrap; overflow-wrap: anywhere; }
      #view-reader .reader-flow h1 { margin: 0; font-size: 1.72em; line-height: 1.34; letter-spacing: .01em; color: #21484c; }
      #view-reader .reader-flow h2 { margin: 1.9em 0 .72em; font-size: 1.14em; line-height: 1.48; letter-spacing: .01em; color: #21484c; }
      #view-reader .reader-flow p { margin: 0 0 1.12em; line-height: 1.9; }
      #view-reader .reader-flow hr { width: 36%; margin: 1.95em auto 1.85em; border: 0; border-top: 1px solid rgba(155,122,72,.34); }
      #view-reader .reader-flow ul { margin: 0 0 1.38em; padding-left: 1.5em; }
      #view-reader .reader-flow li { margin: .42em 0; line-height: 1.86; padding-left: .12em; }
      #view-reader .reader-flow strong { font-weight: 700; color: inherit; }
      #view-reader .reader-flow .text-red, #view-reader .reader-flow .text-red strong { color: #8a3b3b !important; }
      #view-reader .reader-flow .text-blue, #view-reader .reader-flow .text-blue strong { color: #355d8d !important; }
      #view-reader .reader-flow .text-gold, #view-reader .reader-flow .text-gold strong { color: #8a6a1f !important; }
      #view-reader .reader-flow .text-purple, #view-reader .reader-flow .text-purple strong { color: #6a4a82 !important; }
      #view-reader .reader-flow .chapter-head { margin: 0 0 2.05em; padding: 1.02em 0 1.2em; border-bottom: 1px solid rgba(166,143,115,.18); text-align: left; }
      #view-reader .reader-flow .chapter-kicker { margin: 0 0 .8em; color: #6f5b47; font-size: 1.42em; line-height: 1.36; font-weight: 700; letter-spacing: .11em; text-align: center; }
      #view-reader .reader-flow .chapter-head h1 { margin: 0; font-size: 1.28em; line-height: 1.54; letter-spacing: .01em; text-align: left; }
      #view-reader .reader-flow .chapter-head .scripture { margin: .92em 0 0; }
      #view-reader .reader-flow .scripture { color: #736453; font-size: .95em; line-height: 1.78; letter-spacing: .04em; font-style: italic; }
      #view-reader .reader-flow blockquote { margin: 1.32em 0 1.52em; padding: 1.02em 1.12em 1.02em 1.22em; border-left: 4px solid rgba(155,122,72,.4); border-radius: 0 18px 18px 0; background: linear-gradient(180deg, rgba(247,242,234,.92), rgba(243,236,226,.68)); color: inherit; line-height: 1.9; }
      #view-reader .reader-flow .chapter-summary { margin: 1.18em 0 1.8em; padding: 1.12em 1.15em 1.05em; border-radius: 18px; border: 1px solid rgba(160,142,112,.22); background: linear-gradient(180deg, rgba(248,244,237,.96), rgba(243,236,226,.82)); box-shadow: 0 10px 24px rgba(94,76,54,.06); }
      #view-reader .reader-flow .chapter-summary .kicker { display: block; margin-bottom: .45em; color: #7a6753; font-size: .82em; font-weight: 700; letter-spacing: .06em; }
      #view-reader .reader-flow .chapter-summary p { margin: 0; line-height: 1.84; color: #4d4339; }
      #view-reader .reader-flow .markdown-spacer { height: 1rem; }
      #view-reader .reader-flow .markdown-spacer-2 { height: 1.8rem; }
      #view-reader .reader-turn-zone { position: absolute; top: 0; bottom: 0; width: 34%; border: 0; background: transparent; cursor: pointer; }
    #view-reader .reader-turn-zone:disabled, #view-reader .reader-footer button:disabled { cursor: default; opacity: .35; }
    #view-reader .reader-turn-left { left: 0; }
    #view-reader .reader-turn-right { right: 0; }
    #view-reader .reader-footer { position: absolute; left: 0; right: 0; bottom: 0; z-index: 4; display: grid; grid-template-columns: auto minmax(180px, 520px) auto; align-items: center; gap: 14px; padding: 12px clamp(12px, 3vw, 28px); border-top: 1px solid rgba(80,70,55,.18); background: rgba(255,255,255,.7); transition: opacity .2s ease, transform .2s ease; }
    #view-reader.reader-dark .reader-footer { background: rgba(25,25,25,.78); border-color: rgba(255,255,255,.12); }
    #view-reader.reader-controls-hidden .reader-footer { display: grid; opacity: .92; transform: none; pointer-events: auto; padding-block: 8px; }
    #view-reader .reader-progress { display: grid; grid-template-columns: auto auto; gap: 6px 12px; align-items: center; font-size: .9rem; }
    #view-reader .reader-progress div { grid-column: 1 / -1; height: 4px; border-radius: 999px; overflow: hidden; background: rgba(120,100,70,.22); }
    #view-reader .reader-progress i { display: block; height: 100%; width: 0; background: #9b7a48; }
    #view-reader .reader-close-button { position: absolute; top: 14px; right: clamp(12px, 3vw, 28px); z-index: 8; min-height: 38px; padding: 0 14px; border: 1px solid rgba(80,70,55,.16); border-radius: 999px; background: rgba(255,255,255,.82); color: #26494c; font-weight: 700; box-shadow: 0 10px 28px rgba(45,35,25,.12); backdrop-filter: blur(12px); transition: opacity .18s ease, transform .18s ease; }
    #view-reader.reader-dark .reader-close-button { border-color: rgba(255,255,255,.14); background: rgba(30,30,30,.82); color: #eee7dd; }
    #view-reader .reader-action-button { position: absolute; right: clamp(16px, 3vw, 36px); bottom: calc(var(--reader-stage-bottom) + clamp(18px, 3vh, 28px)); z-index: 6; min-height: 46px; padding: 0 18px; border: 0; border-radius: 999px; background: #3f9890; color: #fff; font-weight: 800; box-shadow: 0 12px 28px rgba(42,112,106,.26); transition: opacity .18s ease, transform .18s ease; }
    #view-reader.reader-controls-hidden .reader-close-button,
    #view-reader.reader-controls-hidden .reader-action-button,
    #view-reader.reader-panel-open .reader-close-button,
    #view-reader.reader-panel-open .reader-action-button { opacity: 0; pointer-events: none; transform: translateY(8px); }
    #view-reader .reader-panel-root { position: absolute; inset: 0; z-index: 7; pointer-events: none; }
    #view-reader .reader-panel-backdrop { position: absolute; inset: 0; border: 0; background: rgba(38,32,26,.18); pointer-events: auto; }
    #view-reader.reader-dark .reader-panel-backdrop { background: rgba(0,0,0,.42); }
    #view-reader .reader-action-menu { position: absolute; right: clamp(16px, 3vw, 36px); bottom: calc(var(--reader-stage-bottom) + 76px); z-index: 8; width: min(240px, calc(100vw - 28px)); padding: 8px; border: 1px solid rgba(80,70,55,.14); border-radius: 16px; background: rgba(255,253,248,.96); box-shadow: 0 18px 44px rgba(45,35,25,.2); pointer-events: auto; backdrop-filter: blur(14px); }
    #view-reader.reader-dark .reader-action-menu { border-color: rgba(255,255,255,.12); background: rgba(31,31,31,.96); box-shadow: 0 18px 44px rgba(0,0,0,.36); }
    #view-reader .reader-action-menu-item { width: 100%; min-height: 42px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 12px; border: 0; border-radius: 10px; background: transparent; color: inherit; font-weight: 700; text-align: left; }
    #view-reader .reader-action-menu-item:hover, #view-reader .reader-action-menu-item:focus-visible { background: rgba(63,152,144,.13); outline: none; }
    #view-reader .reader-panel { position: absolute; top: 24px; right: clamp(16px, 4vw, 48px); bottom: calc(var(--reader-stage-bottom) + 20px); z-index: 8; width: min(430px, calc(100vw - 32px)); max-height: calc(100dvh - var(--reader-stage-bottom) - 44px); display: flex; flex-direction: column; overflow: hidden; overscroll-behavior: contain; border: 1px solid rgba(80,70,55,.14); border-radius: 18px; background: rgba(255,253,248,.98); color: #2f2a24; box-shadow: 0 24px 60px rgba(45,35,25,.24); pointer-events: auto; backdrop-filter: blur(18px); }
    #view-reader.reader-dark .reader-panel { border-color: rgba(255,255,255,.12); background: rgba(28,28,28,.98); color: #eee7dd; box-shadow: 0 24px 60px rgba(0,0,0,.4); }
    #view-reader .reader-panel-header { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 16px 18px; border-bottom: 1px solid rgba(80,70,55,.12); }
    #view-reader.reader-dark .reader-panel-header { border-color: rgba(255,255,255,.12); }
    #view-reader .reader-panel-title { margin: 0; font-size: 1rem; line-height: 1.35; color: inherit; }
    #view-reader .reader-panel-close { min-width: 36px; min-height: 36px; border: 0; border-radius: 999px; background: rgba(63,152,144,.12); color: inherit; font-weight: 800; }
    #view-reader .reader-panel-body { min-height: 0; flex: 1; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; touch-action: pan-y; padding: 16px 18px 20px; }
    #view-reader .reader-panel-book-title { margin: 0 0 4px; color: #21484c; font-weight: 800; }
    #view-reader.reader-dark .reader-panel-book-title { color: #dcefeb; }
    #view-reader .reader-panel-muted { margin: 0 0 14px; color: #74675d; font-size: .9rem; line-height: 1.55; }
    #view-reader.reader-dark .reader-panel-muted { color: #b8aea4; }
    #view-reader .reader-panel-toc { display: grid; gap: 6px; min-height: 0; padding-bottom: 10px; overscroll-behavior: contain; }
    #view-reader .reader-panel-toc-item { width: 100%; min-height: 42px; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 0 12px; border: 1px solid transparent; border-radius: 10px; background: transparent; color: inherit; text-align: left; }
    #view-reader .reader-panel-toc-item.active { border-color: rgba(63,152,144,.35); background: rgba(63,152,144,.13); color: #21484c; font-weight: 800; }
    #view-reader.reader-dark .reader-panel-toc-item.active { color: #dcefeb; }
    #view-reader .reader-panel-toc-item small { color: #7a6d62; font-size: .78rem; white-space: nowrap; }
    #view-reader.reader-dark .reader-panel-toc-item small { color: #aaa099; }
    #view-reader .reader-search-field, #view-reader .reader-settings-sheet select, #view-reader .reader-settings-sheet input { width: 100%; }
    #view-reader .reader-search-field { min-height: 44px; padding: 0 12px; border: 1px solid rgba(80,70,55,.2); border-radius: 10px; background: #fff; color: #2f2a24; }
    #view-reader.reader-dark .reader-search-field { border-color: rgba(255,255,255,.16); background: #242424; color: #eee7dd; }
    #view-reader .reader-search-status { margin: 10px 0 12px; color: #74675d; font-size: .88rem; line-height: 1.55; }
    #view-reader.reader-dark .reader-search-status { color: #b8aea4; }
    #view-reader .reader-search-results { display: grid; gap: 8px; margin-top: 12px; padding-bottom: 8px; }
    #view-reader .reader-search-result { width: 100%; display: grid; gap: 5px; padding: 11px 12px; border: 1px solid rgba(80,70,55,.14); border-radius: 12px; background: rgba(255,255,255,.5); color: inherit; text-align: left; }
    #view-reader.reader-dark .reader-search-result { border-color: rgba(255,255,255,.12); background: rgba(255,255,255,.06); }
    #view-reader .reader-search-result strong { color: #21484c; font-size: .94rem; line-height: 1.4; }
    #view-reader.reader-dark .reader-search-result strong { color: #dcefeb; }
    #view-reader .reader-search-result span { color: #4b4037; font-size: .88rem; line-height: 1.55; }
    #view-reader.reader-dark .reader-search-result span { color: #d7cec4; }
    #view-reader .reader-search-result small { color: #7a6d62; font-size: .78rem; line-height: 1.45; }
    #view-reader.reader-dark .reader-search-result small { color: #aaa099; }
    #view-reader .reader-settings-sheet { display: grid; gap: 16px; }
    #view-reader .reader-settings-sheet label { display: grid; gap: 8px; color: inherit; font-size: .9rem; font-weight: 700; }
    #view-reader .reader-setting-levels { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px; }
    #view-reader .reader-setting-level-button { min-height: 40px; border: 1px solid rgba(80,70,55,.16); border-radius: 10px; background: rgba(255,255,255,.72); color: inherit; font-weight: 800; }
    #view-reader .reader-setting-level-button.active { border-color: rgba(63,152,144,.62); background: #3f9890; color: #fff; box-shadow: 0 8px 18px rgba(63,152,144,.18); }
    #view-reader.reader-dark .reader-setting-level-button { border-color: rgba(255,255,255,.14); background: rgba(255,255,255,.08); }
    #view-reader.reader-dark .reader-setting-level-button.active { border-color: rgba(220,239,235,.6); background: #3f9890; color: #fff; }
    #view-reader .reader-panel-section { display: grid; gap: 10px; margin-bottom: 18px; }
    #view-reader .reader-panel-section + .reader-panel-section { padding-top: 16px; border-top: 1px solid rgba(80,70,55,.12); }
    #view-reader.reader-dark .reader-panel-section + .reader-panel-section { border-color: rgba(255,255,255,.12); }
    #view-reader .reader-panel-section-title { margin: 0; color: #21484c; font-size: .96rem; line-height: 1.35; font-weight: 800; }
    #view-reader.reader-dark .reader-panel-section-title { color: #dcefeb; }
    #view-reader .reader-bookmark-summary { display: grid; gap: 8px; padding: 14px; border-radius: 12px; background: rgba(63,152,144,.1); color: inherit; }
    #view-reader .reader-bookmark-summary strong { color: #21484c; }
    #view-reader.reader-dark .reader-bookmark-summary strong { color: #dcefeb; }
    #view-reader .reader-bookmark-actions { display: flex; flex-wrap: wrap; gap: 10px; margin: 14px 0 16px; }
    #view-reader .reader-bookmark-action { min-height: 40px; padding: 0 14px; border: 0; border-radius: 999px; background: #3f9890; color: #fff; font-weight: 800; }
    #view-reader .reader-bookmark-action.is-remove { background: rgba(138,59,59,.12); color: #8a3b3b; }
    #view-reader.reader-dark .reader-bookmark-action.is-remove { background: rgba(255,130,130,.14); color: #ffd1d1; }
    #view-reader .reader-bookmark-list { display: grid; gap: 8px; margin-top: 12px; }
    #view-reader .reader-bookmark-item { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; align-items: center; padding: 10px; border: 1px solid rgba(80,70,55,.14); border-radius: 12px; background: rgba(255,255,255,.48); }
    #view-reader.reader-dark .reader-bookmark-item { border-color: rgba(255,255,255,.12); background: rgba(255,255,255,.06); }
    #view-reader .reader-bookmark-jump { min-width: 0; border: 0; background: transparent; color: inherit; text-align: left; font-weight: 800; }
    #view-reader .reader-bookmark-jump small { display: block; margin-top: 4px; color: #7a6d62; font-weight: 600; line-height: 1.45; }
    #view-reader.reader-dark .reader-bookmark-jump small { color: #aaa099; }
    #view-reader .reader-bookmark-remove { min-width: 34px; min-height: 34px; border: 0; border-radius: 999px; background: rgba(80,70,55,.08); color: inherit; font-weight: 800; }
    @media (max-width: 1023px) {
      body.reader-active #view-reader.reader-view.active { inset: 0; }
      #view-reader .reader-stage { padding: 0; }
      #view-reader .reader-page-viewport { flex-basis: 100vw; width: 100vw; height: 100%; min-height: 0; border-radius: 0; box-shadow: none; }
      #view-reader .reader-flow { padding: clamp(34px, 7vh, 58px) clamp(24px, 8vw, 40px) clamp(30px, 6vh, 50px); }
      #view-reader .reader-flow h1 { font-size: 1.54em; }
      #view-reader .reader-flow h2 { font-size: 1.08em; margin-top: 1.72em; }
      #view-reader .reader-flow p { margin-bottom: 1em; line-height: 1.82; }
      #view-reader .reader-flow hr { width: 46%; margin: 1.7em auto; }
      #view-reader .reader-flow .chapter-head { margin-bottom: 1.75em; padding: .92em 0 1.05em; }
      #view-reader .reader-flow .chapter-kicker { font-size: 1.24em; letter-spacing: .09em; margin-bottom: .66em; }
      #view-reader .reader-flow .chapter-head h1 { font-size: 1.16em; line-height: 1.5; }
      #view-reader .reader-flow .chapter-summary { margin-bottom: 1.55em; padding: 1em 1em .96em; }
      #view-reader .reader-footer { grid-template-columns: auto minmax(0, 1fr) auto; gap: 8px; padding-inline: 8px; }
      #view-reader .reader-footer > button { min-width: 0; padding-inline: 10px; }
      #view-reader .reader-action-button { right: 14px; bottom: calc(var(--reader-stage-bottom) + 14px); min-height: 42px; padding-inline: 14px; }
      #view-reader .reader-close-button { top: 10px; right: 10px; min-height: 34px; padding-inline: 12px; font-size: .82rem; }
      #view-reader .reader-action-menu { right: 8px; bottom: calc(var(--reader-stage-bottom) + 62px); }
      #view-reader .reader-panel { top: auto; right: 10px; bottom: calc(var(--reader-stage-bottom) + 10px); left: 10px; width: auto; height: min(78dvh, calc(100dvh - var(--reader-stage-bottom) - 20px)); max-height: min(78dvh, calc(100dvh - var(--reader-stage-bottom) - 20px)); border-radius: 18px 18px 12px 12px; }
      #view-reader .reader-book-heading h2 { font-size: .95rem; }
      #view-reader .reader-turn-zone { width: 28%; }
    }
  `;
  document.head.appendChild(style);
}

const READER_PANEL_TYPES = new Set(['menu', 'toc', 'search', 'settings', 'bookmarks']);
const READER_FONT_SIZE_LEVELS = [16, 17, 18, 20, 22, 24];
const READER_LINE_HEIGHT_LEVELS = [1.55, 1.65, 1.75, 1.85, 1.95, 2.05];
const READER_SEARCH_MIN_LENGTH = 1;
const READER_SEARCH_DEBOUNCE_MS = 320;
const READER_SEARCH_RESULT_LIMIT = 50;

function isReaderPanel(panel) {
  return READER_PANEL_TYPES.has(panel);
}

function openReaderPanel(panel) {
  if (!isReaderPanel(panel)) return;
  cloudLibrary.readerActivePanel = panel;
  renderReaderPanels();
  if (panel === 'search') focusReaderSearchField();
}

function closeReaderPanel() {
  cloudLibrary.readerActivePanel = null;
  renderReaderPanels();
}

function toggleReaderPanel(panel) {
  if (cloudLibrary.readerActivePanel === panel) closeReaderPanel();
  else openReaderPanel(panel);
}

function getReaderCurrentChapterTitle() {
  const chapter = cloudLibrary.readerChapters[cloudLibrary.readerChapterIndex];
  return chapter?.title || `第 ${cloudLibrary.readerChapterIndex + 1} 章`;
}

function getReaderCurrentPageLabel() {
  return document.getElementById('reader-page-text')?.textContent || `第 ${cloudLibrary.readerPageIndex + 1} 頁`;
}

function getReaderBookKey(book = cloudLibrary.readerBook) {
  if (!book) return '';
  if (book.id === 'system-bible' || book.source === 'system') return 'system-bible';
  if (book.source === 'imported_epub') return `imported:${book.id}`;
  return `cloud:${book.id}`;
}

function getReaderBookSource(book = cloudLibrary.readerBook) {
  if (!book) return 'generated';
  if (book.id === 'system-bible' || book.source === 'system') return 'system';
  if (book.source === 'imported_epub') return 'imported_epub';
  return book.source || 'generated';
}

function loadReaderProgressMap() {
  const data = loadJson(cloudLibrary.readerProgressKey, {});
  return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
}

function saveReaderProgressMap(map) {
  saveJson(cloudLibrary.readerProgressKey, map && typeof map === 'object' ? map : {});
}

function getReaderProgress(bookKey) {
  const key = bookKey || getReaderBookKey();
  if (!key) return null;
  const progress = loadReaderProgressMap()[key];
  return progress && typeof progress === 'object' ? progress : null;
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

function getCurrentReaderBookmark() {
  const bookKey = getReaderBookKey();
  if (!bookKey) return null;
  const chapterIndex = Math.trunc(Number(cloudLibrary.readerChapterIndex) || 0);
  const pageIndex = normalizeReaderPageIndex(cloudLibrary.readerPageIndex);
  return loadReaderBookmarks().find(bookmark =>
    bookmark.bookKey === bookKey
    && Number(bookmark.chapterIndex) === chapterIndex
    && Number(bookmark.pageIndex) === pageIndex
  ) || null;
}

function isCurrentReaderPositionBookmarked() {
  return !!getCurrentReaderBookmark();
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

function addCurrentReaderBookmark() {
  const bookmark = buildCurrentReaderBookmark();
  if (!bookmark) return null;
  const bookmarks = loadReaderBookmarks();
  const exists = bookmarks.some(item =>
    item.bookKey === bookmark.bookKey
    && Number(item.chapterIndex) === bookmark.chapterIndex
    && Number(item.pageIndex) === bookmark.pageIndex
  );
  if (!exists) bookmarks.push(bookmark);
  saveReaderBookmarks(bookmarks);
  renderReaderPanels();
  return bookmark;
}

async function removeCurrentReaderBookmark() {
  const current = getCurrentReaderBookmark();
  if (!current) return;
  const confirmed = await openConfirmDialog({
    title: '確定要移除這個書籤嗎？',
    message: '移除後需要重新加入才能再次快速跳轉。',
    confirmText: '確認移除',
    danger: true,
  });
  if (!confirmed) return;
  saveReaderBookmarks(loadReaderBookmarks().filter(bookmark => bookmark.id !== current.id));
  renderReaderPanels();
}

async function removeReaderBookmark(bookmarkId) {
  const confirmed = await openConfirmDialog({
    title: '確定要移除這個書籤嗎？',
    message: '移除後需要重新加入才能再次快速跳轉。',
    confirmText: '確認移除',
    danger: true,
  });
  if (!confirmed) return;
  saveReaderBookmarks(loadReaderBookmarks().filter(bookmark => bookmark.id !== bookmarkId));
  renderReaderPanels();
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

function resetReaderSearchState() {
  clearTimeout(cloudLibrary.readerSearchTimer);
  cloudLibrary.readerSearchQuery = '';
  cloudLibrary.readerSearchStatus = 'idle';
  cloudLibrary.readerSearchResults = [];
  cloudLibrary.readerSearchCache = [];
  cloudLibrary.readerSearchCacheKey = '';
  cloudLibrary.readerSearchTimer = null;
  cloudLibrary.readerSearchRunId += 1;
  cloudLibrary.readerSearchTruncated = false;
  cloudLibrary.readerSearchComposing = false;
}

function getReaderSearchCacheKey() {
  const bookKey = getReaderBookKey();
  const chapters = cloudLibrary.readerChapters || [];
  const first = chapters[0]?.id || chapters[0]?.href || chapters[0]?.title || '';
  const lastChapter = chapters[chapters.length - 1] || {};
  const last = lastChapter.id || lastChapter.href || lastChapter.title || '';
  return [bookKey, chapters.length, first, last].join('|');
}

function readerHtmlToPlainText(html = '') {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(`<main>${html}</main>`, 'text/html');
  return (doc.body?.textContent || '').replace(/\s+/g, ' ').trim();
}

function normalizeReaderSearchText(text = '') {
  return String(text || '').replace(/\s+/g, ' ').trim().toLocaleLowerCase();
}

function waitForReaderSearchYield() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

async function buildReaderSearchCache(runId) {
  const cacheKey = getReaderSearchCacheKey();
  if (cloudLibrary.readerSearchCacheKey === cacheKey && Array.isArray(cloudLibrary.readerSearchCache)) {
    return cloudLibrary.readerSearchCache;
  }
  const chapters = cloudLibrary.readerChapters || [];
  const cache = [];
  for (let index = 0; index < chapters.length; index += 1) {
    if (runId !== cloudLibrary.readerSearchRunId) return [];
    const chapter = chapters[index] || {};
    const title = String(chapter.title || `第 ${index + 1} 章`);
    const text = readerHtmlToPlainText(chapter.html || '');
    cache.push({
      chapterIndex: index,
      chapterTitle: title,
      text,
      searchText: normalizeReaderSearchText(`${title} ${text}`),
    });
    if (index > 0 && index % 25 === 0) await waitForReaderSearchYield();
  }
  if (runId === cloudLibrary.readerSearchRunId) {
    cloudLibrary.readerSearchCacheKey = cacheKey;
    cloudLibrary.readerSearchCache = cache;
  }
  return cache;
}

function buildReaderSearchSnippet(item, query) {
  const title = String(item?.chapterTitle || '');
  const text = String(item?.text || '');
  const needle = normalizeReaderSearchText(query);
  const titleMatch = normalizeReaderSearchText(title).includes(needle);
  if (titleMatch) return title;
  const lowerText = text.toLocaleLowerCase();
  const index = lowerText.indexOf(needle);
  if (index < 0) return text.slice(0, 90);
  const start = Math.max(0, index - 42);
  const end = Math.min(text.length, index + String(query).length + 54);
  return `${start > 0 ? '...' : ''}${text.slice(start, end)}${end < text.length ? '...' : ''}`;
}

async function runReaderSearch(query, runId) {
  const normalizedQuery = String(query || '').trim();
  if (normalizedQuery.length < READER_SEARCH_MIN_LENGTH) return;
  try {
    const cache = await buildReaderSearchCache(runId);
    if (runId !== cloudLibrary.readerSearchRunId) return;
    const needle = normalizeReaderSearchText(normalizedQuery);
    const results = [];
    let truncated = false;
    for (let index = 0; index < cache.length; index += 1) {
      if (runId !== cloudLibrary.readerSearchRunId) return;
      const item = cache[index];
      if (item.searchText.includes(needle)) {
        results.push({
          chapterIndex: item.chapterIndex,
          chapterTitle: item.chapterTitle,
          snippet: buildReaderSearchSnippet(item, normalizedQuery),
        });
        if (results.length >= READER_SEARCH_RESULT_LIMIT) {
          truncated = index < cache.length - 1;
          break;
        }
      }
      if (index > 0 && index % 80 === 0) await waitForReaderSearchYield();
    }
    if (runId !== cloudLibrary.readerSearchRunId) return;
    cloudLibrary.readerSearchResults = results;
    cloudLibrary.readerSearchStatus = results.length ? 'done' : 'empty';
    cloudLibrary.readerSearchTruncated = truncated;
  } catch (error) {
    console.error('reader search failed', error);
    if (runId !== cloudLibrary.readerSearchRunId) return;
    cloudLibrary.readerSearchResults = [];
    cloudLibrary.readerSearchStatus = 'error';
    cloudLibrary.readerSearchTruncated = false;
  }
  updateReaderSearchPanelContent();
}

function focusReaderSearchField() {
  requestAnimationFrame(() => {
    const input = document.getElementById('reader-search-field');
    if (!input) return;
    input.focus({ preventScroll: true });
    const length = input.value.length;
    try { input.setSelectionRange(length, length); } catch (error) { /* ignore unsupported inputs */ }
  });
}

function getReaderSearchStatusText() {
  const query = cloudLibrary.readerSearchQuery || '';
  const status = cloudLibrary.readerSearchStatus || 'idle';
  const results = Array.isArray(cloudLibrary.readerSearchResults) ? cloudLibrary.readerSearchResults : [];
  return !query
    ? '輸入關鍵字搜尋本書內容。'
    : query.length < READER_SEARCH_MIN_LENGTH
      ? `請再輸入 ${READER_SEARCH_MIN_LENGTH - query.length} 個字後開始搜尋。`
      : status === 'searching'
        ? '搜尋中...'
        : status === 'empty'
          ? '沒有找到符合的章節。'
          : status === 'error'
            ? '搜尋時發生問題，請稍後再試。'
            : `找到 ${results.length}${cloudLibrary.readerSearchTruncated ? '+' : ''} 筆結果。`;
}

function renderReaderSearchResultItems() {
  const results = Array.isArray(cloudLibrary.readerSearchResults) ? cloudLibrary.readerSearchResults : [];
  return results.map(result => `
    <button class="reader-search-result" type="button" data-reader-search-chapter-index="${Number(result.chapterIndex) || 0}">
      <strong>${escapeHtml(String(result.chapterTitle || `第 ${(Number(result.chapterIndex) || 0) + 1} 章`))}</strong>
      <span>${escapeHtml(String(result.snippet || ''))}</span>
      <small>點擊結果會前往該章節。</small>
    </button>
  `).join('');
}

function updateReaderSearchPanelContent() {
  if (cloudLibrary.readerActivePanel !== 'search') return;
  const status = document.getElementById('reader-search-status');
  const results = document.getElementById('reader-search-results');
  if (status) status.textContent = getReaderSearchStatusText();
  if (results) results.innerHTML = renderReaderSearchResultItems();
}

function scheduleReaderSearch(value) {
  const query = String(value || '').trim();
  clearTimeout(cloudLibrary.readerSearchTimer);
  cloudLibrary.readerSearchQuery = query;
  cloudLibrary.readerSearchResults = [];
  cloudLibrary.readerSearchTruncated = false;
  cloudLibrary.readerSearchRunId += 1;
  const runId = cloudLibrary.readerSearchRunId;
  if (!query) {
    cloudLibrary.readerSearchStatus = 'idle';
    updateReaderSearchPanelContent();
    return;
  }
  if (query.length < READER_SEARCH_MIN_LENGTH) {
    cloudLibrary.readerSearchStatus = 'too-short';
    updateReaderSearchPanelContent();
    return;
  }
  cloudLibrary.readerSearchStatus = 'searching';
  updateReaderSearchPanelContent();
  cloudLibrary.readerSearchTimer = setTimeout(() => {
    runReaderSearch(query, runId).catch(handleError);
  }, READER_SEARCH_DEBOUNCE_MS);
}

function beginReaderSearchComposition(value) {
  cloudLibrary.readerSearchComposing = true;
  cloudLibrary.readerSearchQuery = String(value || '');
  clearTimeout(cloudLibrary.readerSearchTimer);
  cloudLibrary.readerSearchRunId += 1;
}

function endReaderSearchComposition(value) {
  cloudLibrary.readerSearchComposing = false;
  scheduleReaderSearch(value);
}

async function jumpToReaderSearchResult(chapterIndex) {
  const index = Math.trunc(Number(chapterIndex));
  if (!Number.isFinite(index) || index < 0 || index >= cloudLibrary.readerChapters.length) return;
  const chapter = cloudLibrary.readerChapters[index];
  if (!chapter) return;
  cloudLibrary.readerChapterIndex = index;
  cloudLibrary.readerPageIndex = 0;
  const chapterNav = document.getElementById('reader-chapter-nav');
  if (chapterNav) chapterNav.value = String(index);
  const content = document.getElementById('reader-content');
  if (content) content.innerHTML = chapter.html || '<p>這個章節目前沒有內容。</p>';
  paginateCurrentReaderChapter(false);
  saveCurrentReaderProgressLocal();
  closeReaderPanel();
  showReaderControls();
}

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

function renderReaderPanel(panel) {
  const titles = {
    toc: '目錄',
    search: '搜尋書籍',
    settings: '主題與設定',
    bookmarks: '閱讀位置與書籤',
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
  const query = cloudLibrary.readerSearchQuery || '';
  return `
    <label class="reader-panel-muted" for="reader-search-field">輸入關鍵字</label>
    <input id="reader-search-field" class="reader-search-field" type="search" placeholder="搜尋本書內容" autocomplete="off" value="${escapeHtml(query)}" />
    <p class="reader-panel-muted">輸入關鍵字搜尋本書內容。第一階段會前往命中的章節，不會精準定位到節號。</p>
    <p id="reader-search-status" class="reader-search-status" role="status">${escapeHtml(getReaderSearchStatusText())}</p>
    <div id="reader-search-results" class="reader-search-results" aria-label="搜尋結果">
      ${renderReaderSearchResultItems()}
    </div>
  `;
}

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
  saveCurrentReaderProgressLocal();
  renderReaderPanels();
  showReaderControls();
}

function waitForReaderLayout() {
  return new Promise(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

async function stabilizeReaderAfterOpen() {
  await waitForReaderLayout();
  paginateCurrentReaderChapter(false, { allChapters: true, preserveProgress: true, force: true });
}

function resetReaderPaginationCache() {
  cloudLibrary.readerChapterPages = [];
  cloudLibrary.readerChapterPageCounts = [];
  cloudLibrary.readerPaginationSignature = '';
  resetReaderSearchState();
}

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

function syncReaderPageCount() {
  cloudLibrary.readerPageCount = Math.max(1, cloudLibrary.readerChapterPageCounts[cloudLibrary.readerChapterIndex] || 1);
}

function buildAllReaderChapterPages() {
  cloudLibrary.readerChapterPages = cloudLibrary.readerChapters.map(chapter => buildReaderColumnPages(chapter.html || '<p>這個章節目前沒有內容。</p>'));
  cloudLibrary.readerChapterPageCounts = cloudLibrary.readerChapterPages.map(pages => Math.max(1, pages.length));
}

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

function paginateCurrentReaderChapter(restoreProgress = false, options = {}) {
  const viewport = document.getElementById('reader-page-viewport');
  const content = document.getElementById('reader-content');
  if (!viewport || !content || !cloudLibrary.readerBook) return;
  const currentProgress = (restoreProgress || !!options.preserveProgress) ? getCurrentReaderProgress() : null;
  ensureReaderPagination({ force: !!options.force || restoreProgress || !!options.allChapters });
  if (restoreProgress) {
    restoreReaderPageFromProgress(cloudLibrary.readerBook.reading_progress || 0);
    syncReaderPageCount();
  } else if (typeof currentProgress === 'number') {
    restoreReaderPageFromProgress(currentProgress);
    syncReaderPageCount();
  } else {
    syncReaderPageCount();
  }
  cloudLibrary.readerPageIndex = normalizeReaderPageIndex(cloudLibrary.readerPageIndex);
  applyReaderPagePosition();
}

function isSinglePageReaderLayout() {
  return window.matchMedia('(max-width: 1023px)').matches;
}

function isMobileReaderLayout() {
  return isSinglePageReaderLayout();
}

function getReaderPagesPerSpread() {
  return isSinglePageReaderLayout() ? 1 : 2;
}

function normalizeReaderPageIndex(pageIndex, pageCount = cloudLibrary.readerPageCount) {
  const count = Math.max(1, pageCount || 1);
  const clamped = Math.max(0, Math.min(Number(pageIndex) || 0, count - 1));
  if (getReaderPagesPerSpread() === 1) return clamped;
  return Math.max(0, Math.min(Math.floor(clamped / 2) * 2, count - 1));
}

function getReaderVisibleEndPageIndex() {
  return Math.min(
    cloudLibrary.readerPageIndex + getReaderPagesPerSpread() - 1,
    Math.max(0, cloudLibrary.readerPageCount - 1)
  );
}

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

function getReaderPageHtml(page) {
  if (!page) return '';
  return typeof page === 'string' ? page : page.html || '';
}

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

function renderMobileReaderPage() {
  const content = document.getElementById('reader-content');
  if (!content) return;
  const pages = cloudLibrary.readerChapterPages[cloudLibrary.readerChapterIndex] || [];
  const metrics = applyReaderPageMetrics();
  const page = pages[cloudLibrary.readerPageIndex] || pages[0] || { html: '<p>這個章節目前沒有內容。</p>', pageIndex: 0 };
  content.innerHTML = renderReaderPageColumn(getReaderPageHtml(page), page.pageIndex || 0, false, metrics.bodyWidth);
}

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

function updateReaderViewportInsets() {
  const view = document.getElementById('view-reader');
  const shell = view?.querySelector('.reader-app-shell');
  if (!view || !shell) return { top: 0, bottom: 0 };
  const toolbar = view.querySelector('.reader-toolbar');
  const footer = view.querySelector('.reader-footer');
  const top = !view.classList.contains('reader-controls-hidden') && toolbar ? Math.ceil(toolbar.getBoundingClientRect().height) : 0;
  const bottom = footer ? Math.ceil(footer.getBoundingClientRect().height) : 0;
  shell.style.setProperty('--reader-stage-top', `${top}px`);
  shell.style.setProperty('--reader-stage-bottom', `${bottom}px`);
  return { top, bottom };
}

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
  if (singlePage) {
    content.style.columnWidth = 'auto';
    content.style.columnCount = 'auto';
    content.style.columnGap = '0px';
    content.style.overflow = 'hidden';
  } else {
    content.style.columnWidth = 'auto';
    content.style.columnCount = 'auto';
    content.style.columnGap = '0px';
    content.style.columnFill = 'auto';
    content.style.overflow = 'hidden';
  }
  content.style.transform = 'translateX(0)';
  viewport.scrollLeft = 0;
  return { width, height, pageStep: width + spreadGap, spreadGap, spreadWidth, bodyWidth, bodyHeight };
}

function getReaderTotalPages() {
  return Math.max(1, cloudLibrary.readerChapterPageCounts.reduce((sum, count) => sum + Math.max(1, count || 0), 0));
}

function getReaderGlobalPageIndex() {
  const previousPages = cloudLibrary.readerChapterPageCounts
    .slice(0, cloudLibrary.readerChapterIndex)
    .reduce((sum, count) => sum + Math.max(1, count || 0), 0);
  return previousPages + cloudLibrary.readerPageIndex;
}

function getReaderVisibleEndGlobalPageIndex() {
  const previousPages = cloudLibrary.readerChapterPageCounts
    .slice(0, cloudLibrary.readerChapterIndex)
    .reduce((sum, count) => sum + Math.max(1, count || 0), 0);
  return previousPages + getReaderVisibleEndPageIndex();
}

function restoreReaderPageFromProgress(progress) {
  const totalPages = getReaderTotalPages();
  const targetGlobalPage = Math.max(0, Math.min(totalPages - 1, Math.round(progress * Math.max(totalPages - 1, 0))));
  let remaining = targetGlobalPage;
  for (let index = 0; index < cloudLibrary.readerChapters.length; index += 1) {
    const count = Math.max(1, cloudLibrary.readerChapterPageCounts[index] || 1);
    if (remaining < count) {
      cloudLibrary.readerChapterIndex = index;
      cloudLibrary.readerPageIndex = normalizeReaderPageIndex(remaining, count);
      const chapter = cloudLibrary.readerChapters[index];
      document.getElementById('reader-chapter-nav').value = String(index);
      document.getElementById('reader-content').innerHTML = chapter.html || '<p>這個章節目前沒有內容。</p>';
      cloudLibrary.readerPageCount = count;
      applyReaderPageMetrics();
      return;
    }
    remaining -= count;
  }
}

function applyReaderPagePosition() {
  const viewport = document.querySelector('#reader-page-viewport .reader-page-clip') || document.getElementById('reader-page-viewport');
  const content = document.getElementById('reader-content');
  if (!viewport || !content) return;
  updateReaderViewportInsets();
  if (isMobileReaderLayout()) {
    renderMobileReaderPage();
    viewport.scrollLeft = 0;
    updateReaderProgressUi();
    return;
  }
  cloudLibrary.readerPageIndex = normalizeReaderPageIndex(cloudLibrary.readerPageIndex);
  renderDesktopReaderSpread();
  content.style.transform = 'none';
  viewport.scrollLeft = 0;
  updateReaderProgressUi();
}

function updateReaderProgressUi() {
  const progress = getCurrentReaderProgress();
  const percent = Math.round(progress * 100);
  const progressText = document.getElementById('reader-progress-text');
  const pageText = document.getElementById('reader-page-text');
  const progressBar = document.getElementById('reader-progress-bar');
  if (progressText) progressText.textContent = `${percent}%`;
  if (pageText) {
    const totalPages = getReaderTotalPages();
    const startPage = getReaderGlobalPageIndex() + 1;
    const endPage = Math.min(startPage + getReaderPagesPerSpread() - 1, totalPages);
    pageText.textContent = endPage > startPage ? `第 ${startPage}-${endPage} / ${totalPages} 頁` : `第 ${startPage} / ${totalPages} 頁`;
  }
  if (progressBar) progressBar.style.width = `${percent}%`;
  updateReaderTurnButtons();
  if (cloudLibrary.readerActivePanel && cloudLibrary.readerActivePanel !== 'settings') renderReaderPanels();
}

function updateReaderTurnButtons() {
  const globalPage = getReaderGlobalPageIndex();
  const totalPages = getReaderTotalPages();
  document.querySelectorAll('[data-reader-prev-page]').forEach(button => { button.disabled = globalPage <= 0; });
  document.querySelectorAll('[data-reader-next-page]').forEach(button => { button.disabled = getReaderVisibleEndGlobalPageIndex() >= totalPages - 1; });
}

function getCurrentReaderProgress() {
  const totalPages = getReaderTotalPages();
  if (totalPages <= 1) return 1;
  return Math.max(0, Math.min(1, getReaderVisibleEndGlobalPageIndex() / (totalPages - 1)));
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
  const nextChapter = cloudLibrary.readerChapterIndex + direction;
  if (nextChapter < 0 || nextChapter >= cloudLibrary.readerChapters.length) return;
  await openReaderChapter(nextChapter, { pageIndex: direction > 0 ? 0 : Number.MAX_SAFE_INTEGER });
  if (direction < 0) {
    cloudLibrary.readerPageIndex = normalizeReaderPageIndex(Math.max(0, cloudLibrary.readerPageCount - 1));
    applyReaderPagePosition();
    await persistCurrentReaderProgress();
  }
}

async function persistCurrentReaderProgress() {
  const book = cloudLibrary.readerBook;
  if (!book) return;
  saveCurrentReaderProgressLocal();
  await persistReadingProgress(book.id, cloudLibrary.readerChapterIndex, getCurrentReaderProgress());
}

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

async function persistReadingProgress(bookId, currentChapter, readingProgress) {
  const payload = { current_chapter: currentChapter, reading_progress: readingProgress, last_read_at: nowIso(), updated_at: nowIso() };
  const systemBook = getSystemLibraryBook(bookId);
  if (systemBook) {
    saveSystemLibraryProgress(bookId, payload);
    if (cloudLibrary.readerBook?.id === bookId) Object.assign(cloudLibrary.readerBook, payload);
    renderLibrary();
    renderDesktopBookshelfCard();
    return;
  }
  const importedBook = getImportedBook(bookId);
  if (importedBook) {
    importedBook.current_chapter = payload.current_chapter;
    importedBook.currentChapter = payload.current_chapter;
    importedBook.reading_progress = payload.reading_progress;
    importedBook.readingProgress = payload.reading_progress;
    importedBook.last_read_at = payload.last_read_at;
    importedBook.lastReadAt = payload.last_read_at;
    importedBook.updated_at = payload.updated_at;
    importedBook.updatedAt = payload.updated_at;
    const chapters = importedBook.chapters.map((chapter, index) => ({
      ...chapter,
      progress: index < currentChapter ? 1 : index === currentChapter ? readingProgress : chapter.progress,
    }));
    importedBook.chapters = chapters;
    saveImportedLibraryBooks(importedLibrary.books);
    renderLibrary();
    return;
  }
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

function handleImportEpubClick() {
  els.importEpubInput?.click();
}

async function handleImportEpubSelection(event) {
  const input = event?.target;
  const file = input?.files?.[0];
  if (!file) {
    showToast('尚未選擇 EPUB 檔案。');
    return;
  }
  try {
    await handleImportEpubFile(file);
  } finally {
    if (input) input.value = '';
  }
}

async function handleImportEpubFile(file) {
  if (!(file instanceof File)) throw new Error('請先選擇要匯入的 EPUB 檔案。');
  const isEpub = /\.epub$/i.test(file.name) || file.type === 'application/epub+zip';
  if (!isEpub) throw new Error('這個檔案不是 EPUB 格式。');
  if (file.type && file.type !== 'application/epub+zip' && !/\.epub$/i.test(file.name)) throw new Error('這個檔案不是 EPUB 格式。');
  if (Number(file.size || 0) > MAX_IMPORTED_EPUB_BYTES) throw new Error('EPUB 檔案不可超過 10MB。');
  showToast('正在匯入 EPUB...');
  const importedBook = await importExternalEpub(file);
  cloudLibrary.selectedBookId = importedBook.id;
  renderLibrary();
  showToast('已加入書櫃。');
}

async function importExternalEpub(file) {
  let parsed;
  try {
    parsed = await parseExternalEpub(file, { enforceImportedLimits: true });
  } catch (error) {
    throw buildExternalEpubError(error);
  }
  const id = createImportedBookId();
  const now = nowIso();
  const importedBook = normalizeImportedBook({
    id,
    source: 'imported_epub',
    title: parsed.title,
    author: parsed.author,
    description: parsed.description,
    fileName: file.name,
    fileSize: file.size,
    importedAt: now,
    updatedAt: now,
    totalChapters: parsed.chapters.length,
    currentChapter: 0,
    readingProgress: 0,
    lastReadAt: null,
    hasCover: !!parsed.coverBlob,
    chapters: parsed.chapters.map((chapter, index) => ({
      ...chapter,
      id: chapter.id || `imported_chapter_${id}_${index}`,
      book_id: id,
      user_id: null,
    })),
  });
  try {
    await saveImportedBookBlob(id, file, parsed.coverBlob || null);
    saveImportedLibraryBooks([importedBook, ...importedLibrary.books.filter(book => book.id !== id)]);
    await refreshImportedLibraryCoverUrls();
  } catch (error) {
    throw new Error(`匯入失敗，無法保存本機 EPUB：${error?.message || error}`);
  }
  return getImportedBook(id) || importedBook;
}

function buildExternalEpubError(error) {
  const message = String(error?.message || error || '');
  if (/not epub|副檔名|epub 格式/i.test(message)) return new Error('這個檔案不是 EPUB 格式。');
  if (/container\.xml/i.test(message)) return new Error('無法讀取這本 EPUB 的 container.xml。');
  if (/opf/i.test(message)) return new Error('無法讀取這本 EPUB 的 OPF 書籍資料。');
  if (/compression|deflate|decompressionstream/i.test(message)) return new Error('這本 EPUB 使用目前瀏覽器不支援的壓縮方式，或內容可能已加密。');
  if (/drm|encrypted|rights/i.test(message)) return new Error('這本 EPUB 可能使用加密保護，目前無法匯入。');
  if (/spine/i.test(message)) return new Error('這本 EPUB 找不到可閱讀的章節順序。');
  return new Error(`無法匯入此 EPUB，可能是檔案格式不支援或內容已加密。${message ? `（${message}）` : ''}`);
}

async function readEpubChapters(epubBlob, manifestChapters = [], options = {}) {
  const enforceImportedLimits = options.source === 'imported_epub';
  const entries = await unzipStoredEntries(epubBlob, { enforceImportedLimits });
  const epubChapters = extractEpubSpineChapters(entries);
  const sourceChapters = epubChapters.length > manifestChapters.length ? epubChapters : manifestChapters;
  return sourceChapters.map(chapter => {
    const entry = entries.get(chapter.chapter_path) || entries.get(chapter.href) || entries.get(`OEBPS/${chapter.href}`);
    if (enforceImportedLimits && entry?.text && entry.text.length > MAX_IMPORTED_EPUB_CHAPTER_CHARS) {
      throw new Error('EPUB 單章內容過大，請拆分章節後再匯入。');
    }
    const html = entry ? sanitizeReaderHtml(entry.text, options) : '<p>找不到 EPUB 內的章節內容。</p>';
    return { ...chapter, html };
  });
}

function extractEpubSpineChapters(entries) {
  const opfPath = entries.has('OEBPS/content.opf') ? 'OEBPS/content.opf' : [...entries.keys()].find(name => name.endsWith('/content.opf') || name === 'content.opf');
  if (!opfPath) return [];
  const opfEntry = entries.get(opfPath);
  const doc = new DOMParser().parseFromString(opfEntry?.text || '', 'application/xml');
  if (doc.querySelector('parsererror')) return [];
  const basePath = opfPath.includes('/') ? opfPath.slice(0, opfPath.lastIndexOf('/') + 1) : '';
  const elements = [...doc.getElementsByTagName('*')];
  const manifest = new Map(elements
    .filter(item => item.localName === 'item' && item.getAttribute('id'))
    .map(item => [item.getAttribute('id'), item.getAttribute('href') || '']));
  return elements
    .filter(item => item.localName === 'itemref')
    .map(item => manifest.get(item.getAttribute('idref')))
    .filter(href => href && !href.endsWith('nav.xhtml'))
    .map((href, index) => {
      const chapterPath = resolveEpubPath(basePath, href);
      const content = entries.get(chapterPath)?.text || '';
      return {
        id: `epub_spine_${index}`,
        title: extractChapterTitle(content, index),
        chapter_order: index,
        href,
        chapter_path: chapterPath,
        progress: 0,
      };
    });
}

function extractChapterTitle(xhtml, index) {
  if (!xhtml) return index === 0 ? '書名頁' : `第 ${index + 1} 章`;
  const doc = new DOMParser().parseFromString(xhtml, 'application/xhtml+xml');
  const title = doc.querySelector('h1')?.textContent || doc.querySelector('title')?.textContent || '';
  return title.trim() || (index === 0 ? '書名頁' : `第 ${index + 1} 章`);
}

function sanitizeReaderHtml(xhtml, options = {}) {
  const source = options.source || 'generated';
  const doc = new DOMParser().parseFromString(xhtml, 'application/xhtml+xml');
  const parserError = doc.querySelector('parsererror');
  const body = parserError ? new DOMParser().parseFromString(xhtml, 'text/html').body : doc.querySelector('body');
  if (!body) return '<p>章節內容無法解析。</p>';
  const blockedSelector = source === 'imported_epub'
    ? 'script, style, link, iframe, object, embed, svg'
    : 'script, style, link';
  body.querySelectorAll(blockedSelector).forEach(node => node.remove());
  stripUnsafeHtmlAttributes(body);
  if (source === 'imported_epub') {
    return sanitizeImportedHtmlFragment(body.innerHTML);
  }
  return body.innerHTML;
}

async function unzipStoredEntries(blob, options = {}) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const entries = new Map();
  let offset = 0;
  let totalInflatedBytes = 0;
  const decoder = new TextDecoder();
  while (offset + 30 <= bytes.length) {
    const view = new DataView(bytes.buffer, bytes.byteOffset + offset);
    if (view.getUint32(0, true) !== 0x04034b50) break;
    const flags = view.getUint16(6, true);
    const compression = view.getUint16(8, true);
    const compressedSize = view.getUint32(18, true);
    const fileNameLength = view.getUint16(26, true);
    const extraLength = view.getUint16(28, true);
    const nameStart = offset + 30;
    const nameEnd = nameStart + fileNameLength;
    const contentStart = nameEnd + extraLength;
    const contentEnd = contentStart + compressedSize;
    const name = decoder.decode(bytes.slice(nameStart, nameEnd));
    if (flags & 0x0001) throw new Error('EPUB entry is encrypted');
    if (flags & 0x0008) throw new Error('EPUB uses data descriptor entries that are not currently supported');
    if (compression === 0 || compression === 8) {
      const entryBytes = bytes.slice(contentStart, contentEnd);
      const inflated = compression === 0 ? entryBytes : await inflateRawEntryData(entryBytes);
      totalInflatedBytes += inflated.length;
      if (options.enforceImportedLimits && totalInflatedBytes > MAX_IMPORTED_EPUB_UNZIPPED_BYTES) {
        throw new Error('EPUB 解壓後內容不可超過 30MB，請改用較小檔案。');
      }
      entries.set(name, {
        name,
        compression,
        bytes: inflated,
        text: decoder.decode(inflated),
      });
    } else {
      throw new Error(`Unsupported EPUB compression method: ${compression}`);
    }
    offset = contentEnd;
  }
  return entries;
}

async function inflateRawEntryData(data) {
  if (typeof DecompressionStream !== 'function') {
    throw new Error('DecompressionStream unavailable for deflate-raw');
  }
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  const buffer = await new Response(stream).arrayBuffer();
  return new Uint8Array(buffer);
}

async function parseExternalEpub(epubBlob, options = {}) {
  const enforceImportedLimits = !!options.enforceImportedLimits;
  const entries = await unzipStoredEntries(epubBlob, { enforceImportedLimits });
  if (entries.has('META-INF/encryption.xml') || entries.has('META-INF/rights.xml')) {
    throw new Error('EPUB appears encrypted or DRM protected');
  }
  const containerText = readEpubContainer(entries);
  const opfPath = parseContainerXml(containerText);
  if (!opfPath) throw new Error('找不到 OPF rootfile');
  const opfEntry = entries.get(opfPath);
  if (!opfEntry?.text) throw new Error('找不到 OPF 檔案');
  const opfData = parseOpfDocument(opfEntry.text, opfPath);
  const chapters = buildExternalEpubChapters(opfData, entries, { enforceImportedLimits });
  if (!chapters.length) throw new Error('spine 為空');
  const coverItem = findEpubCoverItem(opfData);
  const coverEntry = coverItem ? entries.get(coverItem.path) : null;
  return {
    title: sanitizeDisplayText(opfData.metadata.title, '未命名 EPUB'),
    author: sanitizeDisplayText(opfData.metadata.author, '未填作者'),
    description: sanitizeDisplayText(opfData.metadata.description, ''),
    coverBlob: coverEntry?.bytes ? new Blob([coverEntry.bytes], { type: coverItem.mediaType || 'application/octet-stream' }) : null,
    chapters: chapters.map((chapter, index) => ({
      id: `imported_epub_chapter_${index}`,
      user_id: null,
      book_id: '',
      title: sanitizeDisplayText(chapter.title, `第 ${index + 1} 章`),
      chapter_order: index,
      href: chapter.href,
      chapter_path: chapter.chapter_path,
      progress: 0,
    })),
  };
}

function readEpubContainer(entries) {
  const container = entries.get('META-INF/container.xml');
  if (!container?.text) throw new Error('找不到 META-INF/container.xml');
  return container.text;
}

function parseContainerXml(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('container.xml 解析失敗');
  const rootfile = [...doc.getElementsByTagName('*')].find(node => node.localName === 'rootfile');
  return rootfile?.getAttribute('full-path') || '';
}

function parseOpfDocument(opfText, opfPath) {
  const doc = new DOMParser().parseFromString(opfText, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('OPF 解析失敗');
  const opfBasePath = opfPath.includes('/') ? opfPath.slice(0, opfPath.lastIndexOf('/') + 1) : '';
  const elements = [...doc.getElementsByTagName('*')];
  const metadataNode = elements.find(node => node.localName === 'metadata');
  const manifestItems = elements
    .filter(node => node.localName === 'item')
    .map(node => ({
      id: node.getAttribute('id') || '',
      href: node.getAttribute('href') || '',
      mediaType: node.getAttribute('media-type') || '',
      properties: node.getAttribute('properties') || '',
      path: resolveEpubPath(opfBasePath, node.getAttribute('href') || ''),
    }));
  const manifest = new Map(manifestItems.map(item => [item.id, item]));
  const spine = elements
    .filter(node => node.localName === 'itemref')
    .map((node, index) => ({
      idref: node.getAttribute('idref') || '',
      index,
    }))
    .filter(item => item.idref);
  const metadata = {
    title: metadataNode ? [...metadataNode.children].find(node => node.localName === 'title')?.textContent?.trim() || '' : '',
    author: metadataNode ? [...metadataNode.children].find(node => node.localName === 'creator')?.textContent?.trim() || '' : '',
    description: metadataNode ? [...metadataNode.children].find(node => node.localName === 'description')?.textContent?.trim() || '' : '',
    metaCoverId: metadataNode
      ? [...metadataNode.children].find(node => node.localName === 'meta' && node.getAttribute('name') === 'cover')?.getAttribute('content') || ''
      : '',
  };
  return { opfPath, opfBasePath, metadata, manifestItems, manifest, spine };
}

function buildExternalEpubChapters(opfData, entries = new Map(), options = {}) {
  return opfData.spine
    .map((spineItem, index) => {
      const manifestItem = opfData.manifest.get(spineItem.idref);
      if (!manifestItem) return null;
      if (!/xhtml|html|xml/i.test(manifestItem.mediaType || '')) return null;
      const chapterText = entries.get(manifestItem.path)?.text || '';
      if (options.enforceImportedLimits && chapterText.length > MAX_IMPORTED_EPUB_CHAPTER_CHARS) {
        throw new Error('EPUB 單章內容過大，請拆分章節後再匯入。');
      }
      const title = extractChapterTitle(chapterText, index);
      return {
        id: `imported_spine_${index}`,
        title,
        href: manifestItem.href,
        chapter_path: manifestItem.path,
      };
    })
    .filter(Boolean);
}

function resolveEpubPath(basePath, href = '') {
  const root = String(basePath || '').split('/').filter(Boolean);
  const parts = String(href || '').split('/').filter(Boolean);
  const resolved = [...root];
  parts.forEach(part => {
    if (part === '.') return;
    if (part === '..') {
      resolved.pop();
      return;
    }
    resolved.push(part);
  });
  return resolved.join('/');
}

function findEpubCoverItem(opfData) {
  const epub3Item = opfData.manifestItems.find(item => /\bcover-image\b/.test(item.properties || ''));
  if (epub3Item) return epub3Item;
  if (opfData.metadata.metaCoverId && opfData.manifest.has(opfData.metadata.metaCoverId)) {
    return opfData.manifest.get(opfData.metadata.metaCoverId);
  }
  return null;
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
  const box = els.exportSuccessActions;
  if (!box) return;
  if (!libraryBook) {
    box.classList.add('hidden');
    return;
  }
  const canOpenLibraryBook = !!libraryBook.libraryBookId;
  if (els.exportSuccessMessage) {
    els.exportSuccessMessage.textContent = libraryBook.message || 'EPUB 已完成。';
  }
  document.getElementById('read-exported-book-btn')?.classList.toggle('hidden', !canOpenLibraryBook);
  document.getElementById('go-library-btn')?.classList.toggle('hidden', !canOpenLibraryBook);
  if (canOpenLibraryBook) cloudLibrary.selectedBookId = libraryBook.libraryBookId;
  box.classList.remove('hidden');
}

function downloadLatestExportedBook() {
  const exported = state.latestExportedBook;
  if (!(exported?.blob && exported?.filename)) {
    throw new Error('目前沒有可下載的 EPUB，請先完成匯出。');
  }
  downloadBlob(exported.filename, exported.blob);
  showToast('EPUB 已下載。');
}

function getLibrarySourceAction(element) {
  return element?.dataset.librarySource || 'generated';
}

async function openLibraryBookBySource(bookId, source = 'generated') {
  if (source === 'system') return openSystemLibraryBook(bookId);
  if (source === 'imported_epub') return openImportedLibraryBook(bookId);
  return openLibraryBook(bookId);
}

async function downloadLibraryBookBySource(bookId, source = 'generated') {
  if (source === 'system') return downloadSystemLibraryBookEpub(bookId);
  if (source === 'imported_epub') return downloadImportedLibraryBookEpub(bookId);
  return downloadLibraryBookEpub(bookId);
}

async function deleteLibraryBookBySource(bookId, source = 'generated') {
  if (source === 'system') {
    showToast('系統預設書籍無法刪除。');
    return;
  }
  if (source === 'imported_epub') return deleteImportedLibraryBook(bookId);
  return deleteLibraryBook(bookId);
}

document.addEventListener('click', event => {
  const openBook = event.target.closest('[data-open-library-book]');
  if (openBook) openLibraryBookBySource(openBook.dataset.openLibraryBook, getLibrarySourceAction(openBook)).catch(handleError);
  const infoBook = event.target.closest('[data-info-library-book]');
  if (infoBook) {
    const book = getLibraryBook(infoBook.dataset.infoLibraryBook);
    if (book) showToast(`${book.title}｜${book.total_chapters} 個閱讀段落｜版本 ${book.version}`);
  }
  const downloadBook = event.target.closest('[data-download-library-epub]');
  if (downloadBook) downloadLibraryBookBySource(downloadBook.dataset.downloadLibraryEpub, getLibrarySourceAction(downloadBook)).catch(handleError);
  const deleteBookBtn = event.target.closest('[data-delete-library-book]');
  if (deleteBookBtn) deleteLibraryBookBySource(deleteBookBtn.dataset.deleteLibraryBook, getLibrarySourceAction(deleteBookBtn)).catch(handleError);
  if (event.target.id === 'read-exported-book-btn' && state.latestExportedBook?.libraryBookId) openLibraryBook(state.latestExportedBook.libraryBookId).catch(handleError);
  if (event.target.id === 'download-exported-book-btn') downloadLatestExportedBook();
  if (event.target.id === 'go-library-btn') setView('library');
  if (event.target.id === 'library-empty-action') setView('books');
  if (event.target.id === 'reader-back-library' || event.target.closest('[data-reader-close]')) {
    persistCurrentReaderProgress().catch(console.error);
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
  const settingOption = event.target.closest('[data-reader-setting-option]');
  if (settingOption) {
    event.preventDefault();
    event.stopPropagation();
    const key = settingOption.dataset.readerSettingOption;
    const value = Number(settingOption.dataset.readerSettingValue);
    if (key && Number.isFinite(value)) updateReaderSetting(key, value);
    return;
  }
  const bookmarkJump = event.target.closest('[data-reader-bookmark-jump]');
  if (bookmarkJump) {
    event.preventDefault();
    event.stopPropagation();
    jumpToReaderBookmark(bookmarkJump.dataset.readerBookmarkJump).catch(handleError);
    return;
  }
  const bookmarkRemove = event.target.closest('[data-reader-bookmark-remove]');
  if (bookmarkRemove) {
    event.preventDefault();
    event.stopPropagation();
    removeReaderBookmark(bookmarkRemove.dataset.readerBookmarkRemove).catch(handleError);
    return;
  }
  if (event.target.closest('[data-reader-bookmark-toggle]')) {
    event.preventDefault();
    event.stopPropagation();
    if (isCurrentReaderPositionBookmarked()) removeCurrentReaderBookmark().catch(handleError);
    else addCurrentReaderBookmark();
    return;
  }
  const searchResult = event.target.closest('[data-reader-search-chapter-index]');
  if (searchResult) {
    event.preventDefault();
    event.stopPropagation();
    jumpToReaderSearchResult(searchResult.dataset.readerSearchChapterIndex).catch(handleError);
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
  if (event.target.closest('[data-reader-prev-page]')) {
    event.preventDefault();
    event.stopPropagation();
    turnReaderPage(-1).catch(handleError);
    return;
  }
  if (event.target.closest('[data-reader-next-page]')) {
    event.preventDefault();
    event.stopPropagation();
    turnReaderPage(1).catch(handleError);
    return;
  }
  if (document.getElementById('view-reader')?.classList.contains('active')) {
    if (event.target.closest('.reader-toolbar')) showReaderControls();
    if (event.target.closest('.reader-stage') && !event.target.closest('[data-reader-prev-page], [data-reader-next-page]')) toggleReaderControls();
  }
});

document.addEventListener('change', event => {
  if (event.target.id === 'library-sort') renderLibrary();
  if (event.target.id === 'reader-chapter-nav') openReaderChapter(Number(event.target.value) || 0, { pageIndex: 0 }).catch(handleError);
  if (event.target.id === 'reader-theme') updateReaderSetting('theme', event.target.value);
  if (event.target.dataset.readerSetting === 'theme') updateReaderSetting('theme', event.target.value);
  if (event.target.closest('#view-reader')) showReaderControls();
});

document.addEventListener('input', event => {
  if (event.target.id === 'reader-search-field') {
    event.stopPropagation();
    if (cloudLibrary.readerSearchComposing || event.isComposing) {
      cloudLibrary.readerSearchQuery = event.target.value;
      return;
    }
    scheduleReaderSearch(event.target.value);
    return;
  }
  if (event.target.id === 'reader-font-size') updateReaderSetting('fontSize', Number(event.target.value));
  if (event.target.id === 'reader-line-height') updateReaderSetting('lineHeight', Number(event.target.value));
  if (event.target.dataset.readerSetting === 'fontSize') updateReaderSetting('fontSize', Number(event.target.value));
  if (event.target.dataset.readerSetting === 'lineHeight') updateReaderSetting('lineHeight', Number(event.target.value));
  if (event.target.closest('#view-reader')) showReaderControls();
});

document.addEventListener('compositionstart', event => {
  if (event.target.id !== 'reader-search-field') return;
  event.stopPropagation();
  beginReaderSearchComposition(event.target.value);
});

document.addEventListener('compositionend', event => {
  if (event.target.id !== 'reader-search-field') return;
  event.stopPropagation();
  endReaderSearchComposition(event.target.value);
});

document.addEventListener('keydown', event => {
  if (document.getElementById('view-reader')?.classList.contains('active')) {
    if (event.key === 'Escape' && cloudLibrary.readerActivePanel) {
      event.preventDefault();
      closeReaderPanel();
      return;
    }
    if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      turnReaderPage(-1).catch(handleError);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      turnReaderPage(1).catch(handleError);
    }
  }
});

let readerTouchStartX = 0;
let readerTouchStartY = 0;
document.addEventListener('touchstart', event => {
  if (!document.getElementById('view-reader')?.classList.contains('active')) return;
  const touch = event.touches[0];
  readerTouchStartX = touch.clientX;
  readerTouchStartY = touch.clientY;
}, { passive: true });

document.addEventListener('touchend', event => {
  if (!document.getElementById('view-reader')?.classList.contains('active')) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - readerTouchStartX;
  const dy = touch.clientY - readerTouchStartY;
  if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
    turnReaderPage(dx < 0 ? 1 : -1).catch(handleError);
  }
}, { passive: true });

let readerResizeTimer = null;
window.addEventListener('resize', () => {
  if (!document.getElementById('view-reader')?.classList.contains('active')) return;
  clearTimeout(readerResizeTimer);
  readerResizeTimer = setTimeout(() => {
    paginateCurrentReaderChapter(false, { allChapters: true, preserveProgress: true, force: true });
    persistCurrentReaderProgress().catch(console.error);
  }, 120);
});

window.addEventListener('online', () => syncPendingReadingProgress().catch(console.error));

bootstrap().catch(handleError);
