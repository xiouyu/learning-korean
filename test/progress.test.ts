import { describe, expect, it } from 'vitest';
import { emptyProgress, mergeProgress, normalize } from '@/lib/progress';

const MAX = 33;

describe('normalize', () => {
  it('把壞掉或超出範圍的資料修正成合法值', () => {
    const d = normalize(
      { passed: 99, step: -3, scope: [0, 2, 2, 50, 1] as number[], mastery: { 아: 2, 어: -1 }, qmode: 'xx' as never },
      MAX,
    );
    expect(d.passed).toBe(MAX);
    expect(d.step).toBe(1);
    expect(d.scope).toEqual([1, 2]);
    expect(d.mastery).toEqual({ 아: 2 });
    expect(d.qmode).toBe('k2r');
  });

  it('測驗題數只接受可以選的值，舊資料沒有就用 10 題', () => {
    expect(normalize({ qn: 30 }, MAX).qn).toBe(30);
    expect(normalize({ qn: 0 }, MAX).qn).toBe(0);
    expect(normalize({ qn: -1 }, MAX).qn).toBe(-1);
    expect(normalize({ qn: 7 }, MAX).qn).toBe(10);
    expect(normalize({}, MAX).qn).toBe(10);
  });

  it('弱點分數只留正整數、最多 10；出題方式不認得就用平均出題', () => {
    const d = normalize({ weak: { 아: 3, 어: 0, 오: -2, 우: 99, 으: 'x' as never }, qpick: 'zz' as never }, MAX);
    expect(d.weak).toEqual({ 아: 3, 우: 10 });
    expect(d.qpick).toBe('even');
    expect(normalize({ qpick: 'weak' }, MAX).qpick).toBe('weak');
  });

  it('打字作答的題型也讀得回來', () => {
    expect(normalize({ qmode: 't2r' }, MAX).qmode).toBe('t2r');
    expect(normalize({ qmode: 'a2t' }, MAX).qmode).toBe('a2t');
    expect(normalize({ qmode: 'k2z' as never }, MAX).qmode).toBe('k2r');
  });

  it('學習紀錄只留合法的日期和正整數', () => {
    const d = normalize({ daily: { '2026-10-19': 3, bad: 2, '2026-10-18': 0 }, seen: { 아: 5, 어: -1 }, review: 'x' as never }, MAX);
    expect(d.daily).toEqual({ '2026-10-19': 3 });
    expect(d.seen).toEqual({ 아: 5 });
    expect(d.review).toBe('');
  });

  it('Can-do 自我評價只留 1～3 顆星', () => {
    expect(normalize({ cando: { 1: 3, 2: 0, 3: 4, x: 2, 5: '2' as never } }, MAX).cando).toEqual({ 1: 3, 5: 2 });
  });

  it('沒有資料時回傳初始值', () => {
    expect(normalize(null, MAX)).toEqual(emptyProgress());
  });

  it('舊資料沒有新欄位也讀得懂', () => {
    const old = { passed: 20, step: 21, scope: [20, 21], lastU: 21, mastery: { 아: 2 }, qmode: 'a2k', updatedAt: 5 };
    const d = normalize(old as never, 45);
    expect(d).toMatchObject({ passed: 20, step: 21, scope: [20, 21], mastery: { 아: 2 }, qmode: 'a2k', qn: 10, qpick: 'even' });
    expect(d.weak).toEqual({});
    expect(d.daily).toEqual({});
  });

  it('大會考紀錄：已經學過大會考之後步驟的人當作考過', () => {
    const gates = [
      { id: 'hangul', after: 12 },
      { id: 'l1-5', after: 45 },
    ];
    expect(normalize({ passed: 20 }, 60, gates).exams).toEqual(['hangul']);
    expect(normalize({ passed: 12 }, 60, gates).exams).toEqual([]);
    expect(normalize({ passed: 46, exams: ['l1-5', 'hangul', 'l1-5', 3] as never }, 60, gates).exams).toEqual(['hangul', 'l1-5']);
  });
});

describe('mergeProgress', () => {
  const phone = { ...emptyProgress(), passed: 5, step: 6, scope: [6], mastery: { 아: 3, 가: 1 }, qmode: 'a2k' as const, updatedAt: 200 };
  const laptop = { ...emptyProgress(), passed: 3, step: 2, scope: [1, 2], mastery: { 아: 1, 사: 4 }, qmode: 'r2k' as const, updatedAt: 100 };

  it('進度和熟練度取較大的值，不會倒退', () => {
    const m = mergeProgress(laptop, phone);
    expect(m.passed).toBe(5);
    expect(m.mastery).toEqual({ 아: 3, 가: 1, 사: 4 });
  });

  it('偏好設定以最後修改的裝置為準', () => {
    const m = mergeProgress(laptop, phone);
    expect(m.step).toBe(6);
    expect(m.scope).toEqual([6]);
    expect(m.qmode).toBe('a2k');
    expect(m.updatedAt).toBe(200);
  });

  it('任一邊通過的大會考都算通過', () => {
    expect(mergeProgress({ ...laptop, exams: ['hangul'] }, { ...phone, exams: ['l1-5'] }).exams).toEqual(['hangul', 'l1-5']);
    expect(mergeProgress(laptop, phone).exams).toEqual([]);
  });

  it('弱點分數和出題方式以最後修改的裝置為準', () => {
    const m = mergeProgress({ ...laptop, weak: { 아: 4 }, qpick: 'weak' }, { ...phone, weak: { 가: 2 } });
    expect(m.weak).toEqual({ 가: 2 });
    expect(m.qpick).toBe('even');
  });

  it('Can-do 自我評價以最後修改的裝置為準（可以改高也可以改低）', () => {
    expect(mergeProgress({ ...laptop, cando: { 1: 1 } }, { ...phone, cando: { 1: 3, 2: 2 } }).cando).toEqual({ 1: 3, 2: 2 });
  });

  it('每天的題數和最後練習的日子取較大值，今日複習的日期取較新的', () => {
    const m = mergeProgress(
      { ...laptop, daily: { '2026-10-18': 5, '2026-10-19': 2 }, seen: { 아: 100 }, review: '2026-10-18' },
      { ...phone, daily: { '2026-10-19': 7 }, seen: { 아: 90, 어: 95 }, review: '2026-10-19' },
    );
    expect(m.daily).toEqual({ '2026-10-18': 5, '2026-10-19': 7 });
    expect(m.seen).toEqual({ 아: 100, 어: 95 });
    expect(m.review).toBe('2026-10-19');
  });

  it('順序不影響結果', () => {
    expect(mergeProgress(laptop, phone)).toEqual(mergeProgress(phone, laptop));
  });
});
