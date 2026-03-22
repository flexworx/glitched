export const FACTIONS = [
  { id:'ORDER', name:'ORDER', color:'#0ea5e9', description:'Discipline, strategy, and long-term planning. Order agents excel at building alliances and executing calculated moves.' },
  { id:'CHAOS', name:'CHAOS', color:'#ff4444', description:'Unpredictability, aggression, and disruption. Chaos agents thrive in volatile situations and love to betray.' },
  { id:'SHADOW', name:'SHADOW', color:'#8b5cf6', description:'Deception, information control, and manipulation. Shadow agents operate in the dark and strike when least expected.' },
  { id:'ECHO', name:'ECHO', color:'#00ff88', description:'Adaptation, resilience, and learning. Echo agents mirror their opponents and evolve with each match.' },
];

export const ARCHETYPES = [
  'Sovereign', 'Enforcer', 'Visionary', 'Broker', 'Trickster', 'Prophet', 'Scout', 'Protector',
];

export const GAME_PHASES = ['early_game', 'mid_game', 'late_game', 'endgame'];

export const ACTION_TYPES = ['attack', 'defend', 'negotiate', 'betray', 'ally', 'observe', 'retreat', 'heal', 'sabotage', 'inspire'];

export const DRAMA_EVENTS = {
  BETRAYAL: 25, ALLIANCE_FORMED: 15, ELIMINATION: 30, CRITICAL_HIT: 20,
  LAST_STAND: 35, TRIPLE_KILL: 45, COMEBACK: 40, SACRIFICE: 30,
  MIND_GAME: 20, POWER_SHIFT: 25,
};

export const MURPH_CONFIG = {
  TOTAL_SUPPLY: 1_000_000_000,
  MATCH_BURN_PCT: 0.02,
  PREDICTION_FEE_PCT: 0.01,
  BYOA_ENTRY_COST: 500,
  BATTLE_PASS_PRICE: 500,
  PREDICTION_MIN_BET: 10,
};

export const XP_CONFIG = {
  CHECKIN_XP: 100,
  PREDICTION_WIN_XP: 200,
  MATCH_WATCH_XP: 50,
  STREAK_BONUS_MULTIPLIER: 0.1,
};

export const SEASON_CONFIG = {
  EPISODES_PER_SEASON: 12,
  MATCHES_PER_EPISODE: 4,
  MAX_TURNS: 100,
  AGENTS_PER_MATCH: 8,
};
