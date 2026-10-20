import { calculateTrueSolarTime } from '../calendar/index.js';
import {
  QizhengChart,
  QizhengPlanetName,
  QizhengPlanetPosition,
  QizhengPalace,
} from './types.js';
import { TWENTY_EIGHT_MANSIONS, TWELVE_STATIONS, getMansionByDegree, getStationByDegree } from './mansions.js';

// J2000 基準日 (2000-01-01 12:00 UTC)
const J2000 = new Date('2000-01-01T12:00:00Z').getTime();

/**
 * 推算七政四餘天星全盤
 */
export function calculateQizhengChart(
  birthDate: Date,
  longitude: number = 120.0,
  latitude: number = 25.0
): QizhengChart {
  const solarTimeInfo = calculateTrueSolarTime(birthDate, longitude);
  const date = solarTimeInfo.trueSolarTime;
  const daysSinceJ2000 = (date.getTime() - J2000) / (1000 * 60 * 60 * 24);

  // 1. 推算七政天體黃道度數 (Ecliptic Longitudes)
  const sunDeg = calculateSunDegree(daysSinceJ2000);
  const moonDeg = calculateMoonDegree(daysSinceJ2000);
  const mercuryDeg = (sunDeg + 20 * Math.sin(daysSinceJ2000 * 0.071) + 360) % 360;
  const venusDeg = (sunDeg + 45 * Math.sin(daysSinceJ2000 * 0.027) + 360) % 360;
  const marsDeg = (355.45 + daysSinceJ2000 * 0.524033) % 360;
  const jupiterDeg = (34.40 + daysSinceJ2000 * 0.083085) % 360;
  const saturnDeg = (49.94 + daysSinceJ2000 * 0.033444) % 360;

  // 2. 推算四餘虛星黃道度數
  // 羅睺 (Rahu): 北交點，逆行週期約 18.61 年 (-0.05295°/天)
  const rahuDeg = (125.04 - daysSinceJ2000 * 0.0529538 + 360000) % 360;
  // 計都 (Ketu): 羅睺對沖 180°
  const ketuDeg = (rahuDeg + 180) % 360;
  // 月孛 (Yuebei): 月球遠地點 (Lilith)，順行約 8.85 年 (+0.11140°/天)
  const yuebeiDeg = (83.35 + daysSinceJ2000 * 0.111404 + 360000) % 360;
  // 紫氣 (Ziqi): 吉祥景星，28 年行天一周 (+360 / (28 * 365.25) ~ +0.0352°/天)
  const ziqiDeg = (14.22 + daysSinceJ2000 * 0.035198 + 360000) % 360;

  // 3. 封裝七政四餘星曜陣列
  const rawPlanets: Array<{
    name: QizhengPlanetName;
    type: 'GOVERNOR' | 'EXTRA';
    western: string;
    deg: number;
    element: '木' | '火' | '土' | '金' | '水' | '日' | '月';
    nature: 'BENEFIC' | 'MALEFIC' | 'NEUTRAL';
  }> = [
    { name: '太陽', type: 'GOVERNOR', western: 'Sun', deg: sunDeg, element: '日', nature: 'BENEFIC' },
    { name: '太陰', type: 'GOVERNOR', western: 'Moon', deg: moonDeg, element: '月', nature: 'BENEFIC' },
    { name: '辰星', type: 'GOVERNOR', western: 'Mercury', deg: mercuryDeg, element: '水', nature: 'NEUTRAL' },
    { name: '太白', type: 'GOVERNOR', western: 'Venus', deg: venusDeg, element: '金', nature: 'BENEFIC' },
    { name: '熒惑', type: 'GOVERNOR', western: 'Mars', deg: marsDeg, element: '火', nature: 'MALEFIC' },
    { name: '歲星', type: 'GOVERNOR', western: 'Jupiter', deg: jupiterDeg, element: '木', nature: 'BENEFIC' },
    { name: '填星', type: 'GOVERNOR', western: 'Saturn', deg: saturnDeg, element: '土', nature: 'MALEFIC' },
    { name: '羅睺', type: 'EXTRA', western: 'North Node', deg: rahuDeg, element: '火', nature: 'MALEFIC' },
    { name: '計都', type: 'EXTRA', western: 'South Node', deg: ketuDeg, element: '土', nature: 'MALEFIC' },
    { name: '月孛', type: 'EXTRA', western: 'Lunar Apogee', deg: yuebeiDeg, element: '水', nature: 'MALEFIC' },
    { name: '紫氣', type: 'EXTRA', western: 'Ziqi Star', deg: ziqiDeg, element: '木', nature: 'BENEFIC' },
  ];

  const planets: QizhengPlanetPosition[] = rawPlanets.map((p) => {
    const station = getStationByDegree(p.deg);
    const mansionInfo = getMansionByDegree(p.deg);
    return {
      name: p.name,
      type: p.type,
      westernEquivalent: p.western,
      eclipticDegree: Math.round(p.deg * 100) / 100,
      speedDaily: p.type === 'GOVERNOR' ? 1.0 : 0.05,
      isRetrograde: p.name === '羅睺' || p.name === '計都',
      stationName: station.name,
      branch: station.branch,
      mansionName: mansionInfo.mansion.fullName,
      mansionDegree: mansionInfo.degreeInMansion,
      element: p.element,
      nature: p.nature,
      status: determineStarStatus(p.name, station.branch),
    };
  });

  // 4. 定位命宮 (果老星宗法：以太陽所在辰次與出生時辰，安卯宮起命)
  const sunStation = getStationByDegree(sunDeg);
  const birthHour = date.getHours();
  // 12 時辰索引: 子=0, 丑=1, 寅=2, 卯=3...
  const hourBranchIndex = Math.floor(((birthHour + 1) % 24) / 2);
  const stationBranches = ['戌', '酉', '申', '未', '午', '巳', '辰', '卯', '寅', '丑', '子', '亥'];
  const sunBranchIdx = stationBranches.indexOf(sunStation.branch);
  // 果老起命訣：太陽所落辰次為起點，順數至生時，以卯宮定位命宮
  const mingBranchIdx = (sunBranchIdx - hourBranchIndex + 3 + 12) % 12;
  const mingPalaceBranch = stationBranches[mingBranchIdx];
  const mingStation = TWELVE_STATIONS.find((s) => s.branch === mingPalaceBranch)!;
  const mingMansionInfo = getMansionByDegree(mingStation.startDeg + 15);

  // 5. 定位身宮 (太陰所居之辰次)
  const moonStation = getStationByDegree(moonDeg);
  const shenPalaceBranch = moonStation.branch;

  // 6. 排演十二人事宮
  const palaceNames = [
    '命宮',
    '財帛',
    '兄弟',
    '田宅',
    '子女',
    '奴僕',
    '夫妻',
    '疾厄',
    '遷移',
    '官祿',
    '福德',
    '相貌',
  ];

  const palaces: QizhengPalace[] = [];
  for (let i = 0; i < 12; i++) {
    const curBranchIdx = (mingBranchIdx - i + 12) % 12;
    const branch = stationBranches[curBranchIdx];
    const st = TWELVE_STATIONS.find((s) => s.branch === branch)!;
    // 找出居於此宮的星曜
    const resident = planets.filter((p) => p.branch === branch).map((p) => p.name);

    palaces.push({
      index: i + 1,
      name: palaceNames[i],
      branch,
      stationName: st.name,
      rulerPlanet: st.ruler,
      startDegree: st.startDeg,
      endDegree: st.endDeg,
      residentPlanets: resident,
    });
  }

  // 7. 恩難仇用四星關係 (以命宮主星所屬五行生剋推導)
  const rulerStar = mingStation.ruler;
  const rulerElementMap: Record<QizhengPlanetName, '木' | '火' | '土' | '金' | '水'> = {
    太陽: '火',
    太陰: '水',
    辰星: '水',
    太白: '金',
    熒惑: '火',
    歲星: '木',
    填星: '土',
    羅睺: '火',
    計都: '土',
    月孛: '水',
    紫氣: '木',
  };
  const myElem = rulerElementMap[rulerStar] || '土';
  const fourStarRelations = calculateFourStarRelations(rulerStar, myElem);

  // 8. 檢測主要星相會照 (同宮、對照、三方、四正)
  const aspects = calculateQizhengAspects(planets);

  // 9. 綜合斷語生成
  const verdict = generateQizhengVerdict(
    mingStation.name,
    mingPalaceBranch,
    mingMansionInfo.mansion.fullName,
    rulerStar,
    palaces,
    planets
  );

  return {
    birthDateTime: birthDate,
    trueSolarTime: date,
    longitude,
    latitude,
    mingPalaceBranch,
    mingPalaceStation: mingStation.name,
    mingMansion: mingMansionInfo.mansion.fullName,
    shenPalaceBranch,
    planets,
    palaces,
    mansions: TWENTY_EIGHT_MANSIONS,
    fourStarRelations,
    aspects,
    verdict,
  };
}

