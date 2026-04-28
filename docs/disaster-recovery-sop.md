# 靈修札記成書系統｜災難重建 SOP

## 文件資訊

- 文件版本：v1.0
- 最後更新：2026-04-28
- 目前基準 commit：64e1f810db10a887054021c2371526091625fe00
- 狀態：System Backup Export 已於正式站測試可下載
- 維護原則：每次備份、還原、部署、資料結構、安全機制或重大流程有變更時，應更新本文件與更新紀錄。

## 適用範圍

本文件適用於「靈修札記成書系統」在以下情況的災難重建與資料復原：

- GitHub 原始碼遺失或需要重新部署
- Vercel Production 部署異常
- Supabase 專案異常、遺失或需要重建
- 應用資料異常，需要從 System Backup JSON 輔助還原
- 全新環境重建正式站服務

## 使用前提

執行本 SOP 前，需先確認：

- 可存取 GitHub repository
- 可存取 Vercel project
- 可存取 Supabase account / project
- 持有必要的 Production environment variables
- 持有最近一次可信任的 System Backup JSON
- 已確認目前災難類型，不盲目執行資料覆蓋
- 已先備份目前環境現況，特別是在資料異常但環境仍可存取時

## 目前限制

目前 System Backup 第一版已可匯出正式站資料，但仍有以下限制：

- System Backup 目前只有匯出，尚未完成完整一鍵 system restore。
- `imported_epub` 目前只備份 metadata，不包含 EPUB blob。
- 前端本機自動備份必須網站頁面開著才會執行。
- Egress 尚無穩定真實數據。
- Supabase schema、RLS、storage policy 不能只靠 System Backup JSON 重建。
- 現階段災難重建仍屬於「半手動重建 + 備份輔助還原」。

## 最重要警告

**System Backup JSON 不能取代 Supabase schema migration / RLS / storage policy。**

System Backup JSON 主要保存應用資料與資料表快照，不能自動重建：

- database schema
- table definitions
- indexes
- constraints
- RLS policies
- storage buckets
- storage policies
- Supabase Auth 設定
- admin 權限設定

正式災難重建時，必須先完成 Supabase schema / RLS / storage policy 重建，再處理資料還原。

## 三種災難情境判斷

### 1. 只有 Vercel 壞

如果 GitHub 原始碼與 Supabase 資料都正常，只有正式站部署異常：

- 不要動 Supabase 資料。
- 不要執行 Restore。
- 優先檢查 Vercel project、Production branch、environment variables、deployment logs。
- 修正後 Redeploy Production。
- 驗收正式站功能即可。

### 2. 只有資料異常

如果網站可開啟、部署正常，但資料內容異常：

- 先下載目前環境的 System Backup JSON。
- 保留異常狀態備份，避免失去稽核與回復線索。
- 優先使用 Merge Restore。
- 不要直接使用 Danger Restore。
- 只在確認資料可被安全合併或修復後執行還原。

### 3. 全新環境重建

如果需要建立全新的 Vercel / Supabase 環境：

- 先從 GitHub 恢復原始碼。
- 建立新的 Supabase project。
- 先建立 schema、RLS、storage bucket、storage policy。
- 設定 Vercel Production env。
- Redeploy Production。
- 確認 admin 登入與管理入口。
- 最後才處理 System Backup JSON 資料還原。

## GitHub 原始碼恢復流程

1. 確認 GitHub repository 可存取。
2. Clone repository，或使用既有乾淨 checkout。
3. 切換到 `main` branch。
4. 執行：

```bash
git fetch origin
```

5. 確認 `origin/main` 指向正式版本，例如：

```text
64e1f810db10a887054021c2371526091625fe00
```

6. 若本機可 fast-forward，執行：

```bash
git pull --ff-only origin main
```

7. 若本機與遠端分岔，不要直接 merge。應另開乾淨 checkout，或先人工確認本機未推 commit 是否仍需要保留。

## Vercel 重新部署流程

1. 確認 Vercel project 綁定正確 GitHub repository。
2. 確認 Production branch 為 `main`。
3. 確認 Production deployment 使用最新 `origin/main` commit。
4. 確認 Production environment variables 已補齊。
5. environment variables 有任何變更後，必須 Redeploy Production。
6. 部署完成後，進入正式站驗收：

```text
https://www.devotionbook.com.tw
```

## Vercel Production Env

