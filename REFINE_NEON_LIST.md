# REFINE_LIST_NEON.md — 系統重構、安全加固、效能瘦身與產品演進路線圖

> **文件目的**：基於系統結構與模組規模盤點，針對**安全性、執行效率、架構可維護性與產品多樣性**四大維度，制定可落地的工程改進清單與分期執行計畫。  
> **優先級定義**：`P0`（阻斷性安全/穩定性風險，立即處理）｜`P1`（核心效能與架構瓶頸，近期重構）｜`P2`（產品深度與長期擴展性，中期演進）

---

## 總覽儀表板（Execution Roadmap）

| 階段 | 週期建議 | 核心目標 | 關鍵交付物 |
| :--- | :--- | :--- | :--- |
| **Phase 1：安全止血與資產瘦身** | Week 1 - 2 | 消除公開資料庫管理風險、防禦 API 濫用、削減 80% 靜態圖資體積 | 獨立後台隔離、API Rate Limit、WebP 圖資替換、XSS 過濾加固 |
| **Phase 2：後端解耦與前端模組化** | Week 3 - 5 | 拆解 `138 KB` 巨型 LLM 服務與 `73 KB` 巨型 Vue 元件，建立標準分層 | `llm` 模組拆分、`router/service/repo` 分層、資料與邏輯分離、共用型別庫 |
| **Phase 3：產品閉環與體驗升級** | Week 6 - 10 | 從「單點工具箱」升級為「跨派別合參 + 每日留存 + 社交裂變」平台 | 一鍵全息合參、問題導向入口、每日運勢微儀式、人生模擬器擴展 |

---

## 一、安全性加固（Security Hardening）

### [P0-SEC-01] 隔離高危管理與資料庫介面（消除公開暴露面）
* **現況問題**：面向公眾的 `apps/web` 中直接內嵌 `src/views/admin/DatabaseView.vue`（19.1 KB）與整套 `views/admin/`，同時又並存獨立專案 `apps/admin`，導致雙重權限邊界與高敏感管理端點暴露風險。
* **具體行動**：
  1. 從 `apps/web` 徹底移除 `DatabaseView.vue` 及所有 `/admin` 路由與元件，統一收斂至獨立部署的 `apps/admin`。
  2. 在 `deploy/docker/nginx.conf` 為 `apps/admin` 與後端 `/api/admin/*` 設定獨立子網域（如 `admin.yourdomain.com`），搭配 **IP 白名單 / Cloudflare Access / VPN** 存取限制。
  3. 資料庫管理操作預設鎖定為 **Read-Only**，任何寫入/刪除操作需二次確認並強制寫入不可篡改的 `AdminAuditLog`。
* **驗收標準**：公網直接存取主站網域時完全不存在 `/admin` 相關 chunk 與 API 路由；非白名單 IP 請求 `/api/admin/*` 一律回傳 `403/404`。

### [P0-SEC-02] 建立後端安全中介層防禦縱深
* **現況問題**：`apps/server/src/middleware/` 僅有單一 `auth.ts`（4.0 KB），缺乏針對登入爆破、高成本 AI 推論濫用與惡意 Payload 的防護。
* **具體行動**：
  1. 引入 `helmet`（設定嚴格 CSP、HSTS、X-Frame-Options）與全域 Request Body 大小上限（如 `1MB`）。
  2. 實作分級 Rate Limiting 中介層（建議基於 Redis）：
     * `/api/auth/*`：嚴格限制每 IP 每 15 分鐘最多 10 次嘗試，防禦撞庫與暴力破解。
     * `/api/llm/*` 與 `/api/simulator/*`：依 `userId` 與 `IP` 雙維度限流（如每分鐘 5 次、每日配額上限），防止 Token 帳單遭刷爆。
  3. 導入統一請求參數驗證層（如 `Zod`），在進入 `router` 處理前攔截非法生辰格式、超長字串與異常查詢參數。
* **驗收標準**：自動化壓測觸發閾值時正確回傳 `429 Too Many Requests`；畸形 JSON 或越界參數統一回傳標準化 `400 Bad Request`。

