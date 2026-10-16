# 設定 Supabase（跨裝置同步進度）

韓文網站跟日文網站**共用同一個 Supabase 專案**：同一組 Email 帳號，進度分開存（日文在 `progress`，韓文在 `korean_progress`）。日文網站已經設定好的部分（建立專案、Gmail 寄信、Email 登入）不用再做，只要做下面幾步，大約 5 分鐘。

網站沒設定 Supabase 也能正常使用，只是不會出現「登入同步」按鈕。

## 1. 建立韓文的資料表

1. 打開日文網站用的那個 Supabase 專案，左側選 **SQL Editor** › **New query**。
2. 把 [`supabase/migrations/20261016000000_korean_progress.sql`](../supabase/migrations/20261016000000_korean_progress.sql) 的內容整段貼上，按 **Run**。

這會建立 `korean_progress` 資料表（每個帳號一列），並開啟 Row Level Security：每個人只能讀寫自己的紀錄。日文的 `progress` 資料表不受影響。

## 2. 允許登入連結回到韓文網站

左側選 **Authentication** › **URL Configuration**，在 **Redirect URLs** 按 **Add URL**，加入：

- `https://xiouyu.github.io/learning-korean/`

**Site URL** 維持日文網站的網址就好。韓文網站寄登入信時會指定回到自己的網址，只要那個網址在 Redirect URLs 清單裡就行。

## 3. 把登入信改成通用的名稱（建議）

兩個網站寄的是同一封登入信，信件名稱改成不分語言比較不會搞混：

1. **Authentication** › **Emails** › **SMTP Settings**：**Sender name** 改成 `一步一步學習`。
2. **Authentication** › **Emails** › **Templates**：**Magic Link** 和 **Confirm signup** 兩個範本都改成：

   主旨：`一步一步學習 登入驗證碼`

   ```html
   <h2>一步一步學習 登入</h2>
   <p>驗證碼：<strong style="font-size:24px;letter-spacing:4px">{{ .Token }}</strong></p>
   <p>在網站的登入視窗輸入驗證碼，或點這個連結登入：<a href="{{ .ConfirmationURL }}">登入</a></p>
   <p>1 小時內有效。如果不是你本人操作，可以忽略這封信。</p>
   ```

## 4. 讓 GitHub Pages 上的網站使用

連線資訊跟日文網站一樣（**Project Settings** › **API**：Project URL 和 `sb_publishable_` 開頭的 publishable key）。

1. 到 GitHub 的 `learning-korean` 專案 **Settings › Secrets and variables › Actions**，切到 **Variables** 分頁。
2. 新增兩個 Repository variable（值跟日文專案的一樣）：
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_ANON_KEY` = publishable key
3. 到 **Actions** › **Deploy to GitHub Pages** › **Run workflow** 重新部署。

**不要**用 `service_role` 或 `sb_secret_` 開頭的 secret key。

## 5. 在自己電腦開發時使用

把 `.env.example` 複製成 `.env`，填入同樣的兩個值後執行 `npm run dev`。`.env` 不會被 commit。本機開發要登入的話，Redirect URLs 也要有 `http://localhost:9000/`（日文網站設定時應該已經加過）。

## 同步規則

- 進度（通過幾步）和字卡熟練度只會增加：兩台裝置合併時取比較大的值，不會因為同步而倒退。
- 練習範圍、測驗模式這些偏好，以最後修改的那台裝置為準。
- 沒網路時照常存在裝置上，連上網路後自動合併上傳。
- 兩個網站都在 `xiouyu.github.io`，登入狀態是共用的：在同一個瀏覽器登入日文網站，韓文網站也會是登入狀態；登出也一樣。
- 日文網站的備份腳本（`backup/`）目前只備份日文的 `progress`，還沒有備份 `korean_progress`。
