import { validateExternalLlmEndpoint } from '../../../utils/ssrf.js';
import type { ChatMessage, LlmConfig } from '../types.js';

function isLocalLikeConfig(config: LlmConfig): boolean {
  return (
    config.provider === 'custom' ||
    Boolean(
      config.endpoint &&
        (config.endpoint.includes('11434') ||
          config.endpoint.includes('localhost') ||
          config.endpoint.includes('127.0.0.1') ||
          config.endpoint.includes('192.168.') ||
          config.endpoint.includes('10.') ||
          config.endpoint.includes('172.'))
    )
  );
}

export async function callExternalLlm(
  config: LlmConfig,
  messages: ChatMessage[]
): Promise<string | null> {
  const hasEndpoint = Boolean(config.endpoint && config.endpoint.trim().length > 0);
  const hasKey = Boolean(config.apiKey && config.apiKey.trim().length > 0);
  const isLocalOrCustom = isLocalLikeConfig(config);

  if (!hasEndpoint || (!hasKey && !isLocalOrCustom)) {
    return null;
  }

  // [P0-SEC-03] SSRF 防護：發起請求前進行 DNS 解析與私有網段檢驗
  await validateExternalLlmEndpoint(config.endpoint);

  const url = config.endpoint.endsWith('/')
    ? `${config.endpoint}chat/completions`
    : `${config.endpoint}/chat/completions`;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (hasKey) {
    headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
  }

  const timeoutMs = isLocalOrCustom ? 180000 : 45000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.model || 'gpt-4o',
        messages,
        temperature: config.temperature ?? 0.7,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn(`External LLM API returned status ${response.status}`);
      return null;
    }

    const data = (await response.json()) as any;
    const msg = data.choices?.[0]?.message;
    let reply = msg?.content;
    if (!reply || reply.trim().length === 0) {
      reply = msg?.reasoning || msg?.thinking || '';
    }
    return reply && reply.trim().length > 0 ? reply.trim() : null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function streamExternalLlm(
  config: LlmConfig,
  messages: ChatMessage[],
  onDelta: (chunk: string) => void
): Promise<boolean> {
  const hasEndpoint = Boolean(config.endpoint && config.endpoint.trim().length > 0);
  const hasKey = Boolean(config.apiKey && config.apiKey.trim().length > 0);
  const isLocalOrCustom = isLocalLikeConfig(config);

  if (!hasEndpoint || (!hasKey && !isLocalOrCustom)) {
    return false;
  }

  await validateExternalLlmEndpoint(config.endpoint);

  const url = config.endpoint.endsWith('/')
    ? `${config.endpoint}chat/completions`
    : `${config.endpoint}/chat/completions`;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (hasKey) {
    headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
  }

  const timeoutMs = isLocalOrCustom ? 180000 : 45000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.model || 'gpt-4o',
        messages,
        temperature: config.temperature ?? 0.7,
        stream: true,
      }),
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      return false;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let emittedAny = false;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        try {
          const parsed = JSON.parse(payload);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (typeof delta === 'string' && delta.length > 0) {
            emittedAny = true;
            onDelta(delta);
          }
        } catch {
          // ignore malformed SSE chunk
        }
      }
    }

    return emittedAny;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}
