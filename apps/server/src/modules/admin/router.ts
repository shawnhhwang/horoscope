import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { prisma } from '@celestial/database';
import { authenticate, AuthRequest, requireRole } from '../../middleware/auth.js';
import { getLlmConfig, saveLlmConfig, executeLlmChat, retrieveModuleKnowledge, getModuleRole } from '../llm/service.js';

export const adminRouter = Router();

function getDatabaseFilePath(): string {
  const url = process.env.DATABASE_URL || 'file:./packages/database/prisma/dev.db';
  const cleaned = url.replace(/^file:/, '');
  return path.isAbsolute(cleaned) ? cleaned : path.resolve(process.cwd(), cleaned);
}

function getBackupDir(): string {
  const dbPath = getDatabaseFilePath();
  const dir = path.join(path.dirname(dbPath), 'backups');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

const TABLE_MODELS: Record<string, any> = {
  User: prisma.user,
  BirthProfile: prisma.birthProfile,
  ReadingRecord: prisma.readingRecord,
  SystemInterpretation: prisma.systemInterpretation,
};

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

// 7.1 手動建立新會員
adminRouter.post('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, displayName, role = 'MEMBER' } = req.body;
    if (!email || !password || !displayName) {
      return res.status(400).json({ success: false, message: '請提供完整的信箱、密碼與暱稱' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: '該電子信箱已被註冊' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
        role: ['MEMBER', 'VIP', 'ADMIN'].includes(role) ? role : 'MEMBER',
        emailVerified: true,
      },
      select: { id: true, email: true, displayName: true, role: true, emailVerified: true, createdAt: true },
    });

    return res.status(201).json({ success: true, data: user });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '建立會員失敗' });
  }
});

// 7.2 修改會員詳細資料
adminRouter.put('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email, displayName, role, emailVerified } = req.body;

    const data: any = {};
    if (email) data.email = email.trim();
    if (displayName) data.displayName = displayName.trim();
    if (role && ['MEMBER', 'VIP', 'ADMIN'].includes(role)) data.role = role;
    if (typeof emailVerified === 'boolean') data.emailVerified = emailVerified;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, displayName: true, role: true, emailVerified: true, updatedAt: true },
    });

    return res.json({ success: true, data: user });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '更新會員資料失敗' });
  }
});

// 7.3 重設會員密碼
adminRouter.post('/users/:id/password', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: '新密碼長度至少需 6 個字元' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    return res.json({ success: true, message: '密碼已成功重設' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '重設密碼失敗' });
  }
});

// 7.4 刪除會員
adminRouter.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (req.user?.id === id) {
      return res.status(400).json({ success: false, message: '無法刪除目前登入中的管理員帳號' });
    }

    await prisma.user.delete({ where: { id } });
    return res.json({ success: true, message: '會員帳號已成功刪除' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '刪除會員失敗' });
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

// ==========================================
// 11. 資料庫管理、即時編輯與備份/還原 (Database Management)
// ==========================================

// 11.1 取得資料庫檔案與表單統計
adminRouter.get('/database/stats', async (_req: AuthRequest, res: Response) => {
  try {
    const dbPath = getDatabaseFilePath();
    let fileSize = 0;
    let fileModified: Date | null = null;
    if (fs.existsSync(dbPath)) {
      const stat = fs.statSync(dbPath);
      fileSize = stat.size;
      fileModified = stat.mtime;
    }

    const [userCount, profileCount, readingCount, interpretationCount] = await Promise.all([
      prisma.user.count(),
      prisma.birthProfile.count(),
      prisma.readingRecord.count(),
      prisma.systemInterpretation.count(),
    ]);

    const backupDir = getBackupDir();
    const backupFiles = fs.readdirSync(backupDir).filter((f) => f.endsWith('.db') || f.endsWith('.sqlite'));

    return res.json({
      success: true,
      data: {
        dbName: path.basename(dbPath),
        dbPath,
        fileSize,
        fileSizeFormatted: `${(fileSize / 1024).toFixed(1)} KB`,
        fileModified,
        tableCounts: {
          User: userCount,
          BirthProfile: profileCount,
          ReadingRecord: readingCount,
          SystemInterpretation: interpretationCount,
        },
        totalRecords: userCount + profileCount + readingCount + interpretationCount,
        backupCount: backupFiles.length,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '取得資料庫資訊失敗' });
  }
});

// 11.2 建立即時資料庫備份檔案
adminRouter.post('/database/backup', async (_req: AuthRequest, res: Response) => {
  try {
    const dbPath = getDatabaseFilePath();
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ success: false, message: '找不到來源資料庫檔案' });
    }

    const backupDir = getBackupDir();
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const backupFilename = `celestial_backup_${timestamp}.db`;
    const backupPath = path.join(backupDir, backupFilename);

    fs.copyFileSync(dbPath, backupPath);
    const stat = fs.statSync(backupPath);

    return res.status(201).json({
      success: true,
      message: '資料庫備份成功建立',
      data: {
        filename: backupFilename,
        size: stat.size,
        sizeFormatted: `${(stat.size / 1024).toFixed(1)} KB`,
        createdAt: stat.birthtime || stat.mtime,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '備份資料庫失敗' });
  }
});

