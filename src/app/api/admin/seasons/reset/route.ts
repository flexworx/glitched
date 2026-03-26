import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { ok, handleApiError } from '@/lib/api/response';
import { runSeasonalReset } from '@/services/seasonal-reset';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));
    const body = await req.json().catch(() => ({}));
    const { seasonId } = body as { seasonId?: string };
    if (!seasonId) return handleApiError(new Error('seasonId is required'));
    await runSeasonalReset(seasonId);
    return ok({ success: true, message: `Season ${seasonId} reset complete` });
  } catch (e) {
    return handleApiError(e);
  }
}
