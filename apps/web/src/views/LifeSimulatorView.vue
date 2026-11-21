<template>
  <div class="max-w-7xl mx-auto px-3 sm:px-6 pt-28 pb-20 font-serif">
    <!-- 頂部標題區與模式切換 -->
    <div class="text-center mb-6">
      <div class="text-xs uppercase tracking-[0.25em] text-dark-gold mb-2 font-sans">
        BAZI 0-100 LIFE ODYSSEY & DESTINY SIMULATOR
      </div>
      <h1 class="text-3xl sm:text-4xl font-bold text-gold-gradient mb-3">百歲流年 · 模擬一生</h1>
      <p class="text-xs sm:text-sm text-dark-muted max-w-2xl mx-auto leading-relaxed">
        以先天八字與大運為基底 · 融合台灣時代風貌 · 模擬 0～100 歲轉折抉擇、平行分歧 What-If 與雙人共命推演
      </p>

      <div class="mt-5 inline-flex p-1 rounded-full bg-black/40 border border-dark-gold/30 text-xs">
        <button
          @click="viewMode = 'solo'"
          class="px-5 py-2 rounded-full font-bold transition-all cursor-pointer"
          :class="viewMode === 'solo' ? 'bg-dark-gold text-dark-void shadow-cosmic' : 'text-dark-muted hover:text-dark-text'"
        >
          ⏳ 單人百歲推演
        </button>
        <button
          @click="viewMode = 'branch'"
          class="px-5 py-2 rounded-full font-bold transition-all cursor-pointer"
          :class="viewMode === 'branch' ? 'bg-dark-gold text-dark-void shadow-cosmic' : 'text-dark-muted hover:text-dark-text'"
        >
          🔀 平行分歧 What-If & 雙人模擬
        </button>
      </div>
    </div>

    <!-- 分支與雙人模擬面板 -->
    <SimulatorBranchPanel
      v-if="viewMode === 'branch'"
      :what-if-form="whatIfForm"
      :what-if-loading="whatIfLoading"
      :what-if-result="whatIfResult"
      :couple-form="coupleForm"
      :couple-loading="coupleLoading"
      :couple-result="coupleResult"
      @run-what-if="runWhatIfSimulation"
      @run-couple="runCoupleSimulation"
    />

    <!-- 階段 1：起局設定卡片 -->
    <SimulatorSetupPanel
      v-else-if="!session"
      :form="form"
      :romance-friends-setup="romanceFriendsSetup"
      :saved-profiles="savedProfiles"
      :loading="loading"
      @load-profile="loadSavedProfile"
      @start="startSimulation"
      @friend-birth-change="onFriendBirthChange"
    />

    <!-- 階段 2：進行中的百歲推演主舞台 -->
    <div v-else class="space-y-6 animate-fade-in">
      <!-- 頂部狀態控制列 -->
      <div class="glass-panel rounded-2xl p-4 sm:p-5 border border-dark-gold/35 shadow-cosmic flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center flex-wrap gap-2.5">
          <span class="px-3 py-1 rounded-full bg-dark-gold text-dark-void font-bold text-sm shadow-sm">{{ session.profileName }} · {{ currentNode?.age }} 歲</span>
          <span class="px-2.5 py-1 rounded-full bg-black/40 border border-dark-gold/30 text-dark-gold text-xs font-mono">西元 {{ currentNode?.solarYear }} 年 · 虛歲 {{ currentNode?.nominalAge }} 歲</span>
          <span class="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">流年【{{ currentNode?.ganzhi }}】· 值【{{ currentNode?.tenGod }}】</span>
          <span class="px-2 py-0.5 rounded bg-black/50 text-dark-muted text-xs">大運【{{ currentNode?.daYun?.stem }}{{ currentNode?.daYun?.branch }}】</span>
          <span class="px-2 py-0.5 rounded text-xs font-bold bg-white/10 text-amber-200">行運 {{ currentNode?.fortuneLevel }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <button @click="fastForward" :disabled="actionLoading || session.status === 'COMPLETED'" class="px-3.5 py-1.5 rounded-xl border border-dark-gold/50 bg-dark-gold/15 hover:bg-dark-gold text-dark-gold hover:text-dark-void text-xs font-bold cursor-pointer">
            ⏩ 快進至轉折年
          </button>
          <button @click="finalizeSimulation" :disabled="actionLoading" class="px-3.5 py-1.5 rounded-xl border border-rose-500/40 hover:bg-rose-500/20 text-rose-300 text-xs font-bold cursor-pointer">
            {{ actionLoading ? '譜寫蓋棺錄中...' : '📜 一生回顧' }}
          </button>
        </div>
      </div>

      <!-- 0~100 歲橫向時間軸 -->
      <div class="glass-panel rounded-2xl p-4 border border-dark-gold/25 shadow-cosmic overflow-hidden">
        <div class="text-[11px] text-dark-muted font-sans mb-2 flex items-center justify-between">
          <span>0～100 歲命運時間軸 (⭐為轉折年)：</span>
          <span class="text-dark-gold font-mono">當前：{{ session.currentAge }} 歲</span>
        </div>
        <div class="flex items-center space-x-2 overflow-x-auto py-2 no-scrollbar" ref="timelineScroll">
          <button
            v-for="node in session.history"
            :key="node.age"
            @click="inspectYear(node.age)"
            type="button"
            class="flex flex-col items-center flex-shrink-0 min-w-[50px] p-1.5 rounded-xl border text-center transition-all cursor-pointer relative"
            :class="node.age === viewingAge ? 'bg-dark-gold text-dark-void border-dark-gold scale-105 font-bold' : node.age === session.currentAge ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300 font-bold' : 'border-dark-gold/20 bg-black/30 text-dark-muted'"
          >
            <span v-if="node.isKeyMilestone" class="absolute -top-1 right-0 text-[10px]">⭐</span>
            <span class="text-[10px] font-mono">{{ node.age }}歲</span>
            <span class="text-[11px] font-bold">{{ node.ganzhi }}</span>
            <span class="text-[9px] opacity-75">{{ node.tenGod }}</span>
          </button>
        </div>
      </div>

      <!-- 主舞台兩欄佈局 -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- 左欄：五維屬性 HUD 與關鍵足跡 -->
        <div class="lg:col-span-4 space-y-6">
          <div class="glass-panel rounded-2xl p-5 border border-dark-gold/30 shadow-cosmic space-y-3 text-xs">
            <h3 class="font-bold text-gold-gradient uppercase tracking-wider">🌟 人生核心維度 (MAX 100)</h3>
            <div v-for="bar in statBars" :key="bar.label">
              <div class="flex justify-between mb-1">
                <span>{{ bar.icon }} {{ bar.label }}</span>
                <span class="font-mono font-bold">{{ bar.value }} / 100</span>
              </div>
              <div class="h-2 rounded-full bg-black/50 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500" :class="bar.color" :style="{ width: `${bar.value}%` }"></div>
              </div>
            </div>
          </div>

          <div class="glass-panel rounded-2xl p-5 border border-dark-gold/25 shadow-cosmic max-h-80 overflow-y-auto">
            <h3 class="text-xs font-bold text-gold-gradient uppercase mb-3 flex justify-between">
              <span>👣 人生關鍵足跡</span>
              <span class="text-[10px] text-dark-muted font-mono">{{ session.milestoneFootprints.length }} 項</span>
            </h3>
            <div class="space-y-2 text-xs">
              <div v-for="(fp, idx) in session.milestoneFootprints" :key="idx" class="p-2 rounded-lg bg-black/30 border border-dark-gold/15 text-dark-text">
                {{ fp }}
              </div>
            </div>
          </div>
        </div>

        <!-- 右欄：年度故事、插畫與決策卡牌 -->
        <div class="lg:col-span-8">
          <div class="glass-panel rounded-2xl p-6 sm:p-7 border border-dark-gold/35 shadow-cosmic space-y-5">
            <div class="pb-4 border-b border-dark-gold/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div class="text-xs text-dark-gold font-sans font-bold">
                  {{ activeDisplayNode?.solarYear }} 歲次【{{ activeDisplayNode?.ganzhi }}】· {{ activeDisplayNode?.age }} 歲
                  <span v-if="activeDisplayNode?.eraAvgLifeExpectancy" class="ml-2 text-cyan-300 font-normal">🏥 平均壽命 {{ activeDisplayNode.eraAvgLifeExpectancy }} 歲</span>
                </div>
                <h2 class="text-xl sm:text-2xl font-bold text-gold-gradient mt-1">{{ activeDisplayNode?.eventTitle || '沉澱思緒 · 審時度勢' }}</h2>
              </div>
              <span v-if="activeDisplayNode?.isEpidemicYear" class="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">⚠️ 疫疾警戒</span>
            </div>

            <div v-if="activeDisplayNode?.taiwanEraContext" class="px-4 py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs">
              🇹🇼 <strong>[台灣時代風貌]</strong> {{ activeDisplayNode.taiwanEraContext }}
            </div>

            <div v-if="activeDisplayNode?.annualStory" class="p-4 rounded-2xl bg-black/40 border border-dark-gold/25 text-xs sm:text-sm space-y-3">
              <div v-if="activeStageIllustration" class="rounded-xl overflow-hidden border border-dark-gold/30 max-h-56">
                <img :src="activeStageIllustration" :alt="activeDisplayNode.lifeStageTitle" width="720" height="720" loading="lazy" class="w-full h-44 sm:h-52 object-cover" />
              </div>
              <p class="leading-relaxed whitespace-pre-line">{{ activeDisplayNode.annualStory }}</p>
            </div>

            <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/20 text-xs sm:text-sm space-y-3">
              <div v-if="activeRomanticIllustration" class="rounded-xl overflow-hidden border border-rose-500/40 max-h-56">
                <img :src="activeRomanticIllustration" alt="知己相逢" width="720" height="720" loading="lazy" class="w-full h-44 sm:h-52 object-cover" />
              </div>
              <p class="whitespace-pre-line">{{ activeDisplayNode?.eventNarrative || activeDisplayNode?.annualOverview || '歲月靜流，靜待下一道流年啟示...' }}</p>
            </div>

            <!-- 已決策記錄 -->
            <div v-if="activeDisplayNode?.chosenOptionId" class="p-4 rounded-xl bg-dark-gold/10 border border-dark-gold/30 text-xs space-y-1.5">
              <div class="font-bold text-dark-gold">✅ 當時抉擇：{{ activeDisplayNode.options?.find((o: any) => o.id === activeDisplayNode?.chosenOptionId)?.text }}</div>
              <p class="text-dark-muted">{{ activeDisplayNode.resolutionNarrative }}</p>
            </div>

            <!-- 當前待決策選項 -->
            <div v-else-if="viewingAge === session.currentAge" class="space-y-4">
              <div v-if="turnGuidance" class="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 text-xs space-y-1.5">
                <div class="font-bold text-purple-200">{{ turnGuidance.badge }} · {{ turnGuidance.title }}</div>
                <p class="text-dark-muted">{{ turnGuidance.summary }}</p>
                <div class="text-dark-gold">🎯 核心方針：{{ turnGuidance.recommendedAction }}</div>
              </div>

              <div class="grid grid-cols-1 gap-3">
                <button
                  v-for="opt in activeDisplayNode?.options"
                  :key="opt.id"
                  @click="makeDecision(opt.id)"
                  :disabled="actionLoading"
                  class="p-4 rounded-xl text-left border border-dark-gold/30 bg-black/40 hover:border-dark-gold hover:bg-dark-gold/10 transition-all cursor-pointer space-y-1.5"
                >
                  <div class="flex justify-between text-[10px]">
                    <span class="px-2 py-0.5 rounded bg-dark-gold/20 text-dark-gold font-bold">{{ opt.attitude }}</span>
                    <span class="text-dark-muted">風險：{{ opt.riskLevel }}</span>
                  </div>
                  <p class="text-xs sm:text-sm font-bold text-dark-text">{{ opt.text }}</p>
                </button>
              </div>

              <div class="p-3 rounded-xl bg-black/40 border border-dark-gold/20 flex items-center space-x-2">
                <input v-model="customActionText" type="text" placeholder="或輸入自訂自由意志行動..." class="flex-grow bg-transparent text-xs text-dark-text outline-none" @keyup.enter="makeCustomDecision" />
                <button @click="makeCustomDecision" :disabled="actionLoading || !customActionText.trim()" class="px-3 py-1.5 rounded-lg bg-dark-gold/20 text-dark-gold border border-dark-gold/40 text-xs font-bold cursor-pointer">執行自由意志</button>
              </div>
            </div>

            <div v-if="activeDisplayNode?.chosenOptionId && viewingAge < session.currentAge" class="flex justify-end">
              <button @click="jumpToCurrentYear" class="px-4 py-2 rounded-xl bg-dark-gold text-dark-void font-bold text-xs cursor-pointer">回到當前歲數 ({{ session.currentAge }} 歲) ➔</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <SimulatorFinalModal
      :final-summary="finalSummary"
      :session="session"
      :selected-perspective="selectedPerspective"
      :is-generating-perspective="isGeneratingPerspective"
      :perspective-options="perspectiveOptions"
      @select-perspective="selectPerspective"
      @request-perspective="requestPerspectiveUpdate"
      @restart="restartSimulation"
      @close="finalSummary = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useLifeSimulator } from '../composables/useLifeSimulator.js';
import SimulatorSetupPanel from '../components/simulator/SimulatorSetupPanel.vue';
import SimulatorBranchPanel from '../components/simulator/SimulatorBranchPanel.vue';
import SimulatorFinalModal from '../components/simulator/SimulatorFinalModal.vue';

const viewMode = ref<'solo' | 'branch'>('solo');
const {
  form, romanceFriendsSetup, savedProfiles, loading, actionLoading, session, viewingAge,
  customActionText, finalSummary, selectedPerspective, isGeneratingPerspective, timelineScroll,
  currentNode, activeDisplayNode, turnGuidance, activeStageIllustration, activeRomanticIllustration,
  attributes, perspectiveOptions,
  whatIfForm, whatIfLoading, whatIfResult, runWhatIfSimulation,
  coupleForm, coupleLoading, coupleResult, runCoupleSimulation,
  onFriendBirthChange, loadVaultProfiles, loadSavedProfile, startSimulation,
  makeDecision, makeCustomDecision, fastForward, selectPerspective, requestPerspectiveUpdate,
  finalizeSimulation, inspectYear, jumpToCurrentYear, restartSimulation,
} = useLifeSimulator();

const statBars = computed(() => [
  { icon: '❤️', label: '體魄健康', value: attributes.value.health, color: attributes.value.health < 30 ? 'bg-rose-500' : 'bg-emerald-400' },
  { icon: '📖', label: '知識才識', value: attributes.value.knowledge ?? attributes.value.wisdom ?? 20, color: 'bg-purple-400' },
  { icon: '🪙', label: '財富資產', value: attributes.value.wealth, color: 'bg-amber-400' },
  { icon: '🌸', label: '情感眷屬', value: attributes.value.relationship, color: 'bg-pink-400' },
  { icon: '👑', label: '事業聲望', value: attributes.value.career, color: 'bg-sky-400' },
]);

onMounted(() => { loadVaultProfiles(); });
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
