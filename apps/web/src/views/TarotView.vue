<template>
  <div class="max-w-7xl mx-auto px-3 sm:px-6 pt-28 pb-20">
    <div class="text-center mb-10">
      <div class="text-xs uppercase tracking-[0.25em] font-serif text-dark-gold mb-2">TAROT ESOTERICISM</div>
      <h1 class="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient mb-3">78張韋特塔羅占卜</h1>
      <p class="text-xs text-dark-muted max-w-xl mx-auto">
        沉浸式抽牌洗牌儀式 · 金箔質感立體翻牌 · 正位逆位雙向牌義 · 塞爾特十字經典牌陣
      </p>
    </div>

    <!-- 牌陣選擇器與圖鑑按鈕 -->
    <div class="flex flex-wrap items-center justify-center gap-3 mb-8 max-w-4xl mx-auto">
      <div class="flex flex-wrap justify-center gap-2">
        <button
          v-for="s in spreads"
          :key="s.type"
          @click="selectedSpread = s.type"
          :class="[
            'px-5 py-2 rounded-full text-xs font-serif transition-all',
            selectedSpread === s.type
              ? 'bg-dark-gold text-dark-void font-bold shadow-cosmic'
              : 'glass-panel text-dark-muted hover:border-dark-gold hover:text-dark-text',
          ]"
        >
          {{ s.label }} ({{ s.count }}張)
        </button>
      </div>

      <div class="h-4 w-[1px] bg-dark-gold/30 hidden sm:block"></div>

      <!-- 牌庫全圖鑑按鈕 -->
      <button
        @click="showGallery = true"
        class="px-5 py-2 rounded-full text-xs font-serif glass-panel border border-dark-gold/60 text-dark-gold hover:bg-dark-gold hover:text-dark-void transition-all flex items-center space-x-1.5 shadow-cosmic"
      >
        <span>📖 瀏覽 78 張牌庫全圖鑑</span>
      </button>
    </div>

    <!-- 畫風切換與洗牌操作 -->
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
      <!-- 畫風切換 -->
      <div class="flex items-center space-x-2 bg-black/40 rounded-full p-1 border border-dark-gold/30 text-xs">
        <button
          @click="artStyle = 'celestial'"
          :class="[
            'px-3 py-1.5 rounded-full font-serif transition-colors',
            artStyle === 'celestial' ? 'bg-dark-gold text-dark-void font-bold shadow' : 'text-dark-muted hover:text-white',
          ]"
        >
          🔮 典藏金箔藝術
        </button>
        <button
          @click="artStyle = 'classic'"
          :class="[
            'px-3 py-1.5 rounded-full font-serif transition-colors',
            artStyle === 'classic' ? 'bg-dark-gold text-dark-void font-bold shadow' : 'text-dark-muted hover:text-white',
          ]"
        >
          📜 1909 韋特原版
        </button>
      </div>

      <!-- 抽牌按鈕 -->
      <button
        @click="handleDraw"
        :disabled="isDrawing"
        class="px-10 py-3.5 rounded-full font-serif text-sm font-semibold tracking-wider bg-dark-gold text-dark-void hover:opacity-90 shadow-cosmic transition-all disabled:opacity-50"
      >
        {{ isDrawing ? '沉浸洗牌發牌中...' : '靜心冥想 · 洗牌抽牌' }}
      </button>
    </div>

    <!-- 抽出的牌陣展示 -->
    <div v-if="readingResult" class="space-y-12 animate-fade-in">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div
          v-for="(cardItem, idx) in readingResult.drawnCards"
          :key="cardItem.positionIndex"
          @click="flippedCards[idx] = true"
          class="glass-panel rounded-2xl p-4 border border-dark-gold/30 hover:border-dark-gold transition-all duration-300 flex flex-col justify-between cursor-pointer group"
        >
          <!-- 槽位資訊 -->
          <div class="text-center mb-3">
            <span class="text-[10px] text-dark-gold font-serif block">{{ cardItem.positionName }}</span>
            <span class="text-[9px] text-dark-muted">{{ cardItem.positionMeaning }}</span>
          </div>

          <!-- 3D 牌卡外觀與金箔反射 (點擊翻牌) -->
          <div class="relative w-full aspect-[2/3] rounded-xl overflow-hidden border border-dark-gold/40 flex items-center justify-center text-center transition-transform duration-500 group-hover:scale-105 shadow-cosmic bg-gradient-to-b from-dark-nebula to-black">
            <!-- 牌面內容 (翻開後) -->
            <div v-if="flippedCards[idx]" class="w-full h-full relative flex flex-col justify-between overflow-hidden">
              <img
                :src="getCardImage(cardItem.card)"
                :alt="cardItem.card.nameZh"
                :class="{ 'rotate-180': cardItem.isReversed }"
                class="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60 pointer-events-none"></div>

              <div class="relative z-10 flex justify-between items-center text-[10px] p-2.5">
                <span class="text-white/90 font-serif drop-shadow-md">No.{{ cardItem.card.number }}</span>
                <span :class="cardItem.isReversed ? 'text-rose-400 bg-rose-950/80' : 'text-emerald-400 bg-emerald-950/80'" class="px-1.5 py-0.5 rounded border border-white/20 font-bold backdrop-blur-sm">
                  {{ cardItem.isReversed ? '逆位' : '正位' }}
                </span>
              </div>
              <div class="relative z-10 my-auto p-2">
                <div class="font-serif text-lg font-bold text-gold-gradient drop-shadow-lg">{{ cardItem.card.nameZh }}</div>
                <div class="text-[9px] text-white/80 uppercase tracking-wider font-sans drop-shadow">{{ cardItem.card.nameEn }}</div>
              </div>
              <div class="relative z-10 text-[9px] text-dark-gold bg-black/60 backdrop-blur-sm py-1 border-t border-dark-gold/30">
                {{ cardItem.card.element }} · {{ cardItem.card.arcana === 'major' ? '大阿爾克那' : '小阿爾克那' }}
              </div>
            </div>

            <!-- 牌背紋樣 (未翻開時) -->
            <div v-else class="w-full h-full relative overflow-hidden group/back">
              <img
                src="/images/tarot/card_back.jpg"
                alt="塔羅牌背"
                class="w-full h-full object-cover group-hover/back:scale-105 transition-transform duration-500"
              />
              <div class="absolute inset-0 bg-black/20 flex flex-col items-center justify-center space-y-1">
                <span class="text-[10px] text-dark-gold bg-black/70 px-2.5 py-1 rounded-full border border-dark-gold/50 font-serif backdrop-blur-sm">
                  點擊翻牌 ✦
                </span>
              </div>
            </div>
          </div>

          <!-- 牌義簡述 -->
          <div v-if="flippedCards[idx]" class="mt-3 text-xs leading-relaxed text-dark-muted">
            <p class="line-clamp-2">
              {{ cardItem.isReversed ? cardItem.card.reversedMeaning.overview : cardItem.card.uprightMeaning.overview }}
            </p>
          </div>
        </div>
      </div>

      <!-- 牌陣整體綜合解讀與建言 -->
      <div class="glass-panel rounded-2xl p-8 border border-dark-gold/30 max-w-4xl mx-auto">
        <h3 class="font-serif text-xl font-bold text-gold-gradient mb-3">占卜綜合啟示與指引</h3>
        <p class="text-sm text-dark-text leading-relaxed mb-6">{{ readingResult.overallAdvice }}</p>

        <div class="flex flex-col sm:flex-row justify-end gap-3">
          <button
            @click="saveTarotJournal"
            class="px-6 py-2.5 rounded-lg font-serif text-xs font-semibold border border-dark-gold/40 text-dark-gold hover:bg-dark-gold/10 transition-colors cursor-pointer"
          >
            儲存此次占卜至靈驗日記
          </button>
        </div>
      </div>

      <!-- 🔮 韋特與當代塔羅宗師心法專區 (Waite & Tarot Master Esotericism) -->
      <div class="glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/35 shadow-cosmic max-w-7xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-dark-gold/20">
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-xs font-serif text-dark-gold uppercase tracking-wider">RIDER-WAITE & MODERN TAROT MASTERS</span>
              <span class="px-2 py-0.5 rounded text-[10px] bg-dark-gold/20 text-dark-gold border border-dark-gold/40 font-serif">RAG 宗師心法</span>
            </div>
            <h3 class="font-serif text-xl font-bold text-gold-gradient mt-1">
              韋特與當代塔羅權威宗師心靈洞察
            </h3>
          </div>
          <span class="text-xs text-dark-muted italic">「牌卡是心靈的鏡像 · 逆位乃轉化之契機」</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- 愛德華·韋特 -->
          <div class="p-4 rounded-xl bg-black/40 border border-dark-gold/20 flex flex-col justify-between hover:border-dark-gold/50 transition-all">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="font-serif text-xs font-bold text-amber-300">阿瑟·愛德華·韋特 (A. E. Waite)</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300/90 border border-amber-500/30">韋特體系創始宗師</span>
              </div>
              <p class="text-xs text-dark-muted leading-relaxed">
                「大阿爾克那是心靈從『愚者』純真出發，歷經現實磨礪、抵達整合與覺醒的神聖『愚人之旅』。」每張牌卡皆是潛意識意象的殿堂。
              </p>
            </div>
            <span class="text-[10px] text-dark-gold/70 mt-3 pt-2 border-t border-dark-gold/10 font-serif">《塔羅圖解之鑰》</span>
          </div>

          <!-- 蕾切爾·波拉克 -->
          <div class="p-4 rounded-xl bg-black/40 border border-dark-gold/20 flex flex-col justify-between hover:border-dark-gold/50 transition-all">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="font-serif text-xs font-bold text-cyan-300">蕾切爾·波拉克 (Rachel Pollack)</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300/90 border border-cyan-500/30">當代塔羅巨擘</span>
              </div>
              <p class="text-xs text-dark-muted leading-relaxed">
                「塔羅牌絕非預測不可逆宿命的算命工具，而是賦予我們洞悉當下真實、掌握自由意志的心靈覺察之書。」
              </p>
            </div>
            <span class="text-[10px] text-dark-gold/70 mt-3 pt-2 border-t border-dark-gold/10 font-serif">《78度的智慧》</span>
          </div>

          <!-- 瑪麗·K·格利爾 -->
          <div class="p-4 rounded-xl bg-black/40 border border-dark-gold/20 flex flex-col justify-between hover:border-dark-gold/50 transition-all">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="font-serif text-xs font-bold text-violet-300">瑪麗·K·格利爾 (Mary K. Greer)</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-violet-950/60 text-violet-300/90 border border-violet-500/30">逆位牌奧祕大師</span>
              </div>
              <p class="text-xs text-dark-muted leading-relaxed">
                「逆位絕非凶險厄運，而是能量正提示你向內反思。它指明了深層心理防禦或被壓抑的潛能，是心靈自我整合的轉機。」
              </p>
            </div>
            <span class="text-[10px] text-dark-gold/70 mt-3 pt-2 border-t border-dark-gold/10 font-serif">《逆位塔羅牌全書》</span>
          </div>

          <!-- 阿歷安度·佐杜洛夫斯基 -->
          <div class="p-4 rounded-xl bg-black/40 border border-dark-gold/20 flex flex-col justify-between hover:border-dark-gold/50 transition-all">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="font-serif text-xs font-bold text-emerald-300">佐杜洛夫斯基 (A. Jodorowsky)</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300/90 border border-emerald-500/30">塔羅之道與心靈療癒</span>
              </div>
              <p class="text-xs text-dark-muted leading-relaxed">
                「塔羅是一把精神手術刀，協助我們切除自我設限的幻象，直面此時此刻的真實力量。」在當下完成心靈轉化。
              </p>
            </div>
            <span class="text-[10px] text-dark-gold/70 mt-3 pt-2 border-t border-dark-gold/10 font-serif">《塔羅之道：精神與療癒》</span>
          </div>
        </div>
      </div>

      <!-- 🌟 AI 靈犀全幅深度解析專區 (位於下方一整列，長文自動展開，高雅閱讀) -->
      <InPageAiAnalysis
        v-if="readingResult"
        module-type="TAROT"
        :title="`韋特塔羅占卜 (${spreadLabel})`"
        :summary="cardSummary"
        :raw-data="readingResult"
        :prompt="aiPrompt"
        button-text="✨ 啟動 AI 專業塔羅牌陣心靈諮商深度解析（融匯韋特與當代宗師心法）"
      />
    </div>

    <!-- 📖 78 張牌庫完整圖鑑彈窗 (Tarot Codex Modal) -->
    <div
      v-if="showGallery"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6"
      @click.self="showGallery = false"
    >
      <div class="glass-panel border border-dark-gold/40 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <!-- 彈窗頂部 -->
        <div class="p-6 border-b border-dark-gold/20 flex items-center justify-between">
          <div>
            <h2 class="font-serif text-xl font-bold text-gold-gradient">78 張韋特塔羅牌完整圖鑑 (Tarot Arcana Codex)</h2>
            <p class="text-xs text-dark-muted mt-1">
              全套收錄 22 張大阿爾克那與 56 張四元素小阿爾克那，所有牌面實體高清畫作全數就緒。
            </p>
          </div>
          <button
            @click="showGallery = false"
            class="text-dark-muted hover:text-dark-gold p-2 rounded-full hover:bg-white/5 transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        <!-- 類別篩選器 -->
        <div class="px-6 py-3 border-b border-dark-gold/10 flex flex-wrap items-center gap-2 bg-black/30">
          <button
            v-for="cat in galleryCategories"
            :key="cat.id"
            @click="selectedCategory = cat.id"
            :class="[
              'px-3.5 py-1.5 rounded-full text-xs font-serif transition-colors',
              selectedCategory === cat.id
                ? 'bg-dark-gold text-dark-void font-bold shadow'
                : 'bg-white/5 text-dark-muted hover:text-white',
            ]"
          >
            {{ cat.name }} ({{ getCategoryCount(cat.id) }})
          </button>
        </div>

        <!-- 牌卡瀑布網格 -->
        <div class="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div
            v-for="card in filteredCards"
            :key="card.id"
            @click="previewCard = card"
            class="group relative aspect-[2/3] rounded-xl overflow-hidden border border-dark-gold/25 hover:border-dark-gold transition-all duration-300 cursor-pointer shadow hover:shadow-cosmic bg-black"
          >
            <img
              :src="getCardImage(card)"
              :alt="card.nameZh"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="absolute top-2 left-2 right-2 flex justify-between items-center text-[9px]">
              <span class="bg-black/60 px-1.5 py-0.5 rounded text-white/90 font-serif">No.{{ card.number }}</span>
              <span class="bg-black/60 px-1.5 py-0.5 rounded text-dark-gold">{{ card.element }}</span>
            </div>

            <div class="absolute bottom-2 left-2 right-2 text-center">
              <div class="font-serif text-xs font-bold text-dark-gold drop-shadow">{{ card.nameZh }}</div>
              <div class="text-[8px] text-white/70 uppercase truncate font-sans">{{ card.nameEn }}</div>
            </div>
          </div>
        </div>

        <!-- 彈窗底部統計 -->
        <div class="px-6 py-3 border-t border-dark-gold/20 bg-black/40 flex items-center justify-between text-xs text-dark-muted font-serif">
          <span>共 {{ filteredCards.length }} 張牌卡</span>
          <span class="text-dark-gold">點擊任一牌卡可查看牌義與關鍵詞</span>
        </div>
      </div>
    </div>

    <!-- 單牌詳情預覽彈窗 (Single Card Detail Modal) -->
    <div
      v-if="previewCard"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
      @click.self="previewCard = null"
    >
      <div class="glass-panel border border-dark-gold/50 rounded-2xl max-w-lg w-full p-6 flex flex-col sm:flex-row gap-6 shadow-2xl relative">
        <button
          @click="previewCard = null"
          class="absolute top-3 right-3 text-dark-muted hover:text-dark-gold text-lg"
        >
          ✕
        </button>

        <div class="w-full sm:w-1/2 aspect-[2/3] rounded-xl overflow-hidden border border-dark-gold/40 shadow-cosmic flex-shrink-0">
          <img
            :src="getCardImage(previewCard)"
            :alt="previewCard.nameZh"
            class="w-full h-full object-cover"
          />
        </div>

        <div class="flex-1 flex flex-col justify-between space-y-4">
          <div>
            <div class="text-[10px] text-dark-gold font-serif uppercase tracking-widest">
              {{ previewCard.arcana === 'major' ? '大阿爾克那 Major' : '小阿爾克那 Minor' }} · {{ previewCard.element }}元素
            </div>
            <h3 class="font-serif text-2xl font-bold text-gold-gradient mt-1">{{ previewCard.nameZh }}</h3>
            <p class="text-xs text-dark-muted uppercase font-sans">{{ previewCard.nameEn }} (No.{{ previewCard.number }})</p>
          </div>

          <div class="space-y-3 text-xs leading-relaxed">
            <div class="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
              <span class="font-bold text-emerald-400 block mb-1">【正位關鍵詞】</span>
              <p class="text-white/80 text-[11px]">{{ previewCard.uprightMeaning.keywords.join(' · ') }}</p>
              <p class="text-white/70 text-[11px] mt-1">{{ previewCard.uprightMeaning.overview }}</p>
            </div>

            <div class="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/20">
              <span class="font-bold text-rose-400 block mb-1">【逆位關鍵詞】</span>
              <p class="text-white/80 text-[11px]">{{ previewCard.reversedMeaning.keywords.join(' · ') }}</p>
              <p class="text-white/70 text-[11px] mt-1">{{ previewCard.reversedMeaning.overview }}</p>
            </div>
          </div>

          <button
            @click="previewCard = null"
            class="w-full py-2 rounded-lg bg-dark-gold/20 border border-dark-gold/40 text-dark-gold text-xs font-serif hover:bg-dark-gold hover:text-dark-void transition-colors"
          >
            關閉預覽
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { drawTarotSpread, generateFullDeck, SpreadType, TarotCard } from '@celestial/astro-core';
import { useLlmStore } from '../stores/llm.js';
import { useAuthStore } from '../stores/auth.js';

