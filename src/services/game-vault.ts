/**
 * Game Vault Service — Template & Season Game Management
 *
 * Manages game templates (reusable game definitions), easter egg definitions,
 * season games (templates assigned to seasons with overrides), and prompt
 * variable injection.
 */
import { prisma } from '@/lib/db/client';
import type {
  GameCategory,
  EliminationRule,
  ScoringMethod,
  TemplateStatus,
  EasterEggTrigger,
  ChallengeStatus,
} from '@prisma/client';

// ─── GAME TEMPLATES ───────────────────────────────────────────

export async function listTemplates(filters?: {
  category?: GameCategory;
  status?: TemplateStatus;
  search?: string;
  tags?: string[];
}) {
  return prisma.gameTemplate.findMany({
    where: {
      ...(filters?.category ? { category: filters.category } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' as const } },
              { displayTitle: { contains: filters.search, mode: 'insensitive' as const } },
              { description: { contains: filters.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(filters?.tags?.length ? { tags: { hasSome: filters.tags } } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      easterEggs: { include: { easterEgg: true } },
      _count: { select: { seasonGames: true } },
    },
  });
}

export async function getTemplateById(id: string) {
  return prisma.gameTemplate.findUnique({
    where: { id },
    include: {
      easterEggs: { include: { easterEgg: true } },
      seasonGames: {
        include: { season: { select: { id: true, name: true, number: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
}

export async function createTemplate(data: {
  name: string;
  displayTitle: string;
  category: GameCategory;
  description: string;
  systemPrompt: string;
  minAgents?: number;
  maxAgents?: number;
  eliminationRule?: EliminationRule;
  eliminationCount?: number;
  scoringMethod?: ScoringMethod;
  scoringLogic?: object;
  creditRewards?: object;
  estimatedDuration?: number;
  tags?: string[];
  status?: TemplateStatus;
  createdBy: string;
}) {
  return prisma.gameTemplate.create({
    data: {
      name: data.name,
      displayTitle: data.displayTitle,
      category: data.category,
      description: data.description,
      systemPrompt: data.systemPrompt,
      minAgents: data.minAgents ?? 2,
      maxAgents: data.maxAgents ?? 26,
      eliminationRule: data.eliminationRule ?? 'HALF',
      eliminationCount: data.eliminationCount,
      scoringMethod: data.scoringMethod ?? 'SCORE',
      scoringLogic: data.scoringLogic ?? {},
      creditRewards: data.creditRewards ?? {
        survive: 200,
        win: 500,
        mvp: 300,
        eliminateStealPct: 50,
      },
      estimatedDuration: data.estimatedDuration ?? 180,
      tags: data.tags ?? [],
      status: data.status ?? 'DRAFT',
      createdBy: data.createdBy,
    },
  });
}

export async function updateTemplate(
  id: string,
  data: Partial<{
    name: string;
    displayTitle: string;
    category: GameCategory;
    description: string;
    systemPrompt: string;
    minAgents: number;
    maxAgents: number;
    eliminationRule: EliminationRule;
    eliminationCount: number;
    scoringMethod: ScoringMethod;
    scoringLogic: object;
    creditRewards: object;
    estimatedDuration: number;
    tags: string[];
    status: TemplateStatus;
  }>
) {
  const shouldVersion =
    data.systemPrompt || data.eliminationRule || data.scoringMethod;

  return prisma.gameTemplate.update({
    where: { id },
    data: {
      ...data,
      ...(shouldVersion ? { version: { increment: 1 } } : {}),
    },
  });
}

export async function publishTemplate(id: string) {
  return prisma.gameTemplate.update({
    where: { id },
    data: { status: 'PUBLISHED' },
  });
}

export async function archiveTemplate(id: string) {
  return prisma.gameTemplate.update({
    where: { id },
    data: { status: 'ARCHIVED' },
  });
}

export async function duplicateTemplate(id: string, createdBy: string) {
  const original = await prisma.gameTemplate.findUnique({ where: { id } });
  if (!original) throw new Error('Template not found');

  return prisma.gameTemplate.create({
    data: {
      name: `${original.name} (Copy)`,
      displayTitle: original.displayTitle,
      category: original.category,
      description: original.description,
      systemPrompt: original.systemPrompt,
      minAgents: original.minAgents,
      maxAgents: original.maxAgents,
      eliminationRule: original.eliminationRule,
      eliminationCount: original.eliminationCount,
      scoringMethod: original.scoringMethod,
      scoringLogic: original.scoringLogic as object,
      creditRewards: original.creditRewards as object,
      estimatedDuration: original.estimatedDuration,
      tags: original.tags,
      status: 'DRAFT',
      createdBy,
    },
  });
}

// ─── EASTER EGG DEFINITIONS ──────────────────────────────────

export async function listEasterEggs() {
  return prisma.easterEggDefinition.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}

export async function createEasterEgg(data: {
  name: string;
  icon: string;
  description: string;
  effectType: string;
  effectConfig?: object;
}) {
  return prisma.easterEggDefinition.create({
    data: {
      name: data.name,
      icon: data.icon,
      description: data.description,
      effectType: data.effectType,
      effectConfig: data.effectConfig ?? {},
    },
  });
}

export async function attachEasterEggToTemplate(
  templateId: string,
  easterEggId: string,
  probability: number = 0.1,
  trigger: EasterEggTrigger = 'RANDOM',
  triggerConfig: object = {}
) {
  return prisma.gameTemplateEasterEgg.create({
    data: { templateId, easterEggId, probability, trigger, triggerConfig },
  });
}

export async function removeEasterEggFromTemplate(
  templateId: string,
  easterEggId: string
) {
  return prisma.gameTemplateEasterEgg.deleteMany({
    where: { templateId, easterEggId },
  });
}

// ─── SEASON GAMES ─────────────────────────────────────────────

export async function getSeasonGamePlan(seasonId: string) {
  return prisma.seasonGame.findMany({
    where: { seasonId },
    orderBy: { orderIndex: 'asc' },
    include: {
      template: {
        include: { easterEggs: { include: { easterEgg: true } } },
      },
      easterEggs: { include: { easterEgg: true } },
    },
  });
}

export async function addGameToSeason(data: {
  seasonId: string;
  templateId: string;
  orderIndex: number;
  eliminationOverride?: number;
  durationOverride?: number;
  creditOverrides?: object;
  promptOverride?: string;
  scheduledStartAt?: Date;
  scheduledEndAt?: Date;
}) {
  return prisma.seasonGame.create({
    data: {
      seasonId: data.seasonId,
      templateId: data.templateId,
      orderIndex: data.orderIndex,
      eliminationOverride: data.eliminationOverride,
      durationOverride: data.durationOverride,
      creditOverrides: data.creditOverrides,
      promptOverride: data.promptOverride,
      scheduledStartAt: data.scheduledStartAt,
      scheduledEndAt: data.scheduledEndAt,
    },
  });
}

export async function updateSeasonGame(
  id: string,
  data: Partial<{
    orderIndex: number;
    eliminationOverride: number;
    durationOverride: number;
    creditOverrides: object;
    promptOverride: string;
    scheduledStartAt: Date;
    scheduledEndAt: Date;
    status: ChallengeStatus;
    results: object;
  }>
) {
  return prisma.seasonGame.update({ where: { id }, data });
}

export async function removeGameFromSeason(id: string) {
  return prisma.seasonGame.delete({ where: { id } });
}

export async function reorderSeasonGames(
  seasonId: string,
  orderedIds: string[]
) {
  const updates = orderedIds.map((id, index) =>
    prisma.seasonGame.update({
      where: { id },
      data: { orderIndex: index + 1 },
    })
  );
  return prisma.$transaction(updates);
}

// ─── PROMPT VARIABLE INJECTION ────────────────────────────────

interface PromptVariables {
  current_game_number: number;
  current_game_name: string;
  agents_remaining: number;
  active_agent_names: string;
  eliminated_agent_names: string;
  your_name: string;
  your_credits: number;
  credit_standings: string;
  oracle_odds: string;
  previous_game_results: string;
  agent_secret_score?: number;
  your_personality_summary?: string;
  alliance_map?: string;
  veritas_scores?: string;
  accused_agent?: string;
  made_up_crime?: string;
  prosecutor_agent?: string;
  defense_agent?: string;
  judge_agent?: string;
  [key: string]: string | number | undefined;
}

/**
 * Injects real game state values into a template's system prompt.
 * Replaces all {variable_name} placeholders with actual values.
 */
export function injectPromptVariables(
  systemPrompt: string,
  variables: Partial<PromptVariables>
): string {
  let result = systemPrompt;

  for (const [key, value] of Object.entries(variables)) {
    if (value === undefined || value === null) continue;
    const placeholder = `{${key}}`;
    result = result.split(placeholder).join(String(value));
  }

  const unresolvedMatches = result.match(/\{[a-z_]+\}/g);
  if (unresolvedMatches) {
    console.warn(
      `[GameVault] Unresolved prompt variables: ${unresolvedMatches.join(', ')}`
    );
  }

  return result;
}

/**
 * Resolves the effective game configuration for a season game,
 * merging template defaults with per-game overrides.
 */
export async function resolveGameConfig(seasonGameId: string) {
  const seasonGame = await prisma.seasonGame.findUnique({
    where: { id: seasonGameId },
    include: {
      template: true,
      easterEggs: { include: { easterEgg: true } },
    },
  });

  if (!seasonGame) throw new Error('Season game not found');

  const template = seasonGame.template;
  const templateCredits = template.creditRewards as Record<string, number>;
  const overrideCredits = seasonGame.creditOverrides as Record<
    string,
    number
  > | null;

  return {
    gameId: seasonGame.id,
    templateId: template.id,
    name: template.name,
    displayTitle: template.displayTitle,
    category: template.category,
    systemPrompt: seasonGame.promptOverride || template.systemPrompt,
    eliminationRule: template.eliminationRule,
    eliminationCount: seasonGame.eliminationOverride ?? template.eliminationCount,
    scoringMethod: template.scoringMethod,
    scoringLogic: template.scoringLogic,
    duration: seasonGame.durationOverride ?? template.estimatedDuration,
    creditRewards: {
      ...templateCredits,
      ...(overrideCredits || {}),
    },
    easterEggs: seasonGame.easterEggs.map((e) => ({
      id: e.id,
      name: e.easterEgg.name,
      icon: e.easterEgg.icon,
      effectType: e.easterEgg.effectType,
      probability: e.probability,
      trigger: e.trigger,
      triggerConfig: e.triggerConfig,
      wasTriggered: e.wasTriggered,
    })),
    minAgents: template.minAgents,
    maxAgents: template.maxAgents,
  };
}
