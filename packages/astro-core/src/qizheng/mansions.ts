import { LunarMansion } from './types.js';

/**
 * 二十八星宿度數劃分矩陣 (以黃道 360 度歸一化定義)
 * 四象：東方蒼龍 (角亢氐房心尾箕)、北方玄武 (斗牛女優危室壁)、西方白虎 (奎婁胃昴畢觜參)、南方朱雀 (井鬼柳星張翼軫)
 */
export const TWENTY_EIGHT_MANSIONS: LunarMansion[] = [
  // 東方蒼龍七宿 (0° 起算至 75°)
  { name: '角', fullName: '角木蛟', animal: '蛟', element: '木', quadrant: '東方蒼龍', startDegree: 0, degreeSpan: 12 },
  { name: '亢', fullName: '亢金龍', animal: '龍', element: '金', quadrant: '東方蒼龍', startDegree: 12, degreeSpan: 9 },
  { name: '氐', fullName: '氐土貉', animal: '貉', element: '土', quadrant: '東方蒼龍', startDegree: 21, degreeSpan: 15 },
  { name: '房', fullName: '房日兔', animal: '兔', element: '日', quadrant: '東方蒼龍', startDegree: 36, degreeSpan: 5 },
  { name: '心', fullName: '心月狐', animal: '狐', element: '月', quadrant: '東方蒼龍', startDegree: 41, degreeSpan: 5 },
  { name: '尾', fullName: '尾火虎', animal: '虎', element: '火', quadrant: '東方蒼龍', startDegree: 46, degreeSpan: 18 },
  { name: '箕', fullName: '箕水豹', animal: '豹', element: '水', quadrant: '東方蒼龍', startDegree: 64, degreeSpan: 11 },

  // 北方玄武七宿 (75° 至 173°)
  { name: '斗', fullName: '斗木獬', animal: '獬', element: '木', quadrant: '北方玄武', startDegree: 75, degreeSpan: 26 },
  { name: '牛', fullName: '牛金牛', animal: '牛', element: '金', quadrant: '北方玄武', startDegree: 101, degreeSpan: 8 },
  { name: '女', fullName: '女土蝠', animal: '蝠', element: '土', quadrant: '北方玄武', startDegree: 109, degreeSpan: 12 },
  { name: '虛', fullName: '虛日鼠', animal: '鼠', element: '日', quadrant: '北方玄武', startDegree: 121, degreeSpan: 10 },
  { name: '危', fullName: '危月燕', animal: '燕', element: '月', quadrant: '北方玄武', startDegree: 131, degreeSpan: 17 },
  { name: '室', fullName: '室火豬', animal: '豬', element: '火', quadrant: '北方玄武', startDegree: 148, degreeSpan: 16 },
  { name: '壁', fullName: '壁水貐', animal: '貐', element: '水', quadrant: '北方玄武', startDegree: 164, degreeSpan: 9 },

  // 西方白虎七宿 (173° 至 253°)
  { name: '奎', fullName: '奎木狼', animal: '狼', element: '木', quadrant: '西方白虎', startDegree: 173, degreeSpan: 16 },
  { name: '婁', fullName: '婁金狗', animal: '狗', element: '金', quadrant: '西方白虎', startDegree: 189, degreeSpan: 12 },
  { name: '胃', fullName: '胃土雉', animal: '雉', element: '土', quadrant: '西方白虎', startDegree: 201, degreeSpan: 14 },
  { name: '昴', fullName: '昴日雞', animal: '雞', element: '日', quadrant: '西方白虎', startDegree: 215, degreeSpan: 11 },
  { name: '畢', fullName: '畢月烏', animal: '烏', element: '月', quadrant: '西方白虎', startDegree: 226, degreeSpan: 16 },
  { name: '觜', fullName: '觜火猴', animal: '猴', element: '火', quadrant: '西方白虎', startDegree: 242, degreeSpan: 2 },
  { name: '參', fullName: '參水猿', animal: '猿', element: '水', quadrant: '西方白虎', startDegree: 244, degreeSpan: 9 },

  // 南方朱雀七宿 (253° 至 360°)
  { name: '井', fullName: '井木犴', animal: '犴', element: '木', quadrant: '南方朱雀', startDegree: 253, degreeSpan: 33 },
  { name: '鬼', fullName: '鬼金羊', animal: '羊', element: '金', quadrant: '南方朱雀', startDegree: 286, degreeSpan: 3 },
  { name: '柳', fullName: '柳土獐', animal: '獐', element: '土', quadrant: '南方朱雀', startDegree: 289, degreeSpan: 15 },
  { name: '星', fullName: '星日馬', animal: '馬', element: '日', quadrant: '南方朱雀', startDegree: 304, degreeSpan: 7 },
  { name: '張', fullName: '張月鹿', animal: '鹿', element: '月', quadrant: '南方朱雀', startDegree: 311, degreeSpan: 18 },
  { name: '翼', fullName: '翼火蛇', animal: '蛇', element: '火', quadrant: '南方朱雀', startDegree: 329, degreeSpan: 18 },
  { name: '軫', fullName: '軫水蚓', animal: '蚓', element: '水', quadrant: '南方朱雀', startDegree: 347, degreeSpan: 13 },
];

