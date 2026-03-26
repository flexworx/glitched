import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { ok, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/db/client';

type Params = { params: { templateId: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const template = await prisma.gameTemplate.findUnique({
      where: { id: params.templateId },
      include: {
        easterEggs: { include: { easterEgg: true } },
        seasonGames: { select: { id: true, seasonId: true, status: true } },
        _count: { select: { seasonGames: true } },
      },
    });
    if (!template) return handleApiError(new Error('Template not found'));
    return ok({ template });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));

    const body = await req.json();
    const template = await prisma.gameTemplate.update({
      where: { id: params.templateId },
      data: body,
    });
    return ok({ template });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));

    await prisma.gameTemplate.update({
      where: { id: params.templateId },
      data: { status: 'ARCHIVED' },
    });
    return ok({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
