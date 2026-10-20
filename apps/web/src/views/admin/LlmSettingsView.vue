<template>
  <div class="space-y-6">
    <!-- 標題列 -->
    <div class="flex items-center justify-between border-b border-admin-gold/15 pb-4">
      <div>
        <h2 class="font-serif font-bold text-xl text-admin-gold tracking-wide">AI 靈犀大語言模型配置 (LLM Settings)</h2>
        <p class="text-xs text-admin-muted mt-1 font-serif">
          集中管理萬象天儀全系統之 LLM 諮詢端點、API Key、模型名稱與命理大師人格 Prompt。支援 OpenAI 相容協議。
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="testConnection"
          :disabled="testing"
          class="px-4 py-2 rounded-lg border border-admin-gold/40 text-admin-gold text-xs font-serif hover:bg-admin-gold/10 transition-colors disabled:opacity-50"
        >
          <span v-if="testing">連線測試中...</span>
          <span v-else>連線與解盤測試 ⚡</span>
        </button>
        <button
          @click="saveConfig"
          :disabled="saving"
          class="px-5 py-2 rounded-lg bg-admin-gold text-admin-bg font-serif font-bold text-xs hover:bg-yellow-500 transition-colors shadow-lg disabled:opacity-50"
        >
          <span v-if="saving">儲存中...</span>
          <span v-else>儲存配置變更 ✓</span>
        </button>
      </div>
    </div>

    <!-- 訊息提示 -->
    <div v-if="statusMsg" :class="statusType === 'success' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-red-950/40 border-red-500/40 text-red-300'" class="p-4 rounded-xl border text-xs font-serif flex items-center justify-between">
      <span>{{ statusMsg }}</span>
      <button @click="statusMsg = ''" class="opacity-60 hover:opacity-100">✕</button>
    </div>

    <!-- 測試結果彈窗/展示盒 -->
    <div v-if="testResult" class="p-5 rounded-xl border border-admin-gold/30 bg-black/40 space-y-3 font-serif">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-xs text-admin-gold font-bold">連線測試回應成功 (來源: {{ testResult.source }})</span>
        </div>
        <span class="text-[10px] text-admin-muted">Model: {{ testResult.model }}</span>
      </div>
      <div class="text-xs text-admin-text whitespace-pre-wrap leading-relaxed bg-black/30 p-4 rounded-lg border border-admin-gold/10">
        {{ testResult.reply }}
      </div>
      <div class="text-right">
        <button @click="testResult = null" class="text-[11px] text-admin-muted hover:text-admin-gold">收起測試結果</button>
      </div>
    </div>

    <!-- 設定卡片 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 font-serif">
      <!-- 左側 2 欄：核心連線配置 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 服務啟用開關與提供者 -->
        <div class="p-6 rounded-xl border border-admin-gold/15 bg-admin-sidebar space-y-5">
          <h3 class="text-sm font-bold text-admin-gold border-b border-admin-gold/10 pb-2">1. 核心服務開關與供應協議</h3>
          
          <div class="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-admin-gold/10">
            <div>
              <div class="text-xs font-bold text-admin-text">啟用前台天機靈犀助手</div>
              <div class="text-[11px] text-admin-muted mt-0.5">關閉時，前台將顯示閉關修煉提示</div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="form.enabled" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-gold"></div>
            </label>
          </div>

          <div class="space-y-2">
            <label class="text-xs text-admin-muted block">API 協議與供應商規格</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                v-for="p in providers"
                :key="p.id"
                @click="selectProvider(p)"
                :class="form.provider === p.id ? 'border-admin-gold bg-admin-gold/15 text-admin-gold font-bold' : 'border-admin-gold/10 bg-black/20 text-admin-muted'"
                class="p-2.5 rounded-lg border text-xs text-center transition-all hover:border-admin-gold/40 font-sans normal-case"
              >
                {{ p.name }}
              </button>
            </div>
          </div>

          <!-- API 端點 URL -->
          <div class="space-y-1.5">
            <label class="text-xs text-admin-muted block">API 端點 URL (Endpoint)</label>
            <input
              type="text"
              v-model="form.endpoint"
              placeholder="http://192.168.1.3:11434/v1"
              class="w-full bg-black/30 border border-admin-gold/20 rounded-lg px-3 py-2 text-xs text-admin-text focus:outline-none focus:border-admin-gold font-mono normal-case"
              autocapitalize="none"
              autocomplete="off"
              spellcheck="false"
            />
            <span class="text-[10px] text-admin-muted block font-sans">支援任何 OpenAI 相容反向代理、自建 vLLM、Ollama 或 OneAPI / NewAPI 端點。</span>
          </div>

          <!-- API Key -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-xs text-admin-muted block">API 授權密鑰 (API Key)</label>
              <button type="button" @click="showKey = !showKey" class="text-[10px] text-admin-gold hover:underline font-sans">
                {{ showKey ? '隱藏密鑰' : '顯示密鑰' }}
              </button>
            </div>
            <input
              :type="showKey ? 'text' : 'password'"
              v-model="form.apiKey"
              placeholder="Ollama 本地 / 自建無密鑰服務可直接留空"
              class="w-full bg-black/30 border border-admin-gold/20 rounded-lg px-3 py-2 text-xs text-admin-text focus:outline-none focus:border-admin-gold font-mono normal-case"
              autocapitalize="none"
              autocomplete="off"
              spellcheck="false"
            />
            <span class="text-[10px] text-admin-muted block font-sans">若為本機 / 局域網 Ollama 服務無金鑰，請留空即可正常直連推演。</span>
          </div>
        </div>

        <!-- 模型參數設定 -->
        <div class="p-6 rounded-xl border border-admin-gold/15 bg-admin-sidebar space-y-5">
          <h3 class="text-sm font-bold text-admin-gold border-b border-admin-gold/10 pb-2">2. 模型名稱與生成參數</h3>

          <!-- 模型名稱 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between font-sans">
              <label class="text-xs text-admin-muted block">模型名稱 (Model Identifier)</label>
              <span class="text-[10px] text-admin-muted">常用預設點選即填入</span>
            </div>
            <div class="flex flex-wrap gap-1.5 mb-2">
              <button
                type="button"
                v-for="m in modelPresets"
                :key="m"
                @click="form.model = m"
                class="px-2 py-1 rounded bg-black/30 border border-admin-gold/15 text-[10px] text-admin-gold hover:bg-admin-gold/10 transition-colors font-mono font-normal normal-case"
              >
                {{ m }}
              </button>
            </div>
            <input
              type="text"
              v-model="form.model"
              placeholder="gemma4:e2b"
              class="w-full bg-black/30 border border-admin-gold/20 rounded-lg px-3 py-2 text-xs text-admin-text focus:outline-none focus:border-admin-gold font-mono font-normal normal-case"
              autocapitalize="none"
              autocomplete="off"
              spellcheck="false"
            />
            <span class="text-[10px] text-admin-muted block font-sans">字元嚴格區分大小寫，如 Ollama 模型名稱請輸入純小寫 <code class="font-mono text-amber-300">gemma4:e2b</code>。</span>
          </div>

          <!-- Temperature -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs">
              <label class="text-admin-muted">採樣溫度 (Temperature: {{ form.temperature }})</label>
              <span class="text-[10px] text-admin-muted">0.0 (嚴謹命盤數理) ~ 1.0 (靈性玄思發散)</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              v-model.number="form.temperature"
              class="w-full accent-admin-gold cursor-pointer"
            />
          </div>
        </div>
      </div>

      <!-- 右側 1 欄：人設 System Prompt -->
      <div class="space-y-6">
        <div class="p-6 rounded-xl border border-admin-gold/15 bg-admin-sidebar space-y-4 flex flex-col h-full">
          <div class="flex items-center justify-between border-b border-admin-gold/10 pb-2">
            <h3 class="text-sm font-bold text-admin-gold">3. 專業命理顧問 System Prompt</h3>
            <button
              type="button"
              @click="resetPrompt"
              class="text-[10px] text-admin-gold hover:underline"
            >
              恢復預設
            </button>
          </div>

          <p class="text-[11px] text-admin-muted leading-relaxed">
            此 Prompt 定義前台 AI 顧問之言行口吻。系統將在每次對話自動注入求測者當前命盤的完整坐標與專屬角色 RAG 領域知識庫。
          </p>

          <textarea
            v-model="form.systemPrompt"
            rows="14"
            class="w-full flex-1 bg-black/30 border border-admin-gold/20 rounded-lg p-3 text-xs text-admin-text focus:outline-none focus:border-admin-gold leading-relaxed resize-none font-serif"
            placeholder="請輸入 System Prompt..."
          ></textarea>

          <div class="p-3 rounded-lg bg-black/20 border border-admin-gold/10 text-[10px] text-admin-muted space-y-1">
            <div class="text-admin-gold font-bold">✨ 自動上下文注入支援：</div>
            <div>• 紫微斗數：十二宮星曜、生年四化、五行局</div>
            <div>• 四柱八字：四柱干支、十神、五行能量、喜用神</div>
            <div>• 周易六爻：本卦、互卦、變卦爻變、世應爻</div>
            <div>• 韋特塔羅：78張牌位、正逆位靈魂隱喻</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useLlmStore } from '../../stores/llm';

