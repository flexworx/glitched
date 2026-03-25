import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { ok, handleApiError } from '@/lib/api/response';
import prisma from '@/lib/db/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') ?? '100', 10);
    const search = searchParams.get('search') ?? '';
    const users = await prisma.user.findMany({
      where: search ? {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      } : undefined,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        // lifetimeMurph: true,
        // statusTier: true,
        createdAt: true,
        _count: { select: { predictions: true, agents: true } },
      },
    });
    return ok({ users, total: users.length });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));
    const { userId, action } = await req.json();
    if (!userId || !action) return handleApiError(new Error('userId and action required'));
    let updated;
    if (action === 'ban') {
      // No BANNED role — demote to VIEWER as a soft ban
      updated = await prisma.user.update({ where: { id: userId }, data: { role: 'VIEWER' } });
    } else if (action === 'unban') {
      updated = await prisma.user.update({ where: { id: userId }, data: { role: 'VIEWER' } });
    } else if (action === 'promote_admin') {
      updated = await prisma.user.update({ where: { id: userId }, data: { role: 'ADMIN' } });
    } else if (action === 'demote') {
      updated = await prisma.user.update({ where: { id: userId }, data: { role: 'VIEWER' } });
    } else if (action === 'promote_moderator') {
      updated = await prisma.user.update({ where: { id: userId }, data: { role: 'OPERATOR' } });
    } else {
      return handleApiError(new Error(`Unknown action: ${action}`));
    }
    return ok({ user: updated });
  } catch (e) {
    return handleApiError(e);
  }
}
