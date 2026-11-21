import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { prisma, resolveDatabaseFilePath } from '@celestial/database';
import { maskSecret } from '../../utils/crypto.js';
import { validateExternalLlmEndpoint } from '../../utils/ssrf.js';
import { getLlmConfig, saveLlmConfig } from '../llm/service.js';
import { TABLE_MODELS, createAuditLogRepo } from './repository.js';

export function isDbWriteEnabled(): boolean {
  if (process.env.ADMIN_DB_WRITE_ENABLED === 'false') return false;
  if (process.env.ADMIN_DB_WRITE_ENABLED === 'true') return true;
  // 預設鎖定為 Read-Only（僅非生產且未顯式關閉時在測試外亦建議關閉，生產環境強制 Read-Only）
  return process.env.NODE_ENV === 'test';
}

export function getBackupDir(): string {
  const dbPath = resolveDatabaseFilePath();
  const dir = path.join(path.dirname(dbPath), 'backups');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export async function getDatabaseStatsService() {
  const dbPath = resolveDatabaseFilePath();
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

  return {
    dbName: path.basename(dbPath),
    dbPath,
    readOnly: !isDbWriteEnabled(),
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
  };
}

export async function createDatabaseBackupService(adminUser: { id: string; email: string }, ip?: string) {
  const dbPath = resolveDatabaseFilePath();
  if (!fs.existsSync(dbPath)) {
    throw Object.assign(new Error('找不到來源資料庫檔案'), { status: 404 });
  }

  const backupDir = getBackupDir();
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const backupFilename = `celestial_backup_${timestamp}.db`;
  const backupPath = path.join(backupDir, backupFilename);

  fs.copyFileSync(dbPath, backupPath);
  const stat = fs.statSync(backupPath);

  await createAuditLogRepo({
    adminUserId: adminUser.id,
    adminEmail: adminUser.email,
    action: 'DB_BACKUP',
    summary: `建立資料庫快照備份 ${backupFilename} (${(stat.size / 1024).toFixed(1)} KB)`,
    ipAddress: ip,
  });

  return {
    filename: backupFilename,
    size: stat.size,
    sizeFormatted: `${(stat.size / 1024).toFixed(1)} KB`,
    createdAt: stat.birthtime || stat.mtime,
  };
}

export async function restoreDatabaseBackupService(
  filename: string,
  adminUser: { id: string; email: string },
  ip?: string
) {
  const safeName = path.basename(filename);
  const backupDir = getBackupDir();
  const backupFilePath = path.join(backupDir, safeName);
  if (!fs.existsSync(backupFilePath)) {
    throw Object.assign(new Error('找不到指定的備份檔案'), { status: 404 });
  }

  const dbPath = resolveDatabaseFilePath();
  const preRestoreBackup = path.join(backupDir, `pre_restore_${Date.now()}.db`);
  if (fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, preRestoreBackup);
  }

  await prisma.$disconnect();
  for (const suffix of ['-wal', '-shm', '-journal']) {
    const sidecar = `${dbPath}${suffix}`;
    if (fs.existsSync(sidecar)) {
      try { fs.unlinkSync(sidecar); } catch {}
    }
  }
  fs.copyFileSync(backupFilePath, dbPath);
  await prisma.$connect();

  await createAuditLogRepo({
    adminUserId: adminUser.id,
    adminEmail: adminUser.email,
    action: 'DB_RESTORE',
    summary: `還原資料庫快照 ${safeName}`,
    ipAddress: ip,
  });
}

export async function queryTableRowsService(table: string, page: number, pageSize: number, search: string) {
  const model = TABLE_MODELS[table];
  if (!model) {
    throw Object.assign(new Error(`無效的資料表名稱: ${table}`), { status: 400 });
  }

  const skip = (page - 1) * pageSize;
  const whereClause: any = {};
  if (search) {
    if (table === 'User') whereClause.OR = [{ email: { contains: search } }, { displayName: { contains: search } }];
    else if (table === 'BirthProfile') whereClause.OR = [{ name: { contains: search } }, { birthLocationName: { contains: search } }];
    else if (table === 'ReadingRecord') whereClause.OR = [{ moduleType: { contains: search } }, { aiSummary: { contains: search } }];
    else if (table === 'SystemInterpretation') whereClause.OR = [{ keyCode: { contains: search } }, { title: { contains: search } }, { category: { contains: search } }];
  }

  const [total, rows] = await Promise.all([
    model.count({ where: whereClause }),
    model.findMany({ where: whereClause, skip, take: pageSize }),
  ]);

  const safeRows = table === 'User'
    ? rows.map((r: any) => {
        const { passwordHash, ...safeUser } = r;
        return safeUser;
      })
    : rows;

  return {
    table,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    rows: safeRows,
  };
}