### [P0-SEC-03] 加固 LLM 金鑰加密、SSRF 防護與 RAG 租戶隔離
* **現況問題**：系統支援後台動態設定 LLM（`LlmSettingsView.vue`）與角色化 RAG 檢索，存在金鑰外洩、自訂 Endpoint 觸發 SSRF 及跨帳號資料污染風險。
* **具體行動**：
  1. 資料庫儲存的所有第三方 LLM API Key 必須使用環境變數主密鑰進行 **AES-256-GCM 加密**；API 回傳前端設定時僅顯示遮罩（如 `sk-****abcd`）。
  2. 若允許設定自訂 Base URL，後端發起請求前必須解析 DNS 並阻斷所有私有網段（`127.0.0.1`、`10.0.0.0/8`、`172.16.0.0/12`、`192.168.0.0/16`、`169.254.169.254`）以防禦 **SSRF**。
  3. 檢查 `llm/service.ts` 中的 RAG 檢索邏輯，確保所有向量/關鍵字查詢強制帶入 `WHERE userId = :currentUserId`，並使用 XML 標籤（如 `<user_query>`）隔離使用者輸入以降低 Prompt Injection 風險。
* **驗收標準**：資料庫外洩時無法還原明文 API Key；輸入內網 IP 作為 LLM Endpoint 時直接被驗證層拒絕。

### [P1-SEC-04] 強化前端 AI Markdown 輸出 XSS 淨化
* **現況問題**：`apps/web/src/utils/sanitize.ts` 僅 714 bytes，卻需承載 `InPageAiAnalysis.vue` 與 `LlmAssistantModal.vue` 大量富文本/Markdown 渲染。
* **具體行動**：
  1. 確認 `sanitize.ts` 底層使用 `DOMPurify`，並配置嚴格的白名單（禁止 `<script>`、`<iframe>`、`<object>`、`onerror/onload` 等事件屬性與 `javascript:` 協議連結）。
  2. 全專案搜尋 `v-html`，確保 100% 經過 `sanitizeHtml()` 封裝後才允許綁定。
* **驗收標準**：通過 OWASP XSS Filter Evasion 常見向量單元測試，無任何可執行腳本被渲染至 DOM。

---

## 二、執行效率與資源最佳化（Performance & Efficiency）

### [P0-PERF-01] 靜態圖資大瘦身與重複檔案清理（目標：減少 80%+ 體積）
* **現況問題**：專案總大小 43.7 MB 中，絕大多數為未壓縮大圖：
  * `star_chart.jpg`（1.32 MB）、`card_back.jpg`（1.31 MB）、`almanac_banner.jpg`（1.02 MB）。
  * `life-simulator/` 19 張階段與角色圖每張介於 `678 KB ~ 1.12 MB`（合計逾 17 MB）。
  * `public/images/tarot/` 根目錄存在 7 張超過 `930 KB ~ 1.24 MB` 的大牌圖，與 `tarot/cards/` 內 78 張完整牌組重複。
* **具體行動**：
  1. 刪除 `public/images/tarot/` 根目錄重複的 7 張大圖，統一引用 `tarot/cards/` 並為大牌提供高解析度按需載入版本。
  2. 撰寫自動化轉檔腳本，將所有 JPG/PNG 批次轉換為 **WebP / AVIF**，依實際 UI 容器尺寸限制最大寬度（背景橫幅 `<= 1600px`、角色立繪 `<= 800px`、卡牌 `<= 500px`），單張目標控制在 `60 KB ~ 180 KB` 內。
  3. 所有非首屏圖片（塔羅牌陣、人生模擬器角色立繪、籤詩插圖）全面加上 `loading="lazy"` 與 `decoding="async"`，並設定明確 `width/height` 防止 CLS 版面跳動。
* **驗收標準**：`apps/web/public/images/` 總體積從 ~32 MB 降至 **6 MB 以內**；行動網路（4G）首頁 LCP 降至 `< 2.0s`。

