<template>
  <div class="max-w-7xl mx-auto px-3 sm:px-6 pt-28 pb-20 font-serif">
    <!-- 標題區 -->
    <div class="text-center mb-10">
      <div class="text-xs uppercase tracking-[0.25em] text-dark-gold mb-2 font-sans">
        QI ZHENG SI YU · IMPERIAL CELESTIAL ASTROLOGY
      </div>
      <h1 class="text-3xl sm:text-4xl font-bold text-gold-gradient mb-3">
        七政四餘天星排盤
      </h1>
      <p class="text-xs text-dark-muted max-w-2xl mx-auto leading-relaxed">
        果老星宗正統天星秘傳 · 日月五星與羅計氣孛 · 二十八宿度數度主 · 十二辰次命身恩難會照
      </p>
    </div>

    <!-- 頂部古意背景特色橫幅 -->
    <div class="relative rounded-2xl overflow-hidden mb-8 border border-dark-gold/30 shadow-cosmic max-w-5xl mx-auto h-40 sm:h-48">
      <img
        src="/images/oriental/bagua_astrolabe.jpg"
        alt="東方八卦天盤青銅渾天儀"
        class="w-full h-full object-cover object-center opacity-60 filter brightness-90 hover:scale-105 transition-transform duration-700"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-dark-void/90 via-dark-void/60 to-transparent flex flex-col justify-center px-8">
        <span class="text-[10px] tracking-widest text-dark-gold uppercase block mb-1">CHINESE CELESTIAL ASTROLABE</span>
        <h2 class="text-xl sm:text-2xl font-bold text-dark-gold">天星宿度·恩難交會</h2>
        <p class="text-xs text-dark-muted max-w-md mt-1">
          天道運轉以七政司命，四餘虛星照命度。命宮立處辨吉凶，三方拱照見造化。
        </p>
      </div>
    </div>

    <!-- 輸入控制列 -->
    <div class="glass-panel rounded-2xl p-6 mb-8 max-w-4xl mx-auto border border-dark-gold/25">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs text-dark-muted mb-1">出生西曆日期與時間</label>
          <input
            v-model="birthDateTime"
            type="datetime-local"
            class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
          />
        </div>
        <div>
          <label class="block text-xs text-dark-muted mb-1">經度 (校準真太陽時)</label>
          <input
            v-model.number="longitude"
            type="number"
            step="0.01"
            class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
          />
        </div>
        <div>
          <label class="block text-xs text-dark-muted mb-1">緯度</label>
          <input
            v-model.number="latitude"
            type="number"
            step="0.01"
            class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="handleCalculate"
            :disabled="loading"
            class="w-full py-2.5 rounded-lg text-xs font-bold bg-dark-gold text-dark-void hover:bg-yellow-500 shadow-cosmic transition-all disabled:opacity-50"
          >
            {{ loading ? '排演中...' : '推演七政星盤 ⚡' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 星盤核心展演區 -->
    <div v-if="chart" class="space-y-8">
      <!-- 命身格局與恩難四星概覽卡 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="glass-panel rounded-xl p-5 border border-dark-gold/30 flex items-center space-x-4">
          <div class="w-12 h-12 rounded-full border border-dark-gold bg-dark-gold/15 flex items-center justify-center text-lg text-dark-gold font-bold">
            命
          </div>
          <div>
            <span class="text-[10px] text-dark-muted block">命宮所在辰次</span>
            <div class="text-lg font-bold text-gold-gradient">{{ chart.mingPalaceStation }}次 ({{ chart.mingPalaceBranch }}宮)</div>
            <span class="text-[10px] text-dark-gold">命度宿：{{ chart.mingMansion }}</span>
          </div>
        </div>

        <div class="glass-panel rounded-xl p-5 border border-dark-gold/30 flex items-center space-x-4">
          <div class="w-12 h-12 rounded-full border border-dark-gold bg-dark-gold/15 flex items-center justify-center text-lg text-dark-gold font-bold">
            身
          </div>
          <div>
            <span class="text-[10px] text-dark-muted block">身宮所在辰次</span>
            <div class="text-lg font-bold text-gold-gradient">{{ chart.shenPalaceBranch }}宮 (太陰居所)</div>
            <span class="text-[10px] text-dark-muted">主後半生寄託與心性歸宿</span>
          </div>
        </div>

        <div class="glass-panel rounded-xl p-5 border border-dark-gold/30 flex items-center space-x-4">
          <div class="w-12 h-12 rounded-full border border-emerald-500/50 bg-emerald-950/40 flex items-center justify-center text-lg text-emerald-400 font-bold">
            恩
          </div>
          <div>
            <span class="text-[10px] text-dark-muted block">生我之恩星</span>
            <div class="text-lg font-bold text-emerald-300">{{ chart.fourStarRelations.generativeStar }}</div>
            <span class="text-[10px] text-emerald-400">逢之增福，逢凶化吉之守護</span>
          </div>
        </div>

        <div class="glass-panel rounded-xl p-5 border border-dark-gold/30 flex items-center space-x-4">
          <div class="w-12 h-12 rounded-full border border-rose-500/50 bg-rose-950/40 flex items-center justify-center text-lg text-rose-400 font-bold">
            難
          </div>
          <div>
            <span class="text-[10px] text-dark-muted block">剋我之難星</span>
            <div class="text-lg font-bold text-rose-300">{{ chart.fourStarRelations.restrainingStar }}</div>
            <span class="text-[10px] text-rose-400">行事宜慎，提防阻逆與破耗</span>
          </div>
        </div>
      </div>

      <!-- 七政四餘天星盤 (圓盤天體圖 + 詳解) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左側 2 欄：天星十二人事宮羅盤 -->
        <div class="lg:col-span-2 glass-panel rounded-2xl p-6 border border-dark-gold/30">
          <div class="flex items-center justify-between border-b border-dark-gold/20 pb-3 mb-6">
            <h3 class="font-bold text-sm text-gold-gradient">七政四餘天星十二宮位周天盤</h3>
            <span class="text-xs text-dark-muted">點選任意宮位查看星宿度數</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <div
              v-for="p in chart.palaces"
              :key="p.name"
              @click="selectedPalace = p"
              :class="[
                'p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between text-xs',
                selectedPalace?.name === p.name
                  ? 'border-dark-gold bg-dark-gold/20 shadow-cosmic'
                  : 'border-dark-gold/15 bg-black/30 hover:border-dark-gold/40',
              ]"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-sm text-dark-gold">{{ p.name }}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-dark-gold/20 text-dark-muted">
                  {{ p.branch }}·{{ p.stationName }}
                </span>
              </div>

              <!-- 宮主星 -->
              <div class="text-[10px] text-dark-muted mb-2">
                宮主：<span class="text-dark-text font-semibold">{{ p.rulerPlanet }}</span>
              </div>

              <!-- 居宮星曜 -->
              <div class="space-y-1 min-h-[36px]">
                <div v-if="p.residentPlanets.length" class="flex flex-wrap gap-1">
                  <span
                    v-for="star in p.residentPlanets"
                    :key="star"
                    class="text-[10px] px-1.5 py-0.5 rounded bg-dark-gold/20 text-dark-gold border border-dark-gold/30 font-semibold"
                  >
                    {{ star }}
                  </span>
                </div>
                <span v-else class="text-[10px] text-dark-muted italic">虛宮無星</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右側 1 欄：選中宮位與星曜入宿精細列表 -->
        <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 flex flex-col justify-between">
          <div>
            <div class="border-b border-dark-gold/20 pb-3 mb-4 flex items-center justify-between">
              <div>
                <span class="text-[10px] text-dark-muted">選中宮位詳情</span>
                <h4 class="text-xl font-bold text-gold-gradient">
                  {{ selectedPalace?.name }} ({{ selectedPalace?.stationName }})
                </h4>
              </div>
              <span class="text-xs px-2.5 py-1 rounded bg-dark-gold/15 text-dark-gold border border-dark-gold/30">
                主司：{{ selectedPalace?.rulerPlanet }}
              </span>
            </div>

            <!-- 宮內星曜入宿度數 -->
            <div class="mb-5">
              <h5 class="text-xs uppercase tracking-wider text-dark-gold mb-2">居宮星曜與入宿宿度</h5>
              <div v-if="selectedPalaceStars.length" class="space-y-2">
                <div
                  v-for="star in selectedPalaceStars"
                  :key="star.name"
                  class="p-2.5 rounded-lg bg-black/40 border border-dark-gold/15 text-xs flex items-center justify-between"
                >
                  <div>
                    <span class="font-bold text-dark-gold mr-1">{{ star.name }}</span>
                    <span class="text-[10px] text-dark-muted">({{ star.westernEquivalent }})</span>
                    <div class="text-[10px] text-dark-muted mt-0.5">
                      入 {{ star.mansionName }} {{ star.mansionDegree }}° · {{ star.status }}
                    </div>
                  </div>
                  <span
                    :class="
                      star.nature === 'BENEFIC'
                        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40'
                        : star.nature === 'MALEFIC'
                        ? 'text-rose-400 border-rose-500/30 bg-rose-950/40'
                        : 'text-dark-muted border-dark-gold/20 bg-black/30'
                    "
                    class="text-[10px] px-2 py-0.5 rounded border"
                  >
                    {{ star.nature === 'BENEFIC' ? '吉星' : star.nature === 'MALEFIC' ? '凶曜' : '中平' }}
                  </span>
                </div>
              </div>
              <p v-else class="text-xs text-dark-muted italic">本宮無星入駐，借對宮或三方拱照論斷。</p>
            </div>

            <!-- 三方四正拱照 -->
            <div class="p-3.5 rounded-xl bg-dark-gold/5 border border-dark-gold/15 text-xs text-dark-muted leading-relaxed">
              <strong class="text-dark-gold block mb-1">星相拱照奧秘：</strong>
              果老云：「主星得局，福壽雙全；凶煞交會，修善解厄」。吉曜照身主貴，煞曜相加重在自律持身。
            </div>
          </div>
        </div>
      </div>

      <!-- 七政四餘十一星天星度數全覽 -->
      <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30">
        <h3 class="font-bold text-sm text-gold-gradient mb-4">七政四餘天體周天坐標矩陣 (11 Celestial Bodies)</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div
            v-for="p in chart.planets"
            :key="p.name"
            class="p-3 rounded-xl bg-black/30 border border-dark-gold/15 space-y-1"
          >
            <div class="flex items-center justify-between">
              <span class="font-bold text-dark-gold">{{ p.name }}</span>
              <span class="text-[9px] px-1 rounded bg-black/40 border border-dark-gold/20 text-dark-muted">{{ p.type === 'GOVERNOR' ? '政' : '餘' }}</span>
            </div>
            <div class="text-[10px] text-dark-text">{{ p.stationName }} ({{ p.branch }}宮)</div>
            <div class="text-[10px] text-dark-muted truncate">{{ p.mansionName }} {{ p.mansionDegree }}°</div>
            <div class="text-[9px] text-dark-gold/80">{{ p.status }} · {{ p.eclipticDegree }}°</div>
          </div>
        </div>
      </div>

      <!-- 斷語綜合解析卡 -->
      <div class="glass-panel rounded-2xl p-8 border border-dark-gold/30 max-w-4xl mx-auto space-y-6">
        <h3 class="text-xl font-bold text-gold-gradient">七政天星總斷事態指引</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
          <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/15">
            <span class="font-bold text-dark-gold block mb-1">命度與平生格局：</span>
            <p class="text-dark-muted">{{ chart.verdict.lifeOverview }}</p>
          </div>
          <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/15">
            <span class="font-bold text-dark-gold block mb-1">官祿前程與財帛：</span>
            <p class="text-dark-muted">{{ chart.verdict.careerAndWealth }}</p>
          </div>
          <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/15">
            <span class="font-bold text-dark-gold block mb-1">夫妻情緣與交友：</span>
            <p class="text-dark-muted">{{ chart.verdict.marriageAndRelations }}</p>
          </div>
          <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/15">
            <span class="font-bold text-dark-gold block mb-1">天星趨吉避凶修持：</span>
            <p class="text-dark-muted">{{ chart.verdict.spiritualAdvice }}</p>
          </div>
        </div>
      </div>

      <!-- 🌌 果老星宗與古典天星宗師心法專區 (Guolao Celestial Astrology Masters) -->
      <div class="glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/35 shadow-cosmic max-w-4xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-dark-gold/20">
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-xs font-serif text-dark-gold uppercase tracking-wider">CLASSICAL CELESTIAL MASTERS</span>
              <span class="px-2 py-0.5 rounded text-[10px] bg-dark-gold/20 text-dark-gold border border-dark-gold/40 font-serif">RAG 宗師心法</span>
            </div>
            <h3 class="text-xl font-bold text-gold-gradient mt-1">
              果老星宗與耶律楚材天星宗師指引
            </h3>
          </div>
          <span class="text-xs text-dark-muted italic">「天步經緯各有定數 · 恩難制化修持由心」</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
          <div class="p-4 rounded-xl bg-black/40 border border-dark-gold/20 flex flex-col justify-between hover:border-dark-gold/50 transition-all">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-amber-300">張果老《果老星宗》</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300/90 border border-amber-500/30">天步經緯恩難制化</span>
              </div>
              <p class="text-dark-muted">
                「天步經緯，各有定數；星辰得失，恩難制化。」天體星宿之運行乃外在宇宙對人身之投影。身命同源，以恩星培養本元德行，以難星修持反躬自省。
              </p>
            </div>
            <span class="text-[10px] text-dark-gold/70 mt-3 pt-2 border-t border-dark-gold/10 font-serif">《果老星宗·命度經緯篇》</span>
          </div>

          <div class="p-4 rounded-xl bg-black/40 border border-dark-gold/20 flex flex-col justify-between hover:border-dark-gold/50 transition-all">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-cyan-300">耶律楚材天星法門</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300/90 border border-cyan-500/30">天人相應經緯統微</span>
              </div>
              <p class="text-dark-muted">
                「天道運行有常，吉凶非由天降，而是人與天行相感應。」知天行之常，修人事之敬慎，以剛柔中正應天度，自能逢凶化吉。
              </p>
            </div>
            <span class="text-[10px] text-dark-gold/70 mt-3 pt-2 border-t border-dark-gold/10 font-serif">《西遊錄·星曆考釋》</span>
          </div>
        </div>
      </div>

      <!-- 🌟 AI 靈犀全幅深度解析專區 (位於下方一整列，長文自動展開，高雅閱讀) -->
      <InPageAiAnalysis
        v-if="chart"
        module-type="QIZHENG"
        :title="`七政四餘 (${stationText}次·命居${branchText})`"
        :summary="`命度: ${mansionText} · 恩星: ${generativeStarText}`"
        :raw-data="chart"
        :prompt="aiPrompt"
        button-text="✨ 啟動 AI 古典七政四餘天星度數深度解盤（融匯果老星宗心法）"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { calculateQizhengChart, QizhengChart, QizhengPalace } from '@celestial/astro-core';
import InPageAiAnalysis from '../components/ai/InPageAiAnalysis.vue';

const birthDateTime = ref('1995-10-24T08:30');
const longitude = ref(121.56);
const latitude = ref(25.03);
const loading = ref(false);
const chart = ref<QizhengChart | null>(null);
const selectedPalace = ref<QizhengPalace | null>(null);

const stationText = computed(() => chart.value?.mingPalaceStation || '');
const branchText = computed(() => chart.value?.mingPalaceBranch || '');
const mansionText = computed(() => chart.value?.mingMansion || '');
const generativeStarText = computed(() => chart.value?.fourStarRelations?.generativeStar || '');

const aiPrompt = computed(() => {
  if (!chart.value) return '';
  const station = stationText.value;
  const branch = branchText.value;
  const mansion = mansionText.value;
  const rulerStar = chart.value.fourStarRelations?.rulerStar || '';
  const generativeStar = generativeStarText.value;
  const restrainingStar = chart.value.fourStarRelations?.restrainingStar || '';
  const shenBranch = chart.value.shenPalaceBranch || '';
  return `請以古典七政四餘天星學家身份，宗承張果老《果老星宗》與耶律楚材天星統微法脈，為我深度批註此天星命盤：命立「${station}」次（${branch}宮），命度入「${mansion}」，主星為「${rulerStar}」，生我之恩星為「${generativeStar}」，剋我之難星為「${restrainingStar}」，身宮在「${shenBranch}」。請以嚴謹考究的天文宿度與果老星宗法門，詳評天命格局、恩難生剋、宮度得失與趨吉避凶之具體修為心法。`;
});

function handleCalculate() {
  loading.value = true;
  try {
    const res = calculateQizhengChart(new Date(birthDateTime.value), Number(longitude.value), Number(latitude.value));
    chart.value = res;
    selectedPalace.value = res.palaces[0]; // 預設選中命宮
  } finally {
    loading.value = false;
  }
}

const selectedPalaceStars = computed(() => {
  if (!chart.value || !selectedPalace.value) return [];
  return chart.value.planets.filter((p) => p.branch === selectedPalace.value!.branch);
});

onMounted(() => {
  handleCalculate();
});
</script>
