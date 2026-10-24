<template>
  <div class="max-w-7xl mx-auto px-3 sm:px-6 pt-28 pb-20 font-serif">
    <!-- 頂部標題區 -->
    <div class="text-center mb-8">
      <div class="text-xs uppercase tracking-[0.25em] text-dark-gold mb-2 font-sans">
        ANNUAL DESTINY CALENDAR & LIFE RHYTHM PLANNER
      </div>
      <h1 class="text-3xl sm:text-4xl font-bold text-gold-gradient mb-3">
        流年生活行運曆與起居規劃
      </h1>
      <p class="text-xs sm:text-sm text-dark-muted max-w-2xl mx-auto leading-relaxed">
        融匯子平日主十神、紫微流年四化、黃帝內經四時調神與每日生活起居習慣追蹤 · 打造專屬生活作息節律與重大決策避煞指引
      </p>
    </div>

    <!-- 頂部命盤生辰與目標年份設定卡片 -->
    <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 max-w-4xl mx-auto shadow-cosmic mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-dark-gold/15">
        <h2 class="text-sm font-bold text-gold-gradient flex items-center space-x-2">
          <span>🗓️</span>
          <span>設定命主生辰與推算年份</span>
        </h2>
        <div v-if="savedProfiles.length > 0" class="flex items-center space-x-2 text-xs">
          <span class="text-dark-muted hidden sm:inline">載入命盤：</span>
          <select
            @change="loadSavedProfile(($event.target as HTMLSelectElement).value)"
            class="bg-black/60 dark:bg-black/60 light:bg-white border border-dark-gold/30 rounded-lg px-2.5 py-1 text-dark-text text-xs focus:border-dark-gold outline-none"
          >
            <option value="">選擇已存命盤人物...</option>
            <option v-for="p in savedProfiles" :key="p.id" :value="p.id">
              {{ p.name }} ({{ p.gender }} · {{ p.birthDatetime?.slice(0, 10) }})
            </option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div>
          <label class="block text-dark-muted mb-1.5 font-bold">出生國曆年月日時</label>
          <input
            v-model="form.birthDate"
            type="datetime-local"
            class="w-full bg-black/40 dark:bg-black/40 light:bg-white border border-dark-gold/30 rounded-xl px-3 py-2 text-dark-text text-xs focus:border-dark-gold outline-none transition-colors"
          />
        </div>
        <div>
          <label class="block text-dark-muted mb-1.5 font-bold">生理性別</label>
          <select
            v-model="form.gender"
            class="w-full bg-black/40 dark:bg-black/40 light:bg-white border border-dark-gold/30 rounded-xl px-3 py-2 text-dark-text text-xs focus:border-dark-gold outline-none transition-colors"
          >
            <option value="男">男 (乾造)</option>
            <option value="女">女 (坤造)</option>
          </select>
        </div>
        <div>
          <label class="block text-dark-muted mb-1.5 font-bold">推算目標流年</label>
          <div class="grid grid-cols-4 gap-1">
            <button
              v-for="y in [2025, 2026, 2027, 2028]"
              :key="y"
              @click="form.targetYear = y"
              type="button"
              class="py-2 rounded-lg font-mono font-bold transition-all text-xs"
              :class="[
                form.targetYear === y
                  ? 'bg-dark-gold text-dark-void shadow-sm'
                  : 'bg-black/30 border border-dark-gold/20 text-dark-muted hover:text-dark-text'
              ]"
            >
              {{ y }}
            </button>
          </div>
        </div>
        <div class="flex items-end">
          <button
            @click="calculateAll"
            :disabled="loading"
            class="w-full py-2.5 rounded-xl font-bold text-xs bg-dark-gold text-dark-void hover:bg-yellow-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-cosmic cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <span>{{ loading ? '星象排演中...' : '✨ 開始推算流年曆' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 運算完成後的流年大盤展示區 -->
    <div v-if="calendarResult" class="space-y-8 animate-fade-in">
      <!-- 1. 流年歲君總綱徽章大盤 -->
      <div class="glass-panel rounded-2xl p-6 border border-dark-gold/35 shadow-cosmic max-w-5xl mx-auto bg-gradient-to-r from-dark-gold/10 via-dark-nebula/60 to-dark-gold/5">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-dark-gold/20">
          <div>
            <div class="flex items-center space-x-2 mb-1">
              <span class="px-2.5 py-0.5 rounded-full bg-dark-gold/20 text-dark-gold border border-dark-gold/40 text-xs font-bold font-mono">
                西元 {{ calendarResult.targetYear }} 年
              </span>
              <span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                歲次 {{ calendarResult.yearGanZhi }} ({{ calendarResult.animal }}年)
              </span>
              <span class="px-2 py-0.5 rounded bg-black/40 text-dark-muted text-[11px] font-sans">
                納音：{{ calendarResult.naYin }}
              </span>
            </div>
            <h2 class="text-xl sm:text-2xl font-bold text-gold-gradient mt-1">
              {{ calendarResult.annualOverview.theme }}
            </h2>
          </div>

          <!-- 紫微流年命宮與四化徽章 -->
          <div class="flex flex-col sm:items-end gap-1.5">
            <div class="text-xs text-dark-muted">
              紫微流年命宮：<strong class="text-dark-gold font-bold">{{ calendarResult.ziweiYearlyInfo.palaceBranch }}宮 ({{ calendarResult.ziweiYearlyInfo.palaceName }})</strong>
              <span v-if="calendarResult.ziweiYearlyInfo.majorStars.length > 0" class="ml-1 text-amber-300 font-sans">
                [{{ calendarResult.ziweiYearlyInfo.majorStars.join('·') }}]
              </span>
            </div>
            <div class="flex items-center space-x-1.5 text-xs">
              <span class="px-2 py-0.5 rounded bg-green-500/15 border border-green-500/40 text-green-400 font-bold">
                祿·{{ calendarResult.ziweiYearlyInfo.siHua[0] }}
              </span>
              <span class="px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/40 text-purple-400 font-bold">
                權·{{ calendarResult.ziweiYearlyInfo.siHua[1] }}
              </span>
              <span class="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 font-bold">
                科·{{ calendarResult.ziweiYearlyInfo.siHua[2] }}
              </span>
              <span class="px-2 py-0.5 rounded bg-red-500/15 border border-red-500/40 text-red-400 font-bold">
                忌·{{ calendarResult.ziweiYearlyInfo.siHua[3] }}
              </span>
            </div>
          </div>
        </div>

        <!-- 年度建言與機遇避忌 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs leading-relaxed">
          <div class="p-4 rounded-xl bg-black/40 border border-dark-gold/20 md:col-span-1">
            <span class="font-bold text-dark-gold block mb-1.5">✦ 年度修為與核心建言</span>
            <p class="text-dark-muted">{{ calendarResult.annualOverview.advice }}</p>
          </div>
          <div class="p-4 rounded-xl bg-black/40 border border-green-500/20 md:col-span-1">
            <span class="font-bold text-green-400 block mb-1.5">✦ 年度重點機遇亮點</span>
            <ul class="space-y-1 text-dark-muted">
              <li v-for="(op, i) in calendarResult.annualOverview.opportunityPoints" :key="i">
                ✔ {{ op }}
              </li>
            </ul>
          </div>
          <div class="p-4 rounded-xl bg-black/40 border border-red-500/20 md:col-span-1">
            <span class="font-bold text-red-400 block mb-1.5">✦ 年度戒慎避煞提醒</span>
            <ul class="space-y-1 text-dark-muted">
              <li v-for="(cp, i) in calendarResult.annualOverview.cautionPoints" :key="i">
                ⚠️ {{ cp }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 三大功能分頁切換按鈕 -->
      <div class="flex justify-center">
        <div class="inline-flex p-1.5 rounded-full bg-black/40 border border-dark-gold/30 backdrop-blur-md shadow-cosmic">
          <button
            @click="activeSubTab = 'horizons'"
            class="flex items-center space-x-2 px-5 py-2 rounded-full text-xs font-bold transition-all"
            :class="[
              activeSubTab === 'horizons'
                ? 'bg-dark-gold text-dark-void shadow-md'
                : 'text-dark-muted hover:text-dark-text'
            ]"
          >
            <span>🌙</span>
            <span>十二流月行運曆 (12 Months)</span>
          </button>
          <button
            @click="activeSubTab = 'habits'"
            class="flex items-center space-x-2 px-5 py-2 rounded-full text-xs font-bold transition-all"
            :class="[
              activeSubTab === 'habits'
                ? 'bg-dark-gold text-dark-void shadow-md'
                : 'text-dark-muted hover:text-dark-text'
            ]"
          >
            <span>🌿</span>
            <span>生活起居紀錄與命盤諧振 (Habits & Resonance)</span>
          </button>
          <button
            @click="activeSubTab = 'planner'"
            class="flex items-center space-x-2 px-5 py-2 rounded-full text-xs font-bold transition-all"
            :class="[
              activeSubTab === 'planner'
                ? 'bg-dark-gold text-dark-void shadow-md'
                : 'text-dark-muted hover:text-dark-text'
            ]"
          >
            <span>✨</span>
            <span>天機靈犀 AI 規劃書</span>
          </button>
        </div>
      </div>

      <!-- ───────────────────────────────────────────────────────────── -->
      <!-- 分頁 1: 十二流月行運曆 (12 Monthly Horizons) -->
      <!-- ───────────────────────────────────────────────────────────── -->
      <div v-if="activeSubTab === 'horizons'" class="space-y-6">
        <div class="text-center max-w-xl mx-auto">
          <h3 class="text-base font-bold text-gold-gradient">五虎遁十二流月氣場節律</h3>
          <p class="text-xs text-dark-muted mt-1">
            依歲次天干起五虎遁月法，結合流月四化、紫微月命宮與《黃帝內經》四氣調神大論
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          <div
            v-for="month in calendarResult.monthlyHorizons"
            :key="month.lunarMonth"
            class="glass-panel rounded-2xl p-5 border border-dark-gold/25 hover:border-dark-gold/60 transition-all flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between pb-2.5 border-b border-dark-gold/15 mb-3">
                <div class="flex items-center space-x-2">
                  <span class="w-6 h-6 rounded-full bg-dark-gold/20 text-dark-gold font-bold flex items-center justify-center text-xs">
                    {{ month.lunarMonth }}
                  </span>
                  <div>
                    <h4 class="font-bold text-sm text-gold-gradient leading-tight">{{ month.monthName }}</h4>
                    <span class="text-[10px] text-dark-muted">{{ month.solarMonthRange }}</span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                    {{ month.ganzhi }}月 · {{ month.tenGod }}
                  </span>
                </div>
              </div>

              <!-- 氣場評分與進度條 -->
              <div class="space-y-1 mb-3">
                <div class="flex justify-between text-[11px]">
                  <span class="text-dark-muted">氣場能量調和</span>
                  <span class="font-mono font-bold text-dark-gold">{{ month.energyScore }}分</span>
                </div>
                <div class="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-dark-gold to-yellow-300"
                    :style="{ width: `${month.energyScore}%` }"
                  ></div>
                </div>
              </div>

              <!-- 流月紫微與四化 -->
              <div class="text-xs bg-black/30 p-2.5 rounded-xl border border-dark-gold/15 space-y-1 mb-3">
                <div class="flex justify-between">
                  <span class="text-dark-muted">紫微流月落宮：</span>
                  <strong class="text-amber-200">{{ month.ziweiPalaceBranch }}宮 ({{ month.ziweiPalaceName }})</strong>
                </div>
                <div class="flex justify-between items-center text-[11px] pt-1 border-t border-dark-gold/10">
                  <span class="text-dark-muted">流月四化：</span>
                  <span class="text-dark-gold font-mono">
                    {{ month.siHua[0] }}祿 · {{ month.siHua[1] }}權 · {{ month.siHua[2] }}科 · {{ month.siHua[3] }}忌
                  </span>
                </div>
              </div>

              <!-- 生活起居要旨 -->
              <div class="space-y-2 text-xs leading-relaxed text-dark-muted">
                <p>🛌 <strong>作息養生：</strong>{{ month.habitFocus.sleepRecommendation }}</p>
                <p>🥗 <strong>飲食調理：</strong>{{ month.habitFocus.dietRecommendation }}</p>
                <p>🏃 <strong>運動律動：</strong>{{ month.habitFocus.exerciseRecommendation }}</p>
                <p>⚖️ <strong>決策避煞：</strong>{{ month.habitFocus.decisionTiming }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ───────────────────────────────────────────────────────────── -->
      <!-- 分頁 2: 生活起居紀錄與命盤諧振診斷 (Habits & Resonance) -->
      <!-- ───────────────────────────────────────────────────────────── -->
      <div v-else-if="activeSubTab === 'habits'" class="space-y-8">
        <!-- 診斷大盤儀表板 -->
        <div v-if="evaluationResult" class="glass-panel rounded-2xl p-6 border border-dark-gold/30 max-w-5xl mx-auto shadow-cosmic">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dark-gold/20 mb-6">
            <div>
              <span class="text-[10px] uppercase tracking-wider text-dark-gold">HABIT-CHART RESONANCE DIAGNOSTIC</span>
              <h3 class="text-lg font-bold text-gold-gradient">生活起居與命盤五行諧振診斷儀表</h3>
            </div>
            <div class="flex items-center space-x-3">
              <span class="text-xs text-dark-muted">諧振調和度：</span>
              <span class="text-2xl font-bold font-mono text-dark-gold">{{ evaluationResult.resonanceScore }}分</span>
              <span
                class="px-3 py-1 rounded-full text-xs font-bold"
                :class="[
                  evaluationResult.resonanceLevel === '極佳' ? 'bg-green-500/20 text-green-300 border border-green-500/50' :
                  evaluationResult.resonanceLevel === '良好' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' :
                  'bg-red-500/20 text-red-300 border border-red-500/50'
                ]"
              >
                {{ evaluationResult.resonanceLevel }}
              </span>
            </div>
          </div>

          <!-- 五行能量滋養進度 -->
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs mb-6">
            <div class="p-3 rounded-xl bg-black/40 border border-green-500/20">
              <span class="text-green-400 font-bold block mb-1">木 (肝膽/生發)</span>
              <div class="w-full bg-black/50 h-2 rounded-full overflow-hidden my-1">
                <div class="h-full bg-green-500" :style="{ width: `${evaluationResult.elementalHarmony.woodScore}%` }"></div>
              </div>
              <span class="font-mono text-dark-muted">{{ evaluationResult.elementalHarmony.woodScore }}%</span>
            </div>
            <div class="p-3 rounded-xl bg-black/40 border border-red-500/20">
              <span class="text-red-400 font-bold block mb-1">火 (心神/陽氣)</span>
              <div class="w-full bg-black/50 h-2 rounded-full overflow-hidden my-1">
                <div class="h-full bg-red-500" :style="{ width: `${evaluationResult.elementalHarmony.fireScore}%` }"></div>
              </div>
              <span class="font-mono text-dark-muted">{{ evaluationResult.elementalHarmony.fireScore }}%</span>
            </div>
            <div class="p-3 rounded-xl bg-black/40 border border-yellow-500/20">
              <span class="text-yellow-400 font-bold block mb-1">土 (脾胃/運化)</span>
              <div class="w-full bg-black/50 h-2 rounded-full overflow-hidden my-1">
                <div class="h-full bg-yellow-500" :style="{ width: `${evaluationResult.elementalHarmony.earthScore}%` }"></div>
              </div>
              <span class="font-mono text-dark-muted">{{ evaluationResult.elementalHarmony.earthScore }}%</span>
            </div>
            <div class="p-3 rounded-xl bg-black/40 border border-amber-200/20">
              <span class="text-amber-200 font-bold block mb-1">金 (肺氣/收斂)</span>
              <div class="w-full bg-black/50 h-2 rounded-full overflow-hidden my-1">
                <div class="h-full bg-amber-200" :style="{ width: `${evaluationResult.elementalHarmony.metalScore}%` }"></div>
              </div>
              <span class="font-mono text-dark-muted">{{ evaluationResult.elementalHarmony.metalScore }}%</span>
            </div>
            <div class="p-3 rounded-xl bg-black/40 border border-cyan-500/20 col-span-2 sm:col-span-1">
              <span class="text-cyan-400 font-bold block mb-1">水 (腎水/深睡)</span>
              <div class="w-full bg-black/50 h-2 rounded-full overflow-hidden my-1">
                <div class="h-full bg-cyan-500" :style="{ width: `${evaluationResult.elementalHarmony.waterScore}%` }"></div>
              </div>
              <span class="font-mono text-dark-muted">{{ evaluationResult.elementalHarmony.waterScore }}%</span>
            </div>
          </div>

          <!-- 三大專項評析 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed mb-6">
            <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/20">
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-dark-gold">🛌 睡眠作息</span>
                <span class="text-[11px] font-mono font-bold text-amber-300">均 {{ evaluationResult.sleepAnalysis.avgSleepHours }}h</span>
              </div>
              <p class="text-dark-muted">{{ evaluationResult.sleepAnalysis.advice }}</p>
            </div>
            <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/20">
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-dark-gold">🥗 飲食飲水</span>
                <span class="text-[11px] font-mono font-bold text-cyan-300">水 {{ evaluationResult.dietAnalysis.avgWaterMl }}ml</span>
              </div>
              <p class="text-dark-muted">{{ evaluationResult.dietAnalysis.advice }}</p>
            </div>
            <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/20">
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-dark-gold">🏃 運動精力</span>
                <span class="text-[11px] font-mono font-bold text-green-300">動 {{ evaluationResult.exerciseAnalysis.avgMinutes }}分</span>
              </div>
              <p class="text-dark-muted">{{ evaluationResult.exerciseAnalysis.advice }}</p>
            </div>
          </div>

          <!-- 專屬生活規劃行動卡 -->
          <div>
            <h4 class="text-sm font-bold text-gold-gradient mb-3">專屬生活起居行動清單 (Action Plans)</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div
                v-for="(plan, idx) in evaluationResult.actionPlans"
                :key="idx"
                class="p-4 rounded-xl bg-black/40 border border-dark-gold/25 flex flex-col justify-between"
              >
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-bold text-amber-300">{{ plan.title }}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded bg-dark-gold/15 text-dark-gold border border-dark-gold/30">
                      補{{ plan.favorableElement }}
                    </span>
                  </div>
                  <span class="text-[11px] text-dark-muted block mb-2 font-mono">時機：{{ plan.timeFrame }}</span>
                  <p class="text-dark-muted leading-relaxed">{{ plan.detail }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 生活起居紀錄管理 -->
        <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 max-w-5xl mx-auto shadow-cosmic">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-dark-gold/15">
            <div>
              <h3 class="text-base font-bold text-gold-gradient">生活起居與習慣日記</h3>
              <p class="text-xs text-dark-muted mt-0.5">每日紀錄作息、飲食、運動與精力狀態，系統即時對比命盤並調整生活規劃</p>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="injectDemoHabits"
                class="px-3.5 py-1.5 rounded-xl border border-dark-gold/40 text-dark-gold hover:bg-dark-gold/15 transition-all text-xs font-serif cursor-pointer"
                title="載入 3 筆範例起居紀錄以快速預覽診斷分析"
              >
                🎲 載入示範起居數據
              </button>
              <button
                @click="openHabitModal()"
                class="px-4 py-1.5 rounded-xl bg-dark-gold text-dark-void font-bold hover:bg-yellow-500 transition-all text-xs font-serif shadow-cosmic cursor-pointer"
              >
                ＋ 記錄今日生活起居
              </button>
            </div>
          </div>

          <!-- 紀錄列表 -->
          <div v-if="habitsList.length === 0" class="text-center py-12 text-dark-muted text-xs">
            目前尚無生活起居紀錄。點擊上方「＋ 記錄今日生活起居」或「🎲 載入示範起居數據」開始規劃！
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="log in habitsList"
              :key="log.id || log.date"
              class="p-4 rounded-xl bg-black/40 border border-dark-gold/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div class="space-y-1">
                <div class="flex items-center space-x-2">
                  <span class="font-mono font-bold text-amber-300">{{ log.date }}</span>
                  <span class="px-2 py-0.5 rounded bg-dark-gold/10 text-dark-gold border border-dark-gold/20 text-[11px]">
                    睡眠 {{ log.sleepHours }}h ({{ log.sleepQuality }})
                  </span>
                  <span class="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[11px]">
                    飲水 {{ log.waterMl }}ml
                  </span>
                  <span class="px-2 py-0.5 rounded bg-green-500/10 text-green-300 border border-green-500/20 text-[11px]">
                    運動 {{ log.exerciseMinutes }}分
                  </span>
                </div>
                <div class="text-dark-muted text-[11px] flex items-center space-x-2 pt-1">
                  <span>飲食：{{ log.dietType }}</span>
                  <span>· 精力：{{ '⭐'.repeat(log.energyLevel || 3) }}</span>
                  <span v-if="log.notes" class="truncate max-w-xs">· 備忘：{{ log.notes }}</span>
                </div>
              </div>
              <div class="flex items-center space-x-2 self-end sm:self-auto">
                <button
                  @click="deleteHabitLog(log.id)"
                  class="text-[11px] text-red-400 hover:text-red-300 transition-colors cursor-pointer px-2 py-1 rounded hover:bg-red-500/10"
                >
                  刪除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ───────────────────────────────────────────────────────────── -->
      <!-- 分頁 3: 天機靈犀 AI 規劃書 -->
      <!-- ───────────────────────────────────────────────────────────── -->
      <div v-else-if="activeSubTab === 'planner'" class="space-y-6 max-w-5xl mx-auto">
        <InPageAiAnalysis
          module-type="ANNUAL_PLANNER"
          :title="`${calendarResult.targetYear} ${calendarResult.yearGanZhi}年度生活行運曆與起居規劃`"
          :summary="`歲次: ${calendarResult.yearGanZhi} · 日主十神: ${calendarResult.yearTenGod} · 紫微四化: ${calendarResult.ziweiYearlyInfo.siHua.join('、')} · 諧振評分: ${evaluationResult?.resonanceScore || 85}分`"
          :raw-data="{ calendar: calendarResult, evaluation: evaluationResult, habits: habitsList }"
          prompt="請結合我的命盤流年四化、日主十神與近期生活起居習慣，為我制定全年度的生活起居規劃、四時調神節奏與重大決策避煞指引。"
          button-text="✨ 啟動 AI 顧問·生成全年度生活起居規劃書"
        />
      </div>
    </div>

    <!-- ───────────────────────────────────────────────────────────── -->
    <!-- 記錄生活起居彈窗 (Habit Modal) -->
    <!-- ───────────────────────────────────────────────────────────── -->
    <div
      v-if="isHabitModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      @click.self="isHabitModalOpen = false"
    >
      <div class="glass-panel rounded-2xl p-6 border border-dark-gold/40 shadow-cosmic max-w-lg w-full font-serif space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-dark-gold/20">
          <h3 class="text-base font-bold text-gold-gradient">記錄生活起居習慣</h3>
          <button @click="isHabitModalOpen = false" class="text-dark-muted hover:text-dark-text text-sm">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block text-dark-muted mb-1 font-bold">紀錄日期</label>
            <input
              v-model="habitForm.date"
              type="date"
              class="w-full bg-black/40 border border-dark-gold/30 rounded-xl px-3 py-2 text-dark-text text-xs focus:border-dark-gold outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-dark-muted mb-1 font-bold">睡眠時長 (小時)</label>
              <input
                v-model.number="habitForm.sleepHours"
                type="number"
                step="0.5"
                min="3"
                max="14"
                class="w-full bg-black/40 border border-dark-gold/30 rounded-xl px-3 py-2 text-dark-text text-xs focus:border-dark-gold outline-none"
              />
            </div>
            <div>
              <label class="block text-dark-muted mb-1 font-bold">睡眠品質</label>
              <select
                v-model="habitForm.sleepQuality"
                class="w-full bg-black/40 border border-dark-gold/30 rounded-xl px-3 py-2 text-dark-text text-xs focus:border-dark-gold outline-none"
              >
                <option value="優質">優質 (一覺到天亮)</option>
                <option value="良好">良好 (安穩少夢)</option>
                <option value="普通">普通 (正常起伏)</option>
                <option value="淺眠疲倦">淺眠疲倦 (易醒多夢)</option>
                <option value="嚴重失眠">嚴重失眠 (難以入睡)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-dark-muted mb-1 font-bold">飲食結構</label>
              <select
                v-model="habitForm.dietType"
                class="w-full bg-black/40 border border-dark-gold/30 rounded-xl px-3 py-2 text-dark-text text-xs focus:border-dark-gold outline-none"
              >
                <option value="均衡清淡">均衡清淡</option>
                <option value="多蔬少油">多蔬少油</option>
                <option value="辛辣油膩">辛辣油膩</option>
                <option value="甜食生冷">甜食生冷</option>
                <option value="外食應酬">外食應酬</option>
                <option value="間歇斷食">間歇斷食</option>
              </select>
            </div>
            <div>
              <label class="block text-dark-muted mb-1 font-bold">飲水量 (ml)</label>
              <input
                v-model.number="habitForm.waterMl"
                type="number"
                step="100"
                min="500"
                max="5000"
                class="w-full bg-black/40 border border-dark-gold/30 rounded-xl px-3 py-2 text-dark-text text-xs focus:border-dark-gold outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-dark-muted mb-1 font-bold">運動活動 (分鐘)</label>
              <input
                v-model.number="habitForm.exerciseMinutes"
                type="number"
                step="5"
                min="0"
                max="180"
                class="w-full bg-black/40 border border-dark-gold/30 rounded-xl px-3 py-2 text-dark-text text-xs focus:border-dark-gold outline-none"
              />
            </div>
            <div>
              <label class="block text-dark-muted mb-1 font-bold">精力與情緒狀態 (1-5)</label>
              <select
                v-model.number="habitForm.energyLevel"
                class="w-full bg-black/40 border border-dark-gold/30 rounded-xl px-3 py-2 text-dark-text text-xs focus:border-dark-gold outline-none"
              >
                <option :value="5">⭐⭐⭐⭐⭐ 極佳 (精力充沛)</option>
                <option :value="4">⭐⭐⭐⭐ 良好 (專注穩定)</option>
                <option :value="3">⭐⭐⭐ 普通 (一般水平)</option>
                <option :value="2">⭐⭐ 欠佳 (偶有疲倦)</option>
                <option :value="1">⭐ 低落 (極度疲勞)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-dark-muted mb-1 font-bold">隨記 / 重大事件備忘</label>
            <textarea
              v-model="habitForm.notes"
              rows="2"
              placeholder="例如：晨跑 3 公里、下午順利簽署合約、晚間進行 10 分鐘冥想..."
              class="w-full bg-black/40 border border-dark-gold/30 rounded-xl px-3 py-2 text-dark-text text-xs focus:border-dark-gold outline-none resize-none"
            ></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end space-x-2 pt-2 border-t border-dark-gold/15">
          <button
            @click="isHabitModalOpen = false"
            class="px-4 py-2 rounded-xl text-xs text-dark-muted hover:text-dark-text"
          >
            取消
          </button>
          <button
            @click="submitHabitLog"
            class="px-5 py-2 rounded-xl text-xs font-bold bg-dark-gold text-dark-void hover:bg-yellow-500 shadow-cosmic cursor-pointer"
          >
            儲存紀錄
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  calculateAnnualDestinyCalendar,
  evaluateHabitResonance,
  AnnualDestinyCalendar,
  HabitResonanceEvaluation,
  HabitLogEntry,
} from '@celestial/astro-core';
import { useAuthStore } from '../stores/auth.js';
import InPageAiAnalysis from '../components/ai/InPageAiAnalysis.vue';

