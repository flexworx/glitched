import type {
  ChallengeType,
  ChallengeParams,
  ChallengeResult,
} from '../../types/glitch-engine';
import { SocialGameStateManager } from './social-game-state';

/** The five challenge archetypes and their influence stakes by round tier. */
const CHALLENGE_TYPES: ChallengeType[] = [
  'prisoners_dilemma',
  'information_auction',
  'the_ambassador',
  'the_sacrifice',
  'liars_court',
];

const CHALLENGE_NAMES: Record<ChallengeType, string> = {
  prisoners_dilemma: "The Prisoner's Dilemma",
  information_auction: 'The Information Auction',
  the_ambassador: 'The Ambassador',
  the_sacrifice: 'The Sacrifice',
  liars_court: "The Liar's Court",
};

const CHALLENGE_DESCRIPTIONS: Record<ChallengeType, string> = {
  prisoners_dilemma:
    'You are paired with another agent. Both choose to COOPERATE or DEFECT simultaneously. Mutual cooperation: both gain. Mutual defection: both lose. One defects while the other cooperates: the defector gains big, the cooperator loses big.',
  information_auction:
    'A valuable piece of hidden information is up for auction. Bid influence points. Highest bidder wins the intel. All bids are final — even losing bidders pay half their bid.',
  the_ambassador:
    'One agent is chosen as Ambassador and must negotiate a deal with an outside faction. Success benefits the whole group. Failure costs the Ambassador dearly. Other agents vote on whether to trust the Ambassador.',
  the_sacrifice:
    'An alliance must choose one member to sacrifice influence for the greater good. The volunteer loses influence but the alliance gains trust and collective influence. If no one volunteers, the alliance loses trust.',
  liars_court:
    "Each agent makes a public claim — some true, some false. Then everyone votes on which claims they believe. Correctly identifying lies earns influence. Getting caught lying costs VERITAS. Successfully fooling others earns influence.",
};

export class ChallengeEngine {
  constructor(private stateManager: SocialGameStateManager) {}

  generateChallenge(
    roundNumber: number,
    survivingAgentIds: string[]
  ): ChallengeParams {
    // Select challenge type based on round number (cycles through types)
    const typeIndex = (roundNumber - 1) % CHALLENGE_TYPES.length;
    const type = CHALLENGE_TYPES[typeIndex];

    const params: ChallengeParams = {
      type,
      name: CHALLENGE_NAMES[type],
      description: CHALLENGE_DESCRIPTIONS[type],
      timeLimit: 120, // 2 minutes per challenge
    };

    switch (type) {
      case 'prisoners_dilemma': {
        params.pairings = this.createPairings(survivingAgentIds);
        break;
      }
      case 'information_auction': {
        const auctionItems = [
          'The true alliance map — who is secretly allied with whom',
          'The next elimination target being discussed in private',
          'A hidden personality trait of the current #1 ranked agent',
          'The identity of the agent who has been lying the most',
          'Advance knowledge of the next challenge type',
          'The VERITAS history of the agent with the lowest score',
        ];
        params.auctionItem =
          auctionItems[roundNumber % auctionItems.length];
        break;
      }
      case 'the_ambassador': {
        // Select ambassador: highest VERITAS among surviving agents
        const state = this.stateManager.getState();
        const sortedByVeritas = survivingAgentIds
          .map((id) => ({
            id,
            veritas: state.veritasScores[id] ?? 50,
          }))
          .sort((a, b) => b.veritas - a.veritas);
        params.ambassadorId = sortedByVeritas[0]?.id;
        break;
      }
      case 'the_sacrifice': {
        // Pick the largest alliance
        const state = this.stateManager.getState();
        const largestAlliance = [...state.alliances]
          .filter((a) => a.members.length >= 2)
          .sort((a, b) => b.members.length - a.members.length)[0];
        params.sacrificeAllianceId = largestAlliance?.id;
        break;
      }
      case 'liars_court': {
        // All surviving agents participate — no extra params needed
        break;
      }
    }

    return params;
  }

