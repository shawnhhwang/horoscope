# 🌌 萬象天儀 (Astraea & CelestialDao)

> **頂級東西方綜合星象與命理系統**  
> 融合東方紫微斗數、四柱八字、周易六爻、三才五格姓名學，與西方現代占星、月相原型、78 張韋特塔羅牌。  
> 介面以 **Awwwards / Webby Awards / FWA Site of the Day** 標準打造，搭載 Three.js 3D 渾天儀 WebGL 動態視覺、Lenis 精品級平滑滾動，並具備完整雙主題（星淵夜幕 / 晨曦天盤）、會員命盤雲端保險庫、管理員 CMS 後台，以及生產級 Docker 一鍵部署。

---

## 🌟 核心功能特色 (Key Features)

### 1. 東方古典命理三大支柱 (Eastern Classical Divination)
*   **紫微斗數 (Zi Wei Dou Shu) 與正統三合派命相心法**：
    *   依據生辰年月日時與真太陽時精準起局（水二局、木三局、金四局、土五局、火六局）。
    *   布建十二宮位（命宮、兄弟、夫妻、子女、財帛、疾厄、遷移、交友、官祿、田宅、福德、父母）與身宮。
    *   推算十四主星（紫微天府兩大星系）、六吉星、六煞星、以及生年干四化星（祿、權、科、忌）。
    *   **大限、流年、小限行運大盤 (Ziwei Decade / Yearly / Small Limit Horoscope)**：動態推算本命十年大限起止、流年歲次宮位與本命年支小限宮位，並生成純淨星曜名稱陣列之流耀四化（`siHua: [祿, 權, 科, 忌]`，如 `['廉貞', '破軍', '武曲', '太陽']`），支援指定目標年份精準推演行運起伏。
    *   **三合派正統格局與天機命相心法**：精確識別君臣慶會、紫府同宮、機月同梁、陽梁昌祿、火貪格、巨日同宮、太陰化忌入命等格局，輔以古籍出處與成立條件，並導入「2/3 大於 1/3」、「名位相等」決策思維。
*   **四柱八字 (BaZi / Four Pillars)**：
    *   太陽黃經 24 節氣精確切換，地支藏干全要素推導。
    *   推算天干地支「十神」關係（比肩、劫財、食神、傷官、偏財、正財、七殺、正官、偏印、正印）。
    *   日主強弱判定、五行能量權重分佈百分比與喜用神判定，附帶 10 年大運歲運推排。
