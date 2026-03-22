import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { listOpenPredictionPools, placeBet } from '@/services/predictions';
import { validateOrThrow, PlaceBetSchema } from '@/lib/validation/schemas';
import { ok, created, handleApiError } from '@/lib/api/response';
import { betLimiter, getClientIp } from '@/lib/rate-limit';

export async function GET(_req: NextRequest) {
  try {
    const pools = await listOpenPredictionPools();
    return ok({ pools, total: pools.length });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = betLimiter.check(ip);
  if (!rl.success) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(rl.retryAfter ?? 60) },
    });
  }

  try {
    const session = await getSession();
    if (!session) return handleApiError(new Error('Unauthorized'));
    const body = await req.json();
    const input = validateOrThrow(PlaceBetSchema, body);
    const prediction = await placeBet({ ...input, userId: session.userId });
    return created({ prediction, message: 'Bet placed successfully' });
  } catch (e) {
    return handleApiError(e);
  }
}
