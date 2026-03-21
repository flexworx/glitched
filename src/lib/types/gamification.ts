// Gamification types for Glitched.gg
export interface XpEvent {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  matchId?: string;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  murphReward: number;
  badgeImage?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: string;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivity: Date;
  freezesLeft: number;
  multiplier: number;
}

export interface Faction {
  id: string;
  name: string;
  description: string;
  color: string;
  mascotAgentId?: string;
  memberCount: number;
  totalScore: number;
}

export interface FantasyRoster {
  id: string;
  userId: string;
  seasonId: string;
  name: string;
  agents: string[];
  totalScore: number;
  rank?: number;
}

export interface BattlePassTier {
  tier: number;
  xpRequired: number;
  freeReward?: BattlePassReward;
  premiumReward?: BattlePassReward;
}

export interface BattlePassReward {
  type: 'murph' | 'cosmetic' | 'agent_card' | 'profile_effect' | 'xp_boost';
  value: number | string;
  description: string;
}

export const XP_EVENTS = {
  WATCH_FULL_MATCH: 50,
  CORRECT_PREDICTION: 100,
  DAILY_LOGIN: 25,
  STREAK_BONUS: 10,
  ACHIEVEMENT_UNLOCK: 200,
  FACTION_WIN: 150,
  FANTASY_WIN: 300,
  FIRST_PREDICTION: 75,
  SHARE_HIGHLIGHT: 30,
};
