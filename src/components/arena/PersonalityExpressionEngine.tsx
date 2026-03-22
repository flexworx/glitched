'use client';
// Personality Expression Engine: translates trait values into visual behaviors
export interface ExpressionConfig {
  moveSpeed: number;
  attackAnimation: 'lunge' | 'sweep' | 'strike' | 'blast';
  idleAnimation: 'pace' | 'hover' | 'meditate' | 'scan';
  colorPulseRate: number;
  particleIntensity: number;
  speechBubbleStyle: 'aggressive' | 'diplomatic' | 'mysterious' | 'analytical';
}

export function traitsToExpression(traits: Record<string, number>): ExpressionConfig {
  const aggression = traits.aggressiveness ?? 0.5;
  const charisma = traits.charisma ?? 0.5;
  const neuroticism = traits.neuroticism ?? 0.5;
  const openness = traits.openness ?? 0.5;

  return {
    moveSpeed: 0.5 + aggression * 0.5,
    attackAnimation: aggression > 0.7 ? 'lunge' : aggression > 0.5 ? 'strike' : openness > 0.7 ? 'blast' : 'sweep',
    idleAnimation: neuroticism > 0.7 ? 'pace' : charisma > 0.7 ? 'hover' : openness > 0.7 ? 'meditate' : 'scan',
    colorPulseRate: 1 + neuroticism * 2,
    particleIntensity: charisma * 0.8 + aggression * 0.2,
    speechBubbleStyle: aggression > 0.7 ? 'aggressive' : charisma > 0.7 ? 'diplomatic' : openness > 0.7 ? 'mysterious' : 'analytical',
  };
}

export function getActionVariant(action: string, traits: Record<string, number>): string {
  const aggression = traits.aggressiveness ?? 0.5;
  const deception = traits.deceptiveness ?? 0.5;

  const variants: Record<string, string[]> = {
    attack: aggression > 0.7 ? ['savage_strike', 'overwhelming_assault'] : ['calculated_strike', 'precise_hit'],
    negotiate: deception > 0.7 ? ['manipulative_offer', 'false_promise'] : ['genuine_proposal', 'fair_trade'],
    betray: deception > 0.7 ? ['cold_betrayal', 'calculated_backstab'] : ['reluctant_betrayal', 'desperate_move'],
    ally: ['alliance_formed', 'pact_sealed'],
  };

  const options = variants[action] || [action];
  return options[Math.floor(Math.random() * options.length)];
}
