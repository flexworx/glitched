import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUserWalletBalance } from '@/services/economy';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return handleApiError(new Error('Unauthorized'));
    const wallet = await getUserWalletBalance(session.userId);
    if (!wallet) return handleApiError(new Error('Wallet not found'));
    return ok(wallet);
  } catch (e) {
    return handleApiError(e);
  }
}
