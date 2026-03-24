import { ChallengeEngine } from '@/lib/engine/social/challenge-engine';
import { SocialGameStateManager } from '@/lib/engine/social/social-game-state';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeAgents(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `agent_${i + 1}`,
    name: `Agent ${i + 1}`,
    flaw: 'hubris',
    skills: ['spy'],
  }));
}

function makeSetup(count = 6) {
  const mgr = new SocialGameStateManager('match_test', makeAgents(count));
  const engine = new ChallengeEngine(mgr);
  return { mgr, engine };
}

// ---------------------------------------------------------------------------
// Prisoner's Dilemma
// ---------------------------------------------------------------------------

describe('ChallengeEngine — Prisoner\'s Dilemma', () => {
  it('both cooperate: both get +15 influence', () => {
    const { mgr, engine } = makeSetup(4);
    const pairings: [string, string][] = [['agent_1', 'agent_2']];

    engine.resolvePrisonersDilemma(
      { agent_1: 'cooperate', agent_2: 'cooperate' },
      pairings
    );

    expect(mgr.getAgentState('agent_1')!.influencePoints).toBe(15);
    expect(mgr.getAgentState('agent_2')!.influencePoints).toBe(15);
  });

  it('both cooperate: both get +10 VERITAS', () => {
    const { mgr, engine } = makeSetup(4);
    const pairings: [string, string][] = [['agent_1', 'agent_2']];

    const veritasBefore1 = mgr.getVeritasScore('agent_1');
    const veritasBefore2 = mgr.getVeritasScore('agent_2');

    engine.resolvePrisonersDilemma(
      { agent_1: 'cooperate', agent_2: 'cooperate' },
      pairings
    );

    expect(mgr.getVeritasScore('agent_1')).toBe(veritasBefore1 + 10);
    expect(mgr.getVeritasScore('agent_2')).toBe(veritasBefore2 + 10);
  });

  it('both defect: both get -10 influence', () => {
    const { mgr, engine } = makeSetup(4);
    // Give agents some influence first so we can see the decrease
    mgr.addInfluence('agent_1', 20);
    mgr.addInfluence('agent_2', 20);

    const pairings: [string, string][] = [['agent_1', 'agent_2']];
    engine.resolvePrisonersDilemma(
      { agent_1: 'defect', agent_2: 'defect' },
      pairings
    );

    expect(mgr.getAgentState('agent_1')!.influencePoints).toBe(10);
    expect(mgr.getAgentState('agent_2')!.influencePoints).toBe(10);
  });

  it('one cooperates, one defects: defector gets +25, cooperator gets -20', () => {
    const { mgr, engine } = makeSetup(4);
    mgr.addInfluence('agent_2', 30); // give cooperator some influence to lose

    const pairings: [string, string][] = [['agent_1', 'agent_2']];
    engine.resolvePrisonersDilemma(
      { agent_1: 'defect', agent_2: 'cooperate' },
      pairings
    );

    expect(mgr.getAgentState('agent_1')!.influencePoints).toBe(25); // defector gains 25
    expect(mgr.getAgentState('agent_2')!.influencePoints).toBe(10); // cooperator: 30 - 20 = 10
  });

  it('defector gets -15 VERITAS penalty', () => {
    const { mgr, engine } = makeSetup(4);
    const veritasBefore = mgr.getVeritasScore('agent_1');
    const pairings: [string, string][] = [['agent_1', 'agent_2']];

    engine.resolvePrisonersDilemma(
      { agent_1: 'defect', agent_2: 'cooperate' },
      pairings
    );

    expect(mgr.getVeritasScore('agent_1')).toBe(veritasBefore - 15);
  });

  it('multiple pairings resolved correctly', () => {
    const { mgr, engine } = makeSetup(4);
    const pairings: [string, string][] = [
      ['agent_1', 'agent_2'],
      ['agent_3', 'agent_4'],
    ];

    const result = engine.resolvePrisonersDilemma(
      {
        agent_1: 'cooperate',
        agent_2: 'cooperate',
        agent_3: 'defect',
        agent_4: 'defect',
      },
      pairings
    );

    expect(result.type).toBe('prisoners_dilemma');
    expect(Object.keys(result.outcomes)).toHaveLength(4);
    expect(result.outcomes['agent_1'].influenceChange).toBe(15);
    expect(result.outcomes['agent_3'].influenceChange).toBe(-10);
  });

  it('outcome descriptions are included', () => {
    const { engine } = makeSetup(4);
    const pairings: [string, string][] = [['agent_1', 'agent_2']];
    const result = engine.resolvePrisonersDilemma(
      { agent_1: 'cooperate', agent_2: 'cooperate' },
      pairings
    );
    expect(result.outcomes['agent_1'].description).toContain('cooperated');
  });

  it('revealed traits differ by choice', () => {
    const { engine } = makeSetup(4);
    const pairings: [string, string][] = [['agent_1', 'agent_2']];

    const coopResult = engine.resolvePrisonersDilemma(
      { agent_1: 'cooperate', agent_2: 'cooperate' },
      pairings
    );
    expect(coopResult.outcomes['agent_1'].revealedTraits).toContain('cooperativeness');
  });

  it('defaults to cooperate when choice is missing', () => {
    const { mgr, engine } = makeSetup(4);
    const pairings: [string, string][] = [['agent_1', 'agent_2']];
    // No choices provided — defaults to 'cooperate'
    engine.resolvePrisonersDilemma({}, pairings);
    expect(mgr.getAgentState('agent_1')!.influencePoints).toBe(15);
    expect(mgr.getAgentState('agent_2')!.influencePoints).toBe(15);
  });
});

