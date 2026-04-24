const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = 'http://127.0.0.1:4173/index.html';
const artifactsDir = path.join(process.cwd(), 'artifacts');
fs.mkdirSync(artifactsDir, { recursive: true });

const seedUser = {
  id: 'local_user_smoke',
  email: 'smoke@example.com',
  password: 'smoke123',
  created_at: '2026-04-24T07:02:00.000Z',
};

const seedNotes = [
  {
    id: 'note_1',
    user_id: seedUser.id,
    title: '詩篇104默想',
    scripture_reference: '詩篇 104:1-5',
    category: '晨更',
    tags: ['敬拜'],
    summary: '安靜下來思想神創造的榮美與秩序。',
    content: '安靜下來思想神創造的榮美與秩序，學習在忙碌中重新看見恩典。',
    updated_at: '2026-04-24T07:02:00.000Z',
    created_at: '2026-04-24T06:40:00.000Z',
  },
  {
    id: 'note_2',
    user_id: seedUser.id,
    title: '信靠中的忍耐',
    scripture_reference: '雅各書 1:2-4',
    category: '札記',
    tags: ['信心'],
    summary: '等待不是空白，而是神塑造生命的時間。',
    content: '等待不是空白，而是神塑造生命的時間。',
    updated_at: '2026-04-23T21:30:00.000Z',
    created_at: '2026-04-23T21:00:00.000Z',
  },
  {
    id: 'note_3',
    user_id: seedUser.id,
    title: '主日分享草稿',
    scripture_reference: '羅馬書 8:28',
    category: '主日',
    tags: ['盼望'],
    summary: '把零散感受慢慢整理成可以分享的段落。',
    content: '把零散感受慢慢整理成可以分享的段落。',
    updated_at: '2026-04-22T11:10:00.000Z',
    created_at: '2026-04-22T10:30:00.000Z',
  },
];

const seedBooks = [
  {
    id: 'book_1',
    user_id: seedUser.id,
    title: '恩典中的清晨',
    subtitle: '靈修札記選集',
    author_name: 'Smoke User',
    description: '把每日札記整理成一本可以慢慢閱讀的靈修書。',
    template_code: 'devotion',
    language: 'mul',
    cover_data_url: '',
    preface: '',
    afterword: '',
    toc_enabled: true,
    chapters: [
      { id: 'chapter_1', note_id: 'note_1', chapter_title: '詩篇104默想', chapter_order: 0 },
    ],
    updated_at: '2026-04-24T07:05:00.000Z',
    created_at: '2026-04-24T07:00:00.000Z',
  },
  {
    id: 'book_2',
    user_id: seedUser.id,
    title: '忍耐與盼望',
    subtitle: '',
    author_name: 'Smoke User',
    description: '收錄等待與盼望主題的札記。',
    template_code: 'devotion',
    language: 'mul',
    cover_data_url: '',
    preface: '',
    afterword: '',
    toc_enabled: true,
    chapters: [
      { id: 'chapter_2', note_id: 'note_2', chapter_title: '信靠中的忍耐', chapter_order: 0 },
    ],
    updated_at: '2026-04-23T22:10:00.000Z',
    created_at: '2026-04-23T20:50:00.000Z',
  },
];

const seedSnapshots = [
  {
    id: 'snapshot_1',
    user_id: seedUser.id,
    book_id: 'book_1',
    title: '恩典中的清晨 v1',
    created_at: '2026-04-24T07:06:00.000Z',
    book_json: '{}',
  },
];

async function captureNamedScreenshots(page) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(180);
  await page.screenshot({ path: path.join(artifactsDir, '01-home-first-screen.png') });

  await page.evaluate(() => {
    const target = document.querySelector('.home-recent-panel');
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 10;
      window.scrollTo(0, Math.max(0, top));
    }
  });
  await page.waitForTimeout(180);
  await page.screenshot({ path: path.join(artifactsDir, '02-home-recent-account.png') });

  await page.evaluate(() => {
    const target = document.querySelector('.account-summary-card');
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 36;
      window.scrollTo(0, Math.max(0, top));
    }
  });
  await page.waitForTimeout(180);
  await page.screenshot({ path: path.join(artifactsDir, '03-bottom-nav.png') });

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(120);
}

