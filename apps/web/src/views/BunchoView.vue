<template>
  <div class="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
    <!-- 頂部標題與文化底蘊介紹 -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full border border-dark-gold/30 bg-dark-gold/10 text-dark-gold text-xs font-serif mb-3 shadow-cosmic">
        <span>🐦</span>
        <span>靈雀神諭 · 台灣傳統鳥卦與日式文鳥籤</span>
      </div>
      <h1 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gold-gradient mb-3">
        靈雀銜春 · 文鳥占卜抽籤
      </h1>
      <p class="text-xs sm:text-sm text-dark-muted max-w-2xl mx-auto leading-relaxed">
        融匯東方鳥卦靈禽通天機之感應與日式文鳥おみくじ治癒美學。澄澈空靈之白文鳥，為您在 28 宿靈籤陣中親銜命定神籤，指引迷津。
      </p>
    </div>

    <!-- 主展示舞台 (Interactive Buncho Divination Stage) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- 左側/上方：文鳥互動鳥籠與抽籤示意動態舞台 (Stage View) -->
      <div class="lg:col-span-7 glass-panel rounded-2xl p-6 border border-dark-gold/30 shadow-cosmic relative overflow-hidden flex flex-col items-center text-center">
        <!-- 頂部狀態標籤 -->
        <div class="w-full flex items-center justify-between border-b border-dark-gold/15 pb-3 mb-4">
          <div class="flex items-center space-x-2">
            <span class="w-2.5 h-2.5 rounded-full animate-pulse" :class="phaseDotClass"></span>
            <span class="font-serif text-xs font-bold text-dark-gold">{{ currentPhaseTitle }}</span>
          </div>
          <span class="text-[11px] font-mono text-dark-muted">28 宿靈雀籤陣 · 程式隨機洗籤</span>
        </div>

        <!-- 示意插畫畫面 (Dynamic Illustration View) -->
        <div class="relative w-full max-w-md aspect-[4/3] rounded-xl overflow-hidden border border-dark-gold/30 shadow-inner group mb-5 bg-black/40">
          <!-- 圖片 1：鳥籠靜候 (Cage Ready) -->
          <img
            v-if="['idle', 'praying', 'cage_opening'].includes(drawPhase)"
            src="/images/buncho/buncho_cage_ready.jpg"
            alt="白文鳥於鳥籠內棲木靜候祈願"
            class="w-full h-full object-cover transition-all duration-700"
            :class="{ 'scale-105 filter brightness-110': drawPhase === 'praying' }"
          />

          <!-- 圖片 2：文鳥出籠叼籤呈遞 (Picking & Delivering) -->
          <img
            v-else
            src="/images/buncho/buncho_picking_lot.jpg"
            alt="白文鳥輕巧跳出籠門銜起描金靈籤"
            class="w-full h-full object-cover transition-all duration-700 animate-fade-in"
          />

          <!-- 動態疊加光暈與動畫進度提示條 -->
          <div
            v-if="isDrawing"
            class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col items-center justify-end p-4 transition-opacity duration-300"
          >
            <div class="w-full bg-dark-void/70 rounded-full h-2 border border-dark-gold/40 overflow-hidden mb-2">
              <div
                class="bg-gradient-to-r from-dark-gold to-amber-300 h-full transition-all duration-300 ease-out"
                :style="{ width: `${animationProgress}%` }"
              ></div>
            </div>
            <p class="text-xs text-amber-200 font-serif font-bold tracking-wider animate-pulse">
              {{ animationNarrative }}
            </p>
            <button
              @click.stop="skipRitual"
              type="button"
              class="mt-2 text-[11px] text-dark-gold hover:text-yellow-300 underline font-sans transition-colors cursor-pointer"
            >
              ⚡ 略過動畫，直接啟封神籤
            </button>
          </div>

          <!-- 展開籤牌徽章標籤 (若已抽出) -->
          <div
            v-if="drawPhase === 'revealed' && currentResult"
            class="absolute top-3 right-3 bg-dark-void/85 border border-dark-gold/70 px-3 py-1 rounded-full backdrop-blur-md shadow-cosmic flex items-center space-x-1.5"
          >
            <span class="text-xs">🕊️</span>
            <span class="text-xs font-serif font-bold text-dark-gold">{{ currentResult.lot.luckLevel }}</span>
          </div>
        </div>

        <!-- 示意過程五步時間軸 (Visual Steps Indicator) -->
        <div class="w-full grid grid-cols-5 gap-1.5 text-[10px] font-serif border-t border-dark-gold/15 pt-3">
          <div
            v-for="(st, i) in stepList"
            :key="i"
            class="p-1 rounded text-center transition-all"
            :class="[
              currentStepIndex === i
                ? 'bg-dark-gold/25 text-dark-gold font-bold border border-dark-gold/60 scale-105'
                : currentStepIndex > i
                ? 'text-dark-text/90 opacity-80'
                : 'text-dark-muted/50',
            ]"
          >
            <div class="text-xs mb-0.5">{{ st.icon }}</div>
            <div class="leading-tight truncate">{{ st.name }}</div>
          </div>
        </div>

        <!-- 祈願與抽籤控制區 (Form & Trigger) -->
        <div v-if="drawPhase === 'idle'" class="w-full mt-5 space-y-4 text-left">
          <div>
            <label class="block text-xs font-serif font-bold text-dark-gold mb-1">
              ① 選擇您想請教文鳥的問事面向
            </label>
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <button
                v-for="asp in aspectOptions"
                :key="asp.key"
                type="button"
                @click="selectedAspect = asp.key"
                class="px-2 py-1.5 rounded-lg border text-xs font-serif transition-all flex flex-col items-center"
                :class="[
                  selectedAspect === asp.key
                    ? 'border-dark-gold bg-dark-gold/25 text-dark-gold font-bold shadow-cosmic'
                    : 'glass-panel border-dark-muted/30 text-dark-muted hover:border-dark-gold/40',
                ]"
              >
                <span>{{ asp.icon }}</span>
                <span class="mt-0.5">{{ asp.label }}</span>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-serif font-bold text-dark-gold mb-1">
              ② 心中默想您的具體問題或當前心結 (選填)
            </label>
            <input
              v-model="questionInput"
              type="text"
              maxlength="60"
              placeholder="例如：今年下半年是否適合轉職？ / 與他這段感情走向如何？"
              class="w-full bg-dark-void/70 border border-dark-gold/30 rounded-lg px-3 py-2 text-xs text-dark-text placeholder-dark-muted/50 focus:outline-none focus:border-dark-gold transition-colors font-sans"
            />
          </div>

          <button
            @click="startDivination"
            :disabled="isDrawing"
            class="w-full py-3 rounded-full font-serif font-bold text-sm bg-gradient-to-r from-dark-gold to-amber-400 text-dark-void hover:opacity-95 transition-all shadow-cosmic flex items-center justify-center space-x-2"
          >
            <span>🔀</span>
            <span>誠心開籠 · 祈請文鳥抽籤</span>
          </button>
        </div>

        <!-- 重新抽籤按鈕 (若已揭曉) -->
        <div v-if="drawPhase === 'revealed'" class="w-full mt-4 flex items-center justify-center space-x-3">
          <button
            @click="resetDivination"
            class="px-5 py-2 rounded-full glass-panel border border-dark-gold/40 text-dark-gold hover:border-dark-gold text-xs font-serif font-bold transition-all"
          >
            🔄 歸籠謝恩 · 重新請益
          </button>
          <button
            @click="askLlmAssistant"
            class="px-5 py-2 rounded-full bg-dark-gold text-dark-void hover:opacity-90 text-xs font-serif font-bold transition-all shadow-cosmic flex items-center space-x-1"
          >
            <span>✨</span>
            <span>召喚 AI 靈雀顧問深入解盤</span>
          </button>
        </div>
      </div>

      <!-- 右側/下方：籤詩卷軸與多維度深度解讀 (Scroll Interpretation Result) -->
      <div class="lg:col-span-5 flex flex-col space-y-4">
        <div v-if="!currentResult" class="glass-panel rounded-2xl p-8 border border-dark-gold/20 text-center text-dark-muted flex flex-col items-center justify-center min-h-[420px]">
          <div class="w-16 h-16 rounded-full border border-dark-gold/30 flex items-center justify-center bg-dark-gold/5 mb-4 text-2xl">
            🕊️
          </div>
          <h3 class="font-serif text-lg text-dark-gold font-bold mb-2">靈雀靜候虔心啟請</h3>
          <p class="text-xs leading-relaxed max-w-xs">
            請在左側輸入所求問事面向，點擊「誠心開籠」，小白文鳥將循序跳出竹籠，於 28 籤陣中為您銜出一籤。
          </p>
        </div>

        <!-- 展開神籤紅箋卷軸 (Red Scroll Deck Presentation) -->
        <div
          v-else
          ref="resultCardRef"
          class="glass-panel rounded-2xl p-6 border-2 border-dark-gold/40 shadow-cosmic relative overflow-hidden bg-gradient-to-b from-dark-void/90 via-dark-surface/90 to-dark-void/95"
        >
          <!-- 卷軸頂部裝飾條 -->
          <div class="flex items-center justify-between border-b-2 border-dark-gold/30 pb-3 mb-4">
            <div>
              <span class="text-[11px] font-serif text-dark-muted block">
                二十八宿靈雀神籤 · {{ currentResult.lot.mansion || '角木蛟' }}
              </span>
              <h2 class="font-serif text-xl sm:text-2xl font-bold text-gold-gradient">
                {{ currentResult.lot.name }}
              </h2>
            </div>
            <div class="text-right">
              <span
                class="px-3 py-1 rounded-full text-xs font-serif font-bold inline-block"
                :class="luckBadgeClass(currentResult.lot.luckLevel)"
              >
                {{ currentResult.lot.luckLevel }}
              </span>
              <span class="block text-[10px] font-serif text-dark-muted mt-1">五行屬【{{ currentResult.lot.element }}】</span>
            </div>
          </div>

          <!-- 七言/五言古體詩文 (Poetic Centerpiece) -->
          <div class="bg-black/30 rounded-xl p-4 border border-dark-gold/25 mb-4 text-center">
            <div class="space-y-1.5 font-serif text-base sm:text-lg text-amber-100 tracking-widest font-bold">
              <p v-for="(line, idx) in currentResult.lot.poem" :key="idx" class="leading-relaxed">
                {{ line }}
              </p>
            </div>
          </div>

          <!-- 雀鳥銜籤動態情境還原 -->
          <div class="bg-dark-gold/10 rounded-lg p-3 border border-dark-gold/20 mb-4 text-xs text-dark-text/90 leading-relaxed font-serif">
            <span class="font-bold text-dark-gold">🕊️ 靈雀銜籤情境：</span>
            {{ currentResult.lot.birdAction }}
          </div>

          <!-- 核心關鍵詞 -->
          <div class="flex flex-wrap gap-1.5 mb-4">
            <span
              v-for="kw in currentResult.lot.keywords"
              :key="kw"
              class="px-2.5 py-0.5 rounded-full text-[11px] bg-dark-gold/15 text-dark-gold border border-dark-gold/30 font-serif"
            >
              # {{ kw }}
            </span>
          </div>

          <!-- 白話總綱解讀 -->
          <div class="mb-4">
            <h4 class="text-xs font-serif font-bold text-dark-gold mb-1">【聖意白話詳解】</h4>
            <p class="text-xs text-dark-text/90 leading-relaxed font-sans">
              {{ currentResult.lot.overallExplanation }}
            </p>
          </div>

          <!-- 特定問事面向高亮直斷 (Aspect Guidance) -->
          <div class="bg-amber-950/20 rounded-xl p-3.5 border border-amber-500/30 mb-4">
            <div class="flex items-center space-x-1.5 text-xs font-serif font-bold text-amber-300 mb-1.5">
              <span>🎯</span>
              <span>針對所問【{{ currentResult.aspect }}】之專屬指引：</span>
            </div>
            <p class="text-xs text-amber-100/90 leading-relaxed font-sans font-medium">
              {{ currentAspectAdvice }}
            </p>
          </div>

          <!-- 展開其餘面向抽屜/折疊 -->
          <details class="text-xs border-t border-dark-gold/15 pt-3 mb-4 group">
            <summary class="cursor-pointer text-dark-gold font-serif font-bold flex items-center justify-between">
              <span>檢視其餘面向斷語（感情、工作、財富、學業、抉擇）</span>
              <span class="group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div class="mt-2 space-y-2 pt-2 border-t border-dark-gold/10 text-dark-text/80 text-[11px]">
              <p><strong class="text-dark-gold">❤️ 感情姻緣：</strong>{{ currentResult.lot.aspects.love }}</p>
              <p><strong class="text-dark-gold">💼 工作事業：</strong>{{ currentResult.lot.aspects.career }}</p>
              <p><strong class="text-dark-gold">🪙 財富投資：</strong>{{ currentResult.lot.aspects.wealth }}</p>
              <p><strong class="text-dark-gold">📖 學業考運：</strong>{{ currentResult.lot.aspects.study }}</p>
              <p><strong class="text-dark-gold">🧭 重大抉擇：</strong>{{ currentResult.lot.aspects.decision }}</p>
            </div>
          </details>

          <!-- 文鳥靈犀悄悄話 (溫暖小叮嚀) -->
          <div class="bg-gradient-to-r from-pink-950/20 to-amber-950/20 rounded-xl p-3 border border-pink-500/25 flex items-start space-x-2.5">
            <span class="text-lg">💬</span>
            <div class="text-xs text-pink-200/90 leading-relaxed font-serif">
              <span class="font-bold text-pink-300 block mb-0.5">文鳥靈犀悄悄話：</span>
              {{ currentResult.lot.birdAdvice }}
            </div>
          </div>

          <!-- 測算日記與後續引導 -->
          <div class="mt-4 pt-4 border-t border-dark-gold/15 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              @click="saveReadingJournal"
              :disabled="savingJournal || journalSaved"
              class="w-full sm:w-auto px-4 py-2 rounded-xl border border-dark-gold/40 text-dark-gold hover:bg-dark-gold/15 text-xs font-serif transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <span>{{ journalSaved ? '✅ 已存入靈驗日記' : savingJournal ? '儲存中...' : '💾 儲存神籤至測算日記' }}</span>
            </button>
            <div class="flex items-center space-x-2 text-[11px]">
              <span class="text-dark-muted">命理閉環：</span>
              <router-link to="/almanac" class="text-dark-gold hover:underline">查今日黃曆 📅</router-link>
              <span class="text-dark-muted/40">·</span>
              <router-link to="/planner" class="text-dark-gold hover:underline">流年生活行運 🗓️</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { drawBunchoLot, BunchoDrawResult, BunchoLot } from '@celestial/astro-core';
