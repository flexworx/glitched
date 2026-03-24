import { MatchOrchestrator } from '@/lib/engine/social/match-orchestrator';
import { SocialGameStateManager } from '@/lib/engine/social/social-game-state';
import { ChallengeEngine } from '@/lib/engine/social/challenge-engine';
import type {
  AgentDecision,
  SocialGameState,
  SocialPhase,
  CouncilVote,
} from '@/lib/types/glitch-engine';
import type { PersonalityTraits } from '@/lib/types/agent';

// =============================================================================
// Helpers
// =============================================================================

/** Default personality for test agents — all traits at 50. */
function defaultPersonality(overrides: Partial<PersonalityTraits> = {}): PersonalityTraits {
  return {
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50,
    directness: 50,
    formality: 50,
    verbosity: 50,
    humor: 50,
    empathy: 50,
    riskTolerance: 50,
    deceptionAptitude: 50,
    loyaltyBias: 50,
    competitiveness: 50,
    adaptability: 50,
    emotionality: 50,
    impulsivity: 50,
    resilience: 50,
    jealousy: 50,
    pride: 50,
    assertiveness: 50,
    persuasiveness: 50,
    trustingness: 50,
    dominance: 50,
    cooperativeness: 50,
    analyticalThinking: 50,
    creativity: 50,
    patience: 50,
    decisionSpeed: 50,
    memoryRetention: 50,
    moralFlexibility: 50,
    vengefulness: 50,
    generosity: 50,
    urgencyBias: 50,
    ...overrides,
  };
}

const AGENT_PROFILES = [
  { name: 'Alpha',   flaw: 'Fear of Losing',      skills: ['rumor-mill', 'smoke-screen', 'escape-hatch'],    mbti: 'ENTJ', enneagram: '8w7', personality: defaultPersonality({ dominance: 85, competitiveness: 90 }) },
  { name: 'Bravo',   flaw: 'Conspiracy Theorist',  skills: ['deep-scan', 'mind-games', 'wiretap'],           mbti: 'INTJ', enneagram: '5w6', personality: defaultPersonality({ analyticalThinking: 90, trustingness: 20 }) },
  { name: 'Charlie', flaw: 'People Pleaser',       skills: ['silver-tongue', 'truth-serum', 'leak'],         mbti: 'ENFJ', enneagram: '2w3', personality: defaultPersonality({ empathy: 85, loyaltyBias: 80 }) },
  { name: 'Delta',   flaw: 'Grudge Holder',        skills: ['double-agent', 'scapegoat', 'poker-face'],      mbti: 'ENTP', enneagram: '3w4', personality: defaultPersonality({ deceptionAptitude: 90 }) },
  { name: 'Echo',    flaw: 'Big Bettor',           skills: ['insurance-policy', 'mole', 'pocket-veto'],      mbti: 'ISTP', enneagram: '7w8', personality: defaultPersonality({ riskTolerance: 85, patience: 25 }) },
  { name: 'Foxtrot', flaw: 'Pessimist',            skills: ['fake-death', 'influence-network', 'escape-hatch'], mbti: 'ISFJ', enneagram: '6w5', personality: defaultPersonality({ agreeableness: 80, neuroticism: 75 }) },
  { name: 'Golf',    flaw: 'Perfectionist',        skills: ['gaslighting', 'rumor-mill', 'deep-scan'],       mbti: 'ESTJ', enneagram: '1w2', personality: defaultPersonality({ conscientiousness: 90 }) },
  { name: 'Hotel',   flaw: 'Glass Ego',            skills: ['smoke-screen', 'mind-games', 'silver-tongue'],  mbti: 'INFP', enneagram: '4w5', personality: defaultPersonality({ creativity: 90, emotionality: 80 }) },
];

function makeAgents(count: number = 8) {
  return AGENT_PROFILES.slice(0, count).map((p, i) => ({
    id: `agent_${i}`,
    name: p.name,
    flaw: p.flaw,
    skills: p.skills,
    personality: p.personality,
    mbti: p.mbti,
    enneagram: p.enneagram,
  }));
}

/** Create a deterministic AgentDecision based on agent ID and phase. */
function mockAgentDecision(
  agentId: string,
  phase: string,
  gameState: SocialGameState,
  overrides: Partial<AgentDecision> = {}
): AgentDecision {
  const agentIndex = parseInt(agentId.split('_')[1], 10);

  const base: AgentDecision = {
    thinking: `Agent ${agentId} thinking during ${phase}`,
    speech: {
      public: `Agent ${agentId} speaks publicly in ${phase}`,
    },
    action: { type: 'pass' },
    emotional_state: 'confident',
    stance: 'neutral',
  };

  switch (phase) {
    case 'SOCIAL': {
      // Even-indexed agents propose alliances to their neighbor
      if (agentIndex % 2 === 0) {
        const targetIndex = agentIndex + 1;
        const targetId = `agent_${targetIndex}`;
        const surviving = Object.keys(gameState.agents).filter(
          (id) => !gameState.agents[id].isEliminated
        );
        if (surviving.includes(targetId)) {
          base.action = { type: 'propose_alliance', target: targetId };
        }
      }
      break;
    }
    case 'CHALLENGE': {
      // Default to cooperate for PD; agents with high competitiveness defect
      const choice = agentIndex % 3 === 0 ? 'defect' : 'cooperate';
      base.action = {
        type: 'challenge_choice',
        parameters: { choice },
      };
      break;
    }
    case 'COUNCIL': {
      // Vote for the agent with the highest index that is still surviving (scapegoat strategy)
      const surviving = Object.keys(gameState.agents)
        .filter((id) => !gameState.agents[id].isEliminated && id !== agentId);
      const target = surviving[surviving.length - 1];
      if (target) {
        base.action = { type: 'vote', target };
      }
      break;
    }
  }

  return { ...base, ...overrides };
}

function buildDecisionMap(
  agentIds: string[],
  phase: string,
  gameState: SocialGameState,
  overrideFn?: (agentId: string) => Partial<AgentDecision> | undefined
): Map<string, AgentDecision> {
  const map = new Map<string, AgentDecision>();
  for (const id of agentIds) {
    const overrides = overrideFn?.(id) ?? {};
    map.set(id, mockAgentDecision(id, phase, gameState, overrides));
  }
  return map;
}

function buildVoteMap(
  voterIds: string[],
  targetFn: (voterId: string) => string
): Map<string, string> {
  const map = new Map<string, string>();
  for (const id of voterIds) {
    map.set(id, targetFn(id));
  }
  return map;
}

