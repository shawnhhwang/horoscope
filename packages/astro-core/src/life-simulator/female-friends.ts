import { FiveElement } from '../bazi/types.js';
import {
  FemaleFriendProfile,
  LifeOption,
  LifeSimulationSession,
  OneInEightBillionResult,
} from './types.js';

export type RomanceFriendProfile = FemaleFriendProfile;

/**
 * 預設男性視角下之五大紅顏知己原型 (80億分之一盲盒名冊)
 */
export const DEFAULT_FEMALE_FRIENDS: FemaleFriendProfile[] = [
  {
    id: 'friend_1',
    name: '沈婉晴',
    archetype: '青梅竹馬 · 溫婉書香',
    personality: '內斂溫柔、體貼細膩、書香門第，宛如初秋午後微風。',
    baziElement: '水',
    ageOffset: -1,
    clues: ['桂花香', '手寫書籤', '老舊書店', '梧桐樹下'],
    mysteryAlias: '【素雅白裙的知性女子】',
    mysteryDescription:
      '午後巷口老書店簷下，一位身著素雅白裙的女子正在細細翻閱書冊，微風拂過，空氣中飄過一縷淡淡桂花香。她轉過身，目光清澈如水，眼神中閃過一絲似曾相識的溫柔。',
    illustration: '/images/life-simulator/romance_wanqing.jpg',
    affinity: 0,
    herAffinity: 65,
    compatibilityScore: 88,
    encounterAge: 18,
    status: 'UNKNOWN',
  },
  {
    id: 'friend_2',
    name: '林若曦',
    archetype: '熱血同窗 · 獨立奮進',
    personality: '颯爽明艷、敢愛敢恨、追求理想，擁有開創與不服輸的堅定信念。',
    baziElement: '火',
    ageOffset: 0,
    clues: ['紅色帆布鞋', '黑咖啡', '社團辯才', '短髮活力'],
    mysteryAlias: '【幹練率性的熱情女子】',
    mysteryDescription:
      '在校園社團或專案籌備的激昂會場裡，一位短髮俐落、腳踏紅色帆布鞋的女子正在白板前據理力爭。散會後，她笑著遞過來一罐黑咖啡，清脆的笑聲驅散了徹夜的疲憊。',
    illustration: '/images/life-simulator/romance_ruoxi.jpg',
    affinity: 0,
    herAffinity: 60,
    compatibilityScore: 82,
    encounterAge: 22,
    status: 'UNKNOWN',
  },
  {
    id: 'friend_3',
    name: '宋雨薇',
    archetype: '藝術靈動 · 旅途邂逅',
    personality: '空靈浪漫、熱愛自由、感性不羈，如山野清泉般不拘泥於世俗。',
    baziElement: '木',
    ageOffset: -2,
    clues: ['底片相機', '顏料指尖', '花東海風', '自由速寫'],
    mysteryAlias: '【靈動浪漫的旅人女子】',
    mysteryDescription:
      '在一列開往東海岸的慢速火車或老街畫廊中，驟雨忽至。一位胸前掛著底片相機、指尖微染水彩顏料的長裙女子坐在對座，正專注地在速寫本上勾勒著窗外雲影。她抬頭相視一笑，眉眼彎彎如月。',
    illustration: '/images/life-simulator/romance_yuwei.jpg',
    affinity: 0,
    herAffinity: 70,
    compatibilityScore: 92,
    encounterAge: 26,
    status: 'UNKNOWN',
  },
  {
    id: 'friend_4',
    name: '蘇珮儀',
    archetype: '職場菁英 · 果敢敏銳',
    personality: '雷厲風行、眼光毒辣、外冷內熱，在商海浪潮中具備強大的保護欲與謀略。',
    baziElement: '金',
    ageOffset: 1,
    clues: ['米色風衣', '金絲眼鏡', '商海決斷', '深夜霓虹'],
    mysteryAlias: '【沉著敏銳的職場女子】',
    mysteryDescription:
      '在一場事關生死存亡的商業談判中，身旁穿著米色風衣、戴著金絲眼鏡的女性夥伴言辭犀利、力挽狂瀾。深夜返程的車廂裡，她摘下眼鏡望向窗外車水馬龍，眼神中露出一瞬難得的疲倦與柔情。',
    illustration: '/images/life-simulator/romance_peiyi.jpg',
    affinity: 0,
    herAffinity: 55,
    compatibilityScore: 78,
    encounterAge: 30,
    status: 'UNKNOWN',
  },
  {
    id: 'friend_5',
    name: '趙敏芝',
    archetype: '世交千金 · 溫厚持家',
    personality: '雍容端莊、重信重禮、知書達理，具備安家定邦的傳統名門風範。',
    baziElement: '土',
    ageOffset: -3,
    clues: ['淡雅茶香', '珍珠髮夾', '長輩讚譽', '持家禮數'],
    mysteryAlias: '【氣質溫厚的世家女子】',
    mysteryDescription:
      '在家族重要茶聚與長輩宴席的一隅，一位佩戴珍珠髮夾、舉止優雅大方的女子靜坐於堂。面對長輩親友的打趣詢問，她落落大方替你化解尷尬，並體貼地奉上一盞溫熱上等烏龍茶。',
    illustration: '/images/life-simulator/romance_minzhi.jpg',
    affinity: 0,
    herAffinity: 62,
    compatibilityScore: 85,
    encounterAge: 34,
    status: 'UNKNOWN',
  },
];

