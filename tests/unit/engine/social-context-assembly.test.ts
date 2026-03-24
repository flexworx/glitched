import { assembleSocialContext } from '@/lib/engine/social/social-context-assembly';
import { SocialGameStateManager } from '@/lib/engine/social/social-game-state';
import type { PersonalityTraits } from '@/lib/types/agent';
import type { SocialGameState, SocialMessage } from '@/lib/types/glitch-engine';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePersonality(overrides: Partial<PersonalityTraits> = {}): PersonalityTraits {
  const defaults: PersonalityTraits = {
    openness: 0.8,
    conscientiousness: 0.6,
    extraversion: 0.7,
    agreeableness: 0.4,
    neuroticism: 0.3,
    directness: 0.9,
    formality: 0.5,
    verbosity: 0.6,
    humor: 0.7,
    empathy: 0.5,
    riskTolerance: 0.8,
    deceptionAptitude: 0.6,
    loyaltyBias: 0.5,
    competitiveness: 0.7,
    adaptability: 0.6,
    emotionality: 0.4,
    impulsivity: 0.3,
    resilience: 0.7,
    jealousy: 0.2,
    pride: 0.6,
    assertiveness: 0.7,
    persuasiveness: 0.8,
    trustingness: 0.4,
    dominance: 0.6,
    cooperativeness: 0.5,
    analyticalThinking: 0.7,
    creativity: 0.6,
    patience: 0.5,
    decisionSpeed: 0.7,
    memoryRetention: 0.6,
    moralFlexibility: 0.5,
    vengefulness: 0.3,
    generosity: 0.5,
    urgencyBias: 0.4,
  };
  return { ...defaults, ...overrides };
}

function makeAgents(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `agent_${i + 1}`,
    name: `Agent ${i + 1}`,
    flaw: i === 0 ? 'hubris' : 'paranoia',
    skills: ['spy', 'sabotage'],
  }));
}

function makeGameState(count = 6): SocialGameState {
  const mgr = new SocialGameStateManager('match_test', makeAgents(count));
  return mgr.toJSON();
}

function callAssemble(
  gameState?: SocialGameState,
  overrides?: {
    agentId?: string;
    agentName?: string;
    personality?: PersonalityTraits;
    flaw?: string;
    skills?: string[];
  }
) {
  const state = gameState ?? makeGameState();
  return assembleSocialContext(
    overrides?.agentId ?? 'agent_1',
    overrides?.agentName ?? 'Agent 1',
    overrides?.personality ?? makePersonality(),
    'INTJ',
    '5w6',
    overrides?.flaw ?? 'hubris',
    overrides?.skills ?? ['spy', 'sabotage'],
    state
  );
}

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

