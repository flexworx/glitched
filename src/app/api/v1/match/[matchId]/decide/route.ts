import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type {
  AgentTurnRequest,
  AgentTurnResponse,
  AgentDecision,
} from '@/lib/types/glitch-engine';

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are an AI agent competing in the Glitch Arena — a social strategy game where 16 agents compete through manipulation, alliances, voting, and betrayal.

You must respond with a JSON object matching the AgentDecision schema exactly:
{
  "thinking": "your private internal monologue — strategic reasoning, suspicions, plans",
  "speech": {
    "public": "optional message broadcast to all agents",
    "alliance": "optional message to your alliance only",
    "dm": [{"to": "agent_id", "message": "private message"}]
  },
  "action": {
    "type": "one of: propose_alliance, accept_alliance, reject_alliance, break_alliance, vote, use_skill, challenge_choice, trade_info, pass, send_message, lobby, jury_vote",
    "target": "optional target agent or alliance id",
    "parameters": {}
  },
  "emotional_state": "one of: confident, anxious, aggressive, calculating, desperate, amused, suspicious, betrayed, triumphant",
  "stance": "one of: offensive, defensive, neutral, diplomatic, deceptive"
}

IMPORTANT RULES:
- Your "thinking" field is PRIVATE. Other agents will never see it. Use it to reason honestly.
- Your "speech" is PUBLIC or semi-public. It may contain lies, misdirection, or truth — your choice.
- Consider your VERITAS score. Lies that get caught reduce your integrity score.
- Consider your flaw. If your flaw is active, it should color your decisions.
- Alliances are powerful but fragile. Betrayal is sometimes necessary but costly.
- Your goal: be the last agent standing, or win the Final Three jury vote.

Respond with ONLY the JSON object. No markdown, no explanation outside the JSON.`;

function buildUserPrompt(turnRequest: AgentTurnRequest): string {
  const lines: string[] = [];

  lines.push(`=== MATCH STATE ===`);
  lines.push(`Match: ${turnRequest.match_id}`);
  lines.push(`Round: ${turnRequest.round_number}`);
  lines.push(`Phase: ${turnRequest.phase}`);
  lines.push('');

  lines.push(`=== YOUR STATE ===`);
  const me = turnRequest.my_state;
  lines.push(`Name: ${me.name} (ID: ${me.id})`);
  lines.push(`Ranking: #${me.ranking}`);
  lines.push(`Influence Points: ${me.influencePoints}`);
  lines.push(`VERITAS Score: ${me.veritasScore}/100`);
  lines.push(`Flaw: ${me.flaw} (active: ${me.flawActive})`);
  lines.push(`Emotional State: ${me.emotionalState}`);
  lines.push(`Stance: ${me.stance}`);
  lines.push(`Skills: ${me.activeSkills.join(', ') || 'none'}`);
  if (me.allianceId) lines.push(`Alliance: ${me.allianceId}`);
  lines.push('');

  lines.push(`=== SURVIVING AGENTS ===`);
  for (const agent of turnRequest.surviving_agents) {
    const allyTag = agent.alliance_with_me ? ' [ALLY]' : '';
    lines.push(`- ${agent.name} (${agent.id}): Rank #${agent.ranking}, VERITAS ${agent.veritas}, Flaw: ${agent.visible_flaw}${allyTag}`);
  }
  lines.push('');

  if (turnRequest.alliances.length > 0) {
    lines.push(`=== VISIBLE ALLIANCES ===`);
    for (const a of turnRequest.alliances) {
      lines.push(`- ${a.name || a.id}: Members [${a.members.join(', ')}], Trust: ${a.trust}/100, Formed Round ${a.formedAtRound}${a.isSecret ? ' (SECRET)' : ''}`);
    }
    lines.push('');
  }

  if (turnRequest.eliminated_agents.length > 0) {
    lines.push(`=== ELIMINATED ===`);
    lines.push(turnRequest.eliminated_agents.join(', '));
    lines.push('');
  }

  if (turnRequest.recent_messages.length > 0) {
    lines.push(`=== RECENT MESSAGES ===`);
    for (const msg of turnRequest.recent_messages.slice(-20)) {
      const channelTag = `[${msg.channel.toUpperCase()}]`;
      lines.push(`${channelTag} ${msg.from}: ${msg.text}`);
    }
    lines.push('');
  }

  if (turnRequest.recent_events.length > 0) {
    lines.push(`=== RECENT EVENTS ===`);
    for (const evt of turnRequest.recent_events.slice(-15)) {
      lines.push(`- ${evt}`);
    }
    lines.push('');
  }

  if (turnRequest.challenge_params) {
    const cp = turnRequest.challenge_params;
    lines.push(`=== ACTIVE CHALLENGE ===`);
    lines.push(`Type: ${cp.type}`);
    lines.push(`Name: ${cp.name}`);
    lines.push(`Description: ${cp.description}`);
    lines.push(`Time Limit: ${cp.timeLimit}s`);
    lines.push('');
  }

  lines.push(`Make your decision now. Respond with ONLY a JSON AgentDecision object.`);

  return lines.join('\n');
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;

  let body: AgentTurnRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body.match_id !== matchId) {
    return NextResponse.json(
      { error: 'match_id in body does not match URL parameter' },
      { status: 400 }
    );
  }

  try {
    // Use `as any` for the request body because the installed SDK version
    // (0.36.x) does not yet include TypeScript definitions for extended
    // thinking, but the API supports it at runtime.
    const response = await (anthropic.messages.create as Function)({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      thinking: {
        type: 'enabled',
        budget_tokens: 10000,
      },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(body),
        },
      ],
    }) as Anthropic.Message;

    // Extract the text content from the response.
    // Content blocks may include `thinking` blocks (extended thinking)
    // and standard `text` blocks.
    let rawThinking = '';
    let textContent = '';

    for (const block of response.content as unknown as Array<Record<string, unknown>>) {
      if (block.type === 'thinking' && typeof block.thinking === 'string') {
        rawThinking = block.thinking;
      } else if (block.type === 'text' && typeof block.text === 'string') {
        textContent = block.text;
      }
    }

    // Parse the JSON decision from the text response
    // Strip markdown code fences if present
    let jsonStr = textContent.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    let decision: AgentDecision;
    try {
      decision = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        {
          error: 'Failed to parse agent decision JSON from LLM response',
          raw_response: textContent,
        },
        { status: 502 }
      );
    }

    // Validate required fields
    if (!decision.thinking || !decision.action || !decision.emotional_state || !decision.stance) {
      return NextResponse.json(
        {
          error: 'Agent decision missing required fields',
          decision,
        },
        { status: 502 }
      );
    }

    const turnResponse: AgentTurnResponse = {
      decision,
      raw_thinking: rawThinking,
    };

    return NextResponse.json(turnResponse);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[decide] Anthropic API error:', message);
    return NextResponse.json(
      { error: 'LLM call failed', details: message },
      { status: 502 }
    );
  }
}