### [P1-PERF-02] LLM 全面串流化（SSE）與語意快取機制
* **現況問題**：年度規劃、雙人合盤、人生模擬等長文本解析若採傳統 Request-Response 等待，極易觸發前端或反向代理逾時，且重複命盤參數重複消耗推論成本。
* **具體行動**：
  1. 將所有長文本 AI 解析端點改為 **Server-Sent Events (SSE)** 串流輸出，降低使用者體感首字延遲（TTFB）。
  2. 更新 `deploy/docker/nginx.conf`，針對 `/api/llm/` 路由設定 `proxy_buffering off;`、`proxy_cache off;` 並將 `proxy_read_timeout` 調整至 `180s`。
  3. 導入 **Redis 快取層**（更新 `docker-compose.yml`）：
     * 確定性排盤結果（八字、紫微、西占、農民曆）以 `hash(birthDate + time + location + gender)` 快取 30 天。
     * 標準化籤詩（廟宇百首籤、文鳥籤）基礎白話解析快取永久有效，僅針對「個人問題結合」動態呼叫 LLM。
* **驗收標準**：AI 解盤首字出現時間 `< 1.2s`；相同生辰重複排盤 API 回應時間 `< 20ms`。

### [P1-PERF-03] 前端路由懶載入與核心套件 Tree-Shaking
* **現況問題**：`LifeSimulatorView.vue`（73.8 KB）、`UserManualView.vue`（57.6 KB）、`SynastryView.vue`（56.0 KB）等重型頁面若未妥善分割，會導致初始 JS Bundle 過大。
* **具體行動**：
  1. 檢查 `apps/web/src/router/index.ts`，確保除首頁外所有 View 皆採用 `() => import('@/views/...')` 動態載入，並利用 Vite `rollupOptions.output.manualChunks` 拆分第三方套件與大型字典檔。
  2. 將 `UserManualView.vue`（57.6 KB）改為動態載入 Markdown 渲染，不再將 4 萬字說明書硬編碼進主應用程式包。
  3. 在 `nginx.conf` 啟用 **Gzip / Brotli** 壓縮，並為 `/assets/*`（含 Hash 檔名）設定 `Cache-Control: public, max-age=31536000, immutable`。
* **驗收標準**：首屏初始載入 JS 體積（Gzip 後）控制在 `< 250 KB`。

---

## 三、架構重構與工程規範（Architecture & Maintainability）

### [P1-ARCH-01] 統一後台架構，消除雙胞胎專案
* **現況問題**：`apps/admin`（含 `Dockerfile.admin`）與 `apps/web/src/views/admin/` 功能重疊且版本不一致（`web` 端檔案規模遠大於獨立 `admin` 端）。
* **具體行動**：
  1. 以 `apps/web/src/views/admin/` 的完整功能為基準，將其遷移合併至獨立的 `apps/admin`。
  2. 清理 `apps/web` 中所有 admin 相關視圖、Store 與路由守衛。
  3. 統一 `Dockerfile` 與 `deploy/docker/Dockerfile.server`（目前兩者大小幾乎相同），保留單一標準建置檔。
* **驗收標準**：倉庫內僅存在唯一一套後台程式碼與唯一的 Server Dockerfile。

### [P1-ARCH-02] 拆解後端「巨型 LLM 服務」與「胖路由」
* **現況問題**：`apps/server/src/modules/llm/service.ts` 單檔高達 **138.5 KB**；`simulator/router.ts`（32.7 KB）、`admin/router.ts`（27.5 KB）、`calculator/router.ts`（14.6 KB）將商業邏輯直接寫在路由層。
* **具體行動**：
  1. **重構 `modules/llm/` 目錄結構**：
     ```text
     apps/server/src/modules/llm/
     ├── router.ts                 # 僅負責 HTTP 參數解析與 SSE 回應
     ├── orchestrator.ts           # 推論流程編排、重試與 Fallback 策略
     ├── providers/                # 各家模型適配器 (openai.ts, gemini.ts, claude.ts, ollama.ts)
     ├── prompts/                  # 按命理領域拆分提示詞模板 (bazi.ts, ziwei.ts, tarot.ts, simulator.ts)
     └── rag/                      # 角色設定與歷史紀錄檢索邏輯
     ```
  2. **補齊標準三層架構**：為 `simulator`、`admin`、`calculator` 等模組拆分 `router.ts`（路由/驗證）、`service.ts`（核心業務邏輯）、`repository.ts`（Prisma 資料存取）。
