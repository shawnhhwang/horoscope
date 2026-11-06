import { BUNCHO_LOTS } from './lots.js';
import { BunchoDrawOptions, BunchoDrawResult, BunchoLot } from './types.js';

export const BUNCHO_TWENTY_EIGHT_MANSIONS = [
  '角木蛟', '亢金龍', '氐土貉', '房日兔', '心月狐', '尾火虎', '箕水豹',
  '斗木獬', '牛金牛', '女土蝠', '虛日鼠', '危月燕', '室火豬', '壁水貐',
  '奎木狼', '婁金狗', '胃土雉', '昴日雞', '畢月烏', '觜火猴', '參水猿',
  '井木犴', '鬼金羊', '柳土獐', '星日馬', '張月鹿', '翼火蛇', '軫水蚓',
];

/**
 * 文鳥抽籤演算法核心 (Java Sparrow Fortune-Telling / Buncho Omikuji)
 * 由底層程式邏輯進行均勻隨機抽籤，杜絕 AI 臆測與捏造籤牌
 */
export function drawBunchoLot(options: BunchoDrawOptions = {}): BunchoDrawResult {
  const { question = '所求吉凶指引', aspect = '綜合', customLotId } = options;

  let rawLot: BunchoLot;

  if (customLotId !== undefined && customLotId >= 1 && customLotId <= BUNCHO_LOTS.length) {
    rawLot = BUNCHO_LOTS.find((l) => l.id === customLotId) || BUNCHO_LOTS[0];
  } else {
    // 嚴格使用高質量隨機數均勻洗籤
    const randomIndex = Math.floor(Math.random() * BUNCHO_LOTS.length);
    rawLot = BUNCHO_LOTS[randomIndex];
  }

  const chosenLot: BunchoLot = {
    ...rawLot,
    mansion: BUNCHO_TWENTY_EIGHT_MANSIONS[(rawLot.id - 1) % BUNCHO_TWENTY_EIGHT_MANSIONS.length],
  };

  return {
    lot: chosenLot,
    question: question.trim() || '所求吉凶指引',
    aspect: aspect || '綜合',
    drawnAt: new Date().toISOString(),
  };
}

/**
 * 取得所有文鳥靈籤清單
 */
export function getAllBunchoLots(): BunchoLot[] {
  return [...BUNCHO_LOTS];
}

/**
 * 依籤號查找靈籤
 */
export function getBunchoLotById(id: number): BunchoLot | undefined {
  return BUNCHO_LOTS.find((l) => l.id === id);
}
