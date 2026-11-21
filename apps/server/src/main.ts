import { createApp } from './app.js';
import { ensureDatabaseInitialized, prisma } from '@celestial/database';

// 開發模式獨立 API 服務預設為 5498；一體化生產環境 (含前端 SPA 託管) 預設為 5499
const isProduction = process.env.NODE_ENV === 'production';
let PORT = Number(process.env.PORT) || (isProduction ? 5499 : 5498);
if (isProduction && PORT === 5498) {
  // 若為生產模式但繼承了 .env 開發用 PORT=5498，自動切換至一體化對外端口 5499
  PORT = 5499;
}
const HOST = process.env.HOST || '0.0.0.0';

async function bootstrap() {
  await ensureDatabaseInitialized();

  const app = createApp();

  const server = app.listen(PORT, HOST, () => {
    console.log(`🌌 萬象天儀全端整合服務已就緒 (所有 IP 均可連線): http://${HOST}:${PORT}`);
    console.log(`📡 健康檢查端點: http://localhost:${PORT}/health`);
    if (PORT === 5499) {
      console.log(`✨ 前端視覺介面與 API 一體化託管中: http://localhost:${PORT}`);
    }
  });

  // 配合反向代理長連線與本地 LLM 推論耗時，調整 HTTP Server 逾時閾值
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
  server.requestTimeout = 200000;

  // Docker 容器 PID 1 優雅關機信號處理 (SIGTERM / SIGINT)
  let isShuttingDown = false;
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`\n🛑 收到 ${signal} 信號，正在優雅關閉服務與資料庫連線...`);
    server.close(async () => {
      try {
        await prisma.$disconnect();
      } catch {
        // 忽略關閉期間之重複斷線異常
      }
      process.exit(0);
    });
    setTimeout(() => {
      process.exit(0);
    }, 5000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('❌ 伺服器啟動失敗:', err);
  process.exit(1);
});