export async function mutateTableRowService(
  op: 'CREATE' | 'UPDATE' | 'DELETE',
  table: string,
  id: string | undefined,
  rawBody: Record<string, any>,
  adminUser: { id: string; email: string },
  ip?: string
) {
  const model = TABLE_MODELS[table];
  if (!model) {
    throw Object.assign(new Error(`無效的資料表名稱: ${table}`), { status: 400 });
  }

  if (op === 'DELETE') {
    await model.delete({ where: { id } });
    await createAuditLogRepo({
      adminUserId: adminUser.id,
      adminEmail: adminUser.email,
      action: 'DB_DELETE',
      targetTable: table,
      targetId: id,
      summary: `刪除 ${table} 資料列 (${id})`,
      ipAddress: ip,
    });
    return null;
  }

  const data = { ...rawBody };
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;

  if (table === 'User') {
    delete data.role;
    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }
  }

  const result = op === 'CREATE'
    ? await model.create({ data })
    : await model.update({ where: { id }, data });

  if (table === 'User' && result) {
    delete result.passwordHash;
  }

  await createAuditLogRepo({
    adminUserId: adminUser.id,
    adminEmail: adminUser.email,
    action: op === 'CREATE' ? 'DB_CREATE' : 'DB_UPDATE',
    targetTable: table,
    targetId: result?.id || id,
    summary: `${op === 'CREATE' ? '新增' : '更新'} ${table} 資料列 (${result?.id || id})`,
    ipAddress: ip,
  });

  return result;
}

export async function getMaskedLlmConfigService() {
  const config = await getLlmConfig();
  return {
    ...config,
    apiKey: maskSecret(config.apiKey),
    hasRealKey: Boolean(config.apiKey && config.apiKey.trim().length > 0),
  };
}

export async function updateLlmConfigService(
  body: Record<string, any>,
  adminUser: { id: string; email: string },
  ip?: string
) {
  const { enabled, provider, endpoint, apiKey, model, temperature, systemPrompt } = body;
  const updateData: any = {};
  if (typeof enabled === 'boolean') updateData.enabled = enabled;
  if (provider) updateData.provider = provider;
  if (typeof model === 'string') updateData.model = model.trim();
  if (typeof temperature === 'number') updateData.temperature = temperature;
  if (systemPrompt) updateData.systemPrompt = systemPrompt;

  if (typeof endpoint === 'string' && endpoint.trim().length > 0) {
    const cleanEndpoint = endpoint.trim();
    const parsedUrl = await validateExternalLlmEndpoint(cleanEndpoint);

    const currentConfig = await getLlmConfig();
    if (currentConfig.endpoint && currentConfig.endpoint !== cleanEndpoint) {
      try {
        const oldHost = new URL(currentConfig.endpoint).hostname;
        const isMasked = typeof apiKey === 'string' && (apiKey.includes('••••') || apiKey.includes('****'));
        if (oldHost !== parsedUrl.hostname && (typeof apiKey !== 'string' || isMasked)) {
          updateData.apiKey = '';
        }
      } catch {}
    }

    updateData.endpoint = cleanEndpoint;
  }

  if (typeof apiKey === 'string' && !apiKey.includes('••••') && !apiKey.includes('****')) {
    updateData.apiKey = apiKey.trim();
  }

  const saved = await saveLlmConfig(updateData);

  await createAuditLogRepo({
    adminUserId: adminUser.id,
    adminEmail: adminUser.email,
    action: 'LLM_CONFIG_UPDATE',
    summary: `更新 LLM 設定 (provider=${saved.provider}, model=${saved.model})`,
    ipAddress: ip,
  });

  return {
    ...saved,
    apiKey: maskSecret(saved.apiKey),
  };
}
