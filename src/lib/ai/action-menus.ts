/**
 * Action Menus — Define allowed actions per GameCategory
 */

export type GameCategory =
  | 'CHANCE'
  | 'INTELLIGENCE'
  | 'SOCIAL'
  | 'STRATEGY'
  | 'PERFORMANCE'
  | 'POKER'
  | 'ENDURANCE'
  | 'CUSTOM';

const ACTION_MENUS: Record<GameCategory, string[]> = {
  CHANCE: ['claim_score', 'vote_liar', 'trade_number', 'form_alliance', 'observe'],
  INTELLIGENCE: ['submit_answer', 'collaborate', 'withhold', 'observe', 'challenge'],
  SOCIAL: [
    'pitch', 'vote', 'campaign', 'form_alliance', 'break_alliance',
    'bribe', 'cooperate', 'defect', 'accuse', 'defend', 'observe',
  ],
  STRATEGY: [
    'claim_territory', 'attack', 'defend', 'form_alliance',
    'break_alliance', 'trade', 'retreat', 'observe',
  ],
  PERFORMANCE: ['perform', 'roast', 'answer', 'sabotage', 'observe'],
  POKER: ['fold', 'check', 'call', 'raise', 'all_in', 'table_talk'],
  ENDURANCE: ['submit_content', 'challenge_opponent', 'observe'],
  CUSTOM: ['submit_response', 'vote', 'challenge', 'form_alliance', 'observe'],
};

export function getActionMenu(category: GameCategory, overrides?: string[]): string[] {
  if (overrides && overrides.length > 0) {
    return overrides;
  }
  return ACTION_MENUS[category] ?? ACTION_MENUS.CUSTOM;
}
