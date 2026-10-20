import { BaziChart, FiveElement, FiveElementsBreakdown, Pillar, TenGod } from './types.js';
import { Solar, Lunar } from 'lunar-typescript';

// 天干五行與陰陽 (true: 陽, false: 陰)
const STEM_INFO: Record<string, { element: FiveElement; yang: boolean }> = {
  甲: { element: '木', yang: true },
  乙: { element: '木', yang: false },
  丙: { element: '火', yang: true },
  丁: { element: '火', yang: false },
  戊: { element: '土', yang: true },
  己: { element: '土', yang: false },
  庚: { element: '金', yang: true },
  辛: { element: '金', yang: false },
  壬: { element: '水', yang: true },
  癸: { element: '水', yang: false },
};

// 地支五行
const BRANCH_ELEMENT: Record<string, FiveElement> = {
  子: '水',
  丑: '土',
  寅: '木',
  卯: '木',
  辰: '土',
  巳: '火',
  午: '火',
  未: '土',
  申: '金',
  酉: '金',
  戌: '土',
  亥: '水',
};

// 地支藏干與權重 (本氣、中氣、餘氣)
const HIDDEN_STEMS: Record<string, { stem: string; weight: number }[]> = {
  子: [{ stem: '癸', weight: 1.0 }],
  丑: [{ stem: '己', weight: 0.6 }, { stem: '癸', weight: 0.2 }, { stem: '辛', weight: 0.2 }],
  寅: [{ stem: '甲', weight: 0.6 }, { stem: '丙', weight: 0.2 }, { stem: '戊', weight: 0.2 }],
  卯: [{ stem: '乙', weight: 1.0 }],
  辰: [{ stem: '戊', weight: 0.6 }, { stem: '乙', weight: 0.2 }, { stem: '癸', weight: 0.2 }],
  巳: [{ stem: '丙', weight: 0.6 }, { stem: '庚', weight: 0.2 }, { stem: '戊', weight: 0.2 }],
  午: [{ stem: '丁', weight: 0.7 }, { stem: '己', weight: 0.3 }],
  未: [{ stem: '己', weight: 0.6 }, { stem: '丁', weight: 0.2 }, { stem: '乙', weight: 0.2 }],
  申: [{ stem: '庚', weight: 0.6 }, { stem: '壬', weight: 0.2 }, { stem: '戊', weight: 0.2 }],
  酉: [{ stem: '辛', weight: 1.0 }],
  戌: [{ stem: '戊', weight: 0.6 }, { stem: '辛', weight: 0.2 }, { stem: '丁', weight: 0.2 }],
  亥: [{ stem: '壬', weight: 0.7 }, { stem: '甲', weight: 0.3 }],
};

// 五行生剋關係: element -> { generates: Element, generatedBy: Element, conquers: Element, conqueredBy: Element }
const RELATION: Record<FiveElement, { generates: FiveElement; generatedBy: FiveElement; conquers: FiveElement; conqueredBy: FiveElement }> = {
  木: { generates: '火', generatedBy: '水', conquers: '土', conqueredBy: '金' },
  火: { generates: '土', generatedBy: '木', conquers: '金', conqueredBy: '水' },
  土: { generates: '金', generatedBy: '火', conquers: '水', conqueredBy: '木' },
  金: { generates: '水', generatedBy: '土', conquers: '木', conqueredBy: '火' },
  水: { generates: '木', generatedBy: '金', conquers: '火', conqueredBy: '土' },
};

/**
 * 依據日干與目標天干判定十神
 */
export function getTenGod(dayMasterStem: string, targetStem: string): TenGod {
  const dm = STEM_INFO[dayMasterStem];
  const target = STEM_INFO[targetStem];
  const samePolarity = dm.yang === target.yang;

  if (target.element === dm.element) {
    return samePolarity ? '比肩' : '劫財';
  } else if (target.element === RELATION[dm.element].generates) {
    return samePolarity ? '食神' : '傷官';
  } else if (target.element === RELATION[dm.element].conquers) {
    return samePolarity ? '偏財' : '正財';
  } else if (target.element === RELATION[dm.element].conqueredBy) {
    return samePolarity ? '七殺' : '正官';
  } else {
    // target generates dm (印星)
    return samePolarity ? '偏印' : '正印';
  }
}

/**
 * 核心四柱八字排盤計算
 */
