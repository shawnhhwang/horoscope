import { BaziChart, TenGod } from '../bazi/types.js';
import {
  LifeAttributes,
  LifeOption,
  YearlyLifeNode,
  LifeSimulationSession,
  LifeFinalSummary,
  BiographyPerspective,
  MetaphysicalDecisionGuidance,
} from './types.js';
import { getTaiwanEraHealthProfile } from './taiwan-history.js';
import { calculateOneInEightBillion } from './female-friends.js';

/**
 * 依據八字命盤格局推算初始四大領域屬性 (0歲出生的先天稟賦)
 * 涵蓋四大領域：健康 (Health)、知識 (Knowledge)、財富 (Wealth)、情感 (Relationship)
 */
export function calculateInitialAttributes(baziChart: BaziChart): LifeAttributes {
  const energyScore = baziChart.energy?.score ?? 50;
  const elements = baziChart.fiveElements;

  // 1. 體魄健康：初生嬰幼兒體魄，以日元中和為佳 (40~70分中和者體質最穩)
  let initialHealth = 82;
  if (energyScore >= 45 && energyScore <= 65) {
    initialHealth = 88;
  } else if (energyScore < 30 || energyScore > 85) {
    initialHealth = 74;
  }

  // 2. 知識才識：0 歲嬰孩認知啟蒙起步，依水、木氣場與印星給予先天潛力天賦 (15~25)
  const waterWoodRatio = (elements.water + elements.wood) / 2;
  const initialKnowledge = Math.min(26, Math.max(12, Math.round(15 + waterWoodRatio * 0.15)));

  // 3. 財富資產：0 歲依託原生家庭祖蔭與生活保障線 (28~38)
  const earthMetalRatio = (elements.earth + elements.metal) / 2;
  const initialWealth = Math.min(38, Math.max(26, Math.round(30 + earthMetalRatio * 0.12)));

  // 4. 情感眷屬：0 歲父母家庭疼愛與呵護 (65~78)
  const woodWaterScore = (elements.wood + elements.water) / 2;
  const initialRelationship = Math.min(80, Math.max(62, Math.round(68 + woodWaterScore * 0.15)));

  // 向後相容指標
  const initialCareer = 20; // 0歲無職涯
  const initialWisdom = initialKnowledge;

  return {
    health: initialHealth,
    knowledge: initialKnowledge,
    wealth: initialWealth,
    relationship: initialRelationship,
    career: initialCareer,
    wisdom: initialWisdom,
  };
}

/**
 * 依據年齡生命週期與流年十神運勢，推演四大領域之自然演化 (Annual Natural Growth)
 * 切合年齡階段（嬰幼、求學、青年、壯年、老年）與流年行運（印星長知識、財星動財富等）
 */
