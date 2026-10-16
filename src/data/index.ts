/* ===== 教材資料：之後每學一步，在 steps.json 加一筆 ===== */
import raw from './steps.json';
import type { LetterItem, RoadmapItem, Step } from './types';
import { CONSONANTS, VOWELS, jamoOf } from '@/lib/hangul';

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

export function stepLabel(n: number): string {
  const s = STEPS.find((x) => x.id === n);
  if (s) return s.row;
  const r = ROADMAP.find((x) => x.n === n);
  return r ? r.row || r.t : '';
}
