import { Router, Response } from 'express';
import { prisma } from '@celestial/database';
import { authenticate, AuthRequest } from '../../middleware/auth.js';

export const habitsRouter = Router();

habitsRouter.use(authenticate);

// 1. 查詢使用者生活起居紀錄
habitsRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, take } = req.query;
    const whereClause: any = { userId: req.user!.id };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = String(startDate);
      if (endDate) whereClause.date.lte = String(endDate);
    }

    const logs = await prisma.dailyHabitLog.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      take: take ? Number(take) : 60,
    });

    return res.json({ success: true, data: logs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '查詢起居生活紀錄失敗' });
  }
});

// 2. 新增生活起居紀錄 (若當日已有紀錄則 Upsert 或覆蓋)
habitsRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      date,
      sleepHours = 7,
      sleepQuality = '良好',
      dietType = '均衡清淡',
      waterMl = 2000,
      exerciseMinutes = 30,
      energyLevel = 4,
      notes,
      tags,
    } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: '請提供紀錄日期 (YYYY-MM-DD)' });
    }

    const tagsStr = Array.isArray(tags) ? JSON.stringify(tags) : typeof tags === 'string' ? tags : null;

    // 檢查當日是否已有紀錄，若有則直接更新
    const existing = await prisma.dailyHabitLog.findFirst({
      where: {
        userId: req.user!.id,
        date: String(date),
      },
    });

    let log;
    if (existing) {
      log = await prisma.dailyHabitLog.update({
        where: { id: existing.id },
        data: {
          sleepHours: Number(sleepHours),
          sleepQuality: String(sleepQuality),
          dietType: String(dietType),
          waterMl: Number(waterMl),
          exerciseMinutes: Number(exerciseMinutes),
          energyLevel: Number(energyLevel),
          notes: notes ? String(notes) : null,
          tags: tagsStr,
        },
      });
    } else {
      log = await prisma.dailyHabitLog.create({
        data: {
          userId: req.user!.id,
          date: String(date),
          sleepHours: Number(sleepHours),
          sleepQuality: String(sleepQuality),
          dietType: String(dietType),
          waterMl: Number(waterMl),
          exerciseMinutes: Number(exerciseMinutes),
          energyLevel: Number(energyLevel),
          notes: notes ? String(notes) : null,
          tags: tagsStr,
        },
      });
    }

    return res.status(201).json({ success: true, data: log });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '建立生活起居紀錄失敗' });
  }
});

// 3. 更新指定生活起居紀錄
habitsRouter.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      sleepHours,
      sleepQuality,
      dietType,
      waterMl,
      exerciseMinutes,
      energyLevel,
      notes,
      tags,
    } = req.body;

    const existing = await prisma.dailyHabitLog.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: '找不到該起居紀錄或無權限修改' });
    }

    const tagsStr = tags !== undefined
      ? (Array.isArray(tags) ? JSON.stringify(tags) : typeof tags === 'string' ? tags : null)
      : existing.tags;

    const updated = await prisma.dailyHabitLog.update({
      where: { id },
      data: {
        sleepHours: sleepHours !== undefined ? Number(sleepHours) : existing.sleepHours,
        sleepQuality: sleepQuality !== undefined ? String(sleepQuality) : existing.sleepQuality,
        dietType: dietType !== undefined ? String(dietType) : existing.dietType,
        waterMl: waterMl !== undefined ? Number(waterMl) : existing.waterMl,
        exerciseMinutes: exerciseMinutes !== undefined ? Number(exerciseMinutes) : existing.exerciseMinutes,
        energyLevel: energyLevel !== undefined ? Number(energyLevel) : existing.energyLevel,
        notes: notes !== undefined ? (notes ? String(notes) : null) : existing.notes,
        tags: tagsStr,
      },
    });

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '更新起居紀錄失敗' });
  }
});

// 4. 刪除生活起居紀錄
habitsRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.dailyHabitLog.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: '找不到該起居紀錄或無權限刪除' });
    }

    await prisma.dailyHabitLog.delete({
      where: { id },
    });

    return res.json({ success: true, message: '紀錄已成功刪除' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '刪除起居紀錄失敗' });
  }
});
