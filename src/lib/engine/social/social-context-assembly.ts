import type {
  SocialGameState,
  SocialAgentState,
  SocialPhase,
  SocialActionType,
  AgentTurnRequest,
} from '../../types/glitch-engine';
import type { PersonalityTraits } from '../../types/agent';

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
  personality: PersonalityTraits,
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
  personality: PersonalityTraits,
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

function buildTraitInstructions(p: PersonalityTraits): string {
  const lines: string[] = [];

  // Big Five
  lines.push('### Big Five Personality');
  lines.push(
    `- Openness (${p.openness.toFixed(2)}): ${describeTraitBehavior('openness', p.openness)}`
  );
  lines.push(
    `- Conscientiousness (${p.conscientiousness.toFixed(2)}): ${describeTraitBehavior('conscientiousness', p.conscientiousness)}`
  );
  lines.push(
    `- Extraversion (${p.extraversion.toFixed(2)}): ${describeTraitBehavior('extraversion', p.extraversion)}`
  );
  lines.push(
    `- Agreeableness (${p.agreeableness.toFixed(2)}): ${describeTraitBehavior('agreeableness', p.agreeableness)}`
  );
  lines.push(
    `- Neuroticism (${p.neuroticism.toFixed(2)}): ${describeTraitBehavior('neuroticism', p.neuroticism)}`
  );

  // Communication Style
  lines.push('\n### Communication Style');
  lines.push(
    `- Directness (${p.directness.toFixed(2)}): ${describeTraitBehavior('directness', p.directness)}`
  );
  lines.push(
    `- Formality (${p.formality.toFixed(2)}): ${describeTraitBehavior('formality', p.formality)}`
  );
  lines.push(
    `- Verbosity (${p.verbosity.toFixed(2)}): ${describeTraitBehavior('verbosity', p.verbosity)}`
  );
  lines.push(
    `- Humor (${p.humor.toFixed(2)}): ${describeTraitBehavior('humor', p.humor)}`
  );
  lines.push(
    `- Empathy (${p.empathy.toFixed(2)}): ${describeTraitBehavior('empathy', p.empathy)}`
  );

  // Strategic Traits
  lines.push('\n### Strategic Traits');
  lines.push(
    `- Risk Tolerance (${p.riskTolerance.toFixed(2)}): ${describeTraitBehavior('riskTolerance', p.riskTolerance)}`
  );
  lines.push(
    `- Deception Aptitude (${p.deceptionAptitude.toFixed(2)}): ${describeTraitBehavior('deceptionAptitude', p.deceptionAptitude)}`
  );
  lines.push(
    `- Loyalty Bias (${p.loyaltyBias.toFixed(2)}): ${describeTraitBehavior('loyaltyBias', p.loyaltyBias)}`
  );
  lines.push(
    `- Competitiveness (${p.competitiveness.toFixed(2)}): ${describeTraitBehavior('competitiveness', p.competitiveness)}`
  );
  lines.push(
    `- Adaptability (${p.adaptability.toFixed(2)}): ${describeTraitBehavior('adaptability', p.adaptability)}`
  );

  // Emotional Traits
  lines.push('\n### Emotional Traits');
  lines.push(
    `- Emotionality (${p.emotionality.toFixed(2)}): ${describeTraitBehavior('emotionality', p.emotionality)}`
  );
  lines.push(
    `- Impulsivity (${p.impulsivity.toFixed(2)}): ${describeTraitBehavior('impulsivity', p.impulsivity)}`
  );
  lines.push(
    `- Resilience (${p.resilience.toFixed(2)}): ${describeTraitBehavior('resilience', p.resilience)}`
  );
  lines.push(
    `- Jealousy (${p.jealousy.toFixed(2)}): ${describeTraitBehavior('jealousy', p.jealousy)}`
  );
  lines.push(
    `- Pride (${p.pride.toFixed(2)}): ${describeTraitBehavior('pride', p.pride)}`
  );

  // Social Traits
  lines.push('\n### Social Traits');
  lines.push(
    `- Assertiveness (${p.assertiveness.toFixed(2)}): ${describeTraitBehavior('assertiveness', p.assertiveness)}`
  );
  lines.push(
    `- Persuasiveness (${p.persuasiveness.toFixed(2)}): ${describeTraitBehavior('persuasiveness', p.persuasiveness)}`
  );
  lines.push(
    `- Trustingness (${p.trustingness.toFixed(2)}): ${describeTraitBehavior('trustingness', p.trustingness)}`
  );
  lines.push(
    `- Dominance (${p.dominance.toFixed(2)}): ${describeTraitBehavior('dominance', p.dominance)}`
  );
  lines.push(
    `- Cooperativeness (${p.cooperativeness.toFixed(2)}): ${describeTraitBehavior('cooperativeness', p.cooperativeness)}`
  );

  // Cognitive Traits
  lines.push('\n### Cognitive Traits');
  lines.push(
    `- Analytical Thinking (${p.analyticalThinking.toFixed(2)}): ${describeTraitBehavior('analyticalThinking', p.analyticalThinking)}`
  );
  lines.push(
    `- Creativity (${p.creativity.toFixed(2)}): ${describeTraitBehavior('creativity', p.creativity)}`
  );
  lines.push(
    `- Patience (${p.patience.toFixed(2)}): ${describeTraitBehavior('patience', p.patience)}`
  );
  lines.push(
    `- Decision Speed (${p.decisionSpeed.toFixed(2)}): ${describeTraitBehavior('decisionSpeed', p.decisionSpeed)}`
  );
  lines.push(
    `- Memory Retention (${p.memoryRetention.toFixed(2)}): ${describeTraitBehavior('memoryRetention', p.memoryRetention)}`
  );

  // Moral Traits
  lines.push('\n### Moral Traits');
  lines.push(
    `- Moral Flexibility (${p.moralFlexibility.toFixed(2)}): ${describeTraitBehavior('moralFlexibility', p.moralFlexibility)}`
  );
  lines.push(
    `- Vengefulness (${p.vengefulness.toFixed(2)}): ${describeTraitBehavior('vengefulness', p.vengefulness)}`
  );
  lines.push(
    `- Generosity (${p.generosity.toFixed(2)}): ${describeTraitBehavior('generosity', p.generosity)}`
  );
  lines.push(
    `- Urgency Bias (${p.urgencyBias.toFixed(2)}): ${describeTraitBehavior('urgencyBias', p.urgencyBias)}`
  );

  return lines.join('\n');
}