export function calculateBaziChart(birthDate: Date, gender: '男' | '女'): BaziChart {
  const solar = Solar.fromDate(birthDate);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  const yearGanZhi = eightChar.getYear();
  const monthGanZhi = eightChar.getMonth();
  const dayGanZhi = eightChar.getDay();
  const timeGanZhi = eightChar.getTime();

  const dayStem = dayGanZhi[0];
  const dayBranch = dayGanZhi[1];
  const dayMasterElement = STEM_INFO[dayStem].element;

  // 建構柱物件輔助函數
  const buildPillar = (name: '年柱' | '月柱' | '日柱' | '時柱', ganzhi: string, naYin: string): Pillar => {
    const stem = ganzhi[0];
    const branch = ganzhi[1];
    const stemElement = STEM_INFO[stem].element;
    const branchElement = BRANCH_ELEMENT[branch];
    const stemTenGod = name === '日柱' ? '日主' : getTenGod(dayStem, stem);

    const hidden = (HIDDEN_STEMS[branch] || []).map((item) => ({
      stem: item.stem,
      element: STEM_INFO[item.stem].element,
      tenGod: getTenGod(dayStem, item.stem),
      weight: item.weight,
    }));

    return {
      name,
      stem,
      stemElement,
      stemTenGod,
      branch,
      branchElement,
      hiddenStems: hidden,
      naYin,
    };
  };

  const yearPillar = buildPillar('年柱', yearGanZhi, eightChar.getYearNaYin());
  const monthPillar = buildPillar('月柱', monthGanZhi, eightChar.getMonthNaYin());
  const dayPillar = buildPillar('日柱', dayGanZhi, eightChar.getDayNaYin());
  const hourPillar = buildPillar('時柱', timeGanZhi, eightChar.getTimeNaYin());

  // 五行能量評分計算 (天干各 10 分，地支按藏干權重加權)
  const scores: Record<FiveElement, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  const allPillars = [yearPillar, monthPillar, dayPillar, hourPillar];

  allPillars.forEach((p, idx) => {
    // 天干能量
    scores[p.stemElement] += 10;
    // 地支能量
    const branchWeight = idx === 1 ? 25 : 15; // 月令得令權重大
    p.hiddenStems.forEach((h) => {
      scores[h.element] += Math.round(branchWeight * h.weight);
    });
  });

  const totalScore = scores.木 + scores.火 + scores.土 + scores.金 + scores.水 || 1;
  const percentages: FiveElementsBreakdown = {
    wood: Math.round((scores.木 / totalScore) * 100),
    fire: Math.round((scores.火 / totalScore) * 100),
    earth: Math.round((scores.土 / totalScore) * 100),
    metal: Math.round((scores.金 / totalScore) * 100),
    water: Math.round((scores.水 / totalScore) * 100),
  };

  // 日主強弱判定 (自黨: 同我者比劫 + 生我者印星; 異黨: 食傷 + 財星 + 官殺)
  const selfElements = [dayMasterElement, RELATION[dayMasterElement].generatedBy];
  const selfScore = selfElements.reduce((acc, el) => acc + scores[el], 0);
  const selfRatio = selfScore / totalScore;

  let status: '身強' | '身弱' | '專旺' | '從格' = '身強';
  let description = '';
  if (selfRatio >= 0.8) {
    status = '專旺';
    description = '日主能量極度旺盛，成專旺特殊格局。';
  } else if (selfRatio >= 0.5) {
    status = '身強';
    description = '日元得令得助，根基深厚，具備承載財官之氣度。';
  } else if (selfRatio >= 0.2) {
    status = '身弱';
    description = '日元洩耗較多，宜以印星比劫生扶調候，方顯貴氣。';
  } else {
    status = '從格';
    description = '日元極弱無依，隨大勢成從格，順勢而為大吉。';
  }

  // 喜用神推導
  let useful: FiveElement[] = [];
  let harmful: FiveElement[] = [];
  let neutral: FiveElement[] = [];

  if (status === '身強' || status === '專旺') {
    useful = [RELATION[dayMasterElement].conquers, RELATION[dayMasterElement].conqueredBy, RELATION[dayMasterElement].generates];
    harmful = [dayMasterElement, RELATION[dayMasterElement].generatedBy];
  } else {
    useful = [dayMasterElement, RELATION[dayMasterElement].generatedBy];
    harmful = [RELATION[dayMasterElement].conquers, RELATION[dayMasterElement].conqueredBy];
    neutral = [RELATION[dayMasterElement].generates];
  }

  // 大運排盤 (取 10 個大運，過濾起運前童限空干支)
  const yun = eightChar.getYun(gender === '男' ? 1 : 0);
  const daYunList = yun.getDaYun();
  const luckPillars = daYunList
    .filter((dy) => dy.getGanZhi() && dy.getGanZhi().length >= 2)
    .slice(0, 8)
    .map((dy) => {
      const stem = dy.getGanZhi()[0];
      const branch = dy.getGanZhi()[1];
      return {
        startAge: dy.getStartAge(),
        endAge: dy.getEndAge(),
        stem,
        branch,
        tenGod: getTenGod(dayStem, stem),
      };
    });

  return {
    birthInfo: {
      solarDate: birthDate.toISOString(),
      gender,
    },
    pillars: {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar,
    },
    dayMaster: {
      stem: dayStem,
      element: dayMasterElement,
    },
    energy: {
      score: Math.round(selfRatio * 100),
      status,
      description,
    },
    fiveElements: percentages,
    favorableElements: {
      useful,
      harmful,
      neutral,
    },
    luckPillars,
  };
}
