# 📜 萬象天儀 — 專案素材與智財資產清冊 (ASSETS_LICENSE.md)

> **版本**：v1.0.0-COMPLIANCE  
> **更新日期**：2026-10-30  
> **版權聲明**：本專案為商業專有系統（Proprietary Software），所有演算法、架構與自研資料庫均受智慧財產權與著作權法保護。

---

## 1. 塔羅牌圖面素材與公有領域說明 (Tarot Deck Assets)

* **牌陣圖檔目錄**：`apps/web/public/images/tarot/cards/` (78 張經典牌面 `c01.jpg` ~ `c78.jpg`)
* **歷史源流與公有領域 (Public Domain) 依據**：
  - 本系統採用之經典牌面為 **1909 年 12 月於英國倫敦首度出版之經典塔羅（Waite-Smith Tarot, 1909）**。
  - 原畫繪者：**帕梅拉·科曼·史密斯 (Pamela Colman Smith, 1878–1951)**。
  - 架構設計者：**阿瑟·愛德華·偉特 (Arthur Edward Waite, 1857–1942)**。
  - 依據著作權法規（包含台灣著作權法著作人死亡後 50 年、美國 1928 年前公開發表之作品進入公有領域、英國著作人死亡後 70 年）：**1909 年首版之 78 張圖稿全數已進入全球公有領域 (Public Domain)**，任何人均得合法重製與應用於文化藝術與商業系統。
* **商標避險規範 (Trademark Fair-Use)**：
  - 「Rider-Waite」為 U.S. Games Systems, Inc. 於特定地區之註冊商標。
  - 本系統全面採用歷史學界公認之學術通稱 **「偉特體系塔羅 (Waite-Smith 1909)」** 或 **「經典 78 張塔羅」**，避免在商業推廣中構成不當攀附或商標混淆。

---

## 2. 命理天文演算法與授權合規 (Algorithms & License Neutrality)

* **純 TypeScript 自研曆法與天體演算法 (`packages/astro-core`)**：
  - 本專案天文座標、二十四節氣精確分秒、真太陽時均時差校正、七政四餘黃道宿度，均採用由 Jean Meeus 《Astronomical Algorithms》幾何開普勒攝動方程自研改寫之純 TypeScript 原生數學函數。
  - **100% 規避 GNU AGPL 傳染性授權**：完全不依賴、不安裝任何 Swiss Ephemeris (`swisseph`) 之 C/C++ 綁定套件，徹底保障本平台閉源商業授權、SaaS 營運與資產處分之合法性。
* **古典三合派與周易後天八卦自研知識庫 (`packages/database/src/seed-nihai.ts`)**：
  - 所有 RAG 解讀辭條（共 61 組正體中文深入語料）均為本專案團隊原創撰寫之現代哲學與心理諮商語境。
  - 理論體系基於《周易·說卦傳》、《紫微斗數全書》、《滴天髓》等千年公有領域古典文獻，不抄襲任何在世或近現代著作人未經授權之出版品講義文字。

---

## 3. 視覺插畫與原創美術資產 (Visual & Illustration Assets)

* **百歲流年模擬人生插畫庫 (`apps/web/public/images/life-simulator/`)**：
  - 涵蓋 9 大生命週期階段插畫 (`stage_01_infancy.jpg` ~ `stage_09_centenarian.jpg`) 與 5 位紅顏立繪 (`romance_wanqing.jpg` 等)。
  - 視覺風格定位：日式寫實動畫光影美學。
  - 智慧財產權：專為萬象天儀客製生產之美術資產，享有商業平台獨家部署與展示權利。

---

## 4. 歷史大事紀資料庫 (Taiwan Historical Chronology)

* **台灣歷史大事紀與公衛演進字典 (`packages/astro-core/src/life-simulator/taiwan-history.ts`)**：
  - 涵蓋 1845 年清道光至 2060+ 年超高齡社會大事紀。
  - 歷史客觀事實不屬於著作權標的；本系統中所有年代背景之敘事文字、公衛衝擊評估及數值規則，均為專案工程團隊原創編撰。

---

## 5. 字型與第三方開源依賴庫 (Fonts & Open-Source Libraries)

* **字型資產**：
  - `Cinzel`, `Noto Serif TC`, `Plus Jakarta Sans` 均遵循 **SIL Open Font License (OFL 1.1)**，允許免費商業使用與打包發布。
* **開源依賴套件**：
  - Vue 3、Pinia、TypeScript、Marked、DOMPurify、Express、Prisma、Three.js、GSAP 等全套依賴均為 MIT、ISC、Apache-2.0 或 BSD 寬鬆授權，無 GPL/AGPL 傳染性風險。
