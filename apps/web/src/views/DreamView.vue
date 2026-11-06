<template>
  <div class="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
    <!-- 頂部標題與周公解夢典故 -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full border border-indigo-500/30 bg-indigo-950/20 text-indigo-300 text-xs font-serif mb-3 shadow-cosmic">
        <span>🌙</span>
        <span>周公解夢全書 · 榮格原型心理學 · 潛意識心靈密碼</span>
      </div>
      <h1 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gold-gradient mb-3">
        周公解夢 · 潛意識意象分析
      </h1>
      <p class="text-xs sm:text-sm text-dark-muted max-w-2xl mx-auto leading-relaxed">
        古人云：「夢者，魂魄之靈通也。」融匯東方古典《周公解夢》吉凶象徵與西方榮格深層原型心理學，解鎖夢境中的隱秘訊息，指引現實生活的轉化與療癒。
      </p>
    </div>

    <!-- 頂部切換頁籤：單一意象檢索 vs 夢境交織多重剖析 -->
    <div class="flex items-center justify-center space-x-3 mb-8">
      <button
        @click="activeTab = 'search'"
        class="px-5 py-2.5 rounded-full text-xs font-serif font-bold transition-all flex items-center space-x-2"
        :class="[
          activeTab === 'search'
            ? 'bg-dark-gold text-dark-void shadow-cosmic'
            : 'glass-panel border border-dark-gold/30 text-dark-muted hover:text-dark-gold',
        ]"
      >
        <span>🔍</span>
        <span>夢境意象檢索辭庫</span>
      </button>

      <button
        @click="activeTab = 'scenario'"
        class="px-5 py-2.5 rounded-full text-xs font-serif font-bold transition-all flex items-center space-x-2"
        :class="[
          activeTab === 'scenario'
            ? 'bg-dark-gold text-dark-void shadow-cosmic'
            : 'glass-panel border border-dark-gold/30 text-dark-muted hover:text-dark-gold',
        ]"
      >
        <span>🔮</span>
        <span>長篇夢境交織剖析</span>
      </button>
    </div>

    <!-- 模式一：夢境意象辭庫檢索 (Tab: Search) -->
    <div v-if="activeTab === 'search'" class="space-y-6">
      <!-- 搜尋條與熱門標籤 -->
      <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 shadow-cosmic">
        <div class="relative mb-4">
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="請輸入您夢到的意象關鍵字 (例如：蛇、掉牙、水、大火、飛翔、狗、棺材、流血...)"
            class="w-full bg-dark-void/80 border-2 border-dark-gold/40 rounded-xl px-4 py-3 pl-11 text-sm text-dark-text placeholder-dark-muted/60 focus:outline-none focus:border-dark-gold transition-colors font-sans"
          />
          <span class="absolute left-4 top-3.5 text-base text-dark-gold">🔍</span>
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute right-4 top-3.5 text-xs text-dark-muted hover:text-dark-text"
          >
            ✕ 清除
          </button>
        </div>

        <!-- 熱門夢境符號快速點選標籤 -->
        <div class="flex flex-wrap items-center gap-1.5 text-xs font-serif">
          <span class="text-dark-muted mr-1">🔥 常見熱搜：</span>
          <button
            v-for="hot in hotKeywords"
            :key="hot"
            @click="selectHotKeyword(hot)"
            class="px-2.5 py-1 rounded-full glass-panel border border-dark-gold/25 text-dark-text/80 hover:text-dark-gold hover:border-dark-gold transition-all text-[11px]"
          >
            {{ hot }}
          </button>
        </div>
      </div>

      <!-- 八大古典夢境大類過濾器 (8 Categories Filter) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <button
          @click="selectCategory(undefined)"
          class="p-2.5 rounded-xl border text-center transition-all flex flex-col items-center"
          :class="[
            selectedCategory === undefined
              ? 'border-dark-gold bg-dark-gold/25 text-dark-gold font-bold shadow-sm'
              : 'glass-panel border-dark-muted/20 text-dark-muted hover:border-dark-gold/40',
          ]"
        >
          <span class="text-sm">🌐</span>
          <span class="text-[11px] font-serif mt-1">全部意象</span>
        </button>

        <button
          v-for="cat in categories"
          :key="cat.key"
          @click="selectCategory(cat.key)"
          class="p-2.5 rounded-xl border text-center transition-all flex flex-col items-center"
          :class="[
            selectedCategory === cat.key
              ? 'border-dark-gold bg-dark-gold/25 text-dark-gold font-bold shadow-sm'
              : 'glass-panel border-dark-muted/20 text-dark-muted hover:border-dark-gold/40',
          ]"
        >
          <span class="text-sm">{{ cat.icon }}</span>
          <span class="text-[11px] font-serif mt-1 truncate w-full">{{ cat.name.slice(0, 4) }}</span>
        </button>
      </div>

      <!-- 檢索結果列表 (Search Results Grid) -->
      <div v-if="filteredEntries.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          v-for="entry in filteredEntries"
          :key="entry.id"
          class="glass-panel rounded-2xl p-5 border border-dark-gold/30 hover:border-dark-gold transition-all duration-300 shadow-cosmic flex flex-col justify-between group"
        >
          <div>
            <!-- 卡片頂部：關鍵字、分類與吉凶標籤 -->
            <div class="flex items-center justify-between border-b border-dark-gold/15 pb-2.5 mb-3">
              <div class="flex items-center space-x-2">
                <h3 class="font-serif text-lg font-bold text-gold-gradient group-hover:text-amber-300 transition-colors">
                  【{{ entry.keyword }}】
                </h3>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-dark-gold/15 text-dark-gold border border-dark-gold/30 font-serif">
                  {{ entry.categoryName }}
                </span>
              </div>
              <span
                class="px-2.5 py-0.5 rounded-full text-xs font-serif font-bold"
                :class="omenBadgeClass(entry.omen)"
              >
                {{ entry.omen }}
              </span>
            </div>

            <!-- 同義詞/別名標籤 -->
            <div class="flex flex-wrap gap-1 mb-3">
              <span
                v-for="alias in entry.aliasKeywords"
                :key="alias"
                class="text-[10px] text-dark-muted bg-black/20 px-1.5 py-0.5 rounded"
              >
                {{ alias }}
              </span>
            </div>

            <!-- 古典《周公解夢》原典 -->
            <div class="bg-black/30 rounded-lg p-3 border border-dark-gold/20 mb-3 text-xs text-amber-200/90 font-serif leading-relaxed">
              <span class="font-bold text-dark-gold block mb-1">📜《周公解夢》原典辭句：</span>
              {{ entry.classicText }}
            </div>

            <!-- 現代白話象徵 -->
            <div class="mb-3">
              <h4 class="text-xs font-serif font-bold text-dark-gold mb-1">💡 通俗吉凶象徵：</h4>
              <p class="text-xs text-dark-text/90 leading-relaxed font-sans">
                {{ entry.vernacularMeaning }}
              </p>
            </div>

            <!-- 榮格心理學原型透析 -->
            <div class="mb-3 bg-indigo-950/20 rounded-lg p-2.5 border border-indigo-500/25">
              <h4 class="text-[11px] font-serif font-bold text-indigo-300 mb-1">🧠 榮格深度心理學原型：</h4>
              <p class="text-xs text-indigo-100/90 leading-relaxed font-sans">
                {{ entry.psychologicalAnalysis }}
              </p>
            </div>

            <!-- 現實調適指南 -->
            <div class="text-xs text-dark-muted leading-relaxed font-serif">
              <strong class="text-dark-gold">🌱 生活指引：</strong>{{ entry.actionAdvice }}
            </div>
          </div>

          <!-- 卡片底部：向 AI 深入提問按鈕 -->
          <div class="border-t border-dark-gold/15 pt-3 mt-4 flex justify-end">
            <button
              @click="askLlmAboutEntry(entry)"
              class="px-3.5 py-1.5 rounded-full text-xs font-serif font-bold bg-dark-gold/15 hover:bg-dark-gold hover:text-dark-void border border-dark-gold/40 text-dark-gold transition-all flex items-center space-x-1"
            >
              <span>✨</span>
              <span>向 AI 解夢名師深入提問</span>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="glass-panel rounded-2xl p-12 text-center text-dark-muted border border-dark-gold/20">
        <div class="text-3xl mb-3">🌙</div>
        <h4 class="font-serif text-base text-dark-gold font-bold mb-1">查無此意象詞條</h4>
        <p class="text-xs">請嘗試更換同義詞，或切換至「長篇夢境交織剖析」直接輸入整段夢境描述！</p>
      </div>
    </div>

    <!-- 模式二：長篇夢境交織多重剖析 (Tab: Scenario Analysis) -->
    <div v-if="activeTab === 'scenario'" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- 左側：輸入夢境情境與插畫 (Input Area) -->
      <div class="lg:col-span-5 glass-panel rounded-2xl p-6 border border-dark-gold/30 shadow-cosmic space-y-4">
        <div class="w-full aspect-[4/3] rounded-xl overflow-hidden border border-dark-gold/30 mb-2 relative group bg-black/40">
          <img
            src="/images/dream/dream_zhougong.jpg"
            alt="周公夜臥古松下超現實夢境插畫"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div class="absolute bottom-2 right-2 bg-dark-void/80 px-2.5 py-1 rounded-full text-[10px] font-serif text-amber-200 border border-dark-gold/40">
            周公解夢 · 夢境迴廊
          </div>
        </div>

        <div>
          <label class="block text-xs font-serif font-bold text-dark-gold mb-1.5">
            📝 請詳細記錄您昨晚夢見的完整場景與情緒感受：
          </label>
          <textarea
            v-model="scenarioInput"
            rows="5"
            placeholder="例如：昨晚夢見自己走在水邊，水面突然大漲，橋邊看見一條巨大的金龍在空中飛翔，隨後自己也長出翅膀飛上了天空... / 夢見自己跟很久沒見的朋友在老家吃飯，突然牙齒掉了一顆還流血..."
            class="w-full bg-dark-void/70 border border-dark-gold/30 rounded-lg p-3 text-xs text-dark-text focus:outline-none focus:border-dark-gold font-sans leading-relaxed"
          ></textarea>
        </div>

        <button
          @click="analyzeScenario"
          :disabled="isAnalyzing"
          class="w-full py-3 rounded-full font-serif font-bold text-sm bg-gradient-to-r from-indigo-600 via-dark-gold to-amber-400 text-dark-void hover:opacity-90 shadow-cosmic transition-all flex items-center justify-center space-x-2"
        >
          <span>🔮</span>
          <span>{{ isAnalyzing ? '意象符號交織解碼中...' : '啟動周公解夢與心理剖析' }}</span>
        </button>
      </div>

      <!-- 右側：交織解碼綜合報告 (Analysis Output) -->
      <div class="lg:col-span-7 flex flex-col space-y-5">
        <div v-if="!scenarioResult" class="glass-panel rounded-2xl p-10 border border-dark-gold/20 text-center text-dark-muted flex flex-col items-center justify-center min-h-[380px]">
          <div class="w-16 h-16 rounded-full border border-dark-gold/30 flex items-center justify-center bg-dark-gold/5 mb-4 text-2xl">
            🔮
          </div>
          <h3 class="font-serif text-lg text-dark-gold font-bold mb-2">等待夢境輸入</h3>
          <p class="text-xs leading-relaxed max-w-xs">
            在左側輸入您昨晚夢到的場景，系統將自動提取夢中多重意象，結合《周公解夢》與榮格心理學為您輸出綜合解讀報告。
          </p>
        </div>

        <!-- 綜合解讀報告卡片 (Comprehensive Synthesis Card) -->
        <div
          v-else
          class="glass-panel rounded-2xl p-6 sm:p-7 border-2 border-dark-gold/40 shadow-cosmic bg-gradient-to-br from-indigo-950/20 via-dark-surface to-dark-void"
        >
          <!-- 報告頂部大盤 -->
          <div class="flex items-center justify-between border-b border-dark-gold/25 pb-3 mb-4">
            <div>
              <span class="text-[10px] font-serif text-dark-muted block">夢境交織綜合評定</span>
              <h3 class="font-serif text-xl sm:text-2xl font-bold text-gold-gradient">
                主導吉凶：【{{ scenarioResult.dominantOmen }}】
              </h3>
            </div>
            <span
              class="px-3.5 py-1 rounded-full text-xs font-serif font-bold"
              :class="omenBadgeClass(scenarioResult.dominantOmen)"
            >
              {{ scenarioResult.dominantOmen }}
            </span>
          </div>

          <!-- 識別出的核心意象標籤 -->
          <div class="mb-4">
            <span class="text-xs font-serif text-dark-muted block mb-1.5">🎯 系統辨識出的核心意象：</span>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="kw in scenarioResult.matchedKeywords"
                :key="kw"
                class="px-3 py-1 rounded-full text-xs font-serif font-bold bg-dark-gold/20 text-dark-gold border border-dark-gold/40"
              >
                # {{ kw }}
              </span>
            </div>
          </div>

          <!-- 周公古典吉凶總覽 -->
          <div class="bg-black/30 rounded-xl p-4 border border-dark-gold/20 mb-4 text-xs font-serif leading-relaxed text-amber-100">
            <strong class="text-dark-gold block mb-1">📜【《周公解夢》古典吉凶總綱】：</strong>
            {{ scenarioResult.synthesis.omenSummary }}
          </div>

          <!-- 榮格深層潛意識心理分析 -->
          <div class="bg-indigo-950/25 rounded-xl p-4 border border-indigo-500/30 mb-4 text-xs leading-relaxed font-sans text-indigo-100/95">
            <strong class="text-indigo-300 block mb-1 font-serif">🧠【榮格深層潛意識心理投射】：</strong>
            {{ scenarioResult.synthesis.psychologicalCore }}
          </div>

          <!-- 現實生活行動指引 -->
          <div class="bg-emerald-950/20 rounded-xl p-4 border border-emerald-500/30 mb-5 text-xs leading-relaxed font-sans text-emerald-100/90">
            <strong class="text-emerald-300 block mb-1 font-serif">🌱【生活調適與行動指引】：</strong>
            {{ scenarioResult.synthesis.actionGuidance }}
          </div>

          <!-- 測算日記與後續引導 -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-dark-gold/20 pt-4">
            <button
              @click="saveDreamJournal"
              :disabled="savingJournal || journalSaved"
              class="px-5 py-2 rounded-full border border-dark-gold/50 text-dark-gold hover:bg-dark-gold/15 text-xs font-serif font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center space-x-1"
            >
              <span>{{ journalSaved ? '✅ 已存入靈驗日記' : savingJournal ? '儲存中...' : '💾 儲存夢境至測算日記' }}</span>
            </button>
            <button
              @click="askLlmAboutScenario"
              class="px-6 py-2.5 rounded-full font-serif font-bold text-xs bg-dark-gold text-dark-void hover:opacity-90 shadow-cosmic transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <span>✨</span>
              <span>召喚 AI 周公解夢大師深度探詢</span>
            </button>
          </div>

          <!-- 命理閉環指引 -->
          <div class="p-3.5 rounded-xl bg-black/40 border border-dark-gold/15 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <span class="text-dark-muted">🌙 夜夢通幽，白日依天時而動：</span>
            <div class="flex items-center space-x-2">
              <router-link to="/almanac" class="text-dark-gold font-bold hover:underline">查今日黃曆 📅</router-link>
              <span class="text-dark-muted/40">·</span>
              <router-link to="/planner" class="text-dark-gold font-bold hover:underline">流年生活行運曆 🗓️</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  searchDreamDictionary,
  interpretDreamScenario,
  getAllDreamCategories,
  DreamCategory,
  DreamEntry,
  DreamAnalysisResult,
} from '@celestial/astro-core';
import { useLlmStore } from '../stores/llm.js';
import { useAuthStore } from '../stores/auth.js';

