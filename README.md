# 靈修札記成書系統

這是可直接部署到 Vercel 的靜態版本，已包含：

- 本機模式登入
- Supabase Auth 註冊 / 登入 / Magic Link
- 札記、書籍、快照的雲端同步
- 同帳號跨手機、電腦、平板共用資料
- 雲端即時同步監看
- 備份 JSON 下載

## 本機測試

直接開啟 `index.html`，或在專案目錄執行：

```bash
python3 -m http.server 3000
```

然後開啟 `http://localhost:3000`。

## Vercel 部署

1. 將整個資料夾上傳到 GitHub。
2. 在 Vercel 匯入該 repository。
3. Framework Preset 選 `Other`。
4. Build Command 留空。
5. Output Directory 留空。
6. Deploy。

## Supabase 建置步驟

1. 建立一個新的 Supabase 專案。
2. 到 SQL Editor 執行 `schema.sql`。
3. 到 Authentication 開啟 Email / Password。
4. 若要使用 Magic Link，也開啟 Email OTP / Magic Link。
5. 在 URL Configuration 裡加入你的站點網址：
   - Vercel 正式網址
   - 若有自訂網域，也一併加入
6. 在專案 Settings 取得：
   - Project URL
   - anon public key
7. 回到系統登入頁右上角設定，填入 URL 與 anon key。

## 同步邏輯

- 同一個雲端帳號登入後，札記、書籍、快照會存到雲端。
- 其他裝置用同一帳號登入後，會讀到同一份資料。
- 系統會監看雲端資料變更，其他裝置更新後會自動重新同步。
- 若你之前在本機模式已經建立資料，可在登入雲端帳號後按「本機資料上傳雲端」。
- 可另外按「下載備份」匯出 JSON 備份檔。

## 主要功能

- 本機模式 / Supabase 模式登入
- 跳出式註冊 / 登入視窗
- 札記新增、編輯、刪除、搜尋
- 經文抓取與自動帶入內容
- 書籍專案新增、編輯、刪除
- 章節加入、排序、移除、改名
- 前言、後記、封面、模板
- 快照備份
- EPUB 匯出
- 雲端同步與跨裝置作業
