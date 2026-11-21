<template>
  <header id="celestial-navbar" class="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-dark-gold/25 backdrop-blur-md transition-colors pt-[env(safe-area-inset-top,0px)]">
    <!-- 主頂部導航列 (Row 1: Logo & 後台直通入口 & 控制開關) -->
    <div class="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3">
      <!-- 品牌 Logo -->
      <router-link to="/" class="flex items-center space-x-2 sm:space-x-2.5 group flex-shrink-0">
        <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-dark-gold flex items-center justify-center bg-dark-gold/10 group-hover:rotate-45 transition-transform duration-500 shadow-cosmic shrink-0">
          <span class="font-serif text-dark-gold font-bold text-xs">天</span>
        </div>
        <div>
          <span class="font-serif font-bold text-sm sm:text-lg tracking-wider sm:tracking-widest text-gold-gradient block leading-tight">萬象天儀</span>
          <span class="text-[7px] sm:text-[8px] tracking-[0.15em] sm:tracking-[0.2em] text-dark-muted block uppercase font-sans">Astraea CelestialDao</span>
        </div>
      </router-link>

      <!-- 快捷操作區 (DEMO 模式 + LLM 靈犀 + 晝夜主題 + 會員狀態) -->
      <div class="flex items-center space-x-1.5 sm:space-x-2.5 flex-shrink-0">
        <!-- 💡 DEMO 探索模式開關按鈕 -->
        <button
          @click="authStore.toggleDemoMode()"
          class="flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-full text-[11px] font-serif border transition-all shadow-sm"
          :class="[
            authStore.isDemoMode
              ? 'bg-amber-500/15 border-amber-500/60 text-amber-400 hover:bg-amber-500/25 shadow-cosmic'
              : 'glass-panel border-dark-muted/40 text-dark-muted hover:text-dark-text',
          ]"
          :title="authStore.isDemoMode ? '點擊可切換 DEMO 模式 (體驗訪客模式)' : '開啟 DEMO 模式，免帳號探索全站命理功能'"
        >
          <span class="text-xs">{{ authStore.isDemoMode ? '✨' : '🔒' }}</span>
          <span class="font-bold hidden md:inline">DEMO模式</span>
          <span
            class="text-[9px] px-1 py-0.2 rounded font-mono font-bold"
            :class="authStore.isDemoMode ? 'bg-amber-400 text-black' : 'bg-gray-700 text-gray-300'"
          >
            {{ authStore.isDemoMode ? 'ON' : 'OFF' }}
          </span>
        </button>

        <!-- 📖 使用指南手冊快捷入口 -->
        <router-link
          to="/guide"
          class="flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-full text-[11px] font-serif tracking-wider glass-panel border border-dark-gold/40 hover:border-dark-gold text-dark-gold transition-all shadow-sm group"
          title="開啟萬象天儀全系統使用手冊與情境指南"
        >
          <span class="text-xs group-hover:scale-110 transition-transform">📖</span>
          <span class="font-bold hidden md:inline">使用指南</span>
        </router-link>

        <!-- ✨ 天機靈犀 LLM 智能助手按鈕 -->
        <button
          @click="llmStore.toggleAssistant"
          class="flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-full text-[11px] font-serif tracking-wider bg-dark-gold/15 hover:bg-dark-gold/25 border border-dark-gold/60 text-dark-gold transition-all shadow-cosmic group"
          title="開啟天機靈犀 AI 星象顧問"
        >
          <span class="text-xs group-hover:rotate-45 transition-transform">✨</span>
          <span class="font-bold hidden md:inline">天機靈犀</span>
        </button>

        <!-- 主題切換按鈕 (晝夜 Light / Dark) -->
        <button
          @click="themeStore.toggleTheme"
          class="p-1.5 rounded-full border border-dark-gold/30 hover:border-dark-gold hover:bg-dark-gold/10 transition-colors"
          :title="themeStore.currentTheme === 'dark' ? '切換為晨曦天盤 (Light 淺色模式)' : '切換為星淵夜幕 (Dark 深色模式)'"
        >
          <Sun v-if="themeStore.currentTheme === 'dark'" class="w-4 h-4 text-dark-gold" />
          <Moon v-else class="w-4 h-4 text-amber-700" />
        </button>

        <!-- 👤 會員頭像 (導向個人星盤保險庫) -->
        <div v-if="authStore.user" class="flex items-center space-x-1.5 sm:space-x-2">
          <router-link
            to="/vault"
            class="flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-2.5 py-1 rounded-full border border-dark-gold/60 bg-dark-gold/15 hover:bg-dark-gold/25 transition-all shadow-cosmic group cursor-pointer"
            title="前往我的星盤檔案庫"
          >
            <!-- 圓形頭像圖章 -->
            <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-dark-gold to-amber-200 text-dark-void font-bold flex items-center justify-center text-xs font-serif shadow-sm group-hover:scale-110 transition-transform shrink-0">
              {{ authStore.user.displayName ? authStore.user.displayName.charAt(0) : '天' }}
            </div>
            <div class="hidden sm:flex flex-col text-left">
              <div class="flex items-center space-x-1">
                <span class="text-[11px] font-serif text-dark-gold font-bold leading-tight truncate max-w-[100px] lg:max-w-[120px]">
                  {{ authStore.user.displayName }}
                </span>
                <span class="text-[9px] bg-amber-400 text-black px-1 py-0.2 rounded font-mono font-bold">
                  {{ authStore.user.role }}
                </span>
              </div>
              <span class="text-[8px] text-dark-muted group-hover:text-dark-gold transition-colors leading-none mt-0.5">
                星盤典藏館 🏛️
              </span>
            </div>
          </router-link>

          <!-- 若有真實登入者，提供登出按鈕 -->
          <button
            v-if="authStore.realUser"
            @click="authStore.logout"
            class="text-[11px] text-dark-muted hover:text-red-400 transition-colors font-serif hidden sm:inline"
            title="登出帳號"
          >
            登出
          </button>
        </div>
        <button
          v-else
          @click="$emit('open-auth-modal')"
          class="px-2.5 py-1.5 rounded-full text-[11px] font-serif tracking-wider border border-dark-gold/50 text-dark-gold hover:bg-dark-gold/10 transition-all whitespace-nowrap"
        >
          登入
        </button>
      </div>
    </div>

    <!-- 🌟 所有占卜算命功能 · 智能分類導航列 (Row 2: Categorized Mega Navigation Bar) -->
    <div class="border-t border-dark-gold/15 px-3 sm:px-6 bg-black/20 backdrop-blur-md relative">
      <div class="max-w-7xl mx-auto flex items-center justify-between py-1.5 font-serif text-xs">
        <!-- 5 大主題分類按鈕 (帶計數徽章與抽屜開關) -->
        <nav class="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click.stop="toggleCategoryShelf(cat.id)"
            class="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
            :class="[
              activeDropdown === cat.id
                ? 'border-dark-gold bg-dark-gold/25 text-dark-gold font-bold shadow-cosmic'
                : isCategoryActive(cat)
                ? 'border-dark-gold/60 bg-dark-gold/15 text-dark-gold font-bold shadow-sm'
                : 'border-transparent text-dark-muted hover:text-dark-gold hover:border-dark-gold/30 hover:bg-dark-gold/5',
            ]"
            :title="cat.desc + ' (點擊展開功能選單)'"
          >
            <span class="text-xs">{{ cat.icon }}</span>
            <span class="font-bold">{{ cat.title }}</span>
            <span
              class="text-[9px] px-1 py-0.2 rounded-full font-mono font-bold leading-none"
              :class="activeDropdown === cat.id || isCategoryActive(cat) ? 'bg-dark-gold text-dark-void' : 'bg-black/25 text-dark-muted'"
            >
              {{ cat.items.length }}
            </span>
            <ChevronDown
              class="w-3 h-3 opacity-60 transition-transform duration-200"
              :class="{ 'rotate-180 opacity-100 text-dark-gold': activeDropdown === cat.id }"
            />
          </button>
        </nav>

        <!-- 右側：萬象全功能矩陣總覽入口 (16 大系統) -->
        <button
          @click="openMegaModal"
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-dark-gold/15 hover:bg-dark-gold/25 border border-dark-gold/50 text-dark-gold transition-all shadow-cosmic group whitespace-nowrap flex-shrink-0 ml-2 cursor-pointer"
          title="展開萬象天儀 16 大占星命理功能九宮格全覽矩陣 (支援即時搜尋與分類篩選)"
        >
          <LayoutGrid class="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
          <span class="font-bold hidden sm:inline">全功能總覽</span>
          <span class="font-bold sm:hidden">總覽</span>
          <span class="text-[10px] bg-dark-gold text-dark-void px-1.5 py-0.2 rounded-full font-mono font-bold leading-none">
            {{ totalFeaturesCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- 🌟 分類功能擴展抽屜 (Row 3: Category Mega Shelf - 晝夜雙模適配) -->
    <transition name="shelf">
      <div
        v-if="currentActiveCategory"
        data-lenis-prevent
        class="shelf-panel border-t border-dark-gold/25 bg-dark-card/95 light:bg-[#FAF8F5]/98 light:border-light-border backdrop-blur-xl px-3 sm:px-6 py-3.5 shadow-2xl relative overscroll-contain"
      >
        <div class="max-w-7xl mx-auto">
          <!-- 抽屜頂部說明與快速關閉 -->
          <div class="flex items-center justify-between mb-3 pb-2 border-b border-dark-gold/15">
            <div class="flex items-center space-x-2">
              <span class="text-base">{{ currentActiveCategory.icon }}</span>
              <span class="font-serif font-bold text-sm text-dark-gold">{{ currentActiveCategory.title }}</span>
              <span class="text-xs text-dark-muted font-sans hidden sm:inline">· {{ currentActiveCategory.desc }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-[11px] font-mono text-dark-muted">共 {{ currentActiveCategory.items.length }} 個系統</span>
              <button
                @click="activeDropdown = null"
                class="w-6 h-6 rounded-full border border-dark-gold/30 hover:border-dark-gold text-dark-muted hover:text-dark-gold flex items-center justify-center transition-colors cursor-pointer"
                title="收合抽屜選單"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- 子功能項目網格卡片 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
            <router-link
              v-for="item in currentActiveCategory.items"
              :key="item.path"
              :to="item.path"
              @click="closeAll"
              class="flex items-center space-x-2.5 p-2.5 rounded-xl border transition-all duration-200 group cursor-pointer"
              :class="route.path === item.path
                ? '!border-dark-gold !bg-dark-gold/20 !text-dark-gold font-bold shadow-sm'
                : 'shelf-card-inactive border-dark-gold/15 hover:border-dark-gold/40 bg-black/20 light:bg-white/90 hover:bg-dark-gold/10 light:hover:bg-amber-500/10 text-dark-text'"
            >
              <span class="text-lg group-hover:scale-110 transition-transform flex-shrink-0 p-1.5 rounded-lg bg-dark-gold/10 light:bg-amber-500/10">
                {{ item.icon }}
              </span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-serif font-bold truncate group-hover:text-dark-gold transition-colors">
                    {{ item.title }}
                  </span>
                  <span v-if="route.path === item.path" class="w-1.5 h-1.5 rounded-full bg-dark-gold shrink-0 ml-1"></span>
                </div>
                <p class="text-[10px] text-dark-muted truncate font-sans mt-0.5">{{ item.desc }}</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </transition>
  </header>

  <!-- 🌟 萬象天儀 · 全功能矩陣九宮格彈窗 (Teleport 到 body，徹底突破 header backdrop-filter 裁切與上半部擠壓限制) -->
  <Teleport to="body">
    <transition name="mega-modal">
      <div
        v-if="isMegaModalOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md"
        @click.self="closeAll"
      >
        <div data-lenis-prevent class="w-full max-w-5xl h-[88vh] max-h-[850px] flex flex-col rounded-3xl glass-panel border border-dark-gold/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 overscroll-contain">
          <!-- 頂部標題列與即時搜尋 -->
          <div class="px-5 sm:px-7 py-4 border-b border-dark-gold/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/20 light:bg-[#F4F1EA]/80 shrink-0">
            <div class="flex items-center space-x-2.5">
              <div class="w-8 h-8 rounded-full border border-dark-gold flex items-center justify-center bg-dark-gold/15 text-dark-gold shadow-cosmic shrink-0">
                <LayoutGrid class="w-4 h-4" />
              </div>
              <div>
                <h3 class="font-serif text-base sm:text-lg font-bold text-gold-gradient">
                  萬象天儀 · 全系統功能導覽矩陣
                </h3>
                <p class="text-[11px] text-dark-muted font-sans">
                  東西方 16 大星象推演、命理演算、流年模擬與古典靈籤體系
                </p>
              </div>
            </div>

            <!-- 即時搜尋輸入框與關閉按鈕 -->
            <div class="flex items-center space-x-2">
              <div class="relative w-full sm:w-64">
                <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜尋功能 (如 八字、塔羅、夢)..."
                  class="w-full pl-8 pr-7 py-1.5 rounded-full text-xs bg-black/40 light:bg-white border border-dark-gold/30 text-dark-text placeholder:text-dark-muted focus:border-dark-gold outline-none transition-colors"
                />
                <button
                  v-if="searchQuery"
                  @click="searchQuery = ''"
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-muted hover:text-dark-text text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <button
                @click="closeAll"
                class="w-8 h-8 rounded-full border border-dark-gold/30 hover:border-dark-gold text-dark-muted hover:text-dark-gold flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="關閉總覽 (ESC)"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- 分類切換標籤 (Category Filter Tabs) -->
          <div class="px-5 sm:px-7 py-2.5 border-b border-dark-gold/15 bg-black/10 light:bg-[#FAF8F5]/80 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0">
            <button
              @click="selectedModalCategory = 'all'"
              class="px-3 py-1 rounded-full text-xs font-serif transition-all cursor-pointer whitespace-nowrap"
              :class="selectedModalCategory === 'all'
                ? 'bg-dark-gold text-dark-void font-bold shadow-sm'
                : 'text-dark-muted hover:text-dark-text hover:bg-dark-gold/10 light:hover:bg-amber-500/10'"
            >
              全部體系 ({{ totalFeaturesCount }})
            </button>
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="selectedModalCategory = cat.id"
              class="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-serif transition-all cursor-pointer whitespace-nowrap"
              :class="selectedModalCategory === cat.id
                ? 'bg-dark-gold text-dark-void font-bold shadow-sm'
                : 'text-dark-muted hover:text-dark-text hover:bg-dark-gold/10 light:hover:bg-amber-500/10'"
            >
              <span>{{ cat.icon }}</span>
              <span>{{ cat.title }}</span>
              <span class="text-[10px] font-mono opacity-80">({{ cat.items.length }})</span>
            </button>
          </div>

          <!-- 功能卡片清單 (支援分類平鋪、標籤篩選與關鍵字搜尋，帶 data-lenis-prevent 杜絕背景滾動打架) -->
          <div data-lenis-prevent class="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 overscroll-contain">
            <div
              v-for="cat in filteredCategories"
              :key="cat.id"
              class="space-y-3"
            >
              <!-- 分類橫幅 -->
              <div class="flex items-center space-x-2 pb-1 border-b border-dark-gold/15">
                <span class="text-sm">{{ cat.icon }}</span>
                <h4 class="font-serif font-bold text-xs sm:text-sm text-dark-gold tracking-wide">
                  {{ cat.title }}
                </h4>
                <span class="text-[10px] text-dark-muted font-sans">
                  · {{ cat.desc }}
                </span>
                <span class="text-[10px] font-mono text-dark-muted ml-auto">
                  {{ cat.items.length }} 項
                </span>
              </div>

              <!-- 分類內的功能卡片網格 -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                <router-link
                  v-for="item in cat.items"
                  :key="item.path"
                  :to="item.path"
                  @click="closeAll"
                  class="flex items-start space-x-3 p-3.5 rounded-2xl border transition-all duration-300 group hover:scale-[1.02] cursor-pointer"
                  :class="route.path === item.path
                    ? '!border-dark-gold !bg-dark-gold/20 shadow-cosmic !text-dark-gold font-bold'
                    : 'mega-modal-card-inactive border-dark-gold/20 hover:border-dark-gold/50 bg-black/20 light:bg-white/85 hover:bg-dark-gold/10 light:hover:bg-amber-500/10 text-dark-text'"
                >
                  <span class="text-2xl p-2 rounded-xl bg-dark-gold/10 light:bg-amber-500/10 border border-dark-gold/20 group-hover:scale-110 group-hover:bg-dark-gold/20 transition-all shrink-0">
                    {{ item.icon }}
                  </span>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between">
                      <span class="font-serif font-bold text-xs sm:text-sm group-hover:text-dark-gold transition-colors truncate">
                        {{ item.title }}
                      </span>
                      <span v-if="route.path === item.path" class="text-[9px] px-1.5 py-0.2 rounded-full bg-dark-gold text-dark-void font-bold shrink-0 ml-1">
                        當前
                      </span>
                    </div>
                    <p class="text-[11px] text-dark-muted leading-relaxed mt-1 font-sans line-clamp-2">
                      {{ item.desc }}
                    </p>
                  </div>
                </router-link>
              </div>
            </div>

            <!-- 無搜尋結果提示 -->
            <div
              v-if="filteredCategories.length === 0"
              class="py-16 text-center text-dark-muted space-y-3 font-serif"
            >
              <div class="text-4xl">🔍</div>
              <p class="text-sm">查無相符的功能系統</p>
              <p class="text-xs">請嘗試使用其他關鍵字如「八字」、「紫微」、「塔羅」、「籤」或重置分類條件</p>
              <button
                @click="resetFilters"
                class="px-4 py-1.5 rounded-full text-xs font-serif bg-dark-gold/20 hover:bg-dark-gold/30 border border-dark-gold text-dark-gold transition-all"
              >
                重置搜尋與篩選條件
              </button>
            </div>
          </div>

          <!-- 底部狀態提示列 -->
          <div class="px-5 sm:px-7 py-3 border-t border-dark-gold/15 bg-black/25 light:bg-[#F4F1EA]/80 flex items-center justify-between text-[11px] text-dark-muted font-serif shrink-0">
            <span>✨ 全站已集成 {{ totalFeaturesCount }} 大核心星象與命理模組 · 實時切換無跳轉</span>
            <span class="hidden sm:inline">按 <kbd class="px-1.5 py-0.5 rounded bg-black/50 light:bg-white border border-dark-gold/30 font-mono text-[10px]">ESC</kbd> 鍵可隨時關閉</span>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Sun, Moon, ChevronDown, LayoutGrid, Search, X } from 'lucide-vue-next';
import { useThemeStore } from '../../stores/theme.js';
import { useAuthStore } from '../../stores/auth.js';
import { useLlmStore } from '../../stores/llm.js';

defineEmits<{
  (e: 'open-auth-modal'): void;
}>();

const route = useRoute();
const themeStore = useThemeStore();
const authStore = useAuthStore();
const llmStore = useLlmStore();

// 狀態控制
const activeDropdown = ref<string | null>(null);
const isMegaModalOpen = ref(false);
const searchQuery = ref('');
const selectedModalCategory = ref<string>('all');

// 五大核心主題分類矩陣 (16 大系統科學分類)
const categories = [
  {
    id: 'eastern',
    title: '東方星命',
    icon: '🌌',
    desc: '正統干支命理與古典天星推演',
    items: [
      { path: '/ziwei', title: '紫微斗數', icon: '🌌', desc: '十二琉璃宮格 · 倪師三合派格局' },
      { path: '/bazi', title: '四柱八字', icon: '📜', desc: '節氣五行十神 · 真太陽時日主推算' },
      { path: '/qizheng', title: '七政四餘', icon: '🪐', desc: '果老星宗正統 · 二十八宿天星盤' },
      { path: '/holographic', title: '一鍵全息合參', icon: '✨', desc: '八字 × 紫微 × 西占 × 七政四維聯動' },
      { path: '/synastry', title: '八字合婚', icon: '💍', desc: '緣分五行契合 · 雙人合盤深度比對' },
    ],
  },
  {
    id: 'fortune',
    title: '歲月流年',
    icon: '⏳',
    desc: '百歲流年推演與每日行運起居',
    items: [
      { path: '/simulator', title: '模擬一生', icon: '⏳', desc: '0-100歲百歲人生大夢 · 台灣時代真實度' },
      { path: '/annual-planner', title: '流年生活曆', icon: '🗓️', desc: '十二流月行運曆 · 起居作息諧振' },
      { path: '/almanac', title: '每日通勝黃曆', icon: '📅', desc: '協紀辨方正宗 · 每日宜忌吉凶神煞' },
    ],
  },
  {
    id: 'divination',
    title: '民俗靈籤',
    icon: '⛩️',
    desc: '台灣廟宇六十甲子籤與古法周易卜筮',
    items: [
      { path: '/temple-poem', title: '廟宇籤詩', icon: '⛩️', desc: '台灣六十甲子籤 · 物理擬真擲筊請示' },
      { path: '/buncho', title: '文鳥抽籤', icon: '🐦', desc: '二十八宿靈雀銜籤 · 趣味面向神諭' },
      { path: '/dream', title: '周公解夢', icon: '🌙', desc: '古典原典意象 · 榮格潛意識深度解析' },
      { path: '/iching', title: '周易卜卦', icon: '☯️', desc: '文王六爻銅錢 · 梅花易數數理起卦' },
      { path: '/naming', title: '易經姓名學', icon: '✍️', desc: '康熙筆劃五格 · 喜用神五行補缺' },
    ],
  },
  {
    id: 'western',
    title: '西方神秘',
    icon: '🃏',
    desc: '當代西方神秘學與原型塔羅牌陣',
    items: [
      { path: '/tarot', title: '3D 塔羅占卜', icon: '🃏', desc: '78張韋特牌庫 · 6種經典占卜牌陣' },
      { path: '/western', title: '西洋星盤', icon: '♈', desc: '普拉西德宮位 · 月相與行星相位' },
    ],
  },
  {
    id: 'vault',
    title: '檔案指南',
    icon: '🏛️',
    desc: '命盤檔案庫與全站系統指南',
    items: [
      { path: '/vault', title: '命盤檔案庫', icon: '🏛️', desc: '生辰檔案雲端管理 · 歷史測算日記' },
      { path: '/guide', title: '使用手冊指南', icon: '📖', desc: '全系統情境教學 · 現代生活應用' },
    ],
  },
];

const totalFeaturesCount = computed(() => {
  return categories.reduce((sum, c) => sum + c.items.length, 0);
});

const currentActiveCategory = computed(() => {
  if (!activeDropdown.value) return null;
  return categories.find((c) => c.id === activeDropdown.value) || null;
});

function isCategoryActive(cat: typeof categories[0]): boolean {
  return cat.items.some((item) => route.path === item.path || route.path.startsWith(item.path + '/'));
}

function toggleCategoryShelf(catId: string) {
  if (activeDropdown.value === catId) {
    activeDropdown.value = null;
  } else {
    activeDropdown.value = catId;
  }
}

function closeAll() {
  activeDropdown.value = null;
  isMegaModalOpen.value = false;
  searchQuery.value = '';
}

function openMegaModal() {
  activeDropdown.value = null;
  isMegaModalOpen.value = true;
  searchQuery.value = '';
  selectedModalCategory.value = 'all';
}

function resetFilters() {
  searchQuery.value = '';
  selectedModalCategory.value = 'all';
}

// 點擊導航欄外部自動收合抽屜選單
function onDocumentClick(e: MouseEvent) {
  if (!activeDropdown.value) return;
  const navbar = document.getElementById('celestial-navbar');
  if (navbar && !navbar.contains(e.target as Node)) {
    activeDropdown.value = null;
  }
}

// 關鍵字與分類標籤即時過濾
const filteredCategories = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  let baseCats = categories;

  if (selectedModalCategory.value !== 'all') {
    baseCats = categories.filter((c) => c.id === selectedModalCategory.value);
  }

  if (!q) return baseCats;

  return baseCats
    .map((cat) => {
      const matched = cat.items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          cat.title.toLowerCase().includes(q)
      );
      return {
        ...cat,
        items: matched,
      };
    })
    .filter((cat) => cat.items.length > 0);
});

