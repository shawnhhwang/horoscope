import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isDemo?: boolean;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('celestial_token'));
  const realUser = ref<UserProfile | null>(null);

  // DEMO 模式開關：優先參照環境變數 VITE_DEMO_MODE 與伺服端配置
  const envDemo = import.meta.env.VITE_DEMO_MODE !== 'false';
  const serverDemoEnabled = ref<boolean>(true);

  const isDemoMode = ref<boolean>(
    localStorage.getItem('celestial_demo_mode') === null
      ? envDemo
      : localStorage.getItem('celestial_demo_mode') === 'true' && envDemo
  );

  // DEMO 尊榮總控帳號（預設賦予系統最大權限 ADMIN）
  const demoUser: UserProfile = {
    id: 'demo-admin-id',
    email: 'admin@celestial.dao',
    displayName: '系統管理員 (DEMO 最高權限)',
    role: 'ADMIN',
    isDemo: true,
  };

  // 當前生效用戶：真實登入者優先；若未登入且處於 DEMO 模式則自動賦予 ADMIN 最大權限
  const user = computed<UserProfile | null>(() => {
    if (realUser.value) return realUser.value;
    if (isDemoMode.value) return demoUser;
    return null;
  });

  const isAuthenticated = computed(() => !!user.value);

  // DEMO 模式自動獲取真實有效的 ADMIN Token，確保後端 API 與後台無縫通訊
  async function ensureDemoToken() {
    if (isDemoMode.value && !realUser.value) {
      try {
        const res = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@celestial.dao', password: 'AdminPassword123!' }),
        });
        const data = await res.json();
        if (data.success && data.data?.token) {
          token.value = data.data.token;
          localStorage.setItem('celestial_token', data.data.token);
          localStorage.setItem('admin_token', data.data.token);
          localStorage.setItem('admin_user', JSON.stringify(data.data.user));
        }
      } catch (err) {
        // 靜默處理離線
      }
    }
  }

  function toggleDemoMode(targetState?: boolean) {
    if (typeof targetState === 'boolean') {
      isDemoMode.value = targetState;
    } else {
      isDemoMode.value = !isDemoMode.value;
    }
    localStorage.setItem('celestial_demo_mode', String(isDemoMode.value));

    if (isDemoMode.value) {
      ensureDemoToken();
    } else if (!realUser.value) {
      token.value = null;
      localStorage.removeItem('celestial_token');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
  }

  function setAuth(newToken: string, newUser: UserProfile) {
    token.value = newToken;
    realUser.value = newUser;
    localStorage.setItem('celestial_token', newToken);
    localStorage.setItem('celestial_user', JSON.stringify(newUser));
  }

  async function syncServerConfig() {
    try {
      const res = await fetch('/api/v1/auth/config');
      const data = await res.json();
      if (data.success && typeof data.data?.demoMode === 'boolean') {
        serverDemoEnabled.value = data.data.demoMode;
        if (!data.data.demoMode) {
          isDemoMode.value = false;
          localStorage.setItem('celestial_demo_mode', 'false');
        }
      }
    } catch {
      // 離線容錯
    }
  }

  function loadAuth() {
    const savedToken = localStorage.getItem('celestial_token');
    const savedUser = localStorage.getItem('celestial_user');
    if (savedToken && savedUser) {
      token.value = savedToken;
      realUser.value = JSON.parse(savedUser);
    }
    const savedDemo = localStorage.getItem('celestial_demo_mode');
    if (savedDemo !== null) {
      isDemoMode.value = savedDemo === 'true' && envDemo;
    }

    syncServerConfig();

    if (isDemoMode.value && !realUser.value) {
      ensureDemoToken();
    }
  }

  function logout() {
    token.value = null;
    realUser.value = null;
    localStorage.removeItem('celestial_token');
    localStorage.removeItem('celestial_user');
  }

  async function getAuthHeaders(): Promise<Record<string, string>> {
    if (isDemoMode.value && !token.value) {
      await ensureDemoToken();
    }
    const currentToken =
      token.value ||
      localStorage.getItem('celestial_token') ||
      localStorage.getItem('admin_token') ||
      'demo-admin-token';

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${currentToken}`,
      'x-demo-mode': isDemoMode.value ? 'true' : 'false',
    };
  }

  return {
    token,
    user,
    realUser,
    isDemoMode,
    serverDemoEnabled,
    isAuthenticated,
    ensureDemoToken,
    syncServerConfig,
    getAuthHeaders,
    toggleDemoMode,
    setAuth,
    loadAuth,
    logout,
  };
});
