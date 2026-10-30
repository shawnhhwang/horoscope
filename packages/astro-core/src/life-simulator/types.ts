import { FiveElement, TenGod } from '../bazi/types.js';

export interface LifeAttributes {
  health: number;       // 體魄健康 (0 ~ 100)
  knowledge: number;    // 知識才識 (0 ~ 100) 四大核心領域之一
  wealth: number;       // 財富資產 (0 ~ 100) 四大核心領域之一
  relationship: number; // 情感眷屬 (0 ~ 100) 四大核心領域之一
  career: number;       // 事業聲望 (0 ~ 100，輔助指標)
  wisdom: number;       // 心性智慧 (0 ~ 100，向後相容對齊 knowledge)
}

export type DecisionAttitude = 'AGGRESSIVE' | 'CONSERVATIVE' | 'MORAL' | 'ESCAPE';

export interface LifeOption {
  id: string;                    // 如 'opt_a'
  text: string;                  // 選項描述文字，如「接受外派海外分部，爭取連跳兩級晉升」
  attitude: DecisionAttitude;
  potentialImpact: Partial<Record<keyof LifeAttributes, number>>; // 預期屬性影響
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ActiveDaYunInfo {
  stem: string;
  branch: string;
  tenGod: TenGod;
  startAge: number;
  endAge: number;
  isTongXian?: boolean; // 是否為起大運前之童限
}

export interface YearlyLifeNode {
  age: number;                   // 實歲 (0 ~ 100)
  nominalAge: number;            // 虛歲 (1 ~ 101)
  solarYear: number;             // 西曆年份，例如 2026
  ganzhi: string;                // 流年干支，例如 "丙午"
  yearElement: FiveElement;      // 流年五行
  tenGod: TenGod;                // 流年十神
  daYun: ActiveDaYunInfo;        // 當前十年大運
  fortuneLevel: '大吉' | '小吉' | '平順' | '小凶' | '大凶';
  isKeyMilestone: boolean;       // 是否為重大人生轉折節點
  milestoneReason?: string;      // 例如 "大運交接關口" | "日柱天剋地沖" | "大學升學年"
  taiwanEraContext?: string;     // 台灣當代歷史社會時代背景 (提升台灣生活擬真感)
  eraAvgLifeExpectancy?: number; // 當代台灣平均預期壽命 (歲)
  eraEpidemics?: string[];       // 當代盛行傳染病與疾厄型態
  isEpidemicYear?: boolean;      // 當年是否處於重大公衛/傳染病大流行期
  annualOverview?: string;       // 年初運氣提要
  annualStory?: string;          // 根據命盤流年與當下人生階段產生的深度年輪敘事文字 (每年一段)
  lifeStageTitle?: string;       // 當前人生階段名稱 (如「弱冠之年 · 大學探索」、「而立之秋 · 執掌風雲」)
  stageIllustration?: string;    // 對應該人生階段之日式寫實風格插畫路徑
  romanceIllustration?: string;  // 80億分之一紅顏相逢卡牌專屬日式寫實插畫路徑
  eventTitle?: string;           // 事件標題
  eventNarrative?: string;       // 事件情境背景描述
  options?: LifeOption[];        // 供玩家抉擇的選項列表
  chosenOptionId?: string;       // 玩家最終選擇的選項 ID
  resolutionNarrative?: string;  // 抉擇後的推進回饋劇情
  attributeDeltas?: Partial<Record<keyof LifeAttributes, number>>; // 該年屬性結算差值
  snapshotAttributes: LifeAttributes; // 結算後的屬性快照
  isTerminal: boolean;           // 是否在此歲數走向人生終點
  terminalReason?: string;       // 終局原因 (如「壽終正寢」或「疾勞辭世」)
}

export type BiographyPerspective = 'TIANJI' | 'SHIJI' | 'MEMOIR' | 'ONE_IN_8_BILLION';

export interface FemaleFriendProfile {
  id: string;                         // 識別碼，例如 'friend_1'
  name: string;                       // 真實姓名 (盲盒階段隱藏，結算時揭曉)，例如 '沈婉晴'
  archetype: string;                  // 人設原型，例如 '青梅竹馬 · 溫婉書香'
  personality: string;                // 性格風貌描述
  baziElement: FiveElement;           // 五行氣場
  birthDate?: string;                 // 女性生日 (YYYY-MM-DD)，支援使用者自由 KEYIN
  ageOffset?: number;                 // 與男主年齡差 (例如 -1 代表小1歲，0 代表同齡，+1 代表大1歲)
  clues: string[];                    // 盲盒相遇情境暗號標籤 (如 ["梧桐樹下", "桂花香", "手寫書籤"])
  mysteryAlias: string;               // 盲盒相遇時的外觀代號，例如 '【素雅白裙的知性女子】'
  mysteryDescription: string;         // 盲盒相遇當下的情境與外貌描繪 (隱去真實姓名)
  illustration?: string;              // 日式寫實相逢角色插畫路徑
  affinity: number;                   // 雙方綜合羈絆值 (0 ~ 100)
  herAffinity: number;                // 對方對男主的好感度 (0 ~ 100)
  compatibilityScore?: number;        // 八字命理先天默契/相合度評分 (0 ~ 100)
  encounterAge?: number;              // 男主角相遇時歲數
  herEncounterAge?: number;           // 相遇時女方歲數 (隨出生年份動態精確匹配)
  status: 'UNKNOWN' | 'MET' | 'BONDED' | 'MISSED' | 'SPOUSE'; // 因緣狀態
  encounterStory?: string;            // 當時盲盒抉擇的回憶紀錄
}

export interface OneInEightBillionResult {
  destinyCode: string;                // 專屬命運唯一碼，如 "DESTINY-TW-8B-93821"
  rarityScoreText: string;            // 罕見度評語，如 "全球 80 億人中僅有 1 人的專屬奇蹟"
  baziRarityScore: number;            // 先天八字格局奇特度 (0 ~ 100)
  choicePathPermutations: string;     // 百年自由意志路徑排列數，如 "約 3.48 × 10⁹ 種人生分支"
  romanticDestinySummary: string;     // 80 億人中的紅顏因緣總結
  revealedFriends: {
    id: string;
    name: string;
    archetype: string;
    mysteryAlias: string;
    illustration?: string;
    birthDate?: string;
    herEncounterAge?: number;
    affinity: number;
    herAffinity: number;
    compatibilityScore?: number;
    status: 'SPOUSE' | 'BONDED' | 'MISSED' | 'MET' | 'UNKNOWN';
    statusText: string;
    fatedSummary: string;
  }[];
  cosmicPhilosophyQuote: string;      // 80 億分之一的宇宙命運哲學銘言
}

export interface LifeFinalSummary {
  endingTitle: string;           // 一生成就稱號 (如「一代名醫德澤萬方」)
  finalAge: number;              // 享年/得年
  biographyRichText: string;     // 自傳式蓋棺論定長文
  activePerspective?: BiographyPerspective; // 當前展示之視角風格
  perspectiveBiographies?: Partial<Record<BiographyPerspective, string>>; // 各風格自傳文本快取
  perspectiveTitles?: Partial<Record<BiographyPerspective, string>>;       // 各風格自傳榮譽稱號
  perspectiveIsAi?: Partial<Record<BiographyPerspective, boolean>>;        // 標記該視角是否為 LLM 深度生成
  oneInEightBillion?: OneInEightBillionResult; // 80 億分之一的遊戲：命運概率與因緣揭曉
  radarScores: LifeAttributes;   // 最終五維綜合得分
  destinyAlignmentScore: number; // 天命契合度評分 (0 ~ 100)
  keyTriumphs: string[];         // 一生三大榮光
  keyRegrets: string[];          // 一生主要遺憾
}

export interface MetaphysicalDecisionGuidance {
  isApplicable: boolean;
  category: 'DA_XIONG' | 'DA_JI' | 'MILESTONE';
  title: string;
  badge: string;
  summary: string;
  recommendedAction: string;
  decisionTips: {
    label: string;
    description: string;
  }[];
}

export interface LifeSimulationSession {
  sessionId: string;
  userId?: string;
  profileName: string;
  gender: '男' | '女';
  birthDate: string;
  currentAge: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'TERMINATED';
  attributes: LifeAttributes;
  history: YearlyLifeNode[];
  milestoneFootprints: string[]; // 歷年重大里程碑文字標記陣列
  femaleFriends?: FemaleFriendProfile[]; // 男性視角下之紅顏知己名冊 (盲盒相遇與羈絆追蹤)
  finalSummary?: LifeFinalSummary;
}
