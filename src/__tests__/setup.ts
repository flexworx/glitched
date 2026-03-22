/**
 * RADF v3 — Vitest Global Setup
 */
import { vi } from 'vitest';

// Mock Prisma client globally so tests don't need a real DB
vi.mock('@/lib/db/client', () => ({
  prisma: {
    agent: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    match: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    predictionPool: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    userPrediction: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    murphTransaction: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    adminLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
  },
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));