describe('assembleSocialContext — system prompt', () => {
  it('contains agent name', () => {
    const { systemPrompt } = callAssemble(undefined, { agentName: 'TestBot' });
    expect(systemPrompt).toContain('TestBot');
  });

  it('contains MBTI and Enneagram', () => {
    const { systemPrompt } = callAssemble();
    expect(systemPrompt).toContain('INTJ');
    expect(systemPrompt).toContain('5w6');
  });

  it('contains personality traits as behavioral instructions', () => {
    const { systemPrompt } = callAssemble(undefined, {
      personality: makePersonality({ openness: 0.9 }),
    });
    // High openness should produce the "high" description
    expect(systemPrompt).toContain('Openness');
    expect(systemPrompt).toContain('novel strategies');
  });

  it('low trait values produce "low" behavioral instructions', () => {
    const { systemPrompt } = callAssemble(undefined, {
      personality: makePersonality({ openness: 0.1 }),
    });
    expect(systemPrompt).toContain('proven strategies');
  });

  it('mid trait values produce "mid" behavioral instructions', () => {
    const { systemPrompt } = callAssemble(undefined, {
      personality: makePersonality({ openness: 0.5 }),
    });
    expect(systemPrompt).toContain('balance');
  });

  it('contains flaw description', () => {
    const { systemPrompt } = callAssemble(undefined, { flaw: 'hubris' });
    expect(systemPrompt).toContain('HUBRIS');
    expect(systemPrompt).toContain('overconfident');
  });

  it('contains equipped skills', () => {
    const { systemPrompt } = callAssemble(undefined, {
      skills: ['immunity', 'expose'],
    });
    expect(systemPrompt).toContain('IMMUNITY');
    expect(systemPrompt).toContain('EXPOSE');
  });

  it('shows "No skills equipped" when skills array is empty', () => {
    const { systemPrompt } = callAssemble(undefined, { skills: [] });
    expect(systemPrompt).toContain('No skills equipped');
  });

  it('contains decision JSON schema', () => {
    const { systemPrompt } = callAssemble();
    expect(systemPrompt).toContain('"thinking"');
    expect(systemPrompt).toContain('"speech"');
    expect(systemPrompt).toContain('"action"');
    expect(systemPrompt).toContain('"emotional_state"');
    expect(systemPrompt).toContain('"stance"');
  });

  it('contains guardrails section', () => {
    const { systemPrompt } = callAssemble();
    expect(systemPrompt).toContain('GUARDRAILS');
    expect(systemPrompt).toContain('disqualification');
  });

  it('contains rules about VERITAS tiebreak', () => {
    const { systemPrompt } = callAssemble();
    expect(systemPrompt).toContain('VERITAS');
    expect(systemPrompt).toContain('tiebreak');
  });

  it('contains all Big Five trait names', () => {
    const { systemPrompt } = callAssemble();
    expect(systemPrompt).toContain('Openness');
    expect(systemPrompt).toContain('Conscientiousness');
    expect(systemPrompt).toContain('Extraversion');
    expect(systemPrompt).toContain('Agreeableness');
    expect(systemPrompt).toContain('Neuroticism');
  });

  it('contains strategic trait names', () => {
    const { systemPrompt } = callAssemble();
    expect(systemPrompt).toContain('Risk Tolerance');
    expect(systemPrompt).toContain('Deception Aptitude');
    expect(systemPrompt).toContain('Loyalty Bias');
  });

  it('known flaw types produce detailed descriptions', () => {
    for (const flaw of ['hubris', 'paranoia', 'impulsivity', 'jealousy', 'greed', 'cowardice']) {
      const { systemPrompt } = callAssemble(undefined, { flaw });
      expect(systemPrompt).toContain(flaw.toUpperCase());
    }
  });

  it('unknown flaw falls back to generic description', () => {
    const { systemPrompt } = callAssemble(undefined, { flaw: 'unknownFlaw' });
    expect(systemPrompt).toContain('UNKNOWNFLAW');
    expect(systemPrompt).toContain('hidden weakness');
  });

  it('known skills get full descriptions', () => {
    const { systemPrompt } = callAssemble(undefined, {
      skills: ['spy', 'shield', 'rally'],
    });
    expect(systemPrompt).toContain('SPY');
    expect(systemPrompt).toContain('SHIELD');
    expect(systemPrompt).toContain('RALLY');
    expect(systemPrompt).toContain('1 charge');
  });
});

// ---------------------------------------------------------------------------
// User message
// ---------------------------------------------------------------------------

