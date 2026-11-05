import { FiveElement } from '../bazi/types.js';

export type BunchoLuckLevel =
  | '大吉'
  | '中吉'
  | '小吉'
  | '吉'
  | '平吉'
  | '平'
  | '吉帶凶'
  | '轉吉';

export type BunchoDrawPhase =
  | 'idle'
  | 'praying'
  | 'cage_opening'
  | 'hopping_out'
  | 'pecking_lots'
  | 'drawing_lot'
  | 'delivering'
  | 'revealed';

export interface BunchoLotAspects {
  love: string;      // 戀愛與情感姻緣
  career: string;    // 工作、事業與官祿
  wealth: string;    // 財富、經商與投資
  study: string;     // 學業、考試與進修
  decision: string;  // 抉擇、二選一或重大決定
}

export interface BunchoLot {
  id: number;                   // 1 ~ 28 (對應二十八星宿靈雀神籤)
  number: number;
  name: string;                 // 籤名，例如「第 一 籤 · 靈雀銜春」
  luckLevel: BunchoLuckLevel;
  poem: string[];               // 四句五言或七言靈雀神籤詩
  birdAction: string;           // 雀鳥動作細節描摹（如「文鳥歪著小腦袋跳出籠門，於紅籤陣中挑選片刻，精準銜起一柄赤金籤牌」）
  element: FiveElement;         // 五行屬性 (木、火、土、金、水)
  keywords: string[];           // 核心關鍵字
  overallExplanation: string;   // 整體白話意涵
  aspects: BunchoLotAspects;    // 分面向指引
  birdAdvice: string;           // 文鳥靈犀悄悄話（溫暖治癒小叮嚀）
}

export interface BunchoDrawOptions {
  question?: string;
  aspect?: '感情' | '事業' | '財運' | '學業' | '抉擇' | '綜合';
  customLotId?: number; // 用於測試或指定籤號
}

export interface BunchoDrawResult {
  lot: BunchoLot;
  question: string;
  aspect: string;
  drawnAt: string;
}
