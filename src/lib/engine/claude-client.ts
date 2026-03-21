import Anthropic from '@anthropic-ai/sdk';
import type { AssembledContext } from './context-assembly';
import type { AgentTurnResponse } from '../types/game-state';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function callClaude(context: AssembledContext): Promise<AgentTurnResponse> {
  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1500,
    system: context.systemPrompt,
    messages: [
      { role: 'user', content: context.userMessage },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  try {
    const parsed = JSON.parse(content.text);
    return {
      thinking: parsed.thinking || '',
      speech: parsed.speech,
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
    };
  } catch {
    // Fallback: extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        thinking: parsed.thinking || '',
        speech: parsed.speech,
        actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      };
    }
    // Ultimate fallback: PASS action
    return {
      thinking: 'Unable to parse response, defaulting to PASS',
      actions: [{ type: 'PASS' }],
    };
  }
}

export async function callArbiter(
  situation: string,
  context: string,
  rules: string
): Promise<{ ruling: string; reasoning: string; penalty?: string }> {
  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 800,
    system: `You are ARBITER, the impartial referee of the Glitch Arena. You enforce the rules with absolute fairness and zero tolerance for violations. You are incorruptible, logical, and consistent. You respond only with valid JSON.`,
    messages: [
      {
        role: 'user',
        content: `SITUATION: ${situation}\n\nCONTEXT: ${context}\n\nRULES: ${rules}\n\nProvide your ruling as JSON: { "ruling": "VALID|INVALID|PENALTY|DISQUALIFY", "reasoning": "...", "penalty": "optional penalty description" }`,
      },
    ],
  });

  const text = (response.content[0] as { type: string; text: string }).text;
  try {
    return JSON.parse(text);
  } catch {
    return { ruling: 'VALID', reasoning: 'Unable to parse ruling, defaulting to valid' };
  }
}

export async function callShowrunner(
  matchState: string,
  recentEvents: string,
  dramaScore: number
): Promise<{ commentary: string; nextEventSuggestion?: string; cameraDirective?: string }> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 500,
    system: `You are SHOWRUNNER, the AI host of Glitch Arena. You provide exciting live commentary, suggest chaos events to inject drama, and direct the camera to the most exciting moments. You speak like a charismatic sports announcer with deep knowledge of each agent's personality. Current drama score: ${dramaScore}/100.`,
    messages: [
      {
        role: 'user',
        content: `MATCH STATE: ${matchState}\n\nRECENT EVENTS: ${recentEvents}\n\nProvide commentary as JSON: { "commentary": "...", "nextEventSuggestion": "optional chaos event", "cameraDirective": "optional camera instruction" }`,
      },
    ],
  });

  const text = (response.content[0] as { type: string; text: string }).text;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { commentary: text };
  } catch {
    return { commentary: text };
  }
}
