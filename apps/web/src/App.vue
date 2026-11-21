<template>
  <div class="min-h-screen flex flex-col justify-between selection:bg-dark-gold/30 selection:text-dark-gold">
    <!-- 頂部導航列 -->
    <Navbar @open-auth-modal="isAuthModalOpen = true" />

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

    <!-- 頁尾 (Awwwards 奢華幾何裝飾，適配 iPhone 底部安全區) -->
    <footer class="glass-panel border-t border-dark-gold/15 py-10 px-4 sm:px-6 mt-20 text-center text-xs text-dark-muted pb-[calc(3rem+env(safe-area-inset-bottom,0px))]">
      <div class="max-w-7xl mx-auto flex flex-col items-center justify-between gap-4">
        <div class="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-dark-gold/10 pb-4">
          <div class="flex items-center space-x-2">
            <span class="font-serif text-dark-gold font-bold">萬象天儀</span>
            <span>· Astraea CelestialDao</span>
          </div>
          <div class="flex flex-wrap items-center justify-center gap-3 text-xs font-serif text-dark-muted">
            <router-link to="/guide" class="hover:text-dark-gold transition-colors flex items-center space-x-1">
              <span>📖</span>
              <span>使用手冊指南</span>
            </router-link>
            <span>·</span>
            <router-link to="/vault" class="hover:text-dark-gold transition-colors flex items-center space-x-1">
              <span>🏛️</span>
              <span>命盤檔案庫</span>
            </router-link>
          </div>
          <p class="text-[11px]">© 2026 萬象天儀 版權所有 · 探究天地人三才至理</p>
        </div>
        <div class="text-[10px] text-dark-muted/80 leading-relaxed max-w-4xl text-center">
          <p class="mb-1 font-semibold text-dark-gold/90">【法規免責與個人資料保護聲明】</p>
          <p>
            本平台所提供之東西方命理排盤、占卜測算、歷史大事紀對映與 AI 靈犀諮詢，均屬中華傳統哲學、古典曆法數學演算與心理映照之文創生活體驗，所有分析均不具備醫療診斷、心理治療、法律訴訟或金融證券投資之專業依據。本站恪遵《個人資料保護法》，嚴格保護會員生辰與測算隱私，絕不向未授權第三方販售或洩漏個資。
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import Lenis from 'lenis';
import Navbar from './components/layout/Navbar.vue';
import AuthModal from './components/auth/AuthModal.vue';
import LlmAssistantModal from './components/ai/LlmAssistantModal.vue';
import { useThemeStore } from './stores/theme.js';
import { useAuthStore } from './stores/auth.js';

const route = useRoute();
const isAuthModalOpen = ref(false);
const themeStore = useThemeStore();
const authStore = useAuthStore();

let lenisInstance: Lenis | null = null;

onMounted(() => {
  themeStore.initTheme();
  authStore.loadAuth();

  // 初始化 Lenis 精品級平滑滾動 (優化阻尼與觸控手感)
  lenisInstance = new Lenis({
    duration: 1.0,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 1.2,
  });

  function raf(time: number) {
    if (lenisInstance) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
  }

  requestAnimationFrame(raf);
});

// 監聽路由跳轉：立即且平滑地將滾動條歸零，杜絕跨頁面虛擬滾動殘留與跳躍
watch(
  () => route.path,
  () => {
    if (lenisInstance) {
      lenisInstance.scrollTo(0, { immediate: true });
    }
  }
);

onBeforeUnmount(() => {
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
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
