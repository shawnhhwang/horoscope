<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
    <div class="relative w-full max-w-md p-8 glass-panel rounded-2xl shadow-cosmic-lg border border-dark-gold/40">
      <!-- 關閉按鈕 -->
      <button @click="$emit('close')" class="absolute top-4 right-4 text-dark-muted hover:text-dark-text text-xl">
        ✕
      </button>

      <!-- 標題 -->
      <div class="text-center mb-6">
        <h3 class="font-serif text-2xl font-bold text-gold-gradient mb-1">
          {{ isLogin ? '登入星象殿堂' : '註冊天機會員' }}
        </h3>
        <p class="text-xs text-dark-muted">
          {{ isLogin ? '探索專屬本命星盤與靈驗占卜日記' : '開啟東方干支星命與西方占星雙軌旅程' }}
        </p>
      </div>

      <!-- 表單 -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="!isLogin">
          <label class="block text-xs font-serif text-dark-muted mb-1">暱稱 / 稱謂</label>
          <input
            v-model="displayName"
            type="text"
            required
            placeholder="例如：星穹行者"
            class="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-dark-gold/30 focus:border-dark-gold outline-none text-base sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-xs font-serif text-dark-muted mb-1">電子信箱</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="your@email.com"
            class="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-dark-gold/30 focus:border-dark-gold outline-none text-base sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-xs font-serif text-dark-muted mb-1">密碼</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="請輸入密碼"
            class="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-dark-gold/30 focus:border-dark-gold outline-none text-base sm:text-sm"
          />
        </div>

        <p v-if="errorMessage" class="text-xs text-red-400 text-center">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 rounded-lg font-serif text-sm font-semibold tracking-wider bg-dark-gold text-dark-void hover:opacity-95 shadow-cosmic transition-all disabled:opacity-50"
        >
          {{ loading ? '通訊驗證中...' : isLogin ? '立即登入' : '確認註冊' }}
        </button>
      </form>

      <!-- 切換登入/註冊 -->
      <div class="mt-5 text-center text-xs text-dark-muted">
        <span>{{ isLogin ? '尚未擁有帳號？' : '已有帳號？' }}</span>
        <button @click="isLogin = !isLogin" class="ml-1 text-dark-gold hover:underline font-serif">
          {{ isLogin ? '立即免費註冊' : '直接登入' }}
        </button>
      </div>

      <!-- 💡 DEMO 模式免登入一鍵探索 -->
      <div class="mt-4 pt-4 border-t border-dark-gold/20 text-center">
        <div class="text-[11px] text-dark-muted mb-2">不想註冊帳號？亦可隨時使用 DEMO 體驗模式：</div>
        <button
          type="button"
          @click="handleDemoExplore"
          class="w-full py-2.5 rounded-lg font-serif text-xs font-semibold bg-amber-500/15 border border-amber-500/50 text-amber-400 hover:bg-amber-500/25 transition-all shadow-sm flex items-center justify-center space-x-1.5"
        >
          <span>✨ 啟動 DEMO 模式（免登入暢遊全功能）</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth.js';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const authStore = useAuthStore();

function handleDemoExplore() {
  authStore.toggleDemoMode(true);
  emit('close');
}

const isLogin = ref(true);
const email = ref('');
const password = ref('');
const displayName = ref('');
const errorMessage = ref('');
const loading = ref(false);

async function handleSubmit() {
  errorMessage.value = '';
  loading.value = true;
  try {
    const endpoint = isLogin.value ? '/api/v1/auth/login' : '/api/v1/auth/register';
    const payload = isLogin.value
      ? { email: email.value, password: password.value }
      : { email: email.value, password: password.value, displayName: displayName.value };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || '操作失敗');
    }

    authStore.setAuth(data.data.token, data.data.user);
    emit('close');
  } catch (err: any) {
    errorMessage.value = err.message || '發生未知錯誤';
  } finally {
    loading.value = false;
  }
}
</script>
