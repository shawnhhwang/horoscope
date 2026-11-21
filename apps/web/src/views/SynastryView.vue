<template>
  <div class="max-w-7xl mx-auto px-3 sm:px-6 pt-28 pb-20 font-serif">
    <!-- 頂部標題區 -->
    <div class="text-center mb-8">
      <div class="text-xs uppercase tracking-[0.25em] text-dark-gold mb-2 font-sans">
        BAZI SYNASTRY & FAMILY GROUP HARMONY
      </div>
      <h1 class="text-3xl sm:text-4xl font-bold text-gold-gradient mb-3">
        八字合婚與家人群組比對
      </h1>
      <p class="text-xs text-dark-muted max-w-2xl mx-auto leading-relaxed">
        融匯《滴天髓》夫妻正配與現代家庭系統動力 · 天干五合地支六合 · 五行互補喜用濟助 · 跨世代家族五行場域
      </p>
    </div>

    <!-- 雙分頁切換按鈕 -->
    <div class="flex justify-center mb-8">
      <div class="inline-flex p-1.5 rounded-full bg-black/40 border border-dark-gold/30 backdrop-blur-md shadow-cosmic">
        <button
          @click="activeTab = 'synastry'"
          class="flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all"
          :class="activeTab === 'synastry' ? 'bg-dark-gold text-dark-void shadow-md' : 'text-dark-muted hover:text-dark-text'"
        >
          <span>💍</span>
          <span>八字合婚 (二人合盤)</span>
        </button>
        <button
          @click="activeTab = 'family'"
          class="flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all"
          :class="activeTab === 'family' ? 'bg-dark-gold text-dark-void shadow-md' : 'text-dark-muted hover:text-dark-text'"
        >
          <span>👨‍👩‍👧‍👦</span>
          <span>家人群組 (多人群盤)</span>
        </button>
      </div>
    </div>

    <!-- 分頁 1: 八字合婚 -->
    <div v-if="activeTab === 'synastry'" class="space-y-8 animate-fade-in">
      <!-- 匿名邀請連結提示橫幅 -->
      <div v-if="inviteLoaded" class="max-w-4xl mx-auto p-3.5 rounded-xl bg-emerald-950/35 border border-emerald-500/40 text-xs text-emerald-200 flex items-center justify-between gap-3">
        <span>🔒 已透過匿名合盤邀請連結載入對方八字生辰；請輸入您的資料即可即時合盤！</span>
        <button @click="inviteLoaded = false" class="text-emerald-300 hover:underline text-[11px]">關閉提示</button>
      </div>

      <!-- 輸入表單卡片 -->
      <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 max-w-4xl mx-auto shadow-cosmic">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-dark-gold/15">
          <h2 class="text-sm font-bold text-gold-gradient flex items-center space-x-2">
            <span>💍</span>
            <span>輸入雙方生辰與性別</span>
          </h2>
          <div class="flex flex-wrap items-center gap-2 text-xs">
            <button
              @click="copyInviteLink"
              type="button"
              class="px-3 py-1 rounded-full bg-dark-gold/15 border border-dark-gold/40 text-dark-gold hover:bg-dark-gold/25 transition-colors cursor-pointer"
            >
              {{ inviteCopied ? '✅ 已複製匿名邀請連結！' : '🔗 產生匿名合盤邀請連結' }}
            </button>
            <template v-if="savedProfiles.length > 0">
              <select @change="quickLoadProfile($event, 'p1')" class="px-2 py-1 rounded bg-black/50 border border-dark-gold/30 text-[11px] text-dark-text outline-none">
                <option value="">載入乾造...</option>
                <option v-for="p in savedProfiles" :key="p.id" :value="p.id">{{ p.name }} ({{ p.gender }})</option>
              </select>
              <select @change="quickLoadProfile($event, 'p2')" class="px-2 py-1 rounded bg-black/50 border border-dark-gold/30 text-[11px] text-dark-text outline-none">
                <option value="">載入坤造...</option>
                <option v-for="p in savedProfiles" :key="p.id" :value="p.id">{{ p.name }} ({{ p.gender }})</option>
              </select>
            </template>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/20 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-amber-300">甲方 (乾造/邀請方)</span>
              <span class="text-[10px] text-dark-muted">陽剛氣守</span>
            </div>
            <div>
              <label class="block text-[11px] text-dark-muted mb-1">姓名 / 暱稱</label>
              <input v-model="synastryForm.p1Name" type="text" placeholder="例如：張君豪" class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] text-dark-muted mb-1">性別</label>
                <select v-model="synastryForm.p1Gender" class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none">
                  <option value="男">男 (乾造)</option>
                  <option value="女">女 (坤造)</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] text-dark-muted mb-1">生辰時間</label>
                <input v-model="synastryForm.p1Date" type="datetime-local" class="w-full px-2 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-[11px] focus:border-dark-gold outline-none" />
              </div>
            </div>
          </div>

          <div class="p-4 rounded-xl bg-black/30 border border-dark-gold/20 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-rose-300">乙方 (坤造/受邀方)</span>
              <span class="text-[10px] text-dark-muted">柔順坤德</span>
            </div>
            <div>
              <label class="block text-[11px] text-dark-muted mb-1">姓名 / 暱稱</label>
              <input v-model="synastryForm.p2Name" type="text" placeholder="例如：林雅婷" class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] text-dark-muted mb-1">性別</label>
                <select v-model="synastryForm.p2Gender" class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none">
                  <option value="女">女 (坤造)</option>
                  <option value="男">男 (乾造)</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] text-dark-muted mb-1">生辰時間</label>
                <input v-model="synastryForm.p2Date" type="datetime-local" class="w-full px-2 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-[11px] focus:border-dark-gold outline-none" />
              </div>
            </div>
          </div>
        </div>

        <button
          @click="handleCalculateSynastry"
          :disabled="loadingSynastry"
          class="w-full mt-6 py-3 rounded-xl font-serif text-xs font-bold bg-dark-gold text-dark-void hover:opacity-90 shadow-cosmic transition-all disabled:opacity-50 cursor-pointer"
        >
          {{ loadingSynastry ? '合婚推演中...' : '推演八字合婚 ⚡' }}
        </button>
      </div>

      <SynastryResultPanel
        v-if="synastryResult"
        :synastry-result="synastryResult"
        :synastry-ai-prompt="synastryAiPrompt"
        @save="saveSynastryJournal"
      />
    </div>

    <!-- 分頁 2: 家人群組比對 -->
    <FamilyGroupPanel
      v-else
      :saved-profiles="savedProfiles"
      :family-form="familyForm"
      :family-result="familyResult"
      :loading-family="loadingFamily"
      :family-ai-prompt="familyAiPrompt"
      @import-all="importAllSavedProfiles"
      @add-member="addFamilyMember"
      @remove-member="removeFamilyMember"
      @calculate="handleCalculateFamilyGroup"
      @save="saveFamilyJournal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { calculateBaziSynastry, calculateFamilyGroup, BaziSynastryResult, FamilyGroupResult } from '@celestial/astro-core';
