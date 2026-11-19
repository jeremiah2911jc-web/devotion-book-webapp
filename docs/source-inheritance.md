# Devotion 規則來源與繼承紀錄

編製日期：2026-11-13。此文件為內部維護依據，不進公開網站產物。記錄本輪閱讀範圍、規則轉譯及未移植項目；來源文件本身不等於現站已實作、已通過測試或已發布。

## 本輪文件與狀態

| 候選文件 | 建議納入專案位置 | 目的 |
| --- | --- | --- |
| `AGENTS.md` | 根目錄 `AGENTS.md` | 每次修改前後的共同工作要求、產品決定及授權界線 |
| `website-design-rules.md` | `docs/website-design-rules.md` | 日常讀寫方向、視覺、互動、多尺寸與完整入口驗收 |
| `website-copy-rules.md` | `docs/website-copy-rules.md` | 全部回覆與系統文案的禁令、原稿保護及語意盤查 |
| `deployment-security-rules.md` | `docs/deployment-security-rules.md` | 隔離、API、公開打包、檢查、發布及回復 |
| 本文件 | `docs/source-inheritance.md` | 來源、版本、映射、衝突及候選實作待確認事項 |

五份文件為修正版候選規則，須由主工作流程納入專案並核對實作。清單式 `dist`、`verify:copy`、`verify:security`、API 清單與建置後掃描是本輪目標，執行結果另記。這些內部文件不應因靜態部署而成為公開下載。

## 使用者決定

- 2026-10-26 五入口方案已否決；不得改名或換樣式恢復同一主架構。
- 本輪授權依建議修正並將規則固定記錄，先完成具體預覽及必要檢查；正式發布的認可留到使用者檢視新版本後。
- 文案禁令涵蓋網站與助理所有回覆，不能以網站以外的媒介或進度訊息作例外。
- 原有自動暫存、草稿復原與私人內容保留；日期麥琴沿用曆日，保留不加入個人完成進度的決定。
- 不把私人札記／禱告變成公開文章；內部編輯狀態不擴張為公開授權。
- 保留禱告、札記、成冊、快照、EPUB、書房、閱讀器、登入及既有備份。新增來源註記、筆記連結、反向連結與完整離線能力須另有實作證據。
- 不隨本輪修改資料庫、Auth、正式資料、備份與常駐監測排程，不擅改儲存庫可見性或購買方案。

## 三策正式來源

已完整閱讀下列 11 份文件。來源為私人儲存庫 `jeremiah2911jc-web/sansce-website-source` 的 `origin/main`，查核提交：

`989a236544ce7fd69ce3c6f691a8d4820f46117b`

以 `git show origin/main:<path>` 讀取，未把歷史副本或其他儲存庫當作最新來源。只移植適用原則與可執行要求，未複製三策私人規則全文、商業資料、服務設定或密鑰。

