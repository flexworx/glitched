// ============================================================
// GLITCHED.GG — Enneagram Derivation from Trait Values
// ============================================================

import type { TraitValues, EnneagramResult, EnneagramNumber } from '@/types/agent';

interface EnneagramType {
  type: EnneagramNumber;
  label: string;
  description: string;
  wing: EnneagramNumber;
}

const ENNEAGRAM_TYPES: EnneagramType[] = [
  { type: 1, label: 'The Reformer', description: 'Principled, purposeful, self-controlled. Driven by a need to be right and improve everything.', wing: 9 },
  { type: 2, label: 'The Helper', description: 'Caring, interpersonal, generous. Driven by a need to be loved and needed.', wing: 1 },
  { type: 3, label: 'The Achiever', description: 'Success-oriented, pragmatic, adaptive. Driven by a need to be valuable and worthwhile.', wing: 2 },
  { type: 4, label: 'The Individualist', description: 'Sensitive, withdrawn, expressive. Driven by a need to be unique and authentic.', wing: 3 },
  { type: 5, label: 'The Investigator', description: 'Intense, cerebral, perceptive. Driven by a need to be competent and knowledgeable.', wing: 4 },
  { type: 6, label: 'The Loyalist', description: 'Committed, security-oriented, engaging. Driven by a need to be safe and supported.', wing: 5 },
  { type: 7, label: 'The Enthusiast', description: 'Busy, fun-loving, spontaneous. Driven by a need to be happy and satisfied.', wing: 8 },
  { type: 8, label: 'The Challenger', description: 'Powerful, dominating, self-confident. Driven by a need to be strong and in control.', wing: 7 },
  { type: 9, label: 'The Peacemaker', description: 'Easy-going, self-effacing, receptive. Driven by a need for inner stability and peace.', wing: 8 },
];

/**
 * Derive Enneagram type from trait values using weighted scoring.
 */
export function deriveEnneagram(traits: TraitValues): EnneagramResult {
  const scores: Record<EnneagramNumber, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
  };

  const g = (key: string) => traits[key] ?? 50;

  // Type 1 — The Reformer: high conscientiousness, low neuroticism, high directness
  scores[1] += g('conscientiousness') * 0.4 + (100 - g('neuroticism')) * 0.3 + g('directness') * 0.3;

  // Type 2 — The Helper: high agreeableness, high empathy, low machiavellianism
  scores[2] += g('agreeableness') * 0.4 + g('empathy') * 0.4 + (100 - g('machiavellianism')) * 0.2;

  // Type 3 — The Achiever: high ambition, high extraversion, high reputation_management
  scores[3] += g('ambition') * 0.4 + g('extraversion') * 0.3 + g('reputation_management') * 0.3;

  // Type 4 — The Individualist: high openness, high neuroticism, high creativity
  scores[4] += g('openness') * 0.3 + g('neuroticism') * 0.3 + g('creativity') * 0.4;

  // Type 5 — The Investigator: high pattern_recognition, low extraversion, high information_processing
  scores[5] += g('pattern_recognition') * 0.35 + (100 - g('extraversion')) * 0.3 + g('information_processing') * 0.35;

  // Type 6 — The Loyalist: high alliance_loyalty, high fear_response, high conscientiousness
  scores[6] += g('alliance_loyalty') * 0.4 + g('fear_response') * 0.3 + g('conscientiousness') * 0.3;

  // Type 7 — The Enthusiast: high extraversion, high risk_tolerance, low conscientiousness
  scores[7] += g('extraversion') * 0.35 + g('risk_tolerance') * 0.35 + (100 - g('conscientiousness')) * 0.3;

  // Type 8 — The Challenger: high dominance_drive, high psychopathy, high ambition
  scores[8] += g('dominance_drive') * 0.4 + g('psychopathy') * 0.3 + g('ambition') * 0.3;

  // Type 9 — The Peacemaker: high agreeableness, low conflict_style, low ambition
  scores[9] += g('agreeableness') * 0.35 + (100 - g('conflict_style')) * 0.35 + (100 - g('ambition')) * 0.3;

  // Find highest scoring type
  let maxScore = 0;
  let dominantType: EnneagramNumber = 9;
  for (const [typeStr, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      dominantType = parseInt(typeStr) as EnneagramNumber;
    }
  }

  const typeData = ENNEAGRAM_TYPES.find((t) => t.type === dominantType)!;
  return {
    type: typeData.type,
    label: typeData.label,
    description: typeData.description,
    wing: typeData.wing,
  };
}

export function getEnneagramColor(type: EnneagramNumber): string {
  const colors: Record<EnneagramNumber, string> = {
    1: '#39FF14', 2: '#FF6B35', 3: '#FFD700', 4: '#7B2FBE',
    5: '#00D4FF', 6: '#4A90D9', 7: '#FF9500', 8: '#FF073A', 9: '#50C878',
  };
  return colors[type];
}
