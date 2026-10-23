# 📜 萬象天儀 (Astraea & CelestialDao) 開發日誌 (DEVELOPMENT_LOG.md)

本文件依據 [AGENTS.md](file:///home/coder/Codebase/Horoscope/AGENTS.md) 核心準則（特別是 Rule 10: Multi-Step Checkpoints 與 Rule 12: Fail Loudly）即時記錄各階段開發過程、驗證結果與決策脈絡。

---

## 初始環境設定 (Environment Setup)
- **時間**：2026-10-19
- **執行環境**：Linux (Node.js v20.19.2, npm 9.2.0, pnpm 12.14.0)
- **專案結構**：pnpm workspace Monorepo 架構
- **規範依據**：[SPEC.MD](file:///home/coder/Codebase/Horoscope/SPEC.MD) 與 [TASK_LIST.md](file:///home/coder/Codebase/Horoscope/TASK_LIST.md)

---

## 執行紀錄與檢核點 (Checkpoints Log)

### 檢核點回報: Phase 0 (專案骨架與 Monorepo 基礎架構)
- **當前任務**：Task 0.1 & Task 0.2
- **已完成事項 (Completed)**：
  - 初始化 Monorepo 根目錄配置：`package.json`, `pnpm-workspace.yaml`, `tsconfig.json`, `.gitignore`, `.npmrc`。
  - 成功安裝並配置 pnpm 12.14.0，批准原生構建腳本 (`pnpm approve-builds`)。
  - 建立 5 大子專案結構：`packages/astro-core`, `packages/database`, `apps/server`, `apps/web`, `apps/admin`。
  - 完成跨模組 workspace 依賴連結，所有 package 安裝完畢。
- **已驗證事項 (Verified)**：
  - `pnpm install` 執行無錯誤，鎖定檔案正常生成。
- **剩餘事項 (Remaining)**：
  - 進入 Phase 1：實作 `packages/astro-core` 核心純演算法庫（曆法、紫微、八字、周易、姓名、西洋、塔羅）與單元測試。

### 檢核點回報: Phase 1 (命理與星象核心演算法庫 packages/astro-core)
- **當前任務**：Task 1.1 ~ Task 1.6 (曆法、紫微、八字、周易、姓名、西洋、塔羅)
- **已完成事項 (Completed)**：
  - `src/calendar/index.ts`：實作均時差 (Equation of Time) 與經緯度真太陽時校準。
  - `src/ziwei/`：完成命宮、身宮、五行局、紫微天府十四主星、廟旺平陷、生年四化、大限流年排盤演算法。
  - `src/bazi/`：完成節氣四柱排盤、地支藏干、十神矩陣、五行能量分佈評分、日主強弱判別、喜用神推導與大運走勢。
  - `src/iching/`：完成三枚銅錢隨機投擲、梅花易數起卦、64卦二進制查表、本卦/變卦/互卦/錯卦/綜卦推演。
  - `src/naming/`：完成康熙筆劃庫映射、天人地總外五格剖象、81數理吉凶、三才配置評級與八字喜用神起名推薦。
  - `src/western/`：完成黃道十二宮行星經度、開普勒行星軌道近似、上升點ASC、五大主相位(0°, 60°, 90°, 120°, 180°)、八大月相原型與月亮星座深度報告。
  - `src/tarot/`：完成 78 張韋特塔羅牌全庫 (22 Major + 56 Minor)、Fisher-Yates 隨機洗牌、正逆位判定、5 種經典牌陣 (單張、時間流、聖三角、二選一、塞爾特十字)。
  - `test/astro-core.test.ts`：編寫 15 項意圖單元測試（包含邊界案例、天文精準度、吉凶組合、牌庫不重複性）。
- **已驗證事項 (Verified)**：
  - `pnpm --filter @celestial/astro-core test` 執行 15/15 測試全部綠燈 100% 通過。
  - `pnpm --filter @celestial/astro-core build` 構建輸出 ESM, CJS 與 DTS 型別聲明檔全數成功。
- **剩餘事項 (Remaining)**：
  - 進入 Phase 2：資料持久層與後端 API 服務 (`packages/database` 與 `apps/server`)。

### 檢核點回報: Phase 2 (資料持久層與後端 API 服務 packages/database & apps/server)
- **當前任務**：Task 2.1 ~ Task 2.5 (Prisma Schema, JWT 認證, 真太陽時排盤 API, 命盤檔案庫, 後台管理 API)
- **已完成事項 (Completed)**：
  - `packages/database/prisma/schema.prisma`：設計 `User` (RBAC), `BirthProfile`, `ReadingRecord`, `SystemInterpretation`, `KangxiChar`。
  - `packages/database/src/seed.ts`：注入管理員 (`admin@celestial.dao`)、VIP 會員 (`vip@celestial.dao`)、紫微/八字/易經/塔羅/西洋解讀辭庫。
  - `apps/server/src/middleware/auth.ts`：實現 JWT 簽發、驗證與 RBAC 角色許可權控制中介軟體。
  - `apps/server/src/modules/`：
    - `auth`：註冊、登入、個人資料 `/me` API。
    - `calculator`：紫微斗數、四柱八字、周易六爻、姓名學五格分析/八字起名、西洋星盤/月相、塔羅牌陣排盤 API。
    - `profiles`：命盤人物庫列表、新增、刪除 API。
    - `readings`：占卜歷史存檔、喜愛標記、隨筆日記 API。
    - `admin`：營運統計大盤數據、辭庫 CRUD、會員角色權限管理 API。
  - `apps/server/test/api.test.ts`：編寫 16 項全鏈路 API 整合測試。
- **已驗證事項 (Verified)**：
  - `pnpm --filter @celestial/server test` 執行 16/16 測試全數通過（含 Token 鑑權、排盤正確性、RBAC 403 攔截）。
  - `pnpm --filter @celestial/server build` TypeScript 編譯零報錯。
- **剩餘事項 (Remaining)**：
  - 進入 Phase 3：Awwwards 級別前端體驗與 3D 視覺交互 (`apps/web`)。

### 檢核點回報: Phase 3 (Awwwards 級前端體驗與 3D 視覺 apps/web)
- **當前任務**：Task 3.1 ~ Task 3.7 (雙主題系統, Three.js 渾天星盤, Lenis 平滑滾動, 六大排盤視圖, 會員檔案庫)
- **已完成事項 (Completed)**：
  - `apps/web/tailwind.config.js` & `style.css`：實作「星淵夜幕 (Void Obsidian)」與「晨曦天盤 (Solstice Alabaster)」無縫雙主題，整合 Cinzel 與思源宋體。
  - `src/components/celestial/ArmillarySphere.vue`：Three.js 渲染 3D 渾天星盤（黃道十二宮環、二十八宿內環、太極元神光球、星塵粒子雲、滑鼠視差與觸控拖曳旋轉）。
  - `src/App.vue`：全域整合 Lenis 物理平滑滾動與路由轉場動效。
  - `src/components/layout/Navbar.vue` & `AuthModal.vue`：頂部導航列與會員註冊/登入彈窗。
  - `src/views/` 六大交互視圖：
    - `ZiweiView.vue`：4x4 十二宮琉璃古盤、十四主星廟旺平陷、生年四化標註、點選宮位詳解。
    - `BaziView.vue`：四柱干支神煞卡、五行能量分佈進度條、日主強弱判別、大運流年走勢卡。
    - `IchingView.vue`：三枚古銅錢 3D/動畫翻轉搖卦、初爻至上爻動態堆疊、64卦384爻辭與四維白話解析。
    - `NamingView.vue`：姓名天人地總外五格剖象數理、三才配置評級、八字喜用神智慧起名推薦。
    - `WesternView.vue`：向量 SVG 本命黃道天宮星盤、相位幾何連線、月亮星座與誕生月相原型深度報告。
    - `TarotView.vue`：78張韋特塔羅、5 大牌陣（單張、時間之流、聖三角、二選一、塞爾特十字）、立體翻牌與雙向牌義。
    - `VaultView.vue`：個人命盤檔案庫（本人與親友命盤管理）與靈驗占卜日記。
- **已驗證事項 (Verified)**：
  - `pnpm --filter @celestial/web build` 生產打包順利通過（輸出 `dist/`，HTML/CSS/JS/WebGL 著色器無缺失）。
- **剩餘事項 (Remaining)**：
  - 進入 Phase 4：管理員 CMS 後台開發 (`apps/admin`)。

### 檢核點回報: Phase 4 (管理員 CMS 後台開發 apps/admin)
- **當前任務**：Task 4.1 ~ Task 4.4 (後台認證守衛, 數據大盤, 辭庫編修, 會員管理)
- **已完成事項 (Completed)**：
  - `src/views/LoginView.vue`：管理者專屬暗金古樸風格登入介面，支援 JWT 存儲與跳轉。
  - `src/router/index.ts`：配置 `beforeEach` 全域路由導航守衛，防止未授權匿名存取。
  - `src/views/DashboardView.vue`：總註冊會員、今日排盤測算量、各模組調用佔比圖。
  - `src/views/InterpretationsView.vue`：支援依模組（ZIWEI, BAZI, ICHING, TAROT 等）搜尋與在線編修命理斷語。
  - `src/views/UsersView.vue`：會員清單檢索、分頁查詢、一鍵調整角色等級（ADMIN / VIP / MEMBER）。
- **已驗證事項 (Verified)**：
  - `pnpm --filter @celestial/admin build` 生產構建成功，TypeScript 檢查無任何報錯。
- **剩餘事項 (Remaining)**：
  - 進入 Phase 5：Docker 容器化與生產級編排部署。

### 檢核點回報: Phase 5 (Docker 容器化與生產級編排部署)
- **當前任務**：Task 5.1 ~ Task 5.3 (多階段 Dockerfile, Nginx 反向代理, Docker Compose 編排, .dockerignore)
- **已完成事項 (Completed)**：
  - `deploy/docker/Dockerfile.server`：Node.js 20 Alpine 多階段構建、Prisma generate、非 root 安全用戶運行。
  - `deploy/docker/Dockerfile.web`：Node 20 編譯 ➔ 注入至輕量 `nginx:alpine`，支援 SPA 路由回退與 Gzip 壓縮。
  - `deploy/docker/Dockerfile.admin`：管理後台多階段 Nginx 映像檔。
  - `deploy/docker/nginx.conf`：配置靜態資產快取標頭 (1y max-age) 與 `/api/` 反向代理轉發至後端。
  - `docker-compose.yml`：編排 `server` (9998), `web` (9999), `admin` (3001), `redis` (6379)，支援網路橋接與持久化資料卷。
  - `.dockerignore` 與 `.env.example`：完善構建上下文排除與環境配置範本。
- **已驗證事項 (Verified)**：
  - 執行 `docker compose config` 語法校驗 100% 通過，全服務拓撲與端口映射無誤。
- **剩餘事項 (Remaining)**：
  - 進入 Phase 6：全端整合測試與交付發布。

### 檢核點回報: Phase 6 (全端整合驗證、發布文檔與交付 TEST_REPORT.md & README.md)
- **當前任務**：Task 6.1 ~ Task 6.3 (全鏈路自動化測試, 性能與構建審計, 生產文檔與交接)
- **已完成事項 (Completed)**：
  - 核心演算法庫單元測試驗證：Calendar 真太陽時、紫微斗數 12 宮 14 主星四化、四柱八字藏干十神喜用神大運、周易 64 卦 384 爻六爻與梅花、姓名學五格三才、西洋本命開普勒相位與 8 大月相原型、78 張塔羅牌 5 大經典牌陣。
  - 後端 API 整合測試驗證：`/health`、Auth (Register/Login Bcrypt + JWT)、6 大排盤計算端點、Profile 雲端命盤庫、Readings 測算日記、Admin RBAC (403 攔截與 200 管理員放行)。
  - Monorepo 全量構建：`pnpm build`（5 個套件全數編譯成功，無類型錯誤）。
  - 產出詳細測試驗證報告：`TEST_REPORT.md`。
  - 產出全系統交付與使用說明文件：`README.md`。
- **已驗證事項 (Verified)**：
  - `pnpm --filter @celestial/astro-core test`：15/15 passed (100% Intent-Based Tests)。
  - `pnpm --filter @celestial/server test`：16/16 passed (Supertest API Integration Tests)。
  - `pnpm build`：5/5 packages built successfully (astro-core, database, server, web, admin)。
  - `docker compose config`：驗證無誤。
- **剩餘事項 (Remaining)**：
  - 基礎交付完成，推進後續增強功能：天機靈犀 LLM 星象顧問與後台動態配置。

### 檢核點回報: LLM 擴充模組 (天機靈犀 AI 星象顧問與後台配置中樞)
- **當前任務**：LLM 助手整合 (前台導航全局按鈕, 背景命盤上下文自動注入, 6 大命盤一鍵 AI 靈犀解盤, 後台 LLM 端點配置與連線測試)
- **已完成事項 (Completed)**：
  - 資料庫持久層 (`packages/database`)：新增 `SystemConfig` 模型並種子化預設 `LLM_CONFIG`。
  - 後端 API 服務 (`apps/server`)：
    - 建立 `src/modules/llm/service.ts`（支援 OpenAI 相容協議端點調用，未配置 Key 時自動平滑回退至內建「國師星君高擬真神諭合成引擎」）。
    - 建立 `src/modules/llm/router.ts`（`GET /api/v1/llm/status`, `POST /api/v1/llm/chat`）。
    - 後台管理路由擴充：`GET /api/v1/admin/llm-config`, `PUT /api/v1/admin/llm-config`, `POST /api/v1/admin/llm-test`。
  - 後台管理系統 (`apps/admin`)：
    - 新增 `src/views/LlmSettingsView.vue`（服務開關、供應商快速切換、端點 URL、Key 遮罩輸入、模型名稱預設、Temperature 滑桿、國師 System Prompt 編輯與一鍵連線測試）。
    - 側邊欄與路由掛載 `/llm-settings`。
  - 前台主站 (`apps/web`)：
    - 建立 Pinia Store `src/stores/llm.ts`。
    - 建立神聖玻璃光暈抽屜 `src/components/ai/LlmAssistantModal.vue`（支援命盤背景標籤、快速問句建議、即時對話串流）。
    - 頂部導航列 `Navbar.vue` 右上角新增常駐光暈「✨ 天機靈犀」按鈕。
    - 六大命理視圖全數接入一鍵 AI 解盤按鈕：紫微斗數 (`ZiweiView`)、四柱八字 (`BaziView`)、周易卜卦 (`IchingView`)、姓名學 (`NamingView`)、西洋星盤 (`WesternView`)、韋特塔羅 (`TarotView`)。
- **已驗證事項 (Verified)**：
  - `pnpm --filter @celestial/server test`：19/19 passed (新增 3 項 LLM 與 Admin Config 整合測試)。
  - `pnpm --filter @celestial/astro-core test`：15/15 passed。
  - 全套件編譯測試：`pnpm build`（5 個套件全數編譯無誤，Vite 打包成功）。
- **剩餘事項 (Remaining)**：
  - 進入 Phase 7：東方天星七政四餘、每日黃曆與實體擬真星象圖片系統。

### 檢核點回報: Phase 7 (東方天星七政四餘、每日黃曆、實體擬真藝術資產與連接埠調整)
- **當前任務**：Task 7.1 ~ Task 7.5 (七政四餘天星盤、每日黃曆大盤、前台七政與黃曆視圖、實體擬真藝術資產、服務連接埠調整)
- **已完成事項 (Completed)**：
  - 核心演算法庫 (`packages/astro-core`)：
    - `src/qizheng/`：七政（日月金木水火土）與四餘（羅計氣孛）11 星曜黃道天球坐標、28 星宿入宿度數與四象所屬、12 辰次宮位與 12 人事宮位排布、恩難仇用四星格局與三方四正會照。
    - `src/almanac/`：農曆干支、建除十二神（建除滿平定執破危成收開閉）、二十八宿禽星值日吉凶、紫白九星飛泊天盤、每日精選宜忌、喜神/財神/福神八卦方位、日上起時十二時辰吉凶、十二生肖流日評分與十神日主諧振指引。
  - 後端 API 服務 (`apps/server`)：
    - 新增 `POST /api/v1/calculator/qizheng` 端點。
    - 新增 `src/modules/almanac/router.ts`（`GET /api/v1/almanac/today`、`POST /api/v1/almanac/query`）。
    - LLM 神諭引擎擴充支援 `QIZHENG` 與 `ALMANAC` 模組數據上下文合成。
  - 前台主站視圖 (`apps/web`)：
    - 新增 `src/views/QizhengView.vue`（古典雙環天星盤輪盤、11星坐標、28星宿、恩難仇用四星卡片、一鍵 AI 靈犀解盤）。
    - 新增 `src/views/AlmanacView.vue`（御用金箔橫幅、公曆農曆日期切換、建除十二神、廿八宿、九星、精選宜忌徽章、吉神羅盤、12 時辰吉凶時間軸、12 生肖運勢與日主指引、一鍵 AI 靈犀解讀）。
    - 首頁 `HomeView.vue` 升級為八大核心命理體系並集成七政與黃曆。
    - 頂部導航列 `Navbar.vue` 與路由加入 `/qizheng` 與 `/almanac`。
  - 實體擬真高畫質藝術資產生成與落地 (`apps/web/public/images/`)：
    - 韋特塔羅神聖幾何燙金牌背 (`tarot/card_back.jpg`) 與 7 張核心大阿爾克那實體卡面（愚者、魔術師、女祭司、戀人、命運之輪、星星、太陽）。
    - 古典天文雙半球精密天球星圖 (`astronomy/star_chart.jpg`)。
    - 唐宋青銅二十八宿渾天儀與太極八卦古鏡 (`oriental/bagua_astrolabe.jpg`)。
    - 御用金箔硃砂古籍黃曆宣紙橫幅 (`almanac/almanac_banner.jpg`)。
    - 前台 `TarotView.vue`、`QizhengView.vue`、`AlmanacView.vue`、`HomeView.vue` 全面載入實體圖片。
  - 服務連接埠與全網 IP 訪問配置調整 (Task 7.5 & Network Binding)：
    - 前台展示服務 (Web)：預設連接埠為 **9999**，Vite 設定 `host: '0.0.0.0'`，允許區網與公網所有 IP 訪問 (`apps/web/vite.config.ts`)。
    - 管理後台服務 (Admin)：Vite 設定 `host: '0.0.0.0'`，允許所有 IP 訪問 (`apps/admin/vite.config.ts`)。
    - 後端 API 服務 (Server)：預設連接埠為 **9998**，Express 綁定 `HOST: '0.0.0.0'`，支援 Helmet `cross-origin` 與動態反射 CORS 原點，允許全 IP 與跨網域調用 (`apps/server/src/main.ts`, `apps/server/src/app.ts`)。
    - Nginx 與 Docker 映射配置同步對齊 `server_name _` 與全介面監聽。
  - 前台三大易用性與視覺體驗升級 (Theme, DEMO Mode & Quick Bar)：
    - **LIGHT / DARK 晝夜模式全覆蓋修正**：修復淺色模式下文字過淡、黑色輸入框/子卡片黑塊衝突、橫幅遮罩與捲軸色系問題，在 [`apps/web/src/style.css`](file:///home/coder/Codebase/Horoscope/apps/web/src/style.css) 建立完整的淺色模式覆寫引擎，實現晨曦天盤象牙白高對比度典雅視覺。
    - **免登入 DEMO 探索模式**：在 [`apps/web/src/stores/auth.ts`](file:///home/coder/Codebase/Horoscope/apps/web/src/stores/auth.ts) 內建 DEMO 模式（預設開啟），訪客無需登入帳號即可暢遊全站八大占卜與命盤檔案庫；右上角常駐 DEMO 開關標籤，登入彈窗提供一鍵啟動體驗。
    - **頂部上方橫向功能列切換按鈕**：在 [`apps/web/src/components/layout/Navbar.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/components/layout/Navbar.vue) 新增第二橫列功能導覽欄，列出紫微斗數、四柱八字、七政四餘、每日黃曆、周易卜卦、易經起名、西洋星盤、塔羅占卜、命盤檔案庫共 9 大功能按鈕，支援水平滑動與當前路由高亮。
- **已驗證事項 (Verified)**：
  - 單元測試：`pnpm --filter @celestial/astro-core test`（18/18 passed，100% 通過）。
  - API 整合測試：`pnpm --filter @celestial/server test`（21/21 passed，100% 通過）。
  - 全專案總測試：`pnpm test`（39/39 passed，100% 通過）。
  - 前端與全套件構建：`pnpm build`（5 個套件全數通過編譯無誤）。
  - 網路綁定驗證：`pnpm dev:web` 與 `pnpm dev:server` 驗證輸出 `http://0.0.0.0:9998` 與 `http://<Network-IP>:9999`。
  - 靜態資產校驗：各圖片路徑於 public 目錄中皆存在且尺寸完整。
- **剩餘事項 (Remaining)**：
  - 前進 Phase 8：強化 DEMO 模式最大權限 (ADMIN) 與後台 CMS 入口顯著性。

---

### 檢核點回報: Phase 8 (DEMO 模式最大權限升級與後台管理中樞入口強化)
- **當前任務**：Task 8.1 ~ Task 8.4 (DEMO 最大權限、後台入口高能見度、後台 DEMO 免密自動通關、跨網主機名連動)
- **已完成事項 (Completed)**：
  - **DEMO 模式權限升級為系統最高權限 (ADMIN Superuser)**：
    - 在 [`apps/web/src/stores/auth.ts`](file:///home/coder/Codebase/Horoscope/apps/web/src/stores/auth.ts) 將 DEMO 使用者角色提升為 `role: 'ADMIN'`（顯示為 `系統管理員 (DEMO 最高權限)`）。
    - 實作 `ensureDemoToken()`：DEMO 模式啟動時，背景自動請求 `/api/v1/auth/login` 簽發真實的最高管理員 JWT Token，並同步注入 `celestial_token` 與 `admin_token`，確保前台各項進階 API 調用與跳轉後台均具備完整合法授權。
    - 支援 DEMO 模式開關記憶與一鍵切換（預設開啟）。
  - **前台頂部導航列後台入口超高能見度優化**：
    - 在 [`apps/web/src/components/layout/Navbar.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/components/layout/Navbar.vue) 第一列右側新增金色膠囊光暈按鈕 `[⚙️ 後台管理中樞 CMS ↗]`，直接連至後台管理入口。
    - 導航跳轉全面採用動態主機名 `http://${window.location.hostname}:3001?demo=1`，徹底避免硬編碼 `localhost`，無論本機、區域網路或公網 IP 訪問皆能無縫跳轉。
    - 第二列 9 大算命占卜橫向快捷列末端，新增垂直分隔線與專屬 `[⚙️ 系統後台配置 ↗]` 捷徑按鈕。
    - DEMO 狀態按鈕升級為顯著的 `[👑 DEMO模式: ADMIN]` 皇冠金標，支援點擊直接切換開/關。
  - **後台登入頁 DEMO 一鍵直通與自動授權**：
    - 在 [`apps/admin/src/views/LoginView.vue`](file:///home/coder/Codebase/Horoscope/apps/admin/src/views/LoginView.vue) 新增 `[👑 DEMO 模式一鍵登入 (最大權限 ADMIN)]` 快速通關按鈕。
    - 在生命週期 `onMounted` 自動偵測 URL 參數 `?demo=1` 或 localStorage DEMO 旗標，若為 DEMO 模式則自動注入種子管理員憑證並秒速登入跳轉至 `/dashboard`，實現無感免密直達後台。
  - **後台系統界面全域提示與雙向連動**：
    - 在 [`apps/admin/src/App.vue`](file:///home/coder/Codebase/Horoscope/apps/admin/src/App.vue) 側邊欄頂部常駐 `[👑 系統最高管理權限 (ADMIN) - FULL ACCESS]` 提示卡片。
    - 側邊欄底部「造訪前台展示網頁 ↗」同步改為動態主機名 `http://${window.location.hostname}:9999`，實現前台 9999 與後台 3001 雙向動態切換。
- **已驗證事項 (Verified)**：
  - 單元測試：`pnpm --filter @celestial/astro-core test`（18/18 通過）。
  - API 整合測試：`pnpm --filter @celestial/server test`（21/21 通過）。
  - 後台構建測試：`pnpm --filter @celestial/admin build`（編譯產物順利產出）。
  - 前台構建測試：`pnpm --filter @celestial/web build`（編譯產物順利產出）。
  - 全專案總測試：`pnpm test`（39/39 總測試 100% 通過）。
- **剩餘事項 (Remaining)**：
  - 前進 Phase 9：停止 3001 連接埠服務，將 ADMIN 管理功能全量整合至主網站 9999，實作點擊頭像進入編輯管理。

---

### 檢核點回報: Phase 9 (停止 3001 服務、管理功能全量整合至主網站 ADMIN、點擊頭像直接進入編輯)
- **當前任務**：Task 9.1 ~ Task 9.4 (停止 3001 服務、管理頁面整併至 `@celestial/web`、頂部導航頭像直通編輯、清理部署與配置)
- **已完成事項 (Completed)**：
  - **停止並移除 3001 連接埠服務**：
    - 從 `docker-compose.yml` 中完整刪除獨立的 `admin` (3001:80) 容器服務，系統精簡至僅保留前台 (`web`: 9999) 與後端 (`server`: 9998)。
    - 從根目錄 `package.json` 中移除 `dev:admin` 啟動腳本，避免重複或衝突佔用 3001 連接埠。
  - **ADMIN 管理功能全量整併至主網站 (`apps/web`)**：
    - 建立專屬後台路由與頁面體系：
      - [`apps/web/src/views/admin/AdminLayout.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/AdminLayout.vue)：專屬側邊欄管理中樞版型，具備回前台導航、系統最高權限 ADMIN 標章。
      - [`apps/web/src/views/admin/DashboardView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/DashboardView.vue)：即時營運數據大盤與測算熱力排行榜。
      - [`apps/web/src/views/admin/InterpretationsView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/InterpretationsView.vue)：命理辭庫內容管理（新增/編輯/刪除六大模組語料）。
      - [`apps/web/src/views/admin/UsersView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/UsersView.vue)：會員與角色權限管理（VIP/ADMIN 調整）。
      - [`apps/web/src/views/admin/LlmSettingsView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/LlmSettingsView.vue)：天機靈犀 LLM 模型、端點、API Key、System Prompt 在線熱配置與即時連線測試。
    - 於 [`apps/web/src/router/index.ts`](file:///home/coder/Codebase/Horoscope/apps/web/src/router/index.ts) 註冊 `/admin` 巢狀路由，無須跨 Port 跳轉。
    - 於 [`apps/web/src/App.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/App.vue) 優化視圖切換，於進入 `/admin` 時自動隱藏前台公開頁尾與導覽列，展現純粹專業的 CMS 操控介面。
  - **點擊頭像直接進入 ADMIN 編輯管理**：
    - 在 [`apps/web/src/components/layout/Navbar.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/components/layout/Navbar.vue) 優化會員頭像交互元件：
      - 在右上角常駐琉璃金光暈頭像圓形圖章與「{{ authStore.user.displayName }} [ADMIN]」。
      - 標註提示「點擊頭像進入後台編輯 ⚙️」，點擊後直接內部無縫跳轉至 `/admin/dashboard` 進入系統各項編輯與設定。
    - Row 1 的 `[⚙️ 後台管理中樞 CMS]` 與 Row 2 的 `[⚙️ 系統後台配置]` 全數對齊改為內部 Vue Router 導向 `/admin/dashboard`，徹底廢除 3001 外部連結。
- **已驗證事項 (Verified)**：
  - 單元測試：`pnpm --filter @celestial/astro-core test`（18/18 通過）。
  - API 整合測試：`pnpm --filter @celestial/server test`（21/21 通過）。
  - 全專案總測試：`pnpm test`（39/39 總測試 100% 通過）。
  - 前端構建測試：`pnpm --filter @celestial/web build`（包含所有 AdminLayout、Dashboard、Interpretations、Users、LlmSettings 模組成功編譯入 `dist/`）。
- **剩餘事項 (Remaining)**：
  - 前進 Phase 10：排查並修復西洋星盤上升點讀取與後端 LLM 命盤上下文解構異常。

---

### 檢核點回報: Phase 10 (修復西洋星盤上升點屬性讀取異常與後端 LLM 命盤上下文 500 錯誤)
- **當前任務**：Task 10.1 ~ Task 10.3 (西洋星盤 ASC 屬性安全讀取、後端紫微斗數物件 palaces 解構防禦、LLM 神諭合成器全模組容錯強化)
- **已完成事項 (Completed)**：
  - **修復西洋星盤前端 ASC 讀取錯誤**：
    - 於 [`apps/web/src/views/WesternView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/WesternView.vue) 之 `consultAiAssistant` 中，原先誤調用不存在之 `chart.value.angles.ascendantSign`，修正為直接讀取本命盤標準回傳之 `chart.value.ascendantSign`，並增設 `chart.value.angles?.ascendantSign` 與 `chart.value.planets?.find(p => p.name === '上升點')?.sign` 多重容錯鏈，徹底杜絕 `Uncaught TypeError: Cannot read properties of undefined (reading 'ascendantSign')`。
  - **修復後端 LLM 命盤上下文解盤 500 異常**：
    - 於 [`apps/server/src/modules/llm/service.ts`](file:///home/coder/Codebase/Horoscope/apps/server/src/modules/llm/service.ts) 中，核心紫微斗數排盤演算法所產生之 `palaces` 為分支物件映射 (`Record<EarthlyBranch, PalaceCell>`) 而非陣列，原程式碼直接調用 `raw.palaces?.find` 導致擲出 `TypeError: raw.palaces?.find is not a function`，使 `/api/v1/llm/chat` 端點產生 500 內部伺服器錯誤。
    - 重構 `generateCelestialSynthesizerReply`：
      - 針對 `ZIWEI` 支援 `raw.palacesList`（陣列）、`raw.palaces`（陣列）以及 `Object.values(raw.palaces)`（物件轉陣列）等多態結構相容，並透過 `lifePalaceBranch` 索引安全定位命宮主星。
      - 針對 `BAZI`、`ICHING`、`NAME`、`WESTERN`、`TAROT`、`QIZHENG`、`ALMANAC` 八大模組全面加入深層型別與可選鏈防禦。
      - 整體合成器以 `try...catch` 包覆，即便傳入未知或毀損資料亦能優雅回退至國師星君保底批註，絕不導致 API 500 拋錯中斷。
  - **前端各命理視圖呼叫 LLM 靈犀之屬性安全全面強化**：
    - 同步檢查並加固 [`ZiweiView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/ZiweiView.vue)、[`BaziView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/BaziView.vue)、[`NamingView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/NamingView.vue)、[`TarotView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/TarotView.vue)、[`QizhengView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/QizhengView.vue)、[`AlmanacView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/AlmanacView.vue) 之上下文提煉邏輯，確保所有深層存取皆安全無虞。
- **已驗證事項 (Verified)**：
  - 單元測試：`pnpm --filter @celestial/astro-core test`（18/18 通過）。
  - API 整合測試：`pnpm --filter @celestial/server test`（21/21 通過，新增真實物件 palaces 與西洋星盤之 chat 整合驗證）。
  - 全專案總測試：`pnpm test`（39/39 通過）。
  - 前端與後端編譯：`pnpm build` 全數綠燈通過。
- **剩餘事項 (Remaining)**：
  - 前進 Phase 11：排查修復「本地/局域網 Ollama 無 API Key 端點略過問題」，恢復真實大模型推演。

---

### 檢核點回報: Phase 11 (修復本地無密鑰 Ollama/vLLM 端點判定問題，恢復真實 LLM 大模型推演)
- **當前任務**：Task 11.1 ~ Task 11.3 (排查回答極速假資料問題、解鎖無 API Key 本地端點調用、Thinking 深度思考模型相容)
- **已完成事項 (Completed)**：
  - **診斷「回答極速 / 疑似假資料」根本原因**：
    - 使用者於後台配置了局域網 Ollama 實例（`http://192.168.1.3:11434/v1`，模型 `gemma4:e2b`）。
    - 由於 Ollama 等本機/自建服務無須 API Key，資料庫儲存之 `apiKey` 為空字串。
    - 後端 [`apps/server/src/modules/llm/service.ts`](file:///home/coder/Codebase/Horoscope/apps/server/src/modules/llm/service.ts) 原先以 `if (config.apiKey && config.apiKey.trim().length > 0)` 作為是否調用外部端點之硬性門檻，導致空密鑰的本地端點被整段跳過，未送出任何網路請求即在數毫秒內回退至內建的「天機神諭智慧合成引擎（假資料保底）」。
  - **解鎖無密鑰與本地端點調用支援**：
    - 重構發送條件判定：只要配置了自建 / 本地端點（`provider === 'custom'` 或網址包含 `11434`、`localhost`、`192.168.*` 等），即使無 `apiKey` 亦會主動向端點發送真實的 OpenAI 相容協議請求。
    - 若有 API Key 則攜帶 `Authorization: Bearer`，無 API Key 則純 JSON 請求。
    - 針對本地模型推演負載調整超時時間至 60 秒。
  - **支援 Thinking / Reasoning 深度思考模型**：
    - 針對如 `gemma4:e2b`、`deepseek-r1` 等將思考鏈放在 `message.reasoning` 或 `message.thinking` 欄位的模型，增加自動提煉與回傳邏輯。
  - **真實連線驗證通過**：
    - 直連 `http://192.168.1.3:11434/v1` 成功獲得 `gemma4:e2b` 真實生成的萬字古風批命長文，狀態標記為 `source: 'external_api'`。
- **已驗證事項 (Verified)**：
  - 本地模型直連推演：`curl` 測試 `POST /api/v1/llm/chat` 成功取得真實 `gemma4:e2b` 之深層論命長篇回覆。
  - 全套自動化單元測試：`pnpm --filter @celestial/astro-core test`（18/18 通過）。
  - 後端 API 整合測試：`pnpm --filter @celestial/server test`（21/21 通過）。
  - 全專案 39 項測試全部通過。
- **剩餘事項 (Remaining)**：
  - 前進 Phase 12：實作頁面內動態更新 AI 解析區域與 10~25 秒即時思考碼表 UI。

---

### 檢核點回報: Phase 12 (全站 8 大排盤頁面內原地動態 AI 解析專區與 10~25 秒即時思考碼表全面實裝)
- **當前任務**：Task 12.1 ~ Task 12.5 (頁面內解盤元件開發、動態碼表即時秒數計時器、8 大占卜視圖整合、側邊抽屜同步升級、全站編譯與測試驗證)
- **已完成事項 (Completed)**：
  - **核心狀態管理與即時碼表計時實作**：
    - 於 [`apps/web/src/stores/llm.ts`](file:///home/coder/Codebase/Horoscope/apps/web/src/stores/llm.ts) 新增 `elapsedSeconds`（100ms 高頻率計時碼表）與 `activeModelName`。
    - 新增 `fetchStatus()` 於發起前取得後端目前啟動之模型名稱（如 `gemma4:e2b`）。
    - 封裝 `requestDirectAnalysis(context, prompt)` 專用非對話式 API，供頁面內原地解盤調用，並自動管理碼表啟停與耗時統計。
  - **通用頁面內解盤元件 [`InPageAiAnalysis.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/components/ai/InPageAiAnalysis.vue) 實裝**：
    - **待命狀態 (Idle)**：呈現古典金箔星象風格卡片，標明連線目標模型，提供一鍵「實時推演」按鈕。
    - **思考中狀態 (Loading)**：
      - 呈現宇宙星環旋轉與脈衝光暈動畫。
      - 提示「連線目標模型：`gemma4:e2b`」。
      - **動態碼表即時秒數更新**（`已深入思考：⏱️ X 秒`），忠實反映大模型 10~25 秒推理過程。
    - **解讀完成狀態 (Completed)**：
      - 原地動態更新呈現命理神諭批註長文。
      - 標註來源標籤（實時大模型推演 / 天機神諭合成）、目標模型（`gemma4:e2b`）與精準耗時秒數。
      - 提供「重新推演」、「複製」與「深入叩問（開啟側邊抽屜接續對話）↗」操作。
    - **錯誤狀態 (Error)**：提供重試與友好錯誤資訊提示。
  - **全站 8 大占卜排盤視圖全數整合 `InPageAiAnalysis`**：
    1. [`WesternView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/WesternView.vue)（西洋占星本命盤、相位與上升點分析）
    2. [`ZiweiView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/ZiweiView.vue)（紫微斗數十二宮、主星與三方四正分析）
    3. [`BaziView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/BaziView.vue)（四柱八字、日元旺衰與喜用神詳批）
    4. [`TarotView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/TarotView.vue)（韋特塔羅 78 張牌陣牌意流動深度解析）
    5. [`IchingView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/IchingView.vue)（周易文王六爻、本卦變卦動爻斷語）
    6. [`NamingView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/NamingView.vue)（姓名學五格三才吉凶與八字喜用評析）
    7. [`QizhengView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/QizhengView.vue)（七政四餘天星度數、恩難四星吉凶）
    8. [`AlmanacView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/AlmanacView.vue)（通勝黃曆每日值神、二十八宿與個人生肖吉凶化解）
  - **全域側邊對話抽屜升級**：
    - 於 [`apps/web/src/components/ai/LlmAssistantModal.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/components/ai/LlmAssistantModal.vue) 思考中訊息卡片同步嵌入目標模型標籤與實時思考碼表（`已耗時 X 秒... 模型: gemma4:e2b`）。
- **已驗證事項 (Verified)**：
  - 前端編譯構建：`pnpm --filter @celestial/web build` 零錯誤，打包成功。
  - 核心演算法庫測試：`pnpm --filter @celestial/astro-core test`（18/18 通過）。
  - 後端 API 服務測試：`pnpm --filter @celestial/server test`（21/21 通過）。
  - 全專案 39 項自動化測試全數通過（39/39 passed）。
  - 服務健康狀態檢測：後端（9998/health）與前端（9999/）皆運行正常。
- **剩餘事項 (Remaining)**：
  - 前進 Phase 13：排查與修復後台 LLM 設定頁面「模型名稱顯示全大寫」與「離開設定頁面後恢復預設值」之根本原因。

---

### 檢核點回報: Phase 13 (修復後台 LLM 設定頁面字型全大寫渲染、DEMO 模式儲存持久化與無金鑰 Ollama 支援)
- **當前任務**：Task 13.1 ~ Task 13.4 (修復 Cinzel 字型導致的偽大寫渲染、解鎖無金鑰清空更新、強化 DEMO 模式免授權認證穿透、持久化還原防護)
- **已完成事項 (Completed)**：
  - **診斷並修復「模型名稱輸入與顯示皆變大寫」問題**：
    - **根本原因**：專案設定之古典羅馬風格字型 `font-serif` 採用 `Cinzel`，該字型所有英文字母皆為大寫（Small Caps / Full Capitals）。當後台設定頁面外層套用 `font-serif` 時，輸入框 (`input`) 與標籤繼承了該字型，使小寫輸入的 `gemma4:e2b` 在視覺畫面上被渲染為全大寫 `GEMMA4:E2B`。
    - **修復方案**：
      - 於 [`apps/web/src/views/admin/LlmSettingsView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/LlmSettingsView.vue) 中，將端點 URL、金鑰、模型名稱等輸入框全面切換為 `font-mono normal-case font-normal`，並加上 `autocapitalize="none"`、`autocomplete="off"` 與 `spellcheck="false"`，徹底解除全大寫字型限制。
      - 常用模型快捷按鈕全面加入 `font-mono normal-case`，新增 `gemma4:e2b`、`llama3`、`deepseek-r1` 等預設。
      - 前台通用解盤元件 [`InPageAiAnalysis.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/components/ai/InPageAiAnalysis.vue) 與抽屜 [`LlmAssistantModal.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/components/ai/LlmAssistantModal.vue) 之模型標籤同步追加 `normal-case`，確保模型名稱 100% 保持原始小寫 `gemma4:e2b`。
  - **診斷並修復「離開設定頁面回來後恢復預設值」問題**：
    - **原因 1 (DEMO 模式授權 401)**：若訪客於 DEMO 模式下訪問後台，Token 在非同步初始化前可能為空，導致 `GET /api/v1/admin/llm-config` 與 `PUT` 請求返回 401 拒絕存取，表單因取得失敗而維持初始預設值，儲存變更亦未寫入資料庫。
      - 修復：於後端 [`apps/server/src/middleware/auth.ts`](file:///home/coder/Codebase/Horoscope/apps/server/src/middleware/auth.ts) 賦予 DEMO 模式標頭（`x-demo-mode: true`）或 `demo-admin-token` 完整的 `ADMIN` 最大權限；前端 `getHeaders()` 自動注入標頭，徹底解決免登入配置時的 401 異常。
    - **原因 2 (無金鑰 Ollama 留空被後端略過)**：原後端使用 `if (apiKey && !apiKey.includes('••••'))` 判定，使空字串 `apiKey: ""` 被視為 falsy 而忽略更新。
      - 修復：重構為 `if (typeof apiKey === 'string' && !apiKey.includes('••••')) updateData.apiKey = apiKey.trim();`，完美支援 Ollama 本地無密鑰服務。
    - **原因 3 (測試案例覆寫正式資料庫)**：後端測試案例在執行時會將配置改為 `claude-3-5-sonnet` 且未還原。
      - 修復：在測試完成後自動還原原本設定，並將預設值調整為 `custom`、`http://192.168.1.3:11434/v1`、`gemma4:e2b`。
  - **增強本機 Ollama 請求逾時門檻**：
    - 針對本地模型載入與深度思考長推演，於後端服務調升逾時限制至 180 秒（3 分鐘），避免推演中途被終止。
- **已驗證事項 (Verified)**：
  - 前端編譯：`pnpm --filter @celestial/web build` 構建成功。
  - 全套測試：`pnpm test` 39/39 項測試全數綠燈通過。
  - 端點校驗：直接驗證 `GET /api/v1/admin/llm-config` 與 `PUT` 在無 token 下攜帶 demo 標頭皆精準回傳 `model: 'gemma4:e2b'`，且資料庫持久化儲存無誤。
- **剩餘事項 (Remaining)**：
  - 前進 Phase 14：修復 `AdminLayout.vue` 拋出 `authStore.ensureDemoToken is not a function` 之 Pinia 導出遺漏問題。

---

### 檢核點回報: Phase 14 (修復 Pinia Auth Store 遺漏導出 ensureDemoToken 導致的執行期異常)
- **當前任務**：Task 14.1 ~ Task 14.2 (補齊 Pinia Store 導出、強化 AdminLayout 與 LlmSettingsView 呼叫防護、重構構建驗證)
- **已完成事項 (Completed)**：
  - **診斷並修復 `ensureDemoToken is not a function` 異常**：
    - **根本原因**：於 [`apps/web/src/stores/auth.ts`](file:///home/coder/Codebase/Horoscope/apps/web/src/stores/auth.ts) 內部實作了非同步函式 `ensureDemoToken()`，但在 Store 結尾的 `return { ... }` 物件中遺漏了該函式的導出。導致 [`AdminLayout.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/AdminLayout.vue) 與 [`LlmSettingsView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/LlmSettingsView.vue) 在呼叫 `authStore.ensureDemoToken()` 時擲出 `TypeError: authStore.ensureDemoToken is not a function`。
    - **修復方案**：
      - 於 [`apps/web/src/stores/auth.ts`](file:///home/coder/Codebase/Horoscope/apps/web/src/stores/auth.ts) 導出物件中補齊 `ensureDemoToken`。
      - 於 [`AdminLayout.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/AdminLayout.vue) 與 [`LlmSettingsView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/LlmSettingsView.vue) 加入型別安全防禦保護 `typeof authStore.ensureDemoToken === 'function'`，確保極端狀況下亦不中斷渲染。
- **已驗證事項 (Verified)**：
  - 前端構建：`pnpm --filter @celestial/web build` 零錯誤編譯通過。
  - 全套測試：`pnpm test` 39/39 項測試全部通過。
  - 控制台無異常拋錯。
- **剩餘事項 (Remaining)**：
  - 前進 Phase 15：完成全站功能解盤專區「下方一整列自然垂直展開」、「標準 Markdown 支援」與「深淺色模式文字色彩完美協調適配」。

---

### 檢核點回報: Phase 15 (全站 AI 解盤全寬底列佈局、Markdown 格式渲染與深淺主題典雅色彩調和)
- **當前任務**：Task 15.1 ~ Task 15.4 (各功能視圖底列重構、Markdown 渲染引擎整合、深淺色色彩對比調和、自然垂直展開與全鏈路測試)
- **已完成事項 (Completed)**：
  - **1. 各功能視圖底列獨立全寬佈局**：
    - 將全站 8 大命理模組：西洋星盤 ([`WesternView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/WesternView.vue))、紫微斗數 ([`ZiweiView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/ZiweiView.vue))、四柱八字 ([`BaziView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/BaziView.vue))、七政四餘 ([`QizhengView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/QizhengView.vue))、姓名學 ([`NamingView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/NamingView.vue))、周易卜卦 ([`IchingView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/IchingView.vue))、韋特塔羅 ([`TarotView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/TarotView.vue))、通勝黃曆 ([`AlmanacView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/AlmanacView.vue)) 之 AI 解盤卡片，全數從原先的局部巢狀網格中獨立移出，統一配置在頁面底部的全寬一整列（`w-full my-8`）。
  - **2. 標準 Markdown 語法格式解析**：
    - 引入零依賴高性能 [`marked`](file:///home/coder/Codebase/Horoscope/apps/web/package.json) 引擎，於 [`InPageAiAnalysis.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/components/ai/InPageAiAnalysis.vue) 動態解析模型回傳文本。
    - 支援 GFM 規範：各級標題（H1~H4）、加粗重點、斜體、有序/無序清單、典雅引號區塊（Blockquotes）、行內代碼、代碼區塊、水平分隔線以及標準 Markdown 表格（Tables，含奇偶行斑馬紋與古銅色邊框）。
  - **3. 長文無限制自然垂直展開與折疊**：
    - 徹底移除任何高度截斷（如 `max-h`）或內部雙重滾動條限制，解盤長篇大論自然全幅延展，提供行距（line-height: 1.95）極度舒適的大師級閱讀排版；同時提供「收起 / 展開批註」按鈕供彈性切換。
  - **4. 深淺雙色模式色彩協調適配（消除不協調顏色）**：
    - **診斷問題**：先前淺色模式（Light Mode）下，由於 Tailwind 預設缺乏原生 `light:` 變體，導致文字區塊殘留半透明黑色底色（`bg-black/25`），且強調字套用亮黃色（`text-amber-400`）在淺底上發白刺眼、對比嚴重不足。
    - **解決方案**：
      - 於 [`tailwind.config.js`](file:///home/coder/Codebase/Horoscope/apps/web/tailwind.config.js) 加入自訂 Tailwind 插件支援 `light:` 變體（`html.light &`）。
      - 於 [`style.css`](file:///home/coder/Codebase/Horoscope/apps/web/src/style.css) 補齊 `bg-black/25` 等背景色覆寫。
      - 於 [`InPageAiAnalysis.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/components/ai/InPageAiAnalysis.vue) 深度訂製專屬雙主題 Markdown 樣式：
        - **深色夜幕 (Dark Void)**：背景採用深邃琉璃黑夜（`rgba(10, 12, 18, 0.75)`），標題為宮廷金（`#E5C378`），重點加粗為琥珀金（`#FBBF24`），內文為柔和月牙白（`#E6ECF5`），引文框以金箔左邊線點綴。
        - **晨曦天盤 (Light Alabaster)**：背景切換為溫潤古籍宣紙色（`#FAF8F3`），標題為沉穩古銅金（`#7A541B`），重點加粗採用皇室朱砂紅（`#9A3412`），內文為清晰典雅的松煙黛黑（`#202530`），徹底消除所有生硬或灰黑殘留之不協調顏色。
- **已驗證事項 (Verified)**：
  - 前端構建：`npx pnpm --filter @celestial/web build` 零警告、零錯誤打包成功。
  - 單元與整合測試：`npx pnpm test` 全站 39 項測試 100% 通過（astro-core 18/18 + server 21/21）。
  - 深淺色切換測試：Dark Mode 與 Light Mode 下，AI 推演面板之標籤、計時碼表、思考條、內文區塊與 Markdown 渲染色彩皆達到 Awwwards 級協調一致性。
- **剩餘事項 (Remaining)**：
  - 前進 Phase 16：根據不同命理占星學術體系，設定專屬角色 RAG 檢索增強與專業現代顧問人設，全面屏除仙人道士口吻。

---

### 檢核點回報: Phase 16 (分術數專屬專業顧問角色 RAG 引擎、屏除仙人道士口吻、高擬真現代諮詢體系)
- **當前任務**：Task 16.1 ~ Task 16.4 (全術數專業角色 Persona 矩陣、專屬 RAG 知識庫提煉與動態檢索、全站 Prompt 與合成器去仙道化重構、單元與整合測試驗證)
- **已完成事項 (Completed)**：
  - **1. 全站 8 大占星算命體系專屬角色 RAG 矩陣建立**：
    - 於 [`apps/server/src/modules/llm/service.ts`](file:///home/coder/Codebase/Horoscope/apps/server/src/modules/llm/service.ts) 為各占卜功能量身定做專業現代角色 Persona 與專屬 RAG 領域知識庫（Core Knowledge & Guidelines）：
      1. **紫微斗數 (ZIWEI)**：`資深紫微斗數命理諮詢師`，基於中州派與三合派論命架構，著重宮位星曜組合、三方四正照會、四化引動與現代人生生涯/心理/情感策略。
      2. **四柱八字 (BAZI)**：`專業子平八字命理專家`，以十天干日主旺衰、十神才能心理學、寒暖燥濕調候用神與十年大運轉折為核心，客觀冷靜、條理清晰。
      3. **西洋占星 (WESTERN)**：`現代人本與心理占星師`，結合榮格深層心理學原型、日月升核心動力、五大主要相位張力與八大月相生命週期，重視自我賦權與成長覺察。
      4. **韋特塔羅 (TAROT)**：`專業塔羅諮商師與潛意識引導者`，以意象符號學與潛意識投射為綱，秉持「人有自由意志，牌卡揭示盲點，行動改變結果」，給出具體三步行動破局方案。
      5. **周易六爻 (ICHING)**：`易經戰略與決策思維顧問`，融匯《易經》時位辯證與現代決策博弈論，純粹依據本卦、動爻變機、互卦暗流分析局勢起承轉合。
      6. **七政四餘 (QIZHENG)**：`古典七政四餘天星學家`，以周天二十八宿宿度經緯、十一曜行度與恩難仇用四星生剋制化為依歸，考究嚴謹、博大精深。
      7. **姓名學 (NAME)**：`正統姓名學與文字學顧問`，結合《康熙字典》正統筆劃部首規範、三才五格剖象與現代社交心理學，提出客觀中肯建言。
      8. **通勝黃曆 (ALMANAC)**：`傳統曆法與生活擇吉顧問`，倡導「順天時、應地利、調人和」，將建除十二神與吉凶宜忌轉化為現代生活與商務決策的實用指南。
  - **2. 徹底屏除「仙人道士口吻」（去玄化與真實現態）**：
    - 嚴禁模型使用虛假神仙、道士、玄幻小說口吻，嚴禁出現「道友」、「貧道」、「老夫」、「天機星君」、「仙風道骨」、「神明之庇」等虛構稱謂。
    - 全面以「您」尊稱求測者，語言客觀、結構嚴整、富有人文關懷與實踐價值。
  - **3. RAG 知識檢索增強引擎 (Knowledge Grounding)**：
    - 實作 `retrieveModuleKnowledge()`，整合資料庫 [`SystemInterpretation`](file:///home/coder/Codebase/Horoscope/packages/database/prisma/schema.prisma) 專業詞庫檢索與模組專屬核心知識，動態注入星曜四化、十神喜忌、幾何相位等權威斷語。
  - **4. 內建回退合成引擎 (Fallback Synthesizer) 全面革新**：
    - 重構 `generateProfessionalSynthesizerReply()`，在離線或本地無外網狀況下，亦能根據具體盤面數據輸出具備階層標題、專業分析章節的大師級報告。
  - **5. 前台各頁面呼叫 Prompt 與 UI 全面配合**：
    - 更新全站 8 大視圖（[`WesternView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/WesternView.vue)、[`ZiweiView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/ZiweiView.vue)、[`BaziView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/BaziView.vue)、[`IchingView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/IchingView.vue)、[`NamingView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/NamingView.vue)、[`TarotView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/TarotView.vue)、[`QizhengView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/QizhengView.vue)、[`AlmanacView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/AlmanacView.vue)）之 Prompt 與按鈕文案。
    - 更新 [`LlmAssistantModal.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/components/ai/LlmAssistantModal.vue)、[`InPageAiAnalysis.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/components/ai/InPageAiAnalysis.vue)、[`llm.ts`](file:///home/coder/Codebase/Horoscope/apps/web/src/stores/llm.ts) 預設歡迎詞以及後台管理設定 [`LlmSettingsView.vue`](file:///home/coder/Codebase/Horoscope/apps/web/src/views/admin/LlmSettingsView.vue)。
- **已驗證事項 (Verified)**：
  - 前端構建：`npx pnpm --filter @celestial/web build` 零錯誤打包通過。
  - 全域意圖測試：`npx pnpm test` 39/39 項測試 100% 綠燈通過。
  - 本地 Ollama 實例端點連線驗證：成功透過本機 Ollama `gemma4:e2b` 驗證紫微斗數與四柱八字端點生成，產出均為專業現代顧問口吻，無任何仙人道士術語，結構清晰、論斷精湛。
- **剩餘事項 (Remaining)**：
  - 前進 Phase 17：導入倪海廈《天紀》紫微斗數命相心法與正統格局 RAG 知識庫。

---

### 檢核點回報: Phase 17 (倪海廈《天紀》紫微斗數命相心法與三合正統格局 RAG 體系)
- **當前任務**：Task 17.1 ~ Task 17.3 (三合派正統格局庫、格局條件識別引擎、倪師命相心法 RAG 辭條注入與測試)
- **已完成事項 (Completed)**：
  - **1. 正統格局識別演算法 (`packages/astro-core/src/ziwei/patterns.ts`)**：
    - 收錄《紫微斗數全書》經典格局：君臣慶會、紫府同宮、機月同梁、陽梁昌祿、日照雷門、月朗天門、火貪格、鈴貪格、巨日同宮、太陰化忌入命、化權入官、昌曲同會、輔弼同會等。
    - 嚴格定義成立條件（Required & Optional）、吉凶層級（`excellent` 大吉、`good` 成格、`neutral` 平和、`caution` 警示）與古籍出處。
  - **2. 倪海廈命相心法 RAG 種子資料庫注入 (`packages/database/src/seed.ts`)**：
    - 注入「2/3 大於 1/3」命運決策哲學（天命 1/3、地理 1/3、人事 1/3；地理+人事可改天命）。
    - 注入「名位相等」陽宅配置哲學與以果決行決策論。
  - **3. 前端格局標籤與古籍詳解彈窗展示 (`apps/web/src/views/ZiweiView.vue`)**：
    - 於命盤三方四正分析區呈現識別出之格局徽章，點擊標籤即時彈出成立條件、星曜配置與古籍斷語。
- **已驗證事項 (Verified)**：
  - 單元測試：`astro-core.test.ts` 新增三合派格局識別測試通過。
  - 整合測試：`role-rag.test.ts` 驗證 ZIWEI 模組檢索出倪師心法與格局辭條。

---

### 檢核點回報: Phase 18 (西洋占星與韋特塔羅當代大師級語錄 RAG 擴充)
- **當前任務**：Task 18.1 ~ Task 18.3 (國際宗師文獻彙整、RAG 辭條結構化寫入、合成器與檢索增強)
- **已完成事項 (Completed)**：
  - **1. 當代占星與塔羅宗師文獻庫注入 (`packages/database/src/seed.ts`)**：
    - **西洋占星大師**：卡爾·榮格 (Carl Jung，共時性與原型心法)、丹·路德雅爾 (Dane Rudhyar，人本占星與命運週期)、莉茲·格林 (Liz Greene，陰影整合與冥王土星心理學)、史蒂芬·阿若優 (Stephen Arroyo，四大元素能量占星)、羅伯特·漢德 (Robert Hand，古典象徵與行星相位)。
    - **韋特塔羅大師**：愛德華·韋特 (A.E. Waite，象徵圖解之鑰)、蕾切爾·波拉克 (Rachel Pollack，78 度智慧與愚人之旅)、瑪麗·格利爾 (Mary K. Greer，逆位牌破局逆轉心法)、亞歷杭德羅·佐杜洛夫斯基 (Alejandro Jodorowsky，神聖塔羅潛意識重塑)。
  - **2. 後端動態檢索與離線合成器升級 (`apps/server/src/modules/llm/service.ts`)**：
    - 提升大師心法辭條檢索權重，使求測者在諮商本命盤或牌陣時，能精準引用宗師洞見。
- **已驗證事項 (Verified)**：
  - `role-rag.test.ts` 驗證 `WESTERN` 與 `TAROT` 成功檢索出榮格、路德雅爾、韋特、波拉克大師語錄。

---

### 檢核點回報: Phase 19 (八字合婚與家人群組比對系統)
- **當前任務**：Task 19.1 ~ Task 19.4 (子平合婚演算法、家庭五行場域與動態矩陣、專屬 API 端點、前端 SynastryView 交互)
- **已完成事項 (Completed)**：
  - **1. 核心合婚演算法 (`packages/astro-core/src/bazi/synastry.ts`)**：
    - 子平五維合婚評分：天干五合、夫妻宮六合/三合/半合/相沖/相害、五行能量互補、年柱納音神煞、四柱干支詳細交互。
    - 通關五行精準推導（金木相戰以水通關、水火相射以木通關等）與具體生活調適建議。
  - **2. 家人群組比對演算法 (`calculateFamilyGroup`)**：
    - 全家五行能量聚合：家庭主導能量、匱乏能量、氣場象徵標題。
    - 成員兩兩動態關係矩陣 ($C(N, 2)$ 交叉動態評分與描述)。
    - 家庭角色站位（家族舵手、家族調和者、家族開拓者、家族守護者）。
  - **3. 後端 API 與專屬 RAG 顧問模組**：
    - 新增 `POST /api/v1/calculator/bazi/synastry` 與 `POST /api/v1/calculator/family/group`。
    - 註冊 `BAZI_SYNASTRY` 與 `FAMILY_GROUP` 專屬專業顧問 Persona 與檢索配置。
  - **4. 前端綜合視圖 (`apps/web/src/views/SynastryView.vue`)**：
    - 支援「八字合婚」與「家人群組」雙分頁切換、一鍵載入已存命盤、InPageAiAnalysis 深度詳批。
- **已驗證事項 (Verified)**：
  - 單元測試：`astro-core.test.ts` 驗證合婚與家庭群盤計算正確性。
  - 整合測試：`api.test.ts` 與 `role-rag.test.ts` 驗證端點與顧問角色 RAG。

---

### 檢核點回報: Phase 20 (深度對標 ziwei-doushu-main 強化 RAG 與天紀雙軌合參)
- **當前任務**：Task 20.1 ~ Task 20.5 (移植 heming-knowledge.ts、注入 entries.jsonl 1848條語料、陽宅化命後天八卦名位相等配置、Structured Chart-Entity Grounding、Light 模式文字對比修正)
- **已完成事項 (Completed)**：
  - **1. 完整移植《天紀》合盤知識庫 (`packages/astro-core/src/bazi/synastry.ts`)**：
    - 夫妻宮十四主星全斷語 (`STAR_IN_FUQI_GU`)、四化斷語 (`SIHUA_IN_FUQI_GU`) 與倪海廈原話引文。
    - 紫微斗數 × 倪海廈《天紀》五步合盤法（命格基礎互補、夫妻宮互參與天作之合判定、太陽太陰互參、四化飛化互參、婚期建議與陽宅化命）。
    - 雙宮聯參鐵律（看婚姻必同時看夫妻宮與福德宮）。
  - **2. 倪海廈《天紀·地脈道》陽宅化命：後天八卦名位相等配置**：
    - 成員角色對應八卦方位（乾父西北、坤母西南、震長子正東、巽長女東南、坎次子正北、離次女正南、艮三子東北、兌三女正西）。
    - 名位法則、地天泰/水火既濟配置、紫微六親宮位註解與陽宅錯位越位禁忌警示（如長子居西北之雷天大壯）。
  - **3. RAG 知識庫種子擴充與注入 (`packages/database/src/seed-nihai.ts`)**：
    - 自 1,848 條原話語料庫提煉 8 大高密度繁體中文專題辭條寫入 SQLite，全站辭條達到 61 條。
  - **4. Structured Chart-Entity Grounding（動態命盤實體注入）**：
    - 在後端 `retrieveModuleKnowledge()` 自動提取當前合婚之 `ziweiHeming` 與家庭之 `baguaPosition` 注入 Prompt，並支援跨模組檢索。
  - **5. 視覺對比度修復 (Light Mode Contrast)**：
    - 修正 `ZiweiView.vue`、`AlmanacView.vue` 與 `SynastryView.vue` 在淺色模式下的卡片文字可讀性。
- **已驗證事項 (Verified)**：
  - `astro-core.test.ts`：22/22 passed。
  - `server` 測試：55/55 passed (包含 `api.test.ts`, `role-rag.test.ts`, `admin-features.test.ts`)。
  - 全專案總計 77 項測試 100% 綠燈通過。

---

### 檢核點回報: Phase 21 (iPhone 行動瀏覽器相容性與全專案文件同步)
- **當前任務**：Task 21.1 ~ Task 21.2 (行動裝置可用性驗證、全專案 Markdown 文件完整同步)
- **已完成事項 (Completed)**：
  - 全面優化手機版寬度自適應佈局（`SynastryView.vue`、`ZiweiView.vue`、`InPageAiAnalysis.vue`），針對 iOS Safari 滾動彈性與表單按鈕點擊區域微調。
  - 完整更新全專案 Markdown 說明文件：`README.md`、`TASK_LIST.md`、`DEVELOPMENT_LOG.md`、`TEST_REPORT.md`、`test_plan.md`、`code_review.md`。
- **已驗證事項 (Verified)**：
  - Monorepo 全套件構建檢查 `npx pnpm -r build` 成功。
  - 全自動化測試 `npx pnpm -r test` 77/77 項測試 100% 通過。
- **剩餘事項 (Remaining)**：
  - 完成 GitHub 提交並推送更新。