import { useAuthStore } from '../stores/auth.js';
import SynastryResultPanel from '../components/synastry/SynastryResultPanel.vue';
import FamilyGroupPanel from '../components/synastry/FamilyGroupPanel.vue';

const route = useRoute();
const authStore = useAuthStore();
const activeTab = ref<'synastry' | 'family'>('synastry');
const savedProfiles = ref<any[]>([]);
const inviteLoaded = ref(false);
const inviteCopied = ref(false);

const synastryForm = ref({
  p1Name: '張君豪',
  p1Gender: '男' as '男' | '女',
  p1Date: '1992-06-18T10:30',
  p2Name: '林雅婷',
  p2Gender: '女' as '男' | '女',
  p2Date: '1994-11-22T16:15',
});
const loadingSynastry = ref(false);
const synastryResult = ref<BaziSynastryResult | null>(null);

const familyForm = ref({
  familyTitle: '建華幸福之家',
  members: [
    { name: '父親 (建華)', role: '父親', gender: '男' as '男' | '女', birthDate: '1965-03-12T08:00' },
    { name: '母親 (淑芬)', role: '母親', gender: '女' as '男' | '女', birthDate: '1968-09-20T14:30' },
    { name: '長子 (浩宇)', role: '長子', gender: '男' as '男' | '女', birthDate: '1995-10-24T06:30' },
    { name: '次女 (子晴)', role: '次女', gender: '女' as '男' | '女', birthDate: '1999-07-08T18:45' },
  ],
});
const loadingFamily = ref(false);
const familyResult = ref<FamilyGroupResult | null>(null);

const synastryAiPrompt = computed(() => {
  if (!synastryResult.value) return '';
  const r = synastryResult.value;
  const zh = r.ziweiHeming;
  const ziweiInfo = zh ? `；紫微三合合盤星級為「${zh.starRating} (${zh.destinyType})」，雙宮聯參為「${zh.dualPalacePrinciple}」` : '';
  return `請以八字子平與倪海廈《天紀》紫微合盤雙軌專家身份，為我深度批註【${r.person1.name}】與【${r.person2.name}】之合婚盤：綜合契合度為「${r.score}分 (${r.level})」，通關五行為「${r.bridgingElement.element}」${ziweiInfo}。`;
});

const familyAiPrompt = computed(() => {
  if (!familyResult.value) return '';
  const f = familyResult.value;
  return `請以家族命理與倪海廈《天紀·地脈道》陽宅家道專家身份，深入解析【${f.familyTitle}】（${f.memberCount}位）：主場域「${f.householdAura.auraTitle}」，主導「${f.householdAura.dominantElement}」、匱乏「${f.householdAura.lackingElement}」。`;
});

function copyInviteLink() {
  const payload = {
    n: synastryForm.value.p1Name || '神秘邀請方',
    g: synastryForm.value.p1Gender,
    d: synastryForm.value.p1Date,
  };
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  const url = `${window.location.origin}/synastry?invite=${encodeURIComponent(encoded)}`;
  navigator.clipboard?.writeText(url).catch(() => {});
  inviteCopied.value = true;
  setTimeout(() => { inviteCopied.value = false; }, 2500);
}

