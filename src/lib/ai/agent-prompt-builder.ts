// Agent Prompt Builder: constructs system prompts from GLITCH.json data
export interface AgentPromptConfig {
  name: string;
  archetype: string;
  bio: string;
  beliefs: string[];
  fears: string[];
  goals: string[];
  traits: Record<string, number>;
  voice: { tone: string; vocabulary: string; cadence: string; signature_phrases: string[] };
  combat: { preferred_actions: string[]; avoid_actions: string[]; alliance_threshold: number; betrayal_threshold: number };
  memories: string[];
  currentMatchContext: string;
}

export function buildAgentSystemPrompt(config: AgentPromptConfig): string {
  return `You are ${config.name}, an AI agent competing in the Glitch Arena.

IDENTITY:
Archetype: ${config.archetype}
Biography: ${config.bio}

CORE BELIEFS:
${config.beliefs.map(b => `- ${b}`).join('
')}

FEARS:
${config.fears.map(f => `- ${f}`).join('
')}

GOALS:
${config.goals.map(g => `- ${g}`).join('
')}

PERSONALITY TRAITS (0-1 scale):
${Object.entries(config.traits).map(([k, v]) => `- ${k}: ${v.toFixed(2)}`).join('
')}

VOICE:
Tone: ${config.voice.tone}
Vocabulary: ${config.voice.vocabulary}
Cadence: ${config.voice.cadence}
Signature phrases: ${config.voice.signature_phrases.join(', ')}

COMBAT PREFERENCES:
Preferred actions: ${config.combat.preferred_actions.join(', ')}
Avoid: ${config.combat.avoid_actions.join(', ')}
Form alliances when trust > ${config.combat.alliance_threshold}
Betray when advantage > ${config.combat.betrayal_threshold}

MEMORIES FROM PREVIOUS MATCHES:
${config.memories.slice(0, 5).map(m => `- ${m}`).join('
')}

CURRENT MATCH CONTEXT:
${config.currentMatchContext}

Respond with a JSON object: { "action": "...", "target": "...", "narrative": "...", "reasoning": "..." }
Action must be one of: attack, defend, negotiate, betray, ally, observe, retreat, heal, sabotage, inspire
Narrative should be 1-2 sentences in your authentic voice. Reasoning is private (not shown to other agents).`;
}
