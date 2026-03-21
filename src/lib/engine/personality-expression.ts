export interface ExpressionVariant {
  tone: 'aggressive' | 'diplomatic' | 'deceptive' | 'analytical' | 'emotional' | 'stoic';
  verbosity: 'terse' | 'moderate' | 'verbose';
  formality: 'casual' | 'formal';
  emotionalState: 'neutral' | 'excited' | 'threatened' | 'triumphant' | 'desperate';
}

export class PersonalityExpressionEngine {
  selectVariant(personality: any, context: any): ExpressionVariant {
    const traits = personality?.traits || {};
    let tone: ExpressionVariant['tone'] = 'analytical';
    if ((traits.aggressiveness || 0) > 0.7) tone = 'aggressive';
    else if ((traits.deceptiveness || 0) > 0.7) tone = 'deceptive';
    else if ((traits.agreeableness || 0) > 0.7) tone = 'diplomatic';
    else if ((traits.neuroticism || 0) > 0.7) tone = 'emotional';
    else if ((traits.conscientiousness || 0) > 0.8) tone = 'stoic';

    const verbosity: ExpressionVariant['verbosity'] =
      (traits.openness || 0.5) > 0.7 ? 'verbose' : (traits.openness || 0.5) < 0.3 ? 'terse' : 'moderate';

    let emotionalState: ExpressionVariant['emotionalState'] = 'neutral';
    if (context?.hp < 30) emotionalState = 'desperate';
    else if (context?.recentWin) emotionalState = 'triumphant';
    else if (context?.threatened) emotionalState = 'threatened';
    else if (context?.dramaScore > 80) emotionalState = 'excited';

    return { tone, verbosity, formality: (traits.conscientiousness || 0) > 0.7 ? 'formal' : 'casual', emotionalState };
  }

  buildSystemPromptAddition(variant: ExpressionVariant): string {
    const toneMap: Record<string, string> = {
      aggressive: 'Speak with dominance and threat. Short, powerful sentences.',
      diplomatic: 'Speak with measured diplomacy. Seek common ground.',
      deceptive: 'Speak with calculated ambiguity. Never reveal true intentions.',
      analytical: 'Speak with logical precision. Reference data and probabilities.',
      emotional: 'Speak with raw emotion. Let feelings drive your words.',
      stoic: 'Speak with cold detachment. Emotions are irrelevant.',
    };
    return `Tone: ${toneMap[variant.tone]}
Verbosity: ${variant.verbosity}.
Emotional state: ${variant.emotionalState}.`;
  }
}
