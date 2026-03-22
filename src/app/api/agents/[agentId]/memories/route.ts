import { NextRequest } from 'next/server';
import { getAgentMemories } from '@/services/agents';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(req: NextRequest, { params }: { params: { agentId: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') ?? '10', 10);
    const memories = await getAgentMemories(params.agentId, limit);
    return ok({ agentId: params.agentId, memories, total: memories.length });
  } catch (e) {
    return handleApiError(e);
  }
}
