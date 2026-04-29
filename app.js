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

const AUTO_BACKUP_SLOTS = ['08', '14', '20'];

function buildMergedConfig(raw = null) {
  const next = raw && typeof raw === 'object' ? raw : {};
  const mode = next.mode === 'local'
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
  viewAllNotesBtn: document.getElementById('view-all-notes-btn'),
  openAccountSettingsBtn: document.getElementById('open-account-settings-btn'),
  openAccountSettingsButtons: [...document.querySelectorAll('[data-open-account-settings]')],
  accountSignoutBtn: document.getElementById('account-signout-btn'),
  desktopSidebarSignoutBtn: document.getElementById('desktop-sidebar-signout-btn'),
  accountSettingsModal: document.getElementById('account-settings-modal'),
  accountSettingsBackdrop: document.getElementById('account-settings-backdrop'),
  closeAccountSettingsBtn: document.getElementById('close-account-settings-btn'),
  accountSettingsEmail: document.getElementById('account-settings-email'),
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
  const authCopy = document.querySelector('.auth-gate-copy');
  if (authCopy) authCopy.textContent = '建立免費帳戶後，可在手機與桌機間同步資料。';

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
  storageMode: 'local',
  notes: [],
  books: [],
  snapshots: [],
  selectedBookId: null,
  noteSearch: '',
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
  syncStatus: '本機模式',
  syncDetail: '目前資料只保存在這台裝置。',
  lastSyncAt: '',
  syncReloadTimer: null,
  todayDevotions: null,
  todayDevotionsStatus: 'idle',
  todayDevotionsPromise: null,
  bookArrangementDirty: false,
  bookArrangementSaving: false,
  bookArrangementDrafts: {},
  bookDraftModalOpen: false,
  bookExportSettingsModalOpen: false,
  isExporting: false,
  latestExportedBook: null,
  adminUsage: {
    status: 'idle',
    data: { ...EMPTY_ADMIN_USAGE },
    promise: null,
  },
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
      const response = await fetch('/api/admin-usage', { headers: { Accept: 'application/json' } });
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
          <div class="panel-header">
            <div>
            <h2>札記庫</h2>
            <p class="muted">從過去寫過的札記中搜尋、篩選並挑選文章，加入選稿編排。</p>
            </div>
          </div>
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
          <span id="content-library-book-hint" class="caption">請先到成書工作台建立或選擇一份編排。</span>
          <button id="content-library-add-selected" class="secondary-btn" type="button">加入目前選稿編排</button>
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
  els.contentLibraryClearSelection = document.getElementById('content-library-clear-selection');
  els.contentLibraryList = document.getElementById('content-library-list');

  document.querySelector('#view-content-library .panel-header h2')?.replaceChildren(document.createTextNode('札記庫'));
  document.querySelector('#view-content-library .panel-header .muted')?.replaceChildren(document.createTextNode('從過去寫過的札記中搜尋、篩選並挑選文章，加入選稿編排。'));

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
}

