const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { webkit } = require('playwright');

const origin = 'http://127.0.0.1:4255';
const draftKey = 'devotion-current-note-draft';
const owner = { id: 'fixture-a', email: 'alice@example.invalid', role: 'authenticated', user_metadata: {} };
const otherOwner = { ...owner, id: 'fixture-b', email: 'bob@example.invalid' };
const date = '2026-11-01T00:00:00Z';
const notes = Array.from({ length: 32 }, (_, index) => ({
  id: `fixture-note-${index}`,
  user_id: owner.id,
  title: `札記 ${index + 1}`,
  content: '供編輯與搜尋驗收使用。'.repeat(12),
  status: 'published',
  created_at: date,
  updated_at: date,
}));
const chapters = notes.slice(0, 31).map((note, index) => ({
  id: `fixture-chapter-${index}`,
  source_note_id: note.id,
  chapter_title: note.title,
  chapter_order: index,
  include_in_toc: true,
}));
const book = { id: 'fixture-book', user_id: owner.id, title: '測試書稿', language: 'zh-Hant', created_at: date, updated_at: date };

function session(user, serial) {
  const encodedToken = [
    { alg: 'HS256', typ: 'JWT' },
    { sub: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + 3600 },
  ].map(value => Buffer.from(JSON.stringify(value)).toString('base64url')).join('.');
  return { access_token: `${encodedToken}.fixture`, refresh_token: `fixture-${serial}`, expires_in: 3600, token_type: 'bearer', user };
}

