import prisma from '../client';

export async function getLeaderboard(metric: 'xp' | 'veritas' | 'wins', limit = 50) {
  if (metric === 'xp') {
    return prisma.user.findMany({ orderBy: { xp: 'desc' }, take: limit, select: { id: true, username: true, xp: true, level: true, faction: true } });
  }
  return [];
}

export async function checkAndAwardAchievement(userId: string, achievementId: string) {
  const existing = await prisma.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId } },
  });
  if (existing) return null;

  return prisma.userAchievement.create({
    data: { userId, achievementId },
  });
}

export async function updateStreak(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const newStreak = user.streak + 1;
  const newLongest = Math.max(newStreak, user.longestStreak);

  return prisma.user.update({
    where: { id: userId },
    data: { streak: newStreak, longestStreak: newLongest, lastCheckin: new Date() },
  });
}
