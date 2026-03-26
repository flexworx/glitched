import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { ok, created, handleApiError } from '@/lib/api/response';
import prisma from '@/lib/db/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active') !== 'false';

    const easterEggs = await prisma.easterEggDefinition.findMany({
      where: activeOnly ? { isActive: true } : {},
      include: {
        _count: { select: { templateAttachments: true, seasonEasterEggs: true } },
      },
      orderBy: { name: 'asc' },
    });

    return ok({ easterEggs, total: easterEggs.length });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));

    const body = await req.json();
    const { name, icon = '🎁', description, effectType, effectConfig = {}, isActive = true } = body as {
      name: string; icon?: string; description: string;
      effectType: string; effectConfig?: object; isActive?: boolean;
    };

    if (!name || !description || !effectType) {
      return handleApiError(new Error('Missing required fields: name, description, effectType'));
    }

    const easterEgg = await prisma.easterEggDefinition.create({
      data: { name, icon, description, effectType, effectConfig, isActive },
    });

    return created({ easterEgg });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));

    const body = await req.json();
    const { id, ...updates } = body as { id: string; [key: string]: unknown };
    if (!id) return handleApiError(new Error('id is required'));

    const easterEgg = await prisma.easterEggDefinition.update({
      where: { id },
      data: updates,
    });

    return ok({ easterEgg });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return handleApiError(new Error('id is required'));

    // Soft delete — set isActive false
    await prisma.easterEggDefinition.update({
      where: { id },
      data: { isActive: false },
    });

    return ok({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
