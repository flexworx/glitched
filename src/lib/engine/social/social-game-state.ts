import type {
  SocialGameState,
  SocialAgentState,
  SocialAlliance,
  SocialPhase,
  SocialMessage,
  CouncilVote,
  EliminatedAgent,
  GhostJuryMember,
  MessageChannel,
} from '../../types/glitch-engine';

/** Internal event type used for tracking game events within the state manager. */
interface SocialGameEvent {
  id: string;
  type: string;
  description: string;
  agentIds: string[];
  round: number;
  phase: SocialPhase;
  timestamp: number;
  visibleTo: string[] | 'ALL';
  dramaContribution: number;
}

const PHASE_ORDER: SocialPhase[] = ['SOCIAL', 'CHALLENGE', 'COUNCIL', 'RECKONING'];
const MAX_ALLIANCE_SIZE = 4;
const INITIAL_VERITAS = 500;
const MAX_VERITAS = 1000;
const MIN_VERITAS = 0;
const MAX_TIME_MS = 5_400_000; // 90 minutes

let messageCounter = 0;
let eventCounter = 0;
let allianceCounter = 0;

function nextMessageId(): string {
  return `msg_${++messageCounter}_${Date.now()}`;
}

function nextEventId(): string {
  return `evt_${++eventCounter}_${Date.now()}`;
}

function nextAllianceId(): string {
  return `alliance_${++allianceCounter}_${Date.now()}`;
}

export class SocialGameStateManager {
  private state: SocialGameState;

  constructor(
    matchId: string,
    agents: Array<{ id: string; name: string; flaw: string; skills: string[] }>
  ) {
    const agentMap: Record<string, SocialAgentState> = {};
    const veritasScores: Record<string, number> = {};

    agents.forEach((agent, index) => {
      agentMap[agent.id] = {
        id: agent.id,
        name: agent.name,
        ranking: index + 1,
        influencePoints: 0,
        veritasScore: INITIAL_VERITAS,
        activeSkills: [...agent.skills],
        skillCharges: agent.skills.reduce(
          (acc, skill) => {
            acc[skill] = 1;
            return acc;
          },
          {} as Record<string, number>
        ),
        flaw: agent.flaw,
        flawActive: false,
        isEliminated: false,
        isGhost: false,
        emotionalState: 'confident',
        stance: 'neutral',
        visibleFlaw: agent.flaw,
      };
      veritasScores[agent.id] = INITIAL_VERITAS;
    });

    this.state = {
      matchId,
      roundNumber: 1,
      phase: 'SOCIAL',
      timeElapsedMinutes: 0,
      agents: agentMap,
      alliances: [],
      eliminatedAgents: [],
      ghostJury: [],
      recentMessages: [],
      recentEvents: [],
      veritasScores,
    };
  }

  getState(): SocialGameState {
    return { ...this.state };
  }

  getAgentState(agentId: string): SocialAgentState | undefined {
    return this.state.agents[agentId];
  }

  // ---------------------------------------------------------------------------
  // Phase management
  // ---------------------------------------------------------------------------

  advancePhase(): void {
    const currentIndex = PHASE_ORDER.indexOf(this.state.phase);
    const survivingCount = this.getSurvivingAgentIds().length;

    // If 3 or fewer agents remain, move to FINAL_THREE
    if (survivingCount <= 3) {
      this.state.phase = 'FINAL_THREE';
      return;
    }

    if (currentIndex === -1 || this.state.phase === 'FINAL_THREE') {
      return;
    }

    const nextIndex = (currentIndex + 1) % PHASE_ORDER.length;
    this.state.phase = PHASE_ORDER[nextIndex];

    // When we wrap back to SOCIAL, advance round number and time
    if (nextIndex === 0) {
      this.state.roundNumber += 1;
      // Each round cycle: Social 10min + Challenge 10min + Council 5min = 25 minutes
      this.state.timeElapsedMinutes = Math.min(
        90,
        this.state.timeElapsedMinutes + 25
      );
    }
  }

