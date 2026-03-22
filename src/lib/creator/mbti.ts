// ============================================================
// GLITCHED.GG — MBTI Derivation from Trait Values
// ============================================================

import type { TraitValues, MBTIResult, MBTIType } from '@/types/agent';

type MBTIDescriptions = Partial<Record<string, { label: string; description: string }>>;

const MBTI_DESCRIPTIONS: MBTIDescriptions = {
  INTJ: { label: 'The Architect', description: 'Strategic, independent, and driven by long-term vision. A masterful planner who sees the arena as a chess board.' },
  INTP: { label: 'The Logician', description: 'Analytical and inventive, finding logical solutions others miss. Underestimates social dynamics at their peril.' },
  ENTJ: { label: 'The Commander', description: 'Natural leader who takes charge and drives toward victory. Impatient with inefficiency and weakness.' },
  ENTP: { label: 'The Debater', description: 'Quick-witted and resourceful, thriving on intellectual challenge. Loves disrupting established alliances.' },
  INFJ: { label: 'The Advocate', description: 'Insightful and principled, guided by a deep moral compass. Struggles when forced to compromise their ethics.' },
  INFP: { label: 'The Mediator', description: 'Idealistic and empathetic, seeking harmony even in chaos. Their loyalty is fierce once earned.' },
  ENFJ: { label: 'The Protagonist', description: 'Charismatic coalition-builder who inspires others. Masters the social game but can be manipulated through their empathy.' },
  ENFP: { label: 'The Campaigner', description: 'Enthusiastic and creative, generating unexpected alliances. Easily distracted by new opportunities.' },
  ISTJ: { label: 'The Logistician', description: 'Reliable and methodical, executing plans with precision. Slow to adapt when the arena shifts unexpectedly.' },
  ISFJ: { label: 'The Defender', description: 'Protective and loyal, remembering every slight and kindness. Underestimated until they strike back.' },
  ESTJ: { label: 'The Executive', description: 'Organized and decisive, imposing order on chaos. Struggles with agents who refuse to follow the rules.' },
  ESFJ: { label: 'The Consul', description: 'Socially adept and harmony-seeking, building broad coalitions. Vulnerable to betrayal by those they trust.' },
  ISTP: { label: 'The Virtuoso', description: 'Tactical and adaptable, excelling in crisis situations. Prefers action over politics.' },
  ISFP: { label: 'The Adventurer', description: 'Flexible and charming, moving through the arena like water. Hard to predict, harder to pin down.' },
  ESTP: { label: 'The Entrepreneur', description: 'Bold risk-taker who thrives in high-stakes moments. Lives for the drama, often creates it.' },
  ESFP: { label: 'The Entertainer', description: 'Spontaneous and magnetic, making every moment memorable. The arena loves them — until they become a threat.' },
};

export function deriveMBTI(traits: TraitValues): MBTIResult {
  const EI_score = traits.extraversion ?? 50;
  const E_I: 'E' | 'I' = EI_score >= 50 ? 'E' : 'I';

  const N_score = ((traits.openness ?? 50) + (traits.pattern_recognition ?? 50) + (traits.creativity ?? 50)) / 3;
  const S_N: 'S' | 'N' = N_score >= 50 ? 'N' : 'S';

  const F_score = ((traits.agreeableness ?? 50) + (traits.empathy ?? 50)) / 2;
  const T_F: 'T' | 'F' = F_score >= 50 ? 'F' : 'T';

  const J_score = ((traits.conscientiousness ?? 50) + (traits.planning_horizon ?? 50)) / 2;
  const J_P: 'J' | 'P' = J_score >= 50 ? 'J' : 'P';

  const type = `${E_I}${S_N}${T_F}${J_P}` as MBTIType;
  const entry = MBTI_DESCRIPTIONS[type] ?? {
    label: 'Unknown Type',
    description: 'A unique combination of traits that defies classification.',
  };

  return { type, label: entry.label, description: entry.description, E_I, S_N, T_F, J_P };
}

export function getMBTIColor(type: MBTIType): string {
  const colors: Record<string, string> = {
    INTJ: '#7B2FBE', INTP: '#5B2FBE', ENTJ: '#FF073A', ENTP: '#FF6B35',
    INFJ: '#39FF14', INFP: '#00D4FF', ENFJ: '#FFD700', ENFP: '#FF9500',
    ISTJ: '#6B7280', ISFJ: '#10B981', ESTJ: '#EF4444', ESFJ: '#F59E0B',
    ISTP: '#3B82F6', ISFP: '#8B5CF6', ESTP: '#EC4899', ESFP: '#F97316',
  };
  return colors[type] ?? '#39FF14';
}
