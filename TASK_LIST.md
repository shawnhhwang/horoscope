# 📋 萬象天儀 (Astraea & CelestialDao) — 執行任務清單 (TASK_LIST.MD)

> **遵循規範**：嚴格遵循 [AGENTS.md](file:///home/coder/Codebase/Horoscope/AGENTS.md) 核心準則（先想再寫、先求簡單、外科式修改、目標導向、意圖驗證、多步驟檢核）與 [SPEC.MD](file:///home/coder/Codebase/Horoscope/SPEC.MD) 規格。  
> **狀態標記**：`[ ]` 未開始 ｜ `[/]` 進行中 ｜ `[x]` 已完成並通過驗證  

---

## 執行總覽與階段里程碑 (Milestones Overview)

| 階段 | 模組名稱 | 關鍵成果 (Deliverables) | 預估步驟 |
|---|---|---|---|
| **Phase 0** | **專案骨架與 Monorepo 基礎架構** | pnpm workspace、TypeScript、Tailwind 雙主題底座 | 4 步驟 |
| **Phase 1** | **命理與星象核心演算法庫 (`packages/astro-core`)** | 六大命理純函數計算引擎、100% 意圖單元測試 | 6 步驟 |
| **Phase 2** | **資料持久層與後端 API 服務 (`packages/database` & `apps/server`)** | Prisma PostgreSQL、JWT 認證、真太陽時、排盤 API | 5 步驟 |
| **Phase 3** | **Awwwards 級前端體驗與 3D 視覺 (`apps/web`)** | Three.js 渾天星盤、3D 塔羅牌、雙主題、六大測算介面 | 7 步驟 |
| **Phase 4** | **管理後台 CMS 系統 (`apps/admin`)** | 詞庫熱編修、康熙字典管理、會員與權限、數據大盤 | 4 步驟 |
| **Phase 5** | **Docker 容器化全棧部署 (`deploy/docker`)** | 多階段 Dockerfile、`docker-compose.yml` 一鍵編排 | 3 步驟 |
| **Phase 6** | **全端整合驗證與生產發布 (Production Readiness)** | E2E 測試、Lighthouse > 95、部署驗收 | 3 步驟 |
| **Phase 23** | **流年生活行運曆、起居習慣日記與 AI 規劃** | 十二流月曆、起居 CRUD、五行諧振評分、年度生活規劃書 | 5 步驟 |
| **Phase 24** | **百歲流年·人生推演模擬器 (0-100 BaZi Life Odyssey)** | 0~100歲流年骨幹、五維屬性規則、台灣時代大事紀擬真、雙軌推進、LLM 抉擇、一生蓋棺論定 | 7 步驟 |
| **Phase 29** | **超詳細使用者說明手冊、網站連結指南與命理明師智能問診導航** | 完整使用手冊 (USER_MANUAL.md)、全站情境指南 View (/guide)、AI 明師情境問診、Markdown 站內跳轉 | 5 步驟 |

---

## Phase 0: 專案骨架與 Monorepo 基礎架構

### 任務目標
建立乾淨、模組化且型別安全的 Monorepo 架構，隔離演算法、資料庫與應用端。

- [x] **Task 0.1: 初始化 Monorepo 專案結構**
  - **範圍**：建立根目錄 `package.json`、`pnpm-workspace.yaml`、根 `tsconfig.json`、`.gitignore`、`.editorconfig`。
  - **目錄規劃**：
    - `packages/astro-core` (共用純命理演算法庫)
    - `packages/database` (Prisma ORM 與 DB Client)
    - `apps/server` (Node.js API 後端)
    - `apps/web` (Vue 3 前端展示與 3D 交互)
    - `apps/admin` (Vue 3 管理後台 CMS)
  - **成功的樣貌 (DoD)**：執行 `pnpm install` 成功，所有 workspace 互相識別無警告。
  - **驗證方式**：`pnpm -r exec echo "workspace ready"` 正常輸出。

- [x] **Task 0.2: 設定共通代碼質量與 Lint 規範**
  - **範圍**：配置 ESLint + Prettier，整合 TypeScript 5 嚴格型別檢查 (`strict: true`)。
  - **成功的樣貌 (DoD)**：執行 `pnpm lint` 零錯誤通過。
  - **驗證方式**：`pnpm lint`。

---

## Phase 1: 命理與星象核心演算法庫 (`packages/astro-core`)

> [!IMPORTANT]
> **規則遵循 (Rule 9: Intent-Based Testing)**  
> 演算法純函數必須具備確定性輸入/輸出。每個演算法必須編寫意圖測試（當納音算錯、節氣交界點跳轉錯誤、變爻翻轉錯誤時，測試必須確實失敗）。

- [x] **Task 1.1: 曆法與天文基礎換算模組 (`astro-core/calendar`)**
  - **範圍**：
    - 精確二十四節氣時間點計算（節氣交接分秒）。
    - 公曆 ➔ 農曆干支換算（年柱、月柱、日柱、時柱 60 甲子）。
    - 經緯度真太陽時校正（True Solar Time，平太陽時時差 + 經度每度 4 分鐘校正）。
  - **成功的樣貌 (DoD)**：能準確計算跨節氣瞬間（如立春前後 1 分鐘）的干支變換與早晚子時區分。
  - **驗證方式**：`pnpm --filter @celestial/astro-core test calendar`。

- [x] **Task 1.2: 紫微斗數排盤演算法 (`astro-core/ziwei`)**
  - **範圍**：
    - 定命宮、身宮（順月逆時、順月順時）。
    - 定五行局（水二局、木三局、金四局、土五局、火六局）。
    - 安紫微、天府系十四主星，計算各宮星曜廟旺平陷。
    - 安六吉星（昌曲輔弼魁鉞）、六煞星（羊陀火鈴空劫）、四化星（祿權科忌）。
    - 排定大限、流年太歲宮與流年斗君。
  - **成功的樣貌 (DoD)**：輸入權威命盤案例（例如 1984 年甲子農曆六月初六午時生人），排盤星曜落宮與傳統紫微斗數古籍完全相符。
  - **驗證方式**：`pnpm --filter @celestial/astro-core test ziwei`。

- [x] **Task 1.3: 四柱八字與十神旺衰演算法 (`astro-core/bazi`)**
  - **範圍**：
    - 四柱排定、地支藏干（本氣、中氣、餘氣）。
    - 十神對照矩陣（正印、偏印、正官、七殺、正財、偏財、食神、傷官、比肩、劫財）。
    - 五行生剋能量定量分析、日主強弱判別（身強/身弱/專旺/從格）。
    - 喜用神、忌神、仇神推導演算法。
    - 天干五合、地支六合、三合局、刑衝會害檢測。
    - 起大運歲月日計算與流年干支走勢。
  - **成功的樣貌 (DoD)**：精準輸出八字全局十神能量百分比與喜用五行。
  - **驗證方式**：`pnpm --filter @celestial/astro-core test bazi`。

- [x] **Task 1.4: 周易卜卦演算法 (`astro-core/iching`)**
  - **範圍**：
    - 六爻金錢卦生成器（3 枚銅錢投擲機率模擬：老陽 9、少陰 8、少陽 7、老陰 6）。
    - 梅花易數起卦算法（年月日時辰起卦、數字起卦）。
    - 64 卦對照矩陣：本卦、變卦（動爻轉換）、互卦、錯卦、綜卦。
    - 384 爻動爻對應與卦身世應爻位定位。
  - **成功的樣貌 (DoD)**：輸入任意動爻組合，能精準推導出對應的之卦與互卦。
  - **驗證方式**：`pnpm --filter @celestial/astro-core test iching`。

- [x] **Task 1.5: 姓名學三才五格與八字喜用起名演算法 (`astro-core/naming`)**
  - **範圍**：
    - 正體字康熙筆劃對照邏輯（部首正統特殊筆劃規範）。
    - 天格、人格、地格、總格、外格五格數理吉凶計算（81 數理吉凶表）。
    - 三才配置五行生剋格局（125 種三才組合吉凶判定）。
    - 配合八字喜用神缺損字庫篩選演算法。
  - **成功的樣貌 (DoD)**：輸入姓名能產出五格分數與三才評析；給定八字喜用能推薦平衡五行之正字。
  - **驗證方式**：`pnpm --filter @celestial/astro-core test naming`。

- [x] **Task 1.6: 西洋本命星盤、月相與塔羅核心 (`astro-core/western` & `tarot`)**
  - **範圍**：
    - 西洋占星：太陽、月亮、水金火木土天海冥十星坐標、四軸 (ASC/MC/DSC/IC)、Placidus 宮位劃分、五大主要相位（允許度計算）。
    - 月亮星座與 8 大月相原型計算（新月、眉月、上弦月、盈凸月、滿月等）。
    - 塔羅：78 張牌庫定義、Fisher-Yates 隨機洗牌、正逆位判定、5 種經典牌陣映射（單張、時間流、聖三角、二選一、塞爾特十字）。
  - **成功的樣貌 (DoD)**：精確輸出天體相位列表；隨機洗牌保證無重複發牌且牌陣槽位映射無誤。
  - **驗證方式**：`pnpm --filter @celestial/astro-core test western tarot`。

---

## Phase 2: 資料持久層與後端 API 服務 (`packages/database` & `apps/server`)

- [x] **Task 2.1: PostgreSQL 資料庫模型設計與遷移 (`packages/database`)**
  - **範圍**：
    - 編寫 `prisma/schema.prisma`，涵蓋：
      - `User` (認證, 角色: ADMIN, MEMBER, VIP)
      - `BirthProfile` (命盤人物庫: 經緯度、真太陽時、八字快照)
      - `ReadingRecord` (占卜測算歷史、用戶隨筆筆記)
      - `SystemInterpretation` (六大命理辭庫資料)
      - `KangxiChar` (康熙正字筆劃五行字典)
    - 建立 initial migration 與種子數據腳本 (`seed.ts` 注入基礎卦辭、塔羅牌義與字典)。
  - **成功的樣貌 (DoD)**：`prisma migrate dev` 順利執行，種子數據注入完成。
  - **驗證方式**：`pnpm --filter @celestial/database db:seed`。

- [x] **Task 2.2: 後端架構搭設與認證模組 (`apps/server/auth`)**
  - **範圍**：
    - 基於 Express/Fastify + TypeScript 搭建 API 骨架（含 CORS、Helmet、Rate-limit、錯誤處理中介軟體）。
    - 會員註冊、密碼 Argon2 加密雜湊、登入 JWT 簽發（Access + HTTP-only Refresh Token）。
    - 角色授權中介軟體 (`requireRole(['ADMIN'])`)。
  - **成功的樣貌 (DoD)**：註冊/登入 API 跑通，未授權訪問受保護路由返回 401/403。
  - **驗證方式**：`pnpm --filter @celestial/server test auth`。

- [x] **Task 2.3: 命盤計算與排盤 API 模組 (`apps/server/calculator`)**
  - **範圍**：
    - `POST /api/v1/calculator/ziwei`
    - `POST /api/v1/calculator/bazi`
    - `POST /api/v1/calculator/iching/cast`
    - `POST /api/v1/calculator/naming/analyze` & `/generate`
    - `POST /api/v1/calculator/western/natal`
    - `POST /api/v1/calculator/tarot/draw`
    - 結合經緯度與時區自動推導真太陽時。
  - **成功的樣貌 (DoD)**：端點接收請求，成功調用 `astro-core` 並關聯資料庫辭庫返回富文本解讀數據。
  - **驗證方式**：編寫 Supertest 整合測試，覆蓋六大端點之正常與邊界輸入。

- [x] **Task 2.4: 會員命盤檔案庫與占卜日記 API (`apps/server/profiles` & `readings`)**
  - **範圍**：
    - 個人多命盤人物庫 CRUD（本人、家人、伴侶）。
    - 測算歷史記錄儲存、標記喜愛、新增個人靈驗日記筆記。
  - **成功的樣貌 (DoD)**：會員能儲存與檢索個人檔案與測算歷史。
  - **驗證方式**：`pnpm --filter @celestial/server test profiles`。

- [x] **Task 2.5: 後台管理系統 API (`apps/server/admin`)**
  - **範圍**：
    - 命理辭庫（紫微星曜、八字十神、周易爻辭、塔羅牌義）增刪改查 API。
    - 康熙字典字庫編輯與校準 API。
    - 會員列表查詢、封鎖、調整 VIP 權限。
    - 儀表板數據統計 API（每日測算量、各模組熱門度）。
  - **成功的樣貌 (DoD)**：僅 ADMIN 角色可調用，提供完整的 CRUD 與統計指標。
  - **驗證方式**：`pnpm --filter @celestial/server test admin`。

---

## Phase 3: Awwwards 級前端體驗與 3D 視覺 (`apps/web`)

- [x] **Task 3.1: 視覺風格與雙主題系統構建 (`apps/web/styles`)**
  - **範圍**：
    - 設定 Tailwind CSS 擴展色彩變數：
      - **Dark Mode (星淵夜幕)**：`#08090C` 背景、`#E5C378` 星光香檳金、`#7B61FF` 幽微星雲紫。
      - **Light Mode (晨曦天盤)**：`#F9F8F5` 羊皮紙暖白、`#A47E3B` 青銅古金、`#1F2432` 墨水藍。
    - 整合字型排版：西文古典襯線體 `Cinzel` 與中文宋體 `思源宋體 (Noto Serif TC)`。
    - 實作無閃爍主題切換器 (Pinia + LocalStorage)。
  - **成功的樣貌 (DoD)**：一鍵流暢切換雙主題，所有元素顏色平滑過渡（transition-colors）。
  - **驗證方式**：手動切換測試，確認色彩對比度符合 WCAG AA 標準。

- [x] **Task 3.2: 頂級動效與 3D 渾天星盤元件 (`apps/web/3d` & `motion`)**
  - **範圍**：
    - 整合 **Lenis** 實現全站平滑滾動。
    - 整合 **Three.js** 打造首頁 Hero 區「3D 萬象渾天儀 (Armillary Sphere)」：
      - 二十八宿天球環、黃道十二宮金屬環、滑鼠視差旋轉與緩動。
      - 移動端自動降級為輕量渲染模式，確保 60 FPS。
    - 客製化星塵游標與 GSAP 標題文字切割浮現動效。
  - **成功的樣貌 (DoD)**：首頁視覺具有極高藝術衝擊力，滾動絲滑無掉幀。
  - **驗證方式**：Chrome DevTools Performance 工具監控，幀率穩定維持 60 FPS。

- [x] **Task 3.3: 紫微斗數與八字論命互動視圖 (`apps/web/views/eastern`)**
  - **範圍**：
    - **紫微斗數天機十二宮琉璃盤**：
      - 中國傳統十二宮方格排布、中央太極核心展示盤主信息。
      - 宮位 Hover/點擊時動態繪製「三方四正」光學幾何引力線。
      - 側邊滑出星曜廟旺、四化與大限流年解析卡。
    - **四柱八字五行羅盤**：
      - 年月日時柱干支卡片、十神能量雷達圖、大運流年起伏折線圖。
      - 日主身強弱與喜用神能量條展示。
  - **成功的樣貌 (DoD)**：輸入出生資訊後即時渲染精美互動命盤，點擊宮位具備流暢回饋。
  - **驗證方式**：前端組件單元測試與端到端排盤流程測試。

- [x] **Task 3.4: 周易六爻卜卦與姓名學視圖 (`apps/web/views/iching` & `naming`)**
  - **範圍**：
    - **周易卜卦壇**：
      - 3D / CSS 模擬 3 枚乾清乾隆銅錢投擲動畫，連續 6 次搖卦。
      - 依序動態堆疊初爻至上爻，高亮老陽老陰動爻，生成變卦與白話爻辭。
    - **姓名學剖析儀與起名推薦器**：
      - 姓名五格（天人地總外）數理剖析環狀圖。
      - 八字喜用神智慧起名介面：篩選性別、詩意風格，輸出高分吉名列表。
  - **成功的樣貌 (DoD)**：擲幣物理動畫富有儀式感，解卦邏輯清晰；命名推薦反饋迅速。
  - **驗證方式**：模擬 6 次搖卦並驗證本卦變卦生成準確無誤。

- [x] **Task 3.5: 西洋本命星盤與月亮星座專區 (`apps/web/views/western`)**
  - **範圍**：
    - 向量動態 SVG 本命星盤：外圈十二星座、中圈十二宮位、內圈行星標記與相位連線。
    - 滑鼠移至相位線時高亮互相關聯之星體與相位角度。
    - **月亮星座與誕生月相專題頁**：展示個體誕生當夜之月相球體 3D 光影與情感深層原型報告。
  - **成功的樣貌 (DoD)**：星盤清晰可讀、縮放自如，月相光影真實呈現。
  - **驗證方式**：比對不同出生時間的行星落點與相位角準確性。

- [x] **Task 3.6: 3D 沉浸式塔羅占卜舞台 (`apps/web/views/tarot`)**
  - **範圍**：
    - Three.js 打造 3D 絨布牌桌場景。
    - 78 張塔羅牌 3D 洗牌、扇形展開與滑鼠拖曳抽牌互動。
    - 金箔反光 PBR Shader 翻牌動畫，支援正位與逆位旋轉。
    - 5 大牌陣槽位依序入座與綜合解讀面板。
  - **成功的樣貌 (DoD)**：抽牌洗牌流暢如同實體操作，翻牌動效極具神秘儀式感。
  - **驗證方式**：完整體驗塞爾特十字 10 張牌抽取與翻牌流程無異常。

- [x] **Task 3.7: 會員中心、命盤檔案庫與占卜日記 (`apps/web/views/member`)**
  - **範圍**：
    - 登入/註冊彈窗（含 Form 驗證與錯誤提示）。
    - 命盤檔案庫 (Profile Vault)：新增、管理本人與親友命盤，一鍵切換當前主視角。
    - 占卜日記 (Journal)：時間軸展示歷次測算結果，支援編修個人驗證心得。
  - **成功的樣貌 (DoD)**：登入狀態全站持久化，切換人物後所有測算模組同步聯動。
  - **驗證方式**：儲存 3 個不同人物命盤並驗證切換連鎖反應。

---

## Phase 4: 管理後台 CMS 系統 (`apps/admin`)

- [x] **Task 4.1: 後台基礎架構與管理端佈局**
  - **範圍**：基於 Vue 3 + Tailwind 搭建現代簡約管理介面（側邊導航、頂部工具列、麵包屑、權限攔截器）。
  - **成功的樣貌 (DoD)**：僅 ADMIN 帳號可進入，非管理員自動導向或提示拒絕。
  - **驗證方式**：以普通會員身分嘗試訪問 `/admin`，確認攔截成功。

- [x] **Task 4.2: 命理詞庫熱更新管理中心**
  - **範圍**：
    - 支援紫微星曜入宮斷語、八字格局斷語、易經 64 卦 384 爻辭、塔羅 78 張牌義之 Markdown/富文本編輯。
    - 即時預覽與版本記錄。
  - **成功的樣貌 (DoD)**：在後台更新詞條後，前台對應測算結果立即可見新內容。
  - **驗證方式**：修改一條爻辭並於前台進行起卦驗證。

- [x] **Task 4.3: 康熙字典維護與會員管理面板**
  - **範圍**：
    - 字典管理：搜尋單字、修改筆劃數、五行屬性與生肖喜忌。
    - 會員管理：分頁表格、關鍵字搜尋、升級/降級 VIP、帳號狀態鎖定。
  - **成功的樣貌 (DoD)**：字典資料更新成功；會員權限調整即時生效。
  - **驗證方式**：在後台將測試會員升級為 VIP 並確認該帳號解鎖付費級報告。

- [x] **Task 4.4: 營運統計看板 (Analytics Dashboard)**
  - **範圍**：集成圖表庫（Chart.js / ECharts），展示：每日新註冊會員趨勢、六大測算模組使用佔比熱力圖、API 調用量監控。
  - **成功的樣貌 (DoD)**：儀表板視覺清晰、數據即時反映資料庫統計。
  - **驗證方式**：後端統計端點數據與前端圖表渲染一致。

---

## Phase 5: Docker 容器化全棧部署 (`deploy/docker`)

- [x] **Task 5.1: 撰寫多階段生產級 Dockerfile**
  - **範圍**：
    - `deploy/docker/Dockerfile.server` (Node.js 20 Alpine, pnpm, Prisma, 非 root 執行)
    - `deploy/docker/Dockerfile.web` (Node.js 構建靜態 bundle -> Nginx Alpine, Gzip, SPA 路由相容)
    - `deploy/docker/Dockerfile.admin` (Vue 3 Admin -> Nginx Alpine)
    - `deploy/docker/nginx.conf` (反向代理與快取優化)
    - `.dockerignore` (排除 node_modules 與暫存檔)
  - **成功的樣貌 (DoD)**：三個映像檔均可獨立構建成功且體積維持在輕量級別。
  - **驗證方式**：`docker build -f deploy/docker/Dockerfile.server -t celestial-server .` 成功。

- [x] **Task 5.2: 編排全棧 `docker-compose.yml`**
  - **範圍**：
    - 編寫根目錄 `docker-compose.yml`，包含 `postgres:16-alpine`、`redis:7-alpine`、`server`、`web`、`admin`。
    - 配置容器間網路 (`celestial-network`)、健康檢查 (`healthcheck`) 與資料卷持久化 (`volumes`)。
    - 提供 `.env.example` 完整環境變數範本。
  - **成功的樣貌 (DoD)**：執行 `docker compose up --build -d` 能一次拉起全部五項服務並全部呈 Healthy 狀態。
  - **驗證方式**：`docker compose ps` 確認所有容器狀態正常。

- [x] **Task 5.3: 容器內資料庫自動遷移與初始種子腳本**
  - **範圍**：配置啟動管線，於 server 容器健康就緒時自動執行 `prisma migrate deploy` 與 `prisma db seed`。
  - **成功的樣貌 (DoD)**：全新空伺服器克隆專案後執行 compose 指令即可開箱即用。
  - **驗證方式**：在全新乾淨 Docker 環境啟動並驗證首頁與資料庫初始資料存在。

---

## Phase 6: 全端整合驗證與生產發布 (Production Readiness)

- [x] **Task 6.1: 全鏈路自動化測試與跨瀏覽器相容性**
  - **範圍**：
    - 執行全部單元測試與整合測試 (`pnpm test`)。
    - 測試 Chrome、Safari、Firefox、iOS Safari、Android Chrome 上的 WebGL 與動效表現。
  - **成功的樣貌 (DoD)**：所有測試 100% 通過，全平台無白屏或報錯。
  - **驗證方式**：`pnpm test` + 多終端模擬驗證。

- [x] **Task 6.2: 效能與 Awwwards 標準審計 (Lighthouse Audit)**
  - **範圍**：
    - 首屏靜態資源壓縮、字型動態子集化、Three.js 紋理延遲加載。
    - 運行 Google Lighthouse 檢測 Performance、Accessibility、Best Practices、SEO。
  - **成功的樣貌 (DoD)**：各項指標評分均達 90 分以上 (目標 > 95 分)。
  - **驗證方式**：`npx lighthouse-ci collect`。

- [x] **Task 6.3: 發布與交接文檔完善**
  - **範圍**：
    - 產出 `README.md`（包含一鍵運行、Docker 部署指南、環境變數清單）。
    - 更新 `walkthrough.md` 總結整體架構與驗證錄影/截圖路徑。
  - **成功的樣貌 (DoD)**：文檔完整清晰，新開發者可在 5 分鐘內於本機啟動系統。
  - **驗證方式**：依照 README 指引在乾淨終端重新跑通流程。

---

## Phase 7: 東方天星七政四餘、每日黃曆運勢與實體擬真星象圖片系統 (Phase 7 Extension)

- [x] **Task 7.1: 東方七政四餘天星核心演算法與 API (`packages/astro-core/src/qizheng` & `server`)**
  - **範圍**：
    - 七政（日月金木水火土）與四餘（羅睺、計都、月孛、紫氣）黃道/赤道坐標與坐度計算。
    - 二十八星宿（東南西北四宮各七宿）度數劃分與宿主五行生剋判定。
    - 十二辰次（星紀、玄枵等）與十二人事宮（命宮、財帛、兄弟等）宮位排演。
    - 恩難仇用四星神煞吉凶與三方四正會照評估。
    - 後端 API 端點 `POST /api/v1/calculator/qizheng`。
  - **成功的樣貌 (DoD)**：精準推導七政四餘星曜入宿與宮位，意圖測試 100% 通過。
  - **驗證方式**：`pnpm --filter @celestial/astro-core test qizheng` 與 API 整合測試。

- [x] **Task 7.2: 每日黃曆吉凶與生肖/八字個人運勢系統 (`packages/astro-core/src/almanac` & `server`)**
  - **範圍**：
    - 農曆月日、二十四節氣、干支年月日時柱。
    - 十二建除吉凶神煞（建、除、滿、平、定、執、破、危、成、收、開、閉）。
    - 二十八宿禽星值日吉凶與九星值日（紫白飛星）。
    - 每日宜忌、喜神/財神/福神吉神方位、生肖相衝煞位。
    - 個人流日運勢：十二生肖今日運向與八字日主十神能量互動指引。
    - 後端 API 端點 `GET /api/v1/almanac/today`、`POST /api/v1/almanac/query`。
  - **成功的樣貌 (DoD)**：輸入任意日期，產出完整的傳統黃曆宜忌、時辰吉凶與個人化運勢評析。
  - **驗證方式**：`pnpm --filter @celestial/astro-core test almanac` 與 API 測試。

- [x] **Task 7.3: 前台七政四餘與每日黃曆視覺介面 (`apps/web`)**
  - **範圍**：
    - `apps/web/src/views/QizhengView.vue`：七政四餘天星盤雙環圓盤介面（內環十二人事宮、中環二十八宿度數、外環七政四餘星曜坐標），支援一鍵 AI 靈犀解盤。
    - `apps/web/src/views/AlmanacView.vue`：古典朱紅金箔傳統黃曆介面、生肖運勢切換、吉時宜忌清單、吉神方位羅盤。
    - `Navbar.vue` 與路由加入入口。
  - **成功的樣貌 (DoD)**：介面符合 Awwwards 得獎標準，支援 Dark/Light 雙主題，流暢無報錯。
  - **驗證方式**：`pnpm --filter @celestial/web build` 通過。

- [x] **Task 7.4: 系統實體高品質擬真星象、天文書卷與塔羅牌面圖片產出與落地**
  - **範圍**：
    - 實體圖片庫目錄結構：`apps/web/public/images/tarot/`、`apps/web/public/images/astronomy/`、`apps/web/public/images/oriental/`、`apps/web/public/images/almanac/`。
    - 78張韋特塔羅高品質牌面（大阿爾克那實體插畫 + 精美神聖幾何牌背）。
    - 天文星圖與古天文渾天儀擬真特色背景、黃道十二星座、二十八宿星圖。
    - 東方數術八卦古鏡、太極印信、黃曆吉凶神煞印章圖騰。
    - 整合至各前台頁面（`TarotView`、`QizhengView`、`AlmanacView`、`ArmillarySphere` 等）。
  - **成功的樣貌 (DoD)**：所有實體圖片資源具備高解析度與統一之古典神聖美學，靜態資產可正常載入。
  - **驗證方式**：檔案校驗 + 瀏覽器端載入驗證。

- [x] **Task 7.5: 服務連接埠調整 (Port Configuration Adjustment)**
  - **範圍**：
    - 前端展示網站服務埠號調整為 **5499** (`apps/web/vite.config.ts`, `docker-compose.yml`, `README.md`)。
    - 後端 API 服務埠號調整為 **5498** (`apps/server/src/main.ts`, `apps/server/.env`, `Dockerfile.server`, `docker-compose.yml`, `nginx.conf`)。
    - 跨域 CORS 與 Vite 代理全面適配連通。
  - **成功的樣貌 (DoD)**：前台於 5499 埠啟動，後端於 5498 埠提供服務，API 與 LLM 代理正常連線。
  - **驗證方式**：單元與整合測試全數通過，各套件構建成功。

---

## Phase 17: 倪海廈《天紀》紫微斗數命相心法與正統格局 RAG 體系

- [x] **Task 17.1: 紫微斗數三合派正統格局識別演算法 (`packages/astro-core/src/ziwei/patterns.ts`)**
  - **範圍**：君臣慶會、紫府同宮、機月同梁、陽梁昌祿、火貪格、巨日同宮、太陰化忌入命等格局判定與出處條件。
  - **驗證方式**：`astro-core.test.ts` 新增格局斷言全數通過。

- [x] **Task 17.2: 倪海廈命相心法與決策哲學 RAG 種子資料庫注入 (`packages/database/src/seed.ts`)**
  - **範圍**：天紀大道至簡、2/3 大於 1/3 改命哲學、名位相等法則。
  - **驗證方式**：`role-rag.test.ts` 驗證檢索命中。

---

## Phase 18: 西洋占星與韋特塔羅當代大師級語錄 RAG 擴充

- [x] **Task 18.1: 西洋占星與韋特塔羅國際大師語錄種子庫注入 (`packages/database/src/seed.ts`)**
  - **範圍**：榮格 (Carl Jung)、丹·路德雅爾 (Dane Rudhyar)、莉茲·格林 (Liz Greene)、史蒂芬·阿若優 (Stephen Arroyo)、羅伯特·漢德 (Robert Hand)、愛德華·韋特 (A.E. Waite)、蕾切爾·波拉克 (Rachel Pollack)、瑪麗·格利爾 (Mary K. Greer)、亞歷杭德羅·佐杜洛夫斯基 (Alejandro Jodorowsky)。
  - **驗證方式**：`seed.ts` 執行無誤，資料庫 RAG 辭條結構化落地。

- [x] **Task 18.2: 宗師級 Prompt 檢索權重與離線合成器注入 (`apps/server/src/modules/llm/service.ts`)**
  - **範圍**：關鍵字加權檢索與結構化輸出心法。
  - **驗證方式**：`role-rag.test.ts` 驗證宗師語錄輸出。

---

## Phase 19: 八字合婚與家人群組比對系統

- [x] **Task 19.1: 子平五維合婚與通關五行推導演算法 (`packages/astro-core/src/bazi/synastry.ts`)**
  - **範圍**：天干五合、地支六合三合、五行互補評分、年柱納音神煞、夫妻宮合沖與通關五行。
  - **驗證方式**：單元測試通過。

- [x] **Task 19.2: 家人群組五行場域與兩兩交互矩陣演算法 (`calculateFamilyGroup`)**
  - **範圍**：家庭主導/匱乏五行、全家氣場標題、角色配置、$C(N, 2)$ 兩兩互動矩陣。
  - **驗證方式**：單元測試通過。

- [x] **Task 19.3: 後端 API 端點與專屬現代顧問 Persona 註冊**
  - **範圍**：`/api/v1/calculator/bazi/synastry`、`/api/v1/calculator/family/group`、`BAZI_SYNASTRY`、`FAMILY_GROUP`。
  - **驗證方式**：Supertest API 測試與 Role-RAG 測試通過。

- [x] **Task 19.4: 前端 SynastryView 雙分頁互動介面與 InPageAiAnalysis 整合**
  - **範圍**：八字合婚與家庭群組雙分頁、一鍵載入已存檔案、全幅 AI 詳批。
  - **驗證方式**：前台打包構建與瀏覽器互動驗證。

---

## Phase 20: 深度對標 ziwei-doushu-main 強化 RAG 與天紀雙軌合參

- [x] **Task 20.1: 移植 heming-knowledge.ts 知識庫至 astro-core**
  - **範圍**：十四主星夫妻宮斷語 (`STAR_IN_FUQI_GU`)、四化斷語、倪師原話、雙宮聯參鐵律、合盤五步法。
  - **驗證方式**：`astro-core.test.ts` 斷言 `ziweiHeming` 結構完整性通過。

- [x] **Task 20.2: 倪海廈《天紀·地脈道》陽宅化命後天八卦名位相等配置**
  - **範圍**：乾坤震巽坎離艮兌八卦方位角色對應、名位法則、地天泰/水火既濟配置、陽宅越位禁忌警示。
  - **驗證方式**：`astro-core.test.ts` 驗證家庭成員八卦方位正確。

- [x] **Task 20.3: 注入 1,848 條原話語料庫精粹種子 (`packages/database/src/seed-nihai.ts`)**
  - **範圍**：8 大高密度繁體中文專題辭條寫入 SQLite，全站辭條擴充至 61 條。
  - **驗證方式**：`db:seed` 執行無誤。

- [x] **Task 20.4: Structured Chart-Entity Grounding 動態實體檢索與 Prompt 注入**
  - **範圍**：`retrieveModuleKnowledge` 動態提取當前盤面 `ziweiHeming` 與 `baguaPosition` 實體，連同跨模組知識注入 Prompt。
  - **驗證方式**：`role-rag.test.ts` 驗證動態檢索通過。

- [x] **Task 20.5: 前端淺色模式 (Light Mode) 對比度與卡片樣式修正**
  - **範圍**：`ZiweiView.vue`、`AlmanacView.vue`、`SynastryView.vue` 淺色模式下文字可讀性優化。
  - **驗證方式**：Dark/Light 切換視覺校驗通過。

---

## Phase 21: iPhone 行動瀏覽器相容性與全專案文件同步

- [x] **Task 21.1: iPhone / 行動裝置響應式排版優化**
  - **範圍**：手機版面單欄適配、捲軸與點擊手感提升。
  - **驗證方式**：響應式瀏覽器預覽通過。

- [x] **Task 21.2: 全專案 Markdown 文件完整同步更新**
  - **範圍**：`README.md`、`TASK_LIST.md`、`DEVELOPMENT_LOG.md`、`TEST_REPORT.md`、`test_plan.md`、`code_review.md`。
  - **驗證方式**：全工作區 77 項測試 100% 通過，全專案無型別錯誤構建成功。

---

## Phase 22: 紫微行運大盤、純星名四化陣列、語料原創合規改寫與 AGPL 感染風險修正

- [x] **Task 22.1: 紫微斗數大限、流年、小限行運大盤推算引擎**
  - **範圍**：在 `packages/astro-core/src/ziwei/` 實作 `calculateZiweiHoroscope`，回傳 `decade`、`yearly`、`smallLimit`，並在十二宮位各宮 `PalaceCell` 提供 `smallLimitAge`。
  - **驗證方式**：`astro-core.test.ts` 驗證大限、流年、小限落宮與年歲區間正確。

- [x] **Task 22.2: 流曜四化純星名陣列 (Bare Star-Name Array)**
  - **範圍**：定義 `BareSiHuaArray = [string, string, string, string]`（如 `['廉貞', '破軍', '武曲', '太陽']`），分別對應 `[祿, 權, 科, 忌]`，避免冗贅物件包裝，便於前後端高效處理。
  - **驗證方式**：單元測試與 API 測試驗證 `siHua` 為長度 4 之字串陣列。

- [x] **Task 22.3: 命理合盤語料原創去侵權化改寫**
  - **範圍**：改寫 `synastry.ts` 與 `seed-nihai.ts` 中的原話語料，提煉為純粹三合派易理、周易八卦方位與現代諮商視角，杜絕版權風險。
  - **驗證方式**：種子數據重新生成無報錯，合盤功能正常。

- [x] **Task 22.4: 瑞士星曆表 AGPL 感染風險更正與商用宣告**
  - **範圍**：修正 `SPEC.MD` 與 `README.md`，釐清天體星曆為純 TypeScript 原生 Jean Meeus / 開普勒算法，0% AGPL 授權風險。
  - **驗證方式**：文件全文審查確認無 AGPL / swisseph 殘留。

- [x] **Task 22.5: 前端行運大盤展示與 API 串接**
  - **範圍**：`ZiweiView.vue` 增設大限、流年、小限行運卡片與四化徽章；`api.test.ts` 驗證 `POST /api/v1/calculator/ziwei` 回傳 `horoscope`。
  - **驗證方式**：78 項自動化測試全數通過，前台建置無報錯。

---

## Phase 23: 流年生活行運曆、起居習慣日記與 AI 規劃

- [x] **Task 23.1: 流年命曆與五虎遁十二流月推算引擎**
  - **範圍**：在 `packages/astro-core/src/annual-planner/` 實作 `calculateAnnualDestinyCalendar`，結合流年天干、日主十神、紫微流年命宮、流年四化與五虎遁十二流月曆（月干支、月十神、紫微流月命宮、四時生活要旨）。
  - **驗證方式**：`astro-core.test.ts` 驗證流年歲君、十二流月干支與四化。

- [x] **Task 23.2: 生活起居資料持久層與 CRUD API**
  - **範圍**：在 `schema.prisma` 新增 `DailyHabitLog` 模型並推送 SQLite；在 `apps/server/src/modules/habits/router.ts` 實作 `GET/POST/PUT/DELETE /api/v1/habits`，相容會員認證與 Demo 模式。
  - **驗證方式**：`api.test.ts` 測試完整起居日誌生命週期通過。

- [x] **Task 23.3: 命盤五行諧振診斷與專屬生活規劃書 (Habit-Chart Resonance)**
  - **範圍**：實作 `evaluateHabitResonance`，對比生活起居數據與本命喜用五行，產出調和度評分（0-100分）、五行滋養雷達與落地生活行動清單 (Action Plans)。
  - **驗證方式**：單元測試斷言五行滋養分數與行動建議清單。

- [x] **Task 23.4: RAG 規劃顧問 Persona 與後端計算路由**
  - **範圍**：新增 `POST /api/v1/calculator/annual-calendar` 與 `POST /api/v1/calculator/annual-planner/analyze`；在 `modules/llm/service.ts` 註冊 `ANNUAL_PLANNER` 現代起居規劃顧問與離線合成器。
  - **驗證方式**：`api.test.ts` 與 `role-rag.test.ts` 驗證通過。

- [x] **Task 23.5: 前端 AnnualPlannerView 與導覽入口**
  - **範圍**：建立 `apps/web/src/views/AnnualPlannerView.vue`，包含流年總綱徽章、十二流月卡片網格、起居追蹤與診斷儀表板、示範數據注入、AI 深度規劃書；在 `Navbar.vue` 增設導航入口。
  - **驗證方式**：前端生產打包 `pnpm --filter @celestial/web build` 0 錯誤通過。

---

## Phase 24: 百歲流年·人生推演模擬器 (0-100 BaZi Life Odyssey)

- [x] **Task 24.1: Astro-Core 0~100 歲流年大運時間軸與命運規則引擎**
  - **範圍**：在 `packages/astro-core/src/life-simulator/` 實作：
    - `types.ts` 定義生命狀態面板、選項卡片、年輪節點與終局結構。
    - `timeline.ts` 0~100 歲流年干支、大運切換、十神神煞、轉折節點自動標記 (`generate100YearTimeline`)。
    - `rules-engine.ts` 初始五維屬性計算、選項數值結算、壽元衰減與存活判定 (`resolveTurnDecision`, `evaluateMortalityCheck`)。
  - **驗證方式**：單元測試斷言 0~100 歲連續性、大運邊界切換正確性、五維數值與壽元邏輯。

- [x] **Task 24.2: Prisma 模型擴充與 SQLite 資料遷移**
  - **範圍**：在 `packages/database/prisma/schema.prisma` 新增 `LifeSimulationRecord` 模型，支援儲存 session 狀態、屬性快照、歷史年輪 JSON、里程碑標籤與終局自傳；執行 `prisma db push` 並重新編譯 `@celestial/database`。
  - **驗證方式**：資料庫 client 生成成功且資料表就緒。

- [x] **Task 24.3: 後端 Simulator 模組與 LLM 靈犀推演整合**
  - **範圍**：
    - 在 `apps/server/src/modules/simulator/` 建立 `router.ts`，提供 `/start`、`/session/:id`、`/turn/prompt`、`/turn/choose`、`/fast-forward`、`/finalize` 端點。
    - 在 `apps/server/src/modules/llm/service.ts` 註冊 `LIFE_SIMULATOR` 角色 Persona、Token 緊湊 Prompt 生成器與離線合成器 (Offline Fallback Synthesizer)。
    - 在 `apps/server/src/app.ts` 掛載 `/api/v1/simulator` 路由。
  - **驗證方式**：`apps/server` 整合測試與 API 端點測試通過。

- [x] **Task 24.4: Astro-Core 與 Server 意圖單元測試 (Intent-Based Tests)**
  - **範圍**：在 `packages/astro-core/test/astro-core.test.ts` 與 `apps/server/test/api.test.ts` 增加完整生命週期測試案例，包含起局、關鍵年提示、選項決策、跨歲快進、數值邊界與百歲善終總結。
  - **驗證方式**：所有測試案例 100% 通過。

- [x] **Task 24.5: 前端 LifeSimulatorView.vue、導航與路由串接**
  - **範圍**：
    - 建立 `apps/web/src/views/LifeSimulatorView.vue`，包含 0~100 歲橫向動態時間軸、五維狀態 HUD、年初運勢徽章、事件劇情卷軸、抉擇卡牌、快進按鈕與終局《一生行誼·蓋棺錄》彈窗。
    - 在 `apps/web/src/router/index.ts` 註冊 `/simulator` 路由。
    - 在 `apps/web/src/components/layout/Navbar.vue` 增設「百歲推演」導航入口。
  - **驗證方式**：前端建置 `pnpm --filter @celestial/web build` 0 錯誤通過。

- [x] **Task 24.6: 全端編譯驗收與文檔同步**
  - **範圍**：更新 `TASK_LIST.md`、`DEVELOPMENT_LOG.md`、`SPEC.MD`、`README.md` 與 `SIMULATE_LIFE.md`。
  - **驗證方式**：文件一致性校驗無遺漏，全專案測試無破壞性回歸。

- [x] **Task 24.7: 台灣生活場景與歷史時代擬真度強化 (Taiwan Historical & Societal Milestones)**
  - **範圍**：
    - 在 `packages/astro-core/src/life-simulator/taiwan-history.ts` 建立 1945~2060+ 台灣歷史大事紀與社會時代輪廓字典 (`TAIWAN_HISTORICAL_EVENTS`) 與推導函式 (`getTaiwanEraContext`)。
    - 在 `timeline.ts`、`rules-engine.ts` 與 `types.ts` 注入 `taiwanEraContext` 至流年節點與情境長文。
    - 在 `apps/server/src/modules/simulator/router.ts` 與 `llm/service.ts` 的提示詞與 Persona 強化台灣生活舞台與時代共鳴。
    - 在 `apps/web/src/views/LifeSimulatorView.vue` 增設 `🇹🇼 [台灣時代風貌]` 視覺年輪標籤。
    - 在 `astro-core.test.ts` 與 `api.test.ts` 新增台灣歷史年代精準對應意圖驗證測試。
  - **驗證方式**：27/27 astro-core 測試與 64/64 server 測試全數通過，web 生產構建成功。

- [x] **Task 24.8: 服務連接埠重構 (前端 5499、後端 5498) 與全棧 Docker 容器化方案**
  - **範圍**：
    - 將後端 API 預設 PORT 改為 `5498`（`apps/server/src/main.ts`、`.env`、`.env.example`）。
    - 將前端 Vite Dev Server PORT 改為 `5499`，反向代理目標指向 `http://localhost:5498`（`apps/web/vite.config.ts`、`apps/admin/vite.config.ts`）。
    - 更新後台管理頁面與導航中的連接埠標籤與超連結為 5498 / 5499。
    - 實作全棧 Docker 容器化方案：`deploy/docker/Dockerfile.server`、`deploy/docker/Dockerfile.web`、`deploy/docker/nginx.conf`、`docker-compose.yml`（Server 映射 5498:5498、Web 映射 5499:80）。
  - **驗證方式**：Server、Web 生產構建通過，Docker 設定檔配置語法與埠位映射校驗無誤。

- [x] **Task 24.9: 歷史時間軸回溯至 1845 年清代、各年代人類平均壽命與流行病公衛機制**
  - **範圍**：
    - 在 `packages/astro-core/src/life-simulator/taiwan-history.ts` 將歷史事件與公衛社會變遷映射庫擴展至 **1845 年**（清道光二十五年）至 2060+ 年，收錄各年代全台平均壽命（`avgLifeExpectancy`）、主流傳染病（`prevailingEpidemics`）與公衛狀態（`sanitationContext`）。
    - 涵蓋重大時疫：1845 金湖大水災時疫、1862 霍亂、1874 牡丹社惡性熱病、1896~1917 鼠疫（黑死病）與避病院、1918 西班牙流感、1937/1943 戰時肺結核與南洋瘧疾、1946 天花霍亂、1952 小兒麻痺、1965 WHO 認證瘧疾根除、1984 全球首創 B 肝疫苗、2003 SARS、2020~2022 COVID-19 等。
    - 在 `packages/astro-core/src/life-simulator/rules-engine.ts` 依時代平均壽命浮動計算自然生理衰減門檻（如 1850 年 40 歲即屬高壽衰退期，2026 年則為 75 歲以上），並將重大傳染病高峰期加入生存冒險/保守防疫決策權重。
    - 在 `evaluateMortalityCheck` 引入時代壽元極限與反映時代風土病之死因敘事。
    - 在 `LifeSimulatorView.vue` 加入時代平均壽命期望值標籤與重大時疫警報橫幅。
    - 在 `packages/astro-core/test/astro-core.test.ts` 與 `apps/server/test/api.test.ts` 加入 1845 年起局、時代壽命與時疫機制意圖測試。
  - **驗證方式**：28/28 astro-core 測試與 65/65 server 測試全數綠燈通過，web 打包 0 錯誤。

- [x] **Task 24.10: 轉折年與大吉/大凶年命理決策錦囊提示、一生回顧響應加速與終局按鈕優化**
  - **範圍**：
    - 在 `@celestial/astro-core` 建立並匯出 `getYearMetaphysicalGuidance` 與 `MetaphysicalDecisionGuidance`，針對轉折年（`isKeyMilestone`）、大吉年（`大吉`）、大凶年（`大凶`）以及複合關口產出命理決策方向指引與天紀心法對策。
    - 在 `LifeSimulatorView.vue` 決策卡片上方呈現專屬彩色命理錦囊卡片（大凶為玫瑰紅警報、大吉為琥珀金順風、轉折年為紫晶天樞），並於各選項按鈕動態掛載「✓ 避煞首選」、「✓ 乘風破浪」、「⭐ 轉折關鍵」等智慧標籤。
    - 徹底解決「一生回顧按下去沒有反應」問題：
      - 前端 `finalizeSimulation` 優先判斷若 Session 記憶體中已有一生總結，立即直接開啟彈窗（0 延遲秒開）。
      - 頂部導航按鈕更新為「📜 一生回顧」，並增加 `⏳ 譜寫蓋棺錄中...` 動態載入中動畫反饋。
      - 主舞台於百歲或終局狀態（`COMPLETED` / `isTerminal`）時，居中呈現專屬金光終局卡片與大型「👑 查看《一生行誼·蓋棺錄》回顧」按鈕。
      - 後端 `/finalize` 增加快取優先判定（若資料庫中已有 `finalSummaryJson` 立即回傳），且對 LLM 潤色加入 8 秒 `Promise.race` 超時保護，超時立即降級為確定性自傳合成器，徹底杜絕長達 60~180 秒的請求阻塞與無反應用戶體驗。
  - **驗證方式**：astro-core 29/29 項測試通過，server 65/65 項測試通過，前端與後端建置零錯誤。

- [x] **Task 24.11: 方案 C 多重視角一生回顧與 LLM 深度撰寫架構 (Multi-Perspective Life Review & LLM Generation)**
  - **範圍**：
    - 在 `@celestial/astro-core` 定義 `BiographyPerspective` 型別（`TIANJI` 倪師天紀心法、`SHIJI` 正史太史公列傳、`MEMOIR` 現代時代回憶錄），擴充 `LifeFinalSummary` 支援多重視角文字與稱號快取字典。
    - 在 `rules-engine.ts` 實作三重視角高水準演算法典範合成器（倪師人事大於天命、太史公「太史公曰」春秋筆法、時代回憶錄溫潤獨白），並編寫專項單元測試。
    - 在 `@celestial/server` 擴充 `/finalize` 端點：支援 `perspective` 與 `forceLlm` 參數，整合三大視角專屬提示詞，配置 75 秒模型推理超時防護與快取即時返回機制。
    - 在 `@celestial/web` 的《一生行誼·蓋棺錄》彈窗增加風格切換 Tab 與「✨ 召喚靈犀 AI 深度撰寫」互動按鈕，搭配進度動態反饋，實現 0ms 秒開切換與 LLM 深度創作的完美融合。
  - **驗證方式**：astro-core 29/29 項測試通過，server 65/65 項整合測試通過，web 與 server 生產構建 0 錯誤。

- [x] **Task 24.12: 全年歲月年輪敘事、男性視角紅顏盲盒與 80 億分之一的遊戲 (Annual Stories, Blind Encounters & 1-in-8-Billion)**
  - **範圍**：
    - **1. 全年歲月年輪敘事 (每年一段)**：在 `timeline.ts` 實作 `generateAnnualLifeStory`，依據 0~100 歲 22 個細緻人生階段（襁褓、幼學、總角、舞勺、志學、弱冠、立身、而立、不惑、中流砥柱、知命、花甲、從心所欲、古稀、耄耋、期頤等）、流年干支、十神行運、吉凶氣象與台灣歷史年輪，為全部 101 個節點生成專屬深度敘事段落（`annualStory`）。
    - **2. 男性視角紅顏盲盒相遇 (Blind Encounters)**：建立 `DEFAULT_FEMALE_FRIENDS`（沈婉晴、林若曦、宋雨薇、蘇珮儀、趙敏芝）五大原型；在 18、22、26、30、34 歲觸發匿名盲盒相遇，隱去真實姓名僅提供神秘化身與氣質線索，根據玩家抉擇即時結算羈絆值與因緣狀態（`SPOUSE` / `BONDED` / `MET` / `MISSED`）。
    - **3. 「80億分之一的遊戲」專屬回顧與真身揭曉**：在 `female-friends.ts` 實作 `calculateOneInEightBillion`，計算專屬命運唯一碼（如 `#DESTINY-TW-8B-xxxxx`）、罕見度評語與 $3.48 \times 10^9$ 種自由意志路徑排列；在《一生行誼·蓋棺錄》彈窗新增第 4 視角 Tab，震撼揭曉五位紅顏友人真實身份、最初盲盒化身、當時抉擇與最終宿命因緣。
  - **驗證方式**：astro-core 30/30 項單元測試全數綠燈，server 65/65 項整合測試全數通過，web 生產構建 0 錯誤。

- [x] **Task 24.13: 女性友人生辰 KEYIN、年歲動態對齊、相手好感度、四大領域生命數值演化與日式寫實插畫 (Friend Birthdays, Age Alignment, Her Affinity, 4 Life Domains & Anime Illustrations)**
  - **範圍**：
    - **1. 女性友人自訂生辰 (KEYIN) 與年歲搭配**：
      - 在起盤介面為 5 位紅顏友人提供自訂生辰（KEYIN）輸入框與年齡差動態徽章（`同齡`、`小 X 歲`、`大 X 歲`）。
      - 根據流年西曆年份與友人出生年份，即時精確計算相遇時女性實歲：`herEncounterAge = solarYear - femaleBirthYear`，情境長文精準融入歲數描寫，杜絕時空錯置。
    - **2. 相手好感度 (`herAffinity`) 媒合追蹤**：
      - 擴充女性友人模型支援 `herAffinity`（對方對男主的好感度）與 `compatibilityScore`（天生八字默契度）。
      - 決策即時影響雙方好感度變動（專注深入交往 +30，溫和友好 +18，專注事業/迴避 -15）。
    - **3. 八字流年人生四大領域數值動態演進 (四大領域生命週期演算法)**：
      - 重構五維至核心四大領域：**❤️ 體魄健康 (`health`)**、**📖 知識才識 (`knowledge`)**、**🪙 財富資產 (`wealth`)**、**🌸 情感眷屬 (`relationship`)**（保留 `career` 與 `wisdom` 向後相容）。
      - 依據 0~100 歲生命週期與流年十神動態演進（幼年知識啟蒙、求學文昌攀峰、青年立業財富積累、晚年健康自然生理衰減與知識化境）。
    - **4. 日式寫實風格插畫全套生成與無縫整合**：
      - 產出 14 幅日式寫實美學插畫存放於 `apps/web/public/images/life-simulator/`（9 大人生階段插畫 + 5 位紅顏專屬立繪）。
      - 前端時間軸、年度卡牌、盲盒相遇事件與終局 80 億分之一揭曉全幅渲染。
  - **驗證方式**：astro-core 30/30 項測試通過，server 65/65 項測試通過，web 生產構建 0 錯誤。

- [x] **Task 24.14: 商用侵權審查改善、資安防護、速率限制、SSRF/IDOR 阻斷與全站文件同步 (Security Hardening & Legal IP Compliance)**
  - **範圍**：
    - **1. 商用侵權與法遵規範 (Legal & IP)**：
      - UI、Prompt 與資料庫種子全面去特定名師化，改用中性正統學派名稱（三合天機合盤體系、三合正統雙宮聯參、後天八卦空間配置、三合天機心法），移除「1,848 條原話」宣稱。
      - 建立 `ASSETS_LICENSE.md` 完整歸檔 Pamela Colman Smith 1909 公有領域授權與 AI 生成圖片版權說明；全站改稱「Waite-Smith 1909 經典偉特體系」，杜絕商標爭議。
      - 專案根目錄替換為商業專有閉源授權 (`CelestialDao Proprietary Commercial License`)。
      - 頁尾與 UI 補齊《個資法》告知聲明、文化娛樂免責宣告與虛擬角色隱私警報橫幅。
    - **2. 系統資訊安全防護 (Security Hardening)**：
      - DEMO 模式改為 Fail-Closed 機制：生產環境強制關閉，訪客限定唯讀 MEMBER 權限，徹底移除寫死之後門 Token。
      - 統一 JWT 驗證邏輯與環境變數密鑰檢查，消除模式重複。
      - 後台 LLM 配置實施 SSRF 防護（阻擋 loopback、私有 CIDR、雲端 metadata IP），網域變更時自動抹除舊 API Key。
      - 移除 `docker-compose.yml` 中未授權且無人使用的 Redis 服務。
      - 管理後台 User 表查詢脫敏（排除 `passwordHash`），阻擋表格任意欄位提權寫入。
      - 導入 `express-rate-limit`（認證登入 30次/15分、AI 對話 40次/分、推演起局 50次/分）。
      - Prompt Injection 防護：過濾前端傳入之 messages 剔除 `role: 'system'`，限制對話上限 20 則與單則 4,000 字元。
      - 實施推演 Session IDOR 擁有者鑑權（跨帳號存取阻斷回傳 403 Forbidden）。
      - 前端引入 `DOMPurify.sanitize()` 替代自製脆弱正則。
      - 依賴套件升級 `body-parser: '>=1.20.9'`，達成 `pnpm audit --prod` 0 弱點。
    - **3. Nginx 負載與反向代理逾時修復**：
      - 配置 `proxy_connect_timeout 60s; proxy_send_timeout 200s; proxy_read_timeout 200s;`，杜絕 Docker 環境下 60 秒 504 Gateway Timeout。
      - 在 `gzip_types` 補上現代 `application/javascript`。
  - **驗證方式**：astro-core 30/30 單元測試全數通過，server 66/66 整合測試全數通過（含 IDOR 與 Fail-Closed 專項意圖測試），web 與 admin 生產構建 0 錯誤。

- [x] **Task 24.15: 超詳細使用者手冊、全站連結指南與命理明師智能問診導航顧問 (User Manual, Links Directory & Grandmaster Fortune-Telling Scenario Navigator)**
  - **範圍**：
    - **1. 根目錄超詳細使用者說明手冊 (`USER_MANUAL.md`)**：
      - 撰寫全系統 12 大命理功能詳細手冊，包含系統架構、完整網站路由與輸入輸出參數（Port 5499）、10 大算命常見情境對策決策矩陣、保險庫與 CMS 後台。
    - **2. 前端線上使用手冊與情境指南頁面 (`apps/web/src/views/UserManualView.vue` & `/guide`)**：
      - 實作三合一互動式指南：① 8 大現代算命情境卡片（明師金句、推薦功能、排盤準備清單與立即前往按鈕）；② 14 大路由完整網址目錄表格（含功能、路徑與特色）；③ 12 大功能模組摺疊式操作詳細指南。
      - 註冊路由 `/guide`、`/manual`、`/user-manual`。
    - **3. 後端天機靈犀 LLM 智能問診與算命情境導航升級 (`apps/server/src/modules/llm/service.ts`)**：
      - 升級預設角色為「萬象天儀·天機靈犀 命理明師智能問診與需求導航顧問 (Grandmaster Scenario Navigator)」，以深具同理心、溫暖、客觀且條理分明的現代明師口吻問診。
      - 實作 `generateScenarioConsultationGuide` 涵蓋 10 大人生情境（職場轉職、婚戀合婚、二選一決策、新生兒命名、流年回顧、每日擇吉、家庭空間、生活行運、心理原型、系統導航），並輸出結構化解答與可點擊之 Markdown 站內跳轉連結（如 `[四柱八字](/bazi)`）。
    - **4. 前端天機靈犀抽屜視窗體驗升級 (`apps/web/src/components/ai/LlmAssistantModal.vue` & `useLlmStore`)**：
      - 導入 `renderSafeMarkdown` 與 DOMPurify 安全消毒渲染 HTML。
      - 實作內部連結點擊攔截事件代理 (`handleChatClick`)，點擊推薦功能連結時透過 `router.push(path)` 立即平滑切換路由並自動關閉抽屜。
      - 快捷問句建議升級為常見算命問診諮詢情境；抽屜頂部標題列增設直通 `📖 使用指南` 按鈕。
      - 升級迎賓訊息，引導使用者描述生活情境或查閱指南手冊。
    - **5. 頂部導航列與頁尾連結整合 (`Navbar.vue` & `App.vue`)**：
      - 頂部導航列快捷列與橫向占卜功能列同步新增「📖 使用指南」。
      - 頁尾增設「📖 使用手冊指南」直達連結。
  - **驗證方式**：astro-core 30/30 單元測試全數通過，server 66/66 整合測試全數通過，web 與 admin 生產構建 0 錯誤。

- [x] **Task 24.16: 女性視角專屬「80億分之一藍顏名冊」、生辰對齊、相遇節點強制注入與白首之約「相伴一生」抉擇 (Female Perspective Blue Romance Roster, Guaranteed Encounters & Lifetime Partner Choice)**
  - **範圍**：
    - **1. 女性視角專屬 80 億分之一藍顏名冊原型與日式寫實立繪**：
      - 塑造成型五大藍顏知己原型：陸子軒（清朗白襯衫學長）、傅宇霖（才情志同青年）、霍柏翰（沉穩菁英律己雅士）、江承澤（藝術隨性旅人）、顧睿安（世家儒雅守護者）。
      - 產出 5 幅日式寫實美學高解析度立繪保存於 `apps/web/public/images/life-simulator/`（`romance_male_*.jpg`）。
      - 支援起盤時自訂生日 KEYIN、歲數差動態對齊與肖像預覽。
    - **2. 浪漫知己相遇節點 100% 強制顯現與快進保護機制 (Guaranteed Encounter Nodes)**：
      - 修復女性起局時知己名冊遺失問題；`POST /start` 為男/女角色預先將 18、22、26、30、34 歲標記為 `isKeyMilestone: true` 並預填相遇事件標題與選項。
      - `POST /turn/prompt` 增加防覆蓋守衛 (`if (!eventTitle)`)，杜絕 LLM 覆寫預置相遇事件。
      - `POST /fast-forward` 遇未抉擇之相遇節點或轉折年立即平穩停駐，保證 100% 觸發。
    - **3. 「選擇要不要相伴一生」盟約選項與白首終局**：
      - 在 18、22、26、30、34 歲相遇節點增設 `💍【定下白首誓約 · 選擇相伴一生】`（`opt_romantic_spouse_${id}`）選項。
      - 抉擇時更新伴侶狀態為 `status: 'SPOUSE'`、好感度鎖定為 100%、寫入終生足跡、更新結算敘事。
      - 在終局「80億分之一的遊戲」大揭曉中標記為白首眷侶，男女視角對稱適配。
  - **驗證方式**：astro-core 30/30 單元測試全數通過，server 67/67 整合測試全數通過，web 生產構建 0 錯誤。

- [x] **Task 24.17: 修復 Docker 容器構建 phase 依賴丟失與 monorepo 鎖定檔同步 (Docker Build Lockfile & Ignore Hardening)**
  - **範圍**：
    - 修復 `.dockerignore` 漏擋 `**/node_modules` 與 `**/dist`，杜絕宿主機 binary/shim 滲入 Alpine 容器。
    - 在 `Dockerfile.server`、`Dockerfile.web`、`Dockerfile.admin` 加入 `pnpm-lock.yaml` 複製並採用 `pnpm install --frozen-lockfile` 確保依賴確定性。
    - 修復 `apps/server/src/modules/simulator/router.ts` 中 `femaleFriends` 型別推導問題，確保 `pnpm -r build` (tsc) 0 報錯。
  - **驗證方式**：純淨隔離目錄驗證 `astro-core` 編譯成功，全專案 97 項測試全綠，`pnpm -r build` 0 錯誤。

---

## 多步驟檢核點規範 (Rule 10 Checkpoint Protocol)

在執行上述各子任務時，必須遵循以下多步驟總結格式：

```markdown
### 檢核點回報 (Checkpoint Report)
- **當前任務**：Task X.Y <任務名稱>
- **已完成事項 (Completed)**：具體改動的檔案與新增的純函數/組件。
- **已驗證事項 (Verified)**：具體執行的測試指令與驗證結果（附上終端輸出摘要）。
- **剩餘事項 (Remaining)**：下一步預計執行的子任務與潛在風險/阻礙。
```

---
*任務清單編制完成，後續開發嚴格依循本清單勾選迭代執行。*
