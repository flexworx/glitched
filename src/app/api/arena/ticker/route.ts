/**
 * GET /api/arena/ticker
 * Returns the latest match events formatted as ticker tape items.
 * Pulls from MatchState eventLog and MatchMessage PUBLIC_BROADCAST channel.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { MessageChannel } from '@prisma/client';
export const dynamic = 'force-dynamic';

const TICKER_COLORS: Record<string, string> = {
  elimination: '#ff3366',
  alliance: '#00ff88',
  betrayal: '#f59e0b',
  wildcard: '#8b5cf6',
  winner: '#ffd700',
  drama: '#0ea5e9',
  season: '#00ff88',
  default: '#ffffff80',
};

export async function GET() {
  try {
    // Get the latest events from running matches
    const recentStates = await prisma.matchState.findMany({
      where: { match: { status: 'RUNNING' } },
      orderBy: { timestamp: 'desc' },
      take: 20,
      select: {
        eventLog: true,
        matchId: true,
        timestamp: true,
        match: {
          select: {
            id: true,
            participants: {
              select: {
                agent: { select: { name: true, signatureColor: true } },
              },
            },
          },
        },
      },
    });

    // Get PUBLIC_BROADCAST messages (SHOWRUNNER) from the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const showrunnerMessages = await prisma.matchMessage.findMany({
      where: {
        channel: MessageChannel.PUBLIC_BROADCAST,
        timestamp: { gte: tenMinutesAgo },
        match: { status: 'RUNNING' },
      },
      orderBy: { timestamp: 'desc' },
      take: 10,
      select: {
        id: true,
        content: true,
        matchId: true,
        timestamp: true,
      },
    });

    const tickerItems: Array<{
      id: string;
      text: string;
      type: string;
      matchId: string;
      color: string;
    }> = [];

    // Process SHOWRUNNER messages first (highest priority)
    for (const msg of showrunnerMessages) {
      tickerItems.push({
        id: `sr-${msg.id}`,
        text: msg.content.slice(0, 120),
        type: 'drama',
        matchId: msg.matchId,
        color: TICKER_COLORS.drama,
      });
    }

    // Process event logs from match states
    for (const state of recentStates) {
      const events = (state.eventLog as Array<{
        type?: string;
        agentId?: string;
        targetId?: string;
        description?: string;
        timestamp?: string;
      }>) ?? [];

      for (const event of events.slice(-5)) {
        if (!event.type || !event.description) continue;

        const type = event.type.toLowerCase().includes('eliminat') ? 'elimination'
          : event.type.toLowerCase().includes('alliance') ? 'alliance'
          : event.type.toLowerCase().includes('betray') ? 'betrayal'
          : event.type.toLowerCase().includes('wildcard') ? 'wildcard'
          : event.type.toLowerCase().includes('win') ? 'winner'
          : 'drama';

        tickerItems.push({
          id: `ev-${state.matchId}-${event.timestamp ?? Date.now()}`,
          text: event.description.slice(0, 120),
          type,
          matchId: state.matchId,
          color: TICKER_COLORS[type] ?? TICKER_COLORS.default,
        });
      }
    }

    // If no live events, add season announcements
    if (tickerItems.length === 0) {
      const activeSeason = await prisma.season.findFirst({
        where: { status: 'ACTIVE' },
        select: { name: true, description: true },
      });
      if (activeSeason) {
        tickerItems.push({
          id: 'season-active',
          text: `${activeSeason.name} is LIVE — ${activeSeason.description ?? 'Challenge in progress'}`,
          type: 'season',
          matchId: '',
          color: TICKER_COLORS.season,
        });
      }
    }

    // Deduplicate and limit
    const seen = new Set<string>();
    const unique = tickerItems.filter(item => {
      if (seen.has(item.text)) return false;
      seen.add(item.text);
      return true;
    }).slice(0, 20);

    return NextResponse.json({ data: unique });
  } catch (e) {
    console.error('[ticker]', e);
    return NextResponse.json({ data: [] });
  }
}
