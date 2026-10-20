<template>
  <div class="max-w-7xl mx-auto px-6 pt-28 pb-20 font-serif">
    <!-- 頂部古風金箔天書特色橫幅 -->
    <div class="relative rounded-2xl overflow-hidden mb-8 border border-dark-gold/30 shadow-cosmic max-w-5xl mx-auto h-44 sm:h-52">
      <img
        src="/images/almanac/almanac_banner.jpg"
        alt="傳統黃曆金箔天書"
        class="w-full h-full object-cover object-center opacity-65 filter brightness-95 hover:scale-105 transition-transform duration-700"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-dark-void/90 via-dark-void/60 to-transparent flex flex-col justify-center px-8">
        <span class="text-[10px] tracking-widest text-dark-gold uppercase block mb-1 font-sans">IMPERIAL CELESTIAL ALMANAC</span>
        <h1 class="text-2xl sm:text-3xl font-bold text-gold-gradient">
          萬象天儀·每日通勝黃曆
        </h1>
        <p class="text-xs text-dark-muted max-w-lg mt-1.5 leading-relaxed">
          欽定協紀辨方正宗 · 二十四節氣干支氣化 · 建除十二神吉凶 · 二十八宿禽星值日 · 每日生肖吉凶宜忌
        </p>
      </div>
    </div>

    <!-- 日期選擇與快捷切換 -->
    <div class="glass-panel rounded-2xl p-5 mb-8 max-w-3xl mx-auto border border-dark-gold/25 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center space-x-2">
        <button
          @click="changeDay(-1)"
          class="px-3 py-1.5 rounded-lg border border-dark-gold/30 text-xs text-dark-gold hover:bg-dark-gold/10 transition-colors"
        >
          ‹ 前一日
        </button>
        <button
          @click="setToday"
          class="px-3.5 py-1.5 rounded-lg bg-dark-gold/20 border border-dark-gold text-xs text-dark-gold font-bold hover:bg-dark-gold hover:text-dark-void transition-all shadow-cosmic"
        >
          今日
        </button>
        <button
          @click="changeDay(1)"
          class="px-3 py-1.5 rounded-lg border border-dark-gold/30 text-xs text-dark-gold hover:bg-dark-gold/10 transition-colors"
        >
          次一日 ›
        </button>
      </div>

      <div class="flex items-center space-x-2 w-full sm:w-auto">
        <label class="text-xs text-dark-muted whitespace-nowrap">自選日期：</label>
        <input
          v-model="selectedDate"
          @change="fetchAlmanac"
          type="date"
          class="px-3 py-1.5 rounded-lg bg-black/40 border border-dark-gold/30 text-xs text-dark-text focus:border-dark-gold outline-none"
        />
      </div>
    </div>

    <!-- 黃曆主體天書卷軸 -->
    <div v-if="almanac" class="space-y-8 max-w-5xl mx-auto">
      <!-- 經典農曆日期大牌 -->
      <div class="glass-panel rounded-2xl p-8 border border-dark-gold/30 relative overflow-hidden">
        <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-dark-gold/20 pb-6 mb-6">
          <div>
            <div class="flex items-center space-x-3 mb-2">
              <span class="px-2.5 py-0.5 rounded-full bg-dark-gold/20 text-dark-gold border border-dark-gold/40 text-xs font-bold">
                歲次 {{ almanac.lunarDate.yearGanZhi }}【生肖{{ almanac.lunarDate.zodiacAnimal }}】
              </span>
              <span class="text-xs text-dark-muted">節氣：{{ almanac.solarTerm }}</span>
              <span class="text-xs text-dark-gold">納音：{{ almanac.nayinDay }}</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-bold text-gold-gradient">
              {{ almanac.lunarDate.formatted }}
            </h2>
            <div class="text-xs text-dark-muted mt-1">
              公曆 {{ almanac.date }} · 干支年月日時：【{{ almanac.ganzhi.year }}年 {{ almanac.ganzhi.month }}月 {{ almanac.ganzhi.day }}日】
            </div>
          </div>

          <!-- 右側三大值日印信 -->
          <div class="flex flex-wrap sm:flex-nowrap gap-3">
            <div class="p-3.5 rounded-xl bg-black/40 border border-dark-gold/20 text-center min-w-[90px]">
              <span class="text-[10px] text-dark-muted block">建除值神</span>
              <div class="text-lg font-bold text-dark-gold my-0.5">【{{ almanac.dayOfficer.name }}日】</div>
              <span
                :class="
                  almanac.dayOfficer.nature === '吉'
                    ? 'text-emerald-400'
                    : almanac.dayOfficer.nature === '凶'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                "
                class="text-[10px] font-bold"
              >
                值神·{{ almanac.dayOfficer.nature }}
              </span>
            </div>

            <div class="p-3.5 rounded-xl bg-black/40 border border-dark-gold/20 text-center min-w-[90px]">
              <span class="text-[10px] text-dark-muted block">二十八宿</span>
              <div class="text-lg font-bold text-dark-gold my-0.5">{{ almanac.twentyEightMansion.mansionName.split(' ')[0] }}</div>
              <span
                :class="almanac.twentyEightMansion.nature === '吉' ? 'text-emerald-400' : 'text-rose-400'"
                class="text-[10px] font-bold"
              >
                禽星·{{ almanac.twentyEightMansion.nature }}
              </span>
            </div>

            <div class="p-3.5 rounded-xl bg-black/40 border border-dark-gold/20 text-center min-w-[90px]">
              <span class="text-[10px] text-dark-muted block">紫白九星</span>
              <div class="text-lg font-bold text-dark-gold my-0.5">{{ almanac.nineFlyingStar.name }}</div>
              <span class="text-[10px] text-dark-muted">{{ almanac.nineFlyingStar.nature.split('·')[0] }}</span>
            </div>
          </div>
        </div>

        <!-- 宜忌大牌 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 宜 -->
          <div class="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
            <div class="flex items-center space-x-2 mb-3">
              <span class="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">宜</span>
              <span class="text-sm font-bold text-emerald-300">今日適宜百事：</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="act in almanac.suitableActivities"
                :key="act"
                class="px-2.5 py-1 rounded-md text-xs bg-emerald-950/60 text-emerald-200 border border-emerald-500/30 font-semibold"
              >
                {{ act }}
              </span>
            </div>
          </div>

          <!-- 忌 -->
          <div class="p-5 rounded-xl bg-rose-950/20 border border-rose-500/30">
            <div class="flex items-center space-x-2 mb-3">
              <span class="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">忌</span>
              <span class="text-sm font-bold text-rose-300">今日忌諱戒慎：</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="act in almanac.unsuitableActivities"
                :key="act"
                class="px-2.5 py-1 rounded-md text-xs bg-rose-950/60 text-rose-200 border border-rose-500/30 font-semibold"
              >
                {{ act }}
              </span>
            </div>
          </div>
        </div>

        <!-- 建除與星宿歌訣詳解 -->
        <div class="mt-6 p-4 rounded-xl bg-black/30 border border-dark-gold/15 text-xs text-dark-muted space-y-2">
          <div class="flex items-start space-x-2">
            <span class="text-dark-gold font-bold whitespace-nowrap">【{{ almanac.dayOfficer.name }}日義解】：</span>
            <span>{{ almanac.dayOfficer.meaning }}</span>
          </div>
          <div class="flex items-start space-x-2">
            <span class="text-dark-gold font-bold whitespace-nowrap">【宿星歌訣】：</span>
            <span class="italic text-dark-text/90">{{ almanac.twentyEightMansion.chant }}</span>
          </div>
        </div>
      </div>

      <!-- 吉神方位與衝煞羅盤 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 五大吉神方位 -->
        <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 space-y-4">
          <h3 class="text-sm font-bold text-gold-gradient border-b border-dark-gold/15 pb-2">
            每日吉神福曜方位 (Lucky Deities)
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div class="p-3 rounded-lg bg-black/40 border border-dark-gold/15 text-center">
              <span class="text-[10px] text-dark-muted block">喜神方位</span>
              <span class="text-sm font-bold text-dark-gold">{{ almanac.deityDirections.joyGod }}</span>
            </div>
            <div class="p-3 rounded-lg bg-black/40 border border-dark-gold/15 text-center">
              <span class="text-[10px] text-dark-muted block">財神方位</span>
              <span class="text-sm font-bold text-dark-gold">{{ almanac.deityDirections.wealthGod }}</span>
            </div>
            <div class="p-3 rounded-lg bg-black/40 border border-dark-gold/15 text-center">
              <span class="text-[10px] text-dark-muted block">福神方位</span>
              <span class="text-sm font-bold text-dark-gold">{{ almanac.deityDirections.blessingGod }}</span>
            </div>
            <div class="p-3 rounded-lg bg-black/40 border border-dark-gold/15 text-center">
              <span class="text-[10px] text-dark-muted block">陽貴神</span>
              <span class="text-sm font-bold text-dark-gold">{{ almanac.deityDirections.yangNoble }}</span>
            </div>
            <div class="p-3 rounded-lg bg-black/40 border border-dark-gold/15 text-center">
              <span class="text-[10px] text-dark-muted block">陰貴神</span>
              <span class="text-sm font-bold text-dark-gold">{{ almanac.deityDirections.yinNoble }}</span>
            </div>
            <div class="p-3 rounded-lg bg-black/40 border border-dark-gold/15 text-center">
              <span class="text-[10px] text-dark-muted block">生肖衝煞</span>
              <span class="text-sm font-bold text-rose-400">{{ almanac.clashInfo.clashAnimal }}</span>
            </div>
          </div>
          <div class="text-[11px] text-dark-muted bg-black/20 p-2.5 rounded-lg border border-dark-gold/10">
            {{ almanac.clashInfo.evilAnimalAges }}，出門求財見貴，宜朝喜神、財神吉方行步。
          </div>
        </div>

        <!-- 十二時辰吉凶輪次 -->
        <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 space-y-4">
          <h3 class="text-sm font-bold text-gold-gradient border-b border-dark-gold/15 pb-2">
            十二時辰吉凶行度 (Hourly Fortunes)
          </h3>
          <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
            <div
              v-for="h in almanac.hourlyFortunes"
              :key="h.branch"
              :class="
                h.isAuspicious
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                  : 'border-dark-gold/10 bg-black/30 text-dark-muted'
              "
              class="p-2 rounded-lg border text-center transition-colors"
            >
              <div class="font-bold">{{ h.branch }}時</div>
              <div class="text-[9px] opacity-80">{{ h.timeSpan }}</div>
              <div class="text-[10px] font-semibold mt-0.5">
                {{ h.spiritName }} ({{ h.isAuspicious ? '吉' : '凶' }})
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 十二生肖今日運勢大盤 -->
      <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 space-y-6">
        <div class="flex items-center justify-between border-b border-dark-gold/15 pb-3">
          <div>
            <h3 class="text-sm font-bold text-gold-gradient">十二生肖今日運勢排行榜 (Zodiac Daily Fortune)</h3>
            <p class="text-xs text-dark-muted mt-0.5">依據地支六合、六沖、三合與生剋推導</p>
          </div>
          <span class="text-xs text-dark-gold font-semibold">點選生肖查看個人建言</span>
        </div>

        <!-- 生肖切換標籤 -->
        <div class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 text-xs text-center">
          <button
            v-for="z in almanac.zodiacHoroscopes"
            :key="z.animal"
            @click="selectedZodiac = z"
            :class="
              selectedZodiac?.animal === z.animal
                ? 'border-dark-gold bg-dark-gold/25 text-dark-gold font-bold shadow-cosmic'
                : 'border-dark-gold/15 bg-black/30 text-dark-muted hover:border-dark-gold/40'
            "
            class="p-2.5 rounded-xl border transition-all flex flex-col items-center"
          >
            <span class="text-sm font-bold">{{ z.animal }}</span>
            <span class="text-[10px] mt-1 text-dark-gold">{{ z.score }}分</span>
          </button>
        </div>

        <!-- 選中生肖今日詳評 -->
        <div v-if="selectedZodiac" class="p-5 rounded-xl bg-black/40 border border-dark-gold/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="space-y-1.5 flex-1">
            <div class="flex items-center space-x-3">
              <span class="text-lg font-bold text-dark-gold">生肖【{{ selectedZodiac.animal }}】今日運勢：</span>
              <span class="text-xs px-2.5 py-0.5 rounded bg-dark-gold/15 text-dark-gold border border-dark-gold/30 font-bold">
                {{ selectedZodiac.tag }}
              </span>
              <span class="text-amber-400 text-xs">
                {{ '★'.repeat(selectedZodiac.stars) }}{{ '☆'.repeat(5 - selectedZodiac.stars) }}
              </span>
            </div>
            <p class="text-xs text-dark-text leading-relaxed">
              {{ selectedZodiac.advice }}
            </p>
          </div>
          <div class="text-center sm:border-l sm:border-dark-gold/20 sm:pl-6">
            <div class="text-2xl font-bold text-gold-gradient">{{ selectedZodiac.score }}</div>
            <div class="text-[10px] text-dark-muted">運勢指數</div>
          </div>
        </div>
      </div>

      <!-- 十天干日主指南 -->
      <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 space-y-4">
        <h3 class="text-sm font-bold text-gold-gradient border-b border-dark-gold/15 pb-2">
          八字日主今日十神流日指引 (Day Master Resonance)
        </h3>
        <p class="text-xs text-dark-muted">已知自己八字日主天干者，可對照今日十神引動心法：</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div
            v-for="(info, stem) in almanac.dayMasterGuidance"
            :key="stem"
            class="p-3 rounded-xl bg-black/30 border border-dark-gold/15 space-y-1"
          >
            <div class="flex items-center justify-between">
              <span class="font-bold text-dark-gold">{{ stem }}木日主</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-dark-gold/15 text-dark-gold border border-dark-gold/30 font-semibold">
                值{{ info.tenGod }}
              </span>
            </div>
            <p class="text-[11px] text-dark-muted leading-relaxed line-clamp-3">
              {{ info.guidance }}
            </p>
          </div>
        </div>
      </div>

      <!-- 頁面內動態 AI 靈犀解讀 (支援原地思考計時碼表與結果動態呈現) -->
      <InPageAiAnalysis
        v-if="almanac"
        module-type="ALMANAC"
        :title="`通勝黃曆 (${almanac.date || ''}·${officerName}日)`"
        :summary="`${lunarStr} · 衝${clashAnimal}`"
        :raw-data="almanac"
        :prompt="aiPrompt"
        button-text="✨ 啟動 AI 通勝曆法與生活擇吉深度指引"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { calculateDailyAlmanac, DailyAlmanac, ZodiacHoroscope } from '@celestial/astro-core';
