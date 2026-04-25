# 今日默想資料維護流程

## 資料來源

- 原始 Excel：
  `C:\Users\allen\OneDrive\桌面\靈修書房_2026年度今日默想內容庫.xlsx`
- 正式前端資料：
  `data/today-devotions-2026.json`

## 轉檔指令

```bash
node scripts/export-today-devotions.mjs "C:\Users\allen\OneDrive\桌面\靈修書房_2026年度今日默想內容庫.xlsx"
```

## 欄位對應

- `日期` → `date`
- `星期` → `weekday`
- `月份` → `month`
- `年度階段` → `theme`
- `節期/特殊日` → `specialDay`
- `特殊群組` → `specialGroup`
- `主題` → `title`
- `金句` → `quote`
- `短解析` → `summary`
- `卡片署名` → `signature`
- `是否特殊` → `isSpecial`
- `CSS標籤` → `cssTag`
- `來源/備註` → `sourceNote`

另外說明：

- `scripture` 目前保留空字串，因為 Excel 尚未有獨立正式經文欄位。
- 首頁今日默想卡片目前優先顯示 `quote`。

## 更新流程

1. 修改 Excel 母檔。
2. 執行轉檔腳本，更新 `data/today-devotions-2026.json`。
3. 確認 JSON 筆數為 `365`。
4. 確認指定日期資料正常。
5. 執行測試。
6. commit。
7. push。
8. 等待 Vercel 部署完成。
9. 檢查正式站 JSON 與首頁今日默想卡片。

## 驗收指令

```bash
node --check app.js
node smoke-test.cjs
git status --short
```

## 注意事項

- 不要 commit 原始 `xlsx`。
- 不要直接手改大量 JSON，應優先從 Excel 重新轉出。
- 若 Excel 日期格式異常，先停下檢查，不要硬猜。
- 若未來新增正式經文欄位，再調整 `scripture` 對應。
- 靜態 HTML 初始 fallback 屬正常狀態，實際畫面會在 JS 載入 JSON 後覆蓋。