export function evolveLifeAttributesByAgeAndFortune(params: {
  prevAttributes: LifeAttributes;
  age: number;
  tenGod: TenGod;
  fortuneLevel: '大吉' | '小吉' | '平順' | '小凶' | '大凶';
  solarYear?: number;
}): LifeAttributes {
  const { prevAttributes, age, tenGod, fortuneLevel, solarYear } = params;
  const clamp = (val: number) => Math.max(0, Math.min(100, Math.round(val)));

  let health = prevAttributes.health;
  let knowledge = prevAttributes.knowledge ?? prevAttributes.wisdom ?? 20;
  let wealth = prevAttributes.wealth;
  let relationship = prevAttributes.relationship;
  let career = prevAttributes.career ?? 20;

  const isLucky = fortuneLevel === '大吉' || fortuneLevel === '小吉';
  const isUnlucky = fortuneLevel === '大凶' || fortuneLevel === '小凶';

  // --- 1. 年齡階段自然演化 (Age Lifecycle Rationality) ---
  if (age <= 6) {
    // 幼兒啟蒙期：知識每年快速成長，財富主要為家庭零用，情感為親情
    knowledge += 4;
    wealth = Math.max(wealth, 28);
    relationship = Math.max(relationship, 68);
  } else if (age <= 18) {
    // 青蔥求學期：大考衝刺，知識大幅攀升；健康巔峰；財富以求學開銷為主
    knowledge += 3;
    if (age === 12 || age === 15 || age === 18) knowledge += 2; // 關鍵考學節點
    health = Math.min(96, Math.max(health, 86));
    wealth = Math.min(40, Math.max(26, wealth));
    relationship += 1; // 同儕友誼萌生
  } else if (age <= 28) {
    // 青年打拼期：專業養成與初入職場，財富自食其力開始累積，情感戀愛高潮
    knowledge += 1;
    career += 3;
    wealth += 2;
    relationship += 1;
  } else if (age <= 55) {
    // 壯年黃金期：財富與事業積累高峰期，承擔家庭重任
    career += 1;
    if (age <= 48) wealth += 2;
    knowledge += 1;
  } else {
    // 老年花甲至天年期：知識昇華為豁達智慧，財富守成與傳承，情感為孫輩相伴
    knowledge = Math.max(knowledge, 88);
    career = Math.max(40, career - 1);
  }

  // --- 2. 時代平均壽命與老年生理健康自然衰退 ---
  let naturalHealthDecay = 0;
  if (solarYear) {
    const healthProfile = getTaiwanEraHealthProfile(solarYear);
    const avgLife = healthProfile.avgLifeExpectancy;
    if (age >= Math.round(avgLife * 1.25)) {
      naturalHealthDecay = -3;
    } else if (age >= Math.round(avgLife * 1.05)) {
      naturalHealthDecay = -2;
    } else if (age >= Math.round(avgLife * 0.85)) {
      naturalHealthDecay = -1;
    }
  } else {
    if (age >= 80) naturalHealthDecay = -3;
    else if (age >= 68) naturalHealthDecay = -2;
    else if (age >= 58) naturalHealthDecay = -1;
  }
  health += naturalHealthDecay;

  // --- 3. 流年十神對四大領域之推動 ---
  // 印星 (正印/偏印)：主學業、功名、證照，大益【知識】，喜印者益【健康】
  if (tenGod === '正印' || tenGod === '偏印') {
    knowledge += isLucky ? 3 : 2;
    if (isLucky) health += 1;
  }
  // 財星 (正財/偏財)：主薪資收入、經商、資產，大動【財富】
  else if (tenGod === '正財' || tenGod === '偏財') {
    if (age >= 18) {
      wealth += isLucky ? 4 : isUnlucky ? -2 : 2;
    }
  }
  // 食傷 (食神/傷官)：主秀氣靈感、技術創造、生財之源，增【知識】與【財富】
  else if (tenGod === '食神' || tenGod === '傷官') {
    knowledge += 2;
    if (age >= 22) wealth += isLucky ? 3 : 1;
    if (tenGod === '食神') health += 1; // 食神為壽星
  }
  // 官殺 (正官/七殺)：主位階、自律、壓力與威望，增【知識/事業】，七殺逢凶消耗【健康】
  else if (tenGod === '正官' || tenGod === '七殺') {
    career += isLucky ? 3 : 1;
    knowledge += 1;
    if (tenGod === '七殺' && isUnlucky) {
      health -= 2;
    }
  }
  // 比劫 (比肩/劫財)：主同袍、朋友、社交網絡，增【情感】，劫財逢凶易損【財富】
  else if (tenGod === '比肩' || tenGod === '劫財') {
    relationship += isLucky ? 3 : 1;
    if (tenGod === '劫財' && isUnlucky && age >= 20) {
      wealth -= 2;
    }
  }

  // 吉凶大盤微調
  if (isLucky) {
    health += 1;
    wealth += 1;
  } else if (isUnlucky) {
    health -= 1;
  }

  const finalAttributes: LifeAttributes = {
    health: clamp(health),
    knowledge: clamp(knowledge),
    wealth: clamp(wealth),
    relationship: clamp(relationship),
    career: clamp(career),
    wisdom: clamp(knowledge),
  };

  return finalAttributes;
}

/**
 * 結算使用者在當年的抉擇結果與屬性差值 (Delta)
 * 同步考量歷史年代平均壽命與公衛傳染病風險
 */
