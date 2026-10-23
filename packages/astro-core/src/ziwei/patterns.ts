/**
 * 紫微斗數格局識別引擎（繁體中文正統三合派版）
 *
 * 遵循倪海廈天紀命相心法與古典三合派法則：
 * 1. 古書條件優先：每個格局列出「必須 / 加分 / 破格」三層結構，出處可考
 * 2. 倪師立場：大道至簡，不使用宮干自化、飛星飛來飛去等繁瑣枝節，以命宮為本、三方四正為用
 * 3. 廟旺利陷：以亮度評估吉星發揮與破格機率
 * 4. 三方四正會照：命宮 + 財帛宮 + 官祿宮 + 遷移宮
 * 5. 夾宮：命宮前後相鄰之父母宮與兄弟宮
 *
 * 主要古籍出處：
 *  - 《紫微斗數全集》（陳摶祖師傳，明代刊本）
 *  - 《紫微斗數全書》（羅洪先編，明代刊本）
 *  - 《骨髓賦》《女命骨髓賦》《十二宮諸星得地合格訣》
 *  - 倪海廈《天紀》紫微斗數講義與命相心法
 */

import {
  EarthlyBranch,
  PalaceCell,
  StarInfo,
  TransformationType,
  ZiweiChart,
  ZiweiMingGongSummary,
  ZiweiPattern,
} from './types.js';

// ────────────────── 常量定義 ──────────────────
const BRANCHES: EarthlyBranch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const SHA_NAMES = ['擎羊', '陀羅', '火星', '鈴星', '地空', '地劫'];
const SHA_HARD = ['擎羊', '陀羅', '火星', '鈴星']; // 四煞
const SHA_KONG = ['地空', '地劫']; // 空劫

// ────────────────── 輔助函數 ──────────────────
function getAllStars(palace: PalaceCell): StarInfo[] {
  return [
    ...(palace.majorStars || []),
    ...(palace.luckyStars || []),
    ...(palace.unluckyStars || []),
    ...(palace.minorStars || []),
  ];
}

function getMajorStarNames(palace: PalaceCell): string[] {
  return (palace.majorStars || []).map((s) => s.name);
}

function findStar(palace: PalaceCell, name: string): StarInfo | undefined {
  return getAllStars(palace).find((s) => s.name === name);
}

function hasStar(palace: PalaceCell, name: string): boolean {
  return getAllStars(palace).some((s) => s.name === name);
}

function findStarPalace(chart: ZiweiChart, name: string): PalaceCell | undefined {
  return chart.palacesList.find((p) => hasStar(p, name));
}

function getPalaceByBranch(chart: ZiweiChart, branch: EarthlyBranch): PalaceCell | undefined {
  return chart.palaces[branch];
}

function shaCountInPalace(palace: PalaceCell, list: string[] = SHA_HARD): number {
  return getAllStars(palace).filter((s) => list.includes(s.name)).length;
}

function hasShaInPalace(palace: PalaceCell, list: string[] = SHA_NAMES): boolean {
  return getAllStars(palace).some((s) => list.includes(s.name));
}

function getSanFangPalaces(chart: ZiweiChart): PalaceCell[] {
  return chart.palacesList.filter(
    (p) => p.name === '命宮' || p.name === '財帛宮' || p.name === '官祿宮' || p.name === '遷移宮'
  );
}

function isInSanFang(chart: ZiweiChart, branch: EarthlyBranch): boolean {
  return getSanFangPalaces(chart).some((p) => p.branch === branch);
}

function getDuiGong(chart: ZiweiChart, branch: EarthlyBranch): PalaceCell | undefined {
  const idx = BRANCHES.indexOf(branch);
  const duiIdx = (idx + 6) % 12;
  return chart.palaces[BRANCHES[duiIdx]];
}

function getJiaPalaces(chart: ZiweiChart, branch: EarthlyBranch): { prev?: PalaceCell; next?: PalaceCell } {
  const idx = BRANCHES.indexOf(branch);
  const prevBranch = BRANCHES[(idx - 1 + 12) % 12];
  const nextBranch = BRANCHES[(idx + 1) % 12];
  return {
    prev: chart.palaces[prevBranch],
    next: chart.palaces[nextBranch],
  };
}

function sanFangAllStars(chart: ZiweiChart): Set<string> {
  const set = new Set<string>();
  for (const p of getSanFangPalaces(chart)) {
    for (const s of getAllStars(p)) {
      set.add(s.name);
      if (s.transformation) {
        set.add(`化${s.transformation}`);
      }
    }
  }
  return set;
}

function sanFangShaCount(chart: ZiweiChart, list: string[] = SHA_HARD): number {
  return getSanFangPalaces(chart).reduce((sum, p) => sum + shaCountInPalace(p, list), 0);
}

function isBright(palace: PalaceCell, starName: string): boolean {
  const s = findStar(palace, starName);
  return s?.brightness === '廟' || s?.brightness === '旺';
}

function isDim(palace: PalaceCell, starName: string): boolean {
  const s = findStar(palace, starName);
  return s?.brightness === '陷' || s?.brightness === '不';
}

function getStarSiHua(palace: PalaceCell, starName: string): TransformationType | undefined {
  return findStar(palace, starName)?.transformation;
}

// ────────────────── 正格辨識器 ──────────────────

/** 君臣慶會：紫微入命，左輔右弼同會（同宮或三方） */
function detectJunChenQingHui(chart: ZiweiChart, ming: PalaceCell, patterns: ZiweiPattern[]) {
  if (!hasStar(ming, '紫微')) return;
  const sanFangSet = sanFangAllStars(chart);
  const hasZuo = sanFangSet.has('左輔');
  const hasYou = sanFangSet.has('右弼');
  if (!hasZuo || !hasYou) return;

  const required = ['紫微坐守命宮', '左輔右弼齊會三方四正'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangSet.has('文昌') || sanFangSet.has('文曲')) bonus.push('再會文昌或文曲');
  if (sanFangSet.has('天魁') || sanFangSet.has('天鉞')) bonus.push('天乙貴人魁鉞加照');
  if (getStarSiHua(ming, '紫微') === '權') bonus.push('紫微化權，威權獨重');
  if (sanFangShaCount(chart, SHA_KONG) >= 2) breaking.push('地空地劫雙夾會照（紫微最忌空劫孤君）');

  patterns.push({
    name: '君臣慶會',
    level: breaking.length ? 'good' : 'excellent',
    description:
      '紫微入命，左輔右弼同會，帝王得賢臣輔佐，主大富大貴、統御群倫之命。倪師天紀指出：「紫微最喜左右，如君王得賢相，文武兼備，一生貴人常伴，宜走政商高位或領袖之途。」',
    palaces: ['命宮'],
    conditions: { required, bonus, breaking },
    source: '《紫微斗數全書·君臣慶會格》及倪海廈《天紀》紫微心法',
  });
}

