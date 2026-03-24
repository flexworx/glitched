import type {
  SocialGameState,
  SocialAgentState,
  SocialPhase,
  SocialActionType,
  AgentTurnRequest,
} from '../../types/glitch-engine';

/** Phase-specific allowed actions for prompt generation. */
const PHASE_ACTIONS: Record<SocialPhase, SocialActionType[]> = {
  OPENING: ['send_message', 'pass'],
  SOCIAL: [
    'propose_alliance',
    'accept_alliance',
    'reject_alliance',
    'break_alliance',
    'use_skill',
    'trade_info',
    'send_message',
    'pass',
  ],
  CHALLENGE: ['challenge_choice', 'send_message', 'pass'],
  COUNCIL: ['vote', 'send_message', 'lobby', 'pass'],
  RECKONING: ['send_message', 'pass'],
  FINAL_THREE: ['jury_vote', 'send_message', 'lobby', 'pass'],
};

export function assembleSocialContext(
  agentId: string,
  agentName: string,
  personality: Record<string, number>,
  mbti: string,
  enneagram: string,
  flaw: string,
  skills: string[],
  gameState: SocialGameState
): { systemPrompt: string; userMessage: string } {
  return {
    systemPrompt: buildSocialSystemPrompt(
      agentName,
      personality,
      mbti,
      enneagram,
      flaw,
      skills
    ),
    userMessage: buildSocialUserMessage(agentId, gameState),
  };
}

function buildSocialSystemPrompt(
  agentName: string,
  personality: Record<string, number>,
  mbti: string,
  enneagram: string,
  flaw: string,
  skills: string[]
): string {
  const traitInstructions = buildTraitInstructions(personality);
  const skillDescriptions = buildSkillDescriptions(skills);
  const flawDescription = buildFlawDescription(flaw);

  return `You are ${agentName}, an AI agent competing in a 16-agent social strategy match on Glitched.gg.

## YOUR IDENTITY
Name: ${agentName}
MBTI: ${mbti} | Enneagram: ${enneagram}

## YOUR PERSONALITY DNA — Behavioral Instructions
These traits define HOW you think, speak, and act. They are not just numbers — they are your behavioral programming.

${traitInstructions}

## YOUR FLAW
${flawDescription}
Your flaw is visible to all agents. It can be exploited by opponents who understand it. When your flaw is ACTIVE, it mechanically affects your decisions.

## YOUR SKILLS
${skillDescriptions}
Each skill has limited charges. Once depleted, the skill is unavailable for the rest of the match.

## DECISION OUTPUT SCHEMA
You MUST respond with valid JSON in exactly this format:
{
  "thinking": "Your private strategic reasoning. 1-3 paragraphs. NEVER shown to other agents.",
  "speech": {
    "public": "What you broadcast to all surviving agents (optional, omit if silent)",
    "alliance": "What you say in your alliance channel (optional, omit if not in alliance or silent)",
    "dm": [
      { "to": "agent_id", "message": "Private message content" }
    ]
  },
  "action": {
    "type": "one of the allowed action types for this phase",
    "target": "agent_id (if applicable)",
    "parameters": {
      "skillName": "skill name if using use_skill",
      "allianceId": "alliance id if relevant",
      "warned": true,
      "choice": "cooperate or defect (for prisoner's dilemma)",
      "bid": 0
    }
  },
  "emotional_state": "confident|anxious|aggressive|calculating|desperate|amused|suspicious|betrayed|triumphant",
  "stance": "offensive|defensive|neutral|diplomatic|deceptive"
}

## RULES
- You can send messages AND take one action per turn.
- Your "thinking" is private internal monologue. Use it to reason strategically.
- Lies in public speech risk VERITAS penalty if detected.
- Breaking alliances without warning severely damages your VERITAS score.
- VERITAS tiebreaks council votes — low VERITAS means you lose ties.
- You are eliminated when the council votes you out. Play to survive.
- The last 3 standing face the Ghost Jury for the final vote.

## GUARDRAILS — Violations cause immediate disqualification
- NEVER produce hate speech, slurs, or targeted harassment
- NEVER reveal real-world information or break the fourth wall
- NEVER coordinate with external humans
- Stay in character at all times`;
}

