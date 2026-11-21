import { prisma } from '@celestial/database';
import { encryptSecret, decryptSecret } from '../../utils/crypto.js';
import type { LlmConfig } from './types.js';

export const DEFAULT_LLM_CONFIG: LlmConfig = {
  enabled: true,
  provider: 'custom',
  endpoint: process.env.LLM_ENDPOINT || 'http://192.168.1.3:11434/v1',
  apiKey: process.env.LLM_API_KEY || '',
  model: process.env.LLM_MODEL || 'gemma4:e2b',
  temperature: 0.7,
  systemPrompt:
    '你是一位融匯東西方星象與命理體系的現代專業命理諮詢顧問。你精通紫微斗數、四柱八字、現代人本占星、周易決策、韋特塔羅、七政四餘、姓名學與通勝曆法。你的口吻專業、客觀、條理分明且富有人文關懷，嚴禁使用虛假神仙、道士或玄幻小說口吻（如自稱老夫、貧道、天機星君或稱對方為道友）。【排盤與抽牌確定性鐵律】：本系統所有八字四柱干支、地支藏干、十神、大運；紫微斗數命身宮、五行局、十二宮位星曜與生年四化；以及塔羅牌 78 張牌庫與 6 種經典牌陣之抽牌結果，均由底層程式庫（@celestial/astro-core）嚴密排定與隨機抽出。AI 僅負責依據排盤客觀數據進行解盤諮詢，嚴禁自行計算、猜測、捏造或修改四柱干支、紫微星盤或塔羅抽牌結果。請依據每次對話自動注入的具體星盤坐標與 RAG 領域知識，為求測者提供清晰、深邃且具實踐價值的診斷與決策建議。',
};

export async function getLlmConfig(): Promise<LlmConfig> {
  try {
    const configRow = await prisma.systemConfig.findUnique({
      where: { key: 'LLM_CONFIG' },
    });
    if (configRow?.value) {
      const parsed = JSON.parse(configRow.value);
      if (
        parsed.systemPrompt &&
        (parsed.systemPrompt.includes('天機星君') ||
          parsed.systemPrompt.includes('國師級大師') ||
          !parsed.systemPrompt.includes('確定性鐵律'))
      ) {
        parsed.systemPrompt = DEFAULT_LLM_CONFIG.systemPrompt;
        await prisma.systemConfig
          .update({
            where: { key: 'LLM_CONFIG' },
            data: { value: JSON.stringify({ ...parsed, systemPrompt: DEFAULT_LLM_CONFIG.systemPrompt }) },
          })
          .catch(() => {});
      }
      const decryptedKey = decryptSecret(parsed.apiKey || '');
      return {
        ...DEFAULT_LLM_CONFIG,
        ...parsed,
        apiKey: decryptedKey,
      };
    }
  } catch (err) {
    console.error('Failed to get LLM config from DB, using defaults:', err);
  }
  return { ...DEFAULT_LLM_CONFIG };
}

export async function saveLlmConfig(newConfig: Partial<LlmConfig>): Promise<LlmConfig> {
  const current = await getLlmConfig();
  const plainKey = typeof newConfig.apiKey === 'string' ? newConfig.apiKey : current.apiKey;
  const mergedPlain: LlmConfig = {
    ...current,
    ...newConfig,
    apiKey: plainKey,
    temperature: typeof newConfig.temperature === 'number' ? newConfig.temperature : current.temperature,
    enabled: typeof newConfig.enabled === 'boolean' ? newConfig.enabled : current.enabled,
  };

  const persisted = {
    ...mergedPlain,
    apiKey: encryptSecret(plainKey),
  };

  await prisma.systemConfig.upsert({
    where: { key: 'LLM_CONFIG' },
    update: {
      value: JSON.stringify(persisted),
      updatedAt: new Date(),
    },
    create: {
      key: 'LLM_CONFIG',
      value: JSON.stringify(persisted),
      description: '萬象天儀 AI 專業命理與星象諮詢後端端點與配置',
    },
  });

  return mergedPlain;
}
