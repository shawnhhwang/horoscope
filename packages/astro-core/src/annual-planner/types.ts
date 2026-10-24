import { BareSiHuaArray, EarthlyBranch, HeavenlyStem } from '../ziwei/types.js';
import { FiveElement, TenGod } from '../bazi/types.js';

export interface MonthlyHorizon {
  lunarMonth: number; // 1 ~ 12
  monthName: string; // 正月、二月...
  solarMonthRange: string; // 西曆大致區間與節氣
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  ganzhi: string; // 如 "丙寅"
  element: FiveElement;
  tenGod: TenGod;
  siHua: BareSiHuaArray; // 月干四化 [祿, 權, 科, 忌]
  ziweiPalaceBranch: EarthlyBranch;
  ziweiPalaceName: string; // 該月流月命宮對應本命十二宮之一
  majorStars: string[];
  theme: string;
  energyScore: number; // 60 ~ 98
  habitFocus: {
    sleepRecommendation: string;
    dietRecommendation: string;
    exerciseRecommendation: string;
    decisionTiming: string;
  };
}

export interface AnnualDestinyCalendar {
  targetYear: number;
  yearGanZhi: string; // 如 "丙午"
  yearStem: HeavenlyStem;
  yearBranch: EarthlyBranch;
  naYin: string; // 如 "天河水"
  animal: string; // 如 "馬"
  yearElement: FiveElement;
  dayMaster: string; // 日主天干
  dayMasterElement: FiveElement;
  yearTenGod: TenGod;
  favorableElements: FiveElement[];
  unfavorableElements: FiveElement[];
  ziweiYearlyInfo: {
    palaceBranch: EarthlyBranch;
    palaceName: string;
    majorStars: string[];
    siHua: BareSiHuaArray;
  };
  ziweiSmallLimitInfo: {
    palaceBranch: EarthlyBranch;
    palaceName: string;
    siHua: BareSiHuaArray;
  };
  annualOverview: {
    theme: string;
    advice: string;
    opportunityPoints: string[];
    cautionPoints: string[];
  };
  monthlyHorizons: MonthlyHorizon[];
}

export interface HabitLogEntry {
  id?: string;
  date: string; // YYYY-MM-DD
  sleepHours: number;
  sleepQuality: string; // 優質, 良好, 普通, 淺眠疲倦, 嚴重失眠
  dietType: string; // 均衡清淡, 多蔬少油, 辛辣油膩, 甜食生冷, 外食應酬, 間歇斷食
  waterMl: number;
  exerciseMinutes: number;
  energyLevel: number; // 1 ~ 5
  notes?: string;
  tags?: string[];
}

export interface HabitActionPlan {
  category: 'SLEEP' | 'DIET' | 'EXERCISE' | 'MIND' | 'TIMING';
  title: string;
  timeFrame: string; // 如 "本週起", "每日亥時 (21-23點)", "逢辛酉月"
  detail: string;
  favorableElement: FiveElement;
}

export interface HabitResonanceEvaluation {
  resonanceScore: number; // 0 ~ 100
  resonanceLevel: '極佳' | '良好' | '普通' | '需調整' | '警示';
  elementalHarmony: {
    woodScore: number;
    fireScore: number;
    earthScore: number;
    metalScore: number;
    waterScore: number;
  };
  sleepAnalysis: {
    avgSleepHours: number;
    qualityTrend: string;
    status: string;
    advice: string;
  };
  dietAnalysis: {
    predominantType: string;
    avgWaterMl: number;
    status: string;
    advice: string;
  };
  exerciseAnalysis: {
    avgMinutes: number;
    status: string;
    advice: string;
  };
  actionPlans: HabitActionPlan[];
  holisticSummary: string;
}
