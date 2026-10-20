import { Router, Response } from 'express';
import { prisma } from '@celestial/database';
import { authenticate, AuthRequest, requireRole } from '../../middleware/auth.js';
import { getLlmConfig, saveLlmConfig, executeLlmChat } from '../llm/service.js';

export const adminRouter = Router();

// 全局套用身份驗證與 ADMIN 權限校驗
adminRouter.use(authenticate);
adminRouter.use(requireRole(['ADMIN']));

// 1. 營運統計看板數據
adminRouter.get('/stats', async (_req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const vipUsers = await prisma.user.count({ where: { role: 'VIP' } });
    const totalProfiles = await prisma.birthProfile.count();
    const totalReadings = await prisma.readingRecord.count();
    const totalInterpretations = await prisma.systemInterpretation.count();

    // 各模組測算頻次分佈
    const readings = await prisma.readingRecord.findMany({ select: { moduleType: true } });
    const moduleDistribution: Record<string, number> = {};
    readings.forEach((r) => {
      moduleDistribution[r.moduleType] = (moduleDistribution[r.moduleType] || 0) + 1;
    });

    return res.json({
      success: true,
      data: {
        totalUsers,
        vipUsers,
        totalProfiles,
        totalReadings,
        totalInterpretations,
        moduleDistribution,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '取得統計數據失敗' });
  }
});

// 2. 命理辭庫列表
adminRouter.get('/interpretations', async (req: AuthRequest, res: Response) => {
  try {
    const { moduleType, search } = req.query;
    const whereClause: any = {};
    if (moduleType) whereClause.moduleType = String(moduleType);
    if (search) {
      whereClause.OR = [
        { title: { contains: String(search) } },
        { keyCode: { contains: String(search) } },
        { contentRich: { contains: String(search) } },
      ];
    }

    const items = await prisma.systemInterpretation.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
    });
    return res.json({ success: true, data: items });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '查詢辭庫失敗' });
  }
});

// 3. 新增辭庫條目
adminRouter.post('/interpretations', async (req: AuthRequest, res: Response) => {
  try {
    const { moduleType, keyCode, category, title, contentRich, tags } = req.body;
    if (!moduleType || !keyCode || !category || !title || !contentRich) {
      return res.status(400).json({ success: false, message: '請提供完整的辭條參數' });
    }

    const item = await prisma.systemInterpretation.create({
      data: {
        moduleType,
        keyCode,
        category,
        title,
        contentRich,
        tags: typeof tags === 'object' ? JSON.stringify(tags) : tags,
      },
    });

    return res.status(201).json({ success: true, data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '新增辭條失敗' });
  }
});

// 4. 修改辭庫條目
adminRouter.put('/interpretations/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, contentRich, tags, category } = req.body;

    const item = await prisma.systemInterpretation.update({
      where: { id },
      data: {
        title,
        contentRich,
        category,
        tags: typeof tags === 'object' ? JSON.stringify(tags) : tags,
      },
    });

    return res.json({ success: true, data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '更新辭條失敗' });
  }
});

// 5. 刪除辭庫條目
adminRouter.delete('/interpretations/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.systemInterpretation.delete({ where: { id } });
    return res.json({ success: true, message: '辭條已刪除' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '刪除辭條失敗' });
  }
});

// 6. 會員名單管理
adminRouter.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { search } = req.query;
    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { email: { contains: String(search) } },
        { displayName: { contains: String(search) } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        _count: { select: { profiles: true, readings: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return res.json({ success: true, data: users });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '查詢會員列表失敗' });
  }
});

// 7. 更新會員權限角色 (MEMBER, VIP, ADMIN)
adminRouter.patch('/users/:id/role', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['MEMBER', 'VIP', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: '無效的角色類型' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, displayName: true, role: true },
    });

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '修改權限失敗' });
  }
});

// 8. 取得 LLM 助手系統配置
adminRouter.get('/llm-config', async (_req: AuthRequest, res: Response) => {
  try {
    const config = await getLlmConfig();
    // 隱藏敏感 Key，僅顯示遮罩
    const maskedKey = config.apiKey
      ? config.apiKey.length > 8
        ? `${config.apiKey.slice(0, 4)}••••${config.apiKey.slice(-4)}`
        : '••••••••'
      : '';

    return res.json({
      success: true,
      data: {
        ...config,
        apiKey: maskedKey,
        hasRealKey: Boolean(config.apiKey && config.apiKey.trim().length > 0),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '取得 LLM 配置失敗' });
  }
});

// 9. 更新 LLM 助手系統配置
adminRouter.put('/llm-config', async (req: AuthRequest, res: Response) => {
  try {
    const { enabled, provider, endpoint, apiKey, model, temperature, systemPrompt } = req.body;

    const updateData: any = {};
    if (typeof enabled === 'boolean') updateData.enabled = enabled;
    if (provider) updateData.provider = provider;
    if (typeof endpoint === 'string') updateData.endpoint = endpoint.trim();
    if (typeof model === 'string') updateData.model = model.trim();
    if (typeof temperature === 'number') updateData.temperature = temperature;
    if (systemPrompt) updateData.systemPrompt = systemPrompt;

    // 若傳入 key（包含留空字串以清空金鑰），且非遮罩符號，則更新
    if (typeof apiKey === 'string' && !apiKey.includes('••••')) {
      updateData.apiKey = apiKey.trim();
    }

    const saved = await saveLlmConfig(updateData);

    const maskedKey = saved.apiKey
      ? saved.apiKey.length > 8
        ? `${saved.apiKey.slice(0, 4)}••••${saved.apiKey.slice(-4)}`
        : '••••••••'
      : '';

    return res.json({
      success: true,
      data: {
        ...saved,
        apiKey: maskedKey,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '更新 LLM 配置失敗' });
  }
});

// 10. 測試 LLM 連線
adminRouter.post('/llm-test', async (req: AuthRequest, res: Response) => {
  try {
    const testPrompt = req.body.prompt || '你好，請以專業命理星象諮詢顧問身分簡要回覆一段指導語。';
    const result = await executeLlmChat([{ role: 'user', content: testPrompt }]);
    return res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'LLM 測試連線失敗' });
  }
});

