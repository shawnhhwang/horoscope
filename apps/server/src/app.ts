import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
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

export function createApp(): Express {
  const app = express();

  // 安全防護與中介軟體 (允許所有 IP 與跨域存取)
  const corsOrigin = process.env.CORS_ORIGIN;
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(
    cors({
      origin: !corsOrigin || corsOrigin === '*'
        ? true // 允許所有 IP/網域訪問，並自動動態反射 Origin 以相容 credentials
        : corsOrigin.includes(',')
        ? corsOrigin.split(',').map((o) => o.trim())
        : corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json());

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

  // 404 路由攔截
  app.use((_req: Request, res: Response) => {
    return res.status(404).json({ success: false, message: '未找到該 API 端點' });
  });

  // 全局錯誤捕獲中介軟體
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled Server Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || '伺服器內部發生異常',
    });
  });

  return app;
}
