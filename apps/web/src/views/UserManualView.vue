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
              <span>一般人找算命老師最常問的 8 大生活難題</span>
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

        <!-- 8 大情境卡片網格 -->
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
            本站所有 12 大命理演算法、會員保險庫與管理後台完整端點路徑。點擊即可直接前往該頁面：
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

    <!-- 分頁 3：12 大核心模組超詳細操作教學 -->
    <div v-else-if="activeTab === 'manual'" class="space-y-6 animate-fade-in">
      <div class="glass-panel p-6 sm:p-8 rounded-2xl border border-dark-gold/30 shadow-cosmic mb-6">
        <h2 class="text-lg sm:text-xl font-bold text-dark-gold flex items-center space-x-2">
          <span>📚</span>
          <span>12 大命理與星象模組詳細操作教學與解盤心法</span>
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
import { ref, computed } from 'vue';
import { useLlmStore } from '../stores/llm.js';

const llmStore = useLlmStore();

const activeTab = ref<'scenarios' | 'links' | 'manual'>('scenarios');

const tabs = [
  { id: 'scenarios', name: '算命問診情境速查地圖', icon: '🧭' },
  { id: 'links', name: '全站網站連結與功能總覽', icon: '🗺️' },
  { id: 'manual', name: '12 大命理模組超詳細操作教學', icon: '📚' },
];

const selectedScenarioId = ref('career');
const expandedManualId = ref<string | null>('ziwei');

function toggleManual(id: string) {
  expandedManualId.value = expandedManualId.value === id ? null : id;
}

