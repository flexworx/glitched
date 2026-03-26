import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const highlights = await prisma.matchHighlight.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  type HL = (typeof highlights)[number];
  return NextResponse.json({
    media: highlights.map((h: HL) => ({
      id: h.id,
      type: 'highlight',
      title: h.title || 'Match Highlight',
      matchId: h.matchId,
      url: h.videoUrl || '',
      duration: h.duration,
      views: h.views || 0,
      shares: h.shares || 0,
      status: 'published',
      createdAt: h.createdAt,
    })),
  });
}
