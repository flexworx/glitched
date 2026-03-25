import { NextRequest } from 'next/server';
import { getTemplateById, updateTemplate, archiveTemplate } from '@/services/game-vault';
import { ok, handleApiError } from '@/lib/api/response';
import { requireAdmin } from '@/lib/auth/session';
import { z } from 'zod';

const UpdateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  displayTitle: z.string().min(1).max(100).optional(),
  category: z.enum([
    'CHANCE', 'INTELLIGENCE', 'SOCIAL', 'STRATEGY',
    'PERFORMANCE', 'POKER', 'ENDURANCE', 'CUSTOM',
  ]).optional(),
  description: z.string().min(1).optional(),
  systemPrompt: z.string().min(1).optional(),
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
});

type Params = { params: { templateId: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const template = await getTemplateById(params.templateId);
    if (!template) throw new Error('Template not found');
    return ok(template);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const body = UpdateTemplateSchema.parse(await req.json());
    const template = await updateTemplate(params.templateId, body);
    return ok(template);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const template = await archiveTemplate(params.templateId);
    return ok(template);
  } catch (e) {
    return handleApiError(e);
  }
}
