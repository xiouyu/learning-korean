import { describe, expect, it } from 'vitest';
import { ALL_LETTERS, LEARNED_AT, LETTER_SETS, STEPS } from '@/data';
import { makeQs, snd } from '@/lib/quiz';
import { CONSONANTS, VOWELS, compose, decompose, jamoOf, romanize } from '@/lib/hangul';

describe('教材資料', () => {
  it('步驟 id 從 1 開始連續', () => {
    STEPS.forEach((s, i) => expect(s.id).toBe(i + 1));
  });

  it('每一步都有字卡和說明', () => {
    for (const s of STEPS) {
      expect(s.letters.length, `第 ${s.id} 步`).toBeGreaterThan(0);
      expect(s.rule, `第 ${s.id} 步`).not.toBe('');
      for (const k of s.letters) expect(k.k && k.r && k.z, `第 ${s.id} 步 ${k.k}`).toBeTruthy();
    }
  });

  it('字母步驟的羅馬拼音跟官方拼法一致', () => {
    for (const s of STEPS.filter((x) => x.kind === 'letter')) {
      for (const k of s.letters) {
        const r = [...k.k].length === 1 ? romanize(k.k) : null;
        if (r !== null) expect(k.r, `第 ${s.id} 步 ${k.k}`).toBe(r);
      }
    }
  });

  it('字卡標的字母真的出現在字裡', () => {
    for (const k of ALL_LETTERS) if (k.o) expect(jamoOf(k.k), k.k).toContain(k.o);
  });

  it('40 音：母音 21 個、子音 19 個，不重複', () => {
    expect(new Set(VOWELS).size).toBe(21);
    expect(new Set(CONSONANTS).size).toBe(19);
    expect(LETTER_SETS.map((x) => x.list.length)).toEqual([21, 19]);
  });

  it('第 1 步就學到 ㅇ 和 6 個基本母音', () => {
    for (const j of ['ㅇ', 'ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ']) expect(LEARNED_AT.get(j), j).toBe(1);
  });
});

describe('韓文字的組合和拆解', () => {
  it('子音＋母音（＋收尾音）組成一個字', () => {
    expect(compose('ㄱ', 'ㅏ')).toBe('가');
    expect(compose('ㅇ', 'ㅏ', 'ㄴ')).toBe('안');
    expect(compose('ㅎ', 'ㅏ', 'ㄴ')).toBe('한');
  });

  it('拆開一個字', () => {
    expect(decompose('한')).toEqual({ cho: 'ㅎ', jung: 'ㅏ', jong: 'ㄴ' });
    expect(decompose('a')).toBeNull();
    expect(jamoOf('우유')).toEqual(['ㅇ', 'ㅜ', 'ㅇ', 'ㅠ']);
  });

  it('羅馬拼音', () => {
    expect(romanize('거')).toBe('geo');
    expect(romanize('으')).toBe('eu');
    expect(romanize('쭈')).toBe('jju');
    expect(romanize('한')).toBeNull();
  });
});

describe('出題', () => {
  it('每一步的解鎖測驗都能出 10 題，選項不重複也不同音', () => {
    for (const s of STEPS) {
      const P = ALL_LETTERS.filter((k) => k.step === s.id);
      const D = ALL_LETTERS.filter((k) => k.step <= s.id && k.step >= s.id - 1);
      for (let round = 0; round < 20; round++) {
        const qs = makeQs(P, () => 'k2r', D);
        expect(qs).toHaveLength(10);
        for (const q of qs) {
          expect(q.opts).toContain(q.a);
          expect(new Set(q.opts.map(snd)).size).toBe(q.opts.length);
          expect(q.opts.length).toBeGreaterThanOrEqual(Math.min(4, new Set(D.map(snd)).size));
        }
      }
    }
  });

  it('連續兩題不會是同一個字', () => {
    const P = ALL_LETTERS.filter((k) => k.step === 1);
    for (let round = 0; round < 50; round++) {
      const qs = makeQs(P, () => 'r2k');
      for (let i = 1; i < qs.length; i++) expect(qs[i]!.a.k).not.toBe(qs[i - 1]!.a.k);
    }
  });
});

describe('課本音檔', () => {
  it('資料裡用到的音檔都存在，剪輯的時間合理', async () => {
    const { existsSync } = await import('node:fs');
    const refs = STEPS.flatMap((s) => [
      ...s.letters.map((k) => k.audio),
      ...s.words.map((w) => w.audio),
      ...(s.dialogs ?? []).map((d) => d.audio),
    ]).filter((a) => a !== undefined);
    for (const a of refs) {
      expect(existsSync(`public/${a.src}`), a.src).toBe(true);
      if (a.end !== undefined) expect(a.end, a.src).toBeGreaterThan(a.start ?? 0);
    }
  });
});
