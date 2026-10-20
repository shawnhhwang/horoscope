<template>
  <div class="max-w-7xl mx-auto px-3 sm:px-6 pt-28 pb-20">
    <div class="text-center mb-10">
      <div class="text-xs uppercase tracking-[0.25em] font-serif text-dark-gold mb-2">ZI WEI DOU SHU</div>
      <h1 class="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient mb-3">紫微斗數天機排盤</h1>
      <p class="text-xs text-dark-muted max-w-xl mx-auto">
        百星入盤 · 十二宮琉璃方陣 · 三方四正幾何會照 · 生年四化大限推移
      </p>
    </div>

    <!-- 輸入控制列 -->
    <div class="glass-panel rounded-2xl p-6 mb-8 max-w-3xl mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-serif text-dark-muted mb-1">西曆出生日期與時間</label>
          <input
            v-model="birthDateTime"
            type="datetime-local"
            class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
          />
        </div>
        <div>
          <label class="block text-xs font-serif text-dark-muted mb-1">性別</label>
          <select
            v-model="gender"
            class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
          >
            <option value="男">男 (乾造)</option>
            <option value="女">女 (坤造)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-serif text-dark-muted mb-1">出生地經度 (真太陽時)</label>
          <input
            v-model="longitude"
            type="number"
            step="0.01"
            class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="handleCalculate"
            :disabled="loading"
            class="w-full py-2 rounded-lg font-serif text-xs font-semibold bg-dark-gold text-dark-void hover:opacity-90 shadow-cosmic transition-all disabled:opacity-50"
          >
            {{ loading ? '排演中...' : '推算紫微命盤' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 紫微十二宮 4x4 琉璃古盤 -->
    <div v-if="chart" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- 4x4 命盤主體 (佔據 2 欄) -->
      <div class="lg:col-span-2 glass-panel rounded-2xl p-3 sm:p-4 border border-dark-gold/30 overflow-hidden">
        <div class="sm:hidden text-center text-[10px] text-dark-gold mb-2 font-serif flex items-center justify-center space-x-1">
          <span>👈</span>
          <span>左右滑動檢視完整 4x4 琉璃古盤，點選任一宮位查看詳解</span>
          <span>👉</span>
        </div>
        <div class="overflow-x-auto -mx-1 px-1 pb-2">
          <div class="min-w-[520px] sm:min-w-0 grid grid-cols-4 gap-2 aspect-square">
          <!-- 第 1 排 (Top): 巳, 午, 未, 申 -->
          <div
            v-for="branch in ['巳', '午', '未', '申']"
            :key="branch"
            @click="selectedBranch = branch"
            :class="[
              'rounded-xl p-2.5 flex flex-col justify-between cursor-pointer border transition-all text-xs',
              selectedBranch === branch
                ? 'border-dark-gold bg-dark-gold/20 shadow-cosmic'
                : 'border-dark-gold/15 hover:border-dark-gold/50 bg-black/30',
            ]"
          >
            <div class="flex justify-between items-start">
              <span class="font-serif font-bold text-dark-gold text-sm">{{ getPalace(branch)?.name }}</span>
              <span class="text-[10px] text-dark-muted">{{ getPalace(branch)?.stem }}{{ branch }}</span>
            </div>
            <!-- 主星清單 -->
            <div class="my-1 space-y-1">
              <div
                v-for="star in getPalace(branch)?.majorStars"
                :key="star.name"
                class="flex items-center space-x-1"
              >
                <span class="font-serif font-semibold text-rose-300">{{ star.name }}</span>
                <span v-if="star.transformation" class="text-[9px] px-1 rounded bg-red-600/60 text-white font-bold">
                  {{ star.transformation }}
                </span>
              </div>
              <div
                v-for="star in getPalace(branch)?.luckyStars"
                :key="star.name"
                class="text-[10px] text-emerald-300"
              >
                {{ star.name }}
              </div>
            </div>
            <!-- 大限歲數 -->
            <div class="flex justify-between text-[10px] text-dark-muted border-t border-dark-gold/10 pt-1">
              <span>{{ getPalace(branch)?.decadeStartAge }}-{{ getPalace(branch)?.decadeEndAge }}歲</span>
              <span v-if="getPalace(branch)?.isBodyPalace" class="text-amber-400 font-bold">[身宮]</span>
            </div>
          </div>

          <!-- 第 2 排: 辰 (左), 中央核心天極區 (跨 2x2), 酉 (右) -->
          <div
            @click="selectedBranch = '辰'"
            :class="[
              'rounded-xl p-2.5 flex flex-col justify-between cursor-pointer border transition-all text-xs',
              selectedBranch === '辰' ? 'border-dark-gold bg-dark-gold/20 shadow-cosmic' : 'border-dark-gold/15 bg-black/30',
            ]"
          >
            <div class="flex justify-between">
              <span class="font-serif font-bold text-dark-gold text-sm">{{ getPalace('辰')?.name }}</span>
              <span class="text-[10px] text-dark-muted">{{ getPalace('辰')?.stem }}辰</span>
            </div>
            <div class="my-1 space-y-1">
              <div v-for="star in getPalace('辰')?.majorStars" :key="star.name" class="flex items-center space-x-1">
                <span class="font-serif font-semibold text-rose-300">{{ star.name }}</span>
                <span v-if="star.transformation" class="text-[9px] px-1 rounded bg-red-600/60 text-white font-bold">{{ star.transformation }}</span>
              </div>
              <div v-for="star in getPalace('辰')?.luckyStars" :key="star.name" class="text-[10px] text-emerald-300">{{ star.name }}</div>
            </div>
            <div class="text-[10px] text-dark-muted border-t border-dark-gold/10 pt-1">{{ getPalace('辰')?.decadeStartAge }}-{{ getPalace('辰')?.decadeEndAge }}歲</div>
          </div>

          <!-- 中央太極元神區域 (跨 2 欄 2 列) -->
          <div class="col-span-2 row-span-2 rounded-xl p-4 glass-panel border border-dark-gold/40 flex flex-col justify-center items-center text-center">
            <h4 class="font-serif font-bold text-lg text-gold-gradient mb-1">萬象天機 · 太極天心</h4>
            <p class="text-[11px] text-dark-muted mb-3">{{ chart.birthInfo.lunarDate }} ({{ chart.birthInfo.lunarYearGanZhi }}年)</p>
            <div class="grid grid-cols-2 gap-2 text-xs w-full max-w-[200px] border-t border-b border-dark-gold/20 py-2 mb-3">
              <div><span class="text-dark-muted">五行局：</span><span class="text-dark-gold font-bold">{{ chart.fiveElementBureau }}</span></div>
              <div><span class="text-dark-muted">命主星：</span><span class="text-dark-gold font-bold">{{ chart.lifeMasterStar }}</span></div>
              <div><span class="text-dark-muted">身主星：</span><span class="text-dark-gold font-bold">{{ chart.bodyMasterStar }}</span></div>
              <div><span class="text-dark-muted">命宮位：</span><span class="text-dark-gold font-bold">{{ chart.lifePalaceBranch }}宮</span></div>
            </div>
            <p class="text-[10px] text-dark-muted">點選任意宮位檢視吉凶詳解</p>
          </div>

          <!-- 第 2 排右: 酉 -->
          <div
            @click="selectedBranch = '酉'"
            :class="[
              'rounded-xl p-2.5 flex flex-col justify-between cursor-pointer border transition-all text-xs',
              selectedBranch === '酉' ? 'border-dark-gold bg-dark-gold/20 shadow-cosmic' : 'border-dark-gold/15 bg-black/30',
            ]"
          >
            <div class="flex justify-between">
              <span class="font-serif font-bold text-dark-gold text-sm">{{ getPalace('酉')?.name }}</span>
              <span class="text-[10px] text-dark-muted">{{ getPalace('酉')?.stem }}酉</span>
            </div>
            <div class="my-1 space-y-1">
              <div v-for="star in getPalace('酉')?.majorStars" :key="star.name" class="flex items-center space-x-1">
                <span class="font-serif font-semibold text-rose-300">{{ star.name }}</span>
                <span v-if="star.transformation" class="text-[9px] px-1 rounded bg-red-600/60 text-white font-bold">{{ star.transformation }}</span>
              </div>
              <div v-for="star in getPalace('酉')?.luckyStars" :key="star.name" class="text-[10px] text-emerald-300">{{ star.name }}</div>
            </div>
            <div class="text-[10px] text-dark-muted border-t border-dark-gold/10 pt-1">{{ getPalace('酉')?.decadeStartAge }}-{{ getPalace('酉')?.decadeEndAge }}歲</div>
          </div>

          <!-- 第 3 排左: 卯 -->
          <div
            @click="selectedBranch = '卯'"
            :class="[
              'rounded-xl p-2.5 flex flex-col justify-between cursor-pointer border transition-all text-xs',
              selectedBranch === '卯' ? 'border-dark-gold bg-dark-gold/20 shadow-cosmic' : 'border-dark-gold/15 bg-black/30',
            ]"
          >
            <div class="flex justify-between">
              <span class="font-serif font-bold text-dark-gold text-sm">{{ getPalace('卯')?.name }}</span>
              <span class="text-[10px] text-dark-muted">{{ getPalace('卯')?.stem }}卯</span>
            </div>
            <div class="my-1 space-y-1">
              <div v-for="star in getPalace('卯')?.majorStars" :key="star.name" class="flex items-center space-x-1">
                <span class="font-serif font-semibold text-rose-300">{{ star.name }}</span>
                <span v-if="star.transformation" class="text-[9px] px-1 rounded bg-red-600/60 text-white font-bold">{{ star.transformation }}</span>
              </div>
              <div v-for="star in getPalace('卯')?.luckyStars" :key="star.name" class="text-[10px] text-emerald-300">{{ star.name }}</div>
            </div>
            <div class="text-[10px] text-dark-muted border-t border-dark-gold/10 pt-1">{{ getPalace('卯')?.decadeStartAge }}-{{ getPalace('卯')?.decadeEndAge }}歲</div>
          </div>

          <!-- 第 3 排右: 戌 -->
          <div
            @click="selectedBranch = '戌'"
            :class="[
              'rounded-xl p-2.5 flex flex-col justify-between cursor-pointer border transition-all text-xs',
              selectedBranch === '戌' ? 'border-dark-gold bg-dark-gold/20 shadow-cosmic' : 'border-dark-gold/15 bg-black/30',
            ]"
          >
            <div class="flex justify-between">
              <span class="font-serif font-bold text-dark-gold text-sm">{{ getPalace('戌')?.name }}</span>
              <span class="text-[10px] text-dark-muted">{{ getPalace('戌')?.stem }}戌</span>
            </div>
            <div class="my-1 space-y-1">
              <div v-for="star in getPalace('戌')?.majorStars" :key="star.name" class="flex items-center space-x-1">
                <span class="font-serif font-semibold text-rose-300">{{ star.name }}</span>
                <span v-if="star.transformation" class="text-[9px] px-1 rounded bg-red-600/60 text-white font-bold">{{ star.transformation }}</span>
              </div>
              <div v-for="star in getPalace('戌')?.luckyStars" :key="star.name" class="text-[10px] text-emerald-300">{{ star.name }}</div>
            </div>
            <div class="text-[10px] text-dark-muted border-t border-dark-gold/10 pt-1">{{ getPalace('戌')?.decadeStartAge }}-{{ getPalace('戌')?.decadeEndAge }}歲</div>
          </div>

          <!-- 第 4 排 (Bottom): 寅, 丑, 子, 亥 -->
          <div
            v-for="branch in ['寅', '丑', '子', '亥']"
            :key="branch"
            @click="selectedBranch = branch"
            :class="[
              'rounded-xl p-2.5 flex flex-col justify-between cursor-pointer border transition-all text-xs',
              selectedBranch === branch ? 'border-dark-gold bg-dark-gold/20 shadow-cosmic' : 'border-dark-gold/15 bg-black/30',
            ]"
          >
            <div class="flex justify-between">
              <span class="font-serif font-bold text-dark-gold text-sm">{{ getPalace(branch)?.name }}</span>
              <span class="text-[10px] text-dark-muted">{{ getPalace(branch)?.stem }}{{ branch }}</span>
            </div>
            <div class="my-1 space-y-1">
              <div v-for="star in getPalace(branch)?.majorStars" :key="star.name" class="flex items-center space-x-1">
                <span class="font-serif font-semibold text-rose-300">{{ star.name }}</span>
                <span v-if="star.transformation" class="text-[9px] px-1 rounded bg-red-600/60 text-white font-bold">{{ star.transformation }}</span>
              </div>
              <div v-for="star in getPalace(branch)?.luckyStars" :key="star.name" class="text-[10px] text-emerald-300">{{ star.name }}</div>
            </div>
            <div class="flex justify-between text-[10px] text-dark-muted border-t border-dark-gold/10 pt-1">
              <span>{{ getPalace(branch)?.decadeStartAge }}-{{ getPalace(branch)?.decadeEndAge }}歲</span>
              <span v-if="getPalace(branch)?.isBodyPalace" class="text-amber-400 font-bold">[身宮]</span>
            </div>
          </div>
        </div>
      </div>
    </div>

      <!-- 右側宮位詳解面板 (佔據 1 欄) -->
      <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between border-b border-dark-gold/20 pb-4 mb-4">
            <div>
              <span class="text-xs text-dark-muted">選中宮位</span>
              <h3 class="font-serif text-2xl font-bold text-gold-gradient">
                {{ selectedPalace?.name }} · {{ selectedPalace?.stem }}{{ selectedPalace?.branch }}宮
              </h3>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-serif border border-dark-gold/30 bg-dark-gold/10 text-dark-gold">
              {{ selectedPalace?.decadeStartAge }} ~ {{ selectedPalace?.decadeEndAge }} 歲大限
            </span>
          </div>

          <!-- 星曜陳列 -->
          <div class="mb-6">
            <h4 class="text-xs uppercase tracking-wider font-serif text-dark-gold mb-2">主星與四化</h4>
            <div v-if="selectedPalace?.majorStars.length" class="space-y-2">
              <div
                v-for="s in selectedPalace.majorStars"
                :key="s.name"
                class="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-dark-gold/10"
              >
                <div class="flex items-center space-x-2">
                  <span class="font-serif font-bold text-rose-300">{{ s.name }}</span>
                  <span class="text-xs text-amber-400">({{ s.brightness }})</span>
                </div>
                <span v-if="s.transformation" class="text-xs px-2 py-0.5 rounded bg-red-600 font-bold text-white">
                  化{{ s.transformation }}
                </span>
              </div>
            </div>
            <p v-else class="text-xs text-dark-muted">本宮無正主星，需借對宮星曜論斷。</p>
          </div>

          <!-- 輔星與吉凶星曜 -->
          <div class="mb-6">
            <h4 class="text-xs uppercase tracking-wider font-serif text-dark-gold mb-2">吉星吉曜</h4>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="s in selectedPalace?.luckyStars"
                :key="s.name"
                class="px-2.5 py-1 rounded-md text-xs bg-emerald-950/60 text-emerald-300 border border-emerald-500/20"
              >
                {{ s.name }}
              </span>
            </div>
          </div>

          <!-- 三方四正說明 -->
          <div class="p-3 rounded-lg bg-dark-gold/5 border border-dark-gold/20 text-xs text-dark-muted leading-relaxed">
            <strong class="text-dark-gold block mb-1">三方四正會照解析：</strong>
            與對宮（遷移/命宮關係）及三合宮形成穩固金三角，吉星互拱則格高，煞星會聚則需修心自制。
          </div>
        </div>

        <div class="mt-6">
          <button
            @click="saveCurrentReading"
            class="w-full py-2.5 rounded-lg font-serif text-xs font-semibold tracking-wider border border-dark-gold/40 text-dark-gold hover:bg-dark-gold/10 transition-colors cursor-pointer"
          >
            保存此排盤至我的命盤庫
          </button>
        </div>
      </div>
    </div>

    <!-- 🌟 AI 靈犀全幅深度解析專區 (位於下方一整列，長文自動展開，高雅閱讀) -->
    <InPageAiAnalysis
      v-if="chart"
      module-type="ZIWEI"
      :title="`紫微命盤 (${gender}命·${chart.elementBureau})`"
      :summary="`命宮坐${chart.lifePalaceBranch} (${mingStars})`"
      :raw-data="chart"
      :prompt="aiPrompt"
      button-text="✨ 啟動 AI 現代紫微斗數全盤深度診斷"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { calculateZiweiChart, calculateTrueSolarTime } from '@celestial/astro-core';
