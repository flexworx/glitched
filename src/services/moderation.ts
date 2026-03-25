import prisma from '@/lib/db/client';

export async function getModerationFlags(options: {
  resolved?: boolean;
  severity?: string;
  limit?: number;
} = {}) {
  const { resolved = false, severity, limit = 50 } = options;
  const flags = await prisma.contentFlag.findMany({
    where: {
      isResolved: resolved,
      ...(severity ? { severity: severity as any } : {}),
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      message: {
        select: {
          id: true,
          content: true,
          channel: true,
          timestamp: true,
          matchId: true,
        },
      },
    },
  });
  const pending = await prisma.contentFlag.count({ where: { isResolved: false } });
  const resolved_count = await prisma.contentFlag.count({ where: { isResolved: true } });
  return { flags, pending, resolved: resolved_count, total: flags.length };
}

export async function resolveFlag(flagId: string, adminId: string, action: string) {
  const flag = await prisma.contentFlag.update({
    where: { id: flagId },
    data: { isResolved: true, resolvedAt: new Date() },
  });
  await prisma.adminLog.create({
    data: {
      adminId,
      action: 'RESOLVE_FLAG',
      targetType: 'ContentFlag',
      targetId: flagId,
      details: { action },
    },
  });
  return flag;
}

export async function createFlag(messageId: string, flagType: string, severity: string) {
  return prisma.contentFlag.create({
    data: {
      messageId,
      flagType,
      severity: severity as any,
      autoFlagged: false,
    },
  });
}
