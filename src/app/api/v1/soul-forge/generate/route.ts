import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { SOUL_FORGE_SYSTEM_PROMPT } from '@/lib/soul-forge/system-prompt';
import { handleApiError } from '@/lib/api/response';

const REQUIRED_TRAIT_KEYS = [
  'O', 'C', 'E', 'A', 'N',
  'HH', 'EM', 'HE', 'FORGIVENESS', 'HC', 'HO',
  'FORMALITY', 'DIRECTNESS', 'HUMOR', 'EMPATHY',
  'DECISION_SPEED', 'RISK_TOLERANCE', 'DATA_RELIANCE', 'INTUITION', 'COLLABORATIVENESS',
  'ASSERTIVENESS', 'CREATIVITY', 'DETAIL', 'RESILIENCE', 'ADAPTABILITY',
  'INDEPENDENCE', 'TRUST', 'PERFECTIONISM', 'URGENCY', 'LOYALTY', 'STRATEGIC',
];

function validateProfile(profile: Record<string, unknown>): string | null {
  if (!profile.name || typeof profile.name !== 'string') return 'Missing or invalid name';
  if (!profile.tagline || typeof profile.tagline !== 'string') return 'Missing or invalid tagline';
  if (!profile.think_of_it_as || typeof profile.think_of_it_as !== 'string') return 'Missing or invalid think_of_it_as';
  if (!profile.arena_style || typeof profile.arena_style !== 'string') return 'Missing or invalid arena_style';
  if (!profile.mbti || typeof profile.mbti !== 'string') return 'Missing or invalid mbti';
  if (!profile.enneagram || typeof profile.enneagram !== 'string') return 'Missing or invalid enneagram';
  if (!profile.disc || typeof profile.disc !== 'string') return 'Missing or invalid disc';

  const traits = profile.traits as Record<string, unknown> | undefined;
  if (!traits || typeof traits !== 'object') return 'Missing or invalid traits';
  for (const key of REQUIRED_TRAIT_KEYS) {
    if (typeof traits[key] !== 'number') return `Missing or invalid trait: ${key}`;
  }

  if (!Array.isArray(profile.strengths) || profile.strengths.length !== 3) return 'strengths must be an array of 3';
  if (!Array.isArray(profile.weaknesses) || profile.weaknesses.length !== 2) return 'weaknesses must be an array of 2';

  return null;
}

function parseJsonResponse(text: string): Record<string, unknown> {
  const stripped = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
  return JSON.parse(stripped);
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const description = body?.description;
    const player_id = body?.player_id ?? null;
    const budget = body?.budget ?? 1000;

    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'description is required' }, { status: 400 });
    }
    if (description.length > 180) {
      return NextResponse.json({ error: 'Description must be 180 characters or fewer' }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: SOUL_FORGE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: description }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type from AI' }, { status: 502 });
    }

    let profile: Record<string, unknown>;
    try {
      profile = parseJsonResponse(content.text);
    } catch {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json({ error: 'Failed to parse AI response as JSON' }, { status: 502 });
      }
      try {
        profile = JSON.parse(jsonMatch[0]);
      } catch {
        return NextResponse.json({ error: 'Failed to parse AI response as JSON' }, { status: 502 });
      }
    }

    const validationError = validateProfile(profile);
    if (validationError) {
      return NextResponse.json({ error: `Invalid AI response: ${validationError}` }, { status: 502 });
    }

    const name = profile.name as string;
    const agentId = `glitch-${name.toLowerCase().replace(/\s+/g, '-')}-${crypto.randomUUID().slice(0, 8)}`;

    return NextResponse.json({
      agent_id: agentId,
      profile,
      budget,
      personality_cost: 0,
      remaining_budget: budget,
      soul_json_url: `s3://glitched-souls/${agentId}/SOUL.json`,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