import { useLlmStore } from '../stores/llm.js';
import { useAuthStore } from '../stores/auth.js';

const llmStore = useLlmStore();
const authStore = useAuthStore();

// 抽籤狀態機
type DrawPhase = 'idle' | 'praying' | 'cage_opening' | 'hopping_out' | 'pecking_lots' | 'drawing_lot' | 'delivering' | 'revealed';

const drawPhase = ref<DrawPhase>('idle');
const isDrawing = ref(false);
const animationProgress = ref(0);
const animationNarrative = ref('');
const shouldSkipRitual = ref(false);
const savingJournal = ref(false);
const journalSaved = ref(false);
const resultCardRef = ref<HTMLElement | null>(null);

const selectedAspect = ref<'感情' | '事業' | '財運' | '學業' | '抉擇' | '綜合'>('綜合');
const questionInput = ref('');
const currentResult = ref<BunchoDrawResult | null>(null);

onMounted(() => {
  // 預先快取圖片，消除動畫中途切換產生的短暫閃白
  const img1 = new Image();
  img1.src = '/images/buncho/buncho_cage_ready.jpg';
  const img2 = new Image();
  img2.src = '/images/buncho/buncho_picking_lot.jpg';
});

const aspectOptions = [
  { key: '綜合' as const, label: '綜合運勢', icon: '✨' },
  { key: '感情' as const, label: '戀愛姻緣', icon: '❤️' },
  { key: '事業' as const, label: '工作前程', icon: '💼' },
  { key: '財運' as const, label: '經商求財', icon: '🪙' },
  { key: '學業' as const, label: '考試進修', icon: '📖' },
  { key: '抉擇' as const, label: '兩難抉擇', icon: '🧭' },
];

