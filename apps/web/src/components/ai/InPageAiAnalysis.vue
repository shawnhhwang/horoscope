<template>
  <section class="in-page-ai-section w-full my-8 glass-panel rounded-2xl overflow-hidden border border-dark-gold/30 shadow-cosmic transition-all font-serif">
    <!-- 1. 待命狀態 (Idle: 尚未發起 LLM 解析) -->
    <div v-if="status === 'idle'" class="p-6 sm:p-8 text-center space-y-4 bg-gradient-to-b from-dark-gold/10 via-transparent to-transparent">
      <div class="flex items-center justify-center space-x-2 text-dark-gold">
        <span class="text-xl">✨</span>
        <h4 class="font-bold text-base sm:text-lg tracking-wider text-gold-gradient">AI 專業命理與星象全盤深度診斷</h4>
        <span class="text-xl">✨</span>
      </div>
      <p class="text-xs sm:text-sm text-dark-muted max-w-2xl mx-auto leading-relaxed font-serif">
        將當前排盤之完整干支、星曜坐標、相位度數與五行神煞全面提煉，即時注入專屬角色 RAG 領域知識庫與配置之大語言模型（<strong class="text-amber-400 dark:text-amber-400 light:text-amber-800 font-mono font-bold normal-case">{{ activeModel }}</strong>），直接於下方展開結構化專業諮詢報告。
      </p>
      <div class="pt-2">
        <button
          @click="startAnalysis"
          class="px-8 py-3 rounded-xl font-bold text-sm bg-dark-gold text-dark-void hover:bg-yellow-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-cosmic inline-flex items-center space-x-2.5 cursor-pointer font-serif"
        >
          <span>{{ buttonText || '✨ 啟動專業 AI 顧問·全盤深度診斷' }}</span>
          <span class="text-[11px] bg-black/25 dark:bg-black/25 light:bg-black/10 px-2 py-0.5 rounded font-mono font-normal">實時推演</span>
        </button>
      </div>
    </div>

    <!-- 2. 思考中狀態 (Loading: 正在呼叫本地/外部 LLM 深度思考，即時動態碼表計時) -->
    <div v-else-if="status === 'loading'" class="p-8 sm:p-10 space-y-5 bg-dark-nebula/60 dark:bg-dark-nebula/60 light:bg-amber-50/70 border border-dark-gold/30 light:border-amber-300/60 rounded-2xl">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-gold/20 light:border-amber-300/40 pb-5">
        <div class="flex items-center space-x-3.5">
          <!-- 宇宙星環旋轉動態 -->
          <div class="relative w-9 h-9 flex items-center justify-center shrink-0">
            <span class="absolute inset-0 rounded-full border-2 border-dark-gold border-t-transparent animate-spin"></span>
            <span class="w-3.5 h-3.5 rounded-full bg-dark-gold animate-ping"></span>
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h4 class="font-bold text-sm sm:text-base text-dark-gold light:text-amber-900 tracking-wide">星象運轉中，AI 專業顧問正在深度推演全盤數據...</h4>
            </div>
            <span class="text-xs text-dark-muted block mt-1 font-sans">
              連線目標模型：<strong class="text-amber-400 dark:text-amber-400 light:text-amber-800 font-mono font-bold normal-case">{{ activeModel }}</strong>
            </span>
          </div>
        </div>

        <!-- 即時思考碼表計時器 -->
        <div class="flex items-center space-x-2 self-start sm:self-auto">
          <span class="text-xs text-dark-muted">已深入思考：</span>
          <span class="px-3.5 py-1.5 rounded-full bg-dark-gold/20 dark:bg-dark-gold/20 light:bg-amber-100 text-dark-gold dark:text-dark-gold light:text-amber-900 border border-dark-gold/40 light:border-amber-400/60 text-xs sm:text-sm font-mono font-bold animate-pulse shadow-sm">
            ⏱️ {{ elapsedSeconds }} 秒
          </span>
        </div>
      </div>

      <!-- 進度指示條光暈動畫 -->
      <div class="w-full bg-black/50 dark:bg-black/50 light:bg-amber-100 h-2 rounded-full overflow-hidden border border-dark-gold/20 light:border-amber-300/50 relative">
        <div class="h-full bg-gradient-to-r from-amber-500 via-dark-gold to-yellow-200 animate-pulse w-full"></div>
      </div>

      <div class="text-xs text-dark-muted leading-relaxed flex items-center justify-between font-serif">
        <span>正在將當前排盤坐標與專屬角色 RAG 領域知識全面合成進行深度推理...</span>
        <span class="text-xs text-dark-gold light:text-amber-800 font-mono hidden sm:inline">深度診斷中</span>
      </div>
    </div>

    <!-- 3. 解析完成狀態 (Completed: 全幅展開長文，支援標準 Markdown 格式) -->
    <div v-else-if="status === 'completed'" class="p-6 sm:p-8 space-y-6">
      <!-- 頂部資訊列：標題、模型、耗時、折疊按鈕 -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-gold/20 light:border-light-bronze/25 pb-4">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded-full bg-dark-gold/15 dark:bg-dark-gold/15 light:bg-amber-100 border border-dark-gold light:border-amber-600 flex items-center justify-center text-dark-gold light:text-amber-900 text-xs font-bold shadow-sm shrink-0">
            諮
          </div>
          <div>
            <h4 class="font-bold text-base text-gold-gradient tracking-wide">
              專業 AI 命理與星象深度診斷報告
            </h4>
            <span class="text-xs text-dark-muted block mt-0.5 font-serif">
              依據當前排盤坐標與專屬角色 RAG 知識庫實時演繹 · 專業客觀諮詢
            </span>
          </div>
        </div>

        <!-- 規格標籤群與折疊按鈕 -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="px-2.5 py-1 rounded-full bg-emerald-950/60 dark:bg-emerald-950/60 light:bg-emerald-50 border border-emerald-500/40 light:border-emerald-300 text-emerald-300 dark:text-emerald-300 light:text-emerald-800 text-[11px] font-mono">
            {{ source === 'external_api' ? '實時大模型推演' : '專業 RAG 深度診斷' }}
          </span>
          <span class="px-2.5 py-1 rounded-full bg-dark-gold/15 dark:bg-dark-gold/15 light:bg-amber-100 border border-dark-gold/30 light:border-amber-300 text-dark-gold dark:text-dark-gold light:text-amber-900 text-[11px] font-mono font-bold normal-case">
            {{ model }}
          </span>
          <span class="px-2.5 py-1 rounded-full bg-black/40 dark:bg-black/40 light:bg-stone-100 border border-dark-gold/20 light:border-stone-300 text-dark-muted dark:text-dark-muted light:text-stone-700 text-[11px] font-mono">
            ⏱️ 耗時 {{ duration }}s
          </span>
          <button
            @click="isExpanded = !isExpanded"
            class="px-2.5 py-1 rounded-full border border-dark-gold/30 light:border-amber-600/40 text-dark-gold light:text-amber-900 hover:bg-dark-gold/10 light:hover:bg-amber-100 text-[11px] transition-colors cursor-pointer ml-1"
          >
            {{ isExpanded ? '收起報告 ▲' : '展開報告 ▼' }}
          </button>
        </div>
      </div>

      <!-- MARKDOWN 內容主體：無高度截斷，自然全幅展開，精美古典色調 -->
      <div v-show="isExpanded" class="space-y-4">
        <div
          class="markdown-content text-sm sm:text-base leading-relaxed p-6 sm:p-8 rounded-xl shadow-sm border border-dark-gold/20 light:border-light-bronze/30"
          v-html="renderedMarkdown"
        ></div>
      </div>

      <!-- 底部操作列 (重新推演、複製、開啟抽屜深入叩問) -->
      <div class="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-dark-gold/15 light:border-light-bronze/20 text-xs font-serif">
        <div class="flex items-center space-x-2.5">
          <button
            @click="startAnalysis"
            class="px-4 py-2 rounded-xl border border-dark-gold/30 light:border-amber-600/40 text-dark-gold light:text-amber-900 hover:bg-dark-gold/10 light:hover:bg-amber-100 transition-colors flex items-center space-x-1.5 font-bold cursor-pointer"
            title="以當前盤面重新向大模型請求解析"
          >
            <span>🔄 重新深入診斷</span>
          </button>
          <button
            @click="copyResult"
            class="px-4 py-2 rounded-xl border border-dark-gold/20 light:border-stone-300 text-dark-muted light:text-stone-700 hover:text-dark-text light:hover:text-stone-900 hover:bg-black/20 light:hover:bg-stone-100 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <span>{{ copied ? '✓ 已複製到剪貼簿' : '📋 複製診斷報告全文' }}</span>
          </button>
        </div>

        <!-- 深入叩問按鈕：開啟抽屜進一步對話 -->
        <button
          @click="openInDrawer"
          class="px-5 py-2.5 rounded-xl bg-dark-gold/20 hover:bg-dark-gold border border-dark-gold text-dark-gold hover:text-dark-void font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-cosmic"
        >
          <span>💬 開啟抽屜深入諮詢 ↗</span>
        </button>
      </div>
    </div>

    <!-- 4. 錯誤狀態 (Error: 連線逾時或異常) -->
    <div v-else-if="status === 'error'" class="p-8 text-center space-y-4 bg-red-950/20 light:bg-red-50/80 border border-red-500/30 light:border-red-300">
      <div class="text-red-400 light:text-red-700 font-bold text-sm flex items-center justify-center space-x-2">
        <span>⚠️</span>
        <span>命理推演受阻：{{ errorMsg }}</span>
      </div>
      <p class="text-xs text-dark-muted max-w-md mx-auto">
        請確認後端服務或本地 Ollama 模型服務運作正常，您也可以稍後點擊下方按鈕重試。
      </p>
      <div>
        <button
          @click="startAnalysis"
          class="px-6 py-2.5 rounded-xl bg-dark-gold text-dark-void font-bold text-xs hover:bg-yellow-500 transition-colors cursor-pointer shadow-cosmic"
        >
          重試診斷 🔄
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useLlmStore, ChartContext } from '../../stores/llm.js';
import { renderSafeMarkdown } from '../../utils/sanitize.js';

