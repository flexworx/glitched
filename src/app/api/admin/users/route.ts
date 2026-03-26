import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { ok, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const search = searchParams.get('search') ?? '';
    const role = searchParams.get('role');
    const tier = searchParams.get('tier');
    const bannedOnly = searchParams.get('banned') === 'true';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role && role !== 'ALL') where.role = role;
    if (tier && tier !== 'ALL') where.statusTier = tier;
    if (bannedOnly) where.role = 'VIEWER';

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, username: true, email: true, role: true,
          statusTier: true, lifetimeMurph: true, seasonMurph: true,
          createdAt: true,
          _count: { select: { agents: true, predictions: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return ok({ users, total, page, limit });
  } catch (e) { return handleApiError(e); }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));
    const { userId, action, value } = await req.json();
    if (!userId || !action) return handleApiError(new Error('userId and action required'));

    let updated;
    if (action === 'ban') {
      updated = await prisma.user.update({ where: { id: userId }, data: { role: 'VIEWER' } });
    } else if (action === 'unban') {
      updated = await prisma.user.update({ where: { id: userId }, data: { role: 'VIEWER' } });
    } else if (action === 'set-role' && value) {
      updated = await prisma.user.update({ where: { id: userId }, data: { role: value } });
    } else if (action === 'promote_admin') {
      updated = await prisma.user.update({ where: { id: userId }, data: { role: 'ADMIN' } });
    } else if (action === 'promote_moderator') {
      updated = await prisma.user.update({ where: { id: userId }, data: { role: 'OPERATOR' } });
    } else if (action === 'demote') {
      updated = await prisma.user.update({ where: { id: userId }, data: { role: 'VIEWER' } });
    } else {
      return handleApiError(new Error(`Unknown action: ${action}`));
    }
    return ok({ user: updated });
  } catch (e) { return handleApiError(e); }
}
