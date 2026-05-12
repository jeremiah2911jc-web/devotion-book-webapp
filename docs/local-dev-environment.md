# 本機開發與測試流程

本文件記錄家裡主要 repo 的標準本機流程，避免每次工作卡在 npm、Playwright、server port 或舊 process。

## 必要工具

- Node.js 24 或相容版本
- npm / npx
- repo 內 dev dependency：`playwright`
- Playwright Chromium：第一次或更新環境後執行 `npx playwright install chromium`

## 固定指令

```powershell
npm install
npm run check
npm run smoke
npm run verify
```

## Scripts

- `npm run check`：檢查 `app.js` 與 serverless API 檔案語法。
- `npm run serve:local`：啟動 `static-server.cjs`，預設 `http://127.0.0.1:4173`。
- `npm run smoke`：執行 `smoke-test.cjs`。若 `SMOKE_BASE_URL` 未指定，會自動啟動並關閉本機 static server。
- `npm run verify`：依序執行 `check` 與 `smoke`。

## Port

預設 port 是 `4173`。

可用環境變數覆寫：

```powershell
$env:PORT = "4179"
npm run serve:local
```

Smoke test 可用：

```powershell
$env:SMOKE_PORT = "4179"
npm run smoke
```

若要對已啟動的 server 跑 smoke test：

```powershell
$env:SMOKE_BASE_URL = "http://127.0.0.1:4173/index.html"
npm run smoke
```

## 舊 server process 檢查

```powershell
Get-NetTCPConnection -LocalPort 4173,4179,4180 -ErrorAction SilentlyContinue
```

只停止明確為 `node static-server.cjs` 的舊測試 process。不要停止 Chrome、Edge、Codex 或不明系統 process。

## Env 原則

- 本機基本檢查與 smoke test 不需要 `.env.local`。
- 管理後台 usage / users 完整資料需要正式站 Vercel Production env，由 serverless API 讀取。
- 不要把 Supabase / Vercel token、service role key、SMTP password 或任何 secret 寫入前端、測試檔或 package scripts。

## 測試情境分類與限制

Devotion 的 node、npm、Playwright、`check`、`smoke`、`verify`、package lock 與 port 清理流程已標準化。後續若仍遇到測試困難，通常不是基礎工具鏈問題，而是測試情境需要先分層。

### A. 基礎靜態測試

- 指令：`npm run check`、`git diff --check`
- 範圍：JavaScript 語法、serverless API 語法、diff whitespace。
- 不需要登入，不需要 `.env.local`，不碰 Supabase。

### B. 本機 smoke test

- 指令：`npm run smoke`
- 預設會自動啟動並關閉 `static-server.cjs`，除非指定 `SMOKE_BASE_URL`。
- 使用 `tests/helpers/devotion-test-helpers.cjs` 的 localStorage seed。
- 不登入正式站，不碰正式 Supabase，不新增正式資料。

### C. 正式站公開測試

- 範圍：首頁、Auth modal、公開 RWD、Vercel Analytics page view、console/network。
- 不登入，不讀取 cookie/session/token。
- 可檢查 HTTP 200、公開資產、modal 開關與一般 console error。

### D. 登入後 localStorage 模擬測試

- 範圍：札記、草稿、今日禱告、摘要顯示控制、札記閱讀、書櫃、Reader、EPUB。
- 使用 local mode config 與固定 localStorage seed。
- 不碰正式資料；測試資料只存在隔離的 browser context。
- 建議使用 `seedLocalUserState()`、`seedNoteDraftScenario()`、`seedPublishedNoteScenario()`、`seedBookshelfScenario()`。

### E. 正式站人工登入測試

- Codex 不要求使用者提供密碼。
- Codex 不輸出 cookie、session、token 或任何登入憑證。
- 若必須驗證登入後正式站，先由使用者在瀏覽器手動登入。
- 登入後 Codex 只觀察畫面、console、network 與非敏感 UI 狀態。
- 不自動新增正式資料；若一定需要測試資料，必須明確標示並回報。

### F. EPUB / download 專用測試

- 優先使用 Playwright download event：

```js
const downloadPromise = page.waitForEvent('download');
await page.getByTestId('download-exported-book').click();
const download = await downloadPromise;
```

- 不再用臨時 `fetch(blob:)` 抓 blob URL。
- 自動測試只確認下載被觸發、檔名合理、檔案大小大於 0。
- 若要驗證 EPUB 內文，需要另建穩定的 EPUB 解析 helper，不要在一般 smoke test 臨時拆 blob。

## 測試 helper 與穩定 selector

- 共用 helper：`tests/helpers/devotion-test-helpers.cjs`
- 重要 helper：
  - `seedLocalUserState()`
  - `seedNoteDraftScenario()`
  - `seedPublishedNoteScenario()`
  - `seedBookshelfScenario()`
  - `openReader()`
  - `closeReader()`
  - `exportEpubAndCaptureDownload()`
  - `assertNoConsoleErrors()`
  - `assertNoHorizontalScroll()`
- 重要 UI 已補 `data-testid`，測試應優先使用 `data-testid`，其次才使用既有 `id` 或業務 `data-*`。
- Windows 上若 `rg` 或中文搜尋輸出不穩，可改用 `git grep` 搜 ASCII selector，或用 PowerShell `Select-String` 搜 `id` / `data-testid`。不要依賴亂碼中文片段當 selector。

## Reader 測試規則

- 使用 `[data-testid="reader-close"]` 定位關閉按鈕。
- 先確認 visible / enabled，再用一般 `locator.click({ force: false })`。
- 若 headless click 被翻頁熱區或 overlay 擋住，先視為測試 selector / layout 問題來修，不要直接改成 programmatic handler。
- 只有在最後診斷 fallback 時，才允許用程式呼叫輔助判斷。

## 正式站資料安全

- 正式站自動測試預設不登入、不新增正式資料。
- localStorage mock 是測試情境，不代表正式 Supabase 寫入。
- 缺少 `.env.local`、無正式登入 session、無正式 env，是可預期限制，不應直接列為功能錯誤。