| 已讀來源 | 轉入的規則 | 保留在原產品的範圍 |
| --- | --- | --- |
| `AGENTS.md` | 修改前閱讀、全站範圍、素材核對、具體文字、完整驗收、預覽認可與發布證據；轉入四份主規則 | 三策品牌、公司頁尾、人物、地政內容、網站助理與商業服務條件 |
| `docs/website-design-rules.md` | 實看三個參考、比例與字體、避免同構卡片、自然換行、對比、互動、圖片品質、共用樣式與多尺寸檢查；轉入設計規則 | 固定品牌視覺、顧問人物組合、土地場景、頁面專屬布局及自動輪播 |
| `docs/article-writing-rules.md` | 禁詞、禁句、語意直接、具體動詞、事實／假設分開、逐句盤查、全入口同步；轉入文案與 AGENTS | 土地費用、權益、工程成果等專業內容及 Threads 專屬短行排版 |
| `docs/deployment-security-rules.md` | 最新來源、PR 與必要檢查、API 清單、權限、金鑰、產物掃描、預覽隔離、平台查核與回復；轉入部署規則 | 三策私人儲存庫屬性、報告封裝、關閉註冊、服務專用角色與特定 API |
| `docs/website-security-release.md` | 發布前後證據、部署來源、敏感檔案排除及受保護入口驗收；轉入部署規則 | 舊發布當次已完成狀態與當時平台資料，不當作 Devotion 現況 |
| `docs/SITE_VISIBILITY.md` | 公開／受保護內容分離、設定變更需核對實際入口；轉入部署與文案規則 | 歷史暫時隱藏與恢復步驟、舊路徑；不執行到 Devotion |
| `docs/card-design-audit-20261019.md` | 卡片須有資料或互動理由、整頁節奏、密度與容器盤查；轉入設計規則 | 歷史頁面缺陷及當次合格判定，不當作候選版已驗收證據 |
| `docs/design-reference-study-20261019.md` | 實際瀏覽、記錄採用方法與排除項、禁止抄整套；轉入設計規則 | 弘鼎旅行社等三策參考的特定視覺與當日結論，不成為 Devotion 強制樣式 |
| `docs/land-readjustment-acquisition-rules.md` | 來源、資料版本、精度、狀態與限制分開，取消／回復不污染原資料；轉譯到保存、快照與匯出 | 土地公式、主管機關、都市計畫、22 縣市、付款與土地取得業務 |
| `docs/web-land-evaluation-integration-rules.md` | 網站／工具邊界、輸入輸出完整性、預覽、相容性與回復；轉譯到既有模組責任與版本 | 三策 App 專屬計算分工、桌機限定、離開清空與禁止自動草稿 |
| `docs/website-assistant/operations.md` | 來源有效性、服務端權限、額度／環境分離、設定驗證、維護紀錄；轉入部署規則 | 助理 USD 3 限額、價格來源、Turnstile、LINE 事件與特定價格排程；不新增本站 AI 功能 |

## Devotion 既有 SOP 與 QA

已完整閱讀下列專案來源，查核基準為 `devotion-book-webapp` 遠端 `main` 提交：

`8f8efb74846d74633a0a5711253dac884e152e86`

本機舊 `main` 落後遠端，主工作流程應從遠端最新基底準備候選版。下列文件為現有操作依據，其歷史狀態仍須與候選程式及平台核對。

| 已讀文件 | 保留與轉入的內容 |
| --- | --- |
| `README.md` | 靜態程式、Vercel、Supabase、版本同步與使用模組；舊版本文字與實際 package／程式不一致時，保存差異並更新 |
| `QA_PREFLIGHT_CHECKLIST.md` | 變更範圍、依風險驗證、來源與語法檢查，避免誤動既有功能 |
| `QA_TESTING_GUIDELINES.md` | 以真實可見操作驗證、選取器可靠性、頁面狀態與證據；保留必要測試和未驗說明 |
| `docs/local-dev-environment.md` | 埠與程序辨認、隔離 context、localStorage 種子、本機／正式能力界線與正式資料保護 |
| `docs/preview-data-isolation-sop.md` | Preview 曾共用正式後端的已知限制、獨立環境目標、不可回退正式設定、禁止用正式資料測試 |
| `docs/disaster-recovery-sop.md` | 來源、部署、Auth、資料表／Storage、檔案與可恢復範圍；備份、匯出及完整還原分開認定 |
| `docs/supabase-auth-email-verification-checklist.md` | 信箱驗證、回呼與環境設定、寄信能力的真實驗證；不在設計任務變更 Auth |
| `docs/supabase-google-login-checklist.md` | Google 身分、回呼、相同信箱與設定範圍；不刪正式使用者或擅改付費網域方案 |

另完整閱讀三份 2026-06-02 外部維護文件，來源目錄為使用者 `Documents/Codex`：

| 已讀文件 | 保留與轉入的內容 |
| --- | --- |
| `devotion-codex-workflow-sop-20260602.md` | 先了解架構、保留功能與資料、規劃／修改／驗收／發布、交付紀錄、經文與匯出檢查 |
| `devotion-ui-design-system-20260602.md` | 實際內容檢驗、手機／桌機、編輯器及閱讀器規範、改版前預覽；舊卡片與樣式範例不強迫沿用 |
| `devotion-pre-push-check-matrix-20260602.md` | 依變動風險決定驗證範圍、控制測試目的、發布前必要檢查與結果紀錄 |

