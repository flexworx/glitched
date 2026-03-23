import { NextRequest } from 'next/server';
import { getBigScreenData } from '@/services/seasons';
import { ok, handleApiError } from '@/lib/api/response';

type Params = { params: { matchId: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const data = await getBigScreenData(params.matchId);
    return ok(data ?? { match: null, activeChallenge: null, bigScreenMessages: [], recentViolations: [] });
  } catch (e) { return handleApiError(e); }
}
