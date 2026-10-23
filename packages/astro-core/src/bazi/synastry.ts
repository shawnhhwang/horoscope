import { BaziChart, FiveElement, FiveElementsBreakdown } from './types.js';
import { calculateBaziChart } from './calculator.js';

// 天干五行與陰陽
const STEM_ELEMENT: Record<string, FiveElement> = {
  甲: '木',
  乙: '木',
  丙: '火',
  丁: '火',
  戊: '土',
  己: '土',
  庚: '金',
  辛: '金',
  壬: '水',
  癸: '水',
};

// 地支五行
const BRANCH_ELEMENT: Record<string, FiveElement> = {
  子: '水',
  丑: '土',
  寅: '木',
  卯: '木',
  辰: '土',
  巳: '火',
  午: '火',
  未: '土',
  申: '金',
  酉: '金',
  戌: '土',
  亥: '水',
};

// 五行生剋
const FIVE_ELEMENTS_RELATION: Record<FiveElement, { generates: FiveElement; generatedBy: FiveElement; conquers: FiveElement; conqueredBy: FiveElement }> = {
  木: { generates: '火', generatedBy: '水', conquers: '土', conqueredBy: '金' },
  火: { generates: '土', generatedBy: '木', conquers: '金', conqueredBy: '水' },
  土: { generates: '金', generatedBy: '火', conquers: '水', conqueredBy: '木' },
  金: { generates: '水', generatedBy: '土', conquers: '木', conqueredBy: '火' },
  水: { generates: '木', generatedBy: '金', conquers: '火', conqueredBy: '土' },
};

// 天干五合
const STEM_COMBINATIONS: Record<string, { partner: string; transformed: FiveElement; name: string }> = {
  甲: { partner: '己', transformed: '土', name: '甲己合化中正之土' },
  己: { partner: '甲', transformed: '土', name: '甲己合化中正之土' },
  乙: { partner: '庚', transformed: '金', name: '乙庚合化仁義之金' },
  庚: { partner: '乙', transformed: '金', name: '乙庚合化仁義之金' },
  丙: { partner: '辛', transformed: '水', name: '丙辛合化威制之水' },
  辛: { partner: '丙', transformed: '水', name: '丙辛合化威制之水' },
  丁: { partner: '壬', transformed: '木', name: '丁壬合化天德之木' },
  壬: { partner: '丁', transformed: '木', name: '丁壬合化天德之木' },
  戊: { partner: '癸', transformed: '火', name: '戊癸合化禮智之火' },
  癸: { partner: '戊', transformed: '火', name: '戊癸合化禮智之火' },
};

// 地支六合
const BRANCH_SIX_COMBINATIONS: Record<string, { partner: string; transformed: FiveElement; name: string }> = {
  子: { partner: '丑', transformed: '土', name: '子丑六合化土' },
  丑: { partner: '子', transformed: '土', name: '子丑六合化土' },
  寅: { partner: '亥', transformed: '木', name: '寅亥六合化木' },
  亥: { partner: '寅', transformed: '木', name: '寅亥六合化木' },
  卯: { partner: '戌', transformed: '火', name: '卯戌六合化火' },
  戌: { partner: '卯', transformed: '火', name: '卯戌六合化火' },
  辰: { partner: '酉', transformed: '金', name: '辰酉六合化金' },
  酉: { partner: '辰', transformed: '金', name: '辰酉六合化金' },
  巳: { partner: '申', transformed: '水', name: '巳申六合化水' },
  申: { partner: '巳', transformed: '水', name: '巳申六合化水' },
  午: { partner: '未', transformed: '土', name: '午未六合化土' },
  未: { partner: '午', transformed: '土', name: '午未六合化土' },
};

// 地支六沖
const BRANCH_SIX_CLASHES: Record<string, { target: string; name: string }> = {
  子: { target: '午', name: '子午相沖（水火交戰）' },
  午: { target: '子', name: '子午相沖（水火交戰）' },
  丑: { target: '未', name: '丑未相沖（濕燥土沖）' },
  未: { target: '丑', name: '丑未相沖（濕燥土沖）' },
  寅: { target: '申', name: '寅申相沖（金木交戰）' },
  申: { target: '寅', name: '寅申相沖（金木交戰）' },
  卯: { target: '酉', name: '卯酉相沖（金木交鋒）' },
  酉: { target: '卯', name: '卯酉相沖（金木交鋒）' },
  辰: { target: '戌', name: '辰戌相沖（魁罡衝動）' },
  戌: { target: '辰', name: '辰戌相沖（魁罡衝動）' },
  巳: { target: '亥', name: '巳亥相沖（水火相激）' },
  亥: { target: '巳', name: '巳亥相沖（水火相激）' },
};

// 地支六害 (相害)
const BRANCH_SIX_HARMS: Record<string, string> = {
  子: '未',
  未: '子',
  丑: '午',
  午: '丑',
  寅: '巳',
  巳: '寅',
  卯: '辰',
  辰: '卯',
  申: '亥',
  亥: '申',
  酉: '戌',
  戌: '酉',
};

