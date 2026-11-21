import { Router, Request, Response } from 'express';
import {
  castCoinDivination,
  castPlumBlossom,
  analyzeName,
  recommendNames,
  drawTarotSpread,
  FiveElement,
  drawBunchoLot,
  drawTempleLot,
  castBwaBwei,
  getTemplePoemLotById,
  formatTemplePoemAspectReport,
  searchDreamDictionary,
  getAllDreamCategories,
  interpretDreamScenario,
} from '@celestial/astro-core';
import { birthChartBaseSchema, baziSynastrySchema } from '@celestial/shared';
import { validateRequest } from '../../middleware/validate.js';
import { findInterpretationsByModules } from './repository.js';
import {
  computeZiweiService,
  computeBaziService,
  computeWesternService,
  computeQizhengService,
  getCachedBunchoLotsService,
  getCachedTempleLotsService,
  computeHolographicSynthesisService,
  selectAuspiciousDatesService,
  calculateBaziSynastry,
  calculateFamilyGroup,
  calculateAnnualDestinyCalendar,
  evaluateHabitResonance,
} from './service.js';

export const calculatorRouter = Router();

// 1. 紫微斗數排盤
calculatorRouter.post('/ziwei', validateRequest({ body: birthChartBaseSchema }), async (req: Request, res: Response) => {
  try {
    const { birthDate, gender, longitude, targetDate, targetYear } = req.body;
    const data = await computeZiweiService({
      birthDate,
      gender: gender === '女' ? '女' : '男',
      longitude: Number(longitude ?? 120),
      targetDate,
      targetYear,
    });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '紫微排盤運算失敗' });
  }
});

// 2. 四柱八字排盤
calculatorRouter.post('/bazi', validateRequest({ body: birthChartBaseSchema }), async (req: Request, res: Response) => {
  try {
    const { birthDate, gender, longitude } = req.body;
    const data = await computeBaziService({
      birthDate,
      gender: gender === '女' ? '女' : '男',
      longitude: Number(longitude ?? 120),
    });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '八字排盤運算失敗' });
  }
});

// 2.1 八字合婚
calculatorRouter.post('/bazi/synastry', validateRequest({ body: baziSynastrySchema }), async (req: Request, res: Response) => {
  try {
    const { person1, person2 } = req.body;
    const synastry = calculateBaziSynastry(
      {
        name: person1.name || '男方 (乾造)',
        gender: (person1.gender || '男') as '男' | '女',
        birthDate: new Date(person1.birthDate),
        role: person1.role || '乾造',
      },
      {
        name: person2.name || '女方 (坤造)',
        gender: (person2.gender || '女') as '男' | '女',
        birthDate: new Date(person2.birthDate),
        role: person2.role || '坤造',
      }
    );
    const interpretations = await findInterpretationsByModules(['BAZI_SYNASTRY', 'BAZI'], 20);
    return res.json({ success: true, data: { ...synastry, interpretations } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '八字合婚演算失敗' });
  }
});

// 2.2 家人群組八字多維比對解析
calculatorRouter.post('/bazi/family-group', async (req: Request, res: Response) => {
  try {
    const { members, familyTitle = '幸福同舟之家' } = req.body;
    if (!Array.isArray(members) || members.length < 2) {
      return res.status(400).json({ success: false, message: '家人群組比對至少需提供 2 位成員之出生資料' });
    }
    const sanitizedMembers = members.map((m: any, idx: number) => ({
      name: m.name || `成員 ${idx + 1}`,
      role: m.role || '家庭成員',
      gender: (m.gender || '男') as '男' | '女',
      birthDate: new Date(m.birthDate),
    }));
    return res.json({ success: true, data: calculateFamilyGroup(sanitizedMembers, familyTitle) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '家人群組比對演算失敗' });
  }
});

