import { prisma } from '../client';

export async function getLeaderboard(limit = 20) {
  return prisma.xpEvent.groupBy({
    by: ['userId'],
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: limit,
  });
}

export async function getUserStreak(userId: string) {
  return prisma.userStreak.findUnique({ where: { userId } });
}

export async function updateUserStreak(userId: string, data: {
  currentStreak?: number;
  longestStreak?: number;
  lastActivity?: Date;
}) {
  return prisma.userStreak.upsert({
    where: { userId },
    update: {
      ...(data.currentStreak !== undefined ? { currentStreak: data.currentStreak } : {}),
      ...(data.longestStreak !== undefined ? { longestStreak: data.longestStreak } : {}),
      ...(data.lastActivity ? { lastActivity: data.lastActivity } : {}),
    },
    create: {
      userId,
      currentStreak: data.currentStreak || 0,
      longestStreak: data.longestStreak || 0,
      lastActivity: data.lastActivity || new Date(),
    },
  });
}

export async function addXpEvent(userId: string, amount: number, reason: string) {
  return prisma.xpEvent.create({ data: { userId, amount, reason } });
}

export async function getUserAchievements(userId: string) {
  return prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { earnedAt: 'desc' },
  });
}
