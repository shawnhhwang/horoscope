<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="font-serif text-2xl font-bold text-admin-gold">會員與角色權限管理</h2>
        <p class="text-xs text-admin-muted mt-1">管理全站註冊會員、調整 VIP 尊榮資格與後台管理權限</p>
      </div>
      <button @click="fetchUsers" class="px-3 py-1.5 rounded-lg border border-admin-gold/30 text-xs text-admin-gold hover:bg-admin-gold/10">
        重新整理
      </button>
    </div>

    <!-- 搜尋框 -->
    <div class="admin-card p-4">
      <input
        v-model="search"
        @input="fetchUsers"
        type="text"
        placeholder="搜尋會員信箱或暱稱..."
        class="w-full sm:w-80 px-3.5 py-2 rounded-lg bg-black/40 border border-admin-gold/30 text-xs focus:border-admin-gold outline-none"
      />
    </div>

    <!-- 會員表格 -->
    <div class="admin-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-black/50 border-b border-admin-gold/15 text-admin-muted font-serif uppercase tracking-wider">
            <tr>
              <th class="p-4">會員暱稱 / 信箱</th>
              <th class="p-4">當前權限角色</th>
              <th class="p-4">命盤庫存量</th>
              <th class="p-4">占卜測算紀錄</th>
              <th class="p-4">註冊時間</th>
              <th class="p-4 text-right">角色調整</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-admin-gold/10">
            <tr v-for="user in users" :key="user.id" class="hover:bg-admin-card/50 transition-colors">
              <td class="p-4">
                <div class="font-bold text-admin-text">{{ user.displayName }}</div>
                <div class="text-[11px] text-admin-muted">{{ user.email }}</div>
              </td>
              <td class="p-4">
                <span
                  :class="[
                    'px-2.5 py-1 rounded-full text-[10px] font-bold font-mono',
                    user.role === 'ADMIN'
                      ? 'bg-rose-950/70 text-rose-300 border border-rose-500/30'
                      : user.role === 'VIP'
                      ? 'bg-amber-950/70 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-300',
                  ]"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="p-4 font-mono">{{ user._count?.profiles || 0 }} 份</td>
              <td class="p-4 font-mono">{{ user._count?.readings || 0 }} 次</td>
              <td class="p-4 text-admin-muted">{{ new Date(user.createdAt).toLocaleDateString() }}</td>
              <td class="p-4 text-right space-x-2">
                <button
                  v-if="user.role !== 'VIP'"
                  @click="updateRole(user.id, 'VIP')"
                  class="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px]"
                >
                  升級為 VIP
                </button>
                <button
                  v-if="user.role !== 'MEMBER'"
                  @click="updateRole(user.id, 'MEMBER')"
                  class="px-2.5 py-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 text-[10px]"
                >
                  降為普通會員
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const search = ref('');
const users = ref<any[]>([]);

async function fetchUsers() {
  try {
    const url = new URL('/api/v1/admin/users', window.location.origin);
    if (search.value) url.searchParams.set('search', search.value);

    const headers = await authStore.getAuthHeaders();
    const res = await fetch(url.toString(), {
      headers,
    });
    const data = await res.json();
    if (data.success) {
      users.value = data.data;
    }
  } catch (err) {
    console.error('Fetch users failed:', err);
  }
}

async function updateRole(userId: string, newRole: string) {
  try {
    const headers = await authStore.getAuthHeaders();
    const res = await fetch(`/api/v1/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ role: newRole }),
    });
    const data = await res.json();
    if (data.success) {
      fetchUsers();
    }
  } catch (err) {
    alert('更新角色失敗');
  }
}

onMounted(() => {
  fetchUsers();
});
</script>
