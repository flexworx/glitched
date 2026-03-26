import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { ok, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true, username: true, email: true, role: true,
        statusTier: true, lifetimeMurph: true, seasonMurph: true,
        createdAt: true,
        _count: { select: { agents: true, predictions: true } },
      },
    });
    if (!user) return handleApiError(new Error('User not found'));
    return ok({ user });
  } catch (e) { return handleApiError(e); }
}

export async function PATCH(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));
    const { action, value } = await req.json();
    let updated;
    if (action === 'ban') {
      updated = await prisma.user.update({ where: { id: params.userId }, data: { role: 'VIEWER' } });
    } else if (action === 'unban') {
      updated = await prisma.user.update({ where: { id: params.userId }, data: { role: 'VIEWER' } });
    } else if (action === 'set-role' && value) {
      updated = await prisma.user.update({ where: { id: params.userId }, data: { role: value } });
    } else if (action === 'reset-password') {
      // In production: send password reset email
      updated = await prisma.user.findUnique({ where: { id: params.userId }, select: { id: true, email: true } });
    } else {
      return handleApiError(new Error(`Unknown action: ${action}`));
    }
    return ok({ user: updated, action });
  } catch (e) { return handleApiError(e); }
}
