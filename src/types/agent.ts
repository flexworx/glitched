// ============================================================
// GLITCHED.GG — Agent Type Definitions
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

// ---- Trait Categories ----
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

// ---- MBTI ----
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

// ---- Enneagram ----
export type EnneagramNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface EnneagramResult {
  type: EnneagramNumber;
  label: string;
  description: string;
  wing: EnneagramNumber;
}

// ---- Skill Packs ----
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

// ---- Detractors ----
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

// ---- Belief System ----
export interface BeliefSystem {
  tier1Ethics: string[];      // Immutable — never violated
  tier2Mantras: string[];     // Motivational drivers
  tier3RoleBeliefs: string[]; // Arena-specific beliefs
}

// ---- Full Agent Profile ----
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
  beliefs: BeliefSystem;
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

// ---- Creator Wizard State ----
export interface CreatorWizardState {
  step: number;
  // Step 1
  name: string;
  tagline: string;
  backstory: string;
  archetype: ArchetypeId | null;
  avatarUrl: string;
  avatarFile: File | null;
  // Step 2
  traits: TraitValues;
  // Step 3
  selectedSkillPack: SkillPack | null;
  // Step 4
  detractor: Detractor | null;
  detractorLoading: boolean;
  detractorRerolled: boolean;
  // Step 5
  beliefs: BeliefSystem;
  // Computed
  totalCreditCost: number;
  mbti: MBTIResult | null;
  enneagram: EnneagramResult | null;
}

// ---- Relationship ----
export interface AgentRelationship {
  agentId: string;
  agentName: string;
  agentAvatarUrl: string;
  relationshipType: 'ally' | 'rival' | 'neutral' | 'betrayed' | 'betrayer';
  score: number;
  history: string;
}

// ---- Memory ----
export interface AgentMemory {
  id: string;
  matchId: string;
  turn: number;
  content: string;
  emotionalWeight: number;
  timestamp: string;
}

// ---- Match History Entry ----
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