// 11.3 取得歷史備份檔案清單
adminRouter.get('/database/backups', async (_req: AuthRequest, res: Response) => {
  try {
    const backupDir = getBackupDir();
    const files = fs.readdirSync(backupDir)
      .filter((f) => f.endsWith('.db') || f.endsWith('.sqlite'))
      .map((f) => {
        const fullPath = path.join(backupDir, f);
        const stat = fs.statSync(fullPath);
        return {
          filename: f,
          size: stat.size,
          sizeFormatted: `${(stat.size / 1024).toFixed(1)} KB`,
          createdAt: stat.mtime,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({ success: true, data: files });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '查詢備份列表失敗' });
  }
});

// 11.4 下載指定備份檔案
adminRouter.get('/database/download-backup/:filename', async (req: AuthRequest, res: Response) => {
  try {
    const filename = path.basename(req.params.filename);
    const backupDir = getBackupDir();
    const filePath = path.join(backupDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: '找不到指定的備份檔案' });
    }

    return res.download(filePath, filename);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '下載備份檔案失敗' });
  }
});

// 11.5 還原資料庫快照
adminRouter.post('/database/restore', async (req: AuthRequest, res: Response) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ success: false, message: '請指定要還原的備份檔案名稱' });
    }

    const safeName = path.basename(filename);
    const backupDir = getBackupDir();
    const backupFilePath = path.join(backupDir, safeName);

    if (!fs.existsSync(backupFilePath)) {
      return res.status(404).json({ success: false, message: '找不到指定的備份檔案' });
    }

    const dbPath = getDatabaseFilePath();

    // 先保留一份還原前的保護快照
    const preRestoreBackup = path.join(backupDir, `pre_restore_${Date.now()}.db`);
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, preRestoreBackup);
    }

    // 複製還原
    fs.copyFileSync(backupFilePath, dbPath);

    return res.json({
      success: true,
      message: `已成功將資料庫還原至 ${safeName} 之快照狀態`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '還原資料庫失敗' });
  }
});

// 11.6 表格檢視器：查詢指定資料表內容 (分頁 + 搜尋)
adminRouter.get('/database/tables/:table', async (req: AuthRequest, res: Response) => {
  try {
    const { table } = req.params;
    const model = TABLE_MODELS[table];
    if (!model) {
      return res.status(400).json({ success: false, message: `無效的資料表名稱: ${table}` });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
    const skip = (page - 1) * pageSize;
    const search = req.query.search ? String(req.query.search).trim() : '';

    let whereClause: any = {};
    if (search) {
      if (table === 'User') {
        whereClause.OR = [{ email: { contains: search } }, { displayName: { contains: search } }];
      } else if (table === 'BirthProfile') {
        whereClause.OR = [{ name: { contains: search } }, { birthLocationName: { contains: search } }];
      } else if (table === 'ReadingRecord') {
        whereClause.OR = [{ moduleType: { contains: search } }, { aiSummary: { contains: search } }];
      } else if (table === 'SystemInterpretation') {
        whereClause.OR = [{ keyCode: { contains: search } }, { title: { contains: search } }, { category: { contains: search } }];
      }
    }

    const [total, rows] = await Promise.all([
      model.count({ where: whereClause }),
      model.findMany({
        where: whereClause,
        skip,
        take: pageSize,
      }),
    ]);

    return res.json({
      success: true,
      data: {
        table,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        rows,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '查詢資料表失敗' });
  }
});

// 11.7 表格記錄新增
adminRouter.post('/database/tables/:table', async (req: AuthRequest, res: Response) => {
  try {
    const { table } = req.params;
    const model = TABLE_MODELS[table];
    if (!model) {
      return res.status(400).json({ success: false, message: `無效的資料表名稱: ${table}` });
    }

    const data = { ...req.body };
    delete data.id;
    delete data.createdAt;
    delete data.updatedAt;

    if (table === 'User' && data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }

    const created = await model.create({ data });
    return res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '新增記錄失敗' });
  }
});

