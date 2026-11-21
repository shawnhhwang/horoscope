<template>
  <section class="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
    <div class="glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/30 shadow-cosmic bg-gradient-to-br from-dark-gold/10 via-transparent to-transparent">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dark-gold/15 pb-4 mb-5">
        <div>
          <span class="text-[10px] font-sans uppercase tracking-[0.2em] text-dark-gold font-bold">DAILY 30s FORTUNE RITUAL</span>
          <h2 class="font-serif text-xl sm:text-2xl font-bold text-gold-gradient">
            每日 30 秒運勢微儀式 · 開運打卡養成
          </h2>
        </div>
        <div class="flex items-center space-x-2">
          <span class="px-3 py-1 rounded-full bg-dark-gold/15 border border-dark-gold/40 text-dark-gold text-xs font-mono font-bold">
            🔥 連續打卡 {{ streakDays }} 天
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 1. 今日黃曆宜忌 -->
        <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/20 space-y-2">
          <div class="text-xs font-bold text-dark-gold">📅 今日通勝節律</div>
          <div class="text-sm font-serif font-bold text-dark-text">
            {{ almanac?.lunarDate?.formatted || todayStr }} · 值神「{{ almanac?.dayOfficer?.name || '成' }}」
          </div>
          <p class="text-xs text-dark-muted">
            宜：{{ (almanac?.suitableActivities || ['策略規劃', '靜心修身']).slice(0, 3).join('、') }}
          </p>
          <p class="text-[11px] text-amber-300">
            財神方：{{ almanac?.deityDirections?.wealthGod || '正西' }} ｜ 喜神方：{{ almanac?.deityDirections?.joyGod || '東南' }}
          </p>
        </div>

        <!-- 2. 今日文鳥靈雀指引 -->
        <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/20 space-y-2">
          <div class="text-xs font-bold text-dark-gold">🐦 今日微指引卡</div>
          <div v-if="dailyLot" class="space-y-1">
            <div class="text-sm font-serif font-bold text-dark-text">
              {{ dailyLot.name }}（{{ dailyLot.luckLevel }} · {{ dailyLot.element }}）
            </div>
            <p class="text-xs text-dark-muted leading-relaxed">{{ dailyLot.overallExplanation?.slice(0, 56) }}...</p>
          </div>
          <button
            v-else
            type="button"
            @click="drawDailyCard"
            class="px-4 py-2 rounded-lg bg-dark-gold/15 border border-dark-gold/40 text-dark-gold text-xs font-bold hover:bg-dark-gold hover:text-dark-void transition-all cursor-pointer"
          >
            抽取今日一卡 ✦
          </button>
        </div>

        <!-- 3. 開運微行動打卡 (寫入 /api/v1/habits) -->
        <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/20 flex flex-col justify-between space-y-3">
          <div class="space-y-1">
            <div class="text-xs font-bold text-dark-gold">⚡ 今日開運微行動</div>
            <p class="text-xs text-dark-text font-serif leading-relaxed">{{ dailyMicroAction }}</p>
          </div>

          <button
            type="button"
            @click="checkInHabit"
            :disabled="checkedInToday || checkingIn"
            class="w-full py-2.5 rounded-xl font-serif font-bold text-xs transition-all cursor-pointer"
            :class="checkedInToday ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300' : 'bg-dark-gold text-dark-void hover:opacity-90 shadow-cosmic'"
          >
            {{ checkedInToday ? '✓ 今日開運微行動已打卡' : checkingIn ? '打卡記錄中...' : '✨ 完成行動 · 一鍵打卡寫入日記' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth.js';

const authStore = useAuthStore();
const todayStr = new Date().toISOString().slice(0, 10);
const almanac = ref<any>(null);
const dailyLot = ref<any>(null);
const streakDays = ref(0);
const checkedInToday = ref(false);
const checkingIn = ref(false);

const dailyMicroAction = computed(() => {
  const officer = almanac.value?.dayOfficer?.name || '成';
  if (['破', '危', '閉'].includes(officer)) {
    return '今日氣場偏動盪或收斂，建議午休靜心深呼吸 10 分鐘，重要決策延後複核。';
  }
  return '今日五行流通順暢，建議飲水 2000ml、快走 25 分鐘並主動聯絡一位重要貴人。';
});

async function loadTodayRitual() {
  try {
    const [almRes, habitHeaders] = await Promise.all([
      fetch(`/api/v1/almanac/today?date=${todayStr}`),
      authStore.getAuthHeaders(),
    ]);
    const almJson = await almRes.json();
    if (almJson.success) almanac.value = almJson.data;

    if (authStore.isAuthenticated) {
      const hRes = await fetch('/api/v1/habits?take=30', { headers: habitHeaders });
      if (hRes.ok) {
        const hJson = await hRes.json();
        const logs: any[] = hJson.data || [];
        streakDays.value = logs.length;
        checkedInToday.value = logs.some((l) => l.date === todayStr);
      }
    }
  } catch {
    // ignore offline
  }
}

async function drawDailyCard() {
  try {
    const res = await fetch('/api/v1/calculator/buncho/draw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: '今日運勢微儀式指引', aspect: '綜合' }),
    });
    const json = await res.json();
    if (json.success) dailyLot.value = json.data.lot;
  } catch {}
}

async function checkInHabit() {
  if (checkedInToday.value || checkingIn.value) return;
  checkingIn.value = true;
  try {
    const headers = await authStore.getAuthHeaders();
    const res = await fetch('/api/v1/habits', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        date: todayStr,
        sleepHours: 7.5,
        sleepQuality: '良好',
        dietType: '均衡清淡',
        waterMl: 2000,
        exerciseMinutes: 30,
        energyLevel: 4,
        notes: `每日運勢微儀式打卡：${dailyMicroAction.value}`,
        tags: ['每日微儀式', dailyLot.value?.name || '開運行動'],
      }),
    });
    if (res.ok) {
      checkedInToday.value = true;
      streakDays.value += 1;
    } else {
      alert('請先登入會員或開啟 DEMO 模式以紀錄打卡天數');
    }
  } finally {
    checkingIn.value = false;
  }
}

onMounted(() => {
  loadTodayRitual();
  drawDailyCard();
});
</script>