/** 紫府同宮：紫微+天府於命宮（限寅、申宮） */
function detectZiFu(chart: ZiweiChart, ming: PalaceCell, patterns: ZiweiPattern[]) {
  const ziwei = findStarPalace(chart, '紫微');
  const tianfu = findStarPalace(chart, '天府');
  if (!ziwei || !tianfu || ziwei.branch !== tianfu.branch) return;

  const inMing = ziwei.branch === chart.lifePalaceBranch;
  const required = inMing ? ['紫微天府同入命宮（寅申二宮）'] : ['紫微天府同宮（居他宮拱照）'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  const sanFangSet = sanFangAllStars(chart);
  if (sanFangSet.has('左輔') && sanFangSet.has('右弼')) bonus.push('左輔右弼同會');
  if (sanFangSet.has('文昌') || sanFangSet.has('文曲')) bonus.push('再會昌曲');
  if (hasShaInPalace(ziwei, SHA_KONG)) breaking.push('紫府宮坐地空地劫（破帝庫之貴氣）');
  if (shaCountInPalace(ziwei, SHA_HARD) >= 2) breaking.push('紫府宮見雙煞同坐');

  patterns.push({
    name: '紫府同宮',
    level: inMing && !breaking.length ? 'excellent' : 'good',
    description: inMing
      ? '紫微天府同入命宮，帝星與財庫並臨，尊貴之局。品行端正、衣食無憂、具備卓絕之領導魄力。古書云：「紫府同宮，終身福厚」，需輔弼文曜配合方成頂格。'
      : '紫微天府同宮拱照命盤，主一生有強大貴人貴氣寄託，需參詳三方吉煞斷其發越程度。',
    palaces: [ziwei.name],
    conditions: { required, bonus, breaking },
    source: '《紫微斗數全書·紫府同宮格》',
  });
}

/** 府相朝垣：天府、天相分別坐守命宮的三方四正 */
function detectFuXiangChaoYuan(chart: ZiweiChart, ming: PalaceCell, patterns: ZiweiPattern[]) {
  const tianfu = findStarPalace(chart, '天府');
  const tianxiang = findStarPalace(chart, '天相');
  if (!tianfu || !tianxiang) return;
  if (!isInSanFang(chart, tianfu.branch) || !isInSanFang(chart, tianxiang.branch)) return;
  if (tianfu.branch === chart.lifePalaceBranch && tianxiang.branch === chart.lifePalaceBranch) return;
  if (tianfu.branch === tianxiang.branch) return;

  const required = ['天府坐命宮三方', '天相坐命宮三方', '二星分垣不相犯'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (hasStar(ming, '祿存') || sanFangAllStars(chart).has('化祿')) bonus.push('見祿存或化祿');
  if (sanFangAllStars(chart).has('左輔')) bonus.push('再會左輔');
  if (hasShaInPalace(ming, SHA_HARD)) breaking.push('命宮坐煞星');
  if (sanFangShaCount(chart, SHA_HARD) >= 3) breaking.push('三方四正煞星交加');

  patterns.push({
    name: '府相朝垣',
    level: breaking.length ? 'good' : 'excellent',
    description:
      '天府天相分守命宮三方四正，文武並濟、權印雙輝。古書云：「府相朝垣千鍾食祿」，象徵一生食祿豐足、地位清顯，極利政界、現代高階企管及法治樞紐。',
    palaces: [tianfu.name, tianxiang.name],
    conditions: { required, bonus, breaking },
    source: '《紫微斗數全書·府相朝垣格》',
  });
}

/** 陽梁昌祿：太陽+天梁+文昌+祿存四星齊會命宮三方，登科甲第大貴格 */
function detectYangLiangChangLu(chart: ZiweiChart, ming: PalaceCell, patterns: ZiweiPattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (
    !sanFangSet.has('太陽') ||
    !sanFangSet.has('天梁') ||
    !sanFangSet.has('文昌') ||
    !sanFangSet.has('祿存')
  ) {
    return;
  }

  const sun = findStarPalace(chart, '太陽')!;
  const liang = findStarPalace(chart, '天梁')!;
  const required = ['太陽會命宮三方', '天梁會命宮三方', '文昌會命宮三方', '祿存會命宮三方'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (isBright(sun, '太陽')) bonus.push('太陽廟旺朝天');
  if (isBright(liang, '天梁')) bonus.push('天梁蔭星廟旺');
  if (sanFangSet.has('化科')) bonus.push('再會化科名揚四海');
  if (isDim(sun, '太陽')) breaking.push('太陽落陷（陽梁失輝）');
  if (sanFangShaCount(chart, SHA_HARD) >= 2) breaking.push('三方煞曜較重');

  patterns.push({
    name: '陽梁昌祿',
    level: breaking.length ? 'good' : 'excellent',
    description:
      '太陽、天梁、文昌、祿存四星齊會三方四正，號稱「第一科甲之星」。主清貴顯達、考運極佳，宜學術深造、國家文官、法官、權威認證或專業研發，一生功名易就。',
    palaces: [sun.name, liang.name],
    conditions: { required, bonus, breaking },
    source: '《紫微斗數全書·陽梁昌祿格》',
  });
}

/** 火貪格 / 鈴貪格：貪狼+火星 或 貪狼+鈴星 同宮或會照（橫發富格） */
function detectHuoTanLingTan(chart: ZiweiChart, ming: PalaceCell, patterns: ZiweiPattern[]) {
  const tan = findStarPalace(chart, '貪狼');
  if (!tan) return;
  const huo = findStarPalace(chart, '火星');
  const ling = findStarPalace(chart, '鈴星');

  for (const [shaName, shaPalace] of [
    ['火星', huo],
    ['鈴星', ling],
  ] as const) {
    if (!shaPalace) continue;
    const tanIdx = BRANCHES.indexOf(tan.branch);
    const shaIdx = BRANCHES.indexOf(shaPalace.branch);
    const sameOrTrine =
      tanIdx === shaIdx ||
      (tanIdx + 4) % 12 === shaIdx ||
      (tanIdx + 8) % 12 === shaIdx ||
      (tanIdx + 6) % 12 === shaIdx;
    if (!sameOrTrine) continue;
    if (!isInSanFang(chart, tan.branch)) continue;

    const required = [`貪狼${tan.branch === shaPalace.branch ? '同宮' : '會照'}${shaName}`, '貪狼入命宮三方四正'];
    const bonus: string[] = [];
    const breaking: string[] = [];
    if (isBright(tan, '貪狼')) bonus.push('貪狼廟旺');
    if (getStarSiHua(tan, '貪狼') === '祿' || getStarSiHua(tan, '貪狼') === '權') bonus.push('貪狼化祿或化權');
    if (hasShaInPalace(tan, ['擎羊', '陀羅'])) breaking.push('貪狼宮又見羊陀刑煞（破橫發之局）');
    if (hasShaInPalace(tan, SHA_KONG)) breaking.push('貪狼遇地空地劫（財來財去成空）');

    const patternName = shaName === '火星' ? '火貪格' : '鈴貪格';
    patterns.push({
      name: patternName,
      level: breaking.length ? 'good' : 'excellent',
      description: `貪狼遇${shaName}${tan.branch === shaPalace.branch ? '同度' : '三方會照'}，主突發橫財、商機湧現。倪師天紀指出：「貪狼遇火鈴主橫發，開拓力極強，唯需居安思危、見好就收，方能守成傳承。」`,
      palaces: [tan.name, shaPalace.name],
      conditions: { required, bonus, breaking },
      source: '《紫微斗數骨髓賦》及倪海廈《天紀》',
    });
  }
}

/** 武貪格：武曲+貪狼 同宮（丑、未） 或 對照 */
function detectWuTan(chart: ZiweiChart, ming: PalaceCell, patterns: ZiweiPattern[]) {
  const wu = findStarPalace(chart, '武曲');
  const tan = findStarPalace(chart, '貪狼');
  if (!wu || !tan) return;
  const wuIdx = BRANCHES.indexOf(wu.branch);
  const tanIdx = BRANCHES.indexOf(tan.branch);
  const sameOrOppose = wuIdx === tanIdx || (wuIdx + 6) % 12 === tanIdx;
  if (!sameOrOppose) return;
  if (!isInSanFang(chart, wu.branch) && !isInSanFang(chart, tan.branch)) return;

  const required = [
    wu.branch === tan.branch ? '武曲貪狼同宮（丑未二宮）' : '武曲貪狼對宮拱照',
    '會照命宮三方四正',
  ];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangAllStars(chart).has('火星') || sanFangAllStars(chart).has('鈴星')) {
    bonus.push('再遇火星或鈴星（武貪疊加火貪鈴貪）');
  }
  if (getStarSiHua(wu, '武曲') === '祿') bonus.push('武曲化祿，正財源源不絕');
  if (hasShaInPalace(wu, ['擎羊', '陀羅'])) breaking.push('武貪宮逢羊陀糾纏');
  if (hasShaInPalace(wu, SHA_KONG)) breaking.push('武貪宮遇空劫阻截');

  patterns.push({
    name: '武貪格',
    level: breaking.length ? 'good' : 'excellent',
    description:
      '武曲貪狼會照命盤，財星與慾望開創之星交輝。古書云：「武貪不發少年人」，三十歲前宜蓄力沉潛、廣納人脈；中年後厚積薄發，於金融商務、實業投資大展宏圖。',
    palaces: [wu.name, tan.name],
    conditions: { required, bonus, breaking },
    source: '《紫微斗數骨髓賦》',
  });
}

/** 殺破狼：七殺、破軍、貪狼三方齊聚 */
function detectShaPoLang(chart: ZiweiChart, ming: PalaceCell, patterns: ZiweiPattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  const has = ['七殺', '破軍', '貪狼'].filter((s) => sanFangSet.has(s));
  if (has.length < 3) return;

  const required = ['七殺、破軍、貪狼三星齊聚命宮三方四正'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangSet.has('化祿') || sanFangSet.has('化權')) bonus.push('三方見化祿或化權，動得有力');
  if (sanFangSet.has('左輔') && sanFangSet.has('右弼')) bonus.push('輔弼同會，開拓中有強大貴人助力');
  if (sanFangShaCount(chart, SHA_HARD) >= 3) breaking.push('煞星過多，易動盪折騰無成');
  if (hasShaInPalace(ming, SHA_KONG)) breaking.push('命坐空劫，開拓歷程加倍辛勞');

  patterns.push({
    name: '殺破狼',
    level: breaking.length ? 'caution' : 'good',
    description:
      '七殺、破軍、貪狼齊會命盤三方，象徵人生大開大闔、突破常規之開創之命。倪師指出：「殺破狼三星必定同在三方，主動態求變、不甘平凡，最利創業經商與前線開拓，中年後方能守成。」',
    palaces: getSanFangPalaces(chart)
      .filter((p) => has.includes(getMajorStarNames(p)[0]))
      .map((p) => p.name),
    conditions: { required, bonus, breaking },
    source: '《紫微斗數全書·殺破狼》及倪海廈《天紀》',
  });
}

/** 機月同梁：天機、太陰、天同、天梁四星齊入命遷財官 */
function detectJiYueTongLiang(chart: ZiweiChart, ming: PalaceCell, patterns: ZiweiPattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  const has = ['天機', '太陰', '天同', '天梁'].filter((s) => sanFangSet.has(s));
  if (has.length < 4) return;

  const required = ['天機、太陰、天同、天梁四星齊會命宮三方四正'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangSet.has('文昌') || sanFangSet.has('文曲')) bonus.push('再會昌曲，文質雙馨');
  if (sanFangSet.has('化科')) bonus.push('見化科主聲譽清隆');
  if (sanFangShaCount(chart, SHA_HARD) >= 3) breaking.push('煞星交會過多（機月同梁最忌煞刑衝）');
  if (hasShaInPalace(ming, SHA_HARD)) breaking.push('命宮坐煞曜');

  patterns.push({
    name: '機月同梁',
    level: breaking.length ? 'good' : 'excellent',
    description:
      '天機、太陰、天同、天梁四星齊會三方四正，溫良文雅、智計深遠。古書云：「機月同梁做吏人」，極適合公職、文教、學術研究、醫療衛生及大型企業幕僚策劃，宜穩健積累，不宜盲目冒險投機。',
    palaces: getSanFangPalaces(chart)
      .filter((p) => has.some((s) => getMajorStarNames(p).includes(s)))
      .map((p) => p.name),
    conditions: { required, bonus, breaking },
    source: '《紫微斗數全書·機月同梁格》',
  });
}

/** 廉貞天相：同宮 */
function detectLianXiang(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const lian = findStarPalace(chart, '廉貞');
  const xiang = findStarPalace(chart, '天相');
  if (!lian || !xiang || lian.branch !== xiang.branch) return;

  const inMing = lian.branch === chart.lifePalaceBranch;
  const required = ['廉貞天相同宮'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (hasStar(lian, '祿存') || getStarSiHua(lian, '廉貞') === '祿') bonus.push('見祿存或廉貞化祿');
  if (sanFangAllStars(chart).has('左輔')) bonus.push('左輔會照');
  if (hasShaInPalace(lian, ['擎羊'])) breaking.push('廉相宮坐擎羊（廉相遇羊傾向刑杖官非）');
  if (getStarSiHua(lian, '廉貞') === '忌') breaking.push('廉貞化忌');

  patterns.push({
    name: '廉貞天相格',
    level: breaking.length ? 'caution' : inMing ? 'good' : 'neutral',
    description:
      '廉貞天相同宮，印綬合局，主處事秉公、條理嚴明、清廉正直。宜任公職行政、司法法務、審計及高階企劃。若逢擎羊化忌則宜慎防合同文券官非。',
    palaces: [lian.name],
    conditions: { required, bonus, breaking },
    source: '《紫微斗數全書》',
  });
}

/** 武曲七殺：同宮，將星配財星 */
function detectWuQiSha(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const wu = findStarPalace(chart, '武曲');
  const qi = findStarPalace(chart, '七殺');
  if (!wu || !qi || wu.branch !== qi.branch) return;

  const inMing = wu.branch === chart.lifePalaceBranch;
  const required = ['武曲七殺同宮於卯酉'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (getStarSiHua(wu, '武曲') === '權') bonus.push('武曲化權');
  if (getStarSiHua(wu, '武曲') === '祿') bonus.push('武曲化祿');
  if (getStarSiHua(wu, '武曲') === '忌') breaking.push('武曲化忌（主財帛劫難之兆）');
  if (shaCountInPalace(wu, SHA_HARD) >= 1) breaking.push('武殺同宮逢煞星');

  patterns.push({
    name: '武曲七殺',
    level: breaking.length ? 'caution' : inMing ? 'excellent' : 'good',
    description:
      '武曲七殺同宮，將星配財星，行事剛毅果決、魄力過人。最宜金融創投、軍警安防或企業開創。若無凶煞衝破，主歷經考驗而立下大功業。',
    palaces: [wu.name],
    conditions: { required, bonus, breaking },
    source: '《紫微斗數全書》',
  });
}

/** 天同天梁：同宮 */
function detectTongLiang(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const tong = findStarPalace(chart, '天同');
  const liang = findStarPalace(chart, '天梁');
  if (!tong || !liang || tong.branch !== liang.branch) return;

  const required = ['天同天梁同宮（寅申二宮）'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangAllStars(chart).has('文昌')) bonus.push('文昌會照');
  if (getStarSiHua(tong, '天同') === '祿') bonus.push('天同化祿');
  if (hasShaInPalace(tong, SHA_HARD)) breaking.push('煞星同坐折福');

  patterns.push({
    name: '天同天梁格',
    level: breaking.length ? 'neutral' : 'good',
    description:
      '天同天梁同宮，福星與蔭星相聚，主寬仁厚道、德厚流光、逢凶化吉。宜醫療慈善、文教傳播與公益事業，性情溫良中正。',
    palaces: [tong.name],
    conditions: { required, bonus, breaking },
    source: '《紫微斗數全書》',
  });
}

/** 日月同宮：太陽太陰丑或未宮同宮 */
function detectRiYueTongGong(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const sun = findStarPalace(chart, '太陽');
  const moon = findStarPalace(chart, '太陰');
  if (!sun || !moon || sun.branch !== moon.branch) return;
  if (sun.branch !== '丑' && sun.branch !== '未') return;

  const inMing = sun.branch === chart.lifePalaceBranch;
  const required = [`太陽太陰同入${sun.branch}宮`];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sun.branch === '未') bonus.push('未宮日月同輝，古書讚未宮日月雙美');
  if (sanFangAllStars(chart).has('文昌') && sanFangAllStars(chart).has('文曲')) bonus.push('昌曲齊照');
  if (hasShaInPalace(sun, SHA_HARD)) breaking.push('日月宮逢煞星同坐');

  patterns.push({
    name: '日月同宮',
    level: breaking.length ? 'good' : inMing ? 'excellent' : 'good',
    description: `太陽太陰於${sun.branch}宮同宮，陰陽平衡、文武兼資。異性緣佳、處事周全。未宮日月雙美尤佳，丑宮則偏陰柔收斂。`,
    palaces: [sun.name],
    conditions: { required, bonus, breaking },
    source: '《紫微斗數全書·日月同宮格》',
  });
}

/** 日月夾命：太陽太陰在命宮前後兩宮 */
function detectRiYueJiaMing(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.lifePalaceBranch);
  if (!prev || !next) return;
  const prevHasSun = hasStar(prev, '太陽');
  const prevHasMoon = hasStar(prev, '太陰');
  const nextHasSun = hasStar(next, '太陽');
  const nextHasMoon = hasStar(next, '太陰');
  const ok = (prevHasSun && nextHasMoon) || (prevHasMoon && nextHasSun);
  if (!ok) return;

  const sunPalace = prevHasSun ? prev : next;
  const moonPalace = prevHasMoon ? prev : next;
  const required = ['太陽太陰分居命宮前後兩宮（父母、兄弟宮）'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (isBright(sunPalace, '太陽')) bonus.push('太陽廟旺');
  if (isBright(moonPalace, '太陰')) bonus.push('太陰廟旺');
  if (isDim(sunPalace, '太陽') || isDim(moonPalace, '太陰')) breaking.push('日月落陷（夾命無光）');

  patterns.push({
    name: '日月夾命',
    level: breaking.length ? 'good' : 'excellent',
    description:
      '太陽太陰分居命宮兩側夾護，光明磊落、照臨無私。主平生多得父母長輩庇蔭與貴人扶助，男主官貴清顯，女主旺夫持家。',
    palaces: [sunPalace.name, moonPalace.name],
    conditions: { required, bonus, breaking },
    source: '《紫微斗數全書·日月夾命》',
  });
}

/** 巨日同宮：巨門太陽同入寅或申 */
function detectJuRiTongGong(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const ju = findStarPalace(chart, '巨門');
  const sun = findStarPalace(chart, '太陽');
  if (!ju || !sun || ju.branch !== sun.branch) return;
  if (ju.branch !== '寅' && ju.branch !== '申') return;

  const inMing = ju.branch === chart.lifePalaceBranch;
  const required = [`巨門太陽同入${ju.branch}宮`];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (ju.branch === '寅') bonus.push('寅宮太陽旭日東昇，巨門暗曜盡除');
  if (getStarSiHua(ju, '巨門') === '祿' || getStarSiHua(ju, '巨門') === '權') {
    bonus.push('巨門化祿或化權（以口才專業生財）');
  }
  if (getStarSiHua(ju, '巨門') === '忌') breaking.push('巨門化忌（口舌官非之憂）');
  if (ju.branch === '申') breaking.push('申宮太陽日薄西山，力道稍遜');

  patterns.push({
    name: '巨日同宮',
    level: breaking.length ? 'caution' : inMing && ju.branch === '寅' ? 'excellent' : 'good',
    description: `巨門太陽同在${ju.branch}宮，太陽烈火能化解巨門之疑心暗昧。擅長公關傳媒、法律諮詢、外語經貿或演講說服。寅宮尤佳，申宮力減。`,
    palaces: [ju.name],
    conditions: { required, bonus, breaking },
    source: '《紫微斗數全書·巨日同宮》',
  });
}

/** 石中隱玉：巨門入命於子午宮 */
function detectShiZhongYinYu(chart: ZiweiChart, ming: PalaceCell, patterns: ZiweiPattern[]) {
  if (!hasStar(ming, '巨門')) return;
  if (ming.branch !== '子' && ming.branch !== '午') return;

  const required = [`巨門入命於${ming.branch}宮`];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (getStarSiHua(ming, '巨門') === '祿' || getStarSiHua(ming, '巨門') === '權') {
    bonus.push('巨門化祿或化權（剖石得美玉）');
  }
  if (sanFangAllStars(chart).has('文昌')) bonus.push('文昌會照玉現毫光');
  if (getStarSiHua(ming, '巨門') === '忌') breaking.push('巨門化忌，玉碎深泥');
  if (hasShaInPalace(ming, SHA_HARD)) breaking.push('命宮坐煞曜');

  patterns.push({
    name: '石中隱玉',
    level: breaking.length ? 'caution' : 'excellent',
    description:
      '巨門坐命子午，璞玉藏於堅石之中。早年多需默默磨礪，歷盡考驗後於中年大顯光華。宜深耕技術研究、口才法務、專業顧問。',
    palaces: ['命宮'],
    conditions: { required, bonus, breaking },
    source: '《紫微斗數骨髓賦·石中隱玉》',
  });
}

/** 明珠出海：命宮在未空宮，對宮丑宮為太陽太陰 */
function detectMingZhuChuHai(chart: ZiweiChart, ming: PalaceCell, patterns: ZiweiPattern[]) {
  if (ming.branch !== '未') return;
  if (getMajorStarNames(ming).length > 0) return; // 命宮為空宮
  const dui = getDuiGong(chart, ming.branch);
  if (!dui) return;
  if (!hasStar(dui, '太陽') || !hasStar(dui, '太陰')) return;

  const required = ['命宮在未為空宮', '對宮丑宮太陽太陰同度雙照'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  if (sanFangAllStars(chart).has('文昌') || sanFangAllStars(chart).has('文曲')) bonus.push('再會昌曲');
  if (sanFangAllStars(chart).has('左輔') || sanFangAllStars(chart).has('右弼')) bonus.push('輔弼同會');
  if (sanFangShaCount(chart, SHA_HARD) >= 2) breaking.push('煞星會照（明珠光芒微損）');

  patterns.push({
    name: '明珠出海',
    level: breaking.length ? 'good' : 'excellent',
    description:
      '命宮在未為空宮，對宮丑宮日月同輝朝拱，號「明珠出海」。主才華橫溢、後天奮發向上，離鄉發展或跨界開拓多有驚人建樹。',
    palaces: ['命宮', dui.name],
    conditions: { required, bonus, breaking },
    source: '《紫微斗數全集·明珠出海》',
  });
}

/** 紫微獨坐入命 */
function detectZiWeiInMing(chart: ZiweiChart, ming: PalaceCell, patterns: ZiweiPattern[]) {
  if (!hasStar(ming, '紫微') || hasStar(ming, '天府')) return;

  const required = ['紫微獨坐命宮（非紫府同宮）'];
  const bonus: string[] = [];
  const breaking: string[] = [];
  const sanFangSet = sanFangAllStars(chart);
  if (sanFangSet.has('左輔') && sanFangSet.has('右弼')) bonus.push('左輔右弼同會');
  if (sanFangSet.has('文昌') && sanFangSet.has('文曲')) bonus.push('文昌文曲同會');
  if (!sanFangSet.has('左輔') && !sanFangSet.has('右弼')) breaking.push('無輔弼相助，易成「在野孤君」');
  if (hasShaInPalace(ming, SHA_KONG)) breaking.push('紫微逢地空地劫');

  patterns.push({
    name: '紫微入命',
    level: breaking.length ? 'caution' : bonus.length ? 'excellent' : 'good',
    description:
      '紫微星為帝座獨守命宮，自尊自立、具王者風範。倪師論命常言：「紫微最重左右，有臣下輔佐方能號令天下；若無左右同會，則為孤君自傲，需加倍培養包容心。」',
    palaces: ['命宮'],
    conditions: { required, bonus, breaking },
    source: '《紫微斗數全書》及倪海廈《天紀》',
  });
}

/** 輔弼夾命 */
function detectFuBiJiaMing(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.lifePalaceBranch);
  if (!prev || !next) return;
  const okA = hasStar(prev, '左輔') && hasStar(next, '右弼');
  const okB = hasStar(prev, '右弼') && hasStar(next, '左輔');
  if (!okA && !okB) return;

  patterns.push({
    name: '輔弼夾命',
    level: 'excellent',
    description:
      '左輔右弼分居命宮前後相夾，古書云：「左右夾命，為人必善，平生多獲有力之臂助」。在組織協調與人際整合上具天然優勢。',
    palaces: ['命宮', prev.name, next.name],
    conditions: { required: ['左輔右弼分居命宮前後二宮相夾'] },
    source: '《紫微斗數全書·輔弼夾命》',
  });
}

/** 昌曲夾命 */
function detectChangQuJiaMing(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.lifePalaceBranch);
  if (!prev || !next) return;
  const okA = hasStar(prev, '文昌') && hasStar(next, '文曲');
  const okB = hasStar(prev, '文曲') && hasStar(next, '文昌');
  if (!okA && !okB) return;

  patterns.push({
    name: '昌曲夾命',
    level: 'excellent',
    description:
      '文昌文曲分居命宮兩側夾照，主天資聰穎、文藻風華，極利求學、公職升等、學術與文創考運。',
    palaces: ['命宮', prev.name, next.name],
    conditions: { required: ['文昌文曲分居命宮前後二宮相夾'] },
    source: '《紫微斗數全書》',
  });
}

/** 魁鉞夾命 */
function detectKuiYueJiaMing(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.lifePalaceBranch);
  if (!prev || !next) return;
  const okA = hasStar(prev, '天魁') && hasStar(next, '天鉞');
  const okB = hasStar(prev, '天鉞') && hasStar(next, '天魁');
  if (!okA && !okB) return;

  patterns.push({
    name: '魁鉞夾命',
    level: 'good',
    description:
      '天乙貴人天魁天鉞分居命宮前後相夾，逢凶化吉，關鍵時機多遇長輩或貴人雪中送炭。',
    palaces: ['命宮', prev.name, next.name],
    conditions: { required: ['天魁天鉞分居命宮前後二宮相夾'] },
    source: '《紫微斗數全書》',
  });
}

/** 雙祿朝垣：化祿 + 祿存 同會三方四正 */
function detectShuangLuChaoYuan(chart: ZiweiChart, ming: PalaceCell, patterns: ZiweiPattern[]) {
  const sanFang = getSanFangPalaces(chart);
  let huaLuFound = false;
  let luCunFound = false;
  for (const p of sanFang) {
    if (getAllStars(p).some((s) => s.transformation === '祿')) huaLuFound = true;
    if (hasStar(p, '祿存')) luCunFound = true;
  }
  if (!huaLuFound || !luCunFound) return;

  patterns.push({
    name: '雙祿朝垣',
    level: 'excellent',
    description:
      '化祿與祿存齊聚命宮三方四正，古書云：「雙祿朝垣，富比陶朱」，象徵財源廣進、衣食豐厚，正財與偏財兩全。',
    palaces: sanFang.map((p) => p.name),
    conditions: {
      required: ['化祿會照三方四正', '祿存會照三方四正'],
      breaking: hasShaInPalace(ming, SHA_KONG) ? ['命坐空劫（雙祿遇空，財進財出）'] : undefined,
    },
    source: '《紫微斗數全書·雙祿朝垣》',
  });
}

/** 三奇加會：化祿 化權 化科 同會三方四正 */
function detectSanQiJiaHui(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const sanFangPalaces = getSanFangPalaces(chart);
  let lu = false,
    quan = false,
    ke = false;
  for (const p of sanFangPalaces) {
    for (const s of getAllStars(p)) {
      if (s.transformation === '祿') lu = true;
      if (s.transformation === '權') quan = true;
      if (s.transformation === '科') ke = true;
    }
  }
  if (!(lu && quan && ke)) return;

  patterns.push({
    name: '三奇加會',
    level: 'excellent',
    description:
      '化祿、化權、化科三吉化齊會命宮三方四正，為紫微斗數最高吉格之一。主名譽、權威與實質財祿鼎足而立，成大富大貴之局。',
    palaces: sanFangPalaces.map((p) => p.name),
    conditions: { required: ['化祿、化權、化科三吉化齊聚三方四正'] },
    source: '《紫微斗數全書·三奇加會》',
  });
}

/** 化祿入命 */
function detectHuaLuRuMing(chart: ZiweiChart, ming: PalaceCell, patterns: ZiweiPattern[]) {
  const huaLuStar = (ming.majorStars || []).find((s) => s.transformation === '祿');
  if (!huaLuStar) return;

  patterns.push({
    name: `${huaLuStar.name}化祿入命`,
    level: 'good',
    description: `${huaLuStar.name}化祿坐命，主生性溫和樂觀、人緣俱佳、善於捕捉賺錢契機。`,
    palaces: ['命宮'],
    conditions: { required: [`${huaLuStar.name}化祿坐守命宮`] },
    source: '《紫微斗數全書·四化論》',
  });
}

// ────────────────── 惡格與警示格局辨識器 ──────────────────

/** 化忌入命/遷 */
function detectHuaJiRuMingQian(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const ming = chart.palaces[chart.lifePalaceBranch];
  const qian = getDuiGong(chart, chart.lifePalaceBranch);

  const targets = [
    { p: ming, inMing: true },
    { p: qian, inMing: false },
  ].filter((t): t is { p: PalaceCell; inMing: boolean } => Boolean(t.p));

  for (const { p, inMing } of targets) {
    const jiStar = (p.majorStars || []).find((s) => s.transformation === '忌');
    if (!jiStar) continue;

    patterns.push({
      name: `${jiStar.name}化忌入${inMing ? '命' : '遷'}`,
      level: 'caution',
      description: inMing
        ? `${jiStar.name}化忌坐守命宮。倪師指出：「化忌是人生必須面對的功課，凡事應知止避躁、以柔克剛，反求諸己即可轉化考驗。」`
        : `${jiStar.name}化忌坐守遷移宮，出外奔波與人際交往易有誤解阻滯，宜深耕在地、穩扎穩打。`,
      palaces: [p.name],
      conditions: { required: [`${jiStar.name}化忌坐${inMing ? '命宮' : '遷移宮'}`] },
      source: '《紫微斗數全書》及倪海廈《天紀》',
    });
  }
}

/** 羊陀夾忌：化忌坐命，左右被擎羊陀羅夾 */
function detectYangTuoJiaJi(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const ming = chart.palaces[chart.lifePalaceBranch];
  if (!ming) return;
  const hasJi = getAllStars(ming).some((s) => s.transformation === '忌');
  if (!hasJi) return;

  const { prev, next } = getJiaPalaces(chart, chart.lifePalaceBranch);
  if (!prev || !next) return;
  const aPrev = hasStar(prev, '擎羊') && hasStar(next, '陀羅');
  const aNext = hasStar(prev, '陀羅') && hasStar(next, '擎羊');
  if (!aPrev && !aNext) return;

  patterns.push({
    name: '羊陀夾忌',
    level: 'caution',
    description:
      '化忌坐命，左右擎羊陀羅夾逼。古書警示此格易感身心重壓。現代解盤重在以德化煞、精修專業、謹防小人陷害，不可輕舉妄動。',
    palaces: ['命宮', prev.name, next.name],
    conditions: { required: ['化忌坐命宮', '擎羊陀羅分居命宮前後相夾'] },
    source: '《紫微斗數骨髓賦·羊陀夾忌》',
  });
}

/** 火鈴夾命：火星鈴星分居命宮前後 */
function detectHuoLingJiaMing(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.lifePalaceBranch);
  if (!prev || !next) return;
  const okA = hasStar(prev, '火星') && hasStar(next, '鈴星');
  const okB = hasStar(prev, '鈴星') && hasStar(next, '火星');
  if (!okA && !okB) return;

  patterns.push({
    name: '火鈴夾命',
    level: 'caution',
    description:
      '火星鈴星分居命宮前後夾持，個性急躁剛烈，易遇突發衝突或性急誤事。宜加強定力與理性，深思熟慮而行。',
    palaces: ['命宮', prev.name, next.name],
    conditions: { required: ['火星鈴星分居命宮前後兩宮夾持'] },
    source: '《紫微斗數全書》',
  });
}

