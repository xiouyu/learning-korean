<template>
  <div class="prog" aria-label="學習進度">
    <div class="cellsets">
      <div v-for="r in rows" :key="r.label" class="cellrow">
        <span class="cl">{{ r.label }}</span>
        <div class="cells" :style="{ gridTemplateColumns: `repeat(${r.total},minmax(0,1fr))`, maxWidth: `${r.total * 18}px` }">
          <i v-for="n in r.total" :key="n" :class="n <= r.done ? 'on' : n <= r.done + r.cur ? 'cur' : ''" />
        </div>
      </div>
    </div>
    <div class="lbl">{{ rows.map((r) => `${r.name} ${r.done} / ${r.total}`).join('・') }}・{{ tail }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { LEARNED_AT, LETTER_SETS, ROADMAP, STEPS, stepLabel } from '@/data';
import { useProgressStore } from '@/stores/progress';

const p = useProgressStore();

const rows = computed(() =>
  LETTER_SETS.map(({ label, name, list }) => {
    const U = p.curU;
    const passed = p.d.passed;
    const count = (upTo: number) => list.filter((j) => (LEARNED_AT.get(j) ?? Infinity) <= upTo).length;
    const done = count(passed);
    const cur = U > passed ? count(U) - done : 0;
    return { label, name, total: list.length, done, cur };
  }),
);

const tail = computed(() => {
  const passed = p.d.passed;
  if (passed >= STEPS.length) {
    const nx = ROADMAP.find((r) => r.n === passed + 1);
    return nx?.ext ? `目前的內容全部學完了！下一站：${nx.row}（準備中）` : `第 ${passed + 1} 步內容準備中`;
  }
  return `正在學第 ${p.curU} 步・${stepLabel(p.curU)}`;
});
</script>
