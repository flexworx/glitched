import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session as { userId: string }).userId;

  const wallet = await prisma.userWallet.findUnique({ where: { userId } });
  if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });

  // In a real implementation, this would check pending staking rewards
  return NextResponse.json({ success: true, claimed: 0, message: 'No pending rewards to claim' });
}
