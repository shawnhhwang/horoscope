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
}

