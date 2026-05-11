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
