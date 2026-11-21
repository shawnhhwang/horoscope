<template>
  <div class="space-y-8 font-serif">
    <!-- 頂部標題與說明 -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-admin-gold/15 pb-6">
      <div>
        <div class="text-xs uppercase tracking-widest text-admin-gold font-sans font-bold mb-1">DATABASE ADMIN & AUDIT</div>
        <h2 class="text-2xl sm:text-3xl font-bold text-admin-gold">資料庫管理、唯讀防護與稽核日誌</h2>
        <p class="text-xs text-admin-muted mt-1">
          預設鎖定為 Read-Only 唯讀檢視模式；寫入、刪除與還原操作需通過二次確認並寫入不可篡改之 AdminAuditLog。
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <span
          :class="dbStats.readOnly ? 'bg-amber-950/60 border-amber-500/40 text-amber-300' : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'"
          class="px-3 py-1.5 rounded-lg border text-xs font-mono font-bold"
        >
          {{ dbStats.readOnly ? '🔒 READ-ONLY LOCKED' : '✍️ WRITE ENABLED (2FA)' }}
        </span>
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
        <span class="text-[11px] text-admin-muted">稽核紀錄數 (Audit Logs)</span>
        <div class="text-2xl font-mono font-bold text-cyan-300">{{ auditLogs.length }}</div>
        <div class="text-[10px] text-emerald-400">不可篡改操作軌跡</div>
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
              :disabled="dbStats.readOnly"
              class="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-300 hover:bg-rose-950/40 text-xs transition-colors cursor-pointer disabled:opacity-40"
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
          <h3 class="text-sm font-bold text-admin-gold">資料表資料瀏覽與受控編輯 (Table Inspector)</h3>
          <p class="text-[11px] text-admin-muted mt-0.5">
            {{ dbStats.readOnly ? '目前為唯讀鎖定狀態，僅供稽核查詢（需設定 ADMIN_DB_WRITE_ENABLED=true 始可寫入）。' : '寫入已解鎖，所有變更均須輸入二次確認代碼 CONFIRM_DB_WRITE。' }}
          </p>
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
            v-if="!dbStats.readOnly"
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
              <th v-for="col in displayColumns" :key="col" class="p-3">{{ col }}</th>
              <th v-if="!dbStats.readOnly" class="p-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-admin-gold/10 text-admin-text">
            <tr v-if="tableLoading">
              <td :colspan="displayColumns.length + 1" class="p-6 text-center text-admin-muted">載入中...</td>
            </tr>
            <tr v-else-if="tableRows.length === 0">
              <td :colspan="displayColumns.length + 1" class="p-6 text-center text-admin-muted">查無資料記錄</td>
            </tr>
            <tr v-else v-for="row in tableRows" :key="row.id" class="hover:bg-admin-gold/5 transition-colors">
              <td v-for="col in displayColumns" :key="col" class="p-3 max-w-xs truncate font-mono text-[11px]">
                {{ formatCellValue(row[col]) }}
              </td>
              <td v-if="!dbStats.readOnly" class="p-3 text-right space-x-2 whitespace-nowrap">
                <button @click="openEditModal(row)" class="px-2.5 py-1 rounded bg-admin-gold/15 text-admin-gold hover:bg-admin-gold/30 text-[11px] cursor-pointer">編輯</button>
                <button @click="deleteRow(row.id)" class="px-2.5 py-1 rounded bg-red-900/20 text-red-400 hover:bg-red-900/40 text-[11px] cursor-pointer">刪除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分頁列 -->
      <div class="flex items-center justify-between text-xs text-admin-muted pt-2">
        <span>共 {{ tableTotal }} 筆，第 {{ currentPage }} / {{ totalPages || 1 }} 頁</span>
        <div class="flex space-x-2">
          <button @click="fetchTableData(currentPage - 1)" :disabled="currentPage <= 1" class="px-3 py-1 rounded bg-black/40 border border-admin-gold/20 disabled:opacity-40">上一頁</button>
          <button @click="fetchTableData(currentPage + 1)" :disabled="currentPage >= totalPages" class="px-3 py-1 rounded bg-black/40 border border-admin-gold/20 disabled:opacity-40">下一頁</button>
        </div>
      </div>
    </div>

    <!-- 不可篡改管理稽核日誌 (AdminAuditLog) -->
    <div class="p-6 rounded-xl border border-admin-gold/15 bg-admin-sidebar space-y-4">
      <div class="flex items-center justify-between border-b border-admin-gold/10 pb-3">
        <h3 class="text-sm font-bold text-admin-gold">🛡️ 不可篡改管理稽核日誌 (AdminAuditLog)</h3>
        <button @click="fetchAuditLogs" class="text-xs text-admin-gold hover:underline">重新整理</button>
      </div>
      <div v-if="auditLogs.length === 0" class="text-xs text-admin-muted py-4 text-center">尚無寫入或高危操作稽核紀錄</div>
      <div v-else class="divide-y divide-admin-gold/10 max-h-60 overflow-y-auto text-xs">
        <div v-for="log in auditLogs" :key="log.id" class="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span class="px-2 py-0.5 rounded bg-admin-gold/15 text-admin-gold font-mono text-[10px] mr-2">{{ log.action }}</span>
            <span class="text-admin-text">{{ log.summary }}</span>
          </div>
          <div class="text-[11px] text-admin-muted font-mono">
            {{ log.adminEmail }} · {{ new Date(log.createdAt).toLocaleString() }}
          </div>
        </div>
      </div>
    </div>

    <!-- 彈窗：編輯 / 新增資料列 -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
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
            <button type="button" @click="showEditModal = false" class="px-4 py-2 rounded-lg text-admin-muted hover:text-white">取消</button>
            <button type="submit" class="px-5 py-2 rounded-lg bg-admin-gold text-black font-bold hover:bg-yellow-400">二次確認並儲存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const dbStats = ref<any>({ readOnly: true });
