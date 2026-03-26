import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { ok, created, handleApiError } from '@/lib/api/response';
import prisma from '@/lib/db/client';

type Params = { params: { seasonId: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const games = await prisma.seasonGame.findMany({
      where: { seasonId: params.seasonId },
      include: {
        template: { select: { id: true, displayTitle: true, category: true } },
        easterEggs: { include: { easterEgg: true } },
      },
      orderBy: { orderIndex: 'asc' },
    });
    return ok({ games, total: games.length });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));

    const body = await req.json();
    const {
      templateId, orderIndex,
      eliminationOverride, durationOverride,
      creditOverrides, promptOverride,
      scheduledStartAt, scheduledEndAt,
    } = body as {
      templateId: string; orderIndex: number;
      eliminationOverride?: number; durationOverride?: number;
      creditOverrides?: object; promptOverride?: string;
      scheduledStartAt?: string; scheduledEndAt?: string;
    };

    if (!templateId || orderIndex === undefined) {
      return handleApiError(new Error('templateId and orderIndex are required'));
    }

    const game = await prisma.seasonGame.create({
      data: {
        seasonId: params.seasonId,
        templateId,
        orderIndex,
        eliminationOverride,
        durationOverride,
        creditOverrides,
        promptOverride,
        scheduledStartAt: scheduledStartAt ? new Date(scheduledStartAt) : undefined,
        scheduledEndAt: scheduledEndAt ? new Date(scheduledEndAt) : undefined,
      },
      include: { template: { select: { id: true, displayTitle: true, category: true } } },
    });

    return created({ game });
  } catch (e) {
    return handleApiError(e);
  }
}
