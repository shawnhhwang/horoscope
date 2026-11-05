import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
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

  it('GET / 應返回前端 SPA index.html (一體化部署支援)', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<!DOCTYPE html>');
  });

  it('GET /bazi 應正確回退至前端 SPA index.html', async () => {
    const res = await request(app).get('/bazi');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<!DOCTYPE html>');
  });

  it('GET 未知 API /api/v1/unknown-endpoint 應返回 404 JSON 而非 HTML', async () => {
    const res = await request(app).get('/api/v1/unknown-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
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

    it('POST /api/v1/calculator/annual-calendar 應推算流年曆與十二流月行運', async () => {
      const res = await request(app).post('/api/v1/calculator/annual-calendar').send({
        birthDate: '1992-06-18T10:30:00Z',
        gender: '男',
        targetYear: 2026,
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.targetYear).toBe(2026);
      expect(res.body.data.yearGanZhi).toBe('丙午');
      expect(res.body.data.monthlyHorizons.length).toBe(12);
      expect(res.body.data.ziweiYearlyInfo.siHua.length).toBe(4);
    });

    it('POST /api/v1/calculator/annual-planner/analyze 應結合起居習慣進行命盤諧振評估與生活規劃', async () => {
      const res = await request(app).post('/api/v1/calculator/annual-planner/analyze').send({
        birthDate: '1992-06-18T10:30:00Z',
        gender: '男',
        targetYear: 2026,
        habits: [
          {
            date: '2026-06-01',
            sleepHours: 7.5,
            sleepQuality: '良好',
            dietType: '均衡清淡',
            waterMl: 2200,
            exerciseMinutes: 30,
            energyLevel: 4,
          },
        ],
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.calendar.targetYear).toBe(2026);
      expect(res.body.data.evaluation.resonanceScore).toBeGreaterThanOrEqual(50);
      expect(res.body.data.evaluation.actionPlans.length).toBeGreaterThanOrEqual(2);
    });

    it('POST /api/v1/calculator/buncho/draw 應成功抽取文鳥靈籤與動態擬真過程數據', async () => {
      const res = await request(app).post('/api/v1/calculator/buncho/draw').send({
        question: '今年能否順利考取理想研究所？',
        aspect: '學業',
        customLotId: 1,
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.lot.id).toBe(1);
      expect(res.body.data.lot.name).toContain('靈雀銜春');
      expect(res.body.data.lot.poem.length).toBe(4);
      expect(res.body.data.lot.birdAction).toContain('白文鳥');
      expect(res.body.data.lot.aspects.study).toBeDefined();

      const lotsRes = await request(app).get('/api/v1/calculator/buncho/lots');
      expect(lotsRes.status).toBe(200);
      expect(lotsRes.body.data.length).toBe(28);
    });

    it('POST /api/v1/calculator/temple/draw 與 /temple/bwei 應成功抽取六十甲子籤並支援擲筊與面向解籤', async () => {
      const drawRes = await request(app).post('/api/v1/calculator/temple/draw').send({
        seekerName: '林信士',
        inquiryAspect: 'marriage',
        question: '與當前對象是否合適步入婚姻？',
        customLotId: 1,
      });
      expect(drawRes.status).toBe(200);
      expect(drawRes.body.success).toBe(true);
      expect(drawRes.body.data.lot.stemBranch).toBe('甲子');
      expect(drawRes.body.data.lot.title).toContain('包公');
      expect(drawRes.body.data.aspectReport.aspectTitle).toContain('婚姻');
      expect(drawRes.body.data.aspectReport.aspectInterpretation).toBeDefined();

      const bweiRes = await request(app).post('/api/v1/calculator/temple/bwei').send({
        customType: 'sheng_bwei',
      });
      expect(bweiRes.status).toBe(200);
      expect(bweiRes.body.data.type).toBe('sheng_bwei');
      expect(bweiRes.body.data.typeName).toBe('聖筊');
      expect(bweiRes.body.data.isAccepted).toBe(true);

      const lotsRes = await request(app).get('/api/v1/calculator/temple/lots');
      expect(lotsRes.status).toBe(200);
      expect(lotsRes.body.data.length).toBe(60);
    });

    it('POST /api/v1/calculator/dream/search 與 /dream/analyze 應成功檢索周公原典與榮格多象徵分析', async () => {
      const searchRes = await request(app).post('/api/v1/calculator/dream/search').send({
        keyword: '蛇',
      });
      expect(searchRes.status).toBe(200);
      expect(searchRes.body.data.total).toBeGreaterThanOrEqual(1);
      expect(searchRes.body.data.matchedEntries[0].classicText).toContain('周公解夢');

      const analyzeRes = await request(app).post('/api/v1/calculator/dream/analyze').send({
        scenario: '夢見自己飛在天上，地上有好多大水和金龍在游動！',
      });
      expect(analyzeRes.status).toBe(200);
      expect(analyzeRes.body.data.matchedKeywords.length).toBeGreaterThanOrEqual(2);
      expect(analyzeRes.body.data.dominantOmen).toBe('大吉');
      expect(analyzeRes.body.data.synthesis.omenSummary).toBeTruthy();
      expect(analyzeRes.body.data.synthesis.psychologicalCore).toBeTruthy();

      const catRes = await request(app).get('/api/v1/calculator/dream/categories');
      expect(catRes.status).toBe(200);
      expect(catRes.body.data.length).toBe(8);
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

    it('POST / GET / DELETE /api/v1/habits 應能完整管理每日生活起居日記', async () => {
      // 1. 新增
      const postRes = await request(app)
        .post('/api/v1/habits')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          date: '2026-10-24',
          sleepHours: 8.0,
          sleepQuality: '優質',
          dietType: '均衡清淡',
          waterMl: 2500,
          exerciseMinutes: 45,
          energyLevel: 5,
          notes: '全天精力充沛',
          tags: ['早起', '冥想'],
        });
      expect(postRes.status).toBe(201);
      expect(postRes.body.data.date).toBe('2026-10-24');
      const habitId = postRes.body.data.id;

      // 2. 查詢
      const getRes = await request(app)
        .get('/api/v1/habits')
        .set('Authorization', `Bearer ${memberToken}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.length).toBeGreaterThanOrEqual(1);

      // 3. 刪除
      const delRes = await request(app)
        .delete(`/api/v1/habits/${habitId}`)
        .set('Authorization', `Bearer ${memberToken}`);
      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);
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

    it('POST /api/v1/llm/chat 應注入確定性排盤數據 (八字四柱干支與十神、紫微十二宮、塔羅抽牌)，並嚴禁 AI 自行排盤或抽牌', async () => {
      let capturedSystemPrompt = '';
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, init: any) => {
        const payload = JSON.parse(String(init?.body || '{}'));
        capturedSystemPrompt = payload.messages?.[0]?.content || '';
        return {
          ok: true,
          json: async () => ({
            choices: [
              {
                message: {
                  content: '專業顧問解析完成：四柱星曜均依客觀盤面開展。',
                },
              },
            ],
          }),
        } as any;
      });

      try {
        // 1. 八字：驗證傳入八字資料時，系統自動格式化確定性四柱數據並加入鐵律標語
        const baziRes = await request(app)
          .post('/api/v1/llm/chat')
          .send({
            messages: [{ role: 'user', content: '請為我分析日主五行與大運' }],
            chartContext: {
              moduleType: 'BAZI',
              title: '四柱八字盤',
              rawData: {
                birthDate: '1995-10-24T14:30:00Z',
                gender: '男',
                longitude: 121.56,
              },
            },
          });
        expect(baziRes.status).toBe(200);
        expect(capturedSystemPrompt).toContain('排盤確定性鐵律');
        expect(capturedSystemPrompt).toContain('@celestial/astro-core');
        expect(capturedSystemPrompt).toContain('年柱');
        expect(capturedSystemPrompt).toContain('月柱');
        expect(capturedSystemPrompt).toContain('日柱');
        expect(capturedSystemPrompt).toContain('時柱');

        // 2. 紫微斗數：驗證傳入紫微盤時，系統注入十二宮精密配置與確定性鐵律
        const ziweiRes = await request(app)
          .post('/api/v1/llm/chat')
          .send({
            messages: [{ role: 'user', content: '請為我分析紫微命身宮' }],
            chartContext: {
              moduleType: 'ZIWEI',
              title: '紫微天機排盤',
              rawData: {
                birthDate: '1995-10-24T14:30:00Z',
                gender: '男',
                longitude: 121.56,
              },
            },
          });
        expect(ziweiRes.status).toBe(200);
        expect(capturedSystemPrompt).toContain('排盤確定性鐵律');
        expect(capturedSystemPrompt).toContain('十二宮位精密星曜配置');
        expect(capturedSystemPrompt).toContain('命宮');

        // 3. 塔羅占卜：驗證傳入塔羅時，系統注入由程式隨機抽出之牌陣與抽牌鐵律
        const tarotRes = await request(app)
          .post('/api/v1/llm/chat')
          .send({
            messages: [{ role: 'user', content: '請為我解讀此次抽牌心靈啟示' }],
            chartContext: {
              moduleType: 'TAROT',
              title: '時間之流三張牌陣',
              rawData: {
                spreadType: 'three_cards',
              },
            },
          });
        expect(tarotRes.status).toBe(200);
        expect(capturedSystemPrompt).toContain('抽牌確定性鐵律');
        expect(capturedSystemPrompt).toContain('Fisher-Yates 隨機演算法');
        expect(capturedSystemPrompt).toContain('槽位 1');
        expect(capturedSystemPrompt).toContain('槽位 2');
        expect(capturedSystemPrompt).toContain('槽位 3');
      } finally {
        fetchSpy.mockRestore();
      }
    });

    it('當求測者在對話中要求排八字、排紫微或抽塔羅且未附排盤上下文時，系統應嚴格拒絕 AI 自行推算並導引至程式庫專屬頁面', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('LLM endpoint offline fallback'));
      try {
        // 1. 詢問排八字
        const baziGuideRes = await request(app)
          .post('/api/v1/llm/chat')
          .send({
            messages: [{ role: 'user', content: '我是 1990年5月20日 14點出生的男生，請幫我排八字算命' }],
          });
        expect(baziGuideRes.status).toBe(200);
        expect(baziGuideRes.body.data.reply).toContain('排盤確定性鐵律');
        expect(baziGuideRes.body.data.reply).toContain('嚴格禁止 AI 進行模糊估算或自行排盤');
        expect(baziGuideRes.body.data.reply).toContain('/bazi');

        // 2. 詢問排紫微
        const ziweiGuideRes = await request(app)
          .post('/api/v1/llm/chat')
          .send({
            messages: [{ role: 'user', content: '請幫我排紫微斗數命盤，我想看命宮主星' }],
          });
        expect(ziweiGuideRes.status).toBe(200);
        expect(ziweiGuideRes.body.data.reply).toContain('排盤確定性鐵律');
        expect(ziweiGuideRes.body.data.reply).toContain('嚴格禁止 AI 自行排盤或憑空捏造十二宮星曜');
        expect(ziweiGuideRes.body.data.reply).toContain('/ziwei');

        // 3. 詢問抽塔羅
        const tarotGuideRes = await request(app)
          .post('/api/v1/llm/chat')
          .send({
            messages: [{ role: 'user', content: '請幫我抽塔羅牌算感情復合' }],
          });
        expect(tarotGuideRes.status).toBe(200);
        expect(tarotGuideRes.body.data.reply).toContain('抽牌確定性鐵律');
        expect(tarotGuideRes.body.data.reply).toContain('78 張經典韋特塔羅牌義');
        expect(tarotGuideRes.body.data.reply).toContain('6 大經典牌陣');
        expect(tarotGuideRes.body.data.reply).toContain('抽牌由程式 Fisher-Yates 隨機洗牌演算法客觀進行');
        expect(tarotGuideRes.body.data.reply).toContain('/tarot');

        // 4. 詢問文鳥抽籤
        const bunchoGuideRes = await request(app)
          .post('/api/v1/llm/chat')
          .send({
            messages: [{ role: 'user', content: '可以幫我文鳥抽籤占卜看看事業嗎？' }],
          });
        expect(bunchoGuideRes.status).toBe(200);
        expect(bunchoGuideRes.body.data.reply).toContain('文鳥抽籤必須由程式庫擬真開局');
        expect(bunchoGuideRes.body.data.reply).toContain('/buncho');

        // 5. 詢問廟宇籤詩與擲筊
        const templeGuideRes = await request(app)
          .post('/api/v1/llm/chat')
          .send({
            messages: [{ role: 'user', content: '我想求籤詩，可以幫我擲筊抽一張媽祖籤嗎？' }],
          });
        expect(templeGuideRes.status).toBe(200);
        expect(templeGuideRes.body.data.reply).toContain('六十甲子籤與擲筊必須由程式公正進行');
        expect(templeGuideRes.body.data.reply).toContain('/temple-poem');

        // 6. 詢問周公解夢
        const dreamGuideRes = await request(app)
          .post('/api/v1/llm/chat')
          .send({
            messages: [{ role: 'user', content: '我昨晚夢到好多蛇爬進家裡，請幫我解夢' }],
          });
        expect(dreamGuideRes.status).toBe(200);
        expect(dreamGuideRes.body.data.reply).toContain('夢境符號必須由經典字典庫精準檢索');
        expect(dreamGuideRes.body.data.reply).toContain('/dream');
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

  describe('6. 百歲流年人生推演模擬器 (Life Simulator Module)', () => {
    let simulatorSessionId = '';
    let fetchSpy: any;

    beforeAll(() => {
      fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, init: any) => {
        const bodyStr = String(init?.body || '');
        if (bodyStr.includes('百歲流年人生推演')) {
          return {
            ok: true,
            json: async () => ({
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      eventTitle: '成年之禮 · 文昌高照大考年',
                      eventNarrative: '你站在 18 歲的成年關口，面對重大升學與志向抉擇，內心既忐忑又充滿抱負。',
                      options: [
                        {
                          id: 'opt_a',
                          text: '全力以赴拼搏理想高等學府，深耕核心專業技能。',
                          attitude: 'AGGRESSIVE',
                          potentialImpact: { career: 8, wisdom: 5, health: -3 },
                          riskLevel: 'MEDIUM',
                        },
                        {
                          id: 'opt_b',
                          text: '穩紮穩打就近升學，平衡家庭陪伴與課外實踐。',
                          attitude: 'CONSERVATIVE',
                          potentialImpact: { relationship: 5, health: 3 },
                          riskLevel: 'LOW',
                        },
                      ],
                    }),
                  },
                },
              ],
            }),
          } as any;
        }

        return {
          ok: true,
          json: async () => ({
            choices: [
              {
                message: {
                  content: '【陳道遠】一生歷經風雲，以卓越才幹開闢宏圖，德業並彰，福壽康寧。',
                },
              },
            ],
          }),
        } as any;
      });
    });

    afterAll(() => {
      fetchSpy?.mockRestore();
    });

    it('POST /api/v1/simulator/start 應成功起局並生成 0~100 歲流年骨幹、四大領域數值與自訂生日紅顏名冊', async () => {
      const res = await request(app)
        .post('/api/v1/simulator/start')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          profileName: '陳道遠',
          gender: '男',
          birthDate: '1992-08-18T10:30:00Z',
          femaleFriends: [
            { id: 'friend_1', birthDate: '1991-09-12' }
          ]
        });

      if (res.status !== 200) {
        console.error('DEBUG START ERROR:', res.body);
      }

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.session).toBeDefined();
      expect(res.body.data.session.history.length).toBe(101);
      expect(res.body.data.session.history[0].taiwanEraContext).toBeDefined();
      expect(res.body.data.session.currentAge).toBe(0);
      expect(res.body.data.session.attributes.health).toBeGreaterThan(50);
      expect(res.body.data.session.attributes.knowledge).toBeDefined();
      expect(res.body.data.session.femaleFriends[0].birthDate).toBe('1991-09-12');
      expect(res.body.data.session.femaleFriends[0].herAffinity).toBeGreaterThan(0);
      // 驗證 18 歲紅顏相逢事件已精確預先注入節點
      expect(res.body.data.session.history[18].eventTitle).toContain('邂逅');
      expect(res.body.data.session.history[18].options.some((o: any) => o.text.includes('相伴一生'))).toBe(true);
      expect(res.body.data.baziChart.dayMaster.stem).toBeDefined();

      simulatorSessionId = res.body.data.session.sessionId;
    });

    it('POST /api/v1/simulator/start 應支援女性視角起局並自動注入五位藍顏知己與相伴一生選項', async () => {
      const res = await request(app)
        .post('/api/v1/simulator/start')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          profileName: '林曉晴',
          gender: '女',
          birthDate: '1996-04-12T09:00:00Z',
          romanceFriends: [
            { id: 'friend_m1', birthDate: '1995-09-15' },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.session.gender).toBe('女');
      expect(res.body.data.session.femaleFriends.length).toBe(5);
      expect(res.body.data.session.femaleFriends[0].name).toBe('陸子軒');
      expect(res.body.data.session.femaleFriends[0].illustration).toContain('romance_male_zixuan');
      // 18歲藍顏相遇事件已精確預先注入
      const node18 = res.body.data.session.history[18];
      expect(node18.isKeyMilestone).toBe(true);
      expect(node18.eventTitle).toContain('邂逅【溫暖清朗的白襯衫學長】');
      expect(node18.options.some((o: any) => o.text.includes('相伴一生'))).toBe(true);
    });

    it('GET /api/v1/simulator/session/:id 應能讀取既有推演 Session 存檔', async () => {
      const res = await request(app).get(`/api/v1/simulator/session/${simulatorSessionId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profileName).toBe('陳道遠');
      expect(res.body.data.attributes).toBeDefined();
    });

    it('POST /api/v1/simulator/turn/prompt 應生成指定歲數之年初行運、事件情境與抉擇選項並注入台灣時代背景', async () => {
      const res = await request(app)
        .post('/api/v1/simulator/turn/prompt')
        .send({
          sessionId: simulatorSessionId,
          age: 18,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.node.age).toBe(18);
      expect(res.body.data.node.taiwanEraContext).toBeDefined();
      expect(typeof res.body.data.node.taiwanEraContext).toBe('string');
      expect(res.body.data.node.eventTitle).toContain('邂逅');
      expect(res.body.data.node.options.some((o: any) => o.text.includes('相伴一生'))).toBe(true);
      expect(res.body.data.node.options.length).toBeGreaterThanOrEqual(4);
    });

    it('POST /api/v1/simulator/turn/choose 應正確結算選項、結算屬性差值並推進歲月', async () => {
      const promptRes = await request(app)
        .post('/api/v1/simulator/turn/prompt')
        .send({
          sessionId: simulatorSessionId,
          age: 0,
        });
      const firstOptId = promptRes.body.data.node.options[0].id;

      const chooseRes = await request(app)
        .post('/api/v1/simulator/turn/choose')
        .send({
          sessionId: simulatorSessionId,
          age: 0,
          chosenOptionId: firstOptId,
        });

      expect(chooseRes.status).toBe(200);
      expect(chooseRes.body.success).toBe(true);
      expect(chooseRes.body.data.resolvedNode.chosenOptionId).toBe(firstOptId);
      expect(chooseRes.body.data.resolvedNode.attributeDeltas).toBeDefined();
      expect(chooseRes.body.data.nextAge).toBe(1);
    });

    it('POST /api/v1/simulator/fast-forward 應支援自動平穩快進推進至下個關鍵轉折年', async () => {
      const res = await request(app)
        .post('/api/v1/simulator/fast-forward')
        .send({
          sessionId: simulatorSessionId,
          maxYears: 5,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.currentAge).toBeGreaterThan(1);
      expect(res.body.data.steppedYears).toBeGreaterThan(0);
    });

    it('POST /api/v1/simulator/start 應支援自1845年清代起之百歲人生起局並包含時代平均壽命與傳染病資訊', async () => {
      const res = await request(app)
        .post('/api/v1/simulator/start')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          profileName: '林清源',
          gender: '男',
          birthDate: '1845-06-15T12:00:00Z',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const session = res.body.data.session;
      expect(session.history.length).toBe(101);
      const node0 = session.history[0];
      expect(node0.solarYear).toBe(1845);
      expect(node0.eraAvgLifeExpectancy).toBe(31);
      expect(node0.isEpidemicYear).toBe(true);
      expect(node0.eraEpidemics.length).toBeGreaterThan(0);
      expect(node0.taiwanEraContext).toContain('金湖');
    });

    it('POST /api/v1/simulator/finalize 應成功生成終局自傳式《一生行誼·蓋棺錄》並支援方案C多重視角 (倪師心法、太史公、回憶錄)', async () => {
      const res = await request(app)
        .post('/api/v1/simulator/finalize')
        .send({
          sessionId: simulatorSessionId,
          perspective: 'TIANJI',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.endingTitle).toBeDefined();
      expect(res.body.data.biographyRichText).toContain('陳道遠');
      expect(res.body.data.activePerspective).toBe('TIANJI');
      expect(res.body.data.perspectiveBiographies?.TIANJI).toBeDefined();
      expect(res.body.data.perspectiveBiographies?.SHIJI).toContain('太史公曰');
      expect(res.body.data.perspectiveBiographies?.MEMOIR).toContain('回憶錄');
      expect(res.body.data.radarScores).toBeDefined();
      expect(res.body.data.destinyAlignmentScore).toBeGreaterThanOrEqual(60);

      // 切換為太史公正史視角
      const shijiRes = await request(app)
        .post('/api/v1/simulator/finalize')
        .send({
          sessionId: simulatorSessionId,
          perspective: 'SHIJI',
        });
      expect(shijiRes.status).toBe(200);
      expect(shijiRes.body.data.activePerspective).toBe('SHIJI');
      expect(shijiRes.body.data.biographyRichText).toContain('太史公曰');

      // 切換為 80 億分之一的遊戲 (One in Eight Billion) 視角與紅顏盲盒因緣大揭曉
      const eightBRes = await request(app)
        .post('/api/v1/simulator/finalize')
        .send({
          sessionId: simulatorSessionId,
          perspective: 'ONE_IN_8_BILLION',
        });
      expect(eightBRes.status).toBe(200);
      expect(eightBRes.body.data.activePerspective).toBe('ONE_IN_8_BILLION');
      expect(eightBRes.body.data.biographyRichText).toContain('80億分之一');
      expect(eightBRes.body.data.oneInEightBillion).toBeDefined();
      expect(eightBRes.body.data.oneInEightBillion.destinyCode).toContain('DESTINY-TW-8B');
      expect(eightBRes.body.data.oneInEightBillion.revealedFriends.length).toBe(5);
    });

    it('攜帶其他會員 token 嘗試存取他人之推演 Session 應被阻擋 403 (IDOR 防護)', async () => {
      // 註冊第二位會員 (使用動態 email 避免唯一約束衝突)
      const attackerEmail = `attacker_${Date.now()}_${Math.random().toString(36).substring(7)}@celestial.dao`;
      const user2Res = await request(app).post('/api/v1/auth/register').send({
        email: attackerEmail,
        password: 'Password123!',
        displayName: '未授權存取測試員',
      });
      const user2Token = user2Res.body?.data?.token;
      expect(user2Token).toBeDefined();

      // 嘗試跨帳號操作他人之 session
      const attackRes = await request(app)
        .post('/api/v1/simulator/turn/choose')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          sessionId: simulatorSessionId,
          age: 0,
          chosenOptionId: 'opt_1',
        });
      expect(attackRes.status).toBe(403);
      expect(attackRes.body.success).toBe(false);
    });
  });
});

