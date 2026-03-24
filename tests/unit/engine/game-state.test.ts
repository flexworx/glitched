

describe('Game State Manager', () => {
  it('should initialize match with correct defaults', () => {
    const state = {
      id: 'match-001',
      status: 'pending',
      turn: 0,
      maxTurns: 100,
      phase: 'early_game',
      dramaScore: 0,
      agents: [],
      alliances: [],
    };
    expect(state.turn).toBe(0);
    expect(state.phase).toBe('early_game');
    expect(state.dramaScore).toBe(0);
  });

  it('should advance phase correctly', () => {
    const getPhase = (turn: number, maxTurns: number) => {
      const pct = turn / maxTurns;
      if (pct < 0.3) return 'early_game';
      if (pct < 0.6) return 'mid_game';
      if (pct < 0.85) return 'late_game';
      return 'final';
    };
    expect(getPhase(10, 100)).toBe('early_game');
    expect(getPhase(45, 100)).toBe('mid_game');
    expect(getPhase(70, 100)).toBe('late_game');
    expect(getPhase(90, 100)).toBe('final');
  });
});
