/**
 * Agent Compliance Wrapper — Ensures agents follow rules and respond in valid format
 */
import Anthropic from '@anthropic-ai/sdk';

export interface AgentResponse {
  thinking: string;
  speech: string;
  action: {
    type: string;
    target: string | null;
    parameters: Record<string, any>;
  };
  economyAction: {
    type: 'bribe' | 'buy_tool' | 'activate_tool' | 'bet_on_self' | 'explore' | 'offer_bounty' | 'none';
    target: string | null;
    amount: number;
  };
}

const RESPONSE_FORMAT_INSTRUCTION = `
RESPONSE FORMAT — MANDATORY
Respond with a single valid JSON object. No markdown. No code blocks.

{
  "thinking": "Private strategic reasoning (1-3 sentences)",
  "speech": "What you say out loud (1-3 sentences, in your character voice)",
  "action": {
    "type": "one of ALLOWED_ACTIONS below",
    "target": "agent name or null",
    "parameters": {}
  },
  "economyAction": {
    "type": "one of ECONOMY_ACTIONS below or 'none'",
    "target": "agent name or null",
    "amount": 0
  }
}`;

const VALID_ECONOMY_ACTIONS = ['bribe', 'buy_tool', 'activate_tool', 'bet_on_self', 'explore', 'offer_bounty', 'none'];

/**
 * Parse agent response robustly — handles markdown code blocks, trailing text, nested objects
 */
export function parseAgentResponse(raw: string): AgentResponse {
  let text = raw.trim();

  // Try extracting from markdown code blocks
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) text = codeBlock[1].trim();

  // Try extracting JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) text = jsonMatch[0];

  try {
    const parsed = JSON.parse(text);
    return {
      thinking: parsed.thinking || 'No reasoning provided',
      speech: parsed.speech || parsed.narrative || text.slice(0, 200),
      action: {
        type: parsed.action?.type || 'observe',
        target: parsed.action?.target || null,
        parameters: parsed.action?.parameters || {},
      },
      economyAction: {
        type: parsed.economyAction?.type || 'none',
        target: parsed.economyAction?.target || null,
        amount: parsed.economyAction?.amount || 0,
      },
    };
  } catch {
    return {
      thinking: 'Parse failed',
      speech: text.slice(0, 200),
      action: { type: 'observe', target: null, parameters: {} },
      economyAction: { type: 'none', target: null, amount: 0 },
    };
  }
}

/**
 * Validate agent response structure
 */
function validateResponse(
  response: AgentResponse,
  allowedActions: string[],
): { valid: boolean; reason?: string } {
  if (!response.thinking || response.thinking.length === 0) {
    return { valid: false, reason: 'thinking field is empty' };
  }
  if (!response.speech || response.speech.length === 0) {
    return { valid: false, reason: 'speech field is empty' };
  }
  if (response.speech.length > 500) {
    return { valid: false, reason: 'speech exceeds 500 characters' };
  }
  if (!allowedActions.includes(response.action.type)) {
    return { valid: false, reason: `action.type "${response.action.type}" is not allowed. Must be one of: ${allowedActions.join(', ')}` };
  }
  if (!VALID_ECONOMY_ACTIONS.includes(response.economyAction.type)) {
    return { valid: false, reason: `economyAction.type "${response.economyAction.type}" is not valid` };
  }
  if (typeof response.economyAction.amount !== 'number' || response.economyAction.amount < 0) {
    return { valid: false, reason: 'economyAction.amount must be a number >= 0' };
  }
  return { valid: true };
}

/**
 * Call agent with compliance enforcement
 */
export async function callAgentWithCompliance(config: {
  agentName: string;
  systemPrompt: string;
  userMessage: string;
  allowedActions: string[];
  economyActions?: string[];
  maxRetries?: number;
}): Promise<AgentResponse> {
  const maxRetries = config.maxRetries ?? 2;
  const client = new Anthropic();

  const fullSystemPrompt = `${config.systemPrompt}

${RESPONSE_FORMAT_INSTRUCTION}

ALLOWED GAME ACTIONS: ${config.allowedActions.join(', ')}
ALLOWED ECONOMY ACTIONS: ${VALID_ECONOMY_ACTIONS.join(', ')}

IF YOU DO NOT FOLLOW THIS FORMAT, YOUR TURN IS FORFEITED.`;

  let lastError = '';

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const userMsg = attempt === 0
      ? config.userMessage
      : `Your previous response was invalid: ${lastError}. Respond with valid JSON.`;

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        temperature: 0.9,
        system: fullSystemPrompt,
        messages: [{ role: 'user', content: userMsg }],
      });

      const raw = response.content[0]?.type === 'text' ? response.content[0].text : '';
      const parsed = parseAgentResponse(raw);
      const validation = validateResponse(parsed, config.allowedActions);

      if (validation.valid) {
        return parsed;
      }

      lastError = validation.reason || 'Unknown validation error';
      console.warn(`[Compliance] ${config.agentName} attempt ${attempt + 1} invalid: ${lastError}`);
    } catch (error: any) {
      // Handle rate limits
      if (error?.status === 429) {
        console.warn(`[Compliance] Rate limited for ${config.agentName}, waiting 5s...`);
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }
      lastError = error?.message || 'API call failed';
      console.error(`[Compliance] ${config.agentName} API error: ${lastError}`);
    }
  }

  // All retries exhausted — return safe default
  console.error(`[Compliance] ${config.agentName} all retries exhausted, using default`);
  return {
    thinking: 'All retries exhausted, defaulting to observe',
    speech: '...',
    action: { type: 'observe', target: null, parameters: {} },
    economyAction: { type: 'none', target: null, amount: 0 },
  };
}
