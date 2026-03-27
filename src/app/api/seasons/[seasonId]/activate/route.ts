import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { ok, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

type Params = { params: { seasonId: string } };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return handleApiError(new Error('Forbidden'));
    }

    const season = await prisma.season.findUnique({
      where: { id: params.seasonId },
      include: { seasonGames: { orderBy: { orderIndex: 'asc' } } },
    });

    if (!season) return handleApiError(new Error('Season not found'));
    if (season.status === 'ACTIVE') return handleApiError(new Error('Season is already active'));
    if (season.status === 'COMPLETED') return handleApiError(new Error('Season is already completed'));

    if (season.seasonGames.length === 0) {
      return handleApiError(new Error('Cannot activate a season with no games scheduled'));
    }

    // Mark any other active seasons as completed first (only one active at a time)
    await prisma.season.updateMany({
      where: { status: 'ACTIVE' },
      data: { status: 'COMPLETED', endedAt: new Date() },
    });

    // Activate this season
    const updated = await prisma.season.update({
      where: { id: params.seasonId },
      data: {
        status: 'ACTIVE',
        startedAt: new Date(),
      },
    });

    // Activate the first game in the season (if it has no scheduled start time or start time is now/past)
    const firstGame = season.seasonGames[0];
    const now = new Date();
    const shouldStartFirstGame =
      !firstGame.scheduledStartAt || new Date(firstGame.scheduledStartAt) <= now;

    if (shouldStartFirstGame) {
      await prisma.seasonGame.update({
        where: { id: firstGame.id },
        data: { status: 'ACTIVE' as const, actualStartAt: now },
      });
    }

    return ok({
      season: updated,
      message: `Season "${updated.name}" is now LIVE`,
      firstGameActivated: shouldStartFirstGame,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