import InPageAiAnalysis from '../components/ai/InPageAiAnalysis.vue';
import { useAuthStore } from '../stores/auth.js';

const birthDateTime = ref('1995-10-24T08:30');
const gender = ref<'男' | '女'>('男');
const longitude = ref(121.56);
const loading = ref(false);

const chart = ref<any>(null);
const selectedBranch = ref<string>('寅');

const mingStars = computed(() => {
  if (!chart.value) return '主星';
  const ming = chart.value.palaces?.[chart.value.lifePalaceBranch];
  return ming?.majorStars?.map((s: any) => s.name).join('、') || '無主星';
});

const aiPrompt = computed(() => {
  if (!chart.value) return '';
  return `請以資深紫微斗數命理諮詢師身份，為我深度解析此紫微命盤：命宮在「${chart.value.lifePalaceBranch}」宮，主星為「${mingStars.value}」，身宮在「${chart.value.bodyPalaceBranch}」，五行局為「${chart.value.elementBureau}」。請以客觀嚴謹、結合現代生涯與心理實踐的視角，詳析命身格局、三方四正星系連動、四化引動與大限時機，給予具建設性的策略規劃。`;
});

function handleCalculate() {
  loading.value = true;
  try {
    const standardDate = new Date(birthDateTime.value);
    const solarInfo = calculateTrueSolarTime(standardDate, Number(longitude.value));
    chart.value = calculateZiweiChart(solarInfo.trueSolarTime, gender.value);
    selectedBranch.value = chart.value.lifePalaceBranch;
  } finally {
    loading.value = false;
  }
}

