<template>
  <div class="cloze">
    <div v-for="(c, i) in items" :key="`${stepId}-${i}`" class="cq" :class="state(i)">
      <div class="cq-head">
        <span class="cq-n">{{ i + 1 }}</span>
        <span class="cq-q hangul" lang="ko">{{ c.q }}</span>
      </div>
      <p v-if="c.m" class="cq-m muted">{{ c.m }}</p>
      <div class="cq-opts">
        <button
          v-for="(o, oi) in c.opts"
          :key="o"
          class="copt hangul"
          lang="ko"
          :class="{ right: picked[i] !== undefined && oi === c.a, wrong: picked[i] === oi && oi !== c.a }"
          :disabled="picked[i] !== undefined"
          @click="pick(i, oi)"
        >
          {{ o }}
        </button>
      </div>
      <p v-if="picked[i] !== undefined" class="cq-why">
        <b>{{ picked[i] === c.a ? '答對了' : `答案是「${c.opts[c.a]}」` }}</b>：{{ c.why }}
      </p>
    </div>
    <div class="hrow">
      <span class="muted" style="font-size: 14px">答對 {{ score }} / {{ answered }}・共 {{ items.length }} 題</span>
      <button v-if="answered" class="btn ghost" @click="reset">全部重做</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { Cloze } from '@/data/types';
import { speak } from '@/composables/useSpeech';

const props = defineProps<{ items: Cloze[]; stepId: number }>();

/** 每一題選了第幾個選項（只在這次瀏覽有效，不存進學習紀錄） */
const picked = reactive<Record<number, number>>({});

const answered = computed(() => Object.keys(picked).length);
const score = computed(() => props.items.filter((c, i) => picked[i] === c.a).length);
const state = (i: number) => (picked[i] === undefined ? '' : picked[i] === props.items[i]!.a ? 'ok' : 'ng');

function pick(i: number, oi: number) {
  picked[i] = oi;
  const c = props.items[i]!;
  // 答完唸出完整的句子（拿掉「가:」「나:」這種說話人標記和箭頭）
  speak(c.q.replace('___', c.opts[c.a]!).replace(/(^|\n)[가나]:\s*/g, '$1').replace('→', ''));
}

function reset() {
  for (const k of Object.keys(picked)) delete picked[Number(k)];
}

watch(() => props.stepId, reset);
</script>
