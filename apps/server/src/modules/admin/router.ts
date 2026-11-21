import { Router, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { prisma } from '@celestial/database';
import { authenticate, AuthRequest, requireRole } from '../../middleware/auth.js';
import { executeLlmChat, retrieveModuleKnowledge, getModuleRole } from '../llm/service.js';
import {
  getSystemStatsRepo,
  listInterpretationsRepo,
  createInterpretationRepo,
  updateInterpretationRepo,
  deleteInterpretationRepo,
  listUsersRepo,
  createAuditLogRepo,
  listAuditLogsRepo,
} from './repository.js';
import {
  isDbWriteEnabled,
  getBackupDir,
  getDatabaseStatsService,
  createDatabaseBackupService,
  restoreDatabaseBackupService,
  queryTableRowsService,
  mutateTableRowService,
  getMaskedLlmConfigService,
  updateLlmConfigService,
} from './service.js';

export const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(requireRole(['ADMIN']));

function requireDbWriteConfirmation(req: AuthRequest, res: Response, next: NextFunction) {
  if (!isDbWriteEnabled()) {
    return res.status(403).json({
      success: false,
      message: '資料庫管理目前鎖定為 Read-Only 唯讀模式，需開啟 ADMIN_DB_WRITE_ENABLED=true 方可執行寫入/刪除操作',
    });
  }
  const confirmHeader = String(req.headers['x-admin-confirm'] || '');
  const confirmBody = req.body?.confirm === true || req.body?.confirm === 'CONFIRM_DB_WRITE';
  if (confirmHeader !== 'CONFIRM_DB_WRITE' && !confirmBody) {
    return res.status(400).json({
      success: false,
      message: '高危資料庫操作必須提供二次確認憑證 (x-admin-confirm: CONFIRM_DB_WRITE)',
    });
  }
  return next();
}

// 1. 營運統計看板數據
adminRouter.get('/stats', async (_req: AuthRequest, res: Response) => {
  try {
    return res.json({ success: true, data: await getSystemStatsRepo() });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '取得統計數據失敗' });
  }
});

// 2. 命理辭庫 CRUD
adminRouter.get('/interpretations', async (req: AuthRequest, res: Response) => {
  try {
    const items = await listInterpretationsRepo(
      req.query.moduleType ? String(req.query.moduleType) : undefined,
      req.query.search ? String(req.query.search) : undefined
    );
    return res.json({ success: true, data: items });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '查詢辭庫失敗' });
  }
});

adminRouter.post('/interpretations', async (req: AuthRequest, res: Response) => {
  try {
    const { moduleType, keyCode, category, title, contentRich, tags } = req.body;
    if (!moduleType || !keyCode || !category || !title || !contentRich) {
      return res.status(400).json({ success: false, message: '請提供完整的辭條參數' });
    }
    const item = await createInterpretationRepo({
      moduleType,
      keyCode,
      category,
      title,
      contentRich,
      tags: typeof tags === 'object' ? JSON.stringify(tags) : tags,
    });
    return res.status(201).json({ success: true, data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '新增辭條失敗' });
  }
});

adminRouter.put('/interpretations/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { title, contentRich, tags, category } = req.body;
    const item = await updateInterpretationRepo(req.params.id, {
      title,
      contentRich,
      category,
      tags: typeof tags === 'object' ? JSON.stringify(tags) : tags,
    });
    return res.json({ success: true, data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '更新辭條失敗' });
  }
});

adminRouter.delete('/interpretations/:id', async (req: AuthRequest, res: Response) => {
  try {
    await deleteInterpretationRepo(req.params.id);
    return res.json({ success: true, message: '辭條已刪除' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '刪除辭條失敗' });
  }
});

// 3. 會員名單與權限管理
adminRouter.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const users = await listUsersRepo(req.query.search ? String(req.query.search) : undefined);
    return res.json({ success: true, data: users });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '查詢會員名單失敗' });
  }
});

