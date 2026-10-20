export type ZodiacSign =
  | '白羊座'
  | '金牛座'
  | '雙子座'
  | '巨蟹座'
  | '獅子座'
  | '處女座'
  | '天秤座'
  | '天蠍座'
  | '射手座'
  | '摩羯座'
  | '水瓶座'
  | '雙魚座';

export type AspectType = '合相' | '六分相' | '四分相' | '三分相' | '對分相';

export type LunarPhaseName =
  | '新月 (New Moon)'
  | '眉月 (Waxing Crescent)'
  | '上弦月 (First Quarter)'
  | '盈凸月 (Waxing Gibbous)'
  | '滿月 (Full Moon)'
  | '虧凸月 (Waning Gibbous)'
  | '下弦月 (Third Quarter)'
  | '殘月 (Balsamic Moon)';

export interface PlanetPosition {
  name: string; // 太陽, 月亮, 水星...
  sign: ZodiacSign;
  degree: number; // 該星座內度數 0 ~ 29.99
  eclipticDegree: number; // 黃道絕對度數 0 ~ 359.99
  house: number; // 落入宮位 1 ~ 12
  isRetrograde: boolean; // 是否逆行
}

export interface AspectInfo {
  planet1: string;
  planet2: string;
  type: AspectType;
  angle: number; // 精確夾角
  orb: number; // 容許度誤差
}

export interface NatalChartResult {
  birthInfo: {
    utcDate: string;
    latitude: number;
    longitude: number;
  };
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
  ascendantSign: ZodiacSign;
  planets: PlanetPosition[];
  houses: { house: number; sign: ZodiacSign; startDegree: number }[];
  aspects: AspectInfo[];
  lunarPhase: {
    phaseAngle: number;
    name: LunarPhaseName;
    illumination: number; // 0 ~ 100%
    archetypeTitle: string;
    description: string;
  };
  moonDepthReport: {
    emotionalNeeds: string;
    subconsciousPattern: string;
    intimacyStyle: string;
  };
}