export function resolveTurnDecision(
  currentAttributes: LifeAttributes,
  age: number,
  fortuneLevel: '大吉' | '小吉' | '平順' | '小凶' | '大凶',
  chosenOption?: LifeOption,
  customActionText?: string,
  solarYear?: number
): {
  newAttributes: LifeAttributes;
  deltas: Partial<Record<keyof LifeAttributes, number>>;
} {
  const deltas: Partial<Record<keyof LifeAttributes, number>> = {};
  const isLucky = fortuneLevel === '大吉' || fortuneLevel === '小吉';
  const isUnlucky = fortuneLevel === '大凶' || fortuneLevel === '小凶';

  const impact = chosenOption?.potentialImpact || {};

  // 屬性維度結算 (包含四大領域：health, knowledge, wealth, relationship 與輔助 career, wisdom)
  const keys: (keyof LifeAttributes)[] = ['health', 'knowledge', 'wealth', 'relationship', 'career', 'wisdom'];

  for (const k of keys) {
    let delta = impact[k] || 0;
    if (k === 'knowledge' && delta === 0 && impact.wisdom) {
      delta = impact.wisdom;
    } else if (k === 'wisdom' && delta === 0 && impact.knowledge) {
      delta = impact.knowledge;
    }

    // 順風流年微幅放大吉利值
    if (isLucky && delta > 0) {
      delta = Math.round(delta * 1.25);
    }
    // 逆風流年若採取激進冒險，加重挫折扣分
    if (isUnlucky && chosenOption?.attitude === 'AGGRESSIVE' && delta < 0) {
      delta = Math.round(delta * 1.3);
    }
    deltas[k] = delta;
  }

  // 年齡與生理階段自然微步演化
  if (age <= 18) {
    // 青蔥求學期知識持續吸收
    deltas.knowledge = (deltas.knowledge || 0) + 2;
    deltas.wisdom = deltas.knowledge;
  } else if (age >= 25 && age % 5 === 0) {
    // 智慧隨歲月增長之自然累積 (人生閱歷)
    deltas.knowledge = (deltas.knowledge || 0) + 1;
    deltas.wisdom = deltas.knowledge;
  }

  // 壯年財富自然自立
  if (age >= 26 && age <= 50 && (deltas.wealth || 0) >= 0) {
    deltas.wealth = (deltas.wealth || 0) + 1;
  }

  // 年代平均壽命與老年自然生理耗損動態模型
  let naturalHealthDecay = 0;
  if (solarYear) {
    const healthProfile = getTaiwanEraHealthProfile(solarYear);
    const avgLife = healthProfile.avgLifeExpectancy;

    // 老化自然衰減門檻依時代平均壽命浮動 (例如 1850年 avg 32 歲 vs 2026年 avg 81 歲)
    if (age >= Math.round(avgLife * 1.25)) {
      naturalHealthDecay = -3;
    } else if (age >= Math.round(avgLife * 1.05)) {
      naturalHealthDecay = -2;
    } else if (age >= Math.round(avgLife * 0.85)) {
      naturalHealthDecay = -1;
    }

    // 時代傳染病大流行衝擊加權
    if (healthProfile.isEpidemicOutbreak) {
      if (chosenOption?.attitude === 'AGGRESSIVE') {
        // 疫病蔓延期間過度冒進奔走，增加染疫體損風險
        deltas.health = (deltas.health || 0) - 2;
        deltas.career = (deltas.career || 0) + 1;
      } else if (chosenOption?.attitude === 'CONSERVATIVE') {
        // 疫期閉門守拙、注重衛生防護，獲得健康避險加成
        deltas.health = (deltas.health || 0) + 2;
      } else if (chosenOption?.attitude === 'MORAL') {
        // 施藥濟民、守望相助，累積心性智慧與眷屬善緣
        deltas.relationship = (deltas.relationship || 0) + 2;
        deltas.wisdom = (deltas.wisdom || 0) + 2;
      }
    }
  } else {
    // 預設基準 (未提供年份時向後相容)
    if (age >= 80) {
      naturalHealthDecay = -3;
    } else if (age >= 68) {
      naturalHealthDecay = -2;
    } else if (age >= 58) {
      naturalHealthDecay = -1;
    }
  }
  deltas.health = (deltas.health || 0) + naturalHealthDecay;

  // 智慧隨歲月增長之自然累積 (人生閱歷)
  if (age >= 25 && age % 5 === 0) {
    deltas.wisdom = (deltas.wisdom || 0) + 1;
  }

  // 應用差值並 Clamp 限制在 0 ~ 100
  const clamp = (val: number) => Math.max(0, Math.min(100, Math.round(val)));
  const curKnowledge = currentAttributes.knowledge ?? currentAttributes.wisdom ?? 20;
  const newKnowledge = clamp(curKnowledge + (deltas.knowledge || deltas.wisdom || 0));

  const newAttributes: LifeAttributes = {
    health: clamp(currentAttributes.health + (deltas.health || 0)),
    knowledge: newKnowledge,
    wealth: clamp(currentAttributes.wealth + (deltas.wealth || 0)),
    relationship: clamp(currentAttributes.relationship + (deltas.relationship || 0)),
    career: clamp((currentAttributes.career ?? 20) + (deltas.career || 0)),
    wisdom: newKnowledge,
  };

  return { newAttributes, deltas };
}