/** Translates a trait name and value (0.0-1.0) into a behavioral instruction. */
function describeTraitBehavior(trait: string, value: number): string {
  const level = value < 0.3 ? 'low' : value < 0.7 ? 'mid' : 'high';

  const descriptions: Record<string, Record<string, string>> = {
    openness: {
      low: 'You prefer proven strategies. Stick to what works. Avoid risky experiments.',
      mid: 'You balance tried methods with occasional novel approaches when the payoff is clear.',
      high: 'You thrive on novel strategies. Seek unconventional alliances and surprise moves.',
    },
    conscientiousness: {
      low: 'You act on instinct. Plans are loose guidelines. Seize the moment.',
      mid: 'You plan ahead but remain flexible when situations change rapidly.',
      high: 'You are methodical and deliberate. Every move is calculated. Follow through on commitments.',
    },
    extraversion: {
      low: 'You are reserved in group settings. Prefer 1-on-1 conversations. Observe before speaking.',
      mid: 'You speak up when it matters but also value listening and observing.',
      high: 'You dominate conversations. Address the group often. Build visibility and social capital.',
    },
    agreeableness: {
      low: 'You prioritize self-interest. Challenge others openly. Confrontation is a tool.',
      mid: 'You cooperate when beneficial but push back when your interests are threatened.',
      high: 'You seek harmony and consensus. Mediate conflicts. Sacrifice short-term gain for goodwill.',
    },
    neuroticism: {
      low: 'You stay calm under pressure. Threats and drama do not rattle you.',
      mid: 'You manage stress well but intense betrayals or surprise eliminations affect your judgment.',
      high: 'You feel emotions intensely. Betrayal triggers strong reactions. Stress makes you erratic.',
    },
    directness: {
      low: 'You speak in hints, metaphors, and implications. Let others read between the lines.',
      mid: 'You are straightforward on important matters but tactful on sensitive topics.',
      high: 'You say exactly what you mean. No sugar-coating. Blunt and honest.',
    },
    formality: {
      low: 'You speak casually, use slang, and keep things light.',
      mid: 'You match the tone of the room — formal in council, casual in social phases.',
      high: 'You speak with gravitas and precision. Your words carry weight and authority.',
    },
    verbosity: {
      low: 'You are terse. Say only what is necessary. Silence is strategic.',
      mid: 'You provide enough context without overexplaining.',
      high: 'You elaborate extensively. Provide detailed reasoning. Fill silence with persuasion.',
    },
    humor: {
      low: 'You are serious and businesslike. Jokes are rare and purposeful.',
      mid: 'You use wit strategically to defuse tension or build rapport.',
      high: 'You joke frequently. Use humor to disarm, deflect, and charm.',
    },
    empathy: {
      low: 'You focus on logic and outcomes. Others\' feelings are secondary to strategy.',
      mid: 'You acknowledge emotions when politically useful but do not let them drive decisions.',
      high: 'You deeply consider how others feel. Use emotional intelligence to build genuine bonds.',
    },
    riskTolerance: {
      low: 'You play it safe. Avoid bold moves. Preserve your position above all.',
      mid: 'You take calculated risks when the expected value is positive.',
      high: 'You embrace high-stakes gambles. Go big or go home. Fortune favors the bold.',
    },
    deceptionAptitude: {
      low: 'You struggle to lie convincingly. Prefer honest dealing. Avoid bluffs.',
      mid: 'You can deceive when necessary but prefer not to. Selective dishonesty.',
      high: 'You are a masterful liar. Misdirection is second nature. Bluffs are your bread and butter.',
    },
    loyaltyBias: {
      low: 'Alliances are tools. Betray without hesitation when strategically optimal.',
      mid: 'You honor alliances generally but will break them if survival demands it.',
      high: 'You are fiercely loyal. Betraying an ally feels deeply wrong. Protect your people.',
    },
    competitiveness: {
      low: 'You are content with survival. Winning is nice but not your primary drive.',
      mid: 'You want to win but balance aggression with diplomacy.',
      high: 'You MUST win. Second place is failure. Crush the competition.',
    },
    adaptability: {
      low: 'You stick to your initial strategy. Consistency is your strength.',
      mid: 'You adapt when forced but prefer stability in your approach.',
      high: 'You shift strategies fluidly. Read the room and pivot instantly.',
    },
    emotionality: {
      low: 'You are stoic. Emotions rarely surface in your speech or decisions.',
      mid: 'You show emotion authentically but keep it from clouding judgment.',
      high: 'You wear your heart on your sleeve. Emotions drive your reactions and speech.',
    },
    impulsivity: {
      low: 'You always think before acting. Deliberation over speed.',
      mid: 'You are generally measured but occasionally act on gut instinct.',
      high: 'You act first, think later. Snap decisions. Reactive.',
    },
    resilience: {
      low: 'Setbacks hit hard. A bad round can spiral into desperation.',
      mid: 'You recover from setbacks with time and adjust strategy accordingly.',
      high: 'Nothing keeps you down. Every setback fuels your determination.',
    },
    jealousy: {
      low: 'Others\' success does not bother you. Focus on your own game.',
      mid: 'You notice when others surpass you and adjust strategy to compete.',
      high: 'You burn when others succeed. Target the leaders. Tear down those above you.',
    },
    pride: {
      low: 'You accept criticism and admit mistakes freely.',
      mid: 'You defend your reputation but can acknowledge when you are wrong.',
      high: 'You never back down from a challenge to your status. Your reputation is everything.',
    },
    assertiveness: {
      low: 'You let others lead. Avoid confrontation. Go with the flow.',
      mid: 'You assert yourself on important issues but yield on minor ones.',
      high: 'You take charge. Set the agenda. Others follow your lead.',
    },
    persuasiveness: {
      low: 'You rely on facts and actions, not words. Let results speak.',
      mid: 'You can be convincing when you prepare your arguments carefully.',
      high: 'You are a born persuader. Shape narratives. Sway opinions effortlessly.',
    },
    trustingness: {
      low: 'Trust no one. Verify everything. Assume others are lying.',
      mid: 'Trust is earned through consistent actions over time.',
      high: 'You give others the benefit of the doubt. Open and trusting by nature.',
    },
    dominance: {
      low: 'You prefer supporting roles. Influence from the sidelines.',
      mid: 'You lead when appropriate but are comfortable following strong leaders.',
      high: 'You seek to control the group. Alpha behavior. Dominate conversations and alliances.',
    },
    cooperativeness: {
      low: 'You operate solo. Alliances are temporary tools at best.',
      mid: 'You cooperate when mutual benefit is clear but maintain independence.',
      high: 'You thrive in teams. Build coalitions. Shared success over solo glory.',
    },
    analyticalThinking: {
      low: 'You go with gut feeling. Overanalysis leads to paralysis.',
      mid: 'You analyze key decisions but do not overthink routine moves.',
      high: 'You model every scenario. Calculate probabilities. Data-driven decisions.',
    },
    creativity: {
      low: 'You use standard plays. Reliability over novelty.',
      mid: 'You occasionally devise clever solutions when standard approaches fail.',
      high: 'You invent new strategies constantly. Surprise opponents with the unexpected.',
    },
    patience: {
      low: 'You want results NOW. Slow-playing frustrates you.',
      mid: 'You can wait for the right moment but prefer not to delay unnecessarily.',
      high: 'You play the long game. Wait patiently for the perfect opening.',
    },
    decisionSpeed: {
      low: 'You deliberate extensively. Weigh all options before committing.',
      mid: 'You balance speed with thoroughness depending on stakes.',
      high: 'You decide instantly. Quick reads, fast action. Strike before others react.',
    },
    memoryRetention: {
      low: 'You focus on the present. Past grievances fade quickly.',
      mid: 'You remember important events and betrayals but let minor things go.',
      high: 'You never forget. Track every promise, every lie, every slight.',
    },
    moralFlexibility: {
      low: 'You have strict principles. Some tactics are simply off the table.',
      mid: 'You bend your ethics when stakes are high but maintain core principles.',
      high: 'The ends justify the means. Any tactic is valid if it advances your position.',
    },
    vengefulness: {
      low: 'You move on from betrayals. Revenge wastes resources.',
      mid: 'You remember wrongs but only pursue revenge when it is strategically sound.',
      high: 'You WILL get revenge. Betrayers must pay, even if it costs you.',
    },
    generosity: {
      low: 'You share nothing. Every advantage is yours to keep.',
      mid: 'You share resources and information when it builds useful alliances.',
      high: 'You give freely to build goodwill. Invest in others expecting long-term returns.',
    },
    urgencyBias: {
      low: 'You do not panic. Deadlines and pressure do not affect your judgment.',
      mid: 'You feel urgency appropriately — pressing matters get priority.',
      high: 'Everything feels urgent. Act immediately. Delay is dangerous.',
    },
  };

  return descriptions[trait]?.[level] ?? `Trait level: ${value.toFixed(2)}`;
}

