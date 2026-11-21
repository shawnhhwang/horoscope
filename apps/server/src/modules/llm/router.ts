import { Router, Request, Response } from 'express';
import { llmChatSchema } from '@celestial/shared';
import { validateRequest } from '../../middleware/validate.js';
import { verifyToken } from '../../middleware/auth.js';
import { executeLlmChat, streamLlmChat, getLlmConfig } from './service.js';

export const llmRouter = Router();

function getOptionalUserId(req: Request): string | undefined {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return undefined;
  return verifyToken(auth.split(' ')[1])?.id;
}

/**
 * 查詢 LLM 服務公開狀態
 */
llmRouter.get('/status', async (_req: Request, res: Response) => {
  try {
    const config = await getLlmConfig();
    return res.json({
      success: true,
      data: {
        enabled: config.enabled,
        model: config.model,
        provider: config.provider,
        hasCustomKey: Boolean(config.apiKey && config.apiKey.trim().length > 0),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '查詢狀態失敗' });
  }
});

/**
 * 發送對話諮詢並結合星盤上下文 (JSON 回應)
 */
llmRouter.post('/chat', validateRequest({ body: llmChatSchema }), async (req: Request, res: Response) => {
  try {
    const { messages, chartContext } = req.body;
    const userId = getOptionalUserId(req);
    const result = await executeLlmChat(messages, chartContext, userId);

    return res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('LLM Chat Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'LLM 靈犀諮詢推演失敗',
    });
  }
});

/**
 * [P1-PERF-02] Server-Sent Events (SSE) 串流 AI 解盤端點
 */
llmRouter.post('/stream', validateRequest({ body: llmChatSchema }), async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const writeEvent = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const { messages, chartContext } = req.body;
    const userId = getOptionalUserId(req);

    await streamLlmChat(
      messages,
      chartContext,
      {
        onMeta: (meta) => writeEvent('meta', meta),
        onChunk: (delta) => writeEvent('delta', { content: delta }),
        onDone: (reply) => writeEvent('done', { reply }),
      },
      userId
    );
  } catch (err: any) {
    writeEvent('error', { message: err.message || 'SSE 串流推演失敗' });
  } finally {
    res.end();
  }
});
