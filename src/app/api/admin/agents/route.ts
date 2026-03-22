import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { listAgents } from '@/services/agents';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);
    const result = await listAgents({ limit });
    return ok(result);
  } catch (e) {
    return handleApiError(e);
  }
}
