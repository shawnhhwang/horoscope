export type DayOfficerName =
  | '建'
  | '除'
  | '滿'
  | '平'
  | '定'
  | '執'
  | '破'
  | '危'
  | '成'
  | '收'
  | '開'
  | '閉';

export interface HourFortune {
  branch: string; // 子, 丑, 寅...
  timeSpan: string; // 23:00-01:00
  spiritName: string; // 青龍, 明堂, 天刑, 朱雀, 金匱, 天德, 白虎, 玉堂, 天牢, 玄武, 司命, 勾陳
  isAuspicious: boolean; // 吉 / 凶
}

export interface ZodiacHoroscope {
  animal: string; // 鼠, 牛, 虎, 兔, 龍, 蛇, 馬, 羊, 猴, 雞, 狗, 豬
  score: number; // 60 - 100
  stars: number; // 1 - 5 星
  tag: string; // 財運大發, 貴人相助, 諸事順遂, 宜守勿攻, 逢凶化吉...
  advice: string;
}

export interface DailyAlmanac {
  date: string; // 2026-10-20
  lunarDate: {
    yearGanZhi: string; // 丙午年
    zodiacAnimal: string; // 馬
    lunarMonthName: string; // 九月
    lunarDayName: string; // 十一日
    formatted: string; // 農曆丙午年九月十一
  };
  solarTerm: string; // 霜降 (或 寒露後第12天)
  ganzhi: {
    year: string;
    month: string;
    day: string;
  };
  nayinDay: string; // 納音五行 (如 澗下水, 爐中火)
  dayOfficer: {
    name: DayOfficerName;
    meaning: string;
    nature: '吉' | '凶' | '平';
  };
  twentyEightMansion: {
    mansionName: string; // 角木蛟
    element: string; // 木
    nature: '吉' | '凶';
    chant: string; // 歌訣
  };
  nineFlyingStar: {
    name: string; // 六白金星
    nature: string; // 吉星·掌武曲乾宮
  };
  suitableActivities: string[]; // 宜
  unsuitableActivities: string[]; // 忌
  deityDirections: {
    joyGod: string; // 喜神方位
    wealthGod: string; // 財神方位
    blessingGod: string; // 福神方位
    yangNoble: string; // 陽貴神方位
    yinNoble: string; // 陰貴神方位
  };
  clashInfo: {
    clashAnimal: string; // 衝狗
    shaDirection: string; // 煞南
    evilAnimalAges: string; // 歲次...
  };
  hourlyFortunes: HourFortune[];
  zodiacHoroscopes: ZodiacHoroscope[];
  dayMasterGuidance: Record<string, { tenGod: string; guidance: string }>;
}