/**
 * 評估該年度是否走向壽元終結 (Mortality Evaluation)
 * 深度考量該歷史年代平均壽命、傳染病致死率與天年極限
 */
export function evaluateMortalityCheck(
  age: number,
  attributes: LifeAttributes,
  fortuneLevel: '大吉' | '小吉' | '平順' | '小凶' | '大凶',
  solarYear?: number
): { isTerminal: boolean; reason?: string } {
  const profile = solarYear ? getTaiwanEraHealthProfile(solarYear) : undefined;
  const avgLife = profile ? profile.avgLifeExpectancy : 75;

  // 1. 健康值耗盡歸零 (依所處時代壽命語境賦予不同稱謂)
  if (attributes.health <= 0) {
    const isHonorableOldAge = age >= Math.max(50, Math.round(avgLife * 1.1));
    if (isHonorableOldAge) {
      return {
        isTerminal: true,
        reason: `享壽${age}歲（已逾${profile?.eraName || '當期'}平均壽命${avgLife}歲），身心疲竭，功德圓滿，安詳離世。`,
      };
    }
    const epidemicDesc = profile?.prevailingEpidemics?.[0] ? `時疫（${profile.prevailingEpidemics[0]}）或` : '';
    return {
      isTerminal: true,
      reason: `得年${age}歲，身處${profile?.eraName || '塵世'}，因積勞成疾、${epidemicDesc}突發重大疾厄，遺憾告別塵世。`,
    };
  }

  // 2. 達到 100 歲極限善終
  if (age >= 100) {
    return {
      isTerminal: true,
      reason: `在${profile?.eraName || ''}跨越百年罕見榮享百歲天年（100歲），看透一個世紀世間悲歡，子孫綿長，無疾而終，壽終正寢。`,
    };
  }

  // 3. 高齡且健康瀕危之天命大限判定
  const elderlyThreshold = profile ? Math.max(60, Math.round(avgLife + 10)) : 85;
  if (age >= elderlyThreshold && attributes.health < 15 && fortuneLevel === '大凶') {
    return {
      isTerminal: true,
      reason: `享壽${age}歲，跨越時代壽元極限，逢大運流年氣數交會，無疾順命，安詳駕鶴西歸。`,
    };
  }

  return { isTerminal: false };
}

/**
 * 依據流年大凶/大吉/重大轉折節點產出命理決策錦囊與方向指引
 */
