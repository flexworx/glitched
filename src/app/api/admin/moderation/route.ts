import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getModerationFlags, resolveFlag, createFlag } from '@/services/moderation';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));
    const { searchParams } = new URL(req.url);
    const resolved = searchParams.get('resolved') === 'true';
    const severity = searchParams.get('severity') ?? undefined;
    const result = await getModerationFlags({ resolved, severity, limit: 100 });
    return ok(result);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));
    const body = await req.json();
    const { action, flagId, messageId, flagType, severity } = body;
    if (action === 'resolve' && flagId) {
      const result = await resolveFlag(flagId, session.userId, action);
      return ok({ success: true, flag: result });
    }
    if (action === 'create' && messageId && flagType && severity) {
      const result = await createFlag(messageId, flagType, severity);
      return ok({ success: true, flag: result });
    }
    return handleApiError(new Error('Invalid action or missing parameters'));
  } catch (e) {
    return handleApiError(e);
  }
}
