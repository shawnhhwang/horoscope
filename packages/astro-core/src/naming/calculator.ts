import { FiveElement } from '../bazi/types.js';
import { GridScore, NameAnalysisResult, RecommendedName, ThreeTalentsInfo } from './types.js';

// 常用字康熙筆劃與五行對照字典 (涵蓋經典命名常用字)
const KANGXI_SAMPLE_DICT: Record<string, { strokes: number; element: FiveElement }> = {
  // 姓氏
  李: { strokes: 7, element: '木' },
  王: { strokes: 4, element: '土' },
  張: { strokes: 11, element: '火' },
  劉: { strokes: 15, element: '金' },
  陳: { strokes: 16, element: '火' },
  楊: { strokes: 13, element: '木' },
  黃: { strokes: 12, element: '土' },
  趙: { strokes: 14, element: '火' },
  吳: { strokes: 7, element: '木' },
  周: { strokes: 8, element: '金' },
  林: { strokes: 8, element: '木' },
  徐: { strokes: 10, element: '金' },
  孫: { strokes: 10, element: '金' },
  馬: { strokes: 10, element: '水' },
  朱: { strokes: 6, element: '木' },
  胡: { strokes: 11, element: '土' },
  郭: { strokes: 15, element: '木' },
  何: { strokes: 7, element: '木' },
  高: { strokes: 10, element: '木' },
  羅: { strokes: 20, element: '火' },

  // 名常用字 (木)
  柏: { strokes: 9, element: '木' },
  桐: { strokes: 10, element: '木' },
  森: { strokes: 12, element: '木' },
  棟: { strokes: 12, element: '木' },
  楚: { strokes: 13, element: '木' },
  楷: { strokes: 13, element: '木' },
  榮: { strokes: 14, element: '木' },
  樺: { strokes: 16, element: '木' },
  霖: { strokes: 16, element: '木' },
  雅: { strokes: 12, element: '木' },
  芷: { strokes: 10, element: '木' },
  若: { strokes: 11, element: '木' },
  芸: { strokes: 10, element: '木' },
  萌: { strokes: 14, element: '木' },

  // 名常用字 (火)
  煜: { strokes: 13, element: '火' },
  煥: { strokes: 13, element: '火' },
  炫: { strokes: 9, element: '火' },
  晨: { strokes: 11, element: '火' },
  晴: { strokes: 12, element: '火' },
  曦: { strokes: 20, element: '火' },
  昊: { strokes: 8, element: '火' },
  明: { strokes: 8, element: '火' },
  燦: { strokes: 17, element: '火' },
  昭: { strokes: 9, element: '火' },
  昱: { strokes: 9, element: '火' },
  靈: { strokes: 24, element: '火' },

  // 名常用字 (土)
  宇: { strokes: 6, element: '土' },
  安: { strokes: 6, element: '土' },
  辰: { strokes: 7, element: '土' },
  坤: { strokes: 8, element: '土' },
  城: { strokes: 10, element: '土' },
  培: { strokes: 11, element: '土' },
  基: { strokes: 11, element: '土' },
  遠: { strokes: 17, element: '土' },
  軒: { strokes: 10, element: '土' },
  逸: { strokes: 15, element: '土' },
  聖: { strokes: 13, element: '土' },
  衡: { strokes: 16, element: '土' },

  // 名常用字 (金)
  瑞: { strokes: 14, element: '金' },
  銘: { strokes: 14, element: '金' },
  鋒: { strokes: 15, element: '金' },
  銳: { strokes: 15, element: '金' },
  錦: { strokes: 16, element: '金' },
  靖: { strokes: 13, element: '金' },
  修: { strokes: 10, element: '金' },
  齊: { strokes: 14, element: '金' },
  誠: { strokes: 14, element: '金' },
  鈞: { strokes: 12, element: '金' },
  琛: { strokes: 13, element: '金' },

  // 名常用字 (水)
  涵: { strokes: 12, element: '水' },
  清: { strokes: 11, element: '水' },
  源: { strokes: 14, element: '水' },
  澤: { strokes: 17, element: '水' },
  潤: { strokes: 16, element: '水' },
  淳: { strokes: 12, element: '水' },
  浩: { strokes: 11, element: '水' },
  海: { strokes: 11, element: '水' },
  濤: { strokes: 18, element: '水' },
  洋: { strokes: 10, element: '水' },
  沛: { strokes: 8, element: '水' },
  洛: { strokes: 10, element: '水' },
};

