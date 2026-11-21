<template>
  <div class="user-manual-view min-h-screen pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto font-serif transition-colors">
    <!-- 頂部 Hero 區塊 -->
    <div class="text-center space-y-4 mb-12">
      <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-dark-gold/15 border border-dark-gold/40 text-dark-gold text-xs shadow-cosmic">
        <span class="animate-pulse">📖</span>
        <span class="font-bold tracking-widest uppercase font-sans">Official User Manual & Consultation Guide</span>
      </div>
      <h1 class="text-2xl sm:text-4xl font-bold tracking-wider text-gold-gradient">
        萬象天儀·全系統使用手冊與問診指南
      </h1>
      <p class="text-xs sm:text-sm text-dark-muted max-w-2xl mx-auto leading-relaxed">
        融匯東西方古典命理正統、純 TypeScript 0% AGPL 開普勒/Meeus 天文演算，以及天機靈犀 AI 明師問診機制。不知該看哪一盤？請依您的現實生活情境在此獲取最精準的指引與直達連結。
      </p>

      <!-- 快捷跳轉三大分頁籤 -->
      <div class="flex flex-wrap items-center justify-center gap-2 pt-4">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border"
          :class="[
            activeTab === tab.id
              ? 'bg-dark-gold text-dark-void border-dark-gold shadow-cosmic'
              : 'glass-panel text-dark-muted hover:text-dark-gold border-dark-gold/25',
          ]"
        >
          <span>{{ tab.icon }}</span>
          <span class="ml-1.5">{{ tab.name }}</span>
        </button>
      </div>
    </div>

    <!-- 分頁 1：算命明師問診情境速查地圖 -->
    <div v-if="activeTab === 'scenarios'" class="space-y-8 animate-fade-in">
      <div class="glass-panel p-6 sm:p-8 rounded-2xl border border-dark-gold/30 shadow-cosmic">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-gold/20 pb-5 mb-6">
          <div>
            <h2 class="text-lg sm:text-xl font-bold text-dark-gold flex items-center space-x-2">
              <span>🧭</span>
              <span>一般人找算命老師最常問的 11 大生活難題</span>
            </h2>
            <p class="text-xs text-dark-muted mt-1">
              點擊您當前正面臨的困境，明師即刻為您把脈診斷，指出最佳排盤工具與直達按鈕：
            </p>
          </div>
          <!-- 召喚靈犀對話按鈕 -->
          <button
            @click="llmStore.openAssistant()"
            class="px-4 py-2 rounded-xl bg-dark-gold/20 hover:bg-dark-gold/30 text-dark-gold border border-dark-gold/50 text-xs font-bold transition-all shadow-sm flex items-center space-x-2 shrink-0 cursor-pointer"
          >
            <span>✨ 找不到答案？點此向 AI 明師直接提問</span>
          </button>
        </div>

        <!-- 11 大情境卡片網格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="sc in scenarios"
            :key="sc.id"
            @click="selectedScenarioId = sc.id"
            class="p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between"
            :class="[
              selectedScenarioId === sc.id
                ? 'bg-dark-gold/15 border-dark-gold shadow-cosmic ring-1 ring-dark-gold/60'
                : 'glass-panel border-dark-gold/20 hover:border-dark-gold/50 hover:bg-dark-gold/5',
            ]"
          >
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xl">{{ sc.icon }}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full border border-dark-gold/30 bg-black/30 text-dark-gold font-sans font-bold">
                  {{ sc.category }}
                </span>
              </div>
              <h3 class="font-bold text-sm sm:text-base text-dark-text mb-1">
                {{ sc.title }}
              </h3>
              <p class="text-xs text-dark-muted leading-relaxed">
                {{ sc.description }}
              </p>
            </div>

            <div class="mt-4 pt-3 border-t border-dark-gold/15 flex items-center justify-between text-[11px]">
              <span class="text-dark-gold font-bold">點擊檢視明師對策 ➔</span>
              <span class="text-dark-muted">{{ sc.recommendedTools.length }} 個專屬工具</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 選中情境之深度問診診斷書 -->
      <div v-if="currentScenario" class="glass-panel p-6 sm:p-8 rounded-2xl border border-dark-gold/40 shadow-cosmic bg-gradient-to-br from-dark-gold/10 via-transparent to-transparent space-y-6">
        <div class="flex items-center space-x-3 border-b border-dark-gold/20 pb-4">
          <span class="text-3xl">{{ currentScenario.icon }}</span>
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-dark-gold font-mono uppercase">Scenario Diagnosis</span>
              <span class="text-xs text-dark-muted">·</span>
              <span class="text-xs text-dark-muted">{{ currentScenario.category }}</span>
            </div>
            <h3 class="text-lg sm:text-xl font-bold text-dark-gold">
              {{ currentScenario.title }}
            </h3>
          </div>
        </div>

        <!-- 明師心法點撥 -->
        <div class="p-4 rounded-xl bg-black/40 border border-dark-gold/25 space-y-2">
          <h4 class="font-bold text-xs text-dark-gold flex items-center space-x-1.5">
            <span>💡</span>
            <span>算命明師心法解構：</span>
          </h4>
          <p class="text-xs sm:text-sm text-dark-text leading-relaxed font-serif">
            {{ currentScenario.masterWisdom }}
          </p>
        </div>

        <!-- 推薦功能模組卡片清單與直達按鈕 -->
        <div class="space-y-3">
          <h4 class="font-bold text-xs text-dark-gold uppercase tracking-wider">
            👉 推薦您按以下順序開啟系統功能進行排盤：
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="tool in currentScenario.recommendedTools"
              :key="tool.path"
              class="p-4 rounded-xl bg-black/30 border border-dark-gold/30 hover:border-dark-gold transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <span class="text-lg">{{ tool.icon }}</span>
                    <span class="font-bold text-sm text-dark-text">{{ tool.name }}</span>
                  </div>
                  <span class="text-[10px] text-dark-gold font-mono px-2 py-0.5 rounded bg-dark-gold/15">
                    {{ tool.focus }}
                  </span>
                </div>
                <p class="text-xs text-dark-muted mt-2 leading-relaxed">
                  {{ tool.reason }}
                </p>
              </div>

              <div class="pt-2 flex items-center justify-between">
                <router-link
                  :to="tool.path"
                  class="px-4 py-1.5 rounded-lg bg-dark-gold text-dark-void font-bold text-xs hover:bg-yellow-500 transition-all shadow-cosmic inline-flex items-center space-x-1"
                >
                  <span>立即開啟排盤</span>
                  <span>↗</span>
                </router-link>
                <span class="text-[10px] text-dark-muted">必備：{{ tool.requiredInput }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 準備資料清單 -->
        <div class="pt-4 border-t border-dark-gold/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-dark-muted">
          <div>
            <span class="text-dark-gold font-bold">📋 問診準備清單：</span>
            <span>{{ currentScenario.preparationTips }}</span>
          </div>
          <button
            @click="llmStore.openAssistant(undefined, `我想諮詢：${currentScenario.title}`)"
            class="text-dark-gold hover:underline font-bold shrink-0 text-left sm:text-right"
          >
            直接讓 AI 顧問以此情境為您診斷 ↗
          </button>
        </div>
      </div>
    </div>

    <!-- 分頁 2：全站功能端點與超連結地圖 -->
    <div v-else-if="activeTab === 'links'" class="space-y-6 animate-fade-in">
      <div class="glass-panel p-6 sm:p-8 rounded-2xl border border-dark-gold/30 shadow-cosmic">
        <div class="border-b border-dark-gold/20 pb-4 mb-6">
          <h2 class="text-lg sm:text-xl font-bold text-dark-gold flex items-center space-x-2">
            <span>🗺️</span>
            <span>萬象天儀全系統網站連結與功能總覽 (Port 5499)</span>
          </h2>
          <p class="text-xs text-dark-muted mt-1">
            本站所有 15 大命理演算法、會員保險庫與管理後台完整端點路徑。點擊即可直接前往該頁面：
          </p>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-dark-gold/30 text-dark-gold font-bold bg-dark-gold/10">
                <th class="py-3 px-4">模組名稱</th>
                <th class="py-3 px-3">站內路徑</th>
                <th class="py-3 px-4">必備生辰/輸入條件</th>
                <th class="py-3 px-4">核心解決問題</th>
                <th class="py-3 px-3 text-right">直達操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-dark-gold/15">
              <tr
                v-for="item in fullLinksDirectory"
                :key="item.path"
                class="hover:bg-dark-gold/5 transition-colors"
              >
                <td class="py-3 px-4 font-bold text-dark-text whitespace-nowrap">
                  <span class="mr-1.5">{{ item.icon }}</span>
                  <span>{{ item.name }}</span>
                </td>
                <td class="py-3 px-3 font-mono text-[11px] text-amber-400 whitespace-nowrap">
                  {{ item.path }}
                </td>
                <td class="py-3 px-4 text-dark-muted max-w-xs">
                  {{ item.input }}
                </td>
                <td class="py-3 px-4 text-dark-text leading-relaxed">
                  {{ item.description }}
                </td>
                <td class="py-3 px-3 text-right whitespace-nowrap">
                  <router-link
                    :to="item.path"
                    class="px-3 py-1 rounded bg-dark-gold/20 hover:bg-dark-gold text-dark-gold hover:text-dark-void border border-dark-gold/40 font-bold transition-all inline-block"
                  >
                    前往 ↗
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 分頁 3：15 大核心模組超詳細操作教學 -->
    <div v-else-if="activeTab === 'manual'" class="space-y-6 animate-fade-in">
      <div class="glass-panel p-6 sm:p-8 rounded-2xl border border-dark-gold/30 shadow-cosmic mb-6">
        <h2 class="text-lg sm:text-xl font-bold text-dark-gold flex items-center space-x-2">
          <span>📚</span>
          <span>15 大命理與星象模組詳細操作教學與解盤心法</span>
        </h2>
        <p class="text-xs text-dark-muted mt-1">
          點擊任一模組展開查看完整操作步驟、輸入參數規範、關鍵指標與大師錦囊：
        </p>
      </div>

      <div class="space-y-4">
        <div
          v-for="mod in moduleManuals"
          :key="mod.id"
          class="glass-panel rounded-2xl border transition-all overflow-hidden"
          :class="expandedManualId === mod.id ? 'border-dark-gold shadow-cosmic bg-dark-gold/5' : 'border-dark-gold/25'"
        >
          <!-- 折疊標題列 -->
          <div
            @click="toggleManual(mod.id)"
            class="p-5 flex items-center justify-between cursor-pointer hover:bg-dark-gold/10 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <span class="text-2xl">{{ mod.icon }}</span>
              <div>
                <div class="flex items-center space-x-2">
                  <h3 class="font-bold text-base text-dark-text">
                    {{ mod.title }}
                  </h3>
                  <span class="text-[10px] font-mono text-dark-gold px-2 py-0.5 rounded bg-dark-gold/15">
                    {{ mod.path }}
                  </span>
                </div>
                <span class="text-xs text-dark-muted block mt-0.5">
                  {{ mod.subtitle }}
                </span>
              </div>
            </div>

            <div class="flex items-center space-x-3">
              <router-link
                :to="mod.path"
                @click.stop
                class="hidden sm:inline-block px-3 py-1 rounded bg-dark-gold text-dark-void font-bold text-xs hover:bg-yellow-500 transition-all shadow-sm"
              >
                直接排盤 ↗
              </router-link>
              <span class="text-dark-gold text-sm font-bold">
                {{ expandedManualId === mod.id ? '▲ 收起' : '▼ 展開指南' }}
              </span>
            </div>
          </div>

          <!-- 折疊展開之超詳細內容 -->
          <div v-show="expandedManualId === mod.id" class="p-5 sm:p-8 border-t border-dark-gold/20 space-y-6 text-xs sm:text-sm leading-relaxed">
            <!-- 1. 模組定位 -->
            <div class="space-y-1.5">
              <h4 class="font-bold text-dark-gold text-xs uppercase tracking-wider">
                🎯 模組定位與適用情境
              </h4>
              <p class="text-dark-text">
                {{ mod.purpose }}
              </p>
            </div>

            <!-- 2. 輸入條件與操作步驟 -->
            <div class="space-y-2">
              <h4 class="font-bold text-dark-gold text-xs uppercase tracking-wider">
                📝 輸入要求與操作步驟
              </h4>
              <ol class="list-decimal list-inside space-y-1.5 text-dark-muted">
                <li v-for="(step, i) in mod.steps" :key="i" class="text-dark-text">
                  {{ step }}
                </li>
              </ol>
            </div>

            <!-- 3. 盤面關鍵指標 -->
            <div class="space-y-2">
              <h4 class="font-bold text-dark-gold text-xs uppercase tracking-wider">
                📊 盤面核心指標與符號解讀
              </h4>
              <ul class="space-y-1.5">
                <li
                  v-for="(indicator, i) in mod.indicators"
                  :key="i"
                  class="flex items-start space-x-2 text-dark-text"
                >
                  <span class="text-dark-gold font-bold">•</span>
                  <span>{{ indicator }}</span>
                </li>
              </ul>
            </div>

            <!-- 4. 算命老師解盤錦囊 -->
            <div class="p-4 rounded-xl bg-black/40 border border-dark-gold/30 space-y-1.5">
              <h4 class="font-bold text-dark-gold text-xs flex items-center space-x-1.5">
                <span>💡</span>
                <span>算命明師解讀錦囊：</span>
              </h4>
              <p class="text-xs text-dark-text leading-relaxed">
                {{ mod.tips }}
              </p>
            </div>

            <div class="pt-2 flex justify-end">
              <router-link
                :to="mod.path"
                class="px-5 py-2 rounded-xl bg-dark-gold text-dark-void font-bold text-xs hover:bg-yellow-500 transition-all shadow-cosmic inline-flex items-center space-x-1.5"
              >
                <span>立即開啟 {{ mod.title }} 實戰排盤</span>
                <span>↗</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部導流 CTA 橫幅 -->
    <div class="mt-16 p-8 rounded-2xl glass-panel border border-dark-gold/40 text-center space-y-4 shadow-cosmic bg-gradient-to-t from-dark-gold/15 via-transparent to-transparent">
      <div class="w-12 h-12 rounded-full border border-dark-gold bg-dark-gold/20 flex items-center justify-center mx-auto text-xl text-dark-gold">
        ✨
      </div>
      <h3 class="text-xl font-bold text-dark-gold">
        想知道您眼前的具體事情，哪一個命理工具最精準？
      </h3>
      <p class="text-xs sm:text-sm text-dark-muted max-w-xl mx-auto leading-relaxed">
        隨時點擊全站右上角的「✨ 天機靈犀」AI 星象顧問，直接告訴他您的困惑（例如：*「我最近想換工作好不好？」* 或 *「想看我跟對象適不適合結婚」*），AI 明師會像面對面的老算命師一樣為您把脈診斷！
      </p>
      <div class="pt-2">
        <button
          @click="llmStore.openAssistant()"
          class="px-8 py-3 rounded-xl bg-dark-gold text-dark-void font-bold text-sm hover:bg-yellow-500 transition-all shadow-cosmic cursor-pointer"
        >
          ✨ 開啟天機靈犀·立即諮詢
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useLlmStore } from '../stores/llm.js';

const llmStore = useLlmStore();
const activeTab = ref<'scenarios' | 'links' | 'manual'>('scenarios');
const tabs = [
  { id: 'scenarios', name: '算命問診情境速查地圖', icon: '🧭' },
  { id: 'links', name: '全站網站連結與功能總覽', icon: '🗺️' },
  { id: 'manual', name: '15 大命理模組超詳細操作教學', icon: '📚' },
];
const selectedScenarioId = ref('career');
const expandedManualId = ref<string | null>('ziwei');
const scenarios = ref<any[]>([]);
const fullLinksDirectory = ref<any[]>([]);
const moduleManuals = ref<any[]>([]);

function toggleManual(id: string) {
  expandedManualId.value = expandedManualId.value === id ? null : id;
}

const currentScenario = computed(() => {
  return scenarios.value.find((s) => s.id === selectedScenarioId.value) || scenarios.value[0];
});

onMounted(async () => {
  const data = await import('../data/userManualData.js');
  scenarios.value = data.scenarios;
  fullLinksDirectory.value = data.fullLinksDirectory;
  moduleManuals.value = data.moduleManuals;
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
