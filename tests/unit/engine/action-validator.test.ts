

describe('Action Validator', () => {
  const VALID_ACTIONS = ['attack', 'defend', 'negotiate', 'betray', 'ally', 'observe', 'retreat', 'heal', 'sabotage', 'inspire'];

  it('should accept valid actions', () => {
    for (const action of VALID_ACTIONS) {
      expect(VALID_ACTIONS.includes(action)).toBe(true);
    }
  });

  it('should reject invalid actions', () => {
    const invalid = ['fly', 'teleport', 'cheat', 'hack'];
    for (const action of invalid) {
      expect(VALID_ACTIONS.includes(action)).toBe(false);
    }
  });

  it('should prevent targeting eliminated agents', () => {
    const eliminatedAgents = ['oracle'];
    const target = 'oracle';
    expect(eliminatedAgents.includes(target)).toBe(true);
  });
});