// 地支三合局
const BRANCH_TRIPLE_HARMONIES: { branches: string[]; element: FiveElement; name: string }[] = [
  { branches: ['申', '子', '辰'], element: '水', name: '申子辰三合水局' },
  { branches: ['巳', '酉', '丑'], element: '金', name: '巳酉丑三合金局' },
  { branches: ['寅', '午', '戌'], element: '火', name: '寅午戌三合火局' },
  { branches: ['亥', '卯', '未'], element: '木', name: '亥卯未三合木局' },
];

export interface PersonSynastryInput {
  name: string;
  gender: '男' | '女';
  birthDate: Date | string;
  role?: string;
}

/**
 * 八字合婚評析報告結構
 */
export interface BaziSynastryResult {
  person1: {
    name: string;
    gender: '男' | '女';
    solarDate: string;
    fourPillarsText: string;
    dayMaster: string;
    energyStatus: string;
    chart: BaziChart;
  };
  person2: {
    name: string;
    gender: '男' | '女';
    solarDate: string;
    fourPillarsText: string;
    dayMaster: string;
    energyStatus: string;
    chart: BaziChart;
  };
  score: number; // 0 ~ 100
  level: string; // 如：天作之合 · 琴瑟和鳴
  summary: string;
  dimensions: {
    dayMasterSynergy: {
      score: number; // 滿分 25
      relationType: '天干五合' | '相生' | '同氣比和' | '相剋相制';
      description: string;
      advice: string;
    };
    spousePalaceSynergy: {
      score: number; // 滿分 25
      relationType: '六合' | '三合半合' | '平和無沖' | '相沖' | '相害相刑';
      description: string;
      advice: string;
    };
    fiveElementsComplementarity: {
      score: number; // 滿分 30
      usefulElementsSupport: string;
      lackingElementsBalance: string;
      complementarityDescription: string;
    };
    yearPillarSynergy: {
      score: number; // 滿分 20
      naYinRelation: string;
      zodiacRelation: string;
      description: string;
    };
  };
  bridgingElement: {
    element: FiveElement;
    explanation: string;
    dailyTips: string[];
  };
  fourPillarsDetailedCross: {
    pillarName: '年柱 (根基)' | '月柱 (情緣)' | '日柱 (夫妻本位)' | '時柱 (子嗣歸宿)';
    p1GanZhi: string;
    p2GanZhi: string;
    relation: string;
    verdict: string;
  }[];
  marriageAdvice: {
    emotionalCommunication: string;
    financialManagement: string;
    familyAndRelatives: string;
    growthTogether: string;
  };
}

/**
 * 八字合婚演算法核心
 */