// ---------------------------------------------------------------------------
// Information Auction
// ---------------------------------------------------------------------------

describe('ChallengeEngine — Information Auction', () => {
  it('highest bidder wins', () => {
    const { engine } = makeSetup(4);
    const result = engine.resolveInformationAuction(
      { agent_1: 10, agent_2: 20, agent_3: 15 },
      'Secret alliance map'
    );
    // agent_2 bid highest
    expect(result.outcomes['agent_2'].description).toContain('wins the auction');
  });

  it('winner pays bid but gets intel bonus', () => {
    const { mgr, engine } = makeSetup(4);
    mgr.addInfluence('agent_1', 50);

    engine.resolveInformationAuction(
      { agent_1: 20 },
      'Secret info'
    );

    // agent_1: started at 50, pays -20 for bid, then +30 for intel = 60
    expect(mgr.getAgentState('agent_1')!.influencePoints).toBe(60);
  });

  it('losers pay half their bid', () => {
    const { mgr, engine } = makeSetup(4);
    mgr.addInfluence('agent_1', 50);
    mgr.addInfluence('agent_2', 50);

    engine.resolveInformationAuction(
      { agent_1: 30, agent_2: 10 },
      'Secret info'
    );

    // agent_2 lost, pays floor(10/2) = 5
    expect(mgr.getAgentState('agent_2')!.influencePoints).toBe(45);
  });

  it('non-bidders are unaffected', () => {
    const { mgr, engine } = makeSetup(4);
    mgr.addInfluence('agent_3', 20);

    const result = engine.resolveInformationAuction(
      { agent_1: 10 },
      'Secret info'
    );

    expect(result.outcomes['agent_3']?.influenceChange).toBe(0);
    expect(mgr.getAgentState('agent_3')!.influencePoints).toBe(20);
  });

  it('returns empty outcomes when no bids', () => {
    const { engine } = makeSetup(4);
    const result = engine.resolveInformationAuction({}, 'Nothing');
    expect(Object.keys(result.outcomes)).toHaveLength(0);
  });

  it('result type is information_auction', () => {
    const { engine } = makeSetup(4);
    const result = engine.resolveInformationAuction(
      { agent_1: 5 },
      'Info'
    );
    expect(result.type).toBe('information_auction');
  });
});

// ---------------------------------------------------------------------------
// Liar's Court
// ---------------------------------------------------------------------------

