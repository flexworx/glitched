import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { ok, created, handleApiError } from '@/lib/api/response';

export async function GET() {
  try {
    const challenge = await prisma.challenge.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { actualStartAt: 'desc' },
      include: {
        rules: { where: { isActive: true }, orderBy: { orderIndex: 'asc' } },
        season: { select: { name: true, number: true } },
      },
    });
    if (!challenge) return NextResponse.json(null);
    return NextResponse.json(challenge);
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch active challenge' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