const authStore = useAuthStore();

// 分頁狀態 ('horizons' | 'habits' | 'planner')
const activeSubTab = ref<'horizons' | 'habits' | 'planner'>('horizons');

const form = ref({
  birthDate: '1992-06-18T10:30',
  gender: '男' as '男' | '女',
  targetYear: 2026,
  longitude: 120,
});

const loading = ref(false);
const calendarResult = ref<AnnualDestinyCalendar | null>(null);
const evaluationResult = ref<HabitResonanceEvaluation | null>(null);

// 已存檔案與起居紀錄
const savedProfiles = ref<any[]>([]);
const habitsList = ref<HabitLogEntry[]>([]);

// 紀錄 Modal 狀態
const isHabitModalOpen = ref(false);
const habitForm = ref<HabitLogEntry>({
  date: new Date().toISOString().slice(0, 10),
  sleepHours: 7.5,
  sleepQuality: '良好',
  dietType: '均衡清淡',
  waterMl: 2000,
  exerciseMinutes: 30,
  energyLevel: 4,
  notes: '',
  tags: [],
});

function calculateAll() {
  loading.value = true;
  try {
    const cal = calculateAnnualDestinyCalendar(
      new Date(form.value.birthDate),
      form.value.gender,
      form.value.targetYear,
      form.value.longitude
    );
    calendarResult.value = cal;

    const evaluation = evaluateHabitResonance(cal, habitsList.value);
    evaluationResult.value = evaluation;
  } catch (err) {
    console.error('Calculation error:', err);
  } finally {
    loading.value = false;
  }
}