*   **百歲流年·模擬一生 (0-100 BaZi Life Odyssey Simulator)**：
    *   **0～100 歲時間軸推演**：以本命八字與大運為基底，結合每年流年曆干支，建構 101 個年輪節點。
    *   **0~100 歲全年年輪敘事 (`annualStory`)**：將人生劃分為 22 個細緻生命階段（襁褓撫育、幼學啟蒙、志學青春、弱冠之年、而立奮發、不惑蓄勢、中流砥柱、知命豁達、花甲耳順、古稀康寧至期頤百歲），結合流年十神星象意涵、五行喜忌與台灣時代年輪，純演算法於 0ms 內為 101 個節點生成約 100~150 字的生動年輪說明文字與專屬階段標題。
    *   **男性視角專屬 · 紅顏盲盒相逢機制**：
        *   內建 5 位鮮活性格之命中注定女性友人原型（沈婉晴 · 青梅竹馬、林若曦 · 熱血同窗、宋雨薇 · 藝術靈動、蘇珮儀 · 職場菁英、趙敏芝 · 世家千金）。
        *   **女性友人自訂生辰 (KEYIN) 與年歲動態對齊**：支援個別 KEYIN 生日，根據流年西曆年份精準計算相遇時女性實歲（`herEncounterAge = solarYear - femaleBirthYear`），情境長文生動對應年歲搭配。
        *   **相手好感度 (`herAffinity`) 媒合追蹤**：除主角好感外，獨立計算相手對主角的動態好感度與八字默契度，抉擇即時反饋雙向關係。
        *   青年黃金歲月（18, 22, 26, 30, 34 歲）自動觸發「紅顏盲盒相逢」：以神秘化身（如「【素雅白裙的知性女子】」）與情境感官線索登場，**抉擇當下使用者絕不會得知其真實姓名與身分**，全憑當下心境做出真誠互動與抉擇。
        *   後台自動記錄好感度 (`affinity` / `herAffinity`) 與因緣走向（`DATING`、`MARRIED`、`SOULMATE`、`CONFIDANTE`、`MISSED`、`STRANGER`）。
    *   **預設生活場景在台灣（1845 年清代至 2060+ 年超高齡社會）**：
        *   **歷史大事紀深度映射**：自 1845 年清道光二十五年（金湖大水災、頂下郊拚、牡丹社事件、劉銘傳建省）至日治時期（乙未割台、自來水水道、嘉南大圳）、戰後（四萬換一塊、十大建設、美麗島、解嚴、台灣錢淹腳目股市萬點、921大地震）、當代高科技（SARS、高鐵、疫情三級警戒、護國神山矽盾、生成式AI）與未來（超高齡長照3.0）。
        *   **各時代人類平均壽命動態衰減模型**：依據時代歷史公衛水準動態調節衰退起始線（1845~1895 清代平均壽命僅約 31~35 歲，年過四十即屬高壽；現代則至 75 歲以上才開始自然生理衰退）。
        *   **重大傳染病流行與公衛機制**：收錄金湖水災時疫、黑死病鼠疫、西班牙流感、南洋瘧疾、小兒麻痺、副霍亂、瘧疾撲滅、B肝疫苗先驅、SARS 與 COVID-19，動態生成防疫避險、草藥禳災或冒進經商等決策分支。
    *   **八字流年四大領域數值動態演化面板**：體魄健康（Health）、知識才識（Knowledge）、財富資產（Wealth）、情感眷屬（Relationship）。依據年齡生命週期與流年十神動態演進（幼年知識啟蒙、求學文昌峰值、立業財富積累、晚年健康自然生理衰減與知識化境）。
    *   **全套日式寫實風格插畫**：14 幅 1024x1024 高畫質插畫，涵蓋 9 大人生階段年輪卡牌與 5 位紅顏立繪，時間軸與終局全景渲染。
    *   **LLM 隨機重大轉折與互動抉擇**：涵蓋啟蒙求學、考試升遷、初入職場、成家立業、中年考驗至耄耋天命，由 LLM 動態生成情境與 2～4 個決策選項。
    *   **轉折年與大凶大吉年命理決策錦囊**：在歲運並臨、大沖大剋（大凶）、天乙貴人吉照（大吉）或交脫大運轉折點，精準出謀劃策（如避凶守成、果斷開拓、立足長遠），選項自動附帶 `[✓ 避煞首選]`、`[⭐ 轉折關鍵]` 等智慧指引標籤。
    *   **雙軌推進機制**：支援「關鍵轉折手動決策」與「平穩年自動快進」。
    *   **終局《一生行誼·蓋棺錄》四大視角與「80 億分之一的遊戲」**：
        *   壽元耗盡或滿百歲時，結算五維成就雷達圖、一生三大榮光、歲月遺憾與自傳長文，具備 0ms 秒開彈窗。
        *   **四大傳記視角自由切換**：【🔮 三合天機心法】、【📜 正史太史公列傳】、【☕ 現代時代回憶錄】與【🌌 80億分之一的遊戲 (One in 8 Billion Game)】。
        *   **80 億分之一宇宙回顧**：計算八字組合乘以後天抉擇路徑在全人類 80 億人中的宇宙唯一性稀有度評分（如 99.999987%）與命運代碼（如 `#DESTINY-TW-8B-39182`）；蓋棺論定之際**正式揭曉紅顏盲盒真容**（真實姓名、好感度、因緣終局與專屬批註），並附以宇宙存在主義哲學贊詩。
        *   支援「✨ 召喚靈犀 AI 深度撰寫」，結合歷史風雲與命理哲思打造專屬傳奇。
*   **八字合婚與紫微雙軌合盤 (BaZi & Ziwei Dual-Track Synastry)**：
    *   **子平八字五維深度合盤**：天干五合（情投意合）、夫妻宮地支合沖（六合/三合/半合/相沖/相害）、五行互補評分、年柱納音神煞契合度，並精準推導夫妻矛盾之「通關五行」化解藥方與現代相處指引。
    *   **三合正統雙宮聯參合盤體系**：十四主星在夫妻宮斷語 (`STAR_IN_FUQI_GU`) 與四化斷語、雙宮聯參鐵律（「看婚姻必同時看夫妻宮與福德宮」）、天作之合判定（甲之夫妻宮主星 = 乙之命宮主星）、三合天機合盤五步法拆解。