* **驗收標準**：後端單一檔案程式碼行數不超過 `500 行`（約 15~20 KB），且既有 `api.test.ts`、`admin-features.test.ts`、`role-rag.test.ts` 全數通過。

### [P1-ARCH-03] 分離 `astro-core` 運算引擎與大型靜態知識庫
* **現況問題**：`packages/astro-core/src/` 內混雜大量數十 KB 的靜態文本檔案（如 `temple-poem/lots.ts` 87.4 KB、`bazi/synastry.ts` 72.5 KB、`taiwan-history.ts` 60.7 KB、`ziwei/patterns.ts` 53.6 KB）。
* **具體行動**：
  1. 將純文本/詞條型資料抽離至 `packages/astro-core/data/*.json` 或納入 `packages/database` 進行資料庫管理（搭配後台 `InterpretationsView` 直接編輯）。
  2. 讓 `astro-core` 專注於純函數排盤計算、星曜安星法則與格局判定邏輯，提升編譯速度與測試純粹度。
* **驗收標準**：營運人員可透過後台直接修改籤詩或格局白話解釋，無需重新編譯部署核心套件。

### [P2-ARCH-04] 前端巨型 SFC 元件化與共用型別契約
* **現況問題**：`LifeSimulatorView.vue`（73.8 KB）與 `SynastryView.vue`（56.0 KB）單檔過大；前後端缺少共用 API 型別定義；前端缺乏自動化測試；根目錄散落 11 份開發文件。
* **具體行動**：
  1. 拆分重型頁面為模組化子元件（例如 `components/life-simulator/StageTimeline.vue`、`RomanceCard.vue`、`EventChoiceModal.vue`），並將狀態機抽離至 `composables/useLifeSimulator.ts`。
  2. 新增 `packages/shared` 套件，存放前後端共用的 Zod Schema 與 TypeScript DTO 型別，消除前後端介面不一致的隱患。
  3. 為 `apps/web` 導入 `Vitest` + `Playwright`，優先覆蓋「登入註冊 -> 建立命盤檔案 -> 排盤與 AI 解讀」核心關鍵路徑（E2E Smoke Test）。
  4. 建立 `docs/` 目錄，將根目錄的 `DEVELOPMENT_LOG.md`、`SPEC.MD`、`TASK_LIST.md` 等 11 份文件統一歸檔整理。
* **驗收標準**：前端單一 `.vue` 檔案控制在 `400 行` 以內；CI 流程具備前後端型別檢查與關鍵路徑 E2E 驗證。

---

## 四、產品多樣性與體驗深度（Product Diversity & Retention）

現有系統已具備極為完整的術數廣度（八字、紫微、七政、西占、易經、塔羅、籤詩、文鳥、解夢、姓名學、農民曆、人生模擬器）。下一階段的產品演進重點在於**從「功能堆疊」轉向「跨系統整合、情境引導與高頻留存」**：

### [P2-PROD-01] 打造「一鍵全息命格合參」中樞（跨派別交叉驗證）
* **產品價值**：打破目前各命理工具（`BaziView`、`ZiweiView`、`WesternView`、`QizhengView`）各自為政的孤島狀態，建立市場上罕見的「多維度印證」差異化壁壘。
* **功能設計**：
  1. 在 `VaultView`（命盤保險箱）與首頁新增「**全息合參報告**」入口：使用者只需選擇已儲存的 `Profile`，系統同步調用八字、紫微、西洋占星與七政四餘引擎。
  2. 由 AI 統整四大系統的「**高共識訊號**」（例如：紫微化祿入財帛 + 八字食神生財 + 木星過境二宮 $\rightarrow$ 標記為 `強烈財運窗口期`）與「**衝突提醒**」。
  3. 支援切換「**解盤大師流派視角**」（延伸 `seed-masters.ts` 與 `seed-nihai.ts` 基礎），提供如「古籍經典派」、「現代心理諮商派」、「白話直球決策派」三種分析口吻。

