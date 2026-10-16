# 一步一步學習韓文

跟著《세종학당 한국어》1 一步一步學韓文的互動練習網站。先學 40 音（韓文字母），再接課本內容；通過每一步的解鎖測驗才會開放下一步。目前收錄第 1～12 步：母音、子音、複合母音、收尾音和發音規則，40 音全部完成。

網站架構和[日文網站](https://github.com/xiouyu/learning-japanese)一樣：

- **可以離線使用（PWA）**：第一次開啟後就存在裝置上，可以加到手機主畫面，沒網路也能練習。
- **跨裝置同步進度**：用 Email 登入信（點連結，或輸入驗證碼）登入後，手機和電腦接著同一個進度學。跟日文網站共用同一個帳號（使用 Supabase，沒設定也能正常使用）。

## 功能

| 分頁 | 功能 |
|---|---|
| 學習 | 依步驟看字卡（田字格、羅馬拼音、注音對照、字母），點一下播放發音；描字板可以照淡色範本寫，也能隱藏範本自己寫；下方有重點、單字、解鎖測驗和學習路線。 |
| 字卡 | 選練習範圍後翻面記憶，「不熟」的字會在 3 張後再出現。鍵盤：空白鍵翻面、1 不熟、2 記住了。 |
| 測驗 | 每次 10 題，三種模式：看字選拼音、聽音選字、看拼音選字。解鎖測驗三種題型混合，10 題答對 8 題通過。 |
| 單字 | 全部已解鎖的單字，可個別或全部顯示答案、打亂順序、播放發音。漢字詞會顯示漢字。 |
| 反切表 | 子音和母音拼成的字，可以切換基本、緊音、複合母音三張表。學過的字母拼成的字是實線框，字卡「記住了」3 次以上會變藍框。 |

## 技術

- [Quasar](https://quasar.dev/)（Quasar CLI + Vite）、Vue 3、TypeScript、Pinia
- PWA：Quasar PWA 模式（Workbox），Google Fonts 也會快取
- 同步：[Supabase](https://supabase.com/)（Email 登入信 + Postgres，Row Level Security 只能讀寫自己的資料）
- 測試：Vitest

## 開發

需要 Node.js 22.12 以上。

```bash
npm install        # 也會一起安裝 src-pwa 的套件
npm run dev        # 開發伺服器（PWA 模式）
npm run typecheck  # 型別檢查
npm test           # 單元測試
npm run build      # 打包到 dist/pwa
```

要在本機測試登入同步，把 `.env.example` 複製成 `.env` 填入 Supabase 設定。設定方式見 [docs/supabase-setup.md](docs/supabase-setup.md)。

## 專案結構

```
src/
  data/
    steps.json          教材資料：每一步的字卡、說明、重點、單字
    types.ts            教材資料的型別
    index.ts            學習路線、反切表、40 音進度
  lib/
    hangul.ts           韓文字的組合、拆解、羅馬拼音
    quiz.ts             出題工具
    progress.ts         學習紀錄的格式、存取和合併規則
    supabase.ts         Supabase 連線（沒設定時為 null）
  stores/
    progress.ts         學習進度（Pinia，存在 localStorage）
    sync.ts             登入和跨裝置同步
  composables/
    useSpeech.ts        韓文發音（Web Speech API）
    useAudio.ts         課本音檔（之後加上錄音時用）
  components/           描字板、單字卡、練習範圍、進度列、登入對話框
  pages/                學習、字卡、測驗、單字、反切表
  layouts/MainLayout.vue
  css/app.css           樣式（淺色／深色主題）
src-pwa/                PWA 設定（manifest、service worker 註冊）
supabase/migrations/    Supabase 資料表和權限設定
test/                   單元測試
docs/                   教學指南、Supabase 設定說明
```

## 加新的一步

在 `src/data/steps.json` 最後加一筆，其他畫面（學習路線、字卡、測驗、單字、進度、反切表）都會自動更新。欄位定義在 `src/data/types.ts`：

```json
{
  "id": 3,
  "row": "子音（一）",
  "title": "가 나 다 라",
  "part": "子音",
  "kind": "letter",
  "rule": "一句話說明這一步的規則。",
  "letters": [
    { "k": "가", "r": "ga", "z": "像「ㄍㄚ」", "o": "ㄱ", "ol": "子音", "d": "舌根擋住喉嚨的樣子" }
  ],
  "notes": ["重點說明…"],
  "words": [{ "w": "가구", "r": "gagu", "m": "家具", "h": "家具" }],
  "note": "學習路線上的小註解（可省略）"
}
```

| 欄位 | 說明 |
|---|---|
| `k` / `r` / `z` | 字、羅馬拼音（官方的國語羅馬字表記法）、發音說明（對照注音） |
| `o` / `ol` / `d` | 這張字卡要學的字母、它的標籤（沒填就顯示「字母」）、字形由來 |
| `ex` | `true` 會在字卡右上角顯示「注意」 |
| `snd` | 實際發音相同的字（例如 애／에）填一樣的值，測驗時不會放在同一題 |
| `h` | 單字的漢字（漢字詞才填） |
| `kind` | `letter` 是字母步驟；`phrase` 是課本句子（句子卡片和跟讀練習） |

加完跑一次 `npm test`，會檢查每一步的資料是否完整、羅馬拼音對不對、能不能出解鎖測驗。學習路線最後的「下一站」在 `src/data/index.ts` 的 `ROADMAP`。

## 部署到 GitHub Pages

`.github/workflows/deploy.yml` 會在推到 `main` 時跑型別檢查、測試、打包並發布到 `https://xiouyu.github.io/learning-korean/`。

第一次使用要到 GitHub 專案的 **Settings › Pages**，把 **Source** 設成 **GitHub Actions**。要啟用登入同步，照 [docs/supabase-setup.md](docs/supabase-setup.md) 設定。

## 字型

韓文用 Google Fonts 的 Gowun Dodum：筆畫粗細一致，ㅇ 是單純的圓，初學者比較好認。

## 注意

- 沒登入時，學習紀錄只存在這個瀏覽器；換電腦或換瀏覽器，紀錄不會跟著走，登入後就會同步。
- 發音目前都是瀏覽器內建的韓文語音合成。頁首的「朗讀語音」按鈕可以選要用哪個語音（只存在這台裝置）；iPhone 預設跟著「設定 › 輔助使用 › 朗讀內容 › 聲音 › 韓文」裡選的語音。
- 課本是世宗學堂財團的《세종학당 한국어》1，世宗學堂教材多為공공누리第 4 類授權（標示出處、非商業使用、不得改作）。原始 PDF 不放在這個公開專案。製作課本步驟的做法見 [docs/handoff-lessons.md](docs/handoff-lessons.md)。
