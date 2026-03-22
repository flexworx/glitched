import { NextRequest } from 'next/server';
import { getPredictionPoolForMatch } from '@/services/predictions';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(_req: NextRequest, { params }: { params: { matchId: string } }) {
  try {
    const pool = await getPredictionPoolForMatch(params.matchId);
    if (!pool) return handleApiError(new Error('Prediction pool not found'));
    return ok(pool);
  } catch (e) {
    return handleApiError(e);
  }
}