## 衝突與不移植事項

| 來源差異 | 本輪採用方式 |
| --- | --- |
| 三策土地評估離開即清空、不保留草稿 | Devotion 保留個人暫存與復原；身分隔離另驗，不以刪稿達成 |
| 三策公開文章索引及 SEO | 僅適用 Devotion 公開介紹／說明；私人資料不得建立公開索引與摘要 |
| 三策桌機限定與 App 土地計算分工 | 本站依實際模組支援手機／平板／桌機；原有編輯、匯出與閱讀權限保持 |
| 三策固定 watermark、公司字樣、顧問組合、土地圖片 | 不移植；Devotion 影像依真實內容及授權決定，不強制私人札記附圖 |
| 三策關閉註冊、私有 schema 與多個專用連線 | 不當作修改 Devotion Auth 或角色的授權；只繼承服務端授權與最小資料範圍原則 |
| 三策來源維持私人 | 查核 Devotion 既有公開來源與可用保護，不擅自改可見性；敏感資料與內部文件從公開產物排除 |
| 舊 SOP 的直接更新／ff-only 步驟 | 本輪新增正式發布 PR 流程；工作分支先與最新 `main` 核對，禁止直接推主分支及繞過必要檢查 |
| 舊 UI 規範中的卡片與色彩範例 | 依本輪使用者對版型的修正重做；延續可及性、操作一致與資料完整要求 |
| 舊文件的當次完成、平台狀態與測試結果 | 保留其歷史日期；候選版與正式站重新取得證據，不直接沿用合格結論 |
| 全站禁詞與使用者內容自由 | 平台系統文案與助理回覆遵守禁令；使用者原稿、經文及明示引文不被掃描改寫 |
| 正式發布、備份與排程 | 三項各自依授權；部署不建立新備份或常駐工作 |

## 與實作共同確認的項目

1. 五份規則納入正確位置；內部連結可用；公開 `dist` 僅包含清單內檔案，API 包裝不將內部目錄暴露。
2. `verify:copy` 覆蓋平台來源、共享／動態字串與產物，例外範圍精確；人工覆讀完成且使用者原稿未被改寫。
3. `verify:security` 與 API 清單符合實際路徑、方法、授權和回應；本機合成測試涵蓋未登入、過期及跨使用者案例。
4. `npm run build` 為 Vercel 實際建置命令，公開輸出指向 `dist`；必要檢查與全歷史金鑰掃描可執行。GitHub Actions、分支保護、平台環境及 CSP 由實際設定查核。
5. 本機隔離 context 及網路證據確認不寫入正式後端。Preview 的隔離目標尚需實際證明，不能沿用文件上的規劃當成完成。
6. 短記直接起筆、日期暫名、現有自動暫存、復原、內部狀態、麥琴日期與全部既有模組通過回歸；本機 mock 與正式雲端能力分開記錄。
7. 新增的連結、來源註記、搜尋上下文與離線能力依候選實作逐項列明；沒有實作的建議不出現成功宣稱或無作用入口。
8. 多尺寸、Safari、必要的 iPhone 鍵盤／safe-area／PWA 與閱讀器互動完成實際檢查；工具無法覆蓋的項目保持待驗。
9. 備份與還原依當前程式再次核對。舊 SOP 的部分表備份、未涵蓋資料及檔案限制如實標示，不擅改排程。
10. 使用者看過具體預覽並批准，才執行 PR／正式發布；發布後核對精確提交、版本、網域、API 拒絕與受影響操作，再回報上線。

## 來源完整性記錄

下表 SHA-256 對應本輪查核來源內容，供未來比對來源漂移。三策與專案來源採上述精確提交；外部 SOP 採本輪讀取的檔案內容。雜湊值只識別文件，不證明產品測試或平台設定已通過。

