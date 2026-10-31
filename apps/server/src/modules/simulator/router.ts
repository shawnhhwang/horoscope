import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@celestial/database';
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
  getInitialFemaleFriends,
  getInitialRomanceFriends,
  getBlindRomanticEncounter,
  applyRomanticDecision,
  calculateOneInEightBillion,
  FemaleFriendProfile,
} from '@celestial/astro-core';
import { executeLlmChat, getLlmConfig } from '../llm/service.js';
import { verifyToken } from '../../middleware/auth.js';

export const simulatorRouter = Router();

/**
 * 輔助函數：從 Authorization Header 嘗試解析使用者 ID
 */
function extractUserId(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  const user = verifyToken(token);
  return user?.id || null;
}

/**
 * 權限防護：若推演紀錄綁定特定會員，嚴禁其他登入會員跨帳號越權操作 (IDOR 越權防護)
 */
function checkSessionOwnership(recordUserId: string | null | undefined, req: Request): boolean {
  if (!recordUserId) {
    return true;
  }
  const currentUserId = extractUserId(req);
  if (currentUserId && currentUserId !== recordUserId) {
    // 另一位登入會員嘗試操作該會員檔案，判定為越權存取
    return false;
  }
  return true;
}

/**
 * 1. POST /api/v1/simulator/start
 * 初始化人生推演 Session，生成 0～100 歲流年骨幹與初始狀態
 */
simulatorRouter.post('/start', async (req: Request, res: Response) => {
  try {
    const { birthDate, gender = '男', profileName = '求測者' } = req.body;

    if (!birthDate) {
      return res.status(400).json({ success: false, message: '請提供出生日期 (birthDate)' });
    }

    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) {
      return res.status(400).json({ success: false, message: '出生日期格式無效' });
    }

    const validGender = gender === '女' ? '女' : '男';
    const { baziChart, nodes } = generate100YearTimeline(birth, validGender);
    const initialAttributes = calculateInitialAttributes(baziChart);

    // 填寫 0 歲節點初始狀態快照
    nodes[0].snapshotAttributes = { ...initialAttributes };

    const footprints: string[] = [`0歲：降臨世間，稟【${baziChart.dayMaster.stem}】日主之氣`];
    const userId = extractUserId(req);

    // 初始化知己盲盒名冊 (男女雙重視角皆完整支援自訂 KEYIN 生日與年齡對齊)
    const romanceFriends = getInitialRomanceFriends(
      validGender,
      birth,
      req.body.romanceFriends || req.body.femaleFriends
    );

    // ⭐ 核心保證：在起局時，將 5 位知己相遇事件直接預先寫入 nodes[18, 22, 26, 30, 34]，保證一定出現，絕不被覆蓋或跳過！
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

    // 持久化儲存至資料庫
    const record = await prisma.lifeSimulationRecord.create({
      data: {
        userId,
        profileName: String(profileName).trim() || '求測者',
        gender: validGender,
        birthDatetime: birth,
        currentAge: 0,
        status: 'IN_PROGRESS',
        attributesJson: JSON.stringify(initialAttributes),
        historyJson: JSON.stringify(nodes),
        footprintsJson: JSON.stringify(footprints),
        femaleFriendsJson: JSON.stringify(romanceFriends),
      },
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

    return res.json({
      success: true,
      data: {
        session,
        baziChart,
      },
    });
  } catch (err: any) {
    console.error('Simulator Start Error:', err);
    return res.status(500).json({ success: false, message: err.message || '人生推演起盤失敗' });
  }
});

/**
 * 2. GET /api/v1/simulator/session/:id
 * 讀取推演存檔
 */
simulatorRouter.get('/session/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = await prisma.lifeSimulationRecord.findUnique({
      where: { id },
    });

    if (!record) {
      return res.status(404).json({ success: false, message: '未找到該推演 Session' });
    }

    if (!checkSessionOwnership(record.userId, req)) {
      return res.status(403).json({ success: false, message: '無權限存取此推演紀錄' });
    }

    const session: LifeSimulationSession = {
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

    return res.json({ success: true, data: session });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '讀取存檔失敗' });
  }
});

/**
 * 3. POST /api/v1/simulator/turn/prompt
 * 生成指定歲數的年初行運定調、重大轉折情境與抉擇選項
 */
