import { NextRequest } from 'next/server';
import { resolveGameConfig } from '@/services/game-vault';
import { ok, handleApiError } from '@/lib/api/response';

type Params = { params: { seasonId: string; gameId: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const config = await resolveGameConfig(params.gameId);
    return ok(config);
  } catch (e) {
    return handleApiError(e);
  }
}
