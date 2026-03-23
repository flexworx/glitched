import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { ok, created, handleApiError } from '@/lib/api/response';

export async function GET(_req: NextRequest, { params }: { params: { challengeId: string } }) {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: params.challengeId },
      include: {
        rules: { orderBy: { orderIndex: 'asc' } },
        season: { select: { id: true, name: true, number: true } },
        _count: { select: { disputes: true, operatorInstructions: true } },
      },
    });
    if (!challenge) return new Response(JSON.stringify({ error: 'Challenge not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    return NextResponse.json(challenge);
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch challenge' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { challengeId: string } }) {
  try {
    const body = await req.json();
    const { action, ...updates } = body;

    if (action === 'activate') {
      const challenge = await prisma.challenge.update({
        where: { id: params.challengeId },
        data: { status: 'ACTIVE', actualStartAt: new Date() },
      });
      return NextResponse.json(challenge);
    }

    if (action === 'complete') {
      const challenge = await prisma.challenge.update({
        where: { id: params.challengeId },
        data: { status: 'COMPLETED', actualEndAt: new Date() },
      });
      return NextResponse.json(challenge);
    }

    if (action === 'pause') {
      const challenge = await prisma.challenge.update({
        where: { id: params.challengeId },
        data: { status: 'PAUSED' },
      });
      return NextResponse.json(challenge);
    }

    // General update
    const challenge = await prisma.challenge.update({
      where: { id: params.challengeId },
      data: updates,
    });
    return NextResponse.json(challenge);
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to update challenge' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
