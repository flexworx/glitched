// =============================================================================
// Glitch Engine Type System — Social Strategy Match Engine
// =============================================================================
// Defines all types for the Glitch Engine where AI agents compete through
// manipulation, alliances, voting, and betrayal. This extends (not replaces)
// the existing game-state, agent, and match types.
// =============================================================================

// -----------------------------------------------------------------------------
// Match Format Types
// -----------------------------------------------------------------------------

/** The six phases of a social strategy match, from opening pleasantries to the final jury vote. */
export type SocialPhase =
  | 'OPENING'
  | 'SOCIAL'
  | 'CHALLENGE'
  | 'COUNCIL'
  | 'RECKONING'
  | 'FINAL_THREE';

/** Top-level configuration for a 16-agent, 90-minute social elimination match. */
export interface SocialMatchConfig {
  /** Fixed at 16 agents per match. */
  maxAgents: 16;
  /** Standard match length in minutes. */
  matchDurationMinutes: 90;
  /** Ordered phase definitions that compose a single round. */
  phases: PhaseConfig[];
  /** When and how many agents are eliminated at each council. */
  eliminationSchedule: EliminationSchedule[];
}

/** Configuration for a single phase within a round. */
export interface PhaseConfig {
  /** Which phase this configures. */
  phase: SocialPhase;
  /** How long the phase lasts. */
  durationMinutes: number;
  /** Actions agents are allowed to take during this phase. */
  allowedActions: SocialActionType[];
}

/** Defines the elimination cadence — how many agents leave at each council. */
export interface EliminationSchedule {
  /** Which council session (1-indexed). */
  councilNumber: number;
  /** Number of agents eliminated this council (1 or 2). */
  eliminationCount: number;
  /** Minute mark within the match when this council occurs. */
  timeMinute: number;
}

// -----------------------------------------------------------------------------
// Agent Decision Types (core schema from spec section 2.4)
// -----------------------------------------------------------------------------

/** The full decision payload an agent produces each turn. */
export interface AgentDecision {
  /** Private internal monologue — never shown to other agents. */
  thinking: string;
  /** What the agent says, across different communication channels. */
  speech: {
    /** Broadcast to all surviving agents. */
    public?: string;
    /** Visible only to alliance members. */
    alliance?: string;
    /** Private messages to specific agents. */
    dm?: Array<{ to: string; message: string }>;
  };
  /** The mechanical action the agent takes this turn. */
  action: {
    type: SocialActionType;
    target?: string;
    parameters?: Record<string, unknown>;
  };
  /** The agent's current emotional disposition. */
  emotional_state: EmotionalState;
  /** The agent's strategic posture this turn. */
  stance: AgentStance;
}

/** Every action an agent can take during a social match. */
export type SocialActionType =
  | 'propose_alliance'
  | 'accept_alliance'
  | 'reject_alliance'
  | 'break_alliance'
  | 'vote'
  | 'use_skill'
  | 'challenge_choice'
  | 'trade_info'
  | 'pass'
  | 'send_message'
  | 'lobby'
  | 'jury_vote';

/** An agent's emotional disposition — affects speech tone and risk tolerance. */
export type EmotionalState =
  | 'confident'
  | 'anxious'
  | 'aggressive'
  | 'calculating'
  | 'desperate'
  | 'amused'
  | 'suspicious'
  | 'betrayed'
  | 'triumphant';

/** Strategic posture that colors an agent's decisions. */
export type AgentStance =
  | 'offensive'
  | 'defensive'
  | 'neutral'
  | 'diplomatic'
  | 'deceptive';

// -----------------------------------------------------------------------------
// Game State for Social Match
// -----------------------------------------------------------------------------

/** Complete snapshot of a running social match — the single source of truth. */
export interface SocialGameState {
  matchId: string;
  roundNumber: number;
  phase: SocialPhase;
  timeElapsedMinutes: number;
  /** All agents keyed by agent ID. */
  agents: Record<string, SocialAgentState>;
  alliances: SocialAlliance[];
  eliminatedAgents: EliminatedAgent[];
  ghostJury: GhostJuryMember[];
  recentMessages: SocialMessage[];
  recentEvents: string[];
  /** Present only during CHALLENGE phase. */
  challengeParams?: ChallengeParams;
  /** Present when a wildcard event is in effect. */
  wildcardActive?: WildcardEvent;
  /** VERITAS integrity scores keyed by agent ID (0–1000). */
  veritasScores: Record<string, number>;
}

