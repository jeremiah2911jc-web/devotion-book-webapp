# Devotion QA Testing Guidelines

本文件固定 Devotion 前台查驗模式、selector 規範、RWD 規範與問題分類。之後每次回報都要明確說明使用哪一種模式，避免把測試腳本、seed 或 Playwright 問題誤判成產品問題。

## 查驗模式

### 1. Mock UI 驗收

用途：只驗畫面與 JavaScript 行為。

限制：

- 不代表真 Supabase 登入成功。
- 不代表真的寄驗證信。
- 不代表正式資料真的寫入。

回報必寫：這是 mock UI / JS 行為驗收，不代表真 Supabase 結果。

### 2. LocalStorage Seed 驗收

用途：驗本地畫面、RWD、UI 狀態、草稿、札記列表與閱讀流程。

限制：

- 不代表正式帳號資料。
- 不可把 seed 資料當成正式資料。

回報必寫：這是本地 seed 資料，不會改正式資料。

### 3. 真 Supabase 測試帳號驗收

用途：驗證登入、Google OAuth、Email 驗證與資料保存。

限制：

- 會影響 Supabase Auth 或測試帳號資料。
- 必須使用受控測試帳號。
- 不可使用真使用者帳號。
- 不可刪除正式使用者。

回報必寫：這是受控測試帳號，會寫入真 Supabase。

### 4. Production Read-Only 驗收

用途：驗正式站畫面、版本、RWD、console、導覽與 modal 可用。

限制：

- 不得建立資料。
- 不得刪資料。
- 不得修改正式使用者內容。

回報必寫：這是 production read-only 驗收，沒有改正式資料。

## Selector 規範

禁止把下列方式當成正式驗收依據：

- 只用文字抓第一個「登入」。
- 只用文字抓第一個「建立帳戶」。
- 只用文字抓第一個「閱讀」。
- 只用 class 名稱判斷產品狀態。
- 抓不可見元素。
- 抓頁面上第一個符合元素。
- 用模糊 locator 當作正式驗收。
- 因 selector 卡住就改產品文案或版型。

優先順序：

1. 穩定 `data-testid`。
2. `role` + accessible name。
3. 先限定容器，再找容器內按鈕。
4. 只點 visible element。
5. 避免同名元素混淆。

## Frontend Data Test IDs

本輪前台固定或確認的重點 testid：

- Auth：`auth-modal`、`auth-login-submit`、`auth-register-submit`、`auth-forgot-password`、`auth-google-login`、`auth-google-register`、`auth-resend-verification`。
- Mobile nav：`mobile-bottom-nav`、`mobile-nav-overview`、`mobile-nav-prayer`、`mobile-nav-write-note`、`mobile-nav-note-reader`、`mobile-nav-note-library`、`mobile-nav-book-planner`。
- Note editor：`note-editor-section`、`note-editor-toolbar`、`note-editor-content`、`note-save-draft`、`note-save-published`。
- Note toolbar：`note-format-heading`、`note-format-bold`、`note-format-quote`、`note-format-scripture`、`note-format-list`、`note-format-divider`、`note-format-red`、`note-format-blue`、`note-format-gold`、`note-format-purple`。
- Drafts：`draft-card`、`draft-continue-edit`。
- Note reader：`note-reader-page`、`note-reader-search-card`、`note-reader-search-submit`、`note-reader-search-modal`、`note-reader-reading-modal`、`note-reader-search-result`、`note-reader-recent-card`、`note-reader-read-button`。
- Manual and settings：`operation-manual-page`、`manual-writing-note-section`、`manual-install-app-section`、`account-settings-page`、`version-display`.

新增 `data-testid` 不應改變畫面、不應增加使用者可見文字，也不應讓一般使用者看到 mock、seed、debug 或 localStorage 字樣。

## 問題分類

### A. 測試腳本問題

例：selector 抓錯、抓到不可見元素、mock 狀態錯、seed 資料不一致、Playwright 等待條件錯。

處理方式：先修測試或 helper，不要改產品 UI。

### B. 產品 UI 問題

例：按鈕真的不見、文字錯誤、版型爆版、modal 無法關閉、點擊沒有反應。

處理方式：可修產品 UI，但要驗收。

### C. 資料 / 後端問題

例：Supabase Auth 錯誤、資料沒有保存、user id 分裂、RLS / 權限問題。

處理方式：先回報，不要自行刪資料或改 schema。

### D. 正式資料風險

例：要用真帳號登入、要刪 user、要改正式資料、要重設密碼。

處理方式：必須先取得使用者明確同意。

## RWD 規範

每次 UI 任務至少檢查：

- 390px。
- 430px。
- 768px。
- 1024px。
- 1280px。

每個 viewport 都要確認：

- 無水平爆版。
- console error 0。
- 主要導覽可用。
- active 狀態正確。
- modal 可開可關。
- 主要按鈕可點。
- 文字不被遮擋。
- 底部導覽不遮住主要操作。
- 768px 平板必須單獨回報，不得併入手機或桌面。

## 本地與正式站分開

本地驗收通過，不等於正式站通過。

Production 驗收必須確認：

- production commit hash。
- `version.json`。
- cache query。
- console error 0。
- RWD。
- 主要功能入口。
- 正式站是否載入最新版本。

每次部署後回報必須包含：

- production commit hash。
- Vercel deployment status。
- 正式站網址。
- 版本號。
- 是否已驗 production。

## 禁止事項

- 不改 Supabase schema。
- 不改正式資料。
- 不刪除使用者。
- 不改 Google Client Secret。
- 不改 Supabase provider。
- 不改 Auth 流程。
- 不改後台管理。
- 不為了測試方便改壞正式 UI。
- 不新增測試文字到正式畫面。
- 不把 debug / sample / localStorage 等字樣顯示給一般使用者。
- 不把 mock 結果說成真實 Supabase 結果。
- 不因 selector 卡住就重構產品。
- 不 push，除非本輪修正完成且驗收通過，且使用者要進入發布流程。
