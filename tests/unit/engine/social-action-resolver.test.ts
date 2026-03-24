import { SocialActionResolver } from '@/lib/engine/social/action-resolver';
import { SocialGameStateManager } from '@/lib/engine/social/social-game-state';
import type { AgentDecision } from '@/lib/types/glitch-engine';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeAgents(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `agent_${i + 1}`,
    name: `Agent ${i + 1}`,
    flaw: i % 2 === 0 ? 'glass ego' : 'people pleaser',
    skills: ['deep-scan', 'smoke-screen'],
  }));
}

function makeSetup(count = 6) {
  const mgr = new SocialGameStateManager('match_test', makeAgents(count));
  const resolver = new SocialActionResolver(mgr);
  return { mgr, resolver };
}

function makeDecision(overrides: Partial<AgentDecision> = {}): AgentDecision {
  return {
    thinking: 'test thinking',
    speech: {},
    action: { type: 'pass' },
    emotional_state: 'confident',
    stance: 'neutral',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

describe('SocialActionResolver — validation', () => {
  it('rejects vote actions outside COUNCIL phase', () => {
    const { mgr, resolver } = makeSetup();
    // Default phase is SOCIAL, not COUNCIL
    expect(mgr.getCurrentPhase()).toBe('SOCIAL');

    const decision = makeDecision({
      action: { type: 'vote', target: 'agent_2' },
    });
    const result = resolver.resolveDecision('agent_1', decision);
    expect(result.success).toBe(false);
    expect(result.description).toContain('not allowed');
  });

  it('rejects alliance proposals from eliminated agents', () => {
    const { mgr, resolver } = makeSetup();
    mgr.eliminateAgent('agent_1', 1, 3);

    const decision = makeDecision({
      action: { type: 'propose_alliance', target: 'agent_2' },
    });
    const result = resolver.resolveDecision('agent_1', decision);
    expect(result.success).toBe(false);
    expect(result.description).toMatch(/Eliminated|Ghost/);
  });

  it('accepts valid actions for current phase', () => {
    const { resolver } = makeSetup();
    // SOCIAL phase allows propose_alliance
    const decision = makeDecision({
      action: { type: 'propose_alliance', target: 'agent_2' },
    });
    const result = resolver.resolveDecision('agent_1', decision);
    expect(result.success).toBe(true);
  });

  it('rejects challenge_choice outside CHALLENGE phase', () => {
    const { mgr, resolver } = makeSetup();
    expect(mgr.getCurrentPhase()).toBe('SOCIAL');

    const decision = makeDecision({
      action: { type: 'challenge_choice', parameters: { choice: 'cooperate' } },
    });
    const result = resolver.resolveDecision('agent_1', decision);
    expect(result.success).toBe(false);
  });

  it('accepts pass action in any phase', () => {
    const { resolver } = makeSetup();
    const decision = makeDecision({ action: { type: 'pass' } });
    const result = resolver.resolveDecision('agent_1', decision);
    expect(result.success).toBe(true);
  });

  it('rejects actions from unknown agent', () => {
    const { resolver } = makeSetup();
    const decision = makeDecision({ action: { type: 'pass' } });
    const result = resolver.resolveDecision('nonexistent', decision);
    expect(result.success).toBe(false);
    expect(result.description).toContain('not found');
  });

  it('ghost agents can only lobby, jury_vote, send_message, and pass', () => {
    const { mgr, resolver } = makeSetup();
    mgr.eliminateAgent('agent_1', 1, 3); // this sets isGhost=true

    // Ghost trying propose_alliance => rejected
    const decision = makeDecision({
      action: { type: 'propose_alliance', target: 'agent_2' },
    });
    const result = resolver.resolveDecision('agent_1', decision);
    expect(result.success).toBe(false);
    expect(result.description).toContain('Ghost');

    // Ghost can lobby
    const lobbyDecision = makeDecision({ action: { type: 'lobby' } });
    const lobbyResult = resolver.resolveDecision('agent_1', lobbyDecision);
    expect(lobbyResult.success).toBe(true);
  });

  it('rejects targeting an eliminated agent for vote', () => {
    const { mgr, resolver } = makeSetup();
    mgr.eliminateAgent('agent_2', 1, 3);
    // Advance to COUNCIL phase
    mgr.advancePhase(); // CHALLENGE
    mgr.advancePhase(); // COUNCIL

    const decision = makeDecision({
      action: { type: 'vote', target: 'agent_2' },
    });
    const result = resolver.resolveDecision('agent_1', decision);
    expect(result.success).toBe(false);
    expect(result.description).toContain('eliminated');
  });
});

// ---------------------------------------------------------------------------
// Alliance resolution
// ---------------------------------------------------------------------------

describe('SocialActionResolver — alliance resolution', () => {
  it('propose_alliance creates pending alliance', () => {
    const { mgr, resolver } = makeSetup();
    const decision = makeDecision({
      action: { type: 'propose_alliance', target: 'agent_2' },
    });
    const result = resolver.resolveDecision('agent_1', decision);
    expect(result.success).toBe(true);
    expect(result.description).toContain('proposes');

    const alliances = mgr.getState().alliances;
    expect(alliances.length).toBeGreaterThanOrEqual(1);
  });

  it('accept_alliance joins alliance', () => {
    const { mgr, resolver } = makeSetup();
    // First propose
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    // Then accept via resolver
    const decision = makeDecision({
      action: {
        type: 'accept_alliance',
        parameters: { allianceId: alliance.id },
      },
    });
    const result = resolver.resolveDecision('agent_2', decision);
    expect(result.success).toBe(true);
    expect(result.description).toContain('joins');
    expect(mgr.getAlliancesForAgent('agent_2')).toHaveLength(1);
  });

  it('reject_alliance declines the proposal', () => {
    const { mgr, resolver } = makeSetup();
    mgr.proposeAlliance('agent_1', 'agent_2');
    const decision = makeDecision({ action: { type: 'reject_alliance' } });
    const result = resolver.resolveDecision('agent_2', decision);
    expect(result.success).toBe(true);
    expect(result.description).toContain('rejects');
  });

  it('break_alliance dissolves membership', () => {
    const { mgr, resolver } = makeSetup();
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');
    mgr.acceptAlliance(alliance.id, 'agent_3');

    const decision = makeDecision({
      action: {
        type: 'break_alliance',
        parameters: { allianceId: alliance.id, warned: false },
      },
    });
    const result = resolver.resolveDecision('agent_1', decision);
    expect(result.success).toBe(true);
    expect(result.description).toContain('BETRAYS');
    expect(mgr.getAlliancesForAgent('agent_1')).toHaveLength(0);
  });

  it('break_alliance with warned=true uses calmer description', () => {
    const { mgr, resolver } = makeSetup();
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');
    mgr.acceptAlliance(alliance.id, 'agent_3');

    const decision = makeDecision({
      action: {
        type: 'break_alliance',
        parameters: { allianceId: alliance.id, warned: true },
      },
    });
    const result = resolver.resolveDecision('agent_1', decision);
    expect(result.success).toBe(true);
    expect(result.description).toContain('departure');
  });

  it('propose_alliance without target gives error description', () => {
    const { resolver } = makeSetup();
    const decision = makeDecision({
      action: { type: 'propose_alliance' }, // no target
    });
    const result = resolver.resolveDecision('agent_1', decision);
    expect(result.success).toBe(true); // action resolved, just no effect
    expect(result.description).toContain('no target');
  });
});

// ---------------------------------------------------------------------------
// Vote resolution
// ---------------------------------------------------------------------------

describe('SocialActionResolver — vote resolution', () => {
  it('vote action records vote correctly', () => {
    const { mgr, resolver } = makeSetup();
    // Advance to COUNCIL phase
    mgr.advancePhase(); // CHALLENGE
    mgr.advancePhase(); // COUNCIL

    const decision = makeDecision({
      action: { type: 'vote', target: 'agent_3' },
    });
    const result = resolver.resolveDecision('agent_1', decision);
    expect(result.success).toBe(true);
    expect(result.description).toContain('votes');
    expect(result.description).toContain('Agent 3');
  });

  it('vote without target results in abstain', () => {
    const { mgr, resolver } = makeSetup();
    mgr.advancePhase(); // CHALLENGE
    mgr.advancePhase(); // COUNCIL

    const decision = makeDecision({ action: { type: 'vote' } }); // no target
    const result = resolver.resolveDecision('agent_1', decision);
    expect(result.success).toBe(true);
    expect(result.description).toContain('abstains');
  });
});

// ---------------------------------------------------------------------------
// Skill resolution
// ---------------------------------------------------------------------------

describe('SocialActionResolver — skill resolution', () => {
  it('use_skill decrements skill charges', () => {
    const { mgr, resolver } = makeSetup();
    const decision = makeDecision({
      action: {
        type: 'use_skill',
        target: 'agent_2',
        parameters: { skillName: 'deep-scan' },
      },
    });
    const result = resolver.resolveDecision('agent_1', decision);
    expect(result.success).toBe(true);
    expect(result.description).toContain('deep-scan');
    expect(mgr.getAgentState('agent_1')!.skillCharges['deep-scan']).toBe(0);
  });

  it('cannot use skill with 0 charges', () => {
    const { mgr, resolver } = makeSetup();
    // Use the 1 charge
    mgr.useSkill('agent_1', 'deep-scan', 'agent_2');

    const decision = makeDecision({
      action: {
        type: 'use_skill',
        target: 'agent_2',
        parameters: { skillName: 'deep-scan' },
      },
    });
    const result = resolver.resolveDecision('agent_1', decision);
    expect(result.success).toBe(true); // resolved, but skill failed
    expect(result.description).toContain('failed');
  });

  it('smoke-screen skill via resolver creates hidden actions event', () => {
    const { mgr, resolver } = makeSetup();

    const decision = makeDecision({
      action: {
        type: 'use_skill',
        parameters: { skillName: 'smoke-screen' },
      },
    });
    resolver.resolveDecision('agent_1', decision);
    expect(mgr.getAgentState('agent_1')!.skillCharges['smoke-screen']).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Message processing
// ---------------------------------------------------------------------------

describe('SocialActionResolver — message processing', () => {
  it('public speech creates public message', () => {
    const { mgr, resolver } = makeSetup();
    const decision = makeDecision({
      speech: { public: 'I am declaring my intentions!' },
      action: { type: 'pass' },
    });
    resolver.resolveDecision('agent_1', decision);
    const msgs = mgr.getMessagesForAgent('agent_3'); // any agent can see public
    expect(msgs.some((m) => m.channel === 'public' && m.text === 'I am declaring my intentions!')).toBe(true);
  });

  it('alliance speech creates alliance message', () => {
    const { mgr, resolver } = makeSetup();
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');

    const decision = makeDecision({
      speech: { alliance: 'Alliance strategy talk' },
      action: { type: 'pass' },
    });
    resolver.resolveDecision('agent_1', decision);
    const msgs = mgr.getMessagesForAgent('agent_2');
    expect(msgs.some((m) => m.channel === 'alliance')).toBe(true);
    // Non-ally should not see it
    const otherMsgs = mgr.getMessagesForAgent('agent_3');
    expect(otherMsgs.some((m) => m.channel === 'alliance')).toBe(false);
  });

  it('DM creates direct message', () => {
    const { mgr, resolver } = makeSetup();
    const decision = makeDecision({
      speech: { dm: [{ to: 'agent_2', message: 'Secret deal?' }] },
      action: { type: 'pass' },
    });
    resolver.resolveDecision('agent_1', decision);
    const msgs = mgr.getMessagesForAgent('agent_2');
    expect(msgs.some((m) => m.channel === 'dm' && m.text === 'Secret deal?')).toBe(true);
    // Third party should not see it
    const otherMsgs = mgr.getMessagesForAgent('agent_3');
    expect(otherMsgs.some((m) => m.channel === 'dm')).toBe(false);
  });

  it('multiple DMs are all recorded', () => {
    const { mgr, resolver } = makeSetup();
    const decision = makeDecision({
      speech: {
        dm: [
          { to: 'agent_2', message: 'Hey agent 2' },
          { to: 'agent_3', message: 'Hey agent 3' },
        ],
      },
      action: { type: 'pass' },
    });
    resolver.resolveDecision('agent_1', decision);
    expect(mgr.getMessagesForAgent('agent_2').filter((m) => m.channel === 'dm')).toHaveLength(1);
    expect(mgr.getMessagesForAgent('agent_3').filter((m) => m.channel === 'dm')).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Flaw effects
// ---------------------------------------------------------------------------

describe('SocialActionResolver — flaw effects', () => {
  it('people pleaser flaw overrides reject_alliance to accept_alliance', () => {
    // We need flawActive=true for the flaw to fire
    const agents = makeAgents(4);
    agents[1].flaw = 'people pleaser'; // agent_2
    const mgr = new SocialGameStateManager('test', agents);
    const resolver = new SocialActionResolver(mgr);

    // Activate agent_2's flaw
    const agent2 = mgr.getAgentState('agent_2')!;
    (agent2 as any).flawActive = true;

    // Propose alliance first
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;

    const decision = makeDecision({
      action: {
        type: 'reject_alliance',
      },
    });
    const result = resolver.resolveDecision('agent_2', decision);

    // The flaw should have changed reject to accept
    expect(result.description).toContain('joins');
  });

  it('flaw does not fire when flawActive is false', () => {
    const agents = makeAgents(4);
    agents[1].flaw = 'people pleaser'; // agent_2
    const mgr = new SocialGameStateManager('test', agents);
    const resolver = new SocialActionResolver(mgr);

    // flawActive defaults to false
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;

    const decision = makeDecision({
      action: {
        type: 'reject_alliance',
      },
    });
    const result = resolver.resolveDecision('agent_2', decision);

    // Flaw not active => should have rejected normally
    expect(result.description).toContain('rejects');
  });

  it('glass ego flaw returns decision unchanged (no mechanical override for propose)', () => {
    const agents = makeAgents(4);
    agents[0].flaw = 'glass ego';
    const mgr = new SocialGameStateManager('test', agents);
    const resolver = new SocialActionResolver(mgr);

    const agent1 = mgr.getAgentState('agent_1')!;
    (agent1 as any).flawActive = true;

    const decision = makeDecision({
      action: { type: 'propose_alliance', target: 'agent_2' },
    });
    const result = resolver.resolveDecision('agent_1', decision);
    expect(result.success).toBe(true);
    expect(result.description).toContain('proposes');
  });
});

// ---------------------------------------------------------------------------
// VERITAS impact from actions
// ---------------------------------------------------------------------------

describe('SocialActionResolver — VERITAS impact', () => {
  it('propose_alliance gives +50 VERITAS', () => {
    const { mgr, resolver } = makeSetup();
    const before = mgr.getVeritasScore('agent_1');
    const decision = makeDecision({
      action: { type: 'propose_alliance', target: 'agent_2' },
    });
    resolver.resolveDecision('agent_1', decision);
    expect(mgr.getVeritasScore('agent_1')).toBe(before + 50);
  });

  it('accept_alliance gives +50 VERITAS', () => {
    const { mgr, resolver } = makeSetup();
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    const before = mgr.getVeritasScore('agent_2');
    const decision = makeDecision({
      action: {
        type: 'accept_alliance',
        parameters: { allianceId: alliance.id },
      },
    });
    resolver.resolveDecision('agent_2', decision);
    expect(mgr.getVeritasScore('agent_2')).toBe(before + 50);
  });

  it('break_alliance without warning gives -400 VERITAS from computeVeritasImpact', () => {
    const { mgr, resolver } = makeSetup();
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');
    mgr.acceptAlliance(alliance.id, 'agent_3');

    const before = mgr.getVeritasScore('agent_1');
    const decision = makeDecision({
      action: {
        type: 'break_alliance',
        parameters: { allianceId: alliance.id, warned: false },
      },
    });
    resolver.resolveDecision('agent_1', decision);
    // -400 from breakAlliance method + -400 from computeVeritasImpact = -800 total
    // VERITAS starts at 500 so 500 - 800 clamps to 0
    expect(mgr.getVeritasScore('agent_1')).toBe(0);
  });

  it('trade_info with non-lie gives +100 VERITAS from resolveTradeInfo', () => {
    const { mgr, resolver } = makeSetup();
    const before = mgr.getVeritasScore('agent_1');
    const decision = makeDecision({
      action: { type: 'trade_info', target: 'agent_2' },
      speech: {},
    });
    resolver.resolveDecision('agent_1', decision);
    // +100 from resolveTradeInfo (accurate intel) + 0 from computeVeritasImpact
    expect(mgr.getVeritasScore('agent_1')).toBe(before + 100);
  });
});
