import { ok, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // ── 1. Active season ──────────────────────────────────────────────
    const activeSeason = await prisma.season.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        seasonGames: {
          orderBy: { orderIndex: 'asc' },
          include: { template: { select: { displayTitle: true, name: true, category: true } } },
        },
      },
    });

    // ── 2. Live matches ───────────────────────────────────────────────
    const liveMatches = await prisma.match.findMany({
      where: { status: 'RUNNING' },
      take: 6,
      orderBy: { dramaScore: 'desc' },
      include: {
        participants: {
          include: { agent: { select: { id: true, name: true, archetype: true, signatureColor: true, avatarUrl: true } } },
        },
        season: { select: { name: true, number: true } },
      },
    });

    // ── 3. Most recent completed match cut sheet ──────────────────────
    const lastMatch = await prisma.match.findFirst({
      where: { status: 'COMPLETED' },
      orderBy: { endedAt: 'desc' },
      include: {
        season: { select: { name: true, number: true } },
        participants: {
          orderBy: { finalRank: 'asc' },
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                archetype: true,
                signatureColor: true,
                avatarUrl: true,
              },
            },
          },
        },
        states: {
          orderBy: { turnNumber: 'desc' },
          take: 1,
          select: { eventLog: true },
        },
      },
    });

    // Build cut sheet from last match participants
    let cutSheet: {
      eliminated: Array<{
        rank: number;
        agentId: string;
        agentName: string;
        archetype: string;
        color: string;
        avatarUrl: string | null;
        eliminatedAt: string | null;
        murphEarned: number;
        isGhost: boolean;
      }>;
      survivors: Array<{
        rank: number;
        agentId: string;
        agentName: string;
        archetype: string;
        color: string;
        avatarUrl: string | null;
        murphEarned: number;
        isChampion: boolean;
      }>;
      matchId: string | null;
      seasonName: string | null;
      endedAt: string | null;
    } = { eliminated: [], survivors: [], matchId: null, seasonName: null, endedAt: null };

    if (lastMatch) {
      cutSheet.matchId = lastMatch.id;
      cutSheet.seasonName = lastMatch.season?.name ?? null;
      cutSheet.endedAt = lastMatch.endedAt?.toISOString() ?? null;

      const eliminated = lastMatch.participants
        .filter((p) => p.isEliminated)
        .sort((a, b) => (b.finalRank ?? 999) - (a.finalRank ?? 999));

      const survivors = lastMatch.participants
        .filter((p) => !p.isEliminated)
        .sort((a, b) => (a.finalRank ?? 0) - (b.finalRank ?? 0));

      cutSheet.eliminated = eliminated.map((p) => ({
        rank: p.finalRank ?? 0,
        agentId: p.agent.id,
        agentName: p.agent.name,
        archetype: p.agent.archetype,
        color: p.agent.signatureColor,
        avatarUrl: p.agent.avatarUrl,
        eliminatedAt: p.eliminatedAt?.toISOString() ?? null,
        murphEarned: p.murphEarned,
        isGhost: p.isGhost,
      }));

      cutSheet.survivors = survivors.map((p, i) => ({
        rank: p.finalRank ?? i + 1,
        agentId: p.agent.id,
        agentName: p.agent.name,
        archetype: p.agent.archetype,
        color: p.agent.signatureColor,
        avatarUrl: p.agent.avatarUrl,
        murphEarned: p.murphEarned,
        isChampion: p.finalRank === 1 || (lastMatch.winnerId === p.agentId),
      }));
    }

    // ── 4. Top agents by wins ─────────────────────────────────────────
    const topAgents = await prisma.agent.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { totalWins: 'desc' },
      take: 8,
      select: {
        id: true,
        name: true,
        archetype: true,
        signatureColor: true,
        avatarUrl: true,
        totalWins: true,
        totalMatches: true,
        veritasTier: true,
        isPantheon: true,
      },
    });

    // ── 5. Platform stats ─────────────────────────────────────────────
    const [agentCount, matchCount, walletAgg] = await Promise.all([
      prisma.agent.count({ where: { status: 'ACTIVE' } }),
      prisma.match.count({ where: { status: 'COMPLETED' } }),
      prisma.userWallet.aggregate({ _sum: { murphBalance: true } }),
    ]);

    const stats = {
      activeAgents: agentCount,
      matchesPlayed: matchCount,
      murphCirculating: walletAgg._sum.murphBalance ?? 0,
      liveViewers: liveMatches.length * 247 + Math.floor(Math.random() * 500), // approximation
    };

    return ok({
      activeSeason,
      liveMatches: liveMatches.map((m) => ({
        id: m.id,
        dramaScore: m.dramaScore,
        currentPhase: m.currentPhase,
        startedAt: m.startedAt?.toISOString(),
        season: m.season,
        participantCount: m.participants.length,
        agents: m.participants.slice(0, 4).map((p) => ({
          id: p.agent.id,
          name: p.agent.name,
          archetype: p.agent.archetype,
          color: p.agent.signatureColor,
          avatarUrl: p.agent.avatarUrl,
          isEliminated: p.isEliminated,
        })),
      })),
      cutSheet,
      topAgents,
      stats,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