export function getYearMetaphysicalGuidance(node: YearlyLifeNode): MetaphysicalDecisionGuidance | null {
  const isMilestone = !!node.isKeyMilestone;
  const isDaJi = node.fortuneLevel === '大吉';
  const isDaXiong = node.fortuneLevel === '大凶';

  if (!isMilestone && !isDaJi && !isDaXiong) {
    return null;
  }

  // 1. 大凶年 (若同時為轉折年，特別標記雙重考驗)
  if (isDaXiong) {
    const title = isMilestone
      ? `⚠️ 關鍵轉折逢【大凶】歲運 · 慎防暗礁化煞指南`
      : `🛡️ 流年逢【大凶】歲運 · 穩健守成避凶指南`;
    const summary = isMilestone
      ? `本歲逢人生重大轉折（${node.milestoneReason || '重要關卡'}），偏逢天干地支交戰或煞星臨門之大凶行運！此時切莫盲目孤注一擲，應將「保全自身與根基」置於首位。`
      : `本歲歲運大凶、氣場逆風，易逢波折挫敗或無妄之災。天紀心法提示：「見險而止，順天應命」，此時不宜作大幅度冒險擴張，宜蓄積實力。`;

    return {
      isApplicable: true,
      category: 'DA_XIONG',
      title,
      badge: '⚠️ 大凶化煞錦囊',
      summary,
      recommendedAction: '宜穩健守成（CONSERVATIVE）或積德修心（MORAL），忌孤注一擲冒險（AGGRESSIVE）。',
      decisionTips: [
        {
          label: '穩健守成',
          description: '收縮高風險投資與支出，維護現有事業與人脈基盤，以靜制動、沉潛蓄力。',
        },
        {
          label: '護衛體魄',
          description: '大凶流年首防健康受損與突發疾厄，注意起居作息，切勿因焦慮過度透支身心。',
        },
        {
          label: '修心行善',
          description: '多行善布施、修身養性、厚待眷屬，以道德正能量化解流年煞氣（德能化煞）。',
        },
      ],
    };
  }

  // 2. 大吉年 (若同時為轉折年，提示順風乘浪立宏圖)
  if (isDaJi) {
    const title = isMilestone
      ? `🌟 關鍵轉折逢【大吉】歲運 · 乘風破浪天賜開拓指南`
      : `✨ 流年逢【大吉】歲運 · 順天應時大展宏圖指南`;
    const summary = isMilestone
      ? `天時地利俱備！本歲既逢人生重大轉折契機（${node.milestoneReason || '天賜良機'}），又逢大吉運勢加持！命運之輪為你打開全新格局，宜勇於立下宏志、把握難得之天命機遇！`
      : `流年吉星照命、紫氣東來，諸事順遂。天機心法云：「天時至，人事合，乘勢而起者昌」。當前正是大展宏圖、破局前行的最佳年度。`;

    return {
      isApplicable: true,
      category: 'DA_JI',
      title,
      badge: '✨ 大吉進取錦囊',
      summary,
      recommendedAction: '宜積極進取（AGGRESSIVE）或確立長遠名位（MORAL），把握天時乘勢而上！',
      decisionTips: [
        {
          label: '果斷開拓',
          description: '適合爭取晉升掌權、創業擴大、爭取核心資源或深造進階，莫因猶豫安逸而錯失天賜良機。',
        },
        {
          label: '確立盟約',
          description: '吉慶之年利於結識貴人高士、成家立業或確立重要事業合夥，為未來十年大運築底。',
        },
        {
          label: '廣修福緣',
          description: '順風時多提攜同儕後進、回饋社會，使吉運與人望生生不息、綿延後代。',
        },
      ],
    };
  }

  // 3. 純重大轉折年 (Fortune 平順或小吉/小凶)
  return {
    isApplicable: true,
    category: 'MILESTONE',
    title: `⭐ 人生關鍵轉折關卡 · 命運航向抉擇指引`,
    badge: '⭐ 轉折定調錦囊',
    summary: `本歲逢人生重大里程碑【${node.milestoneReason || '命運分水嶺'}】。當前抉擇將深刻銘刻於一生行誼之足跡，並左右未來大運五維屬性之消長。`,
    recommendedAction: '宜審視本命格局與內心初衷，把握主動權，做出不負歲月的核心抉擇。',
    decisionTips: [
      {
        label: '立足長遠',
        description: '轉折年不宜只看眼前微小得失，應評估該抉擇在五年、十年後能否為你積累智慧與資產。',
      },
      {
        label: '內外兼修',
        description: '在追逐事業聲望的同時，留意是否兼顧眷屬情感與身體健康，謀求三才平衡。',
      },
      {
        label: '知機而動',
        description: '周易心法云：「君子見機而作，不俟終日」。看準方向即全力以赴，由自由意志重塑命盤！',
      },
    ],
  };
}

/**
 * 離線或測試用確定性事件與選項生成器 (Fallback Synthesizer)
 */
