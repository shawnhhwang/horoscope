<template>
  <div class="space-y-6 font-serif">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-admin-gold/15 pb-4">
      <div>
        <div class="text-xs uppercase tracking-widest text-admin-gold font-sans font-bold mb-1">MEMBER & RBAC MANAGEMENT</div>
        <h2 class="text-2xl sm:text-3xl font-bold text-admin-gold">會員與角色權限設定</h2>
        <p class="text-xs text-admin-muted mt-1">管理全站註冊會員、新增成員、調整 VIP 資格、重設密碼與後台管理權限。</p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="openCreateUserModal"
          class="px-4 py-2 rounded-xl bg-admin-gold text-black font-bold text-xs hover:bg-yellow-400 transition-colors flex items-center space-x-1.5 shadow-cosmic cursor-pointer"
        >
          <span>👤</span>
          <span>+ 手動新增會員</span>
        </button>
        <button
          @click="fetchUsers"
          class="px-3 py-2 rounded-xl border border-admin-gold/30 text-xs text-admin-gold hover:bg-admin-gold/10 cursor-pointer"
        >
          重新整理 🔄
        </button>
      </div>
    </div>

    <!-- 訊息提示 -->
    <div v-if="statusMsg" :class="statusType === 'success' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-red-950/40 border-red-500/40 text-red-300'" class="p-4 rounded-xl border text-xs flex items-center justify-between">
      <span>{{ statusMsg }}</span>
      <button @click="statusMsg = ''" class="opacity-60 hover:opacity-100">✕</button>
    </div>

    <!-- 篩選列 -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-admin-gold/15 bg-admin-sidebar">
      <input
        v-model="search"
        @input="fetchUsers"
        type="text"
        placeholder="搜尋會員信箱或暱稱..."
        class="w-full sm:w-80 px-3.5 py-2 rounded-lg bg-black/40 border border-admin-gold/30 text-xs text-admin-text focus:border-admin-gold outline-none"
      />
      <div class="text-xs text-admin-muted">
        目前共登記 <strong class="text-admin-gold font-mono">{{ users.length }}</strong> 位會員
      </div>
    </div>

    <!-- 會員表格 -->
    <div class="rounded-xl border border-admin-gold/15 bg-admin-sidebar overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-black/50 border-b border-admin-gold/15 text-admin-gold uppercase tracking-wider text-[10px]">
            <tr>
              <th class="p-4">會員暱稱 / 信箱</th>
              <th class="p-4">權限等級</th>
              <th class="p-4">信箱認證</th>
              <th class="p-4">命盤庫存量</th>
              <th class="p-4">占卜日記數</th>
              <th class="p-4">註冊時間</th>
              <th class="p-4 text-right">會員維護操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-admin-gold/10 text-admin-text">
            <tr v-if="users.length === 0">
              <td colspan="7" class="p-8 text-center text-admin-muted">
                查無相符的會員資料
              </td>
            </tr>
            <tr v-for="user in users" :key="user.id" class="hover:bg-admin-gold/5 transition-colors">
              <td class="p-4">
                <div class="font-bold text-admin-text text-sm">{{ user.displayName }}</div>
                <div class="text-[11px] text-admin-muted font-mono">{{ user.email }}</div>
              </td>
              <td class="p-4">
                <span
                  :class="[
                    'px-2.5 py-1 rounded-full text-[10px] font-bold font-mono inline-block',
                    user.role === 'ADMIN'
                      ? 'bg-rose-950/70 text-rose-300 border border-rose-500/30'
                      : user.role === 'VIP'
                      ? 'bg-amber-950/70 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700',
                  ]"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="p-4">
                <span :class="user.emailVerified ? 'text-emerald-400' : 'text-amber-500'" class="text-[11px]">
                  {{ user.emailVerified ? '✓ 已認證' : '○ 待驗證' }}
                </span>
              </td>
              <td class="p-4 font-mono">{{ user._count?.profiles || 0 }} 份</td>
              <td class="p-4 font-mono">{{ user._count?.readings || 0 }} 則</td>
              <td class="p-4 text-admin-muted">{{ new Date(user.createdAt).toLocaleDateString() }}</td>
              <td class="p-4 text-right space-x-2 whitespace-nowrap">
                <button
                  @click="openEditUserModal(user)"
                  class="px-2.5 py-1 rounded bg-admin-gold/15 text-admin-gold hover:bg-admin-gold/30 text-[11px] cursor-pointer"
                >
                  編輯資料
                </button>
                <button
                  @click="promptResetPassword(user)"
                  class="px-2.5 py-1 rounded bg-blue-900/20 text-blue-300 hover:bg-blue-900/40 text-[11px] cursor-pointer"
                >
                  重設密碼
                </button>
                <button
                  @click="deleteUser(user)"
                  class="px-2.5 py-1 rounded bg-red-900/20 text-red-400 hover:bg-red-900/40 text-[11px] cursor-pointer"
                >
                  刪除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 彈窗：新增會員 -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
    >
      <div class="glass-panel border border-admin-gold/40 rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90dvh] overflow-y-auto space-y-4 shadow-2xl">
        <div class="flex justify-between items-center border-b border-admin-gold/20 pb-3">
          <h3 class="font-bold text-admin-gold text-base">建立新會員帳號</h3>
          <button @click="showCreateModal = false" class="text-admin-muted hover:text-white">✕</button>
        </div>

        <form @submit.prevent="submitCreateUser" class="space-y-4 text-xs">
          <div>
            <label class="block text-admin-muted mb-1">電子信箱 *</label>
            <input
              v-model="createForm.email"
              type="email"
              required
              placeholder="user@example.com"
              class="w-full px-3 py-2 rounded-lg bg-black/50 border border-admin-gold/30 text-admin-text outline-none focus:border-admin-gold"
            />
          </div>

          <div>
            <label class="block text-admin-muted mb-1">使用者暱稱 *</label>
            <input
              v-model="createForm.displayName"
              type="text"
              required
              placeholder="例如：星象求知者"
              class="w-full px-3 py-2 rounded-lg bg-black/50 border border-admin-gold/30 text-admin-text outline-none focus:border-admin-gold"
            />
          </div>

          <div>
            <label class="block text-admin-muted mb-1">設定初始密碼 *</label>
            <input
              v-model="createForm.password"
              type="password"
              required
              placeholder="至少 6 位字元"
              class="w-full px-3 py-2 rounded-lg bg-black/50 border border-admin-gold/30 text-admin-text outline-none focus:border-admin-gold"
            />
          </div>

          <div>
            <label class="block text-admin-muted mb-1">指派權限等級</label>
            <select
              v-model="createForm.role"
              class="w-full px-3 py-2 rounded-lg bg-black/50 border border-admin-gold/30 text-admin-text outline-none focus:border-admin-gold"
            >
              <option value="MEMBER">普通會員 (MEMBER)</option>
              <option value="VIP">尊榮會員 (VIP)</option>
              <option value="ADMIN">管理員 (ADMIN)</option>
            </select>
          </div>

          <div class="flex justify-end space-x-3 pt-3 border-t border-admin-gold/15">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 rounded-lg text-admin-muted hover:text-white"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-lg bg-admin-gold text-black font-bold hover:bg-yellow-400"
            >
              確認建立
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 彈窗：編輯會員 -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
    >
      <div class="glass-panel border border-admin-gold/40 rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90dvh] overflow-y-auto space-y-4 shadow-2xl">
        <div class="flex justify-between items-center border-b border-admin-gold/20 pb-3">
          <h3 class="font-bold text-admin-gold text-base">編輯會員資料</h3>
          <button @click="showEditModal = false" class="text-admin-muted hover:text-white">✕</button>
        </div>

        <form @submit.prevent="submitEditUser" class="space-y-4 text-xs">
          <div>
            <label class="block text-admin-muted mb-1">電子信箱</label>
            <input
              v-model="editForm.email"
              type="email"
              required
              class="w-full px-3 py-2 rounded-lg bg-black/50 border border-admin-gold/30 text-admin-text outline-none focus:border-admin-gold"
            />
          </div>

          <div>
            <label class="block text-admin-muted mb-1">使用者暱稱</label>
            <input
              v-model="editForm.displayName"
              type="text"
              required
              class="w-full px-3 py-2 rounded-lg bg-black/50 border border-admin-gold/30 text-admin-text outline-none focus:border-admin-gold"
            />
          </div>

          <div>
            <label class="block text-admin-muted mb-1">權限角色</label>
            <select
              v-model="editForm.role"
              class="w-full px-3 py-2 rounded-lg bg-black/50 border border-admin-gold/30 text-admin-text outline-none focus:border-admin-gold"
            >
              <option value="MEMBER">普通會員 (MEMBER)</option>
              <option value="VIP">尊榮會員 (VIP)</option>
              <option value="ADMIN">系統管理員 (ADMIN)</option>
            </select>
          </div>

          <div class="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="verified"
              v-model="editForm.emailVerified"
              class="accent-admin-gold rounded"
            />
            <label for="verified" class="text-admin-muted">信箱標記為已認證</label>
          </div>

          <div class="flex justify-end space-x-3 pt-3 border-t border-admin-gold/15">
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 rounded-lg text-admin-muted hover:text-white"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-lg bg-admin-gold text-black font-bold hover:bg-yellow-400"
            >
              更新資料
            </button>
          </div>
        </form>
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
const statusMsg = ref('');
const statusType = ref<'success' | 'error'>('success');

