import { NextRequest } from 'next/server';
import { listEasterEggs, createEasterEgg } from '@/services/game-vault';
import { ok, created, handleApiError } from '@/lib/api/response';
import { requireAdmin } from '@/lib/auth/session';
import { z } from 'zod';

const CreateEasterEggSchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().min(1).max(10),
  description: z.string().min(1),
  effectType: z.string().min(1).max(50),
  effectConfig: z.record(z.unknown()).optional(),
});

export async function GET() {
  try {
    const easterEggs = await listEasterEggs();
    return ok({ easterEggs, total: easterEggs.length });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = CreateEasterEggSchema.parse(await req.json());
    const easterEgg = await createEasterEgg(body);
    return created(easterEgg);
  } catch (e) {
    return handleApiError(e);
  }
}