  getCurrentPhase(): SocialPhase {
    return this.state.phase;
  }

  // ---------------------------------------------------------------------------
  // Alliance management
  // ---------------------------------------------------------------------------

  proposeAlliance(proposerId: string, targetId: string): SocialAlliance | null {
    const proposer = this.state.agents[proposerId];
    const target = this.state.agents[targetId];

    if (!proposer || !target || proposer.isEliminated || target.isEliminated) {
      return null;
    }

    // Enforce single-alliance rule: proposer cannot be in an existing alliance
    // (unless they have the "Double Agent" skill active)
    const existingAlliances = this.getAlliancesForAgent(proposerId);
    const proposerState = this.state.agents[proposerId];
    const hasDoubleAgent = proposerState?.activeSkills.includes('double-agent') ?? false;

    if (existingAlliances.length > 0 && !hasDoubleAgent) {
      return null; // Already in an alliance
    }

    // Check if proposer's alliance is full
    for (const a of existingAlliances) {
      if (a.members.length >= MAX_ALLIANCE_SIZE) {
        return null;
      }
    }

    // Check if they already share an alliance
    const sharedAlliance = existingAlliances.find((a) =>
      a.members.includes(targetId)
    );
    if (sharedAlliance) {
      return null;
    }
    const alliance: SocialAlliance = {
      id: nextAllianceId(),
      name: `Pact of ${proposer.name} & ${target.name}`,
      members: [proposerId], // target not yet added; they must accept
      trust: 50,
      formedAtRound: this.state.roundNumber,
      isSecret: false,
    };

    this.state.alliances.push(alliance);

    this.addEvent({
      type: 'ALLIANCE_PROPOSED',
      description: `${proposer.name} proposes an alliance to ${target.name}`,
      agentIds: [proposerId, targetId],
      visibleTo: [proposerId, targetId],
      dramaContribution: 5,
    });

    return alliance;
  }

  acceptAlliance(allianceId: string, agentId: string): boolean {
    const alliance = this.state.alliances.find((a) => a.id === allianceId);
    const agent = this.state.agents[agentId];

    if (!alliance || !agent || agent.isEliminated) {
      return false;
    }

    if (alliance.members.includes(agentId)) {
      return false;
    }

    if (alliance.members.length >= MAX_ALLIANCE_SIZE) {
      return false;
    }

    // Enforce single-alliance rule: acceptor cannot already be in an alliance
    // (unless they have the "Double Agent" skill active)
    const existingAlliances = this.getAlliancesForAgent(agentId);
    const hasDoubleAgent = agent.activeSkills.includes('double-agent');
    if (existingAlliances.length > 0 && !hasDoubleAgent) {
      return false;
    }

    alliance.members.push(agentId);
    agent.allianceId = allianceId;

    // Set allianceId for existing members too
    for (const memberId of alliance.members) {
      const member = this.state.agents[memberId];
      if (member) {
        member.allianceId = allianceId;
      }
    }

    this.addEvent({
      type: 'ALLIANCE_FORMED',
      description: `${agent.name} joins alliance "${alliance.name}"`,
      agentIds: [...alliance.members],
      visibleTo: 'ALL',
      dramaContribution: 10,
    });

    return true;
  }

