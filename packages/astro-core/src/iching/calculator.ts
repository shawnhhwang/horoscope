import { DivinationResult, HexagramInfo, YaoDetail, YaoType } from './types.js';

// 八純卦與二進制映射 (由下至上 3 爻: 1=陽, 0=陰)
const TRIGRAM_NAMES: Record<string, { symbol: string; nature: string }> = {
  '111': { symbol: '乾', nature: '天' },
  '011': { symbol: '兌', nature: '澤' },
  '101': { symbol: '離', nature: '火' },
  '001': { symbol: '震', nature: '雷' },
  '110': { symbol: '巽', nature: '風' },
  '010': { symbol: '坎', nature: '水' },
  '100': { symbol: '艮', nature: '山' },
  '000': { symbol: '坤', nature: '地' },
};

// 64 卦二進制查表 (6 位字串: 下三爻 + 上三爻)
const HEXAGRAM_DICTIONARY: Record<string, { name: string; judgment: string; image: string; lines: string[] }> = {
  '111111': {
    name: '乾為天',
    judgment: '元，亨，利，貞。大哉乾元，萬物資始，乃統天。',
    image: '天行健，君子以自強不息。',
    lines: ['潛龍勿用。', '見龍在田，利見大人。', '君子終日乾乾，夕惕若，厲無咎。', '或躍在淵，無咎。', '飛龍在天，利見大人。', '亢龍有悔。'],
  },
  '000000': {
    name: '坤為地',
    judgment: '元亨，利牝馬之貞。君子有攸往，先迷後得主，利西南得朋。',
    image: '地勢坤，君子以厚德載物。',
    lines: ['履霜，堅冰至。', '直方大，不習無不利。', '含章可貞，或從王事，無成有終。', '括囊，無咎無譽。', '黃裳，元吉。', '龍戰於野，其血玄黃。'],
  },
  '010001': {
    name: '水雷屯',
    judgment: '元亨利貞，勿用有攸往，利建侯。剛柔始交而難生。',
    image: '雲雷屯，君子以經綸。',
    lines: ['磐桓，利居貞，利建侯。', '屯如邅如，乘馬班如。', '即鹿無虞，惟入于林中。', '乘馬班如，求婚媾。', '屯其膏，小貞吉，大貞凶。', '乘馬班如，泣血漣漣。'],
  },
  '100010': {
    name: '山水蒙',
    judgment: '亨。匪我求童蒙，童蒙求我。初筮告，再三瀆，瀆則不告。利貞。',
    image: '山下出泉，蒙。君子以果行育德。',
    lines: ['發蒙，利用刑人，用說桎梏。', '包蒙吉，納婦吉，子克家。', '勿用取女，見金夫，不有躬。', '困蒙，吝。', '童蒙，吉。', '擊蒙，不利為寇，利禦寇。'],
  },
  '010111': {
    name: '水天需',
    judgment: '有孚，光亨，貞吉。利涉大川。需，須也，險在前也。',
    image: '雲上於天，需。君子以飲食宴樂。',
    lines: ['需于郊，利用恆，無咎。', '需于沙，小有言，終吉。', '需于泥，致寇至。', '需于血，出自穴。', '需于酒食，貞吉。', '入于穴，有不速之客三人來，敬之終吉。'],
  },
  '111010': {
    name: '天水訟',
    judgment: '有孚，窒惕，中吉，終凶。利見大人，不利涉大川。',
    image: '天與水違行，訟。君子以做事謀始。',
    lines: ['不永所事，小有言，終吉。', '不克訟，歸而逋，其邑人三百戶無眚。', '食舊德，貞厲，終吉。', '不克訟，復即命，渝安貞吉。', '訟，元吉。', '或錫之鞶帶，終朝三褫之。'],
  },
  '000010': {
    name: '地水師',
    judgment: '貞，丈人吉，無咎。師者，眾也；貞者，正也。',
    image: '地中有水，師。君子以容民畜眾。',
    lines: ['師出以律，否臧凶。', '在師中吉，無咎，王三錫命。', '師或輿尸，凶。', '師左次，無咎。', '田有禽，利執言，無咎。', '大君有命，開國承家，小人勿用。'],
  },
  '010000': {
    name: '水地比',
    judgment: '吉。原筮，元永貞，無咎。不寧方來，後夫凶。',
    image: '地上有水，比。先王以建萬國，親諸侯。',
    lines: ['有孚比之，無咎。有孚盈缶，終來有它吉。', '比之自內，貞吉。', '比之匪人。', '外比之，貞吉。', '顯比，王用三驅，失前禽。', '比之無首，凶。'],
  },
  '110111': {
    name: '風天小畜',
    judgment: '亨。密雲不雨，自我西郊。柔得位而上下應之。',
    image: '風行天上，小畜。君子以懿文德。',
    lines: ['復自道，何其咎，吉。', '牽復，吉。', '輿說輻，夫妻反目。', '有孚，血去惕出，無咎。', '有孚攣如，富以其鄰。', '既雨既處，尚德載，婦貞厲。'],
  },
  '111011': {
    name: '天澤履',
    judgment: '履虎尾，不咥人，亨。柔履剛也。',
    image: '上天下澤，履。君子以辨上下，安民志。',
    lines: ['素履，往無咎。', '履道坦坦，幽人貞吉。', '眇能視，跛能履，履虎尾，咥人，凶。', '履虎尾，愬愬終吉。', '夬履，貞厲。', '視履考祥，其旋元吉。'],
  },
  '000111': {
    name: '地天泰',
    judgment: '小往大來，吉，亨。天地交而萬物通也。',
    image: '天地交，泰。后以財成天地之道，輔相天地之宜，以左右民。',
    lines: ['拔茅茹，以其彙，征吉。', '包荒，用馮河，不遐遺，朋亡，得尚于中行。', '無平不陂，無往不復，艱貞無咎。', '翩翩不富以其鄰，不戒以孚。', '帝乙歸妹，以祉元吉。', '城復于隍，勿用師，自邑告命，貞吝。'],
  },
  '111000': {
    name: '天地否',
    judgment: '否之匪人，不利君子貞，大往小來。天地不交而萬物不通也。',
    image: '天地不交，否。君子以儉德辟難，不可榮以祿。',
    lines: ['拔茅茹，以其彙，貞吉，亨。', '包承，小人吉，大人否亨。', '包羞。', '有命無咎，疇離祉。', '休否，大人吉，其亡其亡，繫于苞桑。', '傾否，先否後喜。'],
  },
  '101111': {
    name: '火天大有',
    judgment: '元亨。柔得尊位，大中而上下應之，曰大有。',
    image: '火在天上，大有。君子以遏惡揚善，順天休命。',
    lines: ['無交害，匪咎，艱則無咎。', '大車以載，有攸往，無咎。', '公用亨于天子，小人弗克。', '匪其彭，無咎。', '厥孚交如，威如，吉。', '自天祐之，吉無不利。'],
  },
  '000101': {
    name: '地火明夷',
    judgment: '利艱貞。內文明而外柔順，以蒙大難，文王以之。',
    image: '明入地中，明夷。君子以蒞眾，用晦而明。',
    lines: ['明夷于飛，垂其翼。君子于行，三日不食。', '明夷，夷于左股，用拯馬壯，吉。', '明夷于南狩，得其大首。', '入于左腹，獲明夷之心，出于門庭。', '箕子之明夷，利貞。', '不明晦，初登于天，後入于地。'],
  },
};