async function fetchSavedProfiles() {
  try {
    const res = await fetch('/api/v1/profiles', {
      headers: authStore.getAuthHeaders(),
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      savedProfiles.value = data.data;
    }
  } catch (err) {
    console.warn('Failed to load profiles:', err);
  }
}

function loadSavedProfile(profileId: string) {
  if (!profileId) return;
  const target = savedProfiles.value.find((p) => p.id === profileId);
  if (target) {
    if (target.birthDatetime) {
      form.value.birthDate = target.birthDatetime.slice(0, 16);
    }
    if (target.gender === '男' || target.gender === '女') {
      form.value.gender = target.gender;
    }
    calculateAll();
  }
}

async function fetchHabits() {
  try {
    const res = await fetch('/api/v1/habits', {
      headers: authStore.getAuthHeaders(),
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      habitsList.value = data.data;
      if (calendarResult.value) {
        evaluationResult.value = evaluateHabitResonance(calendarResult.value, habitsList.value);
      }
    }
  } catch (err) {
    console.warn('Failed to load habits:', err);
  }
}

function openHabitModal() {
  habitForm.value = {
    date: new Date().toISOString().slice(0, 10),
    sleepHours: 7.5,
    sleepQuality: '良好',
    dietType: '均衡清淡',
    waterMl: 2000,
    exerciseMinutes: 30,
    energyLevel: 4,
    notes: '',
    tags: [],
  };
  isHabitModalOpen.value = true;
}

async function submitHabitLog() {
  try {
    const res = await fetch('/api/v1/habits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authStore.getAuthHeaders(),
      },
      body: JSON.stringify(habitForm.value),
    });
    const data = await res.json();
    if (data.success) {
      await fetchHabits();
      isHabitModalOpen.value = false;
    } else {
      // 本地追加 fallback
      habitsList.value.unshift({ ...habitForm.value, id: String(Date.now()) });
      if (calendarResult.value) {
        evaluationResult.value = evaluateHabitResonance(calendarResult.value, habitsList.value);
      }
      isHabitModalOpen.value = false;
    }
  } catch (err) {
    habitsList.value.unshift({ ...habitForm.value, id: String(Date.now()) });
    if (calendarResult.value) {
      evaluationResult.value = evaluateHabitResonance(calendarResult.value, habitsList.value);
    }
    isHabitModalOpen.value = false;
  }
}

