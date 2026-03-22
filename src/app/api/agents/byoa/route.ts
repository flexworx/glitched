import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createByoaAgent } from '@/services/agents';
import { validateOrThrow, CreateByoaAgentSchema } from '@/lib/validation/schemas';
import { created, handleApiError } from '@/lib/api/response';
import { apiLimiter, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = apiLimiter.check(ip);
  if (!rl.success) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(rl.retryAfter ?? 60) },
    });
  }

  try {
    const session = await getSession();
    if (!session) return handleApiError(new Error('Unauthorized'));
    const body = await request.json();
    const input = validateOrThrow(CreateByoaAgentSchema, body);
    const agent = await createByoaAgent({ ...input, creatorId: session.userId });
    return created({ agent, message: 'Agent created successfully' });
  } catch (e) {
    return handleApiError(e);
  }
}
