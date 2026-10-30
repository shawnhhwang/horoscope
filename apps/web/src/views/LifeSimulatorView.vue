<template>
  <div class="max-w-7xl mx-auto px-3 sm:px-6 pt-28 pb-20 font-serif">
    <!-- 頂部標題區 -->
    <div class="text-center mb-8">
      <div class="text-xs uppercase tracking-[0.25em] text-dark-gold mb-2 font-sans">
        BAZI 0-100 LIFE ODYSSEY & DESTINY SIMULATOR
      </div>
      <h1 class="text-3xl sm:text-4xl font-bold text-gold-gradient mb-3">
        百歲流年 · 模擬一生
      </h1>
      <p class="text-xs sm:text-sm text-dark-muted max-w-2xl mx-auto leading-relaxed">
        以先天八字排盤、十神格局與大運為基底 · 預設台灣生活場景與時代風貌 · 模擬 0～100 歲人生重大轉折與流年際遇 · 由自由意志抉擇重塑命運軌跡
      </p>
    </div>

    <!-- 階段 1：起局設定卡片 (未開始推演時顯示) -->
    <div v-if="!session" class="glass-panel rounded-2xl p-6 border border-dark-gold/30 max-w-4xl mx-auto shadow-cosmic mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-dark-gold/15">
        <h2 class="text-sm font-bold text-gold-gradient flex items-center space-x-2">
          <span>⏳</span>
          <span>設定命主生辰 · 開啟百歲人生推演</span>
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
          <label class="block text-dark-muted mb-1.5 font-bold">推演者姓名 / 稱謂</label>
          <input
            v-model="form.profileName"
            type="text"
            placeholder="例如：張道遠"
            class="w-full bg-black/40 dark:bg-black/40 light:bg-white border border-dark-gold/30 rounded-xl px-3 py-2 text-dark-text text-xs focus:border-dark-gold outline-none transition-colors"
          />
        </div>
        <div>
          <label class="block text-dark-muted mb-1.5 font-bold">出生國曆年月日時</label>
          <input
            v-model="form.birthDate"
            type="datetime-local"
            class="w-full bg-black/40 dark:bg-black/40 light:bg-white border border-dark-gold/30 rounded-xl px-3 py-2 text-dark-text text-xs focus:border-dark-gold outline-none transition-colors"
          />
        </div>
        <div>
          <label class="block text-dark-muted mb-1.5 font-bold">生理性別 (影響大運順逆排盤)</label>
          <select
            v-model="form.gender"
            class="w-full bg-black/40 dark:bg-black/40 light:bg-white border border-dark-gold/30 rounded-xl px-3 py-2 text-dark-text text-xs focus:border-dark-gold outline-none transition-colors"
          >
            <option value="男">男 (乾造)</option>
            <option value="女">女 (坤造)</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="startSimulation"
            :disabled="loading"
            class="w-full py-2.5 rounded-xl font-bold text-xs bg-dark-gold text-dark-void hover:bg-yellow-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-cosmic cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <span>{{ loading ? '天命推演起局中...' : '✨ 開啟百歲人生推演' }}</span>
          </button>
        </div>
      </div>

      <!-- 男性視角：紅顏知己盲盒相遇模式設定 (80億分之一的遊戲 · 支援生日 KEYIN 與年歲對齊) -->
      <div v-if="form.gender === '男'" class="mt-4 p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="font-bold text-rose-300 flex items-center space-x-1.5">
            <span>🌹</span>
            <span>男性視角專屬 · 80億分之一紅顏名冊 (支援自訂生日與年歲對齊)</span>
          </span>
          <span class="text-[11px] text-dark-gold font-mono">5位命中注定的相遇 (盲盒相逢)</span>
        </div>
        <p class="text-dark-muted text-[11px] leading-relaxed mb-2">
          人生旅程中將與 5 位命中注定的女性友人相逢。您可自由為她們輸入 (KEYIN) 生日，系統將精準計算相遇時彼此的年歲差距與對方好感度。在推演抉擇當下不會揭曉真實姓名，唯有在終局《一生回顧》方能大白天下！
        </p>
        <div class="text-amber-300/90 text-[10px] bg-amber-950/40 border border-amber-500/30 rounded-lg p-2.5 mb-3 flex items-start space-x-2">
          <span class="text-xs">🔒</span>
          <span><strong>隱私與虛構提醒</strong>：本模擬中所有角色、事件與因緣走向均為文創演繹之虛構代號，請勿輸入真實第三方之機敏個資。本推演僅供文化哲學探索用途，不構成任何實體醫療診斷或財務投資依據。</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-[11px]">
          <div
            v-for="friend in femaleFriendsSetup"
            :key="friend.id"
            class="p-2.5 rounded-xl bg-black/50 border border-rose-500/30 flex flex-col justify-between space-y-2 hover:border-rose-400 transition-colors"
          >
            <!-- 日式寫實角色頭像 / 插畫預覽 -->
            <div v-if="friend.illustration" class="w-full h-20 rounded-lg overflow-hidden border border-rose-500/20 relative group">
              <img
                :src="friend.illustration"
                :alt="friend.name"
                class="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                <span class="text-[9px] text-rose-200 font-sans font-bold bg-black/60 px-1 rounded backdrop-blur-sm">
                  🎨 日式寫實相逢
                </span>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-rose-200">{{ friend.name }}</span>
                <span
                  class="px-1.5 py-0.5 rounded text-[10px] font-mono"
                  :class="friend.ageOffset === 0 ? 'bg-amber-500/20 text-amber-300' : friend.ageOffset && friend.ageOffset < 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-purple-500/20 text-purple-300'"
                >
                  {{ friend.ageOffset === 0 ? '同齡' : friend.ageOffset && friend.ageOffset < 0 ? `小 ${Math.abs(friend.ageOffset)} 歲` : `大 ${friend.ageOffset} 歲` }}
                </span>
              </div>
              <div class="text-[10px] text-dark-muted">{{ friend.archetype }}</div>
            </div>

            <!-- KEYIN 生日輸入框 -->
            <div>
              <label class="block text-[10px] text-rose-300/80 mb-0.5 font-bold">🎂 自訂生辰 (KEYIN)</label>
              <input
                v-model="friend.birthDate"
                type="date"
                @change="onFriendBirthChange(friend)"
                class="w-full bg-black/60 border border-rose-500/30 rounded px-1.5 py-1 text-[11px] text-rose-100 outline-none focus:border-rose-400 font-mono"
              />
            </div>

            <div class="pt-1 border-t border-rose-500/15 flex items-center justify-between text-[10px] font-mono">
              <span class="text-rose-300/90" title="相遇初始對方好感度">💖 好感 {{ friend.herAffinity }}%</span>
              <span class="text-amber-300/90" title="先天八字默契度">🌟 默契 {{ friend.compatibilityScore }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 階段 2：進行中的百歲推演主舞台 (Session 存在時) -->
    <div v-if="session" class="space-y-6 animate-fade-in">
      <!-- 1. 頂部狀態控制列 (年齡標籤、快進按鈕、終局提前結算) -->
      <div class="glass-panel rounded-2xl p-4 sm:p-5 border border-dark-gold/35 shadow-cosmic flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center flex-wrap gap-2.5">
          <span class="px-3 py-1 rounded-full bg-dark-gold text-dark-void font-bold text-sm shadow-sm">
            {{ session.profileName }} · {{ currentNode?.age }} 歲
          </span>
          <span class="px-2.5 py-1 rounded-full bg-black/40 border border-dark-gold/30 text-dark-gold text-xs font-mono">
            西元 {{ currentNode?.solarYear }} 年 · 虛歲 {{ currentNode?.nominalAge }} 歲
          </span>
          <span class="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
            流年【{{ currentNode?.ganzhi }}】· 值【{{ currentNode?.tenGod }}】
          </span>
          <span class="px-2 py-0.5 rounded bg-black/50 text-dark-muted text-xs">
            大運【{{ currentNode?.daYun?.stem }}{{ currentNode?.daYun?.branch }}】
          </span>
          <span
            class="px-2 py-0.5 rounded text-xs font-bold"
            :class="[
              currentNode?.fortuneLevel === '大吉' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
              currentNode?.fortuneLevel === '小吉' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' :
              currentNode?.fortuneLevel === '大凶' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
              currentNode?.fortuneLevel === '小凶' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
              'bg-gray-500/20 text-gray-300 border border-gray-500/40'
            ]"
          >
            行運 {{ currentNode?.fortuneLevel }}
          </span>
        </div>

        <div class="flex items-center space-x-2">
          <button
            @click="fastForward"
            :disabled="actionLoading || session.status === 'COMPLETED'"
            class="px-3.5 py-1.5 rounded-xl border border-dark-gold/50 bg-dark-gold/15 hover:bg-dark-gold text-dark-gold hover:text-dark-void text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center space-x-1"
            title="自動平穩快進推進至下個關鍵轉折年"
          >
            <span>⏩</span>
            <span>快進至下個轉折年</span>
          </button>
          <button
            @click="finalizeSimulation"
            :disabled="actionLoading"
            class="px-3.5 py-1.5 rounded-xl border border-rose-500/40 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm"
            title="結算當前人生，撰寫一生行誼蓋棺錄"
          >
            <span v-if="actionLoading" class="animate-spin text-xs">⏳</span>
            <span v-else>📜</span>
            <span>{{ actionLoading ? '譜寫蓋棺錄中...' : '一生回顧' }}</span>
          </button>
        </div>
      </div>

      <!-- 2. 0~100 歲橫向動態時間軸輪盤 (0-100 Timeline Scroller) -->
      <div class="glass-panel rounded-2xl p-4 border border-dark-gold/25 shadow-cosmic overflow-hidden">
        <div class="text-[11px] text-dark-muted font-sans mb-2 flex items-center justify-between">
          <span>0～100 歲命運時間軸 (金色為重大轉折年，點擊可查閱歷史年輪)：</span>
          <span class="text-dark-gold font-mono">當前：{{ session.currentAge }} 歲</span>
        </div>
        <div class="flex items-center space-x-2 overflow-x-auto py-2 no-scrollbar" ref="timelineScroll">
          <button
            v-for="node in session.history"
            :key="node.age"
            @click="inspectYear(node.age)"
            type="button"
            class="flex flex-col items-center flex-shrink-0 min-w-[50px] p-1.5 rounded-xl border text-center transition-all cursor-pointer relative"
            :class="[
              node.age === viewingAge
                ? 'bg-dark-gold text-dark-void border-dark-gold scale-105 shadow-cosmic z-10 font-bold' :
              node.age === session.currentAge
                ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300 font-bold' :
              node.age < session.currentAge
                ? 'border-dark-gold/20 bg-black/30 text-dark-muted hover:text-dark-text' :
                'border-white/5 bg-black/10 text-gray-500'
            ]"
          >
            <span v-if="node.isKeyMilestone" class="absolute -top-1 right-0 text-[10px]">⭐</span>
            <span class="text-[10px] font-mono">{{ node.age }}歲</span>
            <span class="text-[11px] font-bold">{{ node.ganzhi }}</span>
            <span class="text-[9px] opacity-75">{{ node.tenGod }}</span>
          </button>
        </div>
      </div>

      <!-- 3. 主舞台兩欄佈局：左側五維狀態與八字小盤，右側年度事件與決策卡牌 -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- 左欄 (4 columns)：五維屬性 HUD & 先天排盤概覽 -->
        <div class="lg:col-span-4 space-y-6">
          <!-- 四大領域屬性儀表板 (健康、知識、財富、情感) -->
          <div class="glass-panel rounded-2xl p-5 border border-dark-gold/30 shadow-cosmic">
            <h3 class="text-xs font-bold text-gold-gradient uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>🌟 人生四大核心領域狀態</span>
              <span class="text-[10px] text-dark-muted font-mono font-normal">MAX 100</span>
            </h3>

            <div class="space-y-3.5 text-xs">
              <!-- 1. 體魄健康 (Health) -->
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-dark-muted flex items-center space-x-1">
                    <span>❤️</span>
                    <span class="font-bold text-dark-text">體魄健康</span>
                  </span>
                  <span class="font-mono font-bold" :class="attributes.health < 30 ? 'text-rose-400 animate-pulse' : 'text-dark-gold'">
                    {{ attributes.health }} / 100
                  </span>
                </div>
                <div class="h-2 rounded-full bg-black/50 overflow-hidden border border-white/5">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="attributes.health < 30 ? 'bg-rose-500' : 'bg-emerald-400'"
                    :style="{ width: `${attributes.health}%` }"
                  ></div>
                </div>
              </div>

              <!-- 2. 知識才識 (Knowledge) -->
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-dark-muted flex items-center space-x-1">
                    <span>📖</span>
                    <span class="font-bold text-dark-text">知識才識</span>
                  </span>
                  <span class="font-mono font-bold text-purple-300">
                    {{ attributes.knowledge ?? attributes.wisdom ?? 20 }} / 100
                  </span>
                </div>
                <div class="h-2 rounded-full bg-black/50 overflow-hidden border border-white/5">
                  <div
                    class="h-full rounded-full bg-purple-400 transition-all duration-500"
                    :style="{ width: `${attributes.knowledge ?? attributes.wisdom ?? 20}%` }"
                  ></div>
                </div>
              </div>

              <!-- 3. 財富資產 (Wealth) -->
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-dark-muted flex items-center space-x-1">
                    <span>🪙</span>
                    <span class="font-bold text-dark-text">財富資產</span>
                  </span>
                  <span class="font-mono font-bold text-amber-300">{{ attributes.wealth }} / 100</span>
                </div>
                <div class="h-2 rounded-full bg-black/50 overflow-hidden border border-white/5">
                  <div class="h-full rounded-full bg-amber-400 transition-all duration-500" :style="{ width: `${attributes.wealth}%` }"></div>
                </div>
              </div>

              <!-- 4. 情感眷屬 (Relationship) -->
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-dark-muted flex items-center space-x-1">
                    <span>🌸</span>
                    <span class="font-bold text-dark-text">情感眷屬</span>
                  </span>
                  <span class="font-mono font-bold text-pink-300">{{ attributes.relationship }} / 100</span>
                </div>
                <div class="h-2 rounded-full bg-black/50 overflow-hidden border border-white/5">
                  <div class="h-full rounded-full bg-pink-400 transition-all duration-500" :style="{ width: `${attributes.relationship}%` }"></div>
                </div>
              </div>

              <!-- 輔助指標：事業名望 -->
              <div class="pt-2 border-t border-dark-gold/15 flex items-center justify-between text-[11px] text-dark-muted">
                <span class="flex items-center space-x-1">
                  <span>👑</span>
                  <span>事業聲望：</span>
                </span>
                <span class="font-mono font-bold text-sky-300">{{ attributes.career }} / 100</span>
              </div>
            </div>
          </div>

          <!-- 歷年重大足跡清單 -->
          <div class="glass-panel rounded-2xl p-5 border border-dark-gold/25 shadow-cosmic max-h-80 overflow-y-auto">
            <h3 class="text-xs font-bold text-gold-gradient uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>👣 人生關鍵足跡</span>
              <span class="text-[10px] text-dark-muted font-mono">{{ session.milestoneFootprints.length }} 項紀錄</span>
            </h3>
            <div class="space-y-2 text-xs">
              <div
                v-for="(fp, idx) in session.milestoneFootprints"
                :key="idx"
                class="p-2 rounded-lg bg-black/30 border border-dark-gold/15 text-dark-text leading-relaxed"
              >
                {{ fp }}
              </div>
            </div>
          </div>
        </div>

        <!-- 右欄 (8 columns)：年度事件與互動決策主舞台 -->
        <div class="lg:col-span-8 space-y-6">
          <div class="glass-panel rounded-2xl p-6 sm:p-7 border border-dark-gold/35 shadow-cosmic relative overflow-hidden">
            <!-- 背景金光裝飾光暈 -->
            <div class="absolute -top-16 -right-16 w-48 h-48 bg-dark-gold/10 rounded-full blur-3xl pointer-events-none"></div>

            <!-- 年初運勢橫幅 -->
            <div class="mb-5 pb-4 border-b border-dark-gold/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div class="text-xs uppercase tracking-wider text-dark-gold font-sans font-bold flex flex-wrap items-center gap-2">
                  <span>{{ activeDisplayNode?.solarYear }} 歲次【{{ activeDisplayNode?.ganzhi }}】· {{ activeDisplayNode?.age }} 歲</span>
                  <span
                    v-if="activeDisplayNode?.eraAvgLifeExpectancy"
                    class="px-2 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-[10px] font-sans font-normal"
                    title="當時代台灣人口平均壽命期望值"
                  >
                    🏥 時代平均壽命: 約 {{ activeDisplayNode?.eraAvgLifeExpectancy }} 歲
                  </span>
                </div>
                <h2 class="text-xl sm:text-2xl font-bold text-gold-gradient mt-1">
                  {{ activeDisplayNode?.eventTitle || '沉澱思緒 · 審時度勢' }}
                </h2>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <div v-if="activeDisplayNode?.isEpidemicYear" class="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center space-x-1 animate-pulse">
                  <span>⚠️ 疫疾大流行</span>
                </div>
                <div v-if="activeDisplayNode?.isKeyMilestone" class="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center space-x-1 self-start sm:self-center">
                  <span>⭐ 重大轉折</span>
                  <span class="text-[10px] opacity-80">({{ activeDisplayNode?.milestoneReason }})</span>
                </div>
              </div>
            </div>

            <!-- 傳染病 / 公衛危機標籤 (若當年度爆發流行病) -->
            <div
              v-if="activeDisplayNode?.isEpidemicYear"
              class="mb-4 px-4 py-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-start sm:items-center space-x-2.5 backdrop-blur-sm"
            >
              <span class="text-base leading-none">⚠️</span>
              <div class="flex-1">
                <span class="font-bold text-rose-300 mr-1.5">[疫病公衛警戒]</span>
                <span class="text-rose-100/90 leading-relaxed">
                  本時期肆虐疾疫：{{ activeDisplayNode.eraEpidemics?.join('、') }}。受時代公衛與醫療條件限制，健康耗損增加，決策將考驗生存防疫！
                </span>
              </div>
            </div>

            <!-- 台灣時代背景年輪標籤 -->
            <div
              v-if="activeDisplayNode?.taiwanEraContext"
              class="mb-5 px-4 py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-start sm:items-center space-x-2.5 backdrop-blur-sm"
            >
              <span class="text-base leading-none">🇹🇼</span>
              <div class="flex-1">
                <span class="font-bold text-emerald-300 mr-1.5">[台灣時代風貌]</span>
                <span class="text-emerald-100/90 leading-relaxed">{{ activeDisplayNode.taiwanEraContext }}</span>
              </div>
            </div>

            <!-- 每年一段深度年輪說明文字 (依命盤流年與當下人生階段深度產出 · 配備日式寫實插畫) -->
            <div
              v-if="activeDisplayNode?.annualStory"
              class="mb-5 p-4 sm:p-5 rounded-2xl bg-black/40 border border-dark-gold/25 text-xs sm:text-sm text-dark-text leading-relaxed whitespace-pre-line font-serif shadow-inner"
            >
              <div class="flex items-center justify-between pb-2 mb-2.5 border-b border-dark-gold/15">
                <span class="text-xs font-bold text-dark-gold font-sans flex items-center space-x-1.5">
                  <span>📜</span>
                  <span>【{{ activeDisplayNode.age }}歲 · {{ activeDisplayNode.lifeStageTitle || '人生階段' }}】流年行運年輪</span>
                </span>
                <span class="text-[10px] text-dark-muted font-mono">
                  十神：{{ activeDisplayNode.tenGod }} · 運勢{{ activeDisplayNode.fortuneLevel }}
                </span>
              </div>

              <!-- 日式寫實人生階段專屬插畫卡牌橫幅 -->
              <div v-if="activeStageIllustration" class="mb-3.5 rounded-xl overflow-hidden border border-dark-gold/30 shadow-cosmic relative group max-h-60">
                <img
                  :src="activeStageIllustration"
                  :alt="activeDisplayNode.lifeStageTitle"
                  class="w-full h-44 sm:h-56 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex items-end justify-between p-3">
                  <span class="text-[11px] font-sans font-bold text-dark-gold tracking-wide bg-black/60 px-2.5 py-0.5 rounded backdrop-blur-sm border border-dark-gold/30 flex items-center space-x-1">
                    <span>🎨</span>
                    <span>日式寫實插畫 · {{ activeDisplayNode.lifeStageTitle || '生命長卷' }}</span>
                  </span>
                  <span class="text-[10px] text-gray-300 font-mono hidden sm:inline">
                    {{ activeDisplayNode.solarYear }} 年 · {{ activeDisplayNode.age }} 歲
                  </span>
                </div>
              </div>

              <p class="leading-relaxed">{{ activeDisplayNode.annualStory }}</p>
            </div>

            <!-- 事件情境長文敘事 (配備紅顏相逢專屬寫實插畫) -->
            <div class="mb-6 p-4 rounded-xl bg-black/30 border border-dark-gold/20 text-xs sm:text-sm text-dark-text leading-relaxed font-serif">
              <div
                v-if="activeDisplayNode?.eventTitle?.includes('邂逅') || activeDisplayNode?.options?.some(o => o.id?.includes('romantic'))"
                class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold font-sans mb-3"
              >
                <span>🌹</span>
                <span>80億分之一 · 紅顏盲盒相逢 (真身將於一生回顧揭曉)</span>
              </div>

              <!-- 紅顏盲盒相逢日式寫實專屬插畫 -->
              <div v-if="activeRomanticIllustration" class="mb-3.5 rounded-xl overflow-hidden border border-rose-500/40 shadow-cosmic relative group max-h-60">
                <img
                  :src="activeRomanticIllustration"
                  alt="紅顏盲盒相逢日式寫實插畫"
                  class="w-full h-44 sm:h-56 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end justify-between p-3">
                  <span class="text-[11px] font-sans font-bold text-rose-200 tracking-wide bg-black/60 px-2.5 py-0.5 rounded backdrop-blur-sm border border-rose-500/40 flex items-center space-x-1">
                    <span>🌹</span>
                    <span>命運交會 · {{ activeDisplayNode?.eventTitle?.split('邂逅')?.[1] || '知性女子' }}</span>
                  </span>
                </div>
              </div>

              <p class="whitespace-pre-line">
                {{ activeDisplayNode?.eventNarrative || activeDisplayNode?.annualOverview || '這一年歲月平穩流淌，命運的齒輪在暗中運轉...' }}
              </p>
            </div>

            <!-- 若當前檢視的是歷史年份且已決策 -->
            <div v-if="activeDisplayNode && activeDisplayNode.chosenOptionId" class="p-4 rounded-xl bg-dark-gold/10 border border-dark-gold/30 text-xs mb-6">
              <div class="flex items-center justify-between mb-1">
                <div class="font-bold text-dark-gold">✅ 當時做出的抉擇：</div>
                <span
                  v-if="turnGuidance"
                  class="text-[10px] px-2 py-0.5 rounded font-bold"
                  :class="[
                    turnGuidance.category === 'DA_XIONG' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    turnGuidance.category === 'DA_JI' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  ]"
                >
                  {{ turnGuidance.badge }}
                </span>
              </div>
              <p class="text-dark-text italic mb-2">
                {{ activeDisplayNode.options?.find(o => o.id === activeDisplayNode?.chosenOptionId)?.text }}
              </p>
              <div class="text-[11px] text-dark-muted mb-2">
                {{ activeDisplayNode.resolutionNarrative }}
              </div>
              <div v-if="turnGuidance" class="text-[11px] text-dark-gold/80 bg-black/30 p-2 rounded border border-dark-gold/20 flex items-center space-x-1">
                <span>💡 當時錦囊指引：</span>
                <span>{{ turnGuidance.recommendedAction }}</span>
              </div>
            </div>

            <!-- 若當前為正在進行決策的年份 (即 viewingAge === currentAge 且尚未結算) -->
            <div v-else-if="viewingAge === session.currentAge && !activeDisplayNode?.chosenOptionId">
              <!-- 轉折年 / 大凶 / 大吉 命理決策錦囊提示 -->
              <div
                v-if="turnGuidance"
                class="mb-5 p-4 rounded-xl border text-xs leading-relaxed backdrop-blur-sm shadow-sm transition-all"
                :class="[
                  turnGuidance.category === 'DA_XIONG' ? 'bg-rose-950/40 border-rose-500/50 text-rose-200' :
                  turnGuidance.category === 'DA_JI' ? 'bg-amber-950/40 border-amber-500/50 text-amber-200' :
                  'bg-purple-950/40 border-purple-500/50 text-purple-200'
                ]"
              >
                <div
                  class="flex items-center justify-between mb-2 pb-2 border-b"
                  :class="[
                    turnGuidance.category === 'DA_XIONG' ? 'border-rose-500/20' :
                    turnGuidance.category === 'DA_JI' ? 'border-amber-500/20' :
                    'border-purple-500/20'
                  ]"
                >
                  <div
                    class="flex items-center space-x-2 font-bold text-sm"
                    :class="[
                      turnGuidance.category === 'DA_XIONG' ? 'text-rose-300' :
                      turnGuidance.category === 'DA_JI' ? 'text-amber-300' :
                      'text-purple-300'
                    ]"
                  >
                    <span>{{ turnGuidance.badge.slice(0, 2) }}</span>
                    <span>{{ turnGuidance.title }}</span>
                  </div>
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold"
                    :class="[
                      turnGuidance.category === 'DA_XIONG' ? 'bg-rose-500/30 text-rose-100' :
                      turnGuidance.category === 'DA_JI' ? 'bg-amber-500/30 text-amber-100' :
                      'bg-purple-500/30 text-purple-100'
                    ]"
                  >
                    {{ turnGuidance.badge }}
                  </span>
                </div>

                <p class="mb-2 text-dark-text/90 leading-relaxed font-serif">
                  {{ turnGuidance.summary }}
                </p>

                <div class="p-2.5 rounded-lg bg-black/40 mb-3 text-[11px] font-sans">
                  <span class="font-bold text-dark-gold mr-1">🎯 核心取捨方針：</span>
                  <span class="text-dark-text/95">{{ turnGuidance.recommendedAction }}</span>
                </div>

                <div class="space-y-1.5 pt-1">
                  <div class="font-bold text-[11px] opacity-90 flex items-center space-x-1">
                    <span>💡</span>
                    <span>本歲建議抉擇方向與行動提示：</span>
                  </div>
                  <ul class="list-disc list-inside space-y-1 text-[11px] text-dark-text/80 pl-1">
                    <li v-for="(tip, idx) in turnGuidance.decisionTips" :key="idx">
                      <strong :class="turnGuidance.category === 'DA_XIONG' ? 'text-rose-300' : turnGuidance.category === 'DA_JI' ? 'text-amber-300' : 'text-purple-300'">
                        {{ tip.label }}：
                      </strong>
                      <span>{{ tip.description }}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <h4 class="text-xs font-bold text-dark-gold uppercase tracking-wider mb-3">
                👉 請為本歲抉擇前行的方向：
              </h4>

              <!-- 2~4 個決策選項卡牌 -->
              <div class="grid grid-cols-1 gap-3 mb-6">
                <button
                  v-for="opt in activeDisplayNode?.options"
                  :key="opt.id"
                  @click="makeDecision(opt.id)"
                  :disabled="actionLoading"
                  class="p-4 rounded-xl text-left border transition-all cursor-pointer group flex flex-col justify-between"
                  :class="[
                    opt.attitude === 'AGGRESSIVE' ? 'border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/15 hover:border-amber-400' :
                    opt.attitude === 'CONSERVATIVE' ? 'border-teal-500/40 bg-teal-500/5 hover:bg-teal-500/15 hover:border-teal-400' :
                    'border-purple-500/40 bg-purple-500/5 hover:bg-purple-500/15 hover:border-purple-400'
                  ]"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-1.5 flex-wrap gap-1">
                      <span
                        class="px-2 py-0.5 rounded text-[10px] font-bold font-sans uppercase"
                        :class="[
                          opt.attitude === 'AGGRESSIVE' ? 'bg-amber-500/20 text-amber-300' :
                          opt.attitude === 'CONSERVATIVE' ? 'bg-teal-500/20 text-teal-300' :
                          'bg-purple-500/20 text-purple-300'
                        ]"
                      >
                        {{ opt.attitude === 'AGGRESSIVE' ? '⚡ 激進開拓' : opt.attitude === 'CONSERVATIVE' ? '🛡️ 穩健守成' : '🕊️ 積德修心' }}
                      </span>
                      <!-- 指引推薦標籤 -->
                      <span
                        v-if="turnGuidance?.category === 'DA_XIONG' && opt.attitude === 'CONSERVATIVE'"
                        class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30"
                      >
                        ✓ 避煞首選
                      </span>
                      <span
                        v-else-if="turnGuidance?.category === 'DA_XIONG' && opt.attitude === 'AGGRESSIVE'"
                        class="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold border border-rose-500/30"
                      >
                        ⚠️ 險中求勝
                      </span>
                      <span
                        v-else-if="turnGuidance?.category === 'DA_JI' && opt.attitude === 'AGGRESSIVE'"
                        class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30"
                      >
                        ✓ 乘風破浪
                      </span>
                      <span
                        v-else-if="turnGuidance?.category === 'DA_JI' && opt.attitude === 'MORAL'"
                        class="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[9px] font-bold border border-teal-500/30"
                      >
                        ✓ 積德延福
                      </span>
                      <span
                        v-else-if="turnGuidance?.category === 'MILESTONE'"
                        class="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold border border-purple-500/30"
                      >
                        ⭐ 轉折關鍵
                      </span>
                    </div>
                    <span class="text-[10px] text-dark-muted font-sans">
                      風險：{{ opt.riskLevel === 'HIGH' ? '高' : opt.riskLevel === 'MEDIUM' ? '中' : '低' }}
                    </span>
                  </div>
                  <p class="text-xs sm:text-sm font-bold text-dark-text group-hover:text-gold-gradient transition-colors mb-2">
                    {{ opt.text }}
                  </p>
                  <div class="flex items-center space-x-2 text-[10px] text-dark-muted font-mono flex-wrap gap-1">
                    <span v-if="opt.potentialImpact?.health" :class="opt.potentialImpact.health > 0 ? 'text-emerald-400' : 'text-rose-400'">❤️ 健康 {{ opt.potentialImpact.health > 0 ? '+' : '' }}{{ opt.potentialImpact.health }}</span>
                    <span v-if="opt.potentialImpact?.knowledge || opt.potentialImpact?.wisdom" :class="(opt.potentialImpact.knowledge || opt.potentialImpact.wisdom || 0) > 0 ? 'text-purple-300' : 'text-rose-400'">📖 知識 {{ (opt.potentialImpact.knowledge || opt.potentialImpact.wisdom || 0) > 0 ? '+' : '' }}{{ opt.potentialImpact.knowledge || opt.potentialImpact.wisdom }}</span>
                    <span v-if="opt.potentialImpact?.wealth" :class="opt.potentialImpact.wealth > 0 ? 'text-amber-300' : 'text-rose-400'">🪙 財富 {{ opt.potentialImpact.wealth > 0 ? '+' : '' }}{{ opt.potentialImpact.wealth }}</span>
                    <span v-if="opt.potentialImpact?.relationship" :class="opt.potentialImpact.relationship > 0 ? 'text-pink-300' : 'text-rose-400'">🌸 情感 {{ opt.potentialImpact.relationship > 0 ? '+' : '' }}{{ opt.potentialImpact.relationship }}</span>
                    <span v-if="opt.potentialImpact?.career" :class="opt.potentialImpact.career > 0 ? 'text-sky-300' : 'text-rose-400'">👑 事業 {{ opt.potentialImpact.career > 0 ? '+' : '' }}{{ opt.potentialImpact.career }}</span>
                  </div>
                </button>
              </div>

              <!-- 自訂自由意志行動 -->
              <div class="p-3.5 rounded-xl bg-black/40 border border-dark-gold/20 flex items-center space-x-2">
                <input
                  v-model="customActionText"
                  type="text"
                  placeholder="或輸入自訂抉擇行動（例如：遠渡重洋修習禪定）..."
                  class="flex-grow bg-transparent text-xs text-dark-text outline-none"
                  @keyup.enter="makeCustomDecision"
                />
                <button
                  @click="makeCustomDecision"
                  :disabled="actionLoading || !customActionText.trim()"
                  class="px-3 py-1.5 rounded-lg bg-dark-gold/20 text-dark-gold border border-dark-gold/40 text-xs font-bold hover:bg-dark-gold hover:text-dark-void transition-all cursor-pointer whitespace-nowrap"
                >
                  執行自由意志
                </button>
              </div>
            </div>

            <!-- 下一年推進按鈕 -->
            <div v-if="activeDisplayNode?.chosenOptionId && viewingAge < session.currentAge" class="mt-6 flex justify-end">
              <button
                @click="jumpToCurrentYear"
                class="px-4 py-2 rounded-xl bg-dark-gold text-dark-void font-bold text-xs hover:bg-yellow-400 transition-all shadow-cosmic cursor-pointer"
              >
                回到當前進行歲數 ({{ session.currentAge }} 歲) ➔
              </button>
            </div>

            <!-- 終局已達成提示與一生回顧按鈕 (若已達成百歲或壽元善終) -->
            <div
              v-if="session.status === 'COMPLETED' || activeDisplayNode?.isTerminal || viewingAge >= 100"
              class="mt-6 p-5 rounded-2xl bg-gradient-to-r from-dark-gold/20 via-amber-500/10 to-dark-gold/20 border border-dark-gold/50 text-center shadow-cosmic animate-fade-in"
            >
              <div class="text-2xl mb-1">👑</div>
              <h3 class="text-base sm:text-lg font-bold text-gold-gradient mb-1">
                {{ activeDisplayNode?.terminalReason || (activeDisplayNode?.isTerminal ? '壽元善終 · 人生圓滿謝幕' : '百歲流年 · 圓滿謝幕') }}
              </h3>
              <p class="text-xs text-dark-muted mb-4 max-w-lg mx-auto leading-relaxed">
                百歲人生大戲已全數演繹完成。隨時可點擊下方按鈕，查閱以倪海廈《天紀》心法宏觀綜述之《一生行誼 · 蓋棺錄》、榮譽稱號與五維雷達評級。
              </p>
              <div class="flex items-center justify-center space-x-3">
                <button
                  @click="finalizeSimulation"
                  :disabled="actionLoading"
                  class="px-6 py-2.5 rounded-xl bg-dark-gold text-dark-void font-bold text-xs sm:text-sm hover:bg-yellow-400 transition-all shadow-cosmic cursor-pointer flex items-center space-x-2"
                >
                  <span v-if="actionLoading" class="animate-spin text-sm">⏳</span>
                  <span v-else>📜</span>
                  <span>{{ actionLoading ? '正在開啟一生回顧...' : '查看《一生行誼 · 蓋棺錄》回顧' }}</span>
                </button>
                <button
                  @click="restartSimulation"
                  class="px-4 py-2.5 rounded-xl border border-dark-gold/40 text-dark-gold text-xs font-bold hover:bg-dark-gold/15 transition-all cursor-pointer"
                >
                  🔄 重新開啟新一世
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 終局落幕彈窗：《一生行誼 · 蓋棺錄》 (Finale Modal) -->
    <div
      v-if="finalSummary"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div class="glass-panel rounded-3xl p-6 sm:p-9 border border-dark-gold/50 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-center relative">
        <div class="w-16 h-16 rounded-full border-2 border-dark-gold mx-auto flex items-center justify-center text-2xl mb-4 bg-dark-gold/15 shadow-cosmic animate-pulse">
          👑
        </div>

        <div class="text-xs uppercase tracking-[0.25em] text-dark-gold font-sans font-bold mb-1">
          THE GRAND RETROSPECTIVE
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gold-gradient mb-2">
          {{ finalSummary.endingTitle }}
        </h2>
        <div class="text-xs text-dark-muted mb-6">
          享壽 {{ finalSummary.finalAge }} 載 · 天命契合度評定 {{ finalSummary.destinyAlignmentScore }} 分
        </div>

        <!-- 最終四大核心領域與事業得分面板 -->
        <div class="grid grid-cols-5 gap-2 p-3 rounded-xl bg-black/50 border border-dark-gold/20 text-xs mb-6 font-mono">
          <div>
            <div class="text-dark-muted text-[10px]">❤️ 健康</div>
            <div class="font-bold text-emerald-400">{{ finalSummary.radarScores.health }}</div>
          </div>
          <div>
            <div class="text-dark-muted text-[10px]">📖 知識</div>
            <div class="font-bold text-purple-400">{{ finalSummary.radarScores.knowledge ?? finalSummary.radarScores.wisdom }}</div>
          </div>
          <div>
            <div class="text-dark-muted text-[10px]">🪙 財富</div>
            <div class="font-bold text-amber-400">{{ finalSummary.radarScores.wealth }}</div>
          </div>
          <div>
            <div class="text-dark-muted text-[10px]">🌸 情感</div>
            <div class="font-bold text-pink-400">{{ finalSummary.radarScores.relationship }}</div>
          </div>
          <div>
            <div class="text-dark-muted text-[10px]">👑 事業</div>
            <div class="font-bold text-sky-400">{{ finalSummary.radarScores.career }}</div>
          </div>
        </div>

        <!-- 方案 C：多重視角風格切換器 (Biography Perspective Switcher) -->
        <div class="mb-4">
          <div class="flex items-center justify-between mb-2 px-1">
            <span class="text-xs font-bold text-dark-gold flex items-center space-x-1.5">
              <span>🎭 蓋棺自傳視角 (方案 C)</span>
              <span class="text-[10px] text-dark-muted font-normal">多重視角演繹不同生命維度</span>
            </span>
            <span
              v-if="finalSummary.perspectiveIsAi?.[selectedPerspective]"
              class="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold"
            >
              ✨ 靈犀 AI 深度成卷
            </span>
            <span
              v-else
              class="px-2 py-0.5 rounded-full text-[10px] bg-white/5 border border-white/10 text-dark-muted font-mono"
            >
              🏷️ 演算法傳承經典
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-black/60 border border-dark-gold/25">
            <button
              v-for="opt in perspectiveOptions"
              :key="opt.id"
              @click="selectPerspective(opt.id)"
              :class="[
                'py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center relative',
                selectedPerspective === opt.id
                  ? 'bg-dark-gold text-dark-void shadow-cosmic border border-yellow-300'
                  : 'text-dark-muted hover:text-dark-text hover:bg-white/5'
              ]"
            >
              <span>{{ opt.label }}</span>
              <span class="text-[9px] opacity-80 font-normal mt-0.5" :class="selectedPerspective === opt.id ? 'text-black font-semibold' : 'text-dark-muted'">
                {{ opt.shortName }}
              </span>
            </button>
          </div>
          <div class="text-[11px] text-left text-dark-muted mt-1.5 px-2 italic">
            {{ perspectiveOptions.find(p => p.id === selectedPerspective)?.desc }}
          </div>
        </div>

        <!-- 自傳式蓋棺論定長文 -->
        <div class="relative text-left text-xs sm:text-sm text-dark-text leading-relaxed p-5 sm:p-6 rounded-2xl bg-black/40 border border-dark-gold/25 mb-6 whitespace-pre-line font-serif shadow-inner min-h-[160px]">
          <!-- 載入中動畫 -->
          <div
            v-if="isGeneratingPerspective"
            class="py-8 flex flex-col items-center justify-center space-y-3 text-center"
          >
            <div class="w-8 h-8 border-2 border-dark-gold border-t-transparent rounded-full animate-spin"></div>
            <div class="text-xs text-dark-gold font-bold animate-pulse">
              靈犀大師正以【{{ perspectiveOptions.find(p => p.id === selectedPerspective)?.shortName }}】筆法為您修撰一生行誼...
            </div>
            <div class="text-[11px] text-dark-muted">
              正在融會您在台灣歷經的風雲浪潮、歲運起伏與心性抉擇（約需數十秒，請靜候天機顯現）
            </div>
          </div>

          <div v-else>
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-dark-gold/15">
              <span class="text-xs font-bold text-dark-gold font-sans flex items-center space-x-1">
                <span>🌌</span>
                <span>【{{ perspectiveOptions.find(p => p.id === selectedPerspective)?.shortName }} · 蓋棺論定】</span>
              </span>
              <button
                @click="requestPerspectiveUpdate(selectedPerspective, true)"
                class="px-2.5 py-1 rounded-lg bg-dark-gold/20 hover:bg-dark-gold/35 border border-dark-gold/40 text-dark-gold text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1"
                :title="'由 LLM 深度撰寫' + perspectiveOptions.find(p => p.id === selectedPerspective)?.shortName"
              >
                <span>✨</span>
                <span>{{ finalSummary.perspectiveIsAi?.[selectedPerspective] ? 'AI 重新撰寫' : '召喚靈犀 AI 深度撰寫' }}</span>
              </button>
            </div>

            <!-- 專屬：80億分之一的遊戲 紅顏因緣大揭曉卡片群 -->
            <div
              v-if="selectedPerspective === 'ONE_IN_8_BILLION' && finalSummary.oneInEightBillion"
              class="mb-4 space-y-3 text-left font-sans"
            >
              <!-- 罕見度與專屬代碼 -->
              <div class="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div class="text-[11px] text-purple-300 font-bold flex items-center space-x-1">
                    <span>🌌</span>
                    <span>{{ finalSummary.oneInEightBillion.rarityScoreText }}</span>
                  </div>
                  <div class="text-[10px] text-dark-muted font-mono mt-0.5">
                    自由意志分歧路徑：{{ finalSummary.oneInEightBillion.choicePathPermutations }}
                  </div>
                </div>
                <div class="px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-200 font-mono text-[11px] font-bold text-center self-start sm:self-auto">
                  {{ finalSummary.oneInEightBillion.destinyCode }}
                </div>
              </div>

              <!-- 5位紅顏知己盲盒真面目揭曉列表 -->
              <div class="p-3.5 rounded-xl bg-rose-950/25 border border-rose-500/30 text-left">
                <div class="font-bold text-rose-300 text-xs mb-2.5 flex items-center justify-between">
                  <span>🌹 80億人中的紅顏因緣 · 真身大揭曉</span>
                  <span class="text-[10px] text-dark-muted font-mono">盲盒真相揭秘</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div
                    v-for="friend in finalSummary.oneInEightBillion.revealedFriends"
                    :key="friend.id"
                    class="p-3 rounded-xl bg-black/50 border border-rose-500/20 flex flex-col justify-between"
                  >
                    <div>
                      <!-- 日式寫實相逢角色插畫 -->
                      <div class="w-full h-32 sm:h-36 rounded-lg overflow-hidden border border-rose-500/25 mb-2 relative group">
                        <img
                          :src="friend.illustration || '/images/life-simulator/romance_wanqing.jpg'"
                          :alt="friend.name"
                          class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-2">
                          <span class="text-[10px] text-rose-200 font-sans font-bold bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm border border-rose-500/30">
                            🎨 日式寫實 · {{ friend.name }} 真容
                          </span>
                        </div>
                      </div>

                      <div class="flex items-center justify-between mb-1">
                        <span class="font-bold text-rose-200 text-sm">{{ friend.name }}</span>
                        <span
                          class="px-2 py-0.5 rounded text-[10px] font-bold"
                          :class="[
                            friend.status === 'SPOUSE' ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40' :
                            friend.status === 'BONDED' ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40' :
                            friend.status === 'MET' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          ]"
                        >
                          {{ friend.statusText }}
                        </span>
                      </div>
                      <div class="text-[10px] text-dark-gold mb-1">
                        {{ friend.archetype }} (化身：{{ friend.mysteryAlias }})
                      </div>

                      <!-- 歲數搭配、生日與對方好感度 -->
                      <div class="my-1.5 p-1.5 rounded bg-black/40 border border-white/5 space-y-0.5 text-[10px] font-mono">
                        <div v-if="friend.birthDate" class="text-rose-200/90 flex justify-between">
                          <span>🎂 生辰：{{ friend.birthDate }}</span>
                          <span v-if="friend.herEncounterAge">相遇歲數：{{ friend.herEncounterAge }} 歲</span>
                        </div>
                        <div class="flex items-center justify-between text-dark-gold">
                          <span>💖 對方好感度：{{ friend.herAffinity }}%</span>
                          <span>🌟 先天默契：{{ friend.compatibilityScore }}%</span>
                        </div>
                      </div>

                      <p class="text-[11px] text-dark-muted leading-relaxed font-sans">
                        {{ friend.fatedSummary }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 長文自傳 -->
            <div class="whitespace-pre-line leading-relaxed font-serif">
              {{ finalSummary.biographyRichText }}
            </div>
          </div>
        </div>

        <!-- 一生榮光與遺憾 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-xs mb-6">
          <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div class="text-emerald-400 font-bold mb-1">🏆 一生榮光與功德：</div>
            <ul class="list-disc list-inside text-dark-muted space-y-1">
              <li v-for="(t, idx) in finalSummary.keyTriumphs" :key="idx">{{ t }}</li>
            </ul>
          </div>
          <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
            <div class="text-rose-400 font-bold mb-1">🍃 歲月缺憾與回眸：</div>
            <ul class="list-disc list-inside text-dark-muted space-y-1">
              <li v-for="(r, idx) in finalSummary.keyRegrets" :key="idx">{{ r }}</li>
            </ul>
          </div>
        </div>

        <div class="flex items-center justify-center space-x-3">
          <button
            @click="restartSimulation"
            class="px-5 py-2.5 rounded-xl bg-dark-gold text-dark-void font-bold text-xs hover:bg-yellow-400 transition-all shadow-cosmic cursor-pointer"
          >
            🔄 重新開啟新一世
          </button>
          <button
            @click="finalSummary = null"
            class="px-5 py-2.5 rounded-xl border border-dark-gold/40 text-dark-gold text-xs font-bold hover:bg-dark-gold/15 transition-all cursor-pointer"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { getYearMetaphysicalGuidance, getInitialFemaleFriends, getLifeStageIllustration, FemaleFriendProfile } from '@celestial/astro-core';

interface SavedProfile {
  id: string;
  name: string;
  gender: string;
  birthDatetime: string;
}

const form = ref({
  profileName: '張道遠',
  birthDate: '1995-10-24T14:30',
  gender: '男',
});

// 男性視角專屬：紅顏知己 5 位盲盒名冊 (支援自訂 KEYIN 生日)
const femaleFriendsSetup = ref<FemaleFriendProfile[]>(getInitialFemaleFriends('1995-10-24T14:30'));

// 監聽男主角生日變動，自適應更新女性友人預設生日
watch(() => form.value.birthDate, (newDate) => {
  if (newDate) {
    femaleFriendsSetup.value = getInitialFemaleFriends(newDate, femaleFriendsSetup.value);
  }
});

function onFriendBirthChange(friend: FemaleFriendProfile) {
  if (!friend.birthDate || !form.value.birthDate) return;
  const maleYear = parseInt(form.value.birthDate.slice(0, 4));
  const femaleYear = parseInt(friend.birthDate.slice(0, 4));
  if (!isNaN(maleYear) && !isNaN(femaleYear)) {
    // ageOffset: 女方歲數 - 男方歲數 = maleYear - femaleYear
    friend.ageOffset = maleYear - femaleYear;
  }
}

const savedProfiles = ref<SavedProfile[]>([]);
const loading = ref(false);
const actionLoading = ref(false);
const session = ref<any>(null);
const viewingAge = ref<number>(0);
const customActionText = ref('');
const finalSummary = ref<any>(null);
const selectedPerspective = ref<'TIANJI' | 'SHIJI' | 'MEMOIR' | 'ONE_IN_8_BILLION'>('TIANJI');
const isGeneratingPerspective = ref(false);
const timelineScroll = ref<HTMLElement | null>(null);

const perspectiveOptions = [
  {
    id: 'TIANJI' as const,
    label: '🔮 倪師天紀心法',
    shortName: '倪師天紀',
    desc: '以天紀「人事努力大於先天命盤」為宗，剖析行善積德化解煞氣、自強不息改寫天命。',
  },
  {
    id: 'SHIJI' as const,
    label: '📜 正史太史公列傳',
    shortName: '太史公列傳',
    desc: '司馬遷《史記》春秋筆法，微言大義、古雅典贍，附「太史公曰」史家贊辭。',
  },
  {
    id: 'MEMOIR' as const,
    label: '☕ 現代時代回憶錄',
    shortName: '時代回憶錄',
    desc: '溫潤感性、記述在台灣時代浪潮中的奮鬥打拼、悲歡離合與給子孫的深情獨白。',
  },
  {
    id: 'ONE_IN_8_BILLION' as const,
    label: '🌌 80億分之一的遊戲',
    shortName: '80億分之一',
    desc: '全球 80 億人潮中，自由意志抉擇排列與紅顏盲盒因緣真身大揭曉。',
  },
];

const currentNode = computed(() => {
  if (!session.value || !session.value.history) return null;
  return session.value.history[session.value.currentAge];
});

const activeDisplayNode = computed(() => {
  if (!session.value || !session.value.history) return null;
  return session.value.history[viewingAge.value] || currentNode.value;
});

const turnGuidance = computed(() => {
  if (!activeDisplayNode.value) return null;
  return getYearMetaphysicalGuidance(activeDisplayNode.value);
});

// 當前人生階段對應之日式寫實風格插畫
const activeStageIllustration = computed(() => {
  if (!activeDisplayNode.value) return '/images/life-simulator/stage_01_infancy.jpg';
  return activeDisplayNode.value.stageIllustration || getLifeStageIllustration(activeDisplayNode.value.age);
});

// 80億分之一紅顏盲盒相逢專屬插畫
const activeRomanticIllustration = computed(() => {
  if (!activeDisplayNode.value) return null;
  const node = activeDisplayNode.value;
  const isRomantic = node.eventTitle?.includes('邂逅') || node.options?.some(o => o.id?.includes('romantic'));
  if (!isRomantic) return null;
  if (node.romanceIllustration) return node.romanceIllustration;
  if (node.age === 18) return '/images/life-simulator/romance_wanqing.jpg';
  if (node.age === 22) return '/images/life-simulator/romance_ruoxi.jpg';
  if (node.age === 26) return '/images/life-simulator/romance_yuwei.jpg';
  if (node.age === 30) return '/images/life-simulator/romance_peiyi.jpg';
  if (node.age === 34) return '/images/life-simulator/romance_minzhi.jpg';
  return '/images/life-simulator/romance_wanqing.jpg';
});

const attributes = computed(() => {
  if (activeDisplayNode.value && activeDisplayNode.value.snapshotAttributes && activeDisplayNode.value.snapshotAttributes.health) {
    return activeDisplayNode.value.snapshotAttributes;
  }
  if (!session.value) return { health: 80, knowledge: 20, wealth: 30, relationship: 70, career: 20, wisdom: 20 };
  return session.value.attributes;
});

onMounted(() => {
  loadVaultProfiles();
});

function loadVaultProfiles() {
  try {
    const raw = localStorage.getItem('celestial_vault_profiles');
    if (raw) {
      savedProfiles.value = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load saved profiles:', err);
  }
}

function loadSavedProfile(id: string) {
  const p = savedProfiles.value.find((item) => item.id === id);
  if (!p) return;
  form.value.profileName = p.name;
  form.value.gender = p.gender === '女' ? '女' : '男';
  if (p.birthDatetime) {
    form.value.birthDate = p.birthDatetime.slice(0, 16);
    femaleFriendsSetup.value = getInitialFemaleFriends(p.birthDatetime);
  }
}

async function startSimulation() {
  loading.value = true;
  try {
    const res = await fetch('/api/v1/simulator/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileName: form.value.profileName,
        birthDate: form.value.birthDate,
        gender: form.value.gender,
        femaleFriends: form.value.gender === '男' ? femaleFriendsSetup.value : undefined,
      }),
    });
    const data = await res.json();
    if (data.success) {
      session.value = data.data.session;
      viewingAge.value = session.value.currentAge;
      await fetchTurnPrompt(session.value.sessionId, session.value.currentAge);
    } else {
      alert(data.message || '起局失敗');
    }
  } catch (err: any) {
    alert(err.message || '連線伺服器異常');
  } finally {
    loading.value = false;
  }
}

