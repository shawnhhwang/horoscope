import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('🛡️ 後台資料庫管理、會員設定與 RAG 提示詞工程測試', () => {
  const app = createApp();
  let adminToken: string = '';
  let createdUserId: string = '';
  let backupFilename: string = '';
  let testInterpretationId: string = '';

  beforeAll(async () => {
    // 登入預設管理員
    const adminRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@celestial.dao',
      password: 'AdminPassword123!',
    });
    adminToken = adminRes.body.data.token;
  });

  describe('1. DEMO 模式環境變數與端點測試', () => {
    it('GET /api/v1/auth/config 應返回當前系統 DEMO 模式開關', async () => {
      const res = await request(app).get('/api/v1/auth/config');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.demoMode).toBe('boolean');
    });
  });

  describe('2. 資料庫管理與備份還原 (Database Admin & Backups)', () => {
    it('GET /api/v1/admin/database/stats 應返回資料庫容量與各表計數', async () => {
      const res = await request(app)
        .get('/api/v1/admin/database/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.dbName).toBeDefined();
      expect(res.body.data.fileSize).toBeGreaterThan(0);
      expect(res.body.data.tableCounts.User).toBeGreaterThanOrEqual(1);
      expect(res.body.data.tableCounts.SystemInterpretation).toBeGreaterThanOrEqual(1);
    });

    it('POST /api/v1/admin/database/backup 應成功建立即時備份快照', async () => {
      const res = await request(app)
        .post('/api/v1/admin/database/backup')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.filename).toMatch(/^celestial_backup_.*\.db$/);
      expect(res.body.data.size).toBeGreaterThan(0);
      backupFilename = res.body.data.filename;
    });

    it('GET /api/v1/admin/database/backups 應包含剛剛建立的備份檔案', async () => {
      const res = await request(app)
        .get('/api/v1/admin/database/backups')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.some((b: any) => b.filename === backupFilename);
      expect(found).toBe(true);
    });

    it('GET /api/v1/admin/database/tables/User 應分頁返回會員表資料', async () => {
      const res = await request(app)
        .get('/api/v1/admin/database/tables/User?page=1&pageSize=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.table).toBe('User');
      expect(Array.isArray(res.body.data.rows)).toBe(true);
      expect(res.body.data.rows.length).toBeGreaterThanOrEqual(1);
    });

    it('POST / PUT / DELETE /api/v1/admin/database/tables/SystemInterpretation 應支援資料列完整生命週期', async () => {
      // 1. 新增
      const createRes = await request(app)
        .post('/api/v1/admin/database/tables/SystemInterpretation')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          moduleType: 'TAROT',
          keyCode: 'TEST_TAROT_TEMPERANCE',
          category: 'MAJOR',
          title: '節制 (Temperance) 正位',
          contentRich: '象徵內在和諧與能量調和，在平穩節奏中尋找心靈平衡。',
        });
      expect(createRes.status).toBe(201);
      expect(createRes.body.success).toBe(true);
      testInterpretationId = createRes.body.data.id;

      // 2. 修改
      const updateRes = await request(app)
        .put(`/api/v1/admin/database/tables/SystemInterpretation/${testInterpretationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: '節制 (Temperance) 深度修持解讀',
        });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.title).toContain('深度修持解讀');

      // 3. 刪除
      const deleteRes = await request(app)
        .delete(`/api/v1/admin/database/tables/SystemInterpretation/${testInterpretationId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
    });
  });

  describe('3. 會員管理與權限設定 (Member Management)', () => {
    it('POST /api/v1/admin/users 應手動建立新會員帳號', async () => {
      const email = `admin_created_${Date.now()}@celestial.dao`;
      const res = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email,
          password: 'MemberSecurePass123!',
          displayName: '後台手動會員',
          role: 'VIP',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(email);
      expect(res.body.data.role).toBe('VIP');
      createdUserId = res.body.data.id;
    });

    it('PUT /api/v1/admin/users/:id 應更新會員暱稱與角色', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          displayName: '後台改名會員',
          role: 'MEMBER',
          emailVerified: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.displayName).toBe('後台改名會員');
      expect(res.body.data.role).toBe('MEMBER');
    });

    it('POST /api/v1/admin/users/:id/password 應重設會員密碼', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/users/${createdUserId}/password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newPassword: 'BrandNewPassword888!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('DELETE /api/v1/admin/users/:id 應成功刪除該會員', async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('4. RAG 知識庫管理與檢索測試 (RAG Engineering)', () => {
    it('POST /api/v1/admin/rag/test-retrieval 應能即時調試檢索結果與提示詞', async () => {
      const res = await request(app)
        .post('/api/v1/admin/rag/test-retrieval')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          moduleType: 'WESTERN',
          query: '太陽落入白羊座',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.roleTitle).toContain('占星');
      expect(res.body.data.generatedRagSnippet).toContain('白羊座');
    });

    it('GET /api/v1/admin/rag/export 應匯出所有 RAG 辭庫資料為 JSON 陣列', async () => {
      const res = await request(app)
        .get('/api/v1/admin/rag/export')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('POST /api/v1/admin/rag/import 應能批次匯入並同步 RAG 辭條', async () => {
      const importKey = `BATCH_TEST_${Date.now()}`;
      const res = await request(app)
        .post('/api/v1/admin/rag/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          items: [
            {
              moduleType: 'ALMANAC',
              keyCode: importKey,
              category: 'SPECIAL',
              title: '特別批次測試詞條',
              contentRich: '這是一條自動化測試批次匯入的 RAG 解讀。',
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);

      // 清理測試條目
      const cleanupItem = await request(app)
        .get(`/api/v1/admin/interpretations?search=${importKey}`)
        .set('Authorization', `Bearer ${adminToken}`);
      if (cleanupItem.body.data?.[0]?.id) {
        await request(app)
          .delete(`/api/v1/admin/interpretations/${cleanupItem.body.data[0].id}`)
          .set('Authorization', `Bearer ${adminToken}`);
      }
    }, 15000);
  });
});
