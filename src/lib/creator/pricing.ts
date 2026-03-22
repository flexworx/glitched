// ============================================================
// GLITCHED.GG — Trait Credit Pricing System
// ============================================================

// Free range: 40–60 (no credit cost)
// Outside free range, cost per point:
export const PRICING_TIERS = [
  { range: [30, 39] as [number, number], costPerPoint: 2 },   // Also applies to 61–70
  { range: [20, 29] as [number, number], costPerPoint: 5 },   // Also applies to 71–80
  { range: [10, 19] as [number, number], costPerPoint: 10 },  // Also applies to 81–90
  { range: [1, 9] as [number, number],   costPerPoint: 25 },  // Also applies to 91–100
];

/**
 * Calculate the credit cost for a single trait value.
 * Free range is 40–60 (inclusive). Outside that, costs increase per tier.
 */
export function calculateTraitCost(value: number): number {
  const v = Math.max(1, Math.min(100, Math.round(value)));
  if (v >= 40 && v <= 60) return 0;

  let cost = 0;

  if (v < 40) {
    // Below free range: 30–39 = 2/pt, 20–29 = 5/pt, 10–19 = 10/pt, 1–9 = 25/pt
    if (v <= 39) {
      const pts = Math.min(39, 39) - Math.max(v, 30) + 1;
      if (pts > 0) cost += pts * 2;
    }
    if (v <= 29) {
      const pts = 29 - Math.max(v, 20) + 1;
      if (pts > 0) cost += pts * 5;
    }
    if (v <= 19) {
      const pts = 19 - Math.max(v, 10) + 1;
      if (pts > 0) cost += pts * 10;
    }
    if (v <= 9) {
      const pts = 9 - Math.max(v, 1) + 1;
      if (pts > 0) cost += pts * 25;
    }
  } else {
    // Above free range: 61–70 = 2/pt, 71–80 = 5/pt, 81–90 = 10/pt, 91–100 = 25/pt
    if (v >= 61) {
      const pts = Math.min(v, 70) - 60;
      if (pts > 0) cost += pts * 2;
    }
    if (v >= 71) {
      const pts = Math.min(v, 80) - 70;
      if (pts > 0) cost += pts * 5;
    }
    if (v >= 81) {
      const pts = Math.min(v, 90) - 80;
      if (pts > 0) cost += pts * 10;
    }
    if (v >= 91) {
      const pts = Math.min(v, 100) - 90;
      if (pts > 0) cost += pts * 25;
    }
  }

  return cost;
}

/**
 * Calculate total credit cost for all traits.
 */
export function calculateTotalCost(traits: Record<string, number>): number {
  return Object.values(traits).reduce((sum, v) => sum + calculateTraitCost(v), 0);
}

/**
 * Get the color for a trait slider based on its value.
 */
export function getTraitSliderColor(value: number): string {
  if (value >= 40 && value <= 60) return '#39FF14';  // green — free
  if ((value >= 30 && value <= 39) || (value >= 61 && value <= 70)) return '#FFD700';  // gold
  if ((value >= 20 && value <= 29) || (value >= 71 && value <= 80)) return '#7B2FBE';  // purple
  if ((value >= 10 && value <= 19) || (value >= 81 && value <= 90)) return '#FF6B35';  // orange
  return '#FF073A';  // red — extreme
}

/**
 * Get the tier label for a trait value.
 */
export function getTraitTierLabel(value: number): string {
  if (value >= 40 && value <= 60) return 'FREE';
  if ((value >= 30 && value <= 39) || (value >= 61 && value <= 70)) return '2cr/pt';
  if ((value >= 20 && value <= 29) || (value >= 71 && value <= 80)) return '5cr/pt';
  if ((value >= 10 && value <= 19) || (value >= 81 && value <= 90)) return '10cr/pt';
  return '25cr/pt';
}
