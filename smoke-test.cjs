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
    title: '\u8a69\u7bc7 104 \u9ed8\u60f3',
    scripture_reference: '\u8a69\u7bc7 104:1-5',
    category: '\u6668\u66f4',
    tags: ['\u9748\u4fee'],
    summary: '\u5b89\u975c\u4e0b\u4f86\u601d\u60f3\u795e\u5275\u9020\u7684\u69ae\u7f8e\u8207\u79e9\u5e8f\u3002',
    content: '\u5b89\u975c\u4e0b\u4f86\u601d\u60f3\u795e\u5275\u9020\u7684\u69ae\u7f8e\u8207\u79e9\u5e8f\uff0c\u8a18\u5ff5\u7942\u5728\u65e5\u5e38\u4e2d\u7684\u770b\u9867\u3002',
    updated_at: '2026-04-24T07:02:00.000Z',
    created_at: '2026-04-24T06:40:00.000Z',
  },
  {
    id: 'note_2',
    user_id: seedUser.id,
    title: '\u9748\u4fee\u624b\u8a18',
    scripture_reference: '\u7d04\u7ff0\u798f\u97f3 1:2-4',
    category: '\u672d\u8a18',
    tags: ['\u672c\u9031'],
    summary: '\u628a\u672d\u8a18\u6162\u6162\u6574\u7406\u6210\u53ef\u4ee5\u7e7c\u7e8c\u5beb\u4f5c\u7684\u66f8\u7a3f\u3002',
    content: '\u628a\u672d\u8a18\u6162\u6162\u6574\u7406\u6210\u53ef\u4ee5\u7e7c\u7e8c\u5beb\u4f5c\u7684\u66f8\u7a3f\uff0c\u8b93\u6bcf\u65e5\u9748\u4fee\u7559\u4e0b\u53ef\u56de\u9867\u7684\u8108\u7d61\u3002',
    updated_at: '2026-04-23T21:30:00.000Z',
    created_at: '2026-04-23T21:00:00.000Z',
  },
  {
    id: 'note_3',
    user_id: seedUser.id,
    title: '\u7f85\u99ac\u66f8\u4e2d\u7684\u76fc\u671b',
    scripture_reference: '\u7f85\u99ac\u66f8 8:28',
    category: '\u9ed8\u60f3',
    tags: ['\u76fc\u671b'],
    summary: '\u8a18\u9304\u4eca\u65e5\u6700\u60f3\u505c\u7559\u7684\u4e00\u53e5\u7d93\u6587\u8207\u79b1\u544a\u3002',
    content: '\u8a18\u9304\u4eca\u65e5\u6700\u60f3\u505c\u7559\u7684\u4e00\u53e5\u7d93\u6587\u8207\u79b1\u544a\uff0c\u63d0\u9192\u81ea\u5df1\u5728\u7b49\u5f85\u4e2d\u4ecd\u7136\u4fe1\u9760\u3002',
    updated_at: '2026-04-22T11:10:00.000Z',
    created_at: '2026-04-22T10:30:00.000Z',
  },
];