/**
 * 輔助計算太陽黃經
 */
function calculateSunDegree(days: number): number {
  const L = (280.46646 + days * 0.9856474) % 360;
  const g = ((357.52911 + days * 0.9856003) * Math.PI) / 180;
  const lambda = L + 1.914602 * Math.sin(g) + 0.019993 * Math.sin(2 * g);
  return (lambda + 360) % 360;
}

/**
 * 輔助計算月亮黃經
 */
function calculateMoonDegree(days: number): number {
  const L = (218.316 + 13.176396 * days) % 360;
  const M = ((134.963 + 13.064993 * days) * Math.PI) / 180;
  const lambda = L + 6.289 * Math.sin(M);
  return (lambda + 360) % 360;
}

/**
 * 判定星曜廟旺平陷
 */
function determineStarStatus(star: QizhengPlanetName, branch: string): string {
  const exaltations: Record<QizhengPlanetName, string[]> = {
    太陽: ['午', '巳', '卯'],
    太陰: ['未', '酉', '子'],
    歲星: ['寅', '亥', '卯'],
    熒惑: ['卯', '戌', '巳'],
    填星: ['子', '丑', '辰'],
    太白: ['辰', '酉', '丑'],
    辰星: ['申', '巳', '辰'],
    羅睺: ['戌', '午'],
    計都: ['丑', '未'],
    月孛: ['子', '亥'],
    紫氣: ['寅', '卯'],
  };

  const fallMap: Record<QizhengPlanetName, string[]> = {
    太陽: ['子', '亥'],
    太陰: ['辰', '戌'],
    歲星: ['申', '酉'],
    熒惑: ['子', '丑'],
    填星: ['寅', '卯'],
    太白: ['午', '巳'],
    辰星: ['戌', '亥'],
    羅睺: ['辰', '巳'],
    計都: ['申', '酉'],
    月孛: ['午', '未'],
    紫氣: ['申', '酉'],
  };

  if (exaltations[star]?.includes(branch)) return '廟旺';
  if (fallMap[star]?.includes(branch)) return '陷弱';
  return '和平';
}