/** 空劫夾命：地空地劫分居命宮前後 */
function detectKongJieJiaMing(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const { prev, next } = getJiaPalaces(chart, chart.lifePalaceBranch);
  if (!prev || !next) return;
  const okA = hasStar(prev, '地空') && hasStar(next, '地劫');
  const okB = hasStar(prev, '地劫') && hasStar(next, '地空');
  if (!okA && !okB) return;

  patterns.push({
    name: '空劫夾命',
    level: 'caution',
    description:
      '地空地劫分居命宮兩側相夾，思維天馬行空、不受世俗羈絆，然財帛易進易出。適合學術研究、藝術文創或宗教哲學發展。',
    palaces: ['命宮', prev.name, next.name],
    conditions: { required: ['地空地劫分居命宮前後兩宮相夾'] },
    source: '《紫微斗數全書》',
  });
}

/** 廉殺羊：廉貞、七殺、擎羊三星會照 */
function detectLianShaYang(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!(sanFangSet.has('廉貞') && sanFangSet.has('七殺') && sanFangSet.has('擎羊'))) return;

  patterns.push({
    name: '廉殺羊',
    level: 'caution',
    description:
      '廉貞、七殺、擎羊三星會照三方四正。提醒凡事避免衝動行險，注意出行交通安全與身心保健，遇紛爭時以法理為先。',
    palaces: ['命宮'],
    conditions: { required: ['廉貞、七殺、擎羊三星會照三方四正'] },
    source: '《紫微斗數全書·廉殺羊》',
  });
}

