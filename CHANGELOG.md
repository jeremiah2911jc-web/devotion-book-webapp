# Changelog

## v1.1.0 - 2026/06/04

正式站：https://www.devotionbook.com.tw

Production commit hash：由本次 release commit 與 Vercel production deployment 對應；完成部署後記錄於 `FRONTEND_SYSTEM_AUDIT_AND_VERSION_REPORT_20260604.md` 與完成回報。

### 主要更新

- Auth UX：整理登入 / 建立帳戶 / 忘記密碼 / 信箱驗證提醒與重新寄送驗證信流程。
- Google 登入：補上 Google 登入與建立帳戶入口文案。
- 寫札記：調整我的草稿位置與繼續編輯流程。
- 札記閱讀：改為入口型閱讀中心，保留搜尋 / 篩選卡片，主內容顯示最近編輯 5 篇正式札記。
- 札記閱讀：搜尋結果改為 modal，單篇閱讀改為閱讀 modal。
- 手機導覽：補上「札記閱讀」入口，並維持 active 狀態。
- 札記卡片：最近編輯與搜尋結果卡片支援整卡點擊閱讀，閱讀按鈕移到右上角。
- 版本制度：前台版本升為 v1.1.0，並同步 `package.json`、`version.json`、`APP_VERSION`、靜態資源 cache query 與前台可見版本資訊。

### 版本制度

- 單一產品版本以 `package.json` 的 `version` 為準。
- 靜態前台同時以 `app.js` 的 `APP_VERSION` / `APP_RELEASE_DATE`、`version.json` 與 `index.html` cache query 明確同步。
- UI/UX 小修使用 patch，功能調整使用 minor，破壞性架構調整才使用 major。