const backups = ref<any[]>([]);
const auditLogs = ref<any[]>([]);
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
  return Object.keys(tableRows.value[0]).slice(0, 7);
});

function formatCellValue(val: any): string {
  if (val === null || val === undefined) return '-';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

function confirmSecondaryWrite(actionLabel: string): boolean {
  const input = prompt(`⚠️ 高危資料庫操作二次確認：【${actionLabel}】\n請輸入 CONFIRM_DB_WRITE 以繼續執行：`);
  return input === 'CONFIRM_DB_WRITE';
}

async function fetchStats() {
  const headers = await authStore.getAuthHeaders();
  const res = await fetch('/api/v1/admin/database/stats', { headers });
  const data = await res.json();
  if (data.success) dbStats.value = data.data;
}

async function fetchBackups() {
  const headers = await authStore.getAuthHeaders();
  const res = await fetch('/api/v1/admin/database/backups', { headers });
  const data = await res.json();
  if (data.success) backups.value = data.data;
}

async function fetchAuditLogs() {
  const headers = await authStore.getAuthHeaders();
  const res = await fetch('/api/v1/admin/audit-logs', { headers });
  const data = await res.json();
  if (data.success) auditLogs.value = data.data;
}

async function createBackup() {
  backupLoading.value = true;
  statusMsg.value = '';
  try {
    const headers = await authStore.getAuthHeaders();
    const res = await fetch('/api/v1/admin/database/backup', { method: 'POST', headers });
    const data = await res.json();
    if (data.success) {
      statusType.value = 'success';
      statusMsg.value = `備份成功！檔案：${data.data.filename} (${data.data.sizeFormatted})`;
      fetchStats();
      fetchBackups();
      fetchAuditLogs();
    } else {
      statusType.value = 'error';
      statusMsg.value = data.message || '備份建立失敗';
    }
  } finally {
    backupLoading.value = false;
  }
}

async function restoreBackup(filename: string) {
  if (!confirmSecondaryWrite(`還原快照 ${filename}`)) return;
  const headers = await authStore.getAuthHeaders({ 'x-admin-confirm': 'CONFIRM_DB_WRITE' });
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
    fetchAuditLogs();
  } else {
    statusType.value = 'error';
    statusMsg.value = data.message || '還原失敗';
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
  } finally {
    tableLoading.value = false;
  }
}

function openAddModal() {
  isEditingRow.value = false;
  editingId.value = '';
  editFormData.value =
    currentTable.value === 'User'
      ? { email: '', displayName: '', password: 'Password123!', role: 'MEMBER', emailVerified: true }
      : currentTable.value === 'SystemInterpretation'
      ? { moduleType: 'ZIWEI', keyCode: '', category: 'STAR', title: '', contentRich: '' }
      : {};
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
  if (!confirmSecondaryWrite(`${isEditingRow.value ? '更新' : '新增'} ${currentTable.value}`)) return;
  const headers = await authStore.getAuthHeaders({ 'x-admin-confirm': 'CONFIRM_DB_WRITE' });
  const endpoint = isEditingRow.value
    ? `/api/v1/admin/database/tables/${currentTable.value}/${editingId.value}`
    : `/api/v1/admin/database/tables/${currentTable.value}`;
  const res = await fetch(endpoint, {
    method: isEditingRow.value ? 'PUT' : 'POST',
    headers,
    body: JSON.stringify(editFormData.value),
  });
  const data = await res.json();
  if (data.success) {
    showEditModal.value = false;
    fetchTableData(currentPage.value);
    fetchStats();
    fetchAuditLogs();
  } else {
    alert(data.message || '儲存失敗');
  }
}

async function deleteRow(id: string) {
  if (!confirmSecondaryWrite(`刪除 ${currentTable.value} (${id})`)) return;
  const headers = await authStore.getAuthHeaders({ 'x-admin-confirm': 'CONFIRM_DB_WRITE' });
  const res = await fetch(`/api/v1/admin/database/tables/${currentTable.value}/${id}`, {
    method: 'DELETE',
    headers,
  });
  const data = await res.json();
  if (data.success) {
    fetchTableData(currentPage.value);
    fetchStats();
    fetchAuditLogs();
  } else {
    alert(data.message || '刪除失敗');
  }
}

onMounted(() => {
  fetchStats();
  fetchBackups();
  fetchTableData(1);
  fetchAuditLogs();
});
</script>
