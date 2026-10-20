<template>
  <div class="min-h-screen flex flex-col justify-between selection:bg-dark-gold/30 selection:text-dark-gold">
    <!-- 頂部導航列 (在後台 CMS 路由時隱藏) -->
    <Navbar v-if="!isAdminRoute" @open-auth-modal="isAuthModalOpen = true" />

    <!-- 頁面路由內容 -->
    <main class="flex-grow">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 登入與註冊彈窗 -->
    <AuthModal :is-open="isAuthModalOpen" @close="isAuthModalOpen = false" />

    <!-- 天機靈犀 AI 助手抽屜視窗 -->
    <LlmAssistantModal />

    <!-- 頁尾 (Awwwards 奢華幾何裝飾，在後台 CMS 時隱藏) -->
    <footer v-if="!isAdminRoute" class="glass-panel border-t border-dark-gold/15 py-12 px-6 mt-20 text-center text-xs text-dark-muted">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center space-x-2">
          <span class="font-serif text-dark-gold font-bold">萬象天儀</span>
          <span>· Astraea CelestialDao</span>
        </div>
        <p class="font-serif">
          以 Awwwards / Webby Awards / FWA Site of the Day 得獎標準精雕細琢
        </p>
        <p>© 2026 萬象天儀 版權所有 · 探究天地人三才至理</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Lenis from 'lenis';
import Navbar from './components/layout/Navbar.vue';
import AuthModal from './components/auth/AuthModal.vue';
import LlmAssistantModal from './components/ai/LlmAssistantModal.vue';
import { useThemeStore } from './stores/theme.js';
import { useAuthStore } from './stores/auth.js';

const route = useRoute();
const isAdminRoute = computed(() => route.path.startsWith('/admin'));
const isAuthModalOpen = ref(false);
const themeStore = useThemeStore();
const authStore = useAuthStore();

onMounted(() => {
  themeStore.initTheme();
  authStore.loadAuth();

  // 初始化 Lenis 平滑滾動
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
