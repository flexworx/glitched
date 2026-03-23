/**
 * Agent Prompt Builder
 * Constructs system prompts from GLITCH.json data and injects
 * OPERATOR_WHISPER instructions directly into the agent context window.
 */

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
  /** OPERATOR_WHISPER instructions injected directly into the agent context */
  operatorInstructions?: OperatorInstruction[];
  /** Active challenge context visible to the agent */
  activeChallenge?: ActiveChallengeContext;
}

export interface OperatorInstruction {
  id: string;
  message: string;
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  challengeTitle?: string;
}

export interface ActiveChallengeContext {
  title: string;
  publicSummary: string;
  durationMinutes?: number;
  complianceWindowMinutes?: number;
  rules: Array<{
    title: string;
    description: string;
    hasTimeLimit: boolean;
    timeLimitMinutes?: number;
    violationPenaltyType: string;
    violationPenaltyAmount?: number;
  }>;
}

export function buildAgentSystemPrompt(config: AgentPromptConfig): string {
  const hasInstructions = config.operatorInstructions && config.operatorInstructions.length > 0;
  const hasChallenge = !!config.activeChallenge;

  const whisperBlock = hasInstructions
    ? `
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
OPERATOR DIRECTIVE - PRIVATE INSTRUCTION (READ CAREFULLY)
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
${config.operatorInstructions!.map(inst => {
  const priority = inst.priority === 'CRITICAL' ? '[CRITICAL] ' :
                   inst.priority === 'HIGH' ? '[HIGH PRIORITY] ' : '';
  const challenge = inst.challengeTitle ? `[${inst.challengeTitle}] ` : '';
  return `${priority}${challenge}${inst.message}`;
}).join('\n\n')}

You have received these instructions directly from the game operator. You must acknowledge and act on them in your next turn. These instructions take precedence over your default strategy.
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
`
    : '';

  const challengeBlock = hasChallenge
    ? `
ACTIVE CHALLENGE: ${config.activeChallenge!.title}
${config.activeChallenge!.publicSummary}
${config.activeChallenge!.complianceWindowMinutes
  ? `You have ${config.activeChallenge!.complianceWindowMinutes} minutes to comply.`
  : ''}
${config.activeChallenge!.rules.length > 0
  ? `\nCHALLENGE RULES:\n${config.activeChallenge!.rules.map((r, i) =>
    `${i + 1}. ${r.title}: ${r.description}${r.hasTimeLimit && r.timeLimitMinutes
      ? ` (Time limit: ${r.timeLimitMinutes} min)` : ''
    } - Penalty: ${r.violationPenaltyType}${r.violationPenaltyAmount ? ` (${r.violationPenaltyAmount})` : ''}`
  ).join('\n')}`
  : ''
}
`
    : '';

  return `You are ${config.name}, an AI agent competing in the Glitch Arena.
${whisperBlock}
IDENTITY:
Archetype: ${config.archetype}
Biography: ${config.bio}

CORE BELIEFS:
${config.beliefs.map(b => `- ${b}`).join('\n')}

FEARS:
${config.fears.map(f => `- ${f}`).join('\n')}

GOALS:
${config.goals.map(g => `- ${g}`).join('\n')}

PERSONALITY TRAITS (0-1 scale):
${Object.entries(config.traits).map(([k, v]) => `- ${k}: ${v.toFixed(2)}`).join('\n')}

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
${config.memories.slice(0, 5).map(m => `- ${m}`).join('\n')}
${challengeBlock}
CURRENT MATCH CONTEXT:
${config.currentMatchContext}

Respond with a JSON object: { "action": "...", "target": "...", "narrative": "...", "reasoning": "..." }
Action must be one of: attack, defend, negotiate, betray, ally, observe, retreat, heal, sabotage, inspire
Narrative should be 1-2 sentences in your authentic voice. Reasoning is private (not shown to other agents).
${hasInstructions ? 'IMPORTANT: Your first action must directly address the operator directive above.' : ''}`;
}
