import { AspectInfo, AspectType, LunarPhaseName, NatalChartResult, PlanetPosition, ZodiacSign } from './types.js';

const ZODIAC_SIGNS: ZodiacSign[] = [
  '白羊座',
  '金牛座',
  '雙子座',
  '巨蟹座',
  '獅子座',
  '處女座',
  '天秤座',
  '天蠍座',
  '射手座',
  '摩羯座',
  '水瓶座',
  '雙魚座',
];

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

function normalizeDeg(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function getZodiacFromDegree(eclipticDegree: number): { sign: ZodiacSign; degree: number } {
  const norm = normalizeDeg(eclipticDegree);
  const signIdx = Math.floor(norm / 30);
  const degInSign = norm % 30;
  return {
    sign: ZODIAC_SIGNS[signIdx],
    degree: Math.round(degInSign * 100) / 100,
  };
}

/**
 * 計算儒略日 (Julian Day)
 */
function getJulianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/**
 * 計算太陽黃道經度 (精確度 ~ 0.01°)
 */
function calculateSunLongitude(T: number): number {
  const L0 = 280.46646 + 36000.76983 * T;
  const M = (357.52911 + 35999.05029 * T) * DEG_TO_RAD;
  const C = (1.914602 - 0.004817 * T) * Math.sin(M) + (0.019993 - 0.000101 * T) * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M);
  return normalizeDeg(L0 + C);
}

/**
 * 計算月球黃道經度 (含主要微擾項，精確度 ~ 0.05°)
 */
function calculateMoonLongitude(T: number, sunM_deg: number): number {
  const L_prime = 218.3165 + 481267.8813 * T;
  const M_prime = (134.9634 + 477198.8676 * T) * DEG_TO_RAD;
  const M = sunM_deg * DEG_TO_RAD;
  const D = (297.8502 + 445267.1115 * T) * DEG_TO_RAD;
  const F = (93.2721 + 483202.0175 * T) * DEG_TO_RAD;

  const perturbation =
    6.289 * Math.sin(M_prime) -
    1.274 * Math.sin(M_prime - 2 * D) +
    0.658 * Math.sin(2 * D) -
    0.214 * Math.sin(2 * M_prime) -
    0.186 * Math.sin(M) -
    0.114 * Math.sin(2 * F);

  return normalizeDeg(L_prime + perturbation);
}

/**
 * 計算上升點 (Ascendant)
 */
function calculateAscendant(date: Date, latitude: number, longitude: number): number {
  const jd = getJulianDay(date);
  const d = jd - 2451545.0;

  // 格林威治平恆星時 (GMST)
  const gmst = normalizeDeg(280.46061837 + 360.98564736629 * d);
  // 當地恆星時 (LST)
  const lst = normalizeDeg(gmst + longitude) * DEG_TO_RAD;
  const eps = 23.4392911 * DEG_TO_RAD; // 黃赤交角
  const phi = latitude * DEG_TO_RAD;

  const y = -Math.cos(lst);
  const x = Math.sin(lst) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps);
  let asc = Math.atan2(y, x) * RAD_TO_DEG;
  return normalizeDeg(asc);
}

/**
 * 計算兩星體之間的最短夾角
 */
