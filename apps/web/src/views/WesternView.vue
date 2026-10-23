<template>
  <div class="max-w-7xl mx-auto px-3 sm:px-6 pt-28 pb-20">
    <div class="text-center mb-10">
      <div class="text-xs uppercase tracking-[0.25em] font-serif text-dark-gold mb-2">WESTERN ASTROLOGY</div>
      <h1 class="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient mb-3">西洋本命星盤與月相</h1>
      <p class="text-xs text-dark-muted max-w-xl mx-auto">
        黃道十二宮向量天盤 · 十大行星相位幾何 · 月亮星座情感潛意識 · 誕生月相心靈原型
      </p>
    </div>

    <!-- 輸入控制 -->
    <div class="glass-panel rounded-2xl p-6 mb-8 max-w-3xl mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div class="sm:col-span-2">
          <label class="block text-xs font-serif text-dark-muted mb-1">出生日期與時間 (UTC)</label>
          <input
            v-model="birthDateTime"
            type="datetime-local"
            class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
          />
        </div>
        <div>
          <label class="block text-xs font-serif text-dark-muted mb-1">緯度 (Latitude)</label>
          <input
            v-model="latitude"
            type="number"
            step="0.01"
            class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
          />
        </div>
        <div>
          <label class="block text-xs font-serif text-dark-muted mb-1">經度 (Longitude)</label>
          <input
            v-model="longitude"
            type="number"
            step="0.01"
            class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
          />
        </div>
      </div>
      <button
        @click="handleCalculate"
        class="w-full mt-4 py-2.5 rounded-lg font-serif text-xs font-semibold bg-dark-gold text-dark-void hover:opacity-90 shadow-cosmic transition-all"
      >
        繪製本命天宮星盤
      </button>
    </div>

    <div v-if="chart" class="space-y-8 animate-fade-in">
      <!-- 三大巨頭 (太陽、月亮、上升星座) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 text-center">
          <span class="text-xs text-dark-muted block mb-1">太陽星座 (核心自我)</span>
          <h3 class="font-serif text-3xl font-bold text-amber-300">{{ chart.sunSign }}</h3>
          <p class="text-xs text-dark-muted mt-2">生命原動力與顯性人格意志</p>
        </div>

        <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 text-center shadow-cosmic">
          <span class="text-xs text-dark-muted block mb-1">月亮星座 (潛意識與情感)</span>
          <h3 class="font-serif text-3xl font-bold text-violet-300">{{ chart.moonSign }}</h3>
          <p class="text-xs text-dark-muted mt-2">內心安全感源泉與脆弱私密自我</p>
        </div>

        <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 text-center">
          <span class="text-xs text-dark-muted block mb-1">上升星座 (外在面具)</span>
          <h3 class="font-serif text-3xl font-bold text-cyan-300">{{ chart.ascendantSign }}</h3>
          <p class="text-xs text-dark-muted mt-2">向外部世界展現的第一印象與人生濾鏡</p>
        </div>
      </div>

      <!-- 向量 SVG 星盤與月相專區 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- SVG 向量黃道本命星盤 -->
        <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 flex flex-col items-center justify-center">
          <h3 class="font-serif text-lg font-bold text-gold-gradient mb-4">黃道十二天宮幾何星盤</h3>
          <div class="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
            <svg class="w-full h-full" viewBox="0 0 500 500">
              <!-- 外圈十二星座環 -->
              <circle cx="250" cy="250" r="230" stroke="#e5c378" stroke-width="2" fill="none" opacity="0.4" />
              <circle cx="250" cy="250" r="185" stroke="#e5c378" stroke-width="1.5" fill="none" opacity="0.3" />
              <circle cx="250" cy="250" r="110" stroke="#7b61ff" stroke-width="1" fill="none" opacity="0.25" />

              <!-- 十二宮等分放射線 -->
              <line
                v-for="i in 12"
                :key="i"
                :x1="250 + 110 * Math.cos(((i * 30) * Math.PI) / 180)"
                :y1="250 + 110 * Math.sin(((i * 30) * Math.PI) / 180)"
                :x2="250 + 230 * Math.cos(((i * 30) * Math.PI) / 180)"
                :y2="250 + 230 * Math.sin(((i * 30) * Math.PI) / 180)"
                stroke="#e5c378"
                stroke-width="0.8"
                opacity="0.2"
              />

              <!-- 行星落點標記 -->
              <g v-for="p in chart.planets" :key="p.name">
                <circle
                  :cx="250 + 148 * Math.cos(((p.eclipticDegree - 90) * Math.PI) / 180)"
                  :cy="250 + 148 * Math.sin(((p.eclipticDegree - 90) * Math.PI) / 180)"
                  r="5"
                  fill="#e5c378"
                />
                <text
                  :x="250 + 168 * Math.cos(((p.eclipticDegree - 90) * Math.PI) / 180)"
                  :y="250 + 168 * Math.sin(((p.eclipticDegree - 90) * Math.PI) / 180)"
                  fill="#f0f3f8"
                  font-size="11"
                  text-anchor="middle"
                  font-family="Cinzel, serif"
                >
                  {{ p.name }}
                </text>
              </g>

              <!-- 中心金色相位幾何射線 -->
              <line
                v-for="(asp, idx) in chart.aspects.slice(0, 15)"
                :key="idx"
                :x1="getPlanetCoords(asp.planet1).x"
                :y1="getPlanetCoords(asp.planet1).y"
                :x2="getPlanetCoords(asp.planet2).x"
                :y2="getPlanetCoords(asp.planet2).y"
                :stroke="getAspectColor(asp.type)"
                stroke-width="1.2"
                opacity="0.6"
              />

              <!-- 中心天元 -->
              <circle cx="250" cy="250" r="16" fill="#08090C" stroke="#e5c378" stroke-width="2" />
              <circle cx="250" cy="250" r="4" fill="#e5c378" />
            </svg>
          </div>
        </div>

        <!-- 月相原型與月亮星座深度報告 -->
        <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 flex flex-col justify-between">
          <div>
            <h3 class="font-serif text-lg font-bold text-gold-gradient mb-4">月相原型與深層情感</h3>

            <!-- 誕生月相卡片 -->
            <div class="p-4 rounded-xl bg-violet-950/30 border border-violet-500/30 mb-6 flex items-center space-x-4">
              <div class="w-14 h-14 rounded-full border border-violet-400 bg-black/60 flex items-center justify-center font-serif text-xs text-violet-300 shadow-cosmic">
                {{ chart.lunarPhase.illumination }}%
              </div>
              <div>
                <span class="text-xs text-violet-300 font-bold block">{{ chart.lunarPhase.name }}</span>
                <span class="font-serif text-lg font-bold text-dark-text">{{ chart.lunarPhase.archetypeTitle }}</span>
                <p class="text-xs text-dark-muted mt-1 leading-relaxed">{{ chart.lunarPhase.description }}</p>
              </div>
            </div>

            <!-- 月亮星座深度解析 -->
            <div class="space-y-4">
              <div class="p-3.5 rounded-lg bg-black/30 border border-dark-gold/15">
                <span class="font-serif text-xs font-bold text-dark-gold block mb-1">情感與安全感源泉：</span>
                <p class="text-xs text-dark-muted leading-relaxed">{{ chart.moonDepthReport.emotionalNeeds }}</p>
              </div>
              <div class="p-3.5 rounded-lg bg-black/30 border border-dark-gold/15">
                <span class="font-serif text-xs font-bold text-dark-gold block mb-1">潛意識焦慮釋放模式：</span>
                <p class="text-xs text-dark-muted leading-relaxed">{{ chart.moonDepthReport.subconsciousPattern }}</p>
              </div>
              <div class="p-3.5 rounded-lg bg-black/30 border border-dark-gold/15">
                <span class="font-serif text-xs font-bold text-dark-gold block mb-1">親密關係相處風格：</span>
                <p class="text-xs text-dark-muted leading-relaxed">{{ chart.moonDepthReport.intimacyStyle }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 🌌 榮格與人本占星大師心法專區 (Astrological Masters & Depth Psychology) -->
      <div class="glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/35 shadow-cosmic">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-dark-gold/20">
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-xs font-serif text-dark-gold uppercase tracking-wider">DEPTH PSYCHOLOGY & HUMANISTIC MASTERS</span>
              <span class="px-2 py-0.5 rounded text-[10px] bg-dark-gold/20 text-dark-gold border border-dark-gold/40 font-serif">RAG 宗師心法</span>
            </div>
            <h3 class="font-serif text-xl font-bold text-gold-gradient mt-1">
              榮格深層心理學與現代占星宗師指引
            </h3>
          </div>
          <span class="text-xs text-dark-muted italic">「事件的意義高於預測 · 覺察即是個體化的起點」</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- 卡爾·榮格 -->
          <div class="p-4 rounded-xl bg-black/40 border border-dark-gold/20 flex flex-col justify-between hover:border-dark-gold/50 transition-all">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="font-serif text-xs font-bold text-amber-300">卡爾·榮格 (Carl Jung)</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300/90 border border-amber-500/30">共時性與個體化</span>
              </div>
              <p class="text-xs text-dark-muted leading-relaxed">
                「在潛意識被引導為意識之前，它將主宰你的人生，而你將稱其為命運。」本命星盤是無意識原型的神聖鏡子，困難相位正是照亮心理陰影的契機。
              </p>
            </div>
            <span class="text-[10px] text-dark-gold/70 mt-3 pt-2 border-t border-dark-gold/10 font-serif">《榮格心理占星心法》</span>
          </div>

          <!-- 丹·路德雅爾 -->
          <div class="p-4 rounded-xl bg-black/40 border border-dark-gold/20 flex flex-col justify-between hover:border-dark-gold/50 transition-all">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="font-serif text-xs font-bold text-cyan-300">丹·路德雅爾 (Dane Rudhyar)</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300/90 border border-cyan-500/30">現代人本占星之父</span>
              </div>
              <p class="text-xs text-dark-muted leading-relaxed">
                「事件不會平白無故降臨，而是人在內在心理結構中呼喚了共振的經驗。」占星諮詢核心在於為生命危機賦予意義，啟動自我實現。
              </p>
            </div>
            <span class="text-[10px] text-dark-gold/70 mt-3 pt-2 border-t border-dark-gold/10 font-serif">《人本占星學綱要》</span>
          </div>

          <!-- 莉茲·格林 -->
          <div class="p-4 rounded-xl bg-black/40 border border-dark-gold/20 flex flex-col justify-between hover:border-dark-gold/50 transition-all">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="font-serif text-xs font-bold text-violet-300">莉茲·格林 (Liz Greene)</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-violet-950/60 text-violet-300/90 border border-violet-500/30">土星奧祕與靈魂基石</span>
              </div>
              <p class="text-xs text-dark-muted leading-relaxed">
                「土星是靈魂在物質界最嚴格也最忠實的導師。」挫折與考驗並非宿命懲罰，三十年週期鍛造後，盲點將昇華為人生不可撼動的卓越成就。
              </p>
            </div>
            <span class="text-[10px] text-dark-gold/70 mt-3 pt-2 border-t border-dark-gold/10 font-serif">《土星：從新觀點看老魔鬼》</span>
          </div>

          <!-- 史蒂芬·阿若優 -->
          <div class="p-4 rounded-xl bg-black/40 border border-dark-gold/20 flex flex-col justify-between hover:border-dark-gold/50 transition-all">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="font-serif text-xs font-bold text-emerald-300">史蒂芬·阿若優 (Stephen Arroyo)</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300/90 border border-emerald-500/30">四元素能量心理學</span>
              </div>
              <p class="text-xs text-dark-muted leading-relaxed">
                四大元素（火之靈性熱忱、土之物質定錨、風之觀念溝通、水之情感共振）在個體內的動態流轉，是心靈轉化與業力平衡的真實鑰匙。
              </p>
            </div>
            <span class="text-[10px] text-dark-gold/70 mt-3 pt-2 border-t border-dark-gold/10 font-serif">《占星、業力與轉化》</span>
          </div>
        </div>
      </div>

      <!-- 🌟 AI 靈犀全幅深度解析專區 (位於下方一整列，長文自動展開，高雅閱讀) -->
      <InPageAiAnalysis
        v-if="chart"
        module-type="WESTERN"
        :title="`西洋星盤 (日${sunSign}·月${moonSign}·升${ascSign})`"
        :summary="`月相原型: ${phaseName} · 相位數: ${chart.aspects?.length || 0}個`"
        :raw-data="chart"
        :prompt="aiPrompt"
        button-text="✨ 啟動 AI 現代人本與心理占星全盤深度解析（融匯榮格與宗師心法）"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { calculateWesternNatalChart } from '@celestial/astro-core';
import InPageAiAnalysis from '../components/ai/InPageAiAnalysis.vue';

const birthDateTime = ref('2000-01-01T12:00');
const latitude = ref(25.033);
const longitude = ref(121.5654);
const chart = ref<any>(null);

const sunSign = computed(() => chart.value?.planets?.find((p: any) => p.name === '太陽')?.sign || chart.value?.sunSign || '白羊座');
const moonSign = computed(() => chart.value?.planets?.find((p: any) => p.name === '月亮')?.sign || chart.value?.moonSign || '巨蟹座');
const ascSign = computed(() => chart.value?.ascendantSign || chart.value?.angles?.ascendantSign || '上升座');
const phaseName = computed(() => chart.value?.lunarPhase?.phaseName || '滿月');

const aiPrompt = computed(() => {
  if (!chart.value) return '';
  return `請以現代人本與心理占星顧問身份，融匯卡爾·榮格（Carl Jung）深層心理學、丹·路德雅爾（Dane Rudhyar）人本占星與莉茲·格林（Liz Greene）宗師心法，為我深度解讀此西洋本命星盤：太陽落在「${sunSign.value}」，月亮落在「${moonSign.value}」，上升點 (ASC) 落在「${ascSign.value}」，月相原型為「${phaseName.value}」。請以專業、客觀且具備心理學深度的視角，剖析我的顯意識英雄之旅追求、潛意識安全感需索、核心相位張力與陰影整合功課，並給予具體可落地的生活實踐與心靈成長建言。`;
});

function handleCalculate() {
  chart.value = calculateWesternNatalChart(new Date(birthDateTime.value), Number(latitude.value), Number(longitude.value));
}

function getPlanetCoords(name: string) {
  const p = chart.value?.planets.find((item: any) => item.name === name);
  if (!p) return { x: 250, y: 250 };
  const rad = ((p.eclipticDegree - 90) * Math.PI) / 180;
  return {
    x: 250 + 110 * Math.cos(rad),
    y: 250 + 110 * Math.sin(rad),
  };
}

function getAspectColor(type: string) {
  if (type === '合相') return '#e5c378';
  if (type === '三分相' || type === '六分相') return '#10b981';
  return '#ef4444'; // 四分相、對分相
}

onMounted(() => {
  handleCalculate();
});
</script>