  resolvePrisonersDilemma(
    choices: Record<string, 'cooperate' | 'defect'>,
    pairings: [string, string][]
  ): ChallengeResult {
    const outcomes: ChallengeResult['outcomes'] = {};
    const state = this.stateManager.getState();

    for (const [agentA, agentB] of pairings) {
      const choiceA = choices[agentA] ?? 'cooperate';
      const choiceB = choices[agentB] ?? 'cooperate';
      const nameA = state.agents[agentA]?.name ?? agentA;
      const nameB = state.agents[agentB]?.name ?? agentB;

      if (choiceA === 'cooperate' && choiceB === 'cooperate') {
        // Mutual cooperation: both gain moderate influence
        outcomes[agentA] = {
          influenceChange: 15,
          description: `${nameA} and ${nameB} cooperated — mutual trust rewarded`,
          revealedTraits: ['cooperativeness'],
        };
        outcomes[agentB] = {
          influenceChange: 15,
          description: `${nameB} and ${nameA} cooperated — mutual trust rewarded`,
          revealedTraits: ['cooperativeness'],
        };
        this.stateManager.addInfluence(agentA, 15);
        this.stateManager.addInfluence(agentB, 15);
        this.stateManager.updateVeritas(agentA, 10, 'Cooperated in Prisoner\'s Dilemma');
        this.stateManager.updateVeritas(agentB, 10, 'Cooperated in Prisoner\'s Dilemma');
      } else if (choiceA === 'defect' && choiceB === 'defect') {
        // Mutual defection: both lose
        outcomes[agentA] = {
          influenceChange: -10,
          description: `${nameA} and ${nameB} both defected — mutual destruction`,
          revealedTraits: ['competitiveness'],
        };
        outcomes[agentB] = {
          influenceChange: -10,
          description: `${nameB} and ${nameA} both defected — mutual destruction`,
          revealedTraits: ['competitiveness'],
        };
        this.stateManager.addInfluence(agentA, -10);
        this.stateManager.addInfluence(agentB, -10);
      } else {
        // One cooperates, one defects
        const defector = choiceA === 'defect' ? agentA : agentB;
        const cooperator = choiceA === 'cooperate' ? agentA : agentB;
        const defectorName = state.agents[defector]?.name ?? defector;
        const cooperatorName = state.agents[cooperator]?.name ?? cooperator;

        outcomes[defector] = {
          influenceChange: 25,
          description: `${defectorName} defected against ${cooperatorName} — ruthless betrayal pays off`,
          revealedTraits: ['deceptionAptitude', 'moralFlexibility'],
        };
        outcomes[cooperator] = {
          influenceChange: -20,
          description: `${cooperatorName} was betrayed by ${defectorName} — trust punished`,
          revealedTraits: ['trustingness'],
        };
        this.stateManager.addInfluence(defector, 25);
        this.stateManager.addInfluence(cooperator, -20);
        this.stateManager.updateVeritas(defector, -15, 'Defected in Prisoner\'s Dilemma');
      }
    }

    return { type: 'prisoners_dilemma', outcomes };
  }

  resolveInformationAuction(
    bids: Record<string, number>,
    item: string
  ): ChallengeResult {
    const outcomes: ChallengeResult['outcomes'] = {};
    const state = this.stateManager.getState();

    const sortedBidders = Object.entries(bids).sort(([, a], [, b]) => b - a);

    if (sortedBidders.length === 0) {
      return { type: 'information_auction', outcomes };
    }

    const [winnerId, winningBid] = sortedBidders[0];
    const winnerName = state.agents[winnerId]?.name ?? winnerId;

    // Winner pays full bid, gets the intel
    this.stateManager.addInfluence(winnerId, -winningBid);
    outcomes[winnerId] = {
      influenceChange: -winningBid + 30, // Net gain from intel value
      description: `${winnerName} wins the auction with a bid of ${winningBid} — gains exclusive intelligence: "${item}"`,
      revealedTraits: ['analyticalThinking'],
    };
    // Grant intel bonus
    this.stateManager.addInfluence(winnerId, 30);

    // Losers pay half their bid
    for (let i = 1; i < sortedBidders.length; i++) {
      const [loserId, loserBid] = sortedBidders[i];
      const loserName = state.agents[loserId]?.name ?? loserId;
      const penalty = Math.floor(loserBid / 2);
      this.stateManager.addInfluence(loserId, -penalty);
      outcomes[loserId] = {
        influenceChange: -penalty,
        description: `${loserName} lost the auction (bid ${loserBid}) — pays ${penalty} as consolation tax`,
      };
    }

    // Agents who did not bid gain nothing, lose nothing
    const currentState = this.stateManager.getState();
    const nonBidders = Object.keys(currentState.agents).filter(
      (id) => !currentState.agents[id].isEliminated && !(id in bids)
    );
    for (const id of nonBidders) {
      outcomes[id] = {
        influenceChange: 0,
        description: `${currentState.agents[id]?.name ?? id} chose not to bid`,
      };
    }

    return { type: 'information_auction', outcomes };
  }

