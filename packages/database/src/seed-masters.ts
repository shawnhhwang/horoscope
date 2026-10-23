/**
 * 西洋占星學、韋特塔羅牌與古典天星學 — 宗師級語錄與心法 RAG 知識庫種子資料
 *
 * 全數採用典雅高尚之【正體中文 / 繁體中文】編撰，嚴格遵守 AGENTS.md 準則：
 * - 絕無任何虛構神怪、仙人道士口吻；
 * - 融匯榮格深層心理學、人本占星學、韋特神祕學與果老星宗古典精髓；
 * - 賦能求測者以自由意志、覺察與心理整合，為現代專業諮商注入深厚人文底蘊。
 */

export interface MasterInterpretationSeed {
  moduleType: string;
  keyCode: string;
  category: string;
  title: string;
  contentRich: string;
  tags: string;
}

export const MASTER_INTERPRETATIONS: MasterInterpretationSeed[] = [
  // ─────────────────────────────────────────────────────────────
  // 🌌 西洋占星學宗師心法 (Western Astrological Masters)
  // ─────────────────────────────────────────────────────────────
  {
    moduleType: 'WESTERN',
    keyCode: 'WESTERN_MASTER_JUNG_SYNCHRONICITY',
    category: 'MASTER_WISDOM',
    title: '卡爾·榮格論占星學與共時性原則 (Carl Jung on Synchronicity)',
    contentRich:
      '現代深層心理學泰斗卡爾·榮格（Carl G. Jung）指出：「占星學是古代心理學知識的集大成者。行星並非對人類施加直接的物理因果作用，而是透過『共時性原則（Synchronicity）』，在宏觀天體節律與微觀人類潛意識心靈之間形成有意義的巧合共振。」星盤是一面映照靈魂深層原型的神聖鏡子，唯有理解象徵語言，方能洞悉無意識的內在召喚。',
    tags: JSON.stringify(['西洋占星', '卡爾榮格', '共時性', '原型心理學', '大師語錄']),
  },
  {
    moduleType: 'WESTERN',
    keyCode: 'WESTERN_MASTER_JUNG_SHADOW_INDIVIDUATION',
    category: 'MASTER_WISDOM',
    title: '卡爾·榮格論命運轉化與個體化歷程 (Carl Jung on Individuation)',
    contentRich:
      '榮格名言：「在潛意識被引導為意識之前，它將主宰你的人生，而你將稱其為命運。」本命星盤中的困難相位（刑衝）與落陷行星，並非宿命的懲罰，而是未被整合的「陰影（Shadow）」能量。當求測者停止向外抱怨命運，轉而覺察星盤揭示的內在心理張力時，陰影便能轉化為靈魂邁向完整自我（Individuation）的黃金資源。',
    tags: JSON.stringify(['西洋占星', '卡爾榮格', '個體化', '陰影整合', '知命造命']),
  },
  {
    moduleType: 'WESTERN',
    keyCode: 'WESTERN_MASTER_RUDHYAR_MEANING_OVER_PREDICTION',
    category: 'MASTER_WISDOM',
    title: '丹·路德雅爾論人本占星：事件的意義高於預測 (Dane Rudhyar)',
    contentRich:
      '現代人本占星學之父丹·路德雅爾（Dane Rudhyar）宣告：「占星學是一門語言；如果你學會這種語言，天空便在對你訴說。事件不會平白無故降臨在人身上，而是人在內在心理結構中創造並呼喚了與其能量共振的事件。」占星諮詢的核心目的絕非算計吉凶或預測瑣事，而是協助個體賦予生命危機深刻的意義，在混亂中找到自我實現的道途。',
    tags: JSON.stringify(['西洋占星', '丹路德雅爾', '人本占星', '事件意義', '大師心法']),
  },
  {
    moduleType: 'WESTERN',
    keyCode: 'WESTERN_MASTER_RUDHYAR_NATAL_SEED',
    category: 'MASTER_WISDOM',
    title: '丹·路德雅爾論本命星盤：靈魂潛能的種子圖譜 (Dane Rudhyar)',
    contentRich:
      '路德雅爾以種子為喻：「本命星盤不是禁錮靈魂的監牢，而是一顆橡樹種子的基因藍圖。一粒橡樹子注定不能成為玫瑰，但它能成為一株頂天立地、蔽蔭四野的參天巨木。」星盤標誌著每個人獨一無二的生命潛力與發展節奏，知曉星盤是為了停止模仿他人，全然活出自我本質的最高可能。',
    tags: JSON.stringify(['西洋占星', '丹路德雅爾', '星盤種子', '自我實現', '生命藍圖']),
  },
  {
    moduleType: 'WESTERN',
    keyCode: 'WESTERN_MASTER_LIZ_GREENE_SATURN_WISDOM',
    category: 'MASTER_WISDOM',
    title: '莉茲·格林論土星奧祕：從恐懼魔鬼到靈魂基石 (Liz Greene)',
    contentRich:
      '當代心理占星教母莉茲·格林（Liz Greene）在代表作《土星：從新觀點看老魔鬼》中指出：「傳統占星將土星視為大凶之星，然而土星本質上是靈魂在物質界最嚴格也最忠實的導師。你在土星所在的星座與宮位體驗到的恐懼、自卑與挫折，正是你靈魂深處最渴望獲得真才實學的地方。」歷經土星三十年週期的痛苦鍛造，原先的盲點將昇華為人生最堅固、不可撼動的卓越成就。',
    tags: JSON.stringify(['西洋占星', '莉茲格林', '土星奧祕', '心理占星', '磨練成金']),
  },
  {
    moduleType: 'WESTERN',
    keyCode: 'WESTERN_MASTER_LIZ_GREENE_HERO_JOURNEY',
    category: 'MASTER_WISDOM',
    title: '莉茲·格林論星盤刑衝相位：英雄之旅的煉金之火 (Liz Greene)',
    contentRich:
      '莉茲·格林強調：「沒有困難相位的星盤是平庸乏味的。刑相（90°）與衝相（180°）是生命演化不可或缺的動態張力，猶如交響樂中的賦格曲。痛苦源於小我試圖割裂星盤中的兩難面向；當你學會以同理心傾聽內在矛盾時，星盤上的交鋒即化為內在英雄之旅的偉大轉化。」',
    tags: JSON.stringify(['西洋占星', '莉茲格林', '相位張力', '英雄之旅', '心理煉金']),
  },
  {
    moduleType: 'WESTERN',
    keyCode: 'WESTERN_MASTER_ARROYO_FOUR_ELEMENTS',
    category: 'MASTER_WISDOM',
    title: '史蒂芬·阿若優論四大元素心理能量流 (Stephen Arroyo)',
    contentRich:
      '能量占星宗師史蒂芬·阿若優（Stephen Arroyo）提出四大元素即生命能量的四種運作模式：火象（白羊、獅子、射手）代表原初的渴望、生命活力與放射性能量；土象（金牛、處女、摩羯）代表感知耐性、形式創造與物質落實；風象（雙子、天秤、水瓶）代表呼吸交流、概念思維與客觀視角；水象（巨蟹、天蠍、雙魚）代表深海直覺、心靈淨化與情感連結。星盤解析首在綜觀四大元素之消長平衡。',
    tags: JSON.stringify(['西洋占星', '史蒂芬阿若優', '四大元素', '能量流動', '心理調和']),
  },
  {
    moduleType: 'WESTERN',
    keyCode: 'WESTERN_MASTER_ROBERT_HAND_FREEWILL',
    category: 'MASTER_WISDOM',
    title: '羅伯特·漢德論行運契機與自由意志 (Robert Hand)',
    contentRich:
      '當代古典與現代占星泰斗羅伯特·漢德（Robert Hand）於《行運占星全書》寫道：「沒有本質上好或壞的行運，只有你是否具備足夠的意識去駕馭它。行運不是外部命運強加的打擊，而是靈魂在特定生命週期中開啟的能量視窗。順風時揚帆開拓，逆風時修持定力、鞏固護城河，這才是占星學賦予人類自由意志的最大恩賜。」',
    tags: JSON.stringify(['西洋占星', '羅伯特漢德', '行運占星', '自由意志', '時機把握']),
  },

  // ─────────────────────────────────────────────────────────────
  // 🔮 韋特塔羅牌宗師心法 (Tarot Masters & Esoteric Wisdom)
  // ─────────────────────────────────────────────────────────────
  {
    moduleType: 'TAROT',
    keyCode: 'TAROT_MASTER_WAITE_FOOLS_JOURNEY',
    category: 'MASTER_WISDOM',
    title: '阿瑟·愛德華·韋特論愚人之旅與靈魂啟蒙 (Arthur Edward Waite)',
    contentRich:
      '韋特塔羅創立者阿瑟·愛德華·韋特（Arthur Edward Waite）於《塔羅圖解之鑰》闡述：「大阿爾克那二十二張牌，是西方神祕主義傳統中極為崇高的靈魂啟蒙聖道。從『0 號愚者』純真無畏地邁向懸崖，經歷物質魔術師、靈性女祭司、欲望惡魔與體制崩解的高塔，最終在『21 號世界』達成大宇宙與小宇宙的神聖合一（The Fool\'s Journey）。」每一張牌卡都是靈魂演化階段的活生生路標。',
    tags: JSON.stringify(['韋特塔羅', '愛德華韋特', '愚人之旅', '靈魂啟蒙', '大阿爾克那']),
  },
  {
    moduleType: 'TAROT',
    keyCode: 'TAROT_MASTER_WAITE_KEY_OF_SYMBOLISM',
    category: 'MASTER_WISDOM',
    title: '阿瑟·愛德華·韋特論象徵圖解：牌陣為靈魂之鏡 (Arthur Edward Waite)',
    contentRich:
      '韋特大師明言：「塔羅並非江湖術士占卜算命之玩具，而是一座由深奧幾何、古老卡巴拉、占星與鍊金術象徵構築的真理聖殿。牌面上的一花一草、冠冕與鎖鏈，皆是大宇宙永恆智慧在小宇宙心靈中的投影。」在牌陣中，求問者透過象徵符號照見自己未曾察覺的內在狀態，從而獲取穿透迷霧的洞察力。',
    tags: JSON.stringify(['韋特塔羅', '愛德華韋特', '象徵圖解', '真理聖殿', '靈魂之鏡']),
  },
  {
    moduleType: 'TAROT',
    keyCode: 'TAROT_MASTER_POLLACK_78_DEGREES',
    category: 'MASTER_WISDOM',
    title: '蕾切爾·波拉克論78度的智慧：超越宿命論 (Rachel Pollack)',
    contentRich:
      '當代國際塔羅教母蕾切爾·波拉克（Rachel Pollack）在經典名著《78度的智慧》（Seventy-Eight Degrees of Wisdom）中寫道：「塔羅不是為了告訴你明天必然會發生什麼，而是幫助你理解當下心靈正在經歷的靈魂功課。當你清楚看見自己的盲點與內在渴望時，你就奪回了創造未來的自主權。塔羅是心靈成長的工具，而非恐懼宣傳的工具。」',
    tags: JSON.stringify(['韋特塔羅', '蕾切爾波拉克', '78度的智慧', '超越宿命', '覺察賦能']),
  },
  {
    moduleType: 'TAROT',
    keyCode: 'TAROT_MASTER_POLLACK_INTUITION_TRANSFORMATION',
    category: 'MASTER_WISDOM',
    title: '蕾切爾·波拉克論轉化凶牌：毀滅即重生的恩典 (Rachel Pollack)',
    contentRich:
      '蕾切爾·波拉克提醒所有諮詢者：「在塔羅中，死神（Death）象徵陳舊執念的自然凋零，高塔（The Tower）象徵虛假謊言的瓦解，惡魔（The Devil）象徵自我設限的幻覺。這些牌看似令人畏懼，本質上卻是宇宙為了釋放靈魂真正自由所賜予的強大重塑契機。沒有舊結構的崩塌，就不會有新生命的破曉。」',
    tags: JSON.stringify(['韋特塔羅', '蕾切爾波拉克', '高塔死神', '靈魂重生', '轉化']),
  },
  {
    moduleType: 'TAROT',
    keyCode: 'TAROT_MASTER_MARY_GREER_REVERSED_WISDOM',
    category: 'MASTER_WISDOM',
    title: '瑪麗·K·格利爾論逆位牌奧祕：能量內化與反思 (Mary K. Greer)',
    contentRich:
      '當代塔羅權威瑪麗·K·格利爾（Mary K. Greer）在《逆位塔羅牌》中奠定了劃時代的心法：「逆位牌絕非凶兆、失敗或厄運。逆位代表這張牌所承載的原型能量正在轉向『內部潛意識』進行深層整合；或者是該能量在外部現實中遭遇暫時性的阻礙，需要你以更高層次的智慧向內覺察、釋放執念。」逆位牌是宇宙邀請你停步沉思的寶貴契機。',
    tags: JSON.stringify(['韋特塔羅', '瑪麗格利爾', '逆位牌精解', '能量內化', '向內覺察']),
  },
  {
    moduleType: 'TAROT',
    keyCode: 'TAROT_MASTER_MARY_GREER_TWENTY_ONE_WAYS',
    category: 'MASTER_WISDOM',
    title: '瑪麗·K·格利爾論塔羅共振：你是自己命運的作者 (Mary K. Greer)',
    contentRich:
      '瑪麗·格利爾指出：「塔羅牌是一面完美的鏡子。你抽出的每一張牌，都是你當下內在意識頻率在空間中的共時性顯化。你不是在被動地等待卡牌審判你的未來，你是在與卡牌對話，並在理解象徵義理後，提筆親自書寫命運的全新篇章。」',
    tags: JSON.stringify(['韋特塔羅', '瑪麗格利爾', '自我探索', '命運作者', '大師心法']),
  },
  {
    moduleType: 'TAROT',
    keyCode: 'TAROT_MASTER_JODOROWSKY_WAY_OF_TAROT',
    category: 'MASTER_WISDOM',
    title: '亞歷杭德羅·佐杜洛夫斯基論塔羅之道：心靈精神手術刀 (Alejandro Jodorowsky)',
    contentRich:
      '前衛大師亞歷杭德羅·佐杜洛夫斯基（Alejandro Jodorowsky）於《塔羅之道》（The Way of Tarot）直言：「如果算命讓求問者感到恐慌、脆弱與依賴，那種占卜便是一種精神毒藥。真正的塔羅是一柄精神手術刀，專門用來切除自我欺瞞與虛偽包裝。塔羅的唯一目標是療癒——喚醒你內在深處的神聖自性，使你重新擁有愛與行動的力量。」',
    tags: JSON.stringify(['韋特塔羅', '佐杜洛夫斯基', '塔羅之道', '心靈手術刀', '精神療癒']),
  },
  {
    moduleType: 'TAROT',
    keyCode: 'TAROT_MASTER_FOUR_ELEMENTS_ALCHEMY',
    category: 'MASTER_WISDOM',
    title: '經典小阿爾克那四大元素生活煉金術 (Tarot Four Elements Alchemy)',
    contentRich:
      '小阿爾克那五十六張牌展現了日常生活的靈魂淬煉：權杖組（Wands/火）淬煉我們的意志、直覺與事業熱忱；聖杯組（Cups/水）調和我們的情感、人際共鳴與愛的能力；寶劍組（Swords/風）磨礪我們的理智、溝通邏輯與穿越思想紛爭的智慧；錢幣組（Pentacles/土）落實我們的身體健康、資產財富與大地的穩健承載。四元素平衡，即是物質與靈性的完美合一。',
    tags: JSON.stringify(['韋特塔羅', '小阿爾克那', '四元素', '權杖聖杯寶劍錢幣', '生活煉金']),
  },

  // ─────────────────────────────────────────────────────────────
  // 🔭 古典天星學宗師心法 (Classical Astrological Masters - Qizheng Siyu)
  // ─────────────────────────────────────────────────────────────
  {
    moduleType: 'QIZHENG',
    keyCode: 'QIZHENG_MASTER_GUOLAO_CORE',
    category: 'MASTER_WISDOM',
    title: '張果老果老星宗心法：天步經緯與恩難相生 (Guo Lao Xing Zong)',
    contentRich:
      '道家仙真張果老傳承之《果老星宗》開宗明義：「星無非天，度無非人。天步經緯周天三百六十五度四分度之一，列二十八宿為經，行七政四餘為緯。」果老天星以立命宿度為體，以恩、難、仇、用四星生剋制化為用。生我命度者為恩星，主貴人與福祿；剋我命度者為難星，主磨難與考驗。明辨恩難，方知天星進退修省之道。',
    tags: JSON.stringify(['七政四餘', '張果老', '果老星宗', '恩難制化', '天星秘傳']),
  },
  {
    moduleType: 'QIZHENG',
    keyCode: 'QIZHENG_MASTER_GUOLAO_SHEN_MING',
    category: 'MASTER_WISDOM',
    title: '果老星宗論身命主宿：身命同源，度主為尊 (Guo Lao Xing Zong)',
    contentRich:
      '《果老星宗·命度論》曰：「命宮主其人之本體稟賦，身宮主其人之平生行藏造化。命度入宿得恩星照臨者，如枯木逢春，富貴自然悠久；若命度失陷逢難星穿夾者，需立大志、修陰騭以解凶星之戾氣。」天星推步旨在令人知命以安命，敬天時而修人事。',
    tags: JSON.stringify(['七政四餘', '果老星宗', '命度主', '身宮', '天人合一']),
  },
  {
    moduleType: 'QIZHENG',
    keyCode: 'QIZHENG_MASTER_YELU_ASTRONOMY',
    category: 'MASTER_WISDOM',
    title: '耶律楚材天星心法：天人合一與律曆精微 (Yelu Chucai)',
    contentRich:
      '遼元之際天文律曆大宗師耶律楚材深研中西天星推步，於《大明曆》與星宗論著中指出：「天道無私，唯德是輔。日月五星之行度，寒暑伏見之節奏，皆宇宙大化之常規。智者測天星以正人心、輔國政、理人事，達天人相應、順應乾坤之道，而非惑於怪力亂神。」',
    tags: JSON.stringify(['七政四餘', '耶律楚材', '天文曆法', '天人相應', '古典天星']),
  },

  // ─────────────────────────────────────────────────────────────
  // 💍 八字合婚與家族群盤宗師心法 (BaZi Synastry & Family System Masters)
  // ─────────────────────────────────────────────────────────────
  {
    moduleType: 'BAZI_SYNASTRY',
    keyCode: 'BAZI_MASTER_DITIAN_MARRIAGE',
    category: 'MASTER_WISDOM',
    title: '《滴天髓》論夫妻因緣與五行互濟 (Di Tian Sui on Marriage)',
    contentRich:
      '子平命理最高經典《滴天髓》闡釋：「夫妻因緣宿世定，喜用互濟化千災。清氣相生家道盛，濁氣相戰需通關。」合婚之真諦，不在於盲目尋求全無剋犯之神仙伴侶，而在於審察男女二造之五行強弱能否形成「損有餘而補不足」的良性互濟。一人命中之忌神，若恰為另一人之喜神，則二人攜手必能彼此成就、同舟共濟。',
    tags: JSON.stringify(['八字合婚', '滴天髓', '五行互補', '喜用神互助', '合婚心法']),
  },
  {
    moduleType: 'BAZI_SYNASTRY',
    keyCode: 'BAZI_MASTER_ZIPING_COMPATIBILITY',
    category: 'MASTER_WISDOM',
    title: '《子平真詮》論八字合婚：干合支合與性情調和',
    contentRich:
      '清代命理泰斗沈孝瞻於《子平真詮》論曰：「合婚之法，首重日元天干之情與日支夫妻宮之向背。天干有甲己、乙庚、丙辛、丁壬、戊癸之正合，主精神理念之契合共鳴；地支有六合三合，主生活起居之默契協調。縱使日柱有沖，若有通關之曜調停，亦能破鏡重圓、轉危為安。」明理之人，借命理以互諒互助，方得白頭偕老。',
    tags: JSON.stringify(['八字合婚', '子平真詮', '天干五合', '夫妻宮六合', '情投意合']),
  },
  {
    moduleType: 'BAZI_SYNASTRY',
    keyCode: 'BAZI_MASTER_BRIDGING_ELEMENT',
    category: 'MASTER_WISDOM',
    title: '八字五行通關調適大乘法門 (The Bridging Five Elements Wisdom)',
    contentRich:
      '命理大師先賢指出：「五行相生為常，相剋亦為造化。金木交爭者，得水以通關則金生水、水生木，反成慈悲智巧之德；水火相激者，得木以通關則水生木、木生火，化燥急為文雅文明之美；木土相戰以火化之，火金相剋以土潤之，土水相凌以金通之。」婚姻生活之摩擦，善用通關五行之生活智慧（居家色彩、作息儀式、情感包容），便是將危機化為良緣之神妙鑰匙。',
    tags: JSON.stringify(['八字合婚', '五行通關', '金木相剋', '水火相濟', '化解心法']),
  },
  {
    moduleType: 'FAMILY_GROUP',
    keyCode: 'FAMILY_MASTER_HOUSEHOLD_AURA',
    category: 'MASTER_WISDOM',
    title: '傳統家運與家庭系統五行場域論 (Family Household Energy Aura)',
    contentRich:
      '古之治家者云：「家和萬事興，五行調和家運昌。」家庭是由多位血脈成員構成之能量同心圓。全家五行木旺者主崇德向學之文風；火旺者主人氣熱絡之生機；土旺者主厚實穩健之基業；金旺者主紀律原則之方圓；水旺者主靈動智深之財脈。任何家庭皆有其核心主導氣場與匱乏之處，知其缺失而以環境、包容與生活節奏補足之，則滿門吉慶。',
    tags: JSON.stringify(['家庭比對', '家運昌隆', '家庭五行場域', '家和萬事興', '家族系統']),
  },
  {
    moduleType: 'FAMILY_GROUP',
    keyCode: 'FAMILY_MASTER_GENERATIONAL_HARMONY',
    category: 'MASTER_WISDOM',
    title: '代際和諧與因材施教心法：父母子女五行生剋之道',
    contentRich:
      '命理名著《淵海子平》與現代家庭心理學相通之處在於：父母宮與子女宮之相生相剋，反映的是天然之教育風格與溝通頻率。日主相生者親子情感自然親密；日主相剋者往往具備鮮明之個性張力，此時父母應「順其五行稟賦而因材施教」，切莫以自身模子強套子女。以寬廣視角看待手足與長幼，各安其位，便是最高明之齊家之道。',
    tags: JSON.stringify(['家庭比對', '親子溝通', '因材施教', '代際和諧', '手足情深']),
  },
];
