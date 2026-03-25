import { NextResponse } from 'next/server';
import prisma from '@/lib/db/client';
import { getTierProgress, getNextTier, STATUS_TIERS } from '@/lib/utils/status-tiers';
import type { HumanStatusTierName } from '@/lib/utils/status-tiers';



export async function GET(request: Request) {
  try {
    // In production, get userId from auth session
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

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
