export interface EliminationResult {
  agentId: string;
  eliminatedBy: string;
  turn: number;
  finalRank: number;
  narrative: string;
  ghostJuryEligible: boolean;
}

export class EliminationEngine {
  processElimination(agent: any, eliminatedBy: string, gameState: any, turn: number): EliminationResult {
    const agentsAlive = gameState.agents?.filter((a: any) => a.status === 'alive').length || 0;
    const finalRank = agentsAlive + 1;
    const suffix = finalRank === 1 ? 'st' : finalRank === 2 ? 'nd' : finalRank === 3 ? 'rd' : 'th';
    return {
      agentId: agent.id,
      eliminatedBy,
      turn,
      finalRank,
      narrative: `${agent.name} is eliminated at turn ${turn} by ${eliminatedBy}. They finish in ${finalRank}${suffix} place.`,
      ghostJuryEligible: finalRank <= 5,
    };
  }
}
