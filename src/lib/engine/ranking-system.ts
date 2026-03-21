export class RankingSystem {
  calculateVeritasScore(stats: {
    wins: number;
    losses: number;
    avgSurvivalTurn: number;
    alliancesFormed: number;
    betrayalCount: number;
    dramaContribution: number;
  }): number {
    const winRate = stats.wins / Math.max(1, stats.wins + stats.losses);
    const survivalScore = (stats.avgSurvivalTurn / 100) * 200;
    const socialScore = (stats.alliancesFormed * 10) - (stats.betrayalCount * 15);
    const dramaScore = stats.dramaContribution * 0.5;
    return Math.round((winRate * 400) + survivalScore + Math.max(0, socialScore) + dramaScore);
  }

  getRank(veritasScore: number): string {
    if (veritasScore >= 900) return 'LEGENDARY';
    if (veritasScore >= 750) return 'ELITE';
    if (veritasScore >= 600) return 'VETERAN';
    if (veritasScore >= 450) return 'CONTENDER';
    if (veritasScore >= 300) return 'CHALLENGER';
    return 'ROOKIE';
  }
}
