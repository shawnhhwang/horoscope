export type EarthlyBranch = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';
export type HeavenlyStem = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

export type PalaceName =
  | '命宮'
  | '兄弟宮'
  | '夫妻宮'
  | '子女宮'
  | '財帛宮'
  | '疾厄宮'
  | '遷移宮'
  | '僕役宮'
  | '官祿宮'
  | '田宅宮'
  | '福德宮'
  | '父母宮';

export type FiveElementBureau = '水二局' | '木三局' | '金四局' | '土五局' | '火六局';

export type StarBrightness = '廟' | '旺' | '得' | '利' | '平' | '不' | '陷';

export type TransformationType = '祿' | '權' | '科' | '忌';

export interface StarInfo {
  name: string;
  type: 'major' | 'lucky' | 'unlucky' | 'minor';
  brightness?: StarBrightness;
  transformation?: TransformationType;
}

export interface PalaceCell {
  branch: EarthlyBranch;
  stem: HeavenlyStem;
  name: PalaceName;
  isBodyPalace: boolean; // 是否為身宮
  majorStars: StarInfo[];
  luckyStars: StarInfo[];
  unluckyStars: StarInfo[];
  minorStars: StarInfo[];
  decadeStartAge: number;
  decadeEndAge: number;
  smallLimitAge?: number;
}

export interface PatternCondition {
  required: string[];   // 必須滿足條件
  bonus?: string[];     // 加分項
  breaking?: string[];  // 破格警示
}

export interface ZiweiPattern {
  name: string;
  level: 'excellent' | 'good' | 'neutral' | 'caution';
  description: string;
  palaces: string[];
  conditions?: PatternCondition;
  source?: string;
}

export interface ZiweiMingGongSummary {
  stars: string[];
  keywords: string[];
  nature: string;
}

/**
 * 四化星曜純字串陣列 [化祿星, 化權星, 化科星, 化忌星] (Bare star-name array)
 */
export type BareSiHuaArray = [string, string, string, string];

/**
 * 大限行運資訊
 */
export interface HoroscopeDecadeInfo {
  name: '大限';
  palaceName: PalaceName;
  branch: EarthlyBranch;
  stem: HeavenlyStem;
  ageRange: [number, number];
  siHua: BareSiHuaArray; // bare star-name array [祿, 權, 科, 忌]
}

/**
 * 流年行運資訊
 */
export interface HoroscopeYearlyInfo {
  name: '流年';
  year: number;
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  palaceName: PalaceName;
  siHua: BareSiHuaArray; // bare star-name array [祿, 權, 科, 忌]
}

/**
 * 小限行運資訊
 */
export interface HoroscopeSmallLimitInfo {
  name: '小限';
  age: number;
  palaceName: PalaceName;
  branch: EarthlyBranch;
  stem: HeavenlyStem;
  siHua: BareSiHuaArray; // bare star-name array [祿, 權, 科, 忌]
}

/**
 * 紫微斗數大限、流年、小限行運綜合盤 (Horoscope)
 */
export interface ZiweiHoroscope {
  targetYear: number;
  nominalAge: number;
  decade: HoroscopeDecadeInfo;
  yearly: HoroscopeYearlyInfo;
  smallLimit: HoroscopeSmallLimitInfo;
}

export interface ZiweiChart {
  birthInfo: {
    solarDate: string;
    lunarDate: string;
    gender: '男' | '女';
    lunarYearGanZhi: string;
    lunarMonth: number;
    lunarDay: number;
    lunarTimeBranch: EarthlyBranch;
  };
  fiveElementBureau: FiveElementBureau;
  lifeMasterStar: string; // 命主星
  bodyMasterStar: string; // 身主星
  bodyPalaceBranch: EarthlyBranch; // 身宮落支
  lifePalaceBranch: EarthlyBranch; // 命宮落支
  palaces: Record<EarthlyBranch, PalaceCell>;
  palacesList: PalaceCell[];
  patterns: ZiweiPattern[];
  mingGongSummary?: ZiweiMingGongSummary;
  horoscope?: ZiweiHoroscope;
}