// 2.3 [P2-PROD-01] 一鍵全息命格合參中樞
calculatorRouter.post('/holographic', validateRequest({ body: birthChartBaseSchema }), async (req: Request, res: Response) => {
  try {
    const { birthDate, gender, longitude, latitude } = req.body;
    const data = await computeHolographicSynthesisService({
      birthDate,
      gender: gender === '女' ? '女' : '男',
      longitude: Number(longitude ?? 120),
      latitude: Number(latitude ?? 25),
      name: typeof req.body.name === 'string' ? req.body.name : undefined,
    });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '全息命格合參失敗' });
  }
});

// 2.4 [P2-PROD-05] 智能擇日助手
calculatorRouter.post('/almanac/auspicious-dates', async (req: Request, res: Response) => {
  try {
    const { eventType = '簽約', zodiac, days = 30, startDate } = req.body;
    const data = selectAuspiciousDatesService({ eventType: String(eventType), zodiac, days, startDate });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '智能擇日演算失敗' });
  }
});

// 3. 周易卜卦
calculatorRouter.post('/iching/cast', async (req: Request, res: Response) => {
  try {
    const { mode = 'coin', customYaoList, num1, num2, num3 } = req.body;
    const result = mode === 'plum_blossom' && num1 && num2 && num3
      ? castPlumBlossom(Number(num1), Number(num2), Number(num3))
      : castCoinDivination(customYaoList);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '起卦演算失敗' });
  }
});

// 4. 姓名學五格與三才剖析
calculatorRouter.post('/naming/analyze', async (req: Request, res: Response) => {
  try {
    const { surname, givenName } = req.body;
    if (!surname || !givenName) {
      return res.status(400).json({ success: false, message: '請提供姓氏與名字' });
    }
    return res.json({ success: true, data: analyzeName(String(surname).trim(), String(givenName).trim()) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '姓名學剖析失敗' });
  }
});

// 5. 八字喜用神智慧起名推薦
calculatorRouter.post('/naming/generate', async (req: Request, res: Response) => {
  try {
    const { surname, usefulElements = ['木', '水'], gender = '男' } = req.body;
    if (!surname) {
      return res.status(400).json({ success: false, message: '請提供姓氏' });
    }
    return res.json({ success: true, data: recommendNames(String(surname).trim(), usefulElements as FiveElement[], gender as '男' | '女') });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '起名推薦生成失敗' });
  }
});

// 6. 西洋星盤與月相
calculatorRouter.post('/western/natal', validateRequest({ body: birthChartBaseSchema }), async (req: Request, res: Response) => {
  try {
    const { birthDate, latitude, longitude } = req.body;
    const chart = await computeWesternService({
      birthDate,
      latitude: Number(latitude ?? 25.033),
      longitude: Number(longitude ?? 121.5654),
    });
    return res.json({ success: true, data: chart });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '西洋星盤運算失敗' });
  }
});

// 7. 塔羅牌抽取與牌陣
calculatorRouter.post('/tarot/draw', async (req: Request, res: Response) => {
  try {
    const { spreadType = 'three_cards', customDrawnCardIds } = req.body;
    return res.json({ success: true, data: drawTarotSpread(spreadType, customDrawnCardIds) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '塔羅占卜演算失敗' });
  }
});

// 8. 七政四餘天星排盤
calculatorRouter.post('/qizheng', validateRequest({ body: birthChartBaseSchema }), async (req: Request, res: Response) => {
  try {
    const { birthDate, longitude, latitude } = req.body;
    const chart = await computeQizhengService({
      birthDate,
      longitude: Number(longitude ?? 120.0),
      latitude: Number(latitude ?? 25.0),
    });
    return res.json({ success: true, data: chart });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '七政四餘天星演算失敗' });
  }
});

// 9. 推算流年曆
calculatorRouter.post('/annual-calendar', validateRequest({ body: birthChartBaseSchema }), async (req: Request, res: Response) => {
  try {
    const { birthDate, gender, targetYear, longitude } = req.body;
    const calendar = calculateAnnualDestinyCalendar(
      new Date(birthDate),
      gender === '女' ? '女' : '男',
      targetYear ? Number(targetYear) : undefined,
      Number(longitude ?? 120.0)
    );
    return res.json({ success: true, data: calendar });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '流年曆演算失敗' });
  }
});

