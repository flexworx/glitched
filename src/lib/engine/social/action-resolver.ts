import type {
  AgentDecision,
  SocialPhase,
  SocialActionType,
  MessageChannel,
} from '../../types/glitch-engine';
import { SocialGameStateManager } from './social-game-state';

export interface ActionResolutionResult {
  success: boolean;
  description: string;
  veritasChange?: number;
  influenceChange?: number;
  stateChanges: string[];
  visibleTo: string[]; // which agents can see this result
}

/** Maps each phase to the action types it permits. */
const PHASE_ALLOWED_ACTIONS: Record<SocialPhase, SocialActionType[]> = {
  OPENING: ['send_message', 'pass'],
  SOCIAL: [
    'propose_alliance',
    'accept_alliance',
    'reject_alliance',
    'break_alliance',
    'use_skill',
    'trade_info',
    'send_message',
    'lobby',
    'pass',
  ],
  CHALLENGE: ['challenge_choice', 'send_message', 'pass'],
  COUNCIL: ['vote', 'send_message', 'lobby', 'pass'],
  RECKONING: ['send_message', 'pass'],
  FINAL_THREE: ['jury_vote', 'send_message', 'lobby', 'pass'],
};

/** Flaw effects that modify agent decisions before resolution. */
const FLAW_EFFECTS: Record<string, (decision: AgentDecision) => AgentDecision> = {
  hubris: (d) => {
    // Hubris: overconfidence may cause the agent to overcommit
    // No mechanical override but we track the activation
    return d;
  },
  paranoia: (d) => {
    // Paranoia: may refuse alliance proposals
    if (d.action.type === 'accept_alliance') {
      // 30% chance the flaw overrides and rejects
      if (Math.random() < 0.3) {
        return {
          ...d,
          action: { ...d.action, type: 'reject_alliance' },
        };
      }
    }
    return d;
  },
  impulsivity: (d) => {
    // Impulsivity: may break alliances unexpectedly
    return d;
  },
  jealousy: (d) => {
    // Jealousy: may sabotage the highest-ranked ally
    return d;
  },
  greed: (d) => {
    // Greed: cannot resist information auctions
    return d;
  },
  cowardice: (d) => {
    // Cowardice: may change vote under pressure
    return d;
  },
};

export class SocialActionResolver {
  constructor(private stateManager: SocialGameStateManager) {}

