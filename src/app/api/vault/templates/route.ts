import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { ok, created, handleApiError } from '@/lib/api/response';
import prisma from '@/lib/db/client';
import type { GameCategory, EliminationRule, ScoringMethod } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as GameCategory | null;
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const templates = await prisma.gameTemplate.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(status ? { status: status as 'DRAFT' | 'TESTING' | 'PUBLISHED' | 'ARCHIVED' } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search } },
            { displayTitle: { contains: search } },
          ],
        } : {}),
      },
      include: {
        easterEggs: { include: { easterEgg: true } },
        _count: { select: { seasonGames: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ok({ templates, total: templates.length });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));

    const body = await req.json();
    const {
      name, displayTitle, category, description, systemPrompt,
      minAgents = 2, maxAgents = 26,
      eliminationRule = 'HALF', eliminationCount,
      scoringMethod = 'SCORE', scoringLogic = {},
      creditRewards = { survive: 200, win: 500, mvp: 300, eliminateStealPct: 50 },
      estimatedDuration = 180, tags = [],
      recommendedRounds = [], recommendedAgents = [], teamFormation = {},
    } = body as {
      name: string; displayTitle: string; category: GameCategory;
      description: string; systemPrompt: string;
      minAgents?: number; maxAgents?: number;
      eliminationRule?: EliminationRule; eliminationCount?: number;
      scoringMethod?: ScoringMethod; scoringLogic?: object;
      creditRewards?: object; estimatedDuration?: number; tags?: string[];
      recommendedRounds?: string[]; recommendedAgents?: string[]; teamFormation?: object;
    };

    if (!name || !displayTitle || !category || !description || !systemPrompt) {
      return handleApiError(new Error('Missing required fields: name, displayTitle, category, description, systemPrompt'));
    }

    const template = await prisma.gameTemplate.create({
      data: {
        name, displayTitle, category, description, systemPrompt,
        minAgents, maxAgents,
        eliminationRule, eliminationCount,
        scoringMethod, scoringLogic, creditRewards,
        estimatedDuration, tags,
        recommendedRounds, recommendedAgents, teamFormation,
        createdBy: session.userId,
      },
    });

    return created({ template });
  } catch (e) {
    return handleApiError(e);
  }
}
