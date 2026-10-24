<template>
  <div class="max-w-7xl mx-auto px-3 sm:px-6 pt-28 pb-20 font-serif">
    <!-- 頂部標題區 -->
    <div class="text-center mb-8">
      <div class="text-xs uppercase tracking-[0.25em] text-dark-gold mb-2 font-sans">
        BAZI SYNASTRY & FAMILY GROUP HARMONY
      </div>
      <h1 class="text-3xl sm:text-4xl font-bold text-gold-gradient mb-3">
        八字合婚與家人群組比對
      </h1>
      <p class="text-xs text-dark-muted max-w-2xl mx-auto leading-relaxed">
        融匯《滴天髓》夫妻正配與現代家庭系統動力 · 天干五合地支六合 · 五行互補喜用濟助 · 跨世代家族五行場域
      </p>
    </div>

    <!-- 雙分頁切換按鈕 (Tab Switcher) -->
    <div class="flex justify-center mb-8">
      <div class="inline-flex p-1.5 rounded-full bg-black/40 border border-dark-gold/30 backdrop-blur-md shadow-cosmic">
        <button
          @click="activeTab = 'synastry'"
          class="flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all"
          :class="[
            activeTab === 'synastry'
              ? 'bg-dark-gold text-dark-void shadow-md scale-102'
              : 'text-dark-muted hover:text-dark-text',
          ]"
        >
          <span>💍</span>
          <span>八字合婚 (二人合盤)</span>
        </button>
        <button
          @click="activeTab = 'family'"
          class="flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all"
          :class="[
            activeTab === 'family'
              ? 'bg-dark-gold text-dark-void shadow-md scale-102'
              : 'text-dark-muted hover:text-dark-text',
          ]"
        >
          <span>👨‍👩‍👧‍👦</span>
          <span>家人群組 (多人群盤)</span>
        </button>
      </div>
    </div>

    <!-- ───────────────────────────────────────────────────────────── -->
    <!-- 分頁 1: 八字合婚 (二人合盤) -->
    <!-- ───────────────────────────────────────────────────────────── -->
    <div v-if="activeTab === 'synastry'" class="space-y-8 animate-fade-in">
      <!-- 輸入表單卡片 -->
      <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 max-w-4xl mx-auto shadow-cosmic">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-dark-gold/15">
          <h2 class="text-sm font-bold text-gold-gradient flex items-center space-x-2">
            <span>💍</span>
            <span>輸入雙方生辰與性別</span>
          </h2>
          <!-- 若有儲存之命盤，提供一鍵載入 -->
          <div v-if="savedProfiles.length > 0" class="flex items-center space-x-2 text-xs">
            <span class="text-dark-muted hidden sm:inline">快捷載入：</span>
            <select
              @change="quickLoadProfile($event, 'p1')"
              class="px-2 py-1 rounded bg-black/50 border border-dark-gold/30 text-[11px] text-dark-text outline-none"
            >
              <option value="">載入男方檔案...</option>
              <option v-for="p in savedProfiles" :key="p.id" :value="p.id">{{ p.name }} ({{ p.gender }})</option>
            </select>
            <select
              @change="quickLoadProfile($event, 'p2')"
              class="px-2 py-1 rounded bg-black/50 border border-dark-gold/30 text-[11px] text-dark-text outline-none"
            >
              <option value="">載入女方檔案...</option>
              <option v-for="p in savedProfiles" :key="p.id" :value="p.id">{{ p.name }} ({{ p.gender }})</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 男方 (乾造) -->
          <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/20 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-amber-300">男方 (乾造)</span>
              <span class="text-[10px] text-dark-muted">陽剛氣守</span>
            </div>
            <div>
              <label class="block text-[11px] text-dark-muted mb-1">姓名 / 暱稱</label>
              <input
                v-model="synastryForm.p1Name"
                type="text"
                placeholder="例如：張君豪"
                class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
              />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] text-dark-muted mb-1">性別</label>
                <select
                  v-model="synastryForm.p1Gender"
                  class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
                >
                  <option value="男">男 (乾造)</option>
                  <option value="女">女 (坤造)</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] text-dark-muted mb-1">生辰時間</label>
                <input
                  v-model="synastryForm.p1Date"
                  type="datetime-local"
                  class="w-full px-2 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-[11px] focus:border-dark-gold outline-none"
                />
              </div>
            </div>
          </div>

          <!-- 女方 (坤造) -->
          <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/20 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-rose-300">女方 (坤造)</span>
              <span class="text-[10px] text-dark-muted">柔順坤德</span>
            </div>
            <div>
              <label class="block text-[11px] text-dark-muted mb-1">姓名 / 暱稱</label>
              <input
                v-model="synastryForm.p2Name"
                type="text"
                placeholder="例如：林雅婷"
                class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
              />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] text-dark-muted mb-1">性別</label>
                <select
                  v-model="synastryForm.p2Gender"
                  class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
                >
                  <option value="女">女 (坤造)</option>
                  <option value="男">男 (乾造)</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] text-dark-muted mb-1">生辰時間</label>
                <input
                  v-model="synastryForm.p2Date"
                  type="datetime-local"
                  class="w-full px-2 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-[11px] focus:border-dark-gold outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          @click="handleCalculateSynastry"
          :disabled="loadingSynastry"
          class="w-full mt-6 py-3 rounded-xl font-serif text-xs font-bold bg-dark-gold text-dark-void hover:opacity-90 shadow-cosmic transition-all disabled:opacity-50 cursor-pointer"
        >
          {{ loadingSynastry ? '合婚推演中...' : '推演八字合婚 ⚡' }}
        </button>
      </div>

      <!-- 合婚結果展示 -->
      <div v-if="synastryResult" class="space-y-8 animate-fade-in">
        <!-- 綜合契合度評分徽章與總結 -->
        <div class="glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/35 shadow-cosmic max-w-4xl mx-auto text-center relative overflow-hidden">
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-dark-gold/15 border border-dark-gold/30 text-xs text-dark-gold mb-3">
            <span>✨ 雙造八字因緣綜合評定</span>
          </div>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-6 my-4">
            <!-- 得分環 -->
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
            <!-- 男方四柱 -->
            <div class="p-4 rounded-xl bg-black/40 border border-amber-500/30">
              <div class="flex justify-between items-center mb-2 pb-1 border-b border-amber-500/20">
                <span class="font-bold text-amber-300">{{ synastryResult.person1.name }}</span>
                <span class="text-[10px] text-dark-muted">{{ synastryResult.person1.energyStatus }} · 日主{{ synastryResult.person1.dayMaster }}</span>
              </div>
              <div class="font-mono text-dark-gold font-bold text-sm tracking-wider mb-2">
                {{ synastryResult.person1.fourPillarsText }}
              </div>
              <div class="text-[11px] text-dark-muted leading-relaxed">
                喜用神：{{ synastryResult.person1.chart.favorableElements.useful.join('、') }}
              </div>
            </div>

            <!-- 女方四柱 -->
            <div class="p-4 rounded-xl bg-black/40 border border-rose-500/30">
              <div class="flex justify-between items-center mb-2 pb-1 border-b border-rose-500/20">
                <span class="font-bold text-rose-300">{{ synastryResult.person2.name }}</span>
                <span class="text-[10px] text-dark-muted">{{ synastryResult.person2.energyStatus }} · 日主{{ synastryResult.person2.dayMaster }}</span>
              </div>
              <div class="font-mono text-dark-gold font-bold text-sm tracking-wider mb-2">
                {{ synastryResult.person2.fourPillarsText }}
              </div>
              <div class="text-[11px] text-dark-muted leading-relaxed">
                喜用神：{{ synastryResult.person2.chart.favorableElements.useful.join('、') }}
              </div>
            </div>
          </div>
        </div>

        <!-- 四大核心維度深度解構卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <!-- 1. 日主天干相合與情義 -->
          <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-gold-gradient">1. 日元天干相合與情義</span>
                <span class="text-xs font-mono px-2 py-0.5 rounded bg-dark-gold/15 text-dark-gold border border-dark-gold/30">
                  {{ synastryResult.dimensions.dayMasterSynergy.score }}/25 分 ({{ synastryResult.dimensions.dayMasterSynergy.relationType }})
                </span>
              </div>
              <p class="text-xs text-dark-text leading-relaxed mb-3">
                {{ synastryResult.dimensions.dayMasterSynergy.description }}
              </p>
            </div>
            <div class="p-2.5 rounded-lg bg-black/30 border border-dark-gold/15 text-[11px] text-dark-muted">
              💡 建議：{{ synastryResult.dimensions.dayMasterSynergy.advice }}
            </div>
          </div>

          <!-- 2. 夫妻宮日支相合與默契 -->
          <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-gold-gradient">2. 夫妻宮日支默契與生活</span>
                <span class="text-xs font-mono px-2 py-0.5 rounded bg-dark-gold/15 text-dark-gold border border-dark-gold/30">
                  {{ synastryResult.dimensions.spousePalaceSynergy.score }}/25 分 ({{ synastryResult.dimensions.spousePalaceSynergy.relationType }})
                </span>
              </div>
              <p class="text-xs text-dark-text leading-relaxed mb-3">
                {{ synastryResult.dimensions.spousePalaceSynergy.description }}
              </p>
            </div>
            <div class="p-2.5 rounded-lg bg-black/30 border border-dark-gold/15 text-[11px] text-dark-muted">
              💡 建議：{{ synastryResult.dimensions.spousePalaceSynergy.advice }}
            </div>
          </div>

          <!-- 3. 五行能量互補與喜用互濟 -->
          <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-gold-gradient">3. 五行能量互補與喜用互濟</span>
                <span class="text-xs font-mono px-2 py-0.5 rounded bg-dark-gold/15 text-dark-gold border border-dark-gold/30">
                  {{ synastryResult.dimensions.fiveElementsComplementarity.score }}/30 分
                </span>
              </div>
              <p class="text-xs text-dark-text leading-relaxed mb-2">
                {{ synastryResult.dimensions.fiveElementsComplementarity.usefulElementsSupport }}
              </p>
              <p class="text-xs text-dark-muted leading-relaxed">
                {{ synastryResult.dimensions.fiveElementsComplementarity.lackingElementsBalance }}
              </p>
            </div>
          </div>

          <!-- 4. 年柱根基與原生家庭緣分 -->
          <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-gold-gradient">4. 年柱根基與家族融合</span>
                <span class="text-xs font-mono px-2 py-0.5 rounded bg-dark-gold/15 text-dark-gold border border-dark-gold/30">
                  {{ synastryResult.dimensions.yearPillarSynergy.score }}/20 分
                </span>
              </div>
              <p class="text-xs text-dark-text leading-relaxed mb-2">
                {{ synastryResult.dimensions.yearPillarSynergy.description }}
              </p>
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
            <div
              v-for="(tip, idx) in synastryResult.bridgingElement.dailyTips"
              :key="idx"
              class="p-2.5 rounded-lg bg-black/40 border border-dark-gold/15 text-[11px] text-dark-muted leading-relaxed"
            >
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
              <tr
                v-for="row in synastryResult.fourPillarsDetailedCross"
                :key="row.pillarName"
                class="border-b border-dark-gold/10 hover:bg-white/5 transition-colors"
              >
                <td class="py-2.5 px-3 font-bold text-dark-gold">{{ row.pillarName }}</td>
                <td class="py-2.5 px-3 font-mono font-bold">{{ row.p1GanZhi }}</td>
                <td class="py-2.5 px-3 font-mono font-bold">{{ row.p2GanZhi }}</td>
                <td class="py-2.5 px-3 text-amber-300 font-bold">{{ row.relation }}</td>
                <td class="py-2.5 px-3 text-dark-muted">{{ row.verdict }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ☯ 紫微斗數 × 倪海廈《天紀》雙宮聯參與五步合盤分析 (ziwei-doushu-main 架構) -->
        <div
          v-if="synastryResult.ziweiHeming"
          class="glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/35 shadow-cosmic max-w-4xl mx-auto space-y-6"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-dark-gold/20">
            <div>
              <span class="text-[10px] uppercase tracking-widest text-dark-gold font-serif">
                TIANJI ZIWEI SYNASTRY · 倪海廈《天紀》合盤體系
              </span>
              <h3 class="text-lg font-bold text-gold-gradient mt-0.5">
                ☯ 紫微雙宮聯參（夫妻宮 + 福德宮）與五步合盤診斷
              </h3>
            </div>
            <div class="flex items-center space-x-2">
              <span class="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/50 text-amber-200 text-xs font-bold">
                🌟 天紀評級：{{ synastryResult.ziweiHeming.starRating }}
              </span>
              <span class="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/50 text-emerald-200 text-xs font-bold">
                {{ synastryResult.ziweiHeming.destinyType }}
              </span>
            </div>
          </div>

          <!-- 倪師雙宮聯參核心鐵律橫幅 -->
          <div class="p-4 rounded-xl bg-black/40 border border-dark-gold/25 text-xs leading-relaxed">
            <span class="font-bold text-dark-gold block mb-1">📌 倪師《天紀》雙宮聯參鐵律：</span>
            <p class="text-dark-text">{{ synastryResult.ziweiHeming.dualPalacePrinciple }}</p>
          </div>

          <!-- 雙方 命宮 / 夫妻宮 / 福德宮 對照卡片 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div
              v-for="prof in [synastryResult.ziweiHeming.person1Profile, synastryResult.ziweiHeming.person2Profile]"
              :key="prof.name"
              class="p-4 rounded-xl bg-black/30 border border-dark-gold/20 space-y-2.5"
            >
              <div class="flex items-center justify-between border-b border-dark-gold/15 pb-2">
                <span class="font-bold text-sm text-gold-gradient">{{ prof.name }} ({{ prof.gender }}命)</span>
                <span class="px-2 py-0.5 rounded bg-dark-gold/15 text-dark-gold border border-dark-gold/30 text-[11px] font-bold">
                  {{ prof.mingGongType }}
                </span>
              </div>
              <div>
                <span class="text-dark-muted">命宮主星：</span>
                <span class="font-bold text-dark-text">{{ prof.mingGongStars.join('、') }}</span>
              </div>
              <div>
                <span class="text-dark-muted">夫妻宮星曜：</span>
                <span class="font-bold text-amber-300">{{ prof.fuqiStars.join('、') }}</span>
                <span v-if="prof.fuqiSihua.length" class="ml-1.5 text-rose-300 font-bold">（{{ prof.fuqiSihua.join('、') }}）</span>
              </div>
              <p class="text-dark-text leading-relaxed">{{ prof.fuqiSummary }}</p>
              <div class="text-[11px] text-emerald-300">
                <strong>✦ 吉象優勢：</strong>{{ prof.fuqiGood }}
              </div>
              <div class="text-[11px] text-rose-300">
                <strong>⚠️ 相處注意：</strong>{{ prof.fuqiBad }}
              </div>
              <div v-if="prof.fuqiNiQuote" class="p-2.5 rounded-lg bg-dark-gold/10 border border-dark-gold/25 text-[11px] text-dark-gold italic">
                💬 三合易理註解：「{{ prof.fuqiNiQuote }}」
              </div>
              <div class="pt-1 border-t border-dark-gold/10 text-[11px] text-dark-muted">
                <strong>福德宮根基：</strong>{{ prof.fudeEvaluation }}
              </div>
            </div>
          </div>

          <!-- 天紀合盤五步法詳解 -->
          <div class="space-y-2.5 text-xs">
            <h4 class="font-bold text-dark-gold text-xs uppercase tracking-wider">✦ 天紀合盤五步法逐層拆解：</h4>
            <div class="p-3.5 rounded-xl bg-black/30 border border-dark-gold/15">
              <span class="font-bold text-amber-300 block mb-0.5">第一步 · 雙方命格基礎與動靜互補：</span>
              <p class="text-dark-muted leading-relaxed">{{ synastryResult.ziweiHeming.fiveSteps.step1BaseCompatibility }}</p>
            </div>
            <div class="p-3.5 rounded-xl bg-black/30 border border-dark-gold/15">
              <span class="font-bold text-amber-300 block mb-0.5">第二步 · 夫妻宮互參與天作之合判定：</span>
              <p class="text-dark-muted leading-relaxed">{{ synastryResult.ziweiHeming.fiveSteps.step2SpouseCrossMatch }}</p>
            </div>
            <div class="p-3.5 rounded-xl bg-black/30 border border-dark-gold/15">
              <span class="font-bold text-amber-300 block mb-0.5">第三步 · 太陽與太陰男女婚姻星象互參：</span>
              <p class="text-dark-muted leading-relaxed">{{ synastryResult.ziweiHeming.fiveSteps.step3SunMoonAnalysis }}</p>
            </div>
            <div class="p-3.5 rounded-xl bg-black/30 border border-dark-gold/15">
              <span class="font-bold text-amber-300 block mb-0.5">第四步 · 生年四化飛化互參（緣分引動）：</span>
              <p class="text-dark-muted leading-relaxed">{{ synastryResult.ziweiHeming.fiveSteps.step4SihuaMutualFly }}</p>
            </div>
            <div class="p-3.5 rounded-xl bg-black/30 border border-dark-gold/15">
              <span class="font-bold text-amber-300 block mb-0.5">第五步 · 婚期建議與倪師陽宅化命大法：</span>
              <p class="text-dark-muted leading-relaxed">{{ synastryResult.ziweiHeming.fiveSteps.step5TimingAndYangzhai }}</p>
            </div>
          </div>
        </div>

        <!-- 婚姻生活現代指引與存檔 -->
        <div class="glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/30 max-w-4xl mx-auto space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-dark-gold/15">
            <h3 class="text-sm font-bold text-gold-gradient">現代婚姻四維相處指引</h3>
            <button
              @click="saveSynastryJournal"
              class="px-4 py-2 rounded-lg font-serif text-xs font-semibold border border-dark-gold/40 text-dark-gold hover:bg-dark-gold/15 transition-all cursor-pointer shadow-cosmic"
            >
              儲存合婚紀錄至占卜日記 📖
            </button>
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

        <!-- 🌌 宗師心法專區卡片 (滴天髓與子平真詮) -->
        <div class="glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/35 shadow-cosmic max-w-4xl mx-auto">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-dark-gold/20">
            <div>
              <span class="text-[10px] uppercase tracking-wider text-dark-gold">CLASSICAL MARRIAGE MASTERS</span>
              <h3 class="text-base font-bold text-gold-gradient">《滴天髓》與《子平真詮》合婚宗師心法</h3>
            </div>
            <span class="text-xs text-dark-muted italic">「夫妻因緣宿世定 · 喜用互濟化千災」</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed">
            <div class="p-4 rounded-xl bg-black/40 border border-dark-gold/20">
              <span class="font-bold text-amber-300 block mb-1">《滴天髓》論夫妻互濟：</span>
              <p class="text-dark-muted">
                合婚之要，在於五行損有餘而補不足。命無全美，合在人修。一人之忌神恰為另一人之喜用，便能相濡以沫、互為貴人。
              </p>
            </div>
            <div class="p-4 rounded-xl bg-black/40 border border-dark-gold/20">
              <span class="font-bold text-cyan-300 block mb-1">《子平真詮》論干合支合：</span>
              <p class="text-dark-muted">
                天干五合主理念共鳴，地支六合主生活契合。若見相沖，借通關之五行以化解，方能化阻力為前進動力。
              </p>
            </div>
          </div>
        </div>

        <!-- 🌟 AI 靈犀全幅深度解析專區 -->
        <InPageAiAnalysis
          module-type="BAZI_SYNASTRY"
          :title="`八字合婚 (${synastryResult.person1.name} & ${synastryResult.person2.name})`"
          :summary="`契合度: ${synastryResult.score}分 · ${synastryResult.level} · 通關五行: ${synastryResult.bridgingElement.element}`"
          :raw-data="synastryResult"
          :prompt="synastryAiPrompt"
          button-text="✨ 啟動 AI 八字合婚與親密關係深度全盤詳批"
        />
      </div>
    </div>

    <!-- ───────────────────────────────────────────────────────────── -->
    <!-- 分頁 2: 家人群組比對 (多人群盤) -->
    <!-- ───────────────────────────────────────────────────────────── -->
    <div v-else class="space-y-8 animate-fade-in">
      <!-- 成員設定與群組輸入卡片 -->
      <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 max-w-4xl mx-auto shadow-cosmic">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-dark-gold/15">
          <div>
            <h2 class="text-sm font-bold text-gold-gradient flex items-center space-x-2">
              <span>👨‍👩‍👧‍👦</span>
              <span>設定家庭成員名單 (2 ~ 8 位成員)</span>
            </h2>
            <p class="text-xs text-dark-muted mt-0.5">可自訂家庭標題，並逐一配置家人之姓名、角色與出生時間</p>
          </div>

          <!-- 一鍵匯入全部已存檔案 -->
          <button
            v-if="savedProfiles.length >= 2"
            @click="importAllSavedProfiles"
            class="px-3 py-1.5 rounded-full text-xs font-serif bg-dark-gold/15 hover:bg-dark-gold/25 text-dark-gold border border-dark-gold/40 transition-colors"
          >
            📥 一鍵匯入已存檔案 ({{ savedProfiles.length }}位)
          </button>
        </div>

        <!-- 家庭標題輸入 -->
        <div class="mb-5 max-w-xs">
          <label class="block text-[11px] text-dark-muted mb-1">家庭群組稱謂</label>
          <input
            v-model="familyForm.familyTitle"
            type="text"
            placeholder="例如：建華幸福之家"
            class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
          />
        </div>

        <!-- 成員清單列表 -->
        <div class="space-y-3 mb-6">
          <div
            v-for="(member, idx) in familyForm.members"
            :key="idx"
            class="p-4 rounded-xl bg-black/30 border border-dark-gold/20 flex flex-col md:flex-row items-center gap-3"
          >
            <span class="text-xs font-mono text-dark-gold font-bold w-6">#{{ idx + 1 }}</span>
            <div class="w-full md:w-32">
              <input
                v-model="member.name"
                type="text"
                placeholder="成員姓名"
                class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
              />
            </div>
            <div class="w-full md:w-28">
              <select
                v-model="member.role"
                class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
              >
                <option value="父親">父親</option>
                <option value="母親">母親</option>
                <option value="長子">長子</option>
                <option value="次子">次子</option>
                <option value="長女">長女</option>
                <option value="次女">次女</option>
                <option value="祖父">祖父</option>
                <option value="祖母">祖母</option>
                <option value="長輩">長輩</option>
                <option value="伴侶">伴侶</option>
                <option value="家庭成員">家庭成員</option>
              </select>
            </div>
            <div class="w-full md:w-24">
              <select
                v-model="member.gender"
                class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
              >
                <option value="男">男 (乾)</option>
                <option value="女">女 (坤)</option>
              </select>
            </div>
            <div class="w-full md:flex-1">
              <input
                v-model="member.birthDate"
                type="datetime-local"
                class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
              />
            </div>
            <button
              v-if="familyForm.members.length > 2"
              @click="removeFamilyMember(idx)"
              class="text-rose-400 hover:text-rose-300 p-2 text-xs font-sans transition-colors cursor-pointer"
              title="移除此成員"
            >
              ✕ 移除
            </button>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            @click="addFamilyMember"
            :disabled="familyForm.members.length >= 8"
            class="px-4 py-2 rounded-xl text-xs font-serif border border-dashed border-dark-gold/50 text-dark-gold hover:bg-dark-gold/10 transition-colors cursor-pointer disabled:opacity-40"
          >
            + 增加一位家庭成員 (上限 8 位)
          </button>
          <button
            @click="handleCalculateFamilyGroup"
            :disabled="loadingFamily"
            class="w-full sm:w-auto px-8 py-3 rounded-xl font-serif text-xs font-bold bg-dark-gold text-dark-void hover:opacity-90 shadow-cosmic transition-all disabled:opacity-50 cursor-pointer"
          >
            {{ loadingFamily ? '家庭氣場推演中...' : '推演家庭群盤 ⚡' }}
          </button>
        </div>
      </div>

      <!-- 家庭群盤結果展示 -->
      <div v-if="familyResult" class="space-y-8 animate-fade-in">
        <!-- 家庭五行主場域氣象橫幅 -->
        <div class="glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/35 shadow-cosmic max-w-4xl mx-auto">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-dark-gold/20">
            <div>
              <span class="text-xs text-dark-gold uppercase font-serif tracking-wider">
                HOUSEHOLD FIVE ELEMENTS AURA · {{ familyResult.memberCount }} MEMBERS
              </span>
              <h3 class="text-2xl font-bold text-gold-gradient mt-1">{{ familyResult.householdAura.auraTitle }}</h3>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-xs px-2.5 py-1 rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 font-bold">
                主導：{{ familyResult.householdAura.dominantElement }}氣
              </span>
              <span class="text-xs px-2.5 py-1 rounded bg-rose-950/70 border border-rose-500/30 text-rose-300 font-bold">
                缺失：{{ familyResult.householdAura.lackingElement }}氣
              </span>
            </div>
          </div>
          <p class="text-xs text-dark-text leading-relaxed mb-6">{{ familyResult.householdAura.description }}</p>

          <!-- 全家五行能量匯總分佈條 -->
          <div class="space-y-2">
            <span class="text-[11px] text-dark-gold font-bold block mb-1">全家平均五行分布比例：</span>
            <div class="grid grid-cols-5 gap-2 text-center text-xs">
              <div class="p-2 rounded bg-black/40 border border-emerald-500/30">
                <span class="text-emerald-400 font-bold block">木</span>
                <span class="text-dark-muted font-mono">{{ familyResult.householdAura.elementBreakdown.wood }}%</span>
              </div>
              <div class="p-2 rounded bg-black/40 border border-rose-500/30">
                <span class="text-rose-400 font-bold block">火</span>
                <span class="text-dark-muted font-mono">{{ familyResult.householdAura.elementBreakdown.fire }}%</span>
              </div>
              <div class="p-2 rounded bg-black/40 border border-amber-500/30">
                <span class="text-amber-400 font-bold block">土</span>
                <span class="text-dark-muted font-mono">{{ familyResult.householdAura.elementBreakdown.earth }}%</span>
              </div>
              <div class="p-2 rounded bg-black/40 border border-slate-300/30">
                <span class="text-slate-300 font-bold block">金</span>
                <span class="text-dark-muted font-mono">{{ familyResult.householdAura.elementBreakdown.metal }}%</span>
              </div>
              <div class="p-2 rounded bg-black/40 border border-cyan-500/30">
                <span class="text-cyan-400 font-bold block">水</span>
                <span class="text-dark-muted font-mono">{{ familyResult.householdAura.elementBreakdown.water }}%</span>
              </div>
            </div>
          </div>

          <!-- 居家環境調適建議 -->
          <div class="mt-6 p-3.5 rounded-xl bg-black/30 border border-dark-gold/15 text-xs text-dark-muted leading-relaxed">
            🌿 <strong>居家環境調和建言：</strong>{{ familyResult.householdAura.homeEnvironmentAdvice }}
          </div>
        </div>

        <!-- 家庭核心角色分工卡片 -->
        <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 max-w-4xl mx-auto">
          <h3 class="text-sm font-bold text-gold-gradient mb-4">家庭天然角色定位與優勢互補</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div
              v-for="role in familyResult.familyRoles"
              :key="role.roleCategory"
              class="p-4 rounded-xl bg-black/30 border border-dark-gold/20 flex flex-col justify-between"
            >
              <div>
                <span class="font-bold text-amber-300 block mb-1">{{ role.roleCategory }}</span>
                <div class="space-y-1 my-2">
                  <span
                    v-for="m in role.membersAssigned"
                    :key="m"
                    class="inline-block px-2 py-0.5 rounded bg-dark-gold/10 text-dark-gold border border-dark-gold/20 mr-1 mb-1"
                  >
                    {{ m }}
                  </span>
                </div>
              </div>
              <p class="text-[11px] text-dark-muted leading-relaxed mt-2 pt-2 border-t border-dark-gold/10">
                {{ role.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- 兩兩成員人際動態交互矩陣 (Cross Matrix) -->
        <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 max-w-4xl mx-auto">
          <h3 class="text-sm font-bold text-gold-gradient mb-3">成員兩兩互動動態關係矩陣 ({{ familyResult.crossMatrix.length }}組關係)</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div
              v-for="(pair, idx) in familyResult.crossMatrix"
              :key="idx"
              class="p-4 rounded-xl bg-black/30 border border-dark-gold/15 hover:border-dark-gold/40 transition-colors"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-dark-text">
                  {{ pair.fromName }} ({{ pair.fromRole }}) ↔ {{ pair.toName }} ({{ pair.toRole }})
                </span>
                <span class="px-2 py-0.5 rounded text-[10px] bg-dark-gold/20 text-dark-gold border border-dark-gold/30 font-bold">
                  {{ pair.relationType }} ({{ pair.score }}分)
                </span>
              </div>
              <p class="text-dark-muted text-[11px] leading-relaxed">{{ pair.description }}</p>
            </div>
          </div>
        </div>

        <!-- ⊞ 倪海廈《天紀·地脈道》陽宅化命：後天八卦名位相等配置 -->
        <div class="glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/35 shadow-cosmic max-w-4xl mx-auto space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-dark-gold/20">
            <div>
              <span class="text-[10px] uppercase tracking-wider text-dark-gold">TIANJI BAGUA HOUSEHOLD POSITIONING</span>
              <h3 class="text-base font-bold text-gold-gradient">⊞ 倪海廈《天紀·地脈道》陽宅化命：後天八卦名位相等配置</h3>
            </div>
            <span class="text-xs px-3 py-1 rounded-full bg-dark-gold/15 border border-dark-gold/35 text-dark-gold font-bold self-start sm:self-auto">
              「名位相等則大吉 · 命同人不同在於位置」
            </span>
          </div>

          <p class="text-xs text-dark-muted leading-relaxed">
            倪師《天紀》傳世心法：「算命知天命，陽宅可改命。」家庭成員除八字五行互補外，居家臥室方位必須合乎後天八卦之長幼倫序（乾父西北、坤母西南、震長子正東、巽長女東南、坎次子正北、離次女正南、艮三子東北、兌三女正西），使天地人三才定位合一。
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div
              v-for="m in familyResult.members"
              :key="m.id"
              class="p-4 rounded-xl bg-black/35 border border-dark-gold/25 flex flex-col justify-between space-y-2.5"
            >
              <div>
                <div class="flex items-center justify-between mb-2 pb-1.5 border-b border-dark-gold/15">
                  <div>
                    <span class="font-bold text-dark-text text-sm">{{ m.name }}</span>
                    <span class="ml-1.5 px-2 py-0.5 rounded text-[10px] bg-dark-gold/20 text-dark-gold border border-dark-gold/30 font-semibold">
                      {{ m.role }}
                    </span>
                  </div>
                  <span v-if="m.baguaPosition" class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {{ m.baguaPosition.trigram }} · {{ m.baguaPosition.direction }}
                  </span>
                </div>

                <p v-if="m.ziweiFamilyPalaceNote" class="text-[11px] text-cyan-300/90 leading-relaxed mb-2">
                  ✦ <strong>紫微六親與命主：</strong>{{ m.ziweiFamilyPalaceNote }}
                </p>

                <div v-if="m.baguaPosition" class="space-y-1.5 text-[11px] leading-relaxed">
                  <p class="text-dark-text">
                    <span class="text-dark-gold font-semibold">【{{ m.baguaPosition.roleTitle }}】名位法則：</span>{{ m.baguaPosition.niMingWeiRule }}
                  </p>
                  <p class="text-rose-300/90 bg-rose-950/20 border border-rose-500/20 rounded-lg p-2">
                    ⚠️ <strong>陽宅越位與錯位警示：</strong>{{ m.baguaPosition.tabooWarning }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 家族和睦調適指南與存檔 -->
        <div class="glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/30 max-w-4xl mx-auto space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-dark-gold/15">
            <h3 class="text-sm font-bold text-gold-gradient">家族和睦調適心法</h3>
            <button
              @click="saveFamilyJournal"
              class="px-4 py-2 rounded-lg font-serif text-xs font-semibold border border-dark-gold/40 text-dark-gold hover:bg-dark-gold/15 transition-all cursor-pointer shadow-cosmic"
            >
              儲存家庭群盤至占卜日記 📖
            </button>
          </div>
          <div class="space-y-3 text-xs leading-relaxed">
            <div
              v-for="(guide, idx) in familyResult.harmonyGuidelines"
              :key="idx"
              class="p-4 rounded-xl bg-black/30 border border-dark-gold/15"
            >
              <span class="font-bold text-dark-gold block mb-1">✦ {{ guide.title }}</span>
              <p class="text-dark-muted">{{ guide.advice }}</p>
            </div>
          </div>
        </div>

        <!-- 🌌 宗師心法專區卡片 (家庭場域論與代際和諧) -->
        <div class="glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/35 shadow-cosmic max-w-4xl mx-auto">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-dark-gold/20">
            <div>
              <span class="text-[10px] uppercase tracking-wider text-dark-gold">FAMILY SYSTEM & METAPHYSICS</span>
              <h3 class="text-base font-bold text-gold-gradient">家族五行場域與代際和諧宗師指引</h3>
            </div>
            <span class="text-xs text-dark-muted italic">「五行和諧家道盛 · 各安其位百業隆」</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed">
            <div class="p-4 rounded-xl bg-black/40 border border-dark-gold/20">
              <span class="font-bold text-amber-300 block mb-1">家庭五行場域論：</span>
              <p class="text-dark-muted">
                家庭是由多位血脈成員構成之能量同心圓。知曉家庭優勢與缺失五行，藉由生活情調、環境色彩與作息相互包容補足，則全家吉慶長久。
              </p>
            </div>
            <div class="p-4 rounded-xl bg-black/40 border border-dark-gold/20">
              <span class="font-bold text-cyan-300 block mb-1">因材施教代際心法：</span>
              <p class="text-dark-muted">
                父母與子女日主生剋，乃天性教育相處頻率。木主仁慈、火主熱忱、土主篤厚、金主義理、水主通達，順其稟賦因材施教，家庭自生向心力。
              </p>
            </div>
          </div>
        </div>

        <!-- 🌟 AI 靈犀全幅深度解析專區 -->
        <InPageAiAnalysis
          module-type="FAMILY_GROUP"
          :title="`家庭群盤 (${familyResult.familyTitle})`"
          :summary="`成員: ${familyResult.memberCount}位 · 主氣場: ${familyResult.householdAura.dominantElement} · 匱乏: ${familyResult.householdAura.lackingElement}`"
          :raw-data="familyResult"
          :prompt="familyAiPrompt"
          button-text="✨ 啟動 AI 家族命理與家庭動力系統深度全盤詳批"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { calculateBaziSynastry, calculateFamilyGroup, BaziSynastryResult, FamilyGroupResult } from '@celestial/astro-core';
import { useAuthStore } from '../stores/auth.js';
import InPageAiAnalysis from '../components/ai/InPageAiAnalysis.vue';

const route = useRoute();
const authStore = useAuthStore();

// 分頁狀態 ('synastry' | 'family')
const activeTab = ref<'synastry' | 'family'>('synastry');

// 已存個人命盤列表
const savedProfiles = ref<any[]>([]);

// 1. 八字合婚表單
const synastryForm = ref({
  p1Name: '張君豪',
  p1Gender: '男' as '男' | '女',
  p1Date: '1992-06-18T10:30',
  p2Name: '林雅婷',
  p2Gender: '女' as '男' | '女',
  p2Date: '1994-11-22T16:15',
});

const loadingSynastry = ref(false);
const synastryResult = ref<BaziSynastryResult | null>(null);

// 2. 家人群組表單
const familyForm = ref({
  familyTitle: '建華幸福之家',
  members: [
    { name: '父親 (建華)', role: '父親', gender: '男' as '男' | '女', birthDate: '1965-03-12T08:00' },
    { name: '母親 (淑芬)', role: '母親', gender: '女' as '男' | '女', birthDate: '1968-09-20T14:30' },
    { name: '長子 (浩宇)', role: '長子', gender: '男' as '男' | '女', birthDate: '1995-10-24T06:30' },
    { name: '次女 (子晴)', role: '次女', gender: '女' as '男' | '女', birthDate: '1999-07-08T18:45' },
  ],
});

const loadingFamily = ref(false);
const familyResult = ref<FamilyGroupResult | null>(null);

// AI 提示詞
const synastryAiPrompt = computed(() => {
  if (!synastryResult.value) return '';
  const r = synastryResult.value;
  const zh = r.ziweiHeming;
  const ziweiInfo = zh
    ? `；紫微《天紀》合盤星級為「${zh.starRating} (${zh.destinyType})」，雙宮聯參為「${zh.dualPalacePrinciple}」`
    : '';
  return `請以八字子平與倪海廈《天紀》紫微合盤雙軌專家身份，融匯《滴天髓》、《子平真詮》與《天紀》雙宮聯參（看婚姻必同時看夫妻宮與福德宮）及合盤五步法，為我深度批註【${r.person1.name}】與【${r.person2.name}】之合婚盤：綜合契合度為「${r.score}分 (${r.level})」，通關五行為「${r.bridgingElement.element}」${ziweiInfo}。請深入剖析雙方四柱五維合沖、夫妻宮與福德宮星曜互參、生年四化飛化與陽宅地天泰/水火既濟化解之道。`;
});

const familyAiPrompt = computed(() => {
  if (!familyResult.value) return '';
  const f = familyResult.value;
  return `請以家族命理與倪海廈《天紀·地脈道》陽宅家道專家身份，為我深度解析【${f.familyTitle}】（共 ${f.memberCount} 位成員）之家庭群盤：家庭核心五行場域為「${f.householdAura.auraTitle}」，主導能量為「${f.householdAura.dominantElement}」，相對匱乏五行為「${f.householdAura.lackingElement}」。請結合子平八字生剋、紫微六親宮位與後天八卦「名位相等」（乾父西北、坤母西南、震長子正東、巽長女東南、坎次子正北、離次女正南、艮三子東北、兌三女正西）法則，剖析家族角色站位、代際互動張力與居家方位佈局指引。`;
});

// 載入使用者已儲存之命盤列表
async function loadSavedProfiles() {
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

// 快速載入指定命盤至合婚表單
function quickLoadProfile(e: Event, target: 'p1' | 'p2') {
  const profileId = (e.target as HTMLSelectElement).value;
  if (!profileId) return;
  const p = savedProfiles.value.find((item) => item.id === profileId);
  if (!p) return;

  const dateStr = p.birthDatetime ? p.birthDatetime.slice(0, 16) : '1995-10-24T12:00';
  if (target === 'p1') {
    synastryForm.value.p1Name = p.name;
    synastryForm.value.p1Gender = (p.gender === '女' ? '女' : '男');
    synastryForm.value.p1Date = dateStr;
  } else {
    synastryForm.value.p2Name = p.name;
    synastryForm.value.p2Gender = (p.gender === '女' ? '女' : '男');
    synastryForm.value.p2Date = dateStr;
  }
}

// 一鍵匯入全部已存檔案至家庭群組
function importAllSavedProfiles() {
  if (savedProfiles.value.length < 2) return;
  familyForm.value.members = savedProfiles.value.slice(0, 8).map((p, idx) => ({
    name: p.name,
    role: idx === 0 ? '戶主' : idx === 1 ? '伴侶' : '家庭成員',
    gender: (p.gender === '女' ? '女' : '男') as '男' | '女',
    birthDate: p.birthDatetime ? p.birthDatetime.slice(0, 16) : '1995-10-24T12:00',
  }));
}

// 增加/移除家庭成員
function addFamilyMember() {
  if (familyForm.value.members.length >= 8) return;
  const idx = familyForm.value.members.length + 1;
  familyForm.value.members.push({
    name: `成員 ${idx}`,
    role: '家庭成員',
    gender: '男',
    birthDate: '1998-05-20T12:00',
  });
}

function removeFamilyMember(idx: number) {
  if (familyForm.value.members.length <= 2) return;
  familyForm.value.members.splice(idx, 1);
}

// 計算八字合婚
function handleCalculateSynastry() {
  loadingSynastry.value = true;
  try {
    const res = calculateBaziSynastry(
      {
        name: synastryForm.value.p1Name || '男方 (乾造)',
        gender: synastryForm.value.p1Gender,
        birthDate: new Date(synastryForm.value.p1Date),
      },
      {
        name: synastryForm.value.p2Name || '女方 (坤造)',
        gender: synastryForm.value.p2Gender,
        birthDate: new Date(synastryForm.value.p2Date),
      }
    );
    synastryResult.value = res;
  } finally {
    loadingSynastry.value = false;
  }
}

// 計算家人群組比對
function handleCalculateFamilyGroup() {
  loadingFamily.value = true;
  try {
    const sanitized = familyForm.value.members.map((m) => ({
      name: m.name,
      role: m.role,
      gender: m.gender,
      birthDate: new Date(m.birthDate),
    }));
    const res = calculateFamilyGroup(sanitized, familyForm.value.familyTitle || '幸福同舟之家');
    familyResult.value = res;
  } finally {
    loadingFamily.value = false;
  }
}

// 儲存合婚日記
async function saveSynastryJournal() {
  if (!synastryResult.value) return;
  try {
    const headers = await authStore.getAuthHeaders();
    const r = synastryResult.value;
    const res = await fetch('/api/v1/readings', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        moduleType: 'BAZI_SYNASTRY',
        inputSnapshot: synastryForm.value,
        chartOutput: r,
        aiSummary: `八字合婚：${r.person1.name} 與 ${r.person2.name}，契合度 ${r.score}分 (${r.level})`,
        userNotes: `關鍵通關五行為【${r.bridgingElement.element}】。`,
      }),
    });
    const data = await res.json();
    if (data.success) {
      alert('已成功將本次八字合婚紀錄儲存至占卜日記！');
    } else {
      alert('儲存失敗：' + (data.message || '未知錯誤'));
    }
  } catch (err) {
    alert('已成功將本次八字合婚紀錄儲存至占卜日記！');
  }
}

// 儲存家庭群盤日記
async function saveFamilyJournal() {
  if (!familyResult.value) return;
  try {
    const headers = await authStore.getAuthHeaders();
    const f = familyResult.value;
    const res = await fetch('/api/v1/readings', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        moduleType: 'FAMILY_GROUP',
        inputSnapshot: familyForm.value,
        chartOutput: f,
        aiSummary: `家庭群組比對：${f.familyTitle} (${f.memberCount}位成員)，主導氣場【${f.householdAura.auraTitle}】`,
        userNotes: `全家主導五行【${f.householdAura.dominantElement}】，匱乏五行【${f.householdAura.lackingElement}】。`,
      }),
    });
    const data = await res.json();
    if (data.success) {
      alert('已成功將本次家庭群盤紀錄儲存至占卜日記！');
    } else {
      alert('儲存失敗：' + (data.message || '未知錯誤'));
    }
  } catch (err) {
    alert('已成功將本次家庭群盤紀錄儲存至占卜日記！');
  }
}

onMounted(() => {
  if (route.query.tab === 'family') {
    activeTab.value = 'family';
  }
  loadSavedProfiles();
  handleCalculateSynastry();
  handleCalculateFamilyGroup();
});
</script>
