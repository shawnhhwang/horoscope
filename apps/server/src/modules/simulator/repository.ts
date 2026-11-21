import { prisma } from '@celestial/database';

export async function createSimulationRecordRepo(data: {
  userId: string | null;
  profileName: string;
  gender: string;
  birthDatetime: Date;
  currentAge: number;
  status: string;
  attributesJson: string;
  historyJson: string;
  footprintsJson: string;
  femaleFriendsJson: string;
}) {
  return prisma.lifeSimulationRecord.create({ data });
}

export async function findSimulationRecordByIdRepo(id: string) {
  return prisma.lifeSimulationRecord.findUnique({ where: { id } });
}

export async function updateSimulationRecordRepo(
  id: string,
  data: {
    currentAge?: number;
    status?: string;
    attributesJson?: string;
    historyJson?: string;
    footprintsJson?: string;
    femaleFriendsJson?: string;
    finalSummaryJson?: string;
  }
) {
  return prisma.lifeSimulationRecord.update({ where: { id }, data });
}
