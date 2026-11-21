import {
  generate100YearTimeline,
  calculateInitialAttributes,
  resolveTurnDecision,
  evaluateMortalityCheck,
  generateOfflineTurnContent,
  generateOfflineFinalSummary,
  getTaiwanEraContext,
  LifeSimulationSession,
  YearlyLifeNode,
  LifeOption,
  BiographyPerspective,
  getInitialRomanceFriends,
  getBlindRomanticEncounter,
  applyRomanticDecision,
  calculateOneInEightBillion,
  FemaleFriendProfile,
} from '@celestial/astro-core';
import { executeLlmChat, getLlmConfig } from '../llm/service.js';
import {
  createSimulationRecordRepo,
  findSimulationRecordByIdRepo,
  updateSimulationRecordRepo,
} from './repository.js';

export async function startSimulationService(params: {
  userId: string | null;
  birthDate: string;
  gender: string;
  profileName: string;
  romanceFriends?: any[];
}) {
  const birth = new Date(params.birthDate);
  if (Number.isNaN(birth.getTime())) {
    throw Object.assign(new Error('出生日期格式無效'), { status: 400 });
  }

  const validGender = params.gender === '女' ? '女' : '男';
  const { baziChart, nodes } = generate100YearTimeline(birth, validGender);
  const initialAttributes = calculateInitialAttributes(baziChart);
  nodes[0].snapshotAttributes = { ...initialAttributes };

  const footprints: string[] = [`0歲：降臨世間，稟【${baziChart.dayMaster.stem}】日主之氣`];
  const romanceFriends = getInitialRomanceFriends(validGender, birth, params.romanceFriends);

  for (const friend of romanceFriends) {
    const encAge = friend.encounterAge;
    if (typeof encAge === 'number' && nodes[encAge]) {
      const encNode = nodes[encAge];
      const encounter = getBlindRomanticEncounter(
        encAge,
        romanceFriends,
        encNode.taiwanEraContext,
        encNode.solarYear,
        validGender
      );
      if (encounter.isRomanticTurn) {
        encNode.isKeyMilestone = true;
        encNode.milestoneReason = validGender === '男'
          ? '因緣際會 · 命中注定的紅顏盲盒相逢'
          : '因緣際會 · 命中注定的藍顏盲盒相逢';
        encNode.eventTitle = encounter.eventTitle;
        encNode.eventNarrative = encounter.eventNarrative;
        encNode.options = encounter.options;
        encNode.romanceIllustration = friend.illustration;
      }
    }
  }

  const record = await createSimulationRecordRepo({
    userId: params.userId,
    profileName: String(params.profileName).trim() || '求測者',
    gender: validGender,
    birthDatetime: birth,
    currentAge: 0,
    status: 'IN_PROGRESS',
    attributesJson: JSON.stringify(initialAttributes),
    historyJson: JSON.stringify(nodes),
    footprintsJson: JSON.stringify(footprints),
    femaleFriendsJson: JSON.stringify(romanceFriends),
  });

  const session: LifeSimulationSession = {
    sessionId: record.id,
    userId: record.userId || undefined,
    profileName: record.profileName,
    gender: record.gender as '男' | '女',
    birthDate: record.birthDatetime.toISOString(),
    currentAge: 0,
    status: 'IN_PROGRESS',
    attributes: initialAttributes,
    history: nodes,
    milestoneFootprints: footprints,
    femaleFriends: romanceFriends,
  };

  return { session, baziChart };
}

export function hydrateSimulationSession(record: any): LifeSimulationSession {
  return {
    sessionId: record.id,
    userId: record.userId || undefined,
    profileName: record.profileName,
    gender: record.gender as '男' | '女',
    birthDate: record.birthDatetime.toISOString(),
    currentAge: record.currentAge,
    status: record.status as any,
    attributes: JSON.parse(record.attributesJson),
    history: JSON.parse(record.historyJson),
    milestoneFootprints: JSON.parse(record.footprintsJson || '[]'),
    femaleFriends: record.femaleFriendsJson
      ? JSON.parse(record.femaleFriendsJson)
      : getInitialRomanceFriends(record.gender as '男' | '女', record.birthDatetime),
    finalSummary: record.finalSummaryJson ? JSON.parse(record.finalSummaryJson) : undefined,
  };
}