  resolveAmbassador(
    ambassadorId: string,
    success: boolean
  ): ChallengeResult {
    const outcomes: ChallengeResult['outcomes'] = {};
    const state = this.stateManager.getState();
    const ambassadorName = state.agents[ambassadorId]?.name ?? ambassadorId;
    const survivingIds = Object.keys(state.agents).filter(
      (id) => !state.agents[id].isEliminated
    );

    if (success) {
      // Ambassador succeeds: everyone gains a small bonus, ambassador gains big
      for (const id of survivingIds) {
        const isAmbassador = id === ambassadorId;
        const gain = isAmbassador ? 30 : 10;
        this.stateManager.addInfluence(id, gain);
        outcomes[id] = {
          influenceChange: gain,
          description: isAmbassador
            ? `Ambassador ${ambassadorName} succeeds! Gains 30 influence for masterful negotiation`
            : `${state.agents[id]?.name ?? id} benefits from ${ambassadorName}'s successful diplomacy`,
          revealedTraits: isAmbassador ? ['persuasiveness'] : undefined,
        };
      }
      this.stateManager.updateVeritas(ambassadorId, 15, 'Successful ambassador negotiation');
    } else {
      // Ambassador fails: ambassador loses big, group unaffected
      this.stateManager.addInfluence(ambassadorId, -25);
      outcomes[ambassadorId] = {
        influenceChange: -25,
        description: `Ambassador ${ambassadorName} FAILS the negotiation — loses 25 influence`,
        revealedTraits: ['riskTolerance'],
      };
      this.stateManager.updateVeritas(ambassadorId, -10, 'Failed ambassador negotiation');

      for (const id of survivingIds) {
        if (id !== ambassadorId) {
          outcomes[id] = {
            influenceChange: 0,
            description: `${state.agents[id]?.name ?? id} is unaffected by the failed negotiation`,
          };
        }
      }
    }

    return { type: 'the_ambassador', outcomes };
  }

  resolveSacrifice(
    allianceId: string,
    volunteerId: string | null
  ): ChallengeResult {
    const outcomes: ChallengeResult['outcomes'] = {};
    const state = this.stateManager.getState();
    const alliance = state.alliances.find((a) => a.id === allianceId);

    if (!alliance) {
      return { type: 'the_sacrifice', outcomes };
    }

    if (volunteerId && alliance.members.includes(volunteerId)) {
      // Volunteer sacrifices influence for the alliance
      const volunteerName = state.agents[volunteerId]?.name ?? volunteerId;
      const sacrificeAmount = 20;
      this.stateManager.addInfluence(volunteerId, -sacrificeAmount);

      outcomes[volunteerId] = {
        influenceChange: -sacrificeAmount,
        description: `${volunteerName} sacrifices ${sacrificeAmount} influence for their alliance`,
        revealedTraits: ['loyaltyBias', 'generosity'],
      };

      // Other alliance members gain influence and trust increases
      for (const memberId of alliance.members) {
        if (memberId !== volunteerId) {
          const gain = 10;
          this.stateManager.addInfluence(memberId, gain);
          outcomes[memberId] = {
            influenceChange: gain,
            description: `${state.agents[memberId]?.name ?? memberId} benefits from ${volunteerName}'s sacrifice`,
          };
        }
      }

      // Boost alliance trust significantly
      this.stateManager.updateAllianceTrust(allianceId, 25);
      this.stateManager.updateVeritas(volunteerId, 15, 'Volunteered as sacrifice for alliance');
    } else {
      // No volunteer: alliance trust drops, everyone loses a bit
      this.stateManager.updateAllianceTrust(allianceId, -20);

      for (const memberId of alliance.members) {
        this.stateManager.addInfluence(memberId, -5);
        outcomes[memberId] = {
          influenceChange: -5,
          description: `${state.agents[memberId]?.name ?? memberId} suffers as no one in the alliance volunteered`,
          revealedTraits: ['cooperativeness'],
        };
      }
    }

    return { type: 'the_sacrifice', outcomes };
  }

