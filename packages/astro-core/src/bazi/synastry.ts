import { BaziChart, FiveElement, FiveElementsBreakdown } from './types.js';
import { calculateBaziChart } from './calculator.js';
import { calculateZiweiChart } from '../ziwei/calculator.js';
import { ZiweiChart, PalaceCell } from '../ziwei/types.js';

// ─────────────────────────────────────────────────────────────
// 📜 紫微斗數合盤知識庫 (三合派正統易理與古典全書評註)
// 基於傳統三合派合盤心法 + 《周易》後天八卦名位相等與《紫微斗數全書》古典斷語
// ─────────────────────────────────────────────────────────────

export const STAR_IN_FUQI_GU: Record<string, {
  summary: string;       // 一句話核心
  good: string;          // 吉象條件/表現
  bad: string;           // 凶象/注意事項
  spouse_traits: string; // 配偶外形性格
  timing: string;        // 婚期建議
  classicQuote?: string; // 三合易理註解心法
  ni_quote?: string;     // 向後相容別名
}> = {
  紫微: {
    summary: '配偶高傲能幹，宜晚婚，感情以尊重為基礎',
    good: '三方有輔弼相夾，配偶賢能有才，婚後得貴助；三合見祿主財祿雙全',
    bad: '孤君無輔，配偶強勢難溝通；辰戌宮夫妻情分淡薄；會破軍：婚前有諸多阻礙',
    spouse_traits: '配偶氣質尊貴，有主見，自尊心強，能力強但不輕易表達情感',
    timing: '宜晚婚（男30歲以上，女27歲以上），早婚多挫折',
    classicQuote: '紫微帝座入夫妻宮，尊嚴自持，最喜輔弼同會以解孤性。宜晚婚修心，重在彼此敬重相待。',
    ni_quote: '紫微入夫妻宮主自尊獨立，宜晚婚以沉澱心性，夫妻以互敬為本。',
  },
  天機: {
    summary: '婚姻思維靈動多變，宜年齡差較大的配偶',
    good: '見祿存或化祿：感情深厚可維持；會太陰：增添細膩溫柔',
    bad: '化忌或會煞：感情變化大，易有分離；天機善變，配偶對感情較易舉棋不定',
    spouse_traits: '配偶聰明機敏，心思細膩，宗教哲學緣深，思慮較多',
    timing: '宜年齡差異較大（差6歲以上），可降低雙方變化衝突',
    classicQuote: '天機靈動多謀，坐夫妻宮主思維敏捷亦多動態。宜年齡漸開、互諒互讓，以沉穩化解浮躁。',
    ni_quote: '天機善變多思，坐夫妻宮宜沉穩自持，拉開年齡差距可調和變化。',
  },
  太陽: {
    summary: '男命助妻，女命旺夫；落陷化忌則反主操勞刑剋',
    good: '廟旺（卯至申宮）：配偶能幹，男命有賢內助；女命嫁旺夫，婚姻美滿',
    bad: '落陷（酉至寅宮）：男命配偶較勞碌，女命先生事業較辛苦；化忌需防男性親屬健康與事業壓力',
    spouse_traits: '配偶開朗大方，有公眾形象意識，慷慨熱忱但有時較為強勢',
    timing: '感情走勢始熱終穩，宜保持適當距離維持新鮮感',
    classicQuote: '太陽純陽普照，喜廟旺朝陽。若落陷或逢化忌，宜注重伴侶身心調養與勞逸調和，以溫潤相濡。',
    ni_quote: '太陽主貴，女命視為夫曜。落陷化忌宜多關懷先生身心，共同分擔解憂。',
  },
  武曲: {
    summary: '剛毅果決之星，婚姻重實務，一律宜晚婚',
    good: '武曲化祿：配偶極具理財能力；見祿存夾輔：婚姻穩固有財',
    bad: '化忌：性情剛硬易生隔閡；武曲七殺（卯酉宮）或武曲破軍見煞忌：需防感情摩擦與聚少離多',
    spouse_traits: '配偶剛烈獨立，說話直接，不善甜言蜜語，經濟能力強但性格較務實',
    timing: '武曲系一律建議30歲以後結婚，晚婚方能成熟包容',
    classicQuote: '武曲剛金好義，入夫妻宮性直重實。最喜晚婚以磨礪心性，日常宜柔和相待，以情化剛。',
    ni_quote: '武曲剛直重實，夫妻相處貴在以柔克剛，晚婚則心性成熟圓滿。',
  },
  天同: {
    summary: '配偶溫和重生活情調，宜年齡差較大，晚婚為吉',
    good: '見祿存或化祿：配偶溫和帶財，家庭安穩；與太陰同：感情溫柔甜蜜',
    bad: '化忌：因協調不良易引起情緒悶氣；遇煞多：需防過度安逸或逃避責任',
    spouse_traits: '配偶溫和善良，樂觀隨和，富有生活情趣，重享受與家庭和氣',
    timing: '男娶比自己小、女嫁比自己大，年齡差6至8歲以上為最佳良緣',
    classicQuote: '天同福星性溫隨和，入夫妻主情趣和氣。宜防過度安逸，夫妻共同設定奮鬥目標則福澤長久。',
    ni_quote: '天同為福星，相處貴在體貼知足，適度拉開年齡差距更顯溫厚。',
  },
  廉貞: {
    summary: '感情濃烈而多波折之星，需修心養性與陽宅化解',
    good: '廉貞天府（子午）：配偶溫和清秀，感情穩定，多為專業管理或穩定職業者',
    bad: '廉貞貪狼、廉貞破軍、廉貞七殺在夫妻宮：傳統視為強格衝擊，易聚少離多或感情劇烈起伏，務必透過陽宅西北/西南定位化解',
    spouse_traits: '配偶外型出眾，善於交際，情緒張力高，魅力強烈但個性鮮明',
    timing: '男命宜配年少之妻（年輕6-10歲），女命宜配年長成熟之夫',
    classicQuote: '廉貞次桃花性情濃烈，逢衝見動需重修養定力。配偶相處宜多包容，輔以空間環境名位相安，轉衝激為開創。',
    ni_quote: '廉貞性情濃烈，在夫妻宮遇動盪宜以靜制動，安立居所名位化解摩擦。',
  },
  天府: {
    summary: '厚重善曜，主感情平穩守成，白首偕老',
    good: '見祿存或化祿：財祿雙全，感情穩定；三方無煞：夫妻平靜和諧',
    bad: '輔弼單星或遇四煞：需防冷戰或各自忙碌忽略情感交流',
    spouse_traits: '配偶溫文爾雅，守財有原則，工作與持家能力強，作風穩健保守',
    timing: '男命配偶賢淑持家，女命配偶穩重可靠；感情穩定但需主動營造浪漫',
    classicQuote: '天府厚重令星，入夫妻宮主守成平穩。相處宜主動創造情感共鳴，避免過於務實而流於平淡。',
    ni_quote: '天府厚重穩健，夫妻關係平穩長久，重在細水長流與相互守護。',
  },
  太陰: {
    summary: '喜清秀溫柔配偶；廟旺主富足，落陷化忌需防婆媳摩擦',
    good: '廟旺（酉至丑宮）見吉：配偶秀氣有成就，男命得賢美之妻；女命家庭溫馨富足',
    bad: '落陷（卯至未宮）或化忌（男命尤忌）：易生情緒內耗，男命需主動居中協調太太與母親之婆媳關係',
    spouse_traits: '配偶溫柔秀氣，細膩敏感，重感情與家庭氛圍，偶有情緒化',
    timing: '廟旺早晚婚皆宜，落陷時宜晚婚',
    classicQuote: '太陰柔水為妻星母宿。若化忌入宮，首重家庭代際溝通，男命需居中調和婆媳情誼，以和為貴。',
    ni_quote: '太陰主溫婉秀美，男命若逢化忌尤重婆媳調和，先生為中流砥柱。',
  },
  貪狼: {
    summary: '才藝桃花之星，社交魅力強，宜晚婚並有共同興趣',
    good: '化祿：配偶才藝佳，風情萬種，生活多姿多彩；遇化科：理性尊重；午宮貪狼反主武職貴氣',
    bad: '化忌或紫微貪狼（卯酉）遇煞：配偶交際應酬多，宜培養共同事業或宗教藝術嗜好以固情緣',
    spouse_traits: '配偶才藝超群，社交能力強，異性緣佳，懂得生活品味',
    timing: '早婚感情多變，宜晚婚；婚後宜共同經營事業或興趣',
    classicQuote: '貪狼多才多藝、長於社交。坐夫妻宮宜以共同志趣與精神寄託為基石，若居旺位反主經世開拓之才。',
    ni_quote: '貪狼才藝出眾，在夫妻宮宜建立共同理想與嗜好，相處自得其樂。',
  },
  巨門: {
    summary: '口才犀利之星，夫妻宜多讚美少爭辯，喜太陽化解',
    good: '太陽廟旺相會：反主婚姻和美，口才化為溝通利器；化祿：配偶賢能，財路因配偶而開',
    bad: '化忌或陀羅同度：易因言語直率生口角是非，或鑽牛角尖自尋煩惱',
    spouse_traits: '配偶口才極佳，洞察力敏銳，在乎原則與面子，雖偶有挑剔但內心深情',
    timing: '宜與性格開朗（如太陽系）或年長包容之伴侶結合，建立良好溝通共識',
    classicQuote: '巨門暗曜司口才辨析。夫妻相處宜多溫言讚賞、少爭論是非，得太陽引照則能化言辭為默契。',
    ni_quote: '巨門善辯敏銳，夫妻相處宜多讚賞、少挑剔，得太陽光華則化為融洽。',
  },
  天相: {
    summary: '「親上加親」良緣，夫唱婦隨，合作型婚姻',
    good: '見輔弼雙全：感情忠誠，婚姻穩固，配偶正直踏實；三合見祿：財祿可期',
    bad: '遇煞忌刑夾：感情中較易壓抑委屈，宜鼓勵對方坦誠表達需求',
    spouse_traits: '配偶正直踏實，守信用，講究衣著體面，不喜衝突，善於協調，是絕佳生活伴侶',
    timing: '多由同學、同事、熟識朋友發展而成，極宜夫妻合作共事',
    classicQuote: '天相印星公正體面，主夫唱婦隨之合作良緣。彼此坦誠交流、不生猜忌，能同心協力興旺家業。',
    ni_quote: '天相主信實體面，夫妻如同事業夥伴，相互尊重支持則無往不利。',
  },
  天梁: {
    summary: '喜責任感強或年紀較長的配偶，歷經磨合後感情彌堅',
    good: '見祿或三合吉星：配偶有福德蔭庇，感情經營穩重理智，互相扶持',
    bad: '化忌或見煞：配偶較愛講道理或帶說教感；婚前易有波折考驗，結褵後反而穩固',
    spouse_traits: '配偶責任感強，穩重老成，熱心公益，善講道理，具長者風範',
    timing: '宜男大女小或女大男小（年齡差距明顯更佳），婚後情緣深長',
    classicQuote: '天梁蔭星具長者風範。入夫妻宮雖有先磨合之象，歷經歲月考驗後情緣彌堅，宜年齡漸開為良配。',
    ni_quote: '天梁具蔭庇之德，宜配年長成熟伴侶，歷經歲月磨礪感情愈發篤實。',
  },
  七殺: {
    summary: '將星入夫妻，獨立果敢，宜晚婚並給予彼此空間',
    good: '廟旺（寅申宮）見祿：配偶雖剛強但極為忠誠，一旦投入則全力扛起家庭責任',
    bad: '遇煞星同度：容易聚少離多或各自忙於事業，「鴛衾半冷」，宜保持生活空間避免硬碰硬',
    spouse_traits: '配偶剛強果斷，獨立自主，行事雷厲風行，一見鍾情快，不喜被束縛',
    timing: '一律宜晚婚（30歲後），或以聚少離多、各自獨立打拚的方式相處最吉',
    classicQuote: '《斗數古賦》云七殺將星入夫妻性剛果決。相處貴在以柔克剛，彼此保留獨立事業空間，方能久遠和諧。',
    ni_quote: '七殺剛烈果斷，夫妻相處宜互相給予獨立自主空間，切忌硬碰硬。',
  },
  破軍: {
    summary: '開創求變之星，婚姻宜打破傳統框架，先磨合後穩定',
    good: '化祿或英星入廟（子午）：破而後立，感情歷經考驗反而能白頭偕老；配偶英挺有魄力',
    bad: '化忌或遇煞：婚姻觀念較突破傳統，中年宜注意分房或各自擁有獨立工作室以應「分居之象」',
    spouse_traits: '配偶追求自由，勇於突破創新，不喜世俗約束，行事作風大刀闊斧',
    timing: '宜拉長戀愛磨合期、晚婚為吉；婚後給予定期獨處空間可保長久',
    classicQuote: '破軍先破後立、勇於變革。感情需有彈性調適之格局，結合名位秩序各安其分，則能破除陳規同甘共苦。',
    ni_quote: '破軍求新求變，感情相處宜給予各自沉澱空間，名位相安則長治久安。',
  },
};

