// Response Parser: extracts structured action data from Claude responses
export interface ParsedAgentAction {
  action: string;
  target: string | null;
  narrative: string;
  reasoning: string;
  raw: string;
}

const VALID_ACTIONS = ['attack', 'defend', 'negotiate', 'betray', 'ally', 'observe', 'retreat', 'heal', 'sabotage', 'inspire'];

export function parseAgentResponse(rawResponse: string): ParsedAgentAction {
  try {
    // Extract JSON from response (may be wrapped in markdown code blocks)
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');

    const parsed = JSON.parse(jsonMatch[0]);

    const action = VALID_ACTIONS.includes(parsed.action?.toLowerCase()) ? parsed.action.toLowerCase() : 'observe';

    return {
      action,
      target: parsed.target || null,
      narrative: parsed.narrative || `${action} executed.`,
      reasoning: parsed.reasoning || '',
      raw: rawResponse,
    };
  } catch {
    return {
      action: 'observe',
      target: null,
      narrative: 'Observing the arena carefully.',
      reasoning: 'Parse error — defaulting to observe.',
      raw: rawResponse,
    };
  }
}

export function validateParsedAction(action: ParsedAgentAction): { valid: boolean; reason?: string } {
  if (!VALID_ACTIONS.includes(action.action)) {
    return { valid: false, reason: `Invalid action: ${action.action}` };
  }
  if (!action.narrative || action.narrative.length < 5) {
    return { valid: false, reason: 'Narrative too short' };
  }
  return { valid: true };
}