export function generateOfflineTurnContent(
  node: YearlyLifeNode,
  attributes: LifeAttributes
): {
  eventTitle: string;
  eventNarrative: string;
  options: LifeOption[];
} {
  const age = node.age;
  const ganzhi = node.ganzhi;
  const tenGod = node.tenGod;
  const eraText = node.taiwanEraContext ? `\n\n🇹🇼【台灣時代年輪】：${node.taiwanEraContext}` : '';

  // 若逢重大歷史公衛/時疫爆發年，優先觸發時代防疫與求生考驗
  if (node.isEpidemicYear) {
    const epidemics = node.eraEpidemics?.join('、') || '時疫傳染病';
    return {
      eventTitle: `時疫考驗 · 歲次【${ganzhi}】${node.milestoneReason || '公衛大流行挑戰'}`,
      eventNarrative: `當前全台正面臨【${epidemics}】流行高峰，城鄉市街人心惶惶，藥石短缺與生計受阻成為每戶人家的頭等大事。面對時代公衛風暴，你與家人必須做出關鍵決斷。${eraText}`,
      options: [
        {
          id: 'opt_1',
          text: '深居簡出，注重環境清潔衛生與飲食消毒，閉門避疫力保全家安康。',
          attitude: 'CONSERVATIVE',
          potentialImpact: { health: 7, wisdom: 3, wealth: -2 },
          riskLevel: 'LOW',
        },
        {
          id: 'opt_2',
          text: '冒險涉足市集奔走，把握急需物資短缺商機，逆風開拓謀求翻身。',
          attitude: 'AGGRESSIVE',
          potentialImpact: { wealth: 8, career: 5, health: -5 },
          riskLevel: 'HIGH',
        },
        {
          id: 'opt_3',
          text: '熱心鄰里公益，捐助米糧草藥、協助老幼同胞度過疫病難關。',
          attitude: 'MORAL',
          potentialImpact: { relationship: 8, wisdom: 6, wealth: -3 },
          riskLevel: 'LOW',
        },
      ],
    };
  }

  if (age <= 6) {
    return {
      eventTitle: `童稚開蒙 · 歲逢【${ganzhi}】${tenGod}`,
      eventNarrative: `你在台灣街坊鄰里與父母長輩的呵護下逐漸成長。這一年天干透出${tenGod}，家中面臨你啟蒙入學、施打預防針與體質調理的關鍵抉擇。${eraText}`,
      options: [
        {
          id: 'opt_1',
          text: '順應天性，多在鄰近公園與戶外綠地奔跑，強健體魄。',
          attitude: 'CONSERVATIVE',
          potentialImpact: { health: 6, relationship: 3 },
          riskLevel: 'LOW',
        },
        {
          id: 'opt_2',
          text: '及早開蒙識字，學習注音符號與算術，展露早慧潛能。',
          attitude: 'AGGRESSIVE',
          potentialImpact: { wisdom: 6, career: 2, health: -2 },
          riskLevel: 'LOW',
        },
        {
          id: 'opt_3',
          text: '注重家庭和樂，與堂表手足親近，培養分享與同理心。',
          attitude: 'MORAL',
          potentialImpact: { relationship: 5, wisdom: 2 },
          riskLevel: 'LOW',
        },
      ],
    };
  }

  if (age <= 18) {
    return {
      eventTitle: `青蔥求學 · 【${ganzhi}】年台灣升學與志向分水嶺`,
      eventNarrative: `求學生活迎來重大分水嶺。面對台灣繁重的升學大考（聯考/學測）、補習班南陽街的燈火與青春期的思緒萌動，同儕競爭與志願選填成為每天的課題。${eraText}`,
      options: [
        {
          id: 'opt_1',
          text: '挑燈夜戰全力衝刺升學大考，誓爭理想國立大學或明星高中熱門科系。',
          attitude: 'AGGRESSIVE',
          potentialImpact: { career: 7, wisdom: 4, health: -4 },
          riskLevel: 'MEDIUM',
        },
        {
          id: 'opt_2',
          text: '兼顧校園社團運動與同窗友誼，結交相伴一生的真摯摯友。',
          attitude: 'CONSERVATIVE',
          potentialImpact: { relationship: 6, health: 3, career: 1 },
          riskLevel: 'LOW',
        },
        {
          id: 'opt_3',
          text: '探索課外閱讀、藝術或哲學，尋找自己靈魂真正熱愛的志向。',
          attitude: 'MORAL',
          potentialImpact: { wisdom: 7, relationship: 2 },
          riskLevel: 'LOW',
        },
      ],
    };
  }

  if (age <= 28) {
    return {
      eventTitle: `初入社會 · 歲次【${ganzhi}】職涯與情感起點`,
      eventNarrative: `告別校園踏入台灣職場。服兵役、求職面試、存下人生第一桶金、竹科或都會租屋北漂的現實考驗，以及身邊心儀伴侶的相遇，讓你站在人生的十字路口。${eraText}`,
      options: [
        {
          id: 'opt_1',
          text: '主動爭取高難度專案，不惜加班衝刺累積專業履歷，爭取迅速升遷。',
          attitude: 'AGGRESSIVE',
          potentialImpact: { career: 8, wealth: 5, health: -4 },
          riskLevel: 'HIGH',
        },
        {
          id: 'opt_2',
          text: '珍視身邊正緣伴侶，共同在台儲蓄規劃婚禮與穩定的溫暖港灣。',
          attitude: 'MORAL',
          potentialImpact: { relationship: 8, wealth: -2, wisdom: 3 },
          riskLevel: 'LOW',
        },
        {
          id: 'opt_3',
          text: '謹慎守成，儲蓄第一筆備用金，遠離高風險盲目投資與投機明牌。',
          attitude: 'CONSERVATIVE',
          potentialImpact: { wealth: 6, wisdom: 3 },
          riskLevel: 'LOW',
        },
      ],
    };
  }

  if (age <= 55) {
    return {
      eventTitle: `立業中天 · 歲逢【${ganzhi}】${tenGod}重大關口`,
      eventNarrative: `中年是責任最重、能量也最鼎盛的時期。上奉台灣長輩健保就醫、下撫兒女學費開支，面對高房價置產房貸與職場自立門戶的重大考驗。${eraText}`,
      options: [
        {
          id: 'opt_1',
          text: '抓住流年商機在台自立門戶創業或擴大投資，整合資源放手一搏。',
          attitude: 'AGGRESSIVE',
          potentialImpact: { career: 10, wealth: 8, health: -6 },
          riskLevel: 'HIGH',
        },
        {
          id: 'opt_2',
          text: '深耕既有職位版圖，專注家庭資產安全防護與子女性格培植。',
          attitude: 'CONSERVATIVE',
          potentialImpact: { wealth: 5, relationship: 6, career: 2 },
          riskLevel: 'LOW',
        },
        {
          id: 'opt_3',
          text: '放慢步調，平衡身心作息，修持內在智慧以化解中年浮躁與疲累。',
          attitude: 'MORAL',
          potentialImpact: { health: 7, wisdom: 6, relationship: 3 },
          riskLevel: 'LOW',
        },
      ],
    };
  }

  // 56 歲以上
  return {
    eventTitle: `知命頤養 · 歲次【${ganzhi}】心性與天命`,
    eventNarrative: `歲月染白了雙鬢，你看透了名利場的紛紛擾擾。在台灣健全健保與便利的高鐵捷運生活圈中，面對身體機能的轉變與家族長幼的承傳，生命的重點轉向沉澱與豁達。${eraText}`,
    options: [
      {
        id: 'opt_1',
        text: '清心寡欲，親近自然山林，以養生調和體內陰陽五行。',
        attitude: 'CONSERVATIVE',
        potentialImpact: { health: 6, wisdom: 5 },
        riskLevel: 'LOW',
      },
      {
        id: 'opt_2',
        text: '散財積德，扶持後輩與地方公益事業，留下高尚家風與清白名聲。',
        attitude: 'MORAL',
        potentialImpact: { wisdom: 8, career: 3, wealth: -4, relationship: 5 },
        riskLevel: 'LOW',
      },
      {
        id: 'opt_3',
        text: '含飴弄孫，盡享天倫之樂，將一生積累的智慧傳承給子嗣後輩。',
        attitude: 'CONSERVATIVE',
        potentialImpact: { relationship: 7, health: 3, wisdom: 3 },
        riskLevel: 'LOW',
      },
    ],
  };
}

