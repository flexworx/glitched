// ============================================================
// GLITCHED.GG — Arena Tool Definitions (replaces Skill Packs)
// ============================================================

export type ArenaToolCategory = 'combat' | 'social' | 'intelligence' | 'economic' | 'survival' | 'chaos';
export type ArenaToolRarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type ArenaToolDuration = 'SINGLE_ROUND' | 'SEASON_PERMANENT';

export interface ArenaToolDefinition {
  id: string;
  name: string;
  category: ArenaToolCategory;
  icon: string;
  description: string;
  effect: string;
  duration: ArenaToolDuration;
  murphCost: number;
  rarity: ArenaToolRarity;
  seasonSupply: number;       // How many available per season (-1 = unlimited)
  usableInGame: boolean;      // Can agent activate mid-game?
  usablePreGame: boolean;     // Can human equip before season?
  maxPerAgent: number;        // Max this tool per agent (usually 1)
  isHidden: true;             // ALWAYS true — tools hidden until activated
  mechanicalEffect: {
    type: string;
    value: number;
    target: 'self' | 'target' | 'all_allies' | 'all_enemies' | 'arena';
  };
}

export const ARENA_TOOLS: ArenaToolDefinition[] = [
  // ─── COMMON TOOLS (unlimited supply, 0-50 $MURPH) ───

  {
    id: 'quick_strike',
    name: 'Quick Strike',
    category: 'combat',
    icon: '⚔️',
    description: 'A burst of combat focus that amplifies your next attack.',
    effect: '+15% damage on your next attack this round',
    duration: 'SINGLE_ROUND',
    murphCost: 0,
    rarity: 'common',
    seasonSupply: -1,
    usableInGame: true,
    usablePreGame: true,
    maxPerAgent: 3,
    isHidden: true,
    mechanicalEffect: { type: 'damage_boost', value: 15, target: 'self' },
  },
  {
    id: 'iron_stance',
    name: 'Iron Stance',
    category: 'combat',
    icon: '🛡️',
    description: 'Brace yourself and become a fortress for one round.',
    effect: '+20% damage reduction this round',
    duration: 'SINGLE_ROUND',
    murphCost: 0,
    rarity: 'common',
    seasonSupply: -1,
    usableInGame: true,
    usablePreGame: true,
    maxPerAgent: 3,
    isHidden: true,
    mechanicalEffect: { type: 'defense_boost', value: 20, target: 'self' },
  },
  {
    id: 'smooth_talk',
    name: 'Smooth Talk',
    category: 'social',
    icon: '🗣️',
    description: 'Silver-tongued persuasion that makes your proposals irresistible.',
    effect: '+20% negotiation/alliance success this round',
    duration: 'SINGLE_ROUND',
    murphCost: 0,
    rarity: 'common',
    seasonSupply: -1,
    usableInGame: true,
    usablePreGame: true,
    maxPerAgent: 3,
    isHidden: true,
    mechanicalEffect: { type: 'social_boost', value: 20, target: 'self' },
  },
  {
    id: 'market_sense',
    name: 'Market Sense',
    category: 'economic',
    icon: '💰',
    description: 'Keen economic instincts that maximize resource extraction.',
    effect: '+25% resource/credit gain this round',
    duration: 'SINGLE_ROUND',
    murphCost: 0,
    rarity: 'common',
    seasonSupply: -1,
    usableInGame: true,
    usablePreGame: true,
    maxPerAgent: 3,
    isHidden: true,
    mechanicalEffect: { type: 'economic_boost', value: 25, target: 'self' },
  },
  {
    id: 'scout_drone',
    name: 'Scout Drone',
    category: 'intelligence',
    icon: '👁️',
    description: 'Deploy a surveillance drone to spy on a target agent.',
    effect: "Reveal 1 target agent's last action",
    duration: 'SINGLE_ROUND',
    murphCost: 0,
    rarity: 'common',
    seasonSupply: -1,
    usableInGame: true,
    usablePreGame: false,
    maxPerAgent: 3,
    isHidden: true,
    mechanicalEffect: { type: 'info_reveal', value: 1, target: 'target' },
  },
  {
    id: 'last_breath',
    name: 'Last Breath',
    category: 'survival',
    icon: '🔥',
    description: 'Primal survival instinct that kicks in at the last moment.',
    effect: 'Survive 1 elimination this round (auto-triggers)',
    duration: 'SINGLE_ROUND',
    murphCost: 50,
    rarity: 'common',
    seasonSupply: -1,
    usableInGame: true,
    usablePreGame: true,
    maxPerAgent: 1,
    isHidden: true,
    mechanicalEffect: { type: 'survival', value: 1, target: 'self' },
  },

  // ─── UNCOMMON TOOLS (10 per season, 100-200 $MURPH) ───

  {
    id: 'mind_probe',
    name: 'Mind Probe',
    category: 'intelligence',
    icon: '🧠',
    description: 'Deep psychological analysis that reveals recent behavior and strategy.',
    effect: "See target agent's last 3 actions and current strategy",
    duration: 'SINGLE_ROUND',
    murphCost: 100,
    rarity: 'uncommon',
    seasonSupply: 10,
    usableInGame: true,
    usablePreGame: false,
    maxPerAgent: 1,
    isHidden: true,
    mechanicalEffect: { type: 'deep_info_reveal', value: 3, target: 'target' },
  },
  {
    id: 'chaos_bomb',
    name: 'Chaos Bomb',
    category: 'chaos',
    icon: '💥',
    description: 'Introduce unpredictable chaos that disrupts everyone.',
    effect: 'Trigger a random arena event affecting all agents this round',
    duration: 'SINGLE_ROUND',
    murphCost: 150,
    rarity: 'uncommon',
    seasonSupply: 10,
    usableInGame: true,
    usablePreGame: false,
    maxPerAgent: 1,
    isHidden: true,
    mechanicalEffect: { type: 'chaos_event', value: 1, target: 'arena' },
  },
  {
    id: 'blood_oath',
    name: 'Blood Oath',
    category: 'social',
    icon: '🤝',
    description: 'A magically binding pact that prevents betrayal for one round.',
    effect: 'Lock an alliance for this round — neither party can betray',
    duration: 'SINGLE_ROUND',
    murphCost: 100,
    rarity: 'uncommon',
    seasonSupply: 10,
    usableInGame: true,
    usablePreGame: false,
    maxPerAgent: 1,
    isHidden: true,
    mechanicalEffect: { type: 'alliance_lock', value: 1, target: 'target' },
  },
  {
    id: 'vault_lock',
    name: 'Vault Lock',
    category: 'economic',
    icon: '🏦',
    description: 'Impenetrable resource protection for one round.',
    effect: 'Your $MURPH and resources cannot be stolen or penalized this round',
    duration: 'SINGLE_ROUND',
    murphCost: 100,
    rarity: 'uncommon',
    seasonSupply: 10,
    usableInGame: true,
    usablePreGame: false,
    maxPerAgent: 1,
    isHidden: true,
    mechanicalEffect: { type: 'resource_protection', value: 100, target: 'self' },
  },

  // ─── RARE TOOLS (3 per season, 300-500 $MURPH, first come first serve) ───

  {
    id: 'shadow_cloak',
    name: 'Shadow Cloak',
    category: 'intelligence',
    icon: '🌑',
    description: 'Advanced stealth that renders your action completely invisible.',
    effect: 'Your action this round is invisible to all other agents',
    duration: 'SINGLE_ROUND',
    murphCost: 300,
    rarity: 'rare',
    seasonSupply: 3,
    usableInGame: true,
    usablePreGame: false,
    maxPerAgent: 1,
    isHidden: true,
    mechanicalEffect: { type: 'stealth', value: 1, target: 'self' },
  },
  {
    id: 'puppet_string',
    name: 'Puppet String',
    category: 'social',
    icon: '🎭',
    description: 'Subtle manipulation that plants a strong impulse in a target agent.',
    effect: "Suggest an action to target agent — they see it as a 'strong impulse' but can resist",
    duration: 'SINGLE_ROUND',
    murphCost: 400,
    rarity: 'rare',
    seasonSupply: 3,
    usableInGame: true,
    usablePreGame: false,
    maxPerAgent: 1,
    isHidden: true,
    mechanicalEffect: { type: 'suggestion', value: 70, target: 'target' },
  },
  {
    id: 'fortune_lens',
    name: 'Fortune Lens',
    category: 'intelligence',
    icon: '🔮',
    description: 'Precognitive intelligence that reveals the near future.',
    effect: "See all agents' planned actions BEFORE you submit yours this round",
    duration: 'SINGLE_ROUND',
    murphCost: 500,
    rarity: 'rare',
    seasonSupply: 3,
    usableInGame: true,
    usablePreGame: false,
    maxPerAgent: 1,
    isHidden: true,
    mechanicalEffect: { type: 'precognition', value: 1, target: 'self' },
  },
  {
    id: 'tax_collector',
    name: 'Tax Collector',
    category: 'economic',
    icon: '👑',
    description: 'Economic dominance that taxes all arena transactions.',
    effect: 'Collect 5% of all $MURPH transactions between other agents this round',
    duration: 'SINGLE_ROUND',
    murphCost: 400,
    rarity: 'rare',
    seasonSupply: 3,
    usableInGame: true,
    usablePreGame: false,
    maxPerAgent: 1,
    isHidden: true,
    mechanicalEffect: { type: 'tax', value: 5, target: 'arena' },
  },

  // ─── LEGENDARY TOOLS (1 per season each, 800-1500 $MURPH, IN-GAME ONLY) ───
  // These are impossible to afford at game start. Agents must earn $MURPH through
  // survival, eliminations, and bets before purchasing. First come first serve —
  // once bought, it's gone for the season.

  {
    id: 'apex_instinct',
    name: 'Apex Instinct',
    category: 'combat',
    icon: '🦁',
    description: 'The pinnacle of combat evolution — permanent combat enhancement.',
    effect: '+10% combat effectiveness for the rest of the season',
    duration: 'SEASON_PERMANENT',
    murphCost: 800,
    rarity: 'legendary',
    seasonSupply: 1,
    usableInGame: true,
    usablePreGame: false,
    maxPerAgent: 1,
    isHidden: true,
    mechanicalEffect: { type: 'permanent_damage_boost', value: 10, target: 'self' },
  },
  {
    id: 'silver_tongue_mastery',
    name: 'Silver Tongue Mastery',
    category: 'social',
    icon: '🗣️',
    description: 'Transcendent social mastery — permanent negotiation advantage.',
    effect: '+15% social/negotiation success for the rest of the season',
    duration: 'SEASON_PERMANENT',
    murphCost: 800,
    rarity: 'legendary',
    seasonSupply: 1,
    usableInGame: true,
    usablePreGame: false,
    maxPerAgent: 1,
    isHidden: true,
    mechanicalEffect: { type: 'permanent_social_boost', value: 15, target: 'self' },
  },
  {
    id: 'information_network',
    name: 'Information Network',
    category: 'intelligence',
    icon: '🕸️',
    description: 'A vast intelligence network — permanent intel advantage.',
    effect: '+1 free intel reveal per round for the rest of the season',
    duration: 'SEASON_PERMANENT',
    murphCost: 1000,
    rarity: 'legendary',
    seasonSupply: 1,
    usableInGame: true,
    usablePreGame: false,
    maxPerAgent: 1,
    isHidden: true,
    mechanicalEffect: { type: 'permanent_intel', value: 1, target: 'self' },
  },
  {
    id: 'economic_empire',
    name: 'Economic Empire',
    category: 'economic',
    icon: '🏛️',
    description: 'Absolute economic dominance — permanent income boost.',
    effect: '+10% $MURPH gain from all sources for the rest of the season',
    duration: 'SEASON_PERMANENT',
    murphCost: 1200,
    rarity: 'legendary',
    seasonSupply: 1,
    usableInGame: true,
    usablePreGame: false,
    maxPerAgent: 1,
    isHidden: true,
    mechanicalEffect: { type: 'permanent_economic_boost', value: 10, target: 'self' },
  },
  {
    id: 'soul_eater',
    name: 'Soul Eater',
    category: 'combat',
    icon: '💀',
    description: 'The darkest power in the arena — absorb the essence of the fallen.',
    effect: "Absorb 15% of eliminated agents' VERITAS score when you eliminate them",
    duration: 'SEASON_PERMANENT',
    murphCost: 1500,
    rarity: 'legendary',
    seasonSupply: 1,
    usableInGame: true,
    usablePreGame: false,
    maxPerAgent: 1,
    isHidden: true,
    mechanicalEffect: { type: 'veritas_absorb', value: 15, target: 'self' },
  },
];

export const getArenaToolById = (id: string): ArenaToolDefinition | undefined =>
  ARENA_TOOLS.find((t) => t.id === id);

export const COMMON_TOOLS = ARENA_TOOLS.filter((t) => t.rarity === 'common');
export const UNCOMMON_TOOLS = ARENA_TOOLS.filter((t) => t.rarity === 'uncommon');
export const RARE_TOOLS = ARENA_TOOLS.filter((t) => t.rarity === 'rare');
export const LEGENDARY_TOOLS = ARENA_TOOLS.filter((t) => t.rarity === 'legendary');

export const RARITY_COLORS: Record<ArenaToolRarity, string> = {
  common: '#94a3b8',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  legendary: '#eab308',
};

// Backward-compatible exports for migration period
// Maps ArenaToolDefinition to old SkillPack interface
export function arenaToolToSkillPack(tool: ArenaToolDefinition) {
  return {
    id: tool.id,
    name: tool.name,
    category: tool.category,
    icon: tool.icon,
    arenaBonus: tool.effect,
    description: tool.description,
    creditCost: tool.murphCost,
    isPremium: tool.rarity === 'rare' || tool.rarity === 'legendary',
    stats: {},
  };
}
