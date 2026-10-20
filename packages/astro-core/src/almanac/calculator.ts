import { Solar } from 'lunar-typescript';
import { DailyAlmanac, DayOfficerName, HourFortune, ZodiacHoroscope } from './types.js';

/**
 * 歌訣與建除神煞含義映射
 */
const OFFICER_MEANINGS: Record<DayOfficerName, { meaning: string; nature: '吉' | '凶' | '平' }> = {
  建: { meaning: '萬物生育，宜謀劃、動土、建功，不宜涉險破壞。', nature: '吉' },
  除: { meaning: '除舊佈新，宜沐浴、求醫、掃除、去晦，百事吉慶。', nature: '吉' },
  滿: { meaning: '天地豐滿，宜進口、開市、立券，不宜入宅、動土。', nature: '平' },
  平: { meaning: '平實安穩，平正平衡，修路、修飾吉，訴訟破土凶。', nature: '平' },
  定: { meaning: '安定奠定，冠帶、納採、嫁娶、祈福大吉，不宜訴訟爭辯。', nature: '吉' },
  執: { meaning: '執持正道，造屋、捕捉、種植吉，移徙、出巡凶。', nature: '平' },
  破: { meaning: '破舊立新，日值破煞，唯宜破屋拆卸，諸事不宜。', nature: '凶' },
  危: { meaning: '登高履危，居安思危，宜祭祀祈福，遠行、涉險不宜。', nature: '凶' },
  成: { meaning: '成就完滿，入學、開市、嫁娶、赴任皆吉，詞訟爭端凶。', nature: '吉' },
  收: { meaning: '收穫納藏，收進蓄存吉，出財、安葬凶。', nature: '吉' },
  開: { meaning: '天開地闢，百花齊放，開市、求財、見貴大吉，埋葬閉塞凶。', nature: '吉' },
  閉: { meaning: '閉藏固本，築堤、防漏、補垣吉，求醫、遠行、開市凶。', nature: '平' },
};

/**
 * 二十八星宿歌訣摘要
 */
const MANSION_CHANTS: Record<string, { nature: '吉' | '凶'; chant: string }> = {
  角: { nature: '吉', chant: '角星造作主榮昌，外朝內府進田莊。嫁娶婚姻生貴子，文人及第早登堂。' },
  亢: { nature: '凶', chant: '亢星造作長房當，十日之中主禍殃。田地消磨官事起，兒孫代代守空房。' },
  氐: { nature: '凶', chant: '氐星造作主災凶，費盡田園倉庫空。埋葬若還逢此日，旬朝必定見官司。' },
  房: { nature: '吉', chant: '房星造作得稱心，錢財進益旺家門。富貴榮華長久在，婚姻恩愛福綿長。' },
  心: { nature: '凶', chant: '心星造作大為凶，更遭刑害及逃亡。買賣田園多耗散，三年之內有災秧。' },
  尾: { nature: '吉', chant: '尾星造作得天恩，招財進寶旺兒孫。開門放水招田產，代代公卿侍帝門。' },
  箕: { nature: '吉', chant: '箕星造作主高強，歲歲倉箱儲蓄盈。埋葬若還逢此日，官榮位顯佐明君。' },
  斗: { nature: '吉', chant: '斗星造作主招財，官職榮升爵位來。進益田莊生貴子，門庭光彩免災危。' },
  牛: { nature: '凶', chant: '牛星造作事難成，行船不利有漂沉。若是嫁娶逢此日，夫妻反目苦伶仃。' },
  女: { nature: '凶', chant: '女星造作事徒然，兄弟相爭各有嫌。若有嫁娶逢此日，公姑不和產難生。' },
  虛: { nature: '凶', chant: '虛星造作主災殃，家門不利哭聲長。富貴變貧官事起，萬般憂患在身旁。' },
  危: { nature: '凶', chant: '危星造作禍偏多，災殃日夜起風波。動土若還逢此日，三年之內損兒郎。' },
  室: { nature: '吉', chant: '室星造作進田莊，富貴榮華福壽長。門庭若逢斯日照，代代官高入朝堂。' },
  壁: { nature: '吉', chant: '壁星造作主增財，絲蠶大熟旺家階。開門放水多吉慶，嫁娶榮華錦繡來。' },
  奎: { nature: '凶', chant: '奎星造作得高樓，家門富貴福難酬。唯有埋葬逢此日，官事牽連不到頭。' },
  婁: { nature: '吉', chant: '婁星豎柱起高樓，家道興隆永無憂。開市納財多吉利，世代簪纓伴帝遊。' },
  胃: { nature: '吉', chant: '胃星造作事皆通，買賣求財大興隆。埋葬婚姻皆吉利，公侯卿相立奇功。' },
  昴: { nature: '凶', chant: '昴星造作主官災，兄弟相分不可偕。買賣田園皆廢盡，出入多憂見病衰。' },
  畢: { nature: '吉', chant: '畢星造作主興隆，祭祀婚姻萬事通。買賣經商多得利，福祿雙全壽似松。' },
  觜: { nature: '凶', chant: '觜星造作有凶災，盜賊驚惶事不和。埋葬若還逢此日，三年官事哭悲哀。' },
  參: { nature: '吉', chant: '參星造作旺人家，文星照耀顯才華。買田置產多吉慶，世代官高福無涯。' },
  井: { nature: '吉', chant: '井星造作旺蠶桑，買賣求財吉利長。埋葬開門多富貴，代代兒孫步玉堂。' },
  鬼: { nature: '凶', chant: '鬼星起造卒無成，盜賊橫行禍更迎。若是婚姻逢此日，夫妻反目各飄零。' },
  柳: { nature: '凶', chant: '柳星造作主遭官，晝夜驚惶不得安。埋葬若還逢此日，家門破敗損丁男。' },
  星: { nature: '吉', chant: '星宿造作得清和，田莊豐盛利桑禾。埋葬婚姻皆大吉，兒孫代代福無訛。' },
  張: { nature: '吉', chant: '張星日好造龍軒，年年富貴進田莊。埋葬婚姻皆吉利，公侯將相入朝堂。' },
  翼: { nature: '凶', chant: '翼星不利架高堂，三年二載見災殃。商賈求財多阻隔，婚姻離散哭聲長。' },
  軫: { nature: '吉', chant: '軫星臨日主榮華，買賣招財進萬家。婚姻嫁娶生貴子，世代衣冠拜帝家。' },
};