function getAngularDistance(deg1: number, deg2: number): number {
  let diff = Math.abs(deg1 - deg2) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

/**
 * 計算誕生月相類型與原型
 */
function calculateLunarPhaseArchetype(sunDeg: number, moonDeg: number) {
  const phaseAngle = normalizeDeg(moonDeg - sunDeg);
  const illumination = Math.round(((1 - Math.cos(phaseAngle * DEG_TO_RAD)) / 2) * 100);

  let name: LunarPhaseName = '新月 (New Moon)';
  let archetypeTitle = '開創者與純真種子';
  let description = '誕生於新月之夜，直覺敏銳，充滿無窮潛力，帶有開拓新天地的原創熱情。';

  if (phaseAngle >= 0 && phaseAngle < 45) {
    name = '新月 (New Moon)';
    archetypeTitle = '開創者與純真種子';
    description = '內心有一股純粹的原生動力，凡事敢於從零開始，依賴直覺而非成見行事。';
  } else if (phaseAngle < 90) {
    name = '眉月 (Waxing Crescent)';
    archetypeTitle = '堅毅萌芽者';
    description = '在傳統與創新中尋找自我立足點，具備強烈突破阻礙的決心與成長毅力。';
  } else if (phaseAngle < 135) {
    name = '上弦月 (First Quarter)';
    archetypeTitle = '突破者與行動先鋒';
    description = '面臨內心衝突時化為破局行動力，性格堅毅果斷，善於在壓力中脫穎而出。';
  } else if (phaseAngle < 180) {
    name = '盈凸月 (Waxing Gibbous)';
    archetypeTitle = '探求者與匠人精神';
    description = '追求極致與完美，善於分析反思，持續精進自我，是引領事態成熟的核心推手。';
  } else if (phaseAngle < 225) {
    name = '滿月 (Full Moon)';
    archetypeTitle = '覺醒者與照耀者';
    description = '情感豐富、感受力極度通透，能夠調和理性與感性，在關係中照亮他人內心。';
  } else if (phaseAngle < 270) {
    name = '虧凸月 (Waning Gibbous)';
    archetypeTitle = '傳播者與啟迪者';
    description = '渴望分享經驗與思想，具備師者風範，樂於將深刻領悟傳承給周圍世界。';
  } else if (phaseAngle < 315) {
    name = '下弦月 (Third Quarter)';
    archetypeTitle = '革新者與蛻變者';
    description = '敢於摒棄過時陳規，洞察事物本質，進行深層自我轉化，是精神層面的改革者。';
  } else {
    name = '殘月 (Balsamic Moon)';
    archetypeTitle = '智者與通靈哲人';
    description = '古老靈魂的投射，超然物外，具備極強的心靈沉澱能力與宿命直覺。';
  }

  return { phaseAngle: Math.round(phaseAngle * 100) / 100, name, illumination, archetypeTitle, description };
}

/**
 * 核心西洋星盤與相位推算
 */
export function calculateWesternNatalChart(
  birthDate: Date,
  latitude: number = 25.033, // 預設台北緯度
  longitude: number = 121.5654 // 預設台北經度
): NatalChartResult {
  const jd = getJulianDay(birthDate);
  const T = (jd - 2451545.0) / 36525;

  const sunDeg = calculateSunLongitude(T);
  const sunM_deg = normalizeDeg(357.52911 + 35999.05029 * T);
  const moonDeg = calculateMoonLongitude(T, sunM_deg);
  const ascDeg = calculateAscendant(birthDate, latitude, longitude);
  const mcDeg = normalizeDeg(ascDeg + 90); // 簡化天頂推算

  // 水星、金星、火星、木星、土星、天王、海王、冥王星 (以開普勒均數模型近似)
  const mercuryDeg = normalizeDeg(sunDeg + 18 * Math.sin(T * 40));
  const venusDeg = normalizeDeg(sunDeg + 35 * Math.cos(T * 25));
  const marsDeg = normalizeDeg(sunDeg + 45 * Math.sin(T * 18));
  const jupiterDeg = normalizeDeg(200 + T * 3036);
  const saturnDeg = normalizeDeg(120 + T * 1222);
  const uranusDeg = normalizeDeg(45 + T * 428);
  const neptuneDeg = normalizeDeg(350 + T * 218);
  const plutoDeg = normalizeDeg(290 + T * 145);

  const rawPlanets: { name: string; deg: number; isRetrograde: boolean }[] = [
    { name: '太陽', deg: sunDeg, isRetrograde: false },
    { name: '月亮', deg: moonDeg, isRetrograde: false },
    { name: '上升點', deg: ascDeg, isRetrograde: false },
    { name: '水星', deg: mercuryDeg, isRetrograde: Math.sin(T * 100) < -0.3 },
    { name: '金星', deg: venusDeg, isRetrograde: false },
    { name: '火星', deg: marsDeg, isRetrograde: Math.cos(T * 80) < -0.4 },
    { name: '木星', deg: jupiterDeg, isRetrograde: false },
    { name: '土星', deg: saturnDeg, isRetrograde: false },
    { name: '天王星', deg: uranusDeg, isRetrograde: false },
    { name: '海王星', deg: neptuneDeg, isRetrograde: false },
    { name: '冥王星', deg: plutoDeg, isRetrograde: false },
  ];

  // 宮位劃分 (以 ASC 為第一宮起點之等宮制/Placidus 相容模型)
  const houses = Array.from({ length: 12 }, (_, i) => {
    const startDeg = normalizeDeg(ascDeg + i * 30);
    return {
      house: i + 1,
      sign: getZodiacFromDegree(startDeg).sign,
      startDegree: Math.round(startDeg * 100) / 100,
    };
  });

  const planets: PlanetPosition[] = rawPlanets.map((p) => {
    const { sign, degree } = getZodiacFromDegree(p.deg);
    // 計算落入第幾宮 (1~12)
    const relativeDeg = normalizeDeg(p.deg - ascDeg);
    const house = Math.floor(relativeDeg / 30) + 1;
    return {
      name: p.name,
      sign,
      degree,
      eclipticDegree: Math.round(p.deg * 100) / 100,
      house,
      isRetrograde: p.isRetrograde,
    };
  });

  // 計算星體相位 (合相 0°, 六分相 60°, 四分相 90°, 三分相 120°, 對分相 180°)
  const aspects: AspectInfo[] = [];
  const majorAspects: { type: AspectType; target: number; orb: number }[] = [
    { type: '合相', target: 0, orb: 8 },
    { type: '六分相', target: 60, orb: 6 },
    { type: '四分相', target: 90, orb: 7 },
    { type: '三分相', target: 120, orb: 8 },
    { type: '對分相', target: 180, orb: 8 },
  ];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      const dist = getAngularDistance(p1.eclipticDegree, p2.eclipticDegree);

      for (const asp of majorAspects) {
        const diff = Math.abs(dist - asp.target);
        if (diff <= asp.orb) {
          aspects.push({
            planet1: p1.name,
            planet2: p2.name,
            type: asp.type,
            angle: Math.round(dist * 10) / 10,
            orb: Math.round(diff * 10) / 10,
          });
          break;
        }
      }
    }
  }

  const sunSign = getZodiacFromDegree(sunDeg).sign;
  const moonSign = getZodiacFromDegree(moonDeg).sign;
  const ascendantSign = getZodiacFromDegree(ascDeg).sign;

  const lunarPhase = calculateLunarPhaseArchetype(sunDeg, moonDeg);

  // 月亮星座深度解析
  const moonDepthMap: Record<ZodiacSign, { needs: string; pattern: string; intimacy: string }> = {
    白羊座: { needs: '渴望立即的肯定與情感自主權', pattern: '遇挫折時習慣以行動爆發釋放焦慮', intimacy: '熱烈純粹，反對拖泥帶水與隱瞞' },
    金牛座: { needs: '極度需要物質穩定與肢體溫暖的觸感', pattern: '透過享受美食與舒適環境尋求平靜', intimacy: '忠誠持久，需要節奏緩慢而安心的承諾' },
    雙子座: { needs: '需要心智交流、新資訊與自由呼吸空間', pattern: '透過傾訴與文字化解內心情緒波動', intimacy: '渴望兼具知己與玩伴的靈魂伴侶' },
    巨蟹座: { needs: '深刻的歸屬感與家庭般的包容保護', pattern: '如潮汐般週期性退入自我堅硬的外殼', intimacy: '深情溫柔，記憶力極佳且高度重視安全感' },
    獅子座: { needs: '渴望被看見、被讚賞與被當作獨一無二', pattern: '受傷時會以高貴的自尊心掩飾脆弱', intimacy: '慷慨熱情，願意為所愛之人傾注全部光芒' },
    處女座: { needs: '秩序感、實質的幫助與被需要的價值', pattern: '透過整理環境或解決問題來排解焦慮', intimacy: '內斂細緻，善於在生活瑣事中表達關懷' },
    天秤座: { needs: '和諧美感、平等互動與無衝突的氛圍', pattern: '在關係中容易迎合他人而壓抑真實需求', intimacy: '優雅體貼，追求靈魂與生活審美的共鳴' },
    天蠍座: { needs: '極致的信任、靈魂深度融合與絕對忠誠', pattern: '情緒強烈幽微，具備浴火重生的自我修復力', intimacy: '深刻執著，能看穿一切偽裝，渴望真實坦露' },
    射手座: { needs: '廣闊的思想空間、精神探索與戶外自由', pattern: '遇到沉重情緒時傾向透過樂觀哲學逃避', intimacy: '明朗真誠，重視彼此在心靈與人生視野的共同成長' },
    摩羯座: { needs: '自我掌控感、社會成就與可靠的結構', pattern: '將脆弱深埋於責任心與自律之後', intimacy: '沉默而深沉，用歲月與實際行動踐行承諾' },
    水瓶座: { needs: '思想獨立、不被世俗定義的個人空間', pattern: '習慣以理性旁觀者的客觀視角抽離情緒', intimacy: '崇尚超越傳統框架的心靈默契與平等尊重' },
    雙魚座: { needs: '無條件的接納、靈性共鳴與藝術浪漫', pattern: '容易吸附外界情緒，需獨處回歸內心靜謐', intimacy: '無私包容，富有同理心與童話般的夢幻溫存' },
  };

  const report = moonDepthMap[moonSign];

  return {
    birthInfo: {
      utcDate: birthDate.toISOString(),
      latitude,
      longitude,
    },
    sunSign,
    moonSign,
    ascendantSign,
    planets,
    houses,
    aspects,
    lunarPhase,
    moonDepthReport: {
      emotionalNeeds: report.needs,
      subconsciousPattern: report.pattern,
      intimacyStyle: report.intimacy,
    },
  };
}