/**
 * 預設女性視角下之五大藍顏知己原型 (80億分之一盲盒名冊)
 */
export const DEFAULT_MALE_FRIENDS: FemaleFriendProfile[] = [
  {
    id: 'friend_m1',
    name: '陸子軒',
    archetype: '青梅竹馬 · 溫暖清朗白襯衫學長',
    personality: '陽光體貼、清爽溫暖、品學兼優，如初春晴空般令人無比安心。',
    baziElement: '木',
    ageOffset: 1,
    clues: ['白襯衫', '單車後座', '校園林蔭', '手繪筆記'],
    mysteryAlias: '【溫暖清朗的白襯衫學長】',
    mysteryDescription:
      '校園老樟樹林蔭下碎金般的斑駁光影中，一位身著乾淨白襯衫、單手扶推單車的年輕男子回頭溫柔微笑。晨光灑在他清秀的側臉上，帶著一抹略顯青澀卻無比溫柔的笑容。他自然地接過你手中的厚重書本，聲音清冽而溫煦。',
    illustration: '/images/life-simulator/romance_male_zixuan.jpg',
    affinity: 0,
    herAffinity: 65,
    compatibilityScore: 88,
    encounterAge: 18,
    status: 'UNKNOWN',
  },
  {
    id: 'friend_m2',
    name: '傅宇霖',
    archetype: '才情同僚 · 志同道合熱血青年',
    personality: '才華橫溢、幽默敏銳、敢於冒險，與你心有靈犀的事業與生活夥伴。',
    baziElement: '火',
    ageOffset: 0,
    clues: ['黑框眼鏡', '熱美式', '深夜燈火', '敏銳洞察'],
    mysteryAlias: '【眼神堅定且才華橫溢的青年】',
    mysteryDescription:
      '在通宵達旦的創意競賽或專案辦公室裡，落地窗外霓虹閃爍，空氣中瀰漫著濃縮咖啡的香氣。他推了推精緻黑框眼鏡，在你陷入瓶頸時輕輕敲了敲桌面，遞來一張畫滿精妙架構圖的便簽。抬頭相視，眼底跳動著與你如出一轍的不服輸火焰。',
    illustration: '/images/life-simulator/romance_male_yulin.jpg',
    affinity: 0,
    herAffinity: 60,
    compatibilityScore: 82,
    encounterAge: 22,
    status: 'UNKNOWN',
  },
  {
    id: 'friend_m3',
    name: '霍柏翰',
    archetype: '沉穩律己 · 頂尖菁英雅士',
    personality: '沉著幹練、內斂深情、護短篤定，商場上運籌帷幄，對你卻細緻入微。',
    baziElement: '金',
    ageOffset: 3,
    clues: ['深灰西裝', '銀色腕錶', '雨夜黑傘', '護短從容'],
    mysteryAlias: '【深沉幹練的菁英雅士】',
    mysteryDescription:
      '在一場驟雨突襲的都市夜幕石階前，雨絲如幕，水窪倒映著金黃街燈。一柄寬大的黑色長傘穩穩遮在你的頭頂。身旁的男子身著深灰色合身高質感西服，目光深邃篤定。他將傘微偏向你，手臂被雨水浸潤亦毫不在意，低沉沉穩的嗓音彷彿能撫平一切世事紛擾。',
    illustration: '/images/life-simulator/romance_male_bohan.jpg',
    affinity: 0,
    herAffinity: 58,
    compatibilityScore: 86,
    encounterAge: 26,
    status: 'UNKNOWN',
  },
  {
    id: 'friend_m4',
    name: '江承澤',
    archetype: '藝術自由 · 溫柔隨性旅人',
    personality: '空靈不羈、細膩浪漫、深諳人心，帶你跳脫世俗樊籠的靈魂旅伴。',
    baziElement: '水',
    ageOffset: -1,
    clues: ['深藍圍巾', '木吉他', '星空海浪', '感性詩意'],
    mysteryAlias: '【溫柔隨性的藝術旅者】',
    mysteryDescription:
      '在台灣東海岸暮色與璀璨星河交織的舊木棧道長椅上，海風微拂，一位裹著深藍羊毛圍巾、懷抱木吉他的男子正低聲哼唱著老歌。身旁手沖熱茶壺蒸氣裊裊，他轉過頭對你粲然一笑，神情浪漫不羈、空靈溫柔，眼神純粹得如同倒映著整片星海。',
    illustration: '/images/life-simulator/romance_male_chengze.jpg',
    affinity: 0,
    herAffinity: 70,
    compatibilityScore: 92,
    encounterAge: 30,
    status: 'UNKNOWN',
  },
  {
    id: 'friend_m5',
    name: '顧睿安',
    archetype: '世家儒雅 · 溫潤如玉守護者',
    personality: '溫潤如玉、行事周密、進退有度，能為你遮風擋雨的堅實港灣。',
    baziElement: '土',
    ageOffset: 2,
    clues: ['素雅唐裝', '沉香蜜棗', '世交關照', '篤定承諾'],
    mysteryAlias: '【世家儒雅的溫潤長者】',
    mysteryDescription:
      '在古色古香的庭院迴廊與長輩壽宴雅室中，身著深色素雅中式立領唐裝外套的男子緩步而來。他舉止謙和有禮、談吐溫文爾雅。在你被繁瑣社交禮節所累時，他極有分寸地出面為你解圍，並在私下體貼遞來一盒精緻蜜棗與溫茶，眼神溫柔而篤定。',
    illustration: '/images/life-simulator/romance_male_ruian.jpg',
    affinity: 0,
    herAffinity: 62,
    compatibilityScore: 85,
    encounterAge: 34,
    status: 'UNKNOWN',
  },
];

