<template>
  <div class="max-w-7xl mx-auto px-6 pt-28 pb-20">
    <div class="text-center mb-10">
      <div class="text-xs uppercase tracking-[0.25em] font-serif text-dark-gold mb-2">CHINESE ONOMASTICS</div>
      <h1 class="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient mb-3">易經姓名學剖析與起名</h1>
      <p class="text-xs text-dark-muted max-w-xl mx-auto">
        康熙字典正統筆劃 · 三才五格數理格局 · 八字喜用神補缺 · 詩經楚辭典籍智慧取名
      </p>
    </div>

    <!-- 標籤頁切換 -->
    <div class="flex justify-center mb-8">
      <div class="glass-panel p-1.5 rounded-full inline-flex border border-dark-gold/30">
        <button
          @click="activeTab = 'analyze'"
          :class="[
            'px-6 py-2 rounded-full text-xs font-serif transition-all',
            activeTab === 'analyze' ? 'bg-dark-gold text-dark-void font-bold shadow-cosmic' : 'text-dark-muted hover:text-dark-text',
          ]"
        >
          姓名三才五格吉凶剖析
        </button>
        <button
          @click="activeTab = 'recommend'"
          :class="[
            'px-6 py-2 rounded-full text-xs font-serif transition-all',
            activeTab === 'recommend' ? 'bg-dark-gold text-dark-void font-bold shadow-cosmic' : 'text-dark-muted hover:text-dark-text',
          ]"
        >
          八字喜用神智慧起名推薦
        </button>
      </div>
    </div>

    <!-- 標籤 1: 姓名剖析 -->
    <div v-if="activeTab === 'analyze'" class="space-y-8">
      <!-- 輸入表單 -->
      <div class="glass-panel rounded-2xl p-6 max-w-md mx-auto border border-dark-gold/30">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-xs font-serif text-dark-muted mb-1">姓氏</label>
            <input
              v-model="surname"
              type="text"
              placeholder="例如：李"
              class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-serif text-dark-muted mb-1">名字</label>
            <input
              v-model="givenName"
              type="text"
              placeholder="例如：若桐"
              class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
            />
          </div>
        </div>
        <button
          @click="handleAnalyze"
          class="w-full py-2.5 rounded-lg font-serif text-xs font-semibold bg-dark-gold text-dark-void hover:opacity-90 shadow-cosmic transition-all"
        >
          剖析姓名五格數理
        </button>
      </div>

      <!-- 剖析成果展示 -->
      <div v-if="analysisResult" class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
        <!-- 綜合評分與三才格局 -->
        <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 text-center flex flex-col justify-between">
          <div>
            <span class="text-xs text-dark-muted block">姓名綜評吉凶指數</span>
            <div class="my-4 font-serif text-6xl font-bold text-gold-gradient">
              {{ analysisResult.overallScore }}
              <span class="text-xs text-dark-muted">分</span>
            </div>

            <!-- 單字康熙筆劃 -->
            <div class="flex justify-center space-x-3 my-4">
              <div
                v-for="c in analysisResult.charStrokes"
                :key="c.char"
                class="px-3 py-2 rounded-lg bg-black/30 border border-dark-gold/20 text-center"
              >
                <div class="font-serif text-2xl font-bold text-dark-text">{{ c.char }}</div>
                <div class="text-[10px] text-dark-muted">{{ c.strokes }} 劃 ({{ c.element }})</div>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-dark-gold/10 border border-dark-gold/20 mt-4">
              <span class="text-xs text-dark-gold font-bold block mb-1">三才配置：{{ analysisResult.threeTalents.pattern }} ({{ analysisResult.threeTalents.level }})</span>
              <p class="text-xs text-dark-muted leading-relaxed">{{ analysisResult.threeTalents.description }}</p>
            </div>
          </div>
        </div>

        <!-- 五格數理詳情 (天人地總外) -->
        <div class="lg:col-span-2 glass-panel rounded-2xl p-6 border border-dark-gold/30">
          <h3 class="font-serif text-lg font-bold text-gold-gradient mb-4">五格剖象數理吉凶 (The Five Grids)</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="grid in [analysisResult.grids.tian, analysisResult.grids.ren, analysisResult.grids.di, analysisResult.grids.zong, analysisResult.grids.wai]"
              :key="grid.gridName"
              class="p-4 rounded-xl bg-black/30 border border-dark-gold/15 flex flex-col justify-between"
            >
              <div class="flex justify-between items-start mb-2">
                <div>
                  <span class="font-serif font-bold text-sm text-dark-gold">{{ grid.gridName }} ({{ grid.strokes }} 劃)</span>
                  <span class="text-[10px] text-dark-muted ml-2">五行：{{ grid.element }}</span>
                </div>
                <span
                  :class="[
                    'text-[10px] px-2 py-0.5 rounded font-bold',
                    grid.auspiciousLevel === '大吉' || grid.auspiciousLevel === '吉'
                      ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-950/70 text-amber-300 border border-amber-500/30',
                  ]"
                >
                  {{ grid.auspiciousLevel }}
                </span>
              </div>
              <p class="text-xs text-dark-muted leading-relaxed">{{ grid.meaning }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 🌟 AI 靈犀全幅深度解析專區 (位於下方一整列，長文自動展開，高雅閱讀) -->
      <InPageAiAnalysis
        v-if="analysisResult"
        module-type="NAME"
        :title="`姓名學分析 (${fullName})`"
        :summary="`總評分: ${totalScore}分 · 三才配置: ${patternText}`"
        :raw-data="analysisResult"
        :prompt="aiPrompt"
        button-text="✨ 啟動 AI 正統姓名學三才五格深度評析"
      />
    </div>

    <!-- 標籤 2: 喜用神智慧起名推薦 -->
    <div v-else class="space-y-8">
      <div class="glass-panel rounded-2xl p-6 max-w-xl mx-auto border border-dark-gold/30">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-xs font-serif text-dark-muted mb-1">家族姓氏</label>
            <input
              v-model="surname"
              type="text"
              class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-serif text-dark-muted mb-1">新生兒性別</label>
            <select
              v-model="gender"
              class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
            >
              <option value="男">男童</option>
              <option value="女">女童</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-serif text-dark-muted mb-1">八字喜用五行</label>
            <select
              v-model="selectedElement"
              class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
            >
              <option value="木">喜木 (生機開展)</option>
              <option value="火">喜火 (光明溫暖)</option>
              <option value="土">喜土 (厚德載物)</option>
              <option value="金">喜金 (剛毅堅卓)</option>
              <option value="水">喜水 (智謀流動)</option>
            </select>
          </div>
        </div>
        <button
          @click="handleRecommend"
          class="w-full py-2.5 rounded-lg font-serif text-xs font-semibold bg-dark-gold text-dark-void hover:opacity-90 shadow-cosmic transition-all"
        >
          篩選大吉典籍佳名列表
        </button>
      </div>

      <!-- 推薦名單卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="name in recommendedList"
          :key="name.fullName"
          class="glass-panel rounded-2xl p-6 border border-dark-gold/30 hover:border-dark-gold transition-all duration-300 hover:shadow-cosmic flex flex-col justify-between"
        >
          <div>
            <div class="flex justify-between items-start mb-3">
              <h3 class="font-serif text-3xl font-bold text-gold-gradient">{{ name.fullName }}</h3>
              <span class="text-xs px-2.5 py-1 rounded-full bg-dark-gold/15 text-dark-gold border border-dark-gold/30 font-serif font-bold">
                {{ name.totalScore }} 分
              </span>
            </div>
            <div class="flex space-x-1.5 mb-3">
              <span
                v-for="el in name.elements"
                :key="el"
                class="text-[10px] px-2 py-0.5 rounded bg-black/40 border border-dark-gold/20 text-dark-muted"
              >
                五行：{{ el }}
              </span>
            </div>
            <p class="text-xs text-dark-text leading-relaxed mb-3">{{ name.meaning }}</p>
          </div>
          <div class="text-[11px] text-dark-gold/80 italic border-t border-dark-gold/10 pt-3">
            出處：{{ name.origin }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { analyzeName, recommendNames, FiveElement } from '@celestial/astro-core';
import InPageAiAnalysis from '../components/ai/InPageAiAnalysis.vue';

const activeTab = ref<'analyze' | 'recommend'>('analyze');

const surname = ref('李');
const givenName = ref('若桐');
const gender = ref<'男' | '女'>('女');
const selectedElement = ref<FiveElement>('木');

const analysisResult = ref<any>(null);
const recommendedList = ref<any[]>([]);

const fullName = computed(() => `${surname.value || ''}${givenName.value || ''}`);
const totalScore = computed(() => analysisResult.value?.fiveGrids?.totalScore || 0);
const patternText = computed(() => `${analysisResult.value?.threeTalents?.pattern || ''} (${analysisResult.value?.threeTalents?.fortune || ''})`);

const aiPrompt = computed(() => {
  if (!analysisResult.value) return '';
  const score = totalScore.value;
  const pattern = analysisResult.value.threeTalents?.pattern || '';
  const fortune = analysisResult.value.threeTalents?.fortune || '';
  return `請以正統姓名學與文字學顧問身份，為我客觀評估此姓名【${fullName.value}】：五格綜合評分為「${score}分」，三才配置為「${pattern}（${fortune}）」。請結合漢字音形義內涵、三才生剋穩定度、八字五行補益以及現代社交形象塑造，給予中肯、專業且具參考價值的診斷建言。`;
});

function handleAnalyze() {
  if (!surname.value || !givenName.value) return;
  analysisResult.value = analyzeName(surname.value.trim(), givenName.value.trim());
}

function handleRecommend() {
  recommendedList.value = recommendNames(surname.value.trim(), [selectedElement.value], gender.value);
}

onMounted(() => {
  handleAnalyze();
  handleRecommend();
});
</script>
