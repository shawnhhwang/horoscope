import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 9998;
const HOST = process.env.HOST || '0.0.0.0';
const app = createApp();

app.listen(PORT, HOST, () => {
  console.log(`🌌 萬象天儀 API 服務已就緒 (所有 IP 均可連線): http://${HOST}:${PORT}`);
  console.log(`📡 健康檢查端點: http://localhost:${PORT}/health`);
});
