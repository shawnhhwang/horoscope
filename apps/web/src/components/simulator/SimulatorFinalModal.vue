<template>
  <div v-if="finalSummary" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
    <div ref="finaleCardRef" class="glass-panel rounded-3xl p-6 sm:p-9 border border-dark-gold/50 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-center relative">
      <div class="w-16 h-16 rounded-full border-2 border-dark-gold mx-auto flex items-center justify-center text-2xl mb-4 bg-dark-gold/15 shadow-cosmic">👑</div>
      <div class="text-xs uppercase tracking-[0.25em] text-dark-gold font-sans font-bold mb-1">THE GRAND RETROSPECTIVE</div>
      <h2 class="text-2xl sm:text-3xl font-bold text-gold-gradient mb-2">{{ finalSummary.endingTitle }}</h2>
      <div class="text-xs text-dark-muted mb-6">
        享壽 {{ finalSummary.finalAge }} 載 · 天命契合度評定 {{ finalSummary.destinyAlignmentScore }} 分
      </div>

      <!-- 五維得分面板 -->
      <div class="grid grid-cols-5 gap-2 p-3 rounded-xl bg-black/50 border border-dark-gold/20 text-xs mb-6 font-mono">
        <div><div class="text-dark-muted text-[10px]">❤️ 健康</div><div class="font-bold text-emerald-400">{{ finalSummary.radarScores.health }}</div></div>
        <div><div class="text-dark-muted text-[10px]">📖 知識</div><div class="font-bold text-purple-400">{{ finalSummary.radarScores.knowledge ?? finalSummary.radarScores.wisdom }}</div></div>
        <div><div class="text-dark-muted text-[10px]">🪙 財富</div><div class="font-bold text-amber-400">{{ finalSummary.radarScores.wealth }}</div></div>
        <div><div class="text-dark-muted text-[10px]">🌸 情感</div><div class="font-bold text-pink-400">{{ finalSummary.radarScores.relationship }}</div></div>
        <div><div class="text-dark-muted text-[10px]">👑 事業</div><div class="font-bold text-sky-400">{{ finalSummary.radarScores.career }}</div></div>
      </div>

      <!-- 多重視角風格切換器 -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-2 px-1">
          <span class="text-xs font-bold text-dark-gold">🎭 蓋棺自傳視角</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] border" :class="finalSummary.perspectiveIsAi?.[selectedPerspective] ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold' : 'bg-white/5 border-white/10 text-dark-muted font-mono'">
            {{ finalSummary.perspectiveIsAi?.[selectedPerspective] ? '✨ 靈犀 AI 深度成卷' : '🏷️ 演算法傳承經典' }}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-black/60 border border-dark-gold/25">
          <button
            v-for="opt in perspectiveOptions"
            :key="opt.id"
            @click="$emit('selectPerspective', opt.id)"
            class="py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center"
            :class="selectedPerspective === opt.id ? 'bg-dark-gold text-dark-void shadow-cosmic border border-yellow-300' : 'text-dark-muted hover:text-dark-text hover:bg-white/5'"
          >
            <span>{{ opt.label }}</span>
            <span class="text-[9px] opacity-80 font-normal mt-0.5">{{ opt.shortName }}</span>
          </button>
        </div>
      </div>

      <!-- 自傳長文與 80億分之一揭曉 -->
      <div class="relative text-left text-xs sm:text-sm text-dark-text leading-relaxed p-5 sm:p-6 rounded-2xl bg-black/40 border border-dark-gold/25 mb-6 whitespace-pre-line font-serif min-h-[160px]">
        <div v-if="isGeneratingPerspective" class="py-8 flex flex-col items-center justify-center space-y-3 text-center">
          <div class="w-8 h-8 border-2 border-dark-gold border-t-transparent rounded-full animate-spin"></div>
          <div class="text-xs text-dark-gold font-bold animate-pulse">靈犀大師正修撰一生行誼...</div>
        </div>
        <div v-else>
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-dark-gold/15">
            <span class="text-xs font-bold text-dark-gold font-sans">🌌 【{{ perspectiveOptions.find(p => p.id === selectedPerspective)?.shortName }} · 蓋棺論定】</span>
            <button
              @click="$emit('requestPerspective', selectedPerspective, true)"
              class="px-2.5 py-1 rounded-lg bg-dark-gold/20 hover:bg-dark-gold/35 border border-dark-gold/40 text-dark-gold text-[11px] font-bold cursor-pointer"
            >
              ✨ {{ finalSummary.perspectiveIsAi?.[selectedPerspective] ? 'AI 重新撰寫' : '召喚靈犀 AI 撰寫' }}
            </button>
          </div>

          <div v-if="selectedPerspective === 'ONE_IN_8_BILLION' && finalSummary.oneInEightBillion" class="mb-4 space-y-3 font-sans">
            <div class="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div class="text-[11px] text-purple-300 font-bold">🌌 {{ finalSummary.oneInEightBillion.rarityScoreText }}</div>
                <div class="text-[10px] text-dark-muted font-mono mt-0.5">自由意志分歧：{{ finalSummary.oneInEightBillion.choicePathPermutations }}</div>
              </div>
              <div class="px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-200 font-mono text-[11px] font-bold">
                {{ finalSummary.oneInEightBillion.destinyCode }}
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div v-for="friend in finalSummary.oneInEightBillion.revealedFriends" :key="friend.id" class="p-3 rounded-xl bg-black/50 border border-rose-500/20 space-y-1.5">
                <img :src="friend.illustration || '/images/life-simulator/romance_wanqing.webp'" :alt="friend.name" width="720" height="720" loading="lazy" class="w-full h-28 object-cover rounded-lg" />
                <div class="flex items-center justify-between font-bold">
                  <span class="text-rose-200">{{ friend.name }}</span>
                  <span class="text-[10px] text-dark-gold">{{ friend.statusText }}</span>
                </div>
                <p class="text-[11px] text-dark-muted">{{ friend.fatedSummary }}</p>
              </div>
            </div>
          </div>

          <div class="whitespace-pre-line leading-relaxed">{{ finalSummary.biographyRichText }}</div>
        </div>
      </div>

      <!-- 一生榮光與遺憾 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-xs mb-6">
        <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div class="text-emerald-400 font-bold mb-1">🏆 一生榮光與功德：</div>
          <ul class="list-disc list-inside text-dark-muted space-y-1">
            <li v-for="(t, idx) in finalSummary.keyTriumphs" :key="idx">{{ t }}</li>
          </ul>
        </div>
        <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
          <div class="text-rose-400 font-bold mb-1">🍃 歲月缺憾與回眸：</div>
          <ul class="list-disc list-inside text-dark-muted space-y-1">
            <li v-for="(r, idx) in finalSummary.keyRegrets" :key="idx">{{ r }}</li>
          </ul>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-3">
        <SharePosterButton :target-ref="finaleCardRef" :filename="`life-summary-${session?.profileName || 'destiny'}`" label="下載一生回顧海報" />
        <button @click="$emit('restart')" class="px-5 py-2.5 rounded-xl bg-dark-gold text-dark-void font-bold text-xs hover:bg-yellow-400 cursor-pointer">🔄 重新開啟新一世</button>
        <button @click="$emit('close')" class="px-5 py-2.5 rounded-xl border border-dark-gold/40 text-dark-gold text-xs font-bold hover:bg-dark-gold/15 cursor-pointer">關閉視窗</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SharePosterButton from '../common/SharePosterButton.vue';

defineProps<{
  finalSummary: any;
  session: any;
  selectedPerspective: 'TIANJI' | 'SHIJI' | 'MEMOIR' | 'ONE_IN_8_BILLION';
  isGeneratingPerspective: boolean;
  perspectiveOptions: ReadonlyArray<{ id: 'TIANJI' | 'SHIJI' | 'MEMOIR' | 'ONE_IN_8_BILLION'; label: string; shortName: string; desc: string }>;
}>();

defineEmits<{
  (e: 'selectPerspective', p: 'TIANJI' | 'SHIJI' | 'MEMOIR' | 'ONE_IN_8_BILLION'): void;
  (e: 'requestPerspective', p: 'TIANJI' | 'SHIJI' | 'MEMOIR' | 'ONE_IN_8_BILLION', forceLlm: boolean): void;
  (e: 'restart'): void;
  (e: 'close'): void;
}>();

const finaleCardRef = ref<HTMLElement | null>(null);
</script>