// 8 大常見生活算命情境
const scenarios = [
  {
    id: 'career',
    icon: '💼',
    category: '事業與求職',
    title: '工作遇瓶頸，該跳槽、創業還是留任忍耐？',
    description: '面臨轉職抉擇、主管針對、裁員風險或創業開拓，不知當前運勢走勢如何？',
    masterWisdom:
      '事業進退全看「大運氣候」。若大運走正官、七殺或偏財喜用神，正是逆浪進取、積極跳槽的黃金期；若大運走忌仇星或歲運相沖，則應以守為攻，在原單位累積實力。若有兩個具體 Offer 猶豫不決，六爻動爻可直斷半年成敗。',
    preparationTips: '個人國曆或農曆出生年月日時辰（不知時辰可先用周易卜卦）。',
    recommendedTools: [
      {
        path: '/bazi',
        name: '四柱八字與十年大運',
        icon: '📜',
        focus: '長遠大運走勢',
        reason: '檢視日主身強身弱與喜用神，確認未來 10 年大運是否走官殺貴人運或財星生旺運。',
        requiredInput: '精確生辰年月日時',
      },
      {
        path: '/ziwei',
        name: '紫微斗數排盤',
        icon: '🌌',
        focus: '官祿宮與四化動能',
        reason: '查看官祿宮與財帛宮主星廟旺，檢視今年流年四化星（化祿在何宮、化權在何處）。',
        requiredInput: '精確生辰年月日時',
      },
      {
        path: '/iching',
        name: '周易六爻卜卦',
        icon: '☯️',
        focus: '具體 Offer 二選一決策',
        reason: '手中已有具體公司在猶豫時，六爻動爻直接指出半年內該公司的實際成果與人事險阻。',
        requiredInput: '心中專注默想單一問題',
      },
    ],
  },
  {
    id: 'relationship',
    icon: '💕',
    category: '婚戀與親密關係',
    title: '我們適不適合結婚？未來會不會常吵架或離婚？',
    description: '交往中想看雙方契合度、是否為彼此正緣、婚後婆媳相處與通關化解。',
    masterWisdom:
      '世上沒有 100% 完美的八字。真正的合婚在於知曉彼此性格盲點與五行消長，借通關五行與生活起居調和化剋為生。紫微斗數更強調「雙宮聯參」——看婚姻絕不能只看夫妻宮，福德宮（深層福祿與感情包容心）更是長相廝守的關鍵。',
    preparationTips: '雙方的性別與出生年月日時（對方不知時辰仍可比對年月日天干五合與夫妻宮地支）。',
    recommendedTools: [
      {
        path: '/synastry',
        name: '八字合婚與紫微雙宮聯參',
        icon: '💍',
        focus: '五維契合與通關五行',
        reason: '演算天干五合、地支合沖、五行互補評分，並直接給出夫妻爭執時的通關五行藥方。',
        requiredInput: '雙方生辰年月日時',
      },
      {
        path: '/tarot',
        name: '78 張經典偉特塔羅',
        icon: '🃏',
        focus: '當下心結與潛意識',
        reason: '抽時間之流牌陣或聖三角牌陣，直擊雙方內心未說出口的恐懼、隱藏渴望與近期走向。',
        requiredInput: '心中專注默想這段感情',
      },
    ],
  },
  {
    id: 'decision',
    icon: '🧭',
    category: '重大急事與抉擇',
    title: '面臨人生重大二選一，心亂如麻該如何決斷？',
    description: '出國留學 vs 考公職？投資買房 vs 租房觀望？合約該不該簽？',
    masterWisdom:
      '「至誠感通，動爻定局。」當理性邏輯推導陷入僵局，說明潛意識與外部場域存在盲點。周易六爻之動爻能直斷客觀局勢吉凶，塔羅二選一牌陣則能對比兩條路徑的心態與代價。',
    preparationTips: '起卦前深呼吸三次，在心中默想單一、清晰的具體問題。',
    recommendedTools: [
      {
        path: '/iching',
        name: '周易六爻卜卦與梅花易數',
        icon: '☯️',
        focus: '客觀事態成敗吉凶',
        reason: '3 枚銅錢投擲模擬老陽老陰動爻，推算出本卦與變卦，直接對照 384 爻辭吉凶。',
        requiredInput: '無須生辰，專注默想',
      },
      {
        path: '/tarot',
        name: '塔羅二選一決策牌陣',
        icon: '🃏',
        focus: '兩條路徑全景對比',
        reason: '以 5 張牌直接對照選擇 A 與選擇 B 各自面臨的心態、外部阻力與未來結局。',
        requiredInput: '無須生辰，洗牌抽牌',
      },
    ],
  },
  {
    id: 'naming',
    icon: '👶',
    category: '新生兒命名與改名',
    title: '剛生寶寶想取個好名字，或自己想改名補運？',
    description: '渴望名字好聽、吉利，且能精準補足先天八字五行缺損與三才五格吉數。',
    masterWisdom:
      '正統姓名學必須「八字喜用神為本，康熙正統筆劃為用」。不可只盲信網路流行筆畫，若命中缺水卻取了補火之名，反加劇五行失衡。以康熙正統部首換算五格 81 數理，方能福澤一生。',
    preparationTips: '生辰年月日時辰（計算先天喜用神）以及家族姓氏。',
    recommendedTools: [
      {
        path: '/naming',
        name: '姓名學三才五格與喜用起名',
        icon: '✍️',
        focus: '康熙筆劃 + 喜用補缺',
        reason: '自動計算天人地總外五格 81 數理、125 種三才生剋，並自動篩選補足喜用五行之吉名。',
        requiredInput: '姓氏、生辰年月日時',
      },
    ],
  },
  {
    id: 'family',
    icon: '🏠',
    category: '家庭和睦與風水',
    title: '家裡氣氛很差、小孩叛逆冷戰，房間方位有問題？',
    description: '想檢視全家人五行場域是否相剋，以及臥室床位是否符合《周易》後天八卦名位。',
    masterWisdom:
      '「名位相等，各安其位，長幼有序。」家庭常有長幼失序之困擾，往往導因於陽宅臥室名位顛倒（例如兒子住進西北乾位成雷天大壯卦，孩子在家中氣焰壓過父母）。擺正位置，心氣自然通順。',
    preparationTips: '全體家庭成員（父母、子女）生辰年月日時。',
    recommendedTools: [
      {
        path: '/synastry',
        name: '家庭群組比對與後天八卦名位',
        icon: '👨‍👩‍👧‍👦',
        focus: '全家五行場域 + 八卦房間',
        reason: '聚合全家五行場域，提供父西北乾位、母西南坤位、長子正東震位之空間配置指南。',
        requiredInput: '多位家庭成員生辰',
      },
    ],
  },
  {
    id: 'odyssey',
    icon: '⏳',
    category: '人生天命與全景回顧',
    title: '人到中年感到迷茫，我的一生天命與晚年景況如何？',
    description: '想全景俯瞰 0~100 歲的時間軸、經歷大風大浪後的終局評價與人生宿命。',
    masterWisdom:
      '人生是一場壯麗的宇宙冒險。八字決定先天大氣候，而每一個十字路口的抉擇決定了您的榮光與遺憾。在百歲推演中審視一生，方能看破執念、豁達行世。',
    preparationTips: '出生生辰年月日時，可自訂 5 位女性友人生日進行年齡動態對齊。',
    recommendedTools: [
      {
        path: '/simulator',
        name: '百歲流年·模擬一生系統',
        icon: '⏳',
        focus: '0~100歲時間軸與蓋棺錄',
        reason: '101 個年輪節點敘事、台灣歷史時代風貌、紅顏盲盒邂逅、四大自傳視角與 80 億分之一揭曉。',
        requiredInput: '出生年月日時',
      },
      {
        path: '/bazi',
        name: '四柱八字與十年大運',
        icon: '📜',
        focus: '一生大運十神起伏',
        reason: '看清各階段大運交脫年與干支五行旺衰。',
        requiredInput: '出生年月日時',
      },
    ],
  },
  {
    id: 'almanac',
    icon: '📅',
    category: '日常擇吉與出行',
    title: '明天要簽大合約/開工動土/買車交車，挑什麼時辰好？',
    description: '想挑選黃道吉日、避開相沖生肖，並找出當日財神方與青龍明堂吉時。',
    masterWisdom:
      '出行辦事順應天時，則事半功倍。建除十二神（成日、定日宜簽約，破日、閉日避之），配合當日相沖生肖與時辰黃黑道，能幫您在關鍵商務或家事中避開無謂阻礙。',
    preparationTips: '預計辦事的國曆日期。',
    recommendedTools: [
      {
        path: '/almanac',
        name: '每日通勝黃曆大盤',
        icon: '📅',
        focus: '建除十二神 + 時辰吉凶',
        reason: '提供建除十二神、廿八宿禽星、喜神財神吉方、相沖生肖與十二時辰青龍吉時輪盤。',
        requiredInput: '查詢日期',
      },
    ],
  },
  {
    id: 'rhythm',
    icon: '🗓️',
    category: '流年行運與身心調神',
    title: '今年運勢如何？該如何規劃生活起居以逢凶化吉？',
    description: '想了解今年十二流月的月令四化，並透過作息睡眠、五味飲食與運動達到命局諧振。',
    masterWisdom:
      '命在天，運在時，修在人。五行生剋不僅是抽象算盤，更是具體的早睡補水、運動疏肝、曬太陽充心火。讓作息與流年火木土金水共振，是最高級的養生與改命。',
    preparationTips: '出生生辰年月日時與目標流年年份（如 2026）。',
    recommendedTools: [
      {
        path: '/annual-calendar',
        name: '流年生活行運曆與起居規劃',
        icon: '🗓️',
        focus: '十二流月曆 + 五行諧振',
        reason: '排演五虎遁十二流月曆、登錄日常作息日記，計算五行諧振評分並產出年度生活規劃書。',
        requiredInput: '生辰 + 目標流年',
      },
    ],
  },
];

