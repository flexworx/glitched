// Personality Contagion: agents subtly influence each other's traits over time
export interface PersonalityShift {
  agentId: string;
  trait: string;
  delta: number; // small positive or negative change
  source: string; // agent that influenced this
  turn: number;
}

export function calculatePersonalityInfluence(
  observerTraits: Record<string, number>,
  influencerTraits: Record<string, number>,
  interactionCount: number,
  influencerCharisma: number
): Record<string, number> {
  const shifts: Record<string, number> = {};
  const influenceStrength = influencerCharisma * 0.02 * Math.log(interactionCount + 1);

  for (const [trait, value] of Object.entries(influencerTraits)) {
    const currentValue = observerTraits[trait] ?? 0.5;
    const delta = (value - currentValue) * influenceStrength;
    if (Math.abs(delta) > 0.001) {
      shifts[trait] = delta;
    }
  }

  return shifts;
}

export function applyPersonalityShifts(
  traits: Record<string, number>,
  shifts: Record<string, number>
): Record<string, number> {
  const updated = { ...traits };
  for (const [trait, delta] of Object.entries(shifts)) {
    updated[trait] = Math.max(0, Math.min(1, (updated[trait] ?? 0.5) + delta));
  }
  return updated;
}