simulatorRouter.post('/turn/prompt', async (req: Request, res: Response) => {
  try {
    const { sessionId, age } = req.body;
    if (!sessionId || typeof age !== 'number') {
      return res.status(400).json({ success: false, message: '請提供 sessionId 與 age' });
    }

    const record = await prisma.lifeSimulationRecord.findUnique({
      where: { id: sessionId },
    });
    if (!record) {
      return res.status(404).json({ success: false, message: '未找到推演 Session' });
    }

    if (!checkSessionOwnership(record.userId, req)) {
      return res.status(403).json({ success: false, message: '無權限操作此推演紀錄' });
    }

    const history: YearlyLifeNode[] = JSON.parse(record.historyJson);
    const attributes = JSON.parse(record.attributesJson);
    const footprints: string[] = JSON.parse(record.footprintsJson || '[]');

    const node = history[age];
    if (!node) {
      return res.status(400).json({ success: false, message: '無效的歲數索引' });
    }

    if (!node.taiwanEraContext) {
      node.taiwanEraContext = getTaiwanEraContext(node.solarYear);
    }

    // 若節點已有事件與選項，直接回傳
    if (node.eventTitle && node.options && node.options.length > 0) {
      return res.json({
        success: true,
        data: {
          node,
          attributes,
          milestones: footprints,
        },
      });
    }

    // 嘗試調用 LLM 生成富文本情境與選項；若 LLM 未連線或失敗則優雅 Fallback
    let eventTitle = '';
    let eventNarrative = '';
    let options: LifeOption[] = [];

    // 檢查男女雙重視角之知己盲盒相遇事件 (18, 22, 26, 30, 34 歲)
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

    // 僅在非知己盲盒相遇年才調用 LLM，防止 LLM 覆蓋知己相逢與相伴一生事件！
    if (!eventTitle) {
      const llmConfig = await getLlmConfig();
      if (llmConfig.enabled && llmConfig.endpoint) {
        try {
        const promptText = `你正在主持一場嚴肅且深邃的「百歲流年人生推演」。
求測者姓名：${record.profileName} (${record.gender})
當前年齡：${age} 歲 (虛歲 ${node.nominalAge} 歲)
生活舞台：台灣 (Taiwan)
西曆年份：${node.solarYear} 年
台灣時代背景：${node.taiwanEraContext}
當期平均壽命：約 ${node.eraAvgLifeExpectancy || 75} 歲
當期主流疾疫：${node.eraEpidemics?.join('、') || '一般風土時疫'}
${node.isEpidemicYear ? '⚠️ 【時代重大公衛考驗】：本年正處於重大傳染病流行高峰期，請將時疫求生、防護或衝擊深刻融入事件與選項中！' : ''}
流年干支：【${node.ganzhi}】年 (值年十神：${node.tenGod}，行運評級：${node.fortuneLevel})
當前值年大運：【${node.daYun.stem}${node.daYun.branch}】大運
當前五維屬性：健康 ${attributes.health}，財富 ${attributes.wealth}，事業 ${attributes.career}，情感 ${attributes.relationship}，智慧 ${attributes.wisdom}
歷年關鍵足跡：${footprints.slice(-3).join('；')}
${node.isKeyMilestone ? `【重大轉折提示】：本年逢 ${node.milestoneReason}` : ''}

【核心指令】：
推演預設生活場景在台灣，歷史跨度涵蓋 1845 年清末開港前夕至當代與未來。請務必緊密結合該西曆年份的【台灣時代背景】以及【當代平均壽命與公衛傳染病環境】（例如19世紀中葉的瘴癘瘧疾與霍亂、清末開港洋行、日治初期鼠疫避病院、1918西班牙流感、戰後初期小兒麻痺與卡介苗、1965瘧疾根除、1984首創B肝全面疫苗、2003抗擊SARS、2021新冠三級警戒、2025超高齡長照等），讓該年的生活事件與 3 個具有不同代價抉擇的選項充滿深刻的歷史擬真度與時代共鳴。

嚴禁使用仙人道士口吻。請以嚴格的 JSON 格式回傳，格式範例如下：
{
  "eventTitle": "事件標題",
  "eventNarrative": "2~3句生動且結合台灣時代氛圍的情境描寫",
  "options": [
    {
      "id": "opt_a",
      "text": "選項A說明",
      "attitude": "AGGRESSIVE",
      "potentialImpact": { "career": 5, "wealth": 3, "health": -3 },
      "riskLevel": "HIGH"
    },
    {
      "id": "opt_b",
      "text": "選項B說明",
      "attitude": "CONSERVATIVE",
      "potentialImpact": { "wealth": 3, "health": 2 },
      "riskLevel": "LOW"
    },
    {
      "id": "opt_c",
      "text": "選項C說明",
      "attitude": "MORAL",
      "potentialImpact": { "wisdom": 4, "relationship": 3 },
      "riskLevel": "LOW"
    }
  ]
}`;

        const chatRes = await executeLlmChat(
          [{ role: 'user', content: promptText }],
          {
            moduleType: 'LIFE_SIMULATOR',
            title: `流年推演 · ${age}歲`,
            rawData: { age, ganzhi: node.ganzhi, tenGod: node.tenGod, profileName: record.profileName },
          }
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
      } catch (err) {
        // Fallback 到確定性引擎
      }
    }
  }

    // 若 LLM 未生成成功，使用確定性引擎生成
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

    // 更新資料庫
    await prisma.lifeSimulationRecord.update({
      where: { id: sessionId },
      data: {
        historyJson: JSON.stringify(history),
      },
    });

    return res.json({
      success: true,
      data: {
        node,
        attributes,
        milestones: footprints,
      },
    });
  } catch (err: any) {
    console.error('Turn Prompt Error:', err);
    return res.status(500).json({ success: false, message: err.message || '生成年度事件失敗' });
  }
});

/**
 * 4. POST /api/v1/simulator/turn/choose
 * 提交使用者選擇，結算屬性變化、健康衰減與生命週期前進
 */
simulatorRouter.post('/turn/choose', async (req: Request, res: Response) => {
  try {
    const { sessionId, age, chosenOptionId, customText } = req.body;
    if (!sessionId || typeof age !== 'number') {
      return res.status(400).json({ success: false, message: '請提供 sessionId 與 age' });
    }

    const record = await prisma.lifeSimulationRecord.findUnique({
      where: { id: sessionId },
    });
    if (!record) {
      return res.status(404).json({ success: false, message: '未找到推演 Session' });
    }

    if (!checkSessionOwnership(record.userId, req)) {
      return res.status(403).json({ success: false, message: '無權限操作此推演紀錄' });
    }

    const history: YearlyLifeNode[] = JSON.parse(record.historyJson);
    let attributes = JSON.parse(record.attributesJson);
    const footprints: string[] = JSON.parse(record.footprintsJson || '[]');

    const node = history[age];
    if (!node) {
      return res.status(400).json({ success: false, message: '無效的歲數索引' });
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

    // 結算屬性差值 (考量時代平均壽命與傳染病衝擊)
    const { newAttributes, deltas } = resolveTurnDecision(
      attributes,
      age,
      node.fortuneLevel,
      chosenOption,
      customText ? String(customText).trim() : undefined,
      node.solarYear
    );

    // 若為知己盲盒選項，更新羈絆值與因緣狀態 (包含相伴一生抉擇)
    let femaleFriends: FemaleFriendProfile[] = record.femaleFriendsJson
      ? JSON.parse(record.femaleFriendsJson)
      : getInitialRomanceFriends(record.gender as '男' | '女', record.birthDatetime);

    if (
      chosenOption &&
      (chosenOption.id.startsWith('opt_romantic_') || chosenOption.id.includes('friend_'))
    ) {
      femaleFriends = applyRomanticDecision(
        femaleFriends,
        chosenOption.id,
        age,
        record.gender as '男' | '女'
      );
      const chosenFriend = femaleFriends.find((f) => chosenOption.id.includes(f.id));
      if (chosenFriend && chosenOption.id.includes('spouse')) {
        footprints.push(
          `${age}歲：因緣際會，選擇與【${chosenFriend.mysteryAlias}】定下白首誓約，相伴一生`
        );
        node.resolutionNarrative = `你在 ${age} 歲的命運十字路口，做出了此生最重要的決定：與【${chosenFriend.mysteryAlias}】許下白首誓盟，約定攜手相伴一生。這份堅定的誓言，成為你未來歲月中最溫暖深厚的港灣。`;
      }
    }

    // 檢查壽元與終局狀態 (考量時代天年極限與公衛環境)
    const mortality = evaluateMortalityCheck(age, newAttributes, node.fortuneLevel, node.solarYear);

    node.chosenOptionId = chosenOption.id;
    node.attributeDeltas = deltas;
    node.snapshotAttributes = newAttributes;
    node.resolutionNarrative = `你在面對【${node.eventTitle || '人生關卡'}】時選擇了「${chosenOption.text}」。歲月推進，身心氣場隨之調適。`;

    if (node.isKeyMilestone) {
      footprints.push(`${age}歲：${node.milestoneReason || node.eventTitle}，選擇了「${chosenOption.text.slice(0, 24)}」`);
    }

    let isTerminal = mortality.isTerminal;
    let finalSummary = undefined;

    if (isTerminal) {
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

      await prisma.lifeSimulationRecord.update({
        where: { id: sessionId },
        data: {
          currentAge: age,
          status: 'COMPLETED',
          attributesJson: JSON.stringify(newAttributes),
          historyJson: JSON.stringify(history),
          footprintsJson: JSON.stringify(footprints),
          femaleFriendsJson: femaleFriends ? JSON.stringify(femaleFriends) : undefined,
          finalSummaryJson: JSON.stringify(finalSummary),
        },
      });
    } else {
      history[age] = node;
      const nextAge = Math.min(100, age + 1);

      await prisma.lifeSimulationRecord.update({
        where: { id: sessionId },
        data: {
          currentAge: nextAge,
          attributesJson: JSON.stringify(newAttributes),
          historyJson: JSON.stringify(history),
          footprintsJson: JSON.stringify(footprints),
          femaleFriendsJson: femaleFriends ? JSON.stringify(femaleFriends) : undefined,
        },
      });
    }

    return res.json({
      success: true,
      data: {
        resolvedNode: node,
        newAttributes,
        isTerminal,
        terminalReason: mortality.reason,
        finalSummary,
        nextAge: isTerminal ? age : age + 1,
      },
    });
  } catch (err: any) {
    console.error('Turn Choose Error:', err);
    return res.status(500).json({ success: false, message: err.message || '結算決策失敗' });
  }
});

/**
 * 5. POST /api/v1/simulator/fast-forward
 * 快進推進：自動平順前進至下一個重大轉折年 (Key Milestone)
 */
simulatorRouter.post('/fast-forward', async (req: Request, res: Response) => {
  try {
    const { sessionId, maxYears = 10 } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: '請提供 sessionId' });
    }

    const record = await prisma.lifeSimulationRecord.findUnique({
      where: { id: sessionId },
    });
    if (!record) {
      return res.status(404).json({ success: false, message: '未找到推演 Session' });
    }

    if (!checkSessionOwnership(record.userId, req)) {
      return res.status(403).json({ success: false, message: '無權限操作此推演紀錄' });
    }

    if (record.status === 'COMPLETED' || record.status === 'TERMINATED') {
      return res.json({
        success: true,
        message: '推演已結束',
        data: { session: record },
      });
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

      // 若當前歲數已經是關鍵轉折年或知己盲盒相遇年，且尚未完成決策，則立即停止快進交由使用者親自抉擇
      const isRomanticTurn =
        [18, 22, 26, 30, 34].includes(currentAge) ||
        node.eventTitle?.includes('邂逅') ||
        node.options?.some((o) => o.id?.includes('romantic'));
      if ((node.isKeyMilestone || isRomanticTurn) && !node.chosenOptionId) {
        break;
      }

      // 自動選取平穩選項
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

        const mockSession: LifeSimulationSession = {
          sessionId: record.id,
          profileName: record.profileName,
          gender: record.gender as '男' | '女',
          birthDate: record.birthDatetime.toISOString(),
          currentAge,
          status: 'COMPLETED',
          attributes,
          history: history.slice(0, currentAge + 1),
          milestoneFootprints: footprints,
        };
        finalSummary = generateOfflineFinalSummary(mockSession);
        break;
      }

      history[currentAge] = node;
      currentAge++;
      stepCount++;

      // 若前進到的歲數是重大轉折年，則停下來讓用戶手動抉擇
      if (history[currentAge]?.isKeyMilestone) {
        break;
      }
    }

    const newStatus = terminalHit ? 'COMPLETED' : 'IN_PROGRESS';
    await prisma.lifeSimulationRecord.update({
      where: { id: sessionId },
      data: {
        currentAge,
        status: newStatus,
        attributesJson: JSON.stringify(attributes),
        historyJson: JSON.stringify(history),
        footprintsJson: JSON.stringify(footprints),
        finalSummaryJson: finalSummary ? JSON.stringify(finalSummary) : undefined,
      },
    });

    return res.json({
      success: true,
      data: {
        currentAge,
        status: newStatus,
        attributes,
        terminalHit,
        finalSummary,
        steppedYears: stepCount,
      },
    });
  } catch (err: any) {
    console.error('Fast-Forward Error:', err);
    return res.status(500).json({ success: false, message: err.message || '快進推演失敗' });
  }
});

