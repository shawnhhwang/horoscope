<template>
  <div class="min-h-screen flex flex-col md:flex-row bg-admin-bg text-admin-text font-sans">
    <!-- 行動端頂部導航列 (登入頁面時隱藏) -->
    <header
      v-if="route.name !== 'login'"
      class="md:hidden glass-panel border-b border-admin-gold/20 px-4 py-3 flex items-center justify-between sticky top-0 z-40"
    >
      <div class="flex items-center space-x-2.5">
        <button
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="p-1.5 rounded-lg border border-admin-gold/40 text-admin-gold hover:bg-admin-gold/15 transition-colors"
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

      <button
        @click="logout"
        class="text-xs text-red-400 px-2 py-1 rounded border border-red-500/30"
      >
        登出
      </button>
    </header>

    <!-- 行動端抽屜遮罩 -->
    <div
      v-if="isMobileMenuOpen && route.name !== 'login'"
      @click="isMobileMenuOpen = false"
      class="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
    ></div>

    <!-- 左側側邊欄導航 (登入頁面時隱藏) -->
    <aside
      v-if="route.name !== 'login'"
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
              <span class="text-[9px] text-admin-muted uppercase tracking-widest block">ISOLATED ADMIN PORTAL</span>
            </div>
          </div>
          <button
            @click="isMobileMenuOpen = false"
            class="md:hidden text-admin-muted hover:text-white text-lg p-1"
          >
            ✕
          </button>
        </div>

        <!-- 管理員權限標籤 -->
        <div class="mb-6 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center justify-between shadow-sm">
          <span class="font-bold flex items-center space-x-1">
            <span>🛡️</span>
            <span>獨立隔離後台</span>
          </span>
          <span class="px-1.5 py-0.5 rounded bg-emerald-400 text-black font-bold text-[9px]">
            {{ authStore.user?.role || 'ADMIN' }}
          </span>
        </div>

        <!-- 導航連結 -->
        <nav class="space-y-2 text-xs font-serif">
          <router-link
            to="/dashboard"
            @click="isMobileMenuOpen = false"
            class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-admin-muted hover:text-admin-text hover:bg-black/30 transition-colors"
            active-class="bg-admin-gold/15 text-admin-gold font-bold border border-admin-gold/30"
          >
            <span>📊 營運數據大盤</span>
          </router-link>

          <router-link
            to="/interpretations"
            @click="isMobileMenuOpen = false"
            class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-admin-muted hover:text-admin-text hover:bg-black/30 transition-colors"
            active-class="bg-admin-gold/15 text-admin-gold font-bold border border-admin-gold/30"
          >
            <span>📜 RAG 領域知識庫與詞條</span>
          </router-link>

          <router-link
            to="/users"
            @click="isMobileMenuOpen = false"
            class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-admin-muted hover:text-admin-text hover:bg-black/30 transition-colors"
            active-class="bg-admin-gold/15 text-admin-gold font-bold border border-admin-gold/30"
          >
            <span>👥 會員與權限管理</span>
          </router-link>

          <router-link
            to="/database"
            @click="isMobileMenuOpen = false"
            class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-admin-muted hover:text-admin-text hover:bg-black/30 transition-colors"
            active-class="bg-admin-gold/15 text-admin-gold font-bold border border-admin-gold/30"
          >
            <span>💾 資料庫管理與稽核</span>
          </router-link>

          <router-link
            to="/llm-settings"
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
      <div class="border-t border-admin-gold/15 pt-4 space-y-2">
        <a
          :href="frontendUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="block text-center py-2 rounded-lg border border-admin-gold/30 text-admin-gold hover:bg-admin-gold/10 text-xs font-serif transition-colors"
        >
          造訪前台展示網頁 ↗
        </a>
        <button
          @click="logout"
          class="w-full text-center py-2 rounded-lg text-xs text-red-400 hover:bg-red-950/40 transition-colors font-serif"
        >
          登出管理中樞
        </button>
      </div>
    </aside>

    <!-- 主體內容區 -->
    <main class="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto overflow-x-hidden min-w-0">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isMobileMenuOpen = ref(false);

const frontendUrl = computed(() => {
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${host}:5499`;
});

function logout() {
  authStore.logout();
  router.push('/login');
}

onMounted(() => {
  authStore.syncServerConfig();
});
</script>