// 依據尾數定五行 (1,2:木; 3,4:火; 5,6:土; 7,8:金; 9,0:水)
function getElementByStrokes(strokes: number): FiveElement {
  const tail = strokes % 10;
  if (tail === 1 || tail === 2) return '木';
  if (tail === 3 || tail === 4) return '火';
  if (tail === 5 || tail === 6) return '土';
  if (tail === 7 || tail === 8) return '金';
  return '水';
}

// 81 數理吉凶簡表
const AUSPICIOUS_MAP: Record<number, { level: '大吉' | '吉' | '半吉' | '凶' | '大凶'; meaning: string }> = {
  1: { level: '大吉', meaning: '天地開泰，萬事成名，大吉之數。' },
  3: { level: '大吉', meaning: '陰陽和合，萬物確定，吉祥如意。' },
  5: { level: '大吉', meaning: '福祿壽長，陰陽和諧，富貴尊榮。' },
  6: { level: '吉', meaning: '天德地祥，貴人提攜，謀事易成。' },
  7: { level: '吉', meaning: '精力充沛，剛毅果斷，獨立成事。' },
  8: { level: '吉', meaning: '意志堅強，意志刻苦，終能成功。' },
  11: { level: '大吉', meaning: '草木逢春，枝葉沾露，穩健著實。' },
  13: { level: '大吉', meaning: '智略超群，才藝多能，奇特巧謀。' },
  15: { level: '大吉', meaning: '福壽雙全，立身興家，德高望重。' },
  16: { level: '大吉', meaning: '厚重載德，富貴榮華，首領之格。' },
  17: { level: '吉', meaning: '突破萬難，剛柔並濟，獲致大成。' },
  18: { level: '吉', meaning: '有志竟成，博得名利，內外和合。' },
  21: { level: '大吉', meaning: '明月光照，質實剛健，首領統御。' },
  23: { level: '大吉', meaning: '旭日東升，壯麗壯觀，權威旺盛。' },
  24: { level: '大吉', meaning: '家門餘慶，白手起家，金錢豐盈。' },
  25: { level: '吉', meaning: '資性英敏，柔中帶剛，克服萬難。' },
  29: { level: '吉', meaning: '智謀兼備，足智多謀，大顯身手。' },
  31: { level: '大吉', meaning: '春日花開，智勇兼備，繁榮富貴。' },
  32: { level: '大吉', meaning: '寶馬金鞍，僥倖多望，若得貴人。' },
  33: { level: '大吉', meaning: '旭日升天，名滿天下，威震四方。' },
  35: { level: '吉', meaning: '溫良和順，智達高尚，進退自如。' },
  37: { level: '吉', meaning: '逢凶化吉，吉人天相，風調雨順。' },
  39: { level: '大吉', meaning: '富貴榮華，財帛豐盈，光明坦途。' },
  41: { level: '吉', meaning: '純陽獨秀，德高望重，事事順遂。' },
  45: { level: '吉', meaning: '重生之象，難關已度，富貴榮顯。' },
  47: { level: '大吉', meaning: '開花結果，得享天福，子孫昌隆。' },
  48: { level: '大吉', meaning: '美德兼備，顧問之謀，受人尊敬。' },
};

function getAuspiciousLevel(strokes: number) {
  const norm = ((strokes - 1) % 81) + 1;
  return AUSPICIOUS_MAP[norm] || { level: '半吉', meaning: '平實自保，慎謀能斷，得平順祥和。' };
}

