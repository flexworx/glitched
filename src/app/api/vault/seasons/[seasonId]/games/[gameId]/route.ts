import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { ok, handleApiError } from '@/lib/api/response';
import prisma from '@/lib/db/client';

type Params = { params: { seasonId: string; gameId: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const game = await prisma.seasonGame.findUnique({
      where: { id: params.gameId },
      include: {
        template: true,
        easterEggs: { include: { easterEgg: true } },
      },
    });
    if (!game || game.seasonId !== params.seasonId) return handleApiError(new Error('Game not found'));
    return ok({ game });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));

    const body = await req.json();
    const game = await prisma.seasonGame.update({
      where: { id: params.gameId },
      data: body,
    });
    return ok({ game });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));

    await prisma.seasonGame.delete({ where: { id: params.gameId } });
    return ok({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