/** 巨火羊：巨門、火星、擎羊會照 */
function detectJuHuoYang(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!(sanFangSet.has('巨門') && sanFangSet.has('火星') && sanFangSet.has('擎羊'))) return;

  patterns.push({
    name: '巨火羊',
    level: 'caution',
    description:
      '巨門、火星、擎羊會照三方，言語性急易惹紛爭。現代解法重在克制言語鋒芒，注重情緒管理與謙遜溝通。',
    palaces: ['命宮'],
    conditions: { required: ['巨門、火星、擎羊三星會照三方四正'] },
    source: '《紫微斗數骨髓賦·巨火羊》',
  });
}

/** 鈴昌陀武：鈴星、文昌、陀羅、武曲會照 */
function detectLingChangTuoWu(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!(sanFangSet.has('鈴星') && sanFangSet.has('文昌') && sanFangSet.has('陀羅') && sanFangSet.has('武曲'))) return;

  patterns.push({
    name: '鈴昌陀武',
    level: 'caution',
    description:
      '鈴星、文昌、陀羅、武曲四星齊會三方，為古書特別關注之凶格。提示面臨重大決策時應三思而行，不可抱僥倖心理與進行過度投機。',
    palaces: ['命宮'],
    conditions: { required: ['鈴星、文昌、陀羅、武曲四星齊會三方四正'] },
    source: '《紫微斗數骨髓賦·鈴昌陀武》',
  });
}