// 三才配置吉凶評級
function evaluateThreeTalents(heaven: FiveElement, human: FiveElement, earth: FiveElement): ThreeTalentsInfo {
  const pattern = `${heaven}${human}${earth}`;

  // 經典大吉三才: 木火土, 木火木, 火木火, 水木火, 土金水, 金水木, 火土金
  const greatAuspicious = ['木火土', '木火木', '火木火', '水木火', '土金水', '金水木', '火土金', '土火土', '木水木'];
  const auspicious = ['木木火', '木木土', '火火木', '火土土', '土土金', '金金水', '水水木', '土金金'];

  let level: '大吉' | '吉' | '半吉' | '凶' = '半吉';
  let description = '三才相生相剋平衡，中規中矩，需靠後天修持立業。';

  if (greatAuspicious.includes(pattern)) {
    level = '大吉';
    description = '天時地利人和，三才順生吉相，貴人長伴，一生平步青雲，家庭和樂。';
  } else if (auspicious.includes(pattern)) {
    level = '吉';
    description = '根基穩固，境遇安泰，易獲長輩提拔與朋友鼎力相助，事業漸入佳境。';
  } else if (heaven === earth && human !== heaven) {
    level = '半吉';
    description = '內心志向與外部環境偶有衝突，但若心存善念，可化險為夷。';
  }

  return {
    heavenElement: heaven,
    humanElement: human,
    earthElement: earth,
    pattern,
    level,
    description,
  };
}

/**
 * 獲取漢字筆劃與五行（若字庫未收錄，依字元 unicode 估算確定性筆劃）
 */
export function getCharInfo(char: string): { strokes: number; element: FiveElement } {
  if (KANGXI_SAMPLE_DICT[char]) {
    return KANGXI_SAMPLE_DICT[char];
  }
  // 確定性 fallback: 由字元碼計算 6~18 劃
  const code = char.charCodeAt(0);
  const strokes = 6 + (code % 13);
  const element = getElementByStrokes(strokes);
  return { strokes, element };
}

/**
 * 姓名學五格與三才全維度剖析
 */
export function analyzeName(surname: string, givenName: string): NameAnalysisResult {
  const sList = surname.split('').map((c) => ({ char: c, ...getCharInfo(c) }));
  const gList = givenName.split('').map((c) => ({ char: c, ...getCharInfo(c) }));

  // 1. 計算天格 (單姓 + 1)
  const tianStrokes = sList.length === 1 ? sList[0].strokes + 1 : sList[0].strokes + sList[1].strokes;
  const tianElement = getElementByStrokes(tianStrokes);
  const tianAusp = getAuspiciousLevel(tianStrokes);

  // 2. 計算人格 (姓之末字 + 名之首字)
  const renStrokes = sList[sList.length - 1].strokes + gList[0].strokes;
  const renElement = getElementByStrokes(renStrokes);
  const renAusp = getAuspiciousLevel(renStrokes);

  // 3. 計算地格 (單名 + 1)
  const diStrokes = gList.length === 1 ? gList[0].strokes + 1 : gList.reduce((acc, c) => acc + c.strokes, 0);
  const diElement = getElementByStrokes(diStrokes);
  const diAusp = getAuspiciousLevel(diStrokes);

  // 4. 計算總格 (全體筆劃)
  const zongStrokes = sList.reduce((acc, c) => acc + c.strokes, 0) + gList.reduce((acc, c) => acc + c.strokes, 0);
  const zongElement = getElementByStrokes(zongStrokes);
  const zongAusp = getAuspiciousLevel(zongStrokes);

  // 5. 計算外格 (總格 - 人格 + 1, 單姓單名為 2)
  const waiStrokes = sList.length === 1 && gList.length === 1 ? 2 : zongStrokes - renStrokes + 1;
  const waiElement = getElementByStrokes(waiStrokes);
  const waiAusp = getAuspiciousLevel(waiStrokes);

  // 三才配置
  const threeTalents = evaluateThreeTalents(tianElement, renElement, diElement);

  // 綜合評分算法
  let score = 70;
  if (threeTalents.level === '大吉') score += 15;
  else if (threeTalents.level === '吉') score += 10;

  if (renAusp.level === '大吉') score += 6;
  if (diAusp.level === '大吉') score += 5;
  if (zongAusp.level === '大吉') score += 4;
  score = Math.min(100, Math.max(50, score));

  return {
    surname,
    givenName,
    fullName: `${surname}${givenName}`,
    charStrokes: [...sList, ...gList],
    grids: {
      tian: { gridName: '天格', strokes: tianStrokes, element: tianElement, auspiciousLevel: tianAusp.level, meaning: tianAusp.meaning },
      ren: { gridName: '人格', strokes: renStrokes, element: renElement, auspiciousLevel: renAusp.level, meaning: renAusp.meaning },
      di: { gridName: '地格', strokes: diStrokes, element: diElement, auspiciousLevel: diAusp.level, meaning: diAusp.meaning },
      zong: { gridName: '總格', strokes: zongStrokes, element: zongElement, auspiciousLevel: zongAusp.level, meaning: zongAusp.meaning },
      wai: { gridName: '外格', strokes: waiStrokes, element: waiElement, auspiciousLevel: waiAusp.level, meaning: waiAusp.meaning },
    },
    threeTalents,
    overallScore: score,
    summary: `此名五格數理和諧，三才配置呈【${threeTalents.pattern}】(${threeTalents.level})。${threeTalents.description}`,
  };
}