describe('ChallengeEngine — Liar\'s Court', () => {
  it('successful liar (fools majority) gains influence', () => {
    const { engine } = makeSetup(4);

    const claims = {
      agent_1: { claim: 'I have the best strategy', isTrue: false }, // lying
    };
    const votes = {
      agent_2: { agent_1: true },  // fooled (believes lie)
      agent_3: { agent_1: true },  // fooled
      agent_4: { agent_1: false }, // caught it
    };

    const result = engine.resolveLiarsCourt(claims, votes);
    // fooledCount=2, caughtCount=1 => fooled > caught => gains fooledCount*8 = 16
    expect(result.outcomes['agent_1'].influenceChange).toBe(16);
  });

  it('caught liar loses influence and VERITAS', () => {
    const { mgr, engine } = makeSetup(4);
    const veritasBefore = mgr.getVeritasScore('agent_1');

    const claims = {
      agent_1: { claim: 'I lied', isTrue: false },
    };
    const votes = {
      agent_2: { agent_1: false }, // caught
      agent_3: { agent_1: false }, // caught
      agent_4: { agent_1: true },  // fooled
    };

    const result = engine.resolveLiarsCourt(claims, votes);
    // caughtCount=2 > fooledCount=1 => caught
    expect(result.outcomes['agent_1'].influenceChange).toBe(-15);
    expect(mgr.getVeritasScore('agent_1')).toBe(veritasBefore - 30);
  });

  it('correct truth detector gains influence', () => {
    const { engine } = makeSetup(4);

    const claims = {
      agent_1: { claim: 'A lie', isTrue: false },
    };
    const votes = {
      agent_2: { agent_1: false }, // correctly identified lie
    };

    const result = engine.resolveLiarsCourt(claims, votes);
    // agent_2 caught the lie: +10
    expect(result.outcomes['agent_2'].influenceChange).toBe(10);
    expect(result.outcomes['agent_2'].revealedTraits).toContain('analyticalThinking');
  });

  it('truth teller gains VERITAS and small influence', () => {
    const { mgr, engine } = makeSetup(4);
    const veritasBefore = mgr.getVeritasScore('agent_1');

    const claims = {
      agent_1: { claim: 'The truth', isTrue: true },
    };
    const votes = {
      agent_2: { agent_1: true }, // correctly believed truth
    };

    const result = engine.resolveLiarsCourt(claims, votes);
    expect(result.outcomes['agent_1'].influenceChange).toBe(5);
    expect(mgr.getVeritasScore('agent_1')).toBe(veritasBefore + 20);
  });

  it('voter who doubts a truth loses influence', () => {
    const { engine } = makeSetup(4);

    const claims = {
      agent_1: { claim: 'True fact', isTrue: true },
    };
    const votes = {
      agent_2: { agent_1: false }, // wrongly doubted truth
    };

    const result = engine.resolveLiarsCourt(claims, votes);
    expect(result.outcomes['agent_2'].influenceChange).toBe(-5);
  });

  it('voter fooled by a lie loses influence', () => {
    const { engine } = makeSetup(4);

    const claims = {
      agent_1: { claim: 'Fake claim', isTrue: false },
    };
    const votes = {
      agent_2: { agent_1: true }, // fooled by lie
    };

    const result = engine.resolveLiarsCourt(claims, votes);
    expect(result.outcomes['agent_2'].influenceChange).toBe(-5);
  });

  it('multiple claimants are all processed', () => {
    const { engine } = makeSetup(4);

    const claims = {
      agent_1: { claim: 'Truth', isTrue: true },
      agent_2: { claim: 'Lie', isTrue: false },
    };
    const votes = {
      agent_3: { agent_1: true, agent_2: false },
      agent_4: { agent_1: true, agent_2: true },
    };

    const result = engine.resolveLiarsCourt(claims, votes);
    expect(result.type).toBe('liars_court');
    expect(result.outcomes['agent_1']).toBeDefined();
    expect(result.outcomes['agent_2']).toBeDefined();
    expect(result.outcomes['agent_3']).toBeDefined();
    expect(result.outcomes['agent_4']).toBeDefined();
  });

  it('influence changes are applied to state', () => {
    const { mgr, engine } = makeSetup(4);

    const claims = {
      agent_1: { claim: 'Truth', isTrue: true },
    };
    const votes = {
      agent_2: { agent_1: true },
    };

    engine.resolveLiarsCourt(claims, votes);
    // agent_1 told truth: +5 influence
    expect(mgr.getAgentState('agent_1')!.influencePoints).toBe(5);
    // agent_2 correctly believed: +5 influence
    expect(mgr.getAgentState('agent_2')!.influencePoints).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// Ambassador
// ---------------------------------------------------------------------------

describe('ChallengeEngine — Ambassador', () => {
  it('successful ambassador gains 30 influence', () => {
    const { mgr, engine } = makeSetup(4);
    engine.resolveAmbassador('agent_1', true);
    expect(mgr.getAgentState('agent_1')!.influencePoints).toBe(30);
  });

  it('successful ambassador gives 10 influence to all others', () => {
    const { mgr, engine } = makeSetup(4);
    engine.resolveAmbassador('agent_1', true);
    expect(mgr.getAgentState('agent_2')!.influencePoints).toBe(10);
    expect(mgr.getAgentState('agent_3')!.influencePoints).toBe(10);
  });

  it('failed ambassador loses 25 influence', () => {
    const { mgr, engine } = makeSetup(4);
    mgr.addInfluence('agent_1', 50);
    engine.resolveAmbassador('agent_1', false);
    expect(mgr.getAgentState('agent_1')!.influencePoints).toBe(25);
  });

  it('failed ambassador does not affect others', () => {
    const { mgr, engine } = makeSetup(4);
    engine.resolveAmbassador('agent_1', false);
    expect(mgr.getAgentState('agent_2')!.influencePoints).toBe(0);
  });

  it('successful ambassador gets +15 VERITAS', () => {
    const { mgr, engine } = makeSetup(4);
    const before = mgr.getVeritasScore('agent_1');
    engine.resolveAmbassador('agent_1', true);
    expect(mgr.getVeritasScore('agent_1')).toBe(before + 15);
  });

  it('failed ambassador gets -10 VERITAS', () => {
    const { mgr, engine } = makeSetup(4);
    const before = mgr.getVeritasScore('agent_1');
    engine.resolveAmbassador('agent_1', false);
    expect(mgr.getVeritasScore('agent_1')).toBe(before - 10);
  });
});

// ---------------------------------------------------------------------------
// Sacrifice
// ---------------------------------------------------------------------------

describe('ChallengeEngine — Sacrifice', () => {
  it('volunteer loses 20 influence', () => {
    const { mgr, engine } = makeSetup(4);
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');
    mgr.addInfluence('agent_1', 30);

    engine.resolveSacrifice(alliance.id, 'agent_1');
    expect(mgr.getAgentState('agent_1')!.influencePoints).toBe(10);
  });

  it('other alliance members gain 10 influence', () => {
    const { mgr, engine } = makeSetup(4);
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');

    engine.resolveSacrifice(alliance.id, 'agent_1');
    expect(mgr.getAgentState('agent_2')!.influencePoints).toBe(10);
  });

  it('volunteer gets +15 VERITAS and alliance trust +25', () => {
    const { mgr, engine } = makeSetup(4);
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');

    const veritasBefore = mgr.getVeritasScore('agent_1');
    const trustBefore = mgr.getState().alliances.find((a) => a.id === alliance.id)!.trust;

    engine.resolveSacrifice(alliance.id, 'agent_1');

    expect(mgr.getVeritasScore('agent_1')).toBe(veritasBefore + 15);
    const trustAfter = mgr.getState().alliances.find((a) => a.id === alliance.id)!.trust;
    expect(trustAfter).toBe(trustBefore + 25);
  });

  it('no volunteer: everyone loses 5 influence and trust drops 20', () => {
    const { mgr, engine } = makeSetup(4);
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');
    mgr.addInfluence('agent_1', 20);
    mgr.addInfluence('agent_2', 20);

    const trustBefore = mgr.getState().alliances.find((a) => a.id === alliance.id)!.trust;

    engine.resolveSacrifice(alliance.id, null);

    expect(mgr.getAgentState('agent_1')!.influencePoints).toBe(15);
    expect(mgr.getAgentState('agent_2')!.influencePoints).toBe(15);
    const trustAfter = mgr.getState().alliances.find((a) => a.id === alliance.id)!.trust;
    expect(trustAfter).toBe(trustBefore - 20);
  });

  it('returns empty outcomes for nonexistent alliance', () => {
    const { engine } = makeSetup(4);
    const result = engine.resolveSacrifice('nonexistent', null);
    expect(Object.keys(result.outcomes)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Challenge generation
// ---------------------------------------------------------------------------

describe('ChallengeEngine — challenge generation', () => {
  it('generateChallenge returns valid params', () => {
    const { engine } = makeSetup(6);
    const ids = ['agent_1', 'agent_2', 'agent_3', 'agent_4', 'agent_5', 'agent_6'];
    const params = engine.generateChallenge(1, ids);

    expect(params.type).toBeDefined();
    expect(params.name).toBeDefined();
    expect(params.description).toBeDefined();
    expect(params.timeLimit).toBe(120);
  });

  it('round 1 generates prisoners_dilemma', () => {
    const { engine } = makeSetup(6);
    const ids = ['agent_1', 'agent_2', 'agent_3'];
    const params = engine.generateChallenge(1, ids);
    expect(params.type).toBe('prisoners_dilemma');
    expect(params.pairings).toBeDefined();
    expect(params.pairings!.length).toBeGreaterThanOrEqual(1);
  });

  it('round 2 generates information_auction', () => {
    const { engine } = makeSetup(6);
    const ids = ['agent_1', 'agent_2'];
    const params = engine.generateChallenge(2, ids);
    expect(params.type).toBe('information_auction');
    expect(params.auctionItem).toBeDefined();
  });

  it('round 3 generates the_ambassador', () => {
    const { engine } = makeSetup(6);
    const ids = ['agent_1', 'agent_2', 'agent_3'];
    const params = engine.generateChallenge(3, ids);
    expect(params.type).toBe('the_ambassador');
    expect(params.ambassadorId).toBeDefined();
  });

  it('round 4 generates the_sacrifice', () => {
    const { mgr, engine } = makeSetup(6);
    // Need an alliance for sacrifice to pick
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');

    const ids = ['agent_1', 'agent_2', 'agent_3'];
    const params = engine.generateChallenge(4, ids);
    expect(params.type).toBe('the_sacrifice');
  });

  it('round 5 generates liars_court', () => {
    const { engine } = makeSetup(6);
    const ids = ['agent_1', 'agent_2'];
    const params = engine.generateChallenge(5, ids);
    expect(params.type).toBe('liars_court');
  });

  it('different rounds cycle through challenge types', () => {
    const { engine } = makeSetup(6);
    const ids = ['agent_1', 'agent_2'];
    const types = new Set<string>();
    for (let r = 1; r <= 5; r++) {
      types.add(engine.generateChallenge(r, ids).type);
    }
    expect(types.size).toBe(5);
  });

  it('round 6 cycles back to prisoners_dilemma', () => {
    const { engine } = makeSetup(6);
    const ids = ['agent_1', 'agent_2'];
    const params = engine.generateChallenge(6, ids);
    expect(params.type).toBe('prisoners_dilemma');
  });

  it('ambassador selection picks highest VERITAS agent', () => {
    const { mgr, engine } = makeSetup(6);
    mgr.updateVeritas('agent_3', 40, 'boost'); // 90 VERITAS
    const ids = ['agent_1', 'agent_2', 'agent_3'];
    const params = engine.generateChallenge(3, ids);
    expect(params.ambassadorId).toBe('agent_3');
  });

  it('pairings handle odd number of agents (one gets bye)', () => {
    const { engine } = makeSetup(5);
    const ids = ['agent_1', 'agent_2', 'agent_3', 'agent_4', 'agent_5'];
    const params = engine.generateChallenge(1, ids);
    // 5 agents => 2 pairs, 1 bye
    expect(params.pairings!.length).toBe(2);
  });
});
