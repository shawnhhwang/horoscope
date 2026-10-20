<template>
  <div class="space-y-8 font-serif">
    <!-- 頂部標題與說明 -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-admin-gold/15 pb-6">
      <div>
        <div class="text-xs uppercase tracking-widest text-admin-gold font-sans font-bold mb-1">DATABASE ADMIN & BACKUP</div>
        <h2 class="text-2xl sm:text-3xl font-bold text-admin-gold">資料庫管理、即時編輯與備份還原</h2>
        <p class="text-xs text-admin-muted mt-1">
          支援 SQLite 實體資料庫檔案狀態監控、結構表單資料維護、一鍵快照備份與歷史封存檔還原。
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="createBackup"
          :disabled="backupLoading"
          class="px-4 py-2 rounded-xl bg-admin-gold text-black font-bold text-xs hover:bg-yellow-400 transition-colors flex items-center space-x-2 shadow-cosmic cursor-pointer"
        >
          <span>💾</span>
          <span>{{ backupLoading ? '備份中...' : '建立即時備份快照' }}</span>
        </button>
      </div>
    </div>

    <!-- 訊息提示 -->
    <div v-if="statusMsg" :class="statusType === 'success' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-red-950/40 border-red-500/40 text-red-300'" class="p-4 rounded-xl border text-xs flex items-center justify-between">
      <span>{{ statusMsg }}</span>
      <button @click="statusMsg = ''" class="opacity-60 hover:opacity-100">✕</button>
    </div>

    <!-- 資料庫概覽指標 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="p-5 rounded-xl border border-admin-gold/15 bg-admin-sidebar space-y-1">
        <span class="text-[11px] text-admin-muted">資料庫檔案名稱</span>
        <div class="text-lg font-mono font-bold text-admin-gold truncate">{{ dbStats.dbName || 'dev.db' }}</div>
        <div class="text-[10px] text-admin-muted">容量大小：{{ dbStats.fileSizeFormatted || '0 KB' }}</div>
      </div>
      <div class="p-5 rounded-xl border border-admin-gold/15 bg-admin-sidebar space-y-1">
        <span class="text-[11px] text-admin-muted">總資料筆數 (Total Rows)</span>
        <div class="text-2xl font-mono font-bold text-admin-text">{{ dbStats.totalRecords || 0 }}</div>
        <div class="text-[10px] text-admin-muted">4 個核心業務資料表</div>
      </div>
      <div class="p-5 rounded-xl border border-admin-gold/15 bg-admin-sidebar space-y-1">
        <span class="text-[11px] text-admin-muted">歷史備份檔案數</span>
        <div class="text-2xl font-mono font-bold text-emerald-400">{{ backups.length }}</div>
        <div class="text-[10px] text-admin-muted">存儲於 prisma/backups/</div>
      </div>
      <div class="p-5 rounded-xl border border-admin-gold/15 bg-admin-sidebar space-y-1">
        <span class="text-[11px] text-admin-muted">最後檔案修改時間</span>
        <div class="text-xs font-mono text-admin-text truncate">{{ dbStats.fileModified ? new Date(dbStats.fileModified).toLocaleString() : '即時' }}</div>
        <div class="text-[10px] text-emerald-400">連線運作正常</div>
      </div>
    </div>

    <!-- 備份歷史清單與還原 -->
    <div class="p-6 rounded-xl border border-admin-gold/15 bg-admin-sidebar space-y-4">
      <div class="flex items-center justify-between border-b border-admin-gold/10 pb-3">
        <div class="flex items-center space-x-2">
          <span class="text-base">📦</span>
          <h3 class="text-sm font-bold text-admin-gold">資料庫備份檔案清單 (Database Snapshots)</h3>
        </div>
        <span class="text-xs text-admin-muted">共 {{ backups.length }} 份備份</span>
      </div>

      <div v-if="backups.length === 0" class="text-center py-6 text-xs text-admin-muted">
        目前尚無本機備份快照，點擊右上角「建立即時備份快照」即可產生第一份保護檔案。
      </div>

      <div v-else class="divide-y divide-admin-gold/10 max-h-56 overflow-y-auto">
        <div
          v-for="b in backups"
          :key="b.filename"
          class="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        >
          <div class="space-y-0.5">
            <div class="font-mono text-admin-text font-bold">{{ b.filename }}</div>
            <div class="text-[11px] text-admin-muted flex items-center space-x-3">
              <span>大小：{{ b.sizeFormatted }}</span>
              <span>建立時間：{{ new Date(b.createdAt).toLocaleString() }}</span>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <a
              :href="`/api/v1/admin/database/download-backup/${b.filename}`"
              target="_blank"
              class="px-3 py-1.5 rounded-lg border border-admin-gold/30 text-admin-gold hover:bg-admin-gold/10 text-xs transition-colors flex items-center space-x-1"
            >
              <span>⬇️ 下載 .db</span>
            </a>
            <button
              @click="restoreBackup(b.filename)"
              class="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-300 hover:bg-rose-950/40 text-xs transition-colors cursor-pointer"
            >
              🔄 還原快照
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 資料表結構內容即時檢視與編輯器 -->
    <div class="p-6 rounded-xl border border-admin-gold/15 bg-admin-sidebar space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-admin-gold/10 pb-4">
        <div>
          <h3 class="text-sm font-bold text-admin-gold">資料表資料瀏覽與線上編輯 (Table Inspector & Editor)</h3>
          <p class="text-[11px] text-admin-muted mt-0.5">可直接檢索、新增、編輯或刪除資料庫中各資料表記錄。</p>
        </div>

        <div class="flex items-center space-x-3">
          <input
            v-model="searchQuery"
            @input="fetchTableData(1)"
            type="text"
            placeholder="搜尋關鍵字..."
            class="px-3 py-1.5 rounded-lg bg-black/40 border border-admin-gold/20 text-xs text-admin-text outline-none focus:border-admin-gold"
          />
          <button
            @click="openAddModal"
            class="px-3.5 py-1.5 rounded-lg bg-admin-gold/20 border border-admin-gold text-admin-gold hover:bg-admin-gold hover:text-black font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            + 新增資料
          </button>
        </div>
      </div>

      <!-- 資料表切換 TAB -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="t in availableTables"
          :key="t.key"
          @click="selectTable(t.key)"
          :class="currentTable === t.key ? 'bg-admin-gold text-black font-bold' : 'bg-black/30 text-admin-muted hover:text-white'"
          class="px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
        >
          {{ t.label }} ({{ dbStats.tableCounts?.[t.key] || 0 }})
        </button>
      </div>

      <!-- 資料表格 -->
      <div class="overflow-x-auto rounded-lg border border-admin-gold/10 bg-black/30">
        <table class="w-full text-left text-xs">
          <thead class="bg-black/50 text-admin-gold uppercase tracking-wider text-[10px] border-b border-admin-gold/20">
            <tr>
              <th v-for="col in displayColumns" :key="col" class="p-3">
                {{ col }}
              </th>
              <th class="p-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-admin-gold/10 text-admin-text">
            <tr v-if="tableLoading">
              <td :colspan="displayColumns.length + 1" class="p-6 text-center text-admin-muted">
                載入中...
              </td>
            </tr>
            <tr v-else-if="tableRows.length === 0">
              <td :colspan="displayColumns.length + 1" class="p-6 text-center text-admin-muted">
                查無資料記錄
              </td>
            </tr>
            <tr
              v-else
              v-for="row in tableRows"
              :key="row.id"
              class="hover:bg-admin-gold/5 transition-colors"
            >
              <td v-for="col in displayColumns" :key="col" class="p-3 max-w-xs truncate font-mono text-[11px]">
                {{ formatCellValue(row[col]) }}
              </td>
              <td class="p-3 text-right space-x-2 whitespace-nowrap">
                <button
                  @click="openEditModal(row)"
                  class="px-2.5 py-1 rounded bg-admin-gold/15 text-admin-gold hover:bg-admin-gold/30 text-[11px] cursor-pointer"
                >
                  編輯
                </button>
                <button
                  @click="deleteRow(row.id)"
                  class="px-2.5 py-1 rounded bg-red-900/20 text-red-400 hover:bg-red-900/40 text-[11px] cursor-pointer"
                >
                  刪除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分頁列 -->
      <div class="flex items-center justify-between text-xs text-admin-muted pt-2">
        <span>共 {{ tableTotal }} 筆，第 {{ currentPage }} / {{ totalPages || 1 }} 頁</span>
        <div class="flex space-x-2">
          <button
            @click="fetchTableData(currentPage - 1)"
            :disabled="currentPage <= 1"
            class="px-3 py-1 rounded bg-black/40 border border-admin-gold/20 disabled:opacity-40"
          >
            上一頁
          </button>
          <button
            @click="fetchTableData(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="px-3 py-1 rounded bg-black/40 border border-admin-gold/20 disabled:opacity-40"
          >
            下一頁
          </button>
        </div>
      </div>
    </div>

    <!-- 彈窗：編輯 / 新增資料列 -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
    >
      <div class="glass-panel border border-admin-gold/40 rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[90dvh] overflow-y-auto space-y-4 shadow-2xl">
        <div class="flex justify-between items-center border-b border-admin-gold/20 pb-3">
          <h3 class="font-bold text-admin-gold text-base">
            {{ isEditingRow ? `編輯 ${currentTable} 記錄 (ID: ${editingId})` : `新增 ${currentTable} 記錄` }}
          </h3>
          <button @click="showEditModal = false" class="text-admin-muted hover:text-white">✕</button>
        </div>

        <form @submit.prevent="saveRowData" class="space-y-4 text-xs">
          <div v-for="(val, field) in editFormData" :key="field" class="space-y-1">
            <label class="block text-admin-muted font-mono">{{ field }}</label>
            <textarea
              v-if="typeof val === 'string' && val.length > 50"
              v-model="editFormData[field]"
              rows="4"
              class="w-full px-3 py-2 rounded-lg bg-black/50 border border-admin-gold/30 text-admin-text font-mono text-xs outline-none focus:border-admin-gold"
            ></textarea>
            <input
              v-else
              v-model="editFormData[field]"
              type="text"
              class="w-full px-3 py-2 rounded-lg bg-black/50 border border-admin-gold/30 text-admin-text font-mono text-xs outline-none focus:border-admin-gold"
            />
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t border-admin-gold/15">
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
              儲存變更
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const dbStats = ref<any>({});
const backups = ref<any[]>([]);
const backupLoading = ref(false);
const statusMsg = ref('');
const statusType = ref<'success' | 'error'>('success');

