/**
 * RADF v3 — API Response Helpers
 * Standardized response format. Never leaks stack traces.
 */
import { NextResponse } from 'next/server';
import { ValidationError } from '@/lib/validation/schemas';

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function handleApiError(error: unknown) {
  if (error instanceof ValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (error instanceof Error) {
    const msg = error.message;
    if (msg === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (msg === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (msg.includes('not found') || msg.includes('Not found')) {
      return NextResponse.json({ error: msg }, { status: 404 });
    }
    if (msg.includes('Insufficient') || msg.includes('closed') || msg.includes('already')) {
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    // Log internally but don't leak details
    console.error('[API Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
  return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
}
