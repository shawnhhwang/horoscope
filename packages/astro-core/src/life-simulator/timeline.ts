import { Solar } from 'lunar-typescript';
import { calculateBaziChart, getTenGod } from '../bazi/calculator.js';
import { FiveElement, TenGod, BaziChart } from '../bazi/types.js';
import { ActiveDaYunInfo, LifeAttributes, YearlyLifeNode } from './types.js';
import { getTaiwanEraContext, getTaiwanEraRecord } from './taiwan-history.js';
import { calculateInitialAttributes, evolveLifeAttributesByAgeAndFortune } from './rules-engine.js';

// 天干五行對應
const STEM_ELEMENTS: Record<string, FiveElement> = {
  甲: '木', 乙: '木',
  丙: '火', 丁: '火',
  戊: '土', 己: '土',
  庚: '金', 辛: '金',
  壬: '水', 癸: '水',
};

// 天干相沖 (四沖: 甲庚, 乙辛, 丙壬, 丁癸)
const STEM_CLASHES: Record<string, string> = {
  甲: '庚', 庚: '甲',
  乙: '辛', 辛: '乙',
  丙: '壬', 壬: '丙',
  丁: '癸', 癸: '丁',
};

// 地支六沖 (子午, 丑未, 寅申, 卯酉, 辰戌, 巳亥)
const BRANCH_CLASHES: Record<string, string> = {
  子: '午', 午: '子',
  丑: '未', 未: '丑',
  寅: '申', 申: '寅',
  卯: '酉', 酉: '卯',
  辰: '戌', 戌: '辰',
  巳: '亥', 亥: '巳',
};

// 天干五合
const STEM_COMBINES: Record<string, string> = {
  甲: '己', 己: '甲',
  乙: '庚', 庚: '乙',
  丙: '辛', 辛: '丙',
  丁: '壬', 壬: '丁',
  戊: '癸', 癸: '戊',
};

// 地支六合
const BRANCH_COMBINES: Record<string, string> = {
  子: '丑', 丑: '子',
  寅: '亥', 亥: '寅',
  卯: '戌', 戌: '卯',
  辰: '酉', 酉: '辰',
  巳: '申', 申: '巳',
  午: '未', 未: '午',
};

// 人生關鍵社會與生理年齡里程碑 (含 80 億分之一 5 大知己相逢年 18, 22, 26, 30, 34 歲)
const SOCIAL_MILESTONE_AGES = new Set([6, 12, 18, 22, 26, 28, 30, 34, 35, 45, 55, 60, 70, 80, 90]);
const ROMANTIC_ENCOUNTER_AGES = new Set([18, 22, 26, 30, 34]);

/**
 * 依據八字命盤與年齡推算當前生效之大運
 */
export function getActiveDaYun(baziChart: BaziChart, age: number): ActiveDaYunInfo {
  const luckPillars = baziChart.luckPillars || [];
  const firstPillar = luckPillars[0];

  // 起運前 (童限期)
  if (!firstPillar || age < firstPillar.startAge) {
    const monthPillar = baziChart.pillars.month;
    return {
      stem: monthPillar.stem,
      branch: monthPillar.branch,
      tenGod: monthPillar.stemTenGod === '日主' ? '比肩' : (monthPillar.stemTenGod as TenGod),
      startAge: 0,
      endAge: firstPillar ? firstPillar.startAge - 1 : 9,
      isTongXian: true,
    };
  }

  // 尋找對應大運區間
  for (const lp of luckPillars) {
    if (age >= lp.startAge && age <= lp.endAge) {
      return {
        stem: lp.stem,
        branch: lp.branch,
        tenGod: lp.tenGod,
        startAge: lp.startAge,
        endAge: lp.endAge,
        isTongXian: false,
      };
    }
  }

  // 超過排定大運者，順延最後一個大運
  const lastPillar = luckPillars[luckPillars.length - 1];
  return {
    stem: lastPillar.stem,
    branch: lastPillar.branch,
    tenGod: lastPillar.tenGod,
    startAge: lastPillar.endAge + 1,
    endAge: 120,
    isTongXian: false,
  };
}

/**
 * 依據流年五行、日主十神與神煞判定吉凶等級
 */
