export type ArcanaType = 'major' | 'minor';

export type TarotSuit = 'wands' | 'cups' | 'swords' | 'pentacles'; // 權杖(火), 聖杯(水), 寶劍(風), 錢幣/星幣(土)

export interface TarotCard {
  id: number; // 0 ~ 77
  nameEn: string;
  nameZh: string;
  arcana: ArcanaType;
  suit?: TarotSuit;
  number: number;
  element: '火' | '水' | '風' | '土';
  uprightMeaning: {
    keywords: string[];
    overview: string;
    love: string;
    career: string;
  };
  reversedMeaning: {
    keywords: string[];
    overview: string;
    love: string;
    career: string;
  };
  imagePlaceholder?: string;
}

export type SpreadType = 'single' | 'three_cards' | 'holy_triangle' | 'two_choices' | 'celtic_cross';

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  positionIndex: number;
  positionName: string;
  positionMeaning: string;
}

export interface TarotReadingResult {
  spreadType: SpreadType;
  spreadTitle: string;
  drawnCards: DrawnCard[];
  timestamp: string;
  overallAdvice: string;
}
