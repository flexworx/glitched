import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { ok, created, handleApiError } from '@/lib/api/response';
import prisma from '@/lib/db/client';
import type { EasterEggTrigger } from '@prisma/client';

type Params = { params: { templateId: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const attachments = await prisma.gameTemplateEasterEgg.findMany({
      where: { templateId: params.templateId },
      include: { easterEgg: true },
    });
    return ok({ easterEggs: attachments });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));

    const body = await req.json();
    const { easterEggId, probability = 0.1, trigger = 'RANDOM', triggerConfig = {} } = body as {
      easterEggId: string; probability?: number;
      trigger?: EasterEggTrigger; triggerConfig?: object;
    };

    if (!easterEggId) return handleApiError(new Error('easterEggId is required'));

    const attachment = await prisma.gameTemplateEasterEgg.upsert({
      where: {
        templateId_easterEggId: { templateId: params.templateId, easterEggId },
      },
      create: {
        templateId: params.templateId,
        easterEggId,
        probability,
        trigger,
        triggerConfig,
      },
      update: { probability, trigger, triggerConfig },
    });

    return created({ attachment });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));

    const { searchParams } = new URL(req.url);
    const easterEggId = searchParams.get('easterEggId');
    if (!easterEggId) return handleApiError(new Error('easterEggId is required'));

    await prisma.gameTemplateEasterEgg.delete({
      where: {
        templateId_easterEggId: { templateId: params.templateId, easterEggId },
      },
    });

    return ok({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
