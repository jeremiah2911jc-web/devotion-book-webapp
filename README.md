# 靈修札記成書系統

這是可直接部署到 Vercel 的靜態版本。

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

## 主要功能

- 本機模式 / Supabase 模式登入
- 札記新增、編輯、刪除、搜尋
- 書籍專案新增、編輯、刪除
- 章節加入、排序、移除、改名
- 前言、後記、封面、模板
- 快照備份
- EPUB 匯出
- 支持平台彈窗與頁尾版權連結
