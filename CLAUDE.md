# 一步一步學習韓文

韓文學習網站，目前內容是 40 音（韓文字母）第 1～12 步，加上《세종학당 한국어》1 第 1～3 課（第 13～31 步），之後接第 4 課（Quasar CLI + Vue 3 + TypeScript + Pinia，PWA，Supabase 同步）。架構從日文網站 `xiouyu/learning-japanese` 複製過來。使用者是台灣的韓文初學者，一律用繁體中文、台灣用語回覆。教學方式見 `docs/teaching-guide.md`。

## 常用指令

- `npm run typecheck`、`npm test`、`npm run build`（輸出 `dist/pwa`）
- 改完程式先跑 typecheck 和 test 再 commit

## 慣例

- 教材內容只放在 `src/data/steps.json`；新增一步就在最後加一筆，加完跑 `npm test`（會檢查羅馬拼音、字母欄位）
- 韓文字的組合、拆解、羅馬拼音在 `src/lib/hangul.ts`
- 學習紀錄格式和合併規則在 `src/lib/progress.ts`；改格式時 `normalize()` 要能讀舊資料
- 日文網站也在 `xiouyu.github.io`，localStorage 和 Cache Storage 是共用的：本機存的 key 開頭用 `hangul:`，PWA 快取名稱開頭用 `korean-`
- Supabase 跟日文網站共用同一個專案，進度存在 `korean_progress` 資料表（日文是 `progress`）
- 自訂樣式在 `src/css/app.css`，class 名稱不要用 Quasar 已經用的工具類別（例如 `row`、`wrap`、`col`）
- 部署：推到 `main` 會自動發布到 GitHub Pages
- 課本原始教材（PDF、mp3）在私人專案 `xiouyu/learning-korean-materials-new`（同使用者電腦上的備份和 Google Drive「Tia老師韓文資料」），不要把 PDF 或整頁圖片加進這個公開專案。《세종학당 한국어》1 的版權頁**沒有공공누리標示**，明寫禁止未經許可引用或摘錄，所以音檔不放上網站（`audio` 留空，用瀏覽器語音合成），講解一律用自己的話寫，每一步要填 `source`
- 製作課本步驟的做法見 `docs/handoff-lessons.md`
