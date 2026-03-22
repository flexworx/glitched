/**
 * RADF v3 — Admin Audit Log Route
 * GET /api/admin/audit
 * Returns paginated admin action log.
 */
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';
import { ok, handleApiError } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        select: {
          id: true,
          adminId: true,
          action: true,
          targetType: true,
          targetId: true,
          details: true,
          timestamp: true,
        },
      }),
      prisma.adminLog.count(),
    ]);

    return ok({ logs, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (e) {
    return handleApiError(e);
  }
}
