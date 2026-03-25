import { NextRequest } from 'next/server';
import {
  attachEasterEggToTemplate,
  removeEasterEggFromTemplate,
} from '@/services/game-vault';
import { created, ok, handleApiError } from '@/lib/api/response';
import { requireAdmin } from '@/lib/auth/session';
import { z } from 'zod';

const AttachEasterEggSchema = z.object({
  easterEggId: z.string().min(1),
  probability: z.number().min(0).max(1).optional(),
  trigger: z.enum([
    'RANDOM', 'ROUND_START', 'LOW_AGENT_COUNT', 'HIGH_DRAMA',
    'MANUAL', 'ELIMINATION', 'ALLIANCE_BREAK',
  ]).optional(),
  triggerConfig: z.record(z.unknown()).optional(),
});

const RemoveEasterEggSchema = z.object({
  easterEggId: z.string().min(1),
});

type Params = { params: { templateId: string } };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const body = AttachEasterEggSchema.parse(await req.json());
    const result = await attachEasterEggToTemplate(
      params.templateId,
      body.easterEggId,
      body.probability,
      body.trigger as any,
      body.triggerConfig
    );
    return created(result);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const body = RemoveEasterEggSchema.parse(await req.json());
    await removeEasterEggFromTemplate(params.templateId, body.easterEggId);
    return ok({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
