import { NextRequest } from 'next/server';
import { getMatchById } from '@/services/matches';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(_req: NextRequest, { params }: { params: { matchId: string } }) {
  try {
    const match = await getMatchById(params.matchId);
    if (!match) return handleApiError(new Error('Match not found'));
    return ok(match);
  } catch (e) {
    return handleApiError(e);
  }
}
