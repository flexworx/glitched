import { NextRequest } from 'next/server';
import { getAgentDreams } from '@/services/agents';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(req: NextRequest, { params }: { params: { agentId: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') ?? '5', 10);
    const dreams = await getAgentDreams(params.agentId, limit);
    return ok({ agentId: params.agentId, dreams, total: dreams.length });
  } catch (e) {
    return handleApiError(e);
  }
}
