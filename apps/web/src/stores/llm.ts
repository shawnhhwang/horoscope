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
  moduleType: string;
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
        '您好，我是萬象天儀·天機靈犀的命理明師與人生策士顧問。\n\n您可以直接向我描述您當前遇到的現實情境或困惑，我會為您親切問診並推薦最精準的系統模組；若您已在具體排盤頁面，我也會結合當前星盤數據為您展開深度推演。\n\n若想一覽全站模組操作詳解，亦可查看 [📖 全系統使用手冊與問診指南](/guide)。',
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
    } catch {
      // ignore offline
    }
  }

  function openAssistant(context?: ChartContext, initialPrompt?: string, existingReply?: string) {
    if (context) activeContext.value = context;
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

  function closeAssistant() { isOpen.value = false; }
  function toggleAssistant() { isOpen.value = !isOpen.value; }
  function clearContext() { activeContext.value = null; }

  async function consumeSseStream(
    payload: { messages: Array<{ role: string; content: string }>; chartContext?: ChartContext },
    onDelta: (chunk: string, meta?: { model?: string; source?: 'external_api' | 'celestial_builtin' }) => void
  ): Promise<{ reply: string; model: string; source: 'external_api' | 'celestial_builtin' }> {
    const token = localStorage.getItem('celestial_token');
    const res = await fetch(`${API_BASE}/llm/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok || !res.body) {
      // Fallback to standard JSON chat endpoint
      const fallbackRes = await fetch(`${API_BASE}/llm/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const json = await fallbackRes.json();
      if (!json.success || !json.data) {
        throw new Error(json.message || 'LLM 推演解析異常');
      }
      onDelta(json.data.reply, { model: json.data.model, source: json.data.source });
      return {
        reply: json.data.reply,
        model: json.data.model || activeModelName.value,
        source: json.data.source || 'celestial_builtin',
      };
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let fullReply = '';
    let model = activeModelName.value;
    let source: 'external_api' | 'celestial_builtin' = 'celestial_builtin';
    let currentEvent = 'message';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('event:')) {
          currentEvent = trimmed.slice(6).trim();
        } else if (trimmed.startsWith('data:')) {
          const rawData = trimmed.slice(5).trim();
          if (!rawData) continue;
          try {
            const parsed = JSON.parse(rawData);
            if (currentEvent === 'meta') {
              if (parsed.model) model = parsed.model;
              if (parsed.source) source = parsed.source;
            } else if (currentEvent === 'delta' && parsed.content) {
              fullReply += parsed.content;
              onDelta(parsed.content, { model, source });
            } else if (currentEvent === 'done' && parsed.reply) {
              fullReply = parsed.reply;
            } else if (currentEvent === 'error') {
              throw new Error(parsed.message || 'SSE 推演異常');
            }
          } catch (e: any) {
            if (currentEvent === 'error') throw e;
          }
        }
      }
    }

    return { reply: fullReply, model, source };
  }

  async function sendMessage(content: string) {
    const text = content.trim();
    if (!text || isGenerating.value) return;

    messages.value.push({
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    isGenerating.value = true;
    elapsedSeconds.value = 0;
    const startTime = Date.now();
    const timer = setInterval(() => {
      elapsedSeconds.value = Number(((Date.now() - startTime) / 1000).toFixed(1));
    }, 100);

    const assistantMsg: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    messages.value.push(assistantMsg);
    const msgIndex = messages.value.length - 1;

    try {
      const apiMessages = messages.value
        .filter((m) => m.id !== 'welcome' && m.id !== assistantMsg.id)
        .map((m) => ({ role: m.role, content: m.content }));

      const result = await consumeSseStream(
        {
          messages: apiMessages,
          chartContext: activeContext.value
            ? {
                moduleType: activeContext.value.moduleType,
                title: activeContext.value.title,
                summary: activeContext.value.summary,
                rawData: activeContext.value.rawData,
              }
            : undefined,
        },
        (chunk, meta) => {
          messages.value[msgIndex].content += chunk;
          if (meta?.model) messages.value[msgIndex].model = meta.model;
          if (meta?.source) messages.value[msgIndex].source = meta.source;
        }
      );

      messages.value[msgIndex].content = result.reply;
      messages.value[msgIndex].model = result.model;
      messages.value[msgIndex].source = result.source;
    } catch {
      messages.value[msgIndex].content = '未能連線至天機後端服務，請確認伺服器狀態。';
    } finally {
      clearInterval(timer);
      isGenerating.value = false;
    }
  }

  async function requestDirectAnalysis(
    context: ChartContext,
    prompt: string,
    onProgress?: (partialText: string, meta?: { model?: string; source?: string }) => void
  ): Promise<{ reply: string; model: string; source: string; duration: number }> {
    const startTime = Date.now();
    let acc = '';
    const res = await consumeSseStream(
      {
        messages: [{ role: 'user', content: prompt }],
        chartContext: {
          moduleType: context.moduleType,
          title: context.title,
          summary: context.summary,
          rawData: context.rawData,
        },
      },
      (chunk, meta) => {
        acc += chunk;
        onProgress?.(acc, meta);
      }
    );
    const duration = Number(((Date.now() - startTime) / 1000).toFixed(1));
    return { ...res, duration };
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