import InPageAiAnalysis from '../components/ai/InPageAiAnalysis.vue';

const selectedDate = ref(new Date().toISOString().split('T')[0]);
const almanac = ref<DailyAlmanac | null>(null);
const selectedZodiac = ref<ZodiacHoroscope | null>(null);

const lunarStr = computed(() => almanac.value?.lunarDate?.formatted || '今日農曆');
const officerName = computed(() => almanac.value?.dayOfficer?.name || '建');
const officerNature = computed(() => almanac.value?.dayOfficer?.nature || '吉');
const mansionName = computed(() => almanac.value?.twentyEightMansion?.mansionName || '星宿');
const clashAnimal = computed(() => almanac.value?.clashInfo?.clashAnimal || '生肖');

const aiPrompt = computed(() => {
  if (!almanac.value) return '';
  const suitables = almanac.value.suitableActivities ? almanac.value.suitableActivities.slice(0, 5).join('、') : '祭祀、祈福';
  const unsuitables = almanac.value.unsuitableActivities ? almanac.value.unsuitableActivities.slice(0, 4).join('、') : '嫁娶、動土';
  return `請以傳統民俗曆法與生活擇吉顧問身份，為我解析今日黃曆運勢：值農曆「${lunarStr.value}」，日值十二神之「${officerName.value}日（${officerNature.value}）」，二十八宿為「${mansionName.value}」，衝煞為「${clashAnimal.value}」。今日宜【${suitables}】，忌【${unsuitables}】。請以親和平實、貼近現代生活的視角，剖析今日時令特質、重要活動避坑提醒、生肖沖煞化解以及如何順應天時安排生活節奏。`;
});

function fetchAlmanac() {
  const target = new Date(selectedDate.value);
  const data = calculateDailyAlmanac(target);
  almanac.value = data;
  selectedZodiac.value = data.zodiacHoroscopes[0]; // 預設鼠
}

function setToday() {
  selectedDate.value = new Date().toISOString().split('T')[0];
  fetchAlmanac();
}

function changeDay(delta: number) {
  const cur = new Date(selectedDate.value);
  cur.setDate(cur.getDate() + delta);
  selectedDate.value = cur.toISOString().split('T')[0];
  fetchAlmanac();
}

onMounted(() => {
  fetchAlmanac();
});
</script>
