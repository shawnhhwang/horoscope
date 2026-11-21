import { prisma } from '@celestial/database';

export const TABLE_MODELS: Record<string, any> = {
  User: prisma.user,
  BirthProfile: prisma.birthProfile,
  ReadingRecord: prisma.readingRecord,
  SystemInterpretation: prisma.systemInterpretation,
};

export async function getSystemStatsRepo() {
  const [totalUsers, vipUsers, totalProfiles, totalReadings, totalInterpretations, readings] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'VIP' } }),
    prisma.birthProfile.count(),
    prisma.readingRecord.count(),
    prisma.systemInterpretation.count(),
    prisma.readingRecord.findMany({ select: { moduleType: true } }),
  ]);

  const moduleDistribution: Record<string, number> = {};
  readings.forEach((r) => {
    moduleDistribution[r.moduleType] = (moduleDistribution[r.moduleType] || 0) + 1;
  });

  return {
    totalUsers,
    vipUsers,
    totalProfiles,
    totalReadings,
    totalInterpretations,
    moduleDistribution,
  };
}

export async function listInterpretationsRepo(moduleType?: string, search?: string) {
  const whereClause: any = {};
  if (moduleType) whereClause.moduleType = moduleType;
  if (search) {
    whereClause.OR = [
      { title: { contains: search } },
      { keyCode: { contains: search } },
      { contentRich: { contains: search } },
    ];
  }
  return prisma.systemInterpretation.findMany({
    where: whereClause,
    orderBy: { updatedAt: 'desc' },
  });
}

export async function createInterpretationRepo(data: {
  moduleType: string;
  keyCode: string;
  category: string;
  title: string;
  contentRich: string;
  tags?: string;
}) {
  return prisma.systemInterpretation.create({ data });
}

export async function updateInterpretationRepo(
  id: string,
  data: { title?: string; contentRich?: string; category?: string; tags?: string }
) {
  return prisma.systemInterpretation.update({ where: { id }, data });
}

export async function deleteInterpretationRepo(id: string) {
  return prisma.systemInterpretation.delete({ where: { id } });
}

export async function listUsersRepo(search?: string) {
  const whereClause: any = {};
  if (search) {
    whereClause.OR = [{ email: { contains: search } }, { displayName: { contains: search } }];
  }
  return prisma.user.findMany({
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
  });
}

export async function createAuditLogRepo(entry: {
  adminUserId: string;
  adminEmail: string;
  action: string;
  targetTable?: string;
  targetId?: string;
  summary: string;
  ipAddress?: string;
}) {
  return prisma.adminAuditLog.create({ data: entry });
}

export async function listAuditLogsRepo(take = 50) {
  return prisma.adminAuditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take,
  });
}