async function fetchTurnPrompt(sessionId: string, age: number) {
  try {
    const res = await fetch('/api/v1/simulator/turn/prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, age }),
    });
    const data = await res.json();
    if (data.success) {
      session.value.history[age] = data.data.node;
    }
  } catch (err) {
    console.error('Fetch turn prompt error:', err);
  }
}

async function makeDecision(optionId: string) {
  if (actionLoading.value) return;
  actionLoading.value = true;
  try {
    const res = await fetch('/api/v1/simulator/turn/choose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.value.sessionId,
        age: session.value.currentAge,
        chosenOptionId: optionId,
      }),
    });
    const data = await res.json();
    if (data.success) {
      session.value.history[session.value.currentAge] = data.data.resolvedNode;
      session.value.attributes = data.data.newAttributes;

      if (data.data.isTerminal) {
        session.value.status = 'COMPLETED';
        session.value.finalSummary = data.data.finalSummary;
        finalSummary.value = data.data.finalSummary;
      } else {
        session.value.currentAge = data.data.nextAge;
        viewingAge.value = data.data.nextAge;
        await fetchTurnPrompt(session.value.sessionId, data.data.nextAge);
        scrollToCurrentAge();
      }
    } else {
      alert(data.message || '結算失敗');
    }
  } catch (err: any) {
    alert(err.message || '抉擇結算異常');
  } finally {
    actionLoading.value = false;
  }
}

