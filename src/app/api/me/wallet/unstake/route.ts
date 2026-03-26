import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session as { userId: string }).userId;

  const { amount } = await req.json();
  if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

  const wallet = await prisma.userWallet.findUnique({ where: { userId } });
  if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });

  await prisma.userWallet.update({
    where: { id: wallet.id },
    data: { murphBalance: { increment: amount } },
  });

  await prisma.murphTransaction.create({
    data: {
      userWalletId: wallet.id,
      amount,
      txType: 'WITHDRAWAL',
      description: `Unstaked ${amount} $MURPH`,
    },
  });

  return NextResponse.json({ success: true, unstaked: amount });
}
