<template>
  <div class="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
    <!-- 頂部殿堂標題與文化氛圍 -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full border border-red-500/30 bg-red-950/20 text-red-300 text-xs font-serif mb-3 shadow-cosmic">
        <span>⛩️</span>
        <span>正統道廟儀軌 · 媽祖靈籤 · 關帝百籤 · 聖筊確認</span>
      </div>
      <h1 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gold-gradient mb-3">
        台灣宮廟 · 六十甲子籤詩與解籤系統
      </h1>
      <p class="text-xs sm:text-sm text-dark-muted max-w-2xl mx-auto leading-relaxed">
        遵循台灣正統寺廟求籤儀禮：誠心稟報生辰訴求、搖筒抽籤、擲筊（Bwa Bwei）請示神明聖意確認；依您所問特定面向（功名、求財、婚姻、疾病、官司等）直斷吉凶。
      </p>
    </div>

    <!-- 宮廟四大儀軌進度指示條 (Temple Ritual Steps Bar) -->
    <div class="grid grid-cols-4 gap-2 max-w-3xl mx-auto mb-8 font-serif text-xs">
      <div
        v-for="(st, i) in steps"
        :key="i"
        class="glass-panel p-2.5 rounded-xl border text-center transition-all flex flex-col items-center"
        :class="[
          currentStep === st.key
            ? 'border-dark-gold bg-dark-gold/20 text-dark-gold font-bold shadow-cosmic scale-105'
            : isStepPassed(st.key)
            ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/10'
            : 'border-dark-muted/20 text-dark-muted',
        ]"
      >
        <span class="text-sm mb-0.5">{{ st.icon }}</span>
        <span class="text-[11px]">{{ st.label }}</span>
      </div>
    </div>

    <!-- 步驟 1：向神明稟報生辰與所問面向 (Step 1: Petition) -->
    <div v-if="currentStep === 'petition'" class="max-w-2xl mx-auto glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/30 shadow-cosmic">
      <div class="flex items-center space-x-2.5 border-b border-dark-gold/20 pb-3 mb-5">
        <span class="text-xl">🙏</span>
        <div>
          <h2 class="font-serif text-lg font-bold text-dark-gold">步驟一 · 誠心向神明稟報 (三跪九叩·心存敬意)</h2>
          <span class="text-[11px] text-dark-muted">請如實填寫信眾資訊，神明鑑察分明</span>
        </div>
      </div>

      <div class="space-y-4 text-xs font-serif">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-dark-gold font-bold mb-1">信士 / 信女 姓名</label>
            <input
              v-model="seekerName"
              type="text"
              placeholder="例如：林俊良 / 王佩琪"
              class="w-full bg-dark-void/70 border border-dark-gold/30 rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-dark-gold font-sans"
            />
          </div>
          <div>
            <label class="block text-dark-gold font-bold mb-1">出生生辰（農曆或國曆皆可）</label>
            <input
              v-model="seekerBirth"
              type="text"
              placeholder="例如：國曆1992年6月18日午時"
              class="w-full bg-dark-void/70 border border-dark-gold/30 rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-dark-gold font-sans"
            />
          </div>
        </div>

        <div>
          <label class="block text-dark-gold font-bold mb-1">現居住所地址 (使神明知曉您身處何方)</label>
          <input
            v-model="seekerAddress"
            type="text"
            placeholder="例如：台北市士林區中正路... / 台中市西區..."
            class="w-full bg-dark-void/70 border border-dark-gold/30 rounded-lg px-3 py-2 text-dark-text focus:outline-none focus:border-dark-gold font-sans"
          />
        </div>

        <!-- 主祀神明選擇 (依台灣廟宇參拜規矩恭請神明作主) -->
        <div>
          <label class="block text-dark-gold font-bold mb-1.5">
            參拜主祀神明 (恭請神明聖駕作主)
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              v-for="d in deityOptions"
              :key="d.id"
              type="button"
              @click="selectedDeity = d.id"
              class="p-2 rounded-xl border text-center transition-all flex flex-col items-center"
              :class="[
                selectedDeity === d.id
                  ? 'border-dark-gold bg-dark-gold/25 text-dark-gold font-bold shadow-cosmic scale-102'
                  : 'glass-panel border-dark-muted/20 text-dark-muted hover:border-dark-gold/30',
              ]"
            >
              <span class="text-base mb-0.5">{{ d.icon }}</span>
              <span class="text-xs font-serif">{{ d.name }}</span>
              <span class="text-[9px] text-dark-muted mt-0.5 truncate w-full">{{ d.title.split('·')[0] }}</span>
            </button>
          </div>
        </div>

        <!-- 核心亮點：精確選擇要問哪一方面 (Target Inquiry Aspect) -->
        <div>
          <label class="block text-dark-gold font-bold mb-1.5">
            🎯 此次抽籤欲請教神明的「特定面向」 (解籤將精準對照此領域直斷)
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              v-for="asp in aspectList"
              :key="asp.key"
              type="button"
              @click="selectedAspect = asp.key"
              class="p-2 rounded-lg border text-center transition-all flex flex-col items-center"
              :class="[
                selectedAspect === asp.key
                  ? 'border-dark-gold bg-dark-gold/25 text-dark-gold font-bold shadow-cosmic'
                  : 'glass-panel border-dark-muted/30 text-dark-muted hover:border-dark-gold/40',
              ]"
            >
              <span class="text-sm">{{ asp.icon }}</span>
              <span class="mt-1 text-[11px] font-bold">{{ asp.label }}</span>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-dark-gold font-bold mb-1">具體所求叩問事項 (請以單一、明確事項為準)</label>
          <textarea
            v-model="specificQuestion"
            rows="3"
            placeholder="例如：弟子目前正與合夥人籌備新門店，想請示今年簽約投資吉凶？ / 與前任分手三個月，近期是否有復合機緣？"
            class="w-full bg-dark-void/70 border border-dark-gold/30 rounded-lg p-3 text-dark-text focus:outline-none focus:border-dark-gold font-sans text-xs leading-relaxed"
          ></textarea>
        </div>

        <button
          @click="proceedToDraw"
          class="w-full py-3 rounded-full font-serif font-bold text-sm bg-gradient-to-r from-red-600 via-dark-gold to-amber-400 text-dark-void hover:opacity-95 transition-all shadow-cosmic flex items-center justify-center space-x-2 mt-4"
        >
          <span>🏮</span>
          <span>稟報完畢 · 前往籤筒搖筒抽籤</span>
        </button>
      </div>
    </div>

    <!-- 步驟 2：搖筒抽籤 (Step 2: Shake Cylinder & Draw Lot) -->
    <div v-if="currentStep === 'draw_lot'" class="max-w-2xl mx-auto glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/30 shadow-cosmic text-center">
      <div class="w-full max-w-sm mx-auto aspect-[4/3] rounded-xl overflow-hidden border border-dark-gold/30 mb-6 shadow-inner relative group bg-black/40">
        <img
          src="/images/temple/temple_cylinder.jpg"
          alt="台灣廟宇神桌竹籤筒與筊杯"
          class="w-full h-full object-cover transition-transform duration-700"
          :class="{ 'animate-shake': isShaking }"
        />
        <div v-if="isShaking" class="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4">
          <div class="text-3xl animate-bounce mb-2">🎋</div>
          <p class="font-serif text-sm font-bold text-amber-200 tracking-widest animate-pulse">
            沉香裊裊，六十甲子竹籤陣急促翻動中...
          </p>
        </div>
      </div>

      <div class="space-y-3 mb-6">
        <h3 class="font-serif text-xl font-bold text-gold-gradient">
          虔誠搖動六十甲子籤筒
        </h3>
        <p class="text-xs text-dark-muted max-w-md mx-auto leading-relaxed">
          信眾 <strong class="text-dark-gold">{{ seekerName || '善信' }}</strong> 叩問【<strong class="text-dark-gold">{{ aspectName }}</strong>】：{{ specificQuestion || '所求吉凶指引' }}
        </p>
      </div>

      <button
        @click="shakeAndDrawLot"
        :disabled="isShaking"
        class="px-8 py-3.5 rounded-full font-serif font-bold text-sm bg-gradient-to-r from-dark-gold to-amber-400 text-dark-void hover:opacity-90 shadow-cosmic transition-all inline-flex items-center space-x-2"
      >
        <span>🎋</span>
        <span>{{ isShaking ? '籤筒搖動中...' : '搖動竹筒 · 抽出一籤' }}</span>
      </button>
    </div>

    <!-- 步驟 3：擲筊請示神明聖意 (Step 3: Bwa-Bwei Confirmation) -->
    <div v-if="currentStep === 'bwa_bwei' && drawnLotCandidate" class="max-w-2xl mx-auto glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/30 shadow-cosmic text-center">
      <!-- 抽出的暫定籤牌 -->
      <div class="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-dark-gold/15 border border-dark-gold/50 text-dark-gold font-serif text-xs font-bold mb-4">
        <span>🎋 籤筒浮現：</span>
        <span>{{ drawnLotCandidate.orderNumberText }} · 【{{ drawnLotCandidate.stemBranch }}】 ({{ drawnLotCandidate.title }})</span>
      </div>

      <h3 class="font-serif text-xl sm:text-2xl font-bold text-gold-gradient mb-2">
        擲筊請示神明：此籤是否為聖意所賜？
      </h3>
      <p class="text-xs text-dark-muted max-w-lg mx-auto mb-6 leading-relaxed">
        台灣民間寺廟鐵律：抽得竹籤不可直接作準！信士需持硃紅筊杯向神明擲筊請示，唯有擲出「聖筊（一正一反）」神明應允，方為真正命定之籤。
      </p>

      <!-- 擲筊插畫與落地狀態 (Bwa-Bwei Visuals) -->
      <div class="w-full max-w-sm mx-auto aspect-[4/3] rounded-xl overflow-hidden border border-dark-gold/30 mb-6 shadow-inner relative bg-black/40">
        <img
          src="/images/temple/temple_bwa_bwei.jpg"
          alt="閩南紅磚地面硃紅筊杯聖筊吉兆"
          class="w-full h-full object-cover transition-transform duration-500"
          :class="{ 'scale-105 filter brightness-110': isCastingBwei }"
        />
        <div v-if="lastBweiResult" class="absolute bottom-3 inset-x-3 bg-dark-void/90 border border-dark-gold/60 p-2.5 rounded-lg backdrop-blur-md">
          <div class="flex items-center justify-center space-x-2 mb-1">
            <span class="text-xs px-2 py-0.5 rounded font-mono font-bold" :class="lastBweiResult.type === 'sheng_bwei' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'">
              {{ lastBweiResult.type === 'sheng_bwei' ? '◓ ◒ 一平一凸' : lastBweiResult.type === 'xiao_bwei' ? '◓ ◓ 兩平向上' : '◒ ◒ 兩凸向上' }}
            </span>
            <span class="font-serif font-bold text-sm" :class="bweiColorClass(lastBweiResult.type)">
              擲得【{{ lastBweiResult.typeName }}】
            </span>
          </div>
          <p class="text-[11px] text-dark-text/90 font-serif leading-tight">
            {{ lastBweiResult.meaning }}
          </p>
        </div>
      </div>

      <!-- 擲筊操作按鈕 (遵循台灣廟宇鐵律：神明未允則竹籤放回籤筒，不對原籤強行重擲) -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          v-if="!lastBweiResult || lastBweiResult.isAccepted"
          @click="castBwei"
          :disabled="isCastingBwei"
          class="w-full sm:w-auto px-8 py-3 rounded-full font-serif font-bold text-sm bg-gradient-to-r from-red-600 to-amber-500 text-white hover:opacity-90 shadow-cosmic transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>🙏</span>
          <span>{{ isCastingBwei ? '筊杯翻滾中...' : '擲筊請示神明 (拋擲雙杯)' }}</span>
        </button>

        <button
          v-else
          @click="reDrawLot"
          class="w-full sm:w-auto px-8 py-3 rounded-full font-serif font-bold text-sm bg-gradient-to-r from-amber-600 to-amber-500 text-dark-void hover:opacity-90 shadow-cosmic transition-all flex items-center justify-center space-x-2 cursor-pointer animate-pulse"
        >
          <span>🎋</span>
          <span>神明未允 · 竹籤放回籤筒重新抽籤 (第 {{ redrawCount + 1 }} 輪)</span>
        </button>
      </div>
    </div>

    <!-- 步驟 4：領取籤詩與多面向解籤 (Step 4: Poem & Aspect Interpretation) -->
    <div v-if="currentStep === 'interpretation' && confirmedLot" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- 左側：正統六十甲子古典籤條 (Traditional Temple Lot Slip) -->
      <div class="lg:col-span-5 glass-panel rounded-2xl p-6 sm:p-7 border-2 border-dark-gold/40 shadow-cosmic bg-gradient-to-b from-dark-void/95 via-dark-surface/90 to-dark-void/95 text-center relative overflow-hidden">
        <!-- 頂部殿堂印記 -->
        <div class="flex items-center justify-between border-b border-dark-gold/25 pb-3 mb-4 text-xs font-serif">
          <span class="text-dark-gold font-bold">⛩️ 萬象天儀 · 媽祖靈籤</span>
          <span class="px-2.5 py-0.5 rounded-full bg-dark-gold/15 text-dark-gold border border-dark-gold/40 font-bold">
            {{ confirmedLot.luckLevel }}
          </span>
        </div>

        <div class="mb-4">
          <span class="text-xs font-serif text-dark-muted block mb-1">六十甲子籤號</span>
          <h2 class="font-serif text-2xl sm:text-3xl font-bold text-gold-gradient">
            {{ confirmedLot.orderNumberText }} · 【{{ confirmedLot.stemBranch }}】
          </h2>
          <span class="text-xs font-serif text-amber-300/80 mt-1 inline-block">
            宮位卦象：{{ confirmedLot.palaceGua }}
          </span>
        </div>

        <!-- 歷史典故大標題 -->
        <div class="bg-red-950/25 border border-red-500/30 rounded-xl p-3 mb-4">
          <span class="text-[10px] font-serif text-red-300 block mb-0.5">【籤頭典故】</span>
          <h3 class="font-serif text-base sm:text-lg font-bold text-amber-200">
            {{ confirmedLot.title }}
          </h3>
        </div>

        <!-- 七言絕句四句籤詩 (Sacred Verse) -->
        <div class="bg-black/40 rounded-xl p-5 border border-dark-gold/30 mb-5 shadow-inner">
          <div class="space-y-2 font-serif text-lg sm:text-xl text-amber-100 font-bold tracking-widest leading-relaxed">
            <p v-for="(line, idx) in confirmedLot.poem" :key="idx">
              {{ line }}
            </p>
          </div>
        </div>

        <!-- 聖意總綱 -->
        <div class="text-left bg-dark-gold/10 rounded-xl p-3.5 border border-dark-gold/20 text-xs leading-relaxed font-serif text-dark-text/90">
          <strong class="text-dark-gold block mb-1">【聖意總綱 · 解曰】</strong>
          {{ confirmedLot.holyDecree }}
        </div>

        <!-- 操作重抽 -->
        <div class="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            @click="resetAll"
            class="px-5 py-2 rounded-full glass-panel border border-dark-gold/40 text-dark-gold hover:border-dark-gold text-xs font-serif font-bold transition-all cursor-pointer"
          >
            🔄 感謝神恩 · 重新請示
          </button>
          <button
            @click="saveReadingJournal"
            :disabled="savingJournal || journalSaved"
            class="px-5 py-2 rounded-full border border-dark-gold/60 text-dark-gold hover:bg-dark-gold/20 text-xs font-serif font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center space-x-1"
          >
            <span>{{ journalSaved ? '✅ 已存入靈驗日記' : savingJournal ? '儲存中...' : '💾 儲存籤詩至測算日記' }}</span>
          </button>
        </div>
      </div>

      <!-- 右側：特定問事面向與全方位斷語解讀 (Aspect Interpretation Grid) -->
      <div class="lg:col-span-7 flex flex-col space-y-5">
        <!-- 核心高亮：您所問的特定面向斷語 (Focused Aspect Card) -->
        <div class="glass-panel rounded-2xl p-6 border-2 border-amber-500/50 shadow-cosmic bg-gradient-to-br from-amber-950/20 via-dark-surface to-dark-void">
          <div class="flex items-center justify-between border-b border-amber-500/25 pb-3 mb-3">
            <div class="flex items-center space-x-2">
              <span class="text-lg">🎯</span>
              <h3 class="font-serif text-base sm:text-lg font-bold text-amber-300">
                針對您所問【{{ aspectName }}】之神明專屬斷語
              </h3>
            </div>
            <span class="text-[10px] font-mono text-dark-muted">直擊核心</span>
          </div>

          <p class="text-sm sm:text-base text-amber-100 leading-relaxed font-serif mb-3 font-semibold">
            {{ activeAspectText }}
          </p>

          <div class="text-xs text-dark-muted/90 font-serif leading-relaxed border-t border-amber-500/15 pt-2">
            <strong>信士原問：</strong>{{ specificQuestion || '綜合運勢指引' }}
          </div>
        </div>

        <!-- 歷史典故借古喻今深度剖析 -->
        <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 shadow-sm">
          <div class="flex items-center space-x-2 border-b border-dark-gold/20 pb-2 mb-3">
            <span class="text-base">📜</span>
            <h4 class="font-serif text-sm font-bold text-dark-gold">
              【典故借古喻今】{{ confirmedLot.title }} 之深層啟示
            </h4>
          </div>
          <p class="text-xs text-dark-text/90 leading-relaxed font-serif">
            {{ confirmedLot.allusion }}
          </p>
        </div>

        <!-- 切換瀏覽其餘 9 大面向斷語 (Interactive Aspects Switcher) -->
        <div class="glass-panel rounded-2xl p-6 border border-dark-gold/25 shadow-sm">
          <h4 class="font-serif text-xs font-bold text-dark-gold mb-3 flex items-center justify-between">
            <span>十維生活面向詳細斷語（點擊切換查看）：</span>
            <span class="text-[10px] text-dark-muted font-normal">功名 / 求財 / 婚姻 / 疾病 / 六甲 / 官司...</span>
          </h4>

          <div class="flex flex-wrap gap-1.5 mb-4">
            <button
              v-for="asp in aspectList"
              :key="asp.key"
              @click="selectedAspect = asp.key"
              class="px-2.5 py-1 rounded-full text-xs font-serif transition-all"
              :class="[
                selectedAspect === asp.key
                  ? 'bg-dark-gold text-dark-void font-bold shadow-sm'
                  : 'glass-panel border border-dark-gold/30 text-dark-muted hover:text-dark-gold',
              ]"
            >
              {{ asp.icon }} {{ asp.label }}
            </button>
          </div>

          <!-- 展開顯示當前選取面向之斷語 -->
          <div class="bg-black/30 rounded-xl p-4 border border-dark-gold/20 text-xs text-dark-text leading-relaxed font-serif">
            <strong class="text-dark-gold mr-1">【{{ aspectName }}解籤斷語】：</strong>
            {{ activeAspectText }}
          </div>
        </div>

        <!-- 召喚 AI 宮廟道長深入諮商按鈕 -->
        <div class="glass-panel rounded-2xl p-5 border border-dark-gold/40 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-dark-gold/10 to-transparent">
          <div>
            <h5 class="font-serif text-xs font-bold text-dark-gold mb-0.5">有更深層的疑惑或細節想請教？</h5>
            <p class="text-[11px] text-dark-muted">AI 宮廟解籤名師將依據此籤詩典故與您的現實困境，展開一對一深度對話。</p>
          </div>
          <button
            @click="askLlmTempleMaster"
            class="px-6 py-2.5 rounded-full font-serif font-bold text-xs bg-dark-gold text-dark-void hover:opacity-90 transition-all shadow-cosmic flex items-center space-x-1.5 flex-shrink-0 cursor-pointer"
          >
            <span>✨</span>
            <span>向 AI 宮廟名師深入解籤</span>
          </button>
        </div>

        <!-- 命理閉環生態指引 -->
        <div class="p-4 rounded-2xl bg-black/40 border border-dark-gold/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div class="flex items-center space-x-2 text-dark-muted">
            <span class="text-base">🙏</span>
            <span>領受神意後，可進一步查農曆擇日或推演流年運勢：</span>
          </div>
          <div class="flex items-center space-x-2">
            <router-link to="/almanac" class="px-3 py-1 rounded-lg bg-dark-gold/15 hover:bg-dark-gold/25 text-dark-gold font-bold transition-colors">
              查今日黃曆 📅
            </router-link>
            <router-link to="/ziwei" class="px-3 py-1 rounded-lg bg-dark-gold/15 hover:bg-dark-gold/25 text-dark-gold font-bold transition-colors">
              排紫微斗數 🌟
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  drawTempleLot,
  castBwaBwei,
  TemplePoemLot,
  BwaBweiResult,
  TempleInquiryAspect,
} from '@celestial/astro-core';
import { useLlmStore } from '../stores/llm.js';
import { useAuthStore } from '../stores/auth.js';

