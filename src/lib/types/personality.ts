// Personality type definitions
export interface PersonalityTraits {
  // Big Five
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  // Combat
  aggressiveness: number;
  riskTolerance: number;
  adaptability: number;
  patience: number;
  // Social
  deceptiveness: number;
  loyalty: number;
  charisma: number;
  empathy: number;
  ambition: number;
  creativity: number;
}

export interface PersonalityDNA {
  traits: PersonalityTraits;
  voice: {
    tone: string;
    vocabulary: string;
    cadence: string;
    signature_phrases: string[];
  };
  combat: {
    preferred_actions: string[];
    avoid_actions: string[];
    alliance_threshold: number;
    betrayal_threshold: number;
  };
}

export function getDefaultTraits(): PersonalityTraits {
  return {
    openness: 0.5, conscientiousness: 0.5, extraversion: 0.5, agreeableness: 0.5, neuroticism: 0.5,
    aggressiveness: 0.5, riskTolerance: 0.5, adaptability: 0.5, patience: 0.5,
    deceptiveness: 0.5, loyalty: 0.5, charisma: 0.5, empathy: 0.5, ambition: 0.5, creativity: 0.5,
  };
}