/**
 * 取得初始知己名冊，支援男女雙重視角、自訂 KEYIN 生日與主角出生年份動態適配
 */
export function getInitialRomanceFriends(
  gender: '男' | '女' = '男',
  protagonistBirth?: Date | string,
  customFriends?: Partial<FemaleFriendProfile>[]
): FemaleFriendProfile[] {
  const templates = gender === '女' ? DEFAULT_MALE_FRIENDS : DEFAULT_FEMALE_FRIENDS;
  let baseYear = 1995;
  if (protagonistBirth) {
    const d = new Date(protagonistBirth);
    if (!isNaN(d.getTime())) {
      baseYear = d.getFullYear();
    }
  }

  const defaultBirthMonths = ['09-12', '03-24', '07-08', '11-19', '05-02'];

  return templates.map((tpl, idx) => {
    const custom = customFriends?.find((c) => c.id === tpl.id || c.name === tpl.name);
    const offset = custom?.ageOffset !== undefined ? custom.ageOffset : (tpl.ageOffset ?? 0);
    const targetYear = baseYear + offset;
    const defaultBirth = `${targetYear}-${defaultBirthMonths[idx % defaultBirthMonths.length]}`;
    const birthDate = custom?.birthDate || defaultBirth;

    // 若有自訂 birthDate，重新精準校準 ageOffset
    const parsedCustomYear = parseInt(birthDate.slice(0, 4));
    const effectiveOffset = !isNaN(parsedCustomYear) ? parsedCustomYear - baseYear : offset;

    return {
      ...tpl,
      name: custom?.name || tpl.name,
      birthDate,
      ageOffset: effectiveOffset,
      herAffinity: custom?.herAffinity ?? tpl.herAffinity,
      compatibilityScore: custom?.compatibilityScore ?? tpl.compatibilityScore,
      affinity: custom?.affinity ?? tpl.affinity,
      encounterAge: custom?.encounterAge ?? tpl.encounterAge,
      status: custom?.status ?? tpl.status,
    };
  });
}

/**
 * 向後相容別名：取得初始女性友人列表
 */