/**
 * 離線或測試用終局一生總結合成器 (支援多重視角風格：倪師心法、太史公列傳、時代回憶錄)
 */
export function generateOfflineFinalSummary(
  session: LifeSimulationSession,
  perspective: BiographyPerspective = 'TIANJI'
): LifeFinalSummary {
  const age = session.currentAge;
  const attrs = session.attributes;
  const triumphs: string[] = [];
  const regrets: string[] = [];

  if (attrs.career >= 70) {
    triumphs.push('事業功成名就，在所處領域建立卓越聲望與行業地位');
  } else {
    regrets.push('未能全力攀上職涯頂峰，稍有未能施展之抱負');
  }

  if (attrs.relationship >= 70) {
    triumphs.push('家庭和睦溫馨，與摯愛之人白頭偕老、相敬如賓');
  } else {
    regrets.push('在奔波之中偶有疏忽家人陪伴，略留遺憾');
  }

  if (attrs.wealth >= 70) {
    triumphs.push('積累了豐厚的家產，為家族後輩奠定堅實的基石');
  }

  if (attrs.wisdom >= 75) {
    triumphs.push('悟透天地人三才至理，晚年安詳從容、廣受敬仰');
  }

  let tianjiTitle = '福壽康寧的平凡智者';
  if (attrs.career >= 85 && attrs.wealth >= 80) {
    tianjiTitle = '一代鼎盛商賈舵手';
  } else if (attrs.wisdom >= 85 && attrs.career >= 75) {
    tianjiTitle = '德澤深遠的當代宗匠';
  } else if (attrs.relationship >= 85 && attrs.health >= 75) {
    tianjiTitle = '天倫美滿的福壽居士';
  } else if (age >= 90) {
    tianjiTitle = '看透滄海桑田的百歲仙翁';
  }

  const shijiTitle = attrs.career >= 75 ? '立德立功之當代名士' : '敦仁履道之隱逸高士';
  const memoirTitle = attrs.relationship >= 75 ? '韶華不負的家族擎天樹' : '風雨兼程的人間行者';
  const oneInEightBillionTitle = '80億分之一的奇蹟行者';

  const tianjiBiography = `【三合天機心法 · 天紀蓋棺論】：求測者【${session.profileName}】於塵世歷經 ${age} 載春秋。自幼稟先天八字氣數，經歲運淬鍊，步步留下深刻足跡。古德先賢常言：「人事努力與空間調適占三分之二，先天命盤僅占三分之一」。縱觀其生平，在各流年轉折、歲運大沖與生死考驗之際，體魄健康得 ${attrs.health} 分、財富積累得 ${attrs.wealth} 分、事業聲望得 ${attrs.career} 分、情感眷屬得 ${attrs.relationship} 分、心性智慧達 ${attrs.wisdom} 分。你以不屈意志與行善積德化解煞氣，誠為後天自由意志改寫先天命盤之典範。`;

  const shijiBiography = `【史記 · ${session.profileName}列傳】：${session.profileName}者，台灣之名士也。生於斯土，凡經世 ${age} 載。幼而聰慧，篤志向學；及長，歷經時代波瀾與歲月激盪，進退有度，重信敦仁。其功名家業立於斯地，晚歲智慧通達，抱樸守真。\n\n太史公曰：餘讀${session.profileName}一生行誼，見其於風雲翻覆之際，不墜青雲之志；在吉凶順逆之間，皆能力排艱險、求索大義。德業咸備，享年 ${age} 載，考其終始，古之君子何以加焉！`;

  const memoirBiography = `【歲月微光 · ${session.profileName}回憶錄】：回首在台灣走過的這 ${age} 個年頭，宛如一場波瀾壯闊又溫潤深長的夢。從年少時在街頭巷尾穿梭的朝氣，到青壯年在經濟起飛與時代變革中的奮力打拼；從為人子女的懵懂，到為人父母、祖輩的兩鬢霜白。走過重大疫情的戒備、時代脈動的起伏，有過榮光，亦有過遺憾。但最珍貴的，始終是深夜留著的那盞暖燈與家人安康的笑顏。留給後人一句話：順風行舟、逆風修心，每一步路都算數。`;

  const oneInEightBillion = calculateOneInEightBillion(session);
  const oneInEightBillionBiography = `【80億分之一的奇蹟史詩 · ${session.profileName}專屬命運唯一卷】：\n在當前全地球 80 億靈魂汪洋中，你走過 ${age} 載春秋，鑄就了全宇宙唯一的專屬命運代碼【${oneInEightBillion.destinyCode}】。\n${oneInEightBillion.rarityScoreText}。\n\n🌹【80 億人中的紅顏因緣真面目大揭曉】：\n${oneInEightBillion.revealedFriends.map(f => `· 【${f.name}】（原化身：${f.mysteryAlias} · ${f.archetype}）：最終因緣為【${f.statusText}】。${f.fatedSummary}`).join('\n')}\n\n${oneInEightBillion.romanticDestinySummary}\n\n🌌【80 億分之一的宇宙命運贊辭】：\n${oneInEightBillion.cosmicPhilosophyQuote}`;

  const perspectiveBiographies: Record<BiographyPerspective, string> = {
    TIANJI: tianjiBiography,
    SHIJI: shijiBiography,
    MEMOIR: memoirBiography,
    ONE_IN_8_BILLION: oneInEightBillionBiography,
  };

  const perspectiveTitles: Record<BiographyPerspective, string> = {
    TIANJI: tianjiTitle,
    SHIJI: shijiTitle,
    MEMOIR: memoirTitle,
    ONE_IN_8_BILLION: oneInEightBillionTitle,
  };

  return {
    endingTitle: perspectiveTitles[perspective] || tianjiTitle,
    finalAge: age,
    biographyRichText: perspectiveBiographies[perspective] || tianjiBiography,
    activePerspective: perspective,
    perspectiveBiographies,
    perspectiveTitles,
    perspectiveIsAi: {
      TIANJI: false,
      SHIJI: false,
      MEMOIR: false,
      ONE_IN_8_BILLION: false,
    },
    oneInEightBillion,
    radarScores: { ...attrs },
    destinyAlignmentScore: Math.min(98, Math.max(65, Math.round((attrs.wisdom + attrs.career + attrs.relationship) / 3))),
    keyTriumphs: triumphs.length ? triumphs : ['平安度過一生，看淡人間悲歡離合'],
    keyRegrets: regrets.length ? regrets : ['歲月匆匆，韶華易逝'],
  };
}