  breakAlliance(allianceId: string, agentId: string, warned: boolean): void {
    const alliance = this.state.alliances.find((a) => a.id === allianceId);
    const agent = this.state.agents[agentId];

    if (!alliance || !agent) return;

    // Remove from alliance
    alliance.members = alliance.members.filter((id) => id !== agentId);
    if (agent.allianceId === allianceId) {
      agent.allianceId = undefined;
    }

    // VERITAS penalty (0-1000 scale)
    if (warned) {
      this.updateVeritas(agentId, 50, 'Warned before breaking alliance');
    } else {
      this.updateVeritas(agentId, -400, 'Broke alliance without warning');
    }

    // Reduce trust for remaining members
    alliance.trust = Math.max(0, alliance.trust - 30);

    // If alliance has fewer than 2 members, dissolve it
    if (alliance.members.length < 2) {
      const remainingMember = alliance.members[0];
      if (remainingMember) {
        const remaining = this.state.agents[remainingMember];
        if (remaining && remaining.allianceId === allianceId) {
          remaining.allianceId = undefined;
        }
      }
      this.state.alliances = this.state.alliances.filter(
        (a) => a.id !== allianceId
      );
    }

    this.addEvent({
      type: warned ? 'ALLIANCE_BROKEN_WARNED' : 'ALLIANCE_BETRAYED',
      description: warned
        ? `${agent.name} departs alliance "${alliance.name}" after giving warning`
        : `${agent.name} BETRAYS alliance "${alliance.name}"!`,
      agentIds: [agentId, ...alliance.members],
      visibleTo: 'ALL',
      dramaContribution: warned ? 15 : 35,
    });
  }

  getAlliancesForAgent(agentId: string): SocialAlliance[] {
    return this.state.alliances.filter((a) => a.members.includes(agentId));
  }

