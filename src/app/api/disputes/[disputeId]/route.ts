import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { ok, created, handleApiError } from '@/lib/api/response';
import { z } from 'zod';

const ResolveDisputeSchema = z.object({
  status: z.enum(['UPHELD', 'REJECTED', 'UNDER_REVIEW', 'ESCALATED']),
  reviewNotes: z.string().min(1).max(2000),
});

export async function GET(_req: NextRequest, { params }: { params: { disputeId: string } }) {
  try {
    const dispute = await prisma.dispute.findUnique({
      where: { id: params.disputeId },
      include: {
        agent: { select: { id: true, name: true, archetype: true } },
        challenge: { select: { id: true, title: true, season: { select: { name: true } } } },
        violation: { select: { id: true, penaltyType: true, penaltyAmount: true, reason: true } },
        filedByUser: { select: { id: true, username: true } },
      },
    });
    if (!dispute) return new Response(JSON.stringify({ error: 'Dispute not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    return NextResponse.json(dispute);
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch dispute' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { disputeId: string } }) {
  try {
    const body = await req.json();
    const data = ResolveDisputeSchema.parse(body);

    const dispute = await prisma.dispute.update({
      where: { id: params.disputeId },
      data: {
        status: data.status,
        reviewNotes: data.reviewNotes,
        reviewedAt: ['UPHELD', 'REJECTED'].includes(data.status) ? new Date() : undefined,
      },
    });

    // If upheld, mark the penalty as reversed
    if (data.status === 'UPHELD' && dispute.violationId) {
      await prisma.ruleViolation.update({
        where: { id: dispute.violationId! },
        data: { wasDisputed: true },
      });
    }

    return NextResponse.json(dispute);
  } catch (err) {
    if (err instanceof Error && err.name === 'ZodError') {
      return new Response(JSON.stringify({ error: 'Validation failed' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'Failed to resolve dispute' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
