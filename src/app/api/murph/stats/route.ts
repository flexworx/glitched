import { NextRequest } from 'next/server';
import { getMurphStats } from '@/services/economy';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(_req: NextRequest) {
  try {
    const stats = await getMurphStats();
    return ok(stats);
  } catch (e) {
    return handleApiError(e);
  }
}
