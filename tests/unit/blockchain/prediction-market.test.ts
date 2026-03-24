

describe('Prediction Market', () => {
  it('should calculate correct odds', () => {
    const calculateOdds = (optionBet: number, totalPool: number) => {
      if (optionBet === 0) return 10;
      return Math.round((totalPool / optionBet) * 10) / 10;
    };
    expect(calculateOdds(10000, 45000)).toBe(4.5);
    expect(calculateOdds(0, 45000)).toBe(10);
  });

  it('should calculate 1% burn on bets', () => {
    const calculateBurn = (amount: number) => Math.floor(amount * 0.01);
    expect(calculateBurn(1000)).toBe(10);
    expect(calculateBurn(500)).toBe(5);
  });

  it('should calculate correct payout', () => {
    const calculatePayout = (amount: number, odds: number) => Math.floor(amount * odds);
    expect(calculatePayout(100, 2.1)).toBe(210);
    expect(calculatePayout(500, 3.5)).toBe(1750);
  });
});
