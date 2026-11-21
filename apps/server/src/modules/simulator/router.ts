import { Router, Request, Response } from 'express';
import { BiographyPerspective } from '@celestial/astro-core';
import { simulatorStartSchema } from '@celestial/shared';
import { verifyToken } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { findSimulationRecordByIdRepo } from './repository.js';
import {
  startSimulationService,
  hydrateSimulationSession,
  generateTurnPromptService,
  chooseTurnOptionService,
  fastForwardService,
  finalizeSimulationService,
} from './service.js';
import {
  runWhatIfBranchComparisonService,
  runCoupleSimulationService,
} from './branchService.js';

export const simulatorRouter = Router();

function extractUserId(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.split(' ')[1])?.id || null;
}

function checkSessionOwnership(recordUserId: string | null | undefined, req: Request): boolean {
  if (!recordUserId) return true;
  const currentUserId = extractUserId(req);
  if (currentUserId && currentUserId !== recordUserId) return false;
  return true;
}

// 1. 初始化人生推演 Session
simulatorRouter.post('/start', validateRequest({ body: simulatorStartSchema }), async (req: Request, res: Response) => {
  try {
    const { birthDate, gender, profileName, romanceFriends, femaleFriends } = req.body;
    const data = await startSimulationService({
      userId: extractUserId(req),
      birthDate,
      gender,
      profileName,
      romanceFriends: romanceFriends || femaleFriends,
    });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(err.status || 500).json({ success: false, message: err.message || '人生推演起盤失敗' });
  }
});

// 2. 讀取推演存檔
simulatorRouter.get('/session/:id', async (req: Request, res: Response) => {
  try {
    const record = await findSimulationRecordByIdRepo(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: '未找到該推演 Session' });
    if (!checkSessionOwnership(record.userId, req)) {
      return res.status(403).json({ success: false, message: '無權限存取此推演紀錄' });
    }
    return res.json({ success: true, data: hydrateSimulationSession(record) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '讀取存檔失敗' });
  }
});

// 3. 生成指定歲數之年度情境與抉擇選項
simulatorRouter.post('/turn/prompt', async (req: Request, res: Response) => {
  try {
    const { sessionId, age } = req.body;
    if (!sessionId || typeof age !== 'number') {
      return res.status(400).json({ success: false, message: '請提供 sessionId 與 age' });
    }
    const record = await findSimulationRecordByIdRepo(sessionId);
    if (!record) return res.status(404).json({ success: false, message: '未找到推演 Session' });
    if (!checkSessionOwnership(record.userId, req)) {
      return res.status(403).json({ success: false, message: '無權限操作此推演紀錄' });
    }
    const data = await generateTurnPromptService(record, age);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(err.status || 500).json({ success: false, message: err.message || '生成年度事件失敗' });
  }
});

// 4. 提交選項並結算推進歲月
simulatorRouter.post('/turn/choose', async (req: Request, res: Response) => {
  try {
    const { sessionId, age, chosenOptionId, customText } = req.body;
    if (!sessionId || typeof age !== 'number') {
      return res.status(400).json({ success: false, message: '請提供 sessionId 與 age' });
    }
    const record = await findSimulationRecordByIdRepo(sessionId);
    if (!record) return res.status(404).json({ success: false, message: '未找到推演 Session' });
    if (!checkSessionOwnership(record.userId, req)) {
      return res.status(403).json({ success: false, message: '無權限操作此推演紀錄' });
    }
    const data = await chooseTurnOptionService(record, age, chosenOptionId, customText);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(err.status || 500).json({ success: false, message: err.message || '結算決策失敗' });
  }
});

// 5. 平順快進至下一個轉折年
simulatorRouter.post('/fast-forward', async (req: Request, res: Response) => {
  try {
    const { sessionId, maxYears = 10 } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, message: '請提供 sessionId' });
    const record = await findSimulationRecordByIdRepo(sessionId);
    if (!record) return res.status(404).json({ success: false, message: '未找到推演 Session' });
    if (!checkSessionOwnership(record.userId, req)) {
      return res.status(403).json({ success: false, message: '無權限操作此推演紀錄' });
    }
    const result = await fastForwardService(record, maxYears);
    if ((result as any).alreadyEnded) {
      return res.json({ success: true, message: '推演已結束', data: { session: (result as any).session } });
    }
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '快進推演失敗' });
  }
});

// 6. 終局《一生行誼·蓋棺錄》多重視角生成
simulatorRouter.post('/finalize', async (req: Request, res: Response) => {
  try {
    const { sessionId, perspective = 'TIANJI', forceLlm = false } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, message: '請提供 sessionId' });
    const record = await findSimulationRecordByIdRepo(sessionId);
    if (!record) return res.status(404).json({ success: false, message: '未找到推演 Session' });
    if (!checkSessionOwnership(record.userId, req)) {
      return res.status(403).json({ success: false, message: '無權限操作此推演紀錄' });
    }
    const validPersp: BiographyPerspective = ['TIANJI', 'SHIJI', 'MEMOIR', 'ONE_IN_8_BILLION'].includes(perspective)
      ? (perspective as BiographyPerspective)
      : 'TIANJI';
    const summary = await finalizeSimulationService(record, validPersp, Boolean(forceLlm));
    return res.json({ success: true, data: summary });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '生成終局總結失敗' });
  }
});

// 7. [P2-PROD-04] 平行時空 What-If 分岔推演對比
simulatorRouter.post('/what-if', async (req: Request, res: Response) => {
  try {
    const { birthDate, gender = '男', branchAge = 28, pathALabel = '創業開拓', pathBLabel = '穩健留任' } = req.body;
    if (!birthDate) return res.status(400).json({ success: false, message: '請提供 birthDate' });
    const data = runWhatIfBranchComparisonService({
      birthDate,
      gender: gender === '女' ? '女' : '男',
      branchAge: Number(branchAge),
      pathALabel: String(pathALabel),
      pathBLabel: String(pathBLabel),
    });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'What-If 分岔推演失敗' });
  }
});

// 8. [P2-PROD-04] 雙人合盤十年人生模擬
simulatorRouter.post('/couple', async (req: Request, res: Response) => {
  try {
    const { person1, person2 } = req.body;
    if (!person1?.birthDate || !person2?.birthDate) {
      return res.status(400).json({ success: false, message: '請提供雙方出生資料' });
    }
    const data = runCoupleSimulationService({ person1, person2 });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '雙人模擬推演失敗' });
  }
});
