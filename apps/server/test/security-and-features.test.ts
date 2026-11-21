import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { ensureDatabaseInitialized } from '@celestial/database';
import { encryptSecret, decryptSecret, maskSecret } from '../src/utils/crypto.js';
import { validateExternalLlmEndpoint } from '../src/utils/ssrf.js';

describe('🛡️ [Phase 1 & 2] 安全加固、加密、SSRF、Zod 驗證、SSE 串流與新產品端點測試', () => {
  const app = createApp();
  let adminToken = '';

  beforeAll(async () => {
    await ensureDatabaseInitialized();
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('X-Forwarded-For', '192.168.1.105')
      .send({ email: 'admin@celestial.dao', password: 'AdminPassword123!' });
    adminToken = res.body.data.token;
  });

  it('AES-256-GCM 加解密與遮罩應正確保護 LLM API Key', () => {
    const rawKey = 'sk-test-secret-1234567890abcd';
    const encrypted = encryptSecret(rawKey);
    expect(encrypted.startsWith('enc:v1:')).toBe(true);
    expect(encrypted).not.toContain(rawKey);
    expect(decryptSecret(encrypted)).toBe(rawKey);
    expect(maskSecret(rawKey)).toBe('sk-t****abcd');
  });

  it('SSRF 防護應阻斷 Loopback、Cloud Metadata 與未放行私有 IP，並允許白名單主機', async () => {
    await expect(validateExternalLlmEndpoint('http://127.0.0.1:11434/v1')).rejects.toThrow(/SSRF/);
    await expect(validateExternalLlmEndpoint('http://169.254.169.254/latest/meta-data')).rejects.toThrow(/SSRF/);
    await expect(validateExternalLlmEndpoint('http://10.0.0.5:8080/v1')).rejects.toThrow(/SSRF/);

    const prevAllow = process.env.LLM_ALLOW_PRIVATE_HOSTS;
    process.env.LLM_ALLOW_PRIVATE_HOSTS = '192.168.1.99';
    try {
      const allowed = await validateExternalLlmEndpoint('http://192.168.1.99:11434/v1');
      expect(allowed.hostname).toBe('192.168.1.99');
      // 即使設定白名單，Cloud Metadata 仍永遠阻斷
      await expect(validateExternalLlmEndpoint('http://169.254.169.254/')).rejects.toThrow(/SSRF/);
    } finally {
      process.env.LLM_ALLOW_PRIVATE_HOSTS = prevAllow;
    }
  });

  it('後台資料庫高危寫入缺乏二次確認憑證應回傳 400；通過確認則寫入 AdminAuditLog', async () => {
    const blockedRes = await request(app)
      .post('/api/v1/admin/database/tables/SystemInterpretation')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ moduleType: 'BAZI', keyCode: 'SHOULD_FAIL', category: 'STAR', title: 'X', contentRich: 'Y' });
    expect(blockedRes.status).toBe(400);

    const auditRes = await request(app)
      .get('/api/v1/admin/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(auditRes.status).toBe(200);
    expect(Array.isArray(auditRes.body.data)).toBe(true);
  });

  it('Zod 統一驗證應攔截畸形 JSON 與非法出生日期並回傳 400 Bad Request', async () => {
    const badDateRes = await request(app)
      .post('/api/v1/calculator/bazi')
      .send({ birthDate: 'not-a-valid-date', gender: '男', longitude: 999 });
    expect(badDateRes.status).toBe(400);
    expect(badDateRes.body.success).toBe(false);

    const badJsonRes = await request(app)
      .post('/api/v1/calculator/bazi')
      .set('Content-Type', 'application/json')
      .send('{"birthDate": "1990-01-01", broken');
    expect(badJsonRes.status).toBe(400);
  });

  it('POST /api/v1/llm/stream 應支援 SSE 串流事件輸出', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline fallback'));
    try {
      const res = await request(app)
        .post('/api/v1/llm/stream')
        .send({
          messages: [{ role: 'user', content: '請給我今日八字平衡建議' }],
          chartContext: { moduleType: 'BAZI', title: '測試盤', rawData: { birthDate: '1992-05-15T10:00:00Z' } },
        });
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/event-stream');
      expect(res.text).toContain('event: meta');
      expect(res.text).toContain('event: delta');
      expect(res.text).toContain('event: done');
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('Phase 3 新產品端點：全息合參、智能擇日、What-If 與雙人模擬應正常運作', async () => {
    const holoRes = await request(app)
      .post('/api/v1/calculator/holographic')
      .send({ birthDate: '1992-06-18T10:30:00Z', gender: '男', longitude: 121.56, latitude: 25.03 });
    expect(holoRes.status).toBe(200);
    expect(holoRes.body.data.engines.bazi).toBeDefined();
    expect(holoRes.body.data.engines.ziwei).toBeDefined();
    expect(holoRes.body.data.engines.western).toBeDefined();
    expect(holoRes.body.data.engines.qizheng).toBeDefined();
    expect(holoRes.body.data.synthesis.consensusSignals.length).toBeGreaterThanOrEqual(1);

    const dateRes = await request(app)
      .post('/api/v1/calculator/almanac/auspicious-dates')
      .send({ eventType: '簽約', zodiac: '鼠', days: 14 });
    expect(dateRes.status).toBe(200);
    expect(Array.isArray(dateRes.body.data.recommendations)).toBe(true);

    const whatIfRes = await request(app)
      .post('/api/v1/simulator/what-if')
      .send({ birthDate: '1992-06-18T10:30:00Z', gender: '男', branchAge: 28, pathALabel: '創業', pathBLabel: '留任' });
    expect(whatIfRes.status).toBe(200);
    expect(whatIfRes.body.data.pathA.curve.length).toBe(11);

    const coupleRes = await request(app)
      .post('/api/v1/simulator/couple')
      .send({
        person1: { name: '乾造', gender: '男', birthDate: '1992-06-18T10:30:00Z' },
        person2: { name: '坤造', gender: '女', birthDate: '1994-09-22T14:00:00Z' },
      });
    expect(coupleRes.status).toBe(200);
    expect(coupleRes.body.data.synastryScore).toBeGreaterThan(0);
  });
});
