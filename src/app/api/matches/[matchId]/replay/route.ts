import { NextRequest } from 'next/server';
import { getMatchReplay } from '@/services/matches';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(_req: NextRequest, { params }: { params: { matchId: string } }) {
  try {
    const actions = await getMatchReplay(params.matchId);
    return ok({ matchId: params.matchId, actions, total: actions.length });
  } catch (e) {
    return handleApiError(e);
  }
}