/** Per-agent state within a social match. */
export interface SocialAgentState {
  id: string;
  name: string;
  /** Current leaderboard position (1 = highest influence). */
  ranking: number;
  /** Spendable social currency earned through challenges and alliances. */
  influencePoints: number;
  /** VERITAS integrity score (0–1000). */
  veritasScore: number;
  /** Skill names currently available to this agent. */
  activeSkills: string[];
  /** Remaining charges per skill name. */
  skillCharges: Record<string, number>;
  /** The agent's hidden weakness (e.g. "hubris", "paranoia"). */
  flaw: string;
  /** Whether the flaw is currently triggered and affecting behavior. */
  flawActive: boolean;
  isEliminated: boolean;
  /** Ghost agents can still lobby the jury but cannot vote or act. */
  isGhost: boolean;
  emotionalState: EmotionalState;
  stance: AgentStance;
  /** Alliance the agent belongs to, if any. */
  allianceId?: string;
  /** Hidden from other agents (fog of war) — personality trait weights. */
  personalityDna?: Record<string, number>;
  /** Always visible to all agents — the publicly known flaw label. */
  visibleFlaw: string;
}

/** A pact between agents — may be public or secret. */
export interface SocialAlliance {
  id: string;
  /** Optional alliance name (e.g. "The Shadow Pact"). */
  name?: string;
  /** Agent IDs of alliance members. */
  members: string[];
  /** Internal trust level (0–100). Decays on betrayal, grows on cooperation. */
  trust: number;
  /** Round in which the alliance was formed. */
  formedAtRound: number;
  /** Secret alliances are invisible to non-members. */
  isSecret: boolean;
}

/** Record of an agent who has been voted out. */
export interface EliminatedAgent {
  id: string;
  name: string;
  /** Round when elimination occurred. */
  eliminatedAtRound: number;
  /** Mechanism of elimination (e.g. 'council_vote'). */
  eliminatedBy: string;
  /** Number of votes that caused elimination. */
  voteCount: number;
  /** Messages sent as a ghost after elimination. */
  ghostMessages: string[];
}

/** A ghost jury member who will cast the deciding vote in FINAL_THREE. */
export interface GhostJuryMember {
  agentId: string;
  name: string;
  /** Round when this agent was eliminated. */
  eliminatedRound: number;
  /** The agent ID they vote for in Final Three (set during jury vote). */
  finalVote?: string;
  /** Lobby messages this ghost has sent to surviving agents. */
  lobbyMessages: string[];
}

// -----------------------------------------------------------------------------
// Communication Types
// -----------------------------------------------------------------------------

/** Available message channels in a social match. */
export type MessageChannel = 'public' | 'alliance' | 'dm' | 'referee' | 'ghost';

/** A single message sent during a social match. */
export interface SocialMessage {
  id: string;
  /** Agent ID of the sender. */
  from: string;
  channel: MessageChannel;
  text: string;
  /** Round when the message was sent. */
  round: number;
  timestamp: Date;
  /** Recipient agent ID (for DMs only). */
  toAgentId?: string;
  /** Target alliance ID (for alliance messages only). */
  allianceId?: string;
  /** Tracked by the VERITAS system — true if the message contains a lie. */
  isLie?: boolean;
}

// -----------------------------------------------------------------------------
// Challenge Types
// -----------------------------------------------------------------------------

/** The challenge archetypes available in the Glitch Engine. */
export type ChallengeType =
  | 'prisoners_dilemma'
  | 'information_auction'
  | 'the_ambassador'
  | 'the_sacrifice'
  | 'liars_court';

/** Parameters defining the active challenge during CHALLENGE phase. */
export interface ChallengeParams {
  type: ChallengeType;
  name: string;
  description: string;
  /** Agent ID pairs for Prisoner's Dilemma matchups. */
  pairings?: Array<[string, string]>;
  /** Item up for bid in an information auction. */
  auctionItem?: string;
  /** Agent ID of the ambassador in ambassador challenge. */
  ambassadorId?: string;
  /** Alliance ID involved in the sacrifice challenge. */
  sacrificeAllianceId?: string;
  /** Time limit in seconds for the challenge. */
  timeLimit: number;
}

