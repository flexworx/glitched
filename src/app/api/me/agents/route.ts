import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { listAgents } from '@/services/agents';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return handleApiError(new Error('Unauthorized'));
    // Filter agents created by this user
    const result = await listAgents({ type: 'byoa' });
    const myAgents = result.agents.filter((a: any) => a.creatorId === session.userId);
    return ok({ agents: myAgents, total: myAgents.length });
  } catch (e) {
    return handleApiError(e);
  }
}
