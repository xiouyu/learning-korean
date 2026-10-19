/* ===== 教材資料：之後每學一步，在 steps.json 加一筆 ===== */
import raw from './steps.json';
import rawCando from './cando.json';
import rawCulture from './culture.json';
import type { CanDo, Culture, LetterItem, RoadmapItem, Step } from './types';
import { CONSONANTS, VOWELS, jamoOf } from '@/lib/hangul';
import { gist, type QuizMode } from '@/lib/quiz';

export const STEPS = raw as Step[];

export const ROADMAP: RoadmapItem[] = [
  ...STEPS.map((s) => ({ n: s.id, t: s.title, row: s.row, note: s.note, part: s.part })),
  // 還沒加進網站的下一步：學習路線最後顯示「下一站」
  { n: STEPS.length + 1, t: '《세종학당 한국어》1 第 6 課 친구한테 편지를 써요', row: '第6課', note: '準備中', part: '下一站', ext: true },
];

export const ALL_LETTERS: LetterItem[] = STEPS.flatMap((s) => s.letters.map((k) => ({ ...k, step: s.id })));

/** 每個字母在第幾步第一次出現（從字卡的字拆出來，例如 아 會算到 ㅇ 和 ㅏ） */
export const LEARNED_AT = new Map<string, number>();
for (const k of ALL_LETTERS) for (const j of jamoOf(k.k)) if (!LEARNED_AT.has(j)) LEARNED_AT.set(j, k.step);

/** 頂端進度格：母音 21 個、子音 19 個 */
export const LETTER_SETS = [
  { label: 'ㅏ', name: '母音', list: VOWELS },
  { label: 'ㄱ', name: '子音', list: CONSONANTS },
] as const;

/** 反切表：直的是子音，橫的是母音，交叉的格子是兩個字母拼成的字 */
const BASIC_C = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const BASIC_V = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'];
export const TABLES = [
  { id: 'basic', label: '基本', desc: '基本子音 14 個 × 基本母音 10 個', rows: BASIC_C, cols: BASIC_V },
  { id: 'tense', label: '緊音', desc: '緊音 5 個 × 基本母音 10 個', rows: ['ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ'], cols: BASIC_V },
  {
    id: 'compound',
    label: '複合母音',
    desc: '基本子音 14 個 × 複合母音 11 個',
    rows: BASIC_C,
    cols: ['ㅐ', 'ㅒ', 'ㅔ', 'ㅖ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ'],
  },
] as const;

/** 40 音的最後一步：通過這一步後要先考 40 音大會考，才會解鎖課本第 1 課 */
export const HANGUL_LAST = Math.max(...STEPS.filter((s) => s.kind !== 'phrase').map((s) => s.id));
/** 這一步屬於課本第幾課（看 part 的「第N課」）；40 音和複習的步驟是 0 */
const LESSON_RE = /^第(\d+)課/;
export const lessonOf = (s: Step) => Number(LESSON_RE.exec(s.part)?.[1] ?? 0);
/** 1～5 課綜合複習的最後一步 */
const REVIEW5_LAST = Math.max(0, ...STEPS.filter((s) => s.part === '複習 1～5課').map((s) => s.id));

/** 大會考：接在某一步後面，通過才會解鎖下一步 */
export interface Exam {
  id: string;
  /** 接在第幾步後面 */
  after: number;
  title: string;
  /** 考試範圍的說明 */
  scope: string;
  /** 「〜學完了」 */
  done: string;
  /** 通過後的好處，例如「就能進入課本第 1 課」 */
  reward: string;
  passMsg: string;
  /** 學習路線上的註解 */
  road: string;
  n: number;
  pass: number;
  /** 依單元（或每一課）分組的出題範圍 */
  groups: { part: string; letters: LetterItem[] }[];
  /** 每一題的題型 */
  mode: (a: LetterItem) => QuizMode;
}

const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)]!;

/** 第 from～to 步的題目，依 part 分組 */
function groupsOf(from: number, to: number, ok: (k: LetterItem) => boolean = () => true) {
  const parts = [...new Set(STEPS.filter((s) => s.id >= from && s.id <= to).map((s) => s.part))];
  return parts.map((part) => ({
    part,
    letters: ALL_LETTERS.filter((k) => k.step >= from && k.step <= to && STEPS[k.step - 1]!.part === part && ok(k)),
  }));
}

/** 中文說明是一個意思的句子才出意思題（「意思跟上一句一樣」這種說明不算） */
const hasMeaning = (k: LetterItem) => !/^意思/.test(gist(k.z));

export const EXAMS: Exam[] = [
  {
    id: 'hangul',
    after: HANGUL_LAST,
    title: '40 音大會考',
    scope: '母音、子音、複合母音、收尾音、發音規則，每個單元各考 6 題',
    done: '40 音全部學完了',
    reward: '就能進入課本第 1 課',
    passMsg: '恭喜通過 40 音大會考！韓文字已經都會唸了，可以開始學課本第 1 課。',
    road: '通過才進入課本',
    n: 30,
    pass: 27,
    groups: groupsOf(1, HANGUL_LAST),
    mode: () => pick(['k2r', 'a2k', 'r2k'] as const),
  },
  // 1～5 課的綜合複習做完才加這一關（複習的步驟還沒加進來時不會出現）
  ...(REVIEW5_LAST
    ? [
        {
          id: 'l1-5',
          after: REVIEW5_LAST,
          title: '1～5 課大會考',
          scope: '課本第 1～5 課每一課各考 5 題：看句子選意思、聽句子選意思、聽句子選出正確的句子',
          done: '第 1～5 課學完了',
          reward: '就能進入第 6 課',
          passMsg: '恭喜通過 1～5 課大會考！自我介紹、家人、喜好、學校、天氣都能用韓文說了，繼續往第 6 課前進。',
          road: '通過才進入第 6 課',
          n: 25,
          pass: 22,
          groups: groupsOf(HANGUL_LAST + 1, REVIEW5_LAST, hasMeaning).filter((g) => LESSON_RE.test(g.part)),
          mode: () => pick(['k2z', 'a2z', 'a2k'] as const),
        } satisfies Exam,
      ]
    : []),
];

/** 每一課的文化小知識 */
export const CULTURE = rawCulture as Culture[];

/** 每一課的學習目標（Can-do） */
export const CANDO = rawCando as CanDo[];

export function stepLabel(n: number): string {
  const s = STEPS.find((x) => x.id === n);
  if (s) return s.row;
  const r = ROADMAP.find((x) => x.n === n);
  return r ? r.row || r.t : '';
}
