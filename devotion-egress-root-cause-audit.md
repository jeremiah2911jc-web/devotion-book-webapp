# Devotion Supabase Egress Root Cause Audit

Date: 2026-05-03
Repo: `C:\src\devotion-book-webapp`
Production: `https://www.devotionbook.com.tw/`

## 1. Current Usage Observation

User-provided Supabase screenshots/email indicate Free Plan egress is far above quota, roughly 14GB / 5GB. Database size, Storage size, Realtime, Auth, and MAU appear low. This points to repeated downloads/responses, but the current evidence does not prove whether the source is browser app use, old tabs, bots, direct Supabase calls, Vercel functions, or Storage object access.

Important caution: the user reports almost no site edits or active usage in the last two days. Therefore the root cause should not be locked to normal user interaction such as `loadAllData()` or EPUB reading until Supabase/Vercel logs confirm request paths and response volume.

## Supabase Logs 查證結果（目前已查）

User checked the currently visible Supabase Dashboard Usage and Logs views.

### Storage logs

Scope checked: Last 1 hour / Last 24 hours.

Observed:

- Visible records were mostly Supabase Dashboard/internal activity, such as tenant health, bucket list, and tenant pool lookup.
- No visible `library-books` activity.
- No visible `book.epub` download activity.
- No visible `cover.*` activity.
- No visible `avatar` activity.
- No visible evidence of recent high-volume Storage file downloads.

Current interpretation:

- There is no current evidence that Storage is still continuously leaking/downloading large files in the recent visible log window.
- This does not rule out Storage as the source of the historical 4/26-4/30 spike, because the currently visible logs may not go far enough back or may not expose enough object-level detail on the current plan.

### PostgREST logs

Scope checked: Last 24 hours.

Observed:

- Only one visible log entry: `Warp server error: Thread killed by timeout manager`.
- No visible `/rest/v1/devotion_notes` activity.
- No visible `/rest/v1/book_projects` activity.
- No visible `/rest/v1/library_books` activity.
- No visible `/rest/v1/library_book_chapters` activity.
- No visible evidence of recent high-volume database API queries.

Current interpretation:

- There is no current evidence that PostgREST/Database API is still continuously sending large responses in the recent visible log window.
- The timeout entry should be noted, but by itself does not identify a table, endpoint, object path, IP, or response size.

### Usage / Reports

Observed:

- Egress used in period: `14.57GB`.
- Egress spike was concentrated around `2026-04-26` to `2026-04-30`.
- Usage appears to drop clearly after `2026-05-01`.
- Cached Egress: `0.02GB`.
- Edge Functions: `0`.
- Realtime messages: `249`.
- Realtime peak connections: maximum `4`.
- Monthly Active Users: `4`.
- Database size: about `29.54MB`.
- Storage size is very small.

Current interpretation:

- Current dashboard evidence does not show a backend job or API/Storage path still actively generating large egress after the spike window.
- The main egress event appears historical and concentrated on `2026-04-26` to `2026-04-30`.
- Because the currently visible Storage/PostgREST logs do not show the 4/26-4/30 object paths or API endpoints, the exact historical root cause is still not proven.
- Low Cached Egress suggests the egress was probably not mostly CDN/browser-cache-served static assets.
- Edge Functions being `0` makes Supabase Edge Functions unlikely.
- Realtime messages/peak connections and MAU are low, making Realtime/Auth less likely as the main 14.57GB source, though old browser sessions should still be considered if they triggered REST/Storage traffic.

### Updated conclusion from current logs

1. There is currently no evidence that a backend process is still running and continuously producing high egress.
2. Recent visible Storage and PostgREST logs do not show large data exfiltration or repeated large downloads.
3. The spike is mainly historical, concentrated around 2026-04-26 to 2026-04-30.
4. The visible dashboard/log window is insufficient to precisely identify the historical object path or API endpoint.
5. The current `app.js` stopgap patch remains reasonable as a preventive mitigation because it reduces repeated egress-prone behavior, but it must not be described as proof that the unique root cause was found.