async function makeCustomDecision() {
  if (!customActionText.value.trim() || actionLoading.value) return;
  actionLoading.value = true;
  try {
    const res = await fetch('/api/v1/simulator/turn/choose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.value.sessionId,
        age: session.value.currentAge,
        customText: customActionText.value.trim(),
      }),
    });
    const data = await res.json();
    if (data.success) {
      customActionText.value = '';
      session.value.history[session.value.currentAge] = data.data.resolvedNode;
      session.value.attributes = data.data.newAttributes;

      if (data.data.isTerminal) {
        session.value.status = 'COMPLETED';
        session.value.finalSummary = data.data.finalSummary;
        finalSummary.value = data.data.finalSummary;
      } else {
        session.value.currentAge = data.data.nextAge;
        viewingAge.value = data.data.nextAge;
        await fetchTurnPrompt(session.value.sessionId, data.data.nextAge);
        scrollToCurrentAge();
      }
    }
  } catch (err: any) {
    alert(err.message || '自訂抉擇失敗');
  } finally {
    actionLoading.value = false;
  }
}

async function fastForward() {
  if (actionLoading.value) return;
  actionLoading.value = true;
  try {
    const res = await fetch('/api/v1/simulator/fast-forward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.value.sessionId,
        maxYears: 8,
      }),
    });
    const data = await res.json();
    if (data.success) {
      // 重新載入最新 session
      const getRes = await fetch(`/api/v1/simulator/session/${session.value.sessionId}`);
      const freshData = await getRes.json();
      if (freshData.success) {
        session.value = freshData.data;
        viewingAge.value = session.value.currentAge;
        if (data.data.terminalHit) {
          session.value.finalSummary = data.data.finalSummary;
          finalSummary.value = data.data.finalSummary;
        } else {
          await fetchTurnPrompt(session.value.sessionId, session.value.currentAge);
        }
        scrollToCurrentAge();
      }
    }
  } catch (err: any) {
    alert(err.message || '快進失敗');
  } finally {
    actionLoading.value = false;
  }
}

