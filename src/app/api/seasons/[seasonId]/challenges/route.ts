import { NextRequest } from 'next/server';
import { listChallenges, createChallenge } from '@/services/seasons';
import { ok, created, handleApiError } from '@/lib/api/response';
import { requireAdmin, getSession } from '@/lib/auth/session';
import { z } from 'zod';

const CreateChallengeSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  instructions: z.string().min(1),
  publicSummary: z.string().min(1),
  orderIndex: z.number().int().optional(),
  scheduledStartAt: z.string().datetime().optional(),
  scheduledEndAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().positive().optional(),
  complianceWindowMinutes: z.number().int().positive().optional(),
  targetAllAgents: z.boolean().optional(),
  targetAgentIds: z.array(z.string()).optional(),
});

type Params = { params: { seasonId: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const challenges = await listChallenges(params.seasonId);
    return ok({ challenges, total: challenges.length });
  } catch (e) { return handleApiError(e); }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const session = await getSession();
    const body = CreateChallengeSchema.parse(await req.json());
    const challenge = await createChallenge(params.seasonId, {
      ...body,
      scheduledStartAt: body.scheduledStartAt ? new Date(body.scheduledStartAt) : undefined,
      scheduledEndAt: body.scheduledEndAt ? new Date(body.scheduledEndAt) : undefined,
      createdBy: session?.userId ?? 'system',
    });
    return created(challenge);
  } catch (e) { return handleApiError(e); }
}