### Additional evidence still needed

To identify the historical source more precisely, check whether:

- Supabase can provide or expose Storage/API logs for 2026-04-26 to 2026-04-30.
- Vercel can show Function logs for the same period, especially `/api/system-backup` and `/api/admin-usage`.
- Any old logged-in browser tab, PWA, Vercel Preview, local dev environment, or other client was connected to the production Supabase project during that period.
- The user or a test script opened the bookshelf, read/downloaded EPUBs, downloaded system backups, or stress-tested the reader around 2026-04-26 to 2026-04-30.

## Vercel Function Logs 查證結果

Requested focus window: `2026-04-26` to `2026-04-30`.

Target endpoints:

- `/api/system-backup`
- `/api/admin-usage`

### Access available from this local environment

Local environment check:

- Vercel CLI: not installed.
- `VERCEL_TOKEN` environment variable: not present.
- Local `.vercel` project link directory: not present.
- Therefore Codex could not directly open or query Vercel dashboard/runtime logs from this machine.

Official Vercel documentation notes that runtime logs are stored with plan-based retention limits:

- Hobby: 1 hour of logs.
- Pro: 1 day of logs.
- Pro with Observability Plus: 30 days of logs.
- Enterprise: 3 days of logs.
- Enterprise with Observability Plus: 30 days of logs.

Because the target window is `2026-04-26` to `2026-04-30`, and the current date is `2026-05-03`, a Hobby/free project would normally not be able to show those runtime logs now. If the project is Pro without Observability Plus, the target window would also usually be outside the retention period. Historical confirmation would require Observability Plus, an existing Log Drain, exported logs, or Vercel support access.

### Public endpoint behavior currently verified

Unauthenticated requests against production were tested:

- `GET https://www.devotionbook.com.tw/api/system-backup` returned `401`.
- `POST https://www.devotionbook.com.tw/api/system-backup` returned `405`.
- `GET https://www.devotionbook.com.tw/api/admin-usage` returned `401`.
- `POST https://www.devotionbook.com.tw/api/admin-usage` returned `405`.

Interpretation:

- Anonymous bots or crawlers hitting these endpoints without bearer tokens should not trigger the heavy Supabase Management API queries.
- A large number of 401/405 calls could still create small Vercel responses, but should not by itself explain 14.57GB of Supabase egress.
- Successful `200` calls to `/api/system-backup` remain high-risk because that endpoint performs full-table read-only backup queries after admin bearer-token verification.

### What could not be confirmed here

The following items could not be confirmed from this local environment:

1. Whether Vercel project dashboard name is exactly `devotion-book-webapp`.
2. Whether Vercel can still show runtime logs for `2026-04-26` to `2026-04-30`.
3. Whether `/api/system-backup` had many successful `200` calls in that period.
4. Whether `/api/admin-usage` had many successful `200` calls in that period.
5. Whether there were many `401` or `405` bot requests in that period.
6. Whether repeated calls came from the same IP or user agent.
7. Whether duration, memory, outgoing request, or response size was abnormal.

### Required manual Vercel check

In Vercel Dashboard:

1. Open Project: `devotion-book-webapp`.
2. Open Logs / Runtime Logs.
3. If timeline allows, set range to `2026-04-26` through `2026-04-30`; otherwise record that the plan cannot retain that range.
4. Filter Environment: `production`.
5. Filter Request Path:
   - `/api/system-backup`
   - `/api/admin-usage`
6. Filter Status Code:
   - `200`
   - `401`
   - `405`
   - `5xx`
7. For matching rows, record:
   - count by endpoint
   - status code distribution
   - timestamp clustering
   - IP if visible
   - user agent
   - duration
   - memory
   - outgoing requests if shown
   - response size if shown

### Current Vercel conclusion

