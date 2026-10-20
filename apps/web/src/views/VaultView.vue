<template>
  <div class="max-w-7xl mx-auto px-3 sm:px-6 pt-28 pb-20">
    <div class="text-center mb-8">
      <div class="text-xs uppercase tracking-[0.25em] font-serif text-dark-gold mb-2">CHART VAULT & JOURNAL</div>
      <h1 class="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient mb-3">命盤檔案庫與占卜日記</h1>
      <p class="text-xs text-dark-muted max-w-xl mx-auto">
        親友命盤多視角管理 · 歷史測算紀錄留存 · 個人靈驗反思心得隨筆
      </p>
    </div>

    <!-- 💡 DEMO 探索模式橫幅 -->
    <div v-if="authStore.isDemoMode && !authStore.realUser" class="max-w-4xl mx-auto mb-8 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm font-serif">
      <div class="flex items-center space-x-2 text-amber-500">
        <span class="text-base">💡</span>
        <span><strong>DEMO 體驗模式已啟動</strong>：已自動為您預載示範命盤與占卜日記，免登入即可暢遊所有功能！</span>
      </div>
      <div class="text-[11px] text-dark-muted">
        正式用戶？可隨時於右上角點擊登入
      </div>
    </div>

    <!-- 標籤切換 -->
    <div class="flex justify-center mb-8">
      <div class="glass-panel p-1.5 rounded-full inline-flex border border-dark-gold/30">
        <button
          @click="activeTab = 'profiles'"
          :class="[
            'px-6 py-2 rounded-full text-xs font-serif transition-all',
            activeTab === 'profiles' ? 'bg-dark-gold text-dark-void font-bold shadow-cosmic' : 'text-dark-muted hover:text-dark-text',
          ]"
        >
          命盤檔案庫 ({{ profiles.length }})
        </button>
        <button
          @click="activeTab = 'journal'"
          :class="[
            'px-6 py-2 rounded-full text-xs font-serif transition-all',
            activeTab === 'journal' ? 'bg-dark-gold text-dark-void font-bold shadow-cosmic' : 'text-dark-muted hover:text-dark-text',
          ]"
        >
          占卜日記本 ({{ journalRecords.length }})
        </button>
      </div>
    </div>

    <!-- 檔案庫視圖 -->
    <div v-if="activeTab === 'profiles'" class="space-y-6">
      <div class="flex justify-between items-center max-w-4xl mx-auto">
        <h3 class="font-serif text-lg font-bold text-dark-gold">已登記人物檔案</h3>
        <button
          @click="openAddProfileModal"
          class="px-4 py-2 rounded-lg font-serif text-xs font-semibold bg-dark-gold text-dark-void hover:opacity-90 shadow-cosmic transition-all cursor-pointer"
        >
          + 新增出生檔案
        </button>
      </div>

      <div v-if="loadingProfiles" class="text-center py-12 text-dark-muted text-xs font-serif">
        正在載入命盤庫資料...
      </div>

      <div v-else-if="profiles.length === 0" class="glass-panel max-w-4xl mx-auto rounded-2xl p-12 text-center border border-dark-gold/20 font-serif">
        <div class="text-3xl mb-3">📜</div>
        <p class="text-dark-text text-sm font-bold mb-1">命盤庫目前尚無人物檔案</p>
        <p class="text-dark-muted text-xs mb-4">點擊上方按鈕建立您的第一份出生檔案，或在命理頁面排盤後儲存。</p>
        <button
          @click="openAddProfileModal"
          class="px-5 py-2 rounded-xl bg-dark-gold text-dark-void text-xs font-bold"
        >
          立即登記新命盤
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div
          v-for="p in profiles"
          :key="p.id"
          class="glass-panel rounded-2xl p-6 border border-dark-gold/30 flex flex-col justify-between"
        >
          <div>
            <div class="flex justify-between items-start mb-2">
              <h4 class="font-serif text-xl font-bold text-gold-gradient">{{ p.name }}</h4>
              <span class="text-xs px-2 py-0.5 rounded bg-dark-gold/15 text-dark-gold font-serif">
                {{ p.gender }}
              </span>
            </div>
            <div class="space-y-1 text-xs text-dark-muted my-3">
              <p>出生時間：{{ new Date(p.birthDatetime).toLocaleString() }}</p>
              <p>出生地點：{{ p.birthLocationName || '台灣台北市' }}</p>
              <p>校準真太陽時：{{ p.trueSolarTime ? new Date(p.trueSolarTime).toLocaleTimeString() : '已校正' }}</p>
              <p v-if="p.notes" class="text-dark-gold/80 italic mt-1 text-[11px]">註：{{ p.notes }}</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 border-t border-dark-gold/15 pt-4 mt-2">
            <router-link
              to="/ziwei"
              class="flex-1 min-w-[70px] py-1.5 rounded-lg text-center text-xs border border-dark-gold/30 hover:border-dark-gold text-dark-gold transition-colors"
            >
              排紫微盤
            </router-link>
            <router-link
              to="/bazi"
              class="flex-1 min-w-[70px] py-1.5 rounded-lg text-center text-xs border border-dark-gold/30 hover:border-dark-gold text-dark-gold transition-colors"
            >
              排八字盤
            </router-link>
            <router-link
              to="/western"
              class="flex-1 min-w-[70px] py-1.5 rounded-lg text-center text-xs border border-dark-gold/30 hover:border-dark-gold text-dark-gold transition-colors"
            >
              排西洋星盤
            </router-link>
            <button
              @click="deleteProfile(p.id)"
              class="px-3 py-1.5 rounded-lg text-center text-xs border border-red-500/30 hover:bg-red-950/40 text-red-400 transition-colors cursor-pointer"
            >
              刪除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 占卜日記視圖 -->
    <div v-else class="max-w-4xl mx-auto space-y-4">
      <div v-if="loadingJournal" class="text-center py-12 text-dark-muted text-xs font-serif">
        正在載入占卜日記...
      </div>

      <div v-else-if="journalRecords.length === 0" class="glass-panel rounded-2xl p-12 text-center border border-dark-gold/20 font-serif">
        <div class="text-3xl mb-3">🔮</div>
        <p class="text-dark-text text-sm font-bold mb-1">目前尚無占卜日記紀錄</p>
        <p class="text-dark-muted text-xs">在紫微斗數、塔羅、易經或西洋占星進行測算後，點擊「儲存測算」即可自動同步至此。</p>
      </div>

      <div
        v-else
        v-for="item in journalRecords"
        :key="item.id"
        class="glass-panel rounded-2xl p-6 border border-dark-gold/30 flex flex-col md:flex-row justify-between gap-4 font-serif"
      >
        <div class="flex-1">
          <div class="flex items-center space-x-3 mb-2">
            <span class="text-xs px-2 py-0.5 rounded bg-dark-gold/15 text-dark-gold font-bold">
              {{ item.moduleType }}
            </span>
            <span class="text-xs text-dark-muted">{{ new Date(item.createdAt).toLocaleString() }}</span>
          </div>
          <h4 class="font-serif text-lg font-bold text-dark-text mb-2">{{ item.aiSummary || '占卜測算紀錄' }}</h4>
          <p class="text-xs text-dark-muted leading-relaxed whitespace-pre-wrap">{{ item.userNotes || '（尚無備註心得）' }}</p>
        </div>
        <div class="flex items-start">
          <button
            @click="deleteJournal(item.id)"
            class="px-3 py-1.5 rounded-lg text-xs border border-red-500/30 hover:bg-red-950/40 text-red-400 transition-colors cursor-pointer"
          >
            刪除紀錄
          </button>
        </div>
      </div>
    </div>

    <!-- 💫 新增出生檔案 MODAL 彈窗 -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-serif"
    >
      <div class="glass-panel border border-dark-gold/40 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
        <div class="flex justify-between items-center border-b border-dark-gold/20 pb-3">
          <h3 class="font-serif text-lg font-bold text-dark-gold">新增出生檔案 (人物命盤)</h3>
          <button @click="showAddModal = false" class="text-dark-muted hover:text-white">✕</button>
        </div>

        <form @submit.prevent="submitCreateProfile" class="space-y-4 text-xs">
          <div>
            <label class="block text-dark-muted mb-1">姓名 / 命盤識別稱謂 *</label>
            <input
              v-model="profileForm.name"
              type="text"
              required
              placeholder="例如：本命盤 (張三)、伴侶命盤"
              class="w-full px-3 py-2 rounded-lg bg-black/50 border border-dark-gold/30 text-dark-text outline-none focus:border-dark-gold"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-dark-muted mb-1">生理性別 *</label>
              <select
                v-model="profileForm.gender"
                class="w-full px-3 py-2 rounded-lg bg-black/50 border border-dark-gold/30 text-dark-text outline-none focus:border-dark-gold"
              >
                <option value="男">男</option>
                <option value="女">女</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div>
              <label class="block text-dark-muted mb-1">出生出生地城市</label>
              <input
                v-model="profileForm.birthLocationName"
                type="text"
                placeholder="例如：台灣台北市"
                class="w-full px-3 py-2 rounded-lg bg-black/50 border border-dark-gold/30 text-dark-text outline-none focus:border-dark-gold"
              />
            </div>
          </div>

          <div>
            <label class="block text-dark-muted mb-1">出生公曆日期與時間 *</label>
            <input
              v-model="profileForm.birthDatetime"
              type="datetime-local"
              required
              class="w-full px-3 py-2 rounded-lg bg-black/50 border border-dark-gold/30 text-dark-text outline-none focus:border-dark-gold"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-dark-muted mb-1">經度 (Longitude)</label>
              <input
                v-model.number="profileForm.longitude"
                type="number"
                step="0.0001"
                placeholder="121.5654"
                class="w-full px-3 py-2 rounded-lg bg-black/50 border border-dark-gold/30 text-dark-text outline-none focus:border-dark-gold"
              />
            </div>
            <div>
              <label class="block text-dark-muted mb-1">緯度 (Latitude)</label>
              <input
                v-model.number="profileForm.latitude"
                type="number"
                step="0.0001"
                placeholder="25.0330"
                class="w-full px-3 py-2 rounded-lg bg-black/50 border border-dark-gold/30 text-dark-text outline-none focus:border-dark-gold"
              />
            </div>
          </div>

          <div>
            <label class="block text-dark-muted mb-1">檔案備註心得</label>
            <textarea
              v-model="profileForm.notes"
              rows="2"
              placeholder="個人主視角、時辰確證無誤..."
              class="w-full px-3 py-2 rounded-lg bg-black/50 border border-dark-gold/30 text-dark-text outline-none focus:border-dark-gold resize-none"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-3 border-t border-dark-gold/15">
            <button
              type="button"
              @click="showAddModal = false"
              class="px-4 py-2 rounded-lg text-dark-muted hover:text-white"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="savingProfile"
              class="px-5 py-2 rounded-lg bg-dark-gold text-dark-void font-bold hover:opacity-90 transition-opacity"
            >
              {{ savingProfile ? '儲存中...' : '確認登記檔案' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth.js';

const authStore = useAuthStore();
const activeTab = ref<'profiles' | 'journal'>('profiles');
const showAddModal = ref(false);
const loadingProfiles = ref(false);
const loadingJournal = ref(false);
const savingProfile = ref(false);

const defaultProfiles = [
  {
    id: 'sample-1',
    name: '本命盤 (本人)',
    gender: '男',
    birthDatetime: '1995-10-24T06:30:00Z',
    birthLocationName: '台灣台北市',
    trueSolarTime: '1995-10-24T06:36:15Z',
    notes: '個人主視角命盤',
  },
  {
    id: 'sample-2',
    name: '伴侶命盤',
    gender: '女',
    birthDatetime: '1996-03-12T14:00:00Z',
    birthLocationName: '香港九龍',
    trueSolarTime: '1996-03-12T13:42:30Z',
    notes: '合盤與重要對象',
  },
];

const defaultJournalRecords = [
  {
    id: 'sample-101',
    moduleType: 'TAROT',
    createdAt: '2026-10-18T10:00:00Z',
    aiSummary: '抽得【星星 (The Star)】正位神諭',
    userNotes: '今日驗證：在晨間會議上提出的新系統創意獲得了團隊的一致讚賞，確如星光般指引了突破方向。',
  },
  {
    id: 'sample-102',
    moduleType: 'ICHING',
    createdAt: '2026-10-15T15:30:00Z',
    aiSummary: '六爻卜得【水天需】之【水地比】',
    userNotes: '需卦主耐心等待時機，動爻在五爻，後續轉為比卦親和得助。耐心等待兩天後順利拿到簽約。',
  },
];

const profiles = ref<any[]>(defaultProfiles);
const journalRecords = ref<any[]>(defaultJournalRecords);

const profileForm = ref({
  name: '',
  gender: '男',
  birthDatetime: '1995-10-24T06:30',
  birthLocationName: '台灣台北市',
  longitude: 121.5654,
  latitude: 25.033,
  notes: '',
});

function openAddProfileModal() {
  profileForm.value = {
    name: '',
    gender: '男',
    birthDatetime: new Date().toISOString().slice(0, 16),
    birthLocationName: '台灣台北市',
    longitude: 121.5654,
    latitude: 25.033,
    notes: '',
  };
  showAddModal.value = true;
}

async function fetchProfiles() {
  loadingProfiles.value = true;
  try {
    const headers = await authStore.getAuthHeaders();
    const res = await fetch('/api/v1/profiles', { headers });
    const data = await res.json();
    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
      profiles.value = data.data;
    }
  } catch (err) {
    console.warn('Fetch profiles fallback to local store');
  } finally {
    loadingProfiles.value = false;
  }
}

async function fetchJournal() {
  loadingJournal.value = true;
  try {
    const headers = await authStore.getAuthHeaders();
    const res = await fetch('/api/v1/readings', { headers });
    const data = await res.json();
    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
      journalRecords.value = data.data;
    }
  } catch (err) {
    console.warn('Fetch readings fallback to local store');
  } finally {
    loadingJournal.value = false;
  }
}

