# Devotion 前台系統盤點與版本報告

## 1. 盤點基本資訊

- 盤點日期：2026/06/04
- Repo path：`/Users/jeremiah/src/devotion-book-webapp`
- 正式站：https://www.devotionbook.com.tw
- 本次範圍：前台使用者可見系統、前台導覽、前台 modal / toast / empty / loading / error state、RWD、版本制度。
- 明確排除：管理後台、後台使用者管理、後台資料維護、後台權限管理、後台管理頁 UI。
- 未執行事項：未修改 Supabase schema、未修改 Supabase provider 設定、未修改 Google Client Secret、未刪除或寫入正式資料。

## 2. 起始狀態

- `pwd`：`/Users/jeremiah/src/devotion-book-webapp`
- 起始 `git status`：乾淨，位於 `main...origin/main`
- 起始最近 commit：
  - `183f91d Make note reader cards fully clickable`
  - `9da49a3 Add note reader to mobile nav`
  - `5acf99f Refactor note reader reading center`
  - `169c0ce Move note drafts below writing flow`
  - `fbb1752 Refine auth modal Google copy`
- 起始 `npm run verify`：通過。

## 3. 版本狀態與新制度

- 原 `package.json` version：`1.0.0`
- 原 runtime version：`APP_VERSION = '2026.05.16-01'`
- 原 `version.json`：`2026.05.16-01`
- 原 cache query：`google-login-20260604`
- 新版本：`1.1.0`
- 升版原因：近期連續完成 Auth UX、Google 登入入口、寫札記草稿排序、札記閱讀中心重構、手機導覽補齊、札記卡片整卡閱讀互動，屬於前台功能與 UX 的 minor release。
- 版本來源制度：產品版本以 `package.json` 的 `version` 為準；靜態前台同步 `APP_VERSION`、`APP_RELEASE_DATE`、`version.json` 與 `index.html` cache query。
- 前台可見位置：
  - 帳號設定：`版本資訊`
  - 操作手冊：補充說明底部
- 新顯示文案：`版本：v1.1.0｜更新：2026/06/04`
- cache query 已更新：`styles.css?v=1.1.0`、`app.js?v=1.1.0`
- 新增版本紀錄：`CHANGELOG.md`

## 4. 本次已修正項目

- 補齊版本制度：`package.json`、`package-lock.json`、`app.js`、`version.json`、`index.html` cache query 已同步到 `1.1.0`。
- 正式前台可見版本：帳號設定與操作手冊顯示 `版本：v1.1.0｜更新：2026/06/04`。
- 操作手冊更新：移除舊版札記閱讀「列表 / 返回列表 / 左右分欄預覽」描述，改為搜尋卡片、最近編輯 5 篇、搜尋 modal、閱讀 modal。
- README 更新：移除過期 Magic Link 說明，改為目前 Email / Password、信箱驗證、Google 登入與前台功能說明。
- 新增 CHANGELOG：記錄 `v1.1.0` 主要前台改版。
- 修正 PWA 安裝提示干擾：札記搜尋 / 閱讀 modal 開啟時會隱藏 install prompt，避免遮住搜尋結果卡片點擊。

## 5. 前台功能盤點