const showCreateModal = ref(false);
const createForm = ref({
  email: '',
  displayName: '',
  password: '',
  role: 'MEMBER',
});

const showEditModal = ref(false);
const editingUserId = ref('');
const editForm = ref({
  email: '',
  displayName: '',
  role: 'MEMBER',
  emailVerified: true,
});

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

function openCreateUserModal() {
  createForm.value = {
    email: '',
    displayName: '',
    password: '',
    role: 'MEMBER',
  };
  showCreateModal.value = true;
}

async function submitCreateUser() {
  try {
    const headers = await authStore.getAuthHeaders();
    const res = await fetch('/api/v1/admin/users', {
      method: 'POST',
      headers,
      body: JSON.stringify(createForm.value),
    });
    const data = await res.json();
    if (data.success) {
      showCreateModal.value = false;
      statusType.value = 'success';
      statusMsg.value = `會員【${createForm.value.displayName}】建立成功！`;
      fetchUsers();
    } else {
      alert(data.message || '建立會員失敗');
    }
  } catch (err: any) {
    alert(err.message || '網路通訊失敗');
  }
}

function openEditUserModal(user: any) {
  editingUserId.value = user.id;
  editForm.value = {
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    emailVerified: user.emailVerified,
  };
  showEditModal.value = true;
}