const props = defineProps<{
  moduleType: string;
  title: string;
  summary: string;
  rawData: any;
  prompt: string;
  buttonText?: string;
}>();

const llmStore = useLlmStore();

const status = ref<'idle' | 'loading' | 'completed' | 'error'>('idle');
const elapsedSeconds = ref(0);
const reply = ref('');
const model = ref('');
const source = ref('');
const duration = ref(0);
const errorMsg = ref('');
const copied = ref(false);
const isExpanded = ref(true);

let timerId: any = null;

const activeModel = computed(() => {
  return llmStore.activeModelName || 'gemma4:e2b';
});

const renderedMarkdown = computed(() => {
  if (!reply.value) return '';
  return renderSafeMarkdown(reply.value);
});

async function startAnalysis() {
  if (status.value === 'loading') return;

  status.value = 'loading';
  elapsedSeconds.value = 0;
  errorMsg.value = '';
  isExpanded.value = true;

  const startTime = Date.now();
  timerId = setInterval(() => {
    elapsedSeconds.value = Number(((Date.now() - startTime) / 1000).toFixed(1));
  }, 100);

  const context: ChartContext = {
    moduleType: props.moduleType,
    title: props.title,
    summary: props.summary,
    rawData: props.rawData,
  };

  try {
    const result = await llmStore.requestDirectAnalysis(context, props.prompt);
    reply.value = result.reply;
    model.value = result.model;
    source.value = result.source;
    duration.value = result.duration;
    status.value = 'completed';
  } catch (err: any) {
    status.value = 'error';
    errorMsg.value = err.message || '大模型推演連線異常';
  } finally {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }
}