async function expectVisible(page, selector, label) {
  await page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
  return label;
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();
  const results = [];

  try {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.evaluate(({ user, notes, books, snapshots }) => {
      localStorage.setItem('devotion-app-config', JSON.stringify({ supabaseUrl: ' ', supabaseAnonKey: ' ' }));
      localStorage.setItem('devotion-app-local-user', JSON.stringify({ id: user.id, email: user.email }));
      localStorage.setItem('devotion-app-local-accounts', JSON.stringify([user]));
      localStorage.setItem('devotion-app-notes', JSON.stringify(notes));
      localStorage.setItem('devotion-app-books', JSON.stringify(books));
      localStorage.setItem('devotion-app-snapshots', JSON.stringify(snapshots));
    }, { user: seedUser, notes: seedNotes, books: seedBooks, snapshots: seedSnapshots });
    await page.reload({ waitUntil: 'networkidle', timeout: 20000 });
    await expectVisible(page, '#view-dashboard.view.active', '首頁載入正常');
    await captureNamedScreenshots(page);
    await page.screenshot({ path: path.join(artifactsDir, 'homepage-mobile.png'), fullPage: true });
    results.push('首頁載入正常');

    const navTexts = await page.locator('.bottom-nav .nav-link span:last-child').allTextContents();
    results.push(`底部導覽：${navTexts.join(' / ')}`);

    await page.click('#quick-new-note');
    await expectVisible(page, '#view-notes.view.active', '寫一篇札記可進入札記流程');
    results.push('寫一篇札記可進入原本新增札記流程');

    await page.click('.bottom-nav .nav-link[data-view="dashboard"]');
    await expectVisible(page, '#view-dashboard.view.active', '返回總覽成功');

    await page.click('#quick-new-book');
    await expectVisible(page, '#view-books.view.active', '建立一本書可進入書籍流程');
    results.push('建立一本書可進入原本新增書籍流程');

    const exportBtnExists = await page.locator('#export-epub-btn').count();
    if (exportBtnExists) results.push('下載 EPUB 按鈕仍存在');

    await page.click('.bottom-nav .nav-link[data-view="dashboard"]');
    await expectVisible(page, '.home-recent-panel #recent-notes .card', '????????');
    await page.click('.bottom-nav .nav-link[data-view="notes"]');
    await expectVisible(page, '#view-notes.view.active', '???????????');
    await page.click('[data-edit-note]');
    const noteTitle = await page.inputValue('#note-title');
    if (noteTitle === seedNotes[0].title) results.push('最近編輯點擊可進入原本編輯流程');
    const forceSyncVisible = await page.locator('#force-sync-btn:visible').count();
    if (forceSyncVisible) {
      await page.click('#force-sync-btn');
      await expectVisible(page, '#toast:not(.hidden)', '??????');
      results.push('??????');
    } else {
      results.push('???????????');
    }

    const accountUiExists = await Promise.all([
      page.locator('#account-settings-modal').count(),
      page.locator('#push-local-to-cloud-btn').count(),
      page.locator('#download-backup-btn').count(),
      page.locator('#signout-btn').count(),
    ]);
    if (accountUiExists.every(Boolean)) results.push('帳號設定相關 DOM 已存在。');

    await page.click('.bottom-nav .nav-link[data-view="notes"]');
    await expectVisible(page, '#view-notes.view.active', '札記頁可切換');
    await page.click('.bottom-nav .nav-link[data-view="books"]');
    await expectVisible(page, '#view-books.view.active', '書籍頁可切換');
    await page.click('.bottom-nav .nav-link[data-view="library"]');
    await expectVisible(page, '#view-library.view.active', '書櫃頁可切換');
    await page.screenshot({ path: path.join(artifactsDir, 'library-mobile.png'), fullPage: true });

    const libraryReadButton = await page.locator('[data-open-library-book]').count();
    if (libraryReadButton) {
      await page.click('[data-open-library-book]');
      await expectVisible(page, '#view-reader.view.active', '書櫃可開啟閱讀器');
      results.push('書櫃可開啟閱讀器');
    } else {
      results.push('書櫃閱讀器未完成實測：本次 smoke test 採本機模式種子資料，沒有雲端書櫃書籍可點開');
    }

    await page.click('.bottom-nav .nav-link[data-view="dashboard"]');
  } catch (error) {
    results.push(`失敗：${error.message}`);
    throw error;
  } finally {
    fs.writeFileSync(path.join(artifactsDir, 'smoke-test-results.json'), JSON.stringify({ results }, null, 2));
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
