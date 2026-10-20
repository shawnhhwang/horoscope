import {
  EarthlyBranch,
  FiveElementBureau,
  HeavenlyStem,
  PalaceCell,
  PalaceName,
  StarBrightness,
  TransformationType,
  ZiweiChart,
} from './types.js';
import { Solar, Lunar } from 'lunar-typescript';

const BRANCHES: EarthlyBranch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const STEMS: HeavenlyStem[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

const PALACE_NAMES: PalaceName[] = [
  '命宮',
  '兄弟宮',
  '夫妻宮',
  '子女宮',
  '財帛宮',
  '疾厄宮',
  '遷移宮',
  '僕役宮',
  '官祿宮',
  '田宅宮',
  '福德宮',
  '父母宮',
];

// 五虎遁年起月訣（定寅宮天干）
const YIN_STEM_MAP: Record<HeavenlyStem, HeavenlyStem> = {
  甲: '丙',
  己: '丙',
  乙: '戊',
  庚: '戊',
  丙: '庚',
  辛: '庚',
  丁: '壬',
  壬: '壬',
  戊: '甲',
  癸: '甲',
};

// 四化對應表 [化祿, 化權, 化科, 化忌]
const SI_HUA_MAP: Record<HeavenlyStem, [string, string, string, string]> = {
  甲: ['廉貞', '破軍', '武曲', '太陽'],
  乙: ['天機', '天梁', '紫微', '太陰'],
  丙: ['天同', '天機', '文昌', '廉貞'],
  丁: ['太陰', '天同', '天機', '巨門'],
  戊: ['貪狼', '太陰', '右弼', '天機'],
  己: ['武曲', '貪狼', '天梁', '文曲'],
  庚: ['太陽', '武曲', '太陰', '天同'],
  辛: ['巨門', '太陽', '文曲', '文昌'],
  壬: ['天梁', '紫微', '左輔', '武曲'],
  癸: ['破軍', '巨門', '太陰', '貪狼'],
};

// 命主星表（依命宮地支定）
const LIFE_MASTER_MAP: Record<EarthlyBranch, string> = {
  子: '貪狼',
  丑: '巨門',
  寅: '祿存',
  卯: '文曲',
  辰: '廉貞',
  巳: '武曲',
  午: '破軍',
  未: '武曲',
  申: '廉貞',
  酉: '文曲',
  戌: '祿存',
  亥: '巨門',
};

// 身主星表（依生年地支定）
const BODY_MASTER_MAP: Record<EarthlyBranch, string> = {
  子: '鈴星',
  丑: '天相',
  寅: '天梁',
  卯: '天同',
  辰: '文昌',
  巳: '天機',
  午: '火星',
  未: '天相',
  申: '天梁',
  酉: '天同',
  戌: '文昌',
  亥: '天機',
};

// 納音推五行局
function getFiveElementBureau(stem: HeavenlyStem, branch: EarthlyBranch): { bureau: FiveElementBureau; num: number } {
  // 六十甲子納音對應五行局數: 水(2), 木(3), 金(4), 土(5), 火(6)
  const stemVal = { 甲: 1, 乙: 1, 丙: 2, 丁: 2, 戊: 3, 己: 3, 庚: 4, 辛: 4, 壬: 5, 癸: 5 }[stem];
  const branchVal = { 子: 1, 丑: 1, 午: 1, 未: 1, 寅: 2, 卯: 2, 申: 2, 酉: 2, 辰: 3, 巳: 3, 戌: 3, 亥: 3 }[branch];
  let sum = (stemVal + branchVal) % 5;
  if (sum === 0) sum = 5;

  // 納音五行: 1金(4), 2水(2), 3火(6), 4土(5), 5木(3)
  const map: Record<number, { bureau: FiveElementBureau; num: number }> = {
    1: { bureau: '金四局', num: 4 },
    2: { bureau: '水二局', num: 2 },
    3: { bureau: '火六局', num: 6 },
    4: { bureau: '土五局', num: 5 },
    5: { bureau: '木三局', num: 3 },
  };

  return map[sum];
}

// 求紫微星坐落宮位索引 (0~11)
function getZiweiIndex(bureauNum: number, lunarDay: number): number {
  let day = lunarDay;
  let remainder = day % bureauNum;
  let quotient = Math.floor(day / bureauNum);

  if (remainder !== 0) {
    const supplement = bureauNum - remainder;
    day += supplement;
    quotient = Math.floor(day / bureauNum);
    // 補數若為奇數則減，偶數則加
    const shift = supplement % 2 === 1 ? -supplement : supplement;
    const baseBranch = (2 + quotient - 1 + shift + 24) % 12;
    return baseBranch;
  } else {
    const baseBranch = (2 + quotient - 1) % 12;
    return baseBranch;
  }
}

/**
 * 核心紫微斗數排盤運算
 */
export function calculateZiweiChart(birthDate: Date, gender: '男' | '女'): ZiweiChart {
  const solar = Solar.fromDate(birthDate);
  const lunar = solar.getLunar();

  const lunarYearGanZhi = lunar.getYearInGanZhi();
  const yearStem = lunarYearGanZhi[0] as HeavenlyStem;
  const yearBranch = lunarYearGanZhi[1] as EarthlyBranch;

  const lunarMonth = Math.abs(lunar.getMonth());
  const lunarDay = lunar.getDay();

  // 生時地支
  const timeGanZhi = lunar.getTimeInGanZhi();
  const timeBranch = timeGanZhi[1] as EarthlyBranch;
  const timeBranchIndex = BRANCHES.indexOf(timeBranch);

  // 1. 定命宮、身宮
  // 命宮: 寅(2)起正月順數至生月，再從該宮起子時逆數至生時
  const lifeIndex = (2 + (lunarMonth - 1) - timeBranchIndex + 24) % 12;
  const lifeBranch = BRANCHES[lifeIndex];

  // 身宮: 寅(2)起正月順數至生月，再從該宮起子時順數至生時
  const bodyIndex = (2 + (lunarMonth - 1) + timeBranchIndex) % 12;
  const bodyBranch = BRANCHES[bodyIndex];

  // 2. 安十二宮干 (五虎遁)
  const startStem = YIN_STEM_MAP[yearStem];
  const startStemIdx = STEMS.indexOf(startStem);
  const palaceStems: Record<EarthlyBranch, HeavenlyStem> = {} as any;

  // 寅(2)開始順排十二干
  for (let i = 0; i < 12; i++) {
    const bIdx = (2 + i) % 12;
    const sIdx = (startStemIdx + i) % 10;
    palaceStems[BRANCHES[bIdx]] = STEMS[sIdx];
  }

  // 命宮天干
  const lifeStem = palaceStems[lifeBranch];

  // 3. 定五行局
  const { bureau, num: bureauNum } = getFiveElementBureau(lifeStem, lifeBranch);

  // 4. 起紫微、天府星
  const ziweiIndex = getZiweiIndex(bureauNum, lunarDay);
  // 天府與紫微在 寅-申 軸相對應: ziweiIndex + tianfuIndex = 4 (mod 12)
  const tianfuIndex = (4 - ziweiIndex + 12) % 12;

  // 十四主星配置
  // 紫微系 (逆行): 紫微(0), 天機(-1), 太陽(-3), 武曲(-4), 天同(-5), 廉貞(-8)
  const majorStarsPos: Record<string, number> = {
    紫微: ziweiIndex,
    天機: (ziweiIndex - 1 + 12) % 12,
    太陽: (ziweiIndex - 3 + 12) % 12,
    武曲: (ziweiIndex - 4 + 12) % 12,
    天同: (ziweiIndex - 5 + 12) % 12,
    廉貞: (ziweiIndex - 8 + 12) % 12,

    // 天府系 (順行): 天府(0), 太陰(+1), 貪狼(+2), 巨門(+3), 天相(+4), 天梁(+5), 七殺(+6), 破軍(+10)
    天府: tianfuIndex,
    太陰: (tianfuIndex + 1) % 12,
    貪狼: (tianfuIndex + 2) % 12,
    巨門: (tianfuIndex + 3) % 12,
    天相: (tianfuIndex + 4) % 12,
    天梁: (tianfuIndex + 5) % 12,
    七殺: (tianfuIndex + 6) % 12,
    破軍: (tianfuIndex + 10) % 12,
  };

  // 六吉星與六煞星配置
  // 昌曲 (生時起): 文昌辰上逆數至生時, 文曲戌上順數至生時
  const wenChangIdx = (4 - timeBranchIndex + 12) % 12;
  const wenQuIdx = (10 + timeBranchIndex) % 12;

  // 輔弼 (生月起): 左輔辰上順數至生月, 右弼戌上逆數至生月
  const zuoFuIdx = (4 + (lunarMonth - 1)) % 12;
  const youBiIdx = (10 - (lunarMonth - 1) + 12) % 12;

  // 魁鉞 (生年干):
  const kuiYueMap: Record<HeavenlyStem, [EarthlyBranch, EarthlyBranch]> = {
    甲: ['丑', '未'],
    戊: ['丑', '未'],
    庚: ['丑', '未'],
    乙: ['子', '申'],
    己: ['子', '申'],
    丙: ['亥', '酉'],
    丁: ['亥', '酉'],
    辛: ['午', '寅'],
    壬: ['卯', '巳'],
    癸: ['卯', '巳'],
  };
  const [kuiBranch, yueBranch] = kuiYueMap[yearStem];
  const tianKuiIdx = BRANCHES.indexOf(kuiBranch);
  const tianYueIdx = BRANCHES.indexOf(yueBranch);

  // 四化判定 (生年干)
  const siHuaStars = SI_HUA_MAP[yearStem]; // [祿, 權, 科, 忌]
  const transformationMap: Record<string, TransformationType> = {
    [siHuaStars[0]]: '祿',
    [siHuaStars[1]]: '權',
    [siHuaStars[2]]: '科',
    [siHuaStars[3]]: '忌',
  };

  // 建立十二宮位物件
  const isYangYear = ['甲', '丙', '戊', '庚', '壬'].includes(yearStem);
  // 陽男陰女順行，陰男陽女逆行
  const isClockwise = (gender === '男' && isYangYear) || (gender === '女' && !isYangYear);

  const palaces: Record<EarthlyBranch, PalaceCell> = {} as any;
  const palacesList: PalaceCell[] = [];

  for (let i = 0; i < 12; i++) {
    // 命宮逆時針配置十二宮名 (命、兄、夫、子、財、疾、遷、僕、官、田、福、父)
    const branchIdx = (lifeIndex - i + 12) % 12;
    const branch = BRANCHES[branchIdx];
    const name = PALACE_NAMES[i];
    const stem = palaceStems[branch];

    // 大限起運歲數
    const step = isClockwise ? i : (12 - i) % 12;
    const decadeStartAge = bureauNum + step * 10;
    const decadeEndAge = decadeStartAge + 9;

    const cell: PalaceCell = {
      branch,
      stem,
      name,
      isBodyPalace: branch === bodyBranch,
      majorStars: [],
      luckyStars: [],
      unluckyStars: [],
      minorStars: [],
      decadeStartAge,
      decadeEndAge,
    };

    // 加入主星
    for (const [starName, sIdx] of Object.entries(majorStarsPos)) {
      if (sIdx === branchIdx) {
        cell.majorStars.push({
          name: starName,
          type: 'major',
          brightness: '廟', // 基礎亮度設定
          transformation: transformationMap[starName],
        });
      }
    }

    // 加入吉星
    if (wenChangIdx === branchIdx) cell.luckyStars.push({ name: '文昌', type: 'lucky', transformation: transformationMap['文昌'] });
    if (wenQuIdx === branchIdx) cell.luckyStars.push({ name: '文曲', type: 'lucky', transformation: transformationMap['文曲'] });
    if (zuoFuIdx === branchIdx) cell.luckyStars.push({ name: '左輔', type: 'lucky', transformation: transformationMap['左輔'] });
    if (youBiIdx === branchIdx) cell.luckyStars.push({ name: '右弼', type: 'lucky', transformation: transformationMap['右弼'] });
    if (tianKuiIdx === branchIdx) cell.luckyStars.push({ name: '天魁', type: 'lucky' });
    if (tianYueIdx === branchIdx) cell.luckyStars.push({ name: '天鉞', type: 'lucky' });

    palaces[branch] = cell;
    palacesList.push(cell);
  }

  return {
    birthInfo: {
      solarDate: birthDate.toISOString(),
      lunarDate: `${lunar.getYear()}年農曆${lunarMonth}月${lunarDay}日`,
      gender,
      lunarYearGanZhi,
      lunarMonth,
      lunarDay,
      lunarTimeBranch: timeBranch,
    },
    fiveElementBureau: bureau,
    lifeMasterStar: LIFE_MASTER_MAP[lifeBranch],
    bodyMasterStar: BODY_MASTER_MAP[yearBranch],
    bodyPalaceBranch: bodyBranch,
    lifePalaceBranch: lifeBranch,
    palaces,
    palacesList,
  };
}
