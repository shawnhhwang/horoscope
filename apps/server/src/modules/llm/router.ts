import { Router, Request, Response } from 'express';
import { executeLlmChat, getLlmConfig } from './service.js';

export const llmRouter = Router();

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
 * 發送對話諮詢並結合星盤上下文
 */
llmRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { messages, chartContext } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: '請提供有效的 messages 對話陣列' });
    }

    const result = await executeLlmChat(messages, chartContext);

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