/**
 * 6. POST /api/v1/simulator/finalize
 * 手動生成終局《一生行誼·蓋棺錄》完整自傳與成就評級 (方案 C: 支援倪師心法、太史公列傳、時代回憶錄多重視角與 LLM 深度生成)
 */
simulatorRouter.post('/finalize', async (req: Request, res: Response) => {
  try {
    const { sessionId, perspective = 'TIANJI', forceLlm = false } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: '請提供 sessionId' });
    }

    const record = await prisma.lifeSimulationRecord.findUnique({
      where: { id: sessionId },
    });
    if (!record) {
      return res.status(404).json({ success: false, message: '未找到推演 Session' });
    }

    if (!checkSessionOwnership(record.userId, req)) {
      return res.status(403).json({ success: false, message: '無權限操作此推演紀錄' });
    }

    const targetPerspective: BiographyPerspective = ['TIANJI', 'SHIJI', 'MEMOIR', 'ONE_IN_8_BILLION'].includes(perspective)
      ? (perspective as BiographyPerspective)
      : 'TIANJI';

    let summary: any = null;
    if (record.finalSummaryJson) {
      try {
        summary = JSON.parse(record.finalSummaryJson);
      } catch {}
    }

    // 若非強制 LLM 生成，且快取中已有該視角之自傳，直接極速回傳 (0ms)
    if (!forceLlm && summary && summary.perspectiveBiographies?.[targetPerspective]) {
      summary.activePerspective = targetPerspective;
      summary.biographyRichText = summary.perspectiveBiographies[targetPerspective];
      if (summary.perspectiveTitles?.[targetPerspective]) {
        summary.endingTitle = summary.perspectiveTitles[targetPerspective];
      }
      return res.json({ success: true, data: summary });
    }

    const history: YearlyLifeNode[] = JSON.parse(record.historyJson);
    const attributes = JSON.parse(record.attributesJson);
    const footprints: string[] = JSON.parse(record.footprintsJson || '[]');
    const femaleFriends: FemaleFriendProfile[] | undefined = record.femaleFriendsJson
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

    // 若尚未初始化 summary，以離線合成器生成基礎框架與多重視角預設文本
    if (!summary || !summary.perspectiveBiographies) {
      summary = generateOfflineFinalSummary(mockSession, targetPerspective);
    } else {
      summary.activePerspective = targetPerspective;
      // 確保 80 億分之一數據始終具備
      if (!summary.oneInEightBillion) {
        summary.oneInEightBillion = calculateOneInEightBillion(mockSession);
      }
    }

    // 當指定 forceLlm 為 true 時，調用 LLM 進行該視角之史詩級深度撰寫
    const llmConfig = await getLlmConfig();
    if (forceLlm && llmConfig.enabled && llmConfig.endpoint) {
      try {
        let styleInstruction = '';
        if (targetPerspective === 'SHIJI') {
          styleInstruction = `【風格要求】：請以司馬遷《史記》列傳正史之春秋筆法撰寫。行文需典雅凝練、微言大義、文言文白相融，生動記述其生平功過與在台灣歷史大浪中的沉浮奮起。文末必須包含「太史公曰：...」進行蓋棺論定與史家贊辭，字數約 350~500 字，並賦予一個 6~10 字之尊崇史官諡號/稱號。\n格式規範：第一行請輸出「稱號：【稱號文字】」，換行後輸出自傳全文。`;
        } else if (targetPerspective === 'MEMOIR') {
          styleInstruction = `【風格要求】：請以現代紀實自傳回憶錄之視角撰寫。筆促溫潤細膩、充滿人生真情與煙火氣息，深刻描繪其隨台灣時代變遷（如求學打拼、成家育兒、時代浪潮與晚年歲月）的心路歷程，並留給後代子孫一段真摯傳世告白，字數約 350~500 字，並給予一個 6~10 字之暖心回憶錄題名。\n格式規範：第一行請輸出「稱號：【稱號文字】」，換行後輸出自傳全文。`;
        } else if (targetPerspective === 'ONE_IN_8_BILLION') {
          styleInstruction = `【風格要求】：請以「80億分之一的奇蹟史詩」哲思視角撰寫。在當前全地球 80 億人潮的汪洋中，回眸其一生在台灣歷經的風雲浪潮、每一次自由意志抉擇與紅顏因緣盲盒大揭曉，寫下一篇 350~500 字雄渾深邃且充滿宇宙奇蹟感的自傳蓋棺錄。\n格式規範：第一行請輸出「稱號：【80億分之一的奇蹟行者】」，換行後輸出自傳全文。`;
        } else {
          styleInstruction = `【風格要求】：請以倪海廈《天紀》命理大師「人事努力大於先天命運、天紀地脈三才合一」之宏大視角，深入點評其一生行誼，剖析其如何以自由意志與行善積德化解歲運煞氣，撰寫一篇 350~500 字典雅深刻且發人深省的《一生行誼·蓋棺錄》天紀心法自傳，並給予一個 6~10 字的榮譽稱號。\n格式規範：第一行請輸出「稱號：【稱號文字】」，換行後輸出自傳全文。`;
        }

        const prompt = `求測者【${record.profileName}】在台灣的生活舞台上走過了 ${record.currentAge} 載歲月。
最終五維成就：健康 ${attributes.health}，財富 ${attributes.wealth}，事業 ${attributes.career}，情感 ${attributes.relationship}，智慧 ${attributes.wisdom}。
一生在台灣的重要足跡與時代印記：
${footprints.join('\n')}

${styleInstruction}`;

        const llmTask = executeLlmChat(
          [{ role: 'user', content: prompt }],
          {
            moduleType: 'LIFE_SIMULATOR',
            title: `一生蓋棺錄 · ${targetPerspective}`,
            rawData: { session: mockSession, perspective: targetPerspective },
          }
        );
        // 提供充足超時時間給本地/雲端模型 (75 秒)
        const timeoutTask = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('LLM Finalize Timeout')), 75000)
        );
        const chatRes = await Promise.race([llmTask, timeoutTask]);

        if (chatRes?.reply && chatRes.reply.length > 50) {
          const titleMatch = chatRes.reply.match(/稱號：[【\[]?([^】\]\n]+)[】\]]?/);
          const rawTitle = titleMatch ? titleMatch[1].trim() : null;
          let biographyText = chatRes.reply.replace(/^稱號：.*?\n+/, '').trim();
          if (!biographyText) biographyText = chatRes.reply.trim();

          if (!summary.perspectiveBiographies) summary.perspectiveBiographies = {};
          if (!summary.perspectiveTitles) summary.perspectiveTitles = {};
          if (!summary.perspectiveIsAi) summary.perspectiveIsAi = {};

          summary.perspectiveBiographies[targetPerspective] = biographyText;
          if (rawTitle) {
            summary.perspectiveTitles[targetPerspective] = rawTitle;
            summary.endingTitle = rawTitle;
          }
          summary.perspectiveIsAi[targetPerspective] = true;
          summary.biographyRichText = biographyText;
        }
      } catch (llmErr) {
        console.warn('LLM Generate Perspective Warning, fallback to current:', llmErr);
      }
    }

    summary.activePerspective = targetPerspective;
    summary.biographyRichText = summary.perspectiveBiographies?.[targetPerspective] || summary.biographyRichText;
    summary.endingTitle = summary.perspectiveTitles?.[targetPerspective] || summary.endingTitle;

    await prisma.lifeSimulationRecord.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        finalSummaryJson: JSON.stringify(summary),
      },
    });

    return res.json({
      success: true,
      data: summary,
    });
  } catch (err: any) {
    console.error('Finalize Error:', err);
    return res.status(500).json({ success: false, message: err.message || '生成終局總結失敗' });
  }
});
