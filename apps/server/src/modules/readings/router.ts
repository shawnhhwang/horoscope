import { Router, Response } from 'express';
import { prisma } from '@celestial/database';
import { authenticate, AuthRequest } from '../../middleware/auth.js';

export const readingsRouter = Router();

readingsRouter.use(authenticate);

// 獲取歷史占卜與測算記錄
readingsRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { moduleType, isFavorite } = req.query;
    const whereClause: any = { userId: req.user!.id };

    if (moduleType) {
      whereClause.moduleType = String(moduleType);
    }
    if (isFavorite === 'true') {
      whereClause.isFavorite = true;
    }

    const records = await prisma.readingRecord.findMany({
      where: whereClause,
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return res.json({ success: true, data: records });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '查詢占卜記錄失敗' });
  }
});

// 儲存測算結果與占卜日記
readingsRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { profileId, moduleType, inputSnapshot, chartOutput, aiSummary, userNotes } = req.body;
    if (!moduleType || !chartOutput) {
      return res.status(400).json({ success: false, message: '請提供模組類型與排盤資料' });
    }

    const record = await prisma.readingRecord.create({
      data: {
        userId: req.user!.id,
        profileId,
        moduleType,
        inputSnapshot: typeof inputSnapshot === 'object' ? JSON.stringify(inputSnapshot) : String(inputSnapshot || ''),
        chartOutput: typeof chartOutput === 'object' ? JSON.stringify(chartOutput) : String(chartOutput),
        aiSummary,
        userNotes,
      },
    });

    return res.status(201).json({ success: true, data: record });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '儲存占卜記錄失敗' });
  }
});

// 切換喜愛標記或更新心得隨筆
readingsRouter.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isFavorite, userNotes } = req.body;

    const existing = await prisma.readingRecord.findFirst({
      where: { id, userId: req.user!.id },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: '找不到該測算記錄' });
    }

    const updated = await prisma.readingRecord.update({
      where: { id },
      data: {
        ...(typeof isFavorite === 'boolean' ? { isFavorite } : {}),
        ...(typeof userNotes === 'string' ? { userNotes } : {}),
      },
    });

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '更新日記記錄失敗' });
  }
});

// 刪除占卜記錄
readingsRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.readingRecord.findFirst({
      where: { id, userId: req.user!.id },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: '找不到該測算記錄' });
    }

    await prisma.readingRecord.delete({ where: { id } });
    return res.json({ success: true, message: '已成功刪除占卜記錄' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '刪除占卜記錄失敗' });
  }
});
