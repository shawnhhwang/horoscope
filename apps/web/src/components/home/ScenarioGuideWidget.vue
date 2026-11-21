<template>
  <section class="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
    <div class="glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/30 shadow-cosmic space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-gold/15 pb-4">
        <div>
          <span class="text-[10px] font-sans uppercase tracking-[0.2em] text-dark-gold font-bold">GUIDED SCENARIO FLOW</span>
          <h2 class="font-serif text-xl sm:text-2xl font-bold text-gold-gradient mt-1">
            不知從何下手？依您當下的煩惱選擇「組合拳占卜流」
          </h2>
        </div>
        <router-link to="/holographic" class="text-xs text-dark-gold hover:underline font-serif">
          或直接啟動【一鍵全息四維合參】→
        </router-link>
      </div>

      <!-- 5 大情境入口卡片 -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          v-for="sc in scenarios"
          :key="sc.id"
          type="button"
          @click="selectedId = sc.id"
          :class="selectedId === sc.id ? 'border-dark-gold bg-dark-gold/15 text-dark-gold shadow-cosmic' : 'border-dark-gold/20 bg-black/30 text-dark-muted hover:text-dark-text'"
          class="p-4 rounded-xl border text-left transition-all cursor-pointer space-y-1.5"
        >
          <div class="text-xl">{{ sc.icon }}</div>
          <div class="font-serif font-bold text-xs sm:text-sm">{{ sc.title }}</div>
          <div class="text-[11px] opacity-80 leading-snug">{{ sc.subtitle }}</div>
        </button>
      </div>

      <!-- 具體問題輸入與自動組裝占卜流 -->
      <div class="p-4 sm:p-5 rounded-xl bg-black/30 border border-dark-gold/20 space-y-4">
        <div class="flex flex-col sm:flex-row gap-3">
          <input
            v-model="userQuestion"
            type="text"
            :placeholder="`請簡述您的問題（例如：${activeScenario.example}）`"
            class="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-dark-gold/30 text-xs text-dark-text outline-none focus:border-dark-gold"
          />
          <button
            type="button"
            @click="askAiGuide"
            class="px-5 py-2.5 rounded-xl bg-dark-gold text-dark-void font-serif font-bold text-xs hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
          >
            ✨ 靈犀情境問診
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-xs font-serif">
          <span class="text-dark-muted">推薦組合拳流程：</span>
          <template v-for="(step, idx) in activeScenario.flow" :key="step.path">
            <router-link
              :to="step.path"
              class="px-3 py-1 rounded-full bg-dark-gold/10 border border-dark-gold/35 text-dark-gold hover:bg-dark-gold hover:text-dark-void transition-colors"
            >
              {{ idx + 1 }}. {{ step.label }}
            </router-link>
            <span v-if="idx < activeScenario.flow.length - 1" class="text-dark-gold/50">➔</span>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLlmStore } from '../../stores/llm.js';

const llmStore = useLlmStore();
const selectedId = ref('love');
const userQuestion = ref('');

const scenarios = [
  {
    id: 'love',
    icon: '💕',
    title: '感情與關係',
    subtitle: '合婚默契、桃花與關係盲點',
    example: '我們適合步入婚姻嗎？最近常因溝通冷戰',
    flow: [
      { label: '雙人八字/紫微合盤', path: '/synastry' },
      { label: '塔羅關係三牌陣', path: '/tarot' },
      { label: '廟宇擲筊確認', path: '/temple-poem' },
    ],
  },
  {
    id: 'career',
    icon: '💼',
    title: '事業與轉職',
    subtitle: '升遷格局、創業與跳槽時機',
    example: '今年適合跳槽轉職或自己創業嗎？',
    flow: [
      { label: '四柱八字大運', path: '/bazi' },
      { label: '紫微官祿四化', path: '/ziwei' },
      { label: '周易六爻問Offer', path: '/iching' },
    ],
  },
  {
    id: 'wealth',
    icon: '🪙',
    title: '財運與投資',
    subtitle: '正偏財能量與合夥風險',
    example: '未來兩年正偏財運勢與合夥宜忌？',
    flow: [
      { label: '全息四維合參', path: '/holographic' },
      { label: '流年行運曆', path: '/annual-calendar' },
      { label: '黃曆簽約擇日', path: '/almanac' },
    ],
  },
  {
    id: 'guidance',
    icon: '🧭',
    title: '近期迷茫求指引',
    subtitle: '心神不定、夢境啟示與二選一',
    example: '近期感到迷茫焦慮，想尋求方向指引',
    flow: [
      { label: '文鳥靈雀神籤', path: '/buncho' },
      { label: '周公解夢剖析', path: '/dream' },
      { label: '百歲平行模擬', path: '/simulator' },
    ],
  },
  {
    id: 'timing',
    icon: '📅',
    title: '挑個好日子',
    subtitle: '簽約、搬家、開幕與嫁娶擇吉',
    example: '下個月想找適合搬家與簽約的吉日吉時',
    flow: [
      { label: '智能擇日助手', path: '/almanac' },
      { label: '個人起居諧振', path: '/annual-calendar' },
    ],
  },
];

const activeScenario = computed(() => scenarios.find((s) => s.id === selectedId.value) || scenarios[0]);

function askAiGuide() {
  const q = userQuestion.value.trim() || activeScenario.value.example;
  llmStore.openAssistant(undefined, `【情境：${activeScenario.value.title}】${q}`);
}
</script>
