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
      expect(res.body.data.baziChart.dayMaster.stem).toBeDefined();

      simulatorSessionId = res.body.data.session.sessionId;
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
      expect(res.body.data.node.eventTitle).toBeDefined();
      expect(res.body.data.node.options.length).toBeGreaterThanOrEqual(2);
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