export async function generateTurnPromptService(record: any, age: number) {
  const history: YearlyLifeNode[] = JSON.parse(record.historyJson);
  const attributes = JSON.parse(record.attributesJson);
  const footprints: string[] = JSON.parse(record.footprintsJson || '[]');

  const node = history[age];
  if (!node) {
    throw Object.assign(new Error('無效的歲數索引'), { status: 400 });
  }
  if (!node.taiwanEraContext) {
    node.taiwanEraContext = getTaiwanEraContext(node.solarYear);
  }
  if (node.eventTitle && node.options && node.options.length > 0) {
    return { node, attributes, milestones: footprints };
  }

  let eventTitle = '';
  let eventNarrative = '';
  let options: LifeOption[] = [];

  const romanceFriends: FemaleFriendProfile[] = record.femaleFriendsJson
    ? JSON.parse(record.femaleFriendsJson)
    : getInitialRomanceFriends(record.gender as '男' | '女', record.birthDatetime);
  const romanticTurn = getBlindRomanticEncounter(
    age,
    romanceFriends,
    node.taiwanEraContext,
    node.solarYear,
    record.gender as '男' | '女'
  );
  if (romanticTurn.isRomanticTurn && romanticTurn.options) {
    eventTitle = romanticTurn.eventTitle!;
    eventNarrative = romanticTurn.eventNarrative!;
    options = romanticTurn.options;
    node.romanceIllustration = romanceFriends.find((f) => f.encounterAge === age)?.illustration;
  }

  if (!eventTitle) {
    const llmConfig = await getLlmConfig();
    if (llmConfig.enabled && llmConfig.endpoint) {
      try {
        const promptText = `你正在主持一場嚴肅且深邃的「百歲流年人生推演」。
求測者姓名：${record.profileName} (${record.gender})
當前年齡：${age} 歲 (虛歲 ${node.nominalAge} 歲)，西曆年份：${node.solarYear} 年
台灣時代背景：${node.taiwanEraContext}
當期平均壽命：約 ${node.eraAvgLifeExpectancy || 75} 歲；主流疾疫：${node.eraEpidemics?.join('、') || '一般風土時疫'}
流年干支：【${node.ganzhi}】年 (值年十神：${node.tenGod}，行運評級：${node.fortuneLevel})
當前五維屬性：健康 ${attributes.health}，財富 ${attributes.wealth}，事業 ${attributes.career}，情感 ${attributes.relationship}，智慧 ${attributes.wisdom}
請以嚴格的 JSON 格式回傳 eventTitle, eventNarrative, options (3個選項)。`;

        const chatRes = await executeLlmChat(
          [{ role: 'user', content: promptText }],
          {
            moduleType: 'LIFE_SIMULATOR',
            title: `流年推演 · ${age}歲`,
            rawData: { age, ganzhi: node.ganzhi, tenGod: node.tenGod, profileName: record.profileName },
          },
          record.userId || undefined
        );

        if (chatRes.reply) {
          const jsonMatch = chatRes.reply.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.eventTitle && Array.isArray(parsed.options) && parsed.options.length >= 2) {
              eventTitle = parsed.eventTitle;
              eventNarrative = parsed.eventNarrative || '';
              options = parsed.options;
            }
          }
        }
      } catch {
        // fallback to deterministic engine
      }
    }
  }

  if (!eventTitle || options.length === 0) {
    const fallback = generateOfflineTurnContent(node, attributes);
    eventTitle = fallback.eventTitle;
    eventNarrative = fallback.eventNarrative;
    options = fallback.options;
  }

  node.eventTitle = eventTitle;
  node.eventNarrative = eventNarrative;
  node.options = options;
  history[age] = node;

  await updateSimulationRecordRepo(record.id, { historyJson: JSON.stringify(history) });
  return { node, attributes, milestones: footprints };
}

