/**
 * 萬象天儀 - 全模組深度擴展 RAG 知識庫種子資料 (Extended Domain RAG Seeds)
 * 補足周公解夢 (DREAM)、廟宇籤詩 (TEMPLE_POEM)、文鳥靈籤 (BUNCHO)、
 * 流年生活曆 (ANNUAL_PLANNER)、百歲人生模擬器 (LIFE_SIMULATOR)、
 * 子平八字 (BAZI)、周易六爻 (ICHING) 與姓名學 (NAME) 之權威語料庫。
 */

export interface ExtendedInterpretationSeed {
  moduleType: string;
  keyCode: string;
  category: string;
  title: string;
  contentRich: string;
  tags: string;
}

export const EXTENDED_INTERPRETATIONS: ExtendedInterpretationSeed[] = [
  // ────────────────── 周公解夢與潛意識原型 (DREAM) ──────────────────
  {
    moduleType: 'DREAM',
    keyCode: 'DREAM_MASTER_ZHOUGONG_SYMBOLISM',
    category: 'CLASSIC_WISDOM',
    title: '《周公解夢》象徵本旨：反夢心法與吉凶轉化',
    contentRich:
      '《周公解夢》為華夏夢占文化集大成者，深諳「反夢」與「物極必反」之易理。如夢死得生、夢棺發財、夢水得利、夢火主昌。解夢不可拘泥於表面吉凶，須探究夢者清醒時之壓抑情結。吉夢提醒戒驕戒躁以固其福，凶夢示警未雨綢繆以避其害。',
    tags: JSON.stringify(['周公解夢', '反夢', '夢占', '象徵轉化', '吉凶互生']),
  },
  {
    moduleType: 'DREAM',
    keyCode: 'DREAM_JUNGIAN_SHADOW_WATER',
    category: 'JUNGIAN_ARCHETYPE',
    title: '榮格原型心理學：深水、江海與潛意識陰影整合',
    contentRich:
      '卡爾·榮格指出，夢中的水體象徵人類浩瀚之無意識（Unconscious）。清澈泉水代表自性（Self）之滋養與重生；洶湧濁浪則反映被壓抑的陰影（Shadow）情緒與焦慮。穿越水域象徵個體化歷程（Individuation）的重大轉折，面對內在真實方能獲得心靈解脫。',
    tags: JSON.stringify(['榮格心理學', '深水意象', '潛意識', '個體化', '陰影整合']),
  },
  {
    moduleType: 'DREAM',
    keyCode: 'DREAM_ANIMAL_SNAKE_DRAGON_TRANSIT',
    category: 'ARCHETYPE_SYMBOL',
    title: '靈蛇與神龍意象：本能生命力與靈性昇華',
    contentRich:
      '蛇在東方象徵靈性蛻變、智慧蟄伏與本能生命能量（拙火），夢蛇常主生機萌動或財帛機遇；龍則象徵純陽剛健與崇高志向。若夢見蛇化為龍，主蓄力功深、打破階層桎梏、人生進入宏大開展期。',
    tags: JSON.stringify(['蛇意象', '龍意象', '靈性蛻變', '周公解夢', '生命動力']),
  },
  {
    moduleType: 'DREAM',
    keyCode: 'DREAM_FALLING_AND_FLYING',
    category: 'PSYCHO_DYNAMICS',
    title: '飛翔與墜落：自我控制感與現實重壓之心理映射',
    contentRich:
      '夢中翱翔天際象徵擺脫現實重擔、追求精神自由與創造力爆發，但若飛得過高而恐懼，則警示自我膨脹（Inflation）；夢中失足墜落則反映現實中失控感、安全感缺失或面臨重大抉擇時的心理防禦瓦解，宜踏實接地。',
    tags: JSON.stringify(['飛翔夢', '墜落夢', '心理投射', '控制感', '榮格分析']),
  },

  // ────────────────── 台灣廟宇六十甲子籤與擲筊神諭 (TEMPLE_POEM) ──────────────────
  {
    moduleType: 'TEMPLE_POEM',
    keyCode: 'TEMPLE_POEM_ALLUSION_FOUNDATION',
    category: 'POEM_ALLUSION',
    title: '台灣六十甲子籤精要：典故借古喻今與時節進退',
    contentRich:
      '六十甲子籤詩每籤皆標有歷史或演義典故（如太公釣魚、趙子龍救阿斗、白蛇精遇許仙）。解籤心法首重「以古觀今」：細看典故主角身處何種困局、採取何種作為、最終得何果報。時序分春生夏長秋收冬藏，順應天時則事半功倍。',
    tags: JSON.stringify(['六十甲子籤', '歷史典故', '廟宇籤詩', '借古喻今', '天時節奏']),
  },
  {
    moduleType: 'TEMPLE_POEM',
    keyCode: 'TEMPLE_POEM_BWA_BWEI_HOLY_DECREE',
    category: 'RITUAL_SACRED',
    title: '物理擲筊之聖意直通：聖筊、笑筊、陰筊的溝通智慧',
    contentRich:
      '擲筊乃人神相通之神聖儀軌。一平一凸為「聖筊」（陰陽相合，神明應允）；雙凸為「陰筊」（生氣不允或局勢大凶，宜守勿攻）；雙平為「笑筊」（未明心意或機緣未至）。神明聖意旨在啟迪心智、平息紛擾，指引善信端正身心。',
    tags: JSON.stringify(['擲筊', '聖筊', '笑筊', '陰筊', '廟宇儀軌', '神明聖意']),
  },
  {
    moduleType: 'TEMPLE_POEM',
    keyCode: 'TEMPLE_POEM_TEN_DIMENSION_VERDICT',
    category: 'INQUIRY_METHOD',
    title: '籤詩十維面向斷法：同一籤文於不同事由之吉凶分張',
    contentRich:
      '籤詩斷語依求測面向（功名仕途、求財經商、婚姻感情、疾病康泰、六甲求子、官司訴訟、遠行移徙、失物尋求）而各有權衡。例如兵戈殺伐之籤，於商場開拓為吉，於疾病婚姻則主爭執多難。必先定其問事之軸，方能通神。',
    tags: JSON.stringify(['問事面向', '籤詩解讀', '婚姻財富', '功名疾病', '條理斷語']),
  },

  // ────────────────── 二十八宿靈雀銜籤神諭 (BUNCHO) ──────────────────
  {
    moduleType: 'BUNCHO',
    keyCode: 'BUNCHO_TWENTY_EIGHT_MANSIONS',
    category: 'DIVINATION_LORE',
    title: '二十八宿靈雀銜籤：物候通靈與當下氣機感應',
    contentRich:
      '文鳥占卜源自東方靈禽相感之術，融合周天二十八宿禽星分野（如角木蛟、房日兔、井木犴）。雀鳥性靈純真，銜籤感應當下造化之微動。籤詩辭簡意賅，專斷當前三月內之吉凶走勢與行動節點。',
    tags: JSON.stringify(['文鳥抽籤', '靈禽神諭', '二十八宿', '感應易學', '當下決策']),
  },
  {
    moduleType: 'BUNCHO',
    keyCode: 'BUNCHO_FIVE_ELEMENTS_HARMONY',
    category: 'DIVINATION_LORE',
    title: '文鳥靈籤五行調候：隨緣自適與化繁為簡',
    contentRich:
      '靈雀神籤以五行（金木水火土）定其骨幹，輔以直白白話指引。面對人生迷惘，文鳥心法重在「去心機、順自然」。籤詩揭示當前阻力在於人心過多貪念或猶豫，如鳥振翅，需先放下無謂重負，方能高飛。',
    tags: JSON.stringify(['文鳥靈籤', '五行調候', '隨緣自適', '心理安頓', '簡明斷語']),
  },

  // ────────────────── 流年曆與生活起居調候 (ANNUAL_PLANNER) ──────────────────
  {
    moduleType: 'ANNUAL_PLANNER',
    keyCode: 'ANNUAL_PLANNER_BINGWU_RHYTHM',
    category: 'CALENDAR_WISDOM',
    title: '流年行運氣機共振：天干地支歲運與日常生活起居律動',
    contentRich:
      '流年歲君掌一年之生殺大權。以 2026 丙午歲運為例，天干丙火、地支午火，純陽火旺之年。日主逢之，十神角色各異：身弱火旺者宜滋陰降燥，作息早眠戒急；身旺喜火者宜雷厲風行、大展宏圖。流年生活曆重在使個人起居作息與天地氣節諧振同頻。',
    tags: JSON.stringify(['流年生活曆', '歲運氣機', '日主十神', '生活作息', '陰陽調候']),
  },
  {
    moduleType: 'ANNUAL_PLANNER',
    keyCode: 'ANNUAL_PLANNER_FOUR_SEASONS_HEALTH',
    category: 'LIFESTYLE_MED',
    title: '四正時脈起居法：子午卯酉四時消長與起居養生',
    contentRich:
      '子時一陽生，午時一陰生，卯時日出之門，酉時日入之門。子時安眠培補腎水，午時微憩養護心神，卯時晨起舒展肝木，酉時歛斂靜養肺金。將命盤喜用五行化為日常飲食、睡眠、運動之習慣，乃最高層次之改運造化法。',
    tags: JSON.stringify(['四正時脈', '起居養生', '子午卯酉', '五行修身', '生活規劃']),
  },

  // ────────────────── 百歲流年人生推演 (LIFE_SIMULATOR) ──────────────────
  {
    moduleType: 'LIFE_SIMULATOR',
    keyCode: 'LIFE_SIMULATOR_ODYSSEY_REALISM',
    category: 'LIFETIME_ODYSSEY',
    title: '0-100 歲百歲流年八字節奏：十年大運轉折與人生四重境界',
    contentRich:
      '百歲人生推演依據子平八字十年大運交脫之客觀節奏：0-25 歲為幼少啟蒙期，重在印星生身與家庭奠基；26-50 歲為青壯立業期，財官相照，乘風破浪；51-75 歲為成熟持重期，食傷化境，回饋傳承；76-100 歲為澄心頤養期，萬緣放下，蓋棺論定。以果決行，走好每一步流年。',
    tags: JSON.stringify(['百歲流年', '人生推演', '大運轉折', '人生節奏', '八字演算法']),
  },
  {
    moduleType: 'LIFE_SIMULATOR',
    keyCode: 'LIFE_SIMULATOR_ERA_SYNCHRONICITY',
    category: 'LIFETIME_ODYSSEY',
    title: '時代風貌與命運交織：以歷史大潮為背景的人事抉擇',
    contentRich:
      '無人能脫離所處之歷史時代而獨立存在。清末割台、日治現代化、二戰烽火、光復初期、十大建設、科技島崛起、乃至未來元宇宙 AI 時代，時代洪流為大太極，個人八字為小太極。知時位者，能在動盪中保全性命，在騰飛中抓住機遇。',
    tags: JSON.stringify(['時代歷史', '共時性', '歷史大事件', '人生抉擇', '命運大局']),
  },

  // ────────────────── 子平八字真諦 (BAZI) ──────────────────
  {
    moduleType: 'BAZI',
    keyCode: 'BAZI_MASTER_DITIAN_PURE_ESSENCE',
    category: 'CLASSIC_BAZI',
    title: '《滴天髓》精微論：五氣流通與格神純粹 (Di Tian Sui Pure Essence)',
    contentRich:
      '《滴天髓》云：「五氣不戾，性情中和；濁亂偏枯，性情乖逆。」看命以五行生剋制化為樞紐，重在「流通」二字。旺者洩之，弱者生之，寒者暖之，燥者潤之。天干專論氣勢，地支專論根基。八字清純有力者，即便逢逆運亦能自保；混雜濁亂者，吉運亦難久長。',
    tags: JSON.stringify(['滴天髓', '子平八字', '五行流通', '用神純粹', '日主旺衰']),
  },
  {
    moduleType: 'BAZI',
    keyCode: 'BAZI_ZIPING_TRUE_EXPLANATION',
    category: 'CLASSIC_BAZI',
    title: '《子平真詮》格局用神論：順用逆用與成格破格',
    contentRich:
      '徐樂吾評《子平真詮》曰：「八字用神，專求月令。」四吉神（正官、正財、正印、食神）宜順用以生之護之；四凶神（七殺、傷官、劫財、梟神）宜逆用以制之化之。格局之成敗在於配合得宜，傷官傷盡最為奇，殺印相生功名顯。知格局則明事業高低。',
    tags: JSON.stringify(['子平真詮', '八字格局', '月令用神', '四吉四凶', '事業推斷']),
  },

  // ────────────────── 周易六爻決策思維 (ICHING) ──────────────────
  {
    moduleType: 'ICHING',
    keyCode: 'ICHING_STRATEGY_TIME_POSITION',
    category: 'HEXAGRAM_STRATEGY',
    title: '周易時位中正心法：變動不居，唯變所適，極深而研幾',
    contentRich:
      '《易·繫辭》曰：「極深以研幾，通天下之志，成天下之亹亹者，莫大乎蓍龜。」六爻占筮以本卦為現狀，動爻為變數樞紐，變卦為歸宿，互卦為內情隱憂。君子觀象玩占，居則觀其象而玩其辭，動則觀其變而玩其占。時當進則雷厲風行，時當退則韜光養晦。',
    tags: JSON.stringify(['周易', '六爻占筮', '時位中正', '動爻樞紐', '決策戰略']),
  },

  // ────────────────── 姓名學三才五格與八十一數理 (NAME) ──────────────────
  {
    moduleType: 'NAME',
    keyCode: 'NAME_EIGHTY_ONE_STROKE_LORE',
    category: 'NAMING_LORE',
    title: '康熙字典八十一數理靈動：五格相生與補偏救弊',
    contentRich:
      '姓名學以繁體康熙筆畫為正宗基石，分天格、人格、地格、外格、總格。人格為命運軸心，地格掌前運家庭，總格主晚運歸宿。數理分吉凶靈動，然更重三才（天人地）相生有情，五行補足先天八字之所缺。名正言順，聲振氣發，字義音韻俱美方成佳名。',
    tags: JSON.stringify(['姓名學', '康熙字典', '八十一數理', '三才五格', '五行補缺']),
  },
];
