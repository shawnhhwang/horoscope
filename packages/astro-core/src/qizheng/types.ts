export type QizhengPlanetName =
  | '太陽'
  | '太陰'
  | '辰星'
  | '太白'
  | '熒惑'
  | '歲星'
  | '填星'
  | '羅睺'
  | '計都'
  | '月孛'
  | '紫氣';

export type CelestialQuadrant = '東方蒼龍' | '北方玄武' | '西方白虎' | '南方朱雀';

export interface LunarMansion {
  name: string; // 角, 亢, 氐...
  fullName: string; // 角木蛟, 亢金龍...
  animal: string; // 蛟, 龍, 貉, 兔...
  element: '木' | '金' | '土' | '日' | '月' | '火' | '水';
  quadrant: CelestialQuadrant;
  startDegree: number;
  degreeSpan: number;
}

export interface QizhengPlanetPosition {
  name: QizhengPlanetName;
  type: 'GOVERNOR' | 'EXTRA';
  westernEquivalent: string;
  eclipticDegree: number;
  speedDaily: number;
  isRetrograde: boolean;
  stationName: string; // 辰次 (如 玄枵, 星紀)
  branch: string; // 子, 丑, 寅...
  mansionName: string; // 宿名
  mansionDegree: number; // 入宿度數
  element: '木' | '火' | '土' | '金' | '水' | '日' | '月';
  nature: 'BENEFIC' | 'MALEFIC' | 'NEUTRAL';
  status: string; // 廟, 旺, 平, 陷
}

export interface QizhengPalace {
  index: number;
  name: string; // 命宮, 財帛, 兄弟, 田宅, 子女, 奴僕, 夫妻, 疾厄, 遷移, 官祿, 福德, 相貌
  branch: string; // 子, 丑, 寅, 卯, 辰, 巳, 午, 未, 申, 酉, 戌, 亥
  stationName: string; // 玄枵, 星紀...
  rulerPlanet: QizhengPlanetName;
  startDegree: number;
  endDegree: number;
  residentPlanets: QizhengPlanetName[];
}

export interface QizhengChart {
  birthDateTime: Date;
  trueSolarTime: Date;
  longitude: number;
  latitude: number;
  mingPalaceBranch: string;
  mingPalaceStation: string;
  mingMansion: string;
  shenPalaceBranch: string;
  planets: QizhengPlanetPosition[];
  palaces: QizhengPalace[];
  mansions: LunarMansion[];
  fourStarRelations: {
    rulerStar: QizhengPlanetName;
    generativeStar: QizhengPlanetName;
    restrainingStar: QizhengPlanetName;
    hatefulStar: QizhengPlanetName;
    usefulStar: QizhengPlanetName;
  };
  aspects: {
    planetA: QizhengPlanetName;
    planetB: QizhengPlanetName;
    type: '同宮' | '對照' | '三方會照' | '四正刑衝';
    degreeDiff: number;
    description: string;
  }[];
  verdict: {
    lifeOverview: string;
    careerAndWealth: string;
    marriageAndRelations: string;
    spiritualAdvice: string;
  };
}
