import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUserPredictions } from '@/services/predictions';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return handleApiError(new Error('Unauthorized'));
    const predictions = await getUserPredictions(session.userId);
    return ok({ predictions, total: predictions.length });
  } catch (e) {
    return handleApiError(e);
  }
}
