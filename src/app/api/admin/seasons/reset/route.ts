import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: 'Seasonal reset schema migration pending' }, { status: 501 });
}