adminRouter.patch('/users/:id/role', async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    if (!['ADMIN', 'MEMBER', 'VIP'].includes(role)) {
      return res.status(400).json({ success: false, message: '無效的權限角色' });
    }
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, email: true, displayName: true, role: true },
    });
    await createAuditLogRepo({
      adminUserId: req.user!.id,
      adminEmail: req.user!.email,
      action: 'USER_ROLE_CHANGE',
      targetTable: 'User',
      targetId: updated.id,
      summary: `變更會員 ${updated.email} 權限為 ${role}`,
      ipAddress: req.ip,
    });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '更新會員權限失敗' });
  }
});

adminRouter.post('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, displayName, role = 'MEMBER' } = req.body;
    if (!email || !password || !displayName) {
      return res.status(400).json({ success: false, message: '請提供信箱、密碼與暱稱' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: '此電子信箱已被註冊' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
        role: ['ADMIN', 'MEMBER', 'VIP'].includes(role) ? role : 'MEMBER',
        emailVerified: true,
      },
      select: { id: true, email: true, displayName: true, role: true, emailVerified: true, createdAt: true },
    });
    return res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '新增會員失敗' });
  }
});

adminRouter.put('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { displayName, email, role, emailVerified } = req.body;
    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (email !== undefined) updateData.email = email;
    if (role && ['ADMIN', 'MEMBER', 'VIP'].includes(role)) updateData.role = role;
    if (typeof emailVerified === 'boolean') updateData.emailVerified = emailVerified;

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: { id: true, email: true, displayName: true, role: true, emailVerified: true, createdAt: true },
    });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '更新會員資料失敗' });
  }
});

adminRouter.post('/users/:id/password', async (req: AuthRequest, res: Response) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: '新密碼長度不可少於 6 位字元' });
    }
    const passwordHash = await bcrypt.hash(String(newPassword), 10);
    await prisma.user.update({ where: { id: req.params.id }, data: { passwordHash } });
    return res.json({ success: true, message: '密碼已成功重設' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '重設密碼失敗' });
  }
});

adminRouter.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.id === req.params.id) {
      return res.status(400).json({ success: false, message: '無法刪除目前登入中的管理員帳號' });
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: '會員帳號已成功刪除' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '刪除會員失敗' });
  }
});

// 4. LLM 系統配置 (AES-256-GCM 加密 + 遮罩 + SSRF 防護)
adminRouter.get('/llm-config', async (_req: AuthRequest, res: Response) => {
  try {
    return res.json({ success: true, data: await getMaskedLlmConfigService() });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '取得 LLM 配置失敗' });
  }
});

adminRouter.put('/llm-config', async (req: AuthRequest, res: Response) => {
  try {
    const data = await updateLlmConfigService(req.body, req.user!, req.ip);
    return res.json({ success: true, data });
  } catch (err: any) {
    const msg = err.message || '更新 LLM 配置失敗';
    const isValidation = msg.includes('SSRF') || msg.includes('URL') || msg.includes('協議');
    return res.status(isValidation ? 400 : 500).json({ success: false, message: msg });
  }
});

adminRouter.post('/llm-test', async (req: AuthRequest, res: Response) => {
  try {
    const testPrompt = req.body.prompt || '你好，請以專業命理星象諮詢顧問身分簡要回覆一段指導語。';
    const result = await executeLlmChat([{ role: 'user', content: testPrompt }], undefined, req.user?.id);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'LLM 測試連線失敗' });
  }
});

// 5. 資料庫管理、Read-Only 防護與稽核日誌
adminRouter.get('/audit-logs', async (_req: AuthRequest, res: Response) => {
  try {
    return res.json({ success: true, data: await listAuditLogsRepo(100) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '讀取稽核日誌失敗' });
  }
});

adminRouter.get('/database/stats', async (_req: AuthRequest, res: Response) => {
  try {
    return res.json({ success: true, data: await getDatabaseStatsService() });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '取得資料庫資訊失敗' });
  }
});

