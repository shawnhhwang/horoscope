import { ref, computed, nextTick, watch } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import {
  getYearMetaphysicalGuidance,
  getInitialRomanceFriends,
  getLifeStageIllustration,
  FemaleFriendProfile,
} from '@celestial/astro-core';

export interface SavedProfile {
  id: string;
  name: string;
  gender: string;
  birthDatetime: string;
}

export const PERSPECTIVE_OPTIONS = [
  {
    id: 'TIANJI' as const,
    label: '🔮 倪師天紀心法',
    shortName: '倪師天紀',
    desc: '以天紀「人事努力大於先天命盤」為宗，剖析行善積德化解煞氣、自強不息改寫天命。',
  },
  {
    id: 'SHIJI' as const,
    label: '📜 正史太史公列傳',
    shortName: '太史公列傳',
    desc: '司馬遷《史記》春秋筆法，微言大義、古雅典贍，附「太史公曰」史家贊辭。',
  },
  {
    id: 'MEMOIR' as const,
    label: '☕ 現代時代回憶錄',
    shortName: '時代回憶錄',
    desc: '溫潤感性、記述在台灣時代浪潮中的奮鬥打拼、悲歡離合與給子孫的深情獨白。',
  },
  {
    id: 'ONE_IN_8_BILLION' as const,
    label: '🌌 80億分之一的遊戲',
    shortName: '80億分之一',
    desc: '全球 80 億人潮中，自由意志抉擇排列與紅顏盲盒因緣真身大揭曉。',
  },
];

