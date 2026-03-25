import { NextRequest } from 'next/server';
import { listTemplates, createTemplate } from '@/services/game-vault';
import { ok, created, handleApiError } from '@/lib/api/response';
import { requireAdmin } from '@/lib/auth/session';
import { z } from 'zod';

const CreateTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  displayTitle: z.string().min(1).max(100),
  category: z.enum([
    'CHANCE', 'INTELLIGENCE', 'SOCIAL', 'STRATEGY',
    'PERFORMANCE', 'POKER', 'ENDURANCE', 'CUSTOM',
  ]),
  description: z.string().min(1),
  systemPrompt: z.string().min(1),
  minAgents: z.number().int().min(2).max(200).optional(),
  maxAgents: z.number().int().min(2).max(200).optional(),
  eliminationRule: z.enum([
    'HALF', 'FIXED', 'BOTTOM', 'VOTE', 'SCORE_BASED', 'LAST_STANDING', 'BRACKET',
  ]).optional(),
  eliminationCount: z.number().int().positive().optional(),
  scoringMethod: z.enum([
    'VOTE', 'SCORE', 'SPEED', 'SURVIVAL', 'ELIMINATION', 'POKER', 'TERRITORY', 'HYBRID',
  ]).optional(),
  scoringLogic: z.record(z.unknown()).optional(),
  creditRewards: z.record(z.unknown()).optional(),
  estimatedDuration: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'TESTING', 'PUBLISHED', 'ARCHIVED']).optional(),
  recommendedRounds: z.array(z.string()).optional(),
  recommendedAgents: z.array(z.string()).optional(),
  teamFormation: z.record(z.unknown()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const category = url.searchParams.get('category') as any;
    const status = url.searchParams.get('status') as any;
    const search = url.searchParams.get('search') || undefined;
    const tagsParam = url.searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',') : undefined;

    const templates = await listTemplates({
      category: category || undefined,
      status: status || undefined,
      search,
      tags,
    });
    return ok({ templates, total: templates.length });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = CreateTemplateSchema.parse(await req.json());
    const template = await createTemplate({
      ...body,
      createdBy: session.userId,
    });
    return created(template);
  } catch (e) {
    return handleApiError(e);
  }
}