export function determineFortuneLevel(
  yearElement: FiveElement,
  tenGod: TenGod,
  favorable: FiveElement[],
  harmful: FiveElement[],
  hasClash: boolean
): '大吉' | '小吉' | '平順' | '小凶' | '大凶' {
  const isFavorable = favorable.includes(yearElement);
  const isHarmful = harmful.includes(yearElement);

  if (hasClash) {
    return isHarmful ? '大凶' : '小凶';
  }

  if (isFavorable) {
    // 喜用逢正印、正官、正財、食神更添吉兆
    if (['正印', '正官', '正財', '食神'].includes(tenGod)) {
      return '大吉';
    }
    return '小吉';
  }

  if (isHarmful) {
    // 忌神逢七殺、傷官、劫財雪上加霜
    if (['七殺', '傷官', '劫財'].includes(tenGod)) {
      return '大凶';
    }
    return '小凶';
  }

  return '平順';
}

/**
 * 依據歲數、八字流年、人生階段與台灣時代年輪，生成每一年專屬的深度敘事說明文字 (每年一段)
 */
export function generateAnnualLifeStory(params: {
  age: number;
  ganzhi: string;
  tenGod: TenGod;
  fortuneLevel: string;
  taiwanEraContext: string;
  isKeyMilestone: boolean;
  milestoneReason?: string;
}): { lifeStageTitle: string; annualStory: string } {
  const { age, ganzhi, tenGod, fortuneLevel, taiwanEraContext, isKeyMilestone, milestoneReason } = params;

  let lifeStageTitle = '';
  let stageDescription = '';

  if (age <= 2) {
    lifeStageTitle = '襁褓撫育 · 蒙恩初生';
    stageDescription = `初臨人間${age}載，身處父母至親的呵護之中，天地靈氣初凝，懵懂中感受著家庭的溫暖與人間初醒的氣息。`;
  } else if (age <= 6) {
    lifeStageTitle = '幼學啟蒙 · 稚子純真';
    stageDescription = `幼學之年，雙眸對周遭萬物充滿好奇與探求，開始咿呀學語、識字習禮，童趣盎然，步履日漸穩健。`;
  } else if (age <= 12) {
    lifeStageTitle = '總角之年 · 開智向學';
    stageDescription = `總角垂髫，正值少時求學啟蒙黃金期，與同窗結伴奔跑於市井學校之間，智識開竅，性格格局初現端倪。`;
  } else if (age <= 15) {
    lifeStageTitle = '舞勺束髮 · 少年立志';
    stageDescription = `豆蔻舞勺之歲，心智由童稚漸入沉思，體魄迅猛抽長，開始思索自我志向與少年情懷，學業面臨初階關卡。`;
  } else if (age <= 18) {
    lifeStageTitle = '志學青春 · 高考飛揚';
    stageDescription = `志學盛年，青春激揚，燈下苦讀與升學大考相伴，心中懷抱對廣袤未知世界的無盡憧憬與滿腔熱血。`;
  } else if (age <= 22) {
    lifeStageTitle = '弱冠之年 · 大學探索';
    stageDescription = `弱冠束髮，步入高等學府與獨立探索期，思潮奔湧、廣結同窗摯友，在自由天地下淬鍊專業與初涉社會。`;
  } else if (age <= 26) {
    lifeStageTitle = '初涉商海 · 砥礪鋒芒';
    stageDescription = `初入社會職場，褪去校園青澀，迎向真實社會的競爭與淬鍊，在微小崗位上積累人脈經驗、砥礪意志。`;
  } else if (age <= 30) {
    lifeStageTitle = '立志成家 · 職場中堅';
    stageDescription = `立身之際，職涯漸入佳境或迎來轉道關卡，生活面臨成家立室與經濟獨立的務實思量，肩膀有了沉穩重量。`;
  } else if (age <= 35) {
    lifeStageTitle = '而立奮發 · 執掌風雲';
    stageDescription = `而立鼎盛，無論在事業前線或家庭營造上皆為主心骨，魄力與謀略並進，承上啟下、奮力開疆闢土。`;
  } else if (age <= 40) {
    lifeStageTitle = '不惑蓄勢 · 頂天立地';
    stageDescription = `行至中青年交界，褪去浮躁焦慮，眼界更加深邃篤定，專注於鞏固核心資產、深化專業壁壘與守護家人。`;
  } else if (age <= 45) {
    lifeStageTitle = '中流砥柱 · 經綸世變';
    stageDescription = `四旬不惑，人生步入黃金成熟期，閱歷豐富、處變不驚，在時代浪潮翻湧中肩負社會與家庭雙重樞紐責任。`;
  } else if (age <= 50) {
    lifeStageTitle = '沉穩掌舵 · 兼濟天下';
    stageDescription = `年過不惑漸進天命，視野超越個人得失，開始重視精神厚度與後輩提攜，在順境逆境中皆能沉穩掌舵。`;
  } else if (age <= 55) {
    lifeStageTitle = '知命豁達 · 經世致用';
    stageDescription = `知天命之年，參透人事與天時之運轉機理，取捨自如，在事業上追求穩健致遠，並著手規劃人生第二曲線。`;
  } else if (age <= 60) {
    lifeStageTitle = '花甲耳順 · 傳承薪火';
    stageDescription = `花甲臨近，歷經一甲子輪轉，閱盡人情冷暖與世態炎涼，德高望重、心懷慈悲，備受親友晚輩信賴。`;
  } else if (age <= 65) {
    lifeStageTitle = '榮退交棒 · 悠然自得';
    stageDescription = `卸下職場繁重重擔，由奮進轉向休閒頤養，享受含飴弄孫或寄情山水田園之樂，生活步調從容閒雅。`;
  } else if (age <= 70) {
    lifeStageTitle = '從心所欲 · 漫賞煙霞';
    stageDescription = `從心所欲而不逾矩，身心沉浸於智慧與恬淡之中，看淡名利浮雲，重拾年輕時未竟的雅興與心靈探索。`;
  } else if (age <= 75) {
    lifeStageTitle = '古稀康寧 · 含飴弄孫';
    stageDescription = `人生七十古來稀，兒孫繞膝、天倫和美，健康與心性成為最珍貴的財富，靜品歲月沉澱後的人間清歡。`;
  } else if (age <= 80) {
    lifeStageTitle = '懸車告老 · 坐看雲起';
    stageDescription = `行年近八旬，生活平淡清和、順應天時，記憶中的百年風雲化作笑談，行住坐臥皆透著長者的睿智與祥和。`;
  } else if (age <= 85) {
    lifeStageTitle = '杖朝之壽 · 德範長昭';
    stageDescription = `杖朝至壽，走過一個世紀的大半春秋，在家族中如擎天古樹般庇廕後代，心境超脫物外、敬天愛人。`;
  } else if (age <= 90) {
    lifeStageTitle = '耄耋至境 · 福澤綿長';
    stageDescription = `耄耋高壽，見證滄海變桑田，肉身雖有歲月刻痕，靈魂卻澄澈如琉璃，善名德行廣傳鄉里，福澤深遠。`;
  } else if (age <= 95) {
    lifeStageTitle = '頤樂長春 · 松柏之節';
    stageDescription = `年逾九旬之期頤長春，享天地厚愛，安詳體悟天人合一之化境，舉手投足皆合道法自然。`;
  } else {
    lifeStageTitle = '期頤百歲 · 圓滿通神';
    stageDescription = `期頤人瑞，百年風雲收束於心，圓滿走過一個世紀的風雨與榮光，德業圓滿，堪為人間百歲傳奇。`;
  }

  // 十神行運指引
  const tenGodComments: Record<TenGod, string> = {
    正官: '本歲逢【正官】臨命，主名位確立、貴人提攜，做事有條不紊，利於確立尊嚴與承擔樞紐責任。',
    七殺: '本歲逢【七殺】當值，主魄力剛強、迎難而上，雖有風雨考驗，但能以勇氣斬破荆棘，宜守心防燥。',
    正印: '本歲逢【正印】護持，主心性慈善、學識精進，蒙長輩福庇與書香滋養，適合深造修身與蓄力養望。',
    偏印: '本歲逢【偏印】引動，主直覺敏銳、領悟玄奧，利於在非傳統領域深耕巧思，探索內心深處智慧。',
    正財: '本歲逢【正財】坐鎮，主勤勉得實、基盤穩固，利於財富資產與生活保障的漸進積累，家聲日隆。',
    偏財: '本歲逢【偏財】流轉，主人緣廣闊、機遇頻現，善於把握時勢商機或社交契機，但宜節制投機。',
    食神: '本歲逢【食神】吐秀，主才華橫溢、福壽康寧，生活充滿雅趣與美食溫情，心境舒暢、和氣致祥。',
    傷官: '本歲逢【傷官】高揚，主思維超凡、敢破敢立，才情激盪而光芒耀眼，唯需注意修養口德以和合人脈。',
    比肩: '本歲逢【比肩】相隨，主同儕協力、手足相助，在群體拼搏中相互激發志氣，自尊自立而不孤單。',
    劫財: '本歲逢【劫財】分動，主社交熱絡、氣吞萬里，勇於為理想豪擲心力，需善待眷屬並慎防財務波折。',
  };

  const tenGodText = tenGodComments[tenGod] || `本歲值【${tenGod}】行運，五行氣機交織流轉。`;

  // 吉凶整體氣象
  let fortuneText = '';
  if (fortuneLevel === '大吉') {
    fortuneText = '運勢高懸大吉，吉星高照、順風揚帆，凡有所謀皆得天時地利之助。';
  } else if (fortuneLevel === '小吉') {
    fortuneText = '運途溫潤小吉，穩中有進、步步生蓮，平實中得見諸般歡喜。';
  } else if (fortuneLevel === '平順') {
    fortuneText = '歲運平順安泰，無大風浪亦無驚險，沉潛蓄力、行其所當行正是上乘智慧。';
  } else if (fortuneLevel === '小凶') {
    fortuneText = '流年微有波瀾小凶，宜防微杜漸、以柔克剛，在瑣碎考驗中磨礪心性。';
  } else {
    fortuneText = '歲逢大凶嚴峻考驗，煞氣凝聚、考驗重重，首重固守體魄與修德避險，以靜制動方顯英雄本色。';
  }

  const milestoneText = isKeyMilestone
    ? `\n⭐【命運轉折】：${milestoneReason || '本歲適逢人生重大轉折關隘，此際的每一個抉擇都將在歲月長河中泛起漣漪。'}`
    : '';

  const eraText = taiwanEraContext ? `\n🇹🇼【台灣時代年輪】：${taiwanEraContext}` : '';

  const annualStory = `【${age}歲 · ${lifeStageTitle}】歲次${ganzhi}，${stageDescription}\n\n${tenGodText}${fortuneText}${milestoneText}${eraText}`;

  return { lifeStageTitle, annualStory };
}