*   **家人群組比對與後天八卦名位相等 (Family Group Dynamics & Bagua Space Layout)**：
    *   全家五行場域能量聚合：推算家庭主導五行能量與相對匱乏五行，賦予家族氣場標題（如崇德向學·青雲得祿）。
    *   家庭成員兩兩關係矩陣（$C(N, 2)$ 交叉動態）與角色賦能（家族舵手、調和者、開拓者、守護者）。
    *   **《周易》後天八卦空間名位相等配置**：按成員角色定位八卦方位（乾父西北、坤母西南、震長子正東、巽長女東南、坎次子正北、離次女正南、艮三子東北、兌三女正西），提供名位法則、地天泰/水火既濟配置與陽宅越位禁忌警示。

*   **周易六爻卜卦與梅花易數 (I Ching & Plum Blossom)**：
    *   **六爻金錢卦**：3 枚銅錢投擲機率模擬，精確判定老陽(9)、少陽(7)、少陰(8)、老陰(6)。
    *   **梅花易數**：支援先天數理即時起卦。
    *   推算 64 卦對照矩陣，動爻之卦（變卦）、互卦、錯卦、綜卦，並定位世應爻與卦身。
*   **七政四餘 (Qizheng Siyu / Seven Governors & Four Extras)**：
    *   皇家皇家級天星學，推演七政（日、月、水、金、火、木、土）與四餘隱曜（羅睺、計都、月孛、紫炁）黃道天球坐標。
    *   嚴格排定二十八星宿（角亢氐房心尾箕、斗牛女虛危室壁、奎婁胃昴畢觜參、井鬼柳星張翼軫）度數入宿與四象所屬。
    *   精準定位十二辰次（星紀、玄枵、娵訾、降婁、大梁、實沈、鶉首、鶉火、鶉尾、壽星、大火、析木）與命宮、身宮。
    *   推算十二人事宮（命宮至相貌宮）、恩難仇用四星吉凶格局與星曜交會相位（同宮、對照、三方、四正）。
*   **每日黃曆與運勢大盤 (Daily Chinese Almanac & Horoscope)**：
    *   農曆干支歲次、建除十二神（建、除、滿、平、定、執、破、危、成、收、開、閉）與黃道值日。
    *   二十八星宿值日吉凶歌訣、九星飛泊天盤（一白水至九紫火）。
    *   每日精選宜忌（祭祀、祈福、嫁娶、出行、安葬等）、三煞方位、相沖生肖與胎神佔方。
    *   喜神、財神、福神三吉方八卦定位、日上起時十二時辰吉凶（青龍、明堂、金匱、天德等）。
    *   十二生肖今日運勢評分與四柱日主（甲乙丙丁戊己庚辛壬癸）五行生剋天干諧振指引。
*   **流年生活行運曆與起居規劃 (Annual Destiny Calendar & Life Rhythm Planner)**：
    *   **五虎遁年起月十二流月曆**：自動排演目標流年（如 2026 丙午年）之歲次大綱、日主十神格局、紫微流年命宮主星與流年四化（祿權科忌純星名陣列），並以五虎遁法推演十二流月干支、月十神、紫微流月命宮與四時氣場評分。
    *   **生活起居習慣追蹤 (Daily Habit Journal)**：提供每日作息睡眠時長與品質、五味飲食結構、飲水量、運動時間、身心精力狀態（1-5星）與重要決策隨記。
    *   **命盤五行諧振診斷 (Habit-Chart Resonance 0-100分)**：將使用者近期實際起居數據與本命喜用五行、流年火旺氣場即時交叉對比，產出木火土金水滋養度雷達、睡眠/飲食/運動專項診斷，並生成包含子時深睡、五味通關水液與決策避煞之專屬行動規劃書 (Action Plans)。
    *   **天機靈犀 AI 規劃顧問 (In-Page AI Planner)**：專屬 `ANNUAL_PLANNER` 角色，將流年命盤與起居日記結構化注入，生成全年度生活節奏與避煞指南。

### 2. 姓名學與起名引擎 (Name Analysis & Recommendation)
*   **康熙正統筆劃**：收錄正體字與特殊部首傳統筆劃數。
*   **三才五格吉凶**：精準計算天格、人格、地格、總格、外格之 81 數理吉凶與 125 種三才五行生剋格局。
*   **八字喜用智能補缺起名**：根據命局五行欠缺，推薦兼具高五格評分與五行平衡的命名組合。

