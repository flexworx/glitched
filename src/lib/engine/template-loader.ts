/**
 * Template Loader - Schema Migration Pending
 * Models required: GameTemplate, GameConfig
 */

export interface GameConfig {
  maxTurns?: number;
  startingHp?: number;
  allianceEnabled?: boolean;
  betrayalEnabled?: boolean;
  resourcesEnabled?: boolean;
  category?: string;
  easterEggs?: Array<Record<string, unknown>>;
  eliminationRule?: string;
  eliminationCount?: number;
  creditRewards?: Record<string, number>;
  scoringMethod?: string;
  [key: string]: unknown;
}

export const templateLoader = {
  async loadTemplate(templateId: string): Promise<GameConfig | null> {
    return null;
  },
  async listTemplates(): Promise<unknown[]> {
    return [];
  },
};