export const SIHUA_IN_FUQI_GU: Record<string, string> = {
  祿: '【夫妻宮化祿】與配偶有深厚先天善緣，配偶個性樂觀開朗，婚後感情漸入佳境，且配偶帶財旺家。',
  權: '【夫妻宮化權】婚姻多為積極爭取或熱烈追求而來，配偶個性強、具決斷力與領導欲，家庭大事宜多尊重其裁決，學會適度放手。',
  科: '【夫妻宮化科】視為清貴之祿，夫妻相處重視禮節、文化與精神共鳴，配偶具專業素養或好名聲，利於白頭偕老。',
  忌: '【夫妻宮化忌】代表對感情執念深厚，屬於宿緣課題。三合古典指引：宜晚婚修身，且日常相處宜抱持無私包容心態，輔以住宅空間名位相安，即可轉化忌星帶來之執念。',
};

export const MARRIAGE_STARS_BRIEF: Record<string, string> = {
  紅鸞: '婚戀正緣吉星，入命身或夫妻主喜氣盈門；流年逢之婚戀有動',
  天喜: '添丁婚喜之星，與紅鸞相互引動，主佳偶良緣與喜事到來',
  天姚: '才藝風采桃花，增添夫妻生活浪漫情調與審美共鳴',
  咸池: '感性魅力桃花，人緣極佳，婚後宜將魅力轉化為社交公關與伴侶情趣',
  孤辰: '獨立清高之星，入夫妻宮代表伴侶需要個人獨處思考空間',
  寡宿: '靜思內斂之星，入夫妻宮宜避免冷戰，多主動關懷溫暖對方',
};

export const HEMING_SCORE_CRITERIA: Record<string, string> = {
  五星: '雙方夫妻宮與命宮互映（天作之合），四化祿科相濟，福德宮雙吉，子平八字干支相合互補',
  四星: '一方夫妻宮對應對方命宮或三方，四化以祿權科為主，五行互濟，感情基礎扎實',
  三星: '命格互有互補但各具鮮明稜角，需透過五行通關與溝通磨合，長期關係穩定',
  二星: '夫妻宮或福德宮見煞忌衝擊，地支相沖，感情起伏較大，需雙方主動修心並配合陽宅名位調整',
  一星: '多重煞忌交會夫妻福德，需以大智慧包容、晚婚並嚴格落實陽宅西北/西南定位以化煞為夷',
};

export const HEMING_METHODOLOGY = `
## 紫微斗數三合正宗合盤分析五步法與雙宮聯參體系
1. 【雙宮聯參鐵律】：「看婚姻不可單看夫妻宮，必須同時參詳福德宮。」夫妻宮代表外在互動與配偶氣質，福德宮代表深層精神默契與一世福澤。
2. 【天作之合標準】：甲方夫妻宮主星對應乙方命宮主星，且乙方夫妻宮主星對應甲方命宮主星，為三合古典合盤「雙向互映，天作良緣」之最高格局；單向對應則為相惜良配。
3. 【太陽太陰日月中和】：女命以太陽星廟旺利陷觀夫曜貴氣與事業；男命以太陰星廟旺利陷觀妻星賢淑溫良與家庭調和。
4. 【四化飛化互參】：雙方生年四化互飛入對方命身、夫妻、福德、財帛宮，辨析互惠助益（化祿）、共同承擔（化權）、知音相敬（化科）與課題磨合（化忌）。
5. 【名位相等陽宅化命】：依託《易經》乾坤定位法則，人事努力（1/3）加上環境名位調適（1/3）必能轉化先天稟賦（1/3）。夫妻主臥宜安於住宅「西北方（乾位）」或「西南方（坤位）」，構成地天泰卦之大吉象；切忌西北或西南角設為廚房火煞衝破。
`;

// 天干五行與陰陽
const STEM_ELEMENT: Record<string, FiveElement> = {
  甲: '木',
  乙: '木',
  丙: '火',
  丁: '火',
  戊: '土',
  己: '土',
  庚: '金',
  辛: '金',
  壬: '水',
  癸: '水',
};

// 地支五行
const BRANCH_ELEMENT: Record<string, FiveElement> = {
  子: '水',
  丑: '土',
  寅: '木',
  卯: '木',
  辰: '土',
  巳: '火',
  午: '火',
  未: '土',
  申: '金',
  酉: '金',
  戌: '土',
  亥: '水',
};

// 五行生剋
const FIVE_ELEMENTS_RELATION: Record<FiveElement, { generates: FiveElement; generatedBy: FiveElement; conquers: FiveElement; conqueredBy: FiveElement }> = {
  木: { generates: '火', generatedBy: '水', conquers: '土', conqueredBy: '金' },
  火: { generates: '土', generatedBy: '木', conquers: '金', conqueredBy: '水' },
  土: { generates: '金', generatedBy: '火', conquers: '水', conqueredBy: '木' },
  金: { generates: '水', generatedBy: '土', conquers: '木', conqueredBy: '火' },
  水: { generates: '木', generatedBy: '金', conquers: '火', conqueredBy: '土' },
};

// 天干五合
const STEM_COMBINATIONS: Record<string, { partner: string; transformed: FiveElement; name: string }> = {
  甲: { partner: '己', transformed: '土', name: '甲己合化中正之土' },
  己: { partner: '甲', transformed: '土', name: '甲己合化中正之土' },
  乙: { partner: '庚', transformed: '金', name: '乙庚合化仁義之金' },
  庚: { partner: '乙', transformed: '金', name: '乙庚合化仁義之金' },
  丙: { partner: '辛', transformed: '水', name: '丙辛合化威制之水' },
  辛: { partner: '丙', transformed: '水', name: '丙辛合化威制之水' },
  丁: { partner: '壬', transformed: '木', name: '丁壬合化天德之木' },
  壬: { partner: '丁', transformed: '木', name: '丁壬合化天德之木' },
  戊: { partner: '癸', transformed: '火', name: '戊癸合化禮智之火' },
  癸: { partner: '戊', transformed: '火', name: '戊癸合化禮智之火' },
};

// 地支六合
const BRANCH_SIX_COMBINATIONS: Record<string, { partner: string; transformed: FiveElement; name: string }> = {
  子: { partner: '丑', transformed: '土', name: '子丑六合化土' },
  丑: { partner: '子', transformed: '土', name: '子丑六合化土' },
  寅: { partner: '亥', transformed: '木', name: '寅亥六合化木' },
  亥: { partner: '寅', transformed: '木', name: '寅亥六合化木' },
  卯: { partner: '戌', transformed: '火', name: '卯戌六合化火' },
  戌: { partner: '卯', transformed: '火', name: '卯戌六合化火' },
  辰: { partner: '酉', transformed: '金', name: '辰酉六合化金' },
  酉: { partner: '辰', transformed: '金', name: '辰酉六合化金' },
  巳: { partner: '申', transformed: '水', name: '巳申六合化水' },
  申: { partner: '巳', transformed: '水', name: '巳申六合化水' },
  午: { partner: '未', transformed: '土', name: '午未六合化土' },
  未: { partner: '午', transformed: '土', name: '午未六合化土' },
};

