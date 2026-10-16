/**
 * 韓文字的組合和拆解。
 * 一個韓文字（音節）＝ 初聲（子音）＋ 中聲（母音）＋ 終聲（收尾音，可以沒有），
 * Unicode 裡的位置是 0xAC00 + (初聲 × 21 + 中聲) × 28 + 終聲。
 */
export const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
export const JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
export const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

/** 初聲、中聲的羅馬拼音（韓國官方的國語羅馬字表記法；ㅇ 在字首不發音） */
const CHO_R = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
const JUNG_R = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];

/** 韓文的 40 個字母：母音 21 個、子音 19 個（照網站教的順序） */
export const VOWELS = ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ', 'ㅑ', 'ㅕ', 'ㅛ', 'ㅠ', 'ㅐ', 'ㅔ', 'ㅒ', 'ㅖ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ'];
export const CONSONANTS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅎ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ'];

export interface Syllable {
  cho: string;
  jung: string;
  jong: string;
}

const BASE = 0xac00;
const LAST = 0xd7a3;

/** 把子音和母音組成一個字，例如 ('ㄱ', 'ㅏ') → 가 */
export function compose(cho: string, jung: string, jong = ''): string {
  const l = CHO.indexOf(cho);
  const v = JUNG.indexOf(jung);
  const t = JONG.indexOf(jong);
  if (l < 0 || v < 0 || t < 0) throw new Error(`不能組成韓文字：${cho} ${jung} ${jong}`);
  return String.fromCharCode(BASE + (l * 21 + v) * 28 + t);
}

/** 把一個字拆成初聲、中聲、終聲；不是韓文字就回傳 null */
export function decompose(ch: string): Syllable | null {
  const c = ch.charCodeAt(0);
  if (ch.length !== 1 || c < BASE || c > LAST) return null;
  const n = c - BASE;
  return { cho: CHO[Math.floor(n / 588)]!, jung: JUNG[Math.floor((n % 588) / 28)]!, jong: JONG[n % 28]! };
}

/** 一段文字裡用到的所有字母（拆開每個字的初聲、中聲、終聲） */
export function jamoOf(text: string): string[] {
  const out: string[] = [];
  for (const ch of text) {
    const s = decompose(ch);
    if (s) out.push(s.cho, s.jung, ...(s.jong ? [s.jong] : []));
  }
  return out;
}

/** 沒有收尾音的字的羅馬拼音，例如 거 → geo；有收尾音或不是韓文字就回傳 null */
export function romanize(ch: string): string | null {
  const s = decompose(ch);
  if (!s || s.jong) return null;
  return CHO_R[CHO.indexOf(s.cho)]! + JUNG_R[JUNG.indexOf(s.jung)]!;
}