/**
 * 依西曆日期推算全量傳統黃曆數據
 */
export function calculateDailyAlmanac(dateInput: Date = new Date()): DailyAlmanac {
  const solar = Solar.fromDate(dateInput);
  const lunar = solar.getLunar();

  // 年月日干支
  const yearGz = lunar.getYearInGanZhi();
  const monthGz = lunar.getMonthInGanZhi();
  const dayGz = lunar.getDayInGanZhi();
  const zodiacAnimal = lunar.getYearShengXiao();

  // 節氣
  const jieQi = lunar.getJieQi() || `${lunar.getPrevJieQi().getName()}氣候中`;

  // 建除十二神
  const rawZhiXing = lunar.getZhiXing() || '建';
  const zhiXingTradMap: Record<string, DayOfficerName> = {
    建: '建',
    除: '除',
    满: '滿',
    滿: '滿',
    平: '平',
    定: '定',
    执: '執',
    執: '執',
    破: '破',
    危: '危',
    成: '成',
    收: '收',
    开: '開',
    開: '開',
    闭: '閉',
    閉: '閉',
  };
  const dayOfficerName: DayOfficerName = zhiXingTradMap[rawZhiXing] || '建';
  const officerMeta = OFFICER_MEANINGS[dayOfficerName] || { meaning: '天星行度平穩', nature: '吉' as const };

  // 二十八宿
  const xiuShort = lunar.getXiu() || '角';
  const xiuName = lunar.getXiu() + (lunar.getAnimal() || '') + (lunar.getXiuSong()?.slice(0, 1) || '');
  const xiuMeta = MANSION_CHANTS[xiuShort] || { nature: '吉' as const, chant: '吉星高照，諸事清和。' };

  // 九星
  const nineStar = lunar.getDayNineStar();

  // 宜忌
  const yi = lunar.getDayYi();
  const ji = lunar.getDayJi();

  // 喜神/財神/福神方位
  const joyGod = lunar.getDayPositionXiDesc();
  const wealthGod = lunar.getDayPositionCaiDesc();
  const blessingGod = lunar.getDayPositionFuDesc();
  const yangNoble = lunar.getDayPositionYangGuiDesc();
  const yinNoble = lunar.getDayPositionYinGuiDesc();

  // 衝煞
  const chongDesc = lunar.getDayChongDesc();
  const shaDirection = lunar.getDaySha();

  // 十二時辰吉凶
  const hourlyFortunes = generateHourlyFortunes(lunar);

  // 十二生肖今日運勢評估
  const zodiacHoroscopes = generateZodiacHoroscopes(dayGz);

  // 十天干日主流日十神與指南
  const dayMasterGuidance = generateDayMasterGuidance(dayGz[0]);

  const dateStr = `${solar.getYear()}-${String(solar.getMonth()).padStart(2, '0')}-${String(solar.getDay()).padStart(2, '0')}`;

  return {
    date: dateStr,
    lunarDate: {
      yearGanZhi: yearGz,
      zodiacAnimal,
      lunarMonthName: `${lunar.getMonthInChinese()}月`,
      lunarDayName: lunar.getDayInChinese(),
      formatted: `農曆${yearGz}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    },
    solarTerm: jieQi,
    ganzhi: {
      year: yearGz,
      month: monthGz,
      day: dayGz,
    },
    nayinDay: lunar.getDayNaYin(),
    dayOfficer: {
      name: dayOfficerName,
      meaning: officerMeta.meaning,
      nature: officerMeta.nature,
    },
    twentyEightMansion: {
      mansionName: `${xiuShort}宿 (${xiuName})`,
      element: lunar.getXiuLuck() || '木',
      nature: xiuMeta.nature,
      chant: xiuMeta.chant,
    },
    nineFlyingStar: {
      name: nineStar.toString(),
      nature: `掌${nineStar.getWuXing() || '五行'}氣機`,
    },
    suitableActivities: yi.length > 0 ? yi : ['祭祀', '祈福', '安床', '開市', '動土'],
    unsuitableActivities: ji.length > 0 ? ji : ['行險', '詞訟', '爭端', '破壞'],
    deityDirections: {
      joyGod,
      wealthGod,
      blessingGod,
      yangNoble,
      yinNoble,
    },
    clashInfo: {
      clashAnimal: chongDesc,
      shaDirection: `煞${shaDirection}`,
      evilAnimalAges: `歲煞在${shaDirection}方，諸事宜敬慎`,
    },
    hourlyFortunes,
    zodiacHoroscopes,
    dayMasterGuidance,
  };
}

/**
 * 計算十二時辰吉凶神煞
 */
function generateHourlyFortunes(lunar: any): HourFortune[] {
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const times = [
    '23:00-01:00',
    '01:00-03:00',
    '03:00-05:00',
    '05:00-07:00',
    '07:00-09:00',
    '09:00-11:00',
    '11:00-13:00',
    '13:00-15:00',
    '15:00-17:00',
    '17:00-19:00',
    '19:00-21:00',
    '21:00-23:00',
  ];

  const auspiciousSpirits = ['青龍', '明堂', '金匱', '天德', '玉堂', '司命'];
  const spirits = ['青龍', '明堂', '天刑', '朱雀', '金匱', '天德', '白虎', '玉堂', '天牢', '玄武', '司命', '勾陳'];

  // 日支定起點
  const dayBranch = lunar.getDayZhi();
  const startIdx = (branches.indexOf(dayBranch) * 2) % 12;

  return branches.map((b, i) => {
    const spirit = spirits[(startIdx + i) % 12];
    const isAuspicious = auspiciousSpirits.includes(spirit);
    return {
      branch: b,
      timeSpan: times[i],
      spiritName: spirit,
      isAuspicious,
    };
  });
}

/**
 * 依流日干支推演十二生肖今日運勢
 */
function generateZodiacHoroscopes(dayGz: string): ZodiacHoroscope[] {
  const dayBranch = dayGz[1];
  const animals = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];
  const branchMap: Record<string, string> = {
    子: '鼠',
    丑: '牛',
    寅: '虎',
    卯: '兔',
    辰: '龍',
    巳: '蛇',
    午: '馬',
    未: '羊',
    申: '猴',
    酉: '雞',
    戌: '狗',
    亥: '豬',
  };

  // 六合局
  const sixHarmonies: Record<string, string> = {
    子: '牛',
    丑: '鼠',
    寅: '豬',
    卯: '狗',
    辰: '雞',
    巳: '猴',
    午: '羊',
    未: '馬',
    申: '蛇',
    酉: '龍',
    戌: '兔',
    亥: '虎',
  };

  // 六沖局
  const sixClashes: Record<string, string> = {
    子: '馬',
    丑: '未',
    寅: '猴',
    卯: '雞',
    辰: '狗',
    巳: '豬',
    午: '鼠',
    未: '牛',
    申: '寅',
    酉: '卯',
    戌: '辰',
    亥: '巳',
  };

  const harmonyAnimal = branchMap[sixHarmonies[dayBranch]];
  const clashAnimal = branchMap[sixClashes[dayBranch]];
  const selfAnimal = branchMap[dayBranch];

  return animals.map((a) => {
    if (a === harmonyAnimal) {
      return {
        animal: a,
        score: 96,
        stars: 5,
        tag: '六合大吉·貴人照應',
        advice: '今日運勢極旺，得歲星暗合相助，適宜商務合作、重要簽約或情感表白，主事半功倍。',
      };
    }
    if (a === clashAnimal) {
      return {
        animal: a,
        score: 65,
        stars: 2,
        tag: '逢沖相剋·謹言慎行',
        advice: '日逢地支衝擊，心緒易起微瀾。今日宜守勿攻，避免與人意氣之爭，出入注意交通與合約細節。',
      };
    }
    if (a === selfAnimal) {
      return {
        animal: a,
        score: 82,
        stars: 4,
        tag: '同氣相投·厚積薄發',
        advice: '行值本氣當令之日，主事體現領導魅力。適合整飭內務、擬定下階段戰略規劃。',
      };
    }
    // 其他常態
    const hash = (a.charCodeAt(0) + dayGz.charCodeAt(0) + dayGz.charCodeAt(1)) % 15;
    const score = 78 + hash;
    const stars = score >= 88 ? 5 : score >= 82 ? 4 : 3;
    return {
      animal: a,
      score,
      stars,
      tag: stars >= 4 ? '平順遂心·諸事皆吉' : '步步為營·隨緣安適',
      advice: '氣機清爽，人際合和。順應今日日值吉星，專注本業自有佳音。',
    };
  });
}

/**
 * 依流日天干推演十天干日主之十神與行動指南
 */
function generateDayMasterGuidance(dayStem: string) {
  const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const tenGodMatrix: Record<string, Record<string, { tenGod: string; guidance: string }>> = {};

  const tenGodNames: Record<string, string> = {
    比肩: '比肩同氣：利於團隊協作、結識志同道合之友，但需防開支分散。',
    劫財: '劫財星動：交際應酬增多，投資理財宜留退路，戒驕戒躁。',
    食神: '食神吐秀：思維敏捷靈感豐沛，利於創作、品味生活與宴飲聚會。',
    傷官: '傷官展才：才華橫溢突破舊規，唯言語宜溫和，莫恃才傲物。',
    偏財: '偏財臨身：商業機遇隱現，利於商務談判、開拓外源與意外收穫。',
    正財: '正財安穩：正途收入穩步進益，按部就班履行職責必獲回報。',
    七殺: '七殺歷練：承擔挑戰與壓力，適合雷厲風行推進艱困項目，需防急躁。',
    正官: '正官得位：官貴星顯，利於向上匯報、考試認證與樹立公信權威。',
    偏印: '偏印悟道：靈性直覺極強，宜深研玄學、獨處沉思與技藝精進。',
    正印: '正印庇佑：得長輩貴人關照，心神安泰，宜進修學習與修養身心。',
  };

  // 五行
  const stemElem: Record<string, '木' | '火' | '土' | '金' | '水'> = {
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

  const elemIndex: Record<string, number> = { 木: 0, 火: 1, 土: 2, 金: 3, 水: 4 };

  const guidanceResult: Record<string, { tenGod: string; guidance: string }> = {};

  for (const master of stems) {
    const mElemIdx = elemIndex[stemElem[master]];
    const dElemIdx = elemIndex[stemElem[dayStem]];
    const diff = (dElemIdx - mElemIdx + 5) % 5;
    const samePolarity = stems.indexOf(master) % 2 === stems.indexOf(dayStem) % 2;

    let tg = '';
    if (diff === 0) tg = samePolarity ? '比肩' : '劫財';
    else if (diff === 1) tg = samePolarity ? '食神' : '傷官';
    else if (diff === 2) tg = samePolarity ? '偏財' : '正財';
    else if (diff === 3) tg = samePolarity ? '七殺' : '正官';
    else tg = samePolarity ? '偏印' : '正印';

    guidanceResult[master] = {
      tenGod: tg,
      guidance: tenGodNames[tg] || '氣候調和，順其自然。',
    };
  }

  return guidanceResult;
}
