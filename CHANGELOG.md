# Changelog

## v1.1.12 - 2026/07/07

正式站：https://www.devotionbook.com.tw

Production commit hash：完成 production deployment 後回報。

### 主要更新

- 修正札記閱讀頁與閱讀視窗中，色彩標記可能以 `{purple}` 等原始文字顯示的問題。
- 閱讀完整內容時，支援編輯器既有色彩標記 red、blue、gold、purple 的安全渲染。
- 最近編輯、搜尋摘要與預覽文字會移除色彩標記，避免顯示原始標記。
- 未變更 Auth、Supabase schema、資料結構、聖經資料、讀經表或 EPUB 匯出邏輯。

## v1.1.11 - 2026/07/04

正式站：https://www.devotionbook.com.tw

Production commit hash：完成 production deployment 後回報。

### 主要更新

- 在「目前選稿編排」視窗新增「整理說明」編輯區。
- 使用者可在編排頁補寫或修改整理說明，並於「儲存編排」時一併保存。
- 修正新建編排未填整理說明後，進入編排流程無法補寫的使用流程缺口。
- 未變更 Auth、Supabase schema、EPUB 匯出邏輯、聖經資料或讀經表。

## v1.1.10 - 2026/06/29

正式站：https://www.devotionbook.com.tw

Production commit hash：完成 production deployment 後回報。

### 主要更新

- 修正手機版帳號資訊卡片在小螢幕或較大字體下，slogan 與「帳號設定 / 登出」按鈕可能重疊的問題。
- 僅調整 CSS / RWD layout，未變更 Auth、Supabase、資料結構或使用流程。

## v1.1.9 - 2026/06/07

正式站：https://www.devotionbook.com.tw

Production commit hash：完成 production deployment 後回報。

### 主要更新

- 簡化操作手冊版本資訊。
- 移除一般使用者畫面中的本次主要更新條列。
- 版本制度：前台版本升為 v1.1.9，並同步 `package.json`、`version.json`、`APP_VERSION`、靜態資源 cache query 與前台可見版本資訊。

## v1.1.8 - 2026/06/07

正式站：https://www.devotionbook.com.tw

Production commit hash：完成 production deployment 後回報。

### 主要更新

- 內建聖經標點校對第一階段。
- 重新用 v1.1.7 `assets/default-books/bible.epub` 掃描同一節內明顯連續標點錯置。
- 修正 9 筆明顯連續標點錯置，只刪除或調整多餘標點，不改經文字、不改註記內容、不改章節結構。
- 本輪未處理跨節引號、半形括號註記、註記格式政策或字形政策項目。
- 補強內建聖經 EPUB 標點修正驗證，避免連續標點錯置與 v1.1.7 既有聖經修正回歸。
- 版本制度：前台版本升為 v1.1.8，並同步 `package.json`、`version.json`、`APP_VERSION`、靜態資源 cache query 與前台可見版本資訊。

## v1.1.7 - 2026/06/07

正式站：https://www.devotionbook.com.tw

Production commit hash：完成 production deployment 後回報。

### 主要更新

- 內建聖經全文校對第二階段。
- 處理字形政策項目，釐清哥林多前書 13:12「糢糊 / 模糊」判斷。
- 修正哥林多前書 13:12「糢糊不清」為「模糊不清」，正文與小字註記同步更新。
- 掃描全本 `糢`、`裏`、`衆`、`于`、`祇`、`纔`、`爲`、`着` 等字形政策項目，確認本輪不做全面現代化。
- 保留章節結構差異另案處理，本輪不改分節、缺節或節號策略。
- 補強內建聖經 EPUB 文字修正驗證，避免 v1.1.5 / v1.1.6 已修項目回歸。
- 版本制度：前台版本升為 v1.1.7，並同步 `package.json`、`version.json`、`APP_VERSION`、靜態資源 cache query 與前台可見版本資訊。

## v1.1.6 - 2026/06/07

正式站：https://www.devotionbook.com.tw

Production commit hash：完成 production deployment 後回報。

### 主要更新

- 內建聖經全文校對第一階段。
- 修正高信心錯字：`繙` 改為 `翻`、`餧` 改為 `餵`。
- 逐條比對中信心項目，修正多個可信來源一致支持的 `踰越節` 為 `逾越節`。
- 保留來源支持的 `妝飾` 用字不修正，避免把和合本傳統用字誤改為現代字形偏好。
- 將來源不一致或涉及字形政策的 `糢糊 / 模糊` 列為待人工確認。
- 補強內建聖經 EPUB 全卷結構與本輪文字修正驗證。
- 版本制度：前台版本升為 v1.1.6，並同步 `package.json`、`version.json`、`APP_VERSION`、靜態資源 cache query 與前台可見版本資訊。

## v1.1.5 - 2026/06/07

正式站：https://www.devotionbook.com.tw

Production commit hash：完成 production deployment 後回報。

### 主要更新

- 修正內建聖經哥林多前書錯別字。
- 修正哥林多前書 3:2「餧」為「餵」。
- 修正哥林多前書 12:10「繙方言」為「翻方言」，並同步修正哥林多前書同類「繙」用字。
- 補強哥林多前書逐節比對與抓取測試，確認 1–16 章仍完整、全卷仍為 437 節。
- 版本制度：前台版本升為 v1.1.5，並同步 `package.json`、`version.json`、`APP_VERSION`、靜態資源 cache query 與前台可見版本資訊。

## v1.1.4 - 2026/06/07

正式站：https://www.devotionbook.com.tw

Production commit hash：完成 production deployment 後回報。

### 主要更新

- 修正中文經文格式解析，支援「篇 / 章」格式，例如「詩篇90篇9-10」與「詩篇90章9-10」。
- 抓取經文改為安全追加模式，新抓取的經文會加入札記內容，不再默默覆蓋既有經文或手寫內容。
- 寫札記文案：將「抓取後同步放入札記全文」調整為「抓取後加入札記內容」，並補充不覆蓋原文的提示。
- 操作手冊：更新抓取經文說明，補充分號分隔、多種章節寫法與手動整理位置的使用方式。
- 測試覆蓋：補強中文分號、英文分號、五段經文抓取、篇 / 章格式、再次抓取不覆蓋與儲存後顯示流程。
- 版本制度：前台版本升為 v1.1.4，並同步 `package.json`、`version.json`、`APP_VERSION`、靜態資源 cache query 與前台可見版本資訊。

## v1.1.3 - 2026/06/05

正式站：https://www.devotionbook.com.tw

Production commit hash：尚未部署 production；本版先整理本地查驗環境、selector 與 QA 規範。

### 主要更新

- QA 文件：新增固定查驗前置清單與測試模式規範，明確區分 mock UI、localStorage seed、真 Supabase 測試帳號與 production read-only。
- 測試穩定性：補上前台重要區塊的穩定 `data-testid`，降低同名按鈕、不可見元素與 class selector 誤判。
- Smoke test：改用可見元素與穩定 testid 驗收 Auth modal、手機底部導覽、札記閱讀 modal、寫札記工具列、操作手冊與版本資訊。
- 版本制度：前台版本升為 v1.1.3，並同步 `package.json`、`version.json`、`APP_VERSION`、靜態資源 cache query 與前台可見版本資訊。

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
