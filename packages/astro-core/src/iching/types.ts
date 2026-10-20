export type YaoType = 6 | 7 | 8 | 9; // 6: 老陰(變), 7: 少陽, 8: 少陰, 9: 老陽(變)

export interface YaoDetail {
  position: 1 | 2 | 3 | 4 | 5 | 6; // 1: 初爻 ... 6: 上爻
  value: YaoType;
  isYang: boolean;
  isChanging: boolean;
  targetIsYang: boolean; // 變爻後的陰陽
  name: string; // 例如 "初九", "六二"
}

export interface HexagramInfo {
  binary: string; // 例如 "111111" 代表乾
  name: string; // 卦名，例如 "乾為天"
  trigrams: {
    upper: string; // 上卦名，如 "天"
    lower: string; // 下卦名，如 "天"
  };
  judgment: string; // 卦辭
  image: string; // 象傳
  lines: string[]; // 六爻爻辭
}

export interface DivinationResult {
  mode: 'coin' | 'plum_blossom';
  timestamp: string;
  originalYaoList: YaoDetail[];
  baseHexagram: HexagramInfo;
  transformedHexagram?: HexagramInfo; // 之卦/變卦
  nuclearHexagram: HexagramInfo; // 互卦
  complementaryHexagram: HexagramInfo; // 錯卦
  invertedHexagram: HexagramInfo; // 綜卦
  changingLineIndexes: number[]; // 動爻位置 (1~6)
  interpretation: {
    general: string;
    career: string;
    love: string;
    wealth: string;
  };
}