const llmStore = useLlmStore();
const authStore = useAuthStore();

const activeTab = ref<'search' | 'scenario'>('search');

const searchQuery = ref('');
const selectedCategory = ref<DreamCategory | undefined>(undefined);
const categories = getAllDreamCategories();

const hotKeywords = ['蛇', '花開', '樹木', '掉牙', '大水', '飛翔', '火', '狗', '貓', '死人', '棺材', '流血', '懷孕', '黃金', '被追趕', '神佛', '遲到', '迷路'];

const searchResult = ref(searchDreamDictionary(''));
const savingJournal = ref(false);
const journalSaved = ref(false);

const filteredEntries = computed(() => {
  return searchResult.value.matchedEntries;
});

function handleSearch() {
  searchResult.value = searchDreamDictionary(searchQuery.value, selectedCategory.value);
}

function selectCategory(cat?: DreamCategory) {
  selectedCategory.value = cat;
  handleSearch();
}

function selectHotKeyword(kw: string) {
  searchQuery.value = kw;
  handleSearch();
}

function clearSearch() {
  searchQuery.value = '';
  handleSearch();
}

// 模式二：夢境情境剖析
const scenarioInput = ref('昨晚夢見自己走在水邊，水面突然大漲發大水，橋邊有一條巨大的金龍在空中飛翔，隨後自己也長出翅膀飛上了天空！');
const isAnalyzing = ref(false);
const scenarioResult = ref<DreamAnalysisResult | null>(null);

