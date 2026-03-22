import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { listMatches, createMatch } from '@/services/matches';
import { validateOrThrow, CreateMatchSchema } from '@/lib/validation/schemas';
import { ok, created, handleApiError } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') ?? undefined;
    const seasonId = searchParams.get('seasonId') ?? undefined;
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);
    const result = await listMatches({ status, seasonId, limit, offset });
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
    const input = validateOrThrow(CreateMatchSchema, body);
    const match = await createMatch(input);
    return created({ match });
  } catch (e) {
    return handleApiError(e);
  }
}
