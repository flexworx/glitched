/**
 * RADF v3 — Engine Cron Route
 * GET /api/engine/cron
 * Called every minute by cron job. Processes all RUNNING matches.
 * Advances turns, settles predictions, and broadcasts via WebSocket.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { MatchStatus, PredictionStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  let processed = 0;
  let errors = 0;

  try {
    // Fetch all RUNNING matches
    const runningMatches = await prisma.match.findMany({
      where: { status: MatchStatus.RUNNING },
      select: { id: true, currentTurn: true, maxTurns: true, dramaScore: true, currentPhase: true },
    });

    for (const match of runningMatches) {
      try {
        const newTurn = match.currentTurn + 1;
        const isLastTurn = newTurn >= match.maxTurns;

        await prisma.$transaction([
          prisma.match.update({
            where: { id: match.id },
            data: {
              currentTurn: newTurn,
              status: isLastTurn ? MatchStatus.COMPLETED : MatchStatus.RUNNING,
              endedAt: isLastTurn ? new Date() : undefined,
            },
          }),
          prisma.matchTurn.create({
            data: {
              matchId: match.id,
              turnNumber: newTurn,
              phase: match.currentPhase,
              dramaScore: match.dramaScore,
            },
          }),
        ]);

        processed++;
      } catch (matchErr) {
        console.error(`[CRON] Error processing match ${match.id}:`, matchErr);
        errors++;
      }
    }

    // Settle predictions for ENDED matches that have open pools
    const endedMatchesWithOpenPools = await prisma.predictionPool.findMany({
      where: { status: PredictionStatus.OPEN, match: { status: MatchStatus.COMPLETED } },
      include: { match: { select: { winnerId: true } } },
    });

    for (const pool of endedMatchesWithOpenPools) {
      try {
        await prisma.predictionPool.update({
          where: { id: pool.id },
          data: {
            status: PredictionStatus.RESOLVED,
            resolvedAt: new Date(),
            winningOutcome: pool.match.winnerId ?? 'NONE',
          },
        });
      } catch (poolErr) {
        console.error(`[CRON] Error settling pool ${pool.id}:`, poolErr);
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      errors,
      settledPools: endedMatchesWithOpenPools.length,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[CRON] Fatal error:', e);
    return NextResponse.json({ error: 'Cron job failed', details: String(e) }, { status: 500 });
  }
}
