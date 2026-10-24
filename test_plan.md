# 意圖導向測試計劃 (Intent-Based Test Plan)

> **制定日期**：2026-10-20
> **核心準則**：[`AGENTS.md`](file:///home/coder/Codebase/Horoscope/AGENTS.md) **Rule 4 (Goal-Driven Execution)**、**Rule 9 (Intent-Based Testing)**、**Rule 12 (Fail Loudly)**
> **合格測試標準**：測試必須驗證「業務意圖（Intent）」而非僅檢查表面行為（如僅檢查 HTTP 200）；當核心業務規則（如角色設定、去道士化語氣、節氣交界、外鍵完整性）被破壞時，測試必須立即失敗。

---

## 一、 測試範圍與分層架構

本測試計劃分為四大測試套件（Test Suites），涵蓋從底層曆法演算、後端 Role-RAG 與認證安全，到前端 UI/UX 與安全渲染：

1. **Suite A — 核心命理與星曆演算法意圖測試 (`@celestial/astro-core`)**
   - 測試檔案：[`packages/astro-core/test/astro.test.ts`](file:///home/coder/Codebase/Horoscope/packages/astro-core/test/astro.test.ts)
2. **Suite B — 8 大模組專屬角色 RAG 與「去仙人化語氣」意圖測試 (`@celestial/server`)**
   - 測試檔案：`apps/server/test/role-rag.test.ts`（新增專項測試）
3. **Suite C — 認證授權 (RBAC)、Demo Mode 外鍵完整性與 API 整合測試 (`@celestial/server`)**
   - 測試檔案：[`apps/server/test/api.test.ts`](file:///home/coder/Codebase/Horoscope/apps/server/test/api.test.ts)
4. **Suite D — 前端全寬度解析面板、XSS 防護與跨主題視覺驗證 (`@celestial/web`)**
   - 測試目標：[`InPageAiAnalysis.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/components/ai/InPageAiAnalysis.vue)、[`VaultView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/VaultView.vue)、[`LlmSettingsView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/LlmSettingsView.vue) 及 8 大命理視圖。

---

## 二、 詳細測試案例規格 (Test Case Specifications)

### Suite A：核心命理與星曆演算法意圖測試 (`packages/astro-core`)

| 案例 ID | 測試模組 | 測試場景與輸入 | 預期意圖斷言 (Intent Assertions) |
| :--- | :--- | :--- | :--- |
| **TC-A01** | 八字四柱 ([`bazi.ts`](file:///home/coder/Codebase/Horoscope/packages/astro-core/src/bazi/index.ts)) | 輸入立春前後之出生時間（例：立春前一日 vs 立春後一日）與真太陽時經度修正 | 1. 年柱與月柱必須嚴格依太陽黃經節氣（立春）切換。<br>2. 四柱天干地支、藏干、十神、五行權重、大運起運歲數計算具 100% 確定性。 |
| **TC-A02** | 紫微斗數 ([`ziwei.ts`](file:///home/coder/Codebase/Horoscope/packages/astro-core/src/ziwei/index.ts)) | 輸入不同農曆出生年月日時與性別 | 1. 十二宮位（命宮、兄弟、夫妻…）排列無重複且逆時針完整。<br>2. 五行局（水二局至火六局）、命主、身主、14 主星與四化（祿權科忌）正確落宮。 |
| **TC-A03** | 西洋本命星盤 ([`western.ts`](file:///home/coder/Codebase/Horoscope/packages/astro-core/src/western/index.ts)) | 輸入含經緯度之出生時間 | 1. 十大行星黃經度數皆位於 `[0, 360)` 區間。<br>2. 上升星座 (`ascendantSign`)、天頂 (`mcSign`)、十二宮頭與主要相位（合、衝、三分、四分、六分）容許度計算正確。 |
| **TC-A04** | 七政四餘 ([`qizheng.ts`](file:///home/coder/Codebase/Horoscope/packages/astro-core/src/qizheng/index.ts)) | 輸入出生時間與經緯度 | 1. 完整輸出七政（日月金木水火土）與四餘（紫氣、月孛、羅睺、計都）共 11 星體。<br>2. 二十八宿度數歸屬與命宮宿度無誤。 |
| **TC-A05** | 易經六爻 ([`iching.ts`](file:///home/coder/Codebase/Horoscope/packages/astro-core/src/iching/index.ts)) | 輸入含動爻（老陰 `6`、老陽 `9`）與靜爻（少陽 `7`、少陰 `8`）之六爻陣列 | 1. 本卦卦名、卦辭、世應爻與六親配置正確。<br>2. 動爻精確陰陽反轉並產出對應之「之卦（變卦）」。 |
| **TC-A06** | 塔羅占卜 ([`tarot.ts`](file:///home/coder/Codebase/Horoscope/packages/astro-core/src/tarot/index.ts)) | 輸入單張、三張（時間之流）、塞爾特十字牌陣與隨機種子 | 1. 抽出之牌卡 ID 不重複。<br>2. 正逆位狀態、元素屬性與牌位意義完整對應。 |
| **TC-A07** | 姓名學五格 ([`naming.ts`](file:///home/coder/Codebase/Horoscope/packages/astro-core/src/naming/index.ts)) | 輸入單姓雙名、單姓單名、複姓雙名 | 1. 康熙字典筆畫換算與天格、人格、地格、外格、總格計算正確。<br>2. 三才配置（天地人五行生剋）與 81 數理吉凶判定一致。 |
| **TC-A08** | 通勝農民曆 ([`almanac.ts`](file:///home/coder/Codebase/Horoscope/packages/astro-core/src/almanac/index.ts)) | 輸入指定西曆日期 | 1. 轉換農曆日期、干支紀日、值日十二建除、二十八星宿、吉神凶煞、彭祖百忌與每日宜忌完整非空。 |
| **TC-A09** | 八字合婚與天紀合盤 ([`synastry.ts`](file:///home/coder/Codebase/Horoscope/packages/astro-core/src/bazi/synastry.ts)) | 輸入雙方八字生辰與性別 | 1. 計算天干五合、夫妻宮合沖、五行互補評分與通關五行。<br>2. 對標 ziwei-doushu-main 產出紫微斗數×倪海廈《天紀》五步合盤法、雙宮聯參總評、夫妻宮星曜倪師原話。 |
| **TC-A10** | 家人群組與八卦名位 ([`synastry.ts`](file:///home/coder/Codebase/Horoscope/packages/astro-core/src/bazi/synastry.ts)) | 輸入家庭成員陣列 (父、母、長子、次女) | 1. 推算全家五行場域主導/匱乏能量與 $C(N, 2)$ 關係矩陣。<br>2. 準確配置倪海廈《天紀·地脈道》後天八卦名位（乾父西北、坤母西南、震長子正東、離次女正南）與陽宅錯位禁忌。 |
| **TC-A11** | 紫微行運大盤與純星名四化 ([`calculator.ts`](file:///home/coder/Codebase/Horoscope/packages/astro-core/src/ziwei/calculator.ts)) | 輸入本命排盤與目標推演年份 (如 2026 丙午) | 1. 正確定位大限宮位（依虛歲命中十年區間）、流年歲次宮位（依目標年支）與小限宮位。<br>2. 大限、流年、小限各自之 `siHua` 均為長度為 4 的純星曜名稱字串陣列 `[祿, 權, 科, 忌]`。 |

---

### Suite B：8 大模組與合婚群組角色 RAG 與「去仙人化語氣」意圖測試 (`apps/server`)

| 案例 ID | 測試目標 | 測試場景與輸入 | 預期意圖斷言 (Intent Assertions) |
| :--- | :--- | :--- | :--- |
| **TC-B01** | 全術數專屬顧問角色注入 ([`service.ts`](file:///home/coder/Codebase/Horoscope/apps/server/src/modules/llm/service.ts)) | 以 `ZIWEI`, `BAZI`, `WESTERN`, `TAROT`, `ICHING`, `QIZHENG`, `NAME`, `ALMANAC`, `BAZI_SYNASTRY`, `FAMILY_GROUP` 測試 | 攔截 System Prompt：各自注入專屬現代專業顧問身分、方法論框架與客觀諮商結構。 |
| **TC-B02** | 嚴格禁用仙人/道士口吻驗證 | 檢驗所有模組的 System Prompt 以及離線合成器 [`generateProfessionalSynthesizerReply`](file:///home/coder/Codebase/Horoscope/apps/server/src/modules/llm/service.ts#L403) 的輸出內容 | 1. System Prompt 必須明確包含禁止使用仙人道士自稱的指令。<br>2. 所有輸出內容中，**嚴格不得出現** `['天機星君', '貧道', '老夫', '道友', '仙人', '本座', '施主']` 任一詞彙（違反即測試失敗）。 |
| **TC-B03** | 模組專屬 RAG 知識庫動態檢索 | 傳入各模組具代表性的 `chartContext`（西洋星盤、七政四餘恩難四星、黃曆建除十二神） | [`retrieveModuleKnowledge`](file:///home/coder/Codebase/Horoscope/apps/server/src/modules/llm/service.ts) 必須成功檢索出對應資料庫條目。 |
| **TC-B04** | 倪師《天紀》紫微 RAG 檢索與離線合成器 | 傳入君臣慶會與紫府同宮盤面 | 檢索出倪師天紀大道至簡與 2/3 大於 1/3 心法，合成器精準輸出三合格局解析。 |
| **TC-B05** | 西洋占星與塔羅大師語錄 RAG | 查詢榮格、路德雅爾、韋特、波拉克大師心法 | 成功自資料庫 RAG 辭條命中並輸出大師級心靈與逆位覺察洞見。 |
| **TC-B06** | 八字合婚與家庭群組動態實體檢索 (Chart-Entity Grounding) | 傳入 `ziweiHeming` 與 `baguaPosition` 盤面資料 | 動態提取合盤星級、雙宮聯參、夫妻宮斷語與後天八卦名位相等法則注入提示詞與合成報告。 |

---

### Suite C：認證授權、Demo Mode 外鍵完整性與 API 整合測試 (`apps/server`)

| 案例 ID | 測試目標 | 測試場景與輸入 | 預期意圖斷言 (Intent Assertions) |
| :--- | :--- | :--- | :--- |
| **TC-C01** | Demo Mode 外鍵完整性驗證 ([`auth.ts`](file:///home/coder/Codebase/Horoscope/apps/server/src/middleware/auth.ts)) | 不帶真實註冊 JWT，僅帶 Header `x-demo-mode: true` 或 `Authorization: Bearer demo-admin-token`，呼叫 `POST /api/v1/profiles` 與 `POST /api/v1/readings` | 1. 後端自動映射至資料庫中真實存在的 Demo Admin 使用者 ID。<br>2. `POST /api/v1/profiles` 與 `POST /api/v1/readings` 皆回傳 `201 Created`，且可透過 `GET` 查詢與 `DELETE` 刪除，絕不發生 Foreign Key `500` 錯誤。 |
| **TC-C02** | Admin RBAC 權限隔離 | 使用一般會員 (`role: 'MEMBER'`) 之真實 JWT 呼叫 `/api/v1/admin/stats`、`/api/v1/admin/users`、`/api/v1/admin/llm-config` | 必須回傳 `403 Forbidden`，防止越權讀取或篡改系統 LLM 設定。 |
| **TC-C03** | 後台解釋規則 (RAG Rules) 8 大模組 CRUD | 透過 `/api/v1/admin/interpretations` 新增、修改、刪除包含 `QIZHENG`、`ALMANAC`、`WESTERN_NATAL` 等模組的規則 | 規則可正常寫入 SQLite 並立即在後續 [`retrieveModuleKnowledge`](file:///home/coder/Codebase/Horoscope/apps/server/src/modules/llm/service.ts#L291) 檢索中生效。 |

---

### Suite D：前端元件、XSS 防護與主題協調驗證 (`apps/web`)

| 案例 ID | 測試目標 | 測試場景與輸入 | 預期意圖斷言 (Intent Assertions) |
| :--- | :--- | :--- | :--- |
| **TC-D01** | Markdown XSS 消毒安全測試 ([`InPageAiAnalysis.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/components/ai/InPageAiAnalysis.vue)) | 傳入含有 `<script>window.xss=1</script>`、`<img src=x onerror="alert(1)">`、`<a href="javascript:alert(1)">` 以及標準 Markdown 標題/表格/清單的文本 | 1. 危險標籤 (`<script>`, `<iframe>`)、事件屬性 (`onerror`, `onload`) 與 `javascript:` 連結被完全剝除。<br>2. 標準 GFM Markdown（`<h2>`, `<h3>`, `<table>`, `<strong>`, `<ul>`, `<blockquote>`）完整保留。 |
| **TC-D02** | 全寬度解析面板展開/收合與 10~25 秒思考計時器 | 在 8 個命理頁面觸發 AI 深度解析，並測試超過 320 字之長篇 Markdown 報告 | 1. 推理期間顯示動態進度條、已耗時秒數與 4 階段提示（預估 10~25 秒）。<br>2. 報告位於頁面下方整列（`w-full`），長文自動顯示底部漸層遮罩與「展開完整深度解析報告 / 收合解析報告」切換按鈕。 |
| **TC-D03** | 深色 (`dark`) 與淺色 (`html.light`) 主題配色協調性 | 切換頂部導覽列主題按鈕，檢查 [`InPageAiAnalysis.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/components/ai/InPageAiAnalysis.vue) 與各命理視圖 | 淺色模式下背景為溫潤宣紙白 (`#FAF7F0` / `#FFFFFF`)、正文為深石板灰 (`#334155`)、強調色為沉穩琥珀金 (`#9A6B13`)，無刺眼反白或深色殘留色塊。 |
| **TC-D04** | 星盤典藏館 ([`VaultView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/VaultView.vue)) 真實 API 連動 | 點擊「`+ 新增出生檔案`」填寫表單送出，並於命理頁面點擊「儲存命盤」 | 1. 新增出生檔案 Modal 正常開啟並透過 `POST /api/v1/profiles` 寫入資料庫。<br>2. 儲存命盤透過 `POST /api/v1/readings` 寫入資料庫，並於典藏館即時顯示與支援刪除。 |

---

## 三、 測試執行指令與驗收門檻 (Execution & Acceptance Criteria)

### 1. 自動化測試執行指令
```bash
# 執行核心演算法測試套件 (Suite A)
npx pnpm --filter @celestial/astro-core test

# 執行後端 API、RBAC、Demo Mode 與 Role-RAG 測試套件 (Suite B & C)
npx pnpm --filter @celestial/server test

# 執行全專案型別檢查與生產環境建置驗證 (Suite D 靜態與編譯驗證)
npx pnpm --filter @celestial/web build
```

### 2. 驗收通過標準 (Definition of Done)
- [ ] [`code_review.md`](file:///home/coder/Codebase/Horoscope/code_review.md) 中所列之 **P1** 與 **P2** 問題全數修復完畢。
- [ ] **Suite A、Suite B、Suite C、Suite D** 所有測試案例 100% 通過（0 Failed, 0 Skipped）。
- [ ] 8 大命理模組之 AI 解析在線上 LLM 與離線 Fallback 雙模式下，皆呈現專業現代顧問風格且含 Markdown 結構，無任何「天機星君/貧道/老夫」殘留。
- [ ] 前後端生產環境 Build 無任何 TypeScript 或 Vite 編譯錯誤。