const seedBooks = [
  {
    id: 'book_1',
    user_id: seedUser.id,
    title: '\u9748\u4fee\u672d\u8a18\u6574\u7406\u4e2d',
    subtitle: '\u6bcf\u65e5\u9ed8\u60f3\u7de8\u8f2f\u672c',
    author_name: 'Smoke User',
    description: '\u628a\u8fd1\u671f\u7684\u9748\u4fee\u672d\u8a18\u6574\u7406\u6210\u4e00\u672c\u53ef\u5ef6\u4f38\u5beb\u4f5c\u7684\u66f8\u7a3f\u3002',
    template_code: 'devotion',
    language: 'mul',
    cover_data_url: '',
    preface: '',
    afterword: '',
    toc_enabled: true,
    chapters: [
      { id: 'chapter_1', note_id: 'note_1', chapter_title: '\u8a69\u7bc7 104 \u9ed8\u60f3', chapter_order: 0 },
    ],
    updated_at: '2026-04-24T07:05:00.000Z',
    created_at: '2026-04-24T07:00:00.000Z',
  },
  {
    id: 'book_2',
    user_id: seedUser.id,
    title: '\u6668\u66f4\u7b46\u8a18\u96c6',
    subtitle: '',
    author_name: 'Smoke User',
    description: '\u628a\u6668\u66f4\u672d\u8a18\u6574\u7406\u6210\u53ef\u6301\u7e8c\u7d2f\u7a4d\u7684\u7ae0\u7bc0\u3002',
    template_code: 'devotion',
    language: 'mul',
    cover_data_url: '',
    preface: '',
    afterword: '',
    toc_enabled: true,
    chapters: [
      { id: 'chapter_2', note_id: 'note_2', chapter_title: '\u9748\u4fee\u624b\u8a18', chapter_order: 0 },
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
    title: '??????????垮????v1',
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
  await page.waitForFunction((targetSelector) => {
    const element = document.querySelector(targetSelector);
    if (!element) return false;
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }, selector, { timeout: 10000 });
  return label;
}

async function expectVisibleLocator(locator, label) {
  await locator.waitFor({ state: 'visible', timeout: 10000 });
  return label;
}

async function expectNoVisibleLocator(locator, label) {
  const count = await locator.count();
  for (let index = 0; index < count; index += 1) {
    if (await locator.nth(index).isVisible()) {
      throw new Error(label);
    }
  }
  return label;
}

async function expectButtonText(page, selector, expectedText, label) {
  await page.waitForFunction(([targetSelector, expected]) => {
    const element = document.querySelector(targetSelector);
    return !!element && element.textContent.trim() === expected;
  }, [selector, expectedText], { timeout: 10000 });
  return label;
}

async function clickElement(page, selector) {
  await page.waitForFunction((targetSelector) => !!document.querySelector(targetSelector), selector, { timeout: 10000 });
  await page.evaluate((targetSelector) => {
    const element = document.querySelector(targetSelector);
    if (element) element.click();
  }, selector);
}

async function verifyWelcomeScreen(page, results) {
  await expectVisible(page, '#auth-gate', '登入前 welcome screen 已顯示');
  const ctas = page.locator('#auth-gate .auth-gate-actions .auth-cta');
  const visibleCtaCount = await ctas.count();
  if (visibleCtaCount !== 2) {
    throw new Error(`welcome screen CTA 數量錯誤：預期 2，實際 ${visibleCtaCount}`);
  }
  const ctaTexts = (await ctas.allTextContents()).map((text) => text.trim()).filter(Boolean);
  if (ctaTexts.length !== 2 || ctaTexts[0] !== '開始寫我的第一篇靈修' || ctaTexts[1] !== '我已經有帳戶了') {
    throw new Error(`welcome screen CTA 文字錯誤：${ctaTexts.join(' / ')}`);
  }

  await expectNoVisibleLocator(page.locator('text=先用本機模式試用'), 'welcome screen 不應顯示本機試用入口');
  await expectNoVisibleLocator(page.locator('text=Magic Link'), 'welcome screen 不應顯示 Magic Link');
  await expectNoVisibleLocator(page.locator('text=雲端設定'), 'welcome screen 不應顯示雲端設定入口');
  await expectNoVisibleLocator(page.locator('text=安全提示'), 'welcome screen 不應顯示安全提示');
  await expectNoVisibleLocator(page.locator('#cloud-sync-panel'), '未登入 welcome screen 不應顯示同步雲朵區塊');
  await expectNoVisibleLocator(
    page.locator('[aria-label*="menu" i], [aria-label*="選單"], .hamburger, .menu-toggle, .topbar-menu, .sidebar-toggle, .mobile-menu, [data-open-menu]'),
    'welcome screen 不應顯示三橫線 menu'
  );

  results.push('welcome screen 僅保留開始寫我的第一篇靈修 / 我已經有帳戶了兩個入口');
}

async function verifyAuthModal(page, triggerSelector, expectedTitle, expectedSubmitText, results) {
  await clickElement(page, triggerSelector);
  await expectVisible(page, '#auth-inline-panel', `${expectedTitle} modal 已開啟`);
  await expectButtonText(page, '#auth-inline-title', expectedTitle, `${expectedTitle} modal 標題正確`);
  await expectVisible(page, '#gate-auth-email', `${expectedTitle} modal 顯示 Email 欄位`);
  await expectVisible(page, '#gate-auth-password', `${expectedTitle} modal 顯示 Password 欄位`);
  await expectVisible(page, '#gate-submit-btn', `${expectedTitle} modal 顯示主按鈕`);
  await expectButtonText(page, '#gate-submit-btn', expectedSubmitText, `${expectedTitle} modal 主按鈕文字正確`);
  await expectVisible(page, '#gate-reset-password-btn', `${expectedTitle} modal 顯示忘記密碼 / 重設密碼`);
  await expectVisible(page, '#close-auth-inline-btn', `${expectedTitle} modal 顯示關閉按鈕`);
  await expectNoVisibleLocator(page.locator('#auth-inline-panel').getByText('Magic Link'), `${expectedTitle} modal 不應顯示 Magic Link`);
  await expectNoVisibleLocator(page.locator('#magic-link-btn'), 'hidden 舊 auth card 的 Magic Link 按鈕不應可見');
  await expectNoVisibleLocator(page.locator('#auth-card'), 'hidden 舊 auth card 不應可見');
  await clickElement(page, '#close-auth-inline-btn');
  await page.waitForFunction(() => document.querySelector('#auth-inline-panel')?.classList.contains('hidden'), { timeout: 10000 });
  results.push(`${expectedTitle} modal 已驗證 Email / Password / 主按鈕 / 重設密碼 / 關閉按鈕，且無 Magic Link`);
}

async function launchSmokeBrowser() {
  try {
    return await chromium.launch({ headless: true });
  } catch (error) {
    const message = String(error?.message || error || '');
    const missingChromium = (
      message.includes('Executable doesn\'t exist')
      || message.includes('Please run the following command')
      || message.includes('Failed to launch')
    );
    if (missingChromium) {
      throw new Error([
        'Playwright Chromium 尚未安裝或目前無法找到 Chromium 執行檔。',
        '請先執行：npx playwright install chromium',
        '',
        `原始錯誤：${message}`,
      ].join('\n'));
    }
    throw error;
  }
}

async function run() {
  const browser = await launchSmokeBrowser();
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
    await verifyWelcomeScreen(page, results);
    await verifyAuthModal(page, '#open-register-btn', '建立帳戶', '建立帳戶', results);
    await verifyAuthModal(page, '#open-login-btn', '登入', '登入', results);

    await page.evaluate(({ user, notes, books, snapshots }) => {
      localStorage.setItem('devotion-app-config', JSON.stringify({ mode: 'local', supabaseUrl: '', supabaseAnonKey: '' }));
      localStorage.setItem('devotion-app-local-user', JSON.stringify({ id: user.id, email: user.email }));
      localStorage.setItem('devotion-app-local-accounts', JSON.stringify([user]));
      localStorage.setItem('devotion-app-notes', JSON.stringify(notes));
      localStorage.setItem('devotion-app-books', JSON.stringify(books));
      localStorage.setItem('devotion-app-snapshots', JSON.stringify(snapshots));
    }, { user: seedUser, notes: seedNotes, books: seedBooks, snapshots: seedSnapshots });
    await page.reload({ waitUntil: 'networkidle', timeout: 20000 });
    await expectVisible(page, '#view-dashboard.view.active', '首頁 dashboard 已顯示');
    await captureNamedScreenshots(page);
    await page.screenshot({ path: path.join(artifactsDir, 'homepage-mobile.png'), fullPage: true });
    results.push('首頁 dashboard 已顯示');

    const navTexts = await page.locator('.bottom-nav .nav-link span:last-child').allTextContents();
    results.push(`底部導覽文字：${navTexts.join(' / ')}`);

    await clickElement(page, '#quick-new-note');
    await expectVisible(page, '#view-notes.view.active', '已由首頁 CTA 進入札記頁');
    results.push('已由首頁 CTA 進入札記頁');

    await clickElement(page, '[data-view="dashboard"]');
    await expectVisible(page, '#view-dashboard.view.active', '已返回 dashboard');

    await clickElement(page, '#quick-new-book');
    await expectVisible(page, '#view-books.view.active', '已由首頁 CTA 進入書籍頁');
    results.push('已切換到書籍頁');

    const exportBtnExists = await page.locator('#export-epub-btn').count();
    if (exportBtnExists) results.push('書籍頁可見 EPUB 匯出按鈕');

    await clickElement(page, '[data-view="dashboard"]');
    await expectVisible(page, '.home-recent-panel #recent-notes .card', '最近編輯已顯示內容');
    await clickElement(page, '[data-view="notes"]');
    await expectVisible(page, '#view-notes.view.active', '已切換到札記頁');
    const editNoteCount = await page.locator('[data-edit-note]').count();
    if (editNoteCount) {
      await clickElement(page, '[data-edit-note]');
      const noteTitle = await page.inputValue('#note-title');
      if (noteTitle === seedNotes[0].title) results.push('札記編輯按鈕可帶入既有內容');
    } else {
      results.push('札記列表目前沒有編輯按鈕，略過表單帶入檢查');
    }
    const forceSyncVisible = await page.locator('#force-sync-btn:visible').count();
    if (forceSyncVisible) {
      await clickElement(page, '#force-sync-btn');
      await expectVisible(page, '#toast:not(.hidden)', '同步提示已出現');
      results.push('同步提示已出現');
    } else {
      results.push('同步按鈕目前不可見');
    }

    const accountUiExists = await Promise.all([
      page.locator('#account-settings-modal').count(),
      page.locator('#push-local-to-cloud-btn').count(),
      page.locator('#download-backup-btn').count(),
      page.locator('#signout-btn').count(),
    ]);
    if (accountUiExists.every(Boolean)) results.push('帳號設定相關 DOM 已存在');

    await clickElement(page, '[data-view="notes"]');
    await expectVisible(page, '#view-notes.view.active', '已從導覽切換到札記頁');
    await clickElement(page, '[data-view="books"]');
    await expectVisible(page, '#view-books.view.active', '已從導覽切換到書籍頁');
    await clickElement(page, '[data-view="library"]');
    await expectVisible(page, '#view-library.view.active', '已從導覽切換到書櫃頁');
    await page.screenshot({ path: path.join(artifactsDir, 'library-mobile.png'), fullPage: true });

    const libraryReadButton = await page.locator('[data-open-library-book]').count();
    if (libraryReadButton) {
      await clickElement(page, '[data-open-library-book]');
      await expectVisible(page, '#view-reader.view.active', '已進入閱讀模式');
      results.push('已進入閱讀模式');
    } else {
      results.push('目前沒有書櫃作品可直接閱讀，略過閱讀器檢查');
    }

    await clickElement(page, '[data-view="dashboard"]');
  } catch (error) {
    results.push(`測試失敗：${error.message}`);
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
