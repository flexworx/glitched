/**
 * RADF v3 — API Response Helper Tests
 */
import { describe, it, expect } from 'vitest';
import { ok, created, handleApiError } from '@/lib/api/response';

describe('ok()', () => {
  it('returns 200 with data', async () => {
    const res = ok({ id: '1', name: 'Test' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('1');
  });

  it('accepts a custom status code', async () => {
    const res = ok({ message: 'Accepted' }, 202);
    expect(res.status).toBe(202);
  });
});

describe('created()', () => {
  it('returns 201', async () => {
    const res = created({ id: 'new-1' });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe('new-1');
  });
});

describe('handleApiError()', () => {
  it('returns 403 for Forbidden errors', async () => {
    const res = handleApiError(new Error('Forbidden'));
    expect(res.status).toBe(403);
  });

  it('returns 404 for not found errors', async () => {
    const res = handleApiError(new Error('Match not found'));
    expect(res.status).toBe(404);
  });

  it('returns 401 for Unauthorized errors', async () => {
    const res = handleApiError(new Error('Unauthorized'));
    expect(res.status).toBe(401);
  });

  it('returns 500 for unknown errors', async () => {
    const res = handleApiError(new Error('Something exploded'));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Internal server error');
  });

  it('does not leak stack traces in 500 responses', async () => {
    const res = handleApiError(new Error('DB connection failed at line 42'));
    const body = await res.json();
    expect(body.error).toBe('Internal server error');
    expect(JSON.stringify(body)).not.toContain('line 42');
  });

  it('returns 400 for ValidationError', async () => {
    const { ValidationError } = await import('@/lib/validation/schemas');
    const res = handleApiError(new ValidationError('Invalid amount'));
    expect(res.status).toBe(400);
  });
});