export async function chooseTurnOptionService(
  record: any,
  age: number,
  chosenOptionId?: string,
  customText?: string
) {
  const history: YearlyLifeNode[] = JSON.parse(record.historyJson);
  const attributes = JSON.parse(record.attributesJson);
  const footprints: string[] = JSON.parse(record.footprintsJson || '[]');
  const node = history[age];
  if (!node) {
    throw Object.assign(new Error('無效的歲數索引'), { status: 400 });
  }

  let chosenOption = (node.options || []).find((o) => o.id === chosenOptionId);
  if (!chosenOption && customText) {
    chosenOption = {
      id: 'opt_custom',
      text: String(customText).trim(),
      attitude: 'MORAL',
      potentialImpact: { wisdom: 4, relationship: 2 },
      riskLevel: 'LOW',
    };
  } else if (!chosenOption) {
    chosenOption = (node.options && node.options[0]) || {
      id: 'opt_default',
      text: '順其自然，靜觀其變。',
      attitude: 'CONSERVATIVE',
      potentialImpact: { wisdom: 2 },
      riskLevel: 'LOW',
    };
  }

  const { newAttributes, deltas } = resolveTurnDecision(
    attributes,
    age,
    node.fortuneLevel,
    chosenOption,
    customText ? String(customText).trim() : undefined,
    node.solarYear
  );

  let femaleFriends: FemaleFriendProfile[] = record.femaleFriendsJson
    ? JSON.parse(record.femaleFriendsJson)
    : getInitialRomanceFriends(record.gender as '男' | '女', record.birthDatetime);

  if (chosenOption && (chosenOption.id.startsWith('opt_romantic_') || chosenOption.id.includes('friend_'))) {
    femaleFriends = applyRomanticDecision(femaleFriends, chosenOption.id, age, record.gender as '男' | '女');
    const chosenFriend = femaleFriends.find((f) => chosenOption.id.includes(f.id));
    if (chosenFriend && chosenOption.id.includes('spouse')) {
      footprints.push(`${age}歲：因緣際會，選擇與【${chosenFriend.mysteryAlias}】定下白首誓約，相伴一生`);
    }
  }

  const mortality = evaluateMortalityCheck(age, newAttributes, node.fortuneLevel, node.solarYear);
  node.chosenOptionId = chosenOption.id;
  node.attributeDeltas = deltas;
  node.snapshotAttributes = newAttributes;
  node.resolutionNarrative = `你在面對【${node.eventTitle || '人生關卡'}】時選擇了「${chosenOption.text}」。歲月推進，身心氣場隨之調適。`;

  if (node.isKeyMilestone) {
    footprints.push(`${age}歲：${node.milestoneReason || node.eventTitle}，選擇了「${chosenOption.text.slice(0, 24)}」`);
  }

  let finalSummary = undefined;
  if (mortality.isTerminal) {
    node.isTerminal = true;
    node.terminalReason = mortality.reason;
    history[age] = node;
    const mockSession: LifeSimulationSession = {
      sessionId: record.id,
      profileName: record.profileName,
      gender: record.gender as '男' | '女',
      birthDate: record.birthDatetime.toISOString(),
      currentAge: age,
      status: 'COMPLETED',
      attributes: newAttributes,
      history: history.slice(0, age + 1),
      milestoneFootprints: footprints,
      femaleFriends,
    };
    finalSummary = generateOfflineFinalSummary(mockSession);
    await updateSimulationRecordRepo(record.id, {
      currentAge: age,
      status: 'COMPLETED',
      attributesJson: JSON.stringify(newAttributes),
      historyJson: JSON.stringify(history),
      footprintsJson: JSON.stringify(footprints),
      femaleFriendsJson: JSON.stringify(femaleFriends),
      finalSummaryJson: JSON.stringify(finalSummary),
    });
  } else {
    history[age] = node;
    await updateSimulationRecordRepo(record.id, {
      currentAge: Math.min(100, age + 1),
      attributesJson: JSON.stringify(newAttributes),
      historyJson: JSON.stringify(history),
      footprintsJson: JSON.stringify(footprints),
      femaleFriendsJson: JSON.stringify(femaleFriends),
    });
  }

  return {
    resolvedNode: node,
    newAttributes,
    isTerminal: mortality.isTerminal,
    terminalReason: mortality.reason,
    finalSummary,
    nextAge: mortality.isTerminal ? age : age + 1,
  };
}

