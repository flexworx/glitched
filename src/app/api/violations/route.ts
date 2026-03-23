import { NextRequest } from 'next/server';
import { applyViolation, listViolations } from '@/services/seasons';
import { ok, created, handleApiError } from '@/lib/api/response';
import { requireAdmin, getSession } from '@/lib/auth/session';
import { z } from 'zod';

const ApplyViolationSchema = z.object({
  ruleId: z.string(),
  agentId: z.string(),
  matchId: z.string().optional(),
  penaltyType: z.enum(['HP_LOSS','MURPH_FINE','ACTION_SKIP','TURN_SUSPENSION','EXPULSION','TERMINATION','WARNING','CUSTOM']),
  penaltyAmount: z.number().optional(),
  reason: z.string().min(1),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const violations = await listViolations(
      searchParams.get('agentId') ?? undefined,
      searchParams.get('ruleId') ?? undefined,
    );
    return ok({ violations, total: violations.length });
  } catch (e) { return handleApiError(e); }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const session = await getSession();
    const body = ApplyViolationSchema.parse(await req.json());
    const violation = await applyViolation({
      ...body,
      appliedBy: session?.userId ?? 'system',
    });
    return created(violation);
  } catch (e) { return handleApiError(e); }
}
