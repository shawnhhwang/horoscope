import { FiveElement } from '../bazi/types.js';

export interface GridScore {
  gridName: '天格' | '人格' | '地格' | '總格' | '外格';
  strokes: number;
  element: FiveElement;
  auspiciousLevel: '大吉' | '吉' | '半吉' | '凶' | '大凶';
  meaning: string;
}

export interface ThreeTalentsInfo {
  heavenElement: FiveElement; // 天格五行
  humanElement: FiveElement; // 人格五行
  earthElement: FiveElement; // 地格五行
  pattern: string; // 例如 "木火土"
  level: '大吉' | '吉' | '半吉' | '凶';
  description: string;
}

export interface NameAnalysisResult {
  surname: string;
  givenName: string;
  fullName: string;
  charStrokes: { char: string; strokes: number; element: FiveElement }[];
  grids: {
    tian: GridScore;
    ren: GridScore;
    di: GridScore;
    zong: GridScore;
    wai: GridScore;
  };
  threeTalents: ThreeTalentsInfo;
  overallScore: number; // 0 ~ 100
  summary: string;
}

export interface RecommendedName {
  fullName: string;
  givenName: string;
  gender: '男' | '女';
  elements: FiveElement[];
  totalScore: number;
  origin: string; // 典籍出處（詩經、楚辭、易經、論語等）
  meaning: string;
}