async function run(browser, width) {
  const context = await browser.newContext({
    viewport: { width, height: 720 },
    isMobile: width < 600,
    hasTouch: width < 600,
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
  });
  try {
    let signedIn = owner;
    let refreshMode = 'normal';
    let refreshCalls = 0;
    let detailReads = 0;
    let metadataReads = 0;
    let chapterRows = chapters;
    let bookRow = book;
    let sequence = 0;
    const logoutScopes = [];
    const errors = [];
    await context.routeWebSocket('**/*', socket => socket.close());
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin) return route.abort('blockedbyclient');
      const json = (value, status = 200, headers) => route.fulfill({ json: value, status, headers });
      if (url.pathname === '/auth/v1/token') {
        if (url.searchParams.get('grant_type') === 'password') {
          signedIn = request.postDataJSON().email === otherOwner.email ? otherOwner : owner;
        } else {
          refreshCalls++;
          if (refreshMode === 'rate-limit') return json({ code: 'over_request_rate_limit' }, 429, { 'Retry-After': '85' });
          if (refreshMode === 'revoked') return json({ code: 'refresh_token_not_found', msg: 'Missing refresh token' }, 400);
          if (refreshMode === 'retry-once') {
            refreshMode = 'normal';
            return json({ msg: 'Unavailable' }, 503);
          }
        }
        return json(session(signedIn, ++sequence));
      }
      if (url.pathname === '/auth/v1/logout') {
        logoutScopes.push(url.searchParams.get('scope'));
        return route.fulfill({ status: 204, body: '' });
      }
      if (url.pathname === '/auth/v1/user') return json(signedIn);
      if (url.pathname === '/rest/v1/devotion_notes') return json(signedIn === owner ? notes : []);
      if (url.pathname === '/rest/v1/book_projects') {
        if (url.searchParams.has('id')) {
          detailReads++;
          return json({ ...bookRow, chapters: chapterRows });
        }
        metadataReads++;
        return json(signedIn === owner ? [bookRow] : []);
      }
      if (url.pathname.startsWith('/rest/v1/')) return json([]);
      return route.continue();
    });

    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(({ origin }) => {
      if (location.origin !== origin) return;
      localStorage.setItem('devotion-app-config', JSON.stringify({ mode: 'custom', supabaseUrl: origin, supabaseAnonKey: 'fixture-public' }));
      const realNow = Date.now;
      window.clockOffset = 0;
      Date.now = () => realNow() + window.clockOffset;
      let sdk;
      Object.defineProperty(window, 'supabase', {
        get: () => sdk,
        set(value) {
          sdk = { ...value };
          sdk.createClient = (...args) => {
            const client = value.createClient(...args);
            window.testAuth = client.auth;
            return client;
          };
        },
        configurable: true,
      });
    }, { origin });

    const wait = (predicate, arg) => page.waitForFunction(predicate, arg, { timeout: 10_000 });
    const visible = selector => page.locator(selector).waitFor({ state: 'visible', timeout: 10_000 });
    const click = selector => page.locator(selector).click({ timeout: 10_000 });
    const input = page.locator('#note-content');
    const draftStorage = `${draftKey}:${owner.id}`;
    const storedDraft = key => page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key);
    const showView = view => wait(name => document.body.dataset.currentView === name, view);
    const menu = async view => {
      await click('[data-workspace-menu]');
      await click(`#workspace-menu [data-workspace-view="${view}"]`);
      await showView(view);
    };
    const login = async user => {
      await click('#open-login-btn');
      await page.locator('#gate-auth-email').fill(user.email);
      await page.locator('#gate-auth-password').fill('fixture-only');
      await click('[data-testid="auth-login-submit"]');
      await visible('.devotion-masthead');
    };
    const refresh = () => page.evaluate(async () => {
      const { error } = await window.testAuth.refreshSession();
      return error?.name || null;
    });
    const expire = () => page.evaluate(() => {
      const key = window.testAuth.storageKey;
      const session = JSON.parse(localStorage.getItem(key));
      session.expires_at = Math.floor(Date.now() / 1000) - 1;
      localStorage.setItem(key, JSON.stringify(session));
    });
    const editorPosition = () => input.evaluate(element => ({
      focused: document.activeElement === element,
      scrollY,
      start: element.selectionStart,
      end: element.selectionEnd,
    }));
    const chapterCount = () => page.locator('#chapters-list [data-chapter-item]').count();
    const availableNotes = () => page.getByTestId('content-library-card').count();
    const advance = milliseconds => page.evaluate(ms => { window.clockOffset += ms; }, milliseconds);
    const backgroundSync = async () => {
      const previousReads = metadataReads;
      await advance(360_000);
      await page.evaluate(() => window.dispatchEvent(new Event('online')));
      await wait(() => document.getElementById('account-settings-sync-status')?.textContent === '已同步');
      assert.equal(metadataReads, previousReads + 1);
    };

    await page.goto(`${origin}/index.html`);
    await login(owner);
    await visible('[data-review-book]');
    await click('[data-workspace-menu]');
    await page.keyboard.press('Escape');
    await wait(() => !document.getElementById('workspace-menu').open);
    assert(await page.locator('[data-workspace-menu]').evaluate(button => document.activeElement === button));
    await click('[data-workspace-new]');
    const draftText = '重新開啟時應保留的原稿。'.repeat(40);
    await input.fill(draftText);
    await input.evaluate(element => {
      element.focus({ preventScroll: true });
      element.setSelectionRange(5, 12);
      element.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
    const before = await editorPosition();
    assert(before.focused);
    assert.equal(await refresh(), null);
    assert.deepEqual(await editorPosition(), before);
    await wait(key => !!localStorage.getItem(key), draftStorage);
    // Verify that drafts written by the previous release migrate on cloud boot.
    await page.evaluate(({ key, scoped }) => {
      localStorage.setItem(key, localStorage.getItem(scoped));
      localStorage.removeItem(scoped);
    }, { key: draftKey, scoped: draftStorage });
    await page.reload();
    await showView('notes');
    await wait(text => document.querySelector('#note-content').value === text, draftText);
    assert.equal((await storedDraft(draftStorage)).content, draftText);
    assert.equal(await storedDraft(draftKey), null);

    await menu('books');
    await click('[data-testid="book-open-draft"]');
    await wait(() => document.querySelectorAll('#chapters-list [data-chapter-item]').length === 31);
    const readsBefore = detailReads;
    assert.equal(await refresh(), null);
    assert.equal(await chapterCount(), 31);
    await backgroundSync();
    assert.equal(await chapterCount(), 31);
    assert.equal(detailReads, readsBefore);
    chapterRows = chapters.map((chapter, index) => index === 0 ? { ...chapter, chapter_title: '其他裝置已更新' } : chapter);
    bookRow = { ...book, updated_at: '2026-11-02T00:00:00Z' };
    await backgroundSync();
    await wait(() => document.querySelector('[data-chapter-edit]')?.textContent === '其他裝置已更新');
    assert.equal(detailReads, readsBefore + 1);
    assert.equal(await chapterCount(), 31);

    await click('#go-content-library-btn');
    await showView('content-library');
    assert.equal(await availableNotes(), 1);
    await click('[data-content-library-preview]');
    assert.equal(await refresh(), null);
    await backgroundSync();
    assert.equal(await availableNotes(), 1);
    assert.equal(await page.locator('[data-content-library-preview]').getAttribute('aria-expanded'), 'true');
    await menu('note-reader');
    await page.goBack();
    await showView('content-library');
    assert.equal(await availableNotes(), 1);
    await page.goForward();
    await showView('note-reader');
    const noteReaderScroll = await page.evaluate(() => {
      scrollTo({ top: 260, behavior: 'instant' });
      return scrollY;
    });
    assert(noteReaderScroll > 0);
    await menu('notes');
    await page.goBack();
    await showView('note-reader');
    assert.equal(await page.evaluate(() => scrollY), noteReaderScroll);
    await page.goForward();
    await showView('notes');
    await input.fill('登入更新時的原稿');
    await expire();
    const positionBeforePause = await editorPosition();
    const refreshesBefore = refreshCalls;
    refreshMode = 'rate-limit';
    const pausedRefresh = refresh();
    await wait(() => document.querySelector('#toast')?.textContent.includes('登入更新暫停'));
    // Advance past the SDK's retry window without waiting for the exponential delays.
    await advance(31_000);
    assert.equal(await pausedRefresh, 'AuthRetryableFetchError');
    assert.equal(refreshCalls, refreshesBefore + 1);
    assert.equal(await input.inputValue(), '登入更新時的原稿');
    assert.equal(await page.locator('body').evaluate(el => el.classList.contains('auth-locked')), false);
    assert.equal((await storedDraft(draftStorage)).content, '登入更新時的原稿');
    refreshMode = 'normal';
    await advance(95_000);
    await page.evaluate(() => window.testAuth.startAutoRefresh());
    await wait(() => document.getElementById('account-settings-sync-status')?.textContent === '已同步');
    assert.equal(refreshCalls, refreshesBefore + 2);
    assert.deepEqual(await editorPosition(), positionBeforePause);
    assert.equal(await input.inputValue(), '登入更新時的原稿');

    refreshMode = 'retry-once';
    assert.equal(await refresh(), null);
    refreshMode = 'revoked';
    await expire();
    await refresh();
    await visible('#auth-gate');
    assert.equal(await input.inputValue(), '');
    assert.equal((await storedDraft(draftStorage)).content, '登入更新時的原稿');
    refreshMode = 'normal';
    await login(owner);
    await showView('notes');
    await wait(() => document.querySelector('#note-content').value === '登入更新時的原稿');

    await click('[data-workspace-menu]');
    await click('[data-workspace-signout]');
    await visible('#auth-gate');
    assert.deepEqual(logoutScopes, ['local']);
    await login(otherOwner);
    await click('[data-workspace-new]');
    await input.fill('另一個帳號的原稿');
    const otherDraftKey = `${draftKey}:${otherOwner.id}`;
    await wait(key => !!localStorage.getItem(key), otherDraftKey);
    assert.equal((await storedDraft(otherDraftKey)).content, '另一個帳號的原稿');
    assert.equal((await storedDraft(draftStorage)).content, '登入更新時的原稿');
    assert.deepEqual(errors, []);
    console.log(`WebKit ${width}px 通過登入更新、原稿保留、章節同步、選稿、上一頁及本裝置登出。`);
  } finally {
    await context.close();
  }
}

async function main() {
  const server = spawn(process.execPath, ['static-server.cjs'], {
    env: { ...process.env, PORT: new URL(origin).port, DEVOTION_ISOLATED_PREVIEW: '1', DEVOTION_SERVE_DIST: '1' },
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Preview server timeout')), 5000);
      server.once('exit', code => {
        clearTimeout(timeout);
        reject(new Error(`Preview server exited ${code}`));
      });
      server.stdout.once('data', () => {
        clearTimeout(timeout);
        resolve();
      });
    });
    const browser = await webkit.launch();
    try {
      const results = await Promise.allSettled([390, 1280].map(width => run(browser, width)));
      for (const result of results) if (result.status === 'rejected') throw result.reason;
    } finally {
      await browser.close();
    }
  } finally {
    server.kill('SIGTERM');
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
