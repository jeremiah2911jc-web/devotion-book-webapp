# Devotion 靈修札記成書系統

Devotion 是可部署到 Vercel 的前台靈修札記網站，協助使用者記錄禱告、撰寫札記、整理選稿、匯出 EPUB，並在書櫃中閱讀已完成或匯入的書籍。

## 目前版本

- 版本：v1.1.1
- 更新：2026/06/05
- 正式站：https://www.devotionbook.com.tw
- 版本紀錄：請見 `CHANGELOG.md`

## 前台功能

- 首頁、Email / Password 登入、建立帳戶、忘記密碼、信箱驗證提醒與重新寄送驗證信
- Google 登入 / 建立帳戶入口
- 帳號設定、同步狀態、未同步內容管理、雲端備份下載
- 總覽、禱告、寫札記、我的草稿
- 札記閱讀中心：搜尋 / 篩選、最近編輯 5 篇、搜尋結果視窗、閱讀視窗
- 札記庫、選稿編排、章節整理、EPUB 匯出
- 書櫃、內建閱讀器、外部 EPUB 匯入
- 操作手冊、支持平台與收款證明申請入口
- 手機底部導覽、平板與桌面 RWD

## 本地執行

```bash
npm install
npm run serve:local
```

開啟 `http://127.0.0.1:4173/index.html`。

## 驗證

```bash
npm run verify
```

`verify` 會執行語法檢查、讀經計畫驗證與 smoke test。

## 部署

正式站部署於 Vercel。正式改版時請同步：

1. 更新 `package.json` 的 `version`。
2. 更新 `app.js` 的 `APP_VERSION` 與 `APP_RELEASE_DATE`。
3. 更新 `version.json`。
4. 更新 `index.html` 中 `styles.css` / `app.js` 的 cache query。
5. 更新 `CHANGELOG.md`。
6. 執行 `npm run verify` 與 `git diff --check`。
7. commit、push `main`，確認 Vercel production deployment Ready。

## Supabase 設定

前台使用既有 Supabase Auth 與資料同步設定。本 repo 的一般前台改版不應修改 Supabase schema、provider 設定或 Google Client Secret。
