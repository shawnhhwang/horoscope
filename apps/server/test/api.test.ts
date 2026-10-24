import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('🚀 萬象天儀 後端 API 服務整合測試', () => {
  const app = createApp();
  let adminToken: string = '';
  let memberToken: string = '';

  beforeAll(async () => {
    // 登入預設管理員
    const adminRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@celestial.dao',
      password: 'AdminPassword123!',
    });
    adminToken = adminRes.body.data.token;

    // 登入預設 VIP 會員
    const vipRes = await request(app).post('/api/v1/auth/login').send({
      email: 'vip@celestial.dao',
      password: 'UserPassword123!',
    });
    memberToken = vipRes.body.data.token;
  });

  it('GET /health 應返回健康狀態 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  describe('1. 認證模組 (Auth Module)', () => {
    it('會員註冊成功並返回 JWT Token', async () => {
      const email = `test_${Date.now()}@celestial.dao`;
      const res = await request(app).post('/api/v1/auth/register').send({
        email,
        password: 'Password123!',
        displayName: '測試星象徒',
      });
      expect(res.status).toBe(201);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(email);
    });

    it('密碼錯誤時應拒絕登入 401', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@celestial.dao',
        password: 'WrongPassword!',
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('攜帶 Token 訪問 /api/v1/auth/me 應返回個人資料', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${memberToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('vip@celestial.dao');
    });
  });

  describe('2. 排盤計算模組 (Calculator Module)', () => {
    it('POST /api/v1/calculator/ziwei 應成功排盤並校準真太陽時，並輸出大限/流年/小限行運與純星曜四化', async () => {
      const res = await request(app).post('/api/v1/calculator/ziwei').send({
        birthDate: '1995-10-24T08:00:00Z',
        gender: '男',
        longitude: 121.5654,
        targetYear: 2026,
      });
      expect(res.status).toBe(200);
      expect(res.body.data.chart.palacesList.length).toBe(12);
      expect(res.body.data.solarInfo.trueSolarTime).toBeDefined();

      // 驗證 Horoscope 大限、流年、小限行運及其四化 (bare star-name array)
      const horoscope = res.body.data.chart.horoscope;
      expect(horoscope).toBeDefined();
      expect(horoscope.targetYear).toBe(2026);
      expect(horoscope.nominalAge).toBe(32);
      expect(horoscope.decade.siHua.length).toBe(4);
      expect(horoscope.yearly.siHua).toEqual(['天同', '天機', '文昌', '廉貞']);
      expect(horoscope.smallLimit.siHua.length).toBe(4);
    });

    it('POST /api/v1/calculator/bazi 應產出四柱與十神喜用神', async () => {
      const res = await request(app).post('/api/v1/calculator/bazi').send({
        birthDate: '1995-10-24T08:00:00Z',
        gender: '男',
      });
      expect(res.status).toBe(200);
      expect(res.body.data.chart.pillars.year).toBeDefined();
      expect(res.body.data.chart.favorableElements.useful.length).toBeGreaterThan(0);
    });

    it('POST /api/v1/calculator/iching/cast 應成功起周易六爻金錢卦', async () => {
      const res = await request(app).post('/api/v1/calculator/iching/cast').send({
        mode: 'coin',
      });
      expect(res.status).toBe(200);
      expect(res.body.data.baseHexagram.name).toBeDefined();
      expect(res.body.data.originalYaoList.length).toBe(6);
    });

    it('POST /api/v1/calculator/naming/analyze 應分析姓名五格與三才評估', async () => {
      const res = await request(app).post('/api/v1/calculator/naming/analyze').send({
        surname: '林',
        givenName: '澤洋',
      });
      expect(res.status).toBe(200);
      expect(res.body.data.threeTalents.pattern).toBeDefined();
      expect(res.body.data.overallScore).toBeGreaterThan(50);
    });

    it('POST /api/v1/calculator/western/natal 應計算行星相位與月相原型', async () => {
      const res = await request(app).post('/api/v1/calculator/western/natal').send({
        birthDate: '2000-01-01T12:00:00Z',
      });
      expect(res.status).toBe(200);
      expect(res.body.data.sunSign).toBeDefined();
      expect(res.body.data.moonSign).toBeDefined();
      expect(res.body.data.lunarPhase.archetypeTitle).toBeDefined();
    });

    it('POST /api/v1/calculator/tarot/draw 應抽取牌陣', async () => {
      const res = await request(app).post('/api/v1/calculator/tarot/draw').send({
        spreadType: 'three_cards',
      });
      expect(res.status).toBe(200);
      expect(res.body.data.drawnCards.length).toBe(3);
    });

    it('POST /api/v1/calculator/qizheng 應產出七政四餘天星全盤與恩難四星', async () => {
      const res = await request(app).post('/api/v1/calculator/qizheng').send({
        birthDate: '1995-10-24T08:30:00Z',
        longitude: 121.56,
        latitude: 25.03,
      });
      expect(res.status).toBe(200);
      expect(res.body.data.planets.length).toBe(11);
      expect(res.body.data.palaces.length).toBe(12);
      expect(res.body.data.fourStarRelations.rulerStar).toBeDefined();
    });

    it('POST /api/v1/calculator/bazi/synastry 應成功計算八字合婚契合度與維度剖析', async () => {
      const res = await request(app).post('/api/v1/calculator/bazi/synastry').send({
        person1: { name: '陳俊廷', gender: '男', birthDate: '1991-05-18T09:30:00Z' },
        person2: { name: '許芳瑜', gender: '女', birthDate: '1993-08-24T15:20:00Z' },
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.score).toBeGreaterThanOrEqual(50);
      expect(res.body.data.dimensions.dayMasterSynergy).toBeDefined();
      expect(res.body.data.bridgingElement.element).toBeDefined();
    });

    it('POST /api/v1/calculator/bazi/family-group 應成功計算家人群組五行場域與動態矩陣', async () => {
      const res = await request(app).post('/api/v1/calculator/bazi/family-group').send({
        familyTitle: '溫馨同樂之家',
        members: [
          { name: '父親', role: '父親', gender: '男', birthDate: '1966-02-14T08:00:00Z' },
          { name: '母親', role: '母親', gender: '女', birthDate: '1969-07-22T11:00:00Z' },
          { name: '長子', role: '長子', gender: '男', birthDate: '1996-10-10T14:00:00Z' },
        ],
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.memberCount).toBe(3);
      expect(res.body.data.householdAura.dominantElement).toBeDefined();
      expect(res.body.data.crossMatrix.length).toBe(3);
    });

    it('GET /api/v1/almanac/today 與 POST /api/v1/almanac/query 應取得農曆黃曆與每日生肖運勢', async () => {
      const todayRes = await request(app).get('/api/v1/almanac/today');
      expect(todayRes.status).toBe(200);
      expect(todayRes.body.data.lunarDate.formatted).toBeDefined();
      expect(todayRes.body.data.dayOfficer.name).toBeDefined();
      expect(todayRes.body.data.zodiacHoroscopes.length).toBe(12);

      const queryRes = await request(app).post('/api/v1/almanac/query').send({
        date: '2026-10-20',
      });
      expect(queryRes.status).toBe(200);
      expect(queryRes.body.data.date).toBe('2026-10-20');
      expect(queryRes.body.data.suitableActivities.length).toBeGreaterThan(0);
    });
  });

  describe('3. 個人命盤庫與測算日記 (Profiles & Readings)', () => {
    let createdProfileId = '';

    it('POST /api/v1/profiles 應新增命盤人物檔案', async () => {
      const res = await request(app)
        .post('/api/v1/profiles')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          name: '伴侶命盤',
          gender: '女',
          birthDatetime: '1996-03-12T14:00:00Z',
          longitude: 121.5,
          latitude: 25.0,
          birthLocationName: '台北',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('伴侶命盤');
      createdProfileId = res.body.data.id;
    });

    it('GET /api/v1/profiles 應返回命盤人物列表', async () => {
      const res = await request(app)
        .get('/api/v1/profiles')
        .set('Authorization', `Bearer ${memberToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('POST /api/v1/readings 應儲存測算記錄與個人日記', async () => {
      const res = await request(app)
        .post('/api/v1/readings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          profileId: createdProfileId,
          moduleType: 'TAROT',
          inputSnapshot: { spread: 'single' },
          chartOutput: { card: 'The Star' },
          aiSummary: '今日抽得星星牌，內心充滿希望與靈感。',
          userNotes: '今天確實順利突破了設計瓶頸！',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.aiSummary).toContain('星星牌');
    });
  });

  describe('4. 後台管理系統權限保護 (Admin Portal RBAC)', () => {
    it('一般 VIP 會員訪問後台統計應被拒絕 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${memberToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('管理員訪問後台統計應成功獲取數據大盤', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.totalUsers).toBeGreaterThanOrEqual(2);
      expect(res.body.data.totalInterpretations).toBeGreaterThanOrEqual(5);
    });

    it('管理員應能查詢與維護命理辭庫列表', async () => {
      const res = await request(app)
        .get('/api/v1/admin/interpretations')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('5. 天機靈犀 LLM 智能助手與後台配置 (LLM Module & Admin Config)', () => {
    it('GET /api/v1/llm/status 應返回靈犀助手狀態與模型配置', async () => {
      const res = await request(app).get('/api/v1/llm/status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.enabled).toBe(true);
    });

    it('POST /api/v1/llm/chat 應結合命盤背景生成深入解盤回覆 (支援物件結構之 palaces 與西洋星盤)', async () => {
      // 使用 vi.spyOn 模擬 LLM 外部端點回應，既驗證介面協議又不佔用本地 Ollama 實例運算資源
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, init: any) => {
        const bodyStr = String(init?.body || '');
        const isWestern = bodyStr.includes('白羊座');
        return {
          ok: true,
          json: async () => ({
            choices: [
              {
                message: {
                  content: isWestern
                    ? '現代心理占星顧問診斷：太陽落在白羊座，生命力旺盛，具備強大開創意志。'
                    : '現代紫微斗數命理諮詢診斷：命主紫微天府居寅，格局宏大，具備優秀領導力。',
                },
              },
            ],
          }),
        } as any;
      });

      try {
        // 1. 測試紫微斗數真實產出之物件格式 palaces
        const ziweiRes = await request(app)
          .post('/api/v1/llm/chat')
          .send({
            messages: [{ role: 'user', content: '請為我解讀目前的運勢走向與事業策略' }],
            chartContext: {
              moduleType: 'ZIWEI',
              title: '真實紫微盤',
              summary: '命宮坐紫微天府',
              rawData: {
                elementBureau: '水二局',
                lifePalaceBranch: '寅',
                palaces: {
                  寅: { name: '命宮', isMingPalace: true, majorStars: [{ name: '紫微' }, { name: '天府' }] },
                  卯: { name: '兄弟', isMingPalace: false, majorStars: [] },
                },
              },
            },
          });
        expect(ziweiRes.status).toBe(200);
        expect(ziweiRes.body.success).toBe(true);
        expect(ziweiRes.body.data.reply).toContain('紫微');
        expect(ziweiRes.body.data.reply).toContain('天府');

        // 2. 測試西洋星盤
        const westernRes = await request(app)
          .post('/api/v1/llm/chat')
          .send({
            messages: [{ role: 'user', content: '請解讀我星盤日月相位' }],
            chartContext: {
              moduleType: 'WESTERN',
              title: '西洋星盤',
              summary: '日白羊·月巨蟹',
              rawData: {
                sunSign: '白羊座',
                moonSign: '巨蟹座',
                ascendantSign: '獅子座',
                planets: [
                  { name: '太陽', sign: '白羊座' },
                  { name: '月亮', sign: '巨蟹座' },
                ],
              },
            },
          });
        expect(westernRes.status).toBe(200);
        expect(westernRes.body.success).toBe(true);
        expect(westernRes.body.data.reply).toContain('白羊座');
        expect(westernRes.body.data.reply).toContain('心理占星');
      } finally {
        fetchSpy.mockRestore();
      }
    });

    it('管理員應能查詢與動態修改 LLM 助手配置', async () => {
      // 1. 查詢當前配置
      const getRes = await request(app)
        .get('/api/v1/admin/llm-config')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.model).toBeDefined();

      const originalModel = getRes.body.data.model;
      const originalTemperature = getRes.body.data.temperature;

      // 2. 更新配置
      const updateRes = await request(app)
        .put('/api/v1/admin/llm-config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          model: 'claude-3-5-sonnet',
          temperature: 0.8,
        });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.model).toBe('claude-3-5-sonnet');
      expect(updateRes.body.data.temperature).toBe(0.8);

      // 3. 還原原本配置，避免污染正式資料庫
      await request(app)
        .put('/api/v1/admin/llm-config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          model: originalModel,
          temperature: originalTemperature,
        });
    }, 30000);
  });
});

