import { NextRequest } from 'next/server';
import { getSeasons } from '@/services/economy';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(_req: NextRequest) {
  try {
    const seasons = await getSeasons();
    return ok({ seasons, total: seasons.length });
  } catch (e) {
    return handleApiError(e);
  }
}
