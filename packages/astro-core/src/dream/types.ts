export type DreamCategory =
  | 'nature'     // 天文日月風雨山川
  | 'body'       // 身體毛髮血淚生理
  | 'animal'     // 飛禽走獸鱗介蟲魚
  | 'plant'      // 花草樹木果實農稼
  | 'building'   // 房屋居室門窗橋樑
  | 'wealth'     // 金銀財帛衣冠器用
  | 'event'      // 生死婚喪墜落奔逃
  | 'spiritual'; // 神佛仙官幽冥鬼神

export type DreamOmenLevel =
  | '大吉'
  | '中吉'
  | '吉'
  | '平吉'
  | '平'
  | '吉帶凶'
  | '凶'
  | '大凶';

export interface DreamEntry {
  id: string;                      // 唯一編碼，例如 'dream_snake'
  keyword: string;                 // 核心關鍵字，例如 '蛇'
  aliasKeywords: string[];         // 同義詞與複合詞，例如 ['蟒蛇', '青蛇', '毒蛇', '蛇入懷', '蛇咬']
  category: DreamCategory;
  categoryName: string;            // 類別中文名，例如 '飛禽走獸鱗介蟲魚'
  classicText: string;             // 《周公解夢》古籍原典辭句
  omen: DreamOmenLevel;            // 吉凶等級
  vernacularMeaning: string;       // 現代通俗吉凶詳解
  psychologicalAnalysis: string;   // 榮格與現代心理學潛意識投射分析
  actionAdvice: string;            // 現實生活與心態調適建議
}

export interface DreamSearchResult {
  query: string;
  category?: DreamCategory;
  matchedEntries: DreamEntry[];
  total: number;
}

export interface DreamAnalysisResult {
  scenario: string;
  matchedKeywords: string[];
  entries: DreamEntry[];
  dominantOmen: DreamOmenLevel;
  synthesis: {
    omenSummary: string;
    psychologicalCore: string;
    actionGuidance: string;
  };
}
