# Reader Controls Layout Backup

備份對應 commit：

`9ff280a0805d10d819412134c4c5871d7829426b`

## 備份目的

保存「上方工具列已隱藏、底部大功能按鈕已移除、右下角浮動功能入口已建立」的可用閱讀器版本，供後續控制按鈕與設定面板調整失敗時比對與恢復。

## 此版本包含

- `readerActivePanel`
- 右下角浮動功能入口
- `menu` / `toc` / `search` / `settings` / `bookmarks` panels
- 目錄可跳章
- 搜尋 UI stub
- settings panel 接 `readerSettings`
- bookmarks panel 顯示目前位置
- 上方常駐 toolbar 已隱藏
- 底部大顆「功能」按鈕已移除
- column-based pagination 核心保持穩定

## 注意

這份備份是文件化 snapshot，不是正式執行檔。

如果後續閱讀器 UI 改壞，可用 Git 回到此 commit，或對照 snapshot 還原。
