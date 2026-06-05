# Changelog

## v1.1.2 - 2026/06/05

正式站：https://www.devotionbook.com.tw

Production commit hash：完成 production deployment 後記錄於 `OPERATION_MANUAL_LANGUAGE_AUDIT_20260605.md` 與完成回報。

### 主要更新

- 操作手冊：補充寫札記小工具使用說明，涵蓋小標題、粗體、引用、經文、清單、分隔線、紅字、藍字、金字與紫字。
- 操作手冊：補充小標題與字體顏色搭配使用說明，說明先套小標題、再選取標題文字加顏色的順序。
- 操作手冊：新增小工具搭配範例，讓使用者能照著整理經文觀察、反思、清單與禱告段落。
- 操作手冊：維持一般使用者語氣，不加入後台管理內容，不修改資料設定或登入流程。
- 版本制度：前台版本升為 v1.1.2，並同步 `package.json`、`version.json`、`APP_VERSION`、靜態資源 cache query 與前台可見版本資訊。

## v1.1.1 - 2026/06/05

正式站：https://www.devotionbook.com.tw

Production commit hash：完成 production deployment 後記錄於 `OPERATION_MANUAL_LANGUAGE_AUDIT_20260605.md` 與完成回報。

### 主要更新

- 操作手冊：改寫為一般使用者能理解、可照著做的使用說明。
- 操作手冊：補上開始使用、建立帳戶與登入、信箱驗證、Google 登入、忘記密碼、資料保存與版本資訊等章節。
- 操作手冊：以使用者語言說明札記閱讀、札記庫、選稿編排、書櫃與成書流程。
- 操作手冊：明確排除後台管理內容，不新增假功能，不修改資料設定。
- 版本制度：前台版本升為 v1.1.1，並同步 `package.json`、`version.json`、`APP_VERSION`、靜態資源 cache query 與前台可見版本資訊。

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
