<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="font-serif text-2xl font-bold text-admin-gold">營運總覽與數據大盤</h2>
        <p class="text-xs text-admin-muted mt-1">即時監控系統會員增長、測算調用與辭庫規模</p>
      </div>
      <button @click="fetchStats" class="px-3 py-1.5 rounded-lg border border-admin-gold/30 text-xs text-admin-gold hover:bg-admin-gold/10">
        重新整理數據
      </button>
    </div>

    <!-- 關鍵指標卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div class="admin-card p-5">
        <span class="text-xs text-admin-muted block mb-1">註冊總會員數</span>
        <div class="font-serif text-3xl font-bold text-admin-gold">{{ stats.totalUsers }}</div>
        <span class="text-[10px] text-emerald-400 mt-2 block">↑ 穩定成長中</span>
      </div>

      <div class="admin-card p-5">
        <span class="text-xs text-admin-muted block mb-1">尊榮 VIP 會員</span>
        <div class="font-serif text-3xl font-bold text-amber-300">{{ stats.vipUsers }}</div>
        <span class="text-[10px] text-amber-400 mt-2 block">高價值留存用戶</span>
      </div>

      <div class="admin-card p-5">
        <span class="text-xs text-admin-muted block mb-1">儲存命盤檔案</span>
        <div class="font-serif text-3xl font-bold text-violet-300">{{ stats.totalProfiles }}</div>
        <span class="text-[10px] text-admin-muted mt-2 block">真太陽時校準檔案</span>
      </div>

      <div class="admin-card p-5">
        <span class="text-xs text-admin-muted block mb-1">累積占卜測算次數</span>
        <div class="font-serif text-3xl font-bold text-cyan-300">{{ stats.totalReadings }}</div>
        <span class="text-[10px] text-cyan-400 mt-2 block">活躍靈驗日記</span>
      </div>

      <div class="admin-card p-5">
        <span class="text-xs text-admin-muted block mb-1">命理辭庫總詞條</span>
        <div class="font-serif text-3xl font-bold text-emerald-300">{{ stats.totalInterpretations }}</div>
        <span class="text-[10px] text-emerald-400 mt-2 block">六大模組熱更新庫</span>
      </div>
    </div>

    <!-- 各模組測算頻次熱門度分佈 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="admin-card p-6">
        <h3 class="font-serif text-lg font-bold text-admin-gold mb-4">模組使用熱力排行榜</h3>
        <div class="space-y-4">
          <div v-for="(count, mod) in stats.moduleDistribution" :key="mod">
            <div class="flex justify-between text-xs mb-1">
              <span class="font-serif font-bold text-admin-text">{{ getModuleName(mod) }}</span>
              <span class="text-admin-gold font-mono">{{ count }} 次測算</span>
            </div>
            <div class="w-full bg-black/50 h-2.5 rounded-full overflow-hidden border border-admin-gold/10">
              <div
                class="bg-gradient-to-r from-amber-500 to-admin-gold h-full rounded-full transition-all duration-700"
                :style="{ width: `${Math.min(100, Math.max(15, count * 20))}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="admin-card p-6 flex flex-col justify-between">
        <div>
          <h3 class="font-serif text-lg font-bold text-admin-gold mb-3">服務健康狀態與架構規格</h3>
          <div class="space-y-3 text-xs text-admin-muted">
            <div class="flex justify-between border-b border-admin-gold/10 pb-2">
              <span>後端 API 引擎：</span>
              <span class="text-emerald-400 font-mono">Node.js v20 (Express + TypeScript)</span>
            </div>
            <div class="flex justify-between border-b border-admin-gold/10 pb-2">
              <span>前端展示框架：</span>
              <span class="text-emerald-400 font-mono">Vue 3 + Vite + Tailwind CSS</span>
            </div>
            <div class="flex justify-between border-b border-admin-gold/10 pb-2">
              <span>資料持久層：</span>
              <span class="text-emerald-400 font-mono">PostgreSQL 16 + Prisma ORM</span>
            </div>
            <div class="flex justify-between border-b border-admin-gold/10 pb-2">
              <span>容器化部署：</span>
              <span class="text-emerald-400 font-mono">Docker Compose Full-Stack Ready</span>
            </div>
            <div class="flex justify-between border-b border-admin-gold/10 pb-2">
              <span>視覺渲染標竿：</span>
              <span class="text-admin-gold font-mono">Awwwards / Webby / FWA SOTD Caliber</span>
            </div>
          </div>
        </div>
        <div class="p-3.5 rounded-lg bg-admin-gold/10 border border-admin-gold/20 text-xs text-admin-gold mt-4">
          系統運作一切正常，天文曆曆表微擾演算法與真太陽時時差校正處於高精度狀態。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const stats = ref({
  totalUsers: 2,
  vipUsers: 1,
  totalProfiles: 1,
  totalReadings: 2,
  totalInterpretations: 5,
  moduleDistribution: {
    TAROT: 12,
    ZIWEI: 9,
    BAZI: 8,
    ICHING: 6,
    WESTERN_NATAL: 5,
    NAME: 4,
  } as Record<string, number>,
});

async function fetchStats() {
  const token = localStorage.getItem('admin_token');
  try {
    const res = await fetch('/api/v1/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) {
      stats.value = data.data;
    }
  } catch (err) {
    console.error('Fetch stats failed:', err);
  }
}

function getModuleName(type: string) {
  const map: Record<string, string> = {
    ZIWEI: '紫微斗數排盤',
    BAZI: '四柱八字論命',
    ICHING: '周易六爻卜卦',
    TAROT: '78張韋特塔羅',
    WESTERN_NATAL: '西洋星盤與月相',
    NAME: '易經姓名學剖析',
  };
  return map[type] || type;
}

onMounted(() => {
  fetchStats();
});
</script>