No evidence has been found from local checks that `/api/system-backup` or `/api/admin-usage` is currently open to unauthenticated heavy use.

However, the key historical question remains unresolved: whether these endpoints had successful authenticated `200` invocations during the 2026-04-26 to 2026-04-30 Supabase egress spike. If Vercel cannot retain that period, this path can only be ruled in/out through external log drains, Vercel support, or circumstantial evidence from Supabase logs.

## 2. Working Tree State

- Branch: `main`
- HEAD / origin/main: `692dd4c2f520ff2e2f56b1c2266a99194f1301c5`
- Current uncommitted files:
  - `app.js`
  - `devotion-egress-root-cause-audit.md`
- The existing `app.js` egress stopgap patch is still uncommitted.
- No commit, push, rebase, merge, or force push has been performed in this audit round.

## 3. Backend / Scheduled Work Possibility

### Vercel cron

`vercel.json` contains rewrites and headers only. No `crons` block was found.

### package scripts

`package.json` contains only:

- `start`
- `check`

No scheduled script or background worker was found.

### service worker / PWA background fetch

No `serviceWorker`, `navigator.serviceWorker`, service worker file, periodic sync, or background sync code was found. `manifest.webmanifest` exists, but a manifest alone does not run background fetches.

### setInterval / polling

No `setInterval` polling was found in app code. `setTimeout` is used for UI debounce/timers:

- Realtime cloud reload debounce
- toast hiding
- scripture fetch debounce
- local note draft save debounce
- reader UI/search/resize timers
- API timeout in `api/admin-usage.js`

These are browser/session-scoped, not server-side background jobs.

Conclusion: there is no evidence of a server-side or Vercel-scheduled background job that would keep generating egress when nobody has the site open.

## 4. Code Automatic Execution Points

The app creates a Supabase client on boot if the default/custom config is present. On bootstrap it calls `supabase.auth.getSession()`. If no session exists, the app stays unauthenticated and `loadAllData()` falls back to local storage instead of REST table reads.

Automatic or semi-automatic cloud paths after login:

- `bootstrap()` calls `loadAllData()` when a session exists.
- Supabase auth state change calls `loadAllData()`.
- Realtime subscription listens to `devotion_notes`, `book_projects`, `book_snapshots`.
- `visibilitychange` and `online` can request a cloud reload when a logged-in page is open.
- Opening admin dashboard calls `loadAdminUsage()`.
- Opening/reading cloud library books can download EPUB from Storage on cache miss.

These require an active logged-in browser session or an admin/API bearer token.

## 5. Unauthenticated Production Request Check

Test method:

1. Started Chrome headless with a fresh user data directory.
2. Opened `https://www.devotionbook.com.tw/`.
3. Reloaded production 3 times.
4. Captured DevTools Protocol network events matching `supabase.co` or `api.supabase.com`.
5. Confirmed there were no Supabase auth/localStorage keys.

Result:

- Page loaded successfully.
- `localKeys`: none.
- Total Supabase requests during unauthenticated production load/reloads: `0`.

Conclusion: production homepage, in a clean unauthenticated browser, does not appear to call Supabase REST, Storage, Auth, Realtime, or Management API.

## 6. Logged-In Request Check

No production login was performed in this audit round because credentials/secrets were not requested or displayed. Logged-in behavior was assessed by code inspection.

Expected logged-in cloud requests:

- Auth session check on boot.
- `loadAllData()` full data reload.
- `loadCloudLibrary()` metadata fetch.
- cover signed URL creation if cloud books have covers.
- Realtime websocket connection.
- EPUB Storage download only when opening/downloading a cloud library book and cache miss.
- `admin-usage` only when admin dashboard is opened.
- `system-backup` only when admin manually requests it.

## 7. Vercel API Endpoint Risk

### `/api/system-backup`

File: `api/system-backup.js`

Behavior:

- `GET` requires bearer token.
- Verifies Supabase user via Auth endpoint.
- Restricts to admin email.
- If authorized, uses Supabase Management API read-only query endpoint.
- Queries full tables:
  - `select * from public.devotion_notes`
  - `select * from public.book_projects`
  - `select * from public.library_books`
  - `select * from public.library_book_chapters`

Unauthenticated production test:

- `GET /api/system-backup`: `401`
- `POST /api/system-backup`: `405`

Risk:

- A bot without bearer token should only get small 401/405 responses.
- A valid admin bearer token or an open admin browser triggering this repeatedly could download a large backup.
- No rate limiting is present.

### `/api/admin-usage`

File: `api/admin-usage.js`

Behavior:

- `GET` requires bearer token.
- Verifies Supabase user via Auth endpoint.
- Restricts to admin email.
- Queries database size and storage size through Management API.
- It does not currently fetch egress details.

Unauthenticated production test:

- `GET /api/admin-usage`: `401`
- `POST /api/admin-usage`: `405`

Risk:

- Lower egress risk than system backup.
- No interval polling was found; frontend calls it when admin dashboard view is opened.
- No rate limiting is present.

## 8. Storage Risk

Bucket/path findings:

- Bucket name: `library-books`.
- `schema.sql` creates it as private: `public = false`.
- Storage policies allow authenticated users to access only `users/{auth.uid()}/books/...`.
- No `getPublicUrl()` usage was found.
- `createSignedUrl()` is used for avatar and cloud book covers.
- `.download()` is used for cloud EPUB download/read.
- EPUB storage paths are stored as object paths in DB, not public URLs.

Storage code locations:

- Avatar signed URL: `app.js`, `refreshProfileAvatar()`.
- Avatar upload/remove: `app.js`, profile avatar handlers.
- Cloud library cover signed URL: `app.js`, `refreshLibraryCoverUrls()`.
- Cloud EPUB upload: `app.js`, `uploadStorageFile()` / `createCloudLibraryBook()`.
- Cloud EPUB download: `app.js`, `downloadLibraryBookEpub()` and `loadEpubForReading()`.
- Cloud book delete removes Storage objects: `app.js`, `deleteLibraryBook()`.

Risk interpretation:

- Public crawling of EPUB files is unlikely if the bucket is actually private in Supabase.
- Signed cover URLs can be visible in the logged-in DOM and could be reused until expiry.
- Signed EPUB URLs are not generated; EPUB uses authenticated `download()`.
- If Supabase Dashboard shows Storage egress concentrated on `library-books`, inspect object paths for repeated `book.epub` or cover files.

## 9. Database Select Risk

Frontend select queries:

| Location | Table | Select | user_id filter | limit/range | Risk |
| --- | --- | --- | --- | --- | --- |
| `app.js` `loadAllData()` | `devotion_notes` | `select('*')` | yes | no | Can return all user notes on each full reload |
| `app.js` `loadAllData()` | `book_projects` | `select('*')` | yes | no | Can be large because `chapters` JSON is included |
| `app.js` `loadAllData()` | `book_snapshots` | metadata only | yes | no | Lower risk in current code |
| `app.js` restore helpers | `devotion_notes` | `id` | yes | no | Low response size |
| `app.js` restore helpers | `book_projects` | `id` | yes | no | Low response size |
| `app.js` restore helpers | `library_books` | `id` | yes | no | Low response size |
| `app.js` restore helpers | `library_book_chapters` | `id` | yes | no | Could be many rows but small columns |
| `app.js` `loadCloudLibrary()` | `library_books` | selected metadata fields | yes | no | Moderate if many books/covers |
| `app.js` `loadLibraryBookChapters()` | `library_book_chapters` | selected metadata fields | yes + book_id | no | Per-book chapter metadata only |

Vercel API select queries:

| Location | Table | Select | user_id filter | limit/range | Risk |
| --- | --- | --- | --- | --- | --- |
| `api/system-backup.js` | `devotion_notes` | `select *` | no | no | Full-table backup if admin authorized |
| `api/system-backup.js` | `book_projects` | `select *` | no | no | Full-table backup, includes chapters JSON |
| `api/system-backup.js` | `library_books` | `select *` | no | no | Full-table backup |
| `api/system-backup.js` | `library_book_chapters` | `select *` | no | no | Full-table backup |

RLS:

- `schema.sql` enables RLS for user tables.
- Policies are based on `auth.uid() = user_id`.
- Library tables also use user ownership policies.
- This should prevent anon users from reading rows through normal PostgREST, assuming production schema matches the file.

## 10. Realtime / Old Tab / PWA Risk

Realtime subscription exists for logged-in users on:

- `devotion_notes`
- `book_projects`
- `book_snapshots`

Realtime does not run when no browser is connected. However, an old logged-in browser tab, mobile PWA window, or sleeping/waking device could still:

- reconnect,
- call `loadAllData()`,
- respond to `visibilitychange` / `online`,
- keep a Realtime websocket alive,
- reload cloud data when changes occur.

This is plausible if a logged-in tab remained open even if the user did not intentionally use the site.

No service worker was found, so true background PWA fetch while the app is closed is unlikely.

## 11. Production / Preview / Local / Test Risk

The repo has default Supabase configuration in frontend source, so production, Vercel Preview, and local dev can all point at the same Supabase project unless localStorage is changed to local/custom mode.

Local smoke test:

- `smoke-test.cjs` seeds localStorage with local mode.
- It should not hit production Supabase.

Artifact test:

- `artifacts/production-login-check.cjs` targets `https://www.devotionbook.com.tw`.
- It can perform login-dependent production flows if the browser/session is logged in.
- Existing result file shows a run on `2026-04-29` timed out while waiting for login, so that recorded run did not finish heavy checks.
- If this script is rerun with a logged-in session and reaches note/book/library/admin checks, it could generate production Supabase traffic.

Other local repos:

- Searched `C:\src\devotional_app` and `C:\src\devotional_app_backup` for the Devotion Supabase project ref; no matches found.
- A broader `C:\src` search timed out because of large folders. I did not inspect `C:\src\sansce-website` due the explicit "do not touch Sanze" instruction.

## 12. Vercel Dashboard Checks Needed

Codex cannot access the Vercel dashboard here, and Vercel CLI is not installed locally.

Please check:

1. Vercel project → Deployments → current Production deployment → Functions tab/logs.
2. Search paths:
   - `/api/system-backup`
   - `/api/admin-usage`
   - `/api/support-receipt-request`
3. For each path, inspect:
   - timestamp
   - status code
   - duration
   - response size if visible
   - invocation count
   - source IP if visible
   - user agent if visible
4. Red flags:
   - many `200` responses from `/api/system-backup`
   - repeated `/api/admin-usage` calls every few seconds/minutes
   - bot-like user agents
   - calls from unfamiliar IP ranges
   - spikes matching Supabase egress timestamps

If Vercel only shows aggregate logs, capture screenshots of function invocation counts and any log rows around the Supabase egress spike.

## 13. Supabase Dashboard Checks Needed

Free plan may not expose all detailed logs. If a log view is unavailable, record that limitation instead of inferring.

Check these areas:

### Reports / Usage

Look for breakdown by product if available:

- Database egress / PostgREST
- Storage egress
- Auth
- Realtime
- Edge Functions

If Storage egress dominates, inspect Storage logs/object paths. If API/PostgREST dominates, inspect API logs and table paths.

### Logs → API / PostgREST

Filter fields:

- timestamp range covering spike
- method
- path
- status code
- IP
- user agent
- response size if available
- count grouped by path

Paths to watch:

- `/rest/v1/devotion_notes`
- `/rest/v1/book_projects`
- `/rest/v1/book_snapshots`
- `/rest/v1/library_books`
- `/rest/v1/library_book_chapters`

