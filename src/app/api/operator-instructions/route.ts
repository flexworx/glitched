import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { ok, created, handleApiError } from '@/lib/api/response';
import { requireAdmin, getSession } from '@/lib/auth/session';
import { z } from 'zod';

const SendInstructionSchema = z.object({
  challengeId: z.string().optional(),
  matchId: z.string().optional(),
  delivery: z.enum(['WHISPER_ONLY', 'BIGSCREEN_ONLY', 'BOTH']).default('BOTH'),
  whisperText: z.string().min(1),
  bigScreenText: z.string().optional(),
  targetAllAgents: z.boolean().default(false),
  targetAgentIds: z.array(z.string()).optional(),
  complianceWindowMinutes: z.number().int().positive().optional(),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get('challengeId');
    const matchId = searchParams.get('matchId');

    const instructions = await prisma.operatorInstruction.findMany({
      where: {
        ...(challengeId ? { challengeId } : {}),
        ...(matchId ? { matchId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        challenge: { select: { id: true, title: true } },
        agentDeliveries: { select: { id: true, agentId: true, deliveredAt: true } },
      },
    });
    return ok({ instructions, total: instructions.length });
  } catch (e) { return handleApiError(e); }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const session = await getSession();
    const body = SendInstructionSchema.parse(await req.json());

    const instruction = await prisma.operatorInstruction.create({
      data: {
        challengeId: body.challengeId,
        matchId: body.matchId,
        operatorId: session?.userId ?? 'system',
        delivery: body.delivery,
        whisperText: body.whisperText,
        bigScreenText: body.bigScreenText,
        targetAllAgents: body.targetAllAgents,
        targetAgentIds: body.targetAgentIds ?? [],
        complianceWindowMinutes: body.complianceWindowMinutes,
        complianceDeadline: body.complianceWindowMinutes
          ? new Date(Date.now() + body.complianceWindowMinutes * 60 * 1000)
          : undefined,
      },
      include: {
        challenge: { select: { id: true, title: true } },
      },
    });
    return created(instruction);
  } catch (e) { return handleApiError(e); }
}