export async function fastForwardService(record: any, maxYears = 10) {
  if (record.status === 'COMPLETED' || record.status === 'TERMINATED') {
    return { alreadyEnded: true, session: record };
  }

  const history: YearlyLifeNode[] = JSON.parse(record.historyJson);
  let attributes = JSON.parse(record.attributesJson);
  const footprints: string[] = JSON.parse(record.footprintsJson || '[]');
  let currentAge = record.currentAge;
  let stepCount = 0;
  let terminalHit = false;
  let finalSummary = undefined;

  while (currentAge < 100 && stepCount < maxYears && !terminalHit) {
    const node = history[currentAge];
    if (!node) break;

    const isRomanticTurn =
      [18, 22, 26, 30, 34].includes(currentAge) ||
      node.eventTitle?.includes('邂逅') ||
      node.options?.some((o) => o.id?.includes('romantic'));
    if ((node.isKeyMilestone || isRomanticTurn) && !node.chosenOptionId) break;

    const fallbackContent = generateOfflineTurnContent(node, attributes);
    const chosen = fallbackContent.options[0];
    const { newAttributes, deltas } = resolveTurnDecision(
      attributes,
      currentAge,
      node.fortuneLevel,
      chosen,
      undefined,
      node.solarYear
    );
    const mortality = evaluateMortalityCheck(currentAge, newAttributes, node.fortuneLevel, node.solarYear);

    node.eventTitle = fallbackContent.eventTitle;
    node.eventNarrative = fallbackContent.eventNarrative;
    node.options = fallbackContent.options;
    node.chosenOptionId = chosen.id;
    node.attributeDeltas = deltas;
    node.snapshotAttributes = newAttributes;
    node.resolutionNarrative = `歲月沉澱，你在${currentAge}歲平穩前行。`;
    attributes = newAttributes;

    if (mortality.isTerminal) {
      terminalHit = true;
      node.isTerminal = true;
      node.terminalReason = mortality.reason;
      history[currentAge] = node;
      finalSummary = generateOfflineFinalSummary({
        sessionId: record.id,
        profileName: record.profileName,
        gender: record.gender as '男' | '女',
        birthDate: record.birthDatetime.toISOString(),
        currentAge,
        status: 'COMPLETED',
        attributes,
        history: history.slice(0, currentAge + 1),
        milestoneFootprints: footprints,
      });
      break;
    }

    history[currentAge] = node;
    currentAge++;
    stepCount++;
    if (history[currentAge]?.isKeyMilestone) break;
  }

  const newStatus = terminalHit ? 'COMPLETED' : 'IN_PROGRESS';
  await updateSimulationRecordRepo(record.id, {
    currentAge,
    status: newStatus,
    attributesJson: JSON.stringify(attributes),
    historyJson: JSON.stringify(history),
    footprintsJson: JSON.stringify(footprints),
    finalSummaryJson: finalSummary ? JSON.stringify(finalSummary) : undefined,
  });

  return { currentAge, status: newStatus, attributes, terminalHit, finalSummary, steppedYears: stepCount };
}

