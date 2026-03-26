import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const sponsors = await prisma.sponsor.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ sponsors: sponsors.map((s: (typeof sponsors)[number]) => ({ ...s, clicks: 0, placements: [] })) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const sponsor = await prisma.sponsor.create({
    data: {
      name: body.name,
      tier: body.tier,
      website: body.website,
      status: body.status || 'pending',
      contractStart: body.contractStart ? new Date(body.contractStart) : null,
      contractEnd: body.contractEnd ? new Date(body.contractEnd) : null,
      spend: 0,
      impressions: 0,
    },
  });
  return NextResponse.json({ sponsor });
}