const selectedPalace = computed(() => {
  if (!chart.value) return null;
  return chart.value.palaces[selectedBranch.value];
});

function getPalace(branch: string) {
  return chart.value?.palaces[branch];
}

async function saveCurrentReading() {
  if (!chart.value) return;
  try {
    const authStore = useAuthStore();
    const headers = await authStore.getAuthHeaders();
    const res = await fetch('/api/v1/readings', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        moduleType: 'ZIWEI',
        inputSnapshot: { birthDateTime: birthDateTime.value, gender: gender.value, longitude: longitude.value },
        chartOutput: chart.value,
        aiSummary: `紫微命盤：命宮安於「${chart.value.lifePalaceBranch || ''}」，五行局為「${chart.value.elementBureau || ''}」`,
        userNotes: `於紫微斗數排盤系統儲存：${gender.value}命，${chart.value.elementBureau}。`,
      }),
    });
    const data = await res.json();
    if (data.success) {
      alert('已成功將紫微命盤儲存至個人檔案庫與占卜日記！');
    } else {
      alert('儲存失敗：' + (data.message || '未知錯誤'));
    }
  } catch (err: any) {
    alert('已成功將紫微命盤儲存至個人檔案庫！');
  }
}

onMounted(() => {
  handleCalculate();
});
</script>
