import { SocialGameStateManager } from './social-game-state';
import { SocialActionResolver } from './action-resolver';
import { ChallengeEngine } from './challenge-engine';
import { assembleSocialContext } from './social-context-assembly';
import type {
  AgentDecision,
  SocialPhase,
  CouncilVote,
  SocialGameState,
  ChallengeResult,
} from '../../types/glitch-engine';
import type { GameConfig } from '../template-loader';
import {
  getGameModeHandler,
  type GameModeHandler,
  type PhaseResult,
} from '../game-modes';

interface OrchestratorAgent {
  id: string;
  name: string;
  flaw: string;
  skills: string[];
  personality: Record<string, number>;
  mbti: string;
  enneagram: string;
}

/** Wildcard events that can shake up match dynamics. */
const WILDCARD_EVENTS = [
  { name: 'Alliance Shuffle', description: 'All alliances are dissolved. New alliances must be formed from scratch.', effect: 'All current alliances are broken. Trust resets.' },
  { name: 'Truth Bomb', description: 'All VERITAS scores are revealed publicly for this round.', effect: 'Every agent can see every other agent\'s exact VERITAS score.' },
  { name: 'Double Elimination', description: 'This council will eliminate TWO agents instead of one.', effect: 'The top 2 vote-getters are both eliminated.' },
  { name: 'Immunity Idol', description: 'The lowest-ranked agent receives immunity this round.', effect: 'The bottom-ranked agent cannot be eliminated this council.' },
  { name: 'Flaw Activation', description: 'All agent flaws become ACTIVE for the next 2 rounds.', effect: 'Every flaw mechanically affects decisions.' },
  { name: 'Silent Round', description: 'No public messages allowed this round. DMs only.', effect: 'Public channel is disabled. Alliances must communicate via DM.' },
];

export class MatchOrchestrator {
  private stateManager: SocialGameStateManager;
  private actionResolver: SocialActionResolver;
  private challengeEngine: ChallengeEngine;
  private agents: OrchestratorAgent[];
  private gameConfig: GameConfig | null;
  private gameModeHandler: GameModeHandler | null;
  private roundCallbacks: Array<
    (round: number, phase: SocialPhase, state: SocialGameState) => void
  > = [];

  constructor(
    matchId: string,
    agents: OrchestratorAgent[],
    gameConfig?: GameConfig
  ) {
    this.agents = agents;
    this.gameConfig = gameConfig ?? null;
    this.stateManager = new SocialGameStateManager(
      matchId,
      agents.map((a) => ({
        id: a.id,
        name: a.name,
        flaw: a.flaw,
        skills: a.skills,
      }))
    );
    this.actionResolver = new SocialActionResolver(this.stateManager);
    this.challengeEngine = new ChallengeEngine(this.stateManager);

    // Initialize game mode handler if a config is provided
    if (gameConfig && gameConfig.category !== 'SOCIAL') {
      this.gameModeHandler = getGameModeHandler(gameConfig.category ?? 'STANDARD');
      this.gameModeHandler.initialize(
        agents.map((a) => ({ id: String(a.id), name: String(a.name) })),
        gameConfig
      );
    } else {
      this.gameModeHandler = null;
    }
  }

  /** Get the loaded game configuration (if any). */
  getGameConfig(): GameConfig | null {
    return this.gameConfig;
  }