// 地支六沖
const BRANCH_SIX_CLASHES: Record<string, { target: string; name: string }> = {
  子: { target: '午', name: '子午相沖（水火交戰）' },
  午: { target: '子', name: '子午相沖（水火交戰）' },
  丑: { target: '未', name: '丑未相沖（濕燥土沖）' },
  未: { target: '丑', name: '丑未相沖（濕燥土沖）' },
  寅: { target: '申', name: '寅申相沖（金木交戰）' },
  申: { target: '寅', name: '寅申相沖（金木交戰）' },
  卯: { target: '酉', name: '卯酉相沖（金木交鋒）' },
  酉: { target: '卯', name: '卯酉相沖（金木交鋒）' },
  辰: { target: '戌', name: '辰戌相沖（魁罡衝動）' },
  戌: { target: '辰', name: '辰戌相沖（魁罡衝動）' },
  巳: { target: '亥', name: '巳亥相沖（水火相激）' },
  亥: { target: '巳', name: '巳亥相沖（水火相激）' },
};

// 地支六害 (相害)
const BRANCH_SIX_HARMS: Record<string, string> = {
  子: '未',
  未: '子',
  丑: '午',
  午: '丑',
  寅: '巳',
  巳: '寅',
  卯: '辰',
  辰: '卯',
  申: '亥',
  亥: '申',
  酉: '戌',
  戌: '酉',
};

// 地支三合局
const BRANCH_TRIPLE_HARMONIES: { branches: string[]; element: FiveElement; name: string }[] = [
  { branches: ['申', '子', '辰'], element: '水', name: '申子辰三合水局' },
  { branches: ['巳', '酉', '丑'], element: '金', name: '巳酉丑三合金局' },
  { branches: ['寅', '午', '戌'], element: '火', name: '寅午戌三合火局' },
  { branches: ['亥', '卯', '未'], element: '木', name: '亥卯未三合木局' },
];

export interface PersonSynastryInput {
  name: string;
  gender: '男' | '女';
  birthDate: Date | string;
  role?: string;
}

export interface ZiweiPersonHemingProfile {
  name: string;
  gender: '男' | '女';
  mingGongStars: string[];
  mingGongType: '殺破狼開創型' | '機月同梁文職型' | '紫府相守成型' | '日月巨門思辨型';
  fuqiStars: string[];
  fuqiSihua: string[];
  fuqiSummary: string;
  fuqiGood: string;
  fuqiBad: string;
  fuqiTiming: string;
  fuqiClassicQuote?: string;
  fuqiNiQuote?: string;
  fudeStars: string[];
  fudeSihua: string[];
  fudeEvaluation: string;
  sunMoonStatus: string;
}

export interface ZiweiHemingAnalysis {
  starRating: '五星' | '四星' | '三星' | '二星' | '一星';
  starRatingCriteria: string;
  destinyType: string;
  dualPalacePrinciple: string;
  person1Profile: ZiweiPersonHemingProfile;
  person2Profile: ZiweiPersonHemingProfile;
  fiveSteps: {
    step1BaseCompatibility: string;
    step2SpouseCrossMatch: string;
    step3SunMoonAnalysis: string;
    step4SihuaMutualFly: string;
    step5TimingAndYangzhai: string;
  };
}

/**
 * 八字合婚評析報告結構 (整合子平八字 + 紫微斗數倪海廈《天紀》合盤體系)
 */
export interface BaziSynastryResult {
  person1: {
    name: string;
    gender: '男' | '女';
    solarDate: string;
    fourPillarsText: string;
    dayMaster: string;
    energyStatus: string;
    chart: BaziChart;
    ziweiChart?: ZiweiChart;
  };
  person2: {
    name: string;
    gender: '男' | '女';
    solarDate: string;
    fourPillarsText: string;
    dayMaster: string;
    energyStatus: string;
    chart: BaziChart;
    ziweiChart?: ZiweiChart;
  };
  score: number; // 0 ~ 100
  level: string; // 如：天作之合 · 琴瑟和鳴
  summary: string;
  dimensions: {
    dayMasterSynergy: {
      score: number; // 滿分 25
      relationType: '天干五合' | '相生' | '同氣比和' | '相剋相制';
      description: string;
      advice: string;
    };
    spousePalaceSynergy: {
      score: number; // 滿分 25
      relationType: '六合' | '三合半合' | '平和無沖' | '相沖' | '相害相刑';
      description: string;
      advice: string;
    };
    fiveElementsComplementarity: {
      score: number; // 滿分 30
      usefulElementsSupport: string;
      lackingElementsBalance: string;
      complementarityDescription: string;
    };
    yearPillarSynergy: {
      score: number; // 滿分 20
      naYinRelation: string;
      zodiacRelation: string;
      description: string;
    };
  };
  bridgingElement: {
    element: FiveElement;
    explanation: string;
    dailyTips: string[];
  };
  fourPillarsDetailedCross: {
    pillarName: '年柱 (根基)' | '月柱 (情緣)' | '日柱 (夫妻本位)' | '時柱 (子嗣歸宿)';
    p1GanZhi: string;
    p2GanZhi: string;
    relation: string;
    verdict: string;
  }[];
  marriageAdvice: {
    emotionalCommunication: string;
    financialManagement: string;
    familyAndRelatives: string;
    growthTogether: string;
  };
  ziweiHeming: ZiweiHemingAnalysis;
}

function classifyMingGongType(stars: string[]): '殺破狼開創型' | '機月同梁文職型' | '紫府相守成型' | '日月巨門思辨型' {
  if (stars.some((s) => ['七殺', '破軍', '貪狼', '廉貞'].includes(s))) return '殺破狼開創型';
  if (stars.some((s) => ['天機', '太陰', '天同', '天梁'].includes(s))) return '機月同梁文職型';
  if (stars.some((s) => ['紫微', '天府', '天相', '武曲'].includes(s))) return '紫府相守成型';
  return '日月巨門思辨型';
}

function extractPalaceMajorStarsWithOpp(zw: ZiweiChart, palaceName: string): { cell: PalaceCell; stars: string[]; sihua: string[] } {
  const cell = zw.palacesList.find((p) => p.name === palaceName) || zw.palacesList[0];
  let stars = cell.majorStars.map((s) => s.name);
  const sihua = [...cell.majorStars, ...cell.luckyStars].filter((s) => s.transformation).map((s) => `${s.name}化${s.transformation}`);
  if (stars.length === 0) {
    // 借對宮主星
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
    const oppIdx = (branches.indexOf(cell.branch) + 6) % 12;
    const oppCell = zw.palaces[branches[oppIdx]];
    if (oppCell) {
      stars = oppCell.majorStars.map((s) => s.name);
    }
  }
  return { cell, stars, sihua };
}

function buildZiweiPersonHemingProfile(name: string, gender: '男' | '女', zw: ZiweiChart): ZiweiPersonHemingProfile {
  const ming = extractPalaceMajorStarsWithOpp(zw, '命宮');
  const fuqi = extractPalaceMajorStarsWithOpp(zw, '夫妻宮');
  const fude = extractPalaceMajorStarsWithOpp(zw, '福德宮');

  const primaryFuqiStar = fuqi.stars[0] || '天相';
  const fuqiInfo = STAR_IN_FUQI_GU[primaryFuqiStar] || STAR_IN_FUQI_GU['天相'];
  const sihuaNotes = fuqi.sihua
    .map((sh) => {
      const type = sh.slice(-1);
      return SIHUA_IN_FUQI_GU[type] || '';
    })
    .filter(Boolean);

  // 福德宮評估（雙宮聯參：看婚姻必同時看夫妻宮與福德宮）
  const fudeHasJi = fude.sihua.some((s) => s.endsWith('化忌'));
  const fudeHasLuKe = fude.sihua.some((s) => s.endsWith('化祿') || s.endsWith('化科'));
  const fudeUnluckyCount = fude.cell.unluckyStars.length;
  let fudeEvaluation = `福德宮坐【${fude.stars.join('、') || '借對宮星'}】`;
  if (fudeHasJi) {
    fudeEvaluation += `，逢${fude.sihua.join('、')}。三合易理指引：「福德宮代表夫妻深層精神默契與一世福祿」，逢化忌易思慮過重、多疑掛心，需修養平常心，避免把外界壓力帶入家庭。`;
  } else if (fudeHasLuKe && fudeUnluckyCount === 0) {
    fudeEvaluation += `，見吉化（${fude.sihua.join('、')}）且無煞星衝破，主深層精神契合度高，婚姻福澤綿長。`;
  } else {
    fudeEvaluation += `，氣場平穩，夫妻相處重在精神共鳴與日常互相體諒。`;
  }

  // 太陽與太陰星象狀態
  let sunStarPalace = '';
  let sunBrightness = '';
  let sunTrans = '';
  let moonStarPalace = '';
  let moonBrightness = '';
  let moonTrans = '';
  for (const p of zw.palacesList) {
    for (const s of p.majorStars) {
      if (s.name === '太陽') {
        sunStarPalace = p.name;
        sunBrightness = s.brightness || '平';
        sunTrans = s.transformation ? `化${s.transformation}` : '';
      }
      if (s.name === '太陰') {
        moonStarPalace = p.name;
        moonBrightness = s.brightness || '平';
        moonTrans = s.transformation ? `化${s.transformation}` : '';
      }
    }
  }
  const sunMoonStatus =
    gender === '女'
      ? `女命觀夫星【太陽】落於${sunStarPalace}（${sunBrightness}${sunTrans}）：${['廟', '旺', '得'].includes(sunBrightness) ? '太陽廟旺得地，主旺夫益子，得賢明有擔當之伴侶。' : '太陽較為收斂，婚姻宜選成熟穩重之伴侶，互相扶持。'}`
      : `男命觀妻星【太陰】落於${moonStarPalace}（${moonBrightness}${moonTrans}）：${['廟', '旺', '得'].includes(moonBrightness) ? '太陰廟旺清朗，主得溫婉賢淑、善持家理財之佳偶。' : '太陰較為柔和，先生宜多體貼太太情緒，並主動做好婆媳溝通橋樑。'}`;

  return {
    name,
    gender,
    mingGongStars: ming.stars,
    mingGongType: classifyMingGongType(ming.stars),
    fuqiStars: fuqi.stars,
    fuqiSihua: fuqi.sihua,
    fuqiSummary: fuqiInfo.summary + (sihuaNotes.length ? ` ${sihuaNotes.join(' ')}` : ''),
    fuqiGood: fuqiInfo.good,
    fuqiBad: fuqiInfo.bad,
    fuqiTiming: fuqiInfo.timing,
    fuqiClassicQuote: fuqiInfo.classicQuote || fuqiInfo.ni_quote,
    fuqiNiQuote: fuqiInfo.classicQuote || fuqiInfo.ni_quote,
    fudeStars: fude.stars,
    fudeSihua: fude.sihua,
    fudeEvaluation,
    sunMoonStatus,
  };
}

