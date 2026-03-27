/**
 * RADF v3 — Match State Route
 * GET /api/matches/[matchId]/state
 * Returns full match state including participants, season challenge info, and latest game state.
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';
import { ok, handleApiError } from '@/lib/api/response';
export const dynamic = 'force-dynamic';

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
        gameMode: true,
        season: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
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
    const { states, startedAt, endedAt, season, ...matchData } = match;
    return ok({
      ...matchData,
      startedAt: startedAt?.toISOString() ?? null,
      endedAt: endedAt?.toISOString() ?? null,
      season: season ? {
        id: season.id,
        name: season.name,
        challengeTitle: season.name,
        challengeDescription: season.description ?? null,
      } : null,
      latestState: states[0] ?? null,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
