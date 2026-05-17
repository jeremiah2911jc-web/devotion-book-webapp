# Devotion Preview 資料隔離 SOP

本文件是 `feature/book-center-upgrade` Preview 測試用的資料隔離落地計畫。目標是讓 Vercel Preview 後續可以連到獨立的 Supabase Preview 專案，避免測試寫入出現在正式站同一個帳號中。

本文件只列環境變數名稱、資料資源名稱與操作步驟，不記錄任何實際 URL、key、token、cookie、session 或密碼。

## 目前風險

- Preview 與 Production 目前共用同一組雲端資料來源。
- 使用正式帳號在 Preview 新增札記、修改書稿、匯出 EPUB、刪除書籍或同步資料，正式站同帳號會看到同一份資料。
- 現有「測試版本」banner 只是提醒，不會阻擋寫入，也不是資料隔離。
- 在 Preview 資料隔離完成前，不應使用正式帳號與正式資料做寫入測試。

## Runtime 環境判斷

正式站 allowlist：

```text
www.devotionbook.com.tw
devotionbook.com.tw
```

顯示測試版本 banner：

```text
localhost
127.0.0.1
::1
*.vercel.app
其他非正式網域
```

程式中的 runtime helper 只回報非敏感狀態，例如 `production`、`local`、`preview`、`non-production`、`unknown`。必要時可用 `window.DevotionRuntime.getEnvironment()` 做本機診斷；這個 helper 不回報 Supabase URL、project ref、token 或 key。不可在 UI、console、toast、API response 中輸出任何實際連線值。

## 現有環境變數名稱盤點

前端 / 使用者可設定的雲端連線概念：

```text
SUPABASE_URL
SUPABASE_ANON_KEY
```

目前注意事項：

- 前端仍有預設雲端連線設定；此設定不應在文件或日誌中輸出實際值。
- 單純在 Vercel Preview 設定 env vars，不一定會自動改變瀏覽器端的預設連線。
- 真正落地 Preview 隔離前，需要新增一個安全的前端 runtime config 載入方式，或讓部署流程把 Preview 專案的公開連線設定注入前端。

Serverless API 相關 env var 名稱：

```text
ADMIN_EMAILS
SUPABASE_ANON_KEY
SUPABASE_PROJECT_REF
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ACCESS_TOKEN
VERCEL_ACCESS_TOKEN
VERCEL_PROJECT_ID
VERCEL_TEAM_ID
VERCEL_ORG_ID
RESEND_API_KEY
SUPPORT_RECEIPT_FROM_EMAIL
SUPPORT_RECEIPT_TO_EMAIL
```

