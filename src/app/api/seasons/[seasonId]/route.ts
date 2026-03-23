import { NextRequest } from 'next/server';
import { getSeasonById, updateSeason, activateSeason, endSeason } from '@/services/seasons';
import { ok, handleApiError } from '@/lib/api/response';
import { requireAdmin } from '@/lib/auth/session';

type Params = { params: { seasonId: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const season = await getSeasonById(params.seasonId);
    if (!season) return handleApiError(new Error('Season not found'));
    return ok(season);
  } catch (e) { return handleApiError(e); }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { action, ...data } = body;
    if (action === 'activate') return ok(await activateSeason(params.seasonId));
    if (action === 'end') return ok(await endSeason(params.seasonId));
    return ok(await updateSeason(params.seasonId, data));
  } catch (e) { return handleApiError(e); }
}
