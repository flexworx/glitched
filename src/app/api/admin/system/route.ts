import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getSystemStats, getAdminLogs } from '@/services/admin';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));
    const [stats, logs] = await Promise.all([getSystemStats(), getAdminLogs(20)]);
    return ok({ stats, recentLogs: logs });
  } catch (e) {
    return handleApiError(e);
  }
}