/** 馬頭帶箭：擎羊在午宮坐命 */
function detectMaTouDaiJian(chart: ZiweiChart, ming: PalaceCell, patterns: ZiweiPattern[]) {
  if (ming.branch !== '午') return;
  if (!hasStar(ming, '擎羊')) return;

  const required = ['擎羊於午宮坐守命宮'];
  const bonus: string[] = [];
  if (sanFangAllStars(chart).has('七殺') || sanFangAllStars(chart).has('破軍')) {
    bonus.push('再會七殺或破軍（武職權威大發）');
  }
  if (sanFangAllStars(chart).has('天魁') || sanFangAllStars(chart).has('天鉞')) bonus.push('天乙貴人魁鉞加照');

  patterns.push({
    name: '馬頭帶箭',
    level: bonus.length ? 'good' : 'caution',
    description:
      '擎羊於午宮坐命，號「馬頭帶箭」，古書讚「威鎮邊疆」。象徵非凡之開拓魄力與競爭意志，若得吉星加會主大權在握。',
    palaces: ['命宮'],
    conditions: { required, bonus },
    source: '《紫微斗數骨髓賦·馬頭帶箭》',
  });
}

// ────────────────── 基礎與輔助格局辨識器 ──────────────────

/** 祿存守命 / 守身 */
function detectLuCunShouShen(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const luCunPalace = findStarPalace(chart, '祿存');
  if (!luCunPalace) return;
  const inMing = luCunPalace.branch === chart.lifePalaceBranch;
  const inShen = luCunPalace.branch === chart.bodyPalaceBranch;
  if (!inMing && !inShen) return;

  patterns.push({
    name: inMing ? '祿存守命' : '祿存守身',
    level: 'good',
    description: inMing
      ? '祿存坐守命宮，一生衣食豐厚、財庫充盈。性格謹慎穩健，若配合化祿左輔右弼更呈大富之象。'
      : '祿存坐守身宮，倪師天紀云：「祿存入身，財氣近身」，象徵中年後事業資產穩定、晚運安享。',
    palaces: [inMing ? '命宮' : '身宮'],
    conditions: { required: [inMing ? '祿存坐守命宮' : '祿存坐守身宮'] },
    source: '《紫微斗數全書·祿存星》及倪海廈《天紀》',
  });
}

