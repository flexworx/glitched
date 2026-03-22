/**
 * RADF v3 — Predictions Service Integration Tests
 * Uses mocked Prisma client from setup.ts
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/db/client';
import { listOpenPredictionPools, placeBet } from '@/services/predictions';

const mockPool = {
  id: 'pool-1',
  matchId: 'match-1',
  totalPool: 1000,
  outcomeOdds: { 'agent-1': 1.5, 'agent-2': 2.5 },
  status: 'OPEN',
  resolvedAt: null,
  winningOutcome: null,
  createdAt: new Date(),
  bets: [],
  _count: { bets: 0 },
  match: {
    id: 'match-1',
    status: 'RUNNING',
    participants: [],
  },
};

describe('listOpenPredictionPools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns prediction pools from the database', async () => {
    (prisma.predictionPool.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([mockPool]);
    const pools = await listOpenPredictionPools();
    expect(pools).toHaveLength(1);
    expect(pools[0].id).toBe('pool-1');
  });

  it('returns empty array when no pools exist', async () => {
    (prisma.predictionPool.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const pools = await listOpenPredictionPools();
    expect(pools).toHaveLength(0);
  });
});

describe('placeBet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws if pool is not found', async () => {
    (prisma.predictionPool.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(
      placeBet({ userId: 'user-1', matchId: 'match-1', predictionType: 'WINNER', predictionData: { agentId: 'agent-1' }, amount: 100 })
    ).rejects.toThrow();
  });

  it('throws if pool is not OPEN', async () => {
    (prisma.predictionPool.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockPool,
      status: 'RESOLVED',
    });
    await expect(
      placeBet({ userId: 'user-1', matchId: 'match-1', predictionType: 'WINNER', predictionData: { agentId: 'agent-1' }, amount: 100 })
    ).rejects.toThrow();
  });
});