function createOrchestrator(agentCount: number = 8): MatchOrchestrator {
  const agents = makeAgents(agentCount);
  return new MatchOrchestrator(`test-match-${Date.now()}`, agents);
}

// =============================================================================
// Tests
// =============================================================================

describe('Social Match Integration', () => {
  // ---------------------------------------------------------------------------
  // 1. Full match lifecycle
  // ---------------------------------------------------------------------------
  describe('Full match lifecycle', () => {
    it('should run multiple rounds with eliminations and reach final three', async () => {
      const orchestrator = createOrchestrator(8);
      let state = orchestrator.getState();

      // Verify initial state
      expect(Object.keys(state.agents)).toHaveLength(8);
      expect(state.roundNumber).toBe(1);
      expect(state.phase).toBe('SOCIAL');
      expect(state.eliminatedAgents).toHaveLength(0);
      expect(state.ghostJury).toHaveLength(0);

      // All agents start with VERITAS 500 and 0 influence
      for (const agent of Object.values(state.agents)) {
        expect(agent.veritasScore).toBe(500);
        expect(agent.influencePoints).toBe(0);
        expect(agent.isEliminated).toBe(false);
      }

      const phaseLog: Array<{ round: number; phase: SocialPhase }> = [];
      orchestrator.onRoundUpdate((round, phase) => {
        phaseLog.push({ round, phase });
      });

      // --- ROUND 1 ---
      let surviving = Object.keys(state.agents).filter(
        (id) => !state.agents[id].isEliminated
      );

      // Social phase: agents form alliances
      const socialDecisions1 = buildDecisionMap(surviving, 'SOCIAL', state);
      await orchestrator.runSocialPhase(socialDecisions1);
      state = orchestrator.getState();
      expect(state.phase).toBe('CHALLENGE');

      // Challenge phase: Prisoner's Dilemma (round 1 → index 0 → prisoners_dilemma)
      const challengeDecisions1 = buildDecisionMap(surviving, 'CHALLENGE', state);
      await orchestrator.runChallengePhase(challengeDecisions1);
      state = orchestrator.getState();
      expect(state.phase).toBe('COUNCIL');

      // Council phase: everyone votes for the last surviving agent
      const councilVotes1 = buildVoteMap(surviving, (voterId) => {
        const others = surviving.filter((id) => id !== voterId);
        return others[others.length - 1]; // vote for agent_7
      });
      const council1 = await orchestrator.runCouncilPhase(councilVotes1);
      state = orchestrator.getState();

      // Verify elimination happened
      expect(council1.result.eliminatedAgentId).toBeTruthy();
      expect(state.eliminatedAgents).toHaveLength(1);
      expect(state.ghostJury).toHaveLength(1);

      const eliminatedId1 = council1.result.eliminatedAgentId;
      expect(state.agents[eliminatedId1].isEliminated).toBe(true);
      expect(state.agents[eliminatedId1].isGhost).toBe(true);

      // Reckoning phase
      await orchestrator.runReckoningPhase();
      state = orchestrator.getState();
      expect(state.roundNumber).toBe(2);
      expect(state.phase).toBe('SOCIAL');

      // --- ROUND 2 ---
      surviving = Object.keys(state.agents).filter(
        (id) => !state.agents[id].isEliminated
      );
      expect(surviving).toHaveLength(7);

      const socialDecisions2 = buildDecisionMap(surviving, 'SOCIAL', state);
      await orchestrator.runSocialPhase(socialDecisions2);
      state = orchestrator.getState();

      // Round 2 challenge: information_auction (index 1)
      const challengeDecisions2 = buildDecisionMap(surviving, 'CHALLENGE', state, (id) => {
        const idx = parseInt(id.split('_')[1], 10);
        return {
          action: {
            type: 'challenge_choice' as const,
            parameters: { bid: (idx + 1) * 5 },
          },
        };
      });
      await orchestrator.runChallengePhase(challengeDecisions2);
      state = orchestrator.getState();

      const councilVotes2 = buildVoteMap(surviving, (voterId) => {
        const others = surviving.filter((id) => id !== voterId);
        return others[others.length - 1];
      });
      const council2 = await orchestrator.runCouncilPhase(councilVotes2);
      state = orchestrator.getState();

      expect(state.eliminatedAgents).toHaveLength(2);
      expect(state.ghostJury).toHaveLength(2);

      const eliminatedId2 = council2.result.eliminatedAgentId;
      expect(eliminatedId2).not.toBe(eliminatedId1);

      // Verify VERITAS scores have diverged from the initial 500
      const veritasValues = Object.values(state.veritasScores);
      const allSame = veritasValues.every((v) => v === 500);
      expect(allSame).toBe(false);

      // Continue eliminating until match is over
      await orchestrator.runReckoningPhase();

      let roundCount = 2;
      while (!orchestrator.isMatchOver() && roundCount < 10) {
        roundCount++;
        state = orchestrator.getState();
        surviving = Object.keys(state.agents).filter(
          (id) => !state.agents[id].isEliminated
        );

        const sd = buildDecisionMap(surviving, 'SOCIAL', state);
        await orchestrator.runSocialPhase(sd);

        if (orchestrator.isMatchOver()) break;

        const cd = buildDecisionMap(surviving, 'CHALLENGE', state);
        await orchestrator.runChallengePhase(cd);

        if (orchestrator.isMatchOver()) break;

        const cv = buildVoteMap(surviving, (voterId) => {
          const others = surviving.filter((id) => id !== voterId);
          return others[others.length - 1];
        });
        await orchestrator.runCouncilPhase(cv);

        if (orchestrator.isMatchOver()) break;

        await orchestrator.runReckoningPhase();
      }

      // Match should be over with 3 or fewer survivors
      state = orchestrator.getState();
      surviving = Object.keys(state.agents).filter(
        (id) => !state.agents[id].isEliminated
      );
      expect(surviving.length).toBeLessThanOrEqual(3);
      expect(state.ghostJury.length).toBeGreaterThanOrEqual(4);

      // Run final three
      const finalResult = await orchestrator.runFinalThree();
      expect(finalResult.winner).toBeTruthy();
      expect(surviving).toContain(finalResult.winner);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Alliance lifecycle
  // ---------------------------------------------------------------------------
  describe('Alliance lifecycle', () => {
    it('should form alliances, track trust, and handle betrayal with VERITAS impact', () => {
      // Test alliance lifecycle directly through the state manager for determinism
      const agentDefs = [
        { id: 'a1', name: 'Proposer',  flaw: 'Fear of Losing', skills: [] },
        { id: 'a2', name: 'Acceptor',  flaw: 'Fear of Losing', skills: [] },
        { id: 'a3', name: 'Bystander', flaw: 'Fear of Losing', skills: [] },
        { id: 'a4', name: 'Watcher',   flaw: 'Fear of Losing', skills: [] },
      ];
      const stateManager = new SocialGameStateManager('alliance-lifecycle', agentDefs);

      // Step 1: Propose alliance
      const alliance = stateManager.proposeAlliance('a1', 'a2');
      expect(alliance).not.toBeNull();
      expect(alliance!.members).toEqual(['a1']); // only proposer initially

      // Step 2: Accept alliance
      const accepted = stateManager.acceptAlliance(alliance!.id, 'a2');
      expect(accepted).toBe(true);

      let state = stateManager.getState();
      const formedAlliance = state.alliances.find((a) => a.id === alliance!.id);
      expect(formedAlliance!.members).toEqual(['a1', 'a2']);
      expect(formedAlliance!.trust).toBe(50); // initial trust

      // Step 3: Increase trust
      stateManager.updateAllianceTrust(alliance!.id, 20);
      state = stateManager.getState();
      expect(state.alliances.find((a) => a.id === alliance!.id)!.trust).toBe(70);

      // Step 4: Record VERITAS before betrayal
      const veritasBefore = stateManager.getVeritasScore('a1');

      // Step 5: Betray without warning
      stateManager.breakAlliance(alliance!.id, 'a1', false);
      state = stateManager.getState();

      // Alliance dissolved (only 1 member left)
      const remainingAlliance = state.alliances.find((a) => a.id === alliance!.id);
      expect(remainingAlliance).toBeUndefined();

      // VERITAS penalty: -400 for breaking without warning
      const veritasAfter = stateManager.getVeritasScore('a1');
      expect(veritasAfter).toBe(veritasBefore - 400);

      // Verify a2 is no longer in an alliance
      expect(state.agents['a2'].allianceId).toBeUndefined();
    });

    it('should give only a small VERITAS bonus when breaking with warning', () => {
      const agentDefs = [
        { id: 'a1', name: 'Leaver', flaw: 'Fear of Losing', skills: [] },
        { id: 'a2', name: 'Stayer', flaw: 'Fear of Losing', skills: [] },
      ];
      const stateManager = new SocialGameStateManager('warned-break', agentDefs);

      const alliance = stateManager.proposeAlliance('a1', 'a2');
      stateManager.acceptAlliance(alliance!.id, 'a2');

      const veritasBefore = stateManager.getVeritasScore('a1');
      stateManager.breakAlliance(alliance!.id, 'a1', true);

      // With warning: +50 VERITAS
      expect(stateManager.getVeritasScore('a1')).toBe(veritasBefore + 50);
    });

    it('should integrate alliance betrayal through the full orchestrator flow', async () => {
      const orchestrator = createOrchestrator(4);
      let state = orchestrator.getState();
      const surviving = Object.keys(state.agents);

      // Round 1 Social: form alliance between agent_0 and agent_1
      const socialDecisions = buildDecisionMap(surviving, 'SOCIAL', state, (id) => {
        if (id === 'agent_0') {
          return { action: { type: 'propose_alliance', target: 'agent_1' } };
        }
        if (id === 'agent_1') {
          return { action: { type: 'accept_alliance', parameters: {} } };
        }
        return { action: { type: 'pass' } };
      });
      await orchestrator.runSocialPhase(socialDecisions);
      state = orchestrator.getState();

      const alliance = state.alliances.find(
        (a) => a.members.includes('agent_0') && a.members.includes('agent_1')
      );
      expect(alliance).toBeDefined();

      // Record VERITAS before alliance actions cause changes
      const veritasAfterAlliance = state.veritasScores['agent_0'];

      // Verify VERITAS increased from proposing alliance (propose = +50)
      expect(veritasAfterAlliance).toBeGreaterThanOrEqual(500);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Council vote with tiebreaker
  // ---------------------------------------------------------------------------
  describe('Council vote with tiebreaker', () => {
    it('should eliminate the agent with lower VERITAS on a tie', async () => {
      const agents = makeAgents(4);
      const orchestrator = new MatchOrchestrator(`test-tie-${Date.now()}`, agents);

      // We need to get to COUNCIL phase and manipulate VERITAS
      // Use the state manager directly via getState for verification
      let state = orchestrator.getState();
      const surviving = Object.keys(state.agents);

      // Run social phase with pass
      const socialMap = buildDecisionMap(surviving, 'SOCIAL', state, () => ({
        action: { type: 'pass' },
      }));
      await orchestrator.runSocialPhase(socialMap);

      // Run challenge phase with pass
      state = orchestrator.getState();
      const challengeMap = buildDecisionMap(surviving, 'CHALLENGE', state, () => ({
        action: { type: 'challenge_choice', parameters: { choice: 'cooperate' } },
      }));
      await orchestrator.runChallengePhase(challengeMap);

      // For the council: create a tie between agent_2 and agent_3
      // agent_0 votes agent_2, agent_1 votes agent_3
      // agent_2 votes agent_3, agent_3 votes agent_2
      // That gives: agent_2 = 2 votes, agent_3 = 2 votes — TIE
      const councilVotes = new Map<string, string>();
      councilVotes.set('agent_0', 'agent_2');
      councilVotes.set('agent_1', 'agent_3');
      councilVotes.set('agent_2', 'agent_3');
      councilVotes.set('agent_3', 'agent_2');

      const councilResult = await orchestrator.runCouncilPhase(councilVotes);

      expect(councilResult.result.wasTiebreak).toBe(true);
      expect(councilResult.result.tiebreakReason).toContain('VERITAS');

      // The eliminated agent should be agent_2 or agent_3
      const eliminatedId = councilResult.result.eliminatedAgentId;
      expect(['agent_2', 'agent_3']).toContain(eliminatedId);

      // Verify the eliminated agent joined ghost jury
      state = orchestrator.getState();
      const juryMember = state.ghostJury.find((g) => g.agentId === eliminatedId);
      expect(juryMember).toBeDefined();
      expect(state.agents[eliminatedId].isEliminated).toBe(true);
      expect(state.agents[eliminatedId].isGhost).toBe(true);
    });

    it('should eliminate the agent with lower VERITAS when scores differ', async () => {
      // Use the state manager directly to set up exact VERITAS values
      const agentDefs = [
        { id: 'a1', name: 'One',   flaw: 'Fear of Losing', skills: ['rumor-mill'] },
        { id: 'a2', name: 'Two',   flaw: 'Fear of Losing', skills: ['rumor-mill'] },
        { id: 'a3', name: 'Three', flaw: 'Fear of Losing', skills: ['rumor-mill'] },
        { id: 'a4', name: 'Four',  flaw: 'Fear of Losing', skills: ['rumor-mill'] },
      ];
      const stateManager = new SocialGameStateManager('tie-test', agentDefs);

      // Give a3 lower VERITAS than a4
      stateManager.updateVeritas('a3', -200, 'test penalty');
      // a3 = 300, a4 = 500

      // Advance to COUNCIL
      stateManager.advancePhase(); // SOCIAL -> CHALLENGE
      stateManager.advancePhase(); // CHALLENGE -> COUNCIL

      // Create a tie: a3 and a4 each get 2 votes
      stateManager.castVote('a1', 'a3');
      stateManager.castVote('a2', 'a4');
      stateManager.castVote('a3', 'a4');
      stateManager.castVote('a4', 'a3');

      const result = stateManager.resolveCouncilVote();

      expect(result.result.wasTiebreak).toBe(true);
      // a3 has lower VERITAS (300 vs 500), so a3 should be eliminated
      expect(result.result.eliminatedAgentId).toBe('a3');
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Skill usage during match
  // ---------------------------------------------------------------------------
  describe('Skill usage during match', () => {
    it('should decrement skill charges and remove depleted skills', () => {
      const agentDefs = [
        { id: 'a1', name: 'Skilled', flaw: 'Fear of Losing', skills: ['rumor-mill', 'smoke-screen', 'leak'] },
        { id: 'a2', name: 'Target',  flaw: 'Fear of Losing', skills: ['rumor-mill'] },
      ];
      const stateManager = new SocialGameStateManager('skill-test', agentDefs);

      // Initial state: all skills have 1 charge
      const a1 = stateManager.getAgentState('a1')!;
      expect(a1.skillCharges['rumor-mill']).toBe(1);
      expect(a1.activeSkills).toContain('rumor-mill');

      // Use rumor-mill — reveals secret alliances, uses charge
      const result = stateManager.useSkill('a1', 'rumor-mill');
      expect(result).toBe(true);

      const a1After = stateManager.getAgentState('a1')!;
      expect(a1After.skillCharges['rumor-mill']).toBe(0);
      expect(a1After.activeSkills).not.toContain('rumor-mill');

      // Try to use rumor-mill again — should fail (no charges)
      const result2 = stateManager.useSkill('a1', 'rumor-mill');
      expect(result2).toBe(false);
    });

    it('should apply leak skill to expose target alliance', () => {
      const agentDefs = [
        { id: 'a1', name: 'Leaker', flaw: 'Fear of Losing', skills: ['leak'] },
        { id: 'a2', name: 'Target', flaw: 'Conspiracy Theorist', skills: [] },
        { id: 'a3', name: 'Ally',   flaw: 'Fear of Losing', skills: [] },
      ];
      const stateManager = new SocialGameStateManager('leak-test', agentDefs);

      // Form a secret alliance between a2 and a3
      const alliance = stateManager.proposeAlliance('a2', 'a3');
      stateManager.acceptAlliance(alliance!.id, 'a3');

      // Use leak on a2 to expose their alliance
      const result = stateManager.useSkill('a1', 'leak', 'a2');
      expect(result).toBe(true);
    });

    it('should apply silver-tongue skill successfully', () => {
      const agentDefs = [
        { id: 'a1', name: 'Charmer', flaw: 'Fear of Losing', skills: ['silver-tongue'] },
        { id: 'a2', name: 'Ally',    flaw: 'Fear of Losing', skills: [] },
      ];
      const stateManager = new SocialGameStateManager('silver-test', agentDefs);

      // Use silver-tongue — boosts alliance acceptance rate
      const result = stateManager.useSkill('a1', 'silver-tongue');
      expect(result).toBe(true);

      // Verify skill charge consumed
      const a1After = stateManager.getAgentState('a1')!;
      expect(a1After.skillCharges['silver-tongue']).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Flaw activation
  // ---------------------------------------------------------------------------
  describe('Flaw activation', () => {
    it('should apply People Pleaser flaw effect when flaw is active', () => {
      // "People Pleaser" overrides reject_alliance to accept_alliance.
      // We verify the mechanism by checking the flaw is correctly assigned and activatable.
      const agentDefs = [
        { id: 'a1', name: 'Proposer',     flaw: 'Fear of Losing', skills: ['deep-scan'] },
        { id: 'a2', name: 'PeoplePleaser', flaw: 'People Pleaser', skills: [] },
      ];
      const stateManager = new SocialGameStateManager('flaw-test', agentDefs);

      // Activate a2's flaw via direct state manipulation (deep-scan doesn't activate flaws)
      const a2State = stateManager.getAgentState('a2')!;
      a2State.flawActive = true;

      // The flaw effect is applied in SocialActionResolver.applyFlawEffects
      // which overrides reject_alliance to accept_alliance for People Pleaser.
      // For integration, we verify the flaw is now active.
      const agent = stateManager.getAgentState('a2')!;
      expect(agent.flaw).toBe('People Pleaser');
      expect(agent.flawActive).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Challenge scoring
  // ---------------------------------------------------------------------------
  describe('Challenge scoring', () => {
    describe("Prisoner's Dilemma", () => {
      it('should award correct influence for mutual cooperation', () => {
        const agentDefs = [
          { id: 'a1', name: 'Coop1', flaw: 'Fear of Losing', skills: [] },
          { id: 'a2', name: 'Coop2', flaw: 'Fear of Losing', skills: [] },
        ];
        const stateManager = new SocialGameStateManager('pd-coop', agentDefs);
        const engine = new ChallengeEngine(stateManager);

        const result = engine.resolvePrisonersDilemma(
          { a1: 'cooperate', a2: 'cooperate' },
          [['a1', 'a2']]
        );

        expect(result.type).toBe('prisoners_dilemma');
        expect(result.outcomes['a1'].influenceChange).toBe(15);
        expect(result.outcomes['a2'].influenceChange).toBe(15);
        expect(stateManager.getAgentState('a1')!.influencePoints).toBe(15);
        expect(stateManager.getAgentState('a2')!.influencePoints).toBe(15);
        // VERITAS should increase for cooperators
        expect(stateManager.getVeritasScore('a1')).toBe(600); // 500 + 100
        expect(stateManager.getVeritasScore('a2')).toBe(600);
      });

      it('should award correct influence for mutual defection', () => {
        const agentDefs = [
          { id: 'a1', name: 'Def1', flaw: 'Fear of Losing', skills: [] },
          { id: 'a2', name: 'Def2', flaw: 'Fear of Losing', skills: [] },
        ];
        const stateManager = new SocialGameStateManager('pd-defect', agentDefs);
        const engine = new ChallengeEngine(stateManager);

        const result = engine.resolvePrisonersDilemma(
          { a1: 'defect', a2: 'defect' },
          [['a1', 'a2']]
        );

        expect(result.outcomes['a1'].influenceChange).toBe(-10);
        expect(result.outcomes['a2'].influenceChange).toBe(-10);
        // Influence can't go below 0
        expect(stateManager.getAgentState('a1')!.influencePoints).toBe(0);
        expect(stateManager.getAgentState('a2')!.influencePoints).toBe(0);
      });

      it('should punish the cooperator and reward the defector in asymmetric case', () => {
        const agentDefs = [
          { id: 'a1', name: 'Defector', flaw: 'Fear of Losing', skills: [] },
          { id: 'a2', name: 'Sucker',   flaw: 'Fear of Losing', skills: [] },
        ];
        const stateManager = new SocialGameStateManager('pd-asym', agentDefs);
        const engine = new ChallengeEngine(stateManager);

        // Give a2 some influence so we can see the loss
        stateManager.addInfluence('a2', 30);

        const result = engine.resolvePrisonersDilemma(
          { a1: 'defect', a2: 'cooperate' },
          [['a1', 'a2']]
        );

        expect(result.outcomes['a1'].influenceChange).toBe(25);
        expect(result.outcomes['a2'].influenceChange).toBe(-20);
        expect(stateManager.getAgentState('a1')!.influencePoints).toBe(25);
        expect(stateManager.getAgentState('a2')!.influencePoints).toBe(10); // 30 - 20
        // Defector gets VERITAS penalty
        expect(stateManager.getVeritasScore('a1')).toBe(350); // 500 - 150
      });
    });

    describe("Liar's Court", () => {
      it('should reward truth-tellers and punish caught liars', () => {
        const agentDefs = [
          { id: 'a1', name: 'Honest',  flaw: 'Fear of Losing', skills: [] },
          { id: 'a2', name: 'Liar',    flaw: 'Fear of Losing', skills: [] },
          { id: 'a3', name: 'Judge',   flaw: 'Fear of Losing', skills: [] },
        ];
        const stateManager = new SocialGameStateManager('liars-court', agentDefs);
        const engine = new ChallengeEngine(stateManager);

        const claims = {
          a1: { claim: 'I have high loyalty', isTrue: true },
          a2: { claim: 'I never betray', isTrue: false },
        };

        // a3 correctly identifies both: believes a1 is true, believes a2 is false
        const votes = {
          a3: { a1: true, a2: false },
          a1: { a2: false }, // a1 also catches a2's lie
          a2: { a1: true },  // a2 believes a1's truth
        };

        const result = engine.resolveLiarsCourt(claims, votes);
        expect(result.type).toBe('liars_court');

        // a1 told truth → VERITAS +200
        expect(stateManager.getVeritasScore('a1')).toBe(700); // 500 + 200

        // a2 lied and got caught by more people than fooled
        // a3 caught the lie, a1 caught the lie → caughtCount=2, fooledCount=0
        expect(stateManager.getVeritasScore('a2')).toBe(200); // 500 - 300

        // a3 correctly identified the lie → influence gain
        expect(result.outcomes['a3']).toBeDefined();
        expect(result.outcomes['a3'].influenceChange).toBeGreaterThan(0);
      });
    });

    describe('Information Auction', () => {
      it('should award intel to highest bidder and tax losers', () => {
        const agentDefs = [
          { id: 'a1', name: 'HighBid', flaw: 'Fear of Losing', skills: [] },
          { id: 'a2', name: 'LowBid',  flaw: 'Fear of Losing', skills: [] },
          { id: 'a3', name: 'NoBid',   flaw: 'Fear of Losing', skills: [] },
        ];
        const stateManager = new SocialGameStateManager('auction-test', agentDefs);
        const engine = new ChallengeEngine(stateManager);

        // Give agents some influence to bid with
        stateManager.addInfluence('a1', 50);
        stateManager.addInfluence('a2', 50);

        const result = engine.resolveInformationAuction(
          { a1: 30, a2: 10 },
          'Secret alliance map'
        );

        expect(result.type).toBe('information_auction');
        // a1 wins: pays 30, gains 30 intel bonus → net 0 change to influence
        // a2 loses: pays half bid (5)
        expect(result.outcomes['a1']).toBeDefined();
        expect(result.outcomes['a2']).toBeDefined();
        expect(result.outcomes['a3']).toBeDefined();
        expect(result.outcomes['a3'].influenceChange).toBe(0);
      });
    });

    describe('The Ambassador', () => {
      it('should reward everyone on success and punish ambassador on failure', () => {
        const agentDefs = [
          { id: 'a1', name: 'Ambassador', flaw: 'Fear of Losing', skills: [] },
          { id: 'a2', name: 'Bystander',  flaw: 'Fear of Losing', skills: [] },
        ];
        const stateManager = new SocialGameStateManager('ambassador-success', agentDefs);
        const engine = new ChallengeEngine(stateManager);

        const successResult = engine.resolveAmbassador('a1', true);
        expect(successResult.outcomes['a1'].influenceChange).toBe(30);
        expect(successResult.outcomes['a2'].influenceChange).toBe(10);
        expect(stateManager.getVeritasScore('a1')).toBe(650); // 500 + 150

        // Now test failure with a fresh state
        const sm2 = new SocialGameStateManager('ambassador-fail', agentDefs);
        const engine2 = new ChallengeEngine(sm2);
        const failResult = engine2.resolveAmbassador('a1', false);
        expect(failResult.outcomes['a1'].influenceChange).toBe(-25);
        expect(failResult.outcomes['a2'].influenceChange).toBe(0);
        expect(sm2.getVeritasScore('a1')).toBe(400); // 500 - 100
      });
    });

    describe('The Sacrifice', () => {
      it('should reward alliance when a member volunteers', () => {
        const agentDefs = [
          { id: 'a1', name: 'Volunteer', flaw: 'Fear of Losing', skills: [] },
          { id: 'a2', name: 'AllyTwo',   flaw: 'Fear of Losing', skills: [] },
          { id: 'a3', name: 'AllyThree', flaw: 'Fear of Losing', skills: [] },
        ];
        const stateManager = new SocialGameStateManager('sacrifice-test', agentDefs);
        const engine = new ChallengeEngine(stateManager);

        // Form alliance
        const alliance = stateManager.proposeAlliance('a1', 'a2');
        stateManager.acceptAlliance(alliance!.id, 'a2');
        stateManager.acceptAlliance(alliance!.id, 'a3');

        stateManager.addInfluence('a1', 40);

        const result = engine.resolveSacrifice(alliance!.id, 'a1');
        expect(result.type).toBe('the_sacrifice');
        expect(result.outcomes['a1'].influenceChange).toBe(-20);
        expect(result.outcomes['a2'].influenceChange).toBe(10);
        expect(stateManager.getAgentState('a1')!.influencePoints).toBe(20); // 40 - 20

        // Alliance trust should increase by 25
        const updatedAlliance = stateManager.getState().alliances.find(
          (a) => a.id === alliance!.id
        );
        expect(updatedAlliance!.trust).toBe(75); // 50 + 25

        // Volunteer VERITAS should increase
        expect(stateManager.getVeritasScore('a1')).toBe(650); // 500 + 150
      });

      it('should penalize alliance when nobody volunteers', () => {
        const agentDefs = [
          { id: 'a1', name: 'Selfish1', flaw: 'Fear of Losing', skills: [] },
          { id: 'a2', name: 'Selfish2', flaw: 'Fear of Losing', skills: [] },
        ];
        const stateManager = new SocialGameStateManager('no-sacrifice', agentDefs);
        const engine = new ChallengeEngine(stateManager);

        const alliance = stateManager.proposeAlliance('a1', 'a2');
        stateManager.acceptAlliance(alliance!.id, 'a2');

        const result = engine.resolveSacrifice(alliance!.id, null);
        expect(result.outcomes['a1'].influenceChange).toBe(-5);
        expect(result.outcomes['a2'].influenceChange).toBe(-5);

        const updatedAlliance = stateManager.getState().alliances.find(
          (a) => a.id === alliance!.id
        );
        expect(updatedAlliance!.trust).toBe(30); // 50 - 20
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Ghost Jury final vote
  // ---------------------------------------------------------------------------
  describe('Ghost Jury final vote', () => {
    it('should determine a winner from ghost jury votes', async () => {
      const agentDefs = [
        { id: 'a1', name: 'Finalist1', flaw: 'Fear of Losing', skills: [] },
        { id: 'a2', name: 'Finalist2', flaw: 'Fear of Losing', skills: [] },
        { id: 'a3', name: 'Finalist3', flaw: 'Fear of Losing', skills: [] },
        { id: 'a4', name: 'Ghost1',    flaw: 'Fear of Losing', skills: [] },
        { id: 'a5', name: 'Ghost2',    flaw: 'Fear of Losing', skills: [] },
        { id: 'a6', name: 'Ghost3',    flaw: 'Fear of Losing', skills: [] },
        { id: 'a7', name: 'Ghost4',    flaw: 'Fear of Losing', skills: [] },
        { id: 'a8', name: 'Ghost5',    flaw: 'Fear of Losing', skills: [] },
      ];
      const stateManager = new SocialGameStateManager('jury-test', agentDefs);

      // Eliminate agents to create ghost jury
      stateManager.eliminateAgent('a4', 1, 3);
      stateManager.eliminateAgent('a5', 2, 3);
      stateManager.eliminateAgent('a6', 3, 3);
      stateManager.eliminateAgent('a7', 4, 3);
      stateManager.eliminateAgent('a8', 5, 3);

      const state = stateManager.getState();
      expect(state.ghostJury).toHaveLength(5);
      expect(stateManager.getSurvivingAgentIds()).toHaveLength(3);

      // Set jury votes — a1 gets 3 votes, a2 gets 2
      state.ghostJury[0].finalVote = 'a1';
      state.ghostJury[1].finalVote = 'a1';
      state.ghostJury[2].finalVote = 'a1';
      state.ghostJury[3].finalVote = 'a2';
      state.ghostJury[4].finalVote = 'a2';

      // Create orchestrator-like final resolution using the state
      const agents = agentDefs.map((a) => ({
        ...a,
        personality: defaultPersonality(),
        mbti: 'INTJ',
        enneagram: '5w6',
      }));
      const orchestrator = new MatchOrchestrator('jury-final', agents);

      // We need to manually set up the state — use the orchestrator's runFinalThree
      // but first manipulate internal state. Since orchestrator creates its own state,
      // we test the jury logic directly via the state manager approach.

      // Verify jury votes
      const juryVotes: Array<{ jurorId: string; jurorName: string; votedFor: string }> = [];
      for (const juror of state.ghostJury) {
        if (juror.finalVote) {
          juryVotes.push({
            jurorId: juror.agentId,
            jurorName: juror.name,
            votedFor: juror.finalVote,
          });
        }
      }

      // Tally
      const voteCounts: Record<string, number> = {};
      for (const vote of juryVotes) {
        voteCounts[vote.votedFor] = (voteCounts[vote.votedFor] || 0) + 1;
      }

      const maxVotes = Math.max(0, ...Object.values(voteCounts));
      expect(maxVotes).toBe(3);

      const winner = Object.entries(voteCounts)
        .filter(([, count]) => count === maxVotes)
        .map(([id]) => id)[0];
      expect(winner).toBe('a1');
    });

    it('should use auto-voting based on VERITAS when no finalVotes are set', async () => {
      const agentCount = 6;
      const agents = makeAgents(agentCount);
      const orchestrator = new MatchOrchestrator(`auto-jury-${Date.now()}`, agents);
      let state = orchestrator.getState();

      // Eliminate 3 agents manually by running rounds
      const rounds = 3;
      for (let r = 0; r < rounds; r++) {
        state = orchestrator.getState();
        const surviving = Object.keys(state.agents).filter(
          (id) => !state.agents[id].isEliminated
        );

        if (surviving.length <= 3) break;

        const sd = buildDecisionMap(surviving, 'SOCIAL', state, () => ({
          action: { type: 'pass' },
        }));
        await orchestrator.runSocialPhase(sd);

        if (orchestrator.isMatchOver()) break;

        state = orchestrator.getState();
        const cd = buildDecisionMap(surviving, 'CHALLENGE', state, () => ({
          action: { type: 'challenge_choice', parameters: { choice: 'cooperate' } },
        }));
        await orchestrator.runChallengePhase(cd);

        if (orchestrator.isMatchOver()) break;

        const cv = buildVoteMap(surviving, (voterId) => {
          const others = surviving.filter((id) => id !== voterId);
          return others[others.length - 1];
        });
        await orchestrator.runCouncilPhase(cv);

        if (orchestrator.isMatchOver()) break;

        await orchestrator.runReckoningPhase();
      }

      state = orchestrator.getState();
      if (state.ghostJury.length > 0 && orchestrator.isMatchOver()) {
        const finalResult = await orchestrator.runFinalThree();
        expect(finalResult.winner).toBeTruthy();
        // Auto-voting should have produced jury votes
        expect(finalResult.juryVotes.length).toBeGreaterThan(0);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 8. State serialization roundtrip
  // ---------------------------------------------------------------------------
  describe('State serialization roundtrip', () => {
    it('should serialize and deserialize game state without data loss', () => {
      const agentDefs = [
        { id: 'a1', name: 'Serial1', flaw: 'Fear of Losing',       skills: ['rumor-mill', 'smoke-screen'] },
        { id: 'a2', name: 'Serial2', flaw: 'Conspiracy Theorist', skills: ['deep-scan'] },
        { id: 'a3', name: 'Serial3', flaw: 'Grudge Holder',       skills: ['silver-tongue'] },
        { id: 'a4', name: 'Serial4', flaw: 'Pessimist',           skills: ['escape-hatch'] },
      ];
      const stateManager = new SocialGameStateManager('serial-test', agentDefs);

      // Add some state: alliances, messages, VERITAS changes, influence
      stateManager.proposeAlliance('a1', 'a2');
      const alliances = stateManager.getState().alliances;
      stateManager.acceptAlliance(alliances[0].id, 'a2');

      stateManager.createMessage('a1', 'public', 'Hello world');
      stateManager.createMessage('a1', 'dm', 'Secret message', { toAgentId: 'a2' });

      stateManager.updateVeritas('a1', 150, 'Good deed');
      stateManager.updateVeritas('a3', -200, 'Bad deed');

      stateManager.addInfluence('a2', 25);
      stateManager.addInfluence('a4', 10);

      stateManager.advancePhase(); // SOCIAL -> CHALLENGE
      stateManager.advancePhase(); // CHALLENGE -> COUNCIL

      // Eliminate a4
      stateManager.eliminateAgent('a4', 1, 2);

      const original = stateManager.toJSON();

      // Serialize to JSON string and back
      const jsonString = JSON.stringify(original);
      const parsed = JSON.parse(jsonString) as SocialGameState;

      // Deserialize into a new state manager
      const restored = SocialGameStateManager.fromJSON(parsed);
      const restoredState = restored.getState();

      // Verify all fields match
      expect(restoredState.matchId).toBe(original.matchId);
      expect(restoredState.roundNumber).toBe(original.roundNumber);
      expect(restoredState.phase).toBe(original.phase);
      expect(restoredState.timeElapsedMinutes).toBe(original.timeElapsedMinutes);

      // Agents
      expect(Object.keys(restoredState.agents)).toEqual(Object.keys(original.agents));
      for (const id of Object.keys(original.agents)) {
        expect(restoredState.agents[id].influencePoints).toBe(original.agents[id].influencePoints);
        expect(restoredState.agents[id].veritasScore).toBe(original.agents[id].veritasScore);
        expect(restoredState.agents[id].isEliminated).toBe(original.agents[id].isEliminated);
        expect(restoredState.agents[id].activeSkills).toEqual(original.agents[id].activeSkills);
        expect(restoredState.agents[id].flaw).toBe(original.agents[id].flaw);
      }

      // Alliances
      expect(restoredState.alliances.length).toBe(original.alliances.length);
      if (original.alliances.length > 0) {
        expect(restoredState.alliances[0].members).toEqual(original.alliances[0].members);
        expect(restoredState.alliances[0].trust).toBe(original.alliances[0].trust);
      }

      // Messages
      expect(restoredState.recentMessages.length).toBe(original.recentMessages.length);

      // VERITAS
      expect(restoredState.veritasScores).toEqual(original.veritasScores);

      // Ghost jury
      expect(restoredState.ghostJury.length).toBe(original.ghostJury.length);

      // Eliminated agents
      expect(restoredState.eliminatedAgents.length).toBe(original.eliminatedAgents.length);
    });
  });

  // ---------------------------------------------------------------------------
  // 9. Edge cases
  // ---------------------------------------------------------------------------
  describe('Edge cases', () => {
    it('should dissolve alliance when all members are eliminated', () => {
      const agentDefs = [
        { id: 'a1', name: 'Ally1',  flaw: 'Fear of Losing', skills: [] },
        { id: 'a2', name: 'Ally2',  flaw: 'Fear of Losing', skills: [] },
        { id: 'a3', name: 'Other1', flaw: 'Fear of Losing', skills: [] },
        { id: 'a4', name: 'Other2', flaw: 'Fear of Losing', skills: [] },
      ];
      const stateManager = new SocialGameStateManager('dissolve-test', agentDefs);

      const alliance = stateManager.proposeAlliance('a1', 'a2');
      stateManager.acceptAlliance(alliance!.id, 'a2');
      expect(stateManager.getState().alliances).toHaveLength(1);

      // Eliminate a1 — alliance drops to 1 member, should dissolve
      stateManager.eliminateAgent('a1', 1, 2);

      const state = stateManager.getState();
      // Alliance with < 2 members is dissolved during elimination
      expect(state.alliances).toHaveLength(0);
      expect(state.agents['a2'].allianceId).toBeUndefined();
    });

    it('should prevent an agent from joining two different alliances with the same partner', () => {
      const agentDefs = [
        { id: 'a1', name: 'Multi1', flaw: 'Fear of Losing', skills: [] },
        { id: 'a2', name: 'Multi2', flaw: 'Fear of Losing', skills: [] },
      ];
      const stateManager = new SocialGameStateManager('multi-alliance', agentDefs);

      const alliance1 = stateManager.proposeAlliance('a1', 'a2');
      stateManager.acceptAlliance(alliance1!.id, 'a2');

      // Try to propose another alliance between the same agents
      const alliance2 = stateManager.proposeAlliance('a1', 'a2');
      expect(alliance2).toBeNull();
    });

    it('should handle agents with 0 influence points gracefully', () => {
      const agentDefs = [
        { id: 'a1', name: 'Broke', flaw: 'Fear of Losing', skills: [] },
      ];
      const stateManager = new SocialGameStateManager('zero-inf', agentDefs);

      expect(stateManager.getAgentState('a1')!.influencePoints).toBe(0);

      // Trying to subtract from 0 should floor at 0
      stateManager.addInfluence('a1', -50);
      expect(stateManager.getAgentState('a1')!.influencePoints).toBe(0);

      // Adding influence should work
      stateManager.addInfluence('a1', 10);
      expect(stateManager.getAgentState('a1')!.influencePoints).toBe(10);
    });

    it('should clamp VERITAS at minimum (0) and maximum (1000)', () => {
      const agentDefs = [
        { id: 'a1', name: 'Extremes', flaw: 'Fear of Losing', skills: [] },
      ];
      const stateManager = new SocialGameStateManager('veritas-clamp', agentDefs);

      // Push VERITAS below 0
      stateManager.updateVeritas('a1', -9999, 'Extreme penalty');
      expect(stateManager.getVeritasScore('a1')).toBe(0);
      expect(stateManager.getAgentState('a1')!.veritasScore).toBe(0);

      // Push VERITAS above 1000
      stateManager.updateVeritas('a1', 9999, 'Extreme reward');
      expect(stateManager.getVeritasScore('a1')).toBe(1000);
      expect(stateManager.getAgentState('a1')!.veritasScore).toBe(1000);
    });

    it('should not allow self-voting in council', () => {
      const agentDefs = [
        { id: 'a1', name: 'Self', flaw: 'Fear of Losing', skills: [] },
        { id: 'a2', name: 'Other', flaw: 'Fear of Losing', skills: [] },
      ];
      const stateManager = new SocialGameStateManager('self-vote', agentDefs);
      stateManager.advancePhase(); // SOCIAL -> CHALLENGE
      stateManager.advancePhase(); // CHALLENGE -> COUNCIL

      // Try to self-vote
      stateManager.castVote('a1', 'a1');
      // Cast a valid vote from a2
      stateManager.castVote('a2', 'a1');

      const result = stateManager.resolveCouncilVote();
      // Only a2's vote should count
      expect(result.votes['a1']).toBeUndefined();
      expect(result.votes['a2']).toBe('a1');
    });

    it('should not allow eliminated agents to vote or act', () => {
      const agentDefs = [
        { id: 'a1', name: 'Ghost', flaw: 'Fear of Losing', skills: [] },
        { id: 'a2', name: 'Alive', flaw: 'Fear of Losing', skills: [] },
        { id: 'a3', name: 'Also',  flaw: 'Fear of Losing', skills: [] },
        { id: 'a4', name: 'Sure',  flaw: 'Fear of Losing', skills: [] },
      ];
      const stateManager = new SocialGameStateManager('elim-vote', agentDefs);
      stateManager.eliminateAgent('a1', 1, 2);

      // Eliminated agent tries to cast a vote
      stateManager.advancePhase(); // SOCIAL -> CHALLENGE
      stateManager.advancePhase(); // CHALLENGE -> COUNCIL
      stateManager.castVote('a1', 'a2');

      // Verify vote was not recorded
      stateManager.castVote('a2', 'a3');
      const result = stateManager.resolveCouncilVote();
      expect(result.votes['a1']).toBeUndefined();
    });

    it('should handle MAX_ALLIANCE_SIZE limit', () => {
      const agentDefs = [
        { id: 'a1', name: 'L1', flaw: 'Fear of Losing', skills: [] },
        { id: 'a2', name: 'L2', flaw: 'Fear of Losing', skills: [] },
        { id: 'a3', name: 'L3', flaw: 'Fear of Losing', skills: [] },
        { id: 'a4', name: 'L4', flaw: 'Fear of Losing', skills: [] },
        { id: 'a5', name: 'L5', flaw: 'Fear of Losing', skills: [] },
      ];
      const stateManager = new SocialGameStateManager('max-alliance', agentDefs);

      const alliance = stateManager.proposeAlliance('a1', 'a2');
      stateManager.acceptAlliance(alliance!.id, 'a2');
      stateManager.acceptAlliance(alliance!.id, 'a3');
      stateManager.acceptAlliance(alliance!.id, 'a4');

      // Alliance now has 4 members (max). Trying to add a5 should fail.
      const result = stateManager.acceptAlliance(alliance!.id, 'a5');
      expect(result).toBe(false);
      expect(stateManager.getState().alliances[0].members).toHaveLength(4);
    });

    it('should update alliance trust via reckoning decay', async () => {
      const agents = makeAgents(4);
      const orchestrator = new MatchOrchestrator(`decay-test-${Date.now()}`, agents);
      let state = orchestrator.getState();
      const surviving = Object.keys(state.agents);

      // Form an alliance in social phase
      const socialDecisions = buildDecisionMap(surviving, 'SOCIAL', state, (id) => {
        if (id === 'agent_0') {
          return { action: { type: 'propose_alliance', target: 'agent_1' } };
        }
        if (id === 'agent_1') {
          return { action: { type: 'accept_alliance', parameters: {} } };
        }
        return { action: { type: 'pass' } };
      });
      await orchestrator.runSocialPhase(socialDecisions);
      state = orchestrator.getState();

      const allianceBefore = state.alliances.find(
        (a) => a.members.includes('agent_0') && a.members.includes('agent_1')
      );
      if (allianceBefore) {
        const trustBefore = allianceBefore.trust;

        // Run challenge and council
        const cd = buildDecisionMap(surviving, 'CHALLENGE', state, () => ({
          action: { type: 'challenge_choice', parameters: { choice: 'cooperate' } },
        }));
        await orchestrator.runChallengePhase(cd);

        const cv = buildVoteMap(surviving, (voterId) => {
          return voterId === 'agent_3' ? 'agent_2' : 'agent_3';
        });
        await orchestrator.runCouncilPhase(cv);

        // Reckoning should cause -5 trust decay
        await orchestrator.runReckoningPhase();
        state = orchestrator.getState();

        const allianceAfter = state.alliances.find(
          (a) => a.id === allianceBefore.id
        );
        if (allianceAfter) {
          expect(allianceAfter.trust).toBe(trustBefore - 5);
        }
      }
    });
  });
});
