import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { seedDatabase } from './seed.js';

export * from '@prisma/client';
export { seedDatabase };

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function resolveDatabaseFilePath(): string {
  const possiblePaths = [
    path.resolve(process.cwd(), 'packages/database/prisma/dev.db'),
    path.resolve(process.cwd(), '../database/prisma/dev.db'),
    path.resolve(process.cwd(), '../../packages/database/prisma/dev.db'),
    path.resolve(process.cwd(), 'prisma/dev.db'),
    path.resolve(__dirname, '../prisma/dev.db'),
  ];

  const rawUrl = process.env.DATABASE_URL?.trim();
  let resolvedPath: string;

  if (!rawUrl) {
    const found = possiblePaths.find((p) => fs.existsSync(p));
    resolvedPath = found || possiblePaths[0];
  } else if (rawUrl.startsWith('file:')) {
    const withoutPrefix = rawUrl.replace(/^file:/, '').split('?')[0];
    if (path.isAbsolute(withoutPrefix)) {
      resolvedPath = withoutPrefix;
    } else {
      const fromCwd = path.resolve(process.cwd(), withoutPrefix);
      if (fs.existsSync(fromCwd)) {
        resolvedPath = fromCwd;
      } else {
        const found = possiblePaths.find((p) => fs.existsSync(p));
        resolvedPath = found || fromCwd;
      }
    }
  } else {
    resolvedPath = path.isAbsolute(rawUrl) ? rawUrl : path.resolve(process.cwd(), rawUrl);
  }

  // 確保目標資料庫目錄與 backups 目錄存在 (支援 Docker Volume 掛載空目錄)
  const dbDir = path.dirname(resolvedPath);
  try {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const backupDir = path.join(dbDir, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // 若目標資料庫不存在或為 0 byte 空檔，且存在預置種子模板 (如 Docker 映像內 /app/seed-template.db)，自動複製初始化
    const dbExistsAndNonEmpty = fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).size > 0;
    if (!dbExistsAndNonEmpty) {
      const templateCandidates = [
        process.env.SEED_TEMPLATE_DB_PATH,
        '/app/seed-template.db',
        path.resolve(process.cwd(), 'seed-template.db'),
        path.resolve(__dirname, '../prisma/seed-template.db'),
      ].filter(Boolean) as string[];

      const validTemplate = templateCandidates.find(
        (tpl) =>
          fs.existsSync(tpl) &&
          fs.statSync(tpl).size > 0 &&
          path.resolve(tpl) !== path.resolve(resolvedPath)
      );

      if (validTemplate) {
        fs.copyFileSync(validTemplate, resolvedPath);
        console.log(`📦 Initialized SQLite database from template: ${validTemplate} -> ${resolvedPath}`);
      }
    }
  } catch (err) {
    console.warn('⚠️ Database directory/template pre-check warning:', err);
  }

  process.env.DATABASE_URL = `file:${resolvedPath}`;
  return resolvedPath;
}

resolveDatabaseFilePath();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

const SCHEMA_DDL_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,
  `CREATE TABLE IF NOT EXISTS "BirthProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthDatetime" DATETIME NOT NULL,
    "longitude" REAL NOT NULL DEFAULT 120.0,
    "latitude" REAL NOT NULL DEFAULT 25.0,
    "birthLocationName" TEXT,
    "trueSolarTime" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BirthProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "ReadingRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "profileId" TEXT,
    "moduleType" TEXT NOT NULL,
    "inputSnapshot" TEXT NOT NULL,
    "chartOutput" TEXT NOT NULL,
    "aiSummary" TEXT,
    "userNotes" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReadingRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReadingRecord_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "BirthProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "DailyHabitLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "sleepHours" REAL NOT NULL DEFAULT 7.0,
    "sleepQuality" TEXT NOT NULL DEFAULT '良好',
    "dietType" TEXT NOT NULL DEFAULT '均衡清淡',
    "waterMl" INTEGER NOT NULL DEFAULT 2000,
    "exerciseMinutes" INTEGER NOT NULL DEFAULT 30,
    "energyLevel" INTEGER NOT NULL DEFAULT 4,
    "notes" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyHabitLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "SystemInterpretation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moduleType" TEXT NOT NULL,
    "keyCode" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentRich" TEXT NOT NULL,
    "tags" TEXT,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "SystemInterpretation_keyCode_key" ON "SystemInterpretation"("keyCode")`,
  `CREATE TABLE IF NOT EXISTS "KangxiChar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "char" TEXT NOT NULL,
    "strokeCount" INTEGER NOT NULL,
    "element" TEXT NOT NULL,
    "pinyin" TEXT,
    "radical" TEXT,
    "auspiciousLevel" TEXT,
    "meaning" TEXT
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "KangxiChar_char_key" ON "KangxiChar"("char")`,
  `CREATE TABLE IF NOT EXISTS "SystemConfig" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "LifeSimulationRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "profileName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthDatetime" DATETIME NOT NULL,
    "currentAge" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "attributesJson" TEXT NOT NULL,
    "historyJson" TEXT NOT NULL,
    "footprintsJson" TEXT NOT NULL,
    "femaleFriendsJson" TEXT,
    "finalSummaryJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LifeSimulationRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "AdminAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminUserId" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetTable" TEXT,
    "targetId" TEXT,
    "summary" TEXT NOT NULL,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
];

let initPromise: Promise<void> | null = null;

/**
 * 確保 SQLite 資料庫表結構與基礎種子資料已初始化
 * 防止 Docker 掛載空 Volume 或全新部署時發生 "The table main.User does not exist" 錯誤
 */
export async function ensureDatabaseInitialized(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      resolveDatabaseFilePath();
      for (const ddl of SCHEMA_DDL_STATEMENTS) {
        await prisma.$executeRawUnsafe(ddl);
      }
      const userCount = await prisma.user.count();
      if (userCount === 0) {
        console.log('🌱 Empty database detected at runtime, executing initial seed...');
        await seedDatabase(prisma);
      }
    } catch (err) {
      initPromise = null;
      console.error('❌ Failed to initialize database schema/seed:', err);
      throw err;
    }
  })();
  return initPromise;
}
