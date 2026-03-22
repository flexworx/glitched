/**
 * RADF v3 — Auth Service
 * Wallet-based authentication with DB-backed user records.
 * User model verified against prisma/schema.prisma.
 * XP/streak live in separate UserStreak and XpEvent models.
 */
import { prisma } from '@/lib/db/client';
import { createWalletToken, isAdminWallet } from '@/lib/auth/wallet-auth';

export async function signInWithWallet(walletAddress: string, signature: string, message: string) {
  if (!signature || !message || !walletAddress) {
    throw new Error('Invalid wallet authentication parameters');
  }

  const role = isAdminWallet(walletAddress) ? 'ADMIN' : 'USER';

  const user = await prisma.user.upsert({
    where: { walletAddress },
    update: { updatedAt: new Date() },
    create: {
      walletAddress,
      username: `arena_${walletAddress.slice(0, 6).toLowerCase()}`,
      role: role as any,
      wallet: {
        create: {
          solanaAddress: walletAddress,
          murphBalance: 1000,
        },
      },
      streak: {
        create: {
          currentStreak: 0,
          longestStreak: 0,
        },
      },
    },
    select: { id: true, username: true, role: true, walletAddress: true },
  });

  const token = createWalletToken({
    walletAddress,
    userId: user.id,
    role: (role.toLowerCase()) as 'user' | 'admin' | 'moderator',
  });

  return { token, user };
}

export async function getCurrentUser(walletAddress: string) {
  return prisma.user.findUnique({
    where: { walletAddress },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      role: true,
      walletAddress: true,
      createdAt: true,
      wallet: {
        select: { murphBalance: true, solanaAddress: true },
      },
      streak: {
        select: { currentStreak: true, longestStreak: true, lastActivity: true, multiplier: true },
      },
      xpEvents: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { amount: true, createdAt: true },
      },
    },
  });
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      role: true,
      walletAddress: true,
      createdAt: true,
      wallet: {
        select: { murphBalance: true, solanaAddress: true },
      },
      streak: {
        select: { currentStreak: true, longestStreak: true, lastActivity: true, multiplier: true },
      },
    },
  });
}

export async function performDailyCheckin(userId: string) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, streak: true },
    });
    if (!user) throw new Error('User not found');

    const streak = user.streak;
    const now = new Date();
    const lastActivity = streak?.lastActivity ?? null;
    const hoursSince = lastActivity
      ? (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60)
      : 999;

    if (hoursSince < 20) {
      throw new Error('Already checked in today');
    }

    const currentStreak = streak?.currentStreak ?? 0;
    const newStreak = hoursSince < 30 ? currentStreak + 1 : 1;
    const xpEarned = 100 + Math.min(newStreak * 10, 200);

    // Update streak
    await tx.userStreak.upsert({
      where: { userId },
      update: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, streak?.longestStreak ?? 0),
        lastActivity: now,
      },
      create: {
        userId,
        currentStreak: newStreak,
        longestStreak: newStreak,
        lastActivity: now,
      },
    });

    // Record XP event
    await tx.xpEvent.create({
      data: {
        userId,
        amount: xpEarned,
        reason: `DAILY_CHECKIN - streak: ${newStreak}`,
      },
    });

    return { xpEarned, newStreak, leveledUp: false };
  });
}
