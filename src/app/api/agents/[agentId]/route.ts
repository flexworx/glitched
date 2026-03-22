import { NextRequest } from 'next/server';
import { getAgentById } from '@/services/agents';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(_req: NextRequest, { params }: { params: { agentId: string } }) {
  try {
    const agent = await getAgentById(params.agentId);
    if (!agent) return handleApiError(new Error('Agent not found'));
    return ok(agent);
  } catch (e) {
    return handleApiError(e);
  }
}
