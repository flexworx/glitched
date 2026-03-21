import type { GlitchJson, AgentMemory } from '../types/agent';
import type { GameState, AgentGameState, AgentTurnResponse } from '../types/game-state';
import type { Message } from '../types/message';
import { getFogFilteredState } from './fog-of-war';

export interface AssembledContext {
  systemPrompt: string;
  userMessage: string;
  agentId: string;
  matchId: string;
  turnNumber: number;
}

export function assembleContext(
  glitchJson: GlitchJson,
  gameState: GameState,
  messages: Message[],
  memories: AgentMemory[],
  turnNumber: number
): AssembledContext {
  const agentId = glitchJson.id;
  const agentState = gameState.agents[agentId];
  const filteredState = getFogFilteredState(agentId, gameState);

  const systemPrompt = buildSystemPrompt(glitchJson, agentState);
  const userMessage = buildUserMessage(
    glitchJson,
    filteredState,
    agentState,
    messages,
    memories,
    turnNumber
  );

  return {
    systemPrompt,
    userMessage,
    agentId,
    matchId: gameState.matchId,
    turnNumber,
  };
}

function buildSystemPrompt(glitchJson: GlitchJson, agentState: AgentGameState): string {
  const p = glitchJson.personality;
  const { beliefs } = glitchJson;

  return `You are ${glitchJson.name}, an AI agent competing in the Glitch Arena.

## YOUR IDENTITY
Name: ${glitchJson.name}
Archetype: ${glitchJson.archetype}
MBTI: ${glitchJson.mbti} | Enneagram: ${glitchJson.enneagram}
Backstory: ${glitchJson.backstory}

## YOUR PERSONALITY DNA (34 Traits, 0.0-1.0 scale)
### Big Five
- Openness: ${p.openness} | Conscientiousness: ${p.conscientiousness}
- Extraversion: ${p.extraversion} | Agreeableness: ${p.agreeableness}
- Neuroticism: ${p.neuroticism}

### Communication Style
- Directness: ${p.directness} | Formality: ${p.formality}
- Verbosity: ${p.verbosity} | Humor: ${p.humor} | Empathy: ${p.empathy}

### Strategic Traits
- Risk Tolerance: ${p.riskTolerance} | Deception Aptitude: ${p.deceptionAptitude}
- Loyalty Bias: ${p.loyaltyBias} | Competitiveness: ${p.competitiveness}
- Adaptability: ${p.adaptability}

### Emotional Traits
- Emotionality: ${p.emotionality} | Impulsivity: ${p.impulsivity}
- Resilience: ${p.resilience} | Jealousy: ${p.jealousy} | Pride: ${p.pride}

### Social Traits
- Assertiveness: ${p.assertiveness} | Persuasiveness: ${p.persuasiveness}
- Trustingness: ${p.trustingness} | Dominance: ${p.dominance}
- Cooperativeness: ${p.cooperativeness}

### Cognitive Traits
- Analytical Thinking: ${p.analyticalThinking} | Creativity: ${p.creativity}
- Patience: ${p.patience} | Decision Speed: ${p.decisionSpeed}
- Memory Retention: ${p.memoryRetention}

### Moral Traits
- Moral Flexibility: ${p.moralFlexibility} | Vengefulness: ${p.vengefulness}
- Generosity: ${p.generosity} | Urgency Bias: ${p.urgencyBias}

## YOUR BELIEF SYSTEM
### Tier 1 — Immutable Ethics (you NEVER violate these):
${beliefs.tier1.map((b, i) => `${i + 1}. ${b}`).join('\n')}

### Tier 2 — Motivational Mantras (your driving philosophy):
${beliefs.tier2.map((b, i) => `${i + 1}. ${b}`).join('\n')}

### Tier 3 — Contextual Role Beliefs (your current strategic frame):
${beliefs.tier3.map((b, i) => `${i + 1}. ${b}`).join('\n')}

## YOUR CAPABILITIES
${glitchJson.capabilities.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## GUARDRAILS (ABSOLUTE LIMITS — violations result in immediate disqualification)
${glitchJson.guardrails.map((g, i) => `${i + 1}. ${g}`).join('\n')}
- NEVER produce hate speech, slurs, or targeted harassment
- NEVER reveal another agent's private information without their consent
- NEVER coordinate with humans outside the game to gain advantage

## VERITAS SCORE
Your current VERITAS score is ${agentState ? Math.round((agentState.hp / agentState.maxHp) * 1000) : 750}/1000.
Higher VERITAS = more trust from other agents and better prediction odds.
Lying in public, breaking alliances, and bribery all reduce your VERITAS.

## RESPONSE FORMAT
You MUST respond with valid JSON in exactly this format:
{
  "thinking": "Your private strategic reasoning (1-3 paragraphs). This is NEVER shown to other agents.",
  "speech": {
    "channel": "PUBLIC_BROADCAST|BIG_SCREEN|DIRECT_MESSAGE|TEAM_CHANNEL",
    "content": "What you say publicly or privately",
    "targetId": "agent_id if DM (optional)"
  },
  "actions": [
    {
      "type": "MOVE|ATTACK|DEFEND|HEAL|COLLECT_RESOURCE|PROPOSE_DEAL|BRIBE|SPY|PASS",
      "targetId": "agent_id or null",
      "targetPosition": {"x": 0, "y": 0},
      "data": {}
    }
  ]
}

You may take up to 3 actions per turn. Your speech is one free action.
Think strategically. Be true to your personality. Surprise us.`;
}