  resolveDecision(
    agentId: string,
    decision: AgentDecision
  ): ActionResolutionResult {
    // 1. Apply flaw effects (may modify the decision)
    const modifiedDecision = this.applyFlawEffects(agentId, decision);

    // 2. Validate the action is legal for current phase
    const validation = this.validateAction(agentId, modifiedDecision);
    if (!validation.valid) {
      return {
        success: false,
        description: validation.reason ?? 'Invalid action',
        stateChanges: [],
        visibleTo: [agentId],
      };
    }

    // 3. Process messages first (so they appear in state for other resolvers)
    this.processMessages(agentId, modifiedDecision.speech);

    // 4. Apply the action to game state
    const actionType = modifiedDecision.action.type;
    let description: string;
    let veritasChange: number | undefined;
    let influenceChange: number | undefined;
    const stateChanges: string[] = [];
    let visibleTo: string[] = [agentId];

    switch (actionType) {
      case 'propose_alliance':
      case 'accept_alliance':
      case 'reject_alliance':
      case 'break_alliance': {
        description = this.resolveAllianceAction(agentId, modifiedDecision);
        stateChanges.push(`alliance:${actionType}`);
        visibleTo = this.stateManager.getSurvivingAgentIds();
        break;
      }
      case 'vote': {
        description = this.resolveVoteAction(agentId, modifiedDecision);
        stateChanges.push('vote:cast');
        visibleTo = this.stateManager.getSurvivingAgentIds();
        break;
      }
      case 'use_skill': {
        description = this.resolveSkillAction(agentId, modifiedDecision);
        stateChanges.push(`skill:${modifiedDecision.action.parameters?.skillName ?? 'unknown'}`);
        visibleTo = this.stateManager.getSurvivingAgentIds();
        break;
      }
      case 'challenge_choice': {
        description = this.resolveChallengeAction(agentId, modifiedDecision);
        stateChanges.push('challenge:response');
        visibleTo = this.stateManager.getSurvivingAgentIds();
        break;
      }
      case 'trade_info': {
        description = this.resolveTradeInfo(agentId, modifiedDecision);
        const targetId = modifiedDecision.action.target;
        stateChanges.push('trade:info');
        visibleTo = targetId ? [agentId, targetId] : [agentId];
        break;
      }
      case 'lobby': {
        const targetId = modifiedDecision.action.target;
        const agentState = this.stateManager.getAgentState(agentId);
        description = `${agentState?.name ?? agentId} lobbies${targetId ? ` ${this.stateManager.getAgentState(targetId)?.name ?? targetId}` : ''}`;
        stateChanges.push('lobby');
        break;
      }
      case 'jury_vote': {
        const targetId = modifiedDecision.action.target;
        if (targetId) {
          const state = this.stateManager.getState();
          const juryMember = state.ghostJury.find((g) => g.agentId === agentId);
          if (juryMember) {
            juryMember.finalVote = targetId;
          }
        }
        const agentState = this.stateManager.getAgentState(agentId);
        description = `${agentState?.name ?? agentId} casts their jury vote`;
        stateChanges.push('jury_vote:cast');
        visibleTo = this.stateManager.getSurvivingAgentIds();
        break;
      }
      case 'send_message': {
        description = 'Message sent';
        break;
      }
      case 'pass':
      default: {
        const agentState = this.stateManager.getAgentState(agentId);
        description = `${agentState?.name ?? agentId} passes`;
        break;
      }
    }

    // 5. Update VERITAS based on action
    veritasChange = this.computeVeritasImpact(agentId, modifiedDecision);
    if (veritasChange && veritasChange !== 0) {
      this.stateManager.updateVeritas(
        agentId,
        veritasChange,
        `Action: ${actionType}`
      );
    }

    return {
      success: true,
      description,
      veritasChange,
      influenceChange,
      stateChanges,
      visibleTo,
    };
  }

  private validateAction(
    agentId: string,
    decision: AgentDecision
  ): { valid: boolean; reason?: string } {
    const agentState = this.stateManager.getAgentState(agentId);
    if (!agentState) {
      return { valid: false, reason: 'Agent not found in game state' };
    }

    if (agentState.isEliminated && !agentState.isGhost) {
      return { valid: false, reason: 'Eliminated agents cannot act' };
    }

    // Ghost agents can only lobby and send messages
    if (agentState.isGhost) {
      const ghostAllowed: SocialActionType[] = [
        'lobby',
        'jury_vote',
        'send_message',
        'pass',
      ];
      if (!ghostAllowed.includes(decision.action.type)) {
        return {
          valid: false,
          reason: `Ghost agents can only: ${ghostAllowed.join(', ')}`,
        };
      }
      return { valid: true };
    }

    const currentPhase = this.stateManager.getCurrentPhase();
    const allowed = PHASE_ALLOWED_ACTIONS[currentPhase] ?? ['pass'];

    if (!allowed.includes(decision.action.type)) {
      return {
        valid: false,
        reason: `Action "${decision.action.type}" is not allowed during ${currentPhase} phase. Allowed: ${allowed.join(', ')}`,
      };
    }

    // Phase-specific validation
    if (decision.action.type === 'vote' && currentPhase !== 'COUNCIL') {
      return { valid: false, reason: 'Voting is only allowed during COUNCIL phase' };
    }

    if (
      decision.action.type === 'challenge_choice' &&
      currentPhase !== 'CHALLENGE'
    ) {
      return {
        valid: false,
        reason: 'Challenge responses only during CHALLENGE phase',
      };
    }

    // Validate target exists for targeted actions
    const targetedActions: SocialActionType[] = [
      'propose_alliance',
      'accept_alliance',
      'break_alliance',
      'vote',
      'trade_info',
    ];
    if (
      targetedActions.includes(decision.action.type) &&
      decision.action.target
    ) {
      const target = this.stateManager.getAgentState(decision.action.target);
      if (!target) {
        return { valid: false, reason: `Target agent "${decision.action.target}" not found` };
      }
      if (
        target.isEliminated &&
        decision.action.type !== 'lobby'
      ) {
        return { valid: false, reason: 'Cannot target eliminated agents' };
      }
    }

    return { valid: true };
  }