function openInDrawer() {
  const context: ChartContext = {
    moduleType: props.moduleType,
    title: props.title,
    summary: props.summary,
    rawData: props.rawData,
  };
  llmStore.openAssistant(context, props.prompt);
}

async function copyResult() {
  try {
    await navigator.clipboard.writeText(reply.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2500);
  } catch (err) {
    // fallback
  }
}

onMounted(() => {
  llmStore.fetchStatus();
});

onUnmounted(() => {
  if (timerId) {
    clearInterval(timerId);
  }
});
</script>

<style scoped>
/* ==========================================================================
   深色模式：星淵夜幕 (Void Obsidian) Markdown 排版與色彩
   ========================================================================== */
.markdown-content {
  font-family: inherit;
  word-break: break-word;
  background: rgba(10, 12, 18, 0.75);
  color: #E6ECF5;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4) {
  font-weight: 700;
  margin-top: 1.75rem;
  margin-bottom: 0.85rem;
  line-height: 1.45;
  letter-spacing: 0.03em;
}

.markdown-content :deep(h1:first-child),
.markdown-content :deep(h2:first-child),
.markdown-content :deep(h3:first-child) {
  margin-top: 0;
}

.markdown-content :deep(h1) {
  font-size: 1.45rem;
  color: #E5C378;
  border-bottom: 1px solid rgba(229, 195, 120, 0.25);
  padding-bottom: 0.5rem;
}

.markdown-content :deep(h2) {
  font-size: 1.25rem;
  color: #E5C378;
  display: flex;
  align-items: center;
}

.markdown-content :deep(h2)::before {
  content: '✦';
  margin-right: 0.5rem;
  color: #F59E0B;
  font-size: 0.85em;
}

.markdown-content :deep(h3) {
  font-size: 1.1rem;
  color: #F3E8CE;
}

.markdown-content :deep(h4) {
  font-size: 1rem;
  color: #E5C378;
}