const currentScenario = computed(() => {
  return scenarios.find((s) => s.id === selectedScenarioId.value) || scenarios[0];
});

// 全站網站連結指南清單
const fullLinksDirectory = [
  { path: '/ziwei', name: '紫微斗數排盤', icon: '🌌', input: '出生年月日時辰、性別、出生地', description: '推排命宮身宮十二宮位、十四主星亮度、生年四化、十年大限、流年小限行運大盤與三合格局識別。' },
  { path: '/bazi', name: '四柱八字論命', icon: '📜', input: '出生年月日時辰、性別、出生地', description: '太陽黃經 24 節氣四柱排盤、地支藏干十神對照、五行能量百分比、日主身強身弱與喜用神判定、十年大運走勢。' },
  { path: '/simulator', name: '百歲流年·模擬一生', icon: '⏳', input: '本命生辰、女性友人生日 KEYIN', description: '0~100 歲流年年輪敘事、台灣歷史大事紀擬真、紅顏盲盒相遇與好感度、四大領域動態演化、終局蓋棺錄四大視角。' },
  { path: '/synastry', name: '八字合婚與天機合盤', icon: '💍', input: '雙方性別與生辰年月日時', description: '天干五合、地支合沖、五行互補評分、夫妻矛盾通關五行妙方、三合天機夫妻宮與福德宮雙宮聯參鐵律。' },
  { path: '/synastry', name: '家庭群組與後天八卦名位', icon: '👨‍👩‍👧‍👦', input: '全體家庭成員生辰與角色代碼', description: '全家五行場域聚合、$C(N, 2)$ 關係矩陣、家族角色賦能、《周易》後天八卦名位相等陽宅臥房配置指南。' },
  { path: '/annual-calendar', name: '流年行運曆與生活規劃', icon: '🗓️', input: '生辰、目標流年、日常生活紀錄', description: '五虎遁起月十二流月曆、歲君四化、睡眠/飲食/運動作息追蹤、五行諧振評分 (0-100分) 與年度生活規劃書。' },
  { path: '/almanac', name: '每日通勝黃曆大盤', icon: '📅', input: '查詢國曆日期 (預設今日)', description: '農曆歲次、建除十二神值日吉凶、廿八宿禽星、每日精選宜忌、喜神財神方位、受沖生肖與十二時辰吉凶。' },
  { path: '/iching', name: '周易六爻卜卦與梅花易數', icon: '☯️', input: '心中默想之具體問題', description: '3 枚銅錢投擲金錢卦 / 梅花易數先天數理起卦、本卦/互卦/錯卦/綜卦/變卦(動爻)、384 爻辭與世應爻位。' },
  { path: '/naming', name: '姓名學三才五格起名', icon: '✍️', input: '姓氏、現有名稱 / 生辰喜用', description: '康熙字典正統部首筆劃、天人格總外五格 81 數理吉凶、125 種三才五行格局、配合八字喜用神補缺起名推薦。' },
  { path: '/western', name: '西洋本命星盤與月相', icon: '♈', input: '出生年月日時辰、城市經緯度', description: '開普勒天體坐標十大行星、上升ASC/天頂MC四軸、五大主要相位網格、八大月相原型與月亮潛意識報告。' },
  { path: '/tarot', name: '78 張經典偉特塔羅占卜', icon: '🃏', input: '選擇牌陣與抽牌張數', description: '22 大阿爾克那 + 56 小阿爾克那、3D 牌桌洗牌、正逆位牌義、5 大經典牌陣（單張/時間流/聖三角/二選一/十字）。' },
  { path: '/qizheng', name: '七政四餘皇家天星盤', icon: '🪐', input: '出生年月日時辰、城市經緯度', description: '七政四餘天球坐標、二十八宿度數入宿、十二辰次、人事十二宮、恩星難星仇星用星格局。' },
  { path: '/vault', name: '個人命盤保險庫與隨筆', icon: '🏛️', input: '會員登入或 DEMO 身分', description: '親友生辰經緯度檔案庫一鍵載入、個人測算感悟筆記日記。' },
  { path: '/admin/dashboard', name: '後台 CMS 管理中樞', icon: '⚙️', input: '管理員權限 (ADMIN Role)', description: '數據大盤、SQLite 快照備份還原、解讀辭庫在線熱編修與 JSON 匯出匯入、會員管理、LLM 參數與 SSRF 防護。' },
];

