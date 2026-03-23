import { NextRequest } from 'next/server';
import { activateChallenge } from '@/services/seasons';
import { ok, handleApiError } from '@/lib/api/response';
import { requireAdmin } from '@/lib/auth/session';

type Params = { params: { challengeId: string } };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const challenge = await activateChallenge(params.challengeId);
    return ok(challenge);
  } catch (e) { return handleApiError(e); }
}
