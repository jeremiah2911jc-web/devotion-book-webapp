# Reader Panel Scaffold Backup

備份對應 commit：

`2096e58d244f511bd71bed4249767b05fc4d5e4a`

## 備份目的

保存「閱讀器控制面板 scaffold 完成後」的可用版本，供後續 UI 調整失敗時比對與恢復。

## 此版本已包含

- `readerActivePanel`
- `openReaderPanel` / `closeReaderPanel` / `toggleReaderPanel` / `renderReaderPanels`
- `menu` / `toc` / `search` / `settings` / `bookmarks` panels
- 目錄可跳章
- 搜尋 UI stub
- settings panel 接 `readerSettings`
- bookmarks panel 顯示目前位置
- column-based pagination 核心保持穩定

## 注意

這份備份是文件化 snapshot，不是正式執行檔。

如果後續閱讀器 UI 改壞，可用 Git 回到此 commit，或對照 snapshot 還原。
