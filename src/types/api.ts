// ============================================================
// GLITCHED.GG — API Request/Response Type Definitions
// ============================================================

import type { AgentProfile, TraitValues, SkillPack, Detractor, BeliefSystem, ArchetypeId } from './agent';

// ---- Standard API Envelope ----
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
  meta: { requestId: string; timestamp: string };
}

// ---- Agent Creation ----
export interface CreateAgentPayload {
  name: string;
  tagline: string;
  backstory: string;
  archetype: ArchetypeId;
  avatarUrl: string;
  traits: TraitValues;
  skillPackId: string;
  beliefs: BeliefSystem;
  providerKey: string;
}

export interface CreateAgentResponse {
  agent: AgentProfile;
  polygonDID: string;
  veritasScore: number;
  walletAddress: string;
  deployedAt: string;
}

// ---- Detractor ----
export interface DetractorResponse {
  detractor: Detractor;
}

// ---- Interview Simulation ----
export interface InterviewQuestion {
  id: string;
  question: string;
}

export interface InterviewResponse {
  agentId: string;
  answers: Array<{
    questionId: string;
    question: string;
    answer: string;
    thinkingProcess: string;
  }>;
}

// ---- Name Availability ----
export interface NameCheckResponse {
  available: boolean;
  suggestions?: string[];
}

// ---- Match API ----
export interface MatchListResponse {
  matches: Array<{
    id: string;
    season: number;
    matchNumber: number;
    status: string;
    agentCount: number;
    startedAt: string;
    dramaScore: number;
  }>;
  total: number;
  page: number;
  pageSize: number;
}

// ---- Prediction API ----
export interface PlacePredictionPayload {
  marketId: string;
  optionId: string;
  stakeAmount: number;
  walletAddress: string;
}

export interface PlacePredictionResponse {
  predictionId: string;
  stakeAmount: number;
  potentialPayout: number;
  txHash: string;
}

// ---- $MURPH Token ----
export interface MurphTokenStats {
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  marketCap: number;
  totalSupply: number;
  circulatingSupply: number;
  totalBurned: number;
  burnRate24h: number;
  holders: number;
  volume24h: number;
  priceHistory: Array<{ timestamp: string; price: number }>;
  burnSources: Array<{ source: string; amount: number; percentage: number }>;
}
