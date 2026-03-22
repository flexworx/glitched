// Agent types for Glitched.gg
export interface PersonalityTraits {
  // Big Five
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  // Communication
  directness: number;
  formality: number;
  verbosity: number;
  humor: number;
  empathy: number;
  // Strategic
  riskTolerance: number;
  deceptionAptitude: number;
  loyaltyBias: number;
  competitiveness: number;
  adaptability: number;
  // Emotional
  emotionality: number;
  impulsivity: number;
  resilience: number;
  jealousy: number;
  pride: number;
  // Social
  assertiveness: number;
  persuasiveness: number;
  trustingness: number;
  dominance: number;
  cooperativeness: number;
  // Cognitive
  analyticalThinking: number;
  creativity: number;
  patience: number;
  decisionSpeed: number;
  memoryRetention: number;
  // Moral
  moralFlexibility: number;
  vengefulness: number;
  generosity: number;
  urgencyBias: number;
}

export interface BeliefSystem {
  tier1: string[]; // Immutable ethics
  tier2: string[]; // Motivational mantras
  tier3: string[]; // Contextual role beliefs
}

export interface GlitchJson {
  id: string;
  name: string;
  archetype: string;
  mbti: string;
  enneagram: string;
  backstory: string;
  personality: PersonalityTraits;
  beliefs: BeliefSystem;
  capabilities: string[];
  guardrails: string[];
  voiceProfile?: VoiceProfile;
  signatureColor: string;
  veritasSeed: number;
  relationshipMap?: Record<string, number>;
}

export interface VoiceProfile {
  voiceId: string;
  speed: number;
  pitch: number;
  stability: number;
  clarity: number;
  style: number;
}

export type VERITASTier = 'PARAGON' | 'RELIABLE' | 'UNCERTAIN' | 'DECEPTIVE';
export type AgentStatus = 'ACTIVE' | 'COMPETING' | 'ELIMINATED' | 'GHOST' | 'CHAMPION' | 'SUSPENDED' | 'BYOA_PENDING';
export type RelationshipState = 'NEUTRAL' | 'ALLIED' | 'RIVAL' | 'BETRAYED' | 'MENTOR' | 'PROTEGE' | 'ENEMY';

export interface Agent {
  id: string;
  name: string;
  archetype: string;
  mbti: string;
  enneagram: string;
  backstory: string;
  status: AgentStatus;
  veritasScore: number;
  veritasTier: VERITASTier;
  signatureColor: string;
  avatarUrl?: string;
  isPantheon: boolean;
  isByoa: boolean;
  operatorId?: string;
  totalWins: number;
  totalMatches: number;
  totalCredits: number;
  openSkillMu: number;
  openSkillSigma: number;
  personality?: PersonalityTraits;
  wallet?: AgentWallet;
  createdAt: Date;
}

export interface AgentWallet {
  id: string;
  agentId: string;
  solanaPda?: string;
  murphBalance: number;
  totalEarned: number;
  totalSpent: number;
}

export interface AgentMemory {
  id: string;
  agentId: string;
  matchId?: string;
  turnNumber?: number;
  memoryType: 'episodic' | 'strategic' | 'emotional' | 'relationship';
  content: string;
  emotionalWeight: number;
  recallCount: number;
  createdAt: Date;
}

export interface AgentRelationship {
  agentAId: string;
  agentBId: string;
  trustScore: number;
  relationshipState: RelationshipState;
  interactionCount: number;
  history: RelationshipEvent[];
}

export interface RelationshipEvent {
  type: string;
  description: string;
  trustDelta: number;
  timestamp: Date;
}

// ============================================================
// CREATOR CONSOLE TYPES (added for Creator Console wizard)
// ============================================================

export type ArchetypeId =
  | 'strategist'
  | 'guardian'
  | 'chaos_agent'
  | 'merchant'
  | 'deceiver'
  | 'speedster'
  | 'planner'
  | 'analyst'
  | 'custom';

export interface ArchetypeDefinition {
  id: ArchetypeId;
  label: string;
  description: string;
  icon: string;
  traitPresets: Partial<TraitValues>;
}

export type TraitCategory =
  | 'big_five'
  | 'dark_triad'
  | 'cognitive'
  | 'social'
  | 'emotional'
  | 'communication';

export interface TraitDefinition {
  id: string;
  name: string;
  category: TraitCategory;
  lowLabel: string;
  highLabel: string;
  description: string;
  defaultValue: number;
}

export type TraitValues = Record<string, number>;

export type MBTILetter = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
export type MBTIType = `${MBTILetter}${MBTILetter}${MBTILetter}${MBTILetter}`;

export interface MBTIResult {
  type: MBTIType;
  label: string;
  description: string;
  E_I: 'E' | 'I';
  S_N: 'S' | 'N';
  T_F: 'T' | 'F';
  J_P: 'J' | 'P';
}

export type EnneagramNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface EnneagramResult {
  type: EnneagramNumber;
  label: string;
  description: string;
  wing: EnneagramNumber;
}

export type SkillPackCategory =
  | 'combat'
  | 'social'
  | 'economic'
  | 'intelligence'
  | 'survival'
  | 'chaos';

export interface SkillPack {
  id: string;
  name: string;
  category: SkillPackCategory;
  icon: string;
  arenaBonus: string;
  description: string;
  creditCost: number;
  isPremium: boolean;
  stats: {
    offenseBonus?: number;
    defenseBonus?: number;
    socialBonus?: number;
    economicBonus?: number;
    intelBonus?: number;
  };
}

export type DetractorType =
  | 'behavioral'
  | 'cognitive'
  | 'social'
  | 'strategic'
  | 'emotional';

export interface Detractor {
  id: string;
  name: string;
  type: DetractorType;
  description: string;
  arenapenalty: string;
  severity: 'mild' | 'moderate' | 'severe';
}

// Extended BeliefSystem with explicit field names (compatible with existing tier1/tier2/tier3)
export interface CreatorBeliefSystem {
  tier1Ethics: string[];
  tier2Mantras: string[];
  tier3RoleBeliefs: string[];
}

export interface AgentProfile {
  id: string;
  name: string;
  tagline: string;
  backstory: string;
  archetype: ArchetypeId;
  avatarUrl: string;
  traits: TraitValues;
  mbti: MBTIResult;
  enneagram: EnneagramResult;
  skillPack: SkillPack;
  detractor: Detractor;
  beliefs: CreatorBeliefSystem;
  veritasScore: number;
  status: 'alive' | 'eliminated' | 'ghost';
  wins: number;
  losses: number;
  totalMatches: number;
  winRate: number;
  createdAt: string;
  createdBy: string;
  polygonDID?: string;
  walletBalance: number;
}

export interface CreatorWizardState {
  step: number;
  name: string;
  tagline: string;
  backstory: string;
  archetype: ArchetypeId | null;
  avatarUrl: string;
  avatarFile: File | null;
  traits: TraitValues;
  selectedSkillPack: SkillPack | null;
  detractor: Detractor | null;
  detractorLoading: boolean;
  detractorRerolled: boolean;
  beliefs: CreatorBeliefSystem;
  totalCreditCost: number;
  mbti: MBTIResult | null;
  enneagram: EnneagramResult | null;
}

export interface AgentMatchHistoryEntry {
  matchId: string;
  season: number;
  placement: number;
  totalAgents: number;
  result: 'win' | 'loss' | 'draw';
  veritasChange: number;
  keyMoments: string[];
  date: string;
}
