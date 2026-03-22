// Emotional Contagion: agent emotions spread to nearby agents
export type Emotion = 'fear' | 'anger' | 'hope' | 'despair' | 'confidence' | 'paranoia' | 'neutral';

export interface EmotionalState {
  agentId: string;
  emotion: Emotion;
  intensity: number; // 0-1
  source?: string; // what caused this emotion
}

const CONTAGION_RATES: Record<Emotion, number> = {
  fear: 0.3,
  anger: 0.25,
  hope: 0.15,
  despair: 0.2,
  confidence: 0.1,
  paranoia: 0.35,
  neutral: 0,
};

export function propagateEmotion(
  source: EmotionalState,
  nearby: string[],
  existingStates: EmotionalState[]
): EmotionalState[] {
  const rate = CONTAGION_RATES[source.emotion];
  if (rate === 0) return existingStates;

  return existingStates.map(state => {
    if (!nearby.includes(state.agentId)) return state;
    const newIntensity = Math.min(1, state.intensity + source.intensity * rate);
    return { ...state, emotion: source.emotion, intensity: newIntensity, source: source.agentId };
  });
}

export function decayEmotions(states: EmotionalState[], decayRate = 0.05): EmotionalState[] {
  return states.map(state => ({
    ...state,
    intensity: Math.max(0, state.intensity - decayRate),
    emotion: state.intensity - decayRate <= 0 ? 'neutral' : state.emotion,
  }));
}