function selectPerspective(p: 'TIANJI' | 'SHIJI' | 'MEMOIR' | 'ONE_IN_8_BILLION') {
  selectedPerspective.value = p;
  if (!finalSummary.value) return;
  if (finalSummary.value.perspectiveBiographies?.[p]) {
    finalSummary.value.biographyRichText = finalSummary.value.perspectiveBiographies[p];
    if (finalSummary.value.perspectiveTitles?.[p]) {
      finalSummary.value.endingTitle = finalSummary.value.perspectiveTitles[p];
    }
    finalSummary.value.activePerspective = p;
  } else {
    requestPerspectiveUpdate(p, false);
  }
}

async function requestPerspectiveUpdate(p: 'TIANJI' | 'SHIJI' | 'MEMOIR' | 'ONE_IN_8_BILLION', forceLlm = false) {
  if (!session.value?.sessionId) return;
  if (isGeneratingPerspective.value) return;
  isGeneratingPerspective.value = true;
  try {
    const res = await fetch('/api/v1/simulator/finalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.value.sessionId,
        perspective: p,
        forceLlm,
      }),
    });
    const data = await res.json();
    if (data.success && data.data) {
      finalSummary.value = data.data;
      selectedPerspective.value = data.data.activePerspective || p;
      if (session.value) {
        session.value.finalSummary = data.data;
        session.value.status = 'COMPLETED';
      }
    } else {
      alert(data.message || '生成該視角自傳失敗');
    }
  } catch (err: any) {
    alert(err.message || '請求生成自傳失敗，請稍後重試');
  } finally {
    isGeneratingPerspective.value = false;
  }
}

