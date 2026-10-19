import { describe, expect, it } from 'vitest';
import { ALL_LETTERS, CANDO, CULTURE, EXAMS, HANGUL_LAST, STEPS, lessonOf } from '@/data';
import { checkTyped, gist, makeExam, makeQs, pickWeighted } from '@/lib/quiz';

describe('打字作答', () => {
  const a = { k: '감사합니다.', r: 'gamsahamnida.' };

  it('拼音不分大小寫，空白、連字號、標點不用打', () => {
    expect(checkTyped(a, 'gamsahamnida')).toBe(true);
    expect(checkTyped(a, 'Gamsa-hamnida ')).toBe(true);
    expect(checkTyped(a, 'gamsahabnida')).toBe(false);
  });

  it('也可以直接打韓文，空白和標點不影響', () => {
    expect(checkTyped(a, '감사합니다')).toBe(true);
    expect(checkTyped(a, '감사 합니다!')).toBe(true);
    // 拆開的字母（NFD）也算
    expect(checkTyped(a, '감사합니다'.normalize('NFD'))).toBe(true);
    expect(checkTyped(a, '감사해요')).toBe(false);
    expect(checkTyped(a, '  ')).toBe(false);
  });
});

describe('出題方式', () => {
  it('依權重抽題：權重高的比較常出，同一個字不連續', () => {
    const P = ALL_LETTERS.filter((k) => k.step === 1);
    const heavy = P[0]!;
    let hits = 0;
    for (let round = 0; round < 20; round++) {
      const qs = pickWeighted(P, 20, (x) => (x === heavy ? 41 : 1));
      hits += qs.filter((x) => x === heavy).length;
      for (let i = 1; i < qs.length; i++) expect(qs[i]).not.toBe(qs[i - 1]);
    }
    expect(hits / 20).toBeGreaterThan(5);
  });

  it('意思題的選項沒有重複的意思', () => {
    const P = ALL_LETTERS.filter((k) => k.step >= 13 && k.step <= 43);
    for (let round = 0; round < 20; round++) {
      for (const q of makeQs(P, () => 'k2z', P, 20)) {
        expect(new Set(q.opts.map((o) => gist(o.z))).size).toBe(q.opts.length);
        expect(q.opts).toHaveLength(4);
      }
    }
  });
});

describe('大會考', () => {
  it('40 音大會考接在 40 音最後一步後面，每個單元都有題目', () => {
    const e = EXAMS.find((x) => x.id === 'hangul')!;
    expect(e.after).toBe(HANGUL_LAST);
    expect(STEPS[HANGUL_LAST]!.kind).toBe('phrase');
    expect(e.groups).toHaveLength(5);
  });

  it('每個大會考都能出題，題數夠多才能及格', () => {
    for (const e of EXAMS) {
      for (const g of e.groups) expect(g.letters.length, `${e.id} ${g.part}`).toBeGreaterThan(0);
      for (let round = 0; round < 10; round++) {
        const qs = makeExam(e.groups.map((g) => g.letters), e.mode, e.n);
        expect(qs).toHaveLength(e.n);
        for (const q of qs) expect(q.opts.length, `${e.id} ${q.a.k}`).toBeGreaterThanOrEqual(4);
      }
      expect(e.pass).toBeLessThanOrEqual(e.n);
    }
  });

  it('1～5 課大會考只考第 1～5 課，每一課一組', () => {
    const e = EXAMS.find((x) => x.id === 'l1-5');
    if (!e) return;
    expect(e.groups.map((g) => lessonOf(STEPS[g.letters[0]!.step - 1]!))).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('Can-do 和文化小知識', () => {
  it('Can-do 編號連續，要複習的步驟屬於同一課', () => {
    CANDO.forEach((c, i) => expect(c.n).toBe(i + 1));
    for (const c of CANDO) {
      const s = STEPS.find((x) => x.id === c.step);
      expect(s, `第 ${c.n} 項`).toBeTruthy();
      expect(lessonOf(s!), `第 ${c.n} 項`).toBe(c.lesson);
      expect(c.title && c.zh && c.ex, `第 ${c.n} 項`).toBeTruthy();
    }
  });

  it('文化小知識都有對應的課，單字有拼音和中文', () => {
    const lessons = new Set(STEPS.map(lessonOf));
    CULTURE.forEach((c, i) => expect(c.id).toBe(i + 1));
    for (const c of CULTURE) {
      expect(lessons.has(c.lesson), c.zh).toBe(true);
      expect(c.body.length, c.zh).toBeGreaterThan(0);
      for (const w of c.words) {
        expect(w[0] && w[1] && w[2], `${c.zh} ${w[0]}`).toBeTruthy();
        expect(w[1], w[0]).toMatch(/^[a-z ]+$/);
      }
    }
  });
});
