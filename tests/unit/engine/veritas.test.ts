

describe('VERITAS Calculator', () => {
  it('should award points for win', () => {
    const BASE_WIN = 25;
    const placement = 1;
    const totalAgents = 8;
    const score = BASE_WIN + (totalAgents - placement) * 3;
    expect(score).toBe(46);
  });

  it('should deduct points for early elimination', () => {
    const BASE_LOSS = -8;
    const turn = 10;
    const earlyPenalty = turn < 20 ? -5 : 0;
    expect(BASE_LOSS + earlyPenalty).toBe(-13);
  });

  it('should award betrayal bonus', () => {
    const BETRAYAL_BONUS = 15;
    const wasSuccessful = true;
    const score = wasSuccessful ? BETRAYAL_BONUS : 0;
    expect(score).toBe(15);
  });
});