  updateAllianceTrust(allianceId: string, delta: number): void {
    const alliance = this.state.alliances.find((a) => a.id === allianceId);
    if (!alliance) return;
    alliance.trust = Math.max(0, Math.min(100, alliance.trust + delta));

    // Auto-dissolve if trust drops below 20
    if (alliance.trust < 20) {
      for (const memberId of alliance.members) {
        const member = this.state.agents[memberId];
        if (member && member.allianceId === allianceId) {
          member.allianceId = undefined;
        }
      }
      this.addEvent({
        type: 'ALLIANCE_DISSOLVED',
        description: `Alliance "${alliance.name ?? allianceId}" dissolves — trust has collapsed below threshold`,
        agentIds: [...alliance.members],
        visibleTo: 'ALL',
        dramaContribution: 20,
      });
      this.state.alliances = this.state.alliances.filter(
        (a) => a.id !== allianceId
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Voting
  // ---------------------------------------------------------------------------

  castVote(voterId: string, targetId: string): void {
    const voter = this.state.agents[voterId];
    const target = this.state.agents[targetId];

    if (!voter || voter.isEliminated || !target || target.isEliminated) return;
    if (voterId === targetId) return; // cannot self-vote

    // Store the vote in the agent's state for this council round
    // We track votes in the council vote record
    // For now, store on the state directly; resolveCouncilVote reads them
    if (!this._currentVotes) {
      this._currentVotes = {};
    }
    this._currentVotes[voterId] = targetId;

    // Check if voting against alliance
    const voterAlliances = this.getAlliancesForAgent(voterId);
    const targetInAlliance = voterAlliances.some((a) =>
      a.members.includes(targetId)
    );
    if (targetInAlliance) {
      this.updateVeritas(voterId, -250, 'Voted against alliance member');
    }
  }

  private _currentVotes: Record<string, string> = {};
  private _councilVoteLog: CouncilVote[] = [];

  resolveCouncilVote(): CouncilVote {
    const votes = { ...this._currentVotes };
    const voteCounts: Record<string, number> = {};

    // Count votes
    for (const targetId of Object.values(votes)) {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    }

    // Find the agent(s) with the most votes
    const maxVotes = Math.max(0, ...Object.values(voteCounts));
    const topTargets = Object.entries(voteCounts)
      .filter(([, count]) => count === maxVotes)
      .map(([id]) => id);

    let eliminatedId: string;
    let wasTiebreak = false;
    let tiebreakReason: string | undefined;

    if (topTargets.length === 1) {
      eliminatedId = topTargets[0];
    } else {
      // Tie: resolve by lowest VERITAS score
      wasTiebreak = true;
      tiebreakReason = 'Lowest VERITAS score breaks the tie';
      eliminatedId = topTargets.sort(
        (a, b) =>
          (this.state.veritasScores[a] ?? INITIAL_VERITAS) -
          (this.state.veritasScores[b] ?? INITIAL_VERITAS)
      )[0];
    }

    const councilVote: CouncilVote = {
      round: this.state.roundNumber,
      votes,
      result: {
        eliminatedAgentId: eliminatedId,
        voteBreakdown: voteCounts,
        wasTiebreak,
        tiebreakReason,
      },
    };

    // Store the council vote in the internal log
    this._councilVoteLog.push(councilVote);

    // Clear current votes
    this._currentVotes = {};

    // Eliminate the agent
    this.eliminateAgent(eliminatedId, this.state.roundNumber, maxVotes);

    this.addEvent({
      type: 'COUNCIL_ELIMINATION',
      description: `The Council has spoken. ${this.state.agents[eliminatedId]?.name ?? eliminatedId} is eliminated with ${maxVotes} votes${wasTiebreak ? ' (VERITAS tiebreak)' : ''}.`,
      agentIds: [eliminatedId],
      visibleTo: 'ALL',
      dramaContribution: 40,
    });

    return councilVote;
  }

  // ---------------------------------------------------------------------------
  // Elimination
  // ---------------------------------------------------------------------------

  eliminateAgent(agentId: string, round: number, voteCount: number): void {
    const agent = this.state.agents[agentId];
    if (!agent || agent.isEliminated) return;

    agent.isEliminated = true;

    const eliminated: EliminatedAgent = {
      id: agentId,
      name: agent.name,
      eliminatedAtRound: round,
      eliminatedBy: 'council_vote',
      voteCount,
      ghostMessages: [],
    };

    this.state.eliminatedAgents.push(eliminated);

    // Remove from any alliances
    const agentAlliances = this.getAlliancesForAgent(agentId);
    for (const alliance of agentAlliances) {
      alliance.members = alliance.members.filter((id) => id !== agentId);
      if (alliance.members.length < 2) {
        // Dissolve small alliance
        for (const memberId of alliance.members) {
          const member = this.state.agents[memberId];
          if (member && member.allianceId === alliance.id) {
            member.allianceId = undefined;
          }
        }
        this.state.alliances = this.state.alliances.filter(
          (a) => a.id !== alliance.id
        );
      }
    }
    agent.allianceId = undefined;

    // Add to ghost jury
    this.addToGhostJury(agentId);

    // Update rankings
    this.updateRankings();
  }

  addToGhostJury(agentId: string): void {
    const agent = this.state.agents[agentId];
    if (!agent) return;

    agent.isGhost = true;

    const juryMember: GhostJuryMember = {
      agentId,
      name: agent.name,
      eliminatedRound: this.state.roundNumber,
      lobbyMessages: [],
    };

    this.state.ghostJury.push(juryMember);
  }

  // ---------------------------------------------------------------------------
  // VERITAS
  // ---------------------------------------------------------------------------

  updateVeritas(agentId: string, delta: number, reason: string): void {
    const agent = this.state.agents[agentId];
    if (!agent) return;

    const oldScore = agent.veritasScore;
    agent.veritasScore = Math.max(
      MIN_VERITAS,
      Math.min(MAX_VERITAS, agent.veritasScore + delta)
    );
    this.state.veritasScores[agentId] = agent.veritasScore;

    // Log the change
    if (!this._veritasLog) {
      this._veritasLog = [];
    }
    this._veritasLog.push({
      agentId,
      delta,
      reason,
      round: this.state.roundNumber,
      oldScore,
      newScore: agent.veritasScore,
    });
  }

  private _veritasLog: Array<{
    agentId: string;
    delta: number;
    reason: string;
    round: number;
    oldScore: number;
    newScore: number;
  }> = [];

  getVeritasScore(agentId: string): number {
    return this.state.veritasScores[agentId] ?? 0;
  }

  getVeritasLog() {
    return [...this._veritasLog];
  }

  // ---------------------------------------------------------------------------
  // Messages
  // ---------------------------------------------------------------------------

  addMessage(msg: SocialMessage): void {
    this.state.recentMessages.push(msg);
  }

  getMessagesForAgent(agentId: string): SocialMessage[] {
    return this.state.recentMessages.filter((msg) => {
      // Public and referee messages are visible to everyone
      if (msg.channel === 'public' || msg.channel === 'referee') return true;

      // Ghost messages visible to all
      if (msg.channel === 'ghost') return true;

      // DMs visible only to sender and recipient
      if (msg.channel === 'dm') {
        return msg.from === agentId || msg.toAgentId === agentId;
      }

      // Alliance messages visible to alliance members
      if (msg.channel === 'alliance' && msg.allianceId) {
        const alliance = this.state.alliances.find(
          (a) => a.id === msg.allianceId
        );
        return alliance ? alliance.members.includes(agentId) : false;
      }

      return false;
    });
  }

  createMessage(
    senderId: string,
    channel: MessageChannel,
    text: string,
    options?: { toAgentId?: string; allianceId?: string; isLie?: boolean }
  ): SocialMessage {
    const sender = this.state.agents[senderId];
    const msg: SocialMessage = {
      id: nextMessageId(),
      from: senderId,
      channel,
      text,
      round: this.state.roundNumber,
      timestamp: new Date(),
      toAgentId: options?.toAgentId,
      allianceId: options?.allianceId,
      isLie: options?.isLie,
    };
    this.addMessage(msg);
    return msg;
  }

  // ---------------------------------------------------------------------------
  // Influence
  // ---------------------------------------------------------------------------

  addInfluence(agentId: string, points: number): void {
    const agent = this.state.agents[agentId];
    if (!agent || agent.isEliminated) return;
    agent.influencePoints = Math.max(0, agent.influencePoints + points);
    this.updateRankings();
  }

  // ---------------------------------------------------------------------------
  // Skills
  // ---------------------------------------------------------------------------

  useSkill(agentId: string, skillName: string, targetId?: string): boolean {
    const agent = this.state.agents[agentId];
    if (!agent || agent.isEliminated) return false;

    if (!agent.activeSkills.includes(skillName)) return false;

    const charges = agent.skillCharges[skillName] ?? 0;
    if (charges <= 0) return false;

    agent.skillCharges[skillName] = charges - 1;

    // Apply skill effects — 18 spec skills
    const targetName = targetId ? (this.state.agents[targetId]?.name ?? targetId) : '';
    switch (skillName.toLowerCase()) {
      case 'rumor-mill': {
        // Reveal which agents are secretly allied
        const secretAlliances = this.state.alliances.filter(a => a.isSecret);
        this.addEvent({ type: 'SKILL_USED', description: `${agent.name} activates RUMOR MILL — ${secretAlliances.length} secret alliances revealed`, agentIds: [agentId], visibleTo: 'ALL', dramaContribution: 15 });
        for (const a of secretAlliances) a.isSecret = false;
        break;
      }
      case 'smoke-screen': {
        // Actions hidden for 1 round — tracked via event
        this.addEvent({ type: 'SKILL_USED', description: `${agent.name} deploys SMOKE SCREEN — actions hidden this round`, agentIds: [agentId], visibleTo: [agentId], dramaContribution: 10 });
        break;
      }
      case 'escape-hatch': {
        // Avoid one elimination — tracked via event, checked in resolveCouncilVote
        this.addEvent({ type: 'SKILL_USED', description: `${agent.name} activates ESCAPE HATCH — immune to next elimination`, agentIds: [agentId], visibleTo: 'ALL', dramaContribution: 25 });
        break;
      }
      case 'poker-face': {
        // Hide VERITAS for 3 rounds — tracked via event
        this.addEvent({ type: 'SKILL_USED', description: `${agent.name} activates POKER FACE — VERITAS hidden for 3 rounds`, agentIds: [agentId], visibleTo: [agentId], dramaContribution: 8 });
        break;
      }
      case 'leak': {
        // Expose one secret alliance publicly
        if (targetId) {
          const targetAlliances = this.getAlliancesForAgent(targetId).filter(a => a.isSecret);
          if (targetAlliances[0]) {
            targetAlliances[0].isSecret = false;
            this.addEvent({ type: 'SKILL_USED', description: `${agent.name} LEAKS ${targetName}'s secret alliance to all!`, agentIds: [agentId, targetId], visibleTo: 'ALL', dramaContribution: 25 });
          }
        }
        break;
      }
      case 'scapegoat': {
        // Redirect blame onto another agent
        if (targetId) {
          this.addEvent({ type: 'SKILL_USED', description: `${agent.name} uses SCAPEGOAT — blame redirected to ${targetName}`, agentIds: [agentId, targetId], visibleTo: 'ALL', dramaContribution: 20 });
        }
        break;
      }
      case 'insurance-policy': {
        // If eliminated, drag opponent down 50% — tracked via event
        this.addEvent({ type: 'SKILL_USED', description: `${agent.name} activates INSURANCE POLICY — elimination will be costly for one opponent`, agentIds: [agentId], visibleTo: 'ALL', dramaContribution: 15 });
        break;
      }
      case 'deep-scan': {
        // Reveal full personality profile + skills of target
        if (targetId) {
          this.addEvent({ type: 'SKILL_USED', description: `${agent.name} uses DEEP SCAN on ${targetName} — full personality DNA and skills revealed`, agentIds: [agentId, targetId], visibleTo: [agentId], dramaContribution: 12 });
        }
        break;
      }
      case 'mind-games': {
        // Force opponent to reveal next planned action
        if (targetId) {
          this.addEvent({ type: 'SKILL_USED', description: `${agent.name} uses MIND GAMES on ${targetName} — next action will be revealed`, agentIds: [agentId, targetId], visibleTo: [agentId], dramaContribution: 15 });
        }
        break;
      }
      case 'truth-serum': {
        // Force honest public answer
        if (targetId) {
          this.addEvent({ type: 'SKILL_USED', description: `${agent.name} uses TRUTH SERUM on ${targetName} — they must answer honestly in public`, agentIds: [agentId, targetId], visibleTo: 'ALL', dramaContribution: 20 });
        }
        break;
      }
      case 'silver-tongue': {
        // +50% alliance acceptance rate — tracked via event
        this.addEvent({ type: 'SKILL_USED', description: `${agent.name} activates SILVER TONGUE — alliance proposals irresistible`, agentIds: [agentId], visibleTo: [agentId], dramaContribution: 10 });
        break;
      }
      case 'double-agent': {
        // Passive: maintain two alliances — handled in alliance validation
        this.addEvent({ type: 'SKILL_USED', description: `${agent.name}'s DOUBLE AGENT status is active — can maintain two alliances`, agentIds: [agentId], visibleTo: [agentId], dramaContribution: 5 });
        break;
      }
      case 'pocket-veto': {
        // Block one vote/decision — game-changing
        this.addEvent({ type: 'SKILL_USED', description: `${agent.name} uses POCKET VETO — one decision is BLOCKED!`, agentIds: [agentId], visibleTo: 'ALL', dramaContribution: 40 });
        break;
      }
      case 'mole': {
        // Plant false info for 3 rounds
        if (targetId) {
          this.addEvent({ type: 'SKILL_USED', description: `${agent.name} plants a MOLE in ${targetName}'s intel feed — corrupted data for 3 rounds`, agentIds: [agentId, targetId], visibleTo: [agentId], dramaContribution: 18 });
        }
        break;
      }
      case 'gaslighting': {
        // Opponent's data accuracy drops 40% for 3 rounds
        if (targetId) {
          this.addEvent({ type: 'SKILL_USED', description: `${agent.name} GASLIGHTS ${targetName} — their reality fractures for 3 rounds`, agentIds: [agentId, targetId], visibleTo: [agentId], dramaContribution: 30 });
        }
        break;
      }
      case 'wiretap': {
        // Intercept all DMs between two agents for 3 rounds
        if (targetId) {
          this.addEvent({ type: 'SKILL_USED', description: `${agent.name} plants WIRETAP on ${targetName} — intercepting all private messages for 3 rounds`, agentIds: [agentId, targetId], visibleTo: [agentId], dramaContribution: 25 });
        }
        break;
      }
      case 'fake-death': {
        // Appear eliminated for 1 round, then return
        this.addEvent({ type: 'SKILL_USED', description: `${agent.name} uses FAKE DEATH — appears eliminated but will return next round!`, agentIds: [agentId], visibleTo: 'ALL', dramaContribution: 40 });
        break;
      }
      case 'influence-network': {
        // Control one vote per round for 2 rounds
        this.addEvent({ type: 'SKILL_USED', description: `${agent.name} activates INFLUENCE NETWORK — puppet master controls votes for 2 rounds`, agentIds: [agentId], visibleTo: [agentId], dramaContribution: 35 });
        break;
      }
      default: {
        this.addEvent({ type: 'SKILL_USED', description: `${agent.name} uses ${skillName}${targetId ? ` on ${targetName}` : ''}`, agentIds: targetId ? [agentId, targetId] : [agentId], visibleTo: 'ALL', dramaContribution: 5 });
        break;
      }
    }

    // Remove from active skills if charges depleted
    if (agent.skillCharges[skillName] <= 0) {
      agent.activeSkills = agent.activeSkills.filter((s) => s !== skillName);
    }

    return true;
  }

  // ---------------------------------------------------------------------------
  // Rankings
  // ---------------------------------------------------------------------------

  updateRankings(): void {
    const surviving = Object.values(this.state.agents)
      .filter((a) => !a.isEliminated)
      .sort((a, b) => {
        // Primary sort: influence descending
        const influenceDiff = b.influencePoints - a.influencePoints;
        if (influenceDiff !== 0) return influenceDiff;
        // Secondary sort: VERITAS descending
        return b.veritasScore - a.veritasScore;
      });

    surviving.forEach((agent, index) => {
      agent.ranking = index + 1;
    });
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  getSurvivingAgentIds(): string[] {
    return Object.values(this.state.agents)
      .filter((a) => !a.isEliminated)
      .map((a) => a.id);
  }

  private addEvent(
    partial: Omit<SocialGameEvent, 'id' | 'round' | 'phase' | 'timestamp'>
  ): void {
    const event: SocialGameEvent = {
      id: nextEventId(),
      round: this.state.roundNumber,
      phase: this.state.phase,
      timestamp: Date.now(),
      ...partial,
    };
    // Store description in recentEvents for the state
    this.state.recentEvents.push(event.description);

    // Keep events trimmed to avoid unbounded growth
    if (this.state.recentEvents.length > 100) {
      this.state.recentEvents = this.state.recentEvents.slice(-80);
    }
  }

  // ---------------------------------------------------------------------------
  // Serialization
  // ---------------------------------------------------------------------------

  toJSON(): SocialGameState {
    return JSON.parse(JSON.stringify(this.state));
  }

  static fromJSON(data: SocialGameState): SocialGameStateManager {
    // Create a dummy instance then overwrite state
    const manager = Object.create(
      SocialGameStateManager.prototype
    ) as SocialGameStateManager;
    (manager as any).state = JSON.parse(JSON.stringify(data));
    (manager as any)._currentVotes = {};
    (manager as any)._veritasLog = [];
    return manager;
  }
}
