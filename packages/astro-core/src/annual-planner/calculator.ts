import { Solar } from 'lunar-typescript';
import {
  AnnualDestinyCalendar,
  MonthlyHorizon,
  HabitLogEntry,
  HabitResonanceEvaluation,
  HabitActionPlan,
} from './types.js';
import { BareSiHuaArray, EarthlyBranch, HeavenlyStem, PalaceCell } from '../ziwei/types.js';
import { FiveElement } from '../bazi/types.js';
import { calculateBaziChart, getTenGod } from '../bazi/calculator.js';
import { calculateZiweiChart, SI_HUA_MAP } from '../ziwei/calculator.js';

const STEMS: HeavenlyStem[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES: EarthlyBranch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 五行對應
const STEM_ELEMENTS: Record<HeavenlyStem, FiveElement> = {
  甲: '木', 乙: '木',
  丙: '火', 丁: '火',
  戊: '土', 己: '土',
  庚: '金', 辛: '金',
  壬: '水', 癸: '水',
};

const BRANCH_ZODIAC: Record<EarthlyBranch, string> = {
  子: '鼠', 丑: '牛', 寅: '虎', 卯: '兔',
  辰: '龍', 巳: '蛇', 午: '馬', 未: '羊',
  申: '猴', 酉: '雞', 戌: '狗', 亥: '豬',
};

// 五虎遁年起月表 (年干 -> 正月寅月天干起始索引)
const FIVE_TIGERS_START_STEM_INDEX: Record<HeavenlyStem, number> = {
  甲: 2, // 丙寅
  己: 2, // 丙寅
  乙: 4, // 戊寅
  庚: 4, // 戊寅
  丙: 6, // 庚寅
  辛: 6, // 庚寅
  丁: 8, // 壬寅
  壬: 8, // 壬寅
  戊: 0, // 甲寅
  癸: 0, // 甲寅
};

// 十二流月節氣區間與名稱
const MONTH_META: Array<{
  lunarMonth: number;
  monthName: string;
  branch: EarthlyBranch;
  solarMonthRange: string;
  season: 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER';
  seasonName: string;
}> = [
  { lunarMonth: 1, monthName: '正月 (端月)', branch: '寅', solarMonthRange: '2月4日 - 3月4日 (立春·雨水)', season: 'SPRING', seasonName: '初春' },
  { lunarMonth: 2, monthName: '二月 (花月)', branch: '卯', solarMonthRange: '3月5日 - 4月4日 (驚蟄·春分)', season: 'SPRING', seasonName: '仲春' },
  { lunarMonth: 3, monthName: '三月 (桐月)', branch: '辰', solarMonthRange: '4月5日 - 5月4日 (清明·穀雨)', season: 'SPRING', seasonName: '暮春' },
  { lunarMonth: 4, monthName: '四月 (梅月)', branch: '巳', solarMonthRange: '5月5日 - 6月4日 (立夏·小滿)', season: 'SUMMER', seasonName: '初夏' },
  { lunarMonth: 5, monthName: '五月 (蒲月)', branch: '午', solarMonthRange: '6月5日 - 7月6日 (芒種·夏至)', season: 'SUMMER', seasonName: '仲夏' },
  { lunarMonth: 6, monthName: '六月 (荔月)', branch: '未', solarMonthRange: '7月7日 - 8月6日 (小暑·大暑)', season: 'SUMMER', seasonName: '季夏' },
  { lunarMonth: 7, monthName: '七月 (巧月)', branch: '申', solarMonthRange: '8月7日 - 9月6日 (立秋·處暑)', season: 'AUTUMN', seasonName: '初秋' },
  { lunarMonth: 8, monthName: '八月 (桂月)', branch: '酉', solarMonthRange: '9月7日 - 10月7日 (白露·秋分)', season: 'AUTUMN', seasonName: '仲秋' },
  { lunarMonth: 9, monthName: '九月 (菊月)', branch: '戌', solarMonthRange: '10月8日 - 11月6日 (寒露·霜降)', season: 'AUTUMN', seasonName: '深秋' },
  { lunarMonth: 10, monthName: '十月 (陽月)', branch: '亥', solarMonthRange: '11月7日 - 12月6日 (立冬·小雪)', season: 'WINTER', seasonName: '初冬' },
  { lunarMonth: 11, monthName: '十一月 (葭月)', branch: '子', solarMonthRange: '12月7日 - 1月4日 (大雪·冬至)', season: 'WINTER', seasonName: '仲冬' },
  { lunarMonth: 12, monthName: '十二月 (臘月)', branch: '丑', solarMonthRange: '1月5日 - 2月3日 (小寒·大寒)', season: 'WINTER', seasonName: '季冬' },
];

/**
 * 推算年度流年命曆與十二流月行運
 */
export function calculateAnnualDestinyCalendar(
  birthDate: Date,
  gender: '男' | '女',
  targetYear?: number,
  _longitude: number = 120
): AnnualDestinyCalendar {
  const currentYear = targetYear || new Date().getFullYear();
  // 取得目標年農曆與干支
  const midYearSolar = Solar.fromYmd(currentYear, 6, 15);
  const midYearLunar = midYearSolar.getLunar();
  const yearGanZhi = midYearLunar.getYearInGanZhi();
  const yearStem = yearGanZhi[0] as HeavenlyStem;
  const yearBranch = yearGanZhi[1] as EarthlyBranch;
  const naYin = midYearLunar.getYearNaYin();
  const animal = BRANCH_ZODIAC[yearBranch] || '馬';
  const yearElement = STEM_ELEMENTS[yearStem];

  // 計算八字與日主
  const baziChart = calculateBaziChart(birthDate, gender);
  const dayMaster = baziChart.dayMaster.stem as HeavenlyStem;
  const dayMasterElement = baziChart.dayMaster.element;
  const yearTenGod = getTenGod(dayMaster, yearStem);
  const favorableElements = baziChart.favorableElements.useful;
  const unfavorableElements = baziChart.favorableElements.harmful;

  // 計算紫微斗數命盤與流年大盤
  const ziweiChart = calculateZiweiChart(birthDate, gender, currentYear);
  const horoscope = ziweiChart.horoscope;

  const yearlyPalaceBranch = horoscope?.yearly.branch || yearBranch;
  const yearlyPalaceName = horoscope?.yearly.palaceName || '命宮';
  const yearlySiHua = horoscope?.yearly.siHua || (SI_HUA_MAP[yearStem] as BareSiHuaArray);

  // 取得流年命宮主星
  const yearlyCell = ziweiChart.palaces[yearlyPalaceBranch] as PalaceCell | undefined;
  const yearlyMajorStars = yearlyCell ? yearlyCell.majorStars.map((s) => s.name) : [];

  const smallLimitPalaceBranch = horoscope?.smallLimit.branch || '寅';
  const smallLimitPalaceName = horoscope?.smallLimit.palaceName || '命宮';
  const smallLimitSiHua = horoscope?.smallLimit.siHua || (SI_HUA_MAP[yearStem] as BareSiHuaArray);

  // 年度總綱主題與指引
  const isFavorableYear = favorableElements.includes(yearElement);
  const annualTheme = `${yearGanZhi}${animal}年·${yearTenGod}臨門·${yearlyMajorStars.slice(0, 2).join('') || '本命'}主事`;
  const annualAdvice = isFavorableYear
    ? `流年歲君五行屬${yearElement}，恰逢命局喜用五行生旺，整體氣場諧和通達。宜順勢而為，把握${yearlySiHua[0]}化祿與${yearlySiHua[1]}化權之開創機運。`
    : `流年五行屬${yearElement}，為命局待調候之氣場。凡事宜守中道，調和身心起居，善用${yearlySiHua[2]}化科之智慧轉圜，避開${yearlySiHua[3]}化忌之鋒芒。`;

  const opportunityPoints = [
    `流年四化【${yearlySiHua[0]}化祿】入盤，利於求新蛻變與多元資源匯聚。`,
    `流年【${yearlySiHua[1]}化權】加持，主動出擊、確立主導權與團隊掌舵之勢明朗。`,
    `歲次對日主呈【${yearTenGod}】格局，契合心性發揮與才華轉化。`,
  ];

  const cautionPoints = [
    `流年【${yearlySiHua[3]}化忌】警示：需防範衝動簽約、疲勞過載與人際越位爭端。`,
    `四時交替之際，需留意五行【${yearElement}氣】偏盛對作息之損耗，保持陰陽平秘。`,
  ];

  // 十二流月行運推算 (五虎遁月)
  const startStemIdx = FIVE_TIGERS_START_STEM_INDEX[yearStem];
  const yearlyBranchIdx = BRANCHES.indexOf(yearlyPalaceBranch);

  const monthlyHorizons: MonthlyHorizon[] = MONTH_META.map((meta, i) => {
    const monthStem = STEMS[(startStemIdx + i) % 10];
    const monthBranch = meta.branch;
    const ganzhi = `${monthStem}${monthBranch}`;
    const monthElement = STEM_ELEMENTS[monthStem];
    const tenGod = getTenGod(dayMaster, monthStem);
    const siHua = SI_HUA_MAP[monthStem] as BareSiHuaArray;

    // 紫微流月命宮 (由流年命宮順數至流月)
    const monthlyPalaceBranchIdx = (yearlyBranchIdx + i) % 12;
    const monthlyPalaceBranch = BRANCHES[monthlyPalaceBranchIdx];
    const monthCell = ziweiChart.palaces[monthlyPalaceBranch] as PalaceCell | undefined;
    const ziweiPalaceName = monthCell ? monthCell.name : '命宮';
    const majorStars = monthCell ? monthCell.majorStars.map((s) => s.name) : [];

    // 當月氣場評分 (65 ~ 98)
    let score = 75;
    if (favorableElements.includes(monthElement)) score += 12;
    if (unfavorableElements.includes(monthElement)) score -= 8;
    if (['食神', '正財', '偏財', '正官', '正印'].includes(tenGod)) score += 6;
    if (['七殺', '傷官'].includes(tenGod)) score -= 3;
    const energyScore = Math.max(62, Math.min(96, score));

    // 當月主題
    const theme = `${ganzhi}月·${tenGod}見${ziweiPalaceName}·${siHua[0]}化祿`;

    // 依四時與五行制定起居重點
    let sleepRecommendation = '';
    let dietRecommendation = '';
    let exerciseRecommendation = '';
    let decisionTiming = '';

    if (meta.season === 'SPRING') {
      sleepRecommendation = '夜臥早起，順應春生之氣；子時前入眠，利肝經排毒與生發陽氣。';
      dietRecommendation = '宜多食芽菜、山藥、紅棗等甘潤食材，少食酸澀，助益脾胃陽氣。';
      exerciseRecommendation = '清晨戶外散步、太極、輕度伸展，披髮緩行，舒暢情志。';
      decisionTiming = `借${siHua[0]}化祿之機佈局年度新案；重大方案宜在驚蟄前後拍板。`;
    } else if (meta.season === 'SUMMER') {
      sleepRecommendation = '夜臥早起，無厭於日；適當午時小憩（15-30分鐘）以養心神。';
      dietRecommendation = '多補水分與綠豆、冬瓜等清潤解熱食材，戒除過量冷飲冰品防傷脾陽。';
      exerciseRecommendation = '宜清晨或傍晚進行慢跑、游泳，避免正午烈日下高強度大汗淋漓。';
      decisionTiming = `逢${siHua[1]}化權之勢全力推進實務落地，遇${siHua[3]}化忌日宜嚴審開銷合約。`;
    } else if (meta.season === 'AUTUMN') {
      sleepRecommendation = '早臥早起，與雞俱興；收斂神氣，防秋燥傷肺，確保7-8小時充沛睡眠。';
      dietRecommendation = '多食白蘿蔔、銀耳、百合、梨等白色潤肺食材，減少辛辣刺激以平抑燥氣。';
      exerciseRecommendation = '登高遠眺、瑜珈普拉提、深呼吸鍛鍊，有助寬胸理氣、寧心安神。';
      decisionTiming = `利收穫盤點、複盤審計與客群維護；逢${siHua[2]}化科利考試、發表與名譽拓展。`;
    } else {
      sleepRecommendation = '早臥晚起，必待日光；避寒就溫，防陽氣外洩，亥時（21-23點）安心入夢。';
      dietRecommendation = '宜溫補腎水，適量攝取黑芝麻、黑豆、核桃、溫熱燉湯，忌生冷寒涼。';
      exerciseRecommendation = '午後陽光充沛時室內拉筋、輕度肌力訓練，微出汗即可，勿劇烈耗氣。';
      decisionTiming = `歲末宜守成蓄勢、沉澱知識資產，防範衝動擴張，蓄積明春破局之能。`;
    }

    return {
      lunarMonth: meta.lunarMonth,
      monthName: meta.monthName,
      solarMonthRange: meta.solarMonthRange,
      stem: monthStem,
      branch: monthBranch,
      ganzhi,
      element: monthElement,
      tenGod,
      siHua,
      ziweiPalaceBranch: monthlyPalaceBranch,
      ziweiPalaceName,
      majorStars,
      theme,
      energyScore,
      habitFocus: {
        sleepRecommendation,
        dietRecommendation,
        exerciseRecommendation,
        decisionTiming,
      },
    };
  });

  return {
    targetYear: currentYear,
    yearGanZhi,
    yearStem,
    yearBranch,
    naYin,
    animal,
    yearElement,
    dayMaster,
    dayMasterElement,
    yearTenGod,
    favorableElements,
    unfavorableElements,
    ziweiYearlyInfo: {
      palaceBranch: yearlyPalaceBranch,
      palaceName: yearlyPalaceName,
      majorStars: yearlyMajorStars,
      siHua: yearlySiHua,
    },
    ziweiSmallLimitInfo: {
      palaceBranch: smallLimitPalaceBranch,
      palaceName: smallLimitPalaceName,
      siHua: smallLimitSiHua,
    },
    annualOverview: {
      theme: annualTheme,
      advice: annualAdvice,
      opportunityPoints,
      cautionPoints,
    },
    monthlyHorizons,
  };
}

/**
 * 依據命盤行運與生活起居紀錄進行診斷評估 (Habit-Chart Resonance)
 */
export function evaluateHabitResonance(
  calendar: AnnualDestinyCalendar,
  habits: HabitLogEntry[]
): HabitResonanceEvaluation {
  if (!habits || habits.length === 0) {
    return generateBaselineEvaluation(calendar);
  }

  // 1. 統計生活起居各項指標
  const total = habits.length;
  const avgSleepHours = habits.reduce((acc, h) => acc + (h.sleepHours || 7), 0) / total;
  const avgWaterMl = habits.reduce((acc, h) => acc + (h.waterMl || 2000), 0) / total;
  const avgExerciseMinutes = habits.reduce((acc, h) => acc + (h.exerciseMinutes || 30), 0) / total;
  const avgEnergyLevel = habits.reduce((acc, h) => acc + (h.energyLevel || 3), 0) / total;

  // 2. 睡眠分數計算 (7~8.5小時最優)
  let sleepScore = 80;
  if (avgSleepHours >= 7 && avgSleepHours <= 8.5) sleepScore += 15;
  else if (avgSleepHours < 6) sleepScore -= 20;
  else if (avgSleepHours > 9.5) sleepScore -= 10;

  const goodSleepCount = habits.filter((h) => ['優質', '良好'].includes(h.sleepQuality)).length;
  if (goodSleepCount / total > 0.6) sleepScore += 5;
  else if (goodSleepCount / total < 0.3) sleepScore -= 10;
  sleepScore = Math.max(40, Math.min(100, Math.round(sleepScore)));

  // 3. 飲食分數計算 (清淡多蔬、足量水分)
  let dietScore = 75;
  if (avgWaterMl >= 1800 && avgWaterMl <= 2800) dietScore += 12;
  else if (avgWaterMl < 1200) dietScore -= 15;

  const healthyDietCount = habits.filter((h) => ['均衡清淡', '多蔬少油', '間歇斷食'].includes(h.dietType)).length;
  const heavyDietCount = habits.filter((h) => ['辛辣油膩', '甜食生冷', '外食應酬'].includes(h.dietType)).length;
  if (healthyDietCount > heavyDietCount) dietScore += 10;
  else dietScore -= 12;
  dietScore = Math.max(40, Math.min(100, Math.round(dietScore)));

  // 4. 運動與身心活力分數
  let exerciseScore = 70;
  if (avgExerciseMinutes >= 25 && avgExerciseMinutes <= 60) exerciseScore += 18;
  else if (avgExerciseMinutes < 15) exerciseScore -= 15;
  exerciseScore += Math.round((avgEnergyLevel - 3) * 6);
  exerciseScore = Math.max(40, Math.min(100, Math.round(exerciseScore)));

  // 5. 命盤五行諧振平衡計算
  const isWaterFav = calendar.favorableElements.includes('水');
  const isWoodFav = calendar.favorableElements.includes('木');
  const isFireFav = calendar.favorableElements.includes('火');
  const isMetalFav = calendar.favorableElements.includes('金');
  const isEarthFav = calendar.favorableElements.includes('土');

  let woodScore = 70;
  let fireScore = 70;
  let earthScore = 70;
  let metalScore = 70;
  let waterScore = 70;

  if (sleepScore >= 80) waterScore += 15; else waterScore -= 10;
  if (exerciseScore >= 75) woodScore += 15; else woodScore -= 10;
  if (heavyDietCount > 0) {
    fireScore += 12;
    earthScore -= 10;
  }
  if (avgWaterMl >= 2000) waterScore += 10;

  let resonanceBonus = 0;
  if (isWaterFav && waterScore >= 75) resonanceBonus += 8;
  if (isWoodFav && woodScore >= 75) resonanceBonus += 8;
  if (isFireFav && fireScore >= 70 && fireScore <= 85) resonanceBonus += 6;
  if (isMetalFav && metalScore >= 70) resonanceBonus += 6;
  if (isEarthFav && earthScore >= 75) resonanceBonus += 6;

  const totalRaw = Math.round(sleepScore * 0.35 + dietScore * 0.35 + exerciseScore * 0.3) + resonanceBonus;
  const resonanceScore = Math.max(45, Math.min(99, totalRaw));

  let resonanceLevel: HabitResonanceEvaluation['resonanceLevel'] = '普通';
  if (resonanceScore >= 88) resonanceLevel = '極佳';
  else if (resonanceScore >= 78) resonanceLevel = '良好';
  else if (resonanceScore >= 65) resonanceLevel = '普通';
  else if (resonanceScore >= 55) resonanceLevel = '需調整';
  else resonanceLevel = '警示';

  const sleepAdvice =
    avgSleepHours < 6.5
      ? `近期日均睡眠僅 ${avgSleepHours.toFixed(1)} 小時，陰血耗損，容易導致流年【${calendar.ziweiYearlyInfo.siHua[3]}化忌】之躁動焦慮。強烈建議提早至 22:30 前熄燈就寢。`
      : `日均睡眠 ${avgSleepHours.toFixed(1)} 小時，整體節律平穩。宜保持子時（23-01點）深睡，滋養命主五行生機。`;

  const dietAdvice =
    heavyDietCount > healthyDietCount
      ? `近期高頻攝取辛辣油膩或外食應酬，易致脾胃濕熱、心火過旺。建議每週至少 4 天以清蒸多蔬為主，配合溫水 2,000ml 以上，以通利三焦。`
      : `飲食結構以清淡均衡為主，有助神經系統安定與五行氣血勻和。若逢流年火旺月份，可增補深色水生蔬果。`;

  const exerciseAdvice =
    avgExerciseMinutes < 20
      ? `活動量偏低（日均 ${avgExerciseMinutes.toFixed(0)} 分鐘），氣血易於凝滯。建議每日至少快走或慢跑 25 分鐘，暢達肝經氣血。`
      : `日均運動量 ${avgExerciseMinutes.toFixed(0)} 分鐘，活絡經絡效果優異。建議維持微汗即止，避免劇烈耗損真氣。`;

  const actionPlans: HabitActionPlan[] = [
    {
      category: 'SLEEP',
      title: '子時深睡回血法',
      timeFrame: '每日 22:45 前熄燈',
      detail: `為調和流年【${calendar.yearGanZhi}】之火熱之性，22:45 前停止使用藍光螢幕，聽輕柔白噪音或靜坐 10 分鐘，確保 23:00-01:00 處於深層睡眠。`,
      favorableElement: '水',
    },
    {
      category: 'DIET',
      title: '五味通關水液調理',
      timeFrame: '晨起與午後時段',
      detail: `晨起空腹飲用溫開水 350ml，午後 14:00-16:00 補充淡普洱或枸杞菊花茶，全日飲水量穩定維持在 ${Math.max(2000, Math.round(avgWaterMl))}ml。`,
      favorableElement: '木',
    },
    {
      category: 'EXERCISE',
      title: '晨曦活氧舒筋律動',
      timeFrame: '早晨 07:00 - 07:30',
      detail: '晨起進行 20-30 分鐘微汗有氧慢跑或八段錦，借東方晨光引發體內陽氣，促進全日精力充沛。',
      favorableElement: '火',
    },
    {
      category: 'TIMING',
      title: '流年重大決策避煞指引',
      timeFrame: `重點留意逢【${calendar.ziweiYearlyInfo.siHua[3]}化忌】星曜之日`,
      detail: `在情緒波動或精力偏低（評分小於 3）當日，嚴格避免簽約、重大合資或高風險決策。宜專注於例行事務整理與複盤。`,
      favorableElement: '金',
    },
  ];

  const holisticSummary = `綜合評析：您在 ${calendar.targetYear} ${calendar.yearGanZhi} 年之生活起居調和度為 ${resonanceScore} 分（評級：${resonanceLevel}）。作息節律對八字喜用【${calendar.favorableElements.join('、')}】之滋養度穩健，落實「子時入眠、清淡養胃、避忌修心」三大支柱，即可轉化流年四化動能為人生進取之最佳底氣。`;

  return {
    resonanceScore,
    resonanceLevel,
    elementalHarmony: {
      woodScore: Math.round(woodScore),
      fireScore: Math.round(fireScore),
      earthScore: Math.round(earthScore),
      metalScore: Math.round(metalScore),
      waterScore: Math.round(waterScore),
    },
    sleepAnalysis: {
      avgSleepHours: Number(avgSleepHours.toFixed(1)),
      qualityTrend: goodSleepCount > total / 2 ? '平穩向好' : '波動欠佳',
      status: sleepScore >= 80 ? '健康規律' : '待調適改善',
      advice: sleepAdvice,
    },
    dietAnalysis: {
      predominantType: healthyDietCount >= heavyDietCount ? '清淡健康' : '外食負擔',
      avgWaterMl: Math.round(avgWaterMl),
      status: dietScore >= 75 ? '五味調和' : '油膩偏燥',
      advice: dietAdvice,
    },
    exerciseAnalysis: {
      avgMinutes: Math.round(avgExerciseMinutes),
      status: exerciseScore >= 75 ? '生機活絡' : '久坐偏滯',
      advice: exerciseAdvice,
    },
    actionPlans,
    holisticSummary,
  };
}

function generateBaselineEvaluation(calendar: AnnualDestinyCalendar): HabitResonanceEvaluation {
  return {
    resonanceScore: 82,
    resonanceLevel: '良好',
    elementalHarmony: {
      woodScore: 78,
      fireScore: 80,
      earthScore: 76,
      metalScore: 74,
      waterScore: 82,
    },
    sleepAnalysis: {
      avgSleepHours: 7.5,
      qualityTrend: '基準常態',
      status: '建議依流年節氣作息',
      advice: `在 ${calendar.yearGanZhi} 年，建議以 23:00 前入眠為基準，確保大腦神經在夜半獲得深沉修復。`,
    },
    dietAnalysis: {
      predominantType: '均衡清淡',
      avgWaterMl: 2000,
      status: '標準調養',
      advice: `建議多食甘潤多蔬、適度補足溫熱水分，調和命局喜用五行。`,
    },
    exerciseAnalysis: {
      avgMinutes: 30,
      status: '推薦日常活動',
      advice: `每日維持 30 分鐘輕度有氧或晨間散步，舒展身心氣機。`,
    },
    actionPlans: [
      {
        category: 'SLEEP',
        title: '定時就寢護元氣',
        timeFrame: '每日 23:00 前',
        detail: '確保每夜 7-8 小時優質睡眠，以靜制動，安養精神。',
        favorableElement: '水',
      },
      {
        category: 'TIMING',
        title: '順應流年四化推進',
        timeFrame: '全年各月份',
        detail: `善用 ${calendar.ziweiYearlyInfo.siHua[0]}化祿 之機緣，審慎落實每一步行動規劃。`,
        favorableElement: '木',
      },
    ],
    holisticSummary: `目前尚未記錄具體生活起居數據，系統已為您依據 ${calendar.yearGanZhi} 年命盤排演標準流年養生與作息規劃指引。點擊「＋ 記錄生活起居」添加日誌，即可獲得個人專屬動態諧振診斷！`,
  };
}