export function calculateBaziSynastry(
  p1Input: PersonSynastryInput,
  p2Input: PersonSynastryInput
): BaziSynastryResult {
  const d1 = typeof p1Input.birthDate === 'string' ? new Date(p1Input.birthDate) : p1Input.birthDate;
  const d2 = typeof p2Input.birthDate === 'string' ? new Date(p2Input.birthDate) : p2Input.birthDate;

  const chart1 = calculateBaziChart(d1, p1Input.gender);
  const chart2 = calculateBaziChart(d2, p2Input.gender);

  const dm1 = chart1.dayMaster.stem;
  const dm2 = chart2.dayMaster.stem;
  const el1 = chart1.dayMaster.element;
  const el2 = chart2.dayMaster.element;

  const sp1 = chart1.pillars.day.branch;
  const sp2 = chart2.pillars.day.branch;

  // 1. 日主天干相合與情義 (滿分 25 分)
  let dayMasterScore = 15;
  let dayMasterType: '天干五合' | '相生' | '同氣比和' | '相剋相制' = '同氣比和';
  let dayMasterDesc = '';
  let dayMasterAdv = '';

  const stemCombo = STEM_COMBINATIONS[dm1];
  if (stemCombo && stemCombo.partner === dm2) {
    dayMasterScore = 25;
    dayMasterType = '天干五合';
    dayMasterDesc = `雙方日主形成「${stemCombo.name}」，此為命理中最高貴之天干正合。象徵性情自然相互吸引，彼此尊重認同，具有靈魂伴侶般的深層默契。`;
    dayMasterAdv = '先天緣分極深，遇事多坦誠分享心跡，這份正合能量能化解日常生活中的任何瑣碎分歧。';
  } else if (FIVE_ELEMENTS_RELATION[el1].generates === el2) {
    dayMasterScore = 21;
    dayMasterType = '相生';
    dayMasterDesc = `${p1Input.name}日主屬${el1}，生扶${p2Input.name}之${el2}，形成五行相生之情。相處溫潤有禮，一方樂於付出照顧，另一方深知感恩回應。`;
    dayMasterAdv = '付出者需注意保持自我空間，受照拂者應常給予肯定的言語反饋，感情更形長久。';
  } else if (FIVE_ELEMENTS_RELATION[el2].generates === el1) {
    dayMasterScore = 21;
    dayMasterType = '相生';
    dayMasterDesc = `${p2Input.name}日主屬${el2}，生扶${p1Input.name}之${el1}，彼此生生不息。相處如沐春風，在工作與生活上均能給予對方實質的心靈支撐。`;
    dayMasterAdv = '珍惜對方的包容與付出，多在生活細微處營造浪漫與驚喜。';
  } else if (el1 === el2) {
    dayMasterScore = 18;
    dayMasterType = '同氣比和';
    dayMasterDesc = `雙方日主同屬「${el1}」，比和同氣。理念價值觀高度相仿，思維節奏同步，亦師亦友，相處輕鬆自在。`;
    dayMasterAdv = '因性格接近，有時面對分歧時可能各持己見，宜建立「遇爭議時輪流決策」的良性機制。';
  } else {
    dayMasterScore = 13;
    dayMasterType = '相剋相制';
    const conqueror = FIVE_ELEMENTS_RELATION[el1].conquers === el2 ? p1Input.name : p2Input.name;
    const conquered = conqueror === p1Input.name ? p2Input.name : p1Input.name;
    dayMasterDesc = `雙方日主呈五行相剋（${el1}與${el2}）。處事方式與視角截然不同，雖具備強烈互補性，但初始階段需要磨合溝通節奏。`;
    dayMasterAdv = `以欣賞而非批判的視角看待彼此的差異，善用五行通關法則（調和五行），便能將相剋轉化為激發彼此進步的強大推力。`;
  }

  // 2. 夫妻宮日支相合 (滿分 25 分)
  let spouseScore = 15;
  let spouseType: '六合' | '三合半合' | '平和無沖' | '相沖' | '相害相刑' = '平和無沖';
  let spouseDesc = '';
  let spouseAdv = '';

  const branchSix = BRANCH_SIX_COMBINATIONS[sp1];
  const branchClash = BRANCH_SIX_CLASHES[sp1];
  const isHarm = BRANCH_SIX_HARMS[sp1] === sp2;

  // 檢查三合局
  let isTripleHarmony = false;
  let tripleName = '';
  for (const tri of BRANCH_TRIPLE_HARMONIES) {
    if (tri.branches.includes(sp1) && tri.branches.includes(sp2)) {
      isTripleHarmony = true;
      tripleName = tri.name;
      break;
    }
  }

  if (branchSix && branchSix.partner === sp2) {
    spouseScore = 25;
    spouseType = '六合';
    spouseDesc = `雙方夫妻宮（日支）形成「${branchSix.name}」。日支代表婚後生活本位與私密世界，六合主二人家庭生活節奏和諧，情投意合，向心力極強。`;
    spouseAdv = '家庭凝聚力極高，適合共同規劃長期家庭資產或共同開創事業。';
  } else if (isTripleHarmony) {
    spouseScore = 22;
    spouseType = '三合半合';
    spouseDesc = `雙方夫妻宮共會「${tripleName}」。代表兩人在家庭生活觀、金錢價值觀與休閒品味上志趣相投，婚後往往越處越融洽。`;
    spouseAdv = '保持生活的情調與儀式感，共同朋友與家庭社交生活能進一步加深感情。';
  } else if (branchClash && branchClash.target === sp2) {
    spouseScore = 8;
    spouseType = '相沖';
    spouseDesc = `雙方夫妻宮呈現「${branchClash.name}」。夫妻宮逢沖，代表兩人生活作息、個性急躁度或習慣存在反差，偶有言語交鋒。`;
    spouseAdv = '記住「沖則動，動則變」。相沖並非絕配，而是提醒彼此需給予對方獨立自主的個人空間，遇爭執時切忌翻舊帳，靜心冷靜三分鐘。';
  } else if (isHarm) {
    spouseScore = 10;
    spouseType = '相害相刑';
    spouseDesc = `雙方夫妻宮地支見相害（${sp1}${sp2}相害）。在情緒敏感點或特定生活細節上易產生隱性誤解，需要更多耐心傾聽。`;
    spouseAdv = '培養主動對話與澄清誤會的習慣，多將心中感受用溫柔文字或平和語言表達，切勿累積心結。';
  } else {
    spouseScore = 16;
    spouseType = '平和無沖';
    spouseDesc = `雙方夫妻宮地支相安無沖（${sp1}與${sp2}），五行氣息平穩。日常生活如細水長流，安居樂業，屬於穩定持重之配。`;
    spouseAdv = '在平凡日子中常保感恩與互相欣賞的心，平淡之中自見真情。';
  }

  // 3. 五行能量互補與喜用神互助 (滿分 30 分)
  let elemCompScore = 18;
  const e1 = chart1.fiveElements;
  const e2 = chart2.fiveElements;

  // 檢驗互補：一方缺乏的五行（< 15%），另一方是否充沛（>= 25%）
  const elementsList: FiveElement[] = ['木', '火', '土', '金', '水'];
  const p1Lacking: FiveElement[] = [];
  const p2Lacking: FiveElement[] = [];
  const compElements: FiveElement[] = [];

  const keyMap: Record<FiveElement, keyof FiveElementsBreakdown> = {
    木: 'wood',
    火: 'fire',
    土: 'earth',
    金: 'metal',
    水: 'water',
  };

  elementsList.forEach((el) => {
    const k = keyMap[el];
    if (e1[k] < 15) p1Lacking.push(el);
    if (e2[k] < 15) p2Lacking.push(el);
    if ((e1[k] < 15 && e2[k] >= 22) || (e2[k] < 15 && e1[k] >= 22)) {
      compElements.push(el);
    }
  });

  // 檢驗喜用神互助：一方喜用神是否出現在另一方的強旺五行中
  let usefulSupportCount = 0;
  const useful1 = chart1.favorableElements.useful;
  const useful2 = chart2.favorableElements.useful;

  useful1.forEach((u) => {
    if (e2[keyMap[u]] >= 20) usefulSupportCount++;
  });
  useful2.forEach((u) => {
    if (e1[keyMap[u]] >= 20) usefulSupportCount++;
  });

  elemCompScore += Math.min(compElements.length * 3 + usefulSupportCount * 3, 12);
  elemCompScore = Math.min(elemCompScore, 30);

  const usefulSupportDesc =
    usefulSupportCount > 0
      ? `雙方互為喜用吉曜！${p1Input.name}所喜之五行在${p2Input.name}命中得以生旺，反之亦然。彼此在一起能增益運勢，互為生命貴人。`
      : `雙方五行流轉各有專長，可透過居家環境與生活色彩協調五行之氣。`;

  const compDesc =
    compElements.length > 0
      ? `五行互補顯著：雙方在「${compElements.join('、')}」能量上形成完美互補，一人之不足恰為另一人之優勢，家庭五行圓融無缺。`
      : `雙方五行能量配置各有千秋，相處重在因勢利導。`;

  // 4. 年柱納音與生肖合沖 (滿分 20 分)
  let yearScore = 12;
  const yb1 = chart1.pillars.year.branch;
  const yb2 = chart2.pillars.year.branch;
  const ny1 = chart1.pillars.year.naYin;
  const ny2 = chart2.pillars.year.naYin;

  let zodiacRel = '生肖相合平順';
  if (BRANCH_SIX_COMBINATIONS[yb1]?.partner === yb2) {
    yearScore += 6;
    zodiacRel = '生肖六合大吉（長輩緣佳）';
  } else if (BRANCH_SIX_CLASHES[yb1]?.target === yb2) {
    yearScore -= 3;
    zodiacRel = '生肖相沖（家庭社交理念需調和）';
  } else {
    yearScore += 3;
  }

  const yearPillarDesc = `年柱代表祖蔭根基與長輩緣分。男方納音【${ny1}】，女方納音【${ny2}】；生肖互動為「${zodiacRel}」，象徵兩個原生家庭文化融合順暢。`;

  // 5. 計算總評分 (45 ~ 99)
  const totalRaw = dayMasterScore + spouseScore + elemCompScore + yearScore;
  const finalScore = Math.max(50, Math.min(98, totalRaw));

  let level = '相濡以沫 · 歲月同舟';
  let summary = '';
  if (finalScore >= 90) {
    level = '天作之合 · 琴瑟和鳴';
    summary = '命盤多重天干地支正合，五行互補共振，是極具默契與福祿之良緣配搭。';
  } else if (finalScore >= 80) {
    level = '情深意篤 · 珠聯璧合';
    summary = '雙方在心靈追求或日常生活節奏上契合度極高，彼此扶持成就，家業興旺。';
  } else if (finalScore >= 70) {
    level = '相濡以沫 · 歲月同舟';
    summary = '基礎緣分穩固踏實，相處重視生活細節與互相體諒，細水長流幸福綿延。';
  } else if (finalScore >= 60) {
    level = '知己磨合 · 互敬成金';
    summary = '性格與行事風格各有千秋，需學會欣賞彼此的獨特性，藉由通關五行能化張力為助力。';
  } else {
    level = '修德互勉 · 順緣通關';
    summary = '個性與思考維度存在鮮明反差，宜建立良好的溝通界線，以理性與智慧經營婚姻。';
  }

  // 6. 通關五行判定 (Bridging Element)
  let bridgingEl: FiveElement = '水';
  let bridgingExp = '';
  let dailyTips: string[] = [];

  if ((el1 === '金' && el2 === '木') || (el1 === '木' && el2 === '金')) {
    bridgingEl = '水';
    bridgingExp = '金剋木，以「水」通關引化。金生水，水生木，以智慧圓融與溫柔包容化解剛毅碰撞。';
    dailyTips = ['居家可適度佈置水藍色、黑色家飾或水耕綠植', '遇分歧時先喝杯溫水平復心境，避免當下情緒硬碰硬', '多安排海邊、湖畔或水景自然散步旅行'];
  } else if ((el1 === '水' && el2 === '火') || (el1 === '火' && el2 === '水')) {
    bridgingEl = '木';
    bridgingExp = '水火相激，以「木」通關生化。水生木，木生火，將理性思維與感性熱情轉化為創造力。';
    dailyTips = ['多使用翠綠、青色系擺件，室內常設生機綠植', '共同培養讀書、學習或藝術創作等文教興趣', '遇爭辯時各自寫下訴求再交換閱讀，以文理通心'];
  } else if ((el1 === '木' && el2 === '土') || (el1 === '土' && el2 === '木')) {
    bridgingEl = '火';
    bridgingExp = '木剋土，以「火」通關調和。木生火，火生土，以熱忱、明理與感恩之心溫暖厚重守成。';
    dailyTips = ['家中常保採光充足溫暖，可適度點香氛蠟燭', '多主動讚美對方的付出與閃光點，不吝表達熱情', '共同參與陽光充足的戶外運動或野餐'];
  } else if ((el1 === '火' && el2 === '金') || (el1 === '金' && el2 === '火')) {
    bridgingEl = '土';
    bridgingExp = '火剋金，以「土」通關轉承。火生土，土生金，以穩健、踏實與信用落實熱情構想。';
    dailyTips = ['客廳與臥房採用大地色、米黃色或陶瓷藝品', '凡遇重大財務或家庭開銷，白紙黑字設立共同預算帳戶', '重視飲食規律，共同下廚享受大地食材烹飪'];
  } else {
    bridgingEl = '金';
    bridgingExp = '土剋水，以「金」通關開源。土生金，金生水，以條理、原則與專業秩序疏通情感情緒。';
    dailyTips = ['生活空間維持明亮簡約，多用白金色或金屬質感擺設', '遇到問題時建立清晰的生活SOP與家務分工表', '給予彼此獨立思考的時間，注重原則性尊重'];
  }

  // 7. 四柱交叉對照
  const formatPillar = (p1Name: string, p2Name: string, name: any, v1: string, v2: string, s1: string, s2: string, b1: string, b2: string) => {
    let rel = '五行和平';
    let ver = '氣息流通相安';
    if (STEM_COMBINATIONS[s1]?.partner === s2) {
      rel = '天干正合';
      ver = '天賜良緣，理念高度對齊';
    } else if (BRANCH_SIX_COMBINATIONS[b1]?.partner === b2) {
      rel = '地支六合';
      ver = '情投意合，生活步調默契';
    } else if (BRANCH_SIX_CLASHES[b1]?.target === b2) {
      rel = '地支相沖';
      ver = '步調有差，需包容體諒';
    } else if (FIVE_ELEMENTS_RELATION[STEM_ELEMENT[s1]].generates === STEM_ELEMENT[s2]) {
      rel = '天干順生';
      ver = '彼此照拂，生生不息';
    }
    return {
      pillarName: name,
      p1GanZhi: v1,
      p2GanZhi: v2,
      relation: rel,
      verdict: ver,
    };
  };

  const p1 = chart1.pillars;
  const p2 = chart2.pillars;
  const fourPillarsDetailedCross = [
    formatPillar(p1Input.name, p2Input.name, '年柱 (根基)', `${p1.year.stem}${p1.year.branch}`, `${p2.year.stem}${p2.year.branch}`, p1.year.stem, p2.year.stem, p1.year.branch, p2.year.branch),
    formatPillar(p1Input.name, p2Input.name, '月柱 (情緣)', `${p1.month.stem}${p1.month.branch}`, `${p2.month.stem}${p2.month.branch}`, p1.month.stem, p2.month.stem, p1.month.branch, p2.month.branch),
    formatPillar(p1Input.name, p2Input.name, '日柱 (夫妻本位)', `${p1.day.stem}${p1.day.branch}`, `${p2.day.stem}${p2.day.branch}`, p1.day.stem, p2.day.stem, p1.day.branch, p2.day.branch),
    formatPillar(p1Input.name, p2Input.name, '時柱 (子嗣歸宿)', `${p1.hour.stem}${p1.hour.branch}`, `${p2.hour.stem}${p2.hour.branch}`, p1.hour.stem, p2.hour.stem, p1.hour.branch, p2.hour.branch),
  ];

  return {
    person1: {
      name: p1Input.name,
      gender: p1Input.gender,
      solarDate: d1.toISOString(),
      fourPillarsText: `${p1.year.stem}${p1.year.branch}年 ${p1.month.stem}${p1.month.branch}月 ${p1.day.stem}${p1.day.branch}日 ${p1.hour.stem}${p1.hour.branch}時`,
      dayMaster: `${chart1.dayMaster.stem} (${chart1.dayMaster.element})`,
      energyStatus: chart1.energy.status,
      chart: chart1,
    },
    person2: {
      name: p2Input.name,
      gender: p2Input.gender,
      solarDate: d2.toISOString(),
      fourPillarsText: `${p2.year.stem}${p2.year.branch}年 ${p2.month.stem}${p2.month.branch}月 ${p2.day.stem}${p2.day.branch}日 ${p2.hour.stem}${p2.hour.branch}時`,
      dayMaster: `${chart2.dayMaster.stem} (${chart2.dayMaster.element})`,
      energyStatus: chart2.energy.status,
      chart: chart2,
    },
    score: finalScore,
    level,
    summary,
    dimensions: {
      dayMasterSynergy: {
        score: dayMasterScore,
        relationType: dayMasterType,
        description: dayMasterDesc,
        advice: dayMasterAdv,
      },
      spousePalaceSynergy: {
        score: spouseScore,
        relationType: spouseType,
        description: spouseDesc,
        advice: spouseAdv,
      },
      fiveElementsComplementarity: {
        score: elemCompScore,
        usefulElementsSupport: usefulSupportDesc,
        lackingElementsBalance: compDesc,
        complementarityDescription: `雙方五行互補評分為 ${elemCompScore}/30。結合各自喜用神五行流通，相濡以沫能使家道日隆。`,
      },
      yearPillarSynergy: {
        score: yearScore,
        naYinRelation: `${ny1} 配 ${ny2}`,
        zodiacRelation: zodiacRel,
        description: yearPillarDesc,
      },
    },
    bridgingElement: {
      element: bridgingEl,
      explanation: bridgingExp,
      dailyTips,
    },
    fourPillarsDetailedCross,
    marriageAdvice: {
      emotionalCommunication: '建立「每日睡前十五分鐘無手機深度對話」習慣，只談感受與感謝，不談家務指責。',
      financialManagement: '建議設立「家庭共同帳戶」負責日常開銷，並保留雙方各自獨立運用的私房額度，既有合力又重尊重。',
      familyAndRelatives: '面對雙方原生家庭，原則是「誰的父母誰主面協調」，多在長輩面前稱讚對方的優點。',
      growthTogether: '每年設定一個共同完成的家庭願景（如裝潢、旅居、新技能學習），保持同舟共濟的成長活力。',
    },
  };
}

