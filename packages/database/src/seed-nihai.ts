/**
 * 倪海廈（天紀／地紀／人紀）正統三合派命理與風水 RAG 知識庫種子資料
 *
 * 全數由簡體中文原典校訂、精煉為典雅道地的【繁體中文】。
 * 遵循倪師核心心法：
 * 1. 大道至簡：以三合派為宗，命宮為本，三方為用，反對複雜飛星自化。
 * 2. 人生決策公式：人事努力 + 地理調整 > 先天命運（2/3 > 1/3）。
 * 3. 算命是討論果的哲學：算命的目的是為了「知果」而後在事前「修因」轉化。
 * 4. 名位相等原則：陽宅各安其位，以天地之道調和人事。
 */

export interface NihaiInterpretationSeed {
  moduleType: string;
  keyCode: string;
  category: string;
  title: string;
  contentRich: string;
  tags: string;
}

export const NIHAI_INTERPRETATIONS: NihaiInterpretationSeed[] = [
  // ────────────────── 天紀總論與心法 ──────────────────
  {
    moduleType: 'ZIWEI',
    keyCode: 'NIHAI_TIANJI_CORE_SIMPLICITY',
    category: 'NIHAI_PHILOSOPHY',
    title: '倪師天紀心法：大道至簡與三合正宗',
    contentRich:
      '倪海廈大師明言：「飛星飛來飛去太複雜，我們不搞這個，畢竟大道至簡。」紫微斗數以三合派為正宗本源，以命宮為太極點決定先天根基與本質，以三方（財帛、官祿、遷移）為後天用武之地。生年四化永遠固定在天盤，不可隨意飛移，抓準主星廟旺與三方星曜互拱，格局清明，斷事自然神準。',
    tags: JSON.stringify(['倪海廈', '天紀', '大道至簡', '三合派', '命宮為本']),
  },
  {
    moduleType: 'ZIWEI',
    keyCode: 'NIHAI_TIANJI_TWO_THIRDS_RULE',
    category: 'NIHAI_PHILOSOPHY',
    title: '倪師人生決策定律：人事努力與地理調整大於天命（2/3 > 1/3）',
    contentRich:
      '先天命盤佔人生的三分之一（1/3），此為先天因果稟賦；然而後天的人事努力佔三分之一（1/3），陽宅地理風水調整亦佔三分之一（1/3）。倪師常言：「人事的努力加上地理上的調整，合計三分之二（2/3），必定能大於先天的命運（1/3）。」算命絕非宿命論，而是透過精準知命，在事前透過地理定位與人事決策化煞迎吉。',
    tags: JSON.stringify(['倪海廈', '天紀', '三分之二定律', '知命造命', '陽宅風水']),
  },
  {
    moduleType: 'ZIWEI',
    keyCode: 'NIHAI_TIANJI_PHILOSOPHY_OF_FRUIT',
    category: 'NIHAI_PHILOSOPHY',
    title: '倪師命理哲理：算命是討論「果」的哲學',
    contentRich:
      '倪師教誨：「算命是一個討論果的哲學。命是天注定的，運掌握在我們自己手上。」命盤展示的是先天因果之「果象」；既然知果，便能倒推其「因」，在未發生之三年前著手化解。倪師強調：「三年前有辦法化解，到了時候再改都是事後。等碗打破了我們再去解，就為時已晚。」知果是為了修因，這是天紀的核心精神。',
    tags: JSON.stringify(['倪海廈', '天紀', '討論果的哲學', '三年前化解', '因果決策']),
  },
  {
    moduleType: 'ZIWEI',
    keyCode: 'NIHAI_TIANJI_SHEN_GONG_RULE',
    category: 'NIHAI_PHILOSOPHY',
    title: '倪師身宮心法：身宮寄託與後天執念',
    contentRich:
      '倪師指出：「身宮代表後天行運中影響最深、心力寄託最重的宮位。」身宮在財帛宮，代表後天極具經濟獨立意識，女性多為職業婦女、自立自強；身宮在官祿宮，執念在事業成就與名位掌控；身宮在夫妻宮，易受感情與配偶牽引；身宮最忌逢七殺、破軍單守或坐煞星，主一生多波折與起落。',
    tags: JSON.stringify(['倪海廈', '天紀', '身宮', '職業婦女', '後天寄託']),
  },

  // ────────────────── 倪師十四主星與要曜真傳 ──────────────────
  {
    moduleType: 'ZIWEI',
    keyCode: 'NIHAI_STAR_ZIWEI',
    category: 'NIHAI_STAR',
    title: '倪師論紫微星：帝座尊貴與君臣慶會',
    contentRich:
      '紫微星為斗數帝王之座。倪師強調：紫微星最怕「在野孤君」——若無左輔、右弼同會或同宮，反主孤芳自傲、有職無權。紫微逢左右相佐，號稱「君臣慶會」，方能文武兼備、號令一方。紫微星坐命者最忌地空地劫，若逢空劫夾命或同度，主理想高遠卻現實坎坷，宜走向哲學、學術與無私奉獻。',
    tags: JSON.stringify(['倪海廈', '紫微星', '帝王星', '君臣慶會', '左輔右弼']),
  },
  {
    moduleType: 'ZIWEI',
    keyCode: 'NIHAI_STAR_TIANFU',
    category: 'NIHAI_STAR',
    title: '倪師論天府星：財庫令星與保守基石',
    contentRich:
      '天府星為南斗令星，主掌國庫財庫。倪師云：「天府星性穩重包容、善於守成與理財。」天府坐命或入財帛宮，最喜祿存、化祿相會，庫充實而資產厚重；天府最怕「露庫」與「空庫」——若無祿又逢地空地劫或擎羊衝破，則庫底穿孔、虛有其表。天府之人處事務實謹慎，適合大企業高管與金融主持。',
    tags: JSON.stringify(['倪海廈', '天府星', '令星', '財庫', '守成']),
  },
  {
    moduleType: 'ZIWEI',
    keyCode: 'NIHAI_STAR_TAIYANG',
    category: 'NIHAI_STAR',
    title: '倪師論太陽星：光明磊落與博愛官貴',
    contentRich:
      '太陽星為官祿主，司光明與施與。倪師指出：太陽最重廟旺利陷，寅卯辰巳午為旭日東昇、光芒萬丈，主志向博大、為官清顯、利於公眾大業；申酉戌亥子為日落西山，主操勞奔波、為人作嫁。太陽坐命之人多慷慨無私，喜居官祿宮或命宮化權化祿，女子得廟旺太陽亦主旺夫益子、個性剛健。',
    tags: JSON.stringify(['倪海廈', '太陽星', '光明官貴', '廟旺利陷', '公眾大業']),
  },
  {
    moduleType: 'ZIWEI',
    keyCode: 'NIHAI_STAR_TAIYIN',
    category: 'NIHAI_STAR',
    title: '倪師論太陰星：富貴陰德與母性財源',
    contentRich:
      '太陰星為水之精、田宅與財帛之主。倪師教誨：「太陰在酉戌亥子丑為得垣廟旺，如中秋明月，主容貌端秀、財祿豐厚、善置不動產；在卯辰巳午為失輝落陷，易感情多愁、暗耗資財。」太陰化祿主暗財、資產增值；太陰化忌需防情緒抑鬱與女性長輩健康。',
    tags: JSON.stringify(['倪海廈', '太陰星', '田宅主', '不動產', '富貴']),
  },
  {
    moduleType: 'ZIWEI',
    keyCode: 'NIHAI_STAR_WUQU',
    category: 'NIHAI_STAR',
    title: '倪師論武曲星：將星正財與果決行事',
    contentRich:
      '武曲星為陰金，屬財帛宮主星，亦為寡宿與將星。倪師強調：武曲性剛果決、實事求是、手腕俐落，是最正統的實業正財星。武曲最喜化祿、化權，主在工商、科技、金融領域執掌大柄；然而「武曲化忌」為斗數第一破財凶星，主資金鏈斷裂、因財反目或重大手術傷損，遇之務必謹慎收縮。',
    tags: JSON.stringify(['倪海廈', '武曲星', '正財星', '將星', '武曲化忌']),
  },
  {
    moduleType: 'ZIWEI',
    keyCode: 'NIHAI_STAR_QISHA',
    category: 'NIHAI_STAR',
    title: '倪師論七殺星：將帥開闢與「七殺臨身」之戒',
    contentRich:
      '七殺星為南斗將星，威猛果敢、獨行其是。倪師特別提出警示：「最怕的是七殺臨身，七殺臨身的人一輩子多敗少成。」身宮若坐七殺，代表後天行事過於衝動犯險、不聽勸戒，成敗起落極大。七殺最喜在官祿宮化權或會照紫微天府，成「七殺朝斗」或「將星受節」，化殺為權，方成大將之風。',
    tags: JSON.stringify(['倪海廈', '七殺星', '七殺臨身', '將星', '開拓風險']),
  },
  {
    moduleType: 'ZIWEI',
    keyCode: 'NIHAI_STAR_POJUN',
    category: 'NIHAI_STAR',
    title: '倪師論破軍星：先破後立與先鋒變革',
    contentRich:
      '破軍星為開創先鋒，性急果毅、求新求變。倪師指出：「破軍坐命必先破而後立，一生難免經受大洗牌。」破軍在子午宮入廟，號「英星入廟」，威震邊疆；破軍最喜化祿，主破舊出新、動中獲厚利；最忌化忌或逢煞星衝破，主孤注一擲而傾家蕩產。破軍人宜走技術創新、產品改革或拓荒事業。',
    tags: JSON.stringify(['倪海廈', '破軍星', '英星入廟', '先破後立', '開拓創新']),
  },
  {
    moduleType: 'ZIWEI',
    keyCode: 'NIHAI_STAR_TANLANG',
    category: 'NIHAI_STAR',
    title: '倪師論貪狼星：慾望動能與火貪橫發',
    contentRich:
      '貪狼星為第一大桃花星，亦為神仙修煉之星。倪師言：「貪狼星多才多藝、善於應酬、文武兼資，是推動世俗成功的強大慾望引擎。」貪狼最妙之格局為「火貪格」與「鈴貪格」——貪狼遇火星或鈴星同宮或三方會照，主因敏銳抓住時勢而暴發橫財。唯暴發之後須守正積德，方保長久。',
    tags: JSON.stringify(['倪海廈', '貪狼星', '桃花星', '火貪格', '慾望動能']),
  },
  {
    moduleType: 'ZIWEI',
    keyCode: 'NIHAI_STAR_JUMEN',
    category: 'NIHAI_STAR',
    title: '倪師論巨門星：暗曜是非與石中隱玉',
    contentRich:
      '巨門星為陰土化暗曜，司是非、口舌與深刻洞察。倪師指出：巨門坐命者心細善思、善於質疑與邏輯推演。若會照太陽廟旺，太陽之光驅散巨門之暗，化為雄辯說服與公關法務之能；巨門在子午坐命見祿科，成「石中隱玉格」，早年苦讀磨難，中年璞玉出世、位極高明。巨門最忌化忌逢羊，主官非口舌。',
    tags: JSON.stringify(['倪海廈', '巨門星', '石中隱玉', '暗曜是非', '口才立業']),
  },
  {
    moduleType: 'ZIWEI',
    keyCode: 'NIHAI_STAR_SI_HUA',
    category: 'NIHAI_STAR',
    title: '倪師論生年四化：四化動能與吉凶定性',
    contentRich:
      '倪師總結四化玄機：「化祿主財、性守——代表正財積累與機遇享受；化權星性剛、代表官印——主掌權力、魄力與決策掌控；化科主科名、名氣很大——代表學術名譽與貴人清譽；化忌星主劫殺——代表執念、阻礙、考驗與事後功課。」倪師明言：「官祿宮最喜歡權星入進來」，主事業上有實質支配力。',
    tags: JSON.stringify(['倪海廈', '生年四化', '化祿', '化權', '化科', '化忌']),
  },

  // ────────────────── 倪師經典格局與命相評斷 ──────────────────
  {
    moduleType: 'ZIWEI',
    keyCode: 'NIHAI_PATTERN_SHA_PO_LANG',
    category: 'NIHAI_PATTERN',
    title: '倪師評殺破狼格：闖蕩天下的大將格局',
    contentRich:
      '倪師解析：「七殺、破軍、貪狼三星一定同在三方，形成殺破狼大變動格局。」此格之人不安於現狀，敢於在混亂時代開拓破局。現代社會最適合創業開公司、業務銷售、高科技拓荒或涉足競爭激烈領域。殺破狼遇祿權為開疆拓土之良將；若三方煞重無祿，則易盲動折騰，中年後需注重修心守成。',
    tags: JSON.stringify(['倪海廈', '殺破狼', '開創格局', '創業經商', '變動']),
  },
  {
    moduleType: 'ZIWEI',
    keyCode: 'NIHAI_PATTERN_YANG_LIANG_CHANG_LU',
    category: 'NIHAI_PATTERN',
    title: '倪師評陽梁昌祿格：國家典試第一科甲之星',
    contentRich:
      '陽梁昌祿格由太陽、天梁、文昌、祿存四星會照命宮三方構成。倪師指出：「此格古稱臚傳第一人，是學術、國考、司法、醫學認證最頂級的貴格。」太陽主公眾光明，天梁主蔭庇法度，文昌主考運才思，祿存主食祿天賜。此格之人宜走專業威權、文官法制或頂尖研究路線，一生名利雙收。',
    tags: JSON.stringify(['倪海廈', '陽梁昌祿', '科甲之星', '學術國考', '貴格']),
  },
  {
    moduleType: 'ZIWEI',
    keyCode: 'NIHAI_PATTERN_FENGSHUI_SANJI_LIUXIU',
    category: 'NIHAI_FENGSHUI',
    title: '倪師天紀堪輿：三吉六秀與陽宅風水佈局',
    contentRich:
      '倪師傳授楊救貧九星派正宗堪輿學：陽宅首重生氣與藏風聚氣。三吉方位（生氣、延年、天醫）是住宅大門、客廳與主臥室的首選；六秀方位若有秀麗山水、開闊採光，則主子嗣俊秀、家運亨通。倪師強調：「好的風水地方必定有魚蝦龜，這是自然生氣充沛的明證。」陽宅調理是補足先天命盤不足的最強手段。',
    tags: JSON.stringify(['倪海廈', '堪輿學', '陽宅風水', '三吉六秀', '楊救貧九星派']),
  },
  {
    moduleType: 'ZIWEI',
    keyCode: 'NIHAI_PATTERN_FENGSHUI_BASHA_HUANGQUAN',
    category: 'NIHAI_FENGSHUI',
    title: '倪師風水禁忌：八煞黃泉大凶立向',
    contentRich:
      '倪師在天紀堪輿課程中三令五申：「八煞黃泉是墳墓與陽宅立向的絕對禁忌！」八煞黃泉方位犯之主家破人亡、意外橫禍或重大絕症。無論命盤格局多高，居住環境若犯八煞黃泉之向，必受地理凶氣反噬。選宅購房，首要避開八煞方位，方能安享富貴。',
    tags: JSON.stringify(['倪海廈', '八煞黃泉', '風水禁忌', '陽宅大忌', '立向']),
  },
  {
    moduleType: 'ZIWEI',
    keyCode: 'NIHAI_PATTERN_MING_WEI_XIANG_DENG',
    category: 'NIHAI_FENGSHUI',
    title: '倪師陽宅心法：名位相等原則',
    contentRich:
      '倪師獨步天下的陽宅人間道法則：「爸爸住爸爸的位置（乾位·西北方），媽媽住媽媽的位置（坤位·西南方），長子住長子位置（震位·東方），這叫作『名位相等』。」若名位不符，例如小兒子住乾位，則長幼失序、性情叛逆。名位相等則全家和睦、父慈子孝、各展其才，這是易經八卦在生活空間中的最高智慧。',
    tags: JSON.stringify(['倪海廈', '名位相等', '乾坤定位', '八卦陽宅', '家庭和睦']),
  },
  {
    moduleType: 'ZIWEI',
    keyCode: 'NIHAI_RENJI_JIE_E_HEART_LIVER',
    category: 'NIHAI_RENJI',
    title: '倪師人紀醫道：疾厄宮與五臟經絡連動斷法',
    contentRich:
      '倪海廈身為一代經方大家，將中醫臟腑學與紫微斗數疾厄宮完美融合。倪師祕訣：「煞星通過疾厄宮，若在午宮主心臟心血管疾患（午屬離火司心）；煞星在丑宮主肝膽疾患（丑為丑時肝經當令）；煞星在酉主肺與呼吸系統（酉屬兌金司肺）；煞星在子主腎與泌尿系統。」命理與中醫互參，能在病兆微茫時及早調治。',
    tags: JSON.stringify(['倪海廈', '人紀中醫', '疾厄宮', '臟腑經絡', '子午流注']),
  },
  {
    moduleType: 'ICHING',
    keyCode: 'NIHAI_YIJING_BU_YI_HE_BU',
    category: 'NIHAI_YIJING',
    title: '倪師易經心法：不疑何卜與決策象數',
    contentRich:
      '倪師講解六十四卦時指出：「不疑何卜——人心中只有真正面臨抉擇疑慮時，方才起卦問道；無事妄卜，則卦象不應。」易經不僅是占卜預測之術，更是洞察事態起承轉合的高階決策模型。讀通易經者，應能「不但看到時機，更能馬上做決策」，知進知退，順應天時。',
    tags: JSON.stringify(['倪海廈', '天紀易經', '不疑何卜', '決策智慧', '六十四卦']),
  },
];
