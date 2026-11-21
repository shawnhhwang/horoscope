export interface LlmConfig {
  enabled: boolean;
  provider: 'openai-compatible' | 'anthropic' | 'gemini' | 'custom';
  endpoint: string;
  apiKey: string;
  model: string;
  temperature: number;
  systemPrompt: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChartContext {
  moduleType: 'ZIWEI' | 'BAZI' | 'ICHING' | 'NAME' | 'WESTERN' | 'TAROT' | 'QIZHENG' | 'ALMANAC' | string;
  title?: string;
  summary?: string;
  rawData?: any;
}

export interface ModuleRoleProfile {
  title: string;
  rolePersona: string;
  toneGuidelines: string;
  consultationStructure: string[];
  coreKnowledge: string;
}

export interface LlmChatResult {
  reply: string;
  model: string;
  source: 'external_api' | 'celestial_builtin';
}
