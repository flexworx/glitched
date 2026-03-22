import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getSystemStats, adminStartMatch, adminStopMatch } from '@/services/admin';
import { validateOrThrow, AdminMatchActionSchema } from '@/lib/validation/schemas';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));
    const stats = await getSystemStats();
    return ok(stats);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));
    const body = await req.json();
    const input = validateOrThrow(AdminMatchActionSchema, body);
    let result;
    if (input.action === 'start') {
      result = await adminStartMatch(input.matchId, session.userId);
    } else if (input.action === 'stop') {
      result = await adminStopMatch(input.matchId, session.userId, input.reason ?? 'Admin stopped');
    } else {
      return handleApiError(new Error(`Action '${input.action}' not yet implemented`));
    }
    return ok({ success: true, match: result });
  } catch (e) {
    return handleApiError(e);
  }
}
