import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { ok, handleApiError } from '@/lib/api/response';
import prisma from '@/lib/db/client';

type Params = { params: { seasonId: string; gameId: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const game = await prisma.seasonGame.findUnique({
      where: { id: params.gameId },
      include: {
        template: {
          select: {
            id: true, name: true, displayTitle: true, category: true,
            systemPrompt: true, minAgents: true, maxAgents: true,
            eliminationRule: true, eliminationCount: true,
            scoringMethod: true, scoringLogic: true, creditRewards: true,
            estimatedDuration: true, tags: true,
            recommendedRounds: true, recommendedAgents: true, teamFormation: true,
          },
        },
        easterEggs: { include: { easterEgg: true } },
      },
    });
    if (!game || game.seasonId !== params.seasonId) return handleApiError(new Error('Game not found'));

    // Merge template config with any season-level overrides
    const config = {
      ...game.template,
      eliminationCount: game.eliminationOverride ?? game.template.eliminationCount,
      estimatedDuration: game.durationOverride ?? game.template.estimatedDuration,
      creditRewards: game.creditOverrides ?? game.template.creditRewards,
      systemPrompt: game.promptOverride ?? game.template.systemPrompt,
      easterEggs: game.easterEggs,
    };

    return ok({ config, game });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));

    const body = await req.json();
    const {
      eliminationOverride, durationOverride,
      creditOverrides, promptOverride,
    } = body as {
      eliminationOverride?: number; durationOverride?: number;
      creditOverrides?: object; promptOverride?: string;
    };

    const game = await prisma.seasonGame.update({
      where: { id: params.gameId },
      data: {
        ...(eliminationOverride !== undefined ? { eliminationOverride } : {}),
        ...(durationOverride !== undefined ? { durationOverride } : {}),
        ...(creditOverrides !== undefined ? { creditOverrides } : {}),
        ...(promptOverride !== undefined ? { promptOverride } : {}),
      },
    });

    return ok({ game, message: 'Game config updated' });
  } catch (e) {
    return handleApiError(e);
  }
}
