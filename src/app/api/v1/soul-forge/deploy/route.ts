import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getRandomFlaw, mapSoulForgeToDb, SKILLS, ECONOMY } from '@/lib/soul-forge/constants';
import { handleApiError } from '@/lib/api/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agent_id, profile, equipped_skills, personality_adjustments } = body;

    if (!agent_id || typeof agent_id !== 'string') {
      return NextResponse.json({ error: 'agent_id is required' }, { status: 400 });
    }
    if (!profile || typeof profile !== 'object') {
      return NextResponse.json({ error: 'profile is required' }, { status: 400 });
    }
    if (!Array.isArray(equipped_skills)) {
      return NextResponse.json({ error: 'equipped_skills must be an array' }, { status: 400 });
    }
    if (equipped_skills.length > ECONOMY.MAX_SKILLS) {
      return NextResponse.json({ error: `Maximum ${ECONOMY.MAX_SKILLS} skills allowed` }, { status: 400 });
    }

    // Calculate skill costs
    let skillCost = 0;
    for (const skillId of equipped_skills) {
      const skill = SKILLS.find(s => s.id === skillId);
      skillCost += skill?.cost ?? 100;
    }

    // Calculate personality adjustment costs using 3:1 over/under system
    let personalityCost = 0;
    const adjustments = personality_adjustments || {};
    for (const value of Object.values(adjustments) as number[]) {
      if (value > 50) {
        personalityCost += (value - 50) * ECONOMY.COST_PER_POINT_OVER_50;
      } else if (value < 50) {
        personalityCost -= (50 - value) * ECONOMY.REFUND_PER_POINT_UNDER_50;
      }
    }
    personalityCost = Math.max(0, personalityCost);

    if (personalityCost > ECONOMY.PERSONALITY_BUDGET) {
      return NextResponse.json({ error: `Personality cost (${personalityCost}) exceeds cap of ${ECONOMY.PERSONALITY_BUDGET} $MURPH` }, { status: 400 });
    }

    const totalCost = personalityCost + skillCost;
    if (totalCost > ECONOMY.TOTAL_BUDGET) {
      return NextResponse.json({ error: `Total cost (${totalCost} $MURPH) exceeds budget of ${ECONOMY.TOTAL_BUDGET} $MURPH` }, { status: 400 });
    }

    // Assign random hidden flaw
    const flaw = getRandomFlaw();
    const remainingMurph = ECONOMY.TOTAL_BUDGET - totalCost;

    // Map Soul Forge traits to DB personality fields
    const personalityData = mapSoulForgeToDb(profile.traits || {}, adjustments);

    // Create agent in database
    await prisma.$transaction(async (tx) => {
      const newAgent = await tx.agent.create({
        data: {
          name: profile.name,
          archetype: profile.think_of_it_as || 'Custom',
          mbti: profile.mbti || 'INTJ',
          enneagram: profile.enneagram || '5w6',
          backstory: profile.arena_style || '',
          isByoa: true,
          isPantheon: false,
          status: 'ACTIVE',
          veritasScore: 500,
          veritasTier: 'RELIABLE',
        },
      });

      await tx.agentPersonality.create({
        data: {
          agentId: newAgent.id,
          ...personalityData,
        },
      });

      return newAgent;
    });

    return NextResponse.json({
      agent_id,
      flaw: { name: flaw.name, effect: flaw.effect },
      remaining_murph: remainingMurph,
      personality_cost: personalityCost,
      skill_cost: skillCost,
      deployed: true,
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
