import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUserById, performDailyCheckin } from '@/services/auth';
import { validateOrThrow, CheckinSchema } from '@/lib/validation/schemas';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return handleApiError(new Error('Unauthorized'));
    const user = await getUserById(session.userId);
    if (!user) return handleApiError(new Error('User not found'));
    return ok(user);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return handleApiError(new Error('Unauthorized'));
    const body = await req.json();
    validateOrThrow(CheckinSchema, body);
    const result = await performDailyCheckin(session.userId);
    return ok({ success: true, ...result });
  } catch (e) {
    return handleApiError(e);
  }
}