// 11.8 表格記錄修改
adminRouter.put('/database/tables/:table/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { table, id } = req.params;
    const model = TABLE_MODELS[table];
    if (!model) {
      return res.status(400).json({ success: false, message: `無效的資料表名稱: ${table}` });
    }

    const data = { ...req.body };
    delete data.id;
    delete data.createdAt;
    delete data.updatedAt;

    if (table === 'User') {
      if (data.password) {
        data.passwordHash = await bcrypt.hash(data.password, 10);
        delete data.password;
      }
    }

    const updated = await model.update({
      where: { id },
      data,
    });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '更新記錄失敗' });
  }
});

// 11.9 表格記錄刪除
adminRouter.delete('/database/tables/:table/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { table, id } = req.params;
    const model = TABLE_MODELS[table];
    if (!model) {
      return res.status(400).json({ success: false, message: `無效的資料表名稱: ${table}` });
    }

    await model.delete({ where: { id } });
    return res.json({ success: true, message: '記錄已成功刪除' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '刪除記錄失敗' });
  }
});

// ==========================================
// 12. RAG 知識庫管理與即時調試器 (RAG Engineering)
// ==========================================

// 12.1 RAG 檢索即時調試與提示詞驗證
adminRouter.post('/rag/test-retrieval', async (req: AuthRequest, res: Response) => {
  try {
    const { moduleType = 'ZIWEI', query = '', rawData = {} } = req.body;
    const role = getModuleRole(moduleType);
    const knowledge = await retrieveModuleKnowledge(
      moduleType,
      {
        moduleType,
        title: 'RAG 檢索測試',
        summary: query,
        rawData,
      },
      query
    );

    return res.json({
      success: true,
      data: {
        moduleType,
        roleTitle: role.title,
        rolePersona: role.rolePersona,
        toneGuidelines: role.toneGuidelines,
        coreKnowledge: role.coreKnowledge,
        consultationStructure: role.consultationStructure,
        generatedRagSnippet: knowledge,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'RAG 檢索測試失敗' });
  }
});

// 12.2 匯出全部 RAG 辭庫條目為 JSON
adminRouter.get('/rag/export', async (_req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.systemInterpretation.findMany({
      orderBy: [{ moduleType: 'asc' }, { keyCode: 'asc' }],
    });
    return res.json({
      success: true,
      data: items,
      exportedAt: new Date().toISOString(),
      count: items.length,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '匯出 RAG 詞條失敗' });
  }
});

// 12.3 批次匯入 RAG 辭庫條目
adminRouter.post('/rag/import', async (req: AuthRequest, res: Response) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: '請提供有效的詞條陣列' });
    }

    let importedCount = 0;
    for (const item of items) {
      if (!item.keyCode || !item.moduleType || !item.title) continue;
      await prisma.systemInterpretation.upsert({
        where: { keyCode: item.keyCode },
        update: {
          moduleType: item.moduleType,
          category: item.category || 'GENERAL',
          title: item.title,
          contentRich: item.contentRich || '',
          tags: typeof item.tags === 'object' ? JSON.stringify(item.tags) : item.tags,
        },
        create: {
          keyCode: item.keyCode,
          moduleType: item.moduleType,
          category: item.category || 'GENERAL',
          title: item.title,
          contentRich: item.contentRich || '',
          tags: typeof item.tags === 'object' ? JSON.stringify(item.tags) : item.tags,
        },
      });
      importedCount++;
    }

    return res.json({
      success: true,
      message: `成功匯入並同步 ${importedCount} 條 RAG 詞條`,
      count: importedCount,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '匯入 RAG 詞條失敗' });
  }
});

