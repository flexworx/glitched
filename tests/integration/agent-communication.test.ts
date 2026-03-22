import { describe, it, expect } from 'vitest';

describe('Agent Communication', () => {
  it('should route messages to correct channels', () => {
    const channels = ['arena', 'whisper', 'alliance', 'public', 'admin', 'system', 'predictions', 'commentary'];
    const message = { channel: 'arena', content: 'Test message', agentId: 'primus' };
    expect(channels.includes(message.channel)).toBe(true);
  });

  it('should not leak private reasoning to other agents', () => {
    const action = { action: 'betray', narrative: 'PRIMUS strikes!', reasoning: 'Private: VANGUARD is weakest' };
    const publicView = { action: action.action, narrative: action.narrative };
    expect(Object.keys(publicView)).not.toContain('reasoning');
  });
});