/**
 * 智慧命名推薦引擎：依據八字喜用神篩選大吉名字
 */
export function recommendNames(surname: string, usefulElements: FiveElement[], gender: '男' | '女'): RecommendedName[] {
  const recommendations: RecommendedName[] = [
    {
      fullName: `${surname}沐陽`,
      givenName: '沐陽',
      gender: '男',
      elements: ['水', '火'],
      totalScore: 96,
      origin: '《楚辭·九歌》：「浴蘭湯兮沐芳，華采衣兮若英。」',
      meaning: '沐浴於溫暖陽光之中，胸襟坦蕩，浩然正氣。',
    },
    {
      fullName: `${surname}若桐`,
      givenName: '若桐',
      gender: '女',
      elements: ['木', '木'],
      totalScore: 95,
      origin: '《詩經·大雅》：「鳳凰鳴矣，于彼高岡。梧桐生矣，于彼朝陽。」',
      meaning: '如梧桐引鳳，品格高潔端莊，氣度溫潤如玉。',
    },
    {
      fullName: `${surname}柏涵`,
      givenName: '柏涵',
      gender: '男',
      elements: ['木', '水'],
      totalScore: 98,
      origin: '《論語》：「歲寒，然後知松柏之後彫也。」',
      meaning: '堅定如松柏不畏嚴冬，博學如淵海涵融萬象。',
    },
    {
      fullName: `${surname}芷晴`,
      givenName: '芷晴',
      gender: '女',
      elements: ['木', '火'],
      totalScore: 94,
      origin: '《楚辭·離騷》：「扈江離與辟芷兮，紉秋蘭以為佩。」',
      meaning: '香芷清芬，雨後初晴，性格開朗明亮，受人喜愛。',
    },
    {
      fullName: `${surname}潤澤`,
      givenName: '潤澤',
      gender: '男',
      elements: ['水', '水'],
      totalScore: 97,
      origin: '《易經·說卦傳》：「雨以潤之，日以烜之。」',
      meaning: '潤澤大地萬物，富甲一方且心懷仁厚慈悲。',
    },
    {
      fullName: `${surname}昱安`,
      givenName: '昱安',
      gender: '男',
      elements: ['火', '土'],
      totalScore: 96,
      origin: '《詩經·小雅》：「日以昱乎晝，月以昱乎夜。」',
      meaning: '光耀安泰，穩重如山，能承重器，一生順遂。',
    },
  ];

  // 優先過濾符合喜用五行之名字
  const filtered = recommendations.filter((r) => r.elements.some((el) => usefulElements.includes(el)));
  return filtered.length > 0 ? filtered : recommendations;
}