// ─────────────────────────────────────────────────────────────
// 👨‍👩‍👧‍👦 家人群組比對解析 (Family Group Synastry)
// ─────────────────────────────────────────────────────────────

export interface FamilyMemberInput {
  name: string;
  role: string; // 父親、母親、長子、幼女、祖父、長輩等
  gender: '男' | '女';
  birthDate: Date | string;
}

export interface FamilyGroupMemberInfo {
  name: string;
  role: string;
  gender: '男' | '女';
  solarDate: string;
  dayMaster: string;
  dayMasterElement: FiveElement;
  energyStatus: string;
  fourPillarsText: string;
  assignedFamilyArchetype: string; // 舵手、調和者、開拓者、守護基石
  chart: BaziChart;
}

export interface FamilyPairRelation {
  fromName: string;
  fromRole: string;
  toName: string;
  toRole: string;
  relationType: string; // 默契天合、相生相伴、性格互補、歡喜磨合
  score: number;
  description: string;
}

export interface FamilyGroupResult {
  familyTitle: string;
  memberCount: number;
  members: FamilyGroupMemberInfo[];
  householdAura: {
    dominantElement: FiveElement;
    lackingElement: FiveElement;
    elementBreakdown: FiveElementsBreakdown;
    auraTitle: string;
    description: string;
    homeEnvironmentAdvice: string;
  };
  crossMatrix: FamilyPairRelation[];
  familyRoles: {
    roleCategory: '家族舵手 (引領者)' | '心靈潤滑 (調和者)' | '活力開拓 (創新者)' | '穩健基石 (守護者)';
    membersAssigned: string[];
    description: string;
  }[];
  harmonyGuidelines: {
    title: string;
    advice: string;
  }[];
}

