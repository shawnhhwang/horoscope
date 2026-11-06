import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
  source?: 'external_api' | 'celestial_builtin';
}

export interface ChartContext {
  moduleType:
    | 'ZIWEI'
    | 'BAZI'
    | 'ICHING'
    | 'NAME'
    | 'WESTERN'
    | 'TAROT'
    | 'BUNCHO'
    | 'TEMPLE_POEM'
    | 'DREAM'
    | 'QIZHENG'
    | 'ALMANAC'
    | 'SYNASTRY'
    | 'ANNUAL_PLANNER'
    | 'LIFE_SIMULATOR'
    | string;
  title: string;
  summary: string;
  rawData: any;
}

export interface OpenContextPayload extends ChartContext {
  initialPrompt?: string;
  existingReply?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1';

export const useLlmStore = defineStore('llm', () => {
  const isOpen = ref(false);
  const isGenerating = ref(false);
  const elapsedSeconds = ref(0);
  const activeModelName = ref('gemma4:e2b');
  const activeContext = ref<ChartContext | null>(null);
  const messages = ref<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '您好，我是萬象天儀·天機靈犀的命理明師與人生策士顧問。\n\n常言道：「**君子知命，知時而動，知止而退。**」每當遇到人生十字路口，大家最常向算命老師請益的無非是：**職場轉職與合夥、婚戀合盤與家庭、新生兒命名、重大二選一抉擇、一生命運波瀾、今日出行擇吉、廟宇問籤或是夜夢吉凶**。\n\n您可以直接向我描述您當前遇到的現實情境或困惑（例如：*「我最近在職涯上面臨轉職與合夥瓶頸，該用什麼功能看？」* 或 *「想跟另一半合八字看婚配適不適合」*），我會像資深的算命老師一樣為您親切問診，並推薦最精準的系統模組引導您探索；若您已在具體排盤頁面，我也會結合當前星盤數據為您展開深度推演。\n\n若您想一覽全站所有 15 大模組的操作詳解，亦可點擊查看 [📖 全系統使用手冊與問診指南](/guide)。請問今天有什麼人生課題需要為您解惑的嗎？',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  async function fetchStatus() {
    try {
      const res = await fetch(`${API_BASE}/llm/status`);
      const json = await res.json();
      if (json.success && json.data?.model) {
        activeModelName.value = json.data.model;
      }
    } catch (err) {
      // 靜默處理離線
    }
  }

  function openAssistant(context?: ChartContext, initialPrompt?: string, existingReply?: string) {
    if (context) {
      activeContext.value = context;
    }
    isOpen.value = true;

    if (existingReply) {
      if (initialPrompt) {
        messages.value.push({
          id: `user-${Date.now()}`,
          role: 'user',
          content: initialPrompt,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
      messages.value.push({
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: existingReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'celestial_builtin',
      });
    } else if (initialPrompt) {
      sendMessage(initialPrompt);
    }
  }

  function openAssistantWithContext(payload: OpenContextPayload) {
    const { initialPrompt, existingReply, ...ctx } = payload;
    openAssistant(ctx, initialPrompt, existingReply);
  }

  function closeAssistant() {
    isOpen.value = false;
  }

  function toggleAssistant() {
    isOpen.value = !isOpen.value;
  }

  function clearContext() {
    activeContext.value = null;
  }

  async function sendMessage(content: string) {
    const text = content.trim();
    if (!text || isGenerating.value) return;

    // 加入用戶訊息
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    messages.value.push(userMsg);

    isGenerating.value = true;
    elapsedSeconds.value = 0;
    const startTime = Date.now();
    const timer = setInterval(() => {
      elapsedSeconds.value = Number(((Date.now() - startTime) / 1000).toFixed(1));
    }, 100);

    try {
      // 構建傳送至後端的對話歷史
      const apiMessages = messages.value
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch(`${API_BASE}/llm/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          chartContext: activeContext.value ? {
            moduleType: activeContext.value.moduleType,
            title: activeContext.value.title,
            summary: activeContext.value.summary,
            rawData: activeContext.value.rawData,
          } : undefined,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: json.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: json.data.model,
          source: json.data.source,
        };
        messages.value.push(assistantMsg);
      } else {
        messages.value.push({
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: '天機推演受阻：' + (json.message || '連線伺服器異常'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    } catch (err: any) {
      messages.value.push({
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '未能連線至天機後端服務，請確認伺服器狀態。',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      clearInterval(timer);
      isGenerating.value = false;
    }
  }

  // 直接請求單次解盤 (供頁面內部動態更新區域使用，無需開啟抽屜)
  async function requestDirectAnalysis(context: ChartContext, prompt: string): Promise<{
    reply: string;
    model: string;
    source: string;
    duration: number;
  }> {
    const startTime = Date.now();
    const res = await fetch(`${API_BASE}/llm/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        chartContext: {
          moduleType: context.moduleType,
          title: context.title,
          summary: context.summary,
          rawData: context.rawData,
        },
      }),
    });
    const duration = Number(((Date.now() - startTime) / 1000).toFixed(1));
    const json = await res.json();
    if (json.success && json.data) {
      return {
        reply: json.data.reply,
        model: json.data.model || activeModelName.value || 'gemma4:e2b',
        source: json.data.source || 'external_api',
        duration,
      };
    }
    throw new Error(json.message || 'LLM 推演解析異常');
  }

  return {
    isOpen,
    isGenerating,
    elapsedSeconds,
    activeModelName,
    activeContext,
    messages,
    fetchStatus,
    openAssistant,
    openAssistantWithContext,
    closeAssistant,
    toggleAssistant,
    clearContext,
    sendMessage,
    requestDirectAnalysis,
  };
});
