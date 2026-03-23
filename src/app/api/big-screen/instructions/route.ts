import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get('challengeId');

    const instructions = await prisma.operatorInstruction.findMany({
      where: {
        delivery: { in: ['BIGSCREEN_ONLY', 'BOTH'] },
        ...(challengeId ? { challengeId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        whisperText: true,
        bigScreenText: true,
        delivery: true,
        complianceWindowMinutes: true,
        complianceDeadline: true,
        targetAllAgents: true,
        createdAt: true,
        challenge: { select: { id: true, title: true, publicSummary: true } },
      },
    });

    // Map to public-safe format
    const publicInstructions = instructions.map(i => ({
      id: i.id,
      text: i.bigScreenText ?? i.whisperText,
      complianceWindowMinutes: i.complianceWindowMinutes,
      complianceDeadline: i.complianceDeadline,
      targetAllAgents: i.targetAllAgents,
      createdAt: i.createdAt,
      challenge: i.challenge,
    }));

    return ok({ instructions: publicInstructions });
  } catch (e) { return handleApiError(e); }
}