/**
 * 家人群組八字多維比對解析
 */
export function calculateFamilyGroup(
  membersInput: FamilyMemberInput[],
  familyTitle: string = '幸福同舟之家'
): FamilyGroupResult {
  if (membersInput.length < 2) {
    throw new Error('家人群組比對至少需 2 位成員');
  }

  // 1. 逐一計算成員八字
  const members: FamilyGroupMemberInfo[] = membersInput.map((m) => {
    const bDate = typeof m.birthDate === 'string' ? new Date(m.birthDate) : m.birthDate;
    const chart = calculateBaziChart(bDate, m.gender);
    const p = chart.pillars;

    // 指派家庭原型
    let archetype = '心靈潤滑 (調和者)';
    const el = chart.dayMaster.element;
    const status = chart.energy.status;
    if (status === '身強' && (el === '金' || el === '土' || el === '木')) {
      archetype = '家族舵手 (引領者)';
    } else if (el === '火' || chart.fiveElements.fire > 25) {
      archetype = '活力開拓 (創新者)';
    } else if (el === '土' || chart.fiveElements.earth > 25) {
      archetype = '穩健基石 (守護者)';
    }

    return {
      name: m.name,
      role: m.role || '家庭成員',
      gender: m.gender,
      solarDate: bDate.toISOString(),
      dayMaster: `${chart.dayMaster.stem} (${el})`,
      dayMasterElement: el,
      energyStatus: status,
      fourPillarsText: `${p.year.stem}${p.year.branch} ${p.month.stem}${p.month.branch} ${p.day.stem}${p.day.branch} ${p.hour.stem}${p.hour.branch}`,
      assignedFamilyArchetype: archetype,
      chart,
    };
  });

  // 2. 計算全家匯總五行場域 (Household Energy Aggregation)
  const totalBreakdown: FiveElementsBreakdown = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  members.forEach((m) => {
    totalBreakdown.wood += m.chart.fiveElements.wood;
    totalBreakdown.fire += m.chart.fiveElements.fire;
    totalBreakdown.earth += m.chart.fiveElements.earth;
    totalBreakdown.metal += m.chart.fiveElements.metal;
    totalBreakdown.water += m.chart.fiveElements.water;
  });

  const count = members.length;
  const avgBreakdown: FiveElementsBreakdown = {
    wood: Math.round(totalBreakdown.wood / count),
    fire: Math.round(totalBreakdown.fire / count),
    earth: Math.round(totalBreakdown.earth / count),
    metal: Math.round(totalBreakdown.metal / count),
    water: Math.round(totalBreakdown.water / count),
  };

  // 找出優勢五行與匱乏五行
  const elements = [
    { el: '木' as FiveElement, val: avgBreakdown.wood },
    { el: '火' as FiveElement, val: avgBreakdown.fire },
    { el: '土' as FiveElement, val: avgBreakdown.earth },
    { el: '金' as FiveElement, val: avgBreakdown.metal },
    { el: '水' as FiveElement, val: avgBreakdown.water },
  ];
  elements.sort((a, b) => b.val - a.val);

  const dominant = elements[0].el;
  const lacking = elements[elements.length - 1].el;

  let auraTitle = '厚德載物 · 興家立業氣場';
  let auraDesc = '';
  let homeEnvAdv = '';

  switch (dominant) {
    case '木':
      auraTitle = '崇德向學 · 青雲得祿氣場';
      auraDesc = '全家木氣充沛，家庭文化崇尚知識、學習與修養。家風清正溫雅，長幼有序，利於子女考運與學術功名。';
      homeEnvAdv = '客廳可多採用自然採光與木質家具，適度點綴紅色暖色調以促成木火通明之局。';
      break;
    case '火':
      auraTitle = '萬象熱忱 · 欣欣向榮氣場';
      auraDesc = '全家火氣豐厚，家族朝氣蓬勃、社交熱絡，成員具備強烈行動力與樂觀氣質。有時需注意生活節奏放緩。';
      homeEnvAdv = '居家空間宜增添水流造景或素雅米白色彩，調和火熱，營造身心放鬆之港灣。';
      break;
    case '土':
      auraTitle = '基業篤厚 · 聚富守成氣場';
      auraDesc = '全家土氣沉穩，家族底蘊深厚，重視家庭信譽、理財儲蓄與傳統人倫。遇事冷靜有定力，家風穩如泰山。';
      homeEnvAdv = '宜在家中多設闊葉水培植物或金屬現代燈飾，打破過於凝滯之土氣，活化家運流轉。';
      break;
    case '金':
      auraTitle = '規矩方圓 · 剛毅果決氣場';
      auraDesc = '全家金氣清脆，家庭做事條理分明、紀律嚴明。成員在專業技術與職場管理上極具競爭力。';
      homeEnvAdv = '多運用暖黃柔和燈光與柔軟布藝沙發，增添家庭生活的溫馨與情感流露。';
      break;
    case '水':
      auraTitle = '智深若海 · 財源廣進氣場';
      auraDesc = '全家水氣通達，成員思維敏捷、機變靈活，對市場機遇具備天然嗅覺。利於商務開拓與多元資產積累。';
      homeEnvAdv = '居家宜多增設實木家具或陶藝石材，達到水土相涵、深固根基之效果。';
      break;
  }

  // 3. 兩兩成員交叉關係矩陣 (Cross Matrix)
  const crossMatrix: FamilyPairRelation[] = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const m1 = members[i];
      const m2 = members[j];
      const dm1 = m1.chart.dayMaster.stem;
      const dm2 = m2.chart.dayMaster.stem;
      const el1 = m1.dayMasterElement;
      const el2 = m2.dayMasterElement;
      const b1 = m1.chart.pillars.day.branch;
      const b2 = m2.chart.pillars.day.branch;

      let score = 75;
      let rel = '默契相伴';
      let desc = '';

      if (STEM_COMBINATIONS[dm1]?.partner === dm2) {
        score = 95;
        rel = '天干正合';
        desc = `${m1.name}（${m1.role}）與${m2.name}（${m2.role}）天干化合，心意互通，是家庭中最具凝聚力的默契拍檔。`;
      } else if (BRANCH_SIX_COMBINATIONS[b1]?.partner === b2) {
        score = 90;
        rel = '地支六合';
        desc = `兩人日支地支六合，相處自在一見如故，彼此能深入理解對方的生活步調。`;
      } else if (BRANCH_SIX_CLASHES[b1]?.target === b2) {
        score = 65;
        rel = '歡喜磨合';
        desc = `兩人地支存在相沖，思考視角或行事節奏截然相反，需學會互相尊重邊界，以幽默感化解分歧。`;
      } else if (FIVE_ELEMENTS_RELATION[el1].generates === el2) {
        score = 85;
        rel = '五行生扶';
        desc = `${m1.name}五行生扶${m2.name}，相處充滿呵護與包容，能給予實質情感與生活支撐。`;
      } else if (FIVE_ELEMENTS_RELATION[el2].generates === el1) {
        score = 85;
        rel = '五行生扶';
        desc = `${m2.name}五行生扶${m1.name}，在關鍵決策時能給予對方深厚信心與助益。`;
      } else {
        score = 80;
        rel = '平穩同心';
        desc = `兩人氣場平穩，日常生活有商有量，各司其職維護家庭安寧。`;
      }

      crossMatrix.push({
        fromName: m1.name,
        fromRole: m1.role,
        toName: m2.name,
        toRole: m2.role,
        relationType: rel,
        score,
        description: desc,
      });
    }
  }

  // 4. 家庭角色歸屬 (Family Roles Distribution)
  const roleCategories: {
    roleCategory: '家族舵手 (引領者)' | '心靈潤滑 (調和者)' | '活力開拓 (創新者)' | '穩健基石 (守護者)';
    membersAssigned: string[];
    description: string;
  }[] = [
    {
      roleCategory: '家族舵手 (引領者)',
      membersAssigned: members.filter((m) => m.assignedFamilyArchetype.includes('舵手')).map((m) => `${m.name} (${m.role})`),
      description: '負責家庭重大決策與方向定錨，具備定力與責任感。',
    },
    {
      roleCategory: '心靈潤滑 (調和者)',
      membersAssigned: members.filter((m) => m.assignedFamilyArchetype.includes('調和')).map((m) => `${m.name} (${m.role})`),
      description: '負責成員間情緒傾聽與誤解化解，是家庭溫暖的源泉。',
    },
    {
      roleCategory: '活力開拓 (創新者)',
      membersAssigned: members.filter((m) => m.assignedFamilyArchetype.includes('開拓')).map((m) => `${m.name} (${m.role})`),
      description: '為家庭注入朝氣與創意活力，激發家庭生活情趣與前進動力。',
    },
    {
      roleCategory: '穩健基石 (守護者)',
      membersAssigned: members.filter((m) => m.assignedFamilyArchetype.includes('基石')).map((m) => `${m.name} (${m.role})`),
      description: '把控家庭資源與日常作息底線，保障家庭安全無虞。',
    },
  ];

  // 確保每個分類至少有提示文字（若無成員指派，寫「待發掘」）
  roleCategories.forEach((rc) => {
    if (rc.membersAssigned.length === 0) {
      rc.membersAssigned.push('由全體成員共同兼任');
    }
  });

  // 5. 家族和睦調適心法 (Harmony Guidelines)
  const harmonyGuidelines = [
    {
      title: `家庭五行平衡調適（補強缺失的「${lacking}」五行）`,
      advice: `全家整體氣場中「${lacking}」能量相對偏弱。日常居家可多以相關五行色彩、擺飾或生活習慣進行調理，平衡全家身心磁場。`,
    },
    {
      title: '世代溝通與界線尊重心法',
      advice: '長輩與晚輩相處，以「先肯定其情緒，再討論具體事宜」為黃金準則；夫妻之間避免在孩子面前爭執，維護家庭安全感。',
    },
    {
      title: '每週家庭定心共聚時刻',
      advice: '建議每週設立一個「家庭無手機晚餐夜」或共同戶外散步時間，分享生活中的小喜悅，凝聚家族精神寄託。',
    },
  ];

  return {
    familyTitle,
    memberCount: members.length,
    members,
    householdAura: {
      dominantElement: dominant,
      lackingElement: lacking,
      elementBreakdown: avgBreakdown,
      auraTitle,
      description: auraDesc,
      homeEnvironmentAdvice: homeEnvAdv,
    },
    crossMatrix,
    familyRoles: roleCategories,
    harmonyGuidelines,
  };
}
