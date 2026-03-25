import { NextRequest } from 'next/server';
import { duplicateTemplate } from '@/services/game-vault';
import { created, handleApiError } from '@/lib/api/response';
import { requireAdmin } from '@/lib/auth/session';

type Params = { params: { templateId: string } };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireAdmin();
    const template = await duplicateTemplate(params.templateId, session.userId);
    return created(template);
  } catch (e) {
    return handleApiError(e);
  }
}