// 12 大模組超詳細操作手冊清單
const moduleManuals = [
  {
    id: 'ziwei',
    title: '紫微斗數排盤與大限行運',
    icon: '🌌',
    path: '/ziwei',
    subtitle: '東方帝皇之術 · 命宮為本 · 三方為用 · 行運大盤',
    purpose: '全面解析一生事業、財帛、婚姻、人際與健康之先天格局；推演大限（十年）、流年（一年）與小限的吉凶時機。',
    steps: [
      '於上方選擇性別（乾造為男、坤造為女）。',
      '切換國曆（西曆）或農曆（陰曆），選擇出生的年、月、日以及精確的時辰。',
      '確認出生地點經緯度（系統預設台北 121.56°，自動計算真太陽時與均時差）。',
      '點擊「🌟 啟動紫微斗數排盤」按鈕，中央即時繪製十二宮位天盤。',
      '可在下方「行運大盤」輸入指定目標年份（如 2026），即時推排大限宮位、流年歲次與小限四化星。',
    ],
    indicators: [
      '命宮主星：象徵先天精神原型與核心才能（紫微為帝座、武曲為正財將星、天機為戰略智囊等）。',
      '五行局：水二局、木三局、金四局、土五局、火六局，決定起大限的歲數起點。',
      '生年四化：化祿（收穫機遇）、化權（掌控實權）、化科（名望聲譽）、化忌（執念與課業功課）。',
      '廟旺平陷：星曜光芒強度，廟旺吉星能量最順，落陷則考驗意志。',
    ],
    tips: '三合心法：「命宮為本，三方為用。」看事業不能只看命宮，必須官祿宮、財帛宮、遷移宮三方互拱合參；人事努力加上空間規劃（2/3）必定大於天命（1/3）！',
  },
  {
    id: 'bazi',
    title: '四柱八字論命與十神大運',
    icon: '📜',
    path: '/bazi',
    subtitle: '子平真詮 · 滴天髓 · 陰陽五行消長 · 喜用神中和',
    purpose: '分析個人出生時的天地五行磁場，推算身強身弱、找出補偏救弊的喜用神，並查看未來每步十年大運之吉凶趨勢。',
    steps: [
      '輸入出生年月日時辰與性別。',
      '系統依據天文精確 24 節氣交節分秒，精確切換年月柱干支。',
      '點擊「📜 啟動八字排盤」，系統輸出年月日時四柱與地支藏干。',
      '檢視右側「五行能量分佈儀表板」與「喜用神」判定結果。',
      '橫向滑動下方「十年大運時間軸」，點選任一大運檢視該階段之十神起伏。',
    ],
    indicators: [
      '日元（日主天干）：代表「我自身」，如甲木、丙火、戊土、庚金、壬水。',
      '十神生剋：生我者為正偏印（貴人）、剋我者為正官七殺（考驗掌權）、我生者為食神傷官（才華）、我剋者為正偏財（財富）、同我者為比劫（同儕）。',
      '喜用神：命中損有餘而補不足的平衡關鍵，例如日主太旺需官殺克制或食傷洩秀。',
    ],
    tips: '「命好不如運好，運好不如行好。」大運順風時宜大膽拓展，大運逆風時宜修德蓄力、戒急用忍，方為知命之君子。',
  },
  {
    id: 'simulator',
    title: '百歲流年·模擬一生系統',
    icon: '⏳',
    path: '/simulator',
    subtitle: '1845清代起 · 台灣時代浪潮 · 0-100歲年輪 · 蓋棺錄',
    purpose: '將八字命盤與台灣 1845~2060+ 年歷史大事紀、各年代人口壽命與公衛時疫融合，經歷一生的重大轉折抉擇與終局自傳。',
    steps: [
      '輸入您的生辰八字與性別。',
      '（選填）在下方為 5 位女性友人個別 KEYIN 生日，系統自動根據西曆年代對齊年齡差。',
      '點擊「⏳ 起局推演百年人生」，系統即刻在 0ms 內生成 101 個年輪節點與四大領域數值。',
      '檢視主舞台當年的時代背景事件與歲月年輪敘事；在轉折年與大凶大吉年依據彩色命理錦囊做出抉擇。',
      '百歲圓滿或壽元終局時，秒開《一生行誼·蓋棺錄》彈窗，自由切換三大視角與【80億分之一的遊戲】真容揭曉！',
    ],
    indicators: [
      '四大領域數值：❤️ 體魄健康 (`health`)、📖 知識才識 (`knowledge`)、🪙 財富資產 (`wealth`)、🌸 情感眷屬 (`relationship`)。',
      '時代平均壽命徽章：反映所屬歷史公衛水平（清代 35 歲、現代 81.5 歲），年齡達到時代臨界時生理自然衰退。',
      '命理決策錦囊：大凶年（避煞守成）、大吉年（乘風破浪）、轉折年（立足長遠）。',
    ],
    tips: '人生沒有重來，但推演可以讓我們在虛擬時空中體悟生老病死與時代無常，從而更懂得珍惜當下的每一個選擇。',
  },
  {
    id: 'synastry',
    title: '八字合婚與紫微雙宮聯參合盤',
    icon: '💍',
    path: '/synastry',
    subtitle: '天干五合 · 夫妻宮合沖 · 通關五行 · 雙宮聯參鐵律',
    purpose: '深度診斷男女雙方的婚戀默契、五行互補指數，並提供化解夫妻日常口角爭執的通關五行生活佈局。',
    steps: [
      '輸入男方（甲方）姓名、性別與生辰年月日時。',
      '輸入女方（乙方）姓名、性別與生辰年月日時。',
      '點擊「💍 啟動八字與紫微雙軌合盤」，系統輸出五維契合度雷達與星級評分。',
      '查看「通關五行金鑰」，獲取專屬穿著顏色、居家臥房方位與相處建議。',
      '點擊「✨ 呼叫天機靈犀」為雙方合盤生成長篇諮詢診斷。',
    ],
    indicators: [
      '天干五合：甲己合土、乙庚合金、丙辛合水、丁壬合木、戊癸合火，象徵天然吸引力。',
      '地支夫妻宮：六合三合主情投意合，相沖相刑主生活習慣需包容磨合。',
      '雙宮聯參：看婚姻必看夫妻宮（顯性互動）與福德宮（深層福分與包容心）。',
    ],
    tips: '「合婚在於知長短，互體諒以成美眷。」若雙方命局五行相剋，切莫迷信分手，善用系統給出的「通關五行」即可化剋為生。',
  },
  {
    id: 'iching',
    title: '周易六爻卜卦與梅花易數',
    icon: '☯️',
    path: '/iching',
    subtitle: '文王金錢卦 · 梅花易數 · 本卦互卦變卦 · 384 爻辭',
    purpose: '針對具體特定事件（如面試能不能上、合約該不該簽、失物能否尋回）進行即時推演與吉凶斷定。',
    steps: [
      '在心中澄靜默想一個具體問題。',
      '選擇「🪙 三銅錢金錢卦」手動搖卦 6 次，或點擊「🌸 梅花易數數理起卦」即時生成。',
      '系統自動判定老陽(9)、少陽(7)、少陰(8)、老陰(6) 生成六十四卦本卦。',
      '動爻自動觸發之卦（變卦），並繪製互卦、錯卦與綜卦幾何對照矩陣。',
      '檢視世爻、應爻與動爻對應之 384 爻辭古籍出處與白話解讀。',
    ],
    indicators: [
      '世爻：代表求問者自己或我方現狀。',
      '應爻：代表所問之事、對方或目標客戶。',
      '動爻：事情演變之關鍵轉折點（老陽變少陰、老陰變少陽）。',
    ],
    tips: '「易為君子謀，至誠感通。」同一件事在時空局勢未有實質改變前，嚴禁反覆連續占問。',
  },
  {
    id: 'tarot',
    title: '78 張經典偉特塔羅牌占卜',
    icon: '🃏',
    path: '/tarot',
    subtitle: '1909 公有領域牌面 · 3D 洗牌 · 5 大牌陣 · 榮格原型',
    purpose: '藉由符號象徵學與潛意識投射，看清人際情感、心理盲點、事業兩難時的心靈真實狀態。',
    steps: [
      '選擇占卜牌陣（單張啟示、時間之流、聖三角、二選一、塞爾特十字 10 張）。',
      '心中默想問題，點擊「🔀 開始真隨機洗牌」。',
      '在 3D 牌桌上點擊或拖曳抽取相應張數的牌卡。',
      '翻開牌面，檢視正位（能量順暢）與逆位（能量受阻或內省轉化）之專業深度解析。',
    ],
    indicators: [
      '大阿爾克那 (22張)：象徵重大靈魂功課與生命轉折（愚者到世界）。',
      '小阿爾克那 (56張)：四元素（權杖火-行動、聖杯水-情感、寶劍風-思維、錢幣土-物質）。',
    ],
    tips: '塔羅牌是心靈的鏡子。牌卡呈現的不是固定不變的死局，而是當下能量的投射；只要改變思維與行動，未來就能隨之翻轉！',
  },
  {
    id: 'naming',
    title: '姓名學三才五格與八字喜用起名',
    icon: '✍️',
    path: '/naming',
    subtitle: '康熙字典筆劃 · 81 數理吉凶 · 125 種三才格局',
    purpose: '檢驗現有名稱數理吉凶，或依據新生兒出生八字之喜用神缺損，推薦兼具高分五格與五行平衡的佳名。',
    steps: [
      '若要檢測現有名稱：輸入姓氏與名字，點擊「🔍 檢測現有名稱吉凶」。',
      '若要起名推薦：切換分頁，輸入寶寶出生年月日時（演算喜用神）與姓氏。',
      '點擊「✨ 依八字喜用智能推薦好名」，系統即刻篩選高分吉祥字組合。',
    ],
    indicators: [
      '天格、人格、地格、總格、外格：人格主主運性格、地格主前運家庭、總格主後運成就。',
      '81 數理：區分大吉、半吉、凶數。',
      '三才生剋：天人地三才五行順生最吉，相剋則多波折。',
    ],
    tips: '姓名學必須以「八字喜用神」為根基。字形部首的五行必須精準補足命局所缺，方能相得益彰。',
  },
  {
    id: 'almanac',
    title: '每日通勝黃曆與生肖運勢',
    icon: '📅',
    path: '/almanac',
    subtitle: '建除十二神 · 廿八星宿 · 九星飛泊 · 時辰吉凶',
    purpose: '查詢每日吉凶宜忌、出行簽約良辰吉時、避開煞氣方位與相沖生肖。',
    steps: [
      '預設載入今日完整農民曆與黃曆大盤。',
      '可於頂部選擇未來任意國曆日期進行排查。',
      '查看當日「建除十二神」日相與精選宜忌標籤。',
      '核對受沖生肖與「喜神、財神、福神」方位，商務座向可借力吉方。',
      '查看十二時辰輪盤，挑選青龍、天德等吉時進行簽約或出門。',
    ],
    indicators: [
      '建除十二神：建、除、滿、平、定、執、破、危、成、收、開、閉。',
      '廿八星宿：禽星值日歌訣。',
      '三煞方位：當日煞東、煞南、煞西或煞北，動土修造宜避之。',
    ],
    tips: '「擇日不如擇時，擇時不如擇善。」天時固然重要，心存正念、行事嚴謹方為真正之吉祥。',
  },
  {
    id: 'annual-calendar',
    title: '流年生活行運曆與起居規劃',
    icon: '🗓️',
    path: '/annual-calendar',
    subtitle: '五虎遁十二流月 · 歲君四化 · 起居五行諧振評分',
    purpose: '為目標流年制定完整的十二流月行運節奏，將日常生活作息、睡眠、飲食與運動和本命喜用五行共振調神。',
    steps: [
      '輸入出生八字生辰與目標流年年份（預設當前年）。',
      '系統自動推演五虎遁十二流月曆、月十神與流月四化。',
      '在下方登錄近期的作息睡眠、五味飲食、飲水與運動數據。',
      '點擊「評估五行諧振」，檢視 0~100 分的生活滋養度雷達。',
      '點擊「✨ 召喚靈犀 AI 年度生活顧問」產出落地的年度生活起居行動規劃書。',
    ],
    indicators: [
      '五虎遁月干支：目標流年每個月的精確天干地支與值月十神。',
      '五行諧振評分：起居生活方式與命盤喜用神的契合度（80 分以上為極佳共振）。',
    ],
    tips: '早睡養腎水、晨走疏肝木、陽光充心火、清淡健脾土、深呼吸潤肺金；起居有常，天命自然亨通。',
  },
  {
    id: 'western',
    title: '西洋本命星盤與月相原型',
    icon: '♈',
    path: '/western',
    subtitle: '開普勒行星幾何 · ASC/MC四軸 · 五大相位 · 榮格原型',
    purpose: '以現代人本占星學視角，解析個人太陽意識意志、月亮潛意識安全感、上升人格面具與靈魂功課。',
    steps: [
      '輸入出生年月日時分與出生地經緯度。',
      '系統以純 TypeScript Meeus 演算法計算十大行星黃經坐標與 Placidus 宮位。',
      '檢視本命黃道星盤輪盤、四軸（上升 ASC、天頂 MC）與五大相位容許度網格。',
      '閱讀「八大月相靈魂原型」與月亮星座深度潛意識報告。',
    ],
    indicators: [
      '日升月核心：太陽（我是誰）、月亮（我需要什麼安全感）、上升點（我如何看待世界）。',
      '五大相位：合相 (0°)、六分相 (60°)、四分相 (90°)、三分相 (120°)、對分相 (180°)。',
    ],
    tips: '星盤是宇宙給您的靈魂地圖。行星沒有好壞之分，刑衝相往往是激發生命最大突破潛能的黃金催化劑。',
  },
  {
    id: 'qizheng',
    title: '七政四餘皇家天星盤',
    icon: '🪐',
    path: '/qizheng',
    subtitle: '皇家秘傳天星 · 二十八宿入宿度數 · 十二辰次 · 恩難四星',
    purpose: '探究中國古代皇家級宮廷天星學，推演七政（日月五星）與四餘（羅睺、計都、月孛、紫炁）黃道天球坐標。',
    steps: [
      '輸入出生年月日時與出生地經緯度。',
      '系統精確排布七政四餘天星度數、二十八星宿入宿與十二辰次。',
      '檢視命宮、身宮、十二人事宮位與恩難仇用四星格局。',
    ],
    indicators: [
      '七政四餘：日、月、水、金、火、木、土加上羅計氣孛四大隱曜。',
      '恩難仇用：恩星生我、用星助我、難星剋我、仇星洩我。',
    ],
    tips: '七政四餘為東方天星學之巔峰，結合宿度與辰次，能細緻觀照靈魂深層的天命星宿感召。',
  },
  {
    id: 'vault',
    title: '命盤雲端保險庫與測算日記',
    icon: '🏛️',
    path: '/vault',
    subtitle: '親友檔案雲端典藏 · 測算感悟日記 · 一鍵快速載盤',
    purpose: '永久妥善儲存您自己與親友的生辰經緯度檔案，隨時一鍵帶入任一排盤功能，並記錄歷史占卜感悟。',
    steps: [
      '登入正式會員帳號或啟用 DEMO 體驗模式。',
      '點擊「新增命盤檔案」，輸入親友姓名、關係、生辰與出生地儲存入庫。',
      '在任何排盤介面，點擊「快速載入」，即可一秒填妥所有欄位。',
      '於測算日記區隨時記錄每次占卜的卦象心得與日後應驗驗證。',
    ],
    indicators: [
      'Bcrypt 雜湊加密與 JWT 鑑權，保障個人隱私絕對安全。',
    ],
    tips: '將親友檔案妥善存於保險庫，逢年過節或面臨家庭重大決策時，即可一鍵調閱合婚或群組分析，極為便利！',
  },
];
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
