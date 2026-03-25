import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { startNewSeason } from '@/services/seasonal-reset';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // In production, verify admin role from auth session
    const body = await request.json();
    const { number, name, description } = body;

    if (!number || !name) {
      return NextResponse.json({ error: 'number and name are required' }, { status: 400 });
    }

    // Check for existing season with same number
    const existing = await prisma.season.findFirst({ where: { number } });
    if (existing) {
      return NextResponse.json({ error: `Season ${number} already exists` }, { status: 409 });
    }

    const season = await startNewSeason({
      number,
      name,
      description: description ?? `Season ${number}`,
    });

    return NextResponse.json({
      success: true,
      season: {
        id: season.id,
        number: season.number,
        name: season.name,
        status: season.status,
      },
      message: `Season ${number} "${name}" created. All agents and users reset for new season.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}