async function finalizeSimulation() {
  // 1. 若前端記憶體中已有一生總結，立即直接開啟彈窗，零延遲反應！
  if (session.value?.finalSummary) {
    finalSummary.value = session.value.finalSummary;
    if (finalSummary.value.activePerspective) {
      selectedPerspective.value = finalSummary.value.activePerspective;
    }
    return;
  }
  if (actionLoading.value) return;
  actionLoading.value = true;
  try {
    const res = await fetch('/api/v1/simulator/finalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.value.sessionId,
        perspective: selectedPerspective.value,
        forceLlm: false,
      }),
    });
    const data = await res.json();
    if (data.success && data.data) {
      finalSummary.value = data.data;
      if (data.data.activePerspective) {
        selectedPerspective.value = data.data.activePerspective;
      }
      if (session.value) {
        session.value.finalSummary = data.data;
        session.value.status = 'COMPLETED';
      }
    } else {
      alert(data.message || '生成一生總結失敗');
    }
  } catch (err: any) {
    alert(err.message || '生成一生總結失敗，請稍後重試');
  } finally {
    actionLoading.value = false;
  }
}

function inspectYear(age: number) {
  viewingAge.value = age;
}

function jumpToCurrentYear() {
  viewingAge.value = session.value.currentAge;
  scrollToCurrentAge();
}

function scrollToCurrentAge() {
  nextTick(() => {
    if (timelineScroll.value) {
      const activeEl = timelineScroll.value.children[session.value?.currentAge || 0] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  });
}

function restartSimulation() {
  finalSummary.value = null;
  session.value = null;
  viewingAge.value = 0;
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