Preview 與 Production 必須分開的值：

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_PROJECT_REF
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ACCESS_TOKEN
```

視需求分開或停用的值：

```text
RESEND_API_KEY
SUPPORT_RECEIPT_FROM_EMAIL
SUPPORT_RECEIPT_TO_EMAIL
VERCEL_ACCESS_TOKEN
VERCEL_PROJECT_ID
VERCEL_TEAM_ID
VERCEL_ORG_ID
```

## 寫入資源盤點

主要雲端 tables：

```text
devotion_notes
devotion_prayers
book_projects
book_snapshots
library_books
library_book_chapters
```

主要 Storage bucket：

```text
library-books
```

目前 `library-books` 會保存 EPUB、封面與帳號頭像相關檔案。Preview 專案需要建立同名 bucket 與對應 storage policy，讓現有程式不必改 bucket 名稱即可測試。

## 建立 Supabase Preview 專案

建議採用獨立 Supabase Preview 專案作為第一選擇；若團隊後續決定使用 Supabase Branching，也要確保每個 Preview branch 使用獨立 credentials 與獨立資料。

步驟：

1. 在 Supabase 建立新的 Preview / Staging project。
2. 套用與 Production 相同的 database schema。
3. 套用與 Production 相同的 RLS policies。
4. 建立 Storage bucket `library-books`。
5. 套用與 Production 相同目的的 Storage policies。
6. 設定 Auth redirect URLs，包含 Preview 網域與本機測試網域。
7. 建立測試帳號，不複製正式使用者個資。
8. 匯入必要 seed / sample 資料，只放可公開測試資料。
9. 不複製正式札記、禱告、書稿、書櫃內容或頭像檔案。
10. 記錄 Preview 專案使用的 env var 名稱與負責人，但不得記錄實際值。

驗證：

1. 使用 Preview 測試帳號登入 Preview 網址。
2. 新增一篇標題含 `PREVIEW-ONLY` 的測試札記。
3. 在 Preview 匯出一本測試 EPUB。
4. 確認 Preview 書櫃看得到測試書。
5. 登入正式站同一位正式使用者，不應看到 Preview 測試札記或測試書。
6. 在 Supabase dashboard 確認寫入落在 Preview 專案，不在 Production 專案。

## Vercel Preview Env 設定

Production：

- 保持既有 Production env。
- 不因 Preview 測試而改動 Production env。
- Production deployment 仍只由 `main` / production branch 觸發。

Preview：

- 設定 Preview environment variables 指向 Supabase Preview 專案。
- 若 Vercel 專案支援 branch-specific Preview env，優先只套用到 `feature/book-center-upgrade` 或指定測試分支。
- 不要讓 Preview 繼承 Production 的 Supabase env 值。
- env 變更後必須重新部署 Preview，舊 deployment 不會自動套用新 env。

Development / localhost：

- 本機 smoke test 可使用 local mode，不需要雲端 env。
- 若要測雲端同步，應連 Preview 專案，不應連 Production 專案。
- 不要把 `.env.local` 內容提交或貼到報告。

## 前端隔離落地前置條件

目前最重要的前置條件是：瀏覽器端必須真的使用 Preview 專案的公開連線設定。

可行做法：

1. 建立不含 secret 的 runtime config endpoint，例如只回傳瀏覽器需要的公開 Supabase URL 與 anon / publishable key。
2. 在 `bootstrap()` 前或初始化 Supabase 前載入 runtime config。
3. Production deployment 回傳 Production 專案設定；Preview deployment 回傳 Preview 專案設定。
4. 若 runtime config 載入失敗，Preview 應顯示明確測試警示，不應靜默落回 Production 預設連線。
5. 診斷資訊只顯示 runtime 類型與 config 來源，不顯示實際值。

在這個前置條件完成以前，即使 Vercel Preview env 已設定完成，仍要實測確認 Preview 的 network request 是否真的打到 Preview 專案。

## Preview 寫入保護建議

短期：

- Preview banner 持續顯示。
- 使用測試帳號，不使用正式帳號。
- 不在 Preview 做正式資料新增、匯出、刪除或覆蓋還原。
- 若必須示範寫入流程，先用可刪除的測試資料。

中期：

- 完成前端 runtime config 隔離。
- 加入非敏感診斷資訊：runtime host 類型、是否 production host、是否 preview-like host、config source；不得回報實際連線值。
- Preview 若偵測到仍使用 Production 連線，顯示更明確的警示，必要時阻擋高風險寫入。

長期：

- 建立固定 Preview / Staging Supabase 專案。
- 建立 seed data 與測試帳號。
- 建立 Preview 驗收清單，確認新增、匯出、刪除、同步、書櫃、Reader 都不污染 Production。

## 回滾與事故處理

1. 若發現 Preview 寫入 Production，立刻停止 Preview 寫入測試。
2. 不要直接刪除正式資料；先確認資料 id、來源、時間與影響帳號。
3. 由使用者或管理者決定是否刪除測試資料。
4. 若是 env 設定錯誤，修正 Preview env 後重新部署 Preview。
5. 驗證 Preview 已連到 Preview 專案後，再恢復寫入測試。

## 參考文件

- Vercel Environment Variables: https://vercel.com/docs/environment-variables
- Supabase Branching: https://supabase.com/docs/guides/deployment/branching
- Supabase Branching integrations: https://supabase.com/docs/guides/deployment/branching/integrations
