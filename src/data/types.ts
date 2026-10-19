/** 課本音檔的一段：src 是 public/ 底下的路徑，start／end 是秒數（不填就播整個檔案） */
export interface AudioRef {
  src: string;
  start?: number;
  end?: number;
}

/** 一張字卡：一個音節（例如 아、가）、一個範例詞，或課本的一句話 */
export interface Letter {
  /** 字卡上的韓文 */
  k: string;
  /** 羅馬拼音（韓國官方的「國語羅馬字表記法」） */
  r: string;
  /** 發音說明（對照注音） */
  z: string;
  /** 這張字卡要學的字母，例如 ㅏ、ㄱ */
  o?: string;
  /** `o` 前面的標籤文字，沒填就顯示「字母」 */
  ol?: string;
  /** 字形怎麼來的、怎麼記，例如「ㅣ 的右邊加一點」 */
  d?: string;
  /** 例外或容易搞混的字，字卡右上角顯示「注意」 */
  ex?: boolean;
  /** 實際發音（例如 애 和 에 都填 e），測驗時同音的字不會出現在同一題 */
  snd?: string;
  /** 課本的真人錄音；沒有就用瀏覽器的語音合成 */
  audio?: AudioRef;
}

export interface Word {
  w: string;
  r: string;
  m: string;
  /** 漢字詞的漢字，例如 이유 填「理由」 */
  h?: string;
  audio?: AudioRef;
}

/** 課本的一段會話 */
export interface Dialog {
  /** 標題，例如「① 1-02」 */
  label: string;
  audio?: AudioRef;
  lines: { who?: string; t: string; r?: string; m?: string }[];
}

/** 選選看（填空選擇題），用在複習步驟 */
export interface Cloze {
  /** 題目，空格寫成 ___ */
  q: string;
  /** 題目的中文提示（情境、要選什麼） */
  m?: string;
  opts: string[];
  /** 正確答案在 opts 的位置（從 0 開始） */
  a: number;
  /** 解說：為什麼是這個答案 */
  why: string;
}

export interface Step {
  id: number;
  row: string;
  title: string;
  part: string;
  /** letter：字母的步驟（字卡和描字練習）；phrase：課本的句子（句子卡片和跟讀練習） */
  kind: 'letter' | 'phrase';
  rule: string;
  letters: Letter[];
  notes: string[];
  words: Word[];
  /** 學習路線上的小註解 */
  note?: string;
  /** 課本的會話 */
  dialogs?: Dialog[];
  /** 選選看（複習用的填空選擇題） */
  cloze?: Cloze[];
  /** 出處，例如「《세종학당 한국어》1 第1課 p.20」 */
  source?: string;
}

/** 每一課的文化小知識（本站自己寫的，不是課本內容） */
export interface Culture {
  id: number;
  lesson: number;
  /** 韓文標題 */
  ko: string;
  zh: string;
  body: string[];
  /** [韓文, 羅馬拼音, 中文] */
  words: [string, string, string][];
}

/** 每一課的學習目標（Can-do，能做到的事），自我檢核用；照課本的학습목표用自己的話寫 */
export interface CanDo {
  n: number;
  lesson: number;
  /** 簡短的標題 */
  title: string;
  zh: string;
  /** 做得到的話會說的一句話（課文的句子） */
  ex: string;
  /** 要回去複習哪一步 */
  step: number;
}

export interface RoadmapItem {
  n: number;
  t: string;
  row: string;
  part: string;
  note?: string | undefined;
  /** 還沒加進網站的步驟 */
  ext?: boolean;
}

export type LetterItem = Letter & { step: number };
