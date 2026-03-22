import { NextRequest } from 'next/server';
import { listAgents } from '@/services/agents';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as 'pantheon' | 'byoa' | null;
    const status = searchParams.get('status') ?? undefined;
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);
    const result = await listAgents({ type: type ?? undefined, status, limit, offset });
    return ok(result);
  } catch (e) {
    return handleApiError(e);
  }
}