/** 天馬入命 / 遷：祿馬交馳之機 */
function detectTianMaRuMing(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const tianMaPalace = findStarPalace(chart, '天馬');
  if (!tianMaPalace) return;
  const inMing = tianMaPalace.branch === chart.lifePalaceBranch;
  const qian = getDuiGong(chart, chart.lifePalaceBranch);
  const inQian = qian ? tianMaPalace.branch === qian.branch : false;
  if (!inMing && !inQian) return;

  patterns.push({
    name: inMing ? '天馬入命' : '天馬在遷',
    level: 'neutral',
    description: inMing
      ? '天馬坐命，主一生奔馳活絡、動中生財，宜遠行經商、外勤跨界。倪師常言：「天馬入命，無祿不發」，逢祿存即成「祿馬交馳」富格。'
      : '天馬居遷移宮，主出外遇機遇、宜向海外或異鄉尋求事業突破。',
    palaces: [tianMaPalace.name],
    conditions: { required: [inMing ? '天馬坐守命宮' : '天馬坐守遷移宮'] },
    source: '《紫微斗數全書·天馬星》',
  });
}

/** 化祿入財帛宮 */
function detectHuaLuRuCai(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const cai = chart.palacesList.find((p) => p.name === '財帛宮');
  if (!cai) return;
  const luStar = (cai.majorStars || []).find((s) => s.transformation === '祿');
  if (!luStar) return;

  patterns.push({
    name: '化祿入財',
    level: 'good',
    description: `${luStar.name}化祿坐入財帛宮，象徵財路亨通、進財順暢。倪師指出化祿為正財，依託${luStar.name}之專業特質為立身致富之本。`,
    palaces: ['財帛宮'],
    conditions: { required: [`${luStar.name}化祿坐入財帛宮`] },
    source: '《紫微斗數全書·四化論》及倪海廈《天紀》',
  });
}

