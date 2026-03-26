import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getSession } from '@/lib/auth/session';
import { getTierProgress, getNextTier, STATUS_TIERS } from '@/lib/utils/status-tiers';
import type { HumanStatusTierName } from '@/lib/utils/status-tiers';



export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const lifetimeMurph = user.lifetimeMurph ?? 0;
    const seasonMurph = user.seasonMurph ?? 0;
    const statusTier = (user.statusTier as HumanStatusTierName) || 'BOOTLOADER';
    const progress = getTierProgress(lifetimeMurph);
    const nextTier = getNextTier(statusTier);

    return NextResponse.json({
      lifetimeMurph,
      seasonMurph,
      statusTier,
      currentTier: progress.current,
      nextTier: progress.next,
      progress: progress.progress,
      murphToNext: progress.murphToNext,
      perks: progress.current.perks,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