export function getInitialFemaleFriends(
  protagonistBirth?: Date | string,
  customFriends?: Partial<FemaleFriendProfile>[]
): FemaleFriendProfile[] {
  return getInitialRomanceFriends('男', protagonistBirth, customFriends);
}

/**
 * 取得初始男性友人列表 (女性視角)
 */
export function getInitialMaleFriends(
  protagonistBirth?: Date | string,
  customFriends?: Partial<FemaleFriendProfile>[]
): FemaleFriendProfile[] {
  return getInitialRomanceFriends('女', protagonistBirth, customFriends);
}

/**
 * 檢查並生成指定年齡的盲盒知己邂逅事件
 * 年歲搭配對齊：主角歲數 vs 相手歲數精準呼應，並提供明確的「相伴一生」誓約抉擇
 */
export function getBlindRomanticEncounter(
  age: number,
  friends: FemaleFriendProfile[],
  taiwanEraContext?: string,
  solarYear?: number,
  protagonistGender: '男' | '女' = '男'
): {
  isRomanticTurn: boolean;
  targetFriendId?: string;
  mysteryAlias?: string;
  eventTitle?: string;
  eventNarrative?: string;
  options?: LifeOption[];
} {
  // 檢索該年齡是否有對應相遇的知己
  const targetFriend = friends.find((f) => f.encounterAge === age);
  if (!targetFriend) {
    return { isRomanticTurn: false };
  }

  // 精確計算對方在相遇西曆年的歲數
  let partnerEncounterAge = age + (targetFriend.ageOffset ?? 0);
  if (solarYear && targetFriend.birthDate) {
    const fYear = parseInt(targetFriend.birthDate.slice(0, 4));
    if (!isNaN(fYear)) {
      partnerEncounterAge = Math.max(1, solarYear - fYear);
    }
  }
  targetFriend.herEncounterAge = partnerEncounterAge;

  const isFemaleProtagonist = protagonistGender === '女';
  const partnerPronoun = isFemaleProtagonist ? '他' : '她';
  const friendLabel = isFemaleProtagonist ? '藍顏知己' : '紅顏知己';

  const eraText = taiwanEraContext ? `\n\n🇹🇼【時代印記】：${taiwanEraContext}` : '';
  const eventTitle = `因緣際會 · 邂逅${targetFriend.mysteryAlias}`;

  // 年歲搭配呼應文案
  let ageCompareText = `那一年你 ${age} 歲，而${partnerPronoun}正值 ${partnerEncounterAge} 歲的風華年歲。`;
  if (partnerEncounterAge < age) {
    ageCompareText = `那一年你 ${age} 歲，身旁的${partnerPronoun}年方 ${partnerEncounterAge} 歲，意氣風發、目光澄澈。`;
  } else if (partnerEncounterAge > age) {
    ageCompareText = `那一年你 ${age} 歲，而長你歲數的${partnerPronoun}（${partnerEncounterAge} 歲）氣質沉靜從容、見識不凡。`;
  } else {
    ageCompareText = `那一年你們同為 ${age} 歲的風華同窗，眼眸間湧動著相同年代的理想與夢想。`;
  }

  // 對方好感度心理描述
  const affinityVal = targetFriend.herAffinity ?? 60;
  let herAttitudeNotice = '';
  if (affinityVal >= 65) {
    herAttitudeNotice = `💖【對方心境】：${partnerPronoun}望向你的眼神清亮而帶有一抹柔和笑意，心中對你已有 ${affinityVal}% 的默契好感度。`;
  } else {
    herAttitudeNotice = `👀【對方心境】：${partnerPronoun}神情客氣沉穩，當前對你的好感度約為 ${affinityVal}%，正在細心觀察你的言行舉止。`;
  }

  const identityHint = isFemaleProtagonist ? '男子' : '女子';
  const eventNarrative = `${targetFriend.mysteryDescription}\n\n${ageCompareText}\n${herAttitudeNotice}\n\n命運的齒輪在不經意間悄然轉動，在台灣這片充滿煙火氣的土地上，你們的視線在人潮中短暫交匯。面對眼前這位氣質出眾的${identityHint}，你的內心浮起微妙的悸動。${eraText}`;

  // 提供 4 個態度鮮明且包含「相伴一生」明確承諾的選項
  const options: LifeOption[] = [
    {
      id: `opt_romantic_spouse_${targetFriend.id}`,
      text: isFemaleProtagonist
        ? '💍【定下白首誓約 · 選擇相伴一生】動了真情，認定對方為命中良人，許下終身誓盟，約定攜手相伴一生'
        : '💍【定下白首誓約 · 選擇相伴一生】動了真情，認真向對方告白求婚，許下終身誓盟，約定攜手相伴一生',
      attitude: 'AGGRESSIVE',
      potentialImpact: { relationship: 18, health: 3, wisdom: 2, wealth: 3 },
      riskLevel: 'LOW',
    },
    {
      id: `opt_romantic_deep_${targetFriend.id}`,
      text: '🌟【深入相知 · 發展深厚情感羈絆】主動互留聯絡方式，在日後頻繁交流中加深了解，悉心培養感情',
      attitude: 'AGGRESSIVE',
      potentialImpact: { relationship: 8, knowledge: 2, wisdom: 2 },
      riskLevel: 'LOW',
    },
    {
      id: `opt_romantic_gentle_${targetFriend.id}`,
      text: '☕【知己相交 · 作為投緣莫逆好友】相視一笑以禮相待，作為彼此信任與欣賞的良師益友溫和相伴',
      attitude: 'CONSERVATIVE',
      potentialImpact: { relationship: 4, knowledge: 2, wisdom: 2 },
      riskLevel: 'LOW',
    },
    {
      id: `opt_romantic_focus_${targetFriend.id}`,
      text: '💼【婉拒深交 · 一心專注個人事業】克制心頭波瀾，客氣致意後轉身全力專注於眼下的學業與事業拼搏',
      attitude: 'MORAL',
      potentialImpact: { career: 4, wealth: 2, relationship: -3 },
      riskLevel: 'LOW',
    },
  ];

  return {
    isRomanticTurn: true,
    targetFriendId: targetFriend.id,
    mysteryAlias: targetFriend.mysteryAlias,
    eventTitle,
    eventNarrative,
    options,
  };
}

