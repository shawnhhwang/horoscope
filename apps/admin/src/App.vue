<template>
  <div class="min-h-screen flex bg-admin-bg text-admin-text">
    <!-- 左側側邊欄導航 (登入頁面時隱藏) -->
    <aside v-if="route.name !== 'login'" class="w-64 bg-admin-sidebar border-r border-admin-gold/15 p-6 flex flex-col justify-between">
      <div>
        <!-- 品牌區 -->
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-8 h-8 rounded-full border border-admin-gold bg-admin-gold/15 flex items-center justify-center font-serif text-admin-gold font-bold text-xs shadow-cosmic">
            天
          </div>
          <div>
            <h1 class="font-serif font-bold text-sm text-admin-gold tracking-wider">萬象天儀 CMS</h1>
            <span class="text-[9px] text-admin-muted uppercase tracking-widest block">ADMIN PORTAL</span>
          </div>
        </div>

        <!-- 👑 DEMO 模式最高權限提示標籤 -->
        <div class="mb-6 p-2.5 rounded-lg bg-admin-gold/10 border border-admin-gold/30 text-[11px] text-admin-gold flex items-center justify-between shadow-sm">
          <span class="font-bold flex items-center space-x-1">
            <span>👑</span>
            <span>系統最高管理權限</span>
          </span>
          <span class="px-1.5 py-0.5 rounded bg-admin-gold text-black font-bold text-[9px]">ADMIN</span>
        </div>

        <!-- 導航連結 -->
        <nav class="space-y-2 text-xs font-serif">
          <router-link
            to="/dashboard"
            class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-admin-muted hover:text-admin-text hover:bg-black/30 transition-colors"
            active-class="bg-admin-gold/15 text-admin-gold font-bold border border-admin-gold/30"
          >
            <span>📊 營運數據大盤</span>
          </router-link>

          <router-link
            to="/interpretations"
            class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-admin-muted hover:text-admin-text hover:bg-black/30 transition-colors"
            active-class="bg-admin-gold/15 text-admin-gold font-bold border border-admin-gold/30"
          >
            <span>📜 命理詞庫內容 (CMS)</span>
          </router-link>

          <router-link
            to="/users"
            class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-admin-muted hover:text-admin-text hover:bg-black/30 transition-colors"
            active-class="bg-admin-gold/15 text-admin-gold font-bold border border-admin-gold/30"
          >
            <span>👥 會員與權限管理</span>
          </router-link>

          <router-link
            to="/llm-settings"
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
    <main class="flex-1 p-8 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const frontendUrl = computed(() => {
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${host}:9999`;
});

function logout() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  router.push('/login');
}
</script>