| 來源 | 文件 | 行數 | SHA-256 |
| --- | --- | ---: | --- |
| 三策 | `AGENTS.md` | 255 | `162f7898ca921f7d91e8ee09baffbb60cc5be426b0e80fdd7e353c660e67275a` |
| 三策 | `docs/website-design-rules.md` | 577 | `dc80f3a39de784bbe9d2fc636ecce871fb366baffc3b8edd8d671195f2eb3dc1` |
| 三策 | `docs/article-writing-rules.md` | 128 | `e137cbb0a0bc1a51522995ad8931d63b7ce663ea562cc2d35ad6054adc007a41` |
| 三策 | `docs/deployment-security-rules.md` | 65 | `3a1baa311b5d3d95bb68193e299220da3649bce15c389686ba1e8b97fbec8e4c` |
| 三策 | `docs/website-security-release.md` | 25 | `6cf74afc4c30c74ce0b49152e27601b07dd2d6cbc864198e54368261df26db5d` |
| 三策 | `docs/SITE_VISIBILITY.md` | 49 | `8221856096c7295abe9e3ffd815f0fa2c79e806cf30d9930dda0815eb71f78be` |
| 三策 | `docs/card-design-audit-20261019.md` | 52 | `559cf4d2c782018c97c26035a249b23c6818fe86a0d3c48836fa580d797344b3` |
| 三策 | `docs/design-reference-study-20261019.md` | 63 | `b360f734efc0828e70e0a652059a67081e51da9e72f8a567c971490ea0562f51` |
| 三策 | `docs/land-readjustment-acquisition-rules.md` | 349 | `fc0c332569d1de0b291d55463ef3687909593def08c18d5328c6b80bb640b60f` |
| 三策 | `docs/web-land-evaluation-integration-rules.md` | 175 | `1f2fdd100a847ae78bc43475accf524dae8913171d6daef598660a603f406f79` |
| 三策 | `docs/website-assistant/operations.md` | 52 | `c32a97d9054018ada1b55adfa5773f0e3f09bb20a6dadfc5d45832b48bfd4791` |
| Devotion | `README.md` | 57 | `a5b5b06787bfa8b78eb3606e264ab46d6a2ff0f1b2ba4ee1c02fa65cc4abcb2e` |
| Devotion | `QA_PREFLIGHT_CHECKLIST.md` | 49 | `e4ed013ecbc7024b42d35d07c974a98874fe24638534b366e9a866e9764f5465` |
| Devotion | `QA_TESTING_GUIDELINES.md` | 174 | `beb628f0efc493622e3b91633700d4973fb2a1f40fbf14ab091d17fd8c98fc1c` |
| Devotion | `docs/local-dev-environment.md` | 146 | `01dc2c1f15370593a19fa9dc7c66536601950af0b979b72aeb0979a44fed5d25` |
| Devotion | `docs/preview-data-isolation-sop.md` | 204 | `fdb0e832aaafcdf6cc30e1e488da63a5f10d2973b2c6857b6d2880705382b745` |
| Devotion | `docs/disaster-recovery-sop.md` | 316 | `663b591b00532448375df5af42c470f1e6e8ac98b87a00e830c2dd7cc43bf266` |
| Devotion | `docs/supabase-auth-email-verification-checklist.md` | 70 | `d43f230f5bbcdc00d5736fdbf36fce054cdc44ac63537988b21349eea31ea28d` |
| Devotion | `docs/supabase-google-login-checklist.md` | 116 | `b65beeecd8eb0bfabd4ef234734755e148b523ab7c6e7876389ae37cfad36fe6` |
| Devotion外部SOP | `devotion-codex-workflow-sop-20260602.md` | 335 | `ce3d908a2c6bb8d3205b9fa5c12ee54d9bc7074138de700cf668b21dabc1dc0a` |
| Devotion外部SOP | `devotion-ui-design-system-20260602.md` | 194 | `135d247d0137bc4824abc5a14e71c574755e7b53dd57a76e40d9d107faf3f21e` |
| Devotion外部SOP | `devotion-pre-push-check-matrix-20260602.md` | 107 | `2fb686b10b241621e20b1f41113fdf44004879737cb1b2e2afbee94d51e444df` |
