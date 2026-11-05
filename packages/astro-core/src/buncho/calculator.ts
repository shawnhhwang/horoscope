import { BUNCHO_LOTS } from './lots.js';
import { BunchoDrawOptions, BunchoDrawResult, BunchoLot } from './types.js';

/**
 * 文鳥抽籤演算法核心 (Java Sparrow Fortune-Telling / Buncho Omikuji)
 * 由底層程式邏輯進行均勻隨機抽籤，杜絕 AI 臆測與捏造籤牌
 */
export function drawBunchoLot(options: BunchoDrawOptions = {}): BunchoDrawResult {
  const { question = '所求吉凶指引', aspect = '綜合', customLotId } = options;

  let chosenLot: BunchoLot;

  if (customLotId !== undefined && customLotId >= 1 && customLotId <= BUNCHO_LOTS.length) {
    chosenLot = BUNCHO_LOTS.find((l) => l.id === customLotId) || BUNCHO_LOTS[0];
  } else {
    // 嚴格使用高質量隨機數均勻洗籤
    const randomIndex = Math.floor(Math.random() * BUNCHO_LOTS.length);
    chosenLot = BUNCHO_LOTS[randomIndex];
  }

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
