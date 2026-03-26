import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const sponsor = await prisma.sponsor.update({
    where: { id: params.id },
    data: {
      name: body.name,
      tier: body.tier,
      website: body.website,
      status: body.status,
      contractStart: body.contractStart ? new Date(body.contractStart) : null,
      contractEnd: body.contractEnd ? new Date(body.contractEnd) : null,
    },
  });
  return NextResponse.json({ sponsor });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await prisma.sponsor.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
