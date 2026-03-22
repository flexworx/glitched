import { NextRequest } from 'next/server';
import { getMurphTransactions } from '@/services/economy';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);
    const transactions = await getMurphTransactions(limit, offset);
    return ok({ transactions, total: transactions.length });
  } catch (e) {
    return handleApiError(e);
  }
}