| 功能 | 狀態 | 發現 / 備註 |
| --- | --- | --- |
| 首頁 / 未登入首頁 | 正常 | 可進入，文案正常，無水平爆版。 |
| 登入 / 建立帳戶 / 忘記密碼 | 正常 | 登入模式顯示忘記密碼；建立帳戶模式不顯示忘記密碼。 |
| Email 驗證流程 | 正常 | 驗證提醒中文化，同裝置 pending reminder 可見。 |
| 重新寄送驗證信 | 正常 | 重寄入口只在驗證提醒狀態顯示。 |
| Google 登入 | 部分實測 | local fallback 顯示中文提示；按鈕文案正常。完整 OAuth 帳號合併需受控 Google 測試帳號後續驗證。 |
| 登出 | 正常 | 帳號設定與側欄入口存在，未改動既有流程。 |
| 帳號設定 | 正常 | 同步狀態、未同步內容、版本資訊可見，modal 可關閉。 |
| 同步狀態與未同步內容 | 正常 | local 模式顯示未同步提示；雲端同步邏輯未改動。 |
| 總覽 | 正常 | 最近札記、統計、導覽狀態正常。 |
| 禱告 | 正常 | local 模式顯示需登入雲端帳號同步禱告紀錄；雲端資料未動。 |
| 寫札記 | 正常 | 我的草稿在書寫流程後方；繼續編輯可載入草稿；草稿與正式札記儲存通過。 |
| 我的草稿 | 正常 | 草稿不混入札記閱讀 / 札記庫正式清單。 |
| 札記閱讀 | 正常 | 搜尋卡片 + 最近編輯 5 篇；無固定右側大空白預覽區；搜尋 / 閱讀皆為 modal。 |
| 札記庫 | 正常 | 正式札記卡片可見，管理入口正常。 |
| 選稿編排 | 正常 | 書稿卡片與成書入口可見。 |
| 書櫃 | 正常 | 書櫃可進入，Reader 未改動。 |
| 操作手冊 | 正常 | 版本資訊可見；札記閱讀說明已更新。 |
| 成書 / 書卷相關前台功能 | 正常 | 選稿編排、書籍資料、EPUB 入口未受影響。 |
| 支持 / 贊助 / 收據 | 正常 | 支持 modal 與收款證明申請表可開啟。 |
| modal / toast / empty / loading / error | 正常 | 已修 install prompt 擋 modal 的問題；其他 modal 可關閉。 |
| 手機底部導覽 | 正常 | 含「札記閱讀」，active 狀態正確，可水平滑動。 |
| 平板導覽與版型 | 正常 | 768px 使用單欄內容與底部導覽。 |
| 桌面側邊導覽 | 正常 | 1024 / 1280 顯示側邊導覽，含「札記閱讀」。 |

## 6. RWD 實測結果

本地實測網址：`http://127.0.0.1:4173/index.html`

| 寬度 | 實際導覽 | 札記閱讀版型 | 結果 |
| --- | --- | --- | --- |
| 390px | 底部導覽 | 單欄 | 通過；無水平爆版；閱讀 modal 可讀；console error 0。 |
| 430px | 底部導覽 | 單欄 | 通過；無水平爆版；搜尋 / 閱讀 modal 正常；console error 0。 |
| 768px | 底部導覽 | 單欄 | 通過；最近 5 篇清楚可見；console error 0。 |
| 1024px | 側邊導覽 | 兩欄 | 通過；左搜尋 / 右最近 5 篇；console error 0。 |
| 1280px | 側邊導覽 | 兩欄 | 通過；左搜尋 / 右最近 5 篇；console error 0。 |

本地自動化 QA：390 / 430 / 768 / 1024 / 1280 共 174 項檢查通過。

## 7. Console 與爆版

- Browser 插件本地 sanity check：page title 正確、DOM 非空白、console error / warn 0。
- Playwright 本地 RWD：console error 0。
- 390 / 430 / 768 / 1024 / 1280：無水平爆版。

## 8. 驗證命令

- `npm run verify`：通過。
- `git diff --check`：通過；僅顯示 `package-lock.json` CRLF/LF 提示，沒有 whitespace error。

## 9. Production 狀態

- 部署前正式站 `version.json`：`2026.05.16-01`
- 部署前正式站 HTML cache query：`google-login-20260604`
- 結論：正式站仍是舊版本號與舊 cache query，本次需要 push 並部署正式站。
- 本報告檔案會隨 release commit 送出；最終 production commit hash 與部署 Ready 結果會在完成回報中列出。

## 10. 未修正 / 後續追蹤

- 完整 Google OAuth 帳號合併與同 email user id 不分裂，需使用受控 Google 測試帳號在正式 Supabase Auth 環境驗證；本次未登入真實 Google 帳號，避免建立或改動正式使用者資料。
- 禱告新增 / 儲存完整雲端流程需登入正式雲端帳號；本次確認 local 未同步提示與前台狀態，未寫入正式資料。

## 11. Git 狀態

- 報告建立時工作樹包含本次計畫變更，尚未 commit。
- 完成 commit / push / deploy 後，請以完成回報的 `git status` 為準。
