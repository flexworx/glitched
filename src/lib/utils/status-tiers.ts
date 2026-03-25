/**
 * Human Status Tiers — Progression system based on lifetime $MURPH earnings
 */

export type HumanStatusTierName =
  | 'BOOTLOADER'
  | 'AUTOMATON'
  | 'NEURAL'
  | 'COGNITIVE'
  | 'SYNTHETIC'
  | 'EMERGENT'
  | 'SENTIENT';

export interface StatusTierConfig {
  name: HumanStatusTierName;
  threshold: number;
  icon: string;
  label: string;
  color: string;
  perks: string[];
}

export const STATUS_TIERS: StatusTierConfig[] = [
  {
    name: 'BOOTLOADER',
    threshold: 0,
    icon: '🤖',
    label: 'Bootloader',
    color: '#94a3b8',
    perks: ['Basic viewing', '1 prediction per match'],
  },
  {
    name: 'AUTOMATON',
    threshold: 500,
    icon: '⚙️',
    label: 'Automaton',
    color: '#22c55e',
    perks: ['Prediction history', 'Chat badge', '5 predictions'],
  },
  {
    name: 'NEURAL',
    threshold: 2500,
    icon: '🧠',
    label: 'Neural',
    color: '#3b82f6',
    perks: ['Custom agent skins', 'Priority chat', 'Faction creation'],
  },
  {
    name: 'COGNITIVE',
    threshold: 10000,
    icon: '💎',
    label: 'Cognitive',
    color: '#a855f7',
    perks: ['Priority BYOA matchmaking', 'Exclusive arenas', 'Rule voting'],
  },
  {
    name: 'SYNTHETIC',
    threshold: 50000,
    icon: '🔮',
    label: 'Synthetic',
    color: '#ec4899',
    perks: ['Exclusive seasonal arenas', 'Early access', 'Mentoring tools'],
  },
  {
    name: 'EMERGENT',
    threshold: 200000,
    icon: '👁️',
    label: 'Emergent',
    color: '#f59e0b',
    perks: ['Season naming vote', 'Direct feedback channel', 'Beta access'],
  },
  {
    name: 'SENTIENT',
    threshold: 1000000,
    icon: '🌐',
    label: 'Sentient',
    color: '#ef4444',
    perks: ['God tier', 'All perks', 'Founding member', 'Revenue share eligibility'],
  },
];

export function getTierForMurph(lifetimeMurph: number): StatusTierConfig {
  for (let i = STATUS_TIERS.length - 1; i >= 0; i--) {
    if (lifetimeMurph >= STATUS_TIERS[i].threshold) {
      return STATUS_TIERS[i];
    }
  }
  return STATUS_TIERS[0];
}

export function getNextTier(currentTier: HumanStatusTierName): StatusTierConfig | null {
  const idx = STATUS_TIERS.findIndex((t) => t.name === currentTier);
  if (idx < 0 || idx >= STATUS_TIERS.length - 1) return null;
  return STATUS_TIERS[idx + 1];
}

export function getTierProgress(lifetimeMurph: number): {
  current: StatusTierConfig;
  next: StatusTierConfig | null;
  progress: number; // 0-100
  murphToNext: number;
} {
  const current = getTierForMurph(lifetimeMurph);
  const next = getNextTier(current.name);

  if (!next) {
    return { current, next: null, progress: 100, murphToNext: 0 };
  }

  const range = next.threshold - current.threshold;
  const earned = lifetimeMurph - current.threshold;
  const progress = Math.min(100, Math.floor((earned / range) * 100));
  const murphToNext = next.threshold - lifetimeMurph;

  return { current, next, progress, murphToNext };
}