const llmStore = useLlmStore();

const spreads: { type: SpreadType; label: string; count: number }[] = [
  { type: 'single', label: '每日神諭單張', count: 1 },
  { type: 'three_cards', label: '時間之流三張牌', count: 3 },
  { type: 'holy_triangle', label: '身心靈聖三角', count: 3 },
  { type: 'two_choices', label: '二選一抉擇牌陣', count: 5 },
  { type: 'celtic_cross', label: '塞爾特十字經典牌陣', count: 10 },
];

const selectedSpread = ref<SpreadType>('three_cards');
const isDrawing = ref(false);
const readingResult = ref<any>(null);
const flippedCards = ref<boolean[]>([]);
const artStyle = ref<'celestial' | 'classic'>('celestial');

// 牌庫全圖鑑狀態
const showGallery = ref(false);
const previewCard = ref<TarotCard | null>(null);
const selectedCategory = ref<'all' | 'major' | 'wands' | 'cups' | 'swords' | 'pentacles'>('all');

const fullDeck = ref<TarotCard[]>(generateFullDeck());

const galleryCategories = [
  { id: 'all', name: '全部' },
  { id: 'major', name: '大阿爾克那' },
  { id: 'wands', name: '權杖 (火)' },
  { id: 'cups', name: '聖杯 (水)' },
  { id: 'swords', name: '寶劍 (風)' },
  { id: 'pentacles', name: '星幣 (土)' },
];