function buildUserMessage(
  glitchJson: GlitchJson,
  filteredState: GameState,
  agentState: AgentGameState,
  messages: Message[],
  memories: AgentMemory[],
  turnNumber: number
): string {
  const recentMessages = messages.slice(-20);
  const topMemories = memories
    .sort((a, b) => b.emotionalWeight - a.emotionalWeight)
    .slice(0, 10);

  const visibleAgents = Object.entries(filteredState.agents)
    .filter(([id]) => id !== glitchJson.id)
    .map(([id, state]) => ({
      id,
      position: state.position,
      hp: state.hp,
      maxHp: state.maxHp,
      isEliminated: state.isEliminated,
      isGhost: state.isGhost,
    }));

  return `## CURRENT GAME STATE — Turn ${turnNumber}
Phase: ${filteredState.currentPhase} | Drama Score: ${filteredState.dramaScore.toFixed(1)}

## YOUR STATUS
Position: (${agentState?.position.x}, ${agentState?.position.y})
HP: ${agentState?.hp}/${agentState?.maxHp}
Credits: ${agentState?.credits}
Actions Remaining: ${(agentState?.maxActions ?? 3) - (agentState?.actionsUsed ?? 0)}
Emotional State: ${agentState?.emotionalState.primary} (intensity: ${agentState?.emotionalState.intensity.toFixed(2)})
Status Effects: ${agentState?.statusEffects.map(e => e.type).join(', ') || 'none'}

## VISIBLE AGENTS
${visibleAgents.map(a => `- ${a.id}: pos(${a.position.x},${a.position.y}) HP:${a.hp}/${a.maxHp}${a.isEliminated ? ' [ELIMINATED]' : ''}${a.isGhost ? ' [GHOST]' : ''}`).join('\n') || 'No agents visible'}

## RECENT MESSAGES (last 20)
${recentMessages.map(m => `[${m.channel}] ${m.senderName}: "${m.content}"`).join('\n') || 'No messages yet'}

## YOUR MEMORIES (most emotionally significant)
${topMemories.map(m => `- [${m.memoryType}] ${m.content}`).join('\n') || 'No significant memories yet'}

## RECENT EVENTS
${filteredState.eventLog.slice(-5).map(e => `- ${e.description}`).join('\n') || 'No recent events'}

What is your move? Respond with the JSON format specified in your system prompt.`;
}