function buildZiweiHemingAnalysis(
  p1Input: PersonSynastryInput,
  p2Input: PersonSynastryInput,
  zw1: ZiweiChart,
  zw2: ZiweiChart,
  baziScore: number
): ZiweiHemingAnalysis {
  const prof1 = buildZiweiPersonHemingProfile(p1Input.name, p1Input.gender, zw1);
  const prof2 = buildZiweiPersonHemingProfile(p2Input.name, p2Input.gender, zw2);

  // 第一步：命格基礎兼容性
  let step1 = `${prof1.name}命宮屬【${prof1.mingGongType}】（${prof1.mingGongStars.join('、')}），${prof2.name}命宮屬【${prof2.mingGongType}】（${prof2.mingGongStars.join('、')}）。`;
  if (prof1.mingGongType === prof2.mingGongType) {
    if (prof1.mingGongType === '殺破狼開創型') {
      step1 += '雙方皆為殺破狼開創格局，行動力強、火花四射，宜各自在事業領域衝刺，家中事務採取分工制，避免兩強硬碰硬。';
    } else {
      step1 += '雙方同屬相近星系格局，生活節奏、處世價值觀高度契合，極易產生共鳴。';
    }
  } else if (
    (prof1.mingGongType === '殺破狼開創型' && prof2.mingGongType === '機月同梁文職型') ||
    (prof2.mingGongType === '殺破狼開創型' && prof1.mingGongType === '機月同梁文職型')
  ) {
    step1 += '此乃經典「殺破狼配機月同梁」之動靜互補格局：一方擅長在外開疆拓土，另一方擅長運籌帷幄與穩健守成，懂得欣賞彼此差異即為絕配。';
  } else {
    step1 += '雙方星系剛柔互濟，一重開創決斷、一重穩健協調，在家庭與事業上能形成良好的互補拍檔。';
  }

  // 第二步：夫妻宮互參 & 天作之合檢測
  const p1FuqiMatchesP2Ming = prof1.fuqiStars.some((s) => prof2.mingGongStars.includes(s));
  const p2FuqiMatchesP1Ming = prof2.fuqiStars.some((s) => prof1.mingGongStars.includes(s));
  let step2 = '';
  let destinyType = '星曜互補 · 相濡以沫型';
  if (p1FuqiMatchesP2Ming && p2FuqiMatchesP1Ming) {
    step2 = `【天作之合最高級匹配】${prof1.name}夫妻宮主星（${prof1.fuqiStars.join('、')}）正映${prof2.name}命宮，且${prof2.name}夫妻宮主星（${prof2.fuqiStars.join('、')}）亦正映${prof1.name}命宮！符合三合古典合盤「雙向互映，天作良緣」之最高格局。`;
    destinyType = '天作之合 · 雙星互映正緣';
  } else if (p1FuqiMatchesP2Ming || p2FuqiMatchesP1Ming) {
    step2 = `【良配單向對應】其中一方夫妻宮主星直接對應另一方命宮主星（${prof1.name}夫妻宮：${prof1.fuqiStars.join('、')}；${prof2.name}夫妻宮：${prof2.fuqiStars.join('、')}），代表彼此正是心中尋覓的理想伴侶原型，一見投緣。`;
    destinyType = '宿世良配 · 命夫對應型';
  } else {
    step2 = `${prof1.name}夫妻宮坐【${prof1.fuqiStars.join('、')}】，${prof2.name}夫妻宮坐【${prof2.fuqiStars.join('、')}】。雙方透過三方四正星曜交會互動，相處重在後天理解與雙宮（夫妻+福德）共修。`;
  }

  // 第三步：太陽太陰星象分析
  const step3 = `${prof1.sunMoonStatus} ${prof2.sunMoonStatus}`;

  // 第四步：四化飛化互參
  const findWhereSihuaLands = (sourceZw: ZiweiChart, targetZw: ZiweiChart, sourceName: string, targetName: string) => {
    const notes: string[] = [];
    for (const p of sourceZw.palacesList) {
      for (const s of [...p.majorStars, ...p.luckyStars]) {
        if (s.transformation === '祿' || s.transformation === '科' || s.transformation === '權' || s.transformation === '忌') {
          // 找這顆星在對方命盤哪個宮位
          const targetPalace = targetZw.palacesList.find((tp) =>
            [...tp.majorStars, ...tp.luckyStars].some((ts) => ts.name === s.name)
          );
          if (targetPalace && ['命宮', '夫妻宮', '福德宮', '財帛宮', '官祿宮', '田宅宮'].includes(targetPalace.name)) {
            if (s.transformation === '祿') {
              notes.push(`${sourceName}生年【${s.name}化祿】照入${targetName}之「${targetPalace.name}」（帶來福氣與財祿助益）`);
            } else if (s.transformation === '科') {
              notes.push(`${sourceName}生年【${s.name}化科】照入${targetName}之「${targetPalace.name}」（帶來貴人與理性尊重）`);
            } else if (s.transformation === '權') {
              notes.push(`${sourceName}生年【${s.name}化權】照入${targetName}之「${targetPalace.name}」（帶來積極助力與決斷引導）`);
            } else if (s.transformation === '忌' && ['命宮', '夫妻宮', '福德宮'].includes(targetPalace.name)) {
              notes.push(`${sourceName}生年【${s.name}化忌】落入${targetName}之「${targetPalace.name}」（代表深度牽掛與在乎，需避免過度干涉）`);
            }
          }
        }
      }
    }
    return notes.slice(0, 3).join('；') || `${sourceName}生年四化平穩護持${targetName}命盤三方`;
  };

  const fly1to2 = findWhereSihuaLands(zw1, zw2, prof1.name, prof2.name);
  const fly2to1 = findWhereSihuaLands(zw2, zw1, prof2.name, prof1.name);
  const step4 = `${fly1to2}。同時，${fly2to1}。`;

  // 第五步：婚期三層法與名位陽宅化命
  const step5 = `【婚期建議】${prof1.name}：${prof1.fuqiTiming}；${prof2.name}：${prof2.fuqiTiming}。【名位陽宅調和心法】人事努力（1/3）加上環境名位調適（1/3）必能轉化先天稟賦（1/3）：夫妻主臥室最宜安於住宅「西北方（乾位）」或「西南方（坤位）」，構成地天泰卦之大吉象；切忌西北或西南角設為廚房火煞衝破，如此即便命盤偶有星曜磨合，亦能靠名位相安之氣場化險為夷、白首同心。`;

  const dualPalacePrinciple = `三合派古典合盤核心鐵律：「看婚姻不可單看夫妻宮，必須同時參詳福德宮。」${prof1.name}${prof1.fudeEvaluation} ${prof2.name}${prof2.fudeEvaluation}`;

  let starRating: '五星' | '四星' | '三星' | '二星' | '一星' = '四星';
  if (baziScore >= 86 || (p1FuqiMatchesP2Ming && p2FuqiMatchesP1Ming)) {
    starRating = '五星';
  } else if (baziScore >= 76 || p1FuqiMatchesP2Ming || p2FuqiMatchesP1Ming) {
    starRating = '四星';
  } else if (baziScore >= 65) {
    starRating = '三星';
  } else {
    starRating = '二星';
  }

  return {
    starRating,
    starRatingCriteria: HEMING_SCORE_CRITERIA[starRating],
    destinyType,
    dualPalacePrinciple,
    person1Profile: prof1,
    person2Profile: prof2,
    fiveSteps: {
      step1BaseCompatibility: step1,
      step2SpouseCrossMatch: step2,
      step3SunMoonAnalysis: step3,
      step4SihuaMutualFly: step4,
      step5TimingAndYangzhai: step5,
    },
  };
}

/**
 * 八字合婚演算法核心
 */
