import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { verifyToken } from './auth.js';
import { incrementCounter } from '../utils/cache.js';

const isTest = process.env.NODE_ENV === 'test';

function extractIdentityKey(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const decoded = verifyToken(authHeader.split(' ')[1]);
    if (decoded?.id) return `user:${decoded.id}:${req.ip}`;
  }
  return `ip:${req.ip || 'unknown'}`;
}

/**
 * /api/v1/auth/* 嚴格限流：每 IP 每 15 分鐘最多 10 次嘗試，防禦撞庫與暴力破解
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 2000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: '登入或註冊請求過於頻繁，請於 15 分鐘後再試' },
});

/**
 * /api/v1/llm/* 雙維度限流（userId + IP）：每分鐘最多 5 次 + 每日配額上限
 */
export const llmMinuteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isTest ? 2000 : 5,
  keyGenerator: (req) => extractIdentityKey(req),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'AI 諮詢請求過於頻繁（每分鐘上限 5 次），請稍候再試' },
});

export async function llmDailyQuotaMiddleware(req: Request, res: Response, next: NextFunction) {
  if (isTest) return next();
  const dailyLimit = Number(process.env.LLM_DAILY_QUOTA || 200);
  const dayKey = new Date().toISOString().slice(0, 10);
  const key = `quota:llm:${dayKey}:${extractIdentityKey(req)}`;
  const count = await incrementCounter(key, 86400);
  if (count > dailyLimit) {
    return res.status(429).json({
      success: false,
      message: `今日 AI 推論配額已達上限 (${dailyLimit} 次)，請明日再試`,
    });
  }
  return next();
}

/**
 * /api/v1/simulator/* 雙維度限流（userId + IP）：每分鐘最多 10 次
 */
export const simulatorRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isTest ? 2000 : 10,
  keyGenerator: (req) => extractIdentityKey(req),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: '人生模擬請求過於頻繁，請稍候再試' },
});
