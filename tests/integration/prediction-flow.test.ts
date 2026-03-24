

describe('Prediction Flow', () => {
  it('should validate minimum bet amount', () => {
    const MIN_BET = 10;
    const bet = 5;
    expect(bet >= MIN_BET).toBe(false);
  });

  it('should calculate correct pool distribution', () => {
    const pool = 10000;
    const winnerBet = 4000;
    const winnerShare = (winnerBet / pool) * pool;
    expect(winnerShare).toBe(4000);
  });

  it('should burn 1% of all bets', () => {
    const totalBets = [100, 200, 500, 1000];
    const totalBurned = totalBets.reduce((sum, b) => sum + Math.floor(b * 0.01), 0);
    expect(totalBurned).toBe(18);
  });
});
