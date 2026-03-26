import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session as { userId: string }).userId;

  const agents = await prisma.agent.findMany({
    where: { operatorId: userId },
    select: { id: true, name: true },
  });

  // Training sessions are tracked via AgentMemory entries with type TRAINING
  const agentIds = agents.map(a => a.id);
  const agentMap = Object.fromEntries(agents.map(a => [a.id, a.name]));

  const memories = await prisma.agentMemory.findMany({
    where: { agentId: { in: agentIds }, memoryType: 'TRAINING' },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const sessions = memories.map(m => {
    let data: Record<string, unknown> = {};
    try { data = JSON.parse(m.content); } catch { /* not JSON */ }
    return {
      id: m.id,
      agentId: m.agentId,
      agentName: agentMap[m.agentId] || 'Unknown',
      scenario: String(data.scenario || 'Training Session'),
      outcome: String(data.outcome || 'draw') as 'win' | 'loss' | 'draw',
      xpGained: Number(data.xpGained || 0),
      traitsImproved: Array.isArray(data.traitsImproved) ? data.traitsImproved as string[] : [],
      duration: Number(data.duration || 0),
      completedAt: m.createdAt,
    };
  });

  return NextResponse.json({ sessions });
}
