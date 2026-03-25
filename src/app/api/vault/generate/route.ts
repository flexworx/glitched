/**
 * AI Game Generation — Game Master AgentCore
 * POST /api/vault/generate
 *
 * Takes a human description and generates a complete game template
 * using the Game Master agent.
 */
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { GAME_MASTER_SYSTEM_PROMPT } from '@/lib/game-master/system-prompt';
import { requireAdmin } from '@/lib/auth/session';
import { handleApiError } from '@/lib/api/response';
import { z } from 'zod';

const GenerateSchema = z.object({
  description: z.string().min(10).max(500),
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function parseJsonResponse(text: string): Record<string, unknown> {
  const stripped = text
    .replace(/^```(?:json)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '');
  return JSON.parse(stripped);
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = GenerateSchema.parse(await req.json());

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: GAME_MASTER_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: body.description }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return NextResponse.json(
        { error: 'Unexpected response type from Game Master' },
        { status: 502 }
      );
    }

    let template: Record<string, unknown>;
    try {
      template = parseJsonResponse(content.text);
    } catch {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json(
          { error: 'Game Master returned invalid JSON' },
          { status: 502 }
        );
      }
      try {
        template = JSON.parse(jsonMatch[0]);
      } catch {
        return NextResponse.json(
          { error: 'Game Master returned unparseable response' },
          { status: 502 }
        );
      }
    }

    // Validate required fields
    const required = [
      'name',
      'displayTitle',
      'category',
      'description',
      'systemPrompt',
    ];
    for (const field of required) {
      if (!template[field]) {
        return NextResponse.json(
          { error: `Game Master response missing: ${field}` },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({
      template,
      generatedBy: 'game-master',
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    return handleApiError(e);
  }
}