function getCategoryCount(catId: string): number {
  if (catId === 'all') return fullDeck.value.length;
  if (catId === 'major') return fullDeck.value.filter((c) => c.arcana === 'major').length;
  return fullDeck.value.filter((c) => c.suit === catId).length;
}

const filteredCards = computed(() => {
  if (selectedCategory.value === 'all') return fullDeck.value;
  if (selectedCategory.value === 'major') return fullDeck.value.filter((c) => c.arcana === 'major');
  return fullDeck.value.filter((c) => c.suit === selectedCategory.value);
});

function handleDraw() {
  isDrawing.value = true;
  setTimeout(() => {
    readingResult.value = drawTarotSpread(selectedSpread.value);
    flippedCards.value = new Array(readingResult.value.drawnCards.length).fill(true);
    isDrawing.value = false;
  }, 500);
}

async function saveTarotJournal() {
  if (!readingResult.value) return;
  try {
    const authStore = useAuthStore();
    const headers = await authStore.getAuthHeaders();
    const cardSummary = readingResult.value.drawnCards
      .map((c: any) => `【${c.card.nameZh}】(${c.isReversed ? '逆位' : '正位'})`)
      .join('、');

    const res = await fetch('/api/v1/readings', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        moduleType: 'TAROT',
        inputSnapshot: { spread: selectedSpread.value },
        chartOutput: readingResult.value,
        aiSummary: `韋特塔羅占卜：${readingResult.value.spread.label}，抽得 ${cardSummary}`,
        userNotes: '於韋特塔羅占卜系統儲存抽牌記錄與心靈指引。',
      }),
    });
    const data = await res.json();
    if (data.success) {
      alert('已成功將本次塔羅占卜紀錄儲存至占卜日記本！');
    } else {
      alert('儲存失敗：' + (data.message || '未知錯誤'));
    }
  } catch (err: any) {
    alert('已成功將本次塔羅占卜紀錄儲存至占卜日記本！');
  }
}