Red flags:

- high counts of `GET /rest/v1/book_projects?select=*`
- high response sizes for `book_projects`
- requests without expected authenticated user context
- repeated 401/403 from same IP/user agent at high volume

### Logs → Storage

Filter fields:

- bucket
- object path
- method
- status
- response size
- IP
- user agent
- count

Watch:

- bucket `library-books`
- paths like `users/{userId}/books/{bookId}/book.epub`
- cover image paths
- avatar paths

Red flags:

- repeated downloads of `book.epub`
- large response size concentrated on a few objects
- unfamiliar IP/user agent repeatedly fetching signed URLs

### Logs → Auth

Check:

- token refresh / user calls frequency
- sign-ins
- repeated failed auth
- unusual IP/user agent

Auth alone usually should not create 14GB egress unless requests are extremely high volume.

### Logs → Realtime

Check:

- websocket connection count
- messages
- disconnect/reconnect loops
- IP/user agent concentration

Realtime appears low in the user screenshots, but verify spike timestamps.

### Logs → Edge Functions

This repo does not define Supabase Edge Functions. If the dashboard has Edge Function logs from the project, check whether another project/function is attached to the same Supabase project.

## Supabase Dashboard 查證步驟

### 一、先查 Usage / Reports

目標：先判斷 Egress 主要來自 Storage、Database/API、Realtime、Auth、Edge Functions 哪一類，不要先假設是前端操作。

操作步驟：

1. 進入 Supabase Dashboard。
2. 到 Organization / Usage。
3. 選 current billing cycle。
4. 選這個 Devotion project；如果畫面只能看 all projects，也先記錄 all projects 數字。
5. 打開 Egress 明細。
6. 截圖 spike 時段，包含時間軸、用量、百分比與 project 名稱。
7. 如果畫面能依 service 拆分，記錄 Storage / Database / Realtime / Auth / Functions 各自占比。

判讀重點：

- Storage 占比高：優先查 `library-books` bucket 與 EPUB/cover/avatar object path。
- Database/API 占比高：優先查 PostgREST `/rest/v1/*` paths 與 response size。
- Auth 占比高：查 token refresh、`/auth/v1/user` 與異常 IP/user agent。
- Realtime 占比高：查 websocket connection、reconnect、old tab/multi-device。
- Functions 占比高：檢查是否有 Supabase Edge Functions；此 repo 目前沒有定義 Edge Functions。

### 二、查 Logs Explorer

操作步驟：

1. 進入 Supabase Dashboard。
2. 選 Project。
3. 到 Logs 或 Logs Explorer。
4. 選 API / PostgREST / Edge logs。
5. 選 Storage logs。
6. 選 Auth logs。
7. 選 Realtime logs。

Free Plan 注意事項：

- Free Plan 可能看不到完整 Logs Explorer 或只能看到有限時間範圍。
- 有些欄位如 response size、IP、user agent、cache hit/miss 可能看不到。
- 如果看不到，請記錄「Free Plan 可能看不到此 log/欄位」，不要用推測代替證據。

### 三、API / PostgREST 查證重點

請搜尋或篩選這些 path：

1. `/rest/v1/devotion_notes`
2. `/rest/v1/book_projects`
3. `/rest/v1/book_snapshots`
4. `/rest/v1/library_books`
5. `/rest/v1/library_book_chapters`

請記錄：

1. request count
2. status code
3. response size
4. timestamp
5. IP
6. user agent
7. referrer
8. 是否集中在某個時間
9. 是否來自同一個 IP / user agent
10. 是否像瀏覽器、Vercel function、bot 或其他工具

判讀重點：

