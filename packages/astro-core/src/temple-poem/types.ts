export type BwaBweiType = 'sheng_bwei' | 'xiao_bwei' | 'yin_bwei';

export interface BwaBweiResult {
  type: BwaBweiType;
  typeName: '聖筊' | '笑筊' | '陰筊';
  block1: 'flat' | 'round'; // flat: 平/陽, round: 凸/陰
  block2: 'flat' | 'round';
  isAccepted: boolean;       // 僅聖筊為 true
  meaning: string;           // 神明諭示意旨
  advice: string;            // 儀軌指引
}

export type TempleLuckLevel =
  | '大吉'
  | '上吉'
  | '中吉'
  | '吉'
  | '中平'
  | '平'
  | '吉帶凶'
  | '轉吉'
  | '下下'
  | '下平';

export interface TemplePoemAspects {
  career: string;     // 功名、考運、升遷與轉職
  wealth: string;     // 求財、經商、理財與利潤
  marriage: string;   // 婚姻、姻緣、感情與復合
  health: string;     // 疾病、身體、求醫與安康
  pregnancy: string;  // 六甲、求子與產育
  lawsuit: string;    // 官司、訴訟、合約糾紛與是非
  travel: string;     // 出行、出國、移居與遠行
  lostItem: string;   // 失物、尋找與方位
  family: string;     // 家運、宅舍與門戶平安
  business: string;   // 作事、合夥、創業與營運
}

export interface TemplePoemLot {
  id: number;                 // 1 ~ 60
  stemBranch: string;         // 甲子, 乙丑 ... 癸亥
  orderNumberText: string;    // 例如「第 一 籤」
  palaceGua: string;          // 例如「乾金」、「巽木」、「兌澤」
  title: string;              // 典故名稱（例如「包公請雷驚仁宗」、「漢高祖入關」）
  luckLevel: TempleLuckLevel;
  poem: string[];             // 正統七言絕句四句詩文
  allusion: string;           // 歷史與戲曲典故背景說明
  holyDecree: string;         // 聖意（解曰）
  aspects: TemplePoemAspects; // 完整面向解籤斷語
}

export type TempleInquiryAspect =
  | 'career'
  | 'wealth'
  | 'marriage'
  | 'health'
  | 'pregnancy'
  | 'lawsuit'
  | 'travel'
  | 'lostItem'
  | 'family'
  | 'business'
  | 'general';

export interface TempleDrawOptions {
  customLotId?: number;
  seekerName?: string;
  birthDate?: string;
  inquiryAspect?: TempleInquiryAspect;
  question?: string;
}

export interface TempleDivinationState {
  step: 'petition' | 'draw_lot' | 'bwa_bwei' | 'interpretation';
  seekerName: string;
  inquiryAspect: TempleInquiryAspect;
  question: string;
  drawnLot?: TemplePoemLot;
  bwaBweiHistory: BwaBweiResult[];
  consecutiveShengBwei: number;
  requiredShengBwei: number; // 通常為 1 筊或 3 筊
  isConfirmed: boolean;
}