export function calculateBaziSynastry(
  p1Input: PersonSynastryInput,
  p2Input: PersonSynastryInput
): BaziSynastryResult {
  const d1 = typeof p1Input.birthDate === 'string' ? new Date(p1Input.birthDate) : p1Input.birthDate;
  const d2 = typeof p2Input.birthDate === 'string' ? new Date(p2Input.birthDate) : p2Input.birthDate;

  const chart1 = calculateBaziChart(d1, p1Input.gender);
  const chart2 = calculateBaziChart(d2, p2Input.gender);

  const dm1 = chart1.dayMaster.stem;
  const dm2 = chart2.dayMaster.stem;
  const el1 = chart1.dayMaster.element;
  const el2 = chart2.dayMaster.element;

  const sp1 = chart1.pillars.day.branch;
  const sp2 = chart2.pillars.day.branch;

  // 1. 日主天干相合與情義 (滿分 25 分)
  let dayMasterScore = 15;
  let dayMasterType: '天干五合' | '相生' | '同氣比和' | '相剋相制' = '同氣比和';
  let dayMasterDesc = '';
  let dayMasterAdv = '';

  const stemCombo = STEM_COMBINATIONS[dm1];
  if (stemCombo && stemCombo.partner === dm2) {
    dayMasterScore = 25;
    dayMasterType = '天干五合';
    dayMasterDesc = `雙方日主形成「${stemCombo.name}」，此為命理中最高貴之天干正合。象徵性情自然相互吸引，彼此尊重認同，具有靈魂伴侶般的深層默契。`;
    dayMasterAdv = '先天緣分極深，遇事多坦誠分享心跡，這份正合能量能化解日常生活中的任何瑣碎分歧。';
  } else if (FIVE_ELEMENTS_RELATION[el1].generates === el2) {
    dayMasterScore = 21;
    dayMasterType = '相生';
    dayMasterDesc = `${p1Input.name}日主屬${el1}，生扶${p2Input.name}之${el2}，形成五行相生之情。相處溫潤有禮，一方樂於付出照顧，另一方深知感恩回應。`;
    dayMasterAdv = '付出者需注意保持自我空間，受照拂者應常給予肯定的言語反饋，感情更形長久。';
  } else if (FIVE_ELEMENTS_RELATION[el2].generates === el1) {
    dayMasterScore = 21;
    dayMasterType = '相生';
    dayMasterDesc = `${p2Input.name}日主屬${el2}，生扶${p1Input.name}之${el1}，彼此生生不息。相處如沐春風，在工作與生活上均能給予對方實質的心靈支撐。`;
    dayMasterAdv = '珍惜對方的包容與付出，多在生活細微處營造浪漫與驚喜。';
  } else if (el1 === el2) {
    dayMasterScore = 18;
    dayMasterType = '同氣比和';
    dayMasterDesc = `雙方日主同屬「${el1}」，比和同氣。理念價值觀高度相仿，思維節奏同步，亦師亦友，相處輕鬆自在。`;
    dayMasterAdv = '因性格接近，有時面對分歧時可能各持己見，宜建立「遇爭議時輪流決策」的良性機制。';
  } else {
    dayMasterScore = 13;
    dayMasterType = '相剋相制';
    const conqueror = FIVE_ELEMENTS_RELATION[el1].conquers === el2 ? p1Input.name : p2Input.name;
    const conquered = conqueror === p1Input.name ? p2Input.name : p1Input.name;
    dayMasterDesc = `雙方日主呈五行相剋（${el1}與${el2}）。處事方式與視角截然不同，雖具備強烈互補性，但初始階段需要磨合溝通節奏。`;
    dayMasterAdv = `以欣賞而非批判的視角看待彼此的差異，善用五行通關法則（調和五行），便能將相剋轉化為激發彼此進步的強大推力。`;
  }

  // 2. 夫妻宮日支相合 (滿分 25 分)
  let spouseScore = 15;
  let spouseType: '六合' | '三合半合' | '平和無沖' | '相沖' | '相害相刑' = '平和無沖';
  let spouseDesc = '';
  let spouseAdv = '';

  const branchSix = BRANCH_SIX_COMBINATIONS[sp1];
  const branchClash = BRANCH_SIX_CLASHES[sp1];
  const isHarm = BRANCH_SIX_HARMS[sp1] === sp2;

  // 檢查三合局
  let isTripleHarmony = false;
  let tripleName = '';
  for (const tri of BRANCH_TRIPLE_HARMONIES) {
    if (tri.branches.includes(sp1) && tri.branches.includes(sp2)) {
      isTripleHarmony = true;
      tripleName = tri.name;
      break;
    }
  }

  if (branchSix && branchSix.partner === sp2) {
    spouseScore = 25;
    spouseType = '六合';
    spouseDesc = `雙方夫妻宮（日支）形成「${branchSix.name}」。日支代表婚後生活本位與私密世界，六合主二人家庭生活節奏和諧，情投意合，向心力極強。`;
    spouseAdv = '家庭凝聚力極高，適合共同規劃長期家庭資產或共同開創事業。';
  } else if (isTripleHarmony) {
    spouseScore = 22;
    spouseType = '三合半合';
    spouseDesc = `雙方夫妻宮共會「${tripleName}」。代表兩人在家庭生活觀、金錢價值觀與休閒品味上志趣相投，婚後往往越處越融洽。`;
    spouseAdv = '保持生活的情調與儀式感，共同朋友與家庭社交生活能進一步加深感情。';
  } else if (branchClash && branchClash.target === sp2) {
    spouseScore = 8;
    spouseType = '相沖';
    spouseDesc = `雙方夫妻宮呈現「${branchClash.name}」。夫妻宮逢沖，代表兩人生活作息、個性急躁度或習慣存在反差，偶有言語交鋒。`;
    spouseAdv = '記住「沖則動，動則變」。相沖並非絕配，而是提醒彼此需給予對方獨立自主的個人空間，遇爭執時切忌翻舊帳，靜心冷靜三分鐘。';
  } else if (isHarm) {
    spouseScore = 10;
    spouseType = '相害相刑';
    spouseDesc = `雙方夫妻宮地支見相害（${sp1}${sp2}相害）。在情緒敏感點或特定生活細節上易產生隱性誤解，需要更多耐心傾聽。`;
    spouseAdv = '培養主動對話與澄清誤會的習慣，多將心中感受用溫柔文字或平和語言表達，切勿累積心結。';
  } else {
    spouseScore = 16;
    spouseType = '平和無沖';
    spouseDesc = `雙方夫妻宮地支相安無沖（${sp1}與${sp2}），五行氣息平穩。日常生活如細水長流，安居樂業，屬於穩定持重之配。`;
    spouseAdv = '在平凡日子中常保感恩與互相欣賞的心，平淡之中自見真情。';
  }

  // 3. 五行能量互補與喜用神互助 (滿分 30 分)
  let elemCompScore = 18;
  const e1 = chart1.fiveElements;
  const e2 = chart2.fiveElements;

  // 檢驗互補：一方缺乏的五行（< 15%），另一方是否充沛（>= 25%）
  const elementsList: FiveElement[] = ['木', '火', '土', '金', '水'];
  const p1Lacking: FiveElement[] = [];
  const p2Lacking: FiveElement[] = [];
  const compElements: FiveElement[] = [];

  const keyMap: Record<FiveElement, keyof FiveElementsBreakdown> = {
    木: 'wood',
    火: 'fire',
    土: 'earth',
    金: 'metal',
    水: 'water',
  };

  elementsList.forEach((el) => {
    const k = keyMap[el];
    if (e1[k] < 15) p1Lacking.push(el);
    if (e2[k] < 15) p2Lacking.push(el);
    if ((e1[k] < 15 && e2[k] >= 22) || (e2[k] < 15 && e1[k] >= 22)) {
      compElements.push(el);
    }
  });

  // 檢驗喜用神互助：一方喜用神是否出現在另一方的強旺五行中
  let usefulSupportCount = 0;
  const useful1 = chart1.favorableElements.useful;
  const useful2 = chart2.favorableElements.useful;

  useful1.forEach((u) => {
    if (e2[keyMap[u]] >= 20) usefulSupportCount++;
  });
  useful2.forEach((u) => {
    if (e1[keyMap[u]] >= 20) usefulSupportCount++;
  });

  elemCompScore += Math.min(compElements.length * 3 + usefulSupportCount * 3, 12);
  elemCompScore = Math.min(elemCompScore, 30);

  const usefulSupportDesc =
    usefulSupportCount > 0
      ? `雙方互為喜用吉曜！${p1Input.name}所喜之五行在${p2Input.name}命中得以生旺，反之亦然。彼此在一起能增益運勢，互為生命貴人。`
      : `雙方五行流轉各有專長，可透過居家環境與生活色彩協調五行之氣。`;

  const compDesc =
    compElements.length > 0
      ? `五行互補顯著：雙方在「${compElements.join('、')}」能量上形成完美互補，一人之不足恰為另一人之優勢，家庭五行圓融無缺。`
      : `雙方五行能量配置各有千秋，相處重在因勢利導。`;

  // 4. 年柱納音與生肖合沖 (滿分 20 分)
  let yearScore = 12;
  const yb1 = chart1.pillars.year.branch;
  const yb2 = chart2.pillars.year.branch;
  const ny1 = chart1.pillars.year.naYin;
  const ny2 = chart2.pillars.year.naYin;

  let zodiacRel = '生肖相合平順';
  if (BRANCH_SIX_COMBINATIONS[yb1]?.partner === yb2) {
    yearScore += 6;
    zodiacRel = '生肖六合大吉（長輩緣佳）';
  } else if (BRANCH_SIX_CLASHES[yb1]?.target === yb2) {
    yearScore -= 3;
    zodiacRel = '生肖相沖（家庭社交理念需調和）';
  } else {
    yearScore += 3;
  }

  const yearPillarDesc = `年柱代表祖蔭根基與長輩緣分。男方納音【${ny1}】，女方納音【${ny2}】；生肖互動為「${zodiacRel}」，象徵兩個原生家庭文化融合順暢。`;

  // 5. 計算總評分 (45 ~ 99)
  const totalRaw = dayMasterScore + spouseScore + elemCompScore + yearScore;
  const finalScore = Math.max(50, Math.min(98, totalRaw));

  let level = '相濡以沫 · 歲月同舟';
  let summary = '';
  if (finalScore >= 90) {
    level = '天作之合 · 琴瑟和鳴';
    summary = '命盤多重天干地支正合，五行互補共振，是極具默契與福祿之良緣配搭。';
  } else if (finalScore >= 80) {
    level = '情深意篤 · 珠聯璧合';
    summary = '雙方在心靈追求或日常生活節奏上契合度極高，彼此扶持成就，家業興旺。';
  } else if (finalScore >= 70) {
    level = '相濡以沫 · 歲月同舟';
    summary = '基礎緣分穩固踏實，相處重視生活細節與互相體諒，細水長流幸福綿延。';
  } else if (finalScore >= 60) {
    level = '知己磨合 · 互敬成金';
    summary = '性格與行事風格各有千秋，需學會欣賞彼此的獨特性，藉由通關五行能化張力為助力。';
  } else {
    level = '修德互勉 · 順緣通關';
    summary = '個性與思考維度存在鮮明反差，宜建立良好的溝通界線，以理性與智慧經營婚姻。';
  }

  // 6. 通關五行判定 (Bridging Element)
  let bridgingEl: FiveElement = '水';
  let bridgingExp = '';
  let dailyTips: string[] = [];

  if ((el1 === '金' && el2 === '木') || (el1 === '木' && el2 === '金')) {
    bridgingEl = '水';
    bridgingExp = '金剋木，以「水」通關引化。金生水，水生木，以智慧圓融與溫柔包容化解剛毅碰撞。';
    dailyTips = ['居家可適度佈置水藍色、黑色家飾或水耕綠植', '遇分歧時先喝杯溫水平復心境，避免當下情緒硬碰硬', '多安排海邊、湖畔或水景自然散步旅行'];
  } else if ((el1 === '水' && el2 === '火') || (el1 === '火' && el2 === '水')) {
    bridgingEl = '木';
    bridgingExp = '水火相激，以「木」通關生化。水生木，木生火，將理性思維與感性熱情轉化為創造力。';
    dailyTips = ['多使用翠綠、青色系擺件，室內常設生機綠植', '共同培養讀書、學習或藝術創作等文教興趣', '遇爭辯時各自寫下訴求再交換閱讀，以文理通心'];
  } else if ((el1 === '木' && el2 === '土') || (el1 === '土' && el2 === '木')) {
    bridgingEl = '火';
    bridgingExp = '木剋土，以「火」通關調和。木生火，火生土，以熱忱、明理與感恩之心溫暖厚重守成。';
    dailyTips = ['家中常保採光充足溫暖，可適度點香氛蠟燭', '多主動讚美對方的付出與閃光點，不吝表達熱情', '共同參與陽光充足的戶外運動或野餐'];
  } else if ((el1 === '火' && el2 === '金') || (el1 === '金' && el2 === '火')) {
    bridgingEl = '土';
    bridgingExp = '火剋金，以「土」通關轉承。火生土，土生金，以穩健、踏實與信用落實熱情構想。';
    dailyTips = ['客廳與臥房採用大地色、米黃色或陶瓷藝品', '凡遇重大財務或家庭開銷，白紙黑字設立共同預算帳戶', '重視飲食規律，共同下廚享受大地食材烹飪'];
  } else {
    bridgingEl = '金';
    bridgingExp = '土剋水，以「金」通關開源。土生金，金生水，以條理、原則與專業秩序疏通情感情緒。';
    dailyTips = ['生活空間維持明亮簡約，多用白金色或金屬質感擺設', '遇到問題時建立清晰的生活SOP與家務分工表', '給予彼此獨立思考的時間，注重原則性尊重'];
  }

  // 7. 四柱交叉對照
  const formatPillar = (p1Name: string, p2Name: string, name: any, v1: string, v2: string, s1: string, s2: string, b1: string, b2: string) => {
    let rel = '五行和平';
    let ver = '氣息流通相安';
    if (STEM_COMBINATIONS[s1]?.partner === s2) {
      rel = '天干正合';
      ver = '天賜良緣，理念高度對齊';
    } else if (BRANCH_SIX_COMBINATIONS[b1]?.partner === b2) {
      rel = '地支六合';
      ver = '情投意合，生活步調默契';
    } else if (BRANCH_SIX_CLASHES[b1]?.target === b2) {
      rel = '地支相沖';
      ver = '步調有差，需包容體諒';
    } else if (FIVE_ELEMENTS_RELATION[STEM_ELEMENT[s1]].generates === STEM_ELEMENT[s2]) {
      rel = '天干順生';
      ver = '彼此照拂，生生不息';
    }
    return {
      pillarName: name,
      p1GanZhi: v1,
      p2GanZhi: v2,
      relation: rel,
      verdict: ver,
    };
  };

  const p1 = chart1.pillars;
  const p2 = chart2.pillars;
  const fourPillarsDetailedCross = [
    formatPillar(p1Input.name, p2Input.name, '年柱 (根基)', `${p1.year.stem}${p1.year.branch}`, `${p2.year.stem}${p2.year.branch}`, p1.year.stem, p2.year.stem, p1.year.branch, p2.year.branch),
    formatPillar(p1Input.name, p2Input.name, '月柱 (情緣)', `${p1.month.stem}${p1.month.branch}`, `${p2.month.stem}${p2.month.branch}`, p1.month.stem, p2.month.stem, p1.month.branch, p2.month.branch),
    formatPillar(p1Input.name, p2Input.name, '日柱 (夫妻本位)', `${p1.day.stem}${p1.day.branch}`, `${p2.day.stem}${p2.day.branch}`, p1.day.stem, p2.day.stem, p1.day.branch, p2.day.branch),
    formatPillar(p1Input.name, p2Input.name, '時柱 (子嗣歸宿)', `${p1.hour.stem}${p1.hour.branch}`, `${p2.hour.stem}${p2.hour.branch}`, p1.hour.stem, p2.hour.stem, p1.hour.branch, p2.hour.branch),
  ];

  // 7. 紫微斗數 × 倪海廈《天紀》雙宮聯參與五步合盤分析
  const zw1 = calculateZiweiChart(d1, p1Input.gender);
  const zw2 = calculateZiweiChart(d2, p2Input.gender);
  const ziweiHeming = buildZiweiHemingAnalysis(p1Input, p2Input, zw1, zw2, finalScore);

  return {
    person1: {
      name: p1Input.name,
      gender: p1Input.gender,
      solarDate: d1.toISOString(),
      fourPillarsText: `${p1.year.stem}${p1.year.branch}年 ${p1.month.stem}${p1.month.branch}月 ${p1.day.stem}${p1.day.branch}日 ${p1.hour.stem}${p1.hour.branch}時`,
      dayMaster: `${chart1.dayMaster.stem} (${chart1.dayMaster.element})`,
      energyStatus: chart1.energy.status,
      chart: chart1,
      ziweiChart: zw1,
    },
    person2: {
      name: p2Input.name,
      gender: p2Input.gender,
      solarDate: d2.toISOString(),
      fourPillarsText: `${p2.year.stem}${p2.year.branch}年 ${p2.month.stem}${p2.month.branch}月 ${p2.day.stem}${p2.day.branch}日 ${p2.hour.stem}${p2.hour.branch}時`,
      dayMaster: `${chart2.dayMaster.stem} (${chart2.dayMaster.element})`,
      energyStatus: chart2.energy.status,
      chart: chart2,
      ziweiChart: zw2,
    },
    score: finalScore,
    level,
    summary,
    dimensions: {
      dayMasterSynergy: {
        score: dayMasterScore,
        relationType: dayMasterType,
        description: dayMasterDesc,
        advice: dayMasterAdv,
      },
      spousePalaceSynergy: {
        score: spouseScore,
        relationType: spouseType,
        description: spouseDesc,
        advice: spouseAdv,
      },
      fiveElementsComplementarity: {
        score: elemCompScore,
        usefulElementsSupport: usefulSupportDesc,
        lackingElementsBalance: compDesc,
        complementarityDescription: `雙方五行互補評分為 ${elemCompScore}/30。結合各自喜用神五行流通，相濡以沫能使家道日隆。`,
      },
      yearPillarSynergy: {
        score: yearScore,
        naYinRelation: `${ny1} 配 ${ny2}`,
        zodiacRelation: zodiacRel,
        description: yearPillarDesc,
      },
    },
    bridgingElement: {
      element: bridgingEl,
      explanation: bridgingExp,
      dailyTips,
    },
    fourPillarsDetailedCross,
    marriageAdvice: {
      emotionalCommunication: '建立「每日睡前十五分鐘無手機深度對話」習慣，只談感受與感謝，不談家務指責。',
      financialManagement: '建議設立「家庭共同帳戶」負責日常開銷，並保留雙方各自獨立運用的私房額度，既有合力又重尊重。',
      familyAndRelatives: '面對雙方原生家庭，原則是「誰的父母誰主面協調」，多在長輩面前稱讚對方的優點。',
      growthTogether: '每年設定一個共同完成的家庭願景（如裝潢、旅居、新技能學習），保持同舟共濟的成長活力。',
    },
    ziweiHeming,
  };
}