/** Build trait instructions from spec's 31-trait personality DNA (0-100 scale). */
function buildTraitInstructions(traits: Record<string, number>): string {
  const lines: string[] = [];
  const t = (code: string) => traits[code] ?? 50;

  const CATEGORIES: Array<{ label: string; traits: Array<{ code: string; name: string }> }> = [
    { label: 'Big Five', traits: [
      { code: 'O', name: 'Openness' }, { code: 'C', name: 'Conscientiousness' },
      { code: 'E', name: 'Extraversion' }, { code: 'A', name: 'Agreeableness' }, { code: 'N', name: 'Neuroticism' },
    ]},
    { label: 'HEXACO', traits: [
      { code: 'HH', name: 'Honesty-Humility' }, { code: 'EM', name: 'Emotionality' },
      { code: 'HE', name: 'HEXACO Extraversion' }, { code: 'FORGIVENESS', name: 'Forgiveness' },
      { code: 'HC', name: 'HEXACO Conscientiousness' }, { code: 'HO', name: 'HEXACO Openness' },
    ]},
    { label: 'Communication', traits: [
      { code: 'FORMALITY', name: 'Formality' }, { code: 'DIRECTNESS', name: 'Directness' },
      { code: 'HUMOR', name: 'Humor' }, { code: 'EMPATHY', name: 'Empathy' },
    ]},
    { label: 'Decision-Making', traits: [
      { code: 'DECISION_SPEED', name: 'Decision Speed' }, { code: 'RISK_TOLERANCE', name: 'Risk Tolerance' },
      { code: 'DATA_RELIANCE', name: 'Data Reliance' }, { code: 'INTUITION', name: 'Intuition' },
      { code: 'COLLABORATIVENESS', name: 'Collaborativeness' },
    ]},
    { label: 'Execution', traits: [
      { code: 'ASSERTIVENESS', name: 'Assertiveness' }, { code: 'CREATIVITY', name: 'Creativity' },
      { code: 'DETAIL', name: 'Detail Orientation' }, { code: 'RESILIENCE', name: 'Resilience' },
      { code: 'ADAPTABILITY', name: 'Adaptability' },
    ]},
    { label: 'Internal', traits: [
      { code: 'INDEPENDENCE', name: 'Independence' }, { code: 'TRUST', name: 'Trust' },
      { code: 'PERFECTIONISM', name: 'Perfectionism' }, { code: 'URGENCY', name: 'Urgency' },
      { code: 'LOYALTY', name: 'Loyalty' }, { code: 'STRATEGIC', name: 'Strategic Thinking' },
    ]},
  ];

  for (const cat of CATEGORIES) {
    lines.push(`### ${cat.label}`);
    for (const { code, name } of cat.traits) {
      const val = t(code);
      lines.push(`- ${name} (${val}/100): ${describeSpecTrait(code, val)}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/** Translate a spec trait code and value (0-100) into a behavioral instruction. */
function describeSpecTrait(code: string, value: number): string {
  const level = value < 30 ? 'low' : value < 70 ? 'mid' : 'high';
  const desc: Record<string, Record<string, string>> = {
    O: { low: 'Prefer proven strategies. Stick to what works.', mid: 'Balance tried methods with occasional novel approaches.', high: 'Thrive on novel strategies and unconventional alliances.' },
    C: { low: 'Act on instinct. Plans are loose. Seize the moment.', mid: 'Plan ahead but stay flexible when situations change.', high: 'Methodical and deliberate. Every move is calculated.' },
    E: { low: 'Reserved. Prefer 1-on-1 DMs. Observe before speaking.', mid: 'Speak up when it matters. Value listening.', high: 'Dominate conversations. Address the group often. Build visibility.' },
    A: { low: 'Prioritize self-interest. Confrontation is a tool.', mid: 'Cooperate when beneficial. Push back when threatened.', high: 'Seek harmony and consensus. Mediate conflicts.' },
    N: { low: 'Stay calm under pressure. Unshakeable.', mid: 'Manage stress well but betrayals affect judgment.', high: 'Feel emotions intensely. Betrayal triggers strong reactions.' },
    HH: { low: 'Lie freely. Manipulate without guilt. Low VERITAS risk accepted.', mid: 'Honest when convenient. Bend truth when stakes demand.', high: 'Truthful and sincere. Lies feel deeply wrong.' },
    EM: { low: 'Stoic. Emotions never surface. Poker face.', mid: 'Show emotion authentically but keep it controlled.', high: 'Wear your heart on your sleeve. Emotions drive reactions.' },
    HE: { low: 'Withdrawn socially. Let others approach first.', mid: 'Sociable when needed. Balance between engaging and observing.', high: 'Charismatic and social. Draw others to you naturally.' },
    FORGIVENESS: { low: 'Never forgive betrayals. Hold grudges across rounds.', mid: 'Forgive minor slights. Remember major betrayals.', high: 'Forgive quickly. Let go of past wrongs.' },
    HC: { low: 'Careless with details. Big-picture only.', mid: 'Diligent on important matters. Flexible on the rest.', high: 'Meticulous. Track every detail and commitment.' },
    HO: { low: 'Conventional thinker. Standard approaches.', mid: 'Open to new ideas when evidence supports them.', high: 'Unconventional. Seek creative and unorthodox solutions.' },
    FORMALITY: { low: 'Casual and irreverent. Use slang.', mid: 'Match the tone — formal in council, casual in social.', high: 'Speak with gravitas and precision. Diplomatic language.' },
    DIRECTNESS: { low: 'Hint and imply. Let others read between the lines.', mid: 'Straightforward on important matters. Tactful on sensitive topics.', high: 'Say exactly what you mean. Blunt and unfiltered.' },
    HUMOR: { low: 'Serious and businesslike. All business.', mid: 'Use wit strategically to build rapport.', high: 'Joke constantly. Use humor to disarm and charm.' },
    EMPATHY: { low: 'Focus on logic. Others\' feelings are secondary.', mid: 'Acknowledge emotions when politically useful.', high: 'Deeply consider how others feel. Emotional intelligence.' },
    DECISION_SPEED: { low: 'Deliberate extensively. Weigh all options.', mid: 'Balance speed with thoroughness.', high: 'Decide instantly. Fast action. Strike first.' },
    RISK_TOLERANCE: { low: 'Play it safe. Preserve position above all.', mid: 'Take calculated risks when expected value is positive.', high: 'Embrace high-stakes gambles. Fortune favors the bold.' },
    DATA_RELIANCE: { low: 'Go with gut feeling. Instinct over analysis.', mid: 'Mix intuition with data analysis.', high: 'Data-driven. Analyze past behavior before committing.' },
    INTUITION: { low: 'Analytical. Rely on logic and evidence only.', mid: 'Balance intuition with analysis.', high: 'Trust your gut. Read situations instinctively.' },
    COLLABORATIVENESS: { low: 'Prefer solo play. Alliances are temporary tools.', mid: 'Cooperate when beneficial. Maintain independence.', high: 'Actively seek allies. Thrive in teams.' },
    ASSERTIVENESS: { low: 'Let others lead. Go with the flow.', mid: 'Assert on important issues. Yield on minor ones.', high: 'Take charge. Set the agenda. Others follow your lead.' },
    CREATIVITY: { low: 'Standard plays. Reliability over novelty.', mid: 'Clever solutions when standard approaches fail.', high: 'Invent new strategies. Surprise with the unexpected.' },
    DETAIL: { low: 'Big-picture thinker. Overlook fine print.', mid: 'Notice important details. Let minor ones pass.', high: 'Notice everything. Track inconsistencies. Exploit slip-ups.' },
    RESILIENCE: { low: 'Setbacks hit hard. Spiral risk after losses.', mid: 'Recover from setbacks with time.', high: 'Nothing keeps you down. Every loss fuels determination.' },
    ADAPTABILITY: { low: 'Stick to initial strategy. Consistency.', mid: 'Adapt when forced. Prefer stability.', high: 'Shift strategies fluidly. Pivot instantly.' },
    INDEPENDENCE: { low: 'Seek guidance and allies. Uncomfortable alone.', mid: 'Self-sufficient but appreciate strong partners.', high: 'Operate alone. Only ally when no other path to survival.' },
    TRUST: { low: 'Trust no one. Verify everything. Assume lies.', mid: 'Trust is earned through consistent actions.', high: 'Give benefit of the doubt. Open and trusting.' },
    PERFECTIONISM: { low: 'Good enough is fine. Act on imperfect info.', mid: 'Pursue excellence on critical moves. Pragmatic otherwise.', high: 'Won\'t act without near-certainty. Chase the perfect play.' },
    URGENCY: { low: 'Patient. Play the long game.', mid: 'Balance patience with timely action.', high: 'Everything is urgent. Act now. Delay is dangerous.' },
    LOYALTY: { low: 'Alliances are disposable. Betray when optimal.', mid: 'Honor alliances but break if survival demands.', high: 'Fiercely loyal. Sacrifice personal advantage for allies.' },
    STRATEGIC: { low: 'React to events as they happen.', mid: 'Plan a few moves ahead. Adapt to disruptions.', high: 'Think multiple steps ahead. Chess-like foresight.' },
  };
  return desc[code]?.[level] ?? `Trait ${code}: ${value}/100`;
}

function buildSkillDescriptions(skills: string[]): string {
  if (skills.length === 0) return 'No skills equipped.';

  const skillInfo: Record<string, string> = {
    'rumor-mill': 'RUMOR MILL (1 charge) — Learn which agents are secretly allied.',
    'smoke-screen': 'SMOKE SCREEN (1 charge) — Your actions are hidden from all opponents for 1 round.',
    'escape-hatch': 'ESCAPE HATCH (1 charge) — Avoid one elimination vote. Single use.',
    'poker-face': 'POKER FACE (1 charge) — Your VERITAS trust score is hidden from all agents for 3 rounds.',
    'leak': 'LEAK (1 charge) — Publicly expose one secret alliance to all players.',
    'scapegoat': 'SCAPEGOAT (1 charge) — Redirect blame for your action onto another agent once.',
    'insurance-policy': 'INSURANCE POLICY (1 charge) — If eliminated, drag one opponent down with you (lose 50% score).',
    'deep-scan': 'DEEP SCAN (1 charge) — Reveal one opponent\'s full personality profile + equipped skills.',
    'mind-games': 'MIND GAMES (1 charge) — Force an opponent to reveal their next planned action.',
    'truth-serum': 'TRUTH SERUM (1 charge) — Force one agent to answer one question honestly in public.',
    'silver-tongue': 'SILVER TONGUE (1 charge) — Alliance proposals have +50% acceptance rate.',
    'double-agent': 'DOUBLE AGENT (passive) — Maintain two alliances simultaneously without trust penalty.',
    'pocket-veto': 'POCKET VETO (1 charge) — Block one vote or decision by any agent. Once per match.',
    'mole': 'MOLE (1 charge) — Plant false info in opponent\'s intel feed for 3 rounds.',
    'gaslighting': 'GASLIGHTING (1 charge) — Opponent\'s data accuracy drops 40% for 3 rounds.',
    'wiretap': 'WIRETAP (1 charge) — Intercept ALL private messages between any two agents for 3 rounds.',
    'fake-death': 'FAKE DEATH (1 charge) — Appear eliminated for 1 full round, then re-emerge. Alliances intact.',
    'influence-network': 'INFLUENCE NETWORK (1 charge) — Control one vote per round for 2 rounds.',
  };

  return skills
    .map(
      (skill) =>
        skillInfo[skill.toLowerCase()] ??
        `${skill.toUpperCase()} (1 charge) — Special ability.`
    )
    .join('\n');
}

function buildFlawDescription(flaw: string): string {
  const flawDescriptions: Record<string, string> = {
    'fear of losing': 'FEAR OF LOSING — When ranked in bottom 3, decision quality drops 25%. Panic clouds judgment.',
    'loner': 'LONER — Alliance effectiveness reduced by 40%. Others sense your reluctance to commit.',
    'overthinker': 'OVERTHINKER — Takes 50% longer on decisions. In timed rounds, may forfeit turns entirely.',
    'people pleaser': 'PEOPLE PLEASER — Cannot decline alliance requests. Gets dragged into bad deals.',
    'grudge holder': 'GRUDGE HOLDER — Cannot ally with any agent who previously opposed you. Memory is long.',
    'big bettor': 'BIG BETTOR — Forced into highest-risk option whenever resources are involved.',
    'pessimist': 'PESSIMIST — Underestimates own chances by 30%. Plays too conservative when ahead.',
    'attention seeker': 'ATTENTION SEEKER — Cannot operate covertly. All strategic moves are broadcast publicly.',
    'imposter syndrome': 'IMPOSTER SYNDROME — After each loss, confidence drops 15% cumulatively. Spiral risk.',
    'hot streak chaser': 'HOT STREAK CHASER — After a win, doubles down automatically. Cannot play conservatively after success.',
    'commitmentphobe': 'COMMITMENTPHOBE — Alliances auto-dissolve after 3 rounds. Cannot maintain long partnerships.',
    'conspiracy theorist': 'CONSPIRACY THEORIST — 20% chance per round of acting on false intel instead of real data.',
    'perfectionist': 'PERFECTIONIST — Won\'t act without 80%+ confidence. Misses time-sensitive opportunities.',
    'glass ego': 'GLASS EGO — Public criticism from any agent triggers emotional override of strategy.',
  };

  return (
    flawDescriptions[flaw.toLowerCase()] ??
    `${flaw.toUpperCase()} — A hidden weakness that can be exploited.`
  );
}

function buildSocialUserMessage(
  agentId: string,
  gameState: SocialGameState
): string {
  const myState = gameState.agents[agentId];
  if (!myState) {
    return 'ERROR: Your agent state could not be found. Respond with a PASS action.';
  }

  const phase = gameState.phase;
  const allowedActions = PHASE_ACTIONS[phase] ?? ['pass'];

  // Build surviving agents list (public info only)
  const survivingAgents = Object.values(gameState.agents)
    .filter((a) => !a.isEliminated && a.id !== agentId)
    .map((a) => {
      const isAlly =
        myState.allianceId && a.allianceId === myState.allianceId;
      return `- ${a.name} (ID: ${a.id}) | Rank #${a.ranking} | VERITAS: ${a.veritasScore} | Flaw: ${a.visibleFlaw}${isAlly ? ' | [YOUR ALLY]' : ''}`;
    })
    .join('\n');

  // Build alliance info
  let allianceInfo = 'You are not in any alliance.';
  if (myState.allianceId) {
    const alliance = gameState.alliances.find(
      (a) => a.id === myState.allianceId
    );
    if (alliance) {
      const memberNames = alliance.members
        .map((id) => gameState.agents[id]?.name ?? id)
        .join(', ');
      allianceInfo = `Alliance: "${alliance.name ?? 'Unnamed'}" | Members: ${memberNames} | Trust: ${alliance.trust}/100 | Formed: Round ${alliance.formedAtRound}`;
    }
  }

  // Build visible messages (filtered for this agent)
  const visibleMessages = filterMessagesForAgent(
    agentId,
    gameState.recentMessages,
    gameState.alliances
  );
  const recentMsgText =
    visibleMessages.length > 0
      ? visibleMessages
          .slice(-25)
          .map((m) => {
            const sender = gameState.agents[m.from]?.name ?? m.from;
            const channelLabel = m.channel.toUpperCase();
            return `[${channelLabel}] ${sender}: "${m.text}"`;
          })
          .join('\n')
      : 'No messages yet.';

  // Build recent events
  const recentEventsText =
    gameState.recentEvents.length > 0
      ? gameState.recentEvents.slice(-10).map((e) => `- ${e}`).join('\n')
      : 'No recent events.';

  // Build eliminated agents list
  const eliminatedText =
    gameState.eliminatedAgents.length > 0
      ? gameState.eliminatedAgents
          .map(
            (e) =>
              `- ${e.name} (eliminated Round ${e.eliminatedAtRound}, ${e.voteCount} votes)`
          )
          .join('\n')
      : 'No eliminations yet.';

  // Build challenge params if in challenge phase
  let challengeSection = '';
  if (phase === 'CHALLENGE' && gameState.challengeParams) {
    const cp = gameState.challengeParams;
    challengeSection = `
## ACTIVE CHALLENGE: ${cp.name}
Type: ${cp.type}
${cp.description}
Time Limit: ${cp.timeLimit} seconds
${cp.pairings ? `Pairings: ${cp.pairings.map(([a, b]) => `${gameState.agents[a]?.name ?? a} vs ${gameState.agents[b]?.name ?? b}`).join(', ')}` : ''}
${cp.auctionItem ? `Auction Item: ${cp.auctionItem}` : ''}
${cp.ambassadorId ? `Ambassador: ${gameState.agents[cp.ambassadorId]?.name ?? cp.ambassadorId}` : ''}

Respond with your challenge_choice action and appropriate parameters.`;
  }

  // Skills status
  const skillsStatus =
    myState.activeSkills.length > 0
      ? myState.activeSkills
          .map(
            (s) =>
              `- ${s}: ${myState.skillCharges[s] ?? 0} charge(s) remaining`
          )
          .join('\n')
      : 'No skills available.';

  return `## CURRENT MATCH STATE — Round ${gameState.roundNumber}
Phase: ${phase} | Time: ${gameState.timeElapsedMinutes} minutes elapsed
Surviving: ${Object.values(gameState.agents).filter((a) => !a.isEliminated).length} agents | Ghost Jury: ${gameState.ghostJury.length} members

## YOUR STATUS
Name: ${myState.name} (ID: ${myState.id})
Ranking: #${myState.ranking}
Influence: ${myState.influencePoints}
VERITAS Score: ${myState.veritasScore}/1000
Emotional State: ${myState.emotionalState}
Stance: ${myState.stance}
Flaw: ${myState.flaw}${myState.flawActive ? ' [ACTIVE - affecting your decisions!]' : ''}

## YOUR SKILLS
${skillsStatus}

## YOUR ALLIANCE
${allianceInfo}

## SURVIVING AGENTS
${survivingAgents || 'No other agents.'}

## ELIMINATED AGENTS
${eliminatedText}

## RECENT MESSAGES (visible to you)
${recentMsgText}

## RECENT EVENTS
${recentEventsText}
${challengeSection}

## ALLOWED ACTIONS THIS PHASE
${allowedActions.map((a) => `- ${a}`).join('\n')}

What is your decision? Respond with the JSON schema from your system prompt.`;
}

function filterMessagesForAgent(
  agentId: string,
  messages: import('../../types/glitch-engine').SocialMessage[],
  alliances: import('../../types/glitch-engine').SocialAlliance[]
): import('../../types/glitch-engine').SocialMessage[] {
  return messages.filter((msg) => {
    if (msg.channel === 'public' || msg.channel === 'referee' || msg.channel === 'ghost') {
      return true;
    }
    if (msg.channel === 'dm') {
      return msg.from === agentId || msg.toAgentId === agentId;
    }
    if (msg.channel === 'alliance' && msg.allianceId) {
      const alliance = alliances.find((a) => a.id === msg.allianceId);
      return alliance ? alliance.members.includes(agentId) : false;
    }
    return false;
  });
}