const llmStore = useLlmStore();
const authStore = useAuthStore();

type Step = 'petition' | 'draw_lot' | 'bwa_bwei' | 'interpretation';

const currentStep = ref<Step>('petition');

const steps = [
  { key: 'petition' as const, label: '1. 稟報神明', icon: '🙏' },
  { key: 'draw_lot' as const, label: '2. 搖筒抽籤', icon: '🎋' },
  { key: 'bwa_bwei' as const, label: '3. 擲筊請示', icon: '🏮' },
  { key: 'interpretation' as const, label: '4. 領籤解詩', icon: '📜' },
];

const deityOptions = [
  { id: 'mazu', name: '天上聖母媽祖', title: '慈悲護佑 · 航海安瀾 · 婚育平安', icon: '👑' },
  { id: 'guanyu', name: '關聖帝君 (恩主公)', title: '忠義仁勇 · 經商求財 · 官司化解', icon: '⚔️' },
  { id: 'guanyin', name: '觀世音菩薩', title: '大慈大悲 · 救苦救難 · 家宅平安', icon: '🪷' },
  { id: 'xuantian', name: '玄天上帝 (上帝公)', title: '蕩魔鎮煞 · 消災延壽 · 事業前程', icon: '🛡️' },
  { id: 'tudi', name: '福德正神 (土地公)', title: '在地庇佑 · 財帛豐盈 · 土地安寧', icon: '🪙' },
];
const selectedDeity = ref('mazu');