// 10. 流年生活起居與命盤諧振規劃診斷
calculatorRouter.post('/annual-planner/analyze', validateRequest({ body: birthChartBaseSchema }), async (req: Request, res: Response) => {
  try {
    const { birthDate, gender, targetYear, longitude } = req.body;
    const habits = Array.isArray(req.body.habits) ? req.body.habits : [];
    const calendar = calculateAnnualDestinyCalendar(
      new Date(birthDate),
      gender === '女' ? '女' : '男',
      targetYear ? Number(targetYear) : undefined,
      Number(longitude ?? 120.0)
    );
    const evaluation = evaluateHabitResonance(calendar, habits);
    return res.json({ success: true, data: { calendar, evaluation } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '起居規劃診斷失敗' });
  }
});

// 11. 文鳥抽籤模組
calculatorRouter.post('/buncho/draw', async (req: Request, res: Response) => {
  try {
    const { question, aspect, customLotId } = req.body;
    return res.json({
      success: true,
      data: drawBunchoLot({ question, aspect, customLotId: customLotId ? Number(customLotId) : undefined }),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '文鳥抽籤失敗' });
  }
});

calculatorRouter.get('/buncho/lots', async (_req: Request, res: Response) => {
  try {
    return res.json({ success: true, data: await getCachedBunchoLotsService() });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '讀取文鳥靈籤庫失敗' });
  }
});

// 12. 台灣廟宇六十甲子籤詩與解籤系統
calculatorRouter.post('/temple/draw', async (req: Request, res: Response) => {
  try {
    const { customLotId, seekerName, inquiryAspect, question } = req.body;
    const lot = drawTempleLot({
      customLotId: customLotId ? Number(customLotId) : undefined,
      seekerName,
      inquiryAspect,
      question,
    });
    const aspectReport = formatTemplePoemAspectReport(lot, inquiryAspect || 'general');
    return res.json({
      success: true,
      data: {
        lot,
        aspectReport,
        seekerName: seekerName || '信士/信女',
        inquiryAspect: inquiryAspect || 'general',
        question: question || '所求吉凶指引',
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '廟宇抽籤失敗' });
  }
});

calculatorRouter.post('/temple/bwei', async (req: Request, res: Response) => {
  try {
    return res.json({ success: true, data: castBwaBwei(req.body.customType) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '擲筊請示失敗' });
  }
});

calculatorRouter.get('/temple/lots', async (_req: Request, res: Response) => {
  try {
    return res.json({ success: true, data: await getCachedTempleLotsService() });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '讀取廟宇籤詩庫失敗' });
  }
});

calculatorRouter.get('/temple/lot/:id', async (req: Request, res: Response) => {
  try {
    const lot = getTemplePoemLotById(Number(req.params.id));
    if (!lot) return res.status(404).json({ success: false, message: '查無此籤號' });
    return res.json({ success: true, data: lot });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '讀取籤詩失敗' });
  }
});

// 13. 周公解夢與潛意識意象分析
calculatorRouter.post('/dream/search', async (req: Request, res: Response) => {
  try {
    const { keyword = '', category } = req.body;
    return res.json({ success: true, data: searchDreamDictionary(String(keyword), category) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '周公解夢檢索失敗' });
  }
});

calculatorRouter.post('/dream/analyze', async (req: Request, res: Response) => {
  try {
    return res.json({ success: true, data: interpretDreamScenario(String(req.body.scenario || '')) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '夢境交織剖析失敗' });
  }
});

calculatorRouter.get('/dream/categories', async (_req: Request, res: Response) => {
  try {
    return res.json({ success: true, data: getAllDreamCategories() });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '取得解夢分類失敗' });
  }
});
