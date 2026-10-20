<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-admin-bg">
    <div class="w-full max-w-md admin-card p-8 border border-admin-gold/30 shadow-2xl">
      <div class="text-center mb-6">
        <div class="w-12 h-12 rounded-full border border-admin-gold mx-auto flex items-center justify-center bg-admin-gold/10 mb-3 shadow-cosmic">
          <span class="font-serif text-admin-gold font-bold text-lg">天</span>
        </div>
        <h2 class="font-serif text-2xl font-bold text-admin-gold tracking-wider">萬象天儀 · 管理中樞</h2>
        <p class="text-xs text-admin-muted mt-1">系統管理員 (ADMIN) 總控台</p>
      </div>

      <!-- 💡 DEMO 免密碼快捷登入按鈕 -->
      <div class="mb-6 p-4 rounded-xl bg-admin-gold/10 border border-admin-gold/40 text-center">
        <span class="text-[11px] text-admin-gold block mb-2 font-serif font-bold">
          ✨ DEMO 模式最高權限直通：
        </span>
        <button
          type="button"
          @click="handleDemoLogin"
          :disabled="loading"
          class="w-full py-2.5 rounded-lg font-serif text-xs font-bold bg-admin-gold text-black hover:opacity-90 shadow-md transition-all flex items-center justify-center space-x-1.5"
        >
          <span>👑 DEMO 模式一鍵登入 (最大權限 ADMIN)</span>
        </button>
      </div>

      <div class="relative flex py-2 items-center mb-4">
        <div class="flex-grow border-t border-admin-gold/20"></div>
        <span class="flex-shrink mx-3 text-[10px] text-admin-muted uppercase tracking-wider font-sans">或以帳號密碼登入</span>
        <div class="flex-grow border-t border-admin-gold/20"></div>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs text-admin-muted mb-1">管理員帳號 (信箱)</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-admin-gold/30 text-xs focus:border-admin-gold outline-none"
          />
        </div>
        <div>
          <label class="block text-xs text-admin-muted mb-1">密碼</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-admin-gold/30 text-xs focus:border-admin-gold outline-none"
          />
        </div>

        <p v-if="errorMsg" class="text-xs text-red-400 text-center">{{ errorMsg }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 rounded-lg font-serif text-xs font-semibold bg-black/40 border border-admin-gold/40 text-admin-gold hover:bg-admin-gold/10 transition-all disabled:opacity-50"
        >
          {{ loading ? '驗證中...' : '帳密驗證登入' }}
        </button>
      </form>

      <div class="mt-6 p-3 rounded-lg bg-black/40 border border-admin-gold/10 text-[11px] text-admin-muted">
        <span class="text-admin-gold font-semibold block mb-0.5">預設管理員帳號：</span>
        admin@celestial.dao / AdminPassword123!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const email = ref('admin@celestial.dao');
const password = ref('AdminPassword123!');
const errorMsg = ref('');
const loading = ref(false);

async function performLogin(targetEmail: string, targetPass: string) {
  loading.value = true;
  errorMsg.value = '';
  try {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail, password: targetPass }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || '登入失敗');
    }

    if (data.data.user.role !== 'ADMIN') {
      throw new Error('此帳號非系統管理員，拒絕登入後台');
    }

    localStorage.setItem('admin_token', data.data.token);
    localStorage.setItem('admin_user', JSON.stringify(data.data.user));
    router.push('/dashboard');
  } catch (err: any) {
    errorMsg.value = err.message || '發生錯誤';
  } finally {
    loading.value = false;
  }
}

async function handleLogin() {
  await performLogin(email.value, password.value);
}

async function handleDemoLogin() {
  localStorage.setItem('celestial_demo_mode', 'true');
  await performLogin('admin@celestial.dao', 'AdminPassword123!');
}

onMounted(() => {
  const query = route.query;
  const isDemoUrl = query.demo === '1' || query.demo === 'true';
  const isDemoStorage = localStorage.getItem('celestial_demo_mode') === 'true';

  if ((isDemoUrl || isDemoStorage) && !localStorage.getItem('admin_token')) {
    // DEMO 模式自動認證登入最高權限
    handleDemoLogin();
  }
});
</script>
