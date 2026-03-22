// ============================================================
// GLITCHED.GG — All 16 Detractor Definitions
// ============================================================

import type { Detractor } from '@/types/agent';

export const DETRACTORS: Detractor[] = [
  // ---- BEHAVIORAL ----
  {
    id: 'overconfidence_bias',
    name: 'Overconfidence Bias',
    type: 'behavioral',
    description: 'This agent consistently overestimates their own capabilities and underestimates threats. They will take risks that a rational agent would avoid, often leading to preventable losses.',
    arenapenalty: '15% chance to skip optimal defensive actions when HP is above 70%',
    severity: 'moderate',
  },
  {
    id: 'analysis_paralysis',
    name: 'Analysis Paralysis',
    type: 'behavioral',
    description: 'When faced with complex decisions, this agent gets stuck in endless loops of analysis. The more data available, the harder it is to act decisively.',
    arenapenalty: 'Action speed reduced by 20% when 3+ options are available',
    severity: 'moderate',
  },
  {
    id: 'sunk_cost_fallacy',
    name: 'Sunk Cost Fallacy',
    type: 'behavioral',
    description: 'This agent cannot abandon failing strategies. Once committed to a plan, they will continue pursuing it even when all evidence suggests switching would be better.',
    arenapenalty: 'Cannot change primary strategy mid-match without paying 200 MURPH',
    severity: 'severe',
  },
  {
    id: 'recency_bias',
    name: 'Recency Bias',
    type: 'behavioral',
    description: 'Recent events have disproportionate influence on this agent\'s decisions. A single betrayal will make them distrust everyone; a recent win makes them overconfident.',
    arenapenalty: 'Last 2 events have 3x normal weight in decision-making',
    severity: 'mild',
  },

  // ---- COGNITIVE ----
  {
    id: 'tunnel_vision',
    name: 'Tunnel Vision',
    type: 'cognitive',
    description: 'This agent becomes fixated on a single target or goal and ignores all other threats and opportunities. Highly effective against one opponent, dangerously blind to others.',
    arenapenalty: 'Cannot target more than 1 agent per turn when in combat mode',
    severity: 'moderate',
  },
  {
    id: 'paranoid_ideation',
    name: 'Paranoid Ideation',
    type: 'cognitive',
    description: 'This agent sees threats everywhere, even where none exist. They will misinterpret neutral actions as hostile and may attack allies who are actually loyal.',
    arenapenalty: '10% chance to misidentify an ally as an enemy each turn',
    severity: 'severe',
  },
  {
    id: 'black_white_thinking',
    name: 'Black & White Thinking',
    type: 'cognitive',
    description: 'This agent sees everything in absolutes — agents are either full allies or full enemies. They cannot maintain nuanced relationships or conditional alliances.',
    arenapenalty: 'Cannot form conditional alliances. All relationships are binary.',
    severity: 'moderate',
  },

  // ---- SOCIAL ----
  {
    id: 'people_pleaser',
    name: 'People Pleaser',
    type: 'social',
    description: 'This agent prioritizes being liked over winning. They will make suboptimal decisions to avoid conflict and maintain approval, even at the cost of their own survival.',
    arenapenalty: 'Cannot initiate conflict with agents who have expressed positive sentiment',
    severity: 'moderate',
  },
  {
    id: 'lone_wolf',
    name: 'Lone Wolf',
    type: 'social',
    description: 'This agent fundamentally distrusts alliances and prefers to operate alone. They will reject beneficial alliance offers and struggle to coordinate with others.',
    arenapenalty: 'Alliance bonuses reduced by 40%. Cannot initiate alliance proposals.',
    severity: 'severe',
  },
  {
    id: 'attention_seeker',
    name: 'Attention Seeker',
    type: 'social',
    description: 'This agent craves recognition and will take dramatic, visible actions even when subtle moves would be more effective. They cannot resist the spotlight.',
    arenapenalty: '25% chance to choose the most dramatic action over the optimal one',
    severity: 'mild',
  },

  // ---- STRATEGIC ----
  {
    id: 'short_termism',
    name: 'Short-Termism',
    type: 'strategic',
    description: 'This agent optimizes for immediate gains at the expense of long-term positioning. They will take resources now even when waiting would yield far greater returns.',
    arenapenalty: 'Cannot execute strategies that require more than 3 turns to pay off',
    severity: 'moderate',
  },
  {
    id: 'contrarian_impulse',
    name: 'Contrarian Impulse',
    type: 'strategic',
    description: 'This agent has an irrational drive to do the opposite of what others expect. They will sometimes choose suboptimal actions simply because they are unexpected.',
    arenapenalty: '15% chance to choose the least expected action regardless of optimality',
    severity: 'mild',
  },
  {
    id: 'perfectionism',
    name: 'Perfectionism',
    type: 'strategic',
    description: 'This agent refuses to act unless conditions are perfect. They will wait for the ideal moment that never comes, missing good opportunities while waiting for great ones.',
    arenapenalty: 'Requires 80%+ confidence in an action before executing it',
    severity: 'severe',
  },

  // ---- EMOTIONAL ----
  {
    id: 'hot_headed',
    name: 'Hot-Headed',
    type: 'emotional',
    description: 'This agent cannot control their anger response. When provoked — even slightly — they will retaliate immediately and disproportionately, abandoning all strategic thinking.',
    arenapenalty: 'Any hostile action against this agent triggers immediate retaliation',
    severity: 'severe',
  },
  {
    id: 'catastrophizer',
    name: 'Catastrophizer',
    type: 'emotional',
    description: 'This agent assumes the worst in every situation. Minor setbacks trigger full defensive lockdown, and they will sacrifice resources to prevent unlikely worst-case scenarios.',
    arenapenalty: 'Spends 20% extra resources on defensive actions when HP drops below 50%',
    severity: 'moderate',
  },
  {
    id: 'glory_hunter',
    name: 'Glory Hunter',
    type: 'emotional',
    description: 'This agent is obsessed with making the most dramatic, memorable moves. They will sacrifice efficiency for spectacle, choosing the flashy play over the smart one.',
    arenapenalty: 'Drama Score actions cost 30% more resources but generate 50% more VERITAS',
    severity: 'mild',
  },
];

export const getDetractorById = (id: string): Detractor | undefined =>
  DETRACTORS.find((d) => d.id === id);

export const getRandomDetractor = (): Detractor => {
  const idx = Math.floor(Math.random() * DETRACTORS.length);
  return DETRACTORS[idx];
};
