import { Router, Response } from 'express';
import { prisma } from '@celestial/database';
import { calculateTrueSolarTime } from '@celestial/astro-core';
import { authenticate, AuthRequest } from '../../middleware/auth.js';

export const profilesRouter = Router();

profilesRouter.use(authenticate);

// 取得當前使用者的命盤庫列表
profilesRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const profiles = await prisma.birthProfile.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: profiles });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '查詢命盤列表失敗' });
  }
});

// 新增命盤人物檔案
profilesRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, gender = '男', birthDatetime, longitude = 120, latitude = 25, birthLocationName, notes } = req.body;
    if (!name || !birthDatetime) {
      return res.status(400).json({ success: false, message: '請提供姓名與出生時間' });
    }

    const standardTime = new Date(birthDatetime);
    const solarInfo = calculateTrueSolarTime(standardTime, Number(longitude));

    const profile = await prisma.birthProfile.create({
      data: {
        userId: req.user!.id,
        name,
        gender,
        birthDatetime: standardTime,
        longitude: Number(longitude),
        latitude: Number(latitude),
        birthLocationName,
        trueSolarTime: solarInfo.trueSolarTime,
        notes,
      },
    });

    return res.status(201).json({ success: true, data: profile });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '建立命盤檔案失敗' });
  }
});

// 刪除命盤人物檔案
profilesRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.birthProfile.findFirst({
      where: { id, userId: req.user!.id },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: '找不到該命盤檔案或無權刪除' });
    }

    await prisma.birthProfile.delete({ where: { id } });
    return res.json({ success: true, message: '命盤檔案已刪除' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '刪除失敗' });
  }
});
