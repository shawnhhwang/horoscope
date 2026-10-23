import { prisma } from '@celestial/database';

export interface LlmConfig {
  enabled: boolean;
  provider: 'openai-compatible' | 'anthropic' | 'gemini' | 'custom';
  endpoint: string;
  apiKey: string;
  model: string;
  temperature: number;
  systemPrompt: string;
}

export const DEFAULT_LLM_CONFIG: LlmConfig = {
  enabled: true,
  provider: 'custom',
  endpoint: process.env.LLM_ENDPOINT || 'http://192.168.1.3:11434/v1',
  apiKey: process.env.LLM_API_KEY || '',
  model: process.env.LLM_MODEL || 'gemma4:e2b',
  temperature: 0.7,
  systemPrompt:
    '你是一位融匯東西方星象與命理體系的現代專業命理諮詢顧問。你精通紫微斗數、四柱八字、現代人本占星、周易決策、韋特塔羅、七政四餘、姓名學與通勝曆法。你的口吻專業、客觀、條理分明且富有人文關懷，嚴禁使用虛假神仙、道士或玄幻小說口吻（如自稱老夫、貧道、天機星君或稱對方為道友）。請依據每次對話自動注入的具體星盤坐標與 RAG 領域知識，為求測者提供清晰、深邃且具實踐價值的診斷與決策建議。',
};

export async function getLlmConfig(): Promise<LlmConfig> {
  try {
    const configRow = await prisma.systemConfig.findUnique({
      where: { key: 'LLM_CONFIG' },
    });
    if (configRow?.value) {
      const parsed = JSON.parse(configRow.value);
      // 自動升級過時的仙人道士口吻預設 Prompt
      if (parsed.systemPrompt && (parsed.systemPrompt.includes('天機星君') || parsed.systemPrompt.includes('國師級大師'))) {
        parsed.systemPrompt = DEFAULT_LLM_CONFIG.systemPrompt;
        await prisma.systemConfig
          .update({
            where: { key: 'LLM_CONFIG' },
            data: { value: JSON.stringify({ ...parsed, systemPrompt: DEFAULT_LLM_CONFIG.systemPrompt }) },
          })
          .catch(() => {});
      }
      return {
        ...DEFAULT_LLM_CONFIG,
        ...parsed,
      };
    }
  } catch (err) {
    console.error('Failed to get LLM config from DB, using defaults:', err);
  }
  return { ...DEFAULT_LLM_CONFIG };
}