// 取得任意 6 位二進制對應卦象資訊（若詞庫未全，則由上下卦合成）
function getHexagramInfo(binary: string): HexagramInfo {
  const lowerBin = binary.slice(0, 3);
  const upperBin = binary.slice(3, 6);

  const lowerTri = TRIGRAM_NAMES[lowerBin] || { symbol: '坤', nature: '地' };
  const upperTri = TRIGRAM_NAMES[upperBin] || { symbol: '乾', nature: '天' };

  if (HEXAGRAM_DICTIONARY[binary]) {
    const data = HEXAGRAM_DICTIONARY[binary];
    return {
      binary,
      name: data.name,
      trigrams: { upper: upperTri.nature, lower: lowerTri.nature },
      judgment: data.judgment,
      image: data.image,
      lines: data.lines,
    };
  }

  // 自動推導預設卦名
  const fallbackName = `${upperTri.nature}${lowerTri.nature}${upperTri.symbol === lowerTri.symbol ? `為${upperTri.nature}` : '卦'}`;
  return {
    binary,
    name: fallbackName,
    trigrams: { upper: upperTri.nature, lower: lowerTri.nature },
    judgment: `亨通利貞，順天應人，動態平衡。象徵${upperTri.nature}與${lowerTri.nature}交感。`,
    image: `${upperTri.nature}在${lowerTri.nature}上，君子以自強承載，與時偕行。`,
    lines: [
      '初爻：事之初始，宜謹慎沉穩，靜待時機。',
      '二爻：進退得宜，中正祥和，利於合作。',
      '三爻：局勢轉換，面臨波折，警惕無咎。',
      '四爻：接近核心，審時度勢，順水推舟。',
      '五爻：居於尊位，大顯身手，宏圖大展。',
      '上爻：事物登頂，物極必反，知止常足。',
    ],
  };
}

/**
 * 模擬單次拋擲三枚銅錢 (字=2, 龍=3)
 * 2+2+2 = 6 (老陰，動爻)
 * 3+2+2 = 7 (少陽，靜爻)
 * 3+3+2 = 8 (少陰，靜爻)
 * 3+3+3 = 9 (老陽，動爻)
 */
export function tossCoins(): YaoType {
  const c1 = Math.random() < 0.5 ? 2 : 3;
  const c2 = Math.random() < 0.5 ? 2 : 3;
  const c3 = Math.random() < 0.5 ? 2 : 3;
  return (c1 + c2 + c3) as YaoType;
}

