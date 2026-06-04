# Supabase Auth 信箱驗證手動設定清單

本清單供管理員在 Supabase Dashboard 手動設定註冊信箱驗證信。前端已提供註冊成功提示、未驗證登入提示與重新寄送驗證信入口；Dashboard 仍需確認信件模板、導回網址與寄件者名稱。

## 1. Confirm Signup 信件模板

Dashboard 位置：

Authentication -> Emails -> Confirm signup

Subject 請設定為：

```text
【Devotion 靈修札記】請完成信箱驗證
```

信件內容請設定為：

```text
您好，

感謝您註冊 Devotion 靈修札記。

請點選下方連結完成信箱驗證，完成後就可以登入並開始使用靈修札記功能。

完成信箱驗證：
{{ .ConfirmationURL }}

如果上方連結無法點選，請複製以下連結並貼到瀏覽器開啟：

{{ .ConfirmationURL }}

如果您沒有註冊 Devotion 靈修札記，可以忽略這封信。

願你的文字成為祝福
Devotion 靈修札記
```

## 2. URL Configuration

Dashboard 位置：

Authentication -> URL Configuration

Site URL 必須是正式站網址：

```text
https://www.devotionbook.com.tw
```

Redirect URLs 至少包含：

```text
https://www.devotionbook.com.tw
https://www.devotionbook.com.tw/
```

localhost 或 Vercel preview URL 可以保留給開發與預覽環境；正式驗證信必須能導回正式站。

## 3. 寄件者名稱

請檢查 Authentication -> Emails 或 SMTP 設定中的寄件者名稱。

建議寄件者名稱：

```text
Devotion 靈修札記
```

若目前使用 Supabase 內建寄信服務而無法完整控制寄件者名稱，建議後續改用正式 SMTP，讓使用者更容易辨識信件來源，也能改善大量寄信時的送達率與限制問題。
