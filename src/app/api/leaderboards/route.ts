import { NextRequest } from 'next/server';
import { getLeaderboard } from '@/services/economy';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);
    const leaderboard = await getLeaderboard(limit);
    return ok({ leaderboard, total: leaderboard.length });
  } catch (e) {
    return handleApiError(e);
  }
}