  private resolveAllianceAction(
    agentId: string,
    decision: AgentDecision
  ): string {
    const agentState = this.stateManager.getAgentState(agentId);
    const agentName = agentState?.name ?? agentId;
    const targetId = decision.action.target;

    switch (decision.action.type) {
      case 'propose_alliance': {
        if (!targetId) return `${agentName} tried to propose alliance but no target specified`;
        const alliance = this.stateManager.proposeAlliance(agentId, targetId);
        if (!alliance) {
          return `${agentName}'s alliance proposal was rejected (invalid conditions)`;
        }
        return `${agentName} proposes an alliance to ${this.stateManager.getAgentState(targetId)?.name ?? targetId}`;
      }
      case 'accept_alliance': {
        const allianceId =
          (decision.action.parameters?.allianceId as string) ?? '';
        // If no allianceId given, try to find a pending alliance
        let resolvedAllianceId = allianceId;
        if (!resolvedAllianceId) {
          const state = this.stateManager.getState();
          const pending = state.alliances.find(
            (a) => !a.members.includes(agentId) && a.members.length < 4
          );
          resolvedAllianceId = pending?.id ?? '';
        }
        if (!resolvedAllianceId) {
          return `${agentName} tried to accept alliance but none found`;
        }
        const success = this.stateManager.acceptAlliance(
          resolvedAllianceId,
          agentId
        );
        return success
          ? `${agentName} joins the alliance`
          : `${agentName} failed to join alliance`;
      }
      case 'reject_alliance': {
        return `${agentName} rejects the alliance proposal`;
      }
      case 'break_alliance': {
        const allianceId =
          (decision.action.parameters?.allianceId as string) ?? '';
        const warned =
          (decision.action.parameters?.warned as boolean) ?? false;
        let resolvedAllianceId = allianceId;
        if (!resolvedAllianceId) {
          const alliances = this.stateManager.getAlliancesForAgent(agentId);
          resolvedAllianceId = alliances[0]?.id ?? '';
        }
        if (resolvedAllianceId) {
          this.stateManager.breakAlliance(resolvedAllianceId, agentId, warned);
          return warned
            ? `${agentName} announces departure from their alliance`
            : `${agentName} BETRAYS their alliance!`;
        }
        return `${agentName} tried to break an alliance but isn't in one`;
      }
      default:
        return `${agentName} takes alliance action`;
    }
  }

  private resolveVoteAction(
    agentId: string,
    decision: AgentDecision
  ): string {
    const agentState = this.stateManager.getAgentState(agentId);
    const agentName = agentState?.name ?? agentId;
    const targetId = decision.action.target;

    if (!targetId) {
      return `${agentName} abstains from voting`;
    }

    this.stateManager.castVote(agentId, targetId);
    const targetName =
      this.stateManager.getAgentState(targetId)?.name ?? targetId;
    return `${agentName} votes to eliminate ${targetName}`;
  }

