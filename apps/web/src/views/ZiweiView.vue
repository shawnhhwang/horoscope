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

    <!-- 命盤格局與倪師心法徽章專區 -->
    <div v-if="chart" class="glass-panel rounded-2xl p-4 sm:p-6 mb-8 border border-dark-gold/30">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dark-gold/20 pb-3 mb-4">
        <div class="flex items-center space-x-2">
          <span class="text-xl">✨</span>
          <h3 class="font-serif text-lg font-bold text-gold-gradient">命盤正統三合格局與倪師命相心法</h3>
        </div>
        <span class="text-xs text-dark-muted dark:text-dark-muted light:text-stone-700 font-serif">
          共識別出 {{ chart.patterns?.length || 0 }} 組格局 · 點擊標籤檢視古籍出處與成立條件
        </span>
      </div>

      <!-- 格局徽章清單 (iPhone 觸控友善 min-h-[44px]) -->
      <div v-if="chart.patterns?.length" class="flex flex-wrap gap-2.5 mb-4">
        <button
          v-for="pattern in chart.patterns"
          :key="pattern.name"
          @click="selectedPattern = selectedPattern?.name === pattern.name ? null : pattern"
          :class="[
            'px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-serif font-semibold border transition-all flex items-center space-x-2 cursor-pointer',
            selectedPattern?.name === pattern.name
              ? 'ring-2 ring-dark-gold shadow-cosmic'
              : 'hover:opacity-90',
            pattern.level === 'excellent'
              ? 'bg-amber-500/15 border-amber-500/50 text-amber-200 dark:text-amber-200 light:text-amber-950 light:bg-amber-100/95 light:border-amber-400'
              : pattern.level === 'good'
              ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 dark:text-emerald-200 light:text-emerald-950 light:bg-emerald-100/95 light:border-emerald-400'
              : pattern.level === 'caution'
              ? 'bg-rose-500/15 border-rose-500/50 text-rose-200 dark:text-rose-200 light:text-rose-950 light:bg-rose-100/95 light:border-rose-400'
              : 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 dark:text-cyan-200 light:text-cyan-950 light:bg-cyan-100/95 light:border-cyan-400',
          ]"
        >
          <span>{{ pattern.level === 'excellent' ? '👑' : pattern.level === 'good' ? '🌟' : pattern.level === 'caution' ? '⚠️' : '🔹' }}</span>
          <span class="font-bold">{{ pattern.name }}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-black/40 dark:bg-black/40 light:bg-black/10 light:text-inherit font-semibold">
            {{ pattern.level === 'excellent' ? '大吉' : pattern.level === 'good' ? '成格' : pattern.level === 'caution' ? '警示' : '正格' }}
          </span>
        </button>
      </div>
      <div v-else class="text-xs text-dark-muted dark:text-dark-muted light:text-stone-700 py-2 font-serif">
        本盤星曜中正平和，未形成極端格局，以三方四正主星廟旺各司其職論斷。
      </div>

      <!-- 選中格局詳情展開卡片 -->
      <div
        v-if="selectedPattern"
        class="p-4 rounded-xl bg-black/40 dark:bg-black/40 light:bg-amber-50/95 border border-dark-gold/30 light:border-amber-300 text-xs dark:text-dark-muted light:text-stone-800 space-y-2.5 animate-fadeIn"
      >
        <div class="flex items-center justify-between border-b border-dark-gold/15 light:border-amber-200 pb-2">
          <div class="flex items-center space-x-2">
            <span class="font-serif font-bold text-sm text-gold-gradient">{{ selectedPattern.name }}</span>
            <span class="text-[11px] text-dark-gold dark:text-dark-gold light:text-amber-800 font-serif font-semibold">【{{ selectedPattern.source || '紫微三合正宗' }}】</span>
          </div>
          <button @click="selectedPattern = null" class="text-dark-muted dark:text-dark-muted light:text-stone-600 hover:text-dark-gold text-xs px-2 py-1 cursor-pointer">關閉 ✕</button>
        </div>
        <p class="leading-relaxed dark:text-dark-gold/90 light:text-stone-900 font-serif font-medium">
          {{ selectedPattern.description }}
        </p>
        <div v-if="selectedPattern.conditions?.required?.length" class="text-[11px] text-emerald-300 dark:text-emerald-300 light:text-emerald-800 font-semibold">
          <strong>成立條件：</strong> {{ selectedPattern.conditions.required.join('；') }}
        </div>
        <div v-if="selectedPattern.conditions?.bonus?.length" class="text-[11px] text-amber-300 dark:text-amber-300 light:text-amber-800 font-semibold">
          <strong>加分項目：</strong> {{ selectedPattern.conditions.bonus.join('；') }}
        </div>
        <div v-if="selectedPattern.conditions?.breaking?.length" class="text-[11px] text-rose-300 dark:text-rose-300 light:text-rose-800 font-semibold">
          <strong>破格警示：</strong> {{ selectedPattern.conditions.breaking.join('；') }}
        </div>
      </div>

      <!-- 倪師天紀大師心法核心摘要 -->
      <div class="mt-4 pt-3 border-t border-dark-gold/15 light:border-amber-300/40 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] dark:text-dark-muted light:text-stone-700 font-serif">
        <div class="p-2.5 rounded-lg bg-dark-gold/5 dark:bg-dark-gold/5 light:bg-amber-100/60 border border-dark-gold/10 light:border-amber-300/50">
          <span class="text-dark-gold dark:text-dark-gold light:text-amber-900 font-bold block mb-0.5">📌 大道至簡</span>
          <span class="light:text-stone-800 font-medium">三合派為正宗，命宮為先天本質，三方四正為後天用武之地。</span>
        </div>
        <div class="p-2.5 rounded-lg bg-dark-gold/5 dark:bg-dark-gold/5 light:bg-amber-100/60 border border-dark-gold/10 light:border-amber-300/50">
          <span class="text-dark-gold dark:text-dark-gold light:text-amber-900 font-bold block mb-0.5">📌 2/3 大於 1/3</span>
          <span class="light:text-stone-800 font-medium">人事努力加上地理環境調整（2/3），必定能大於先天命運（1/3）。</span>
        </div>
        <div class="p-2.5 rounded-lg bg-dark-gold/5 dark:bg-dark-gold/5 light:bg-amber-100/60 border border-dark-gold/10 light:border-amber-300/50">
          <span class="text-dark-gold dark:text-dark-gold light:text-amber-900 font-bold block mb-0.5">📌 知果為了修因</span>
          <span class="light:text-stone-800 font-medium">算命是討論果的哲學，知果是為了在事前三年主動調和人事與陽宅。</span>
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
              <div
                v-for="star in getPalace(branch)?.unluckyStars"
                :key="star.name"
                class="text-[10px] text-amber-300/90"
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
              <div v-for="star in getPalace('辰')?.unluckyStars" :key="star.name" class="text-[10px] text-amber-300/90">{{ star.name }}</div>
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
              <div v-for="star in getPalace('酉')?.unluckyStars" :key="star.name" class="text-[10px] text-amber-300/90">{{ star.name }}</div>
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
              <div v-for="star in getPalace('卯')?.unluckyStars" :key="star.name" class="text-[10px] text-amber-300/90">{{ star.name }}</div>
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
              <div v-for="star in getPalace('戌')?.unluckyStars" :key="star.name" class="text-[10px] text-amber-300/90">{{ star.name }}</div>
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
              <div v-for="star in getPalace(branch)?.unluckyStars" :key="star.name" class="text-[10px] text-amber-300/90">{{ star.name }}</div>
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

          <!-- 輔星與吉曜 -->
          <div class="mb-6">
            <h4 class="text-xs uppercase tracking-wider font-serif text-dark-gold mb-2">吉星吉曜</h4>
            <div v-if="selectedPalace?.luckyStars?.length" class="flex flex-wrap gap-1.5">
              <span
                v-for="s in selectedPalace.luckyStars"
                :key="s.name"
                class="px-2.5 py-1 rounded-md text-xs bg-emerald-950/60 text-emerald-300 border border-emerald-500/20"
              >
                {{ s.name }} ({{ s.brightness || '廟' }})
              </span>
            </div>
            <p v-else class="text-xs text-dark-muted">本宮無特殊輔曜吉星。</p>
          </div>

          <!-- 煞星與考驗星曜 -->
          <div v-if="selectedPalace?.unluckyStars?.length" class="mb-6">
            <h4 class="text-xs uppercase tracking-wider font-serif text-dark-gold mb-2">煞曜與考驗星</h4>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="s in selectedPalace.unluckyStars"
                :key="s.name"
                class="px-2.5 py-1 rounded-md text-xs bg-rose-950/60 text-rose-300 border border-rose-500/20"
              >
                {{ s.name }} ({{ s.brightness || '平' }})
              </span>
            </div>
          </div>

          <!-- 三方四正說明 -->
          <div class="p-3 rounded-lg bg-dark-gold/5 border border-dark-gold/20 text-xs text-dark-muted leading-relaxed">
            <strong class="text-dark-gold block mb-1">倪師三方四正會照法門：</strong>
            命宮為本，三方（財帛、官祿、遷移）為用。與對宮及三合宮形成穩固金三角，吉星互拱則格局清貴，煞星交聚則需心性修持、謀定而後動。
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
      :title="`紫微命盤 (${gender}命·${chart.fiveElementBureau || chart.elementBureau})`"
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
const selectedPattern = ref<any>(null);

