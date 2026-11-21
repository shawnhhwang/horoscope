import { prisma } from '@celestial/database';

export async function findInterpretationsByModules(moduleTypes: string[], take?: number) {
  return prisma.systemInterpretation.findMany({
    where: {
      OR: moduleTypes.map((moduleType) => ({ moduleType })),
    },
    ...(take ? { take } : {}),
  });
}