async function submitEditUser() {
  try {
    const headers = await authStore.getAuthHeaders();
    const res = await fetch(`/api/v1/admin/users/${editingUserId.value}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(editForm.value),
    });
    const data = await res.json();
    if (data.success) {
      showEditModal.value = false;
      statusType.value = 'success';
      statusMsg.value = '會員資料已更新';
      fetchUsers();
    } else {
      alert(data.message || '更新失敗');
    }
  } catch (err: any) {
    alert(err.message || '操作異常');
  }
}

async function promptResetPassword(user: any) {
  const newPass = prompt(`請輸入會員【${user.displayName}】的新密碼 (至少 6 位字元)：`, 'Password123!');
  if (!newPass) return;

  try {
    const headers = await authStore.getAuthHeaders();
    const res = await fetch(`/api/v1/admin/users/${user.id}/password`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ newPassword: newPass }),
    });
    const data = await res.json();
    if (data.success) {
      statusType.value = 'success';
      statusMsg.value = `已成功為【${user.displayName}】重設新密碼！`;
    } else {
      alert(data.message || '重設密碼失敗');
    }
  } catch (err: any) {
    alert(err.message || '操作異常');
  }
}

async function deleteUser(user: any) {
  if (!confirm(`⚠️ 確定要刪除會員【${user.displayName} (${user.email})】？此操作將同時刪除該用戶名下所有的命盤與日記記錄！`)) {
    return;
  }

  try {
    const headers = await authStore.getAuthHeaders();
    const res = await fetch(`/api/v1/admin/users/${user.id}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json();
    if (data.success) {
      statusType.value = 'success';
      statusMsg.value = `會員【${user.displayName}】已成功刪除`;
      fetchUsers();
    } else {
      alert(data.message || '刪除失敗');
    }
  } catch (err: any) {
    alert(err.message || '操作異常');
  }
}

onMounted(() => {
  fetchUsers();
});
</script>