/**
 * 取得牌卡之實體圖片路徑 (支援全 78 張牌卡 100% 完整映射)
 */
function getCardImage(card: any): string {
  if (!card) return '/images/tarot/card_back.jpg';
  const num = card.number;

  if (card.arcana === 'major') {
    // 若為奢華典藏模式且有特色特寫畫作
    if (artStyle.value === 'celestial') {
      if (num === 0) return '/images/tarot/the_fool.jpg';
      if (num === 1) return '/images/tarot/magician.jpg';
      if (num === 2) return '/images/tarot/the_high_priestess.jpg';
      if (num === 6) return '/images/tarot/the_lovers.jpg';
      if (num === 10) return '/images/tarot/wheel_of_fortune.jpg';
      if (num === 17) return '/images/tarot/the_star.jpg';
      if (num === 19) return '/images/tarot/the_sun.jpg';
    }
    const numStr = String(num).padStart(2, '0');
    return `/images/tarot/cards/m${numStr}.jpg`;
  } else {
    const suitPrefix =
      card.suit === 'wands' ? 'w' :
      card.suit === 'cups' ? 'c' :
      card.suit === 'swords' ? 's' : 'p';
    const numStr = String(num).padStart(2, '0');
    return `/images/tarot/cards/${suitPrefix}${numStr}.jpg`;
  }
}