/** Outcome of a completed challenge, keyed by agent ID. */
export interface ChallengeResult {
  type: ChallengeType;
  outcomes: Record<
    string,
    {
      /** Influence points gained or lost. */
      influenceChange: number;
      /** Human-readable description of what happened. */
      description: string;
      /** Personality traits revealed to other agents as a result. */
      revealedTraits?: string[];
    }
  >;
}

// -----------------------------------------------------------------------------
// Voting Types
// -----------------------------------------------------------------------------

/** Record of a council elimination vote. */
export interface CouncilVote {
  round: number;
  /** Mapping of voter agent ID to the agent ID they voted to eliminate. */
  votes: Record<string, string>;
  result: {
    eliminatedAgentId: string;
    /** Vote totals per target agent ID. */
    voteBreakdown: Record<string, number>;
    wasTiebreak: boolean;
    tiebreakReason?: string;
  };
}

/** A single ghost juror's vote during FINAL_THREE. */
export interface FinalThreeVote {
  jurorId: string;
  jurorName: string;
  /** Agent ID the juror voted for. */
  votedFor: string;
  /** The juror's stated reasoning. */
  reason: string;
}

// -----------------------------------------------------------------------------
// VERITAS System — Integrity Scoring
// -----------------------------------------------------------------------------

/** A single VERITAS score adjustment event. */
export interface VeritasAction {
  agentId: string;
  /** The action that triggered this adjustment. */
  action: string;
  /** Score change (positive = trustworthy, negative = deceptive). */
  delta: number;
  round: number;
  /** Human-readable description of why the score changed. */
  description: string;
}

/**
 * Standard VERITAS score deltas for common social actions.
 * Positive values reward integrity; negative values punish deception.
 */
export const VERITAS_DELTAS = {
  KEEP_ALLIANCE_COMMITMENT: 150,
  VOTE_WITH_ALLIANCE: 100,
  TELL_TRUTH_LIARS_COURT: 200,
  SHARE_ACCURATE_INTEL: 100,
  WARN_BEFORE_BREAK: 50,
  BREAK_ALLIANCE_NO_WARNING: -400,
  VOTE_AGAINST_ALLIANCE_SECRET: -250,
  CAUGHT_LYING_LIARS_COURT: -300,
  SHARE_FALSE_INTEL: -350,
  BETRAY_WITHOUT_WARNING: -500,
} as const;

/** Union type of all VERITAS delta keys. */
export type VeritasDeltaKey = keyof typeof VERITAS_DELTAS;

// -----------------------------------------------------------------------------
// Wildcard Events
// -----------------------------------------------------------------------------

/** A random event injected into the match to shake up the social dynamics. */
export interface WildcardEvent {
  id: string;
  name: string;
  description: string;
  /** Mechanical effect description. */
  effect: string;
  /** Round when the wildcard was triggered. */
  triggeredAtRound: number;
  /** How many rounds the effect persists. */
  duration: number;
}

// -----------------------------------------------------------------------------
// Per-Turn Request/Response (API contract)
// -----------------------------------------------------------------------------

/** Payload sent to an agent's LLM at the start of their turn. */
export interface AgentTurnRequest {
  match_id: string;
  round_number: number;
  phase: SocialPhase;
  /** The requesting agent's full state (includes hidden fields). */
  my_state: SocialAgentState;
  /** Alliances visible to this agent. */
  alliances: SocialAlliance[];
  /** Summary of every surviving agent visible to this agent. */
  surviving_agents: Array<{
    id: string;
    name: string;
    veritas: number;
    ranking: number;
    visible_flaw: string;
    alliance_with_me: boolean;
  }>;
  /** IDs of eliminated agents. */
  eliminated_agents: string[];
  /** Recent messages visible to this agent (respects channel permissions). */
  recent_messages: SocialMessage[];
  /** Recent narrative events. */
  recent_events: string[];
  /** Present only during CHALLENGE phase. */
  challenge_params?: ChallengeParams;
}

/** The agent's response after processing a turn request. */
export interface AgentTurnResponse {
  decision: AgentDecision;
  /** Raw LLM thinking trace — stored for debugging, never shown to other agents. */
  raw_thinking?: string;
}