const availableTables = [
  { key: 'User', label: '會員帳號 (User)' },
  { key: 'BirthProfile', label: '出生命盤 (BirthProfile)' },
  { key: 'ReadingRecord', label: '占卜紀錄 (ReadingRecord)' },
  { key: 'SystemInterpretation', label: 'RAG 解讀辭庫 (SystemInterpretation)' },
];

const currentTable = ref('User');
const searchQuery = ref('');
const tableLoading = ref(false);
const tableRows = ref<any[]>([]);
const tableTotal = ref(0);
const currentPage = ref(1);
const pageSize = 15;
const totalPages = computed(() => Math.ceil(tableTotal.value / pageSize));

const showEditModal = ref(false);
const isEditingRow = ref(false);
const editingId = ref('');
const editFormData = ref<Record<string, any>>({});

const displayColumns = computed(() => {
  if (tableRows.value.length === 0) return ['id'];
  const sample = tableRows.value[0];
  return Object.keys(sample).slice(0, 7);
});

function formatCellValue(val: any): string {
  if (val === null || val === undefined) return '-';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

async function fetchStats() {
  try {
    const headers = await authStore.getAuthHeaders();
    const res = await fetch('/api/v1/admin/database/stats', { headers });
    const data = await res.json();
    if (data.success) {
      dbStats.value = data.data;
    }
  } catch (err) {
    console.error('Fetch DB stats error:', err);
  }
}

async function fetchBackups() {
  try {
    const headers = await authStore.getAuthHeaders();
    const res = await fetch('/api/v1/admin/database/backups', { headers });
    const data = await res.json();
    if (data.success) {
      backups.value = data.data;
    }
  } catch (err) {
    console.error('Fetch backups error:', err);
  }
}

async function createBackup() {
  backupLoading.value = true;
  statusMsg.value = '';
  try {
    const headers = await authStore.getAuthHeaders();
    const res = await fetch('/api/v1/admin/database/backup', {
      method: 'POST',
      headers,
    });
    const data = await res.json();
    if (data.success) {
      statusType.value = 'success';
      statusMsg.value = `備份成功！檔案：${data.data.filename} (${data.data.sizeFormatted})`;
      fetchStats();
      fetchBackups();
    } else {
      statusType.value = 'error';
      statusMsg.value = data.message || '備份建立失敗';
    }
  } catch (err: any) {
    statusType.value = 'error';
    statusMsg.value = err.message || '備份通訊異常';
  } finally {
    backupLoading.value = false;
  }
}

async function restoreBackup(filename: string) {
  if (!confirm(`⚠️ 警告：確定要將資料庫還原至快照【${filename}】？此操作將覆蓋現有資料（系統會自動保留一份還原前備份）`)) {
    return;
  }

  try {
    const headers = await authStore.getAuthHeaders();
    const res = await fetch('/api/v1/admin/database/restore', {
      method: 'POST',
      headers,
      body: JSON.stringify({ filename }),
    });
    const data = await res.json();
    if (data.success) {
      statusType.value = 'success';
      statusMsg.value = data.message;
      fetchStats();
      fetchTableData(1);
    } else {
      statusType.value = 'error';
      statusMsg.value = data.message || '還原失敗';
    }
  } catch (err: any) {
    statusType.value = 'error';
    statusMsg.value = err.message || '還原通訊異常';
  }
}

function selectTable(key: string) {
  currentTable.value = key;
  searchQuery.value = '';
  fetchTableData(1);
}

async function fetchTableData(page = 1) {
  tableLoading.value = true;
  currentPage.value = page;
  try {
    const headers = await authStore.getAuthHeaders();
    const url = new URL(`/api/v1/admin/database/tables/${currentTable.value}`, window.location.origin);
    url.searchParams.set('page', String(page));
    url.searchParams.set('pageSize', String(pageSize));
    if (searchQuery.value) url.searchParams.set('search', searchQuery.value);

    const res = await fetch(url.toString(), { headers });
    const data = await res.json();
    if (data.success) {
      tableRows.value = data.data.rows;
      tableTotal.value = data.data.total;
    }
  } catch (err) {
    console.error('Fetch table data error:', err);
  } finally {
    tableLoading.value = false;
  }
}

function openAddModal() {
  isEditingRow.value = false;
  editingId.value = '';
  if (currentTable.value === 'User') {
    editFormData.value = {
      email: '',
      displayName: '',
      password: 'Password123!',
      role: 'MEMBER',
      emailVerified: true,
    };
  } else if (currentTable.value === 'SystemInterpretation') {
    editFormData.value = {
      moduleType: 'ZIWEI',
      keyCode: '',
      category: 'STAR',
      title: '',
      contentRich: '',
    };
  } else {
    editFormData.value = {};
  }
  showEditModal.value = true;
}

function openEditModal(row: any) {
  isEditingRow.value = true;
  editingId.value = row.id;
  const clone = { ...row };
  delete clone.id;
  delete clone.createdAt;
  delete clone.updatedAt;
  delete clone.passwordHash;
  editFormData.value = clone;
  showEditModal.value = true;
}

async function saveRowData() {
  try {
    const headers = await authStore.getAuthHeaders();
    const endpoint = isEditingRow.value
      ? `/api/v1/admin/database/tables/${currentTable.value}/${editingId.value}`
      : `/api/v1/admin/database/tables/${currentTable.value}`;
    const method = isEditingRow.value ? 'PUT' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers,
      body: JSON.stringify(editFormData.value),
    });
    const data = await res.json();
    if (data.success) {
      showEditModal.value = false;
      fetchTableData(currentPage.value);
      fetchStats();
    } else {
      alert(data.message || '儲存失敗');
    }
  } catch (err: any) {
    alert(err.message || '操作異常');
  }
}

async function deleteRow(id: string) {
  if (!confirm('確認刪除此筆記錄？此操作無法撤銷。')) return;
  try {
    const headers = await authStore.getAuthHeaders();
    const res = await fetch(`/api/v1/admin/database/tables/${currentTable.value}/${id}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json();
    if (data.success) {
      fetchTableData(currentPage.value);
      fetchStats();
    } else {
      alert(data.message || '刪除失敗');
    }
  } catch (err: any) {
    alert(err.message || '通訊異常');
  }
}

onMounted(() => {
  fetchStats();
  fetchBackups();
  fetchTableData(1);
});
</script>
