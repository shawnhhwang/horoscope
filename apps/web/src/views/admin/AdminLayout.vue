<template>
  <div class="min-h-screen flex flex-col md:flex-row bg-admin-bg text-admin-text font-sans">
    <!-- 行動端 iPhone/Mobile 頂部導航列 (僅在 md 以下小螢幕顯示) -->
    <header class="md:hidden glass-panel border-b border-admin-gold/20 px-4 py-3 flex items-center justify-between sticky top-0 z-40 bg-admin-sidebar/95 backdrop-blur-md pt-[calc(0.75rem+env(safe-area-inset-top,0px))]">
      <div class="flex items-center space-x-2.5">
        <button
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="p-1.5 rounded-lg border border-admin-gold/40 text-admin-gold hover:bg-admin-gold/15 transition-colors"
          :title="isMobileMenuOpen ? '關閉選單' : '展開後台選單'"
        >
          <span class="text-base font-bold">{{ isMobileMenuOpen ? '✕' : '☰' }}</span>
        </button>
        <div class="flex items-center space-x-2">
          <div class="w-6 h-6 rounded-full border border-admin-gold bg-admin-gold/15 flex items-center justify-center font-serif text-admin-gold font-bold text-[10px]">
            天
          </div>
          <span class="font-serif font-bold text-xs text-admin-gold">萬象天儀 CMS</span>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <span
          class="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
          :class="authStore.isDemoMode ? 'bg-admin-gold/20 text-admin-gold border border-admin-gold/40' : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40'"
        >
          {{ authStore.isDemoMode ? 'DEMO' : 'PROD' }}
        </span>
        <router-link
          to="/"
          class="text-xs text-admin-gold hover:underline font-serif px-2 py-1 rounded border border-admin-gold/30"
        >
          ← 前台
        </router-link>
      </div>
    </header>

    <!-- 行動端抽屜遮罩 (點擊關閉) -->
    <div
      v-if="isMobileMenuOpen"
      @click="isMobileMenuOpen = false"
      class="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity"
    ></div>

    <!-- 左側側邊欄導航 (桌面常駐，手機端作為滑出抽屜) -->
    <aside
      :class="[
        'w-64 bg-admin-sidebar border-r border-admin-gold/15 p-6 flex flex-col justify-between shrink-0 transition-transform duration-300 z-50',
        'fixed md:static inset-y-0 left-0',
        isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0',
      ]"
    >
      <div>
        <!-- 品牌區 -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-full border border-admin-gold bg-admin-gold/15 flex items-center justify-center font-serif text-admin-gold font-bold text-xs shadow-cosmic">
              天
            </div>
            <div>
              <h1 class="font-serif font-bold text-sm text-admin-gold tracking-wider">萬象天儀 CMS</h1>
              <span class="text-[9px] text-admin-muted uppercase tracking-widest block">ADMIN PORTAL (PORT 9999)</span>
            </div>
          </div>
          <!-- 手機端關閉按鈕 -->
          <button
            @click="isMobileMenuOpen = false"
            class="md:hidden text-admin-muted hover:text-white text-lg p-1"
          >
            ✕
          </button>
        </div>

        <!-- 👑 DEMO 模式最高權限提示標籤 -->
        <div class="mb-6 p-2.5 rounded-lg border text-[11px] flex flex-col gap-1 shadow-sm font-serif"
          :class="authStore.isDemoMode ? 'bg-admin-gold/10 border-admin-gold/30 text-admin-gold' : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'">
          <div class="flex items-center justify-between">
            <span class="font-bold flex items-center space-x-1">
              <span>{{ authStore.isDemoMode ? '👑' : '🛡️' }}</span>
              <span>{{ authStore.isDemoMode ? 'DEMO 管理模式' : '正式生產模式' }}</span>
            </span>
            <span class="px-1.5 py-0.5 rounded text-black font-bold text-[9px]"
              :class="authStore.isDemoMode ? 'bg-admin-gold' : 'bg-emerald-400'">
              {{ authStore.user?.role || 'ADMIN' }}
            </span>
          </div>
          <div class="text-[9px] text-admin-muted">
            .env 配置: DEMO_MODE={{ authStore.serverDemoEnabled ? 'true' : 'false' }}
          </div>
        </div>

        <!-- 導航連結 (手機點擊自動收起抽屜) -->
        <nav class="space-y-2 text-xs font-serif">
          <router-link
            to="/admin/dashboard"
            @click="isMobileMenuOpen = false"
            class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-admin-muted hover:text-admin-text hover:bg-black/30 transition-colors"
            active-class="bg-admin-gold/15 text-admin-gold font-bold border border-admin-gold/30"
          >
            <span>📊 營運數據大盤</span>
          </router-link>

          <router-link
            to="/admin/interpretations"
            @click="isMobileMenuOpen = false"
            class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-admin-muted hover:text-admin-text hover:bg-black/30 transition-colors"
            active-class="bg-admin-gold/15 text-admin-gold font-bold border border-admin-gold/30"
          >
            <span>📜 RAG 領域知識庫與詞條</span>
          </router-link>

          <router-link
            to="/admin/users"
            @click="isMobileMenuOpen = false"
            class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-admin-muted hover:text-admin-text hover:bg-black/30 transition-colors"
            active-class="bg-admin-gold/15 text-admin-gold font-bold border border-admin-gold/30"
          >
            <span>👥 會員與帳號管理</span>
          </router-link>

          <router-link
            to="/admin/database"
            @click="isMobileMenuOpen = false"
            class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-admin-muted hover:text-admin-text hover:bg-black/30 transition-colors"
            active-class="bg-admin-gold/15 text-admin-gold font-bold border border-admin-gold/30"
          >
            <span>💾 資料庫管理與備份</span>
          </router-link>

          <router-link
            to="/admin/llm-settings"
            @click="isMobileMenuOpen = false"
            class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-admin-muted hover:text-admin-text hover:bg-black/30 transition-colors"
            active-class="bg-admin-gold/15 text-admin-gold font-bold border border-admin-gold/30"
          >
            <span class="flex items-center space-x-1.5">
              <span class="text-admin-gold">✨</span>
              <span>AI 靈犀配置 (LLM)</span>
            </span>
          </router-link>
        </nav>
      </div>

      <!-- 底部操作區 -->
      <div class="border-t border-admin-gold/15 pt-4 space-y-2 pb-[env(safe-area-inset-bottom,0px)]">
        <router-link
          to="/"
          @click="isMobileMenuOpen = false"
          class="block text-center py-2.5 rounded-lg border border-admin-gold/40 text-admin-gold hover:bg-admin-gold/15 text-xs font-serif font-bold transition-colors shadow-sm"
        >
          ← 返回前台展示主站
        </router-link>
      </div>
    </aside>

    <!-- 主體內容區 (針對手機端自適應 padding 與橫向防溢出) -->
    <main class="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto overflow-x-hidden min-w-0 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const isMobileMenuOpen = ref(false);

onMounted(async () => {
  if (authStore.isDemoMode && typeof authStore.ensureDemoToken === 'function') {
    await authStore.ensureDemoToken();
  }
});
</script>