/** 化權入官祿宮 */
function detectHuaQuanRuGuan(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const guan = chart.palacesList.find((p) => p.name === '官祿宮');
  if (!guan) return;
  const quanStar = (guan.majorStars || []).find((s) => s.transformation === '權');
  if (!quanStar) return;

  patterns.push({
    name: '化權入官',
    level: 'good',
    description: `${quanStar.name}化權入官祿宮，主事業掌權、執行力卓絕。倪師明言：「官祿宮最喜歡權星入進來」，主能獨當一面、掌握實權。`,
    palaces: ['官祿宮'],
    conditions: { required: [`${quanStar.name}化權坐入官祿宮`] },
    source: '《紫微斗數全書·四化論》及倪海廈《天紀》',
  });
}

/** 化科入命 / 身宮 */
function detectHuaKeRuMingShen(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const ming = chart.palaces[chart.lifePalaceBranch];
  const shen = chart.palaces[chart.bodyPalaceBranch];
  const targets = [
    { p: ming, isMing: true },
    { p: shen, isMing: false },
  ].filter((t): t is { p: PalaceCell; isMing: boolean } => Boolean(t.p));

  for (const { p, isMing } of targets) {
    const keStar = (p.majorStars || []).find((s) => s.transformation === '科');
    if (!keStar) continue;

    patterns.push({
      name: isMing ? '化科入命' : '化科入身',
      level: 'good',
      description: `${keStar.name}化科入${isMing ? '命' : '身'}宮，主名聲清顯、考運亨通。倪師云：「化科是貴人星」，宜以專業知名度開創立業。`,
      palaces: [isMing ? '命宮' : '身宮'],
      conditions: { required: [`${keStar.name}化科入${isMing ? '命宮' : '身宮'}`] },
      source: '《紫微斗數全書·四化論》及倪海廈《天紀》',
    });
    return;
  }
}

/** 機月同梁三星會（備選次格） */
function detectJiYueTongLiangPartial(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  const has = ['天機', '太陰', '天同', '天梁'].filter((s) => sanFangSet.has(s));
  if (has.length !== 3) return; // 4 星齊聚由真格處理
  const missing = ['天機', '太陰', '天同', '天梁'].filter((s) => !sanFangSet.has(s));

  patterns.push({
    name: '機月同梁三星會',
    level: 'neutral',
    description: `機月同梁需四星齊會方為真格；本盤三方會齊${has.join('、')}三曜，缺${missing.join('、')}，文質沈穩，宜公職企劃與專業守成。`,
    palaces: getSanFangPalaces(chart)
      .filter((p) => has.some((s) => getMajorStarNames(p).includes(s)))
      .map((p) => p.name),
    conditions: { required: [`三方四正會齊${has.join('、')}（缺${missing.join('、')}）`] },
    source: '《紫微斗數全書·機月同梁格》',
  });
}

/** 昌曲同會 / 坐命 */
function detectChangQuTongHui(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!sanFangSet.has('文昌') || !sanFangSet.has('文曲')) return;
  const ming = chart.palaces[chart.lifePalaceBranch];
  if (!ming) return;
  const inMing = hasStar(ming, '文昌') && hasStar(ming, '文曲');

  patterns.push({
    name: inMing ? '昌曲坐命' : '昌曲同會',
    level: 'good',
    description: inMing
      ? '文昌文曲同度坐守命宮，主文筆斐然、儒雅聰慧，利於著作立說、傳媒與教職。'
      : '文昌文曲齊會命宮三方四正，主才華外溢、口才文采俱備，利於考運功名。',
    palaces: ['命宮'],
    conditions: { required: ['文昌文曲同會三方四正'] },
    source: '《紫微斗數全書·文星論》',
  });
}

