import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { ok, created, handleApiError } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const CreateDisputeSchema = z.object({
  violationId: z.string(),
  agentId: z.string(),
  challengeId: z.string().optional(),
  disputeReason: z.string().min(10).max(2000),
  evidenceText: z.string().max(2000).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '50');
    const status = req.nextUrl.searchParams.get('status');

    const disputes = await prisma.dispute.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        agent: { select: { id: true, name: true, archetype: true } },
        challenge: { select: { id: true, title: true, season: { select: { name: true } } } },
        violation: { select: { id: true, penaltyType: true, penaltyAmount: true, reason: true } },
        filedByUser: { select: { id: true, username: true } },
      },
    });
    return NextResponse.json({ disputes });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch disputes' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const data = CreateDisputeSchema.parse(body);

    // Check if dispute already exists for this penalty
    const existing = await prisma.dispute.findFirst({
      where: { violationId: data.violationId },
    });
    if (existing) {
      return new Response(JSON.stringify({ error: 'A dispute has already been submitted for this penalty' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }

    const dispute = await prisma.dispute.create({
      data: {
        violationId: data.violationId,
        agentId: data.agentId,
        challengeId: data.challengeId,
        disputeReason: data.disputeReason,
        evidenceText: data.evidenceText,
        status: 'PENDING' as const,
        filedBy: session?.userId ?? data.agentId,
      },
      include: {
        agent: { select: { id: true, name: true } },
        violation: { select: { id: true, penaltyType: true } },
      },
    });

    return NextResponse.json(dispute, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.name === 'ZodError') {
      return new Response(JSON.stringify({ error: 'Validation failed' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'Failed to create dispute' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
