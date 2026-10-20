<template>
  <header class="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-dark-gold/25 backdrop-blur-md transition-colors">
    <!-- 主頂部導航列 (Row 1: Logo & 後台直通入口 & 控制開關) -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
      <!-- 品牌 Logo -->
      <router-link to="/" class="flex items-center space-x-2.5 group flex-shrink-0">
        <div class="w-8 h-8 rounded-full border border-dark-gold flex items-center justify-center bg-dark-gold/10 group-hover:rotate-45 transition-transform duration-500 shadow-cosmic">
          <span class="font-serif text-dark-gold font-bold text-xs">天</span>
        </div>
        <div>
          <span class="font-serif font-bold text-base sm:text-lg tracking-widest text-gold-gradient block leading-tight">萬象天儀</span>
          <span class="text-[8px] tracking-[0.2em] text-dark-muted block uppercase font-sans">Astraea CelestialDao</span>
        </div>
      </router-link>

      <!-- 快捷操作區 (後台入口 + DEMO 模式 + LLM 靈犀 + 晝夜主題 + 會員狀態) -->
      <div class="flex items-center space-x-2 sm:space-x-2.5 flex-shrink-0">
        <!-- ⚙️ 後台管理系統入口 (極為顯目) -->
        <router-link
          to="/admin/dashboard"
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-serif font-bold bg-dark-gold text-dark-void hover:opacity-90 transition-all shadow-cosmic group border border-dark-gold"
          title="開啟萬象天儀 CMS 管理中樞 (後台)"
        >
          <span class="text-xs group-hover:rotate-90 transition-transform duration-500">⚙️</span>
          <span class="whitespace-nowrap">後台管理中樞</span>
          <span class="text-[9px] bg-black/25 px-1 py-0.2 rounded font-sans uppercase">CMS</span>
        </router-link>

        <!-- 💡 DEMO 探索模式開關按鈕 (預設開啟，享最大權限) -->
        <button
          @click="authStore.toggleDemoMode()"
          class="flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-[11px] font-serif border transition-all shadow-sm"
          :class="[
            authStore.isDemoMode
              ? 'bg-amber-500/15 border-amber-500/60 text-amber-400 hover:bg-amber-500/25 shadow-cosmic'
              : 'glass-panel border-dark-muted/40 text-dark-muted hover:text-dark-text',
          ]"
          :title="authStore.isDemoMode ? '點擊可切換 DEMO 模式 (當前具備最大權限 ADMIN)' : '開啟 DEMO 模式，免帳號探索全功能與後台'"
        >
          <span class="text-xs">{{ authStore.isDemoMode ? '👑' : '🔒' }}</span>
          <span class="font-bold hidden sm:inline">DEMO模式</span>
          <span
            class="text-[9px] px-1 py-0.2 rounded font-mono font-bold"
            :class="authStore.isDemoMode ? 'bg-amber-400 text-black' : 'bg-gray-700 text-gray-300'"
          >
            {{ authStore.isDemoMode ? 'ADMIN' : 'OFF' }}
          </span>
        </button>

        <!-- ✨ 天機靈犀 LLM 智能助手按鈕 -->
        <button
          @click="llmStore.toggleAssistant"
          class="flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-[11px] font-serif tracking-wider bg-dark-gold/15 hover:bg-dark-gold/25 border border-dark-gold/60 text-dark-gold transition-all shadow-cosmic group"
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

        <!-- 👤 會員頭像 (點擊頭像直接進入 ADMIN 後台進行編輯設定) -->
        <div v-if="authStore.user" class="flex items-center space-x-2">
          <router-link
            to="/admin/dashboard"
            class="flex items-center space-x-2 px-2.5 py-1 rounded-full border border-dark-gold/60 bg-dark-gold/15 hover:bg-dark-gold/25 transition-all shadow-cosmic group cursor-pointer"
            title="點擊頭像直接進入 ADMIN 後台進行編輯設定"
          >
            <!-- 圓形頭像圖章 -->
            <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-dark-gold to-amber-200 text-dark-void font-bold flex items-center justify-center text-xs font-serif shadow-sm group-hover:scale-110 transition-transform">
              {{ authStore.user.displayName ? authStore.user.displayName.charAt(0) : '天' }}
            </div>
            <div class="hidden sm:flex flex-col text-left">
              <div class="flex items-center space-x-1">
                <span class="text-[11px] font-serif text-dark-gold font-bold leading-tight truncate max-w-[120px]">
                  {{ authStore.user.displayName }}
                </span>
                <span class="text-[9px] bg-amber-400 text-black px-1 py-0.2 rounded font-mono font-bold">
                  {{ authStore.user.role }}
                </span>
              </div>
              <span class="text-[8px] text-dark-muted group-hover:text-dark-gold transition-colors leading-none mt-0.5">
                點擊頭像進入後台編輯 ⚙️
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

    <!-- 🌟 所有不同占卜算命功能 · 橫向快速導覽按鈕列 (Row 2: Horizontal Quick Functions Bar) -->
    <div class="border-t border-dark-gold/15 px-4 sm:px-6 bg-black/10">
      <div class="max-w-7xl mx-auto flex items-center space-x-1.5 sm:space-x-2 py-1.5 overflow-x-auto no-scrollbar font-serif text-xs">
        <router-link
          v-for="f in divinationFeatures"
          :key="f.path"
          :to="f.path"
          class="flex items-center space-x-1.5 px-3 py-1 rounded-full border border-transparent hover:border-dark-gold/40 text-dark-muted hover:text-dark-gold transition-all whitespace-nowrap flex-shrink-0"
          active-class="!border-dark-gold !bg-dark-gold/20 !text-dark-gold font-bold shadow-sm"
        >
          <span class="text-xs">{{ f.icon }}</span>
          <span>{{ f.title }}</span>
        </router-link>

        <!-- 分隔線與後台快捷按鈕 (直接跳轉至本站 /admin/dashboard) -->
        <div class="h-4 w-[1px] bg-dark-gold/30 flex-shrink-0 mx-1"></div>
        <router-link
          to="/admin/dashboard"
          class="flex items-center space-x-1 px-3 py-1 rounded-full border border-dark-gold/40 hover:border-dark-gold bg-dark-gold/10 text-dark-gold hover:bg-dark-gold hover:text-dark-void transition-all whitespace-nowrap flex-shrink-0 font-bold"
          title="進入本站 ADMIN 後台進行系統配置與辭庫編輯"
        >
          <span>⚙️ 系統後台配置</span>
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next';
import { useThemeStore } from '../../stores/theme.js';
import { useAuthStore } from '../../stores/auth.js';
import { useLlmStore } from '../../stores/llm.js';

defineEmits<{
  (e: 'open-auth-modal'): void;
}>();

const themeStore = useThemeStore();
const authStore = useAuthStore();
const llmStore = useLlmStore();

// 所有核心占卜與算命功能清單 (完整橫向切換)
const divinationFeatures = [
  { path: '/ziwei', title: '紫微斗數', icon: '🌌' },
  { path: '/bazi', title: '四柱八字', icon: '📜' },
  { path: '/qizheng', title: '七政四餘', icon: '🪐' },
  { path: '/almanac', title: '每日黃曆', icon: '📅' },
  { path: '/iching', title: '周易卜卦', icon: '☯️' },
  { path: '/naming', title: '易經起名', icon: '✍️' },
  { path: '/western', title: '西洋星盤', icon: '♈' },
  { path: '/tarot', title: '塔羅占卜', icon: '🃏' },
  { path: '/vault', title: '命盤檔案庫', icon: '🏛️' },
];
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
</style>