/**
 * 計算恩難仇用四星
 */
function calculateFourStarRelations(
  rulerStar: QizhengPlanetName,
  elem: '木' | '火' | '土' | '金' | '水'
) {
  const genMap: Record<string, '木' | '火' | '土' | '金' | '水'> = {
    木: '水',
    火: '木',
    土: '火',
    金: '土',
    水: '金',
  };
  const restMap: Record<string, '木' | '火' | '土' | '金' | '水'> = {
    木: '金',
    火: '水',
    土: '木',
    金: '火',
    水: '土',
  };
  const useMap: Record<string, '木' | '火' | '土' | '金' | '水'> = {
    木: '火',
    火: '土',
    土: '金',
    金: '水',
    水: '木',
  };

  const elemToStar: Record<string, QizhengPlanetName> = {
    木: '歲星',
    火: '熒惑',
    土: '填星',
    金: '太白',
    水: '辰星',
  };

  return {
    rulerStar,
    generativeStar: elemToStar[genMap[elem]], // 生我者為恩
    restrainingStar: elemToStar[restMap[elem]], // 剋我者為難
    hatefulStar: elemToStar[genMap[restMap[elem]]], // 生助剋我者為仇
    usefulStar: elemToStar[useMap[elem]], // 我生者為用
  };
}

