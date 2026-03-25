import { NextRequest } from 'next/server';
import { updateSeasonGame, removeGameFromSeason } from '@/services/game-vault';
import { ok, handleApiError } from '@/lib/api/response';
import { requireAdmin } from '@/lib/auth/session';
import { z } from 'zod';

const UpdateSeasonGameSchema = z.object({
  orderIndex: z.number().int().positive().optional(),
  eliminationOverride: z.number().int().positive().optional(),
  durationOverride: z.number().int().positive().optional(),
  creditOverrides: z.record(z.unknown()).optional(),
  promptOverride: z.string().optional(),
  scheduledStartAt: z.string().datetime().optional(),
  scheduledEndAt: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
  results: z.record(z.unknown()).optional(),
});

type Params = { params: { seasonId: string; gameId: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const body = UpdateSeasonGameSchema.parse(await req.json());
    const game = await updateSeasonGame(params.gameId, {
      ...body,
      scheduledStartAt: body.scheduledStartAt
        ? new Date(body.scheduledStartAt)
        : undefined,
      scheduledEndAt: body.scheduledEndAt
        ? new Date(body.scheduledEndAt)
        : undefined,
    });
    return ok(game);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    await removeGameFromSeason(params.gameId);
    return ok({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
