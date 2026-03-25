import { NextRequest } from 'next/server';
import { ok, handleApiError } from '@/lib/api/response';
import prisma from '@/lib/db/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get('matchId');
    if (!matchId) return handleApiError(new Error('matchId required'));
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        participants: { include: { agent: { select: { id: true, name: true, archetype: true, veritasScore: true } } } },
        states: { orderBy: { turnNumber: 'desc' }, take: 1 },
        messages: { orderBy: { timestamp: 'desc' }, take: 50, select: { id: true, channel: true, content: true, timestamp: true, senderId: true } },
      },
    });
    if (!match) return handleApiError(new Error('Match not found'));
    return ok({
      match: {
        id: match.id, status: match.status, gameMode: match.gameMode,
        participants: (match.participants as Array<Record<string, unknown>>).map((p) => ({
          agentId: p.agentId, agent: p.agent, hp: p.hp, isEliminated: p.isEliminated, placement: p.placement,
        })),
        latestState: (match.states as unknown[])[0] ?? null,
        recentMessages: match.messages,
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}
