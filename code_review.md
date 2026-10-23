# 全專案 Code Review 報告 (Code Review Report)

> **審查日期**：2026-10-20
> **審查基準**：[`AGENTS.md`](file:///home/coder/Codebase/Horoscope/AGENTS.md) 開發編碼準則（Rule 1 ~ Rule 12）
> **審查範圍**：
> - 核心演算法套件：`packages/astro-core`
> - 資料庫與種子資料：`packages/database`
> - 後端服務與 RAG 引擎：`apps/server`
> - 前端應用程式與整合管理後台：`apps/web`
> - 基礎設施與遺留目錄：`apps/admin`、[`docker-compose.yml`](file:///home/coder/Codebase/Horoscope/docker-compose.yml)

---

## 一、 專案架構現況總覽

1. **核心演算法 (`@celestial/astro-core`)**：已涵蓋八字、紫微斗數、西洋占星、七政四餘、易經六爻、塔羅牌陣、姓名學五格、通勝黃曆等 8 大模組，具備高確定性（Deterministic）運算能力。
2. **角色化 RAG 與現代專業語氣 (`@celestial/server`)**：[`apps/server/src/modules/llm/service.ts`](file:///home/coder/Codebase/Horoscope/apps/server/src/modules/llm/service.ts) 已建立 [`MODULE_ROLES`](file:///home/coder/Codebase/Horoscope/apps/server/src/modules/llm/service.ts#L17-L273) 與 [`retrieveModuleKnowledge`](file:///home/coder/Codebase/Horoscope/apps/server/src/modules/llm/service.ts#L291-L398)，移除傳統「天機星君、貧道、老夫、道友」等仙人道士口吻，改為現代專業諮詢師與研究學者角色。
3. **前端全寬度 Markdown 解析面板 (`@celestial/web`)**：8 個命理頁面皆已整合 [`InPageAiAnalysis.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/components/ai/InPageAiAnalysis.vue)，置於頁面下方整列（Full-Width Row），支援 GFM Markdown 排版、長文展開/收合與深淺色主題（[`tailwind.config.js`](file:///home/coder/Codebase/Horoscope/apps/web/tailwind.config.js) `light` variant）。

---

## 二、 發現問題與修正建議（依嚴重度分級）

### 🔴 P1：核心邏輯與執行期風險 (Critical / Logic Issues)

#### 1. 模組鍵值不一致導致西洋占星 RAG 檢索落空與後台模組遺漏 (`WESTERN` vs `WESTERN_NATAL`)
* **違反原則**：**Rule 8 (Code Understanding)**、**Rule 11 (Adhere to Conventions)**
* **問題定位**：
  * 前端 [`WesternView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/WesternView.vue#L175) 傳遞 `module-type="WESTERN"`。
  * 資料庫種子 [`seed.ts`](file:///home/coder/Codebase/Horoscope/packages/database/src/seed.ts#L92) 以及後台規則管理 [`InterpretationsView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/InterpretationsView.vue#L88) 卻使用 `'WESTERN_NATAL'`。
  * 後端 [`apps/server/src/modules/llm/service.ts`](file:///home/coder/Codebase/Horoscope/apps/server/src/modules/llm/service.ts#L285) 的 [`getModuleRole`](file:///home/coder/Codebase/Horoscope/apps/server/src/modules/llm/service.ts#L285-L288) 僅識別 `'WESTERN'`，若傳入 `'WESTERN_NATAL'` 會退回 `DEFAULT`；反之當前端傳入 `'WESTERN'` 時，[`retrieveModuleKnowledge`](file:///home/coder/Codebase/Horoscope/apps/server/src/modules/llm/service.ts#L300) 向 Prisma 查詢 `where: { module: 'WESTERN' }` 將無法命中資料庫中標記為 `'WESTERN_NATAL'` 的規則。
  * 後台 [`InterpretationsView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/InterpretationsView.vue#L83-L90) 與 [`DashboardView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/DashboardView.vue#L134-L144) 的下拉選單與模組名稱映射僅列出 6 個模組，遺漏了 `QIZHENG`（七政四餘）與 `ALMANAC`（通勝黃曆）。
* **修正方案**：
  * 在 [`apps/server/src/modules/llm/service.ts`](file:///home/coder/Codebase/Horoscope/apps/server/src/modules/llm/service.ts) 建立模組正規化函式，讓 `WESTERN` 與 `WESTERN_NATAL` 在角色匹配與 DB RAG 查詢（`in: ['WESTERN', 'WESTERN_NATAL']`）雙向相容。
  * 在 [`InterpretationsView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/InterpretationsView.vue) 與 [`DashboardView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/DashboardView.vue) 補齊全部 8 大占星命理系統選項與標籤。

---

#### 2. Demo Mode 虛擬身分觸發 SQLite 外鍵約束失敗 (Foreign Key Constraint Violation)
* **違反原則**：**Rule 8 (Code Understanding)**、**Rule 12 (Fail Loudly)**
* **問題定位**：
  * [`apps/server/src/middleware/auth.ts`](file:///home/coder/Codebase/Horoscope/apps/server/src/middleware/auth.ts#L25-L34) 在處理 `x-demo-mode: true` 或 `Bearer demo-admin-token` 時，直接指派虛擬 ID：`req.user = { id: 'demo-admin-id', email: 'admin@celestial.local', role: 'ADMIN' }`。
  * 當使用者在未登入真實 JWT 的 Demo 狀態下呼叫 [`POST /api/v1/profiles`](file:///home/coder/Codebase/Horoscope/apps/server/src/modules/profiles/router.ts#L34) 或 [`POST /api/v1/readings`](file:///home/coder/Codebase/Horoscope/apps/server/src/modules/readings/router.ts#L43) 時，Prisma 嘗試以 `userId: 'demo-admin-id'` 寫入 `BirthProfile` 或 `SavedReading` 表，因 `User` 表無此 ID 而觸發 Foreign Key Constraint Violation (`500 Internal Server Error`)。
* **修正方案**：
  * 在 [`authenticateJWT`](file:///home/coder/Codebase/Horoscope/apps/server/src/middleware/auth.ts#L16-L46) 進入 Demo 分支時，自動查詢或透過 `upsert` 確保資料庫中存在 `admin@celestial.local` 使用者紀錄，並將真實存在的 `user.id` 賦予 `req.user.id`。

---

#### 3. Admin 後台各子頁面認證標頭模式不一致
* **違反原則**：**Rule 7 (Pattern Selection — 衝突模式中必須二選一，嚴禁混合模式)**
* **問題定位**：
  * **新模式（已測試）**：[`LlmSettingsView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/LlmSettingsView.vue#L259-L273) 使用 `await authStore.ensureDemoToken()` 並帶上 `'x-demo-mode': 'true'`。
  * **舊模式（待清理）**：[`DashboardView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/DashboardView.vue#L120-L125)、[`InterpretationsView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/InterpretationsView.vue#L150-L162)、[`UsersView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/UsersView.vue#L91-L102) 仍直接呼叫 `localStorage.getItem('celestial_token')`，若使用者直接重新整理子頁面且無快取 Token，請求將缺乏有效認證。
* **修正方案**：
  * 全面統一為 `authStore.ensureDemoToken()` + `'x-demo-mode': 'true'` 模式，淘汰直接裸讀 `localStorage` 的舊模式。

---

### 🟡 P2：架構整潔度、安全性與真實持久化 (Architecture, Security & UX)

#### 4. 前端「星盤典藏館 (Vault)」與「儲存命盤」未串接後端持久化 API
* **違反原則**：**Rule 12 (Fail Loudly — 誠實揭露狀態，不得以假狀態聲稱已完成)**
* **問題定位**：
  * [`VaultView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/VaultView.vue#L51) 的「`+ 新增出生檔案`」按鈕將 `showAddModal = true`（[第 130 行](file:///home/coder/Codebase/Horoscope/apps/web/src/views/VaultView.vue#L130)），但模板中並未實作對應的 Modal 彈窗，且頁面顯示的星盤與命盤紀錄為前端靜態陣列，未與 [`/api/v1/profiles`](file:///home/coder/Codebase/Horoscope/apps/server/src/modules/profiles/router.ts) 及 [`/api/v1/readings`](file:///home/coder/Codebase/Horoscope/apps/server/src/modules/readings/router.ts) 同步。
  * [`ZiweiView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/ZiweiView.vue#L357-L360) (`saveCurrentReading`) 與 [`TarotView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/TarotView.vue#L358-L361) (`saveTarotJournal`) 點擊儲存時僅執行瀏覽器 `alert(...)`，未實際呼叫後端 API 寫入資料庫。
* **修正方案**：
  * 在 [`VaultView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/VaultView.vue) 補齊「新增出生檔案」Modal 並串接 `GET/POST/DELETE /api/v1/profiles` 與 `GET/DELETE /api/v1/readings`。
  * 將各命理頁面的儲存動作實際串接至 `POST /api/v1/readings`。

---

#### 5. Markdown 渲染缺少 HTML XSS 消毒防護 (Sanitization)
* **違反原則**：**安全性最佳實踐 (Defense in Depth)**
* **問題定位**：
  * [`InPageAiAnalysis.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/components/ai/InPageAiAnalysis.vue#L105) 與 [`LlmSettingsView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/LlmSettingsView.vue#L254) 使用 `marked.parse()` 轉換 LLM 回傳文字後，直接綁定至 `v-html="renderedMarkdown"`。
  * 若自託管模型或惡意 Prompt 注入回傳 `<script>`、`<iframe src="...">` 或 `<img src=x onerror="...">`，將導致 DOM XSS 執行。
* **修正方案**：
  * 建立共用的安全 Markdown 渲染輔助函式（過濾 `<script>`、`<iframe>`、`<object>`、`<embed>`、`on*=` 事件處理器與 `javascript:` 偽協定），確保 `v-html` 輸出安全無虞。

---

#### 6. 廢棄的獨立後台套件殘留 (`apps/admin` vs `apps/web/src/views/admin`)
* **違反原則**：**Rule 7 (Pattern Selection — 將淘汰模式標記或清理，嚴禁混合模式)**
* **問題定位**：
  * Port 3001 的獨立後台 `apps/admin` 已停止服務並整合進 [`apps/web/src/views/admin/`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/AdminLayout.vue)，但 [`docker-compose.yml`](file:///home/coder/Codebase/Horoscope/docker-compose.yml) 與工作區仍殘留 `apps/admin` 的配置與舊版「天機星君」字樣。
* **修正方案**：
  * 清理 [`docker-compose.yml`](file:///home/coder/Codebase/Horoscope/docker-compose.yml) 中已淘汰的 3001 admin 服務定義，並移除或標記淘汰 `apps/admin`，確保單一真實來源（Single Source of Truth）。

---

#### 7. 角色 RAG 與去仙人化語氣缺乏自動化意圖測試覆蓋
* **違反原則**：**Rule 9 (Intent-Based Testing — 當業務邏輯改變時，測試必須失敗)**
* **問題定位**：
  * [`apps/server/test/api.test.ts`](file:///home/coder/Codebase/Horoscope/apps/server/test/api.test.ts#L230-L303) 目前僅針對 `ZIWEI` 與 `WESTERN` 進行基本 Mock 回傳測試，並未檢查傳送給 LLM 的 System Prompt 是否包含各模組專屬角色與 RAG 知識，也未對 8 大模組進行「禁用仙人道士詞彙」的自動化斷言。
* **修正方案**：
  * 依照 [`test_plan.md`](file:///home/coder/Codebase/Horoscope/test_plan.md) 擴充自動化測試套件，涵蓋全部 8 大模組的 Role-RAG 驗證與禁用詞斷言。

---

## 三、 審查總結表

| 編號 | 優先級 | 模組 / 檔案 | 問題摘要 | 對應準則 |
| :--- | :---: | :--- | :--- | :--- |
| **CR-01** | **P1** | [`service.ts`](file:///home/coder/Codebase/Horoscope/apps/server/src/modules/llm/service.ts), [`InterpretationsView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/InterpretationsView.vue) | `WESTERN` 與 `WESTERN_NATAL` 鍵值不一致；後台遺漏 `QIZHENG` 與 `ALMANAC` | Rule 8, Rule 11 |
| **CR-02** | **P1** | [`auth.ts`](file:///home/coder/Codebase/Horoscope/apps/server/src/middleware/auth.ts) | Demo Mode 使用虛擬 `'demo-admin-id'` 導致新增檔案/命盤時外鍵失敗 (500) | Rule 8, Rule 12 |
| **CR-03** | **P1** | [`DashboardView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/DashboardView.vue), [`UsersView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/UsersView.vue) | Admin 子頁面認證標頭寫法未統一使用 `ensureDemoToken()` | Rule 7 |
| **CR-04** | **P2** | [`VaultView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/VaultView.vue), [`ZiweiView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/ZiweiView.vue) | 新增檔案 Modal 未實作、儲存命盤僅彈出 `alert` 未寫入後端 API | Rule 12 |
| **CR-05** | **P2** | [`InPageAiAnalysis.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/components/ai/InPageAiAnalysis.vue) | `marked.parse()` 輸出至 `v-html` 缺乏 XSS Sanitizer | Security |
| **CR-06** | **P2** | [`docker-compose.yml`](file:///home/coder/Codebase/Horoscope/docker-compose.yml), `apps/admin` | 殘留已廢棄的 3001 獨立後台設定與舊提示詞 | Rule 7 |
| **CR-07** | **P2** | [`api.test.ts`](file:///home/coder/Codebase/Horoscope/apps/server/test/api.test.ts) | 缺少 8 大模組 Role-RAG 注入與「去仙人化口吻」意圖驗證測試 | Rule 9 |
| **CR-08** | **P2** | [`ZiweiView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/ZiweiView.vue), [`AlmanacView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/AlmanacView.vue) | 淺色模式 (Light Mode) 下文字對比度不足（黃字發白） | UX / A11y |
| **CR-09** | **P1** | [`synastry.ts`](file:///home/coder/Codebase/Horoscope/packages/astro-core/src/bazi/synastry.ts) | 八字合婚未吸納紫微斗數天紀合盤五步法與雙宮聯參 | Rule 8, Rule 11 |
| **CR-10** | **P1** | [`service.ts`](file:///home/coder/Codebase/Horoscope/apps/server/src/modules/llm/service.ts) | 合盤與家庭群組未實現動態實體注入 (Structured Chart Grounding) | Rule 4, Rule 8 |
| **CR-11** | **P2** | [`SynastryView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/SynastryView.vue) | iPhone 行動端排盤與群組交互卡片寬度自適應與滾動流暢性 | Responsive |