export function useLifeSimulator() {
  const authStore = useAuthStore();
  const form = ref({ profileName: '張道遠', birthDate: '1995-10-24T14:30', gender: '男' });
  const romanceFriendsSetup = ref<FemaleFriendProfile[]>(
    getInitialRomanceFriends('男', form.value.birthDate)
  );

  watch([() => form.value.birthDate, () => form.value.gender], ([newDate, newGender]) => {
    if (newDate) {
      romanceFriendsSetup.value = getInitialRomanceFriends(newGender as '男' | '女', newDate);
    }
  });

  const savedProfiles = ref<SavedProfile[]>([]);
  const loading = ref(false);
  const actionLoading = ref(false);
  const session = ref<any>(null);
  const viewingAge = ref<number>(0);
  const customActionText = ref('');
  const finalSummary = ref<any>(null);
  const selectedPerspective = ref<'TIANJI' | 'SHIJI' | 'MEMOIR' | 'ONE_IN_8_BILLION'>('TIANJI');
  const isGeneratingPerspective = ref(false);
  const timelineScroll = ref<HTMLElement | null>(null);

  // What-If 平行分歧 & 雙人模擬
  const whatIfForm = ref({ branchAge: 28, pathALabel: '創業闖蕩 · 搏取功名', pathBLabel: '考取公職 · 穩健守成' });
  const whatIfLoading = ref(false);
  const whatIfResult = ref<any>(null);

  const coupleForm = ref({
    person1: { name: '張君豪', gender: '男' as '男' | '女', birthDate: '1992-06-18T10:30' },
    person2: { name: '林雅婷', gender: '女' as '男' | '女', birthDate: '1994-11-22T16:15' },
  });
  const coupleLoading = ref(false);
  const coupleResult = ref<any>(null);

  const currentNode = computed(() => session.value?.history?.[session.value.currentAge] || null);
  const activeDisplayNode = computed(() => session.value?.history?.[viewingAge.value] || currentNode.value);
  const turnGuidance = computed(() => (activeDisplayNode.value ? getYearMetaphysicalGuidance(activeDisplayNode.value) : null));
  const activeStageIllustration = computed(() =>
    activeDisplayNode.value ? activeDisplayNode.value.stageIllustration || getLifeStageIllustration(activeDisplayNode.value.age) : '/images/life-simulator/stage_01_infancy.webp'
  );

  const activeRomanticIllustration = computed(() => {
    const node = activeDisplayNode.value;
    if (!node) return null;
    const isRomantic = node.eventTitle?.includes('邂逅') || node.options?.some((o: any) => o.id?.includes('romantic'));
    if (!isRomantic) return null;
    if (node.romanceIllustration) return node.romanceIllustration;
    const isFemale = session.value?.gender === '女';
    const maleMap: Record<number, string> = {
      18: '/images/life-simulator/romance_male_zixuan.webp',
      22: '/images/life-simulator/romance_male_yulin.webp',
      26: '/images/life-simulator/romance_male_bohan.webp',
      30: '/images/life-simulator/romance_male_chengze.webp',
      34: '/images/life-simulator/romance_male_ruian.webp',
    };
    const femaleMap: Record<number, string> = {
      18: '/images/life-simulator/romance_wanqing.webp',
      22: '/images/life-simulator/romance_ruoxi.webp',
      26: '/images/life-simulator/romance_yuwei.webp',
      30: '/images/life-simulator/romance_peiyi.webp',
      34: '/images/life-simulator/romance_minzhi.webp',
    };
    const table = isFemale ? maleMap : femaleMap;
    return table[node.age] || (isFemale ? '/images/life-simulator/romance_male_zixuan.webp' : '/images/life-simulator/romance_wanqing.webp');
  });

  const attributes = computed(() => {
    if (activeDisplayNode.value?.snapshotAttributes?.health) return activeDisplayNode.value.snapshotAttributes;
    return session.value?.attributes || { health: 80, knowledge: 20, wealth: 30, relationship: 70, career: 20, wisdom: 20 };
  });

  function onFriendBirthChange(friend: FemaleFriendProfile) {
    if (!friend.birthDate || !form.value.birthDate) return;
    const pYear = parseInt(form.value.birthDate.slice(0, 4), 10);
    const fYear = parseInt(friend.birthDate.slice(0, 4), 10);
    if (!isNaN(pYear) && !isNaN(fYear)) friend.ageOffset = pYear - fYear;
  }

  async function loadVaultProfiles() {
    try {
      const headers = await authStore.getAuthHeaders();
      const res = await fetch('/api/v1/profiles', { headers });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        savedProfiles.value = data.data;
        return;
      }
    } catch { /* fallback */ }
    try {
      const raw = localStorage.getItem('celestial_vault_profiles');
      if (raw) savedProfiles.value = JSON.parse(raw);
    } catch { /* ignore */ }
  }

  function loadSavedProfile(id: string) {
    const p = savedProfiles.value.find((item) => item.id === id);
    if (!p) return;
    form.value.profileName = p.name;
    form.value.gender = p.gender === '女' ? '女' : '男';
    if (p.birthDatetime) {
      form.value.birthDate = p.birthDatetime.slice(0, 16);
      romanceFriendsSetup.value = getInitialRomanceFriends(form.value.gender as '男' | '女', p.birthDatetime);
    }
  }

  async function fetchTurnPrompt(sessionId: string, age: number) {
    try {
      const res = await fetch('/api/v1/simulator/turn/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, age }),
      });
      const data = await res.json();
      if (data.success) session.value.history[age] = data.data.node;
    } catch (err) {
      console.error('Fetch turn prompt error:', err);
    }
  }

  async function startSimulation() {
    loading.value = true;
    try {
      const res = await fetch('/api/v1/simulator/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileName: form.value.profileName,
          birthDate: form.value.birthDate,
          gender: form.value.gender,
          romanceFriends: romanceFriendsSetup.value,
          femaleFriends: romanceFriendsSetup.value,
        }),
      });
      const data = await res.json();
      if (data.success) {
        session.value = data.data.session;
        viewingAge.value = session.value.currentAge;
        await fetchTurnPrompt(session.value.sessionId, session.value.currentAge);
      } else {
        alert(data.message || '起局失敗');
      }
    } catch (err: any) {
      alert(err.message || '連線伺服器異常');
    } finally {
      loading.value = false;
    }
  }

  function scrollToCurrentAge() {
    nextTick(() => {
      if (timelineScroll.value) {
        const activeEl = timelineScroll.value.children[session.value?.currentAge || 0] as HTMLElement;
        if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });
  }

  async function submitTurn(payload: { chosenOptionId?: string; customText?: string }) {
    if (actionLoading.value) return;
    actionLoading.value = true;
    try {
      const res = await fetch('/api/v1/simulator/turn/choose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.value.sessionId, age: session.value.currentAge, ...payload }),
      });
      const data = await res.json();
      if (data.success) {
        if (payload.customText) customActionText.value = '';
        session.value.history[session.value.currentAge] = data.data.resolvedNode;
        session.value.attributes = data.data.newAttributes;
        if (data.data.isTerminal) {
          session.value.status = 'COMPLETED';
          session.value.finalSummary = data.data.finalSummary;
          finalSummary.value = data.data.finalSummary;
        } else {
          session.value.currentAge = data.data.nextAge;
          viewingAge.value = data.data.nextAge;
          await fetchTurnPrompt(session.value.sessionId, data.data.nextAge);
          scrollToCurrentAge();
        }
      } else {
        alert(data.message || '結算失敗');
      }
    } catch (err: any) {
      alert(err.message || '抉擇結算異常');
    } finally {
      actionLoading.value = false;
    }
  }

  const makeDecision = (optionId: string) => submitTurn({ chosenOptionId: optionId });
  const makeCustomDecision = () => customActionText.value.trim() && submitTurn({ customText: customActionText.value.trim() });

  async function fastForward() {
    if (actionLoading.value) return;
    actionLoading.value = true;
    try {
      const res = await fetch('/api/v1/simulator/fast-forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.value.sessionId, maxYears: 8 }),
      });
      const data = await res.json();
      if (data.success) {
        const freshRes = await fetch(`/api/v1/simulator/session/${session.value.sessionId}`);
        const freshData = await freshRes.json();
        if (freshData.success) {
          session.value = freshData.data;
          viewingAge.value = session.value.currentAge;
          if (data.data.terminalHit) {
            session.value.finalSummary = data.data.finalSummary;
            finalSummary.value = data.data.finalSummary;
          } else {
            await fetchTurnPrompt(session.value.sessionId, session.value.currentAge);
          }
          scrollToCurrentAge();
        }
      }
    } finally {
      actionLoading.value = false;
    }
  }

  async function requestPerspectiveUpdate(p: 'TIANJI' | 'SHIJI' | 'MEMOIR' | 'ONE_IN_8_BILLION', forceLlm = false) {
    if (!session.value?.sessionId || isGeneratingPerspective.value) return;
    isGeneratingPerspective.value = true;
    try {
      const res = await fetch('/api/v1/simulator/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.value.sessionId, perspective: p, forceLlm }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        finalSummary.value = data.data;
        selectedPerspective.value = data.data.activePerspective || p;
        session.value.finalSummary = data.data;
        session.value.status = 'COMPLETED';
      } else {
        alert(data.message || '生成該視角自傳失敗');
      }
    } finally {
      isGeneratingPerspective.value = false;
    }
  }

  function selectPerspective(p: 'TIANJI' | 'SHIJI' | 'MEMOIR' | 'ONE_IN_8_BILLION') {
    selectedPerspective.value = p;
    if (!finalSummary.value) return;
    if (finalSummary.value.perspectiveBiographies?.[p]) {
      finalSummary.value.biographyRichText = finalSummary.value.perspectiveBiographies[p];
      if (finalSummary.value.perspectiveTitles?.[p]) finalSummary.value.endingTitle = finalSummary.value.perspectiveTitles[p];
      finalSummary.value.activePerspective = p;
    } else {
      requestPerspectiveUpdate(p, false);
    }
  }

  async function finalizeSimulation() {
    if (session.value?.finalSummary) {
      finalSummary.value = session.value.finalSummary;
      selectedPerspective.value = finalSummary.value.activePerspective || selectedPerspective.value;
      return;
    }
    if (actionLoading.value) return;
    actionLoading.value = true;
    try {
      const res = await fetch('/api/v1/simulator/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.value.sessionId, perspective: selectedPerspective.value, forceLlm: false }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        finalSummary.value = data.data;
        selectedPerspective.value = data.data.activePerspective || selectedPerspective.value;
        session.value.finalSummary = data.data;
        session.value.status = 'COMPLETED';
      }
    } finally {
      actionLoading.value = false;
    }
  }

  async function runWhatIfSimulation() {
    whatIfLoading.value = true;
    try {
      const res = await fetch('/api/v1/simulator/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: form.value.birthDate,
          gender: form.value.gender,
          ...whatIfForm.value,
        }),
      });
      const data = await res.json();
      if (data.success) whatIfResult.value = data.data;
      else alert(data.message || '平行推演失敗');
    } finally {
      whatIfLoading.value = false;
    }
  }

  async function runCoupleSimulation() {
    coupleLoading.value = true;
    try {
      const res = await fetch('/api/v1/simulator/couple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupleForm.value),
      });
      const data = await res.json();
      if (data.success) coupleResult.value = data.data;
      else alert(data.message || '雙人模擬失敗');
    } finally {
      coupleLoading.value = false;
    }
  }

  function inspectYear(age: number) { viewingAge.value = age; }
  function jumpToCurrentYear() { viewingAge.value = session.value.currentAge; scrollToCurrentAge(); }
  function restartSimulation() { finalSummary.value = null; session.value = null; viewingAge.value = 0; }

  return {
    form, romanceFriendsSetup, savedProfiles, loading, actionLoading, session, viewingAge,
    customActionText, finalSummary, selectedPerspective, isGeneratingPerspective, timelineScroll,
    currentNode, activeDisplayNode, turnGuidance, activeStageIllustration, activeRomanticIllustration,
    attributes, perspectiveOptions: PERSPECTIVE_OPTIONS,
    whatIfForm, whatIfLoading, whatIfResult, runWhatIfSimulation,
    coupleForm, coupleLoading, coupleResult, runCoupleSimulation,
    onFriendBirthChange, loadVaultProfiles, loadSavedProfile, startSimulation,
    makeDecision, makeCustomDecision, fastForward, selectPerspective, requestPerspectiveUpdate,
    finalizeSimulation, inspectYear, jumpToCurrentYear, restartSimulation,
  };
}