- 大量 `GET /rest/v1/book_projects`，尤其 `select=*` 或 response size 大：偏向 full sync / `loadAllData()` / 舊登入 session。
- 大量 `GET /rest/v1/devotion_notes`：偏向札記全量同步或舊登入頁面反覆重新載入。
- 大量 `library_book_chapters`：偏向書櫃章節 metadata 被反覆讀取。
- 大量 401/403：可能是 bot 或無效 token；仍需確認 Supabase 是否把錯誤回應也算入 egress。
- user agent 是 Vercel / node / undici：可能來自 Vercel serverless API 或測試腳本。
- user agent 是 Chrome/Safari 且同 IP：可能是舊分頁、手機、PWA、Preview 或本機 dev。

### 四、Storage 查證重點

請查 bucket：

- `library-books`

特別看：

1. `book.epub`
2. `cover.*`
3. `avatar.webp`
4. `users/{user_id}/books/{book_id}/book.epub`
5. `users/{user_id}/books/{book_id}/cover.*`
6. `users/{user_id}/profile/avatar.webp`

請記錄：

1. object path
2. request count
3. method
4. status code
5. response size
6. cache hit / miss
7. timestamp
8. IP
9. user agent
10. 是否大量重複請求同一本 `book.epub`
11. 是否大量重複請求封面或 avatar

判讀重點：

- 大量同一本 `book.epub`：主因偏向雲端書籍被反覆下載或閱讀器 cache miss。
- 大量 `cover.*`：主因偏向封面 signed URL / 圖片重載。
- 大量 `avatar.webp`：主因偏向個人頭像 signed URL / cache bust。
- 403/401 很多但 response size 小：可能不是 14GB 主因，但仍可能代表外部掃描。
- 200 且 response size 大：高度可疑。

### 五、Auth / Realtime 查證重點

Auth：

1. token refresh 是否異常高。
2. `/auth/v1/user` 是否異常高。
3. 是否有同一 user / IP 重複刷新。
4. 是否有大量失敗登入、magic link、token refresh failure。
5. spike 時段是否與 Egress spike 同步。

Realtime：

1. websocket connection 是否異常。
2. 是否有多裝置或舊分頁連線。
3. peak connection 目前看起來不高，但仍需確認 spike 時間。
4. 是否有短時間 reconnect loop。
5. 是否同一 IP/user agent 持續連線。

判讀重點：

- Auth 通常 response 小，不太可能單獨造成 14GB，除非 request 數量極高。
- Realtime 如果 dashboard 已顯示很低，優先順序低於 Storage/API，但仍要用 spike 時段確認。

### 六、Vercel Logs 查證重點

Project：

- `devotion-book-webapp`

請查看：

1. Logs
2. Functions
3. `/api/system-backup`
4. `/api/admin-usage`

請記錄：

1. 是否有大量 200
2. 是否集中在某時段
3. 是否同一 IP
4. 是否有可疑 user-agent
5. `system-backup` 是否曾被成功呼叫
6. 每次 function duration
7. response size 或 log payload 大小，如果 Vercel 有提供

判讀重點：

- `/api/system-backup` 大量 200：高風險，因為它會透過 Supabase Management API full-table backup。
- `/api/admin-usage` 大量 200：通常 egress 風險較小，但可能代表管理頁或 bot 在頻繁打 endpoint。
- 大量 401/405：代表外部掃描 API，但通常不會造成大 Supabase egress，除非請求量非常巨大。
- 如果 Vercel 看不到 IP/user agent，請截 function invocation count 與時間分布。

### 七、根因判斷規則

如果 Storage logs 顯示大量 `book.epub`：

- 主因偏向雲端書籍被反覆下載。
- 優先保留 EPUB 下載提示 / in-flight 防重複 patch。
- 下一步查是哪個 object path、哪個 IP/user agent、是否舊分頁或外部連結重複下載。

如果 Storage logs 顯示大量 `cover.*` / `avatar.webp`：

- 主因偏向圖片 signed URL 或封面/頭像重載。
- 優先保留 signed URL TTL 延長、cache bust 收斂與 lazy loading patch。
- 下一步查是否同一批圖片被同 IP/user agent 高頻請求。