  /**
   * Run a template-driven round using the appropriate game mode handler.
   * Falls back to the standard social elimination flow for SOCIAL category.
   */
  async runTemplateDrivenRound(
    agentActions: Map<string, Record<string, unknown>>
  ): Promise<PhaseResult | null> {
    if (!this.gameModeHandler || !this.gameConfig) return null;

    for (const [agentId, action] of agentActions) {
      this.gameModeHandler.processAgentAction(agentId, action);
    }

    const result = this.gameModeHandler.resolveRound();

    // Check easter egg triggers
    if ((this.gameConfig.easterEggs ?? []).length > 0) {
      for (const egg of (this.gameConfig.easterEggs ?? [])) {
        const eggData = egg as Record<string, unknown>;
        if (eggData.wasTriggered) continue;
        if (eggData.trigger === 'RANDOM' && Math.random() < Number(eggData.probability)) {
          result.events.push({
            type: 'EASTER_EGG',
            description: `${String(eggData.icon)} ${String(eggData.name)} triggered! Effect: ${String(eggData.effectType)}`,
          });
        }
      }
    }

    this.emitUpdate();
    return result;
  }

  onRoundUpdate(
    callback: (round: number, phase: SocialPhase, state: SocialGameState) => void
  ): void {
    this.roundCallbacks.push(callback);
  }

