import { NextRequest } from 'next/server';
import { getSeasonById } from '@/services/economy';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(_req: NextRequest, { params }: { params: { seasonId: string } }) {
  try {
    const season = await getSeasonById(params.seasonId);
    if (!season) return handleApiError(new Error('Season not found'));
    return ok(season);
  } catch (e) {
    return handleApiError(e);
  }
}
