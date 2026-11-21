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

  // DEMO 體驗訪客帳號（最小權限原則：前台僅賦予一般會員權限，管理權限隔離於獨立後台）
  const demoUser: UserProfile = {
    id: 'demo-visitor-id',
    email: 'demo-visitor@celestial.dao',
    displayName: '體驗訪客 (DEMO)',
    role: 'MEMBER',
    isDemo: true,
  };

  // 當前生效用戶：真實登入者優先；若未登入且處於 DEMO 模式則賦予訪客權限
  const user = computed<UserProfile | null>(() => {
    if (realUser.value) return realUser.value;
    if (isDemoMode.value) return demoUser;
    return null;
  });

  const isAuthenticated = computed(() => !!user.value);

  // DEMO 模式不再於前台自動取得或快取管理員 Token
  async function ensureDemoToken() {
    return;
  }

  function toggleDemoMode(targetState?: boolean) {
    if (!serverDemoEnabled.value) {
      isDemoMode.value = false;
      localStorage.setItem('celestial_demo_mode', 'false');
      return;
    }
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
          if (!realUser.value) {
            token.value = null;
            localStorage.removeItem('celestial_token');
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
          }
        }
      }
    } catch {
      // 離線容錯
    }
  }

  async function loadAuth() {
    const savedToken = localStorage.getItem('celestial_token');
    const savedUser = localStorage.getItem('celestial_user');
    if (savedToken && savedUser) {
      try {
        token.value = savedToken;
        realUser.value = JSON.parse(savedUser);
      } catch {
        localStorage.removeItem('celestial_token');
        localStorage.removeItem('celestial_user');
      }
    }
    const savedDemo = localStorage.getItem('celestial_demo_mode');
    if (savedDemo !== null) {
      isDemoMode.value = savedDemo === 'true' && envDemo;
    }

    await syncServerConfig();

    if (isDemoMode.value && serverDemoEnabled.value && !realUser.value) {
      await ensureDemoToken();
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
    const currentToken = token.value || localStorage.getItem('celestial_token') || '';

    return {
      'Content-Type': 'application/json',
      ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
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
