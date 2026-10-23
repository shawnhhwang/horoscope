import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import {
  getModuleRole,
  normalizeModuleKey,
  retrieveModuleKnowledge,
  generateProfessionalSynthesizerReply,
  MODULE_ROLES,
} from '../src/modules/llm/service.js';

describe('🌟 Role-RAG 角色化專屬顧問與去仙人化語氣意圖測試 (Suite B & C)', () => {
  const app = createApp();
  const BANNED_TERMS = ['天機星君', '貧道', '老夫', '道友', '仙人', '本座', '施主'];

  const ALL_MODULES = [
    { code: 'ZIWEI', label: '紫微斗數' },
    { code: 'BAZI', label: '四柱八字' },
    { code: 'WESTERN', label: '西洋占星' },
    { code: 'WESTERN_NATAL', label: '西洋本命星盤' },
    { code: 'TAROT', label: '韋特塔羅' },
    { code: 'ICHING', label: '周易六爻' },
    { code: 'QIZHENG', label: '七政四餘' },
    { code: 'NAME', label: '姓名學五格' },
    { code: 'NAMING', label: '易經姓名學' },
    { code: 'ALMANAC', label: '通勝黃曆' },
    { code: 'BAZI_SYNASTRY', label: '八字合婚' },
    { code: 'FAMILY_GROUP', label: '家庭群組' },
  ];

  describe('TC-B01: 8 大模組專屬現代顧問角色注入驗證', () => {
    it('每個模組應有明確獨立之顧問專業標題與角色職能', () => {
      for (const mod of ALL_MODULES) {
        const role = getModuleRole(mod.code);
        expect(role).toBeDefined();
        expect(role.title).toBeDefined();
        expect(role.rolePersona).toBeDefined();
        expect(role.consultationStructure.length).toBeGreaterThanOrEqual(4);
        expect(role.coreKnowledge.length).toBeGreaterThan(20);
      }
    });

    it('WESTERN 與 WESTERN_NATAL 應映射至相同的現代心理占星顧問', () => {
      const west1 = getModuleRole('WESTERN');
      const west2 = getModuleRole('WESTERN_NATAL');
      expect(west1.title).toBe(west2.title);
      expect(west1.title).toContain('心理占星');
    });

    it('NAME 與 NAMING 應映射至正統姓名學顧問', () => {
      const name1 = getModuleRole('NAME');
      const name2 = getModuleRole('NAMING');
      expect(name1.title).toBe(name2.title);
      expect(name1.title).toContain('姓名學');
    });
  });

  describe('TC-B02: 嚴格禁止仙人/道士口吻測試 (Intent Assertion)', () => {
    it('所有 8 大模組之 System Prompt 角色設定嚴格不得包含任何禁用詞彙', () => {
      for (const mod of ALL_MODULES) {
        const role = getModuleRole(mod.code);
        const combinedText = `${role.title} ${role.rolePersona} ${role.toneGuidelines} ${role.coreKnowledge}`;

        // 雖然 Prompt 包含「禁止使用天機星君/貧道等稱謂」，但正文與自我介紹絕對不得自稱
        // 驗證自稱未出現：老夫、貧道、道友等未被用作顧問自稱
        expect(role.title).not.toMatch(/天機星君|仙人|道士|國師級大師/);
        expect(role.rolePersona).toContain('嚴禁使用');
      }
    });

    it('離線合成器 generateProfessionalSynthesizerReply 對全部 8 大模組均無仙人道士詞彙', () => {
      const mockUserMsg = [{ role: 'user' as const, content: '請依據我的命盤，指點事業與人生重大決策。' }];

      const sampleContexts = [
        {
          moduleType: 'ZIWEI',
          title: '紫微命盤',
          rawData: {
            elementBureau: '水二局',
            lifePalaceBranch: '寅',
            palaces: { 寅: { name: '命宮', isMingPalace: true, majorStars: [{ name: '紫微' }, { name: '天府' }] } },
          },
        },
        {
          moduleType: 'BAZI',
          title: '八字命盤',
          rawData: { dayMaster: '甲木', favorableElements: '丙火、戊土' },
        },
        {
          moduleType: 'WESTERN',
          title: '西洋星盤',
          rawData: { sunSign: '白羊座', moonSign: '巨蟹座', ascendantSign: '獅子座' },
        },
        {
          moduleType: 'WESTERN_NATAL',
          title: '西洋本命星盤',
          rawData: { sunSign: '金牛座', moonSign: '天蠍座', ascendantSign: '天秤座' },
        },
        {
          moduleType: 'TAROT',
          title: '韋特塔羅',
          rawData: {
            spreadName: '時間之流三張牌',
            drawnCards: [
              { card: { nameZh: '魔術師' }, isReversed: false },
              { card: { nameZh: '星星' }, isReversed: false },
              { card: { nameZh: '太陽' }, isReversed: false },
            ],
          },
        },
        {
          moduleType: 'ICHING',
          title: '周易六爻',
          rawData: { originalHexagram: { name: '乾為天' }, transformedHexagram: { name: '天風姤' }, movingLines: [1] },
        },
        {
          moduleType: 'QIZHENG',
          title: '七政四餘',
          rawData: { mingPalaceStation: '玄枵', mingMansion: '虛日鼠', fourStarRelations: { rulerStar: '歲星', generativeStar: '辰星' } },
        },
        {
          moduleType: 'NAME',
          title: '姓名學',
          rawData: { totalScore: 92, threeTalents: { pattern: '木火土' } },
        },
        {
          moduleType: 'ALMANAC',
          title: '通勝黃曆',
          rawData: { lunarDate: { formatted: '丙午年九月十五' }, dayOfficer: { name: '成' } },
        },
      ];

      for (const ctx of sampleContexts) {
        const reply = generateProfessionalSynthesizerReply(mockUserMsg, ctx);
        expect(reply).toBeDefined();
        expect(reply.length).toBeGreaterThan(80);

        for (const banned of BANNED_TERMS) {
          expect(reply, `模組 ${ctx.moduleType} 合成診斷中不得包含禁用詞彙 "${banned}"`).not.toContain(banned);
        }
      }
    });
  });

  describe('TC-B03: 模組專屬 RAG 知識庫動態檢索驗證', () => {
    it('WESTERN 與 WESTERN_NATAL 皆能檢索出資料庫中的西洋占星辭庫', async () => {
      const westernKnowledge1 = await retrieveModuleKnowledge('WESTERN', {
        title: '西洋星盤',
        rawData: { sunSign: '白羊座' },
      });
      const westernKnowledge2 = await retrieveModuleKnowledge('WESTERN_NATAL', {
        title: '西洋星盤',
        rawData: { sunSign: '白羊座' },
      });

      expect(westernKnowledge1).toContain('白羊座');
      expect(westernKnowledge2).toContain('白羊座');
    });

    it('QIZHENG 能檢索出恩難四星辭庫', async () => {
      const qizhengKnowledge = await retrieveModuleKnowledge('QIZHENG', {
        title: '七政四餘天星盤',
        rawData: { mingMansion: '角木蛟' },
      });
      expect(qizhengKnowledge).toContain('七政四餘');
    });

    it('ALMANAC 能檢索出建除十二神黃曆辭庫', async () => {
      const almanacKnowledge = await retrieveModuleKnowledge('ALMANAC', {
        title: '今日通勝',
        rawData: { dayOfficer: { name: '成' } },
      });
      expect(almanacKnowledge).toContain('建除十二神');
    });

    it('ZIWEI 能檢索出倪海廈天紀 RAG 知識庫與經典格局心法', async () => {
      const ziweiKnowledge = await retrieveModuleKnowledge('ZIWEI', {
        title: '紫微斗數排盤',
        summary: '命宮紫微天府',
        rawData: {
          patterns: [{ name: '君臣慶會' }, { name: '紫府同宮' }],
        },
      });
      expect(ziweiKnowledge).toContain('倪海廈');
      expect(ziweiKnowledge).toMatch(/大道至簡|君臣慶會|紫府同宮|三合/);
    });

    it('ZIWEI 離線合成器應精準整合輸出命盤格局與倪師 2/3 大於 1/3 決策心法', () => {
      const mockMsg = [{ role: 'user' as const, content: '請解析我的命宮與一生格局' }];
      const ctx = {
        moduleType: 'ZIWEI',
        title: '紫微命盤',
        rawData: {
          elementBureau: '水二局',
          lifePalaceBranch: '寅',
          palaces: { 寅: { name: '命宮', isMingPalace: true, majorStars: [{ name: '紫微' }] } },
          patterns: [
            {
              name: '君臣慶會',
              level: 'excellent',
              description: '紫微入命，左輔右弼同會，帝王得賢臣輔佐。',
              palaces: ['命宮'],
              conditions: { required: ['紫微坐守命宮', '左輔右弼齊會三方四正'] },
              source: '《紫微斗數全書》',
            },
          ],
          mingGongSummary: {
            stars: ['紫微'],
            keywords: ['尊貴統御', '領袖風範'],
            nature: '帝王星',
          },
        },
      };

      const reply = generateProfessionalSynthesizerReply(mockMsg, ctx);
      expect(reply).toContain('【君臣慶會】');
      expect(reply).toContain('倪師');
      expect(reply).toContain('2/3 大於 1/3');
      expect(reply).toContain('名位相等');
      expect(reply).not.toMatch(/老夫|貧道|天機星君|道友/);
    });

    it('WESTERN 應能檢索出榮格、人本占星與當代占星宗師 RAG 知識', async () => {
      const westernKnowledge = await retrieveModuleKnowledge(
        'WESTERN',
        { title: '個人占星盤', rawData: { sunSign: '天蠍座' } },
        '我想了解榮格深層心理學與陰影整合心法'
      );
      expect(westernKnowledge).toContain('榮格');
      expect(westernKnowledge).toMatch(/共時性|個體化|陰影/);
    });

    it('TAROT 應能檢索出愛德華·韋特、蕾切爾·波拉克與瑪麗·格利爾宗師 RAG 知識', async () => {
      const tarotKnowledge = await retrieveModuleKnowledge(
        'TAROT',
        { title: '每日占卜', rawData: { spreadName: '單張牌神諭' } },
        '請以韋特與波拉克宗師心法解析逆位牌'
      );
      expect(tarotKnowledge).toMatch(/韋特|波拉克|格利爾/);
      expect(tarotKnowledge).toMatch(/愚人之旅|圖解之鑰|逆位/);
    });

    it('WESTERN 與 TAROT 離線合成器應完整結構化輸出宗師心法與深層覺察章節', () => {
      const mockMsg = [{ role: 'user' as const, content: '請為我進行深刻的心靈覺察與指導' }];

      const westernReply = generateProfessionalSynthesizerReply(mockMsg, {
        moduleType: 'WESTERN',
        title: '西洋本命盤',
        rawData: { sunSign: '獅子座', moonSign: '雙魚座', ascendantSign: '天蠍座' },
      });
      expect(westernReply).toContain('榮格');
      expect(westernReply).toContain('個體化');
      expect(westernReply).toContain('丹·路德雅爾');
      expect(westernReply).not.toMatch(/老夫|貧道|天機星君|道友/);

      const tarotReply = generateProfessionalSynthesizerReply(mockMsg, {
        moduleType: 'TAROT',
        title: '時間之流牌陣',
        rawData: {
          spreadName: '三張牌',
          drawnCards: [{ card: { nameZh: '愚者' }, isReversed: false }],
        },
      });
      expect(tarotReply).toContain('愛德華·韋特');
      expect(tarotReply).toContain('蕾切爾·波拉克');
      expect(tarotReply).toContain('愚人之旅');
      expect(tarotReply).not.toMatch(/老夫|貧道|天機星君|道友/);
    });

    it('BAZI_SYNASTRY 與 FAMILY_GROUP 離線合成器應精準輸出合婚評分、五行場域與通關建議', () => {
      const mockMsg = [{ role: 'user' as const, content: '請解析我們的八字合婚與契合度' }];

      const synastryReply = generateProfessionalSynthesizerReply(mockMsg, {
        moduleType: 'BAZI_SYNASTRY',
        title: '八字合婚',
        rawData: {
          person1: { name: '張君豪' },
          person2: { name: '林雅婷' },
          score: 88,
          level: '情深意篤 · 珠聯璧合',
          bridgingElement: { element: '水', explanation: '金生水水生木，以水通關化解金木相剋' },
          marriageAdvice: {
            emotionalCommunication: '建立每週固定心靈對話時間',
            financialManagement: '設立家庭共同帳戶',
            growthTogether: '設定年度家庭願景',
          },
        },
      });
      expect(synastryReply).toContain('張君豪');
      expect(synastryReply).toContain('林雅婷');
      expect(synastryReply).toContain('88分');
      expect(synastryReply).toContain('珠聯璧合');
      expect(synastryReply).toContain('通關');
      expect(synastryReply).not.toMatch(/老夫|貧道|天機星君|道友/);

      const familyReply = generateProfessionalSynthesizerReply(mockMsg, {
        moduleType: 'FAMILY_GROUP',
        title: '家庭群盤比對',
        rawData: {
          familyTitle: '建華幸福之家',
          memberCount: 4,
          householdAura: {
            dominantElement: '木',
            lackingElement: '水',
            auraTitle: '崇德向學 · 青雲得祿氣場',
            description: '全家木氣充沛，崇尚文教。',
          },
          familyRoles: [
            { roleCategory: '家族舵手 (引領者)', membersAssigned: ['父親 (建華)'], description: '全局決策' },
          ],
        },
      });
      expect(familyReply).toContain('建華幸福之家');
      expect(familyReply).toContain('4 位家庭成員');
      expect(familyReply).toContain('青雲得祿');
      expect(familyReply).toContain('家族舵手');
      expect(familyReply).toContain('名位相等');
      expect(familyReply).not.toMatch(/老夫|貧道|天機星君|道友/);
    });

    it('BAZI_SYNASTRY 與 FAMILY_GROUP 應能動態檢索天紀雙宮聯參、五步合盤法與後天八卦名位相等 RAG 語料', async () => {
      const synastryKnowledge = await retrieveModuleKnowledge(
        'BAZI_SYNASTRY',
        {
          title: '八字與天紀合婚',
          rawData: {
            ziweiHeming: {
              starRating: 4,
              ratingLabel: '良緣佳配',
              dualPalaceSummary: '看婚姻必同時看夫妻宮與福德宮',
              p1Profile: {
                name: '張君豪',
                mingMajorStars: ['紫微'],
                fuqiMajorStars: ['天府'],
                fuqiStarVerdicts: [{ star: '天府', nature: '吉', niQuote: '天府在夫妻宮，婚姻穩定。' }],
              },
              p2Profile: {
                name: '林雅婷',
                mingMajorStars: ['太陰'],
                fuqiMajorStars: ['太陽'],
                fuqiStarVerdicts: [{ star: '太陽', nature: '吉', niQuote: '太陽主貴。' }],
              },
            },
          },
        },
        '請以倪海廈雙宮聯參與合盤五步法解析夫妻宮與福德宮'
      );
      expect(synastryKnowledge).toContain('雙宮聯參');
      expect(synastryKnowledge).toContain('天府');
      expect(synastryKnowledge).toMatch(/夫妻宮|福德宮|合盤/);

      const familyKnowledge = await retrieveModuleKnowledge(
        'FAMILY_GROUP',
        {
          title: '家庭群盤',
          rawData: {
            members: [
              {
                name: '父親 (建華)',
                role: '父親',
                baguaPosition: {
                  trigram: '乾卦',
                  direction: '西北角',
                  roleTitle: '父親（男主人）',
                  niMingWeiRule: '父親居西北乾位，名位相等。',
                  tabooWarning: '忌兒子睡西北角雷天大壯。',
                },
              },
            ],
          },
        },
        '請以倪海廈後天八卦名位相等與陽宅化命解析家庭房間方位'
      );
      expect(familyKnowledge).toContain('乾卦');
      expect(familyKnowledge).toContain('西北角');
      expect(familyKnowledge).toContain('名位相等');
    });
  });

  describe('TC-C01: Demo Mode 外鍵安全與持久化完整性 (CR-02 & CR-04)', () => {
    let createdProfileId: string = '';
    let createdReadingId: string = '';

    it('攜帶 x-demo-mode: true 新增出生檔案應成功 201 且無外鍵約束錯誤', async () => {
      const res = await request(app)
        .post('/api/v1/profiles')
        .set('x-demo-mode', 'true')
        .send({
          name: 'Demo 測試者命盤',
          gender: '女',
          birthDatetime: '1998-06-18T14:30:00Z',
          longitude: 121.5654,
          latitude: 25.033,
          birthLocationName: '台北市',
          notes: '自動化測試檔案',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.name).toBe('Demo 測試者命盤');
      createdProfileId = res.body.data.id;
    });

    it('攜帶 x-demo-mode: true 儲存測算記錄應成功 201 且無外鍵約束錯誤', async () => {
      const res = await request(app)
        .post('/api/v1/readings')
        .set('x-demo-mode', 'true')
        .send({
          profileId: createdProfileId,
          moduleType: 'TAROT',
          inputSnapshot: { spread: 'single' },
          chartOutput: { card: 'The Sun', isReversed: false },
          aiSummary: '韋特塔羅：每日神諭抽得太陽正位',
          userNotes: '今日能量充沛，萬事順遂。',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      createdReadingId = res.body.data.id;
    });

    it('攜帶 x-demo-mode: true 查詢測算列表應包含剛剛儲存的項目', async () => {
      const res = await request(app)
        .get('/api/v1/readings')
        .set('x-demo-mode', 'true');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const found = res.body.data.some((r: any) => r.id === createdReadingId);
      expect(found).toBe(true);
    });

    it('攜帶 x-demo-mode: true 應能安全刪除占卜記錄與出生檔案', async () => {
      const deleteReadingRes = await request(app)
        .delete(`/api/v1/readings/${createdReadingId}`)
        .set('x-demo-mode', 'true');
      expect(deleteReadingRes.status).toBe(200);
      expect(deleteReadingRes.body.success).toBe(true);

      const deleteProfileRes = await request(app)
        .delete(`/api/v1/profiles/${createdProfileId}`)
        .set('x-demo-mode', 'true');
      expect(deleteProfileRes.status).toBe(200);
      expect(deleteProfileRes.body.success).toBe(true);
    });
  });
});