// ─────────────────────────────────────────────────────────────
// 👨‍👩‍👧‍👦 家人群組比對解析 (Family Group Synastry + 倪海廈《天紀》陽宅化命八卦定位)
// ─────────────────────────────────────────────────────────────

export interface FamilyMemberInput {
  name: string;
  role: string; // 父親、母親、長子、幼女、祖父、長輩等
  gender: '男' | '女';
  birthDate: Date | string;
}

export interface BaguaPositionInfo {
  trigram: '乾卦' | '坤卦' | '震卦' | '巽卦' | '坎卦' | '離卦' | '艮卦' | '兌卦';
  direction: '西北方' | '西南方' | '正東方' | '東南方' | '正北方' | '正南方' | '東北方' | '正西方';
  element: FiveElement;
  familyTitle: string;
  niMingWeiRule: string;
  tabooWarning: string;
}

export interface FamilyGroupMemberInfo {
  name: string;
  role: string;
  gender: '男' | '女';
  solarDate: string;
  dayMaster: string;
  dayMasterElement: FiveElement;
  energyStatus: string;
  fourPillarsText: string;
  assignedFamilyArchetype: string; // 舵手、調和者、開拓者、守護基石
  ziweiMingStars: string[];
  ziweiFamilyPalaceNote: string;
  baguaPosition: BaguaPositionInfo;
  chart: BaziChart;
}

