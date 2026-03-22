/**
 * RADF v3 — Health Check Endpoint
 * GET /api/health
 *
 * Returns system health status for Docker health checks and monitoring.
 * Checks: DB connectivity, memory usage, uptime.
 *
 * Response codes:
 *   200 — healthy
 *   503 — degraded (DB unreachable)
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

const startTime = Date.now();

export async function GET() {
  const checks: Record<string, { status: 'ok' | 'error'; latencyMs?: number; error?: string }> = {};

  // ─── Database check ───────────────────────────────────────────────────────
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'ok', latencyMs: Date.now() - dbStart };
  } catch (e) {
    checks.database = { status: 'error', error: 'DB unreachable' };
  }

  // ─── Memory check ─────────────────────────────────────────────────────────
  const mem = process.memoryUsage();
  const heapUsedMb = Math.round(mem.heapUsed / 1024 / 1024);
  const heapTotalMb = Math.round(mem.heapTotal / 1024 / 1024);
  checks.memory = {
    status: heapUsedMb < 900 ? 'ok' : 'error',
    ...(heapUsedMb >= 900 && { error: `High memory: ${heapUsedMb}MB` }),
  };

  const allOk = Object.values(checks).every((c) => c.status === 'ok');
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  const body = {
    status: allOk ? 'healthy' : 'degraded',
    version: process.env.npm_package_version ?? '1.0.0',
    uptime: uptimeSeconds,
    timestamp: new Date().toISOString(),
    checks,
    memory: {
      heapUsedMb,
      heapTotalMb,
      rss: Math.round(mem.rss / 1024 / 1024),
    },
  };

  return NextResponse.json(body, { status: allOk ? 200 : 503 });
}
