import { NextRequest } from 'next/server';
import { reviewDispute } from '@/services/seasons';
import { ok, handleApiError } from '@/lib/api/response';
import { requireAdmin, getSession } from '@/lib/auth/session';
import { z } from 'zod';

const ReviewSchema = z.object({
  status: z.enum(['UPHELD','REJECTED','ESCALATED','UNDER_REVIEW']),
  reviewNotes: z.string().min(1),
  penaltyReversed: z.boolean().optional(),
});

type Params = { params: { disputeId: string } };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const session = await getSession();
    const body = ReviewSchema.parse(await req.json());
    const dispute = await reviewDispute(params.disputeId, {
      ...body,
      reviewedBy: session?.userId ?? 'system',
    });
    return ok(dispute);
  } catch (e) { return handleApiError(e); }
}