/**
 * 更新知己好友的因緣與雙向好感度
 */
export function applyRomanticDecision(
  friends: FemaleFriendProfile[],
  chosenOptionId: string,
  age: number,
  protagonistGender: '男' | '女' = '男'
): FemaleFriendProfile[] {
  const updated = JSON.parse(JSON.stringify(friends)) as FemaleFriendProfile[];

  for (const friend of updated) {
    if (chosenOptionId.includes(friend.id)) {
      if (chosenOptionId.includes('spouse')) {
        friend.affinity = 100;
        friend.herAffinity = 100;
        friend.status = 'SPOUSE';
        friend.encounterStory = `於 ${age} 歲時相逢，你們認定了彼此就是命中注定的靈魂伴侶，許下白首之誓，約定攜手相伴一生（好感度達 100%）。這份矢志不渝的諾言成為你一生命運中最溫暖深厚的港灣。`;
      } else if (chosenOptionId.includes('deep')) {
        friend.affinity = Math.min(100, friend.affinity + 35);
        friend.herAffinity = Math.min(100, (friend.herAffinity || 60) + 30);
        friend.status = age >= 30 ? 'SPOUSE' : 'BONDED';
        friend.encounterStory = `於 ${age} 歲時邂逅，你勇敢把握了這份心動，對方亦為你的才情與真誠深深傾心（對方好感度達 ${friend.herAffinity}%），彼此建立了深刻的情感連繫。`;
      } else if (chosenOptionId.includes('gentle')) {
        friend.affinity = Math.min(100, friend.affinity + 20);
        friend.herAffinity = Math.min(100, (friend.herAffinity || 60) + 18);
        friend.status = 'MET';
        friend.encounterStory = `於 ${age} 歲時相逢，你們如清風拂面般以禮相照，對方欣賞你的從容沉著（對方好感度提升至 ${friend.herAffinity}%），成為人生路上相知相惜的良友。`;
      } else if (chosenOptionId.includes('focus')) {
        friend.affinity = Math.max(0, friend.affinity - 5);
        friend.herAffinity = Math.max(0, (friend.herAffinity || 60) - 15);
        friend.status = 'MISSED';
        friend.encounterStory = `於 ${age} 歲時偶遇，你因專注學業事業而克制了心動，對方察覺到你的疏離與客套（對方好感度降至 ${friend.herAffinity}%），兩人最終在時代大潮中擦肩而過。`;
      }
    }
  }

  return updated;
}

/**
 * 簡易字串雜湊函式
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * 80億分之一的遊戲 (One in Eight Billion) 終局命運機率與知己揭曉計算
 */
