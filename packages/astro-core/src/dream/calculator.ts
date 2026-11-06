import { DREAM_CATEGORIES, DREAM_DICTIONARY } from './dictionary.js';
import {
  DreamAnalysisResult,
  DreamCategory,
  DreamEntry,
  DreamOmenLevel,
  DreamSearchResult,
} from './types.js';

/**
 * 依關鍵字與分類檢索周公解夢詞庫
 */
export function searchDreamDictionary(
  query: string,
  category?: DreamCategory
): DreamSearchResult {
  const q = query.trim().toLowerCase();

  let pool = DREAM_DICTIONARY;
  if (category) {
    pool = pool.filter((e) => e.category === category);
  }

  if (!q) {
    return {
      query: '',
      category,
      matchedEntries: pool,
      total: pool.length,
    };
  }

  const matches = pool.filter((entry) => {
    // 匹配核心關鍵字
    if (entry.keyword.toLowerCase().includes(q)) return true;
    // 匹配別名/複合詞
    if (entry.aliasKeywords.some((alias) => alias.toLowerCase().includes(q))) return true;
    // 匹配白話詳解或原典
    if (entry.vernacularMeaning.toLowerCase().includes(q)) return true;
    if (entry.classicText.toLowerCase().includes(q)) return true;
    return false;
  });

  return {
    query,
    category,
    matchedEntries: matches,
    total: matches.length,
  };
}

/**
 * 取得指定分類之所有解夢詞條
 */
export function getDreamEntriesByCategory(category: DreamCategory): DreamEntry[] {
  return DREAM_DICTIONARY.filter((e) => e.category === category);
}

/**
 * 取得所有解夢大類及統計計數
 */
export function getAllDreamCategories(): {
  key: DreamCategory;
  name: string;
  icon: string;
  description: string;
  count: number;
}[] {
  return DREAM_CATEGORIES.map((cat) => ({
    ...cat,
    count: DREAM_DICTIONARY.filter((e) => e.category === cat.key).length,
  }));
}

/**
 * 依 ID 取得單一詞條
 */
export function getDreamEntryById(id: string): DreamEntry | undefined {
  return DREAM_DICTIONARY.find((e) => e.id === id);
}

/**
 * 夢境交織智慧剖析：傳入求測者長篇夢境敘述，自動抽樣匹配多個意象並進行周公吉凶與心理學整合
 */
export function interpretDreamScenario(scenarioText: string): DreamAnalysisResult {
  const text = scenarioText.trim();
  if (!text) {
    const defaultEntry = DREAM_DICTIONARY[0];
    return {
      scenario: '',
      matchedKeywords: [defaultEntry.keyword],
      entries: [defaultEntry],
      dominantOmen: defaultEntry.omen,
      synthesis: {
        omenSummary: defaultEntry.vernacularMeaning,
        psychologicalCore: defaultEntry.psychologicalAnalysis,
        actionGuidance: defaultEntry.actionAdvice,
      },
    };
  }

  // 自動掃描詞庫中所有匹配的意象
  const matchedEntries: DreamEntry[] = [];
  const matchedKeywords: string[] = [];

  for (const entry of DREAM_DICTIONARY) {
    const isKeywordMatched = text.includes(entry.keyword);
    const matchedAlias = entry.aliasKeywords.find((alias) => text.includes(alias));

    if (isKeywordMatched || matchedAlias) {
      matchedEntries.push(entry);
      matchedKeywords.push(matchedAlias || entry.keyword);
    }
  }

  // 若無精確匹配，提供專屬自性心靈解析，避免強行硬塞無關圖騰
  let finalEntries: DreamEntry[];
  let finalKeywords: string[];

  if (matchedEntries.length > 0) {
    finalEntries = matchedEntries;
    finalKeywords = matchedKeywords;
  } else {
    const customEntry: DreamEntry = {
      id: 'dream_custom_scenario',
      keyword: '心靈意象',
      aliasKeywords: ['自訂夢境'],
      category: 'event',
      categoryName: '生死婚喪墜落奔逃',
      classicText: '《莊子·齊物論》：「昔者莊周夢為胡蝶，栩栩然胡蝶也。俄然覺，則蘧蘧然周也。」',
      omen: '平吉',
      vernacularMeaning: '您的夢境呈現獨特的心靈敘事脈絡，未直接命中傳統古籍單一圖騰，代表潛意識正以當代生活場景進行記憶重構與情緒代謝。',
      psychologicalAnalysis: '在榮格心理學中，跳脫古典圖騰的個人化夢境，常反映自性（The Self）對近期生活壓力的調節與轉化。夢中體驗的情緒感受正是潛意識給您的真實信號。',
      actionAdvice: '建議記錄下醒來時最鮮明的情緒關鍵詞，以正念調適身心；亦可點擊下方 AI 大師深度解讀進行全息推演。',
    };
    finalEntries = [customEntry];
    finalKeywords = ['自性心靈投射'];
  }

  // 評定主導吉凶
  const omenScores: Record<DreamOmenLevel, number> = {
    大吉: 3,
    中吉: 2.5,
    吉: 2,
    平吉: 1,
    平: 0,
    吉帶凶: -1,
    凶: -2,
    大凶: -3,
  };

  let totalScore = 0;
  for (const entry of finalEntries) {
    totalScore += omenScores[entry.omen] || 0;
  }
  const avgScore = totalScore / finalEntries.length;

  let dominantOmen: DreamOmenLevel = '平吉';
  if (avgScore >= 2.2) dominantOmen = '大吉';
  else if (avgScore >= 1.2) dominantOmen = '吉';
  else if (avgScore >= 0.3) dominantOmen = '平吉';
  else if (avgScore >= -0.5) dominantOmen = '平';
  else if (avgScore >= -1.5) dominantOmen = '吉帶凶';
  else if (avgScore >= -2.5) dominantOmen = '凶';
  else dominantOmen = '大凶';

  const omenSummary = `您的夢境交織了【${finalKeywords.join('、')}】等多重意象。整體吉凶趨向為「${dominantOmen}」。${finalEntries
    .slice(0, 2)
    .map((e) => `${e.keyword}：${e.vernacularMeaning}`)
    .join(' ')}`;

  const psychologicalCore = `從榮格與深層心理學視角解讀，此夢境反映了您近期在現實生活中的心理投射：${finalEntries
    .slice(0, 2)
    .map((e) => e.psychologicalAnalysis)
    .join(' ')}`;

  const actionGuidance = `生活調適指引：${finalEntries
    .slice(0, 2)
    .map((e) => e.actionAdvice)
    .join(' ')}`;

  return {
    scenario: text,
    matchedKeywords: finalKeywords,
    entries: finalEntries,
    dominantOmen,
    synthesis: {
      omenSummary,
      psychologicalCore,
      actionGuidance,
    },
  };
}
