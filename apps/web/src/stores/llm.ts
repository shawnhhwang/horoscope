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
  moduleType: 'ZIWEI' | 'BAZI' | 'ICHING' | 'NAME' | 'WESTERN' | 'TAROT' | string;
  title: string;
  summary: string;
  rawData: any;
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
        '您好，我是萬象天儀 AI 命理與星象諮詢顧問。無論紫微斗數排盤、四柱八字格局、西洋人本心理占星、周易六爻決策、韋特塔羅心靈投射、七政四餘天星度數、姓名學三才五格或通勝黃曆擇吉，我都能為您提供客觀、嚴謹且深入的專業分析與落地指引。請問今天有什麼我可以為您解析的嗎？',
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

  function openAssistant(context?: ChartContext, initialPrompt?: string) {
    if (context) {
      activeContext.value = context;
    }
    isOpen.value = true;

    if (initialPrompt) {
      sendMessage(initialPrompt);
    }
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
    closeAssistant,
    toggleAssistant,
    clearContext,
    sendMessage,
    requestDirectAnalysis,
  };
});