const stepList = [
  { name: '誠心祈願', icon: '🙏' },
  { name: '鳥籠微敞', icon: '🚪' },
  { name: '靈雀出籠', icon: '🕊️' },
  { name: '審視揀籤', icon: '🎋' },
  { name: '銜籤呈遞', icon: '📜' },
];

const currentStepIndex = computed(() => {
  switch (drawPhase.value) {
    case 'idle':
    case 'praying':
      return 0;
    case 'cage_opening':
      return 1;
    case 'hopping_out':
      return 2;
    case 'pecking_lots':
      return 3;
    case 'drawing_lot':
    case 'delivering':
    case 'revealed':
      return 4;
    default:
      return 0;
  }
});

const currentPhaseTitle = computed(() => {
  switch (drawPhase.value) {
    case 'idle':
      return '準備祈願 · 靜候開局';
    case 'praying':
      return '誠心默禱 · 感應天地';
    case 'cage_opening':
      return '竹籠輕啟 · 靈鳥探首';
    case 'hopping_out':
      return '文鳥踱步 · 躍上茶案';
    case 'pecking_lots':
      return '審視靈籤 · 尋覓神諭';
    case 'drawing_lot':
      return '靈雀銜籤 · 拔得頭籌';
    case 'delivering':
      return '銜籤而歸 · 恭奉籤詩';
    case 'revealed':
      return '神籤展閱 · 吉凶大顯';
    default:
      return '文鳥占卜';
  }
});

