import { Router, Request, Response } from 'express';
import { calculateDailyAlmanac } from '@celestial/astro-core';

export const almanacRouter = Router();

/**
 * 取得今日傳統黃曆與吉凶運勢
 */
almanacRouter.get('/today', async (_req: Request, res: Response) => {
  try {
    const today = new Date();
    const almanac = calculateDailyAlmanac(today);
    return res.json({
      success: true,
      data: almanac,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '今日黃曆推演失敗' });
  }
});

/**
 * 查詢指定日期之黃曆與運勢
 */
almanacRouter.post('/query', async (req: Request, res: Response) => {
  try {
    const { date } = req.body;
    const targetDate = date ? new Date(date) : new Date();
    const almanac = calculateDailyAlmanac(targetDate);
    return res.json({
      success: true,
      data: almanac,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '黃曆查詢失敗' });
  }
});