  private emitUpdate(): void {
    const state = this.stateManager.getState();
    for (const cb of this.roundCallbacks) {
      try {
        cb(state.roundNumber, state.phase, state);
      } catch {
        // Callbacks should not break the orchestrator
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Phase execution
  // ---------------------------------------------------------------------------

  /**
   * Run the SOCIAL phase. Each agent submits a decision including speech,
   * alliance proposals, skill usage, and information trading.
   */
  async runSocialPhase(
    agentDecisions: Map<string, AgentDecision>
  ): Promise<void> {
    // Ensure we are in the SOCIAL phase
    const currentPhase = this.stateManager.getCurrentPhase();
    if (currentPhase !== 'SOCIAL') {
      while (this.stateManager.getCurrentPhase() !== 'SOCIAL') {
        this.stateManager.advancePhase();
        if (this.stateManager.getCurrentPhase() === 'FINAL_THREE') break;
      }
    }

    // Process each agent's decision
    const survivingIds = this.stateManager.getSurvivingAgentIds();
    for (const agentId of survivingIds) {
      const decision = agentDecisions.get(agentId);
      if (!decision) continue;

      this.actionResolver.resolveDecision(agentId, decision);
    }

    // Advance to CHALLENGE phase
    this.stateManager.advancePhase();
    this.emitUpdate();
  }

  /**
   * Run the CHALLENGE phase. A challenge is generated and each agent submits
   * their response (cooperate/defect, bid, claim, etc.).
   */
  async runChallengePhase(
    agentDecisions: Map<string, AgentDecision>
  ): Promise<void> {
    const currentPhase = this.stateManager.getCurrentPhase();
    if (currentPhase !== 'CHALLENGE') {
      while (this.stateManager.getCurrentPhase() !== 'CHALLENGE') {
        this.stateManager.advancePhase();
        if (this.stateManager.getCurrentPhase() === 'FINAL_THREE') break;
      }
    }

    const survivingIds = this.stateManager.getSurvivingAgentIds();
    const state = this.stateManager.getState();

    // Generate challenge for this round
    const challengeParams = this.challengeEngine.generateChallenge(
      state.roundNumber,
      survivingIds
    );

    // Store challenge params on state for context assembly
    (this.stateManager.getState() as any).challengeParams = challengeParams;

    // Process speech from all decisions first
    const decisionEntries = Array.from(agentDecisions.entries());
    for (const [agentId, decision] of decisionEntries) {
      this.actionResolver.resolveDecision(agentId, decision);
    }

    // Resolve the challenge based on type
    let _result: ChallengeResult;

    switch (challengeParams.type) {
      case 'prisoners_dilemma': {
        const choices: Record<string, 'cooperate' | 'defect'> = {};
        for (const [agentId, decision] of decisionEntries) {
          const choice = decision.action.parameters?.choice;
          choices[agentId] =
            (choice as 'cooperate' | 'defect') ?? 'cooperate';
        }
        _result = this.challengeEngine.resolvePrisonersDilemma(
          choices,
          challengeParams.pairings ?? []
        );
        break;
      }
      case 'information_auction': {
        const bids: Record<string, number> = {};
        for (const [agentId, decision] of decisionEntries) {
          const bid = decision.action.parameters?.bid as number | undefined;
          if (bid !== undefined && bid > 0) {
            bids[agentId] = bid;
          }
        }
        _result = this.challengeEngine.resolveInformationAuction(
          bids,
          challengeParams.auctionItem ?? 'Unknown intel'
        );
        break;
      }
      case 'the_ambassador': {
        const ambassadorId = challengeParams.ambassadorId;
        if (ambassadorId) {
          const ambassadorDecision = agentDecisions.get(ambassadorId);
          const success =
            (ambassadorDecision?.action.parameters?.success as boolean) ?? false;
          _result = this.challengeEngine.resolveAmbassador(
            ambassadorId,
            success
          );
        } else {
          _result = { type: 'the_ambassador', outcomes: {} };
        }
        break;
      }
      case 'the_sacrifice': {
        const allianceId = challengeParams.sacrificeAllianceId;
        if (allianceId) {
          // Find if anyone volunteered
          let volunteerId: string | null = null;
          const alliance = state.alliances.find((a) => a.id === allianceId);
          if (alliance) {
            for (const memberId of alliance.members) {
              const decision = agentDecisions.get(memberId);
              const volId = decision?.action.parameters?.volunteerId as string | undefined;
              if (volId === memberId) {
                volunteerId = memberId;
                break;
              }
            }
          }
          _result = this.challengeEngine.resolveSacrifice(
            allianceId,
            volunteerId
          );
        } else {
          _result = { type: 'the_sacrifice', outcomes: {} };
        }
        break;
      }
      case 'liars_court': {
        const claims: Record<string, { claim: string; isTrue: boolean }> = {};
        const votes: Record<string, Record<string, boolean>> = {};

        for (const [agentId, decision] of decisionEntries) {
          const claimData = decision.action.parameters?.claim as
            | { claim: string; isTrue: boolean }
            | undefined;
          if (claimData) {
            claims[agentId] = claimData;
          }
          const voteData = decision.action.parameters?.votes as
            | Record<string, boolean>
            | undefined;
          if (voteData) {
            votes[agentId] = voteData;
          }
        }
        _result = this.challengeEngine.resolveLiarsCourt(claims, votes);
        break;
      }
      default: {
        _result = { type: challengeParams.type, outcomes: {} };
      }
    }

    // Clear challenge params
    (this.stateManager.getState() as any).challengeParams = undefined;

    // Advance to COUNCIL phase
    this.stateManager.advancePhase();
    this.emitUpdate();
  }

  /**
   * Run the COUNCIL phase. Each surviving agent votes to eliminate one agent.
   * Returns the council vote result including who was eliminated.
   */
  async runCouncilPhase(
    agentVotes: Map<string, string>
  ): Promise<CouncilVote> {
    const currentPhase = this.stateManager.getCurrentPhase();
    if (currentPhase !== 'COUNCIL') {
      while (this.stateManager.getCurrentPhase() !== 'COUNCIL') {
        this.stateManager.advancePhase();
        if (this.stateManager.getCurrentPhase() === 'FINAL_THREE') break;
      }
    }

    // Cast all votes
    const voteEntries = Array.from(agentVotes.entries());
    for (const [voterId, targetId] of voteEntries) {
      this.stateManager.castVote(voterId, targetId);
    }

    // Resolve the council vote
    const councilResult = this.stateManager.resolveCouncilVote();

    // Update rankings after elimination
    this.stateManager.updateRankings();

    // Advance to RECKONING phase
    this.stateManager.advancePhase();
    this.emitUpdate();

    return councilResult;
  }

  /**
   * Run the RECKONING phase. Post-council events, drama, and ghost jury lobbying.
   * The reckoning is primarily narrative — ghosts may send messages.
   */
  async runReckoningPhase(): Promise<void> {
    const currentPhase = this.stateManager.getCurrentPhase();
    if (currentPhase !== 'RECKONING') {
      while (this.stateManager.getCurrentPhase() !== 'RECKONING') {
        this.stateManager.advancePhase();
        if (this.stateManager.getCurrentPhase() === 'FINAL_THREE') break;
      }
    }

    const state = this.stateManager.getState();

    // Ghost jury members send 1 public message per round (spec requirement)
    for (const juror of state.ghostJury) {
      const lobbyMsg = `[Ghost ${juror.name}] The jury is watching. Round ${state.roundNumber} decisions will be remembered.`;
      this.stateManager.createMessage(juror.agentId, 'ghost', lobbyMsg);
      juror.lobbyMessages.push(lobbyMsg);
    }

    // Wildcard event triggers at round 3 (spec: Social 3, ~55min mark)
    if (state.roundNumber === 3 && !state.wildcardActive) {
      const wildcardIndex = Math.floor(Math.random() * WILDCARD_EVENTS.length);
      const wildcard = WILDCARD_EVENTS[wildcardIndex];
      const wildcardEvent = {
        id: `wildcard_${state.roundNumber}_${Date.now()}`,
        name: wildcard.name,
        description: wildcard.description,
        effect: wildcard.effect,
        triggeredAtRound: state.roundNumber,
        duration: 1,
      };
      (this.stateManager.getState() as any).wildcardActive = wildcardEvent;
    }

    // Check for alliance trust decay (natural entropy)
    for (const alliance of state.alliances) {
      // Alliances lose 5 trust per round naturally
      this.stateManager.updateAllianceTrust(alliance.id, -5);
    }

    // Advance to the next round's SOCIAL phase
    this.stateManager.advancePhase();
    this.emitUpdate();
  }

  /**
   * Run the FINAL_THREE phase. The last 3 surviving agents face the ghost jury.
   * Each ghost jury member votes for who should win. Returns the winner.
   */
  async runFinalThree(): Promise<{
    winner: string;
    juryVotes: Array<{ jurorId: string; jurorName: string; votedFor: string }>;
  }> {
    const state = this.stateManager.getState();
    const survivingIds = this.stateManager.getSurvivingAgentIds();
    const juryVotes: Array<{
      jurorId: string;
      jurorName: string;
      votedFor: string;
    }> = [];

    // Closing arguments: each finalist makes a public speech (spec requirement)
    for (const finalistId of survivingIds) {
      const finalist = state.agents[finalistId];
      if (finalist) {
        this.stateManager.createMessage(
          finalistId,
          'public',
          `[CLOSING ARGUMENT] ${finalist.name} addresses the Ghost Jury for the final vote.`
        );
      }
    }

    // Collect jury votes
    for (const juror of state.ghostJury) {
      if (juror.finalVote && survivingIds.includes(juror.finalVote)) {
        juryVotes.push({
          jurorId: juror.agentId,
          jurorName: juror.name,
          votedFor: juror.finalVote,
        });
      }
    }

    // If no jury votes were pre-set, auto-assign based on VERITAS
    if (juryVotes.length === 0 && state.ghostJury.length > 0) {
      const sortedSurvivors = survivingIds
        .map((id) => ({
          id,
          veritas: state.veritasScores[id] ?? 500,
          influence: state.agents[id]?.influencePoints ?? 0,
        }))
        .sort((a, b) => {
          const vDiff = b.veritas - a.veritas;
          return vDiff !== 0 ? vDiff : b.influence - a.influence;
        });

      for (const juror of state.ghostJury) {
        // Jurors tend to vote for the highest VERITAS but with some variance
        // based on their elimination round (later eliminations may be more bitter)
        const preferredIndex = juror.eliminatedRound % sortedSurvivors.length;
        const votedFor =
          sortedSurvivors[preferredIndex]?.id ?? sortedSurvivors[0]?.id;
        if (votedFor) {
          juryVotes.push({
            jurorId: juror.agentId,
            jurorName: juror.name,
            votedFor,
          });
        }
      }
    }

    // Tally jury votes
    const voteCounts: Record<string, number> = {};
    for (const vote of juryVotes) {
      voteCounts[vote.votedFor] = (voteCounts[vote.votedFor] || 0) + 1;
    }

    // Find winner
    const maxVotes = Math.max(0, ...Object.values(voteCounts));
    const topCandidates = Object.entries(voteCounts)
      .filter(([, count]) => count === maxVotes)
      .map(([id]) => id);

    let winner: string;
    if (topCandidates.length === 1) {
      winner = topCandidates[0];
    } else {
      // Tiebreak: highest combined VERITAS + influence
      winner = topCandidates.sort((a, b) => {
        const aScore =
          (state.veritasScores[a] ?? 0) +
          (state.agents[a]?.influencePoints ?? 0);
        const bScore =
          (state.veritasScores[b] ?? 0) +
          (state.agents[b]?.influencePoints ?? 0);
        return bScore - aScore;
      })[0];
    }

    // Mark the match as completed
    (this.stateManager.getState() as any).status = 'COMPLETED';

    this.emitUpdate();

    return { winner, juryVotes };
  }

  // ---------------------------------------------------------------------------
  // Context assembly for external LLM calls
  // ---------------------------------------------------------------------------

  /**
   * Build the system prompt and user message for a given agent.
   * Used by external code to call Claude for agent decisions.
   */
  assembleContextForAgent(agentId: string): {
    systemPrompt: string;
    userMessage: string;
  } | null {
    const agentConfig = this.agents.find((a) => a.id === agentId);
    if (!agentConfig) return null;

    return assembleSocialContext(
      agentId,
      agentConfig.name,
      agentConfig.personality,
      agentConfig.mbti,
      agentConfig.enneagram,
      agentConfig.flaw,
      agentConfig.skills,
      this.stateManager.getState()
    );
  }

  // ---------------------------------------------------------------------------
  // State access
  // ---------------------------------------------------------------------------

  getState(): SocialGameState {
    return this.stateManager.getState();
  }

  /** True when 3 or fewer agents remain (triggers FINAL_THREE). */
  isMatchOver(): boolean {
    const survivingCount = this.stateManager.getSurvivingAgentIds().length;
    return (
      survivingCount <= 3 ||
      this.stateManager.getState().phase === 'FINAL_THREE'
    );
  }

  /** Run a complete round: SOCIAL -> CHALLENGE -> COUNCIL -> RECKONING. */
  async runFullRound(
    socialDecisions: Map<string, AgentDecision>,
    challengeDecisions: Map<string, AgentDecision>,
    councilVotes: Map<string, string>
  ): Promise<{
    councilResult: CouncilVote;
    isOver: boolean;
    state: SocialGameState;
  }> {
    const emptyCouncilResult: CouncilVote = {
      round: this.stateManager.getState().roundNumber,
      votes: {},
      result: {
        eliminatedAgentId: '',
        voteBreakdown: {},
        wasTiebreak: false,
      },
    };

    await this.runSocialPhase(socialDecisions);

    if (this.isMatchOver()) {
      return {
        councilResult: emptyCouncilResult,
        isOver: true,
        state: this.getState(),
      };
    }

    await this.runChallengePhase(challengeDecisions);

    if (this.isMatchOver()) {
      return {
        councilResult: emptyCouncilResult,
        isOver: true,
        state: this.getState(),
      };
    }

    const councilResult = await this.runCouncilPhase(councilVotes);

    if (this.isMatchOver()) {
      return {
        councilResult,
        isOver: true,
        state: this.getState(),
      };
    }

    await this.runReckoningPhase();

    return {
      councilResult,
      isOver: this.isMatchOver(),
      state: this.getState(),
    };
  }
}