.markdown-content :deep(p) {
  margin-bottom: 1.25rem;
  line-height: 1.95;
  letter-spacing: 0.02em;
  color: #E2E8F0;
}

.markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-content :deep(strong) {
  color: #FBBF24;
  font-weight: 700;
}

.markdown-content :deep(em) {
  color: #E5C378;
  font-style: italic;
}

.markdown-content :deep(ul) {
  list-style-type: disc;
  margin-left: 1.5rem;
  margin-bottom: 1.25rem;
}

.markdown-content :deep(ol) {
  list-style-type: decimal;
  margin-left: 1.5rem;
  margin-bottom: 1.25rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.45rem;
  line-height: 1.85;
  color: #E2E8F0;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #E5C378;
  background: rgba(229, 195, 120, 0.08);
  padding: 0.85rem 1.25rem;
  margin: 1.25rem 0;
  border-radius: 0 0.75rem 0.75rem 0;
  color: #F0F3F8;
  font-style: normal;
}

.markdown-content :deep(code) {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(229, 195, 120, 0.25);
  padding: 0.15rem 0.45rem;
  border-radius: 0.35rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.88em;
  color: #FCD34D;
}

.markdown-content :deep(pre) {
  background: rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(229, 195, 120, 0.2);
  padding: 1rem;
  border-radius: 0.75rem;
  overflow-x: auto;
  margin: 1.25rem 0;
}

.markdown-content :deep(pre code) {
  background: transparent;
  border: none;
  padding: 0;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 1.5rem 0;
  border: 1px solid rgba(229, 195, 120, 0.25);
  border-radius: 0.75rem;
  overflow: hidden;
  font-size: 0.9em;
}

.markdown-content :deep(th) {
  background: rgba(229, 195, 120, 0.12);
  color: #E5C378;
  font-weight: 700;
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(229, 195, 120, 0.25);
}

.markdown-content :deep(td) {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(229, 195, 120, 0.12);
  color: #E2E8F0;
}

.markdown-content :deep(tr:nth-child(even)) {
  background: rgba(0, 0, 0, 0.2);
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid rgba(229, 195, 120, 0.2);
  margin: 1.75rem 0;
}

/* ==========================================================================
   淺色模式：晨曦天盤 (Solstice Alabaster) 典藏米宣紙與高雅對比色彩適配
   ========================================================================== */
html.light .markdown-content {
  background: #FAF8F3 !important;
  color: #202530 !important;
  border-color: rgba(164, 126, 59, 0.25) !important;
}

html.light .markdown-content :deep(h1) {
  color: #7A541B !important;
  border-bottom-color: rgba(164, 126, 59, 0.3) !important;
}

html.light .markdown-content :deep(h2) {
  color: #7A541B !important;
}

html.light .markdown-content :deep(h2)::before {
  color: #C25E00 !important;
}

html.light .markdown-content :deep(h3) {
  color: #4A3515 !important;
}

html.light .markdown-content :deep(h4) {
  color: #5C4016 !important;
}

html.light .markdown-content :deep(p) {
  color: #2D3340 !important;
}

html.light .markdown-content :deep(strong) {
  color: #9A3412 !important;
}

html.light .markdown-content :deep(em) {
  color: #7A541B !important;
}

html.light .markdown-content :deep(li) {
  color: #2D3340 !important;
}

html.light .markdown-content :deep(blockquote) {
  border-left-color: #A47E3B !important;
  background: rgba(164, 126, 59, 0.08) !important;
  color: #1F2432 !important;
}

html.light .markdown-content :deep(code) {
  background: #EFEBE2 !important;
  border-color: rgba(164, 126, 59, 0.35) !important;
  color: #9A3412 !important;
}

html.light .markdown-content :deep(pre) {
  background: #F4EFE6 !important;
  border-color: rgba(164, 126, 59, 0.3) !important;
}

html.light .markdown-content :deep(pre code) {
  background: transparent !important;
  border: none !important;
  color: #1F2432 !important;
}

html.light .markdown-content :deep(table) {
  border-color: rgba(164, 126, 59, 0.28) !important;
}

html.light .markdown-content :deep(th) {
  background: rgba(164, 126, 59, 0.12) !important;
  color: #7A541B !important;
  border-bottom-color: rgba(164, 126, 59, 0.28) !important;
}

html.light .markdown-content :deep(td) {
  border-bottom-color: rgba(164, 126, 59, 0.15) !important;
  color: #2D3340 !important;
}

html.light .markdown-content :deep(tr:nth-child(even)) {
  background: rgba(244, 241, 234, 0.65) !important;
}

html.light .markdown-content :deep(hr) {
  border-top-color: rgba(164, 126, 59, 0.25) !important;
}
</style>
