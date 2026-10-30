import { FiveElement } from '../bazi/types.js';
import {
  FemaleFriendProfile,
  LifeOption,
  LifeSimulationSession,
  OneInEightBillionResult,
} from './types.js';

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
 * 取得初始女性友人列表，支援自訂 KEYIN 生日與男主出生年份動態適配
 */
export function getInitialFemaleFriends(
  protagonistBirth?: Date | string,
  customFriends?: Partial<FemaleFriendProfile>[]
): FemaleFriendProfile[] {
  let baseYear = 1990;
  if (protagonistBirth) {
    const d = new Date(protagonistBirth);
    if (!isNaN(d.getTime())) {
      baseYear = d.getFullYear();
    }
  }

  const defaultBirthMonths = ['09-12', '03-24', '07-08', '11-19', '05-02'];

  return DEFAULT_FEMALE_FRIENDS.map((tpl, idx) => {
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
 * 檢查並生成指定年齡的盲盒紅顏邂逅事件
 * 年歲搭配對齊：男方歲數 vs 女方歲數精準呼應
 */
export function getBlindRomanticEncounter(
  age: number,
  friends: FemaleFriendProfile[],
  taiwanEraContext?: string,
  solarYear?: number
): {
  isRomanticTurn: boolean;
  targetFriendId?: string;
  mysteryAlias?: string;
  eventTitle?: string;
  eventNarrative?: string;
  options?: LifeOption[];
} {
  // 檢索該年齡是否有對應相遇的女性
  const targetFriend = friends.find((f) => f.encounterAge === age);
  if (!targetFriend) {
    return { isRomanticTurn: false };
  }

  // 精確計算女方在相遇西曆年的歲數
  let herEncounterAge = age + (targetFriend.ageOffset ?? 0);
  if (solarYear && targetFriend.birthDate) {
    const fYear = parseInt(targetFriend.birthDate.slice(0, 4));
    if (!isNaN(fYear)) {
      herEncounterAge = Math.max(1, solarYear - fYear);
    }
  }
  targetFriend.herEncounterAge = herEncounterAge;

  const eraText = taiwanEraContext ? `\n\n🇹🇼【時代印記】：${taiwanEraContext}` : '';
  const eventTitle = `因緣際會 · 邂逅${targetFriend.mysteryAlias}`;

  // 年歲搭配呼應文案
  let ageCompareText = `那一年你 ${age} 歲，而她正值 ${herEncounterAge} 歲的韶華年歲。`;
  if (herEncounterAge < age) {
    ageCompareText = `那一年你 ${age} 歲，身旁的她年方 ${herEncounterAge} 歲，宛如初綻新荷。`;
  } else if (herEncounterAge > age) {
    ageCompareText = `那一年你 ${age} 歲，而長你歲數的她（${herEncounterAge} 歲）氣質沉靜從容、見識不凡。`;
  } else {
    ageCompareText = `那一年你們同為 ${age} 歲的風華同窗，眼眸間湧動著相同年代的夢想。`;
  }

  // 對方好感度心理描述
  let herAttitudeNotice = '';
  if (targetFriend.herAffinity >= 65) {
    herAttitudeNotice = `💖【對方心境】：她望向你的眼神清亮而帶有一抹柔和笑意，心中對你已有 ${targetFriend.herAffinity}% 的默契好感度。`;
  } else {
    herAttitudeNotice = `👀【對方心境】：她神情客氣沉穩，當前對你的好感度約為 ${targetFriend.herAffinity}%，正在細心觀察你的言行舉止。`;
  }

  const eventNarrative = `${targetFriend.mysteryDescription}\n\n${ageCompareText}\n${herAttitudeNotice}\n\n命運的齒輪在不經意間悄然轉動，在台灣這片充滿煙火氣的土地上，你們的視線在人潮中短暫交匯。面對眼前這位氣質獨特的女子，你的內心浮起微妙的悸動。${eraText}`;

  const options: LifeOption[] = [
    {
      id: `opt_romantic_deep_${targetFriend.id}`,
      text: '主動上前攀談、留下聯絡方式，並真誠相約日後再敘',
      attitude: 'AGGRESSIVE',
      potentialImpact: { relationship: 6, knowledge: 2, wisdom: 2 },
      riskLevel: 'LOW',
    },
    {
      id: `opt_romantic_gentle_${targetFriend.id}`,
      text: '相視一笑以禮相待，作為難得投緣的知心好友溫和交流',
      attitude: 'CONSERVATIVE',
      potentialImpact: { relationship: 4, knowledge: 1, wisdom: 1 },
      riskLevel: 'LOW',
    },
    {
      id: `opt_romantic_focus_${targetFriend.id}`,
      text: '克制心頭波瀾，客氣致意後轉身全力專注於眼下的學業與事業拼搏',
      attitude: 'MORAL',
      potentialImpact: { career: 4, relationship: -2 },
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
 * 更新紅顏知己的因緣與雙向好感度
 */
export function applyRomanticDecision(
  friends: FemaleFriendProfile[],
  chosenOptionId: string,
  age: number
): FemaleFriendProfile[] {
  const updated = JSON.parse(JSON.stringify(friends)) as FemaleFriendProfile[];

  for (const friend of updated) {
    if (chosenOptionId.includes(friend.id)) {
      if (chosenOptionId.includes('deep')) {
        friend.affinity = Math.min(100, friend.affinity + 35);
        friend.herAffinity = Math.min(100, (friend.herAffinity || 60) + 30);
        friend.status = age >= 30 ? 'SPOUSE' : 'BONDED';
        friend.encounterStory = `於 ${age} 歲時邂逅，你勇敢把握了這份心動，對方亦為你的熱忱與才情深深傾心（對方好感度達 ${friend.herAffinity}%），彼此建立了深刻的情感連繫。`;
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
 * 80億分之一的遊戲 (One in Eight Billion) 終局命運機率與紅顏揭曉計算
 */
export function calculateOneInEightBillion(session: LifeSimulationSession): OneInEightBillionResult {
  const age = session.currentAge;
  const hashVal = hashString(session.sessionId + session.profileName);
  const codeSuffix = (hashVal % 90000) + 10000;
  const destinyCode = `DESTINY-TW-8B-${codeSuffix}`;

  // 1. 八字先天氣候格局罕見度
  const baziRarityScore = Math.min(99.9, Math.max(78.5, 80 + (hashVal % 190) / 10));

  // 2. 自由意志路徑分歧度
  const choicePathPermutations = `約 3.48 × 10⁹ 種人生分支路徑`;
  const rarityScoreText = `全球 80 億人中僅有 1 人的專屬史詩奇蹟 (超越 99.999999% 的平行時空軌跡)`;

  // 3. 紅顏知己真身揭曉
  const friends = session.femaleFriends || getInitialFemaleFriends();
  const revealedFriends = friends.map((f) => {
    let statusText = '未曾深入相遇';
    let fatedSummary = '在命運長河的某個轉角，你們曾處於同一片天空下，但時機尚未成熟。';

    if (f.status === 'SPOUSE') {
      statusText = '💍 結縭相守 · 一生摯愛';
      fatedSummary = `在 80 億茫茫人海中，你當年的心動抉擇讓彼此跨越千山萬水，結為同心良眷，白首不相離。`;
    } else if (f.status === 'BONDED') {
      statusText = '🌟 靈魂知己 · 深刻羈絆';
      fatedSummary = `你們在人生的黃金歲月中並肩同行，彼此讀懂內心最深沉的理想，是無可取代的生命摯友。`;
    } else if (f.status === 'MET') {
      statusText = '🍃 相知相敬 · 君子之交';
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

  // 4. 紅顏因緣總評
  const spouse = revealedFriends.find((f) => f.status === 'SPOUSE');
  const bonded = revealedFriends.find((f) => f.status === 'BONDED');

  let romanticDestinySummary = '';
  if (spouse) {
    romanticDestinySummary = `【執子之手 · 天作之合】：在全地球 80 億靈魂的浩瀚星圖中，你與【${spouse.name}】（${spouse.archetype}）相知相守，於歲月風雨中築起溫馨避風港。當初盲盒相遇時那一刻的心動與承諾，成為你一生中最無悔的 80 億分之一奇蹟。`;
  } else if (bonded) {
    romanticDestinySummary = `【靈犀相照 · 莫逆於心】：在 80 億人口的世界裡，你遇見了真正讀懂你志向的【${bonded.name}】（${bonded.archetype}）。雖未受世俗形式拘泥，但那份心靈相通的默契，跨越了時空，不負此生相逢。`;
  } else {
    romanticDestinySummary = `【獨步凌雲 · 浩氣長存】：在台灣這座巨浪翻湧的島嶼上，你將所有的柔情與力量傾注於理想與家庭基業。紅顏過客皆化為人生風景，你以頂天立地的意志，走出了無愧於天地的自強史詩。`;
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
