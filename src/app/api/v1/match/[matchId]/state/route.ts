import { NextRequest, NextResponse } from 'next/server';
import type { SocialGameState } from '@/lib/types/glitch-engine';
import { matchStates } from '@/lib/engine/social/match-state-store';

/**
 * Seed a default 16-agent match state for a given matchId.
 * Called lazily the first time a matchId is requested.
 */
function seedMatchState(matchId: string): SocialGameState {
  const AGENT_NAMES = [
    'Primus', 'Cerberus', 'Solarius', 'Aurum',
    'Mythion', 'Arion', 'Vanguard', 'Oracle',
    'Specter', 'Nyx', 'Zenith', 'Havoc',
    'Cipher', 'Rune', 'Flux', 'Ember',
  ];

  const FLAWS = [
    'hubris', 'paranoia', 'impulsiveness', 'greed',
    'naivety', 'jealousy', 'indecisiveness', 'arrogance',
    'stubbornness', 'cowardice', 'obsession', 'rage',
    'vanity', 'apathy', 'recklessness', 'distrust',
  ];

  const agents: SocialGameState['agents'] = {};
  for (let i = 0; i < 16; i++) {
    const id = AGENT_NAMES[i].toLowerCase();
    agents[id] = {
      id,
      name: AGENT_NAMES[i],
      ranking: i + 1,
      influencePoints: 100,
      veritasScore: 50,
      activeSkills: ['wiretap', 'shield', 'insight'].slice(0, (i % 3) + 1),
      skillCharges: { wiretap: 1, shield: 1, insight: 1 },
      flaw: FLAWS[i],
      flawActive: false,
      isEliminated: false,
      isGhost: false,
      emotionalState: 'confident',
      stance: 'neutral',
      visibleFlaw: FLAWS[i],
    };
  }

  const state: SocialGameState = {
    matchId,
    roundNumber: 1,
    phase: 'OPENING',
    timeElapsedMinutes: 0,
    agents,
    alliances: [],
    eliminatedAgents: [],
    ghostJury: [],
    recentMessages: [],
    recentEvents: ['Match initialized. 16 agents enter the arena.'],
    veritasScores: Object.fromEntries(
      Object.keys(agents).map((id) => [id, 50])
    ),
  };

  matchStates.set(matchId, state);
  return state;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;

  let state = matchStates.get(matchId);
  if (!state) {
    state = seedMatchState(matchId);
  }

  return NextResponse.json(state);
}
