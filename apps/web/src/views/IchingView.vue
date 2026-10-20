<template>
  <div class="max-w-7xl mx-auto px-3 sm:px-6 pt-28 pb-20">
    <div class="text-center mb-10">
      <div class="text-xs uppercase tracking-[0.25em] font-serif text-dark-gold mb-2">I CHING DIVINATION</div>
      <h1 class="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient mb-3">周易文王六爻卜卦</h1>
      <p class="text-xs text-dark-muted max-w-xl mx-auto">
        乾清乾隆古銅錢三枚拋擲 · 老陽老陰動爻推演 · 64卦384爻辭深度白話剖析
      </p>
    </div>

    <!-- 模式切換 -->
    <div class="flex justify-center mb-8">
      <div class="glass-panel p-1.5 rounded-full inline-flex border border-dark-gold/30">
        <button
          @click="activeMode = 'coin'"
          :class="[
            'px-6 py-2 rounded-full text-xs font-serif transition-all',
            activeMode === 'coin' ? 'bg-dark-gold text-dark-void font-bold shadow-cosmic' : 'text-dark-muted hover:text-dark-text',
          ]"
        >
          六爻古錢神卦 (搖卦法)
        </button>
        <button
          @click="activeMode = 'plum'"
          :class="[
            'px-6 py-2 rounded-full text-xs font-serif transition-all',
            activeMode === 'plum' ? 'bg-dark-gold text-dark-void font-bold shadow-cosmic' : 'text-dark-muted hover:text-dark-text',
          ]"
        >
          梅花心易數理起卦
        </button>
      </div>
    </div>

    <!-- 六爻金錢卦交互舞台 -->
    <div v-if="activeMode === 'coin'" class="max-w-2xl mx-auto glass-panel rounded-2xl p-8 border border-dark-gold/30 text-center mb-12">
      <!-- 三枚銅錢視覺模擬 -->
      <div class="flex justify-center space-x-6 my-8">
        <div
          v-for="i in 3"
          :key="i"
          :class="[
            'w-16 h-16 rounded-full border-2 border-dark-gold bg-dark-gold/20 flex items-center justify-center shadow-cosmic transition-transform duration-500',
            isTossing ? 'rotate-[720deg] scale-110' : '',
          ]"
        >
          <div class="w-6 h-6 border border-dark-gold flex items-center justify-center font-serif text-[10px] text-dark-gold">
            通寶
          </div>
        </div>
      </div>

      <!-- 進度指示 -->
      <div class="mb-6">
        <span class="text-xs text-dark-muted">當前搖卦進度：</span>
        <span class="font-serif font-bold text-dark-gold text-sm">{{ tossedYaos.length }} / 6 次</span>
      </div>

      <div class="flex justify-center gap-4">
        <button
          @click="tossOneYao"
          :disabled="isTossing || tossedYaos.length >= 6"
          class="px-8 py-3 rounded-full font-serif text-xs font-semibold bg-dark-gold text-dark-void hover:opacity-90 shadow-cosmic transition-all disabled:opacity-40"
        >
          {{ tossedYaos.length >= 6 ? '六爻已成，見下方解卦' : isTossing ? '銅錢翻轉中...' : `搖第 ${tossedYaos.length + 1} 爻` }}
        </button>

        <button
          @click="resetToss"
          class="px-5 py-3 rounded-full font-serif text-xs border border-dark-gold/40 text-dark-gold hover:bg-dark-gold/10 transition-colors"
        >
          重新起卦
        </button>
      </div>

      <!-- 堆疊爻象視覺化 (由下往上顯示) -->
      <div class="mt-8 max-w-xs mx-auto space-y-2 border-t border-dark-gold/20 pt-6">
        <div
          v-for="(val, idx) in reversedYaos"
          :key="idx"
          class="flex items-center justify-between text-xs p-2 rounded bg-black/40 border border-dark-gold/10"
        >
          <span class="text-dark-muted font-serif">第 {{ 6 - idx }} 爻</span>
          <div class="flex items-center space-x-1">
            <!-- 陽爻 (一整條) -->
            <div v-if="val === 7 || val === 9" class="w-24 h-2 bg-dark-gold rounded-full"></div>
            <!-- 陰爻 (中間斷開) -->
            <div v-else class="flex space-x-2">
              <div class="w-11 h-2 bg-dark-muted rounded-full"></div>
              <div class="w-11 h-2 bg-dark-muted rounded-full"></div>
            </div>
          </div>
          <span :class="val === 6 || val === 9 ? 'text-rose-400 font-bold' : 'text-dark-muted'">
            {{ getYaoLabel(val) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 梅花易數輸入 -->
    <div v-else class="max-w-md mx-auto glass-panel rounded-2xl p-6 border border-dark-gold/30 mb-12">
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-serif text-dark-muted mb-1">上卦基數 (1~999)</label>
          <input v-model="plum1" type="number" class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none" />
        </div>
        <div>
          <label class="block text-xs font-serif text-dark-muted mb-1">下卦基數 (1~999)</label>
          <input v-model="plum2" type="number" class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none" />
        </div>
        <div>
          <label class="block text-xs font-serif text-dark-muted mb-1">動爻基數 (1~999)</label>
          <input v-model="plum3" type="number" class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none" />
        </div>
        <button
          @click="handlePlumBlossom"
          class="w-full py-2.5 rounded-lg font-serif text-xs font-semibold bg-dark-gold text-dark-void hover:opacity-90 shadow-cosmic transition-all"
        >
          梅花心易起卦
        </button>
      </div>
    </div>

    <!-- 卦象解析成果 (本卦、變卦、互卦、綜卦) -->
    <div v-if="divinationResult" class="space-y-8 animate-fade-in">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- 本卦 -->
        <div class="glass-panel rounded-2xl p-6 border border-dark-gold/50 shadow-cosmic text-center">
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-dark-gold/15 text-dark-gold border border-dark-gold/30 uppercase font-serif block w-max mx-auto mb-2">
            本卦 (現狀)
          </span>
          <h3 class="font-serif text-2xl font-bold text-gold-gradient mb-2">{{ divinationResult.baseHexagram.name }}</h3>
          <p class="text-xs text-dark-muted leading-relaxed">{{ divinationResult.baseHexagram.judgment }}</p>
        </div>

        <!-- 變卦 / 之卦 -->
        <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 text-center">
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-500/30 uppercase font-serif block w-max mx-auto mb-2">
            變卦 (未來趨勢)
          </span>
          <h3 class="font-serif text-2xl font-bold text-rose-300 mb-2">
            {{ divinationResult.transformedHexagram?.name || '無動爻 (守本象)' }}
          </h3>
          <p class="text-xs text-dark-muted leading-relaxed">
            {{ divinationResult.transformedHexagram?.judgment || '此卦純粹穩定，無劇烈轉向，宜持守正道。' }}
          </p>
        </div>

        <!-- 互卦 -->
        <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 text-center">
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-violet-950/60 text-violet-300 border border-violet-500/30 uppercase font-serif block w-max mx-auto mb-2">
            互卦 (中間隱變)
          </span>
          <h3 class="font-serif text-2xl font-bold text-violet-300 mb-2">{{ divinationResult.nuclearHexagram.name }}</h3>
          <p class="text-xs text-dark-muted leading-relaxed">{{ divinationResult.nuclearHexagram.image }}</p>
        </div>

        <!-- 綜卦 -->
        <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 text-center">
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 uppercase font-serif block w-max mx-auto mb-2">
            綜卦 (逆向換位)
          </span>
          <h3 class="font-serif text-2xl font-bold text-cyan-300 mb-2">{{ divinationResult.invertedHexagram.name }}</h3>
          <p class="text-xs text-dark-muted leading-relaxed">{{ divinationResult.invertedHexagram.judgment }}</p>
        </div>
      </div>

      <!-- 四維白話詳解 -->
      <div class="glass-panel rounded-2xl p-8 border border-dark-gold/30">
        <h3 class="font-serif text-xl font-bold text-gold-gradient mb-6">天機爻辭事態解析</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/15">
            <span class="font-serif font-bold text-dark-gold block mb-1">事業與前程：</span>
            <p class="text-xs text-dark-muted leading-relaxed">{{ divinationResult.interpretation.career }}</p>
          </div>
          <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/15">
            <span class="font-serif font-bold text-dark-gold block mb-1">財帛與機遇：</span>
            <p class="text-xs text-dark-muted leading-relaxed">{{ divinationResult.interpretation.wealth }}</p>
          </div>
          <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/15">
            <span class="font-serif font-bold text-dark-gold block mb-1">情緣與人際：</span>
            <p class="text-xs text-dark-muted leading-relaxed">{{ divinationResult.interpretation.love }}</p>
          </div>
          <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/15">
            <span class="font-serif font-bold text-dark-gold block mb-1">大局總綱：</span>
            <p class="text-xs text-dark-muted leading-relaxed">{{ divinationResult.interpretation.general }}</p>
          </div>
        </div>
      </div>

      <!-- 🌟 AI 靈犀全幅深度解析專區 (位於下方一整列，長文自動展開，高雅閱讀) -->
      <InPageAiAnalysis
        v-if="divinationResult"
        module-type="ICHING"
        :title="`周易卜卦 (${originalHexagramName} 之 ${transformedHexagramName})`"
        :summary="`本卦: ${originalHexagramName} · 變卦: ${transformedHexagramName} · 動爻: 第${movingLinesText}爻`"
        :raw-data="divinationResult"
        :prompt="aiPrompt"
        button-text="✨ 啟動 AI 易經戰略決策思維深度精解"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { tossCoins, castCoinDivination, castPlumBlossom, YaoType } from '@celestial/astro-core';
import InPageAiAnalysis from '../components/ai/InPageAiAnalysis.vue';

const activeMode = ref<'coin' | 'plum'>('coin');
const isTossing = ref(false);
const tossedYaos = ref<YaoType[]>([]);
const divinationResult = ref<any>(null);

const originalHexagramName = computed(() => divinationResult.value?.originalHexagram?.name || '');
const transformedHexagramName = computed(() => divinationResult.value?.transformedHexagram?.name || '');
const movingLinesText = computed(() => divinationResult.value?.movingLines?.join('、') || '無動爻');

const aiPrompt = computed(() => {
  if (!divinationResult.value) return '';
  const original = originalHexagramName.value;
  const transformed = transformedHexagramName.value;
  const moving = movingLinesText.value;
  return `請以易經決策思維顧問身份，為我深入剖析此卦：本卦得【${original}】，動爻為【第${moving}爻】，變卦化為【${transformed}】。請以《易經》的時位辯證與戰略決策視角，解析事態當前所處階段、動爻引動之關鍵轉折點、未來發展趨勢與具體的進退抉擇指南。`;
});

const plum1 = ref(1);
const plum2 = ref(8);
const plum3 = ref(3);

function tossOneYao() {
  if (tossedYaos.value.length >= 6) return;
  isTossing.value = true;
  setTimeout(() => {
    const val = tossCoins();
    tossedYaos.value.push(val);
    isTossing.value = false;

    if (tossedYaos.value.length === 6) {
      divinationResult.value = castCoinDivination(tossedYaos.value);
    }
  }, 400);
}

function resetToss() {
  tossedYaos.value = [];
  divinationResult.value = null;
}

const reversedYaos = computed(() => {
  return [...tossedYaos.value].reverse();
});

function getYaoLabel(val: YaoType) {
  if (val === 9) return '老陽 (動)';
  if (val === 6) return '老陰 (動)';
  if (val === 7) return '少陽';
  return '少陰';
}

function handlePlumBlossom() {
  divinationResult.value = castPlumBlossom(Number(plum1.value), Number(plum2.value), Number(plum3.value));
}
</script>
