<template>
  <div class="max-w-7xl mx-auto px-3 sm:px-6 pt-28 pb-20 font-serif">
    <div class="text-center mb-10">
      <div class="text-xs uppercase tracking-[0.25em] text-dark-gold mb-2 font-sans">
        HOLOGRAPHIC MULTI-SYSTEM SYNTHESIS
      </div>
      <h1 class="text-3xl sm:text-4xl font-bold text-gold-gradient mb-3">
        一鍵全息命格合參中樞
      </h1>
      <p class="text-xs sm:text-sm text-dark-muted max-w-2xl mx-auto leading-relaxed">
        打破單一派別孤島：同步調用【四柱八字 × 紫微斗數 × 西洋占星 × 七政四餘】四大引擎，自動提煉高共識能量訊號與風險衝突提醒。
      </p>
    </div>

    <!-- 輸入表單與大師流派視角切換 -->
    <div class="glass-panel rounded-2xl p-6 max-w-4xl mx-auto border border-dark-gold/30 shadow-cosmic mb-10 space-y-5">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs text-dark-muted mb-1">姓名 / 稱呼</label>
          <input v-model="form.name" type="text" placeholder="命主" class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs outline-none focus:border-dark-gold" />
        </div>
        <div>
          <label class="block text-xs text-dark-muted mb-1">性別</label>
          <select v-model="form.gender" class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs outline-none focus:border-dark-gold">
            <option value="男">男 (乾造)</option>
            <option value="女">女 (坤造)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-dark-muted mb-1">出生日期時間</label>
          <input v-model="form.birthDate" type="datetime-local" class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs outline-none focus:border-dark-gold" />
        </div>
        <div>
          <label class="block text-xs text-dark-muted mb-1">出生地經度</label>
          <input v-model.number="form.longitude" type="number" step="0.01" class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs outline-none focus:border-dark-gold" />
        </div>
      </div>

      <!-- 解盤大師流派視角 -->
      <div class="space-y-2">
        <span class="text-xs text-dark-gold font-bold block">選擇 AI 全息合參分析口吻：</span>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            v-for="s in masterStyles"
            :key="s.id"
            type="button"
            @click="selectedStyle = s.id"
            :class="selectedStyle === s.id ? 'border-dark-gold bg-dark-gold/15 text-dark-gold font-bold' : 'border-dark-gold/20 bg-black/30 text-dark-muted'"
            class="p-3 rounded-xl border text-left transition-all cursor-pointer"
          >
            <div class="text-xs">{{ s.icon }} {{ s.label }}</div>
            <div class="text-[11px] opacity-80 mt-0.5 font-sans">{{ s.desc }}</div>
          </button>
        </div>
      </div>

      <div class="flex justify-center pt-2">
        <button
          @click="runHolographic"
          :disabled="loading"
          class="px-8 py-3 rounded-full bg-dark-gold text-dark-void font-bold text-sm hover:opacity-90 shadow-cosmic transition-all cursor-pointer disabled:opacity-50"
        >
          {{ loading ? '四維星盤合參運算中...' : '✨ 啟動一鍵全息命格合參' }}
        </button>
      </div>
    </div>

    <!-- 全息合參報告結果 -->
    <div v-if="report" class="space-y-8">
      <div ref="posterCardRef" class="glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/40 shadow-cosmic space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-gold/20 pb-4">
          <div>
            <span class="text-[11px] font-mono text-dark-gold uppercase">Holographic Destiny Matrix</span>
            <h2 class="text-xl sm:text-2xl font-bold text-gold-gradient mt-1">
              {{ report.synthesis.summaryHeadline }}
            </h2>
          </div>
          <SharePosterButton :target-ref="posterCardRef" filename="holographic-report" label="下載全息合參海報" />
        </div>

        <!-- 四大引擎核心坐標 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/20 space-y-1">
            <div class="text-[11px] text-dark-gold font-bold">📜 四柱八字</div>
            <div class="text-sm font-bold">日主 {{ report.engines.bazi.dayMaster.stem }} ({{ report.engines.bazi.dayMaster.element }})</div>
            <div class="text-xs text-dark-muted">喜用：{{ (report.engines.bazi.favorableElements?.useful || []).join('、') }}</div>
          </div>
          <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/20 space-y-1">
            <div class="text-[11px] text-dark-gold font-bold">🌌 紫微斗數</div>
            <div class="text-sm font-bold">{{ report.engines.ziwei.fiveElementBureau }} · 命宮{{ report.engines.ziwei.lifePalaceBranch }}</div>
            <div class="text-xs text-dark-muted">命主：{{ report.engines.ziwei.lifeMasterStar }}</div>
          </div>
          <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/20 space-y-1">
            <div class="text-[11px] text-dark-gold font-bold">♈ 西洋占星</div>
            <div class="text-sm font-bold">太陽 {{ getPlanetSign('太陽') }} · 月亮 {{ getPlanetSign('月亮') }}</div>
            <div class="text-xs text-dark-muted">月相：{{ report.engines.western.lunarPhase?.phaseName }}</div>
          </div>
          <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/20 space-y-1">
            <div class="text-[11px] text-dark-gold font-bold">🪐 七政四餘</div>
            <div class="text-sm font-bold">命度 {{ report.engines.qizheng.mingMansion }}</div>
            <div class="text-xs text-dark-muted">恩星：{{ report.engines.qizheng.fourStarRelations?.generativeStar }}</div>
          </div>
        </div>

        <!-- 高共識訊號 & 衝突提醒 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
            <h3 class="text-sm font-bold text-emerald-300">✦ 跨派別高共識訊號 (Consensus Signals)</h3>
            <div v-for="(sig, idx) in report.synthesis.consensusSignals" :key="idx" class="p-3 rounded-lg bg-black/30 space-y-1">
              <div class="text-xs font-bold text-emerald-200">{{ sig.dimension }} · {{ sig.title }}</div>
              <p class="text-xs text-dark-muted leading-relaxed">{{ sig.evidence }}</p>
            </div>
          </div>

          <div class="p-5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-3">
            <h3 class="text-sm font-bold text-amber-300">⚠️ 跨系統張力與風險提醒 (Conflict Alerts)</h3>
            <div v-if="report.synthesis.conflictAlerts.length === 0" class="text-xs text-dark-muted">
              四大系統能量配置均衡，未偵測到明顯化忌沖剋失衡訊號。
            </div>
            <div v-for="(alert, idx) in report.synthesis.conflictAlerts" :key="idx" class="p-3 rounded-lg bg-black/30 space-y-1">
              <div class="text-xs font-bold text-amber-200">{{ alert.area }} · {{ alert.title }}</div>
              <p class="text-xs text-dark-muted leading-relaxed">{{ alert.advice }}</p>
            </div>
          </div>
        </div>
      </div>

      <InPageAiAnalysis
        module-type="HOLOGRAPHIC"
        :title="`全息四維合參 · ${form.name}`"
        :summary="report.synthesis.summaryHeadline"
        :raw-data="report"
        :prompt="aiPrompt"
        button-text="✨ 啟動全息合參 AI 大師深度総評"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import SharePosterButton from '../components/common/SharePosterButton.vue';
