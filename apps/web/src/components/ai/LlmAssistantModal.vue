<template>
  <Teleport to="body">
    <!-- 背景遮罩 (手機端或點擊空白處關閉) -->
    <Transition name="fade">
      <div
        v-if="llmStore.isOpen"
        @click="llmStore.closeAssistant"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:bg-black/40"
      ></div>
    </Transition>

    <!-- 右側滑出抽屜 (Slide-Over Drawer) -->
    <Transition name="slide-right">
      <div
        v-if="llmStore.isOpen"
        class="fixed top-0 right-0 bottom-0 w-full sm:w-[480px] lg:w-[540px] z-50 flex flex-col glass-panel border-l border-dark-gold/30 shadow-2xl transition-colors font-serif pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
      >
        <!-- 頂部標題列 -->
        <div class="px-5 sm:px-6 py-4 border-b border-dark-gold/20 flex items-center justify-between bg-black/10">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-full border border-dark-gold bg-dark-gold/15 flex items-center justify-center shadow-cosmic animate-pulse">
              <span class="text-xs text-dark-gold font-bold">犀</span>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="font-bold text-sm tracking-wide text-dark-gold">
                  天機靈犀·AI 星象顧問
                </h3>
                <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-dark-gold/15 text-dark-gold border border-dark-gold/30 uppercase tracking-widest font-sans">
                  Active LLM
                </span>
              </div>
              <span class="text-[10px] text-dark-muted block">
                融匯東西方六大命理·即時星象解析
              </span>
            </div>
          </div>

          <button
            @click="llmStore.closeAssistant"
            class="p-2 rounded-full border border-dark-gold/20 hover:border-dark-gold hover:bg-dark-gold/10 transition-colors text-dark-muted hover:text-dark-text"
            title="關閉顧問視窗"
          >
            ✕
          </button>
        </div>

        <!-- 當前引用星盤情境 (Context Badge) -->
        <div
          v-if="llmStore.activeContext"
          class="px-5 py-2.5 bg-dark-gold/10 dark:bg-dark-gold/10 light:bg-light-bronze/10 border-b border-dark-gold/20 dark:border-dark-gold/20 light:border-light-bronze/20 flex items-center justify-between text-xs"
        >
          <div class="flex items-center space-x-2 truncate">
            <span class="text-dark-gold font-bold">✨ 引用星盤:</span>
            <span class="px-2 py-0.5 rounded bg-black/40 border border-dark-gold/30 text-dark-gold text-[10px]">
              {{ moduleName(llmStore.activeContext.moduleType) }}
            </span>
            <span class="truncate text-[11px] text-dark-muted dark:text-dark-muted light:text-light-muted">
              {{ llmStore.activeContext.title }} ({{ llmStore.activeContext.summary }})
            </span>
          </div>
          <button
            @click="llmStore.clearContext"
            class="text-[10px] text-dark-muted hover:text-red-400 ml-2 whitespace-nowrap"
            title="解除星盤綁定"
          >
            解除引用
          </button>
        </div>

        <!-- 對話記錄區 -->
        <div ref="chatContainer" class="flex-1 overflow-y-auto p-5 space-y-4 text-xs leading-relaxed">
          <div
            v-for="msg in llmStore.messages"
            :key="msg.id"
            class="flex flex-col"
            :class="msg.role === 'user' ? 'items-end' : 'items-start'"
          >
            <div class="flex items-center space-x-2 mb-1 text-[10px] text-dark-muted dark:text-dark-muted light:text-light-muted">
              <span>{{ msg.role === 'user' ? '求測者' : '諮詢顧問' }}</span>
              <span>{{ msg.timestamp }}</span>
              <span v-if="msg.model" class="text-[9px] text-dark-gold font-mono normal-case opacity-70">[{{ msg.model }}]</span>
            </div>

            <!-- 訊息本體 -->
            <div
              :class="
                msg.role === 'user'
                  ? 'bg-dark-gold/20 text-dark-text border border-dark-gold/40 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%]'
                  : 'bg-black/30 dark:bg-black/30 light:bg-white/60 text-dark-text dark:text-dark-text light:text-light-text border border-dark-gold/15 dark:border-dark-gold/15 light:border-light-bronze/20 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[92%] shadow-sm'
              "
              class="whitespace-pre-wrap font-serif"
            >
              {{ msg.content }}
            </div>
          </div>

          <!-- 🔮 生成中即時思考動畫與秒數計時器 -->
          <div v-if="llmStore.isGenerating" class="p-3.5 bg-black/40 rounded-xl border border-dark-gold/30 text-xs text-dark-gold shadow-cosmic space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="w-2.5 h-2.5 rounded-full bg-dark-gold animate-ping"></span>
                <span class="font-bold tracking-wide">星象推演中，AI 專業顧問正在結合 RAG 知識庫深入思考...</span>
              </div>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-dark-gold/15 text-dark-gold border border-dark-gold/30 font-mono font-bold animate-pulse">
                已耗時 {{ llmStore.elapsedSeconds }}s
              </span>
            </div>
            <div class="flex items-center justify-between text-[10px] text-dark-muted border-t border-dark-gold/15 pt-1.5 font-sans">
              <span>連接模型：<strong class="text-amber-300 font-mono normal-case">{{ llmStore.activeModelName || 'gemma4:e2b' }}</strong></span>
              <span>正在注入命盤坐標與專屬 RAG 推算...</span>
            </div>
          </div>
        </div>

        <!-- 快捷問句建議 -->
        <div class="px-5 py-2 border-t border-dark-gold/10 dark:border-dark-gold/10 light:border-light-bronze/10 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <button
            v-for="prompt in suggestedPrompts"
            :key="prompt"
            @click="sendQuickPrompt(prompt)"
            :disabled="llmStore.isGenerating"
            class="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] border border-dark-gold/25 bg-black/20 hover:bg-dark-gold/15 hover:border-dark-gold text-dark-muted hover:text-dark-gold transition-colors disabled:opacity-40"
          >
            {{ prompt }}
          </button>
        </div>

        <!-- 底部輸入列 -->
        <div class="p-4 border-t border-dark-gold/20 dark:border-dark-gold/20 light:border-light-bronze/20 bg-black/20 dark:bg-black/20 light:bg-white/40">
          <form @submit.prevent="handleSend" class="flex items-center space-x-2">
            <input
              type="text"
              v-model="inputQuery"
              :disabled="llmStore.isGenerating"
              placeholder="向 AI 專業命理顧問諮詢格局特質、決策指引或命理解惑..."
              class="flex-1 bg-black/30 border border-dark-gold/30 rounded-xl px-4 py-2.5 text-base sm:text-xs text-dark-text placeholder-dark-muted/60 focus:outline-none focus:border-dark-gold transition-colors"
            />
            <button
              type="submit"
              :disabled="!inputQuery.trim() || llmStore.isGenerating"
              class="px-4 py-2.5 rounded-xl bg-dark-gold text-dark-void font-bold text-xs hover:bg-yellow-500 transition-colors disabled:opacity-40 shadow-cosmic whitespace-nowrap"
            >
              傳送 ↗
            </button>
          </form>
          <div class="flex items-center justify-between text-[9px] text-dark-muted mt-2 px-1">
            <span>支援 Enter 快速發送</span>
            <span v-if="llmStore.activeContext">已自動附加當前盤面數據</span>
            <span v-else>未附加盤面，回答為普遍玄學義理</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useLlmStore } from '../../stores/llm.js';

