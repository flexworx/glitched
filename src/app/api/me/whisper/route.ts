import { NextRequest } from 'next/server';
import { ok, handleApiError } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/db/client';
import { MessageChannel } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return handleApiError(new Error('Unauthorized'));
    const agents = await prisma.agent.findMany({ where: { operatorId: session.userId }, select: { id: true } });
    const agentIds = agents.map((a) => a.id);
    const messages = await prisma.matchMessage.findMany({
      where: { channel: MessageChannel.OPERATOR_WHISPER, targetId: { in: agentIds } },
      orderBy: { timestamp: 'desc' },
      take: 50,
      select: { id: true, content: true, channel: true, timestamp: true, targetId: true, matchId: true, isBigScreen: true },
    });
    return ok({ messages });
  } catch (e) {
    return handleApiError(e);
  }
}
