export type FiveElement = '木' | '火' | '土' | '金' | '水';

export type TenGod =
  | '正官'
  | '七殺'
  | '正印'
  | '偏印'
  | '正財'
  | '偏財'
  | '食神'
  | '傷官'
  | '比肩'
  | '劫財';

export interface Pillar {
  name: '年柱' | '月柱' | '日柱' | '時柱';
  stem: string;
  stemElement: FiveElement;
  stemTenGod: TenGod | '日主';
  branch: string;
  branchElement: FiveElement;
  hiddenStems: {
    stem: string;
    element: FiveElement;
    tenGod: TenGod;
    weight: number;
  }[];
  naYin: string;
}

export interface DayMasterEnergy {
  score: number; // 0 ~ 100
  status: '身強' | '身弱' | '專旺' | '從格';
  description: string;
}

export interface FiveElementsBreakdown {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface BaziChart {
  birthInfo: {
    solarDate: string;
    gender: '男' | '女';
  };
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar;
  };
  dayMaster: {
    stem: string;
    element: FiveElement;
  };
  energy: DayMasterEnergy;
  fiveElements: FiveElementsBreakdown;
  favorableElements: {
    useful: FiveElement[]; // 用神/喜神
    harmful: FiveElement[]; // 忌神/仇神
    neutral: FiveElement[]; // 閑神
  };
  luckPillars: {
    startAge: number;
    endAge: number;
    stem: string;
    branch: string;
    tenGod: TenGod;
  }[];
}