/** 輔弼同會 */
function detectFuBiTongHui(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!sanFangSet.has('左輔') || !sanFangSet.has('右弼')) return;

  patterns.push({
    name: '輔弼同會',
    level: 'good',
    description:
      '左輔右弼同會命宮三方四正，平生多得貴人臂助與群眾擁戴，宜主管或團隊合作，善於整合跨領域資源。',
    palaces: ['命宮'],
    conditions: { required: ['左輔右弼齊會三方四正'] },
    source: '《紫微斗數全書·輔弼論》',
  });
}

/** 魁鉞同會 */
function detectKuiYueTongHui(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const sanFangSet = sanFangAllStars(chart);
  if (!sanFangSet.has('天魁') || !sanFangSet.has('天鉞')) return;

  patterns.push({
    name: '魁鉞同會',
    level: 'good',
    description:
      '天魁天鉞同會命宮三方四正，為天乙與玉堂雙貴人加持，危機時刻常有長者提攜解危。',
    palaces: ['命宮'],
    conditions: { required: ['天魁天鉞齊會三方四正'] },
    source: '《紫微斗數全書·魁鉞論》',
  });
}

/** 科權雙會：化科 + 化權 同會三方四正 */
function detectKeQuanShuangHui(chart: ZiweiChart, patterns: ZiweiPattern[]) {
  const sfPalaces = getSanFangPalaces(chart);
  let hasKe = false,
    hasQuan = false;
  for (const p of sfPalaces) {
    for (const s of getAllStars(p)) {
      if (s.transformation === '科') hasKe = true;
      if (s.transformation === '權') hasQuan = true;
    }
  }
  if (!hasKe || !hasQuan) return;

  patterns.push({
    name: '科權雙會',
    level: 'good',
    description:
      '化科與化權齊會命宮三方四正，既有名望學識（科），又有掌控實力（權），宜走專業權威（醫生、律師、教授、高管）路線。',
    palaces: ['命宮'],
    conditions: { required: ['化科與化權同會三方四正'] },
    source: '《紫微斗數全書·四化會照》',
  });
}

// ────────────────── 核心對外導出入口 ──────────────────

/**
 * 完整紫微斗數格局辨識主函數
 */
export function detectPatterns(chart: ZiweiChart): ZiweiPattern[] {
  const patterns: ZiweiPattern[] = [];
  const ming = chart.palaces[chart.lifePalaceBranch];
  if (!ming) return patterns;

  // 1. 上品大格
  detectJunChenQingHui(chart, ming, patterns);
  detectZiFu(chart, ming, patterns);
  detectFuXiangChaoYuan(chart, ming, patterns);
  detectYangLiangChangLu(chart, ming, patterns);
  detectHuoTanLingTan(chart, ming, patterns);
  detectWuTan(chart, ming, patterns);
  detectShaPoLang(chart, ming, patterns);
  detectJiYueTongLiang(chart, ming, patterns);

  // 2. 中品正格
  detectLianXiang(chart, patterns);
  detectWuQiSha(chart, patterns);
  detectTongLiang(chart, patterns);
  detectRiYueTongGong(chart, patterns);
  detectRiYueJiaMing(chart, patterns);
  detectJuRiTongGong(chart, patterns);
  detectShiZhongYinYu(chart, ming, patterns);
  detectMingZhuChuHai(chart, ming, patterns);
  detectZiWeiInMing(chart, ming, patterns);

  // 3. 助力與吉曜格
  detectFuBiJiaMing(chart, patterns);
  detectChangQuJiaMing(chart, patterns);
  detectKuiYueJiaMing(chart, patterns);
  detectShuangLuChaoYuan(chart, ming, patterns);
  detectSanQiJiaHui(chart, patterns);
  detectHuaLuRuMing(chart, ming, patterns);

  // 4. 惡格與警示格局
  detectHuaJiRuMingQian(chart, patterns);
  detectYangTuoJiaJi(chart, patterns);
  detectHuoLingJiaMing(chart, patterns);
  detectKongJieJiaMing(chart, patterns);
  detectLianShaYang(chart, patterns);
  detectJuHuoYang(chart, patterns);
  detectLingChangTuoWu(chart, patterns);
  detectMaTouDaiJian(chart, ming, patterns);

  // 5. 基礎輔助格局
  detectLuCunShouShen(chart, patterns);
  detectTianMaRuMing(chart, patterns);
  detectHuaLuRuCai(chart, patterns);
  detectHuaQuanRuGuan(chart, patterns);
  detectHuaKeRuMingShen(chart, patterns);
  detectJiYueTongLiangPartial(chart, patterns);
  detectChangQuTongHui(chart, patterns);
  detectFuBiTongHui(chart, patterns);
  detectKuiYueTongHui(chart, patterns);
  detectKeQuanShuangHui(chart, patterns);

  return patterns;
}

/**
 * 命宮主星特質與心法摘要
 */
export function getMingGongSummary(chart: ZiweiChart): ZiweiMingGongSummary {
  const mingPalace = chart.palaces[chart.lifePalaceBranch];
  if (!mingPalace) return { stars: [], keywords: [], nature: '' };

  const majorStars = mingPalace.majorStars || [];
  const starNames = majorStars.map((s) => s.name);

  const keywordMap: Record<string, string[]> = {
    紫微: ['尊貴統御', '自主自立', '領袖風範'],
    天機: ['機敏善謀', '智囊策劃', '適應力強'],
    太陽: ['博愛無私', '公眾光明', '志向遠大'],
    武曲: ['剛毅果決', '開源生財', '踏實執行'],
    天同: ['溫良寬厚', '隨遇而安', '福德調和'],
    廉貞: ['才華洋溢', '原則分明', '開拓人脈'],
    天府: ['穩健沉著', '財庫基石', '包容守成'],
    太陰: ['內斂細膩', '富貴涵養', '敏銳直覺'],
    貪狼: ['多才多藝', '慾望動能', '人際圓融'],
    巨門: ['洞察微言', '邏輯明晰', '以言建功'],
    天相: ['公正信義', '優質輔佐', '體面穩重'],
    天梁: ['老成持重', '逢凶化吉', '蔭庇長者'],
    七殺: ['勇猛果敢', '孤膽開拓', '破立創新'],
    破軍: ['突破傳統', '求新求變', '銳意進取'],
  };

  const natureMap: Record<string, string> = {
    紫微: '帝王星',
    天機: '智慧星',
    太陽: '光明貴星',
    武曲: '財帛正星',
    天同: '福德之星',
    廉貞: '次桃花之星',
    天府: '令星財庫',
    太陰: '財富母曜',
    貪狼: '多能開拓星',
    巨門: '暗曜辯才星',
    天相: '宰相印星',
    天梁: '蔭庇清貴星',
    七殺: '將帥威星',
    破軍: '開創先鋒星',
  };

  const keywords = starNames.flatMap((n) => keywordMap[n] || []).slice(0, 5);
  const nature = starNames.length > 0 ? natureMap[starNames[0]] || '本命主曜' : '命無正曜（借對宮觀之）';

  return { stars: starNames, keywords, nature };
}
