/**
 * RADF v3 — Engine Turn Route
 * POST /api/engine/turn
 * Advances the game by one turn and persists state.
 * Loads game config from the active SeasonGame if available.
 */
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';
import { validateOrThrow, EngineTurnSchema } from '@/lib/validation/schemas';
import { ok, handleApiError } from '@/lib/api/response';
import { loadGameConfig } from '@/lib/engine/template-loader';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { matchId } = validateOrThrow(EngineTurnSchema, body);

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        status: true,
        currentTurn: true,
        maxTurns: true,
        dramaScore: true,
        currentPhase: true,
        seasonId: true,
      },
    });
    if (!match) return handleApiError(new Error('Match not found'));
    if (match.status !== 'RUNNING') return handleApiError(new Error('Match is not running'));
    if (match.currentTurn >= match.maxTurns) return handleApiError(new Error('Match has reached max turns'));

    // Load game config from the active season game (if this match is in a season)
    let gameConfig = null;
    if (match.seasonId) {
      const activeSeasonGame = await prisma.seasonGame.findFirst({
        where: {
          seasonId: match.seasonId,
          status: 'ACTIVE',
        },
      });
      if (activeSeasonGame) {
        try {
          gameConfig = await loadGameConfig(activeSeasonGame.id);
        } catch {
          // No game config available — proceed with standard turn
        }
      }
    }

    const newTurn = match.currentTurn + 1;

    await prisma.$transaction([
      prisma.match.update({
        where: { id: matchId },
        data: { currentTurn: newTurn },
      }),
      prisma.matchTurn.create({
        data: {
          matchId,
          turnNumber: newTurn,
          phase: match.currentPhase,
          dramaScore: match.dramaScore,
        },
      }),
    ]);

    return ok({
      success: true,
      matchId,
      newTurn,
      previousTurn: match.currentTurn,
      gameConfig: gameConfig
        ? {
            name: gameConfig.name,
            displayTitle: gameConfig.displayTitle,
            category: gameConfig.category,
            eliminationRule: gameConfig.eliminationRule,
            scoringMethod: gameConfig.scoringMethod,
          }
        : null,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