const seekerName = ref('');
const seekerBirth = ref('');
const seekerAddress = ref('');
const selectedAspect = ref<TempleInquiryAspect>('career');
const specificQuestion = ref('');

const isShaking = ref(false);
const isCastingBwei = ref(false);
const redrawCount = ref(0);
const savingJournal = ref(false);
const journalSaved = ref(false);

const drawnLotCandidate = ref<TemplePoemLot | null>(null);
const lastBweiResult = ref<BwaBweiResult | null>(null);
const confirmedLot = ref<TemplePoemLot | null>(null);

const aspectList: { key: TempleInquiryAspect; label: string; icon: string }[] = [
  { key: 'career', label: '功名考運', icon: '💼' },
  { key: 'wealth', label: '求財經商', icon: '🪙' },
  { key: 'marriage', label: '婚姻感情', icon: '❤️' },
  { key: 'health', label: '疾病康泰', icon: '🌿' },
  { key: 'pregnancy', label: '六甲求子', icon: '👶' },
  { key: 'lawsuit', label: '官司訴訟', icon: '⚖️' },
  { key: 'travel', label: '遠行移居', icon: '✈️' },
  { key: 'lostItem', label: '失物尋找', icon: '🔍' },
  { key: 'family', label: '家運宅舍', icon: '🏠' },
  { key: 'business', label: '作事合夥', icon: '🤝' },
];

