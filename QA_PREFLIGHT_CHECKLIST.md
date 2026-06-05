# Devotion QA Preflight Checklist

每一輪前台修改或驗收開始前，先完成這份清單。若任一項不明確，先在回報中標註，不要把測試環境問題誤判成產品問題。

## 基本環境

- [ ] Repo path 是 `/Users/jeremiah/src/devotion-book-webapp`。
- [ ] `pwd` 輸出正確 repo path。
- [ ] `git status --short --branch` 乾淨，或已明確列出本輪會處理的既有差異。
- [ ] 已確認目前版本號：`package.json`、`version.json`、`app.js` 的 `APP_VERSION`、`index.html` cache query。
- [ ] 已執行 `npm run verify`，且語法檢查、M'Cheyne 讀經計畫驗證與 smoke test 通過。

## 啟動方式

- [ ] 本地 dev server 使用 `npm run serve:local`。
- [ ] 預設本地網址是 `http://127.0.0.1:4173/index.html`。
- [ ] 若 smoke test 自動啟動 server，確認 `SMOKE_BASE_URL` 未覆蓋目標網址。
- [ ] 若使用既有 server，確認 port 與 URL 與本輪回報一致。

## 查驗範圍

- [ ] 本輪測試資料來源已明確標註：mock UI、localStorage seed、真 Supabase 測試帳號或 production read-only。
- [ ] 本輪查驗環境已明確標註：本地、preview、production 或真 Supabase。
- [ ] 已確認是否允許修改產品 UI。
- [ ] 已確認是否允許新增不影響畫面的 `data-testid`。
- [ ] 已確認是否允許動正式資料。預設不允許。
- [ ] 已確認是否需要使用真帳號。預設不使用真使用者帳號。
- [ ] 已確認是否排除後台管理。一般前台驗收預設排除後台管理。
- [ ] 已確認是否要跑 390 / 430 / 768 / 1024 / 1280。

## 安全邊界

- [ ] 不修改 Supabase schema。
- [ ] 不修改正式資料。
- [ ] 不刪除使用者。
- [ ] 不改 Google Client Secret。
- [ ] 不改 Supabase provider。
- [ ] 不改 Auth 流程，除非任務明確要求且已驗收。
- [ ] 不為了 selector 方便改產品文案、版型或顯示 debug 字樣。

## 回報必填

- [ ] 使用哪一種查驗模式。
- [ ] 使用哪個網址與 viewport。
- [ ] console error 數量。
- [ ] 是否無水平爆版。
- [ ] 本地驗收是否通過。
- [ ] production 是否已驗；若未部署，需明確寫未驗 production。
- [ ] 是否 commit、push、部署 production。
