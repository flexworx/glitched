import { NextRequest } from 'next/server';
import { ok, handleApiError } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return handleApiError(new Error('Unauthorized'));

    const [user, achievements, predCount, agentCount] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.userId }, include: { wallet: true } }),
      prisma.userAchievement.findMany({
        where: { userId: session.userId },
        include: { achievement: true },
      }),
      prisma.userPrediction.count({ where: { userId: session.userId } }),
      prisma.agent.count({ where: { operatorId: session.userId } }),
    ]);

    if (!user) return handleApiError(new Error('User not found'));

    return ok({
      achievements,
      stats: {
        totalPredictions: predCount,
        totalAgents: agentCount,
        murphBalance: user.wallet?.murphBalance ?? 0,
        lifetimeMurph: user.lifetimeMurph,
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}
