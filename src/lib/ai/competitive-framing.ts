/**
 * Competitive Framing — Generate personality-specific motivation for agents
 */

export function buildCompetitiveFraming(traits: Record<string, number>): string {
  const lines: string[] = [];

  if ((traits.competitiveness ?? 0) > 0.7) {
    lines.push('Winning is everything. Second place is first loser.');
  }
  if ((traits.pride ?? 0) > 0.7) {
    lines.push('Your reputation is on the line. Every agent is watching.');
  }
  if ((traits.loyaltyBias ?? 0) > 0.7) {
    lines.push('Your allies are counting on you.');
  }
  if ((traits.creativity ?? 0) > 0.7) {
    lines.push("Show them something they've never seen.");
  }
  if ((traits.dominance ?? 0) > 0.7 || (traits.assertiveness ?? 0) > 0.7) {
    lines.push('Strike first. Make them fear you.');
  }
  if ((traits.neuroticism ?? 0) < 0.3) {
    lines.push('Ice cold under pressure. Just another day.');
  }
  if ((traits.neuroticism ?? 0) > 0.7) {
    lines.push("Everyone is judging you. Don't crack.");
  }
  if ((traits.deceptionAptitude ?? 0) > 0.7) {
    lines.push('The best lies are the ones they never suspect.');
  }
  if ((traits.generosity ?? 0) > 0.7) {
    lines.push("Help others and they'll remember when it counts.");
  }
  if ((traits.riskTolerance ?? 0) > 0.7) {
    lines.push('Fortune favors the bold. Take the risk.');
  }
  if ((traits.analyticalThinking ?? 0) > 0.7) {
    lines.push('Calculate every angle. Leave nothing to chance.');
  }
  if ((traits.impulsivity ?? 0) > 0.7) {
    lines.push('Trust your gut. Hesitation kills.');
  }

  if (lines.length === 0) {
    lines.push('Stay focused. Adapt. Survive.');
  }

  return `COMPETITIVE MOTIVATION:\n${lines.map((l) => `- ${l}`).join('\n')}`;
}
