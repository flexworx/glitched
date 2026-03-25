/**
 * Template Loader — Loads game configuration from the Game Vault
 *
 * Bridges the Game Vault service with the match engine by resolving
 * a SeasonGame into a full game configuration.
 */
import { resolveGameConfig } from '@/services/game-vault';

export interface GameConfig {
  gameId: string;
  templateId: string;
  name: string;
  displayTitle: string;
  category: string;
  systemPrompt: string;
  eliminationRule: string;
  eliminationCount: number | null;
  scoringMethod: string;
  scoringLogic: unknown;
  duration: number;
  creditRewards: Record<string, number>;
  easterEggs: Array<{
    id: string;
    name: string;
    icon: string;
    effectType: string;
    probability: number;
    trigger: string;
    triggerConfig: unknown;
    wasTriggered: boolean;
  }>;
  minAgents: number;
  maxAgents: number;
}

/**
 * Load the full game configuration for a season game.
 * Merges template defaults with per-game overrides.
 */
export async function loadGameConfig(seasonGameId: string): Promise<GameConfig> {
  return resolveGameConfig(seasonGameId);
}
