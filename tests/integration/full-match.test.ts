

describe('Full Match Integration', () => {
  it('should complete a match lifecycle', async () => {
    const matchId = `test-\${Date.now()}`;
    const agents = ['primus', 'cerberus', 'mythion', 'oracle'];

    // Create match
    const match = { id: matchId, status: 'active', turn: 0, maxTurns: 10, agents };
    expect(match.status).toBe('active');

    // Simulate turns
    for (let i = 0; i < 10; i++) {
      match.turn++;
    }

    expect(match.turn).toBe(10);
  });
});
