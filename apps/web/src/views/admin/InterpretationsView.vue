<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="font-serif text-2xl font-bold text-admin-gold">命理詞庫內容管理 (CMS)</h2>
        <p class="text-xs text-admin-muted mt-1">即時維護紫微星曜、八字十神、周易爻辭與塔羅牌義解讀語料</p>
      </div>
      <button
        @click="openCreateModal"
        class="px-4 py-2 rounded-lg font-serif text-xs font-semibold bg-admin-gold text-black hover:opacity-90 shadow-md transition-all"
      >
        + 新增辭庫詞條
      </button>
    </div>

    <!-- 篩選器與搜尋列 -->
    <div class="admin-card p-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="mod in modules"
          :key="mod.value"
          @click="selectedModule = mod.value; fetchItems()"
          :class="[
            'px-3.5 py-1.5 rounded-lg text-xs font-serif transition-colors',
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
          class="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-admin-gold/20 text-xs focus:border-admin-gold outline-none"
        />
      </div>
    </div>

    <!-- 辭庫列表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="item in items"
        :key="item.id"
        class="admin-card p-5 flex flex-col justify-between hover:border-admin-gold/40 transition-colors"
      >
        <div>
          <div class="flex justify-between items-start mb-2">
            <span class="text-[10px] px-2 py-0.5 rounded bg-admin-gold/15 text-admin-gold font-mono">
              {{ item.keyCode }}
            </span>
            <span class="text-xs text-admin-muted">{{ item.moduleType }}</span>
          </div>
          <h4 class="font-serif text-lg font-bold text-admin-text mb-2">{{ item.title }}</h4>
          <p class="text-xs text-admin-muted leading-relaxed line-clamp-3 mb-4">{{ item.contentRich }}</p>
        </div>

        <div class="flex justify-between items-center border-t border-admin-gold/10 pt-3 mt-2 text-xs">
          <span class="text-[10px] text-admin-muted">分類: {{ item.category }}</span>
          <div class="space-x-2">
            <button @click="editItem(item)" class="text-admin-gold hover:underline">編輯</button>
            <button @click="deleteItem(item.id)" class="text-red-400 hover:underline">刪除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/編輯 Modal 彈窗 -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div class="w-full max-w-lg admin-card p-6 border border-admin-gold/40 shadow-2xl relative">
        <button @click="showModal = false" class="absolute top-4 right-4 text-admin-muted hover:text-white text-lg">✕</button>
        <h3 class="font-serif text-xl font-bold text-admin-gold mb-4">
          {{ isEditing ? '編輯辭庫詞條' : '新增命理詞條' }}
        </h3>

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
  fetchItems();
}

onMounted(() => {
  fetchItems();
});
</script>
