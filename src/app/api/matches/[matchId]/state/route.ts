/**
 * RADF v3 — Match State Route
 * GET /api/matches/[matchId]/state
 * Returns full match state including participants and latest game state.
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(
  _req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const match = await prisma.match.findUnique({
      where: { id: params.matchId },
      select: {
        id: true,
        status: true,
        currentPhase: true,
        currentTurn: true,
        maxTurns: true,
        dramaScore: true,
        startedAt: true,
        endedAt: true,
        participants: {
          select: {
            agentId: true,
            isEliminated: true,
            creditsEarned: true,
            agent: {
              select: {
                id: true,
                name: true,
                signatureColor: true,
                archetype: true,
              },
            },
          },
        },
        states: {
          take: 1,
          orderBy: { turnNumber: 'desc' },
          select: {
            boardState: true,
            agentStates: true,
            eventLog: true,
            turnNumber: true,
          },
        },
      },
    });

    if (!match) return handleApiError(new Error('Match not found'));
    const { states, ...matchData } = match;
    return ok({ ...matchData, latestState: states[0] ?? null });
  } catch (e) {
    return handleApiError(e);
  }
}