const llmStore = useLlmStore();

onMounted(() => {
  llmStore.fetchStatus();
});
const inputQuery = ref('');
const chatContainer = ref<HTMLElement | null>(null);

function moduleName(type: string): string {
  const map: Record<string, string> = {
    ZIWEI: '紫微斗數',
    BAZI: '四柱八字',
    ICHING: '周易卜卦',
    NAME: '姓名學',
    WESTERN: '西洋星盤',
    TAROT: '韋特塔羅',
  };
  return map[type] || type;
}

const suggestedPrompts = computed(() => {
  if (llmStore.activeContext) {
    switch (llmStore.activeContext.moduleType) {
      case 'ZIWEI':
        return ['🌟 請為我深度解析命宮主星與生年四化', '💼 當前大限的事業決策與關鍵貴人', '❤️ 命身格局在情感因緣上的盲點與化解'];
      case 'BAZI':
        return ['🔥 依我八字喜用神，今年適合換工作或創業嗎？', '💧 我的五行能量分佈在健康與財運上的啟示', '📈 未來十年大運走向與關鍵轉折年'];
      case 'ICHING':
        return ['🔮 請深入解讀此卦的變卦爻象與最終結局', '⚖️ 針對目前面臨的重大二選一決策提供指引', '🛡️ 此卦是否有凶象？該如何趨吉避凶？'];
      case 'NAME':
        return ['✨ 此名字的三才五格對人際與家庭運勢的影響', '💡 是否需要配合八字喜用進一步調整字形或筆劃？'];
      case 'WESTERN':
        return ['🪐 請解析我太陽月亮上升三者交織的靈魂藍圖', '🌙 當前月相原型揭示了我怎樣的潛意識安全感需索？'];
      case 'TAROT':
        return ['🎴 這組牌陣最核心要點醒我的靈魂功課是什麼？', '🗝️ 針對逆位牌所呈現的阻礙，具體突破之道為何？'];
    }
  }
  return [
    '🌟 什麼是紫微斗數中的四化星？',
    '☯️ 如何判斷八字身強身弱與喜用神？',
    '🔮 周易六爻卜卦的動爻變卦代表什麼？',
    '🌙 月亮星座與上升星座對性格有何不同影響？',
  ];
});

function sendQuickPrompt(promptText: string) {
  llmStore.sendMessage(promptText);
}

function handleSend() {
  if (!inputQuery.value.trim()) return;
  const q = inputQuery.value;
  inputQuery.value = '';
  llmStore.sendMessage(q);
}

// 監聽訊息列表自動滾動到底部
watch(
  () => llmStore.messages.length,
  async () => {
    await nextTick();
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  }
);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
