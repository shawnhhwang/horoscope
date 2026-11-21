import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

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
import {
  authRateLimiter,
  llmMinuteLimiter,
  llmDailyQuotaMiddleware,
  simulatorRateLimiter,
} from './middleware/rateLimit.js';

export function createApp(): Express {
  const app = express();
  // 信任反向代理 (Docker / Nginx / Cloudflare)
  app.set('trust proxy', 1);
  const isProduction = process.env.NODE_ENV === 'production';
  const enableHsts = process.env.ENABLE_HSTS === 'true';

  // 安全防護標頭 (Helmet: CSP + X-Frame-Options + nosniff + 可選 HSTS)
  const corsOrigin = process.env.CORS_ORIGIN;
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: false,
      originAgentCluster: false,
      frameguard: { action: 'deny' },
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      hsts: enableHsts ? { maxAge: 31536000, includeSubDomains: true } : false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https:', 'wss:', 'ws:'],
          frameAncestors: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: enableHsts ? [] : null,
        },
      },
    })
  );
  app.use(
    cors({
      origin: !corsOrigin || corsOrigin === '*'
        ? true
        : corsOrigin.includes(',')
        ? corsOrigin.split(',').map((o) => o.trim())
        : corsOrigin,
      credentials: true,
    })
  );

  // [P0-SEC-02] 全域 Request Body 大小上限 1MB
  app.use(express.json({ limit: '1mb' }));

  // 畸形 JSON Payload 統一回傳標準化 400 Bad Request
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({ success: false, message: '無效的 JSON 請求格式' });
    }
    if (err?.type === 'entity.too.large') {
      return res.status(413).json({ success: false, message: '請求資料體積超過 1MB 上限' });
    }
    return next(err);
  });

  // [P0-SEC-02] 分級速率限制防禦
  app.use('/api/v1/auth/login', authRateLimiter);
  app.use('/api/v1/auth/register', authRateLimiter);
  app.use('/api/v1/llm/chat', llmMinuteLimiter, llmDailyQuotaMiddleware);
  app.use('/api/v1/llm/stream', llmMinuteLimiter, llmDailyQuotaMiddleware);
  app.use('/api/v1/simulator/start', simulatorRateLimiter);

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

  // 託管前端 SPA 靜態檔案 (支援單一容器一體化部署 Port 5499)
  const clientDistCandidates = [
    process.env.WEB_DIST_PATH,
    path.resolve(process.cwd(), 'public'),
    path.resolve(process.cwd(), '../web/dist'),
    path.resolve(process.cwd(), 'apps/web/dist'),
    path.resolve(process.cwd(), '../../apps/web/dist'),
  ].filter(Boolean) as string[];

  const resolvedDist = clientDistCandidates.find(
    (dir) => fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html'))
  );

  if (resolvedDist) {
    app.use(express.static(resolvedDist));
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api') || req.path === '/health') {
        return next();
      }
      if (path.extname(req.path)) {
        return next();
      }
      return res.sendFile(path.join(resolvedDist, 'index.html'));
    });
  }

  // 404 路由攔截
  app.use((_req: Request, res: Response) => {
    return res.status(404).json({ success: false, message: '未找到該 API 端點' });
  });

  // 全局錯誤捕獲中介軟體
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled Server Error:', err);
    return res.status(500).json({
      success: false,
      message: isProduction ? '伺服器內部發生異常，請稍後重試' : (err.message || '伺服器內部發生異常'),
    });
  });

  return app;
}
