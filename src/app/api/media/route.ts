import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 100);
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

  try {
    const where = type ? { type } : {};

    const [highlights, total] = await Promise.all([
      prisma.highlight.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          matchId: true,
          type: true,
          description: true,
          videoUrl: true,
          thumbnailUrl: true,
          dramaScore: true,
          timestamp: true,
        },
      }),
      prisma.highlight.count({ where }),
    ]);

    return NextResponse.json({
      clips: highlights,
      total,
      limit,
      offset,
    });
  } catch (err) {
    console.error('[MEDIA] Database query error:', err);
    return NextResponse.json({ clips: [], total: 0, limit, offset }, { status: 200 });
  }
}