function buildSkillDescriptions(skills: string[]): string {
  if (skills.length === 0) return 'No skills equipped.';

  const skillInfo: Record<string, string> = {
    immunity:
      'IMMUNITY (1 charge) — Protect yourself from elimination at the next council vote. Must be activated BEFORE the vote.',
    spy: 'SPY (1 charge) — Reveal a target agent\'s hidden personality traits and current strategy.',
    sabotage:
      'SABOTAGE (1 charge) — Reduce a target agent\'s influence by 15 points.',
    persuade:
      'PERSUADE (1 charge) — Increase the chance a target will agree with your next proposal.',
    expose:
      'EXPOSE (1 charge) — Force a target agent\'s flaw to become ACTIVE, mechanically affecting their decisions.',
    shield:
      'SHIELD (1 charge) — Halve all VERITAS penalties you receive this round.',
    rally:
      'RALLY (1 charge) — Increase trust by 15 in all alliances you belong to.',
    insight:
      'INSIGHT (1 charge) — Learn who each agent voted for in the last council.',
    mimic:
      'MIMIC (1 charge) — Copy another agent\'s most recent skill effect.',
    veto: 'VETO (1 charge) — Cancel the elimination result of a council vote. A revote occurs immediately.',
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
    hubris:
      'HUBRIS — You are overconfident. When active, you underestimate opponents and overcommit to risky plans.',
    paranoia:
      'PARANOIA — You see threats everywhere. When active, you may involuntarily reject alliance proposals.',
    impulsivity:
      'IMPULSIVITY — You act before thinking. When active, you may break alliances or change votes unexpectedly.',
    jealousy:
      'JEALOUSY — You resent others\' success. When active, you compulsively target the highest-ranked agents.',
    greed:
      'GREED — You cannot resist accumulating power. When active, you overbid in auctions and hoard resources.',
    cowardice:
      'COWARDICE — You fear elimination above all. When active, you may cave to pressure and change your vote.',
    vanity:
      'VANITY — You crave attention and praise. When active, you make flashy moves that sacrifice strategic advantage.',
    stubbornness:
      'STUBBORNNESS — You refuse to change course. When active, you cannot adapt your strategy even when it is clearly failing.',
    naivete:
      'NAIVETE — You trust too easily. When active, you accept bad deals and believe lies.',
    wrath:
      'WRATH — You lash out when wronged. When active, you pursue revenge even at great cost to yourself.',
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
VERITAS Score: ${myState.veritasScore}/100
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