/**
 * 執行六爻神卦排演
 * @param customYaoList 若提供則使用指定爻值，否則自動隨機擲六次
 */
export function castCoinDivination(customYaoList?: YaoType[]): DivinationResult {
  const yaoValues = customYaoList || [tossCoins(), tossCoins(), tossCoins(), tossCoins(), tossCoins(), tossCoins()];

  const originalYaoList: YaoDetail[] = yaoValues.map((val, idx) => {
    const pos = (idx + 1) as 1 | 2 | 3 | 4 | 5 | 6;
    const isYang = val === 7 || val === 9;
    const isChanging = val === 6 || val === 9;
    const targetIsYang = isChanging ? !isYang : isYang;
    const posNames = ['初', '二', '三', '四', '五', '上'];
    const name = `${posNames[idx]}${isYang ? '九' : '六'}`;

    return {
      position: pos,
      value: val,
      isYang,
      isChanging,
      targetIsYang,
      name,
    };
  });

  // 本卦二進制 (1~6 爻由下至上)
  const baseBinary = originalYaoList.map((y) => (y.isYang ? '1' : '0')).join('');
  const baseHexagram = getHexagramInfo(baseBinary);

  // 動爻位置 (1-indexed)
  const changingLineIndexes = originalYaoList.filter((y) => y.isChanging).map((y) => y.position as number);

  // 之卦/變卦二進制
  let transformedHexagram: HexagramInfo | undefined = undefined;
  if (changingLineIndexes.length > 0) {
    const transformedBinary = originalYaoList.map((y) => (y.targetIsYang ? '1' : '0')).join('');
    transformedHexagram = getHexagramInfo(transformedBinary);
  }

  // 互卦 (下卦取 2,3,4 爻，上卦取 3,4,5 爻；0-indexed: 1,2,3 與 2,3,4)
  const nuclearBinary = `${baseBinary[1]}${baseBinary[2]}${baseBinary[3]}${baseBinary[2]}${baseBinary[3]}${baseBinary[4]}`;
  const nuclearHexagram = getHexagramInfo(nuclearBinary);

  // 錯卦 (全部 0/1 反轉)
  const complementaryBinary = baseBinary
    .split('')
    .map((b) => (b === '1' ? '0' : '1'))
    .join('');
  const complementaryHexagram = getHexagramInfo(complementaryBinary);

  // 綜卦 (上下顛倒，由 6~1 反序)
  const invertedBinary = baseBinary.split('').reverse().join('');
  const invertedHexagram = getHexagramInfo(invertedBinary);

  return {
    mode: 'coin',
    timestamp: new Date().toISOString(),
    originalYaoList,
    baseHexagram,
    transformedHexagram,
    nuclearHexagram,
    complementaryHexagram,
    invertedHexagram,
    changingLineIndexes,
    interpretation: {
      general: `當前事態呈現【${baseHexagram.name}】之兆。${baseHexagram.judgment}`,
      career: changingLineIndexes.length > 0 ? `動爻在第 ${changingLineIndexes.join(', ')} 爻，預示局勢將發生重組轉向。` : '純卦無動爻，主靜守本道，遵循既定策略穩步推進。',
      love: `互卦為【${nuclearHexagram.name}】，揭示內在深層情愫在於真誠溝通。`,
      wealth: transformedHexagram ? `後續轉為【${transformedHexagram.name}】，財帛之機在於把握時機變化。` : '持盈保泰，不宜冒進投機。',
    },
  };
}

/**
 * 梅花易數數理起卦
 * @param num1 上卦數
 * @param num2 下卦數
 * @param num3 動爻數
 */
export function castPlumBlossom(num1: number, num2: number, num3: number): DivinationResult {
  // 先天八卦數: 乾1, 兌2, 離3, 震4, 巽5, 坎6, 艮7, 坤8
  const TRIGRAM_ORDER = ['111', '011', '101', '001', '110', '010', '100', '000'];

  let upperIdx = num1 % 8;
  if (upperIdx === 0) upperIdx = 8;
  const upperBin = TRIGRAM_ORDER[upperIdx - 1];

  let lowerIdx = num2 % 8;
  if (lowerIdx === 0) lowerIdx = 8;
  const lowerBin = TRIGRAM_ORDER[lowerIdx - 1];

  let changeIdx = num3 % 6;
  if (changeIdx === 0) changeIdx = 6; // 1~6 爻

  const yaos: YaoType[] = [];
  const baseBin = lowerBin + upperBin;

  for (let i = 0; i < 6; i++) {
    const isYang = baseBin[i] === '1';
    const isChange = i + 1 === changeIdx;
    if (isChange) {
      yaos.push(isYang ? 9 : 6);
    } else {
      yaos.push(isYang ? 7 : 8);
    }
  }

  const res = castCoinDivination(yaos);
  res.mode = 'plum_blossom';
  return res;
}
