import { Router, Request, Response } from 'express';
import {
  calculateTrueSolarTime,
  calculateZiweiChart,
  calculateBaziChart,
  calculateBaziSynastry,
  calculateFamilyGroup,
  castCoinDivination,
  castPlumBlossom,
  analyzeName,
  recommendNames,
  calculateWesternNatalChart,
  drawTarotSpread,
  calculateQizhengChart,
  calculateAnnualDestinyCalendar,
  evaluateHabitResonance,
  FiveElement,
} from '@celestial/astro-core';
import { prisma } from '@celestial/database';

export const calculatorRouter = Router();

// 1. 紫微斗數排盤
calculatorRouter.post('/ziwei', async (req: Request, res: Response) => {
  try {
    const { birthDate, gender = '男', longitude = 120, targetDate, targetYear } = req.body;
    if (!birthDate) {
      return res.status(400).json({ success: false, message: '請提供出生時間 (birthDate)' });
    }

    const standardTime = new Date(birthDate);
    const solarInfo = calculateTrueSolarTime(standardTime, Number(longitude));
    const target = targetYear ? Number(targetYear) : targetDate ? new Date(targetDate) : undefined;
    const chart = calculateZiweiChart(solarInfo.trueSolarTime, gender as '男' | '女', target);

    // 關聯後台自訂命理辭庫解讀
    const starInterps = await prisma.systemInterpretation.findMany({
      where: { moduleType: 'ZIWEI' },
    });

    return res.json({
      success: true,
      data: {
        solarInfo,
        chart,
        interpretations: starInterps,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '紫微排盤運算失敗' });
  }
});

// 2. 四柱八字排盤
calculatorRouter.post('/bazi', async (req: Request, res: Response) => {
  try {
    const { birthDate, gender = '男', longitude = 120 } = req.body;
    if (!birthDate) {
      return res.status(400).json({ success: false, message: '請提供出生時間 (birthDate)' });
    }

    const standardTime = new Date(birthDate);
    const solarInfo = calculateTrueSolarTime(standardTime, Number(longitude));
    const chart = calculateBaziChart(solarInfo.trueSolarTime, gender as '男' | '女');

    const baziInterps = await prisma.systemInterpretation.findMany({
      where: { moduleType: 'BAZI' },
    });

    return res.json({
      success: true,
      data: {
        solarInfo,
        chart,
        interpretations: baziInterps,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '八字排盤運算失敗' });
  }
});

// 2.1 八字合婚 (二造八字契合度深度比對)
calculatorRouter.post('/bazi/synastry', async (req: Request, res: Response) => {
  try {
    const { person1, person2 } = req.body;
    if (!person1?.birthDate || !person2?.birthDate) {
      return res.status(400).json({ success: false, message: '請提供雙方出生時間與姓名 (person1 & person2)' });
    }

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

    const interps = await prisma.systemInterpretation.findMany({
      where: {
        OR: [{ moduleType: 'BAZI_SYNASTRY' }, { moduleType: 'BAZI' }],
      },
      take: 20,
    });

    return res.json({
      success: true,
      data: {
        ...synastry,
        interpretations: interps,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '八字合婚演算失敗' });
  }
});

// 2.2 家人群組八字多維比對解析 (Household Multi-member Cross Matrix)
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

    const result = calculateFamilyGroup(sanitizedMembers, familyTitle);

    return res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '家人群組比對演算失敗' });
  }
});

// 3. 周易卜卦
calculatorRouter.post('/iching/cast', async (req: Request, res: Response) => {
  try {
    const { mode = 'coin', customYaoList, num1, num2, num3 } = req.body;

    let result;
    if (mode === 'plum_blossom' && num1 && num2 && num3) {
      result = castPlumBlossom(Number(num1), Number(num2), Number(num3));
    } else {
      result = castCoinDivination(customYaoList);
    }

    return res.json({
      success: true,
      data: result,
    });
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

    const analysis = analyzeName(surname.trim(), givenName.trim());
    return res.json({
      success: true,
      data: analysis,
    });
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

    const list = recommendNames(surname.trim(), usefulElements as FiveElement[], gender as '男' | '女');
    return res.json({
      success: true,
      data: list,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '起名推薦生成失敗' });
  }
});

// 6. 西洋星盤與月相
calculatorRouter.post('/western/natal', async (req: Request, res: Response) => {
  try {
    const { birthDate, latitude = 25.033, longitude = 121.5654 } = req.body;
    if (!birthDate) {
      return res.status(400).json({ success: false, message: '請提供出生時間 (birthDate)' });
    }

    const chart = calculateWesternNatalChart(new Date(birthDate), Number(latitude), Number(longitude));
    return res.json({
      success: true,
      data: chart,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '西洋星盤運算失敗' });
  }
});

// 7. 塔羅牌抽取與牌陣
calculatorRouter.post('/tarot/draw', async (req: Request, res: Response) => {
  try {
    const { spreadType = 'three_cards', customDrawnCardIds } = req.body;
    const reading = drawTarotSpread(spreadType, customDrawnCardIds);

    return res.json({
      success: true,
      data: reading,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '塔羅占卜演算失敗' });
  }
});

// 8. 七政四餘天星排盤
calculatorRouter.post('/qizheng', async (req: Request, res: Response) => {
  try {
    const { birthDate, longitude = 120.0, latitude = 25.0 } = req.body;
    if (!birthDate) {
      return res.status(400).json({ success: false, message: '請提供出生時間 (birthDate)' });
    }

    const chart = calculateQizhengChart(new Date(birthDate), Number(longitude), Number(latitude));
    return res.json({
      success: true,
      data: chart,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '七政四餘天星演算失敗' });
  }
});

// 9. 推算流年曆 (Annual Destiny Calendar)
calculatorRouter.post('/annual-calendar', async (req: Request, res: Response) => {
  try {
    const { birthDate, gender = '男', targetYear, longitude = 120.0 } = req.body;
    if (!birthDate) {
      return res.status(400).json({ success: false, message: '請提供出生時間 (birthDate)' });
    }

    const calendar = calculateAnnualDestinyCalendar(
      new Date(birthDate),
      gender as '男' | '女',
      targetYear ? Number(targetYear) : undefined,
      Number(longitude)
    );

    return res.json({
      success: true,
      data: calendar,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '流年曆演算失敗' });
  }
});

// 10. 流年生活起居與命盤諧振規劃診斷 (Annual Life Planner Diagnostic)
calculatorRouter.post('/annual-planner/analyze', async (req: Request, res: Response) => {
  try {
    const { birthDate, gender = '男', targetYear, longitude = 120.0, habits = [] } = req.body;
    if (!birthDate) {
      return res.status(400).json({ success: false, message: '請提供出生時間 (birthDate)' });
    }

    const calendar = calculateAnnualDestinyCalendar(
      new Date(birthDate),
      gender as '男' | '女',
      targetYear ? Number(targetYear) : undefined,
      Number(longitude)
    );

    const evaluation = evaluateHabitResonance(calendar, habits);

    return res.json({
      success: true,
      data: {
        calendar,
        evaluation,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '起居規劃診斷失敗' });
  }
});

