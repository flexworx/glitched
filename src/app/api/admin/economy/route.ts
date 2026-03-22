import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getEconomyStats } from '@/services/admin';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));
    const stats = await getEconomyStats();
    return ok(stats);
  } catch (e) {
    return handleApiError(e);
  }
}