async function submitCreateProfile() {
  savingProfile.value = true;
  try {
    const headers = await authStore.getAuthHeaders();
    const payload = {
      name: profileForm.value.name,
      gender: profileForm.value.gender,
      birthDatetime: new Date(profileForm.value.birthDatetime).toISOString(),
      birthLocationName: profileForm.value.birthLocationName,
      longitude: profileForm.value.longitude,
      latitude: profileForm.value.latitude,
      notes: profileForm.value.notes,
    };

    const res = await fetch('/api/v1/profiles', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success && data.data) {
      profiles.value.unshift(data.data);
      showAddModal.value = false;
    } else {
      alert(data.message || '建立檔案失敗');
    }
  } catch (err: any) {
    alert(err.message || '網路通訊失敗');
  } finally {
    savingProfile.value = false;
  }
}

async function deleteProfile(id: string) {
  if (!confirm('確認刪除此出生檔案？')) return;
  try {
    const headers = await authStore.getAuthHeaders();
    await fetch(`/api/v1/profiles/${id}`, {
      method: 'DELETE',
      headers,
    });
  } catch (err) {
    // 容錯
  }
  profiles.value = profiles.value.filter((p) => p.id !== id);
}

async function deleteJournal(id: string) {
  if (!confirm('確認刪除此占卜日記記錄？')) return;
  try {
    const headers = await authStore.getAuthHeaders();
    await fetch(`/api/v1/readings/${id}`, {
      method: 'DELETE',
      headers,
    });
  } catch (err) {
    // 容錯
  }
  journalRecords.value = journalRecords.value.filter((j) => j.id !== id);
}

onMounted(() => {
  fetchProfiles();
  fetchJournal();
});
</script>
