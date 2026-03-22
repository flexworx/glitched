export interface PersonalityTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  aggressiveness: number;
  deceptiveness: number;
  loyalty: number;
  riskTolerance: number;
  adaptability: number;
  charisma: number;
  patience: number;
  ambition: number;
  empathy: number;
  creativity: number;
  [key: string]: number;
}

export function inferMBTI(traits: PersonalityTraits): string {
  const E_I = traits.extraversion > 0.5 ? 'E' : 'I';
  const S_N = traits.openness > 0.5 ? 'N' : 'S';
  const T_F = traits.agreeableness > 0.5 ? 'F' : 'T';
  const J_P = traits.conscientiousness > 0.5 ? 'J' : 'P';
  return `${E_I}${S_N}${T_F}${J_P}`;
}

export function inferEnneagram(traits: PersonalityTraits): number {
  const scores = [
    traits.conscientiousness * 0.8 + (1 - traits.agreeableness) * 0.2, // Type 1: Reformer
    traits.empathy * 0.7 + traits.agreeableness * 0.3,                  // Type 2: Helper
    traits.ambition * 0.8 + traits.extraversion * 0.2,                  // Type 3: Achiever
    traits.openness * 0.6 + traits.creativity * 0.4,                    // Type 4: Individualist
    (1 - traits.extraversion) * 0.7 + traits.openness * 0.3,            // Type 5: Investigator
    traits.neuroticism * 0.6 + traits.loyalty * 0.4,                    // Type 6: Loyalist
    traits.openness * 0.5 + traits.riskTolerance * 0.5,                 // Type 7: Enthusiast
    traits.aggressiveness * 0.7 + traits.ambition * 0.3,                // Type 8: Challenger
    traits.patience * 0.6 + traits.agreeableness * 0.4,                 // Type 9: Peacemaker
  ];
  return scores.indexOf(Math.max(...scores)) + 1;
}

export function calculateVeritas(traits: PersonalityTraits, wins: number, losses: number): number {
  const consistency = traits.conscientiousness * 200;
  const adaptability = traits.adaptability * 150;
  const winRate = wins + losses > 0 ? (wins / (wins + losses)) * 300 : 0;
  const charisma = traits.charisma * 100;
  const deceptionPenalty = traits.deceptiveness * -50;
  return Math.round(consistency + adaptability + winRate + charisma + deceptionPenalty);
}

export function getPersonalityDescription(traits: PersonalityTraits): string {
  const mbti = inferMBTI(traits);
  const descriptions: Record<string, string> = {
    INTJ: 'Strategic mastermind who plans several moves ahead',
    ENTJ: 'Commanding leader who dominates through force of will',
    INFJ: 'Visionary who sees patterns others miss',
    ENFJ: 'Charismatic manipulator who leads through inspiration',
    ISTP: 'Tactical pragmatist who adapts to any situation',
    ESTP: 'Aggressive opportunist who acts first and thinks later',
    INTP: 'Analytical thinker who finds logical exploits',
    ENTP: 'Cunning debater who thrives in chaos',
    ISTJ: 'Disciplined executor who follows through on every plan',
    ESTJ: 'Authoritative enforcer who imposes order',
    INFP: 'Idealistic agent driven by deep personal values',
    ENFP: 'Enthusiastic wildcard who inspires unpredictable alliances',
    ISFJ: 'Protective guardian who shields allies at all costs',
    ESFJ: 'Social diplomat who builds coalitions',
    ISFP: 'Quiet observer who strikes with precision',
    ESFP: 'Chaotic performer who thrives in the spotlight',
  };
  return descriptions[mbti] || 'A complex agent with unique behavioral patterns';
}