adminRouter.post('/database/backup', async (req: AuthRequest, res: Response) => {
  try {
    const data = await createDatabaseBackupService(req.user!, req.ip);
    return res.status(201).json({ success: true, message: '資料庫備份成功建立', data });
  } catch (err: any) {
    return res.status(err.status || 500).json({ success: false, message: err.message || '備份資料庫失敗' });
  }
});

adminRouter.get('/database/backups', async (_req: AuthRequest, res: Response) => {
  try {
    const backupDir = getBackupDir();
    const files = fs.readdirSync(backupDir)
      .filter((f) => f.endsWith('.db') || f.endsWith('.sqlite'))
      .map((f) => {
        const stat = fs.statSync(path.join(backupDir, f));
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

adminRouter.get('/database/download-backup/:filename', async (req: AuthRequest, res: Response) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(getBackupDir(), filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: '找不到指定的備份檔案' });
    }
    return res.download(filePath, filename);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '下載備份檔案失敗' });
  }
});

adminRouter.post('/database/restore', requireDbWriteConfirmation, async (req: AuthRequest, res: Response) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ success: false, message: '請指定要還原的備份檔案名稱' });
    }
    await restoreDatabaseBackupService(filename, req.user!, req.ip);
    return res.json({ success: true, message: `已成功將資料庫還原至 ${path.basename(filename)} 之快照狀態` });
  } catch (err: any) {
    return res.status(err.status || 500).json({ success: false, message: err.message || '還原資料庫失敗' });
  }
});

adminRouter.get('/database/tables/:table', async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
    const search = req.query.search ? String(req.query.search).trim() : '';
    const data = await queryTableRowsService(req.params.table, page, pageSize, search);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(err.status || 500).json({ success: false, message: err.message || '查詢資料表失敗' });
  }
});

adminRouter.post('/database/tables/:table', requireDbWriteConfirmation, async (req: AuthRequest, res: Response) => {
  try {
    const created = await mutateTableRowService('CREATE', req.params.table, undefined, req.body, req.user!, req.ip);
    return res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    return res.status(err.status || 500).json({ success: false, message: err.message || '新增記錄失敗' });
  }
});

adminRouter.put('/database/tables/:table/:id', requireDbWriteConfirmation, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await mutateTableRowService('UPDATE', req.params.table, req.params.id, req.body, req.user!, req.ip);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(err.status || 500).json({ success: false, message: err.message || '更新記錄失敗' });
  }
});

adminRouter.delete('/database/tables/:table/:id', requireDbWriteConfirmation, async (req: AuthRequest, res: Response) => {
  try {
    await mutateTableRowService('DELETE', req.params.table, req.params.id, {}, req.user!, req.ip);
    return res.json({ success: true, message: '記錄已成功刪除' });
  } catch (err: any) {
    return res.status(err.status || 500).json({ success: false, message: err.message || '刪除記錄失敗' });
  }
});

// 6. RAG 知識庫管理與即時調試器
adminRouter.post('/rag/test-retrieval', async (req: AuthRequest, res: Response) => {
  try {
    const { moduleType = 'ZIWEI', query = '', rawData = {} } = req.body;
    const role = getModuleRole(moduleType);
    const knowledge = await retrieveModuleKnowledge(
      moduleType,
      { moduleType, title: 'RAG 檢索測試', summary: query, rawData },
      query,
      req.user?.id
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

adminRouter.get('/rag/export', async (_req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.systemInterpretation.findMany({
      orderBy: [{ moduleType: 'asc' }, { keyCode: 'asc' }],
    });
    return res.json({ success: true, data: items, exportedAt: new Date().toISOString(), count: items.length });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '匯出 RAG 詞條失敗' });
  }
});

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
    return res.json({ success: true, message: `成功匯入並同步 ${importedCount} 條 RAG 詞條`, count: importedCount });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '匯入 RAG 詞條失敗' });
  }
});
