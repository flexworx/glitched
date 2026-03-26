import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session as { userId: string }).userId;

  const { scenarioId, agentId } = await req.json();
  if (!scenarioId) return NextResponse.json({ error: 'scenarioId required' }, { status: 400 });

  // Verify agent belongs to user if specified
  if (agentId && agentId !== 'default') {
    const agent = await prisma.agent.findFirst({ where: { id: agentId, operatorId: userId } });
    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  // Record training session start in agent memory
  const agents = await prisma.agent.findMany({
    where: { operatorId: userId },
    select: { id: true },
    take: 1,
  });

  if (agents.length > 0) {
    await prisma.agentMemory.create({
      data: {
        agentId: agentId !== 'default' ? agentId : agents[0].id,
        memoryType: 'TRAINING',
        content: JSON.stringify({ scenario: scenarioId, startedAt: new Date().toISOString(), status: 'in_progress' }),
        emotionalWeight: 0.5,
      },
    });
  }

  return NextResponse.json({ success: true, message: 'Training session started', sessionId: `train_${Date.now()}` });
}
