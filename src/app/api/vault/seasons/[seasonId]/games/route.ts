import { NextRequest } from 'next/server';
import {
  getSeasonGamePlan,
  addGameToSeason,
  reorderSeasonGames,
} from '@/services/game-vault';
import { ok, created, handleApiError } from '@/lib/api/response';
import { requireAdmin } from '@/lib/auth/session';
import { z } from 'zod';

const AddGameSchema = z.object({
  templateId: z.string().min(1),
  orderIndex: z.number().int().positive(),
  eliminationOverride: z.number().int().positive().optional(),
  durationOverride: z.number().int().positive().optional(),
  creditOverrides: z.record(z.unknown()).optional(),
  promptOverride: z.string().optional(),
  scheduledStartAt: z.string().datetime().optional(),
  scheduledEndAt: z.string().datetime().optional(),
});

const ReorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)),
});

type Params = { params: { seasonId: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const games = await getSeasonGamePlan(params.seasonId);
    return ok({ games, total: games.length });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const body = AddGameSchema.parse(await req.json());
    const game = await addGameToSeason({
      seasonId: params.seasonId,
      templateId: body.templateId,
      orderIndex: body.orderIndex,
      eliminationOverride: body.eliminationOverride,
      durationOverride: body.durationOverride,
      creditOverrides: body.creditOverrides,
      promptOverride: body.promptOverride,
      scheduledStartAt: body.scheduledStartAt
        ? new Date(body.scheduledStartAt)
        : undefined,
      scheduledEndAt: body.scheduledEndAt
        ? new Date(body.scheduledEndAt)
        : undefined,
    });
    return created(game);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const body = ReorderSchema.parse(await req.json());
    await reorderSeasonGames(params.seasonId, body.orderedIds);
    return ok({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
