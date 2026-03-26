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

  const agentIds = agents.map(a => a.id);
  const agentMap = Object.fromEntries(agents.map(a => [a.id, a.name]));

  const messages = await prisma.matchMessage.findMany({
    where: { senderId: { in: agentIds }, channel: 'PUBLIC_BROADCAST' },
    orderBy: { timestamp: 'desc' },
    take: 50,
  });

  // Parse translator data from metadata JSON if present
  const insights = messages.map(m => {
    const meta = (m.metadata as Record<string, unknown>) || {};
    return {
      id: m.id,
      agentId: m.senderId,
      agentName: agentMap[m.senderId] || 'Unknown',
      matchId: m.matchId,
      originalMessage: m.content,
      translation: (meta.translatorNote as string) || 'No translation available yet.',
      hiddenMeaning: (meta.hiddenMeaning as string) || 'Analyzing...',
      strategyHint: (meta.strategyHint as string) || 'No hint available.',
      emotionalState: (meta.emotionalState as string) || 'neutral',
      timestamp: m.timestamp,
    };
  });

  return NextResponse.json({ insights });
}