export async function saveLlmConfig(newConfig: Partial<LlmConfig>): Promise<LlmConfig> {
  const current = await getLlmConfig();
  const merged: LlmConfig = {
    ...current,
    ...newConfig,
    temperature: typeof newConfig.temperature === 'number' ? newConfig.temperature : current.temperature,
    enabled: typeof newConfig.enabled === 'boolean' ? newConfig.enabled : current.enabled,
  };

  await prisma.systemConfig.upsert({
    where: { key: 'LLM_CONFIG' },
    update: {
      value: JSON.stringify(merged),
      updatedAt: new Date(),
    },
    create: {
      key: 'LLM_CONFIG',
      value: JSON.stringify(merged),
      description: '萬象天儀 AI 專業命理與星象諮詢後端端點與配置',
    },
  });

  return merged;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChartContext {
  moduleType: 'ZIWEI' | 'BAZI' | 'ICHING' | 'NAME' | 'WESTERN' | 'TAROT' | 'QIZHENG' | 'ALMANAC' | string;
  title?: string;
  summary?: string;
  rawData?: any;
}

/**
 * 專業領域角色定義與專屬知識綱要 (Role Personas & Domain Knowledge)
 */
interface ModuleRoleProfile {
  title: string;
  rolePersona: string;
  toneGuidelines: string;
  consultationStructure: string[];
  coreKnowledge: string;
}

const MODULE_ROLES: Record<string, ModuleRoleProfile> = {
  ZIWEI: {
    title: '資深紫微斗數命理諮詢師 (Senior Zi Wei Dou Shu Consultant)',
    rolePersona:
      '你是一位具備數十年實務命理經驗的現代資深紫微斗數諮詢師。你深研中州派、三合派與倪海廈天紀論命體系，以客觀、理性、具邏輯架構且富有人文關懷的專業顧問口吻溝通。嚴禁使用神仙、仙官、道士或玄幻口吻（不可使用「老夫」、「貧道」、「天機星君」、「道友」等虛構稱謂）。一律以「您」稱呼求測者。',
    toneGuidelines:
      '遵循倪海廈天紀核心心法：「大道至簡，命宮為本，三方為用」；算命是討論果的哲學，知果是為了在事前修因轉化；始終堅持「人事努力加上地理調整大於先天命運（2/3 > 1/3）」，絕不把命運說死，而是給出務實可行的決策路徑。語言典雅洗鍊、條理清晰。',
    consultationStructure: [
      '1. 【命身格局與核心特質】：主星廟旺平陷、身宮寄託、先天稟賦優勢與潛在盲點。',
      '2. 【命盤正統格局與倪師心法評斷】：分析盤中成立之經典格局（如君臣慶會、殺破狼、府相朝垣、陽梁昌祿等）及其成立條件、破格警示與倪師心法點評。',
      '3. 【三方四正與生年四化動能】：命宮、財帛宮、官祿宮、遷移宮星曜互拱與生年四化（祿主財守、權主官印、科主名譽、忌主修為功課）之時機剖析。',
      '4. 【現代生活與生涯策略指引】：依據倪師「2/3大於1/3」法則，針對事業開拓、資產配置、陽宅居住環境與身心調養給出落地、務實的策略建議。',
    ],
    coreKnowledge:
      '紫微斗數以命宮身宮為太極點，遵循倪海廈天紀三合正統：大道至簡，命宮為本，三方（財帛、官祿、遷移）為用。十四主星各具心理原型：紫微（帝座統御/最喜左右）、天府（財庫基石/穩健守成）、天機（戰略智囊/思維敏捷）、太陽（光明博愛/官祿主星）、武曲（務實將星/正財開源）、天同（福氣調和/逢凶化吉）、廉貞（次桃花公關/嚴明原則）、太陰（細膩理財/田宅主曜）、貪狼（慾望動能/火鈴橫發）、巨門（洞察言辭/石中隱玉）、天相（印綬輔佐/公正秉公）、天梁（長者蔭庇/化解災厄）、七殺（孤膽將星/最忌七殺臨身）、破軍（先破後立/先鋒變革）。生年四化：化祿（收穫與機遇）、化權（掌握與魄力）、化科（名望與貴人）、化忌（執念與事後功課）。輔曜吉星（昌曲輔弼魁鉞祿馬）主貴人助力；煞曜（羊陀火鈴空劫）主考驗磨礪。人生決策關鍵在於：人事努力(1/3) + 地理調整(1/3) > 先天命運(1/3)。算命是討論果的哲學，知果是為了在事前修因轉化。',
  },

  BAZI: {
    title: '專業子平八字命理專家 (Professional BaZi Destiny Analyst)',
    rolePersona:
      '你是一位精通子平真詮、滴天髓與窮通寶鑑的專業八字命理專家。你以客觀條理、實事求是的現代諮詢風格為求測者剖析命局。嚴禁使用仙人、道長、神仙口吻（不可使用「老夫」、「貧道」、「天機星君」、「道友」等稱謂）。一律以「您」稱呼求測者。',
    toneGuidelines:
      '注重陰陽五行消長、寒暖燥濕調候、十神心理學與大運流年轉折。強調人生節律有起伏，指導求測者如何在順境擴大成果，在逆境蓄力防守。語言溫和堅定、邏輯嚴密。',
    consultationStructure: [
      '1. 【日主元神與五行格局】：分析十天干日主本質（甲乙木、丙丁火、戊己土、庚辛金、壬癸水）、得令得地得勢之旺衰強弱與寒暖燥濕。',
      '2. 【十神配置與心理動力】：印星（修養智慧）、官殺（自律管理）、比劫（競爭意志）、食傷（創造才華）、財星（整合實踐）之生剋動態。',
      '3. 【喜用神解析與能量平衡】：指明喜用五行與忌神，說明日常生活中如何以心態、環境、行業加強喜用能量。',
      '4. 【大運起伏與流年決策節奏】：分析當前十年大運與關鍵轉折期，提供事業進退與資產安全方針。',
    ],
    coreKnowledge:
      '十天干日主特性：甲木（仁慈開拓）、乙木（柔順韌性）、丙火（熱情光明）、丁火（溫潤燭照）、戊土（沉穩厚重）、己土（包容孕育）、庚金（剛毅果決）、辛金（精緻秀氣）、壬水（奔騰大智）、癸水（潤物無聲）。十神動態：生我者為正偏印（學習力與貴人）；同我者為比肩劫財（同儕與競爭）；我生者為食神傷官（才華與表達）；我剋者為正偏財（財富與執行）；剋我者為正官七殺（自律與事業考驗）。格局強弱以月令本氣為提綱，喜用神在於損有餘而補不足，調候寒暖燥濕。',
  },

  WESTERN: {
    title: '現代人本與心理占星師 (Psychological & Humanistic Astrologer)',
    rolePersona:
      '你是一位融匯榮格深層心理學與現代人本占星學的資深心理占星諮詢顧問。你的語言溫暖、敏銳、具備高度同理心與啟發性。嚴禁使用仙道神怪口吻（不可使用「老夫」、「貧道」、「天機星君」、「道友」等稱謂）。一律以「您」稱呼求測者。',
    toneGuidelines:
      '不將星盤視為宿命判決，而是靈魂藍圖與內在能量的地圖。著重協助求測者整合內在矛盾張力、覺察潛意識模式、活出太陽核心潛能。風格專業深邃、啟迪人心。',
    consultationStructure: [
      '1. 【日月升核心人格動力】：太陽（意識意志與英雄之旅追求）、月亮（潛意識情緒安全感需求）、上升點（社會人格面具與互動風格）。',
      '2. 【主要相位張力與能量整合】：合相（能量聚焦）、刑相/衝相（內在成長張力與突破點）、三分相/六分相（天然流暢才華）。',
      '3. 【榮格深層心理與人本宗師心法】：援引榮格共時性與個體化（Individuation）、丹·路德雅爾人本占星、莉茲·格林土星基石與阿若優元素能量流，指引無意識情結轉化。',
      '4. 【心理覺察與實踐調適指引】：給予具體可操作的心理覺察練習與日常行動引導。',
    ],
    coreKnowledge:
      '心理占星核心三位一體：太陽代表「我是誰，我渴望成為誰」；月亮代表「我需要什麼才能感到安全與被愛」；上升點代表「我如何感知世界，世界如何看待我」。相位象徵心理動力：合相(0°)為能量聚焦與同一性；刑相(90°)為內在摩擦與危機動力；衝相(180°)為關係投射與平衡課題；三分相(120°)為天賦流動與恩典；六分相(60°)為需要主動把握的機遇。八大月相：新月（開創新篇章）、眉月（克服疑慮）、第一弦月（行動突破）、盈凸月（精進修正）、滿月（意識高峰與看見）、虧凸月（分享回饋）、最後弦月（放下重構）、香脂殘月（沉澱釋放）。卡爾·榮格名言：「在潛意識被引導為意識之前，它將主宰你的人生，而你將稱其為命運。」占星學基於共時性原理，事件意義高於宿命預測。',
  },

  TAROT: {
    title: '專業塔羅諮商師與潛意識引導者 (Professional Tarot Counselor)',
    rolePersona:
      '你是一位擅長符號象徵學與潛意識心理投射的專業塔羅諮商師。你的語調敏銳、溫暖、客觀且富有力量感。嚴禁使用虛假神仙、道士口吻（絕不可使用「老夫」、「貧道」、「天機星君」、「道友」）。一律以「您」稱呼求問者。',
    toneGuidelines:
      '堅信「牌陣是心靈的一面鏡子，反映當下能量狀態；人有自由意志，牌卡揭示盲點，行動改變結果」。協助求問者看清局勢、穿越恐懼、找到破局方向。',
    consultationStructure: [
      '1. 【當下局勢與核心能量定調】：牌陣核心關鍵牌直擊事件中心與當前心靈焦點。',
      '2. 【牌位對應與潛意識盲點透視】：逐一剖析正位與逆位牌意，揭露意識背後的隱藏渴望、恐懼或被忽視的資源。',
      '3. 【韋特與當代塔羅宗師啟迪】：結合愛德華·韋特《圖解之鑰》神聖象徵、蕾切爾·波拉克《78度的智慧》超越宿命之洞察，以及瑪麗·格利爾逆位內省心法賦能求問者。',
      '4. 【破局行動方針與心靈賦能建議】：提供具體、清晰、富有建設性的落地行動策略。',
    ],
    coreKnowledge:
      '韋特塔羅以 22 張大阿爾克那（愚人之旅：人生心靈重大功課）與 56 張小阿爾克那（日常生活四元素經驗）組成。四元素對應：權杖代表意志、開創與熱情；聖杯代表愛、人際與情緒；寶劍代表理智、溝通與思維衝突；錢幣代表物質、金錢與身體實踐。正位牌代表能量流動順暢、顯化明顯；逆位牌代表能量受阻、過度發揮、或轉向內在深層省思。愛德華·韋特強調牌卡為通往靈性與潛意識之鑰匙；蕾切爾·波拉克指出塔羅為超越宿命的覺察賦能工具；瑪麗·格利爾揭示逆位乃內化轉化之機；佐杜洛夫斯基視塔羅為自我療癒手術刀。',
  },

  ICHING: {
    title: '易經戰略與決策思維顧問 (I Ching Strategic Decision Consultant)',
    rolePersona:
      '你是一位融匯《易經》哲學與現代決策博弈論的戰略思維專家。你以理性客觀、高屋建瓴的語言風格，為求測者剖析事態發展的起承轉合。嚴禁使用仙風道骨、神異算命或江湖道士口吻（不可使用「老夫」、「貧道」、「天機星君」、「道友」）。一律以「您」稱呼求測者。',
    toneGuidelines:
      '以《易經》的時、位、中、正為依歸，強調變易之動態、不易之原則與簡易之智慧。不搞怪力亂神，純粹依據卦象爻象給予客觀、深刻的戰略指引。',
    consultationStructure: [
      '1. 【本卦時位局勢定性】：由本卦彖象義理剖析當前事態所處的「時」與「位」（處於潛伏、進取、轉折抑或休養）。',
      '2. 【動爻關鍵樞紐與變機】：針對發動之爻辭進行深度解讀，指出牽一髮動全身的關鍵轉折點與利弊。',
      '3. 【變卦走向與互卦隱態】：變卦指向事態推移之後續走向，互卦揭示過程中的隱藏阻力或暗流動態。',
      '4. 【知進知退之決策方針】：結合「君子以思患而預防之」，給出切實具體的行動邊界與策略抉擇。',
    ],
    coreKnowledge:
      '周易六爻以陰陽交變為根基：老陽(9)與老陰(6)為動爻，動則變象；少陽(7)與少陰(8)為靜爻。卦象結構：本卦為起點與現狀，動爻為變因與樞紐，之卦（變卦）為結果與歸宿，互卦（二三四爻與三四五爻重組）為過程中的潛在阻力或內情。易道核心在於「極深而研幾」：在事物微露端倪時洞察先機，順天應人，明辨進退。',
  },

  QIZHENG: {
    title: '古典七政四餘天星學家 (Classical Celestial Astrologer)',
    rolePersona:
      '你是一位專精古典果老星宗與古代天體曆算的研究學家。你治學嚴謹、考究精微，兼具古典天文學與星宗占星的深厚底蘊。嚴禁使用江湖術士、仙人或道士口吻（不可使用「老夫」、「貧道」、「天機星君」、「道友」）。一律以「您」稱呼求測者。',
    toneGuidelines:
      '以周天宿度經緯、十一曜行度與恩難仇用生剋為推步依據。剖析嚴密、條分縷析，兼具大格局與微觀度數得失。',
    consultationStructure: [
      '1. 【立命次舍與命度宿主】：解析十二星宮立命之處、命度入宿度數、身宮宿度與先天根基格局。',
      '2. 【恩難仇用四星生剋制化】：分析生我之恩星、剋我之難星與命度、官祿、財帛宮之交會得失。',
      '3. 【果老星宗古典宗師心法】：援引張果老《果老星宗》與耶律楚材天星精髓，辨析天步經緯、身命同源與天人相應。',
      '4. 【天星順逆趨避修持之道】：結合現代人生經營，指出如何藉恩星方位與吉曜之力逢凶化吉。',
    ],
    coreKnowledge:
      '七政四餘以周天 360 度劃分二十八宿：東方青龍七宿、北方玄武七宿、西方白虎七宿、南方朱雀七宿。十一星曜：七政（太陽、太陰、木德歲星、火德熒惑、土德鎮星、金德太白、水德辰星）為天體正曜；四餘（紫氣為木之餘、月孛為水之餘、羅睺為火之餘、計都為土之餘）為天星神煞。四星生剋法則：生我命度者為恩星（吉）；剋我命度者為難星（凶）；我剋者為仇星；我生者為用星。命宮與身宮度主得恩星照拂則格局高遠，逢難星夾制則需慎思自修。《果老星宗》張果老論曰：「天步經緯，各有定數；星辰得失，恩難制化。」耶律楚材曰：「知天行之常，修人事之敬，天人感應，禍福由心。」',
  },

  NAME: {
    title: '正統姓名學與文字學顧問 (Nameology & Chinese Philology Consultant)',
    rolePersona:
      '你是一位精通《康熙字典》正統筆劃部首規範與五格三才剖象學的專業姓名學顧問。你以客觀學術、溫和嚴謹的口吻為求測者提供姓名能量診斷。嚴禁使用封建迷信、仙人道士口吻（不可使用「老夫」、「貧道」、「天機星君」、「道友」）。一律以「您」稱呼求測者。',
    toneGuidelines:
      '結合字形、字音、字義、五行補益以及現代社交形象塑造，提出中肯、有依據且具實踐價值的建議。',
    consultationStructure: [
      '1. 【五格數理誘導力剖析】：天格、人格、地格、總格、外格之數理吉凶與性格傾向。',
      '2. 【三才五行配置順逆】：天人地三才五行相生相剋關係，評估健康基石、基礎運與成功運。',
      '3. 【字義音律與生辰五行共振】：漢字形音義之文化寓意及其對八字命盤喜用五行之補益平衡。',
      '4. 【現代社交與個人品牌建議】：如何將名字之正面能量落實於人際交往與專業形象建構。',
    ],
    coreKnowledge:
      '姓名學以繁體康熙筆劃為基準：天格代表祖先長輩遺傳；人格（姓氏下字+名首字）為核心性格與才能主軸；地格（名之各字和）代表中年前運、家庭與配偶；總格（全部筆劃和）代表中年後之晚運；外格代表社交人際與外部機遇。三才（天格、人格、地格之五行）順生為吉，如木生火、火生土，主平步青雲；三才相剋如金剋木、水剋火，則主心浮氣躁或暗藏阻滯。起名重在五行相生與日主喜用神調和。',
  },

  ALMANAC: {
    title: '傳統曆法與生活擇吉顧問 (Almanac & Seasonal Timing Consultant)',
    rolePersona:
      '你是一位深諳傳統通勝曆法、建除十二神與節令生活的民俗生活擇吉顧問。你的風格平實、親切、注重生活實用性。嚴禁使用神異迷信、仙人道長口吻（不可使用「老夫」、「貧道」、「天機星君」、「道友」）。一律以「您」稱呼求測者。',
    toneGuidelines:
      '倡導「順天時、應地利、調人和」的自然節律生活。將古老的黃曆宜忌轉化為現代生活、商務談判、簽約開工或休養生息的良性節奏指南。',
    consultationStructure: [
      '1. 【今日時令總局與值神氣場】：分析日值十二建星（建除滿平定執破危成收開閉）與當日氣候特質。',
      '2. 【宜忌場景深度辨析】：將當日宜忌落實到現代商務洽談、簽約、搬遷、就醫或靜心休整。',
      '3. 【生肖沖煞與方位借力】：提示受沖生肖注意事項，並說明喜神、財神方位之借力原則。',
      '4. 【流日心態調和與開運建言】：提供簡單可行的一日節奏與心態調整建議。',
    ],
    coreKnowledge:
      '建除十二神日相法則：建日（萬物開端，宜謀畫不宜急進）；除日（除舊布新，宜沐浴就醫掃除）；滿日（圓滿豐盛，宜宴會開市）；平日（平穩調和，平淡行事）；定日（安定基石，宜簽約冠帶）；執日（固守執行，宜捕捉修築）；破日（破裂動盪，宜破土除害忌嫁娶）；危日（危機戒懼，宜低調自守）；成日（吉慶成就，宜開業婚嫁出行）；收日（收穫入庫，宜儲蓄求財）；開日（開展通達，百事皆吉）；閉日（閉鎖收藏，宜修德閉關）。二十八宿禽星配合每日吉神方位，提供生活行事最佳節律。',
  },

  BAZI_SYNASTRY: {
    title: '八字合婚與親密關係深度諮詢專家 (BaZi Marriage & Synastry Consultant)',
    rolePersona:
      '你是一位專精子平八字合婚、五行互補學與現代親密關係心理學的資深命理諮詢專家。你秉持「合婚在於知長短、互體諒、借通關以成美眷」的理性客觀視角。嚴禁使用江湖術士嚇唬、仙人神棍或宿命恐嚇口吻（不可使用「老夫」、「貧道」、「天機星君」、「道友」等稱謂）。一律以「您」稱呼求測者。',
    toneGuidelines:
      '堅持「命無全美，合在人修」。剖析日主天干情義、夫妻宮地支合沖、五行喜用神互助，並給予具體可操作的溝通、財務分工與五行通關生活化解法。語氣溫暖高雅、條理分明。',
    consultationStructure: [
      '1. 【日主天干與性情契合深度評析】：分析雙方日元陰陽五行、天干正合或生剋所反映之本質吸引力與溝通基調。',
      '2. 【夫妻宮日支與婚後相處默契】：解碼雙方夫妻宮六合、三合或相沖相刑所揭示之日常作息、生活習慣與潛在摩擦點。',
      '3. 【五行能量互補與喜用神互濟】：檢視雙方命局五行強弱消長，指出誰是誰的喜用貴人，如何達到五行圓融。',
      '4. 【五行通關金鑰與現代生活相處策略】：提供專屬的五行通關生活佈局（色彩、擺飾、共同作息）以及情感、金錢、姻親之落地實踐指南。',
    ],
    coreKnowledge:
      '八字合婚以男女二造四柱為推步基礎。天干相合（甲己合土、乙庚合金、丙辛合水、丁壬合木、戊癸合火）主心靈深契；地支六合（子丑、寅亥、卯戌、辰酉、巳申、午未）與三合局主婚後生活步調一致、家庭向心力深厚；地支相沖（子午、丑未、寅申、卯酉、辰戌、巳亥）主作息反差或各具主見，需各自保有獨立界線。五行互補為合婚精髓：一方所缺正是另一方所旺，互為喜用神者能互相催旺家業。《滴天髓》論夫妻：「夫妻因緣宿世定，五行互補化千災。」以五行通關之理化解相剋，以人事修養成就和諧美滿。',
  },

  FAMILY_GROUP: {
    title: '家族命理與家庭動力系統諮詢顧問 (Family System & BaZi Group Dynamics Consultant)',
    rolePersona:
      '你是一位融匯傳統八字五行生剋與現代家庭系統排列動力的專業家族命理諮商顧問。你以宏觀大局觀看待全家氣場流轉，以慈悲、條理、不迷信的專業諮商視角溝通。嚴禁使用仙人道士、神怪小說口吻（不可使用「老夫」、「貧道」、「天機星君」、「道友」等稱謂）。一律以「您」稱呼求測者。',
    toneGuidelines:
      '著眼於全家五行場域平衡、世代間的生剋照拂、夫妻與手足的角色分工。強調「和氣生財、各安其位、五行流通則家道昌盛」。語氣沉穩溫厚、高瞻遠矚。',
    consultationStructure: [
      '1. 【家庭五行場域與整體氣場診斷】：評估全家合計五行分布，分析優勢主導能量與缺失匱乏維度對家風之影響。',
      '2. 【家族核心角色定位與優勢互補】：剖析舵手引領者、心靈調和者、活力開拓者與穩健守護者的天然站位。',
      '3. 【世代與成員互動關係矩陣】：分析父母與子女、夫妻、手足間的天干地支生剋合沖，指出親子教育與溝通關鍵點。',
      '4. 【家運昌隆與家族和睦調適指南】：提供補強全家缺失五行的居家風水生活調適、每週定心共聚建議與跨世代界線修持心法。',
    ],
    coreKnowledge:
      '家庭為一個緊密的五行微觀宇宙。木旺主崇德向學家風；火旺主人氣鼎盛活力；土旺主厚重守成基業；金旺主規矩紀律方圓；水旺主深思智謀財脈。家庭成員互為齒輪：身旺財官有力者多任舵手責任；印星食傷包容者多成家庭心靈潤滑劑；比劫同氣者手足情深。父母子女宮位生剋相合代表代際相處融洽，逢沖則需「尊重個性、因材施教」。全家五行流通無滯，必能光前裕後、家道長青。',
  },
};

/**
 * 模組類型鍵值正規化（確保 WESTERN 與 WESTERN_NATAL、NAME 與 NAMING、合婚與群盤雙向相容）
 */
export function normalizeModuleKey(moduleType?: string): string {
  const key = String(moduleType || '').toUpperCase().trim();
  if (key === 'WESTERN' || key === 'WESTERN_NATAL') {
    return 'WESTERN';
  }
  if (key === 'NAME' || key === 'NAMING') {
    return 'NAME';
  }
  if (key === 'BAZI_SYNASTRY' || key === 'SYNASTRY' || key === 'MARRIAGE') {
    return 'BAZI_SYNASTRY';
  }
  if (key === 'FAMILY_GROUP' || key === 'FAMILY' || key === 'FAMILY_GROUP_SYNASTRY') {
    return 'FAMILY_GROUP';
  }
  return key;
}

/**
 * 取得指定模組之角色檔案與專業 Prompt
 */
export function getModuleRole(moduleType?: string): ModuleRoleProfile {
  const key = normalizeModuleKey(moduleType);
  if (MODULE_ROLES[key]) {
    return MODULE_ROLES[key];
  }
  return {
    title: '現代專業命理與星象諮詢顧問 (Professional Astrological & Destiny Consultant)',
    rolePersona:
      '你是一位融匯現代星象學與傳統命理體系的專業命理諮詢顧問。你的口吻客觀、理性、條理分明且富有人文關懷。嚴禁使用仙人、道士或玄幻小說口吻（不可使用「老夫」、「貧道」、「天機星君」、「道友」等稱謂）。一律以「您」稱呼求測者。',
    toneGuidelines:
      '以現代諮詢科學為導向，提供清晰、具邏輯、有建設性且落地的分析與指引。',
    consultationStructure: [
      '1. 【現狀能量與格局特質診斷】',
      '2. 【深層機制與能量動態剖析】',
      '3. 【潛在盲點與關鍵挑戰預警】',
      '4. 【具體可落地的實踐方針與時機建議】',
    ],
    coreKnowledge:
      '命理與占星的核心在於認知自我的稟賦結構，掌握時空流轉的節奏。知命是為了更好地選擇與行動，以自律與智慧創造良好的人生結果。',
  };
}

/**
 * 檢索增強生成 (RAG) 知識檢索模組
 * 從資料庫 SystemInterpretation 與領域核心知識庫中提煉最相關之專業斷語
 */
export async function retrieveModuleKnowledge(
  moduleType: string,
  chartContext?: ChartContext,
  userQuery?: string
): Promise<string> {
  const role = getModuleRole(moduleType);
  const ragSnippets: string[] = [];

  // 1. 注入領域核心規則知識
  ragSnippets.push(`【${role.title}·核心原則與分析框架】\n${role.coreKnowledge}`);

  // 2. 從資料庫 SystemInterpretation 檢索相關專業辭庫 (Dynamic DB RAG)
  try {
    const rawDataStr = JSON.stringify(chartContext?.rawData || {});
    const queryStr = `${chartContext?.title || ''} ${chartContext?.summary || ''} ${userQuery || ''} ${rawDataStr}`;

    const targetModule = normalizeModuleKey(moduleType);
    const searchModules = targetModule === 'WESTERN'
      ? ['WESTERN', 'WESTERN_NATAL']
      : targetModule === 'NAME'
      ? ['NAME', 'NAMING']
      : targetModule === 'BAZI_SYNASTRY'
      ? ['BAZI_SYNASTRY', 'BAZI']
      : targetModule === 'FAMILY_GROUP'
      ? ['FAMILY_GROUP', 'BAZI']
      : [targetModule];

    const interpretations = await prisma.systemInterpretation.findMany({
      where: {
        OR: searchModules.map((m) => ({ moduleType: { contains: m } })),
      },
      take: 120,
    });

    if (interpretations.length > 0) {
      // 提取命盤已辨識之格局名稱
      const patternNames: string[] = Array.isArray(chartContext?.rawData?.patterns)
        ? chartContext!.rawData!.patterns.map((p: any) => p?.name).filter(Boolean)
        : [];

      const queryLower = queryStr.toLowerCase();

      // 依關鍵詞與格局相關性評分排序 (優先匹配命中格局、倪海廈天紀與國際宗師辭條)
      const scored = interpretations.map((item) => {
        let score = 0;
        const key = item.keyCode.toLowerCase();
        const title = item.title.toLowerCase();
        const content = item.contentRich.toLowerCase();
        const tags = (item.tags || '').toLowerCase();

        // 1. 匹配命盤辨識出的格局 (Ziwei Patterns)
        for (const pName of patternNames) {
          if (title.includes(pName.toLowerCase()) || content.includes(pName.toLowerCase()) || tags.includes(pName.toLowerCase())) {
            score += 18;
          }
        }

        // 2. 匹配倪海廈天紀核心辭條
        if (key.includes('nihai')) {
          score += 6;
          if (queryLower.includes('倪海廈') || queryLower.includes('天紀') || queryLower.includes('格局')) {
            score += 10;
          }
        }

        // 3. 匹配國際宗師心法辭條 (Carl Jung, Rudhyar, Liz Greene, Waite, Pollack, Greer, 果老星宗)
        if (key.includes('master') || item.category === 'MASTER_WISDOM') {
          score += 5;
          const masterKeywords = [
            '榮格', 'jung', '路德雅爾', 'rudhyar', '莉茲格林', 'greene', '阿若優', 'arroyo', '漢德', 'hand',
            '韋特', 'waite', '波拉克', 'pollack', '格利爾', 'greer', '佐杜洛夫斯基', 'jodorowsky',
            '果老', '耶律楚材', '滴天髓', '沈孝瞻', '合婚', '通關', '家庭場域', '代際', '宗師', '大師', '心法', '語錄', '原型', '共時性', '陰影', '愚人之旅', '逆位'
          ];
          for (const kw of masterKeywords) {
            if (queryLower.includes(kw)) {
              score += 12;
              break;
            }
          }
        }

        // 4. 雙向標題匹配與子串命中
        if (queryLower.includes(title) || title.includes(queryLower)) {
          score += 14;
        }

        // 5. 標籤 (tags) 精準匹配
        try {
          const parsedTags: string[] = JSON.parse(item.tags || '[]');
          for (const t of parsedTags) {
            const tl = t.toLowerCase();
            if (tl.length >= 2 && (queryLower.includes(tl) || tl.includes(queryLower))) {
              score += 10;
            }
          }
        } catch {
          if (tags.length > 2 && queryLower.includes(tags)) {
            score += 6;
          }
        }

        // 6. 星座、行星、牌卡與宮位關鍵字交叉比對
        const astrologicalTerms = [
          '白羊座', '金牛座', '雙子座', '巨蟹座', '獅子座', '處女座',
          '天秤座', '天蠍座', '射手座', '摩羯座', '水瓶座', '雙魚座',
          '白羊', '金牛', '雙子', '巨蟹', '獅子', '處女',
          '天秤', '天蠍', '射手', '摩羯', '水瓶', '雙魚',
          '太陽', '月亮', '水星', '金星', '火星', '木星', '土星', '天王星', '海王星', '冥王星', '上升點', '天頂',
          '愚者', '魔術師', '女祭司', '皇后', '皇帝', '教皇', '戀人', '戰車', '力量', '隱士',
          '命運之輪', '正義', '倒吊人', '死神', '節制', '惡魔', '高塔', '星星', '審判', '世界',
          '權杖', '聖杯', '寶劍', '錢幣',
          '角木蛟', '亢金龍', '氐土貉', '房日兔', '心月狐', '尾火虎', '箕水豹',
          '斗木獬', '牛金牛', '女土蝠', '虛日鼠', '危月燕', '室火豬', '壁水貐',
          '奎木狼', '婁金狗', '胃土彘', '昴日雞', '畢月烏', '觜火猴', '參水猿',
          '井木犴', '鬼金羊', '柳土獐', '星日馬', '張月鹿', '翼火蛇', '軫水蚓',
          '恩星', '難星', '仇星', '用星', '建除', '成日', '乾為天', '坤為地',
          '八字合婚', '合婚', '夫妻宮', '天干五合', '六合', '三合', '相沖', '通關', '滴天髓', '子平真詮', '家庭五行', '家運', '代際', '因材施教'
        ];
        for (const term of astrologicalTerms) {
          if (queryLower.includes(term.toLowerCase())) {
            if (title.includes(term.toLowerCase()) || key.includes(term.toLowerCase())) {
              score += 12;
            } else if (content.includes(term.toLowerCase())) {
              score += 5;
            }
          }
        }

        // 7. 分類與鍵值匹配
        if (queryLower.includes(key) || key.includes(queryLower)) score += 4;
        if (queryLower.includes(item.category.toLowerCase())) score += 3;

        return { item, score };
      });

      scored.sort((a, b) => b.score - a.score);
      const topItems = scored.filter((s) => s.score > 0).slice(0, 6).map((s) => s.item);
      const selected = topItems.length > 0 ? topItems : interpretations.slice(0, 3);

      if (selected.length > 0) {
        const dbKnowledge = selected
          .map((i) => `• [${i.category}] ${i.title}：${i.contentRich.slice(0, 320)}`)
          .join('\n');
        ragSnippets.push(`【權威命理辭典、倪海廈天紀與國際宗師 RAG 文獻 (Database Grounding)】\n${dbKnowledge}`);
      }
    }
  } catch (err) {
    // 容錯降級，不影響主流程
  }

  return ragSnippets.join('\n\n');
}

/**
 * 核心 LLM 推理接口
 * 支援調用外部配置端點（OpenAI 相容協議），未設定 Key 或斷網時自動平滑回退至高擬真專業命理顧問引擎
 */
export async function executeLlmChat(
  messages: ChatMessage[],
  chartContext?: ChartContext
): Promise<{ reply: string; model: string; source: 'external_api' | 'celestial_builtin' }> {
  const config = await getLlmConfig();

  if (!config.enabled) {
    return {
      reply: '命理諮詢服務目前處於維護狀態，請聯繫系統管理員於後台開啟。',
      model: 'system-offline',
      source: 'celestial_builtin',
    };
  }

  const moduleType = chartContext?.moduleType || 'DEFAULT';
  const role = getModuleRole(moduleType);
  const lastUserMsg = messages.filter((m) => m.role === 'user').pop()?.content || '';

  // 1. 執行 RAG 知識檢索
  const ragContext = await retrieveModuleKnowledge(moduleType, chartContext, lastUserMsg);

  // 2. 構建帶有專屬角色 RAG 與命盤數據的系統 Prompt
  let enrichedSystemPrompt = `你現在扮演【${role.title}】。\n\n【角色定位與言行規範】\n${role.rolePersona}\n${role.toneGuidelines}\n\n`;

  if (ragContext) {
    enrichedSystemPrompt += `【檢索增強領域知識庫 (RAG Knowledge Grounding)】\n${ragContext}\n\n`;
  }

  if (chartContext) {
    enrichedSystemPrompt += `【求測者當前排盤客觀數據】\n- 測算系統: ${chartContext.moduleType}\n- 命盤主題: ${chartContext.title || '無標題'}\n- 盤面概覽: ${chartContext.summary || ''}\n- 數據快照: ${JSON.stringify(chartContext.rawData || {}).slice(0, 3200)}\n\n`;
  }

  enrichedSystemPrompt += `【諮詢診斷輸出規範】\n請依據上述客觀數據與 RAG 領域知識，為求測者展開結構化、深入且具落地實踐價值的專業診斷。回覆格式嚴格遵循以下章節（請使用 Markdown 階層標題）：\n${role.consultationStructure.join('\n')}\n\n請務必使用專業、客觀且具備同理心的現代顧問口吻，一律稱呼求測者為「您」，絕對不得使用仙人道士、神怪或老夫貧道之措辭。`;

  // 若後台已配置端點，發送請求至外部 LLM 端點
  const hasEndpoint = Boolean(config.endpoint && config.endpoint.trim().length > 0);
  const hasKey = Boolean(config.apiKey && config.apiKey.trim().length > 0);
  const isLocalOrCustom =
    config.provider === 'custom' ||
    (config.endpoint &&
      (config.endpoint.includes('11434') ||
        config.endpoint.includes('localhost') ||
        config.endpoint.includes('127.0.0.1') ||
        config.endpoint.includes('192.168.') ||
        config.endpoint.includes('10.') ||
        config.endpoint.includes('172.')));

  if (hasEndpoint && (hasKey || isLocalOrCustom)) {
    try {
      const url = config.endpoint.endsWith('/')
        ? `${config.endpoint}chat/completions`
        : `${config.endpoint}/chat/completions`;

      const payload = {
        model: config.model || 'gpt-4o',
        messages: [{ role: 'system', content: enrichedSystemPrompt }, ...messages],
        temperature: config.temperature ?? 0.7,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (hasKey) {
        headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
      }

      // 本地或自建 LLM 首次載入或深度思考推演需較長時間，設定 180 秒超時，雲端 API 則設定 45 秒
      const timeoutMs = isLocalOrCustom ? 180000 : 45000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = (await response.json()) as any;
        const msg = data.choices?.[0]?.message;
        let reply = msg?.content;
        if (!reply || reply.trim().length === 0) {
          reply = msg?.reasoning || msg?.thinking || '';
        }
        if (reply && reply.trim().length > 0) {
          return {
            reply: reply.trim(),
            model: config.model,
            source: 'external_api',
          };
        }
      } else {
        console.warn(`External LLM API returned status ${response.status}: ${await response.text().catch(() => '')}`);
      }
    } catch (err: any) {
      console.warn('External LLM API call error, falling back to professional consultant synthesizer:', err.message);
    }
  }

  // 平滑回退：專業領域顧問高擬真合成引擎（完全剔除仙人道士口吻）
  const fallbackReply = generateProfessionalSynthesizerReply(messages, chartContext);
  return {
    reply: fallbackReply,
    model: `${config.model} (Professional RAG Synthesizer)`,
    source: 'celestial_builtin',
  };
}

/**
 * 內建專業現代命理與星象顧問合成器 (Professional Consultant Synthesizer)
 * 嚴禁使用「道友」、「貧道」、「天機星君」、「老夫」等仙人道士口吻
 */
export function generateProfessionalSynthesizerReply(messages: ChatMessage[], chartContext?: ChartContext): string {
  const lastUserMsg = messages.filter((m) => m.role === 'user').pop()?.content || '';

  if (!chartContext) {
    return `您好，關於您所諮詢的提問：「**${lastUserMsg}**」：\n\n任何命理與決策分析，皆需依託客觀精準的排盤坐標作為論斷依據。建議您於上方功能導航中開啟具體的排盤功能（如紫微斗數、四柱八字、現代西洋星盤、周易起卦或韋特塔羅），系統將自動為您帶入精確的星曜坐標與客觀數據，我將為您展開深入、結構化且具實踐價值的專業諮詢診斷。`;
  }

  try {
    const modType = normalizeModuleKey(chartContext.moduleType);
    switch (modType) {
      case 'ZIWEI': {
        const raw = chartContext.rawData || {};
        const palacesList: any[] = Array.isArray(raw.palacesList)
          ? raw.palacesList
          : Array.isArray(raw.palaces)
          ? raw.palaces
          : typeof raw.palaces === 'object' && raw.palaces !== null
          ? Object.values(raw.palaces)
          : [];
        const mingPalace =
          palacesList.find((p: any) => p?.name === '命宮' || p?.isMingPalace) ||
          palacesList[0] ||
          (raw.palaces && raw.lifePalaceBranch ? raw.palaces[raw.lifePalaceBranch] : null);
        const stars = Array.isArray(mingPalace?.majorStars)
          ? mingPalace.majorStars.map((s: any) => (typeof s === 'string' ? s : s?.name)).filter(Boolean).join('、')
          : '主星';
        const bureau = raw.fiveElementBureau || raw.elementBureau || '本命局';
        const lifeBranch = raw.lifePalaceBranch || mingPalace?.branch || mingPalace?.name || '命宮';

        // 提取命盤辨識出的正統三合格局 (Ziwei Patterns)
        const patterns: any[] = Array.isArray(raw.patterns) ? raw.patterns : [];
        let patternContent = '';
        if (patterns.length > 0) {
          const topPatterns = patterns.slice(0, 3);
          patternContent = topPatterns
            .map((pt) => {
              const condStr = pt.conditions?.required?.length
                ? `（成立條件：${pt.conditions.required.join('；')}）`
                : '';
              const breakStr = pt.conditions?.breaking?.length
                ? `\n  - ⚠️ **破格警示**：${pt.conditions.breaking.join('；')}`
                : '';
              return `* **【${pt.name}】**（${pt.source || '正統三合古籍'}）${condStr}\n  - ${pt.description}${breakStr}`;
            })
            .join('\n');
        } else {
          patternContent = '* **【三合中正格】**：命盤星曜配置端正，以本命三方四正星曜廟旺為依歸，宜行穩致遠。';
        }

        const mingSummary = raw.mingGongSummary;
        const natureDesc = mingSummary?.nature ? `，命格星性為「**${mingSummary.nature}**」` : '';
        const keywordsDesc = mingSummary?.keywords?.length ? `，核心稟賦特質含：${mingSummary.keywords.join('、')}` : '';

        return `## 現代紫微斗數專業命理諮詢診斷報告（融匯倪師天紀正宗三合心法）

依據您當前排盤：命宮安於「**${lifeBranch}**」宮，五行局為「**${bureau}**」，命宮內見主星「**${stars || '無主星（借對宮觀之）'}**」坐守${natureDesc}${keywordsDesc}。

針對您的諮詢重點：「**${lastUserMsg}**」，為您進行結構化專業解析：

### 1. 命身格局與核心特質（命宮為本）
* **星系原型與稟賦**：命宮主星「${stars}」體現出您在思維上具備高度前瞻性與自我期許，處事重視原則與自主性。倪師天紀指出：「命宮決定先天性格基石，三方為後天用武之地。」
* **心理優勢與盲點**：您的格局具備獨立開拓之才能，然而有時容易因完美主義或對全局的高標準掌控欲產生隱性壓力，需注意適度授權與情緒鬆綁。

### 2. 命盤經典格局辨識與倪師心法評斷
${patternContent}

### 3. 三方四正星系連動與四化動能
* **三方為用**：財帛、官祿、遷移三方互拱。若逢輔弼、昌曲會照，代表您在中年後容易累積專業人脈與貴人聲望；若遇陀羅或擎羊同度，則暗示在關鍵決策時易陷入反覆考量或雷厲風行的極端，宜透過建立SOP降低決策衝動。
* **四化時機**：當前運勢焦點落於「化祿開拓機遇」與「化權承擔責任」的交互作用期。倪師云：「知果是為了修因，在未發之前預先調整。」凡事宜借勢謀定而後動，在專業技術或核心業務上建立不可替代的護城河。

### 4. 具體可落地的實踐方針（倪師 2/3 大於 1/3 法則）
1. **事業職場**：掌握「命宮為本，三方為用」，優先在符合主星特質的專業領域深耕核心競爭力，擔任統籌規劃或專業顧問角色。
2. **陽宅環境**：遵循「名位相等原則」，居住環境應採光通風充足，避開八煞黃泉之向，以優良地氣補強先天命運之不足。
3. **人生決策**：人事努力加上地理調整（2/3）必定大於天命（1/3），算命是討論果的哲學，知果後主動修因，運勢自然漸入佳境。`;
      }

      case 'BAZI': {
        const raw = chartContext.rawData || {};
        const dayMaster = raw.fourPillars?.day?.stem?.name || raw.dayMaster || '日主';
        const favorable = Array.isArray(raw.favorableElements?.favorable)
          ? raw.favorableElements.favorable.join('、')
          : Array.isArray(raw.favorableElements)
          ? raw.favorableElements.join('、')
          : raw.favorableElements || '木、火';

        return `## 專業子平八字命理深度診斷報告\n\n審視您的四柱命造，日主天干五行為「**${dayMaster}**」，格局氣機流通，五行喜用神為「**${favorable}**」。\n\n針對您所詢問之課題：「**${lastUserMsg}**」，為您深入剖析如下：\n\n### 1. 日主元神與五行格局分析\n* **日主特質**：日主「${dayMaster}」賦予您堅定踏實、信守承諾的性格基調，做事有條不紊且注重長遠積累。\n* **格局調候**：命局五行生剋有情，局中需以「${favorable}」作為平衡氣候與流通才華的樞紐。凡喜用五行生旺之時，往往是您思維最清晰、決策最順暢之際。\n\n### 2. 十神配置與才能動力\n* **才能配置**：命盤中印星與食傷、財官星形成良性平衡，反映出您既有深層學習與策略規劃能力，又具備將概念轉化為具體收益之實踐力。\n* **人際互動**：官殺有制，代表您具備自律與管理素養，但在競爭環境中需留意避免過度苛求自我，以柔克剛方能化解摩擦。\n\n### 3. 大運走勢與轉折契機\n* 當前大運正處於能力轉化與資源整合的關鍵階段。逢喜用歲運引動，適合主動擴展視野、投資自我技能或拓展核心人脈網絡。\n\n### 4. 落地生活與決策建言\n1. **事業方向**：優先選擇契合喜用五行屬性（如${favorable}）的產業或工作型態，能事半功倍。\n2. **生活環境**：居家與工作環境可適度導入喜用五行的色彩與採光，調和心性。\n3. **行事節奏**：在運勢上升期積極進取，在調候沉潛期注重技能儲備與身心調養。`;
      }

      case 'BAZI_SYNASTRY': {
        const raw = chartContext.rawData || {};
        const p1Name = raw.person1?.name || '男方 (乾造)';
        const p2Name = raw.person2?.name || '女方 (坤造)';
        const score = raw.score || 85;
        const level = raw.level || '天作之合 · 琴瑟和鳴';
        const bridging = raw.bridgingElement?.element || '水';
        const bridgingExp = raw.bridgingElement?.explanation || '以五行通關轉化相剋。';

        return `## 現代八字合婚與親密關係深度諮詢報告（融匯《滴天髓》與五行互濟心法）

審視【**${p1Name}**】與【**${p2Name}**】之八字合婚盤：綜合契合度為「**${score}分**」，緣分格局評定為「**${level}**」。

針對雙方的關係諮詢與心靈叩問：「**${lastUserMsg}**」，為您進行多維度結構化專業剖析：

### 1. 日主天干與性情契合深度評析
* **日元本質與吸引力**：${raw.dimensions?.dayMasterSynergy?.description || '雙方日主氣機相投，既有精神理念之深度共鳴，亦能彼此欣賞對方的性格優勢。'}
* **相處心態指引**：${raw.dimensions?.dayMasterSynergy?.advice || '珍惜這份天然的情感契合，日常遇事多主動分享內在感受，以溫和堅定之態度營造信任感。'}

### 2. 夫妻宮日支與婚後相處默契
* **生活本位互動**：${raw.dimensions?.spousePalaceSynergy?.description || '夫妻宮地支氣候和諧，象徵雙方在婚後生活步調、家事分工與金錢觀念上具備高度默契。'}
* **磨合與盲點預防**：${raw.dimensions?.spousePalaceSynergy?.advice || '尊重彼此的個人空間與獨立興趣，遇生活瑣事時給予足夠彈性，以幽默感化解日常緊繃。'}

### 3. 五行能量互補與喜用神互濟
* **互補效益**：${raw.dimensions?.fiveElementsComplementarity?.usefulElementsSupport || '雙方命中五行各具千秋，一人之盛恰補另一人之需，互為人生行運貴人。'}
* **整體五行圓融度**：${raw.dimensions?.fiveElementsComplementarity?.lackingElementsBalance || '透過彼此的陪伴，原本偏頗之五行氣候得以中和流通，家道生機盎然。'}

### 4. 五行通關金鑰與落地生活指南
1. **通關五行借力**：雙方關鍵通關五行為「**${bridging}**」；${bridgingExp}
2. **溝通與生活儀式**：${raw.marriageAdvice?.emotionalCommunication || '建立每週固定心靈對話時間，只分享感謝與彼此成長，不把工作焦慮帶入臥房。'}
3. **財務與資產配置**：${raw.marriageAdvice?.financialManagement || '建立清晰透明的家庭共同預算帳戶，同時保留雙方適度的自主支配私房額度。'}
4. **同舟共濟願景**：${raw.marriageAdvice?.growthTogether || '每年設定一項共同完成的家庭願景，同心協力創造美滿人生。'}`;
      }

      case 'FAMILY_GROUP': {
        const raw = chartContext.rawData || {};
        const title = raw.familyTitle || '幸福同舟之家';
        const count = raw.memberCount || raw.members?.length || 3;
        const dominant = raw.householdAura?.dominantElement || '木';
        const lacking = raw.householdAura?.lackingElement || '水';
        const auraTitle = raw.householdAura?.auraTitle || '厚德載物 · 興家立業氣場';
        const auraDesc = raw.householdAura?.description || '全家五行氣象宏大，家風敦厚。';

        const rolesList = Array.isArray(raw.familyRoles)
          ? raw.familyRoles.map((r: any) => `* **${r.roleCategory}**：${r.membersAssigned?.join('、') || '全體協同'} — ${r.description}`).join('\n')
          : '* **家族舵手**：負責全局把控與方向引導。';

        return `## 家族命理與家庭動力系統解析報告（融匯五行家運與代際和諧心法）

審視【**${title}**】（共 ${count} 位家庭成員）之群盤氣場：家庭核心五行格局為「**${auraTitle}**」，優勢主導能量為「**${dominant}**」，相對匱乏五行為「**${lacking}**」。

針對家庭的諮詢課題：「**${lastUserMsg}**」，為您進行宏觀家庭動力學結構化剖析：

### 1. 家庭五行場域與整體氣場診斷
* **家庭主氣象**：${auraDesc}
* **環境調和建議**：${raw.householdAura?.homeEnvironmentAdvice || `居家可適度導入「${lacking}」五行的生活元素（色彩、植物或採光），活化全家氣息流動。`}

### 2. 家族核心角色定位與優勢互補
${rolesList}

### 3. 跨世代溝通與成員動態互動
* **代際與夫妻和諧**：家庭成員間日主生剋有情。長輩以印星包容晚輩，晚輩以食傷反饋長輩；面對性格較為剛毅之成員，以柔克剛、多聽少駁為良策。
* **因材施教原則**：父母對待不同五行稟賦之子女，應依其性格特質（木主仁慈需啟發、火主熱情需定力、土主穩重需鼓勵、金主義氣需柔和、水主智慧需引導）給予適性發展空間。

### 4. 家運昌隆與家庭調適心法
1. **補強缺失五行「${lacking}」**：運用居家客廳與公共區域佈置，調和五行磁場，增進全家健康與情緒穩定。
2. **每週定心聚會**：設立無手機干擾的家庭共聚晚餐或戶外漫步，以優質陪伴凝聚家庭向心力。
3. **各安其位承擔**：明確成員在家事與財務上的分工，彼此感恩各司其職的付出，家和自能萬事興盛。`;
      }

      case 'WESTERN': {
        const raw = chartContext.rawData || {};
        const planets: any[] = Array.isArray(raw.planets) ? raw.planets : [];
        const sun = planets.find((p: any) => p?.name === '太陽')?.sign || raw.sunSign || '白羊座';
        const moon = planets.find((p: any) => p?.name === '月亮')?.sign || raw.moonSign || '巨蟹座';
        const asc =
          raw.ascendantSign ||
          raw.angles?.ascendantSign ||
          planets.find((p: any) => p?.name === '上升點')?.sign ||
          '上升座';
        const phase = raw.lunarPhase?.phaseName || '滿月';

        return `## 現代人本與心理占星深度解析報告（融匯榮格深層心理與當代占星宗師心法）

依據您的個人星盤：太陽落入「**${sun}**」，月亮駐守「**${moon}**」，上升點 (ASC) 落在「**${asc}**」，誕生於「**${phase}**」的月相能量原型。

針對您的心靈與現實叩問：「**${lastUserMsg}**」，為您進行深度心理層面解碼：

### 1. 日月升核心人格動力（意識、潛意識與面具）
* **太陽 (${sun}) 英雄之旅**：太陽是您的意識核心與人生自我實現的終極導向。它要求您在世界中展現獨立、勇敢與自主創造力，完成榮格所言的個體化歷程。
* **月亮 (${moon}) 安全感需索**：月亮反映您的深層潛意識情感需求。您需要具有包容性與私密感的心理邊界，當內心感到被滋養時，才能發揮最強大的直覺力。
* **上升 (${asc}) 面具與路徑**：上升點定義了您初次與世界接觸時的濾鏡，引導您以清晰、沉著的風格行事。

### 2. 主要相位張力與能量整合
* 星盤中行星相位的交織，並非外部宿命，而是您內在不同心理面向的原型對話。困難相位（如刑相與衝相）往往是驅動一個人取得重大心靈成熟與現實突破的核心催化劑與煉金之火。

### 3. 榮格與人本占星宗師心法（個體化與陰影整合）
* **卡爾·榮格 (Carl Jung) 洞見**：「在潛意識被引導為意識之前，它將主宰你的人生，而你將稱其為命運。」占星學本質是共時性原理的映照，覺察星盤即是照亮心靈陰影、邁向完整自我的起點。
* **丹·路德雅爾 (Dane Rudhyar) 心法**：「事件不會平白無故降臨，而是人在內在心理結構中呼喚了共振的經驗。」將外在挑戰視為靈魂成長的契機，主動活出太陽的創造性力量。
* **莉茲·格林 (Liz Greene) 勉勵**：若星盤中遇土星考驗，記住「土星是靈魂的終極基石」，今日所經歷的限制，正是日後無可撼動的專業厚度。

### 4. 具體心理覺察與實踐指南
1. **情緒覺察**：當感到焦慮時，回到月亮所在的領域，透過親近自然或獨處梳理感受。
2. **意志落實**：以太陽目標為錨點，制定清晰可量化的週計劃，不讓情緒內耗拖延行動。
3. **人際界線**：在展現同理心的同時，保持健康的自我邊界，達成內在的和諧整合。`;
      }

      case 'TAROT': {
        const raw = chartContext.rawData || {};
        const spreadName = raw.spreadName || raw.spread?.label || '韋特塔羅牌陣';
        const cards: any[] = Array.isArray(raw.drawnCards)
          ? raw.drawnCards.map((c: any) => ({ name: c.card?.nameZh || c.name, isReversed: c.isReversed }))
          : Array.isArray(raw.cards)
          ? raw.cards
          : [];
        const cardNames =
          cards.map((c: any) => `【${c.name || '牌卡'}】(${c.isReversed ? '逆位' : '正位'})`).join('、') || '塔羅諸牌';

        return `## 專業韋特塔羅心靈諮商啟示報告（融匯韋特與當代塔羅宗師心法）

牌陣布局：「**${spreadName}**」
抽取牌位呈現：${cardNames}

針對您當前所關注的疑惑：「**${lastUserMsg}**」，為您進行潛意識與現實動態的透視分析：

### 1. 當前局勢核心能量定調
* 牌陣核心牌卡直指您當前正處於重要的心態轉折期。您既渴望打破現狀、開拓嶄新可能，同時也面臨既有習慣或安全感的拉扯。

### 2. 牌位對應與潛意識盲點透視
* **正位牌卡啟示**：象徵您目前擁有的實質資源與理性優勢，只要主動整合，便能形成強大的推進動能。
* **逆位牌卡提醒**：提醒您注意意識層面可能忽略的恐懼或自我懷疑。瑪麗·格利爾指出：逆位牌並非凶煞，而是能量提示「向內反思、調整溝通模式」，釋放深層被壓抑的潛能。

### 3. 韋特與當代塔羅宗師啟迪（符號象徵與心靈賦能）
* **愛德華·韋特 (A. E. Waite) 圖解之鑰**：大阿爾克那呈現的是從「愚者」的純真起步、穿越現實試煉抵達圓滿覺悟的「愚人之旅（The Fool's Journey）」。每張牌卡皆是喚醒內在神聖智慧的圖像之門。
* **蕾切爾·波拉克 (Rachel Pollack) 啟示**：「塔羅牌不是預測不可更改的宿命，而是賦予我們看見內在真實、掌握自由意志的覺察工具。」
* **阿歷安度·佐杜洛夫斯基 (Alejandro Jodorowsky) 心法**：塔羅是一把心靈精神手術刀，協助我們切除自我設限的幻象，直面當下的真實力量。

### 4. 破局行動方針與心靈賦能建議
1. **釐清核心優先級**：本週先聚焦於最關鍵的一項具體目標，排除不必要的外部干擾。
2. **坦承內在需求**：與關鍵合作夥伴或親近之人進行真誠、無防備的溝通。
3. **勇敢邁出一步**：記住「行動會帶來清晰，猶豫只會滋生焦慮」；信任牌陣所揭示的直覺啟示。`;
      }

      case 'ICHING': {
        const raw = chartContext.rawData || {};
        const original =
          raw.originalHexagram?.name ||
          (typeof raw.originalHexagram === 'string' ? raw.originalHexagram : '本卦');
        const transformed =
          raw.transformedHexagram?.name ||
          (typeof raw.transformedHexagram === 'string' ? raw.transformedHexagram : '變卦');
        const moving = Array.isArray(raw.movingLines) ? raw.movingLines.join('、') : '動爻';

        return `## 易經戰略決策動態解析報告\n\n此次起筮得本卦「**${original}**」，動爻為「**第${moving}爻**」，變卦化為「**${transformed}**」。\n\n針對您的決策詢問：「**${lastUserMsg}**」，為您以《易經》時位之理剖析如下：\n\n### 1. 本卦時位局勢定性\n* **當前時機**：本卦【${original}】指明您當前所處的時空節奏。此卦提示事物基礎已具備雛形，但外部環境仍在醞釀變數，屬於「蓄勢待發、明辨事理」的關鍵階段。\n\n### 2. 動爻關鍵樞紐與變機\n* **轉折焦點**：第${moving}爻發動，正是因果轉化的樞紐。爻辭告誡在當前節骨眼上，切忌輕舉妄動或因急於求成而忽略細節，守正中道才能立於不敗之地。\n\n### 3. 變卦走向與發展趨勢\n* **後續走向**：變為【${transformed}】，預示局勢在經歷一番調整與結構重整後，將迎來更清晰的方向與突破契機。\n\n### 4. 知進知退之決策行動方針\n1. **戰略原則**：在局勢尚未徹底明朗前，保持「知進亦知退」的彈性策略。\n2. **溝通方針**：凡涉及合約、承諾或利益分配，務必白紙黑字、條理分明。\n3. **行事心法**：順天應人，不存僥倖之心，自然能趨吉避凶。`;
      }

      case 'QIZHENG': {
        const raw = chartContext.rawData || {};
        const station = raw.mingPalaceStation || '玄枵';
        const mansion = raw.mingMansion || '角木蛟';
        const ruler = raw.fourStarRelations?.rulerStar || '歲星';
        const enStar = raw.fourStarRelations?.generativeStar || '辰星';

        return `## 古典七政四餘天星度數詳批報告（宗承果老星宗法脈）

依據周天星盤推步：立命於「**${station}**」之次，命度直入「**${mansion}**」，宮主星為「**${ruler}**」，生我命度之恩星為「**${enStar}**」。

針對您的諮詢重點：「**${lastUserMsg}**」，為您展開古典天星解析：

### 1. 立命次舍與命度宿主
* 命度入「${mansion}」，主先天禀賦沉穩、具備深思熟慮的內省智慧。命度根基扎實，利於在專業領域深耕積累。

### 2. 恩難仇用四星生剋制化
* 天星以生我者為恩星（${enStar}），剋我者為難星。當前恩星與三方宮位形成互拱之勢，象徵在關鍵時刻容易獲得長輩提攜或專業資源挹注。

### 3. 果老星宗古典宗師心法
* **張果老《果老星宗》心法**：「天步經緯，各有定數；星辰得失，恩難制化。」天星所照乃身心之鏡像，身命同源，以恩星培養本元德行，以難星修持反躬自省。
* **耶律楚材天星統微**：天道運行有常，吉凶非由天降，而是人與天行相感應。知天象之順逆，修人事之敬慎，則吉無不利。

### 4. 趨吉避凶修持指南
1. **方位借力**：日常宜多親近恩星所主之五行方位與平和氣場。
2. **心性調和**：在面對逆境時保持寬宏大度，自能藉天星生剋之機轉危為安。`;
      }

      case 'NAME': {
        const raw = chartContext.rawData || {};
        const score = raw.fiveGrids?.totalScore || raw.totalScore || 90;
        const pattern = raw.threeTalents?.pattern || '木火土';

        return `## 正統姓名學與文字學專業評估報告\n\n審析姓名五格數理配置：總評分為「**${score}分**」，三才配置為「**${pattern}**」。\n\n針對您的諮詢提問：「**${lastUserMsg}**」，為您客觀剖析如下：\n\n### 1. 五格數理誘導力剖析\n* 人格與總格之筆劃數理吉祥，主為人敦厚自律、重信諾，具備穩步建立事業基石的優勢性格。\n\n### 2. 三才五行配置順逆\n* 天格、人格、地格之五行配置呈現順生結構，象徵基礎運穩健，能承長輩栽培亦能贏得同儕信任。\n\n### 3. 漢字音形義與八字補益\n* 名字用字音律清越、寓意深遠，在聲韻心理學上給人信賴與沉著的初次印象，有助於人際開拓。\n\n### 4. 現代社交與品牌塑造建議\n1. **簽名與品牌**：簽署姓名時字跡宜舒展端正，強化自信心理投射。\n2. **能量發揮**：在人際交往中多發揮人格數理的包容特質，可大幅增進人脈黏著度。`;
      }

      case 'ALMANAC': {
        const raw = chartContext.rawData || {};
        const dateStr = raw.lunarDate?.formatted || '今日農曆';
        const officer = raw.dayOfficer?.name || '建';
        const joy = raw.deityDirections?.joyGod || '東南';
        const wealth = raw.deityDirections?.wealthGod || '正西';

        return `## 通勝曆法與今日生活擇吉指引報告\n\n今日值農曆「**${dateStr}**」，日值十二神之「**${officer}**」日，喜神在「**${joy}**」，財神在「**${wealth}**」。\n\n針對您的生活與工作諮詢：「**${lastUserMsg}**」，為您提供現代實用生活指南：\n\n### 1. 今日時令總局與值神氣場\n* 今日「${officer}」日主掌當日大氣節奏，氣場適合穩步推進既存事項，凡事重在條理與合規。\n\n### 2. 宜忌現代場景深度辨析\n* **適合事項**：今日利於策略規劃、商務溝通、團隊對齊目標以及居家整理。\n* **戒慎提醒**：忌急躁衝動簽約或進行高風險博弈，宜多留一重審核機制。\n\n### 3. 生肖沖煞與方位調和\n* 面對當日沖煞，受沖生肖朋友保持平和心態、多聽少言即可化解。重要洽公可善用吉神方位之空間，心平氣和則諸事通達。`;
      }

      default:
        return `## 專業命理與星象諮詢診斷\n\n針對您的提問：「**${lastUserMsg}**」：\n\n任何深度的星盤解讀，皆講求「知其然，更知其所以然」。人生運勢的起伏是客觀客律，但個人的心態調整與行動策略具有決定性的作用。請善用您命盤中的優勢稟賦，在合適的時機做出清晰的抉擇，自能穩步邁向理想的生活目標。`;
    }
  } catch (err: any) {
    console.error('Professional Synthesizer Error:', err);
    return `## 專業命理與星象諮詢診斷\n\n針對您所詢問之課題：「**${lastUserMsg}**」，當前命盤數據已完整記錄。請依據您的核心稟賦踏實耕耘，順應時節節奏，必能獲得良好成效。`;
  }
}