describe('assembleSocialContext — user message', () => {
  it('contains round number', () => {
    const state = makeGameState();
    const { userMessage } = callAssemble(state);
    expect(userMessage).toContain('Round 1');
  });

  it('contains agent own state (name, ranking, influence, VERITAS)', () => {
    const state = makeGameState();
    const { userMessage } = callAssemble(state);
    expect(userMessage).toContain('Agent 1');
    expect(userMessage).toContain('Ranking: #1');
    expect(userMessage).toContain('VERITAS Score: 50/100');
    expect(userMessage).toContain('Influence: 0');
  });

  it('contains alliance information when in alliance', () => {
    const mgr = new SocialGameStateManager('test', makeAgents(4));
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');
    const state = mgr.toJSON();

    const { userMessage } = callAssemble(state);
    expect(userMessage).toContain('Alliance:');
    expect(userMessage).toContain('Agent 2');
    expect(userMessage).toContain('Trust:');
  });

  it('shows "not in any alliance" when agent has no alliance', () => {
    const state = makeGameState();
    const { userMessage } = callAssemble(state);
    expect(userMessage).toContain('not in any alliance');
  });

  it('contains surviving agents (filtered — excludes self)', () => {
    const state = makeGameState(4);
    const { userMessage } = callAssemble(state, { agentId: 'agent_1' });
    // Self should not appear in surviving agents list
    expect(userMessage).not.toMatch(/SURVIVING AGENTS[\s\S]*?Agent 1 \(ID: agent_1\)/);
    // Others should appear
    expect(userMessage).toContain('Agent 2');
    expect(userMessage).toContain('Agent 3');
  });

  it('surviving agents show public info: name, VERITAS, ranking, flaw', () => {
    const state = makeGameState(4);
    const { userMessage } = callAssemble(state, { agentId: 'agent_1' });
    // Each surviving agent line should contain these fields
    expect(userMessage).toContain('VERITAS:');
    expect(userMessage).toContain('Rank #');
    expect(userMessage).toContain('Flaw:');
  });

  it('contains recent messages filtered by visibility — public', () => {
    const mgr = new SocialGameStateManager('test', makeAgents(4));
    mgr.createMessage('agent_2', 'public', 'Hello from agent 2');
    const state = mgr.toJSON();

    const { userMessage } = callAssemble(state, { agentId: 'agent_1' });
    expect(userMessage).toContain('Hello from agent 2');
    expect(userMessage).toContain('[PUBLIC]');
  });

  it('contains recent messages filtered by visibility — DM visible to recipient', () => {
    const mgr = new SocialGameStateManager('test', makeAgents(4));
    mgr.createMessage('agent_2', 'dm', 'Secret to agent_1', { toAgentId: 'agent_1' });
    const state = mgr.toJSON();

    const { userMessage } = callAssemble(state, { agentId: 'agent_1' });
    expect(userMessage).toContain('Secret to agent_1');
  });

  it('DM not visible to third party', () => {
    const mgr = new SocialGameStateManager('test', makeAgents(4));
    mgr.createMessage('agent_2', 'dm', 'Secret to agent_1', { toAgentId: 'agent_1' });
    const state = mgr.toJSON();

    const { userMessage } = callAssemble(state, { agentId: 'agent_3', agentName: 'Agent 3' });
    expect(userMessage).not.toContain('Secret to agent_1');
  });

  it('contains eliminated agents list', () => {
    const mgr = new SocialGameStateManager('test', makeAgents(4));
    mgr.eliminateAgent('agent_4', 2, 3);
    const state = mgr.toJSON();

    const { userMessage } = callAssemble(state, { agentId: 'agent_1' });
    expect(userMessage).toContain('Agent 4');
    expect(userMessage).toContain('eliminated');
    expect(userMessage).toContain('3 votes');
  });

  it('shows "No eliminations yet" when no one is eliminated', () => {
    const state = makeGameState(4);
    const { userMessage } = callAssemble(state);
    expect(userMessage).toContain('No eliminations yet');
  });

  it('contains allowed actions for current phase', () => {
    const state = makeGameState(); // SOCIAL phase
    const { userMessage } = callAssemble(state);
    expect(userMessage).toContain('propose_alliance');
    expect(userMessage).toContain('send_message');
    expect(userMessage).toContain('pass');
  });

  it('contains phase name', () => {
    const state = makeGameState();
    const { userMessage } = callAssemble(state);
    expect(userMessage).toContain('Phase: SOCIAL');
  });

  it('contains skills status with charges', () => {
    const state = makeGameState();
    const { userMessage } = callAssemble(state, { agentId: 'agent_1' });
    expect(userMessage).toContain('spy: 1 charge(s) remaining');
    expect(userMessage).toContain('sabotage: 1 charge(s) remaining');
  });

  it('contains emotional state and stance', () => {
    const state = makeGameState();
    const { userMessage } = callAssemble(state, { agentId: 'agent_1' });
    expect(userMessage).toContain('Emotional State: confident');
    expect(userMessage).toContain('Stance: neutral');
  });

  it('shows flaw active status when active', () => {
    const mgr = new SocialGameStateManager('test', makeAgents(4));
    const agent = mgr.getAgentState('agent_1')!;
    (agent as any).flawActive = true;
    const state = mgr.toJSON();

    const { userMessage } = callAssemble(state, { agentId: 'agent_1' });
    expect(userMessage).toContain('[ACTIVE');
  });

  it('marks alliance members with [YOUR ALLY]', () => {
    const mgr = new SocialGameStateManager('test', makeAgents(4));
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');
    const state = mgr.toJSON();

    const { userMessage } = callAssemble(state, { agentId: 'agent_1' });
    expect(userMessage).toContain('[YOUR ALLY]');
  });

  it('returns error message for unknown agent', () => {
    const state = makeGameState(4);
    const { userMessage } = callAssemble(state, {
      agentId: 'nonexistent',
      agentName: 'Ghost',
    });
    expect(userMessage).toContain('ERROR');
    expect(userMessage).toContain('PASS');
  });

  it('includes challenge section during CHALLENGE phase', () => {
    const mgr = new SocialGameStateManager('test', makeAgents(6));
    mgr.advancePhase(); // -> CHALLENGE
    const state = mgr.toJSON();
    state.challengeParams = {
      type: 'prisoners_dilemma',
      name: "The Prisoner's Dilemma",
      description: 'You are paired...',
      timeLimit: 120,
      pairings: [['agent_1', 'agent_2']],
    };

    const { userMessage } = callAssemble(state, { agentId: 'agent_1' });
    expect(userMessage).toContain('ACTIVE CHALLENGE');
    expect(userMessage).toContain("Prisoner's Dilemma");
  });

  it('no challenge section when not in CHALLENGE phase', () => {
    const state = makeGameState(); // SOCIAL
    const { userMessage } = callAssemble(state);
    expect(userMessage).not.toContain('ACTIVE CHALLENGE');
  });

  it('shows surviving agent count and ghost jury count', () => {
    const mgr = new SocialGameStateManager('test', makeAgents(6));
    mgr.eliminateAgent('agent_6', 1, 4);
    const state = mgr.toJSON();

    const { userMessage } = callAssemble(state, { agentId: 'agent_1' });
    expect(userMessage).toContain('Surviving: 5 agents');
    expect(userMessage).toContain('Ghost Jury: 1 members');
  });
});