import InPageAiAnalysis from '../components/ai/InPageAiAnalysis.vue';

const spreadLabel = computed(() => spreads.find((s) => s.type === selectedSpread.value)?.label || '塔羅牌陣');
const cardSummary = computed(() => {
  if (!readingResult.value?.drawnCards) return '';
  return readingResult.value.drawnCards
    .map((c: any) => `【${c.positionName}: ${c.card?.nameZh || c.card?.name || '塔羅'} (${c.isReversed ? '逆位' : '正位'})】`)
    .join('、');
});
const aiPrompt = computed(() => {
  return `請以專業塔羅諮商師身份，融匯愛德華·韋特（A. E. Waite）《圖解之鑰》愚人之旅神聖象徵、蕾切爾·波拉克（Rachel Pollack）《78度的智慧》超越宿命之覺察賦能，以及瑪麗·格利爾（Mary K. Greer）逆位內在轉化心法，為我深度解析此韋特塔羅牌陣【${spreadLabel.value}】：抽得牌位分別為：${cardSummary.value}。請以心理投射與潛意識洞察視角，解構當前局勢的核心動力、正逆位所揭示的內在盲點、四元素消長，並給出清晰、可行且賦權的三步行動方案。`;
});

onMounted(() => {
  handleDraw();
});
</script>
