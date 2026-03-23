import { NextRequest } from 'next/server';
import { sendInstruction, listInstructions } from '@/services/seasons';
import { ok, created, handleApiError } from '@/lib/api/response';
import { requireAdmin, getSession } from '@/lib/auth/session';
import { z } from 'zod';

const SendInstructionSchema = z.object({
  challengeId: z.string().optional(),
  matchId: z.string().optional(),
  delivery: z.enum(['WHISPER_ONLY','BIGSCREEN_ONLY','BOTH']).default('BOTH'),
  whisperText: z.string().min(1),
  bigScreenText: z.string().optional(),
  targetAllAgents: z.boolean().optional(),
  targetAgentIds: z.array(z.string()).optional(),
  complianceWindowMinutes: z.number().int().positive().optional(),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const instructions = await listInstructions(
      searchParams.get('challengeId') ?? undefined,
      searchParams.get('matchId') ?? undefined,
    );
    return ok({ instructions, total: instructions.length });
  } catch (e) { return handleApiError(e); }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const session = await getSession();
    const body = SendInstructionSchema.parse(await req.json());
    const instruction = await sendInstruction({
      ...body,
      operatorId: session?.userId ?? 'system',
    });
    return created(instruction);
  } catch (e) { return handleApiError(e); }
}
