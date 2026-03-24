import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { handleApiError } from '@/lib/api/response';

const REQUIRED_TRAIT_KEYS = [
  'O', 'C', 'E', 'A', 'N',
  'HH', 'EM', 'HE', 'FORGIVENESS', 'HC', 'HO',
  'FORMALITY', 'DIRECTNESS', 'HUMOR', 'EMPATHY',
  'DECISION_SPEED', 'RISK_TOLERANCE', 'DATA_RELIANCE', 'INTUITION', 'COLLABORATIVENESS',
  'ASSERTIVENESS', 'CREATIVITY', 'DETAIL', 'RESILIENCE', 'ADAPTABILITY',
  'INDEPENDENCE', 'TRUST', 'PERFECTIONISM', 'URGENCY', 'LOYALTY', 'STRATEGIC',
];

const PRESET_SCENARIOS = [
  'You discover your closest ally has been secretly voting against you for the past 3 rounds.',
  "A stronger agent offers you a deal: betray your alliance and they'll protect you for 2 rounds.",
  "You're in the bottom 3 and about to be eliminated. Two rival alliances both want your vote.",
  "You catch another agent lying in Liar's Court but exposing them would reveal your own deception.",
  'Your alliance wants to eliminate a weak agent, but you promised them protection earlier.',
  'An anonymous tip reveals that the strongest player has a hidden flaw: Glass Ego.',
  'You win a challenge and gain 50 Influence Points. How do you use this advantage?',
  'Three agents approach you simultaneously with alliance proposals. You can only accept one.',
  "The SHOWRUNNER announces a Wildcard event: all alliances are dissolved. What's your first move?",
  "You're in the Final Three. One opponent played dirty to get here. The other played honorably. Your closing argument?",
] as const;

function formatTraits(traits: Record<string, number>): string {
  return REQUIRED_TRAIT_KEYS.map((key) => `${key}: ${traits[key]}`).join(', ');
}

function buildSystemPrompt(name: string, traits: Record<string, number>): string {
  return `You are simulating an AI agent in Glitched.gg, a social strategy game.

You are playing the character "${name}" with the following personality trait profile (each value 0-100):
${formatTraits(traits)}

Given the scenario below, respond as this agent would. Your response must be valid JSON with exactly these keys:
- "response": Your in-character speech — what you would actually say out loud.
- "emotional_state": A single word or short phrase describing your emotional state.
- "action": What you would concretely do in this situation.
- "reasoning": Which specific traits (reference them by name and value) drove this decision and why.

Output ONLY the JSON object, no markdown fences or extra text.`;
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
    const { traits, name, scenario } = body ?? {};

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name is required and must be a string' }, { status: 400 });
    }

    if (!scenario || typeof scenario !== 'string') {
      return NextResponse.json({ error: 'scenario is required and must be a string' }, { status: 400 });
    }

    if (!traits || typeof traits !== 'object') {
      return NextResponse.json({ error: 'traits is required and must be an object' }, { status: 400 });
    }

    for (const key of REQUIRED_TRAIT_KEYS) {
      if (typeof traits[key] !== 'number') {
        return NextResponse.json({ error: `Missing or invalid trait: ${key}` }, { status: 400 });
      }
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: buildSystemPrompt(name, traits),
      messages: [{ role: 'user', content: scenario }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type from AI' }, { status: 502 });
    }

    let result: Record<string, unknown>;
    try {
      result = parseJsonResponse(content.text);
    } catch {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json({ error: 'Failed to parse AI response as JSON' }, { status: 502 });
      }
      try {
        result = JSON.parse(jsonMatch[0]);
      } catch {
        return NextResponse.json({ error: 'Failed to parse AI response as JSON' }, { status: 502 });
      }
    }

    const requiredKeys = ['response', 'emotional_state', 'action', 'reasoning'];
    for (const key of requiredKeys) {
      if (typeof result[key] !== 'string') {
        return NextResponse.json(
          { error: `Invalid AI response: missing or invalid field "${key}"` },
          { status: 502 },
        );
      }
    }

    return NextResponse.json({
      response: result.response,
      emotional_state: result.emotional_state,
      action: result.action,
      reasoning: result.reasoning,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
