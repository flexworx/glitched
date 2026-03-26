import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ARBITER_SYSTEM_PROMPT, buildArbiterValidationPrompt } from '@/lib/ai/arbiter-prompt';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, gameState } = body;

  if (!action || !gameState) {
    return NextResponse.json({ error: 'action and gameState required' }, { status: 400 });
  }

  try {
    const userPrompt = buildArbiterValidationPrompt(action, gameState);

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: ARBITER_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const match = text.match(/\{[\s\S]*?\}/);
    const result = match ? JSON.parse(match[0]) : {};

    return NextResponse.json({
      valid: result.valid ?? true,
      reason: result.reason ?? null,
      penalty: result.penalty ?? null,
      narrative: result.narrative ?? `${action.agentName ?? 'Agent'} executes ${action.action ?? action.type ?? 'unknown action'}.`,
    });
  } catch (err) {
    console.error('[ARBITER] Claude API error:', err);
    return NextResponse.json(
      { valid: true, reason: 'ARBITER unavailable — action permitted by default', penalty: null, narrative: null },
      { status: 200 }
    );
  }
}
