import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface AdminUserProfile {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export const useAuthStore = defineStore('admin-auth', () => {
  const token = ref<string | null>(localStorage.getItem('admin_token'));
  const user = ref<AdminUserProfile | null>(
    (() => {
      try {
        const raw = localStorage.getItem('admin_user');
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })()
  );
  const serverDemoEnabled = ref<boolean>(false);
  const isDemoMode = ref<boolean>(localStorage.getItem('celestial_demo_mode') === 'true');

  const isAuthenticated = computed(() => Boolean(token.value && user.value?.role === 'ADMIN'));

  async function syncServerConfig() {
    try {
      const res = await fetch('/api/v1/auth/config');
      const data = await res.json();
      if (data.success && typeof data.data?.demoMode === 'boolean') {
        serverDemoEnabled.value = data.data.demoMode;
        if (!data.data.demoMode) {
          isDemoMode.value = false;
        }
      }
    } catch {
      // ignore offline
    }
  }

  async function ensureDemoToken() {
    await syncServerConfig();
    if (serverDemoEnabled.value && isDemoMode.value && !token.value) {
      try {
        const res = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@celestial.dao', password: 'AdminPassword123!' }),
        });
        const data = await res.json();
        if (data.success && data.data?.token) {
          token.value = data.data.token;
          user.value = data.data.user;
          localStorage.setItem('admin_token', data.data.token);
          localStorage.setItem('admin_user', JSON.stringify(data.data.user));
        }
      } catch {
        // ignore
      }
    }
  }

  function setAuth(newToken: string, newUser: AdminUserProfile) {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem('admin_token', newToken);
    localStorage.setItem('admin_user', JSON.stringify(newUser));
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }

  async function getAuthHeaders(extra: Record<string, string> = {}): Promise<Record<string, string>> {
    const currentToken = token.value || localStorage.getItem('admin_token') || '';
    return {
      'Content-Type': 'application/json',
      ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
      ...extra,
    };
  }

  return {
    token,
    user,
    isDemoMode,
    serverDemoEnabled,
    isAuthenticated,
    syncServerConfig,
    ensureDemoToken,
    setAuth,
    logout,
    getAuthHeaders,
  };
});