const aspectName = computed(() => {
  const match = aspectList.find((a) => a.key === selectedAspect.value);
  return match ? match.label : '綜合運勢';
});

const activeAspectText = computed(() => {
  if (!confirmedLot.value) return '';
  const lot = confirmedLot.value;
  const key = selectedAspect.value;
  if (key !== 'general' && lot.aspects && lot.aspects[key]) {
    return lot.aspects[key];
  }
  return lot.holyDecree;
});

function isStepPassed(st: Step): boolean {
  const order: Step[] = ['petition', 'draw_lot', 'bwa_bwei', 'interpretation'];
  return order.indexOf(currentStep.value) > order.indexOf(st);
}

function bweiColorClass(type: string) {
  if (type === 'sheng_bwei') return 'text-emerald-400';
  if (type === 'xiao_bwei') return 'text-amber-400';
  return 'text-red-400';
}

function proceedToDraw() {
  currentStep.value = 'draw_lot';
}

async function shakeAndDrawLot() {
  if (isShaking.value) return;
  isShaking.value = true;
  lastBweiResult.value = null;

  // 模擬籤筒搖動 1.2 秒
  await new Promise((r) => setTimeout(r, 1200));

  // 程式隨機抽取六十甲子籤
  drawnLotCandidate.value = drawTempleLot({
    seekerName: seekerName.value,
    inquiryAspect: selectedAspect.value,
    question: specificQuestion.value,
  });

  isShaking.value = false;
  currentStep.value = 'bwa_bwei';
}

