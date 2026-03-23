import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { ok, created, handleApiError } from '@/lib/api/response';
import { z } from 'zod';

const CreateRuleSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).default(''),
  hasTimeLimit: z.boolean().default(false),
  timeLimitMinutes: z.number().int().positive().optional(),
  violationPenaltyType: z.enum(['WARNING','HP_LOSS','MURPH_FINE','ACTION_SKIP','TURN_SUSPENSION','EXPULSION','TERMINATION','CUSTOM']).default('WARNING'),
  violationPenaltyAmount: z.number().optional(),
  violationMessage: z.string().max(500).optional(),
  orderIndex: z.number().int().default(0),
});

export async function GET(_req: NextRequest, { params }: { params: { challengeId: string } }) {
  try {
    const rules = await prisma.challengeRule.findMany({
      where: { challengeId: params.challengeId },
      orderBy: { orderIndex: 'asc' },
    });
    return NextResponse.json({ rules });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch rules' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST(req: NextRequest, { params }: { params: { challengeId: string } }) {
  try {
    const body = await req.json();
    const data = CreateRuleSchema.parse(body);
    const rule = await prisma.challengeRule.create({
      data: { ...data, challengeId: params.challengeId },
    });
    return NextResponse.json(rule, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.name === 'ZodError') {
      return new Response(JSON.stringify({ error: 'Validation failed' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'Failed to create rule' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