function resolveBaguaPositionForFamilyRole(role: string, gender: '男' | '女', index: number): BaguaPositionInfo {
  const r = role.trim();
  if (r.includes('父') || r.includes('爸') || r.includes('夫') || r.includes('公') || r.includes('爺')) {
    return {
      trigram: '乾卦',
      direction: '西北方',
      element: '金',
      familyTitle: '乾為天 · 父位（男主人本位）',
      niMingWeiRule: '《周易·說卦傳》：「乾為首、為君、為父，居於西北。」西北乾宮為男主人本位，象徵剛健篤實、綱常自立。夫妻同居西北或西南，成天地交泰之吉象，家運隆昌、男主人自尊有威信。',
      tabooWarning: '切忌住宅西北角為廚房（火剋乾金傷男主人）或西北角為客廳（男主人把家當旅館、易聚少離多）。',
    };
  }
  if (r.includes('母') || r.includes('媽') || r.includes('妻') || r.includes('婆') || r.includes('奶')) {
    return {
      trigram: '坤卦',
      direction: '西南方',
      element: '土',
      familyTitle: '坤為地 · 母位（女主人本位）',
      niMingWeiRule: '《周易·說卦傳》：「坤為地、為母，居於西南。」西南坤宮乃母儀本位，厚德載物、柔順包容。夫妻主臥安於西北或西南最利和睦長久；單身未婚女性則宜避開純陰太盛之位。',
      tabooWarning: '切忌西南角為廚房或房屋正中央為廁所（主傷女主人脾胃與心血健康）。',
    };
  }
  if (r.includes('長子') || r.includes('大兒') || (gender === '男' && (r.includes('子') || r.includes('兒') || r.includes('兄') || r.includes('哥')) && !r.includes('次') && !r.includes('二') && !r.includes('小') && !r.includes('幼'))) {
    return {
      trigram: '震卦',
      direction: '正東方',
      element: '木',
      familyTitle: '震為雷 · 長男位（東宮太子位）',
      niMingWeiRule: '《周易·說卦傳》：「萬物出乎震，震為長男，方位正東。」長男居東方震宮，象徵旭日東升、生生不息。正位得氣，思維清明，自然養成自動自發、長幼有序之責任擔當。',
      tabooWarning: '忌正東方缺角或東邊為客廳（易致兒子坐不住、把家當旅館），且切忌將兒子安排去住西北角（成雷天大壯卦，兒子取代父親權威而長幼失序）。',
    };
  }
  if (r.includes('長女') || r.includes('大女') || r.includes('姐') || r.includes('姊') || (gender === '女' && (r.includes('女') || r.includes('妹')) && !r.includes('次') && !r.includes('二') && !r.includes('小') && !r.includes('幼'))) {
    return {
      trigram: '巽卦',
      direction: '東南方',
      element: '木',
      familyTitle: '巽為風 · 長女位（文昌清貴位）',
      niMingWeiRule: '《周易·說卦傳》：「巽為長女，其象為風、為木，方位東南。」東南方巽宮為長女本位，主柔和謙遜、才藝文昌。長女居東南位，利於身心安泰與學業修養。',
      tabooWarning: '切忌東南方為廚房或穢氣聚集，亦忌未婚女兒住進西北乾位（易養成過度強勢孤傲而不利婚嫁）。',
    };
  }
  if (r.includes('次子') || r.includes('二兒') || r.includes('中男')) {
    return {
      trigram: '坎卦',
      direction: '正北方',
      element: '水',
      familyTitle: '坎為水 · 中男位（智慧深謀位）',
      niMingWeiRule: '《周易·說卦傳》：「坎為水、為中男，方位正北。」正北坎宮為次子本位，主潤下深沉、智謀機敏。若空間格局受限，亦可協調配置於正南離位，取水火既濟之良格。',
      tabooWarning: '忌正北方陰暗潮濕或為廚房火燥相沖。',
    };
  }
  if (r.includes('次女') || r.includes('二女') || r.includes('中女')) {
    return {
      trigram: '離卦',
      direction: '正南方',
      element: '火',
      familyTitle: '離為火 · 中女位（光明文明位）',
      niMingWeiRule: '《周易·說卦傳》：「離為火、為中女，方位正南。」正南離宮為次女本位，主光明麗華、熱忱靈性。居此方位得陽明之氣，處事從容有度、才華顯揚。',
      tabooWarning: '切忌正南方為廁所污穢（水潑離火，易傷眼目與心血管氣血）。',
    };
  }
  if (r.includes('幼子') || r.includes('小兒') || r.includes('三兒') || r.includes('少男') || r.includes('弟')) {
    return {
      trigram: '艮卦',
      direction: '東北方',
      element: '土',
      familyTitle: '艮為山 · 少男位（篤實成才位）',
      niMingWeiRule: '《周易·說卦傳》：「艮為山、為少男，方位東北。」東北艮宮為少男本位，象徵止靜篤實、堅毅不拔。幼子居此，能養靜氣定力，戒浮躁之性。',
      tabooWarning: '東北方屬鬼門與少男位，忌設廚房或化糞池，宜保持整潔明亮。',
    };
  }
  if (r.includes('幼女') || r.includes('小女') || r.includes('三女') || r.includes('少女')) {
    return {
      trigram: '兌卦',
      direction: '正西方',
      element: '金',
      familyTitle: '兌為澤 · 少女位（喜悅口才位）',
      niMingWeiRule: '《周易·說卦傳》：「兌為澤、為少女，方位正西。」正西兌宮為少女本位，主和悅欣樂、言辭清麗。少女居西位，性情活潑通達、人際和樂。',
      tabooWarning: '切忌正西方見廚房爐火直剋兌金（易傷呼吸系統與口舌是非）。',
    };
  }
  // 預設依性別與序號給定
  if (gender === '男') {
    return index === 0
      ? {
          trigram: '乾卦',
          direction: '西北方',
          element: '金',
          familyTitle: '乾為天 · 男主棟樑位',
          niMingWeiRule: '西北乾位主剛健統領，名位相等則心定業成。',
          tabooWarning: '忌西北角設廚房或堆放雜物。',
        }
      : {
          trigram: '震卦',
          direction: '正東方',
          element: '木',
          familyTitle: '震為雷 · 少壯開創位',
          niMingWeiRule: '正東震位主旭日東昇，利於男性成員進取向上。',
          tabooWarning: '忌東宮缺角或床緊貼東牆。',
        };
  }
  return index <= 1
    ? {
        trigram: '坤卦',
        direction: '西南方',
        element: '土',
        familyTitle: '坤為地 · 女主慈厚位',
        niMingWeiRule: '西南坤位主安穩包容，凝聚全家向心力。',
        tabooWarning: '忌西南角設廚房或中宮設廁所。',
      }
    : {
        trigram: '巽卦',
        direction: '東南方',
        element: '木',
        familyTitle: '巽為風 · 文昌秀氣位',
        niMingWeiRule: '東南巽位主文昌清貴，利於女性成員讀書修養。',
        tabooWarning: '忌東南方陰暗不潔。',
      };
}

export interface FamilyPairRelation {
  fromName: string;
  fromRole: string;
  toName: string;
  toRole: string;
  relationType: string; // 默契天合、相生相伴、性格互補、歡喜磨合
  score: number;
  description: string;
}

export interface FamilyGroupResult {
  familyTitle: string;
  memberCount: number;
  members: FamilyGroupMemberInfo[];
  householdAura: {
    dominantElement: FiveElement;
    lackingElement: FiveElement;
    elementBreakdown: FiveElementsBreakdown;
    auraTitle: string;
    description: string;
    homeEnvironmentAdvice: string;
  };
  crossMatrix: FamilyPairRelation[];
  familyRoles: {
    roleCategory: '家族舵手 (引領者)' | '心靈潤滑 (調和者)' | '活力開拓 (創新者)' | '穩健基石 (守護者)';
    membersAssigned: string[];
    description: string;
  }[];
  harmonyGuidelines: {
    title: string;
    advice: string;
  }[];
}

/**
 * 家人群組八字多維比對解析
 */
