# Supabase Google 登入手動設定與驗收清單

本清單供管理員啟用 Google 登入前後使用。前端只會呼叫 Supabase Auth 的 Google 登入流程，不會保存 Google Client ID 或 Client Secret，也不會把任何 OAuth secret 寫進 repo。

## 1. Supabase Dashboard 設定

Dashboard 位置：

Authentication -> Sign In / Providers -> Google

請設定：

- Enable Google provider
- Client ID
- Client Secret

Client ID 與 Client Secret 需由 Google Cloud Console 建立的 OAuth Client 取得。

## 2. Google Cloud Console 設定

請在 Google Cloud Console 建立 OAuth Client：

- Application type：Web application
- Authorized JavaScript origins：加入正式站網域
  - `https://www.devotionbook.com.tw`
- Authorized redirect URI：必須使用 Supabase Dashboard Google provider 頁面實際顯示的 Callback URL

不要自己猜 Callback URL。請以 Supabase Dashboard Google provider 畫面顯示值為準。

通常會類似：

```text
https://<project-ref>.supabase.co/auth/v1/callback
```

但正式設定務必以 Dashboard 顯示為準。

## 3. Supabase URL Configuration

Dashboard 位置：

Authentication -> URL Configuration

Site URL 建議：

```text
https://www.devotionbook.com.tw
```

Redirect URLs 至少包含：

```text
https://www.devotionbook.com.tw
https://www.devotionbook.com.tw/
```

## 4. 前端登入完成導回

前端 Google 登入使用正式站導回網址：

```text
https://www.devotionbook.com.tw
```

Google 登入完成後應回到正式站，並進入登入後畫面。

## 5. 同 Email 帳號驗收矩陣

Google provider 啟用後，正式上線前必須驗收以下情境。

### A. 全新 Google 帳號第一次登入

確認：

- 可以登入。
- 會建立使用者。
- 可以建立札記。
- 登出後再次使用 Google 登入，仍看得到原本札記。

### B. 已用 Email / Password 註冊且完成信箱驗證的 Gmail 帳號，再使用 Google 登入

確認：

- 是否進入同一個使用者身份。
- 原本札記是否仍可看到。
- 是否產生新的 user id。
- 是否造成資料看起來不見。

Supabase Auth 文件說明，同 Email 的 OAuth identity 通常會自動連結到同一個 user；但正式上線前仍需用本專案資料實測確認。

### C. 已用 Email / Password 註冊但尚未完成信箱驗證的 Gmail 帳號，再使用 Google 登入

確認：

- Supabase 如何處理未驗證 Email 帳號。
- 是否建立新身份。
- 是否仍卡在驗證。
- 是否出現使用者看不懂的錯誤。
- 是否造成資料分裂或使用者以為資料不見。

若 B 或 C 產生新的 user id 或資料分裂，請不要直接上線 Google 登入。需先制定資料合併、身份連結或使用者提示方案。

## 6. Facebook 登入後續評估

本階段不啟用 Facebook 登入。

Supabase 可支援 Facebook 登入，但正式啟用前需要：

- Meta Developer App
- Client ID
- Client Secret
- OAuth redirect URI
- 隱私政策與資料使用說明
- App 模式、測試使用者與可能的審核流程

建議第二階段再做 Facebook 登入，先完成 Google 登入的同 Email 身份與資料連續性驗收。