/**
 * 依據歲數階段，取得對應之日式寫實風格插畫路徑
 */
export function getLifeStageIllustration(age: number): string {
  if (age <= 2) {
    return '/images/life-simulator/stage_01_infancy.jpg';
  } else if (age <= 11) {
    return '/images/life-simulator/stage_02_childhood.jpg';
  } else if (age <= 17) {
    return '/images/life-simulator/stage_03_youth.jpg';
  } else if (age <= 21) {
    return '/images/life-simulator/stage_04_capping.jpg';
  } else if (age <= 29) {
    return '/images/life-simulator/stage_05_early_career.jpg';
  } else if (age <= 49) {
    return '/images/life-simulator/stage_06_prime.jpg';
  } else if (age <= 64) {
    return '/images/life-simulator/stage_07_mature.jpg';
  } else if (age <= 79) {
    return '/images/life-simulator/stage_08_elder.jpg';
  } else {
    return '/images/life-simulator/stage_09_centenarian.jpg';
  }
}

/**
 * 推算 0～100 歲流年命運時間軸骨幹
 */
export function generate100YearTimeline(birthDate: Date, gender: '男' | '女'): {
  baziChart: BaziChart;
  nodes: YearlyLifeNode[];
} {
  const baziChart = calculateBaziChart(birthDate, gender);
  const birthYear = birthDate.getFullYear();
  const dayStem = baziChart.dayMaster.stem;
  const dayBranch = baziChart.pillars.day.branch;
  const usefulElements = baziChart.favorableElements.useful;
  const harmfulElements = baziChart.favorableElements.harmful;

  // 初始四大領域屬性 (0歲先天稟賦)
  const initialAttributes = calculateInitialAttributes(baziChart);
  let rollingAttributes: LifeAttributes = { ...initialAttributes };

  const nodes: YearlyLifeNode[] = [];

  for (let age = 0; age <= 100; age++) {
    const solarYear = birthYear + age;
    // 取該年年干支 (以年中 June 15 代表該年)
    const midYearSolar = Solar.fromYmd(solarYear, 6, 15);
    const midYearLunar = midYearSolar.getLunar();
    const ganzhi = midYearLunar.getYearInGanZhi();
    const yearStem = ganzhi[0];
    const yearBranch = ganzhi[1];
    const yearElement = STEM_ELEMENTS[yearStem] || '土';
    const tenGod = getTenGod(dayStem, yearStem);

    const daYun = getActiveDaYun(baziChart, age);

    // 刑沖合會判定
    const isStemClash = STEM_CLASHES[dayStem] === yearStem;
    const isBranchClash = BRANCH_CLASHES[dayBranch] === yearBranch;
    const isTianKeDiChong = isStemClash && isBranchClash; // 天剋地沖
    const isSuiYunBingLin = daYun.stem === yearStem && daYun.branch === yearBranch; // 歲運並臨
    const isTianHeDiHe = STEM_COMBINES[dayStem] === yearStem && BRANCH_COMBINES[dayBranch] === yearBranch; // 天合地合

    // 重大里程碑節點判定
    let isKeyMilestone = false;
    const reasons: string[] = [];

    if (age === daYun.startAge && !daYun.isTongXian) {
      isKeyMilestone = true;
      reasons.push(`逢換【${daYun.stem}${daYun.branch}】大運交接關口`);
    }
    if (isSuiYunBingLin) {
      isKeyMilestone = true;
      reasons.push('歲運並臨·逢人生重大轉折關卡');
    }
    if (isTianKeDiChong) {
      isKeyMilestone = true;
      reasons.push('天剋地沖·本命日柱受強烈沖激');
    }
    if (isTianHeDiHe) {
      isKeyMilestone = true;
      reasons.push('天合地合·逢天地合和吉慶轉機');
    }
    if (SOCIAL_MILESTONE_AGES.has(age)) {
      isKeyMilestone = true;
      if (age === 6) reasons.push('童稚啟蒙·開蒙讀書');
      else if (age === 12) reasons.push('青蔥少年·初中青春期心性建立');
      else if (age === 18) reasons.push('成年之禮·大學升學與志向分水嶺');
      else if (age === 22) reasons.push('學成啟航·踏入社會就業面試');
      else if (age === 26) reasons.push('黃金韶華·事業拓荒與知己相逢');
      else if (age === 28) reasons.push('立業適婚·人生黃金打拼與婚姻轉折');
      else if (age === 30) reasons.push('三十而立·立身成家關鍵節點');
      else if (age === 34) reasons.push('三十有四·心智圓熟深耕期');
      else if (age === 35) reasons.push('中年骨幹·職涯晉升或創業轉型期');
      else if (age === 45) reasons.push('不惑之年·健康與家庭責任重大轉折');
      else if (age === 55) reasons.push('知命前奏·資產佈局與第二人生籌劃');
      else if (age === 60) reasons.push('花甲耳順·榮休傳承與心性修為');
      else if (age === 70) reasons.push('古稀之年·身心頤養與家族天倫');
      else if (age === 80) reasons.push('傘壽大關·看化生死與養生延年');
      else if (age === 90) reasons.push('白壽至境·長壽天年與福德善終');
    }

    if (ROMANTIC_ENCOUNTER_AGES.has(age)) {
      isKeyMilestone = true;
      reasons.push(gender === '女' ? '因緣際會·命中注定的良人盲盒相逢' : '因緣際會·命中注定的紅顏盲盒相逢');
    }

    const eraRecord = getTaiwanEraRecord(solarYear);
    if (eraRecord.isEpidemicOutbreak) {
      isKeyMilestone = true;
      reasons.push(`逢【${eraRecord.theme}】時代重大公衛考驗`);
    }
    const milestoneReason = reasons.join('；');

    const fortuneLevel = determineFortuneLevel(
      yearElement,
      tenGod,
      usefulElements,
      harmfulElements,
      isStemClash || isBranchClash
    );

    const taiwanEraContext = getTaiwanEraContext(solarYear);

    // 依據命盤流年十神、歲數階段與台灣時代背景，產出深度年度敘事說明 (每年一段)
    const { lifeStageTitle, annualStory } = generateAnnualLifeStory({
      age,
      ganzhi,
      tenGod,
      fortuneLevel,
      taiwanEraContext,
      isKeyMilestone,
      milestoneReason: isKeyMilestone ? milestoneReason : undefined,
    });

    // 隨年紀與流年滾動演化四大領域基準值 (健康, 知識, 財富, 情感)
    if (age > 0) {
      rollingAttributes = evolveLifeAttributesByAgeAndFortune({
        prevAttributes: rollingAttributes,
        age,
        tenGod,
        fortuneLevel,
        solarYear,
      });
    }

    nodes.push({
      age,
      nominalAge: age + 1,
      solarYear,
      ganzhi,
      yearElement,
      tenGod,
      daYun,
      fortuneLevel,
      isKeyMilestone,
      milestoneReason: isKeyMilestone ? milestoneReason : undefined,
      taiwanEraContext,
      eraAvgLifeExpectancy: eraRecord.avgLifeExpectancy,
      eraEpidemics: eraRecord.prevailingEpidemics,
      isEpidemicYear: eraRecord.isEpidemicOutbreak,
      lifeStageTitle,
      annualStory,
      annualOverview: `歲次【${ganzhi}】，值【${tenGod}】行運，運勢評定為【${fortuneLevel}】。台灣當代時空背景：${taiwanEraContext}`,
      snapshotAttributes: { ...rollingAttributes },
      isTerminal: false,
    });
  }

  return { baziChart, nodes };
}
