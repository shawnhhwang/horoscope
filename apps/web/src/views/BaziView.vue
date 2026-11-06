<template>
  <div class="max-w-7xl mx-auto px-3 sm:px-6 pt-28 pb-20">
    <div class="text-center mb-10">
      <div class="text-xs uppercase tracking-[0.25em] font-serif text-dark-gold mb-2">FOUR PILLARS OF DESTINY</div>
      <h1 class="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient mb-3">四柱八字五行論命</h1>
      <p class="text-xs text-dark-muted max-w-xl mx-auto">
        節氣交接精準干支 · 地支藏干十神分佈 · 五行生剋能量評分 · 日主旺衰喜用推導
      </p>
    </div>

    <!-- 輸入列 -->
    <div class="glass-panel rounded-2xl p-6 mb-8 max-w-4xl mx-auto shadow-cosmic">
      <div v-if="savedProfiles.length > 0" class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-dark-gold/15 text-xs">
        <span class="text-dark-gold font-bold flex items-center space-x-1.5">
          <span>✨</span>
          <span>命盤檔案庫快捷載入：</span>
        </span>
        <select
          @change="quickLoadProfile(($event.target as HTMLSelectElement).value)"
          class="bg-black/60 border border-dark-gold/30 rounded-lg px-2.5 py-1 text-dark-text text-xs focus:border-dark-gold outline-none"
        >
          <option value="">選擇已登記之命主檔案...</option>
          <option v-for="p in savedProfiles" :key="p.id" :value="p.id">
            {{ p.name }} ({{ p.gender }} · {{ p.birthDatetime?.slice(0, 10) }})
          </option>
        </select>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-serif text-dark-muted mb-1">出生日期與時間</label>
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
          <div class="flex items-center justify-between mb-1">
            <label class="text-xs font-serif text-dark-muted">出生經度</label>
            <select
              @change="onCityPresetChange(($event.target as HTMLSelectElement).value)"
              class="bg-black/40 text-[10px] text-dark-gold border border-dark-gold/30 rounded px-1 outline-none"
            >
              <option value="">城市預設...</option>
              <option v-for="c in cityPresets" :key="c.name" :value="c.lon">{{ c.name }}</option>
            </select>
          </div>
          <input
            v-model="longitude"
            type="number"
            step="0.01"
            class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none font-mono"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="handleCalculate"
            :disabled="loading"
            class="w-full py-2.5 rounded-lg font-serif text-xs font-semibold bg-dark-gold text-dark-void hover:opacity-90 shadow-cosmic transition-all disabled:opacity-50 cursor-pointer"
          >
            {{ loading ? '排算中...' : '排演八字命盤' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="chart" class="space-y-8">
      <!-- 四柱干支神煞卡片 (年、月、日、時) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          v-for="p in [chart.pillars.year, chart.pillars.month, chart.pillars.day, chart.pillars.hour]"
          :key="p.name"
          class="glass-panel rounded-2xl p-6 text-center border border-dark-gold/30 relative"
        >
          <span class="text-xs font-serif text-dark-muted block mb-2">{{ p.name }}</span>
          <!-- 天干 -->
          <div class="py-2 border-b border-dark-gold/15">
            <span class="text-xs px-2 py-0.5 rounded-full bg-dark-gold/10 text-dark-gold border border-dark-gold/20 inline-block mb-1">
              {{ p.stemTenGod }}
            </span>
            <div class="font-serif text-3xl font-bold text-gold-gradient">{{ p.stem }}</div>
            <span class="text-[10px] text-dark-muted">({{ p.stemElement }})</span>
          </div>
          <!-- 地支 -->
          <div class="py-2">
            <div class="font-serif text-3xl font-bold text-dark-text">{{ p.branch }}</div>
            <span class="text-[10px] text-dark-muted">({{ p.branchElement }})</span>
            <!-- 藏干清單 -->
            <div class="mt-3 space-y-1">
              <div v-for="h in p.hiddenStems" :key="h.stem" class="text-[10px] text-dark-muted flex justify-between px-2">
                <span>{{ h.stem }} ({{ h.element }})</span>
                <span class="text-amber-300">{{ h.tenGod }}</span>
              </div>
            </div>
          </div>
          <div class="text-[10px] text-dark-gold/70 mt-2 border-t border-dark-gold/10 pt-2">
            納音：{{ p.naYin }}
          </div>
        </div>
      </div>

      <!-- 五行能量分析與喜用神判定 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 五行能量分佈 -->
        <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 lg:col-span-2">
          <h3 class="font-serif text-lg font-bold text-gold-gradient mb-4">五行能量定量分佈 (Five Elements)</h3>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-emerald-400 font-bold">木 (Wood)</span>
                <span>{{ chart.fiveElements.wood }}%</span>
              </div>
              <div class="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full rounded-full transition-all duration-700" :style="{ width: `${chart.fiveElements.wood}%` }"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-rose-400 font-bold">火 (Fire)</span>
                <span>{{ chart.fiveElements.fire }}%</span>
              </div>
              <div class="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                <div class="bg-rose-500 h-full rounded-full transition-all duration-700" :style="{ width: `${chart.fiveElements.fire}%` }"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-amber-400 font-bold">土 (Earth)</span>
                <span>{{ chart.fiveElements.earth }}%</span>
              </div>
              <div class="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                <div class="bg-amber-500 h-full rounded-full transition-all duration-700" :style="{ width: `${chart.fiveElements.earth}%` }"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-300 font-bold">金 (Metal)</span>
                <span>{{ chart.fiveElements.metal }}%</span>
              </div>
              <div class="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                <div class="bg-slate-300 h-full rounded-full transition-all duration-700" :style="{ width: `${chart.fiveElements.metal}%` }"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-cyan-400 font-bold">水 (Water)</span>
                <span>{{ chart.fiveElements.water }}%</span>
              </div>
              <div class="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                <div class="bg-cyan-500 h-full rounded-full transition-all duration-700" :style="{ width: `${chart.fiveElements.water}%` }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 日主旺衰與喜用神 -->
        <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 flex flex-col justify-between">
          <div>
            <h3 class="font-serif text-lg font-bold text-gold-gradient mb-2">日元旺衰與喜用神</h3>
            <div class="my-4 p-4 rounded-xl bg-dark-gold/10 border border-dark-gold/30 text-center">
              <span class="text-xs text-dark-muted block">日主格局</span>
              <span class="font-serif text-2xl font-bold text-dark-gold">{{ chart.dayMaster.stem }}{{ chart.dayMaster.element }} · {{ chart.energy.status }}</span>
              <p class="text-xs text-dark-muted mt-2 leading-relaxed">{{ chart.energy.description }}</p>
            </div>

            <div class="space-y-3 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-dark-muted">喜神 / 用神：</span>
                <div class="flex space-x-1.5">
                  <span
                    v-for="el in chart.favorableElements.useful"
                    :key="el"
                    class="px-2.5 py-0.5 rounded bg-emerald-950/70 text-emerald-300 font-bold border border-emerald-500/30"
                  >
                    {{ el }}
                  </span>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-dark-muted">忌神 / 仇神：</span>
                <div class="flex space-x-1.5">
                  <span
                    v-for="el in chart.favorableElements.harmful"
                    :key="el"
                    class="px-2.5 py-0.5 rounded bg-rose-950/70 text-rose-300 font-bold border border-rose-500/30"
                  >
                    {{ el }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 space-y-2">
            <button
              @click="saveCurrentReading"
              :disabled="savingJournal || journalSaved"
              class="w-full text-center py-2 rounded-lg font-serif text-xs font-semibold border border-dark-gold/50 text-dark-gold hover:bg-dark-gold/15 transition-all cursor-pointer disabled:opacity-50"
            >
              {{ journalSaved ? '✅ 已存入測算日記' : savingJournal ? '儲存中...' : '💾 儲存此八字命盤至日記' }}
            </button>
            <router-link
              to="/synastry?tab=synastry"
              class="block text-center py-2.5 rounded-lg font-serif text-xs font-bold bg-dark-gold text-dark-void hover:opacity-90 transition-all shadow-cosmic"
            >
              💍 進行八字合婚 (二人合盤) →
            </router-link>
            <router-link
              to="/synastry?tab=family"
              class="block text-center py-2 rounded-lg font-serif text-xs font-semibold border border-dark-gold/40 text-dark-gold hover:bg-dark-gold/10 transition-colors"
            >
              👨‍👩‍👧‍👦 家人群組比對 (全家五行場域) →
            </router-link>
            <router-link
              to="/naming"
              class="block text-center py-1.5 rounded-lg font-serif text-xs text-dark-muted hover:text-dark-text transition-colors"
            >
              以喜用神五行進行起名 →
            </router-link>
          </div>
        </div>
      </div>

      <!-- 十年大運流年走勢 -->
      <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30">
        <h3 class="font-serif text-lg font-bold text-gold-gradient mb-4">十年大運流年推移 (Major Luck Pillars)</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div
            v-for="dy in chart.luckPillars"
            :key="dy.startAge"
            class="p-3 rounded-xl bg-black/30 border border-dark-gold/15 text-center"
          >
            <span class="text-[10px] text-dark-muted block mb-1">{{ dy.startAge }}-{{ dy.endAge }}歲</span>
            <span class="text-xs px-1.5 py-0.5 rounded bg-dark-gold/10 text-dark-gold border border-dark-gold/20 inline-block mb-1">
              {{ dy.tenGod }}
            </span>
            <div class="font-serif text-lg font-bold text-gold-gradient">{{ dy.stem }}{{ dy.branch }}</div>
          </div>
        </div>
      </div>

      <!-- 🌟 AI 靈犀全幅深度解析專區 (位於下方一整列，長文自動展開，高雅閱讀) -->
      <InPageAiAnalysis
        v-if="chart"
        module-type="BAZI"
        :title="`四柱八字 (${yearPillar}年·日主${dayMaster})`"
        :summary="`喜用五行: ${favorable} · 大運起運歲數: ${chart.luckPillars?.[0]?.startAge || 1}歲`"
        :raw-data="chart"
        :prompt="aiPrompt"
        button-text="✨ 啟動 AI 專業子平八字全盤深度詳批"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { calculateBaziChart, calculateTrueSolarTime } from '@celestial/astro-core';
import InPageAiAnalysis from '../components/ai/InPageAiAnalysis.vue';
import { useAuthStore } from '../stores/auth.js';

const route = useRoute();
const authStore = useAuthStore();

const birthDateTime = ref('1995-10-24T14:30');
const gender = ref<'男' | '女'>('男');
const longitude = ref(121.56);
const loading = ref(false);
const savedProfiles = ref<any[]>([]);
const savingJournal = ref(false);
const journalSaved = ref(false);
const chart = ref<any>(null);

const cityPresets = [
  { name: '台北 (121.56°E)', lon: 121.56 },
  { name: '台中 (120.67°E)', lon: 120.67 },
  { name: '高雄 (120.30°E)', lon: 120.30 },
  { name: '香港 (114.17°E)', lon: 114.17 },
  { name: '新加坡 (103.82°E)', lon: 103.82 },
  { name: '東京 (139.69°E)', lon: 139.69 },
  { name: '美西舊金山 (-122.42°W)', lon: -122.42 },
  { name: '美東紐約 (-74.00°W)', lon: -74.00 },
];

function onCityPresetChange(val: string) {
  if (val) longitude.value = Number(val);
}

const dayMaster = computed(() => chart.value?.dayMaster?.stem || chart.value?.pillars?.day?.stem || '日主');
const favorable = computed(() => chart.value?.favorableElements?.useful?.join('、') || '木火');
const yearPillar = computed(() => `${chart.value?.pillars?.year?.stem || ''}${chart.value?.pillars?.year?.branch || ''}`);

const aiPrompt = computed(() => {
  if (!chart.value) return '';
  const y = `${chart.value.pillars?.year?.stem || ''}${chart.value.pillars?.year?.branch || ''}`;
  const m = `${chart.value.pillars?.month?.stem || ''}${chart.value.pillars?.month?.branch || ''}`;
  const d = `${chart.value.pillars?.day?.stem || ''}${chart.value.pillars?.day?.branch || ''}`;
  const h = `${chart.value.pillars?.hour?.stem || ''}${chart.value.pillars?.hour?.branch || ''}`;
  return `請以專業子平八字命理專家身份，為我深度批註此四柱八字：日主天干為「${dayMaster.value}」，年柱【${y}】、月柱【${m}】、日柱【${d}】、時柱【${h}】。五行喜用為「${favorable.value}」。請以客觀條理、不玄虛的現代命理視角，剖析日主旺衰格局、十神才能配置、喜用神調候與大運關鍵期之生涯應對方針。`;
});

function handleCalculate() {
  loading.value = true;
  journalSaved.value = false;
  try {
    const standardDate = new Date(birthDateTime.value);
    const solarInfo = calculateTrueSolarTime(standardDate, Number(longitude.value));
    chart.value = calculateBaziChart(solarInfo.trueSolarTime, gender.value);
  } finally {
    loading.value = false;
  }
}

async function fetchSavedProfiles() {
  try {
    const headers = await authStore.getAuthHeaders();
    const res = await fetch('/api/v1/profiles', { headers });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      savedProfiles.value = data.data;
    }
  } catch (err) {
    // 容錯
  }
}

function quickLoadProfile(profileId: string) {
  if (!profileId) return;
  const p = savedProfiles.value.find((item) => item.id === profileId);
  if (!p) return;
  if (p.birthDatetime) birthDateTime.value = p.birthDatetime.slice(0, 16);
  if (p.gender === '男' || p.gender === '女') gender.value = p.gender;
  if (p.longitude) longitude.value = Number(p.longitude);
  handleCalculate();
}

async function saveCurrentReading() {
  if (!chart.value || savingJournal.value) return;
  savingJournal.value = true;
  try {
    const headers = await authStore.getAuthHeaders();
    const res = await fetch('/api/v1/readings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        moduleType: 'BAZI',
        inputSnapshot: {
          birthDateTime: birthDateTime.value,
          gender: gender.value,
          longitude: longitude.value,
        },
        chartOutput: chart.value,
        aiSummary: `四柱八字：${yearPillar.value}年·日主${dayMaster.value}·喜用【${favorable.value}】`,
        userNotes: '於四柱八字排盤系統儲存論命記錄。',
      }),
    });
    const data = await res.json();
    if (data.success) {
      journalSaved.value = true;
    } else {
      alert('儲存失敗：' + (data.message || '未知錯誤'));
    }
  } catch (err: any) {
    alert('儲存失敗：' + (err.message || '連線伺服器異常'));
  } finally {
    savingJournal.value = false;
  }
}

onMounted(() => {
  fetchSavedProfiles();

  if (route.query.birthDate) {
    birthDateTime.value = String(route.query.birthDate);
  } else {
    try {
      const active = sessionStorage.getItem('active_celestial_profile');
      if (active) {
        const p = JSON.parse(active);
        if (p.birthDatetime) birthDateTime.value = p.birthDatetime.slice(0, 16);
        if (p.gender === '男' || p.gender === '女') gender.value = p.gender;
        if (p.longitude) longitude.value = Number(p.longitude);
      }
    } catch (e) {}
  }

  if (route.query.gender === '男' || route.query.gender === '女') {
    gender.value = route.query.gender;
  }
  if (route.query.longitude) {
    longitude.value = Number(route.query.longitude);
  }

  handleCalculate();
});
</script>
