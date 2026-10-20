<template>
  <div class="min-h-screen flex bg-admin-bg text-admin-text font-sans">
    <!-- 左側側邊欄導航 -->
    <aside class="w-64 bg-admin-sidebar border-r border-admin-gold/15 p-6 flex flex-col justify-between shrink-0">
      <div>
        <!-- 品牌區 -->
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-8 h-8 rounded-full border border-admin-gold bg-admin-gold/15 flex items-center justify-center font-serif text-admin-gold font-bold text-xs shadow-cosmic">
            天
          </div>
          <div>
            <h1 class="font-serif font-bold text-sm text-admin-gold tracking-wider">萬象天儀 CMS</h1>
            <span class="text-[9px] text-admin-muted uppercase tracking-widest block">ADMIN PORTAL (PORT 9999)</span>
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
            to="/admin/dashboard"
            class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-admin-muted hover:text-admin-text hover:bg-black/30 transition-colors"
            active-class="bg-admin-gold/15 text-admin-gold font-bold border border-admin-gold/30"
          >
            <span>📊 營運數據大盤</span>
          </router-link>

          <router-link
            to="/admin/interpretations"
            class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-admin-muted hover:text-admin-text hover:bg-black/30 transition-colors"
            active-class="bg-admin-gold/15 text-admin-gold font-bold border border-admin-gold/30"
          >
            <span>📜 命理詞庫內容 (CMS)</span>
          </router-link>

          <router-link
            to="/admin/users"
            class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-admin-muted hover:text-admin-text hover:bg-black/30 transition-colors"
            active-class="bg-admin-gold/15 text-admin-gold font-bold border border-admin-gold/30"
          >
            <span>👥 會員與權限管理</span>
          </router-link>

          <router-link
            to="/admin/llm-settings"
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
        <router-link
          to="/"
          class="block text-center py-2.5 rounded-lg border border-admin-gold/40 text-admin-gold hover:bg-admin-gold/15 text-xs font-serif font-bold transition-colors shadow-sm"
        >
          ← 返回前台展示主站
        </router-link>
      </div>
    </aside>

    <!-- 主體內容區 -->
    <main class="flex-1 p-8 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();

onMounted(async () => {
  if (authStore.isDemoMode && typeof authStore.ensureDemoToken === 'function') {
    await authStore.ensureDemoToken();
  }
});
</script>
