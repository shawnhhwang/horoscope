<template>
  <div class="space-y-6 font-serif">
    <!-- 頂部標題與快捷操作 -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-admin-gold/15 pb-4">
      <div>
        <div class="text-xs uppercase tracking-widest text-admin-gold font-sans font-bold mb-1">RAG KNOWLEDGE & INTERPRETATIONS</div>
        <h2 class="text-2xl sm:text-3xl font-bold text-admin-gold">RAG 領域知識庫與解讀詞條 (CMS)</h2>
        <p class="text-xs text-admin-muted mt-1">維護 8 大命理體系權威典籍詞庫、支援即時 RAG 檢索調試與 JSON 批次匯入匯出。</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button
          @click="openRagTestModal"
          class="px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 font-bold text-xs hover:bg-purple-900/60 transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
        >
          <span>🧪</span>
          <span>RAG 檢索調試器</span>
        </button>
        <button
          @click="exportRagJson"
          class="px-3.5 py-2 rounded-xl border border-admin-gold/30 text-admin-gold hover:bg-admin-gold/10 text-xs transition-colors flex items-center space-x-1 cursor-pointer"
        >
          <span>⬇️</span>
          <span>匯出 JSON</span>
        </button>
        <button
          @click="showImportModal = true"
          class="px-3.5 py-2 rounded-xl border border-admin-gold/30 text-admin-gold hover:bg-admin-gold/10 text-xs transition-colors flex items-center space-x-1 cursor-pointer"
        >
          <span>⬆️</span>
          <span>批次匯入</span>
        </button>
        <button
          @click="openCreateModal"
          class="px-4 py-2 rounded-xl bg-admin-gold text-black font-bold text-xs hover:bg-yellow-400 shadow-cosmic transition-all cursor-pointer"
        >
          + 新增詞條
        </button>
      </div>
    </div>

    <!-- 訊息提示 -->
    <div v-if="statusMsg" :class="statusType === 'success' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-red-950/40 border-red-500/40 text-red-300'" class="p-4 rounded-xl border text-xs flex items-center justify-between">
      <span>{{ statusMsg }}</span>
      <button @click="statusMsg = ''" class="opacity-60 hover:opacity-100">✕</button>
    </div>

    <!-- 篩選器與搜尋列 -->
    <div class="rounded-xl border border-admin-gold/15 bg-admin-sidebar p-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="mod in modules"
          :key="mod.value"
          @click="selectedModule = mod.value; fetchItems()"
          :class="[
            'px-3.5 py-1.5 rounded-lg text-xs font-serif transition-colors cursor-pointer',
            selectedModule === mod.value ? 'bg-admin-gold text-black font-bold' : 'bg-black/40 text-admin-muted hover:text-admin-text',
          ]"
        >
          {{ mod.label }}
        </button>
      </div>

      <div class="w-full sm:w-64">
        <input
          v-model="searchQuery"
          @input="fetchItems"
          type="text"
          placeholder="搜尋關鍵字或代碼..."
          class="w-full px-3.5 py-1.5 rounded-lg bg-black/40 border border-admin-gold/20 text-xs text-admin-text focus:border-admin-gold outline-none"
        />
      </div>
    </div>

    <!-- 辭庫列表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="item in items"
        :key="item.id"
        class="rounded-xl border border-admin-gold/15 bg-admin-sidebar p-5 flex flex-col justify-between hover:border-admin-gold/40 transition-colors"
      >
        <div>
          <div class="flex justify-between items-start mb-2">
            <span class="text-[10px] px-2 py-0.5 rounded bg-admin-gold/15 text-admin-gold font-mono">
              {{ item.keyCode }}
            </span>
            <span class="text-xs text-admin-muted">{{ item.moduleType }}</span>
          </div>
          <h4 class="font-serif text-base font-bold text-admin-text mb-2">{{ item.title }}</h4>
          <p class="text-xs text-admin-muted leading-relaxed line-clamp-3 mb-4">{{ item.contentRich }}</p>
        </div>

        <div class="flex justify-between items-center border-t border-admin-gold/10 pt-3 text-xs">
          <span class="text-[11px] text-admin-muted">{{ item.category }}</span>
          <div class="space-x-2">
            <button @click="editItem(item)" class="text-admin-gold hover:underline cursor-pointer">編輯</button>
            <button @click="deleteItem(item.id)" class="text-red-400 hover:underline cursor-pointer">刪除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 彈窗：新增/編輯辭條 -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div class="glass-panel border border-admin-gold/40 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
        <div class="flex justify-between items-center border-b border-admin-gold/20 pb-3">
          <h3 class="font-serif text-lg font-bold text-admin-gold">
            {{ isEditing ? '編輯 RAG 辭庫詞條' : '新增 RAG 命理詞條' }}
          </h3>
          <button @click="showModal = false" class="text-admin-muted hover:text-white">✕</button>
        </div>

        <form @submit.prevent="saveModalItem" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-admin-muted mb-1">所屬模組</label>
              <select v-model="form.moduleType" class="w-full px-3 py-2 rounded bg-black/50 border border-admin-gold/30 text-xs text-white">
                <option value="ZIWEI">紫微斗數 (ZIWEI)</option>
                <option value="BAZI">四柱八字 (BAZI)</option>
                <option value="ICHING">周易卜卦 (ICHING)</option>
                <option value="TAROT">塔羅牌義 (TAROT)</option>
                <option value="WESTERN_NATAL">西洋星盤 (WESTERN)</option>
                <option value="QIZHENG">七政四餘 (QIZHENG)</option>
                <option value="NAME">易經姓名 (NAME)</option>
                <option value="ALMANAC">通勝黃曆 (ALMANAC)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-admin-muted mb-1">分類標籤 (Category)</label>
              <input v-model="form.category" type="text" placeholder="例如 STAR, PALACE" required class="w-full px-3 py-2 rounded bg-black/50 border border-admin-gold/30 text-xs text-white" />
            </div>
          </div>

          <div>
            <label class="block text-xs text-admin-muted mb-1">唯一識別代碼 (KeyCode)</label>
            <input v-model="form.keyCode" type="text" placeholder="例如 ZIWEI_TIANJI_LU" :disabled="isEditing" required class="w-full px-3 py-2 rounded bg-black/50 border border-admin-gold/30 text-xs text-white font-mono disabled:opacity-50" />
          </div>

          <div>
            <label class="block text-xs text-admin-muted mb-1">詞條標題</label>
            <input v-model="form.title" type="text" placeholder="例如 天機星化祿入官祿宮" required class="w-full px-3 py-2 rounded bg-black/50 border border-admin-gold/30 text-xs text-white" />
          </div>

          <div>
            <label class="block text-xs text-admin-muted mb-1">富文本 / 白話文深度解讀</label>
            <textarea v-model="form.contentRich" rows="4" required class="w-full px-3 py-2 rounded bg-black/50 border border-admin-gold/30 text-xs text-white"></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-3">
            <button type="button" @click="showModal = false" class="px-4 py-2 rounded text-xs text-admin-muted hover:text-white">取消</button>
            <button type="submit" class="px-5 py-2 rounded bg-admin-gold text-black text-xs font-serif font-bold">儲存辭條</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 彈窗：🧪 RAG 檢索即時調試器 (Live RAG Tester) -->
    <div
      v-if="showRagTestModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div class="glass-panel border border-purple-500/40 rounded-2xl p-6 max-w-3xl w-full max-h-[88vh] overflow-y-auto space-y-4 shadow-2xl">
        <div class="flex justify-between items-center border-b border-purple-500/20 pb-3">
          <div class="flex items-center space-x-2">
            <span class="text-xl">🧪</span>
            <h3 class="font-serif text-lg font-bold text-purple-300">RAG 領域知識庫檢索即時調試器</h3>
          </div>
          <button @click="showRagTestModal = false" class="text-admin-muted hover:text-white">✕</button>
        </div>

        <div class="space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-admin-muted mb-1">測試模組</label>
              <select v-model="ragTestForm.moduleType" class="w-full px-3 py-2 rounded bg-black/50 border border-purple-500/30 text-white">
                <option value="ZIWEI">紫微斗數 (ZIWEI)</option>
                <option value="BAZI">四柱八字 (BAZI)</option>
                <option value="WESTERN">西洋星盤 (WESTERN)</option>
                <option value="TAROT">韋特塔羅 (TAROT)</option>
                <option value="ICHING">周易六爻 (ICHING)</option>
                <option value="QIZHENG">七政四餘 (QIZHENG)</option>
                <option value="NAME">姓名學 (NAME)</option>
                <option value="ALMANAC">通勝黃曆 (ALMANAC)</option>
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-admin-muted mb-1">測試查詢課題或命盤關鍵字</label>
              <input
                v-model="ragTestForm.query"
                type="text"
                placeholder="例如：太陽白羊座、甲木日主、成日、愚者正位..."
                class="w-full px-3 py-2 rounded bg-black/50 border border-purple-500/30 text-white"
              />
            </div>
          </div>

          <button
            @click="runRagTest"
            :disabled="ragTesting"
            class="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors cursor-pointer"
          >
            {{ ragTesting ? '檢索比對中...' : '🔍 執行 RAG 動態檢索' }}
          </button>

          <!-- 檢索比對結果 -->
          <div v-if="ragTestResult" class="space-y-3 pt-3 border-t border-purple-500/20">
            <div class="p-3 rounded-lg bg-black/40 border border-purple-500/30 space-y-1">
              <span class="text-purple-400 font-bold block">1. 注入專屬顧問角色檔案：</span>
              <div class="text-admin-text font-bold text-sm">{{ ragTestResult.roleTitle }}</div>
              <p class="text-[11px] text-admin-muted leading-relaxed">{{ ragTestResult.rolePersona }}</p>
            </div>

            <div class="p-3 rounded-lg bg-black/40 border border-purple-500/30 space-y-1">
              <span class="text-purple-400 font-bold block">2. 動態檢索生成之 Prompt Snippet (Database RAG)：</span>
              <pre class="text-[11px] text-admin-text whitespace-pre-wrap font-serif leading-relaxed bg-black/60 p-3 rounded border border-purple-500/20">{{ ragTestResult.generatedRagSnippet }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 彈窗：批次匯入 RAG JSON -->
    <div
      v-if="showImportModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div class="glass-panel border border-admin-gold/40 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
        <div class="flex justify-between items-center border-b border-admin-gold/20 pb-3">
          <h3 class="font-serif text-lg font-bold text-admin-gold">批次匯入 RAG 辭庫 (JSON)</h3>
          <button @click="showImportModal = false" class="text-admin-muted hover:text-white">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <p class="text-admin-muted">請貼上包含 SystemInterpretation 物件之 JSON 陣列：</p>
          <textarea
            v-model="importJsonText"
            rows="8"
            placeholder='[{"moduleType":"ZIWEI","keyCode":"ZIWEI_TEST","category":"STAR","title":"測試詞條","contentRich":"解讀內容..."}]'
            class="w-full p-3 rounded bg-black/50 border border-admin-gold/30 text-white font-mono text-[11px]"
          ></textarea>
          <div class="flex justify-end space-x-3">
            <button @click="showImportModal = false" class="px-4 py-2 rounded text-admin-muted">取消</button>
            <button @click="submitImportJson" class="px-5 py-2 rounded bg-admin-gold text-black font-bold">確認匯入</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const modules = [
  { label: '全部詞庫', value: '' },
  { label: '紫微斗數', value: 'ZIWEI' },
  { label: '四柱八字', value: 'BAZI' },
  { label: '周易卜卦', value: 'ICHING' },
  { label: '韋特塔羅', value: 'TAROT' },
  { label: '西洋星象', value: 'WESTERN_NATAL' },
  { label: '七政四餘', value: 'QIZHENG' },
  { label: '易經姓名', value: 'NAME' },
  { label: '通勝黃曆', value: 'ALMANAC' },
];

const selectedModule = ref('');
const searchQuery = ref('');
const items = ref<any[]>([]);
const statusMsg = ref('');
const statusType = ref<'success' | 'error'>('success');

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref('');
const form = ref({
  moduleType: 'ZIWEI',
  category: 'STAR',
  keyCode: '',
  title: '',
  contentRich: '',
});

const showRagTestModal = ref(false);
const ragTesting = ref(false);
const ragTestForm = ref({
  moduleType: 'WESTERN',
  query: '白羊座 太陽能量',
});
const ragTestResult = ref<any>(null);

const showImportModal = ref(false);
const importJsonText = ref('');

async function fetchItems() {
  try {
    const url = new URL('/api/v1/admin/interpretations', window.location.origin);
    if (selectedModule.value) url.searchParams.set('moduleType', selectedModule.value);
    if (searchQuery.value) url.searchParams.set('search', searchQuery.value);

    const headers = await authStore.getAuthHeaders();
    const res = await fetch(url.toString(), {
      headers,
    });
    const data = await res.json();
    if (data.success) {
      items.value = data.data;
    }
  } catch (err) {
    console.error('Fetch interpretations failed:', err);
  }
}

function openCreateModal() {
  isEditing.value = false;
  editingId.value = '';
  form.value = {
    moduleType: 'ZIWEI',
    category: 'STAR',
    keyCode: '',
    title: '',
    contentRich: '',
  };
  showModal.value = true;
}

function editItem(item: any) {
  isEditing.value = true;
  editingId.value = item.id;
  form.value = {
    moduleType: item.moduleType,
    category: item.category,
    keyCode: item.keyCode,
    title: item.title,
    contentRich: item.contentRich,
  };
  showModal.value = true;
}

async function saveModalItem() {
  try {
    const method = isEditing.value ? 'PUT' : 'POST';
    const endpoint = isEditing.value ? `/api/v1/admin/interpretations/${editingId.value}` : '/api/v1/admin/interpretations';

    const headers = await authStore.getAuthHeaders();
    const res = await fetch(endpoint, {
      method,
      headers,
      body: JSON.stringify(form.value),
    });

    const data = await res.json();
    if (data.success) {
      showModal.value = false;
      statusType.value = 'success';
      statusMsg.value = '辭條已成功儲存';
      fetchItems();
    }
  } catch (err) {
    alert('儲存失敗');
  }
}

async function deleteItem(id: string) {
  if (!confirm('確認刪除此詞條？前台測算將無法調用此解讀')) return;
  const headers = await authStore.getAuthHeaders();
  await fetch(`/api/v1/admin/interpretations/${id}`, {
    method: 'DELETE',
    headers,
  });
  statusType.value = 'success';
  statusMsg.value = '辭條已成功刪除';
  fetchItems();
}

function openRagTestModal() {
  showRagTestModal.value = true;
  if (!ragTestResult.value) {
    runRagTest();
  }
}

async function runRagTest() {
  ragTesting.value = true;
  try {
    const headers = await authStore.getAuthHeaders();
    const res = await fetch('/api/v1/admin/rag/test-retrieval', {
      method: 'POST',
      headers,
      body: JSON.stringify(ragTestForm.value),
    });
    const data = await res.json();
    if (data.success) {
      ragTestResult.value = data.data;
    }
  } catch (err: any) {
    alert('RAG 檢索測試失敗：' + err.message);
  } finally {
    ragTesting.value = false;
  }
}

async function exportRagJson() {
  try {
    const headers = await authStore.getAuthHeaders();
    const res = await fetch('/api/v1/admin/rag/export', { headers });
    const data = await res.json();
    if (data.success) {
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `celestial_rag_interpretations_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  } catch (err: any) {
    alert('匯出失敗：' + err.message);
  }
}

async function submitImportJson() {
  try {
    const parsed = JSON.parse(importJsonText.value);
    if (!Array.isArray(parsed)) {
      alert('請提供 JSON 陣列格式');
      return;
    }

    const headers = await authStore.getAuthHeaders();
    const res = await fetch('/api/v1/admin/rag/import', {
      method: 'POST',
      headers,
      body: JSON.stringify({ items: parsed }),
    });
    const data = await res.json();
    if (data.success) {
      showImportModal.value = false;
      importJsonText.value = '';
      statusType.value = 'success';
      statusMsg.value = data.message;
      fetchItems();
    } else {
      alert(data.message || '匯入失敗');
    }
  } catch (err: any) {
    alert('JSON 解析或匯入異常：' + err.message);
  }
}

onMounted(() => {
  fetchItems();
});
</script>
