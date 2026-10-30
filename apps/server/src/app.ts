import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { authRouter } from './modules/auth/router.js';
import { calculatorRouter } from './modules/calculator/router.js';
import { profilesRouter } from './modules/profiles/router.js';
import { readingsRouter } from './modules/readings/router.js';
import { adminRouter } from './modules/admin/router.js';
import { llmRouter } from './modules/llm/router.js';
import { almanacRouter } from './modules/almanac/router.js';
import { habitsRouter } from './modules/habits/router.js';
import { simulatorRouter } from './modules/simulator/router.js';

export function createApp(): Express {
  const app = express();
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  // 安全防護與跨域配置
  const corsOrigin = process.env.CORS_ORIGIN;
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(
    cors({
      origin: !corsOrigin || corsOrigin === '*'
        ? (isProduction ? false : true) // 生產環境禁止反射任意 Origin，開發環境支援全通
        : corsOrigin.includes(',')
        ? corsOrigin.split(',').map((o) => o.trim())
        : corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));

  // 敏感端點速率限制 (DoS 與暴力破解防護)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isTest ? 2000 : 30, // 30 次 / 15 分鐘
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: '登入或註冊請求過於頻繁，請稍候再試' },
  });

  const llmLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: isTest ? 2000 : 40, // 40 次 / 分鐘
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'AI 諮詢請求過於頻繁，請稍候再試' },
  });

  const simulatorLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: isTest ? 2000 : 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: '人生模擬啟動過於頻繁，請稍候再試' },
  });

  app.use('/api/v1/auth/login', authLimiter);
  app.use('/api/v1/auth/register', authLimiter);
  app.use('/api/v1/llm/chat', llmLimiter);
  app.use('/api/v1/simulator/start', simulatorLimiter);

  // 健康檢查端點
  app.get('/health', (_req: Request, res: Response) => {
    return res.json({
      status: 'healthy',
      service: 'celestial-api-server',
      timestamp: new Date().toISOString(),
    });
  });

  // 掛載 API 路由
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/calculator', calculatorRouter);
  app.use('/api/v1/profiles', profilesRouter);
  app.use('/api/v1/readings', readingsRouter);
  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1/llm', llmRouter);
  app.use('/api/v1/almanac', almanacRouter);
  app.use('/api/v1/habits', habitsRouter);
  app.use('/api/v1/simulator', simulatorRouter);

  // 404 路由攔截
  app.use((_req: Request, res: Response) => {
    return res.status(404).json({ success: false, message: '未找到該 API 端點' });
  });

  // 全局錯誤捕獲中介軟體 (生產環境隱藏敏感錯誤堆疊)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled Server Error:', err);
    return res.status(500).json({
      success: false,
      message: isProduction ? '伺服器內部發生異常，請稍後重試' : (err.message || '伺服器內部發生異常'),
    });
  });

  return app;
}