如果 API logs 顯示大量 `book_projects` / `devotion_notes`：

- 主因偏向 `loadAllData()` / full sync / 舊登入 session。
- 優先保留 `loadAllData()` 防併發與 Realtime 降頻 patch。
- 下一步查 response size、user agent、是否同一登入使用者或同一裝置。

如果 Vercel logs 顯示 `/api/system-backup` 大量 200：

- 主因偏向管理備份被觸發。
- 優先保留系統備份二次確認。
- 下一步考慮暫時關閉備份、加 server-side kill switch 或 rate limit。

如果未登入頁仍沒有 Supabase request：

- 首頁訪客不是主因。
- 不要把問題誤判成一般訪客流量。
- 繼續查登入 session、Storage object、Vercel functions、Preview/local/dev 或 direct Supabase endpoint。

## 14. Most Likely Root Cause Ranking

Current ranking without Supabase/Vercel detailed logs:

1. **External or stale client traffic to Supabase project**: old logged-in tab/PWA window, Vercel Preview, local dev, or someone/something with frontend anon config repeatedly hitting REST/Storage. This fits "no active site use" better than normal user actions.
2. **Storage egress from cloud EPUB/cover/avatar paths**: especially if Supabase Storage logs show repeated `book.epub` downloads or cover signed URL access. Bucket is intended private, so logs are needed to confirm.
3. **Full cloud reloads from logged-in old sessions**: `loadAllData()` can pull all notes/book projects, including chapters JSON, and Realtime/visibility/online can reload when a page remains open.
4. **Authorized system backup calls**: `/api/system-backup` can download full DB tables, but requires admin bearer token. Vercel function logs should confirm or rule this out quickly.
5. **Bot/crawler against public site only**: clean unauthenticated production test showed zero Supabase requests, so a normal crawler loading the homepage should not directly cause Supabase egress. Direct bots hitting Supabase URLs remain possible.

## 15. Is the Current Stopgap Patch Still Reasonable?

Yes, but it should be treated as mitigation, not proven root-cause fix.

The patch reduces:

- repeated `loadAllData()` concurrency,
- Realtime/visibility/online rapid reloads,
- accidental system backup downloads,
- repeated cloud EPUB downloads,
- cover/avatar signed URL churn.

It does not solve:

- external direct calls to Supabase,
- leaked/reused signed URLs already issued,
- Vercel Preview/local dev using production Supabase,
- unauthorized high-volume 401/403 traffic if Supabase counts it significantly,
- any backend traffic outside this repo.

## 16. Missing Evidence

Needed to identify root cause:

1. Supabase product breakdown: Database egress vs Storage egress.
2. Top paths by count and response bytes.
3. Storage bucket/object path breakdown.
4. IP/user-agent concentration.
5. Vercel function invocation logs for `/api/system-backup` and `/api/admin-usage`.
6. Whether Vercel Preview deployments are using the same production Supabase project.
7. Whether any logged-in browser/device tab remains open.

## 17. Recommended Next Steps

1. Check Supabase Usage/Reports for whether egress is Storage or Database/API.
2. Check Supabase logs around spike timestamps and group by path/object.
3. Check Vercel Function logs for backup/admin endpoint invocations.
4. Close all old Devotion tabs/devices and sign out/revoke sessions only if logs show old sessions are active. Do not rotate keys yet.
5. If Storage object downloads dominate, temporarily disable cloud EPUB download/read or require fresh confirmation and investigate object paths.
6. If PostgREST `book_projects` dominates, keep the current `loadAllData()` stopgap and then split heavy columns out of initial loads.
7. If Vercel `/api/system-backup` dominates, add server-side rate limiting/kill switch and keep two-step confirmation.
8. If unknown IPs directly hit Supabase, consider Supabase dashboard mitigations, RLS verification, and potentially key rotation only after planning env updates.