目前正式站需要以下 Production environment variables：

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_PROJECT_REF
SUPABASE_ACCESS_TOKEN
```

用途說明：

- `SUPABASE_URL`：Supabase project API URL。
- `SUPABASE_ANON_KEY`：Supabase Publishable / anon key，用於 Supabase Auth API 的 `apikey` header。
- `SUPABASE_PROJECT_REF`：Supabase project ref。
- `SUPABASE_ACCESS_TOKEN`：Supabase Account Access Token，用於 Supabase Management API。

安全規則：

- env 變更後必須 Redeploy Production。
- 不得把任何 token / secret 寫入前端程式碼。
- 不得把任何 token / secret 寫入 console。
- 不得把任何 token / secret 寫入 toast。
- 不得把任何 token / secret 寫入 API response。
- 不得把任何 token / secret 寫入 GitHub。
- 不得把任何 token / secret 寫入 System Backup JSON。

## Supabase 專案重建流程

1. 建立新的 Supabase project。
2. 建立必要 database schema。
3. 建立必要 tables、indexes、constraints。
4. 設定 RLS policies。
5. 設定 Supabase Auth。
6. 建立或確認 admin 使用者。
7. 建立必要 storage bucket。
8. 設定 storage policies。
9. 取得新的 `SUPABASE_URL`、`SUPABASE_ANON_KEY`、`SUPABASE_PROJECT_REF`。
10. 將必要 env 設定到 Vercel Production。
11. Redeploy Production。
12. 驗證正式站可登入並可進入管理後台。

## System Backup JSON 結構

目前 System Backup JSON 結構如下：

```json
{
  "systemInfo": {
    "version": "v1",
    "exportedAt": "",
    "project": "devotion-book",
    "note": "System backup bundle"
  },
  "envTemplate": {
    "SUPABASE_URL": "",
    "SUPABASE_ANON_KEY": "",
    "SUPABASE_PROJECT_REF": ""
  },
  "appBackup": {
    "version": "v1",
    "exportedAt": "",
    "user": {},
    "notes": [],
    "drafts": [],
    "library": []
  },
  "dbBackup": {
    "devotion_notes": [],
    "book_projects": [],
    "library_books": [],
    "library_book_chapters": []
  }
}
```

### systemInfo

記錄備份版本、匯出時間、專案名稱與備份說明。

### envTemplate

只列出重建時需要的 env 名稱，不包含任何真值。

### appBackup

應用層資料備份，對應目前管理後台匯出、匯入預覽、Merge Restore、Danger Restore 的資料格式。

### dbBackup

資料表層級快照，用於災難重建人工比對、未來 system restore，或 DB 層還原輔助。

## appBackup 與 dbBackup 用途差異

`appBackup` 是應用層備份格式，主要服務目前前端管理後台的備份、匯入預覽與 restore 流程。它適合用來檢查使用者資料、札記、草稿與書櫃資料在應用層是否完整。

`dbBackup` 是資料表層級快照，主要用於災難重建時人工比對資料表內容，也可作為未來 system restore 或 DB 層還原工具的基礎資料來源。

正式災難重建時，建議以 `dbBackup` 作為資料表還原與比對依據，以 `appBackup` 作為應用層驗證與 restore 流程輔助。

## 建議資料還原順序

1. Supabase Auth / 使用者身分確認
2. `devotion_notes`
3. `book_projects` / drafts
4. `library_books`
5. `library_book_chapters`
6. `imported_epub` metadata

## imported_epub metadata 與 blob 限制

目前 System Backup 只備份 `imported_epub` metadata，不包含 EPUB blob。

因此，即使 metadata 還原成功，原始 EPUB 檔案內容也不會自動恢復。若需要完整 EPUB 災難復原，未來必須補上 Supabase Storage / imported EPUB blob 備份策略。

## 正式還原前檢查清單

- 已確認災難情境類型。
- 已下載目前環境最新 System Backup JSON。
- 已保存欲還原的可信任備份檔。
- 已確認目標 Supabase schema 已建立。
- 已確認 RLS policies 已建立。
- 已確認 storage bucket 與 storage policy 已建立。
- 已確認 admin 使用者可登入。
- 已確認 Vercel Production env 已設定。
- 已確認 env 變更後已 Redeploy Production。
- 已確認不會把 token / secret 寫入任何公開位置。
- 已確認要使用 Merge Restore 或 Danger Restore。
- 已理解 imported_epub blob 不會透過 JSON 還原。

## Danger Restore 警告

> **一般修復優先使用 Merge Restore。只有在非常明確的全新空庫或完全覆蓋情境下，才考慮 Danger Restore。**

只有以下條件全部成立時，才可考慮 Danger Restore：

- 目標環境是全新空庫。
- 已先匯出目前環境備份。
- 已確認要完全以備份檔取代目前資料。
- 已理解 `imported_epub` blob 不會回來。
- 已確認 admin 身分與 `backup.user` 差異。
- 已理解此操作可能清除現有資料。

若只是局部資料異常、少量資料遺失、正式站仍有可用資料，應優先使用 Merge Restore 或人工修復。

## 正式站驗收清單

還原或重新部署後，需檢查：

- 登入功能正常。
- admin 管理入口可進入。
- 可下載 System Backup。
- 手動 JSON 備份可用。
- 匯入預覽可用。
- Merge Restore 流程可用。
- Danger Restore 按鈕保護存在且不會誤觸。
- 札記功能正常。
- 選稿編排功能正常。
- 書櫃功能正常。
- 章節閱讀功能正常。
- 手機底部導航正常。
- console 不洩漏 token。
- toast 不洩漏 token。
- API response 不洩漏 token。
- System Backup JSON 不包含 token / secret。

## 未來補強清單

- Supabase schema migration 文件
- RLS / storage policy 文件
- Supabase Storage / imported_epub blob 備份
- 一鍵 system restore
- restore dry-run
- 備份完整性 checksum
- 定期演練紀錄
- Vercel Cron + Supabase Storage 雲端備份

## 更新紀錄

| 日期 | 文件版本 | 對應 commit | 更新內容 |
|---|---|---|---|
| 2026-04-28 | v1.0 | 64e1f810db10a887054021c2371526091625fe00 | 建立災難重建 SOP 初版；確認 System Backup Export 已於正式站可下載 |
