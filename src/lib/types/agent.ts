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
