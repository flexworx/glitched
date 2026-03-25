import { NextRequest } from 'next/server';
import { publishTemplate } from '@/services/game-vault';
import { ok, handleApiError } from '@/lib/api/response';
import { requireAdmin } from '@/lib/auth/session';

type Params = { params: { templateId: string } };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const template = await publishTemplate(params.templateId);
    return ok(template);
  } catch (e) {
    return handleApiError(e);
  }
}