async function castBwei() {
  if (isCastingBwei.value) return;
  isCastingBwei.value = true;

  // 模擬筊杯落地旋轉
  await new Promise((r) => setTimeout(r, 800));

  // 虔心保底機制：若已誠心重抽 2 次以上（第 3 輪），神明感應信士精誠，特賜聖筊
  const result = redrawCount.value >= 2 ? castBwaBwei('sheng_bwei') : castBwaBwei();
  lastBweiResult.value = result;
  isCastingBwei.value = false;

  // 若為聖筊，神明應允，進入解籤
  if (result.isAccepted) {
    confirmedLot.value = drawnLotCandidate.value;
    redrawCount.value = 0;
    setTimeout(() => {
      currentStep.value = 'interpretation';
    }, 1000);
  }
}

function reDrawLot() {
  redrawCount.value++;
  drawnLotCandidate.value = null;
  lastBweiResult.value = null;
  currentStep.value = 'draw_lot';
}

function resetAll() {
  drawnLotCandidate.value = null;
  lastBweiResult.value = null;
  confirmedLot.value = null;
  redrawCount.value = 0;
  journalSaved.value = false;
  currentStep.value = 'petition';
}

async function saveReadingJournal() {
  if (!confirmedLot.value || savingJournal.value) return;
  savingJournal.value = true;
  try {
    const headers = await authStore.getAuthHeaders();
    const lot = confirmedLot.value;
    const deity = deityOptions.find((d) => d.id === selectedDeity.value)?.name || '神明';
    const res = await fetch('/api/v1/readings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        moduleType: 'TEMPLE_POEM',
        inputSnapshot: {
          deity,
          seekerName: seekerName.value,
          inquiryAspect: selectedAspect.value,
          question: specificQuestion.value,
        },
        chartOutput: confirmedLot.value,
        aiSummary: `六十甲子籤【${deity}】：${lot.orderNumberText} ${lot.stemBranch}（${lot.title} · ${lot.luckLevel}）· 問${aspectName.value}：「${specificQuestion.value || '吉凶指引'}」`,
      }),
    });
    const data = await res.json();
    if (data.success) {
      journalSaved.value = true;
    } else {
      alert(data.message || '儲存靈驗日記失敗');
    }
  } catch (err: any) {
    alert(err.message || '連線伺服器異常，未能儲存日記');
  } finally {
    savingJournal.value = false;
  }
}

