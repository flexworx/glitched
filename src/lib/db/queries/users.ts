import prisma from '../client';

export async function getUserByWallet(walletAddress: string) {
  return prisma.user.findUnique({ where: { walletAddress } });
}

export async function createUser(walletAddress: string, username?: string) {
  return prisma.user.create({
    data: {
      walletAddress,
      username: username || `arena_${Math.random().toString(36).slice(2, 8)}`,
      murphBalance: 0,
      xp: 0,
      level: 1,
      streak: 0,
      longestStreak: 0,
      faction: 'none',
    },
  });
}

export async function updateUserXP(userId: string, xpGain: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const newXP = user.xp + xpGain;
  const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;

  return prisma.user.update({
    where: { id: userId },
    data: { xp: newXP, level: newLevel },
  });
}
