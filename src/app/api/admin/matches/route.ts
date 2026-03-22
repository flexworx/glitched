import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getAdminMatchList } from '@/services/admin';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);
    const matches = await getAdminMatchList(limit);
    return ok({ matches, total: matches.length });
  } catch (e) {
    return handleApiError(e);
  }
}