async function analyzeScenario() {
  if (isAnalyzing.value) return;
  isAnalyzing.value = true;
  journalSaved.value = false;

  // 模擬運算感知 600ms
  await new Promise((r) => setTimeout(r, 600));

  scenarioResult.value = interpretDreamScenario(scenarioInput.value);
  isAnalyzing.value = false;
}

function omenBadgeClass(omen: string) {
  if (omen === '大吉') return 'bg-red-500/20 text-red-300 border border-red-500/40';
  if (omen === '吉' || omen === '中吉') return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
  if (omen === '平吉') return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
  if (omen === '平') return 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
  if (omen === '吉帶凶') return 'bg-purple-500/20 text-purple-300 border border-purple-500/40';
  return 'bg-rose-900/40 text-rose-300 border border-rose-500/40';
}

async function saveDreamJournal() {
  if (!scenarioResult.value || savingJournal.value) return;
  savingJournal.value = true;
  try {
    const headers = await authStore.getAuthHeaders();
    const res = scenarioResult.value;
    const response = await fetch('/api/v1/readings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        moduleType: 'DREAM',
        inputSnapshot: {
          scenario: scenarioInput.value,
        },
        chartOutput: res,
        aiSummary: `周公解夢：夢境交織【${res.matchedKeywords.join('、')}】（${res.dominantOmen}）· 情節：「${scenarioInput.value.slice(0, 40)}...」`,
      }),
    });
    const data = await response.json();
    if (data.success) {
      journalSaved.value = true;
    } else {
      alert(data.message || '儲存日記失敗');
    }
  } catch (err: any) {
    alert(err.message || '連線伺服器異常，無法儲存日記');
  } finally {
    savingJournal.value = false;
  }
}