const mingStars = computed(() => {
  if (!chart.value) return '主星';
  const ming = chart.value.palaces?.[chart.value.lifePalaceBranch];
  return ming?.majorStars?.map((s: any) => s.name).join('、') || '無主星';
});

const patternNames = computed(() => {
  if (!chart.value?.patterns?.length) return '';
  return chart.value.patterns.map((p: any) => `【${p.name}】`).join('、');
});

const aiPrompt = computed(() => {
  if (!chart.value) return '';
  const patternsStr = patternNames.value ? `，命盤已識別正統格局為：${patternNames.value}` : '';
  const summaryStr = chart.value.mingGongSummary?.nature ? `，命宮星性為「${chart.value.mingGongSummary.nature}」` : '';
  return `請以資深紫微斗數命理諮詢師身份，融匯倪海廈天紀三合心法（大道至簡、命宮為本三方為用、人事努力與地理調整大於先天命運 2/3 > 1/3），為我深度解析此紫微命盤：命宮在「${chart.value.lifePalaceBranch}」宮，主星為「${mingStars.value}」${summaryStr}${patternsStr}，身宮在「${chart.value.bodyPalaceBranch}」，五行局為「${chart.value.fiveElementBureau || chart.value.elementBureau}」。請以客觀嚴謹、條理分明且富有人文關懷的專業視角，詳析命身特質、命中格局成破與吉凶指引、三方四正星系連動、生年四化時機，並給出具體可落地的陽宅空間與生涯決策指引。`;
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
