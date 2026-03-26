import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { created, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/db/client';

type Params = { params: { templateId: string } };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return handleApiError(new Error('Forbidden'));

    const source = await prisma.gameTemplate.findUnique({
      where: { id: params.templateId },
      include: { easterEggs: true },
    });
    if (!source) return handleApiError(new Error('Template not found'));

    // Create the copy without easter eggs first
    const copy = await prisma.gameTemplate.create({
      data: {
        name: `${source.name}_copy`,
        displayTitle: `${source.displayTitle} (Copy)`,
        category: source.category,
        description: source.description,
        systemPrompt: source.systemPrompt,
        minAgents: source.minAgents,
        maxAgents: source.maxAgents,
        eliminationRule: source.eliminationRule,
        eliminationCount: source.eliminationCount,
        scoringMethod: source.scoringMethod,
        scoringLogic: source.scoringLogic as object,
        creditRewards: source.creditRewards as object,
        estimatedDuration: source.estimatedDuration,
        tags: source.tags,
        status: 'DRAFT',
        version: 1,
        recommendedRounds: source.recommendedRounds,
        recommendedAgents: source.recommendedAgents,
        teamFormation: source.teamFormation as object,
        createdBy: session.userId,
      },
    });

    // Copy easter egg attachments
    if (source.easterEggs.length > 0) {
      await prisma.gameTemplateEasterEgg.createMany({
        data: source.easterEggs.map((ee) => ({
          templateId: copy.id,
          easterEggId: ee.easterEggId,
          probability: ee.probability,
          trigger: ee.trigger,
          triggerConfig: ee.triggerConfig as object,
        })),
      });
    }

    return created({ template: copy });
  } catch (e) {
    return handleApiError(e);
  }
}
