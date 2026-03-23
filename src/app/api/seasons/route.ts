import { NextRequest } from 'next/server';
import { listSeasons, createSeason } from '@/services/seasons';
import { ok, created, handleApiError } from '@/lib/api/response';
import { requireAdmin } from '@/lib/auth/session';
import { z } from 'zod';

const CreateSeasonSchema = z.object({
  number: z.number().int().positive(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  scheduledStartAt: z.string().datetime().optional(),
  scheduledEndAt: z.string().datetime().optional(),
  config: z.record(z.unknown()).optional(),
});

export async function GET() {
  try {
    const seasons = await listSeasons();
    return ok({ seasons, total: seasons.length });
  } catch (e) { return handleApiError(e); }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = CreateSeasonSchema.parse(await req.json());
    const season = await createSeason({
      ...body,
      scheduledStartAt: body.scheduledStartAt ? new Date(body.scheduledStartAt) : undefined,
      scheduledEndAt: body.scheduledEndAt ? new Date(body.scheduledEndAt) : undefined,
    });
    return created(season);
  } catch (e) { return handleApiError(e); }
}
