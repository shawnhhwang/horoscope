import { Solar, Lunar } from 'lunar-typescript';

export interface SolarTimeResult {
  standardTime: Date;
  trueSolarTime: Date;
  longitude: number;
  timeOffsetMinutes: number;
  equationOfTimeMinutes: number;
}

/**
 * 計算均時差 (Equation of Time, 分鐘)
 * @param date 日期
 */
export function getEquationOfTime(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  const b = ((360 / 365.24) * (dayOfYear - 81) * Math.PI) / 180;
  // 史賓塞經驗公式精確計算均時差
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  return eot;
}

/**
 * 依據出生地經度與出生時間校準真太陽時 (True Solar Time)
 * @param standardTime 鐘錶標準時間 (UTC 或當地標準時)
 * @param longitude 出生地經度 (如台北 121.5654, 香港 114.1694, 上海 121.4737)
 * @param standardMeridian 當前時區中央子午線經度 (UTC+8 為 120°)
 */
export function calculateTrueSolarTime(
  standardTime: Date,
  longitude: number = 120,
  standardMeridian: number = 120
): SolarTimeResult {
  const eotMinutes = getEquationOfTime(standardTime);
  // 經度差: 每偏東 1 度早 4 分鐘，每偏西 1 度晚 4 分鐘
  const longitudeOffsetMinutes = (longitude - standardMeridian) * 4;
  const totalOffsetMinutes = longitudeOffsetMinutes + eotMinutes;

  const trueSolarTime = new Date(standardTime.getTime() + totalOffsetMinutes * 60 * 1000);

  return {
    standardTime,
    trueSolarTime,
    longitude,
    timeOffsetMinutes: totalOffsetMinutes,
    equationOfTimeMinutes: eotMinutes,
  };
}

/**
 * 取得精確的農曆與節氣物件
 */
export function getLunarInfo(date: Date) {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  return {
    solar,
    lunar,
    yearGanZhi: lunar.getYearInGanZhi(),
    monthGanZhi: lunar.getMonthInGanZhi(),
    dayGanZhi: lunar.getDayInGanZhi(),
    timeGanZhi: lunar.getTimeInGanZhi(),
    lunarYear: lunar.getYear(),
    lunarMonth: lunar.getMonth(),
    lunarDay: lunar.getDay(),
    isLeap: lunar.getMonth() < 0,
    prevJieQi: lunar.getPrevJieQi()?.getName(),
    nextJieQi: lunar.getNextJieQi()?.getName(),
  };
}
