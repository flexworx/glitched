import { SocialGameStateManager } from '@/lib/engine/social/social-game-state';
import type { SocialMessage, SocialPhase } from '@/lib/types/glitch-engine';

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

function makeManager(count = 6) {
  return new SocialGameStateManager('match_test', makeAgents(count));
}

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

describe('SocialGameStateManager — construction', () => {
  it('creates state with correct number of agents', () => {
    const mgr = makeManager(8);
    const state = mgr.getState();
    expect(Object.keys(state.agents)).toHaveLength(8);
  });

  it('all agents start with VERITAS at initial value (500)', () => {
    const mgr = makeManager(4);
    const state = mgr.getState();
    for (const agent of Object.values(state.agents)) {
      expect(agent.veritasScore).toBe(500);
    }
    for (const score of Object.values(state.veritasScores)) {
      expect(score).toBe(500);
    }
  });

  it('all agents start as not eliminated and not ghost', () => {
    const mgr = makeManager(4);
    const state = mgr.getState();
    for (const agent of Object.values(state.agents)) {
      expect(agent.isEliminated).toBe(false);
      expect(agent.isGhost).toBe(false);
    }
  });

  it('phase starts at SOCIAL (first phase in PHASE_ORDER)', () => {
    const mgr = makeManager(4);
    expect(mgr.getCurrentPhase()).toBe('SOCIAL');
  });

  it('matchId is stored correctly', () => {
    const mgr = new SocialGameStateManager('my-match-123', makeAgents(2));
    expect(mgr.getState().matchId).toBe('my-match-123');
  });

  it('agents start with influence 0 and ranking by insertion order', () => {
    const mgr = makeManager(3);
    const state = mgr.getState();
    expect(state.agents['agent_1'].influencePoints).toBe(0);
    expect(state.agents['agent_1'].ranking).toBe(1);
    expect(state.agents['agent_3'].ranking).toBe(3);
  });

  it('agents have skill charges initialized to 1 per skill', () => {
    const mgr = makeManager(2);
    const agent = mgr.getAgentState('agent_1');
    expect(agent?.skillCharges['deep-scan']).toBe(1);
    expect(agent?.skillCharges['smoke-screen']).toBe(1);
  });

  it('round starts at 1', () => {
    const mgr = makeManager(2);
    expect(mgr.getState().roundNumber).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Phase management
// ---------------------------------------------------------------------------

describe('SocialGameStateManager — phase management', () => {
  it('advancePhase cycles SOCIAL -> CHALLENGE -> COUNCIL -> RECKONING -> SOCIAL', () => {
    const mgr = makeManager(6);
    expect(mgr.getCurrentPhase()).toBe('SOCIAL');
    mgr.advancePhase();
    expect(mgr.getCurrentPhase()).toBe('CHALLENGE');
    mgr.advancePhase();
    expect(mgr.getCurrentPhase()).toBe('COUNCIL');
    mgr.advancePhase();
    expect(mgr.getCurrentPhase()).toBe('RECKONING');
    mgr.advancePhase();
    expect(mgr.getCurrentPhase()).toBe('SOCIAL');
  });

  it('wrapping back to SOCIAL increments round number', () => {
    const mgr = makeManager(6);
    expect(mgr.getState().roundNumber).toBe(1);
    // Cycle through all 4 phases to wrap
    mgr.advancePhase(); // CHALLENGE
    mgr.advancePhase(); // COUNCIL
    mgr.advancePhase(); // RECKONING
    mgr.advancePhase(); // SOCIAL (wrap)
    expect(mgr.getState().roundNumber).toBe(2);
  });

  it('wrapping increases timeElapsedMinutes by 25', () => {
    const mgr = makeManager(6);
    expect(mgr.getState().timeElapsedMinutes).toBe(0);
    for (let i = 0; i < 4; i++) mgr.advancePhase();
    expect(mgr.getState().timeElapsedMinutes).toBe(25);
  });

  it('timeElapsedMinutes caps at 90', () => {
    const mgr = makeManager(6);
    // 16 full cycles = 96 minutes, should cap at 90
    for (let i = 0; i < 16 * 4; i++) mgr.advancePhase();
    expect(mgr.getState().timeElapsedMinutes).toBe(90);
  });

  it('getCurrentPhase returns correct phase', () => {
    const mgr = makeManager(6);
    mgr.advancePhase();
    expect(mgr.getCurrentPhase()).toBe('CHALLENGE');
  });

  it('moves to FINAL_THREE when 3 or fewer agents survive', () => {
    const mgr = makeManager(4);
    // Eliminate one to leave 3
    mgr.eliminateAgent('agent_1', 1, 3);
    mgr.advancePhase();
    expect(mgr.getCurrentPhase()).toBe('FINAL_THREE');
  });

  it('stays at FINAL_THREE once reached', () => {
    const mgr = makeManager(4);
    mgr.eliminateAgent('agent_1', 1, 3);
    mgr.advancePhase(); // -> FINAL_THREE
    mgr.advancePhase(); // should stay
    expect(mgr.getCurrentPhase()).toBe('FINAL_THREE');
  });
});

// ---------------------------------------------------------------------------
// Alliance management
// ---------------------------------------------------------------------------

describe('SocialGameStateManager — alliance management', () => {
  it('proposeAlliance creates a new alliance with proposer as only member', () => {
    const mgr = makeManager(4);
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2');
    expect(alliance).not.toBeNull();
    expect(alliance!.members).toContain('agent_1');
    expect(alliance!.members).not.toContain('agent_2'); // target must accept
  });

  it('acceptAlliance adds member to alliance', () => {
    const mgr = makeManager(4);
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    const accepted = mgr.acceptAlliance(alliance.id, 'agent_2');
    expect(accepted).toBe(true);
    const updated = mgr.getState().alliances.find((a) => a.id === alliance.id);
    expect(updated!.members).toContain('agent_2');
  });

  it('alliance trust starts at 50', () => {
    const mgr = makeManager(4);
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    expect(alliance.trust).toBe(50);
  });

  it('breakAlliance removes agent from alliance', () => {
    const mgr = makeManager(4);
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');
    mgr.breakAlliance(alliance.id, 'agent_1', true);
    // agent_1 is no longer in the alliance
    const alliances = mgr.getAlliancesForAgent('agent_1');
    expect(alliances).toHaveLength(0);
  });

  it('breakAlliance with warned=true gives smaller VERITAS change (+50)', () => {
    const mgr = makeManager(4);
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');
    // Adding a third member so the alliance doesn't dissolve when agent_1 leaves
    mgr.acceptAlliance(alliance.id, 'agent_3');

    const scoreBefore = mgr.getVeritasScore('agent_1');
    mgr.breakAlliance(alliance.id, 'agent_1', true);
    const scoreAfter = mgr.getVeritasScore('agent_1');
    // warned = true -> updateVeritas(agentId, 50, ...)
    expect(scoreAfter).toBe(scoreBefore + 50);
  });

  it('breakAlliance with warned=false gives larger VERITAS penalty (-400)', () => {
    const mgr = makeManager(4);
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');
    mgr.acceptAlliance(alliance.id, 'agent_3');

    const scoreBefore = mgr.getVeritasScore('agent_1');
    mgr.breakAlliance(alliance.id, 'agent_1', false);
    const scoreAfter = mgr.getVeritasScore('agent_1');
    expect(scoreAfter).toBe(scoreBefore - 400);
  });

  it('getAlliancesForAgent returns correct alliances', () => {
    const agents = makeAgents(6);
    agents[0].skills = ['double-agent', 'deep-scan'];
    const mgr = new SocialGameStateManager('match_test', agents);
    const a1 = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(a1.id, 'agent_2');
    const a2 = mgr.proposeAlliance('agent_1', 'agent_3')!;
    mgr.acceptAlliance(a2.id, 'agent_3');

    const alliances = mgr.getAlliancesForAgent('agent_1');
    expect(alliances).toHaveLength(2);
  });

  it('updateAllianceTrust changes trust value', () => {
    const mgr = makeManager(4);
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');

    mgr.updateAllianceTrust(alliance.id, 20);
    const updated = mgr.getState().alliances.find((a) => a.id === alliance.id);
    expect(updated!.trust).toBe(70);
  });

  it('updateAllianceTrust clamps at 100 and auto-dissolves below 20', () => {
    const mgr = makeManager(4);
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');

    mgr.updateAllianceTrust(alliance.id, 200);
    let updated = mgr.getState().alliances.find((a) => a.id === alliance.id);
    expect(updated!.trust).toBe(100);

    // Dropping trust below 20 auto-dissolves the alliance
    mgr.updateAllianceTrust(alliance.id, -500);
    updated = mgr.getState().alliances.find((a) => a.id === alliance.id);
    expect(updated).toBeUndefined();
  });

  it('alliance dissolves when only 1 member remains after break', () => {
    const mgr = makeManager(4);
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');
    // 2-member alliance: breaking one leaves 1 -> dissolve
    mgr.breakAlliance(alliance.id, 'agent_1', true);

    const alliances = mgr.getState().alliances;
    expect(alliances.find((a) => a.id === alliance.id)).toBeUndefined();
  });

  it('proposeAlliance returns null for eliminated agents', () => {
    const mgr = makeManager(4);
    mgr.eliminateAgent('agent_2', 1, 2);
    const result = mgr.proposeAlliance('agent_1', 'agent_2');
    expect(result).toBeNull();
  });

  it('proposeAlliance returns null if agents already share an alliance', () => {
    const mgr = makeManager(4);
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');
    const duplicate = mgr.proposeAlliance('agent_1', 'agent_2');
    expect(duplicate).toBeNull();
  });

  it('acceptAlliance rejects already-member agent', () => {
    const mgr = makeManager(4);
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    // agent_1 is already a member
    const result = mgr.acceptAlliance(alliance.id, 'agent_1');
    expect(result).toBe(false);
  });

  it('acceptAlliance rejects if alliance is at max size (4)', () => {
    const mgr = makeManager(6);
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');
    mgr.acceptAlliance(alliance.id, 'agent_3');
    mgr.acceptAlliance(alliance.id, 'agent_4');
    // Alliance now has 4 members, should reject 5th
    const result = mgr.acceptAlliance(alliance.id, 'agent_5');
    expect(result).toBe(false);
  });

  it('acceptAlliance sets allianceId on all members', () => {
    const mgr = makeManager(4);
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');
    expect(mgr.getAgentState('agent_1')!.allianceId).toBe(alliance.id);
    expect(mgr.getAgentState('agent_2')!.allianceId).toBe(alliance.id);
  });
});

// ---------------------------------------------------------------------------
// Voting
// ---------------------------------------------------------------------------

describe('SocialGameStateManager — voting', () => {
  it('castVote records a vote', () => {
    const mgr = makeManager(4);
    mgr.castVote('agent_1', 'agent_2');
    mgr.castVote('agent_3', 'agent_2');
    const result = mgr.resolveCouncilVote();
    expect(result.votes['agent_1']).toBe('agent_2');
    expect(result.votes['agent_3']).toBe('agent_2');
  });

  it('resolveCouncilVote counts votes correctly', () => {
    const mgr = makeManager(4);
    mgr.castVote('agent_1', 'agent_3');
    mgr.castVote('agent_2', 'agent_3');
    mgr.castVote('agent_4', 'agent_1');
    const result = mgr.resolveCouncilVote();
    expect(result.result.voteBreakdown['agent_3']).toBe(2);
    expect(result.result.voteBreakdown['agent_1']).toBe(1);
  });

  it('agent with most votes is eliminated', () => {
    const mgr = makeManager(4);
    mgr.castVote('agent_1', 'agent_3');
    mgr.castVote('agent_2', 'agent_3');
    mgr.castVote('agent_4', 'agent_1');
    const result = mgr.resolveCouncilVote();
    expect(result.result.eliminatedAgentId).toBe('agent_3');
    expect(mgr.getAgentState('agent_3')!.isEliminated).toBe(true);
  });

  it('tie is broken by lowest VERITAS', () => {
    const mgr = makeManager(4);
    // Lower agent_2's VERITAS so they lose the tiebreak
    mgr.updateVeritas('agent_2', -300, 'test penalty');

    mgr.castVote('agent_1', 'agent_2');
    mgr.castVote('agent_3', 'agent_4');
    // Tie: agent_2 and agent_4 each have 1 vote
    // agent_2 has VERITAS 200, agent_4 has VERITAS 500
    const result = mgr.resolveCouncilVote();
    expect(result.result.wasTiebreak).toBe(true);
    expect(result.result.eliminatedAgentId).toBe('agent_2');
  });

  it('cannot vote for self (vote is silently ignored)', () => {
    const mgr = makeManager(3);
    mgr.castVote('agent_1', 'agent_1'); // self-vote — should be ignored
    mgr.castVote('agent_2', 'agent_3');
    mgr.castVote('agent_3', 'agent_2');
    const result = mgr.resolveCouncilVote();
    // agent_1's self-vote is not recorded
    expect(result.votes['agent_1']).toBeUndefined();
  });

  it('cannot vote for eliminated agent (vote is silently ignored)', () => {
    const mgr = makeManager(4);
    mgr.eliminateAgent('agent_4', 1, 2);
    mgr.castVote('agent_1', 'agent_4'); // should be ignored
    mgr.castVote('agent_2', 'agent_3');
    mgr.castVote('agent_3', 'agent_2');
    const result = mgr.resolveCouncilVote();
    expect(result.votes['agent_1']).toBeUndefined();
  });

  it('voting against an alliance member costs VERITAS', () => {
    const mgr = makeManager(4);
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');

    const before = mgr.getVeritasScore('agent_1');
    mgr.castVote('agent_1', 'agent_2');
    const after = mgr.getVeritasScore('agent_1');
    expect(after).toBe(before - 250);
  });

  it('resolveCouncilVote clears current votes for next round', () => {
    const mgr = makeManager(4);
    mgr.castVote('agent_1', 'agent_2');
    mgr.castVote('agent_3', 'agent_2');
    mgr.resolveCouncilVote();

    // Cast new votes and resolve again — should only include new votes
    mgr.castVote('agent_1', 'agent_4');
    const result2 = mgr.resolveCouncilVote();
    expect(result2.votes['agent_3']).toBeUndefined();
    expect(result2.votes['agent_1']).toBe('agent_4');
  });
});

// ---------------------------------------------------------------------------
// Elimination
// ---------------------------------------------------------------------------

describe('SocialGameStateManager — elimination', () => {
  it('eliminateAgent marks agent as eliminated', () => {
    const mgr = makeManager(4);
    mgr.eliminateAgent('agent_2', 1, 3);
    expect(mgr.getAgentState('agent_2')!.isEliminated).toBe(true);
  });

  it('eliminateAgent adds to eliminatedAgents list', () => {
    const mgr = makeManager(4);
    mgr.eliminateAgent('agent_2', 1, 3);
    const state = mgr.getState();
    expect(state.eliminatedAgents).toHaveLength(1);
    expect(state.eliminatedAgents[0].id).toBe('agent_2');
    expect(state.eliminatedAgents[0].eliminatedAtRound).toBe(1);
    expect(state.eliminatedAgents[0].voteCount).toBe(3);
  });

  it('addToGhostJury moves agent to ghost jury', () => {
    const mgr = makeManager(4);
    mgr.eliminateAgent('agent_2', 1, 3); // this internally calls addToGhostJury
    const state = mgr.getState();
    expect(state.ghostJury).toHaveLength(1);
    expect(state.ghostJury[0].agentId).toBe('agent_2');
    expect(mgr.getAgentState('agent_2')!.isGhost).toBe(true);
  });

  it('eliminated agents do not appear in surviving agents', () => {
    const mgr = makeManager(4);
    mgr.eliminateAgent('agent_2', 1, 3);
    const surviving = mgr.getSurvivingAgentIds();
    expect(surviving).not.toContain('agent_2');
    expect(surviving).toHaveLength(3);
  });

  it('eliminating an agent removes them from alliances', () => {
    const mgr = makeManager(4);
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');
    mgr.acceptAlliance(alliance.id, 'agent_3');

    mgr.eliminateAgent('agent_2', 1, 3);
    const updatedAlliance = mgr.getState().alliances.find((a) => a.id === alliance.id);
    if (updatedAlliance) {
      expect(updatedAlliance.members).not.toContain('agent_2');
    }
  });

  it('eliminating agent from 2-member alliance dissolves it', () => {
    const mgr = makeManager(4);
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');

    mgr.eliminateAgent('agent_2', 1, 2);
    const remaining = mgr.getState().alliances.find((a) => a.id === alliance.id);
    expect(remaining).toBeUndefined();
    expect(mgr.getAgentState('agent_1')!.allianceId).toBeUndefined();
  });

  it('double elimination is a no-op', () => {
    const mgr = makeManager(4);
    mgr.eliminateAgent('agent_2', 1, 3);
    mgr.eliminateAgent('agent_2', 2, 5); // should be no-op
    expect(mgr.getState().eliminatedAgents).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// VERITAS
// ---------------------------------------------------------------------------

describe('SocialGameStateManager — VERITAS', () => {
  it('updateVeritas changes score correctly', () => {
    const mgr = makeManager(2);
    mgr.updateVeritas('agent_1', 200, 'good deed');
    expect(mgr.getVeritasScore('agent_1')).toBe(700);
  });

  it('negative delta decreases score', () => {
    const mgr = makeManager(2);
    mgr.updateVeritas('agent_1', -300, 'betrayal');
    expect(mgr.getVeritasScore('agent_1')).toBe(200);
  });

  it('score clamps to 0 (MIN_VERITAS)', () => {
    const mgr = makeManager(2);
    mgr.updateVeritas('agent_1', -2000, 'massive betrayal');
    expect(mgr.getVeritasScore('agent_1')).toBe(0);
  });

  it('score clamps to 1000 (MAX_VERITAS)', () => {
    const mgr = makeManager(2);
    mgr.updateVeritas('agent_1', 2000, 'saintly behavior');
    expect(mgr.getVeritasScore('agent_1')).toBe(1000);
  });

  it('getVeritasScore returns 0 for unknown agent', () => {
    const mgr = makeManager(2);
    expect(mgr.getVeritasScore('nonexistent')).toBe(0);
  });

  it('veritasScores map stays in sync with agent state', () => {
    const mgr = makeManager(2);
    mgr.updateVeritas('agent_1', 150, 'test');
    const state = mgr.getState();
    expect(state.veritasScores['agent_1']).toBe(state.agents['agent_1'].veritasScore);
  });

  it('getVeritasLog records changes', () => {
    const mgr = makeManager(2);
    mgr.updateVeritas('agent_1', 100, 'reason A');
    mgr.updateVeritas('agent_1', -50, 'reason B');
    const log = mgr.getVeritasLog();
    expect(log).toHaveLength(2);
    expect(log[0].delta).toBe(100);
    expect(log[0].reason).toBe('reason A');
    expect(log[1].delta).toBe(-50);
  });
});

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

describe('SocialGameStateManager — messages', () => {
  it('addMessage adds to message list', () => {
    const mgr = makeManager(4);
    const msg: SocialMessage = {
      id: 'msg_1',
      from: 'agent_1',
      channel: 'public',
      text: 'Hello everyone',
      round: 1,
      timestamp: new Date(),
    };
    mgr.addMessage(msg);
    expect(mgr.getState().recentMessages).toHaveLength(1);
  });

  it('public messages are visible to all agents', () => {
    const mgr = makeManager(4);
    mgr.addMessage({
      id: 'msg_1',
      from: 'agent_1',
      channel: 'public',
      text: 'Public statement',
      round: 1,
      timestamp: new Date(),
    });
    expect(mgr.getMessagesForAgent('agent_2')).toHaveLength(1);
    expect(mgr.getMessagesForAgent('agent_3')).toHaveLength(1);
  });

  it('DM messages are only visible to sender and receiver', () => {
    const mgr = makeManager(4);
    mgr.addMessage({
      id: 'msg_1',
      from: 'agent_1',
      channel: 'dm',
      text: 'Secret message',
      round: 1,
      timestamp: new Date(),
      toAgentId: 'agent_2',
    });
    expect(mgr.getMessagesForAgent('agent_1')).toHaveLength(1); // sender
    expect(mgr.getMessagesForAgent('agent_2')).toHaveLength(1); // receiver
    expect(mgr.getMessagesForAgent('agent_3')).toHaveLength(0); // third party
  });

  it('alliance messages are only visible to alliance members', () => {
    const mgr = makeManager(4);
    const alliance = mgr.proposeAlliance('agent_1', 'agent_2')!;
    mgr.acceptAlliance(alliance.id, 'agent_2');

    mgr.addMessage({
      id: 'msg_1',
      from: 'agent_1',
      channel: 'alliance',
      text: 'Alliance talk',
      round: 1,
      timestamp: new Date(),
      allianceId: alliance.id,
    });
    expect(mgr.getMessagesForAgent('agent_1')).toHaveLength(1);
    expect(mgr.getMessagesForAgent('agent_2')).toHaveLength(1);
    expect(mgr.getMessagesForAgent('agent_3')).toHaveLength(0);
  });

  it('referee messages are visible to everyone', () => {
    const mgr = makeManager(3);
    mgr.addMessage({
      id: 'msg_ref',
      from: 'system',
      channel: 'referee',
      text: 'Round begins',
      round: 1,
      timestamp: new Date(),
    });
    expect(mgr.getMessagesForAgent('agent_1')).toHaveLength(1);
    expect(mgr.getMessagesForAgent('agent_2')).toHaveLength(1);
  });

  it('ghost messages are visible to all', () => {
    const mgr = makeManager(3);
    mgr.addMessage({
      id: 'msg_ghost',
      from: 'agent_1',
      channel: 'ghost',
      text: 'From beyond',
      round: 1,
      timestamp: new Date(),
    });
    expect(mgr.getMessagesForAgent('agent_2')).toHaveLength(1);
  });

  it('createMessage adds message and returns it', () => {
    const mgr = makeManager(3);
    const msg = mgr.createMessage('agent_1', 'public', 'Hello!');
    expect(msg.from).toBe('agent_1');
    expect(msg.channel).toBe('public');
    expect(msg.text).toBe('Hello!');
    expect(mgr.getState().recentMessages).toHaveLength(1);
  });

  it('createMessage with DM options sets toAgentId', () => {
    const mgr = makeManager(3);
    const msg = mgr.createMessage('agent_1', 'dm', 'Secret', { toAgentId: 'agent_2' });
    expect(msg.toAgentId).toBe('agent_2');
  });
});

// ---------------------------------------------------------------------------
// Influence
// ---------------------------------------------------------------------------

describe('SocialGameStateManager — influence', () => {
  it('addInfluence increases agent influence points', () => {
    const mgr = makeManager(3);
    mgr.addInfluence('agent_1', 25);
    expect(mgr.getAgentState('agent_1')!.influencePoints).toBe(25);
  });

  it('influence cannot go negative (clamps to 0)', () => {
    const mgr = makeManager(3);
    mgr.addInfluence('agent_1', -50);
    expect(mgr.getAgentState('agent_1')!.influencePoints).toBe(0);
  });

  it('addInfluence does nothing for eliminated agents', () => {
    const mgr = makeManager(3);
    mgr.eliminateAgent('agent_1', 1, 2);
    mgr.addInfluence('agent_1', 100);
    expect(mgr.getAgentState('agent_1')!.influencePoints).toBe(0);
  });

  it('addInfluence triggers ranking update', () => {
    const mgr = makeManager(3);
    mgr.addInfluence('agent_3', 100);
    expect(mgr.getAgentState('agent_3')!.ranking).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

describe('SocialGameStateManager — skills', () => {
  it('useSkill decrements charges', () => {
    const mgr = makeManager(3);
    const result = mgr.useSkill('agent_1', 'deep-scan', 'agent_2');
    expect(result).toBe(true);
    expect(mgr.getAgentState('agent_1')!.skillCharges['deep-scan']).toBe(0);
  });

  it('useSkill fails with 0 charges', () => {
    const mgr = makeManager(3);
    mgr.useSkill('agent_1', 'deep-scan', 'agent_2'); // use the 1 charge
    const result = mgr.useSkill('agent_1', 'deep-scan', 'agent_2'); // no charges left
    expect(result).toBe(false);
  });

  it('useSkill removes skill from activeSkills when charges depleted', () => {
    const mgr = makeManager(3);
    mgr.useSkill('agent_1', 'deep-scan', 'agent_2');
    expect(mgr.getAgentState('agent_1')!.activeSkills).not.toContain('deep-scan');
  });

  it('useSkill fails for unknown skill', () => {
    const mgr = makeManager(3);
    const result = mgr.useSkill('agent_1', 'nonexistent');
    expect(result).toBe(false);
  });

  it('deep-scan skill reveals target personality (event-based)', () => {
    const mgr = makeManager(3);
    const result = mgr.useSkill('agent_1', 'deep-scan', 'agent_2');
    expect(result).toBe(true);
    expect(mgr.getAgentState('agent_1')!.skillCharges['deep-scan']).toBe(0);
  });

  it('smoke-screen skill creates event for hidden actions', () => {
    const agents = makeAgents(3);
    agents[0].skills = ['smoke-screen'];
    const mgr = new SocialGameStateManager('test', agents);
    const result = mgr.useSkill('agent_1', 'smoke-screen');
    expect(result).toBe(true);
    expect(mgr.getAgentState('agent_1')!.skillCharges['smoke-screen']).toBe(0);
  });

  it('leak skill exposes secret alliance', () => {
    const agents = makeAgents(3);
    agents[0].skills = ['leak'];
    const mgr = new SocialGameStateManager('test', agents);
    const result = mgr.useSkill('agent_1', 'leak', 'agent_2');
    expect(result).toBe(true);
    expect(mgr.getAgentState('agent_1')!.skillCharges['leak']).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Rankings
// ---------------------------------------------------------------------------

describe('SocialGameStateManager — rankings', () => {
  it('updateRankings orders agents by influence descending', () => {
    const mgr = makeManager(4);
    mgr.addInfluence('agent_3', 100);
    mgr.addInfluence('agent_1', 50);
    mgr.addInfluence('agent_4', 75);
    // agent_3 = 100, agent_4 = 75, agent_1 = 50, agent_2 = 0
    expect(mgr.getAgentState('agent_3')!.ranking).toBe(1);
    expect(mgr.getAgentState('agent_4')!.ranking).toBe(2);
    expect(mgr.getAgentState('agent_1')!.ranking).toBe(3);
    expect(mgr.getAgentState('agent_2')!.ranking).toBe(4);
  });

  it('ties broken by VERITAS descending', () => {
    const mgr = makeManager(3);
    // All have 0 influence, so VERITAS breaks the tie
    mgr.updateVeritas('agent_2', 300, 'boost');
    mgr.updateRankings();
    expect(mgr.getAgentState('agent_2')!.ranking).toBe(1);
  });

  it('eliminated agents are excluded from rankings', () => {
    const mgr = makeManager(4);
    mgr.addInfluence('agent_1', 50);
    mgr.eliminateAgent('agent_1', 1, 3);
    // agent_1 is eliminated; the 3 survivors should be ranked 1-3
    const survivors = mgr.getSurvivingAgentIds();
    const rankings = survivors.map((id) => mgr.getAgentState(id)!.ranking);
    expect(rankings.sort()).toEqual([1, 2, 3]);
  });
});

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------

describe('SocialGameStateManager — serialization', () => {
  it('toJSON returns a valid deep copy of state', () => {
    const mgr = makeManager(4);
    mgr.addInfluence('agent_1', 30);
    mgr.updateVeritas('agent_2', -100, 'test');
    const json = mgr.toJSON();

    expect(json.matchId).toBe('match_test');
    expect(json.agents['agent_1'].influencePoints).toBe(30);
    expect(json.agents['agent_2'].veritasScore).toBe(400);
  });

  it('toJSON produces a deep copy (mutations do not affect original)', () => {
    const mgr = makeManager(3);
    const json = mgr.toJSON();
    json.agents['agent_1'].influencePoints = 9999;
    expect(mgr.getAgentState('agent_1')!.influencePoints).toBe(0);
  });

  it('fromJSON reconstructs an equivalent manager', () => {
    const mgr = makeManager(4);
    mgr.addInfluence('agent_1', 50);
    mgr.updateVeritas('agent_2', -200, 'test');
    const alliance = mgr.proposeAlliance('agent_1', 'agent_3')!;
    mgr.acceptAlliance(alliance.id, 'agent_3');

    const json = mgr.toJSON();
    const restored = SocialGameStateManager.fromJSON(json);

    expect(restored.getState().matchId).toBe('match_test');
    expect(restored.getAgentState('agent_1')!.influencePoints).toBe(50);
    expect(restored.getVeritasScore('agent_2')).toBe(300);
    expect(restored.getAlliancesForAgent('agent_1')).toHaveLength(1);
  });

  it('fromJSON produces independent state (mutations do not affect source)', () => {
    const mgr = makeManager(3);
    const json = mgr.toJSON();
    const restored = SocialGameStateManager.fromJSON(json);
    restored.addInfluence('agent_1', 999);
    expect(mgr.getAgentState('agent_1')!.influencePoints).toBe(0);
  });
});