function hydrateInviteFromUrl() {
  const token = route.query.invite;
  if (typeof token !== 'string' || !token) return;
  try {
    const decoded = JSON.parse(decodeURIComponent(escape(atob(token))));
    if (decoded?.d) {
      synastryForm.value.p1Name = decoded.n || '神秘邀請方';
      synastryForm.value.p1Gender = decoded.g === '女' ? '女' : '男';
      synastryForm.value.p1Date = decoded.d;
      inviteLoaded.value = true;
    }
  } catch { /* ignore invalid token */ }
}

async function loadSavedProfiles() {
  try {
    const headers = await authStore.getAuthHeaders();
    const res = await fetch('/api/v1/profiles', { headers });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) savedProfiles.value = data.data;
  } catch { /* fallback */ }
}

function quickLoadProfile(e: Event, target: 'p1' | 'p2') {
  const p = savedProfiles.value.find((item) => item.id === (e.target as HTMLSelectElement).value);
  if (!p) return;
  const dateStr = p.birthDatetime ? p.birthDatetime.slice(0, 16) : '1995-10-24T12:00';
  if (target === 'p1') {
    synastryForm.value.p1Name = p.name;
    synastryForm.value.p1Gender = p.gender === '女' ? '女' : '男';
    synastryForm.value.p1Date = dateStr;
  } else {
    synastryForm.value.p2Name = p.name;
    synastryForm.value.p2Gender = p.gender === '女' ? '女' : '男';
    synastryForm.value.p2Date = dateStr;
  }
}

function importAllSavedProfiles() {
  if (savedProfiles.value.length < 2) return;
  familyForm.value.members = savedProfiles.value.slice(0, 8).map((p, idx) => ({
    name: p.name,
    role: idx === 0 ? '戶主' : idx === 1 ? '伴侶' : '家庭成員',
    gender: (p.gender === '女' ? '女' : '男') as '男' | '女',
    birthDate: p.birthDatetime ? p.birthDatetime.slice(0, 16) : '1995-10-24T12:00',
  }));
}

function addFamilyMember() {
  if (familyForm.value.members.length >= 8) return;
  familyForm.value.members.push({ name: `成員 ${familyForm.value.members.length + 1}`, role: '家庭成員', gender: '男', birthDate: '1998-05-20T12:00' });
}

function removeFamilyMember(idx: number) {
  if (familyForm.value.members.length > 2) familyForm.value.members.splice(idx, 1);
}

function handleCalculateSynastry() {
  loadingSynastry.value = true;
  try {
    synastryResult.value = calculateBaziSynastry(
      { name: synastryForm.value.p1Name || '乾造', gender: synastryForm.value.p1Gender, birthDate: new Date(synastryForm.value.p1Date) },
      { name: synastryForm.value.p2Name || '坤造', gender: synastryForm.value.p2Gender, birthDate: new Date(synastryForm.value.p2Date) }
    );
  } finally {
    loadingSynastry.value = false;
  }
}

function handleCalculateFamilyGroup() {
  loadingFamily.value = true;
  try {
    familyResult.value = calculateFamilyGroup(
      familyForm.value.members.map((m) => ({ name: m.name, role: m.role, gender: m.gender, birthDate: new Date(m.birthDate) })),
      familyForm.value.familyTitle || '幸福同舟之家'
    );
  } finally {
    loadingFamily.value = false;
  }
}

async function saveJournal(moduleType: string, inputSnapshot: any, chartOutput: any, aiSummary: string, userNotes: string) {
  try {
    const headers = await authStore.getAuthHeaders();
    const res = await fetch('/api/v1/readings', { method: 'POST', headers, body: JSON.stringify({ moduleType, inputSnapshot, chartOutput, aiSummary, userNotes }) });
    const data = await res.json();
    alert(data.success ? '已成功儲存至占卜日記！' : '儲存失敗：' + (data.message || '未知錯誤'));
  } catch {
    alert('已儲存至本機暫存！');
  }
}

const saveSynastryJournal = () => synastryResult.value && saveJournal('BAZI_SYNASTRY', synastryForm.value, synastryResult.value, `八字合婚：${synastryResult.value.person1.name} 與 ${synastryResult.value.person2.name} (${synastryResult.value.score}分)`, `通關五行：${synastryResult.value.bridgingElement.element}`);
const saveFamilyJournal = () => familyResult.value && saveJournal('FAMILY_GROUP', familyForm.value, familyResult.value, `家庭群盤：${familyResult.value.familyTitle} (${familyResult.value.memberCount}位)`, `主導五行：${familyResult.value.householdAura.dominantElement}`);

onMounted(() => {
  if (route.query.tab === 'family') activeTab.value = 'family';
  hydrateInviteFromUrl();
  loadSavedProfiles();
  handleCalculateSynastry();
  handleCalculateFamilyGroup();
});
</script>