export function calculateFamilyGroup(
  membersInput: FamilyMemberInput[],
  familyTitle: string = '幸福同舟之家'
): FamilyGroupResult {
  if (membersInput.length < 2) {
    throw new Error('家人群組比對至少需 2 位成員');
  }

  // 1. 逐一計算成員八字與紫微星盤、天紀八卦定位
  const members: FamilyGroupMemberInfo[] = membersInput.map((m, idx) => {
    const bDate = typeof m.birthDate === 'string' ? new Date(m.birthDate) : m.birthDate;
    const chart = calculateBaziChart(bDate, m.gender);
    const zwChart = calculateZiweiChart(bDate, m.gender);
    const p = chart.pillars;

    // 紫微命宮與六親宮位摘要
    const ming = extractPalaceMajorStarsWithOpp(zwChart, '命宮');
    const zinv = extractPalaceMajorStarsWithOpp(zwChart, '子女宮');
    const fumu = extractPalaceMajorStarsWithOpp(zwChart, '父母宮');
    const tianzhai = extractPalaceMajorStarsWithOpp(zwChart, '田宅宮');
    const roleStr = m.role || '家庭成員';
    const isParentRole = roleStr.includes('父') || roleStr.includes('母') || roleStr.includes('爸') || roleStr.includes('媽') || roleStr.includes('爺') || roleStr.includes('奶');
    const ziweiFamilyPalaceNote = isParentRole
      ? `命宮【${ming.stars.join('、')}】· 子女宮【${zinv.stars.join('、')}】· 田宅宮【${tianzhai.stars.join('、')}】`
      : `命宮【${ming.stars.join('、')}】· 父母宮【${fumu.stars.join('、')}】· 田宅宮【${tianzhai.stars.join('、')}】`;

    const baguaPosition = resolveBaguaPositionForFamilyRole(roleStr, m.gender, idx);

    // 指派家庭原型
    let archetype = '心靈潤滑 (調和者)';
    const el = chart.dayMaster.element;
    const status = chart.energy.status;
    if (status === '身強' && (el === '金' || el === '土' || el === '木')) {
      archetype = '家族舵手 (引領者)';
    } else if (el === '火' || chart.fiveElements.fire > 25) {
      archetype = '活力開拓 (創新者)';
    } else if (el === '土' || chart.fiveElements.earth > 25) {
      archetype = '穩健基石 (守護者)';
    }

    return {
      name: m.name,
      role: roleStr,
      gender: m.gender,
      solarDate: bDate.toISOString(),
      dayMaster: `${chart.dayMaster.stem} (${el})`,
      dayMasterElement: el,
      energyStatus: status,
      fourPillarsText: `${p.year.stem}${p.year.branch} ${p.month.stem}${p.month.branch} ${p.day.stem}${p.day.branch} ${p.hour.stem}${p.hour.branch}`,
      assignedFamilyArchetype: archetype,
      ziweiMingStars: ming.stars,
      ziweiFamilyPalaceNote,
      baguaPosition,
      chart,
    };
  });

  // 2. 計算全家匯總五行場域 (Household Energy Aggregation)
  const totalBreakdown: FiveElementsBreakdown = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  members.forEach((m) => {
    totalBreakdown.wood += m.chart.fiveElements.wood;
    totalBreakdown.fire += m.chart.fiveElements.fire;
    totalBreakdown.earth += m.chart.fiveElements.earth;
    totalBreakdown.metal += m.chart.fiveElements.metal;
    totalBreakdown.water += m.chart.fiveElements.water;
  });

  const count = members.length;
  const avgBreakdown: FiveElementsBreakdown = {
    wood: Math.round(totalBreakdown.wood / count),
    fire: Math.round(totalBreakdown.fire / count),
    earth: Math.round(totalBreakdown.earth / count),
    metal: Math.round(totalBreakdown.metal / count),
    water: Math.round(totalBreakdown.water / count),
  };

  // 找出優勢五行與匱乏五行
  const elements = [
    { el: '木' as FiveElement, val: avgBreakdown.wood },
    { el: '火' as FiveElement, val: avgBreakdown.fire },
    { el: '土' as FiveElement, val: avgBreakdown.earth },
    { el: '金' as FiveElement, val: avgBreakdown.metal },
    { el: '水' as FiveElement, val: avgBreakdown.water },
  ];
  elements.sort((a, b) => b.val - a.val);

  const dominant = elements[0].el;
  const lacking = elements[elements.length - 1].el;

  let auraTitle = '厚德載物 · 興家立業氣場';
  let auraDesc = '';
  let homeEnvAdv = '';

  switch (dominant) {
    case '木':
      auraTitle = '崇德向學 · 青雲得祿氣場';
      auraDesc = '全家木氣充沛，家庭文化崇尚知識、學習與修養。家風清正溫雅，長幼有序，利於子女考運與學術功名。';
      homeEnvAdv = '客廳可多採用自然採光與木質家具，適度點綴紅色暖色調以促成木火通明之局。';
      break;
    case '火':
      auraTitle = '萬象熱忱 · 欣欣向榮氣場';
      auraDesc = '全家火氣豐厚，家族朝氣蓬勃、社交熱絡，成員具備強烈行動力與樂觀氣質。有時需注意生活節奏放緩。';
      homeEnvAdv = '居家空間宜增添水流造景或素雅米白色彩，調和火熱，營造身心放鬆之港灣。';
      break;
    case '土':
      auraTitle = '基業篤厚 · 聚富守成氣場';
      auraDesc = '全家土氣沉穩，家族底蘊深厚，重視家庭信譽、理財儲蓄與傳統人倫。遇事冷靜有定力，家風穩如泰山。';
      homeEnvAdv = '宜在家中多設闊葉水培植物或金屬現代燈飾，打破過於凝滯之土氣，活化家運流轉。';
      break;
    case '金':
      auraTitle = '規矩方圓 · 剛毅果決氣場';
      auraDesc = '全家金氣清脆，家庭做事條理分明、紀律嚴明。成員在專業技術與職場管理上極具競爭力。';
      homeEnvAdv = '多運用暖黃柔和燈光與柔軟布藝沙發，增添家庭生活的溫馨與情感流露。';
      break;
    case '水':
      auraTitle = '智深若海 · 財源廣進氣場';
      auraDesc = '全家水氣通達，成員思維敏捷、機變靈活，對市場機遇具備天然嗅覺。利於商務開拓與多元資產積累。';
      homeEnvAdv = '居家宜多增設實木家具或陶藝石材，達到水土相涵、深固根基之效果。';
      break;
  }

  // 3. 兩兩成員交叉關係矩陣 (Cross Matrix)
  const crossMatrix: FamilyPairRelation[] = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const m1 = members[i];
      const m2 = members[j];
      const dm1 = m1.chart.dayMaster.stem;
      const dm2 = m2.chart.dayMaster.stem;
      const el1 = m1.dayMasterElement;
      const el2 = m2.dayMasterElement;
      const b1 = m1.chart.pillars.day.branch;
      const b2 = m2.chart.pillars.day.branch;

      let score = 75;
      let rel = '默契相伴';
      let desc = '';

      if (STEM_COMBINATIONS[dm1]?.partner === dm2) {
        score = 95;
        rel = '天干正合';
        desc = `${m1.name}（${m1.role}）與${m2.name}（${m2.role}）天干化合，心意互通，是家庭中最具凝聚力的默契拍檔。`;
      } else if (BRANCH_SIX_COMBINATIONS[b1]?.partner === b2) {
        score = 90;
        rel = '地支六合';
        desc = `兩人日支地支六合，相處自在一見如故，彼此能深入理解對方的生活步調。`;
      } else if (BRANCH_SIX_CLASHES[b1]?.target === b2) {
        score = 65;
        rel = '歡喜磨合';
        desc = `兩人地支存在相沖，思考視角或行事節奏截然相反，需學會互相尊重邊界，以幽默感化解分歧。`;
      } else if (FIVE_ELEMENTS_RELATION[el1].generates === el2) {
        score = 85;
        rel = '五行生扶';
        desc = `${m1.name}五行生扶${m2.name}，相處充滿呵護與包容，能給予實質情感與生活支撐。`;
      } else if (FIVE_ELEMENTS_RELATION[el2].generates === el1) {
        score = 85;
        rel = '五行生扶';
        desc = `${m2.name}五行生扶${m1.name}，在關鍵決策時能給予對方深厚信心與助益。`;
      } else {
        score = 80;
        rel = '平穩同心';
        desc = `兩人氣場平穩，日常生活有商有量，各司其職維護家庭安寧。`;
      }

      crossMatrix.push({
        fromName: m1.name,
        fromRole: m1.role,
        toName: m2.name,
        toRole: m2.role,
        relationType: rel,
        score,
        description: desc,
      });
    }
  }

  // 4. 家庭角色歸屬 (Family Roles Distribution)
  const roleCategories: {
    roleCategory: '家族舵手 (引領者)' | '心靈潤滑 (調和者)' | '活力開拓 (創新者)' | '穩健基石 (守護者)';
    membersAssigned: string[];
    description: string;
  }[] = [
    {
      roleCategory: '家族舵手 (引領者)',
      membersAssigned: members.filter((m) => m.assignedFamilyArchetype.includes('舵手')).map((m) => `${m.name} (${m.role})`),
      description: '負責家庭重大決策與方向定錨，具備定力與責任感。',
    },
    {
      roleCategory: '心靈潤滑 (調和者)',
      membersAssigned: members.filter((m) => m.assignedFamilyArchetype.includes('調和')).map((m) => `${m.name} (${m.role})`),
      description: '負責成員間情緒傾聽與誤解化解，是家庭溫暖的源泉。',
    },
    {
      roleCategory: '活力開拓 (創新者)',
      membersAssigned: members.filter((m) => m.assignedFamilyArchetype.includes('開拓')).map((m) => `${m.name} (${m.role})`),
      description: '為家庭注入朝氣與創意活力，激發家庭生活情趣與前進動力。',
    },
    {
      roleCategory: '穩健基石 (守護者)',
      membersAssigned: members.filter((m) => m.assignedFamilyArchetype.includes('基石')).map((m) => `${m.name} (${m.role})`),
      description: '把控家庭資源與日常作息底線，保障家庭安全無虞。',
    },
  ];

  // 確保每個分類至少有提示文字（若無成員指派，寫「待發掘」）
  roleCategories.forEach((rc) => {
    if (rc.membersAssigned.length === 0) {
      rc.membersAssigned.push('由全體成員共同兼任');
    }
  });

  // 5. 家族和睦調適心法 (Harmony Guidelines)
  const baguaSummary = members.map((m) => `${m.name}（${m.role}）宜居【${m.baguaPosition.direction}·${m.baguaPosition.trigram}】`).join('；');
  const harmonyGuidelines = [
    {
      title: '後天八卦名位相等房間配置心法',
      advice: `《周易》名位心法：「乾父西北、坤母西南、震長子東、巽長女東南、坎中男北、離中女南、艮少男東北、兌少女西。」把家宅方位與角色對應安立，氣場清和、長幼有序。本家庭各成員本位配置：${baguaSummary}。切忌房屋正中央設廁所或西北/西南角設廚房。`,
    },
    {
      title: `家庭五行平衡調適（補強缺失的「${lacking}」五行）`,
      advice: `全家整體氣場中「${lacking}」能量相對偏弱。日常居家可多以相關五行色彩、擺飾或生活習慣進行調理，平衡全家身心磁場。`,
    },
    {
      title: '世代溝通與界線尊重心法',
      advice: '長輩與晚輩相處，以「先肯定其情緒，再討論具體事宜」為黃金準則；夫妻之間避免在孩子面前爭執，維護家庭安全感。',
    },
    {
      title: '每週家庭定心共聚時刻',
      advice: '建議每週設立一個「家庭無手機晚餐夜」或共同戶外散步時間，分享生活中的小喜悅，凝聚家族精神寄託。',
    },
  ];

  return {
    familyTitle,
    memberCount: members.length,
    members,
    householdAura: {
      dominantElement: dominant,
      lackingElement: lacking,
      elementBreakdown: avgBreakdown,
      auraTitle,
      description: auraDesc,
      homeEnvironmentAdvice: homeEnvAdv,
    },
    crossMatrix,
    familyRoles: roleCategories,
    harmonyGuidelines,
  };
}
