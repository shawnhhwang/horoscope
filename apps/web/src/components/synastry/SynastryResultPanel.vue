<template>
  <div ref="posterRef" class="space-y-8 animate-fade-in">
    <!-- 綜合契合度評分徽章與總結 -->
    <div class="glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/35 shadow-cosmic max-w-4xl mx-auto text-center relative overflow-hidden">
      <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-dark-gold/15 border border-dark-gold/30 text-xs text-dark-gold mb-3">
        <span>✨ 雙造八字因緣綜合評定</span>
      </div>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-6 my-4">
        <div class="w-28 h-28 rounded-full border-4 border-dark-gold bg-gradient-to-tr from-black via-dark-nebula to-dark-gold/20 flex flex-col items-center justify-center shadow-cosmic">
          <span class="text-3xl font-bold text-gold-gradient font-sans">{{ synastryResult.score }}</span>
          <span class="text-[10px] text-dark-muted uppercase tracking-wider">COMPATIBILITY</span>
        </div>
        <div class="text-center sm:text-left">
          <h3 class="text-2xl font-bold text-dark-gold mb-1">{{ synastryResult.level }}</h3>
          <p class="text-xs text-dark-text max-w-lg leading-relaxed">{{ synastryResult.summary }}</p>
        </div>
      </div>
    </div>

    <!-- 雙方四柱干支並列對比卡 -->
    <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 max-w-4xl mx-auto">
      <h3 class="text-sm font-bold text-gold-gradient mb-4">二造八字四柱干支對照 (Four Pillars Side-by-Side)</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div
          v-for="(person, idx) in [synastryResult.person1, synastryResult.person2]"
          :key="person.name + idx"
          :class="idx === 0 ? 'border-amber-500/30' : 'border-rose-500/30'"
          class="p-4 rounded-xl bg-black/40 border"
        >
          <div :class="idx === 0 ? 'border-amber-500/20' : 'border-rose-500/20'" class="flex justify-between items-center mb-2 pb-1 border-b">
            <span :class="idx === 0 ? 'text-amber-300' : 'text-rose-300'" class="font-bold">{{ person.name }}</span>
            <span class="text-[10px] text-dark-muted">{{ person.energyStatus }} · 日主{{ person.dayMaster }}</span>
          </div>
          <div class="font-mono text-dark-gold font-bold text-sm tracking-wider mb-2">{{ person.fourPillarsText }}</div>
          <div class="text-[11px] text-dark-muted leading-relaxed">喜用神：{{ person.chart.favorableElements.useful.join('、') }}</div>
        </div>
      </div>
    </div>

    <!-- 四大核心維度深度解構卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-gold-gradient">1. 日元天干相合與情義</span>
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-dark-gold/15 text-dark-gold border border-dark-gold/30">
              {{ synastryResult.dimensions.dayMasterSynergy.score }}/25 分 ({{ synastryResult.dimensions.dayMasterSynergy.relationType }})
            </span>
          </div>
          <p class="text-xs text-dark-text leading-relaxed mb-3">{{ synastryResult.dimensions.dayMasterSynergy.description }}</p>
        </div>
        <div class="p-2.5 rounded-lg bg-black/30 border border-dark-gold/15 text-[11px] text-dark-muted">
          💡 建議：{{ synastryResult.dimensions.dayMasterSynergy.advice }}
        </div>
      </div>

      <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-gold-gradient">2. 夫妻宮日支默契與生活</span>
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-dark-gold/15 text-dark-gold border border-dark-gold/30">
              {{ synastryResult.dimensions.spousePalaceSynergy.score }}/25 分 ({{ synastryResult.dimensions.spousePalaceSynergy.relationType }})
            </span>
          </div>
          <p class="text-xs text-dark-text leading-relaxed mb-3">{{ synastryResult.dimensions.spousePalaceSynergy.description }}</p>
        </div>
        <div class="p-2.5 rounded-lg bg-black/30 border border-dark-gold/15 text-[11px] text-dark-muted">
          💡 建議：{{ synastryResult.dimensions.spousePalaceSynergy.advice }}
        </div>
      </div>

      <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-gold-gradient">3. 五行能量互補與喜用互濟</span>
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-dark-gold/15 text-dark-gold border border-dark-gold/30">
              {{ synastryResult.dimensions.fiveElementsComplementarity.score }}/30 分
            </span>
          </div>
          <p class="text-xs text-dark-text leading-relaxed mb-2">{{ synastryResult.dimensions.fiveElementsComplementarity.usefulElementsSupport }}</p>
          <p class="text-xs text-dark-muted leading-relaxed">{{ synastryResult.dimensions.fiveElementsComplementarity.lackingElementsBalance }}</p>
        </div>
      </div>

      <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-gold-gradient">4. 年柱根基與家族融合</span>
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-dark-gold/15 text-dark-gold border border-dark-gold/30">
              {{ synastryResult.dimensions.yearPillarSynergy.score }}/20 分
            </span>
          </div>
          <p class="text-xs text-dark-text leading-relaxed mb-2">{{ synastryResult.dimensions.yearPillarSynergy.description }}</p>
          <span class="text-[11px] text-amber-300 font-mono block">
            {{ synastryResult.dimensions.yearPillarSynergy.naYinRelation }} · {{ synastryResult.dimensions.yearPillarSynergy.zodiacRelation }}
          </span>
        </div>
      </div>
    </div>

    <!-- 五行通關金鑰卡片 (Bridging Element) -->
    <div class="glass-panel rounded-2xl p-6 border border-dark-gold/35 max-w-4xl mx-auto bg-gradient-to-r from-dark-void via-dark-nebula to-black">
      <div class="flex items-center space-x-3 mb-3">
        <div class="w-9 h-9 rounded-full border border-dark-gold bg-dark-gold/20 flex items-center justify-center font-bold text-dark-gold">
          {{ synastryResult.bridgingElement.element }}
        </div>
        <div>
          <span class="text-[10px] text-dark-muted uppercase font-sans">BRIDGING FIVE ELEMENT</span>
          <h4 class="text-sm font-bold text-dark-gold">關鍵通關五行：【{{ synastryResult.bridgingElement.element }}】調和法門</h4>
        </div>
      </div>
      <p class="text-xs text-dark-text leading-relaxed mb-3">{{ synastryResult.bridgingElement.explanation }}</p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div v-for="(tip, idx) in synastryResult.bridgingElement.dailyTips" :key="idx" class="p-2.5 rounded-lg bg-black/40 border border-dark-gold/15 text-[11px] text-dark-muted leading-relaxed">
          ✦ {{ tip }}
        </div>
      </div>
    </div>

    <!-- 四柱逐層交叉對照表 -->
    <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 max-w-4xl mx-auto overflow-x-auto">
      <h3 class="text-sm font-bold text-gold-gradient mb-3">四柱逐層深層交叉會照表</h3>
      <table class="w-full text-xs text-left border-collapse">
        <thead>
          <tr class="border-b border-dark-gold/20 text-dark-muted">
            <th class="py-2.5 px-3 font-serif">柱位</th>
            <th class="py-2.5 px-3 font-mono">{{ synastryResult.person1.name }} (乾)</th>
            <th class="py-2.5 px-3 font-mono">{{ synastryResult.person2.name }} (坤)</th>
            <th class="py-2.5 px-3 font-serif">干支關係</th>
            <th class="py-2.5 px-3 font-serif">相處徵兆</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in synastryResult.fourPillarsDetailedCross" :key="row.pillarName" class="border-b border-dark-gold/10 hover:bg-white/5 transition-colors">
            <td class="py-2.5 px-3 font-bold text-dark-gold">{{ row.pillarName }}</td>
            <td class="py-2.5 px-3 font-mono font-bold">{{ row.p1GanZhi }}</td>
            <td class="py-2.5 px-3 font-mono font-bold">{{ row.p2GanZhi }}</td>
            <td class="py-2.5 px-3 text-amber-300 font-bold">{{ row.relation }}</td>
            <td class="py-2.5 px-3 text-dark-muted">{{ row.verdict }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 紫微斗數 × 三合天機雙宮聯參 -->
    <div v-if="synastryResult.ziweiHeming" class="glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/35 shadow-cosmic max-w-4xl mx-auto space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-dark-gold/20">
        <div>
          <span class="text-[10px] uppercase tracking-widest text-dark-gold font-serif">TIANJI ZIWEI SYNASTRY · 三合天機合盤體系</span>
          <h3 class="text-lg font-bold text-gold-gradient mt-0.5">☯ 紫微雙宮聯參（夫妻宮 + 福德宮）與五步合盤診斷</h3>
        </div>
        <div class="flex items-center space-x-2">
          <span class="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/50 text-amber-200 text-xs font-bold">
            🌟 天機評級：{{ synastryResult.ziweiHeming.starRating }}
          </span>
          <span class="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/50 text-emerald-200 text-xs font-bold">
            {{ synastryResult.ziweiHeming.destinyType }}
          </span>
        </div>
      </div>

      <div class="p-4 rounded-xl bg-black/40 border border-dark-gold/25 text-xs leading-relaxed">
        <span class="font-bold text-dark-gold block mb-1">📌 三合正統雙宮聯參鐵律：</span>
        <p class="text-dark-text">{{ synastryResult.ziweiHeming.dualPalacePrinciple }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div v-for="prof in [synastryResult.ziweiHeming.person1Profile, synastryResult.ziweiHeming.person2Profile]" :key="prof.name" class="p-4 rounded-xl bg-black/30 border border-dark-gold/20 space-y-2.5">
          <div class="flex items-center justify-between border-b border-dark-gold/15 pb-2">
            <span class="font-bold text-sm text-gold-gradient">{{ prof.name }} ({{ prof.gender }}命)</span>
            <span class="px-2 py-0.5 rounded bg-dark-gold/15 text-dark-gold border border-dark-gold/30 text-[11px] font-bold">{{ prof.mingGongType }}</span>
          </div>
          <div><span class="text-dark-muted">命宮主星：</span><span class="font-bold text-dark-text">{{ prof.mingGongStars.join('、') }}</span></div>
          <div>
            <span class="text-dark-muted">夫妻宮星曜：</span>
            <span class="font-bold text-amber-300">{{ prof.fuqiStars.join('、') }}</span>
            <span v-if="prof.fuqiSihua.length" class="ml-1.5 text-rose-300 font-bold">（{{ prof.fuqiSihua.join('、') }}）</span>
          </div>
          <p class="text-dark-text leading-relaxed">{{ prof.fuqiSummary }}</p>
          <div class="text-[11px] text-emerald-300"><strong>✦ 吉象優勢：</strong>{{ prof.fuqiGood }}</div>
          <div class="text-[11px] text-rose-300"><strong>⚠️ 相處注意：</strong>{{ prof.fuqiBad }}</div>
          <div v-if="prof.fuqiNiQuote" class="p-2.5 rounded-lg bg-dark-gold/10 border border-dark-gold/25 text-[11px] text-dark-gold italic">
            💬 三合易理註解：「{{ prof.fuqiNiQuote }}」
          </div>
          <div class="pt-1 border-t border-dark-gold/10 text-[11px] text-dark-muted"><strong>福德宮根基：</strong>{{ prof.fudeEvaluation }}</div>
        </div>
      </div>

      <div class="space-y-2.5 text-xs">
        <h4 class="font-bold text-dark-gold text-xs uppercase tracking-wider">✦ 三合合盤五步法逐層拆解：</h4>
        <div
          v-for="(step, sIdx) in [
            { title: '第一步 · 雙方命格基礎與動靜互補：', text: synastryResult.ziweiHeming.fiveSteps.step1BaseCompatibility },
            { title: '第二步 · 夫妻宮互參與天作之合判定：', text: synastryResult.ziweiHeming.fiveSteps.step2SpouseCrossMatch },
            { title: '第三步 · 太陽與太陰男女婚姻星象互參：', text: synastryResult.ziweiHeming.fiveSteps.step3SunMoonAnalysis },
            { title: '第四步 · 生年四化飛化互參（緣分引動）：', text: synastryResult.ziweiHeming.fiveSteps.step4SihuaMutualFly },
            { title: '第五步 · 婚期建議與倪師陽宅化命大法：', text: synastryResult.ziweiHeming.fiveSteps.step5TimingAndYangzhai },
          ]"
          :key="sIdx"
          class="p-3.5 rounded-xl bg-black/30 border border-dark-gold/15"
        >
          <span class="font-bold text-amber-300 block mb-0.5">{{ step.title }}</span>
          <p class="text-dark-muted leading-relaxed">{{ step.text }}</p>
        </div>
      </div>
    </div>

    <!-- 婚姻生活現代指引、分享海報與存檔 -->
    <div class="glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/30 max-w-4xl mx-auto space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-dark-gold/15">
        <h3 class="text-sm font-bold text-gold-gradient">現代婚姻四維相處指引</h3>
        <div class="flex flex-wrap items-center gap-2">
          <SharePosterButton
            :target-ref="posterRef"
            :filename="`synastry-${synastryResult.person1.name}-${synastryResult.person2.name}`"
            label="下載合婚海報"
          />
          <button
            @click="$emit('save')"
            class="px-4 py-2 rounded-lg font-serif text-xs font-semibold border border-dark-gold/40 text-dark-gold hover:bg-dark-gold/15 transition-all cursor-pointer shadow-cosmic"
          >
            儲存合婚紀錄至占卜日記 📖
          </button>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed">
        <div class="p-3.5 rounded-xl bg-black/30 border border-dark-gold/15">
          <span class="font-bold text-dark-gold block mb-1">💬 情感與心靈溝通：</span>
          <p class="text-dark-muted">{{ synastryResult.marriageAdvice.emotionalCommunication }}</p>
        </div>
        <div class="p-3.5 rounded-xl bg-black/30 border border-dark-gold/15">
          <span class="font-bold text-dark-gold block mb-1">💰 財務與資源管理：</span>
          <p class="text-dark-muted">{{ synastryResult.marriageAdvice.financialManagement }}</p>
        </div>
        <div class="p-3.5 rounded-xl bg-black/30 border border-dark-gold/15">
          <span class="font-bold text-dark-gold block mb-1">🏡 家族長輩與姻親互動：</span>
          <p class="text-dark-muted">{{ synastryResult.marriageAdvice.familyAndRelatives }}</p>
        </div>
        <div class="p-3.5 rounded-xl bg-black/30 border border-dark-gold/15">
          <span class="font-bold text-dark-gold block mb-1">🌱 共同成長願景：</span>
          <p class="text-dark-muted">{{ synastryResult.marriageAdvice.growthTogether }}</p>
        </div>
      </div>
    </div>

    <InPageAiAnalysis
      module-type="BAZI_SYNASTRY"
      :title="`八字合婚 (${synastryResult.person1.name} & ${synastryResult.person2.name})`"
      :summary="`契合度: ${synastryResult.score}分 · ${synastryResult.level} · 通關五行: ${synastryResult.bridgingElement.element}`"
      :raw-data="synastryResult"
      :prompt="synastryAiPrompt"
      button-text="✨ 啟動 AI 八字合婚與親密關係深度全盤詳批"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { BaziSynastryResult } from '@celestial/astro-core';
import InPageAiAnalysis from '../ai/InPageAiAnalysis.vue';
import SharePosterButton from '../common/SharePosterButton.vue';

defineProps<{
  synastryResult: BaziSynastryResult;
  synastryAiPrompt: string;
}>();

defineEmits<{
  (e: 'save'): void;
}>();

const posterRef = ref<HTMLElement | null>(null);
</script>
