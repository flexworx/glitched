import { NextRequest } from 'next/server';
import { handleApiError } from '@/lib/api/response';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Game Vault schema migration pending' }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ message: 'Game Vault schema migration pending' }, { status: 501 });
}

export async function PATCH() {
  return NextResponse.json({ message: 'Game Vault schema migration pending' }, { status: 501 });
}

export async function DELETE() {
  return NextResponse.json({ message: 'Game Vault schema migration pending' }, { status: 501 });
}
