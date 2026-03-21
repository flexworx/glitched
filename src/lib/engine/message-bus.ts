import type { Message, MessageChannel, ContentFilterResult } from '../types/message';

export class MessageBus {
  private messages: Message[] = [];

  canSendOnChannel(agentId: string, channel: MessageChannel, targetId?: string): boolean {
    switch (channel) {
      case 'PUBLIC_BROADCAST': return true;
      case 'BIG_SCREEN': return true;
      case 'DIRECT_MESSAGE': return !!targetId;
      case 'TEAM_CHANNEL': return true;
      case 'FRIEND_GROUP': return true;
      case 'OPERATOR_WHISPER': return false;
      case 'SPECTATOR_CHAT': return false;
      case 'REFEREE_CHANNEL': return false;
      default: return false;
    }
  }

  getAccessibleMessages(agentId: string, allMessages: Message[]): Message[] {
    return allMessages.filter(msg => {
      switch (msg.channel) {
        case 'PUBLIC_BROADCAST': case 'BIG_SCREEN': return true;
        case 'DIRECT_MESSAGE': return msg.senderId === agentId || msg.targetId === agentId;
        case 'TEAM_CHANNEL': case 'FRIEND_GROUP': return true;
        case 'OPERATOR_WHISPER': return msg.targetId === agentId;
        default: return false;
      }
    });
  }

  routeMessage(message: Message, filterResult: ContentFilterResult): Message | null {
    if (!filterResult.passed) return null;
    const finalMessage = filterResult.filteredContent
      ? { ...message, content: filterResult.filteredContent }
      : message;
    this.messages.push(finalMessage);
    return finalMessage;
  }

  getMatchMessages(matchId: string): Message[] {
    return this.messages.filter(m => m.matchId === matchId);
  }
}