### 3. 西洋神秘學與占星系統 (Western Astrology & Divination)
*   **純 TypeScript 開普勒／Jean Meeus 天體軌道引擎（0% AGPL 授權污染）**：
    *   全系統天體運動與行星黃經演算法均採用純 TypeScript 原生數學解析解（基於 Jean Meeus 天文演算法與開普勒軌道根數公式），**完全未引入 Swiss Ephemeris (`swisseph`) 之 AGPL 程式庫**，徹底規避 GNU AGPL v3 Copyleft 強制開源感染風險，100% 適用於商業私有化閉源部署與營利服務。
*   **西洋本命星盤 (Western Natal Chart)**：
    *   開普勒天體坐標推算十大行星（太陽、月亮、水星、金星、火星、木星、土星、天王星、海王星、冥王星）。
    *   上升點 (ASC)、天頂 (MC)、下降點 (DSC)、天底 (IC) 四軸與宮位劃分。
    *   五大主要相位（合相 0°、六分相 60°、四分相 90°、三分相 120°、對分相 180°）容許度判定。
*   **月亮星座與八大月相 (Moon Phase Archetypes)**：
    *   即時計算日月黃經夾角，精準識別：新月、眉月、上弦月、盈凸月、滿月、虧凸月、下弦月、殘月。
    *   提供月亮潛意識情緒反應模式與靈魂成長指引。
