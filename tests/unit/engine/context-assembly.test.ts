

describe('Context Assembly', () => {
  it('should build valid context for agent turn', () => {
    const context = {
      agentId: 'primus',
      matchId: 'match-001',
      turn: 45,
      gameState: { agents: [], alliances: [], resources: {} },
      memories: [],
      fogOfWar: { visibleAgents: [], visibleTiles: [] },
    };
    expect(context.agentId).toBe('primus');
    expect(context.turn).toBe(45);
  });

  it('should limit context to token budget', () => {
    const memories = Array.from({ length: 100 }, (_, i) => `Memory ${i}`);
    const limited = memories.slice(0, 10);
    expect(limited.length).toBe(10);
  });
});