function askLlmAboutEntry(entry: DreamEntry) {
  const prompt = `我夢見了【${entry.keyword}】（所屬大類：${entry.categoryName}，吉凶評定：${entry.omen}）。《周公解夢》原典載：「${entry.classicText}」。請周公解夢與心理分析專家為我深入剖析此夢境意象在現實生活中的心理投射與吉凶預兆，並指導我該如何調適身心！`;

  llmStore.openAssistantWithContext({
    moduleType: 'DREAM',
    title: `周公解夢 · 【${entry.keyword}】`,
    summary: `夢境意象：${entry.keyword}（${entry.omen} · ${entry.categoryName}）`,
    rawData: {
      keyword: entry.keyword,
      category: entry.category,
      categoryName: entry.categoryName,
      omen: entry.omen,
      classicText: entry.classicText,
      vernacularMeaning: entry.vernacularMeaning,
      psychologicalAnalysis: entry.psychologicalAnalysis,
      actionAdvice: entry.actionAdvice,
    },
    initialPrompt: prompt,
  });
}

function askLlmAboutScenario() {
  if (!scenarioResult.value) return;
  const res = scenarioResult.value;
  const prompt = `我做了一個夢：「${scenarioInput.value}」。系統辨識出核心意象：【${res.matchedKeywords.join('、')}】，主導吉凶為【${res.dominantOmen}】。周公原典提要為：${res.synthesis.omenSummary}。請周公解夢與榮格心理學專家為我進行多重意象交織的深度潛意識對話，指點迷津！`;

  llmStore.openAssistantWithContext({
    moduleType: 'DREAM',
    title: `夢境交織剖析 · 【${res.matchedKeywords.slice(0, 3).join('·')}】`,
    summary: `夢境多重意象（主導吉凶: ${res.dominantOmen}）：${res.matchedKeywords.join('、')}`,
    rawData: res,
    initialPrompt: prompt,
  });
}
</script>