import InPageAiAnalysis from '../components/ai/InPageAiAnalysis.vue';

const route = useRoute();
const posterCardRef = ref<HTMLElement | null>(null);
const loading = ref(false);
const report = ref<any>(null);
const selectedStyle = ref<'classical' | 'psychological' | 'pragmatic'>('pragmatic');

const masterStyles = [
  { id: 'classical' as const, icon: '📜', label: '古籍經典派', desc: '援引子平、三合、果老古典理法' },
  { id: 'psychological' as const, icon: '🧠', label: '現代心理諮商派', desc: '榮格原型與內在潛意識對話' },
  { id: 'pragmatic' as const, icon: '🎯', label: '白話直球決策派', desc: '直擊行動策略、財官時機與避坑指南' },
];

const form = ref({
  name: String(route.query.name || '命主'),
  gender: (route.query.gender === '女' ? '女' : '男') as '男' | '女',
  birthDate: String(route.query.birthDate || '1992-06-18T10:30'),
  longitude: Number(route.query.longitude || 121.56),
  latitude: Number(route.query.latitude || 25.03),
});

function getPlanetSign(name: string): string {
  const planets: any[] = report.value?.engines?.western?.planets || [];
  return planets.find((p) => p.name === name)?.sign || '—';
}

const aiPrompt = computed(() => {
  const styleDesc = masterStyles.find((s) => s.id === selectedStyle.value)?.label || '白話直球決策派';
  return `請以【${styleDesc}】大師口吻，為我進行【八字 × 紫微 × 西占 × 七政四餘】全息四維合參深度解析，重點分析高共識優勢窗口與跨系統衝突風險的應對方案。`;
});

async function runHolographic() {
  loading.value = true;
  try {
    const res = await fetch('/api/v1/calculator/holographic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    });
    const json = await res.json();
    if (json.success) {
      report.value = json.data;
    } else {
      alert(json.message || '全息合參失敗');
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (route.query.birthDate) {
    runHolographic();
  }
});
</script>
