import { TEMPLE_POEM_LOTS } from './lots.js';
import {
  BwaBweiResult,
  BwaBweiType,
  TempleDrawOptions,
  TempleInquiryAspect,
  TemplePoemLot,
} from './types.js';

/**
 * 抽籤演算法（隨機抽取台灣六十甲子籤筒中的一竹籤，1 ~ 60）
 * 程式確定性抽籤，杜絕 AI 臆測與捏造
 */
export function drawTempleLot(options: TempleDrawOptions = {}): TemplePoemLot {
  const { customLotId } = options;

  if (customLotId !== undefined && customLotId >= 1 && customLotId <= TEMPLE_POEM_LOTS.length) {
    const matched = TEMPLE_POEM_LOTS.find((l) => l.id === customLotId);
    if (matched) return matched;
  }

  // 均勻隨機抽取 1 ~ 60 號竹籤
  const randomIndex = Math.floor(Math.random() * TEMPLE_POEM_LOTS.length);
  return TEMPLE_POEM_LOTS[randomIndex];
}

/**
 * 擲筊演算法 (Bwa Bwei / 擲筶)
 * 傳統閩南與台灣廟宇筊杯為兩個半月形木塊：
 * 一面平坦為陽（陽面/正），一面圓弧隆起為陰（陰面/反）。
 * 擲筊物理機率：
 * 1. 聖筊（一平一凸 / 一正一反）：神明應允、確認此籤（理論機率約 50%）
 * 2. 笑筊（雙平朝上 / 雙陽）：神明發笑、事情未明、心意不定（理論機率約 25%）
 * 3. 陰筊/無筊（雙凸朝上 / 雙陰）：神明不允、非此籤、不可行（理論機率約 25%）
 */
export function castBwaBwei(customType?: BwaBweiType): BwaBweiResult {
  if (customType) {
    if (customType === 'sheng_bwei') {
      return {
        type: 'sheng_bwei',
        typeName: '聖筊',
        block1: 'flat',
        block2: 'round',
        isAccepted: true,
        meaning: '神明聖示應允確認！此籤確實為神明所賜，萬事吉利，請取籤詩解讀。',
        advice: '心誠則靈，請恭敬捧讀籤文，細思神明開示之玄機與行動方針。',
      };
    }
    if (customType === 'xiao_bwei') {
      return {
        type: 'xiao_bwei',
        typeName: '笑筊',
        block1: 'flat',
        block2: 'flat',
        isAccepted: false,
        meaning: '雙陽朝天（笑筊）。神明微笑不語，或因所求之事不夠具體、或您心中早有答案毋須多問、或時機尚在轉變中。',
        advice: '請放寬心神，重新在心中整理稟報的問題與生辰訴求，再行請示。',
      };
    }
    return {
      type: 'yin_bwei',
      typeName: '陰筊',
      block1: 'round',
      block2: 'round',
      isAccepted: false,
      meaning: '雙陰朝天（陰筊/怒筊/無筊）。神明不允或非此籤；說明方向有偏、時機未到、或所抽之籤並非對應您的正籤。',
      advice: '請將竹籤放回籤筒重新搖籤，並以謙卑省察之心重新向神明叩問。',
    };
  }

  // 獨立擲兩塊筊杯
  // Math.random() < 0.5 模擬每塊筊杯正反落地
  const b1: 'flat' | 'round' = Math.random() < 0.5 ? 'flat' : 'round';
  const b2: 'flat' | 'round' = Math.random() < 0.5 ? 'flat' : 'round';

  if (b1 !== b2) {
    // 一平一凸 -> 聖筊
    return {
      type: 'sheng_bwei',
      typeName: '聖筊',
      block1: b1,
      block2: b2,
      isAccepted: true,
      meaning: '神明聖示應允確認！此籤確實為神明所賜，萬事吉利，請取籤詩解讀。',
      advice: '心誠則靈，請恭敬捧讀籤文，細思神明開示之玄機與行動方針。',
    };
  } else if (b1 === 'flat') {
    // 雙平朝上 -> 笑筊
    return {
      type: 'xiao_bwei',
      typeName: '笑筊',
      block1: b1,
      block2: b2,
      isAccepted: false,
      meaning: '雙陽朝天（笑筊）。神明微笑不語，或因所求之事不夠具體、或您心中早有答案毋須多問、或時機尚在轉變中。',
      advice: '請放寬心神，重新在心中整理稟報的問題與生辰訴求，再行請示。',
    };
  } else {
    // 雙凸朝上 -> 陰筊
    return {
      type: 'yin_bwei',
      typeName: '陰筊',
      block1: b1,
      block2: b2,
      isAccepted: false,
      meaning: '雙陰朝天（陰筊/怒筊/無筊）。神明不允或非此籤；說明方向有偏、時機未到、或所抽之籤並非對應您的正籤。',
      advice: '請將竹籤放回籤筒重新搖籤，並以謙卑省察之心重新向神明叩問。',
    };
  }
}

/**
 * 依籤號取得籤詩資料
 */
export function getTemplePoemLotById(id: number): TemplePoemLot | undefined {
  return TEMPLE_POEM_LOTS.find((l) => l.id === id);
}

/**
 * 依天干地支（如「甲子」、「癸亥」）取得籤詩資料
 */
export function getTemplePoemLotByStemBranch(stemBranch: string): TemplePoemLot | undefined {
  return TEMPLE_POEM_LOTS.find((l) => l.stemBranch === stemBranch.trim());
}

/**
 * 取得完整六十甲子籤庫清單
 */
export function getAllTemplePoemLots(): TemplePoemLot[] {
  return [...TEMPLE_POEM_LOTS];
}

/**
 * 針對使用者指定的問事面向格式化解籤報告
 */
export function formatTemplePoemAspectReport(
  lot: TemplePoemLot,
  aspect: TempleInquiryAspect = 'general'
): { aspectTitle: string; aspectInterpretation: string } {
  const aspectTitles: Record<TempleInquiryAspect, string> = {
    career: '功名仕途與考運轉職',
    wealth: '求財經商與投資利潤',
    marriage: '婚姻感情與姻緣復合',
    health: '疾病康泰與求醫身體',
    pregnancy: '六甲產育與添丁求子',
    lawsuit: '官司訴訟與是非和解',
    travel: '遠行出國與移居遷徙',
    lostItem: '失物尋覓與失落方位',
    family: '家運宅舍與門戶平安',
    business: '作事創業與合夥營運',
    general: '綜合聖意指引',
  };

  let interp = lot.holyDecree;
  if (aspect !== 'general' && lot.aspects[aspect]) {
    interp = lot.aspects[aspect];
  }

  return {
    aspectTitle: aspectTitles[aspect] || '聖意指引',
    aspectInterpretation: interp,
  };
}
