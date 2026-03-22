/**
 * RADF v3 — Seeded RNG
 * Deterministic, replayable random number generation.
 * All game randomness must use this — never Math.random().
 * Uses a Mulberry32 PRNG seeded per match+turn for full replay support.
 */

export class SeededRNG {
  private state: number;
  readonly seed: number;

  constructor(seed: number) {
    // Ensure unsigned 32-bit seed to prevent negative values
    this.seed = seed >>> 0;
    this.state = this.seed;
  }

  /** Returns a float in [0, 1) — always non-negative */
  next(): number {
    // Mulberry32 with fully unsigned arithmetic
    let z = (this.state + 0x6d2b79f5) >>> 0;
    this.state = z;
    z = Math.imul(z ^ (z >>> 15), 1 | z) >>> 0;
    z = (z ^ (z + Math.imul(z ^ (z >>> 7), 61 | z))) >>> 0;
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  }

  /** Returns an integer in [min, max] inclusive */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Returns true with the given probability [0,1] */
  chance(probability: number): boolean {
    return this.next() < probability;
  }

  /** Picks a random element from an array */
  pick<T>(arr: T[]): T {
    return arr[this.int(0, arr.length - 1)];
  }

  /** Shuffles an array in place and returns it */
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

/** Create a match-turn-scoped seed for full replay support */
export function createMatchTurnSeed(matchId: string, turnNumber: number): number {
  // Hash the matchId string into a numeric seed
  let hash = 0;
  for (let i = 0; i < matchId.length; i++) {
    const char = matchId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  // Combine with turn number for per-turn determinism
  return Math.abs(hash ^ (turnNumber * 2654435761));
}