export async function finalizeSimulationService(
  record: any,
  perspective: BiographyPerspective,
  forceLlm = false
) {
  let summary: any = null;
  if (record.finalSummaryJson) {
    try { summary = JSON.parse(record.finalSummaryJson); } catch {}
  }

  if (!forceLlm && summary && summary.perspectiveBiographies?.[perspective]) {
    summary.activePerspective = perspective;
    summary.biographyRichText = summary.perspectiveBiographies[perspective];
    if (summary.perspectiveTitles?.[perspective]) summary.endingTitle = summary.perspectiveTitles[perspective];
    return summary;
  }

  const history: YearlyLifeNode[] = JSON.parse(record.historyJson);
  const attributes = JSON.parse(record.attributesJson);
  const footprints: string[] = JSON.parse(record.footprintsJson || '[]');
  const femaleFriends: FemaleFriendProfile[] = record.femaleFriendsJson
    ? JSON.parse(record.femaleFriendsJson)
    : getInitialRomanceFriends(record.gender as '男' | '女', record.birthDatetime);

  const mockSession: LifeSimulationSession = {
    sessionId: record.id,
    profileName: record.profileName,
    gender: record.gender as '男' | '女',
    birthDate: record.birthDatetime.toISOString(),
    currentAge: record.currentAge,
    status: 'COMPLETED',
    attributes,
    history: history.slice(0, record.currentAge + 1),
    milestoneFootprints: footprints,
    femaleFriends,
  };

  if (!summary || !summary.perspectiveBiographies) {
    summary = generateOfflineFinalSummary(mockSession, perspective);
  } else {
    summary.activePerspective = perspective;
    if (!summary.oneInEightBillion) summary.oneInEightBillion = calculateOneInEightBillion(mockSession);
  }

  const llmConfig = await getLlmConfig();
  if (forceLlm && llmConfig.enabled && llmConfig.endpoint) {
    try {
      const stylePrompt =
        perspective === 'SHIJI'
          ? '請以司馬遷《史記》列傳筆法撰寫350~500字，文末附「太史公曰：...」，第一行「稱號：【稱號】」。'
          : perspective === 'MEMOIR'
          ? '請以現代紀實回憶錄口吻撰寫350~500字，第一行「稱號：【稱號】」。'
          : perspective === 'ONE_IN_8_BILLION'
          ? '請以「80億分之一的奇蹟史詩」哲思視角撰寫350~500字，第一行「稱號：【80億分之一的奇蹟行者】」。'
          : '請以「人事大於天命」三才合一視角撰寫350~500字自傳，第一行「稱號：【稱號】」。';

      const prompt = `求測者【${record.profileName}】走過了 ${record.currentAge} 載歲月。最終五維：健康 ${attributes.health}、財富 ${attributes.wealth}、事業 ${attributes.career}、情感 ${attributes.relationship}、智慧 ${attributes.wisdom}。足跡：${footprints.join('\n')}\n${stylePrompt}`;
      const llmTask = executeLlmChat(
        [{ role: 'user', content: prompt }],
        { moduleType: 'LIFE_SIMULATOR', title: `一生蓋棺錄 · ${perspective}`, rawData: { session: mockSession, perspective } },
        record.userId || undefined
      );
      const timeoutTask = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 75000));
      const chatRes = await Promise.race([llmTask, timeoutTask]);
      if (chatRes?.reply && chatRes.reply.length > 50) {
        const titleMatch = chatRes.reply.match(/稱號：[【\[]?([^】\]\n]+)[】\]]?/);
        const rawTitle = titleMatch ? titleMatch[1].trim() : null;
        const biographyText = chatRes.reply.replace(/^稱號：.*?\n+/, '').trim() || chatRes.reply.trim();
        summary.perspectiveBiographies[perspective] = biographyText;
        if (rawTitle) {
          summary.perspectiveTitles[perspective] = rawTitle;
          summary.endingTitle = rawTitle;
        }
        summary.perspectiveIsAi[perspective] = true;
        summary.biographyRichText = biographyText;
      }
    } catch {}
  }

  summary.activePerspective = perspective;
  summary.biographyRichText = summary.perspectiveBiographies?.[perspective] || summary.biographyRichText;
  summary.endingTitle = summary.perspectiveTitles?.[perspective] || summary.endingTitle;

  await updateSimulationRecordRepo(record.id, { status: 'COMPLETED', finalSummaryJson: JSON.stringify(summary) });
  return summary;
}

