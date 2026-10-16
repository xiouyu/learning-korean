import { describe, expect, it } from 'vitest';
import { voiceScore } from '@/lib/voice';

const v = (name: string, voiceURI = name) => ({ name, voiceURI });
const best = (vs: ReturnType<typeof v>[]) => vs.reduce((a, b) => (voiceScore(b) > voiceScore(a) ? b : a)).name;

describe('voiceScore', () => {
  it('iPhone：不選 Eddy、Grandma 這類趣味語音', () => {
    expect(best([v('Eddy (한국어)', 'com.apple.eloquence.ko-KR.Eddy'), v('Grandma (한국어)', 'com.apple.eloquence.ko-KR.Grandma'), v('Yuna', 'com.apple.voice.compact.ko-KR.Yuna')])).toBe('Yuna');
  });
  it('iPhone：有下載增強版就用增強版', () => {
    expect(best([v('Yuna', 'com.apple.voice.compact.ko-KR.Yuna'), v('Yuna (Enhanced)', 'com.apple.voice.enhanced.ko-KR.Yuna')])).toBe('Yuna (Enhanced)');
  });
  it('電腦：優先用 Google / Microsoft 線上語音', () => {
    expect(best([v('Microsoft Heami - Korean (Korean)'), v('Microsoft SunHi Online (Natural) - Korean (Korea)'), v('Google 한국의')])).toBe('Microsoft SunHi Online (Natural) - Korean (Korea)');
  });
});
