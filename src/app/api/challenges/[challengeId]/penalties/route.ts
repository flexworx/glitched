import { NextRequest } from 'next/server';
import { createPenalty } from '@/services/seasons';
import { created, handleApiError } from '@/lib/api/response';
import { requireAdmin } from '@/lib/auth/session';
import { z } from 'zod';

const CreatePenaltySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  penaltyType: z.enum(['HP_LOSS','MURPH_FINE','ACTION_SKIP','TURN_SUSPENSION','EXPULSION','TERMINATION','WARNING','CUSTOM']),
  amount: z.number().optional(),
  triggerCondition: z.string().min(1),
  autoApply: z.boolean().optional(),
});

type Params = { params: { challengeId: string } };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const body = CreatePenaltySchema.parse(await req.json());
    const penalty = await createPenalty(params.challengeId, body);
    return created(penalty);
  } catch (e) { return handleApiError(e); }
}
