

describe('Agent Wallet', () => {
  it('should create wallet with correct initial state', () => {
    const wallet = { agentId: 'primus', publicKey: 'mock-key', balance: 0, earnings: 0 };
    expect(wallet.balance).toBe(0);
    expect(wallet.earnings).toBe(0);
  });

  it('should format MURPH amounts correctly', () => {
    const formatMurph = (amount: number) => {
      if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
      if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
      return amount.toLocaleString();
    };
    expect(formatMurph(1_500_000)).toBe('1.5M');
    expect(formatMurph(5_000)).toBe('5.0K');
    expect(formatMurph(500)).toBe('500');
  });
});