// ---------------------------------------------------------------------------
// Fog of war
// ---------------------------------------------------------------------------

describe('assembleSocialContext — fog of war', () => {
  it('agent cannot see other agents\' personality DNA (not in user message)', () => {
    const mgr = new SocialGameStateManager('test', makeAgents(4));
    // Set some personality DNA on agent_2
    const agent2 = mgr.getAgentState('agent_2')!;
    (agent2 as any).personalityDna = { openness: 0.9, neuroticism: 0.1 };
    const state = mgr.toJSON();

    const { userMessage } = callAssemble(state, { agentId: 'agent_1' });
    // personalityDna values should not leak
    expect(userMessage).not.toContain('personalityDna');
    expect(userMessage).not.toContain('0.9'); // openness value
  });

  it('agent can see public info of others: name, VERITAS, ranking, visible flaw', () => {
    const state = makeGameState(4);
    const { userMessage } = callAssemble(state, { agentId: 'agent_1' });
    // Agent 2's info should be visible
    expect(userMessage).toContain('Agent 2');
    expect(userMessage).toContain('VERITAS:');
    expect(userMessage).toContain('Rank #');
    expect(userMessage).toContain('Flaw: paranoia'); // agent_2's flaw
  });

  it('agent can only see messages on channels they have access to', () => {
    const mgr = new SocialGameStateManager('test', makeAgents(4));

    // Public message — visible to all
    mgr.createMessage('agent_3', 'public', 'Public msg');

    // DM from agent_2 to agent_3 — not visible to agent_1
    mgr.createMessage('agent_2', 'dm', 'DM to agent_3', { toAgentId: 'agent_3' });

    // Alliance message in an alliance agent_1 is not part of
    const alliance = mgr.proposeAlliance('agent_2', 'agent_3')!;
    mgr.acceptAlliance(alliance.id, 'agent_3');
    mgr.createMessage('agent_2', 'alliance', 'Alliance secret', { allianceId: alliance.id });

    const state = mgr.toJSON();
    const { userMessage } = callAssemble(state, { agentId: 'agent_1' });

    expect(userMessage).toContain('Public msg');
    expect(userMessage).not.toContain('DM to agent_3');
    expect(userMessage).not.toContain('Alliance secret');
  });

  it('agent can see DMs addressed to them', () => {
    const mgr = new SocialGameStateManager('test', makeAgents(4));
    mgr.createMessage('agent_3', 'dm', 'Hey agent_1', { toAgentId: 'agent_1' });
    const state = mgr.toJSON();

    const { userMessage } = callAssemble(state, { agentId: 'agent_1' });
    expect(userMessage).toContain('Hey agent_1');
  });

  it('agent can see alliance messages for their own alliance', () => {
    const mgr = new SocialGameStateManager('test', makeAgents(4));
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');
    mgr.createMessage('agent_2', 'alliance', 'Our secret plan', { allianceId: alliance.id });
    const state = mgr.toJSON();

    const { userMessage } = callAssemble(state, { agentId: 'agent_1' });
    expect(userMessage).toContain('Our secret plan');
  });

  it('referee messages are visible to everyone', () => {
    const mgr = new SocialGameStateManager('test', makeAgents(4));
    mgr.createMessage('system', 'referee', 'Referee announcement');
    const state = mgr.toJSON();

    const { userMessage } = callAssemble(state, { agentId: 'agent_1' });
    expect(userMessage).toContain('Referee announcement');
  });

  it('ghost messages are visible to everyone', () => {
    const mgr = new SocialGameStateManager('test', makeAgents(4));
    mgr.createMessage('agent_4', 'ghost', 'Ghost whisper');
    const state = mgr.toJSON();

    const { userMessage } = callAssemble(state, { agentId: 'agent_1' });
    expect(userMessage).toContain('Ghost whisper');
  });
});