async function deleteHabitLog(id?: string) {
  if (!id) return;
  try {
    await fetch(`/api/v1/habits/${id}`, {
      method: 'DELETE',
      headers: authStore.getAuthHeaders(),
    });
  } catch (err) {
    // ignore
  }
  habitsList.value = habitsList.value.filter((h) => h.id !== id);
  if (calendarResult.value) {
    evaluationResult.value = evaluateHabitResonance(calendarResult.value, habitsList.value);
  }
}

function injectDemoHabits() {
  const demos: HabitLogEntry[] = [
    {
      id: 'demo-1',
      date: '2026-06-18',
      sleepHours: 8.0,
      sleepQuality: '優質',
      dietType: '多蔬少油',
      waterMl: 2400,
      exerciseMinutes: 40,
      energyLevel: 5,
      notes: '晨起慢跑，頭腦格外清晰，順利完成了季度策略提案。',
      tags: ['晨跑', '高能專注'],
    },
    {
      id: 'demo-2',
      date: '2026-06-17',
      sleepHours: 7.5,
      sleepQuality: '良好',
      dietType: '均衡清淡',
      waterMl: 2100,
      exerciseMinutes: 30,
      energyLevel: 4,
      notes: '晚間 22:30 前熄燈，夜間睡眠平穩。',
      tags: ['早睡', '定時飲水'],
    },
    {
      id: 'demo-3',
      date: '2026-06-16',
      sleepHours: 6.5,
      sleepQuality: '淺眠疲倦',
      dietType: '外食應酬',
      waterMl: 1600,
      exerciseMinutes: 15,
      energyLevel: 3,
      notes: '晚間參加商務聚會，飲食偏重，略感疲憊。',
      tags: ['外食', '應酬'],
    },
  ];
  habitsList.value = demos;
  if (calendarResult.value) {
    evaluationResult.value = evaluateHabitResonance(calendarResult.value, habitsList.value);
  }
}

onMounted(() => {
  calculateAll();
  fetchSavedProfiles();
  fetchHabits();
});
</script>