function askLlmTempleMaster() {
  if (!confirmedLot.value) return;
  const lot = confirmedLot.value;
  const deity = deityOptions.find((d) => d.id === selectedDeity.value)?.name || '神明';
  const prompt = `信眾【${seekerName.value || '善信'}】向【${deity}】抽得六十甲子籤第 ${lot.id} 籤【${lot.stemBranch}】（典故：${lot.title}，吉凶：${lot.luckLevel}）。籤詩為：「${lot.poem.join('，')}」。聖意為：「${lot.holyDecree}」。我問的是【${aspectName.value}】事項：「${specificQuestion.value || '所求吉凶指引'}」。請宮廟解籤名師為我深入借古喻今，解析籤意並指導下一步具體行動策略！`;

  llmStore.openAssistantWithContext({
    moduleType: 'TEMPLE_POEM',
    title: `六十甲子籤 · ${deity} · ${lot.orderNumberText} ${lot.stemBranch} (${lot.title})`,
    summary: `信眾 ${seekerName.value || '善信'} 於【${deity}】座前問【${aspectName.value}】：${specificQuestion.value || '吉凶指引'}（擲得聖筊確認）`,
    rawData: {
      lot,
      deity,
      seekerName: seekerName.value,
      inquiryAspect: selectedAspect.value,
      question: specificQuestion.value,
    },
    initialPrompt: prompt,
  });
}
</script>

<style scoped>
@keyframes shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  20% { transform: translate(-2px, -1px) rotate(-1deg); }
  40% { transform: translate(-3px, 0px) rotate(1deg); }
  60% { transform: translate(3px, 1px) rotate(0deg); }
  80% { transform: translate(1px, -1px) rotate(1deg); }
  100% { transform: translate(1px, 1px) rotate(0deg); }
}
.animate-shake {
  animation: shake 0.3s infinite ease-in-out;
}
</style>