/**
 * 檢測星曜會照
 */
function calculateQizhengAspects(planets: QizhengPlanetPosition[]) {
  const aspects: QizhengChart['aspects'] = [];
  const ORB = 7.0;

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      const diff = Math.abs(p1.eclipticDegree - p2.eclipticDegree);
      const angle = diff > 180 ? 360 - diff : diff;

      if (angle <= ORB) {
        aspects.push({
          planetA: p1.name,
          planetB: p2.name,
          type: '同宮',
          degreeDiff: Math.round(angle * 10) / 10,
          description: `${p1.name} 與 ${p2.name} 於黃道同宮相交，氣機互融共振。`,
        });
      } else if (Math.abs(angle - 180) <= ORB) {
        aspects.push({
          planetA: p1.name,
          planetB: p2.name,
          type: '對照',
          degreeDiff: Math.round(Math.abs(angle - 180) * 10) / 10,
          description: `${p1.name} 與 ${p2.name} 正對照會，陰陽張力相抗。`,
        });
      } else if (Math.abs(angle - 120) <= ORB) {
        aspects.push({
          planetA: p1.name,
          planetB: p2.name,
          type: '三方會照',
          degreeDiff: Math.round(Math.abs(angle - 120) * 10) / 10,
          description: `${p1.name} 與 ${p2.name} 三合拱照，吉曜相資助益甚巨。`,
        });
      } else if (Math.abs(angle - 90) <= ORB) {
        aspects.push({
          planetA: p1.name,
          planetB: p2.name,
          type: '四正刑衝',
          degreeDiff: Math.round(Math.abs(angle - 90) * 10) / 10,
          description: `${p1.name} 與 ${p2.name} 四正交刑，行事需防破折。`,
        });
      }
    }
  }
  return aspects;
}

/**
 * 生成七政四餘斷語
 */
function generateQizhengVerdict(
  station: string,
  branch: string,
  mansion: string,
  ruler: QizhengPlanetName,
  palaces: QizhengPalace[],
  planets: QizhengPlanetPosition[]
) {
  const guanlu = palaces.find((p) => p.name === '官祿');
  const caibo = palaces.find((p) => p.name === '財帛');

  return {
    lifeOverview: `命宮立於「${station}」之次（${branch}宮），命度引照「${mansion}」，由「${ruler}」司命執權。主心性明朗，重信守諾，得天地正氣之滋養。`,
    careerAndWealth: `官祿宮居「${guanlu?.stationName}」，財帛宮拱照「${caibo?.stationName}」。吉曜臨財官之位，經商或仕途皆能憑藉厚德基業徐圖進取，晚景豐隆。`,
    marriageAndRelations: `夫妻宮得位，三方不見重煞相刑，情感深沉而耐久。唯需留意太陰太陽光譜平衡，莫以剛克柔，相敬如賓自能白首齊眉。`,
    spiritualAdvice: `天星以清貴為吉，四餘以清純為尊。日常宜靜心涵養浩然之氣，遇事順應星辰循軌之度，自有天神冥冥護佑。`,
  };
}