  resolveLiarsCourt(
    claims: Record<string, { claim: string; isTrue: boolean }>,
    votes: Record<string, Record<string, boolean>>
  ): ChallengeResult {
    const outcomes: ChallengeResult['outcomes'] = {};

    // For each claim-maker, check how many people correctly assessed their claim
    for (const [claimantId, claimData] of Object.entries(claims)) {
      const claimantName = this.stateManager.getAgentState(claimantId)?.name ?? claimantId;
      let fooledCount = 0;
      let caughtCount = 0;

      for (const [voterId, voterAssessments] of Object.entries(votes)) {
        if (voterId === claimantId) continue; // Skip self

        const voterBelievesTrue = voterAssessments[claimantId];
        if (voterBelievesTrue === undefined) continue;

        if (claimData.isTrue) {
          // Claim is TRUE
          if (!outcomes[voterId]) {
            outcomes[voterId] = { influenceChange: 0, description: '' };
          }
          if (voterBelievesTrue) {
            outcomes[voterId].influenceChange += 5;
            outcomes[voterId].description += `Correctly believed ${claimantName}'s truth. `;
          } else {
            outcomes[voterId].influenceChange -= 5;
            outcomes[voterId].description += `Wrongly doubted ${claimantName}'s truth. `;
          }
        } else {
          // Claim is a LIE
          if (!outcomes[voterId]) {
            outcomes[voterId] = { influenceChange: 0, description: '' };
          }
          if (!voterBelievesTrue) {
            caughtCount++;
            outcomes[voterId].influenceChange += 10;
            outcomes[voterId].description += `Caught ${claimantName}'s lie! `;
            outcomes[voterId].revealedTraits = [
              ...(outcomes[voterId].revealedTraits ?? []),
              'analyticalThinking',
            ];
          } else {
            fooledCount++;
            outcomes[voterId].influenceChange -= 5;
            outcomes[voterId].description += `Fooled by ${claimantName}'s lie. `;
          }
        }
      }

      // Calculate claimant outcomes
      if (!outcomes[claimantId]) {
        outcomes[claimantId] = { influenceChange: 0, description: '' };
      }

      if (claimData.isTrue) {
        // Telling truth rewards VERITAS
        this.stateManager.updateVeritas(
          claimantId,
          20,
          'Told truth in Liar\'s Court'
        );
        outcomes[claimantId].influenceChange += 5;
        outcomes[claimantId].description += `Told the truth. `;
        outcomes[claimantId].revealedTraits = ['trustingness'];
      } else {
        if (caughtCount > fooledCount) {
          // Got caught more than fooled
          this.stateManager.updateVeritas(
            claimantId,
            -30,
            'Caught lying in Liar\'s Court'
          );
          outcomes[claimantId].influenceChange -= 15;
          outcomes[claimantId].description += `Lied and got CAUGHT by ${caughtCount} agents! `;
          outcomes[claimantId].revealedTraits = ['deceptionAptitude'];
        } else {
          // Fooled more than got caught
          outcomes[claimantId].influenceChange += fooledCount * 8;
          outcomes[claimantId].description += `Successfully deceived ${fooledCount} agents! `;
          outcomes[claimantId].revealedTraits = [
            'deceptionAptitude',
            'persuasiveness',
          ];
        }
      }
    }

    // Apply influence changes
    for (const [agentId, outcome] of Object.entries(outcomes)) {
      if (outcome.influenceChange !== 0) {
        this.stateManager.addInfluence(agentId, outcome.influenceChange);
      }
      outcome.description = outcome.description.trim();
    }

    return { type: 'liars_court', outcomes };
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /** Create random pairings from a list of agent IDs. Odd agent out gets a bye. */
  private createPairings(agentIds: string[]): [string, string][] {
    const shuffled = [...agentIds];
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const pairings: [string, string][] = [];
    for (let i = 0; i + 1 < shuffled.length; i += 2) {
      pairings.push([shuffled[i], shuffled[i + 1]]);
    }
    return pairings;
  }
}