const API_BASE = '/api/v1';

const providers = [
  { id: 'custom', name: 'Ollama 本地 / 局域網', endpoint: 'http://192.168.1.3:11434/v1', model: 'gemma4:e2b' },
  { id: 'openai-compatible', name: 'OpenAI 相容協議', endpoint: 'https://api.openai.com/v1', model: 'gpt-4o' },
  { id: 'anthropic', name: 'Claude API', endpoint: 'https://api.anthropic.com/v1', model: 'claude-3-5-sonnet' },
  { id: 'gemini', name: 'Google Gemini', endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-1.5-pro' },
];

const modelPresets = [
  'gemma4:e2b',
  'llama3',
  'deepseek-r1',
  'gpt-4o',
  'gpt-4o-mini',
  'claude-3-5-sonnet',
  'gemini-1.5-pro',
  'deepseek-chat',
];

const defaultPrompt =
  '你是一位融匯東西方星象與命理體系的現代專業命理諮詢顧問。你精通紫微斗數、四柱八字、現代人本占星、周易決策、韋特塔羅、七政四餘、姓名學與通勝曆法。你的口吻專業、客觀、條理分明且富有人文關懷，嚴禁使用虛假神仙、道士或玄幻小說口吻（如自稱老夫、貧道、天機星君或稱對方為道友）。請依據每次對話自動注入的具體星盤坐標與 RAG 領域知識，為求測者提供清晰、深邃且具實踐價值的診斷與決策建議。';

const form = ref({
  enabled: true,
  provider: 'custom',
  endpoint: 'http://192.168.1.3:11434/v1',
  apiKey: '',
  model: 'gemma4:e2b',
  temperature: 0.7,
  systemPrompt: defaultPrompt,
});

const showKey = ref(false);
const saving = ref(false);
const testing = ref(false);
const statusMsg = ref('');
const statusType = ref<'success' | 'error'>('success');
const testResult = ref<any>(null);

async function getHeaders() {
  const authStore = useAuthStore();
  return await authStore.getAuthHeaders();
}

async function fetchConfig() {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/admin/llm-config`, {
      headers,
    });
    const json = await res.json();
    if (json.success && json.data) {
      form.value = {
        enabled: typeof json.data.enabled === 'boolean' ? json.data.enabled : true,
        provider: json.data.provider || 'custom',
        endpoint: json.data.endpoint || 'http://192.168.1.3:11434/v1',
        apiKey: json.data.apiKey || '',
        model: json.data.model || 'gemma4:e2b',
        temperature: typeof json.data.temperature === 'number' ? json.data.temperature : 0.7,
        systemPrompt: json.data.systemPrompt || defaultPrompt,
      };
    } else {
      // 嘗試從公開狀態 API 取得目前正在生效的模型名稱作為備援
      const statusRes = await fetch(`${API_BASE}/llm/status`);
      const statusJson = await statusRes.json();
      if (statusJson.success && statusJson.data?.model) {
        form.value.model = statusJson.data.model;
      }
    }
  } catch (err: any) {
    console.error('Fetch LLM config error:', err);
  }
}

function selectProvider(p: any) {
  form.value.provider = p.id;
  form.value.endpoint = p.endpoint;
  form.value.model = p.model;
}

function resetPrompt() {
  form.value.systemPrompt = defaultPrompt;
}

async function saveConfig() {
  saving.value = true;
  statusMsg.value = '';
  try {
    // 確保留空或精確去除兩側空白，保留純小寫模型名稱
    if (form.value.model) {
      form.value.model = form.value.model.trim();
    }
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/admin/llm-config`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(form.value),
    });
    const json = await res.json();
    if (json.success) {
      statusType.value = 'success';
      statusMsg.value = 'LLM 配置變更已成功同步至全系統！';
      if (json.data?.apiKey !== undefined) {
        form.value.apiKey = json.data.apiKey;
      }
      if (json.data?.model) {
        form.value.model = json.data.model;
      }
      // 即時同步前台與全域 llmStore 模型名稱
      const llmStore = useLlmStore();
      await llmStore.fetchStatus();
    } else {
      statusType.value = 'error';
      statusMsg.value = json.message || '儲存配置失敗';
    }
  } catch (err: any) {
    statusType.value = 'error';
    statusMsg.value = err.message || '儲存配置異常';
  } finally {
    saving.value = false;
  }
}

async function testConnection() {
  testing.value = true;
  testResult.value = null;
  statusMsg.value = '';
  try {
    await saveConfig();
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/admin/llm-test`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt: '您好，請以專業命理諮詢顧問的口吻，簡要說明八字五行在現代生活中的調和原則。',
      }),
    });
    const json = await res.json();
    if (json.success) {
      testResult.value = json.data;
    } else {
      statusType.value = 'error';
      statusMsg.value = json.message || '連線測試失敗';
    }
  } catch (err: any) {
    statusType.value = 'error';
    statusMsg.value = err.message || '連線測試異常';
  } finally {
    testing.value = false;
  }
}

onMounted(() => {
  fetchConfig();
});
</script>