*   **78 張經典偉特塔羅牌 (Waite-Smith 1909 Tarot)**：
    *   完整收錄 22 張大阿爾克那與 56 張小阿爾克那（權杖、聖杯、寶劍、錢幣），採用 1909 年 Pamela Colman Smith 原版公有領域牌面（詳見 [ASSETS_LICENSE.md](file:///home/coder/Codebase/Horoscope/ASSETS_LICENSE.md)）。
    *   真隨機 Fisher-Yates 洗牌算法，支援正位與逆位深度牌義解析。
    *   提供 5 種經典牌陣：單張啟示、時間之流（過去/現在/未來）、聖三角牌陣、二選一決策牌陣、塞爾特十字牌陣（10 張）。

### 4. 會員系統與命盤保險庫 (Member Vault & Journal)
*   **安全認證**：密碼經 Bcrypt 雜湊加密，JWT Bearer 鑑權機制。
*   **命盤雲端保險庫**：儲存親友生辰經緯度檔案，一鍵快速載入命盤。
*   **測算隨筆日記**：隨時記錄個人命理感悟與歷史占卜軌跡。

### 5. 管理員 CMS 與數據大盤 (Admin Portal · 整合於 Port 5499)
*   **RBAC 權限控管**：嚴格區分 ADMIN、VIP、MEMBER 角色，杜絕非法提權。
*   **安全 DEMO 模式架構 (Fail-Closed 安全機制)**：
    *   在 `.env` 設定 `DEMO_MODE=true|false`。生產環境預設採 Fail-Closed 策略強制關閉 Demo 模式。
    *   當明確啟用 `DEMO_MODE=true` 時，前台支援體驗模式，預設訪客身分設定為唯讀 `MEMBER` 權限，無法存取管理員專屬端點與資料庫核心操作；廢除任何寫死之後門 Token。
*   **資料庫在線檢視與備份還原 (Database Admin & Backups)**：
    *   **即時快照備份**：後台可一鍵建立時間戳快照備份 (`.db`)，並支援快照檔案下載。
    *   **安全還原**：支援自歷史備份快照一鍵還原資料庫（執行前自動建立回滾保護快照）。
    *   **多表可視化編輯器**：支援在線分頁查詢、搜尋與直接修改 `User`、`BirthProfile`、`ReadingRecord`、`SystemInterpretation` 原始資料列（後台檢視自動脫敏，排除 `passwordHash` 等機敏憑證）。
*   **會員完整管理與密碼重設 (Member Management)**：
    *   支援在線新增會員、編輯會員個人資訊、指派角色（`USER`、`VIP`、`ADMIN`）、重設密碼與帳號銷毀。
*   **RAG 知識庫工程與提示詞調試 (RAG Engineering)**：
    *   提供各命理系統專屬現代專業顧問角色（去仙人道士口吻，貼近心理學與客觀諮詢）。
    *   **國際大師級語錄與宗師心法 RAG 知識庫**：
        *   **西洋占星**：整合榮格 (Carl Jung) 共時性與原型心理學、丹·路德雅爾 (Dane Rudhyar) 人本占星、莉茲·格林 (Liz Greene) 陰影整合、史蒂芬·阿若優 (Stephen Arroyo) 能量占星、羅伯特·漢德 (Robert Hand) 本命象徵。
        *   **偉特塔羅**：整合愛德華·韋特 (A.E. Waite) 圖像之鑰、蕾切爾·波拉克 (Rachel Pollack) 愚人之旅心靈啟示、瑪麗·格利爾 (Mary K. Greer) 逆位破局指引、亞歷杭德羅·佐杜洛夫斯基 (Alejandro Jodorowsky) 心理塔羅。
        *   **紫微斗數**：整合三合派傳統經典名著與實戰命相體系、十四主星夫妻宮斷語、合盤五步法與後天八卦名位相等。
    *   支援 RAG 即時檢索調試視窗、動態命盤實體注入 (Structured Chart-Entity Grounding)、全站解讀資料庫 JSON 匯出與批次 Upsert 匯入。
*   **點擊頭像直接進入 ADMIN 編輯**：前台導航列右上角常駐會員/管理員頭像，點擊頭像即可直接進入 `/admin` 進行系統配置、資料庫管理、LLM 參數與辭庫編輯，無需記憶額外路徑。
*   **單一前端純淨架構 (廢除 3001)**：已完全停止並廢除獨立的 3001 Port 服務，所有後台管理頁面（數據大盤、資料庫備份、命理辭庫、會員管理、LLM 配置）均無縫整併於主網站 (Port 5499，路徑 `/admin/*`)。
*   **運營監控大盤**：註冊人數、測算模組調用熱力圖即時數據呈現。

### 6. 天機靈犀 LLM 智能星象顧問 (Celestial AI Assistant)
*   **右上角全局靈犀按鈕**：前台頂部導航常駐「✨ 天機靈犀」，一鍵滑出琉璃光暈抽屜對話介面。
*   **即時命盤上下文注入**：支援紫微斗數、四柱八字、八字合婚、周易卜卦、姓名學、西洋星盤、七政四餘與塔羅牌陣一鍵「✨ 呼叫天機靈犀」，將當前盤面坐標自動注入 AI 對話背景。
*   **平滑雙模驅動**：支援調用 OpenAI 相容外部大模型（如 GPT-4o、Claude 3.5 Sonnet、Gemini 1.5 Pro、DeepSeek），未配置密鑰或離線時自動回退至內建「專業現代星象顧問合成引擎」，保證隨時隨地具備深邃命理指引。

### 7. Awwwards / Webby / FWA 級視覺設計標準與行動端體驗
*   **3D WebGL 渾天儀**：以 Three.js 建構赤道環、黃道環、地平環與天球星系粒子，具備滑鼠微互動與慣性旋轉。
*   **擬真高畫質典藏藝術資產 (Museum-Grade Physical Aesthetics)**：
    *   全彩燙金華麗韋特塔羅牌背 (`card_back.jpg`) 與 7 大核心大阿爾克那神聖卡面（愚者、魔術師、女祭司、戀人、命運之輪、星星、太陽）。
    *   古典雙半球精密天文天球星圖 (`star_chart.jpg`)，融入七政四餘與西洋黃道星盤。
    *   青銅質樸二十八宿渾天儀與太極八卦鏡 (`bagua_astrolabe.jpg`)。
    *   御用金箔硃砂古籍黃曆宣紙橫幅 (`almanac_banner.jpg`)，呈現傳承千年的莊嚴文化底蘊。
*   **雙主題與高對比適配**：
    *   🌑 **星淵夜幕 (Deep Obsidian)**：`#08090C` 背景配玄黑、琉璃金與星雲紫。
    *   🌕 **晨曦天盤 (Dawn Celestial)**：`#F9F8F5` 背景配象牙白、羊皮紙底色與古銅金，全站卡片文字在 Light 模式下保證極佳對比清晰度。
*   **iPhone / 行動裝置全瀏覽器相容性**：全面支援 iPhone Safari、Chrome 與行動裝置尺寸，排盤網格自適應單欄流動，觸控互動與長篇批註平滑無阻滯。
*   **頂級排版與字體**：引入 `Cinzel` 西洋古典神聖字體與 `Noto Serif TC` 宋體。
*   **精品平滑滾動**：集成 `@studio-freight/lenis`，帶來無頓挫的奢華滾動手感。

---

## 🏗️ 專案架構 (Monorepo Architecture)

```
Horoscope/
├── apps/
│   ├── web/                     # 前端主應用 (Vue 3 + Tailwind CSS + Three.js + Lenis)
│   ├── admin/                   # 後台管理 CMS (Vue 3 + Vite + Tailwind CSS)
│   └── server/                  # 後端 RESTful API 服務 (Node.js + Express + TypeScript)
├── packages/
│   ├── astro-core/              # 核心純函數命理演算法庫 (曆法、紫微、八字、六爻、姓名、西洋、塔羅)
│   └── database/                # Prisma ORM 模型定義、遷移腳本與種子數據
├── deploy/
│   └── docker/                  # 生產級容器化設定
│       ├── Dockerfile.server    # Node.js 20 Alpine 多階段後端映像檔
│       ├── Dockerfile.web       # Nginx Alpine 前台靜態服務映像檔
│       ├── Dockerfile.admin     # Nginx Alpine 後台靜態服務映像檔
│       └── nginx.conf           # SPA 路由相容與反向代理配置
├── docker-compose.yml           # 全棧五大容器一鍵編排配置
├── package.json                 # pnpm Monorepo 根目錄配置
├── pnpm-workspace.yaml          # 工作區配置
└── tsconfig.json                # TypeScript 全域基準設定
```

---

## 🚀 快速上手 (Quick Start)

### 系統環境要求 (Prerequisites)
*   **Node.js**: `v20.x` 或以上
*   **pnpm**: `v9.x` 或 `v12.x`
*   **Docker & Docker Compose** (可選，用於容器化一鍵啟動)

### 1. 本地開發環境 (Local Development)

#### 步驟 1：安裝依賴
```bash
pnpm install
```

#### 步驟 2：初始化資料庫與種子數據
```bash
# 生成 Prisma 客戶端並推送本地 SQLite / PostgreSQL Schema
pnpm --filter @celestial/database db:push

# 注入管理員、VIP 會員與預設命理辭庫
pnpm --filter @celestial/database db:seed
```

#### 步驟 3：編譯核心演算法庫
```bash
pnpm --filter @celestial/astro-core build
pnpm --filter @celestial/database build
```

#### 步驟 4：啟動開發伺服器 (雙服務架構：Web 5499 + Server 5498)
```bash
# 啟動後端 API 服務 (Port 5498)
pnpm dev:server

# 另開終端啟動前端主站與整合後台 (Port 5499)
pnpm dev:web
```

---

## 🐳 Docker 一鍵部署 (Docker Deployment - 單一服務 5499 直達)

本專案支援一鍵全端一體化容器部署，僅需啟動 **單一容器服務**，對外僅需暴露 **單一連接埠 5499**（整合 Vue 3 前端、Admin 管理後台、Node.js Express API 與 SQLite 持久層）。

```bash
# 1. 複製環境變數範本
cp .env.example .env

# 2. 一鍵構建並啟動單一全端服務 (Port 5499)
docker compose up --build -d

# 或直接使用標準 Docker 指令單容器運行：
# docker build -t celestial-app .
# docker run -d -p 5499:5499 -v celestial_data:/app/packages/database/prisma --name celestial-app celestial-app

# 3. 檢查容器狀態
docker compose ps
```

服務端點對應：
*   **全站首頁與管理後台 (Web & Admin Portal)**: [http://localhost:5499](http://localhost:5499)
*   **後端 API 與健康檢查 (API & Health Check)**: [http://localhost:5499/health](http://localhost:5499/health)
*   所有前端頁面與 `/api/v1/*` 請求皆整合於 **Port 5499** 單一端點，同源無跨域延遲，亦無須配置額外 Nginx 反向代理。

---

## 🔑 預設測試帳號 (Default Credentials)

系統在執行 `seed` 時已預先建立下列帳號，方便快速測試：

| 帳號角色 | 登入信箱 | 登入密碼 | 權限等級 |
| :--- | :--- | :--- | :--- |
| **超級管理員 (ADMIN)** | `admin@celestial.dao` | `AdminPassword123!` | 擁有後台全部權限（辭庫修改、會員管理、運營數據大盤） |
| **尊榮 VIP 會員 (VIP)** | `vip@celestial.dao` | `UserPassword123!` | 可使用所有六大排盤、雲端命盤庫與日記存取 |
| **一般測試會員 (MEMBER)** | `user@celestial.dao` | `UserPassword123!` | 基礎會員權限 |

---

## 🛡️ 資安強化與架構合規 (Security & Hardening)

本專案已通過 [REFINE_LIST.md](file:///home/coder/Codebase/Horoscope/REFINE_LIST.md) 全面審查並完成生產級資安防護：
*   **Fail-Closed 安全 DEMO 機制**：生產環境強制停用 Demo 模式；訪客身分設定為唯讀 `MEMBER`，全面杜絕管理權限洩漏。
*   **SSRF 與金鑰外洩防護**：後台修改 LLM 端點強制阻擋本機 loopback、內網私有網段與雲端 Metadata 位址；網域變更時自動抹除舊 API Key。
*   **推演 Session IDOR 鑑權**：所有推演回合與蓋棺錄生成皆嚴格比對 Token 與紀錄擁有者身份，阻絕跨帳號越權篡改。
*   **API 速率限制 (Rate Limiting)**：認證登入 (30次/15分)、AI 對話 (40次/分) 與推演起局 (50次/分) 全面限流防刷。
*   **XSS 防護**：前端全站 HTML 渲染導入成熟的 `DOMPurify.sanitize()` 過濾機制。
*   **無漏洞保證**：依賴套件已修復 GHSA-27r3-jxmh-p828，`pnpm audit --prod` 報告 0 漏洞。

---

## 🧪 自動化測試與構建 (Testing & Verification)

本專案遵循嚴格的 **Rule 9 (Intent-Based Testing)**，所有命理演算與業務邏輯皆有自動化測試保障：

```bash
# 運行核心演算庫單元測試 (30 項全部通過)
pnpm --filter @celestial/astro-core test

# 運行後端 API、Role-RAG 與後台功能整合測試 (66 項全部通過)
pnpm --filter @celestial/server test

# 運行全單元與整合測試 (全專案 96 項全部通過，100% 成功率)
pnpm test

# 運行全專案構建檢查 (Monorepo 5 個套件全數編譯無誤)
pnpm build
```

---

## 📡 主要 API 端點參考 (API Reference)

| HTTP 方法 | 端點路徑 | 說明 | 鑑權要求 |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | 伺服器健康檢查 | 無 |
| `GET` | `/api/v1/auth/config` | 取得當前環境 DEMO 模式啟用狀態 | 無 |
| `POST` | `/api/v1/auth/register` | 會員註冊 (Bcrypt 雜湊，速率受限) | 無 |
| `POST` | `/api/v1/auth/login` | 會員登入 (取得 JWT Bearer Token，速率受限) | 無 |
| `GET` | `/api/v1/auth/me` | 查詢當前登入者資訊 | Bearer Token |
| `POST` | `/api/v1/calculator/ziwei` | 紫微斗數排盤與四化推演 | 可選 |
| `POST` | `/api/v1/calculator/bazi` | 四柱八字、十神與喜用神計算 | 可選 |
| `POST` | `/api/v1/calculator/bazi/synastry` | 八字合婚五維評析、通關五行與三合正統雙宮聯參合盤 | 可選 |
| `POST` | `/api/v1/calculator/family/group` | 家庭群組比對、五行場域與《周易》後天八卦空間配置 | 可選 |
| `POST` | `/api/v1/calculator/annual-calendar` | 流年生活行運曆推算 (歲君四化與五虎遁十二流月) | 可選 |
| `POST` | `/api/v1/calculator/annual-planner/analyze` | 生活起居與命盤五行諧振評估及專屬生活規劃書 | 可選 |
| `GET/POST/PUT/DELETE` | `/api/v1/habits(/:id)` | 每日生活起居習慣日記 CRUD (作息、飲食、運動、能量) | Bearer Token / Demo |
| `POST` | `/api/v1/calculator/iching/cast` | 周易六爻金錢卦 / 梅花易數起卦 | 可選 |
| `POST` | `/api/v1/calculator/naming/analyze` | 姓名三才五格與八字喜用評析 | 可選 |
| `POST` | `/api/v1/calculator/western/natal` | 西洋本命星盤與五大主要相位 | 可選 |
| `POST` | `/api/v1/calculator/tarot/draw` | 偉特塔羅 78 張牌陣抽牌 (5 種經典牌陣) | 可選 |
| `POST` | `/api/v1/calculator/qizheng` | 七政四餘天星盤推演 (七政四餘、廿八宿、十二次) | 可選 |
| `GET` | `/api/v1/almanac/today` | 查詢今日完整黃曆 (建除十二神、廿八宿、吉凶神煞) | 無 |
| `POST` | `/api/v1/almanac/query` | 指定國曆日期查詢黃曆大盤 | 無 |
| `GET/POST`| `/api/v1/profiles` | 個人命盤保險庫 CRUD | Bearer Token |
| `GET/POST`| `/api/v1/readings` | 測算紀錄與個人筆記日記 | Bearer Token |
| `POST` | `/api/v1/simulator/start` | 百歲流年人生推演起局 (支援1845清代起與傳染病機制) | 可選 (速率受限) |
| `GET` | `/api/v1/simulator/session/:id` | 讀取推演存檔 (具備 IDOR 擁有者保護) | 可選 |
| `POST` | `/api/v1/simulator/turn/prompt` | 生成該年年初運勢與決策事件情境 | 可選 (IDOR 保護) |
| `POST` | `/api/v1/simulator/turn/choose` | 結算該年決策、生命四大領域數值演變與壽元檢驗 | 可選 (IDOR 保護) |
| `POST` | `/api/v1/simulator/fast-forward` | 自動平穩快進推進至下個關鍵轉折年 | 可選 (IDOR 保護) |
| `POST` | `/api/v1/simulator/finalize` | 生成終局《一生行誼·蓋棺錄》(支援4大視角與80億分之一) | 可選 (IDOR 保護) |
| `GET` | `/api/v1/admin/analytics` | 運營統計儀表板數據 | ADMIN Role |
| `GET` | `/api/v1/admin/database/stats` | 取得 SQLite 資料庫檔案大小、各表筆數與備份數 | ADMIN Role |
| `POST` | `/api/v1/admin/database/backup` | 建立即時時間戳快照備份 (`.db`) | ADMIN Role |
| `GET` | `/api/v1/admin/database/backups` | 查詢歷史快照備份清單 | ADMIN Role |
| `GET` | `/api/v1/admin/database/download-backup/:filename` | 下載備份快照檔案 | ADMIN Role |
| `POST` | `/api/v1/admin/database/restore` | 執行快照還原（自動建立防護快照） | ADMIN Role |
| `GET/POST/PUT/DELETE` | `/api/v1/admin/database/tables/:table(/:id)` | 分頁查詢與直接編輯資料表原始資料 (脫敏過濾) | ADMIN Role |
| `GET/POST` | `/api/v1/admin/users` | 會員清單查詢與管理員手動新增會員 | ADMIN Role |
| `PUT/DELETE` | `/api/v1/admin/users/:id` | 修改會員資料／等級、刪除會員 | ADMIN Role |
| `POST` | `/api/v1/admin/users/:id/password` | 管理員重設指定會員密碼 | ADMIN Role |
| `GET/PUT` | `/api/v1/admin/interpretations` | 命理辭庫管理與即時在線編修 | ADMIN Role |
| `POST` | `/api/v1/admin/rag/test-retrieval` | RAG 專家角色與辭庫檢索即時調試 | ADMIN Role |
| `GET` | `/api/v1/admin/rag/export` | 匯出全站解讀辭典為 JSON 檔案 | ADMIN Role |
| `POST` | `/api/v1/admin/rag/import` | 批次匯入並同步更新解讀詞條 (Upsert) | ADMIN Role |
| `GET` | `/api/v1/llm/status` | 查詢 LLM 靈犀助手公開狀態與當前模型 | 無 |
| `POST` | `/api/v1/llm/chat` | 靈犀對話並注入具體命盤數據上下文 (速率受限) | 無 / 可選 |
| `GET/PUT` | `/api/v1/admin/llm-config` | 後台查看與修改 LLM 端點、Key、Prompt (SSRF 防護) | ADMIN Role |
| `POST` | `/api/v1/admin/llm-test` | 後台測試 LLM 連線與解盤生成 | ADMIN Role |

---

## 📜 授權協議 (License)

CelestialDao Proprietary Commercial License © 2026 萬象天儀 (Astraea & CelestialDao)  
本專案為商業專有閉源軟體，未經官方書面授權，禁止未授權複製、逆向工程、反組譯或公開散布。素材授權細節請參閱 [ASSETS_LICENSE.md](file:///home/coder/Codebase/Horoscope/ASSETS_LICENSE.md)。

> **商用合規與演算法聲明**：本專案所有東西方命理演算法（包含天體力學、真太陽時、均時差、西洋相位、七政四餘天星度數、紫微斗數排盤與大小限行運）均為 100% 原創純 TypeScript 數學實作，完全不依賴亦無引用 Swiss Ephemeris (`swisseph`)，無任何 GNU AGPL 傳染性開源授權風險，100% 合法適用於私有化閉源與商業營運。