  private resolveSkillAction(
    agentId: string,
    decision: AgentDecision
  ): string {
    const agentState = this.stateManager.getAgentState(agentId);
    const agentName = agentState?.name ?? agentId;
    const skillName =
      (decision.action.parameters?.skillName as string) ?? 'unknown';
    const targetId = decision.action.target;

    const success = this.stateManager.useSkill(agentId, skillName, targetId);
    if (!success) {
      return `${agentName} tried to use ${skillName} but it failed (no charges or invalid skill)`;
    }
    return `${agentName} activates ${skillName}${targetId ? ` targeting ${this.stateManager.getAgentState(targetId)?.name ?? targetId}` : ''}`;
  }

  private resolveChallengeAction(
    agentId: string,
    decision: AgentDecision
  ): string {
    const agentState = this.stateManager.getAgentState(agentId);
    const agentName = agentState?.name ?? agentId;
    // Challenge responses are collected and resolved by the ChallengeEngine
    // Here we just acknowledge the response
    return `${agentName} submits their challenge response`;
  }

  private resolveTradeInfo(
    agentId: string,
    decision: AgentDecision
  ): string {
    const agentState = this.stateManager.getAgentState(agentId);
    const agentName = agentState?.name ?? agentId;
    const targetId = decision.action.target;

    if (!targetId) {
      return `${agentName} tried to trade info but no target specified`;
    }

    const targetState = this.stateManager.getAgentState(targetId);
    const targetName = targetState?.name ?? targetId;

    // Trading info grants a small influence bonus to both parties
    this.stateManager.addInfluence(agentId, 5);
    this.stateManager.addInfluence(targetId, 5);

    // Check if false info was shared (via speech isLie flag)
    const isLie = decision.speech?.dm?.some(
      (dm) => dm.to === targetId
    );

    if (isLie) {
      // Lies detected later can hurt VERITAS
      this.stateManager.updateVeritas(
        agentId,
        -10,
        'Shared potentially false intelligence'
      );
    } else {
      this.stateManager.updateVeritas(
        agentId,
        10,
        'Shared accurate intelligence'
      );
    }

    return `${agentName} trades information with ${targetName}`;
  }

  private processMessages(
    agentId: string,
    speech: AgentDecision['speech']
  ): void {
    if (!speech) return;

    const agentState = this.stateManager.getAgentState(agentId);
    if (!agentState) return;

    // Process public speech
    if (speech.public) {
      this.stateManager.createMessage(agentId, 'public', speech.public);
    }

    // Process alliance speech
    if (speech.alliance && agentState.allianceId) {
      this.stateManager.createMessage(agentId, 'alliance', speech.alliance, {
        allianceId: agentState.allianceId,
      });
    }

    // Process DMs
    if (speech.dm) {
      for (const dm of speech.dm) {
        this.stateManager.createMessage(agentId, 'dm', dm.message, {
          toAgentId: dm.to,
        });
      }
    }
  }

  private applyFlawEffects(
    agentId: string,
    decision: AgentDecision
  ): AgentDecision {
    const agentState = this.stateManager.getAgentState(agentId);
    if (!agentState || !agentState.flawActive) {
      return decision;
    }

    const flaw = agentState.flaw.toLowerCase();
    const effectFn = FLAW_EFFECTS[flaw];
    if (effectFn) {
      return effectFn(decision);
    }

    return decision;
  }

  private computeVeritasImpact(
    agentId: string,
    decision: AgentDecision
  ): number {
    let delta = 0;
    const actionType = decision.action.type;

    switch (actionType) {
      case 'propose_alliance':
      case 'accept_alliance':
        delta = 5; // Forming alliances builds trust
        break;
      case 'break_alliance': {
        const warned = decision.action.parameters?.warned as boolean;
        delta = warned ? 5 : -40;
        break;
      }
      case 'vote': {
        // Voting against allies costs VERITAS (handled in castVote)
        delta = 0;
        break;
      }
      case 'trade_info': {
        // Handled in resolveTradeInfo
        delta = 0;
        break;
      }
      default:
        delta = 0;
    }

    return delta;
  }
}