/**
 * 依據黃道度數定位所落二十八星宿及入宿度數
 */
export function getMansionByDegree(degree: number): { mansion: LunarMansion; degreeInMansion: number } {
  const normDeg = ((degree % 360) + 360) % 360;
  for (let i = 0; i < TWENTY_EIGHT_MANSIONS.length; i++) {
    const m = TWENTY_EIGHT_MANSIONS[i];
    const end = m.startDegree + m.degreeSpan;
    if (normDeg >= m.startDegree && normDeg < end) {
      return {
        mansion: m,
        degreeInMansion: Math.round((normDeg - m.startDegree) * 10) / 10,
      };
    }
  }
  // 邊界回退至軫宿
  const last = TWENTY_EIGHT_MANSIONS[TWENTY_EIGHT_MANSIONS.length - 1];
  return {
    mansion: last,
    degreeInMansion: Math.round((normDeg - last.startDegree) * 10) / 10,
  };
}

/**
 * 十二辰次 (Station) 對應表：
 * 戌(降婁)、酉(大梁)、申(實沈)、未(鶉首)、午(鶉火)、巳(鶉尾)、辰(壽星)、卯(大火)、寅(析木)、丑(星紀)、子(玄枵)、亥(娵訾)
 */
export const TWELVE_STATIONS = [
  { branch: '戌', name: '降婁', startDeg: 0, endDeg: 30, ruler: '熒惑' as const },
  { branch: '酉', name: '大梁', startDeg: 30, endDeg: 60, ruler: '太白' as const },
  { branch: '申', name: '實沈', startDeg: 60, endDeg: 90, ruler: '辰星' as const },
  { branch: '未', name: '鶉首', startDeg: 90, endDeg: 120, ruler: '太陰' as const },
  { branch: '午', name: '鶉火', startDeg: 120, endDeg: 150, ruler: '太陽' as const },
  { branch: '巳', name: '鶉尾', startDeg: 150, endDeg: 180, ruler: '辰星' as const },
  { branch: '辰', name: '壽星', startDeg: 180, endDeg: 210, ruler: '太白' as const },
  { branch: '卯', name: '大火', startDeg: 210, endDeg: 240, ruler: '熒惑' as const },
  { branch: '寅', name: '析木', startDeg: 240, endDeg: 270, ruler: '歲星' as const },
  { branch: '丑', name: '星紀', startDeg: 270, endDeg: 300, ruler: '填星' as const },
  { branch: '子', name: '玄枵', startDeg: 300, endDeg: 330, ruler: '填星' as const },
  { branch: '亥', name: '娵訾', startDeg: 330, endDeg: 360, ruler: '歲星' as const },
];

export function getStationByDegree(degree: number) {
  const normDeg = ((degree % 360) + 360) % 360;
  for (const s of TWELVE_STATIONS) {
    if (normDeg >= s.startDeg && normDeg < s.endDeg) {
      return s;
    }
  }
  return TWELVE_STATIONS[0];
}
