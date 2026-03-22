// Maps personality traits to voice parameters
export interface VoiceParameters {
  stability: number;
  similarityBoost: number;
  style: number;
  speakingRate: number;
}

export function traitsToVoiceParameters(traits: Record<string, number>): VoiceParameters {
  const neuroticism = traits.neuroticism ?? 0.5;
  const extraversion = traits.extraversion ?? 0.5;
  const aggressiveness = traits.aggressiveness ?? 0.5;
  const conscientiousness = traits.conscientiousness ?? 0.5;

  return {
    stability: 1 - neuroticism * 0.5, // neurotic = less stable voice
    similarityBoost: 0.7 + conscientiousness * 0.2, // conscientious = more consistent
    style: aggressiveness * 0.6 + extraversion * 0.4, // aggressive/extroverted = more expressive
    speakingRate: 0.8 + extraversion * 0.4, // extroverted = faster speech
  };
}

export function getVoiceTone(traits: Record<string, number>): string {
  const aggressiveness = traits.aggressiveness ?? 0.5;
  const charisma = traits.charisma ?? 0.5;
  const deceptiveness = traits.deceptiveness ?? 0.5;

  if (aggressiveness > 0.8) return 'aggressive';
  if (charisma > 0.8) return 'commanding';
  if (deceptiveness > 0.8) return 'silky';
  if (traits.neuroticism > 0.7) return 'anxious';
  return 'neutral';
}
