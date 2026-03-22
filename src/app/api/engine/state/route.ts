/**
 * RADF v3 — Engine State Route
 * GET /api/engine/state?matchId=xxx
 * Returns the latest persisted game state for a match.
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get('matchId');
    if (!matchId) return handleApiError(new Error('matchId required'));

    const [match, latestState] = await Promise.all([
      prisma.match.findUnique({
        where: { id: matchId },
        select: { id: true, status: true, currentTurn: true, currentPhase: true, dramaScore: true },
      }),
      prisma.matchState.findFirst({
        where: { matchId },
        orderBy: { turnNumber: 'desc' },
        select: { boardState: true, agentStates: true, eventLog: true, turnNumber: true, timestamp: true },
      }),
    ]);

    if (!match) return handleApiError(new Error('Match not found'));
    return ok({ ...match, latestState });
  } catch (e) {
    return handleApiError(e);
  }
}
