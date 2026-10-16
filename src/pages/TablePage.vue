<template>
  <section class="panel">
    <div class="stephead">
      <div class="eyebrow">{{ table.desc }}</div>
      <h2 style="letter-spacing: 0.04em; font-size: 28px">反切表</h2>
      <p class="lead muted">
        直的是子音，橫的是母音，交叉的格子就是兩個字母拼起來的字。實線框是已經學過的字母拼成的字，點一下聽發音；虛線淡色的是之後會學到的。
      </p>
    </div>
    <div class="hrow" aria-label="切換">
      <button v-for="x in TABLES" :key="x.id" class="chip" :aria-pressed="x.id === table.id" @click="tid = x.id">{{ x.label }}</button>
    </div>
    <div class="legend">
      <span>藍框：字卡「記住了」3 次以上</span>
      <span v-if="table.id === 'basic'">ㅇ 在字首不發音，所以 ㅇ 那一列就是母音本身的音</span>
      <span v-else-if="table.id === 'tense'">緊音：喉嚨繃緊、不送氣，聲音短而硬</span>
      <span v-else>ㅐ／ㅔ 現在唸起來一樣；ㅙ／ㅚ／ㅞ 也一樣</span>
    </div>
    <div class="tscroll">
      <div class="gt" :style="{ gridTemplateColumns: `30px repeat(${table.cols.length},minmax(44px,1fr))`, minWidth: `${table.cols.length * 50 + 30}px` }">
        <span />
        <span v-for="v in table.cols" :key="v" class="rh hangul">{{ v }}</span>
        <template v-for="c in table.rows" :key="c">
          <span class="rh hangul">{{ c }}</span>
          <button
            v-for="v in table.cols"
            :key="c + v"
            class="gc"
            :class="{ off: !open(c, v), done: open(c, v) && (p.d.mastery[compose(c, v)] ?? 0) >= 3 }"
            @click="tap(c, v)"
          >
            <span class="hangul" lang="ko">{{ compose(c, v) }}</span><span class="mono">{{ romanize(compose(c, v)) }}</span>
          </button>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import { ALL_LETTERS, LEARNED_AT, STEPS, TABLES } from '@/data';
import { compose, romanize } from '@/lib/hangul';
import { say } from '@/composables/useAudio';
import { useProgressStore } from '@/stores/progress';

defineOptions({ name: 'TablePage' });

const p = useProgressStore();
const $q = useQuasar();
/** 目前看哪一張表（不需要保存） */
const tid = ref<string>('basic');
const table = computed(() => TABLES.find((x) => x.id === tid.value) ?? TABLES[0]);

/** 這一格的子音和母音在第幾步學到（還沒加進網站的是 undefined） */
const stepOf = (c: string, v: string) => {
  const a = LEARNED_AT.get(c);
  const b = LEARNED_AT.get(v);
  return a === undefined || b === undefined ? undefined : Math.max(a, b);
};
const open = (c: string, v: string) => (stepOf(c, v) ?? Infinity) <= p.curU;

function tap(c: string, v: string) {
  const ch = compose(c, v);
  const s = stepOf(c, v);
  if (open(c, v)) say(ALL_LETTERS.find((k) => k.k === ch) ?? {}, ch);
  else if (s !== undefined && s <= STEPS.length) $q.notify({ message: `第 ${s} 步會學到這個字` });
  else $q.notify({ message: '之後的步驟會學到這個字' });
}
</script>