export function calculateOneInEightBillion(session: LifeSimulationSession): OneInEightBillionResult {
  const hashVal = hashString(session.sessionId + session.profileName);
  const codeSuffix = (hashVal % 90000) + 10000;
  const destinyCode = `DESTINY-TW-8B-${codeSuffix}`;
  const isFemale = session.gender === '女';

  // 1. 八字先天氣候格局罕見度
  const baziRarityScore = Math.min(99.9, Math.max(78.5, 80 + (hashVal % 190) / 10));

  // 2. 自由意志路徑分歧度
  const choicePathPermutations = `約 3.48 × 10⁹ 種人生分支路徑`;
  const rarityScoreText = `全球 80 億人中僅有 1 人的專屬史詩奇蹟 (超越 99.999999% 的平行時空軌跡)`;

  // 3. 知己真身揭曉
  const friends = session.femaleFriends || getInitialRomanceFriends(session.gender);
  const revealedFriends = friends.map((f) => {
    let statusText = '未曾深入相遇';
    let fatedSummary = '在命運長河的某個轉角，你們曾處於同一片天空下，但時機尚未成熟。';

    if (f.status === 'SPOUSE') {
      statusText = '💍 結縭相守 · 一生摯愛 (相伴一生)';
      fatedSummary = `在 80 億茫茫人海中，你當年的心動抉擇讓彼此跨越千山萬水，定下白首盟約，結為同心良眷，攜手相伴一生。`;
    } else if (f.status === 'BONDED') {
      statusText = '🌟 靈魂知己 · 深刻羈絆';
      fatedSummary = `你們在人生的黃金歲月中並肩同行，彼此讀懂內心最深沉的理想，是無可取代的生命摯友。`;
    } else if (f.status === 'MET') {
      statusText = '☕ 莫逆之交 · 相知相敬';
      fatedSummary = `相逢一笑如春風化雨，彼此在歲月流轉中各自安好，留下淡淡而雋永的溫暖記憶。`;
    } else if (f.status === 'MISSED') {
      statusText = '🍂 擦肩而過 · 白月光回憶';
      fatedSummary = `那一年的轉身成就了今日的事業，但回首紅塵，那抹身影始終是心底一處純淨的微光。`;
    }

    return {
      id: f.id,
      name: f.name,
      archetype: f.archetype,
      mysteryAlias: f.mysteryAlias,
      illustration: f.illustration,
      birthDate: f.birthDate,
      herEncounterAge: f.herEncounterAge,
      affinity: f.affinity,
      herAffinity: f.herAffinity || 60,
      compatibilityScore: f.compatibilityScore || 85,
      status: f.status,
      statusText,
      fatedSummary,
    };
  });

  // 4. 因緣總評
  const spouse = revealedFriends.find((f) => f.status === 'SPOUSE');
  const bonded = revealedFriends.find((f) => f.status === 'BONDED');

  let romanticDestinySummary = '';
  if (spouse) {
    romanticDestinySummary = `【執子之手 · 天作之合】：在全地球 80 億靈魂的浩瀚星圖中，你與【${spouse.name}】（${spouse.archetype}）相知相守、許下白首盟約，於歲月風雨中約定相伴一生。當初盲盒相遇時那一刻的心動與堅定承諾，成為你一生中最無悔的 80 億分之一奇蹟。`;
  } else if (bonded) {
    romanticDestinySummary = `【靈犀相照 · 莫逆於心】：在 80 億人口的世界裡，你遇見了真正讀懂你志向的【${bonded.name}】（${bonded.archetype}）。雖未受世俗形式拘泥，但那份心靈相通的默契，跨越了時空，不負此生相逢。`;
  } else {
    romanticDestinySummary = `【獨步凌雲 · 浩氣長存】：在台灣這座巨浪翻湧的島嶼上，你將所有的柔情與力量傾注於理想與人生基業。過客皆化為人生風景，你以頂天立地的意志，走出了無愧於天地的自強史詩。`;
  }

  const cosmicPhilosophyQuote =
    '在浩瀚星球的 80 億靈魂汪洋中，你每一次看似微小的自由意志抉擇，都在編織全宇宙獨一無二的生命軌跡。因緣合和、起落隨風，能走過這趟人間，你本身就是最壯麗的奇蹟。';

  return {
    destinyCode,
    rarityScoreText,
    baziRarityScore,
    choicePathPermutations,
    romanticDestinySummary,
    revealedFriends,
    cosmicPhilosophyQuote,
  };
}