const phaseDotClass = computed(() => {
  if (drawPhase.value === 'revealed') return 'bg-emerald-400';
  if (isDrawing.value) return 'bg-amber-400';
  return 'bg-dark-gold';
});

const currentAspectAdvice = computed(() => {
  if (!currentResult.value) return '';
  const lot = currentResult.value.lot;
  const asp = currentResult.value.aspect;
  switch (asp) {
    case '感情':
      return lot.aspects.love;
    case '事業':
      return lot.aspects.career;
    case '財運':
      return lot.aspects.wealth;
    case '學業':
      return lot.aspects.study;
    case '抉擇':
      return lot.aspects.decision;
    default:
      return lot.overallExplanation;
  }
});

function luckBadgeClass(level: string) {
  if (level === '大吉') return 'bg-red-500/20 text-red-300 border border-red-500/40';
  if (level === '中吉' || level === '吉') return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
  if (level === '轉吉' || level === '平吉') return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
  if (level === '平') return 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
  return 'bg-purple-500/20 text-purple-300 border border-purple-500/40';
}

function sleepOrSkip(ms: number): Promise<void> {
  if (shouldSkipRitual.value) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function skipRitual() {
  shouldSkipRitual.value = true;
}

/**
 * 啟動沉浸式抽籤示意動畫過程
 */
async function startDivination() {
  if (isDrawing.value) return;
  isDrawing.value = true;
  currentResult.value = null;
  shouldSkipRitual.value = false;
  journalSaved.value = false;

  // 1. 誠心祈願
  drawPhase.value = 'praying';
  animationProgress.value = 15;
  animationNarrative.value = '您雙手合十，在心中專注默想所求之事...';
  await sleepOrSkip(900);

  // 2. 鳥籠開啟
  drawPhase.value = 'cage_opening';
  animationProgress.value = 35;
  animationNarrative.value = '輕輕推開紫竹鳥籠小門，小白文鳥側起小腦袋，歡快跳動...';
  await sleepOrSkip(1000);

  // 3. 靈雀出籠
  drawPhase.value = 'hopping_out';
  animationProgress.value = 55;
  animationNarrative.value = '小白文鳥輕盈躍上烏木案前，粉紅小爪踩在紅色籤布上...';
  await sleepOrSkip(1000);

  // 4. 審視籤陣
  drawPhase.value = 'pecking_lots';
  animationProgress.value = 75;
  animationNarrative.value = '文鳥在 28 宿靈籤陣前左右打量，小嘴在籤牌間輕點尋找...';
  await sleepOrSkip(1100);

  // 5. 銜籤呈遞
  drawPhase.value = 'drawing_lot';
  animationProgress.value = 90;
  animationNarrative.value = '靈犀一動！白文鳥用粉紅尖喙精準叼起命定神籤，昂首踏步呈上！';
  await sleepOrSkip(900);

  // 由底層演算法庫執行確定性隨機抽籤
  const drawn = drawBunchoLot({
    question: questionInput.value.trim() || '所求吉凶指引',
    aspect: selectedAspect.value,
  });

  currentResult.value = drawn;
  animationProgress.value = 100;
  animationNarrative.value = '神籤啟封！請參閱靈雀神諭開示。';
  await sleepOrSkip(500);

  drawPhase.value = 'revealed';
  isDrawing.value = false;
  shouldSkipRitual.value = false;

  nextTick(() => {
    resultCardRef.value?.scrollIntoView({ behavior: 'smooth' });
  });
}

async function saveReadingJournal() {
  if (!currentResult.value || savingJournal.value) return;
  savingJournal.value = true;
  try {
    const headers = await authStore.getAuthHeaders();
    const lot = currentResult.value.lot;
    const res = await fetch('/api/v1/readings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        moduleType: 'BUNCHO',
        inputSnapshot: {
          aspect: currentResult.value.aspect,
          question: currentResult.value.question,
        },
        chartOutput: currentResult.value,
        aiSummary: `文鳥靈籤：${lot.name}（${lot.luckLevel} · ${lot.mansion || ''}）· 問${currentResult.value.aspect}：「${currentResult.value.question}」`,
      }),
    });
    const data = await res.json();
    if (data.success) {
      journalSaved.value = true;
    } else {
      alert(data.message || '儲存靈驗日記失敗');
    }
  } catch (err: any) {
    alert(err.message || '連線異常，無法儲存日記');
  } finally {
    savingJournal.value = false;
  }
}

function resetDivination() {
  drawPhase.value = 'idle';
  currentResult.value = null;
  animationProgress.value = 0;
  animationNarrative.value = '';
}

function askLlmAssistant() {
  if (!currentResult.value) return;
  const lot = currentResult.value.lot;
  const prompt = `我剛在「靈雀神諭·文鳥占卜」抽得第 ${lot.id} 籤【${lot.name}】（吉凶: ${lot.luckLevel}，五行: ${lot.element}）。籤詩為：「${lot.poem.join('，')}」。我問的是【${currentResult.value.aspect}】問題：「${currentResult.value.question}」。請文鳥顧問為我進行更深入的心理投射解析與具體生活調適建議！`;

  llmStore.openAssistantWithContext(
    {
      moduleType: 'BUNCHO',
      title: `文鳥靈籤 · ${lot.name}`,
      summary: `問【${currentResult.value.aspect}】：${currentResult.value.question}（抽得 ${lot.luckLevel}）`,
      rawData: {
        lot,
        question: currentResult.value.question,
        aspect: currentResult.value.aspect,
      },
    },
    prompt
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
</style>
