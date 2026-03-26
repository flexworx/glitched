import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { ok, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/db/client';

type Params = { params: { templateId: string } };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));

    const template = await prisma.gameTemplate.findUnique({ where: { id: params.templateId } });
    if (!template) return handleApiError(new Error('Template not found'));
    if (template.status === 'PUBLISHED') return handleApiError(new Error('Template is already published'));

    const updated = await prisma.gameTemplate.update({
      where: { id: params.templateId },
      data: { status: 'PUBLISHED', version: { increment: 1 } },
    });
    return ok({ template: updated, message: `Template "${updated.displayTitle}" published` });
  } catch (e) {
    return handleApiError(e);
  }
}