function ensureOperationManualUi() {
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
        <div class="panel-header manual-panel-header">
          <div>
            <h2>操作手冊</h2>
            <p class="muted">靈修札記成書系統使用說明</p>
          </div>
        </div>

        <section class="manual-hero">
          <p class="manual-kicker">流程導覽</p>
          <h1>靈修札記成書系統使用操作手冊</h1>
          <p>這份手冊依照目前系統最新命名整理，建議你用這條主流程理解整個操作：寫札記 → 札記庫挑選文章 → 選稿編排整理章節 → 成書匯出 → 書櫃閱讀。</p>
        </section>

        <section class="manual-toc" aria-labelledby="manual-toc-title">
          <h3 id="manual-toc-title">目錄</h3>
          <ul>
            <li><a href="#manual-purpose">一、系統用途</a></li>
            <li><a href="#manual-areas">二、主要功能區說明</a></li>
              <li><a href="#manual-flow">三、從寫札記到成書的完整操作流程</a></li>
            <li><a href="#manual-bookshelf">四、書櫃閱讀操作</a></li>
            <li><a href="#manual-import">五、匯入外部 EPUB</a></li>
            <li><a href="#manual-install">六、加入主畫面與桌面捷徑</a></li>
            <li><a href="#manual-recommendations">七、建議的使用方式</a></li>
            <li><a href="#manual-writing">八、寫作與排版建議</a></li>
            <li><a href="#manual-faq">九、常見問題</a></li>
            <li><a href="#manual-habits">十、推薦操作習慣</a></li>
            <li><a href="#manual-example">十一、完整流程範例</a></li>
            <li><a href="#manual-summary">十二、使用流程總結</a></li>
          </ul>
        </section>

        <article class="manual-article">
          <section id="manual-purpose" class="manual-section">
            <h2>一、系統用途</h2>
            <p>靈修札記成書系統是一套協助使用者整理每日靈修內容、累積屬靈文章、編排成電子書，並在書櫃中閱讀與管理的工具。</p>
            <p>使用者可以從一篇札記開始，逐步累積內容。當文章數量增加後，可以從札記庫搜尋、篩選並挑選適合的文章，加入目前選稿編排，再整理章節順序，最後進入成書匯出，產生 EPUB 電子書。</p>
            <div class="manual-callout">
              <strong>整體使用流程</strong>
              <p>寫札記 → 札記庫挑選文章 → 選稿編排整理章節 → 成書匯出 → 書櫃閱讀</p>
            </div>
            <p>這套系統的核心目的，是幫助使用者把日常零散的靈修文字，逐步整理成可以保存、閱讀與分享的屬靈作品。</p>
          </section>

          <section id="manual-areas" class="manual-section">
            <h2>二、主要功能區說明</h2>
            <p>系統左側或底部導覽會依裝置顯示主要功能。各功能用途如下：</p>
            <h3>1. 總覽</h3>
            <p>總覽是進入系統後的首頁。</p>
            <p>這裡會顯示目前札記、選稿編排、書籍等整體狀態，幫助使用者快速掌握目前進度。</p>
            <ul>
              <li>目前累積多少札記</li>
              <li>是否已有選稿編排</li>
              <li>是否已有完成或匯入的電子書</li>
              <li>最近編輯過哪些札記</li>
              <li>最近整理過哪些編排</li>
              <li>目前是否需要同步資料</li>
            </ul>
            <h3>2. 寫札記</h3>
            <p>寫札記是建立與編輯單篇靈修內容的主要頁面。</p>
            <p>使用者可以在這裡輸入：</p>
            <ul>
              <li>札記標題</li>
              <li>經文範圍</li>
              <li>分類</li>
              <li>標籤</li>
              <li>摘要</li>
              <li>札記全文</li>
            </ul>
            <p>寫札記頁面適合用來完成每日靈修、主日信息整理、小組查經心得、講章筆記、屬靈文章草稿等內容。</p>
            <p>若使用者從札記庫點選「編輯」，系統會回到寫札記頁，並載入該篇既有札記。儲存時會更新原本那篇札記，不會新增成另一篇。</p>
            <h3>3. 札記庫</h3>
            <p>札記庫是所有已儲存札記的集中管理區。</p>
            <p>使用者可以在這裡：</p>
            <ul>
              <li>查看過去寫過的札記</li>
              <li>搜尋札記標題、摘要、內容或經文</li>
              <li>依日期、分類、標籤篩選札記</li>
              <li>編輯既有札記</li>
              <li>勾選適合成書的文章</li>
              <li>將文章加入目前選稿編排</li>
            </ul>
            <p>札記庫的主要用途，是保存、搜尋、篩選、編輯與挑選原始文章。</p>
            <p>當某篇札記適合收進未來的書中，可以直接從札記庫勾選該篇文章，加入目前選稿編排。</p>
            <h3>4. 選稿編排</h3>
            <p>選稿編排是成書前最重要的整理工作區。</p>
            <p>使用者可以建立一本書的編排，並把札記庫中的文章加入目前編排。</p>
            <p>在選稿編排中，可以進行：</p>
            <ul>
              <li>建立新編排</li>
              <li>設定目前編排</li>
              <li>查看編排內容</li>
              <li>整理章節順序</li>
              <li>移除不適合的章節</li>
              <li>確認哪些文章會進入成書內容</li>
              <li>開啟成書匯出設定</li>
            </ul>
            <p>這個區域可以理解為「一本書正式輸出之前的編排桌」。</p>
            <p>空編排建立後，系統會引導使用者前往札記庫加入文章。已有章節的編排，則可以進入章節整理，調整順序、移除章節或確認是否列入目錄。</p>
            <h3>5. 成書匯出</h3>
            <p>成書匯出是把選稿編排整理成正式電子書的階段。</p>
            <p>使用者完成編排章節整理後，可以進入成書匯出設定，確認或補充：</p>
            <ul>
              <li>書名</li>
              <li>副標</li>
              <li>作者</li>
              <li>書籍簡介</li>
              <li>模板</li>
              <li>封面圖片</li>
              <li>前言</li>
              <li>後記</li>
            </ul>
            <p>成書設定儲存後，不會立即匯出 EPUB。使用者可以先補齊正式成書資訊，確認章節順序與內容後，再進行 EPUB 匯出。</p>
            <p>匯出完成後，電子書可以下載，也可以加入系統內的書櫃閱讀。</p>
            <h3>6. 書櫃</h3>
            <p>書櫃是閱讀與管理電子書的地方。</p>
            <p>書櫃中會顯示：</p>
            <ul>
              <li>自己從系統匯出的電子書</li>
              <li>外部匯入的 EPUB 電子書</li>
            </ul>
            <p>使用者可以在書櫃中：</p>
            <ul>
              <li>打開書籍</li>
              <li>閱讀章節</li>
              <li>下載電子書</li>
              <li>刪除不需要的書籍</li>
              <li>匯入外部 EPUB</li>
            </ul>
            <p>書櫃適合用來保存已完成的成書結果，也適合閱讀外部匯入的 EPUB。</p>
            <h3>7. 標籤</h3>
            <p>標籤頁面用來查看札記中使用過的標籤。</p>
            <p>適合用來整理主題，例如：</p>
            <ul>
              <li>禱告</li>
              <li>信心</li>
              <li>悔改</li>
              <li>恩典</li>
              <li>苦難</li>
              <li>福音</li>
              <li>教會</li>
              <li>家庭</li>
            </ul>
            <p>當札記逐漸累積，標籤可以幫助使用者回頭查找同類型文章。</p>
            <h3>8. 統計</h3>
            <p>統計頁面用來查看整體寫作與整理狀態。</p>
            <p>例如：</p>
            <ul>
              <li>札記累積數量</li>
              <li>分類分布</li>
              <li>標籤使用狀況</li>
              <li>近期寫作狀況</li>
              <li>成書整理進度</li>
            </ul>
            <p>這個頁面可以幫助使用者看見自己長期累積的成果。</p>
            <h3>9. 操作手冊</h3>
            <p>操作手冊提供系統使用說明。</p>
            <p>使用者可以在這裡了解完整流程、各頁面用途、寫作建議、成書流程、書櫃閱讀方式與常見問題。</p>
            <h3>10. 設定</h3>
            <p>設定入口用來管理帳號、同步或其他系統相關選項。</p>
            <p>實際功能會依目前版本而定。</p>
          </section>

          <section id="manual-flow" class="manual-section">
            <h2>三、從寫札記到成書的完整操作流程</h2>
            <h3>第一步：建立一篇札記</h3>
            <p>進入「寫札記」頁面。</p>
            <p>依序輸入：</p>
            <ul>
              <li>札記標題</li>
              <li>經文範圍</li>
              <li>分類</li>
              <li>標籤</li>
              <li>摘要</li>
              <li>札記全文</li>
            </ul>
            <p>例如：</p>
            <p>經文範圍可以輸入：詩篇 105:23-36。</p>
            <p>分類可以使用：靈修、主日信息、小組查經、神學反思。</p>
            <p>標籤可以使用：信心、悔改、神的信實、苦難、盼望。</p>
            <p>完成後，點選儲存札記。</p>
            <p>建議使用方式：</p>
            <ul>
              <li>標題盡量寫成正式文章標題，方便日後成書使用。</li>
              <li>摘要可以等文章完成後再寫，避免一開始被摘要限制內容方向。</li>
              <li>標籤不用一次加太多，建議抓住二到四個核心主題即可。</li>
              <li>文章內容可以先完整寫下來，後續再透過札記庫回來編輯。</li>
            </ul>
            <h3>第二步：使用 Markdown 工具整理文章格式</h3>
            <p>寫札記時，可以使用工具列快速插入基本格式。</p>
            <p>目前支援的格式包括：</p>
            <ul>
              <li>小標題</li>
              <li>粗體</li>
              <li>引用</li>
              <li>經文區塊</li>
              <li>清單</li>
              <li>分隔線</li>
              <li>紅字、藍字、金字、紫字重點標記</li>
            </ul>
            <p>常用格式如下：</p>
            <p>小標題：</p>
            <p><code>## 標題文字</code></p>
            <p>粗體：</p>
            <p><code>**重點文字**</code></p>
            <p>引用：</p>
            <p><code>&gt; 引用內容</code></p>
            <p>清單：</p>
            <ol>
              <li>第一點</li>
              <li>第二點</li>
            </ol>
            <p>分隔線：</p>
            <p><code>---</code></p>
            <p>顏色標記：</p>
            <p><code>{red}紅色重點{/red}</code></p>
            <p><code>{blue}藍色重點{/blue}</code></p>
            <p><code>{gold}金色重點{/gold}</code></p>
            <p><code>{purple}紫色重點{/purple}</code></p>
            <p>若要讓標題套用顏色，建議使用這種格式：</p>
            <p><code>## {purple}標題文字{/purple}</code></p>
            <h3>第三步：預覽札記</h3>
            <p>完成內容後，可以使用預覽功能檢查文章呈現效果。</p>
            <p>預覽會顯示：</p>
            <ol>
              <li>標題</li>
              <li>經文</li>
              <li>分類與標籤</li>
              <li>摘要</li>
              <li>札記全文</li>
              <li>Markdown 格式效果</li>
            </ol>
            <p>預覽時建議確認：</p>
            <ul>
              <li>標題是否清楚</li>
              <li>段落是否太長</li>
              <li>小標題是否明顯</li>
              <li>經文與默想內容是否容易閱讀</li>
              <li>重點色是否使用適度</li>
              <li>分隔線是否放在合適的位置</li>
            </ul>
            <h3>第四步：到札記庫管理文章</h3>
            <p>儲存後，可以前往「札記庫」查看已建立的札記。</p>
            <p>在札記庫中可以進行：</p>
            <ul>
              <li>搜尋札記</li>
              <li>篩選札記</li>
              <li>編輯札記</li>
              <li>勾選札記</li>
              <li>將札記加入目前選稿編排</li>
            </ul>
            <p>如果發現某篇札記需要修改，可以直接在札記庫點選「編輯」，系統會回到寫札記頁，並載入該篇札記。</p>
            <p>修改後再儲存，會更新原本那篇札記，不會另外新增一篇。</p>
            <h3>第五步：建立選稿編排</h3>
            <p>進入「選稿編排」。</p>
            <p>若還沒有編排，可以建立一個新的編排。</p>
            <p>建立編排時，可以先設定：</p>
            <ul>
              <li>編排代稱</li>
              <li>整理說明</li>
            </ul>
            <p>編排代稱可以用來標記目前整理方向，例如：</p>
            <ul>
              <li>詩篇靈修札記</li>
              <li>苦難中的信心</li>
              <li>福音與悔改</li>
              <li>清教徒靈修默想</li>
              <li>主日信息整理</li>
              <li>每日靈修選集</li>
              <li>五月份靈修選稿</li>
            </ul>
            <p>建立完成後，系統會將新編排設為目前選稿編排。</p>
            <p>目前選稿編排代表：接下來從札記庫加入的文章，會優先進入這一份編排。</p>
            <h3>第六步：從札記庫加入文章到目前選稿編排</h3>
            <p>前往「札記庫」。</p>
            <p>找到想要放入書中的文章。</p>
            <p>可以使用：</p>
            <ul>
              <li>搜尋</li>
              <li>日期篩選</li>
              <li>分類篩選</li>
              <li>標籤篩選</li>
            </ul>
            <p>找到文章後，勾選文章，點選「加入目前選稿編排」。</p>
            <p>加入後，該文章會成為目前選稿編排中的一個章節。</p>
            <p>若文章尚未整理成熟，可以先留在札記庫中，不急著加入編排。</p>
            <p>建議使用方式：</p>
            <ul>
              <li>不需要每一篇札記都加入選稿編排。</li>
              <li>可以只挑選主題完整、文字成熟、適合公開閱讀的文章。</li>
              <li>同一主題的文章可以集中加入同一份選稿編排，日後整理成一本書。</li>
            </ul>
            <h3>第七步：整理編排章節</h3>
            <p>回到「選稿編排」。</p>
            <p>找到目前要整理的編排，點選「整理章節」。</p>
            <p>在目前選稿編排視窗中，可以整理章節順序。</p>
            <p>常見操作包括：</p>
            <ul>
              <li>上移章節</li>
              <li>下移章節</li>
              <li>移除章節</li>
              <li>確認章節是否列入目錄</li>
              <li>儲存編排</li>
            </ul>
            <p>整理章節時，建議用讀者的閱讀順序來安排。</p>
            <p>例如：</p>
            <ul>
              <li>先放主題導入</li>
              <li>再放經文默想</li>
              <li>接著放個人反思</li>
              <li>最後放總結性文章</li>
            </ul>
            <p>若是靈修合集，可以按經文順序、日期順序或主題順序排列。</p>
            <h3>第八步：設定成書匯出資料</h3>
            <p>在目前選稿編排視窗中，可以點選「成書匯出設定」。</p>
            <p>這裡可以補齊正式成書資訊：</p>
            <ul>
              <li>書名</li>
              <li>副標</li>
              <li>作者</li>
              <li>書籍簡介</li>
              <li>模板</li>
              <li>封面圖片</li>
              <li>前言</li>
              <li>後記</li>
            </ul>
            <p>這些資料會用於後續成書匯出。</p>
            <p>儲存成書設定後，系統不會立即產生 EPUB。使用者可以先完成資料設定，再回到編排繼續整理章節。</p>
            <p>匯出前建議檢查：</p>
            <ul>
              <li>書名是否清楚</li>
              <li>作者是否正確</li>
              <li>書籍簡介是否能說明主題</li>
              <li>前言是否需要補充</li>
              <li>後記是否需要保留</li>
              <li>章節順序是否合理</li>
              <li>章節標題是否一致</li>
              <li>是否有空白章節</li>
              <li>經文格式是否清楚</li>
              <li>重點色是否過多</li>
            </ul>
            <h3>第九步：成書匯出</h3>
            <p>當選稿編排整理完成，成書設定也確認後，可以進入「成書匯出」。</p>
            <p>在成書匯出階段，使用者可以確認書籍資料、章節內容與輸出結果。</p>
            <p>確認無誤後，可以匯出 EPUB 電子書。</p>
            <p>匯出完成後，可以下載 EPUB 檔案，也可以加入系統書櫃閱讀。</p>
            <h3>第十步：下載或加入書櫃</h3>
            <p>匯出完成後，使用者可以下載 EPUB 檔案。</p>
            <p>也可以把書加入系統書櫃，直接在系統中閱讀。</p>
            <p>下載後的 EPUB 可用手機或平板閱讀。</p>
            <p>iPhone 使用者可以用 iOS 內建的「書籍 App」開啟。</p>
            <p>Android 使用者可以用「Google Play 圖書 App」上傳並閱讀。</p>
            <p>也可以使用其他支援 EPUB 的閱讀 App。</p>
          </section>

          <section id="manual-bookshelf" class="manual-section">
            <h2>四、書櫃閱讀操作</h2>
            <p>進入「書櫃」後，可以看到目前已有的電子書。</p>
            <p>書籍來源可能包括：</p>
            <ul>
              <li>系統匯出的電子書</li>
              <li>外部匯入的 EPUB 電子書</li>
            </ul>
            <p>點選書籍後，可以進入閱讀模式。</p>
            <p>閱讀模式會依書籍章節顯示內容，並保留適合閱讀的排版，例如：</p>
            <ul>
              <li>標題</li>
              <li>段落</li>
              <li>引用</li>
              <li>清單</li>
              <li>分隔線</li>
              <li>重點色</li>
            </ul>
            <p>在書櫃中，使用者可以：</p>
            <ul>
              <li>開啟書籍</li>
              <li>閱讀章節</li>
              <li>下載電子書</li>
              <li>刪除書籍</li>
            </ul>
            <p>外部匯入的 EPUB 會以本機資料保存，不會影響系統自行產生的書籍。</p>
          </section>

          <section id="manual-import" class="manual-section">
            <h2>五、匯入外部 EPUB</h2>
            <p>書櫃支援匯入外部 EPUB。</p>
            <p>操作方式：</p>
            <ol>
              <li>進入「書櫃」。</li>
              <li>點選「匯入 EPUB」。</li>
              <li>選擇手機或電腦中的 EPUB 檔案。</li>
              <li>系統完成解析後，書籍會出現在書櫃中。</li>
              <li>點選書籍即可閱讀。</li>
            </ol>
            <p>外部匯入書籍會顯示為「外部匯入」。</p>
            <p>注意事項：</p>
            <ul>
              <li>目前僅支援 EPUB。</li>
              <li>PDF、MOBI、AZW3 暫不支援。</li>
              <li>有 DRM 保護的電子書可能無法匯入。</li>
              <li>不同來源的 EPUB 結構可能不同，若檔案格式特殊，可能會出現無法解析的情況。</li>
              <li>匯入的外部 EPUB 主要保存在目前裝置中，更換裝置後不一定會同步。</li>
            </ul>
          </section>

          <section id="manual-install" class="manual-section">
            <h2>六、加入主畫面與桌面捷徑</h2>
            <div class="manual-callout manual-install-callout">
              <strong>把靈修札記加入主畫面</strong>
              <p>加入主畫面後，可以像 App 一樣從手機桌面開啟。資料仍透過網站同步，不需要另外安裝 App Store 或 Play 商店版本。</p>
              <p>小提醒：網站無法自動替你建立捷徑，需依照手機或瀏覽器提示完成加入。</p>
            </div>
            <div class="manual-install-grid">
              <section class="manual-install-card" aria-labelledby="manual-install-ios">
                <h3 id="manual-install-ios">iPhone / iPad</h3>
                <ol>
                  <li>用 Safari 開啟網站。</li>
                  <li>點下方分享按鈕。</li>
                  <li>選擇「加入主畫面」。</li>
                </ol>
              </section>
              <section class="manual-install-card" aria-labelledby="manual-install-android">
                <h3 id="manual-install-android">Android</h3>
                <ol>
                  <li>用 Chrome 開啟網站。</li>
                  <li>點右上角選單。</li>
                  <li>選擇「新增至主畫面」或「安裝應用程式」。</li>
                  <li>按提示確認。</li>
                </ol>
              </section>
              <section class="manual-install-card" aria-labelledby="manual-install-desktop">
                <h3 id="manual-install-desktop">桌機 Chrome / Edge</h3>
                <ol>
                  <li>開啟網站後，若網址列出現安裝圖示，可點選安裝。</li>
                  <li>或從瀏覽器選單選擇「安裝此網站」或「建立捷徑」。</li>
                </ol>
              </section>
              <section class="manual-install-card" aria-labelledby="manual-install-mac">
                <h3 id="manual-install-mac">Mac 使用者</h3>
                <ol>
                  <li>使用 Safari 開啟網站。</li>
                  <li>從「檔案」或分享選單選擇「加入 Dock」。</li>
                  <li>加入後，就可以像 App 一樣從 Dock 開啟。</li>
                </ol>
              </section>
            </div>
            <p class="manual-install-note">網站內容會隨正式站更新；若捷徑圖示或名稱沒有更新，可移除舊捷徑後重新加入。</p>
          </section>

          <section id="manual-recommendations" class="manual-section">
            <h2>七、建議的使用方式</h2>
            <h3>1. 每日使用方式</h3>
            <p>每天完成一篇靈修後，進入「寫札記」。</p>
            <p>寫下經文、默想、回應與禱告。</p>
            <p>使用分類與標籤標記主題。</p>
            <p>儲存後先留在札記庫。</p>
            <p>這樣做可以先累積素材，不需要一開始就考慮成書。</p>
            <h3>2. 每週整理方式</h3>
            <p>每週可以花一段時間打開札記庫。</p>
            <p>回顧最近寫過的內容。</p>
            <p>挑選較完整、較有主題性的文章，加入目前選稿編排。</p>
            <p>這樣可以讓札記逐漸形成成書素材。</p>
            <h3>3. 每月成書整理方式</h3>
            <p>每月可以建立一份選稿編排。</p>
            <p>從札記庫挑選適合的文章加入編排。</p>
            <p>整理章節順序與書籍方向。</p>
            <p>補齊成書匯出設定。</p>
            <p>確認後匯出 EPUB。</p>
            <p>這樣可以把零散札記逐步整理成可閱讀、可分享、可保存的電子書。</p>
          </section>

          <section id="manual-writing" class="manual-section">
            <h2>八、寫作與排版建議</h2>
            <h3>1. 標題建議</h3>
            <p>標題應盡量清楚、穩重、適合成書。</p>
            <p>例如：</p>
            <ul>
              <li>在困境中仍然記念神的信實</li>
              <li>當神的帶領經過漫長等待</li>
              <li>苦難沒有奪走神的應許</li>
              <li>悔改從看見神的聖潔開始</li>
              <li>在軟弱中學習倚靠神</li>
            </ul>
            <p>避免只寫太短或太模糊的標題，例如：</p>
            <ul>
              <li>今天心得</li>
              <li>靈修筆記</li>
              <li>詩篇感想</li>
            </ul>
            <h3>2. 摘要建議</h3>
            <p>摘要可以放在文章完成後再寫。</p>
            <p>摘要的功能是幫助日後預覽、挑選與成書整理。</p>
            <p>建議摘要控制在二到四句內，說清楚這篇文章的核心重點。</p>
            <h3>3. 段落建議</h3>
            <p>每段不宜太長。</p>
            <p>手機閱讀時，建議一段控制在三到五行內。</p>
            <p>若內容較深，可以使用小標題分段，讓讀者更容易跟上文章脈絡。</p>
            <h3>4. 重點色建議</h3>
            <p>紅字、藍字、金字、紫字適合用來標記重點。</p>
            <p>建議一篇文章中少量使用。</p>
            <p>若整篇文章太多顏色，閱讀時會變得雜亂。</p>
            <h3>5. 分隔線建議</h3>
            <p>分隔線適合用在文章段落轉折處。</p>
            <p>例如：</p>
            <ul>
              <li>經文觀察結束後，進入個人反思</li>
              <li>信息內容結束後，進入禱告回應</li>
              <li>文章前半段與後半段主題明顯轉換</li>
            </ul>
          </section>

          <section id="manual-faq" class="manual-section">
            <h2>九、常見問題</h2>
            <h3>1. 我寫完札記後，為什麼書裡還沒有出現？</h3>
            <p>札記儲存後會先留在札記庫。</p>
            <p>若要放進書中，需要先建立或選擇目前選稿編排，再從札記庫勾選文章加入目前選稿編排。</p>
            <p>接著回到選稿編排整理章節，最後進入成書匯出。</p>
            <h3>2. 札記庫和選稿編排有什麼差別？</h3>
            <p>札記庫是所有已儲存札記的集中管理區。</p>
            <p>選稿編排是正式編排一本書之前的整理工作區。</p>
            <p>使用者可以先在札記庫保存大量札記，再從中挑選適合的文章加入某一份選稿編排。</p>
            <h3>3. 我可以建立多份編排嗎？</h3>
            <p>可以。</p>
            <p>不同主題可以建立不同編排，例如一份是詩篇靈修，一份是主日信息整理。</p>
            <p>使用時需要設定目前編排，方便札記庫知道文章要加入哪一份編排。</p>
            <h3>4. 空編排建立後要做什麼？</h3>
            <p>空編排建立後，可以點選「前往札記庫加入文章」。</p>
            <p>系統會把該編排設為目前選稿編排，使用者接著可以在札記庫勾選文章加入編排。</p>
            <h3>5. 成書匯出設定會立刻產生 EPUB 嗎？</h3>
            <p>不會。</p>
            <p>成書匯出設定只是補齊正式成書資訊，例如書名、副標、作者、簡介、前言與後記。</p>
            <p>儲存後不會立即匯出 EPUB。</p>
            <h3>6. 匯出的 EPUB 可以傳給別人嗎？</h3>
            <p>可以。</p>
            <p>EPUB 檔案可以下載後傳給他人，對方可以用支援 EPUB 的閱讀 App 開啟。</p>
            <p>例如 iPhone 的「書籍 App」、Android 的「Google Play 圖書 App」，或其他 EPUB 閱讀器。</p>
            <h3>7. 書櫃裡的外部 EPUB 會同步到雲端嗎？</h3>
            <p>目前外部匯入 EPUB 主要保存在目前裝置中。</p>
            <p>若更換裝置或清除瀏覽器資料，外部匯入書籍可能會消失。</p>
            <h3>8. 為什麼外部 EPUB 匯入失敗？</h3>
            <p>可能原因包括：</p>
            <ul>
              <li>檔案不是 EPUB 格式</li>
              <li>EPUB 有 DRM 保護</li>
              <li>EPUB 結構特殊</li>
              <li>壓縮格式不支援</li>
              <li>檔案損壞</li>
            </ul>
            <p>可以先改用其他 EPUB 檔案測試，確認是否為單一檔案問題。</p>
            <h3>9. 為什麼舊書沒有顯示新的排版效果？</h3>
            <p>部分排版功能需要重新匯出書籍後才會套用。</p>
            <p>若書籍是在舊版本匯出的，建議重新從編排匯出一次。</p>
          </section>

          <section id="manual-habits" class="manual-section">
            <h2>十、推薦操作習慣</h2>
            <ul>
              <li>每天先專心寫札記，不急著成書。</li>
              <li>每週回顧札記庫，把成熟文章加入目前選稿編排。</li>
              <li>每月建立或整理選稿編排。</li>
              <li>成書前先預覽內容與章節順序。</li>
              <li>成書匯出前先補齊書名、作者、簡介、前言與後記。</li>
              <li>匯出 EPUB 後，實際用手機閱讀一次，確認閱讀體驗。</li>
              <li>重要書籍建議下載備份，不要只放在瀏覽器書櫃中。</li>
              <li>外部 EPUB 若很重要，也建議另外保留原始檔案。</li>
            </ul>
          </section>

          <section id="manual-example" class="manual-section">
            <h2>十一、完整流程範例</h2>
            <p>假設使用者想把一個月的詩篇靈修整理成一本電子書，可以這樣操作：</p>
            <ol>
              <li>第一天到第三十天，每天在「寫札記」建立一篇詩篇靈修。</li>
              <li>每篇札記都填寫標題、經文、分類、標籤、摘要與全文。</li>
              <li>每週進入「札記庫」，挑選文字較完整的文章。</li>
              <li>月底進入「選稿編排」，建立一份編排，命名為「詩篇靈修札記」。</li>
              <li>前往「札記庫」，把適合的文章加入目前選稿編排。</li>
              <li>回到「選稿編排」，整理章節順序。</li>
              <li>確認每篇文章標題、段落、小標題與經文格式。</li>
              <li>開啟「成書匯出設定」，填寫書名、作者、書籍簡介、前言與後記。</li>
              <li>進入「成書匯出」，確認內容後匯出 EPUB。</li>
              <li>匯出後加入書櫃，打開閱讀檢查。</li>
              <li>確認無誤後，下載 EPUB 保存，也可以分享給他人閱讀。</li>
            </ol>
          </section>

          <section id="manual-summary" class="manual-section">
            <h2>十二、使用流程總結</h2>
            <p>靈修札記成書系統的核心精神，是幫助使用者把每天零散的靈修文字，逐步整理成長期可保存、可閱讀、可分享的屬靈作品。</p>
            <p>最重要的操作順序可以記成：</p>
            <p>先寫下來。</p>
            <p>再整理出來。</p>
            <p>再挑選出來。</p>
            <p>再編排成書。</p>
            <p>最後保存與閱讀。</p>
            <p>只要持續累積，原本分散的靈修札記，就能逐漸成為一本有主題、有章節、有閱讀價值的電子書。</p>
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

function saveAutoBackups(backups = []) {
  const list = Array.isArray(backups) ? backups.slice(-10) : [];
  saveJson(STORAGE_KEYS.autoBackups, list);
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
  saveAutoBackups(backups);
  return true;
}

function runAutoBackupCheck() {
  if (!state.currentUser || state.isAutoBackingUp) return;
  const now = new Date();
  const slot = getCurrentAutoBackupSlot(now);
  if (!slot) return;
  const currentUserEmail = String(state.currentUser?.email || '').trim().toLowerCase();
  if (!currentUserEmail) return;
  const currentDate = `${String(now.getFullYear())}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
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
    if (!saved) return;
    userMeta[slot] = true;
    dayMeta[currentUserEmail] = userMeta;
    meta[currentDate] = dayMeta;
    saveAutoBackupMeta(trimAutoBackupMeta(meta, now));
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
    snapshot.generatedLibrary = cloudLibrary.books.map(book => ({
      ...JSON.parse(JSON.stringify(book || {})),
      library_book_chapters: JSON.parse(JSON.stringify(cloudLibrary.chapters.get(book.id) || [])),
      source: 'generated',
    }));
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

function requestDangerRestoreConfirmation(backup = {}) {
  const notesCount = Array.isArray(backup.notes) ? backup.notes.length : 0;
  const draftsCount = Array.isArray(backup.drafts) ? backup.drafts.length : 0;
  const libraryCount = Array.isArray(backup.library) ? backup.library.length : 0;
  const currentEmail = getCurrentUserEmail();
  const backupEmail = String(backup.user || '').trim().toLowerCase();
  const mismatchWarning = currentEmail && backupEmail && currentEmail !== backupEmail
    ? `\n警告：備份使用者 ${String(backup.user || '')} 與目前登入帳號 ${String(state.currentUser?.email || '')} 不一致`
    : '';
  const value = window.prompt(
    `⚠ 這個操作會刪除目前所有資料並用備份覆蓋\n請輸入 RESTORE 才能繼續\n\nnotes：${notesCount}\ndrafts：${draftsCount}\nlibrary：${libraryCount}${mismatchWarning}`,
    '',
  );
  return value === 'RESTORE';
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
  if (!requestDangerRestoreConfirmation(backup)) {
    showToast('沒有輸入 RESTORE，已取消覆蓋還原。');
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
  if (text.includes('email not confirmed') || text.includes('email_not_confirmed')) return '此 Email 尚未完成驗證，請先完成信箱驗證。';
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
function enterPasswordRecoveryMode() {
  state.passwordRecoveryActive = true;
  state.currentUser = null;
  teardownCloudRealtime();
  setSyncState({ status: '尚未登入', detail: '請先設定新密碼後再重新登入。', at: '' });
  clearAuthRecoveryUrl();
  refreshUi();
  openAuthInline('password-recovery');
}
function showInvalidPasswordRecoveryLink() {
  state.passwordRecoveryActive = false;
  state.currentUser = null;
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
  els.signoutBtn.addEventListener('click', () => handleSignOut().catch(handleError));
  els.accountSignoutBtn?.addEventListener('click', () => handleSignOut().catch(handleError));
  els.desktopSidebarSignoutBtn?.addEventListener('click', () => handleSignOut().catch(handleError));
  els.refreshBtn?.addEventListener('click', () => loadAllData({ syncReason: '已手動重新整理雲端資料。' }).then(refreshUi).then(() => showToast('資料已重新整理。')).catch(handleError));
  els.forceSyncBtn?.addEventListener('click', () => loadAllData({ syncReason: '已手動同步雲端資料。' }).then(() => showToast('同步完成。')).catch(handleError));
  els.topbarForceSyncBtn?.addEventListener('click', () => loadAllData({ syncReason: '已手動同步雲端資料。' }).then(() => showToast('同步完成。')).catch(handleError));
  els.pushLocalToCloudBtn?.addEventListener('click', () => uploadLocalDataToCloud().catch(handleError));
  els.downloadBackupBtn?.addEventListener('click', () => { try { downloadBackupJson(); } catch (error) { handleError(error); } });

  bindViewTriggers();
  els.quickNewNote.addEventListener('click', () => { setView('notes'); clearNoteForm(); });
  els.quickNewBook.addEventListener('click', () => { setView('books'); clearBookForm(); });
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
  els.noteForm.addEventListener('submit', event => { event.preventDefault(); saveNote().catch(handleError); });
  els.noteForm.addEventListener('input', event => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) renderNotePreview();
  });
  els.noteForm.addEventListener('change', event => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) renderNotePreview();
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
  els.closeSupportModal?.addEventListener('click', closeSupportModal);
  els.supportModalBackdrop?.addEventListener('click', closeSupportModal);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !els.supportModal?.classList.contains('hidden')) closeSupportModal();
    if (event.key === 'Escape' && !els.authSettingsSheet?.classList.contains('hidden')) closeAuthSettings();
    if (event.key === 'Escape' && !els.authInlinePanel?.classList.contains('hidden')) closeAuthInline();
    if (event.key === 'Escape' && !els.accountSettingsModal?.classList.contains('hidden')) closeAccountSettingsModal();
    if (event.key === 'Escape' && !els.notePreviewModal?.classList.contains('hidden')) closeNotePreview();
    if (event.key === 'Escape' && state.bookDraftModalOpen) closeBookDraftModal();
    if (event.key === 'Escape' && state.bookExportSettingsModalOpen) closeBookExportSettingsModal();
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
    showToast('\u5e33\u6236\u5df2\u5efa\u7acb\uff0c\u8acb\u4f9d\u7167 Supabase \u8a2d\u5b9a\u5b8c\u6210\u9a57\u8b49\u3002');
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
  await refreshImportedLibraryState();
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
      include_chapter_summary: !!book.include_chapter_summary,
    }));
    state.snapshots = (snapshotsRes.data || []).map(s => ({ ...s, snapshot_json: parseMaybeJson(s.snapshot_json, null) }));
    await loadCloudLibrary(userId);
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
  editorPanel?.querySelector('.panel-header h2')?.replaceChildren(document.createTextNode('寫札記'));
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
  modalEls.description.value = book.description || '';
  modalEls.template.value = book.template_code || 'devotion';
  modalEls.preface.value = book.preface || '';
  modalEls.afterword.value = book.afterword || '';
  modalEls.cover.value = '';
  renderBookExportCoverPreview(book.cover_data_url || '', getBookDraftLabel(book));
}

function openBookExportSettingsModal(bookId = '') {
  if (bookId) state.selectedBookId = bookId;
  const book = getSelectedBook();
  if (!book) throw new Error('請先選取一份選稿編排。');
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
  const book = state.books.find(item => item.id === bookId);
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
      description: modalEls.description.value.trim(),
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
  document.querySelectorAll('.home-summary-cards .summary-card')[1]?.querySelector('.summary-content span')?.replaceChildren(document.createTextNode('書籍'));
  document.querySelectorAll('.home-summary-cards .summary-card')[2]?.querySelector('.summary-content span')?.replaceChildren(document.createTextNode('書櫃'));
  document.querySelector('#summary-notes-count + small')?.replaceChildren(document.createTextNode('篇'));
  document.querySelector('#summary-books-count + small')?.replaceChildren(document.createTextNode('本'));
  document.querySelector('#library-count + small')?.replaceChildren(document.createTextNode('已完成'));
  document.querySelector('#quick-new-note strong')?.replaceChildren(document.createTextNode('寫一篇札記'));
  document.querySelector('#quick-new-book strong')?.replaceChildren(document.createTextNode('建立一本書'));
  document.querySelector('.home-recent-panel .panel-header h2')?.replaceChildren(document.createTextNode('最近編輯札記'));
  document.querySelector('#recent-books-heading')?.replaceChildren(document.createTextNode('最近編輯書冊'));
  document.querySelector('#view-all-notes-btn')?.replaceChildren(document.createTextNode('查看全部'));
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
  renderContentLibrary();
  renderBooks();
  renderSelectedBookPanel();
  renderLibrary();
  renderAdminDashboard();
  renderReaderSettings();
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
    const summary = sanitizeDisplayText(book.description, '尚無摘要');
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
  if (els.contentLibrarySelectionCount) {
    els.contentLibrarySelectionCount.textContent = selectedBook
    ? `已選 ${selectedCount} 篇，目前編排 ${displayChapters.length} 章`
      : `已選 ${selectedCount} 篇`;
  }
  if (els.contentLibraryBookHint) {
    els.contentLibraryBookHint.textContent = selectedBook
    ? `目前編排：${getBookDraftLabel(selectedBook)}${hasBookArrangementDraft(selectedBook.id) ? '（尚未儲存）' : ''}`
    : '請先建立或開啟一份選稿編排';
  }
  if (els.contentLibraryAddSelected) {
    els.contentLibraryAddSelected.disabled = !selectedBook || !selectedCount || state.bookArrangementSaving;
  }
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

function openBookDraftModal(bookId = '', { focusChapters = false } = {}) {
  if (bookId) state.selectedBookId = bookId;
  state.bookDraftModalOpen = true;
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
  refreshUi();
}

function focusSelectedDraftPanel(bookId = '') {
  openBookDraftModal(bookId, { focusChapters: true });
}

function setCurrentBookDraft(bookId = '') {
  if (!bookId) return;
  state.selectedBookId = bookId;
  refreshUi();
}

function goToContentLibraryForBookDraft(bookId = '') {
  if (bookId) state.selectedBookId = bookId;
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
  const panels = booksView.querySelectorAll('.panel');
  const [draftFormPanel, draftListPanel, draftOverviewPanel] = panels;
  booksView.classList.add('book-draft-workspace');
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

  draftFormPanel?.querySelector('.panel-header h2')?.replaceChildren(document.createTextNode('建立選稿編排'));
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
    submitBtn.textContent = els.bookId?.value ? '更新編排' : '建立編排';
    submitBtn.classList.add('book-draft-submit-btn');
  }
  if (els.deleteBookBtn) els.deleteBookBtn.textContent = '刪除編排';

  draftListPanel?.querySelector('.panel-header h2')?.replaceChildren(document.createTextNode('選稿編排'));
  draftOverviewPanel?.querySelector('.panel-header h2')?.replaceChildren(document.createTextNode('目前選稿編排'));
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
      goLibraryBtn.addEventListener('click', () => goToContentLibraryForBookDraft(state.selectedBookId));

      const focusChaptersBtn = document.createElement('button');
      focusChaptersBtn.id = 'focus-draft-chapters-btn';
      focusChaptersBtn.type = 'button';
      focusChaptersBtn.className = 'ghost-btn';
      focusChaptersBtn.textContent = '整理章節';
      focusChaptersBtn.addEventListener('click', () => focusSelectedDraftPanel());

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
      exportSettingsBtn.addEventListener('click', () => openBookExportSettingsModal(state.selectedBookId));
    }
    rightFooter.prepend(exportSettingsBtn);
    const saveBtn = document.getElementById('save-book-arrangement-btn');
    if (saveBtn) rightFooter.prepend(saveBtn);
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
  const book = getSelectedBook();
  if (!book) throw new Error('請先到成書工作台建立或選擇一份編排。');
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
  if (!addedCount) {
      throw new Error(skippedCount ? '所選文章都已在目前選稿編排中。' : '沒有可加入的文章。');
  }
  setBookArrangementDraft(book.id, nextChapters);
  state.contentLibrarySelectedNoteIds = [];
  refreshUi();
  const totalChapters = getBookArrangementDraft(book.id)?.length || nextChapters.length;
  const bookTitle = book.title || '未命名書籍';
  showToast(skippedCount
      ? `已加入 ${addedCount} 篇到「${bookTitle}」，目前選稿編排共 ${totalChapters} 章，略過 ${skippedCount} 篇已在編排中的文章。`
      : `已加入 ${addedCount} 篇到「${bookTitle}」，目前選稿編排共 ${totalChapters} 章。`);
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

function renderDesktopBookshelfCard() {
  if (!els.desktopBookshelfList) return;
  const books = getAllLibraryBooksForView().slice(0, 4);
  if (!books.length) {
    els.desktopBookshelfList.innerHTML = `
      <div class="bookshelf-empty-state">
        <strong>尚未建立書籍</strong>
        <p>建立一本書，開始整理你的札記</p>
      </div>`;
    return;
  }
  const snapshotBookIds = new Set(state.snapshots.map(snapshot => snapshot.book_id).filter(Boolean));
  els.desktopBookshelfList.innerHTML = books.map((book, index) => {
    const title = sanitizeDisplayText(book.title, `書籍 ${index + 1}`);
    const chapterCount = Number(book.total_chapters || book.totalChapters || (Array.isArray(book.chapters) ? book.chapters.length : 0));
    const status = isSystemLibraryBook(book)
      ? '系統預設'
      : book.source === 'imported_epub'
        ? '外部匯入'
        : snapshotBookIds.has(book.id)
          ? '已完成'
          : (chapterCount > 0 ? '整理中' : '已建立');
    const coverUrl = getLibraryCoverUrl(book);
    return `
      <article class="bookshelf-book-card">
        ${coverUrl
          ? `<img class="bookshelf-cover-thumb" src="${coverUrl}" alt="${escapeHtml(title)}封面" />`
          : `<div class="bookshelf-cover-placeholder" aria-hidden="true">封面</div>`}
        <div class="bookshelf-book-copy">
          <strong>${escapeHtml(title)}</strong>
          <div class="bookshelf-book-meta">
            <span>${chapterCount} 章</span>
            <span>${status}</span>
          </div>
        </div>
      </article>`;
  }).join('');
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
  if (!(els.noteContent instanceof HTMLTextAreaElement)) {
    throw new Error('找不到札記內容輸入框。');
  }
  return els.noteContent;
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
}

function clearNoteForm() {
  els.noteForm.reset();
  els.noteId.value = '';
  els.deleteNoteBtn.classList.add('hidden');
  resetScripturePreview({ clearApplied: true });
  els.scriptureAppendToContent.checked = true;
  renderNotePreview();
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
  if (!els.booksList) return;
  if (!state.books.length) {
    els.booksList.className = 'list-stack empty-state';
    els.booksList.textContent = '還沒有選稿編排。';
    return;
  }
  els.booksList.className = 'list-stack';
  els.booksList.innerHTML = state.books.map(book => {
    const chapterCount = getBookDisplayChapters(book).length;
    const isEmptyDraft = chapterCount === 0;
    const description = (book.description || '').slice(0, 140)
      || (isEmptyDraft ? '尚未收錄札記，請先前往札記庫加入文章。' : '尚未填寫整理說明');
    return `
      <article class="card book-draft-card ${book.id === state.selectedBookId ? 'selected' : ''}">
        <div class="book-draft-card-header">
          <h3>${escapeHtml(getBookDraftLabel(book))}</h3>
          <span class="badge book-draft-status-badge ${getBookDraftStatusTone(book)}">${escapeHtml(getBookDraftStatus(book))}</span>
        </div>
        <div class="card-meta book-draft-meta-row">
          <span>已收錄 ${chapterCount} 篇札記</span>
          <span>更新於 ${escapeHtml(formatDate(book.updated_at || book.created_at))}</span>
        </div>
        <div class="book-draft-scope">${escapeHtml(getBookDraftScopeSummary(book))}</div>
        <div class="caption book-draft-description ${isEmptyDraft ? 'is-empty-hint' : ''}">${escapeHtml(description)}</div>
        <div class="card-actions book-draft-actions">
          ${isEmptyDraft
            ? `
              <button class="secondary-btn" data-go-content-library="${book.id}">前往札記庫加入文章</button>
              <button class="ghost-btn" data-select-book="${book.id}">設為目前編排</button>
              <button class="ghost-btn" data-open-book-draft="${book.id}">查看編排</button>
              <button class="ghost-btn book-draft-delete-btn" data-delete-book-draft="${book.id}">刪除</button>
            `
            : `
              <button class="secondary-btn" data-open-book-draft="${book.id}">整理章節</button>
              <button class="ghost-btn" data-select-book="${book.id}">設為目前編排</button>
              <button class="ghost-btn" data-go-content-library="${book.id}">前往札記庫加入文章</button>
              <button class="ghost-btn book-draft-delete-btn" data-delete-book-draft="${book.id}">刪除</button>
            `}
        </div>
      </article>
    `;
  }).join('');
  els.booksList.querySelectorAll('[data-select-book]').forEach(btn => btn.addEventListener('click', () => setCurrentBookDraft(btn.dataset.selectBook)));
  els.booksList.querySelectorAll('[data-go-content-library]').forEach(btn => btn.addEventListener('click', () => goToContentLibraryForBookDraft(btn.dataset.goContentLibrary)));
  els.booksList.querySelectorAll('[data-open-book-draft]').forEach(btn => btn.addEventListener('click', () => focusSelectedDraftPanel(btn.dataset.openBookDraft)));
  els.booksList.querySelectorAll('[data-delete-book-draft]').forEach(btn => btn.addEventListener('click', () => deleteBook(btn.dataset.deleteBookDraft).catch(handleError)));
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
  els.bookDescription.value = book.description || '';
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
  const existing = state.books.find(item => item.id === els.bookId.value);
  const isNewDraft = !existing;
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
  state.selectedBookId = payload.id;
  if (els.bookSaveFeedback) {
    els.bookSaveFeedback.textContent = isNewDraft ? '編排已建立，請前往札記庫加入文章。' : '編排已儲存';
    els.bookSaveFeedback.classList.remove('hidden');
  }
  await loadAllData({ silent: true, syncReason: state.supabase ? '編排儲存後同步' : '' });
  state.selectedBookId = payload.id;
  setView('books');
  showToast(isNewDraft
    ? `已建立「${payload.title}」，請前往札記庫加入文章。`
    : '編排已儲存');
}

async function deleteBook(targetBookId = els.bookId.value) {
  requireUser();
  const bookId = targetBookId || els.bookId.value;
  if (!bookId) return;
  const book = state.books.find(item => item.id === bookId);
  const bookTitle = getBookDraftLabel(book);
  if (!confirm(`確定要刪除「${bookTitle}」這份選稿編排嗎？這只會刪除這份選稿編排，不會刪除原始札記。`)) return;
  if (state.supabase) {
    const { error } = await state.supabase.from('book_projects').delete().eq('id', bookId).eq('user_id', getUserId());
    if (error) throw error;
  } else {
    const books = loadJson(STORAGE_KEYS.books, []).filter(item => !(item.id === bookId && item.user_id === getUserId()));
    saveJson(STORAGE_KEYS.books, books);
  }
  const nextSelectedBookId = state.books.find(item => item.id !== bookId)?.id || null;
  clearBookForm();
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
  els.tocPreviewList.className = 'toc-preview-list';
  els.tocPreviewList.innerHTML = `<ol>${tocChapters.map(({ chapter, index }) => `
    <li><span>第 ${index + 1} 章</span><strong>${escapeHtml(chapter.chapter_title || '未命名章節')}</strong></li>
  `).join('')}</ol>`;
}

function getSelectedBook() {
  return state.books.find(book => book.id === state.selectedBookId) || null;
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
    renderExportSuccessActions(null);
    return;
  }
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
      <div class="caption">目前編排</div>
      <h2>${escapeHtml(getBookDraftLabel(book))}</h2>
      <div>${escapeHtml(book.description || '尚未填寫整理說明')}</div>
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
  if (!chapters.length) {
    els.chaptersList.className = 'list-stack empty-state';
    if (state.bookArrangementSaving) {
      els.chaptersList.textContent = '正在儲存章節編排...';
      return;
    }
    const draftLabel = getBookDraftLabel(book);
    els.chaptersList.innerHTML = `
        <div class="book-draft-empty-guide">
          <h4>這份選稿編排目前還沒有收錄文章。</h4>
          <p>請先到札記庫挑選札記，加入目前選稿編排。</p>
          <button type="button" class="secondary-btn" data-empty-draft-go-library="${book.id}">前往札記庫加入文章</button>
        </div>
    `;
    els.chaptersList.querySelector('[data-empty-draft-go-library]')?.addEventListener('click', () => {
      showToast(`請先為「${draftLabel}」加入文章。`);
      goToContentLibraryForBookDraft(book.id);
    });
      return;
  }
  els.chaptersList.className = 'list-stack';
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
  const book = getSelectedBook();
  if (!book) return;
  if (!hasBookArrangementDraft(book.id)) return;
  const draftChapters = getBookArrangementDraft(book.id) || [];
  state.bookArrangementSaving = true;
  refreshUi();
  try {
    await persistBookChanges(book.id, { chapters: normalizeBookChapters(draftChapters) });
    clearBookArrangementDraft(book.id);
    showToast('章節編排已儲存。');
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
  stageBookArrangementChange(chapters => {
    const nextChapters = chapters.filter(ch => ch.id !== chapterId);
    return nextChapters.length === chapters.length ? null : nextChapters;
  }, '章節編排尚未儲存');
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
  const chapters = getBookProjectChapters(book);
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
  if (viewName !== 'books' && state.bookExportSettingsModalOpen) closeBookExportSettingsModal();
  const isReaderView = viewName === 'reader';
  const titleMap = {
    dashboard: ['總覽', ''],
    notes: ['寫札記', '專注建立與編輯單篇札記。'],
    'content-library': ['札記庫', '從過去寫過的札記中搜尋、篩選並挑選文章，加入目前選稿編排。'],
    books: ['選稿編排', '管理成書前的選稿編排，整理章節順序並銜接成書匯出設定。'],
    'admin-dashboard': ['管理後台', '第一階段白名單入口，僅授權管理者可使用。'],
    snapshots: ['快照備份', '查看每次建立的書籍快照。'],
    library: ['書櫃', '收藏已輸出的固定版本作品，直接開啟閱讀。'],
    manual: ['操作手冊', '靈修札記成書系統使用說明'],
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

async function exportSelectedBookEpub() {
  if (state.isExporting) return;
  requireUser();
  const book = getSelectedBook();
  if (!book) throw new Error('\u8acb\u5148\u9078\u64c7\u8981\u532f\u51fa\u7684\u66f8\u7c4d\u3002');
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
        ${book.description ? renderMarkdownContent(book.description) : ''}
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
  return cloudLibrary.coverUrls.get(book.id) || book.cover_image_path || '';
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
  return getAllLibraryBooksForView().find(book => book.id === bookId) || null;
}

async function refreshLibraryCoverUrls() {
  const entries = getSystemLibraryBooks().map(book => [book.id, book.cover_image_path || '']);
  if (state.supabase && state.currentUser) {
    const cloudEntries = await Promise.all(cloudLibrary.books.map(async book => {
      if (!book.cover_image_path) return [book.id, ''];
      const { data, error } = await state.supabase.storage.from(cloudLibrary.bucket).createSignedUrl(book.cover_image_path, 60 * 20);
      return [book.id, error ? '' : data?.signedUrl || ''];
    }));
    entries.push(...cloudEntries);
  }
  cloudLibrary.coverUrls = new Map(entries);
  renderLibrary();
  renderDesktopBookshelfCard();
}

function renderLibrary() {
  const list = document.getElementById('library-list');
  const count = document.getElementById('library-count');
  if (!list) return;
  const booksForView = getAllLibraryBooksForView();
  if (count) count.textContent = String(booksForView.length);
  if (cloudLibrary.error && !booksForView.length) {
    list.className = 'library-list empty-state';
    list.innerHTML = `<h3>書櫃暫時無法同步</h3><p>${escapeHtml(cloudLibrary.error)}</p>`;
    return;
  }
  if (!booksForView.length) {
    list.className = 'library-list empty-state';
    list.innerHTML = '<h3>書櫃裡還沒有書</h3><p>可以先匯出自製 EPUB，或按上方「匯入 EPUB」把外部電子書加入書櫃。</p>';
    return;
  }
  const sortMode = document.getElementById('library-sort')?.value || 'recent-read';
  const books = [...booksForView].sort((a, b) => compareLibraryBooks(a, b, sortMode));
  list.className = 'library-list';
  list.innerHTML = books.map(book => {
    const coverUrl = getLibraryCoverUrl(book);
    const progress = Math.max(0, Math.min(1, book.reading_progress || 0));
    const sourceBadge = book.source === 'imported_epub'
      ? '<span class="library-badge library-badge-imported">外部匯入</span>'
      : isSystemLibraryBook(book)
        ? '<span class="library-badge library-badge-system">系統預設</span>'
        : '';
    const createdAt = book.created_at || book.importedAt || '';
    const selected = book.id === cloudLibrary.selectedBookId || book.id === cloudLibrary.readerBook?.id;
    const description = book.description
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
    return `<article class="library-book ${selected ? 'selected' : ''} ${book.source === 'imported_epub' ? 'imported-book' : ''}"><div class="library-cover">${coverUrl ? `<img src="${coverUrl}" alt="${escapeHtml(book.title)}封面" />` : fallbackCover}</div><div class="library-book-main"><div><div class="library-book-top"><h3>${escapeHtml(book.title)}</h3>${sourceBadge}</div><div class="card-meta"><span>${escapeHtml(book.author || '未填作者')}</span><span>建立：${createdAt ? formatDate(createdAt) : '未記錄'}</span><span>最後閱讀：${book.last_read_at ? formatDate(book.last_read_at) : '尚未閱讀'}</span><span>${detailLabel}</span></div><p>${escapeHtml(description)}</p></div><div class="library-progress"><span>${Math.round(progress * 100)}%</span><div><i style="width:${Math.round(progress * 100)}%"></i></div></div><div class="card-actions"><button class="primary-btn" data-open-library-book="${book.id}" data-library-source="${book.source}">開啟閱讀</button><button class="ghost-btn" data-download-library-epub="${book.id}" data-library-source="${book.source}">下載 EPUB</button>${deleteAction}</div></div></article>`;
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

async function deleteImportedLibraryBook(bookId) {
  const book = getImportedBook(bookId);
  if (!book) return;
  if (!confirm(`確定要刪除外部匯入書「${book.title}」嗎？這會移除本機 EPUB 與封面。`)) return;
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
  await openReaderChapter(Math.min(book.current_chapter || 0, Math.max(cloudLibrary.readerChapters.length - 1, 0)), { restoreProgress: true });
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
  await openReaderChapter(Math.min(book.current_chapter || 0, Math.max(cloudLibrary.readerChapters.length - 1, 0)), { restoreProgress: true });
  await stabilizeReaderAfterOpen();
}

async function downloadLibraryBookEpub(bookId) {
  requireCloudLibrary();
  const book = getLibraryBook(bookId);
  if (!book) throw new Error('找不到這本書。');
  if (!book.epub_file_path) throw new Error('這本書沒有 EPUB 儲存路徑，請重新匯出後再下載。');
  const { data, error } = await state.supabase.storage.from(cloudLibrary.bucket).download(book.epub_file_path);
  if (error) throw new Error(buildStorageError(error, '下載 EPUB 失敗'));
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
    #view-reader .reader-panel { position: absolute; top: 24px; right: clamp(16px, 4vw, 48px); bottom: calc(var(--reader-stage-bottom) + 20px); z-index: 8; width: min(430px, calc(100vw - 32px)); display: flex; flex-direction: column; overflow: hidden; border: 1px solid rgba(80,70,55,.14); border-radius: 18px; background: rgba(255,253,248,.98); color: #2f2a24; box-shadow: 0 24px 60px rgba(45,35,25,.24); pointer-events: auto; backdrop-filter: blur(18px); }
    #view-reader.reader-dark .reader-panel { border-color: rgba(255,255,255,.12); background: rgba(28,28,28,.98); color: #eee7dd; box-shadow: 0 24px 60px rgba(0,0,0,.4); }
    #view-reader .reader-panel-header { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 16px 18px; border-bottom: 1px solid rgba(80,70,55,.12); }
    #view-reader.reader-dark .reader-panel-header { border-color: rgba(255,255,255,.12); }
    #view-reader .reader-panel-title { margin: 0; font-size: 1rem; line-height: 1.35; color: inherit; }
    #view-reader .reader-panel-close { min-width: 36px; min-height: 36px; border: 0; border-radius: 999px; background: rgba(63,152,144,.12); color: inherit; font-weight: 800; }
    #view-reader .reader-panel-body { min-height: 0; flex: 1; overflow: auto; padding: 16px 18px 20px; }
    #view-reader .reader-panel-book-title { margin: 0 0 4px; color: #21484c; font-weight: 800; }
    #view-reader.reader-dark .reader-panel-book-title { color: #dcefeb; }
    #view-reader .reader-panel-muted { margin: 0 0 14px; color: #74675d; font-size: .9rem; line-height: 1.55; }
    #view-reader.reader-dark .reader-panel-muted { color: #b8aea4; }
    #view-reader .reader-panel-toc { display: grid; gap: 6px; }
    #view-reader .reader-panel-toc-item { width: 100%; min-height: 42px; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 0 12px; border: 1px solid transparent; border-radius: 10px; background: transparent; color: inherit; text-align: left; }
    #view-reader .reader-panel-toc-item.active { border-color: rgba(63,152,144,.35); background: rgba(63,152,144,.13); color: #21484c; font-weight: 800; }
    #view-reader.reader-dark .reader-panel-toc-item.active { color: #dcefeb; }
    #view-reader .reader-panel-toc-item small { color: #7a6d62; font-size: .78rem; white-space: nowrap; }
    #view-reader.reader-dark .reader-panel-toc-item small { color: #aaa099; }
    #view-reader .reader-search-field, #view-reader .reader-settings-sheet select, #view-reader .reader-settings-sheet input { width: 100%; }
    #view-reader .reader-search-field { min-height: 44px; padding: 0 12px; border: 1px solid rgba(80,70,55,.2); border-radius: 10px; background: #fff; color: #2f2a24; }
    #view-reader.reader-dark .reader-search-field { border-color: rgba(255,255,255,.16); background: #242424; color: #eee7dd; }
    #view-reader .reader-settings-sheet { display: grid; gap: 16px; }
    #view-reader .reader-settings-sheet label { display: grid; gap: 8px; color: inherit; font-size: .9rem; font-weight: 700; }
    #view-reader .reader-setting-levels { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px; }
    #view-reader .reader-setting-level-button { min-height: 40px; border: 1px solid rgba(80,70,55,.16); border-radius: 10px; background: rgba(255,255,255,.72); color: inherit; font-weight: 800; }
    #view-reader .reader-setting-level-button.active { border-color: rgba(63,152,144,.62); background: #3f9890; color: #fff; box-shadow: 0 8px 18px rgba(63,152,144,.18); }
    #view-reader.reader-dark .reader-setting-level-button { border-color: rgba(255,255,255,.14); background: rgba(255,255,255,.08); }
    #view-reader.reader-dark .reader-setting-level-button.active { border-color: rgba(220,239,235,.6); background: #3f9890; color: #fff; }
    #view-reader .reader-bookmark-summary { display: grid; gap: 8px; padding: 14px; border-radius: 12px; background: rgba(63,152,144,.1); color: inherit; }
    #view-reader .reader-bookmark-summary strong { color: #21484c; }
    #view-reader.reader-dark .reader-bookmark-summary strong { color: #dcefeb; }
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
      #view-reader .reader-panel { top: auto; right: 10px; bottom: calc(var(--reader-stage-bottom) + 10px); left: 10px; width: auto; max-height: min(78dvh, 620px); border-radius: 18px 18px 12px 12px; }
      #view-reader .reader-book-heading h2 { font-size: .95rem; }
      #view-reader .reader-turn-zone { width: 28%; }
    }
  `;
  document.head.appendChild(style);
}

const READER_PANEL_TYPES = new Set(['menu', 'toc', 'search', 'settings', 'bookmarks']);
const READER_FONT_SIZE_LEVELS = [16, 17, 18, 20, 22, 24];
const READER_LINE_HEIGHT_LEVELS = [1.55, 1.65, 1.75, 1.85, 1.95, 2.05];

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

function getReaderCurrentChapterTitle() {
  const chapter = cloudLibrary.readerChapters[cloudLibrary.readerChapterIndex];
  return chapter?.title || `第 ${cloudLibrary.readerChapterIndex + 1} 章`;
}

function getReaderCurrentPageLabel() {
  return document.getElementById('reader-page-text')?.textContent || `第 ${cloudLibrary.readerPageIndex + 1} 頁`;
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
  return `
    <p class="reader-panel-book-title">${escapeHtml(book?.title || '閱讀模式')}</p>
    <div class="reader-bookmark-summary">
      <span>目前位置</span>
      <strong>${escapeHtml(getReaderCurrentChapterTitle())}｜${escapeHtml(getReaderCurrentPageLabel())}</strong>
    </div>
    <p class="reader-panel-muted">書籤功能將於後續版本加入。本階段先顯示目前閱讀位置，不寫入 Supabase。</p>
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
  showToast('正在匯入 EPUB...');
  const importedBook = await importExternalEpub(file);
  cloudLibrary.selectedBookId = importedBook.id;
  renderLibrary();
  showToast('已加入書櫃。');
}

async function importExternalEpub(file) {
  let parsed;
  try {
    parsed = await parseExternalEpub(file);
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
  const entries = await unzipStoredEntries(epubBlob);
  const epubChapters = extractEpubSpineChapters(entries);
  const sourceChapters = epubChapters.length > manifestChapters.length ? epubChapters : manifestChapters;
  return sourceChapters.map(chapter => {
    const entry = entries.get(chapter.chapter_path) || entries.get(chapter.href) || entries.get(`OEBPS/${chapter.href}`);
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
  if (source === 'imported_epub') {
    body.querySelectorAll('*').forEach(node => {
      [...node.attributes].forEach(attribute => {
        const name = attribute.name.toLowerCase();
        const value = attribute.value || '';
        if (name.startsWith('on')) {
          node.removeAttribute(attribute.name);
          return;
        }
        if (['src', 'href', 'xlink:href'].includes(name)) {
          const normalized = value.trim().toLowerCase();
          if (normalized.startsWith('javascript:') || normalized.startsWith('data:text/html')) {
            node.removeAttribute(attribute.name);
          }
        }
      });
    });
  }
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

async function parseExternalEpub(epubBlob) {
  const entries = await unzipStoredEntries(epubBlob);
  if (entries.has('META-INF/encryption.xml') || entries.has('META-INF/rights.xml')) {
    throw new Error('EPUB appears encrypted or DRM protected');
  }
  const containerText = readEpubContainer(entries);
  const opfPath = parseContainerXml(containerText);
  if (!opfPath) throw new Error('找不到 OPF rootfile');
  const opfEntry = entries.get(opfPath);
  if (!opfEntry?.text) throw new Error('找不到 OPF 檔案');
  const opfData = parseOpfDocument(opfEntry.text, opfPath);
  const chapters = buildExternalEpubChapters(opfData, entries);
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

function buildExternalEpubChapters(opfData, entries = new Map()) {
  return opfData.spine
    .map((spineItem, index) => {
      const manifestItem = opfData.manifest.get(spineItem.idref);
      if (!manifestItem) return null;
      if (!/xhtml|html|xml/i.test(manifestItem.mediaType || '')) return null;
      const chapterText = entries.get(manifestItem.path)?.text || '';
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
  if (event.target.id === 'reader-font-size') updateReaderSetting('fontSize', Number(event.target.value));
  if (event.target.id === 'reader-line-height') updateReaderSetting('lineHeight', Number(event.target.value));
  if (event.target.dataset.readerSetting === 'fontSize') updateReaderSetting('fontSize', Number(event.target.value));
  if (event.target.dataset.readerSetting === 'lineHeight') updateReaderSetting('lineHeight', Number(event.target.value));
  if (event.target.closest('#view-reader')) showReaderControls();
});

document.addEventListener('keydown', event => {
  if (document.getElementById('view-reader')?.classList.contains('active')) {
    if (event.key === 'Escape' && cloudLibrary.readerActivePanel) {
      event.preventDefault();
      closeReaderPanel();
      return;
    }
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