### [P2-PROD-02] 新增「問題導向」情境決策引導（降低新手門檻）
* **產品價值**：解決一般使用者面對十多種東方/西方術數不知從何下手的選擇困難，提升首次訪問轉化率。
* **功能設計**：
  1. 在 `HomeView` 頂部設計情境入口卡片：「感情與關係」、「事業與轉職」、「財運與投資」、「近期迷茫求指引」、「挑個好日子」。
  2. 選擇情境並輸入具體問題後，系統自動組裝最適合的「**組合拳占卜流**」（例如：選「感情進展」$\rightarrow$ 自動串聯「雙人八字/星盤契合度 + 塔羅關係三牌陣 + 擲筊最終確認」）。

### [P2-PROD-03] 打通「運勢預警 $\rightarrow$ 每日微儀式 $\rightarrow$ 習慣養成」留存閉環
* **產品價值**：目前後端已有 `habits/router.ts`（5.4 KB），但前端缺乏串聯場景。透過日常化設計解決命理產品「算完即走」的低留存痛點。
* **功能設計**：
  1. 推出「**每日 30 秒運勢微儀式**」卡片：整合當日個人流日（八字/紫微）、`Almanac` 農民曆宜忌、一張每日文鳥/塔羅指引牌。
  2. **開運行動轉化為習慣**：AI 根據當日五行喜用或星象弱點生成具體微行動（例如「今日火旺易躁，建議午休靜心 10 分鐘」），一鍵加入 `habits` 每日打卡清單，累積連續打卡天數可解鎖深度流年解讀額度。

### [P2-PROD-04] 人生模擬器擴展：「平行時空 What-If」與「雙人模擬」
* **產品價值**：放大目前最具娛樂性與傳播潛力的 `LifeSimulator`（結合台灣歷史事件與角色攻略系統）。
* **功能設計**：
  1. **真實命盤分岔模擬（What-If Mode）**：匯入使用者的真實大運節點，在關鍵年齡（如 28 歲、35 歲）設定「創業 vs. 留任」、「出國 vs. 留台」分岔選項，推演不同選擇下的十年運勢曲線對比。
  2. **雙人合盤人生模擬**：結合 `Synastry` 模組，輸入兩人的生辰，模擬兩人在不同年代或職場環境下的相遇、合作與感情互動結局。
  3. **劇本資料外掛化**：將 `taiwan-history.ts` 與角色設定抽離為標準化 JSON 劇本包格式，未來可快速擴充「現代職場升遷錄」、「古風科舉仕途」等主題包。

### [P2-PROD-05] 補齊高實用工具與社交裂變機制
* **功能設計**：
  1. **智能擇日助手（擴充 `AlmanacView`）**：支援輸入事件類型（簽約、搬家、開幕、嫁娶）與當事人生肖/八字，自動篩選未來 30 天內避開沖煞的吉日與吉時。
  2. **一鍵生成高質感分享海報 & 匿名合盤邀請連結**：在塔羅結果、全息合參、人生模擬結局頁提供一鍵生成適合 IG Story / Line 分享的視覺卡片（內建 `html-to-image`），並支援產生「免註冊匿名合盤邀請連結」，讓使用者傳給伴侶或朋友輸入生辰即可自動生成雙人契合度報告，驅動自然流量裂變。
```

你可以將這份文件直接存放在專案根目錄的 `REFINE_LIST_NEON.md`。接下來若要開始執行 Phase 1，建議先貼上 `apps/server/src/app.ts`、`apps/server/src/middleware/auth.ts` 與 `deploy/docker/nginx.conf`，我可以幫你直接產出安全中介層加固與後台隔離的修改程式碼。