// 監聽路由跳轉時自動關閉選單
watch(
  () => route.path,
  () => {
    closeAll();
  }
);

// 鍵盤 ESC 支援
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    closeAll();
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('click', onDocumentClick);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('click', onDocumentClick);
});
</script>

<style scoped>
/* 隱藏橫向滾動條但保持滾動功能 */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 抽屜展開動畫 */
.shelf-enter-active,
.shelf-leave-active {
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}
.shelf-enter-from,
.shelf-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-6px);
}
.shelf-enter-to,
.shelf-leave-from {
  opacity: 1;
  max-height: 520px;
  transform: translateY(0);
}

/* 全功能九宮格彈窗動畫 */
.mega-modal-enter-active,
.mega-modal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.mega-modal-enter-from,
.mega-modal-leave-to {
  opacity: 0;
}

/* 🌟 亮色模式一致性樣式保證 (Light Mode Explicit Consistency) */
:global(html.light) .shelf-panel {
  background-color: rgba(250, 248, 245, 0.98) !important;
  border-top-color: rgba(164, 126, 59, 0.28) !important;
  box-shadow: 0 12px 35px -5px rgba(164, 126, 59, 0.12) !important;
}
:global(html.light) .shelf-card-inactive {
  background-color: rgba(255, 255, 255, 0.92) !important;
  border-color: rgba(164, 126, 59, 0.22) !important;
}
:global(html.light) .shelf-card-inactive:hover {
  background-color: #FFFFFF !important;
  border-color: rgba(164, 126, 59, 0.45) !important;
}
:global(html.light) .mega-modal-card-inactive {
  background-color: rgba(255, 255, 255, 0.92) !important;
  border-color: rgba(164, 126, 59, 0.22) !important;
}
:global(html.light) .mega-modal-card-inactive:hover {
  background-color: #FFFFFF !important;
  border-color: rgba(164, 126, 59, 0.45) !important;
}
</style>
