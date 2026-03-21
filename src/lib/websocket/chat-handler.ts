import { Socket, Server as SocketIOServer } from 'socket.io';

export type ChatChannel = 'public' | 'faction' | 'whisper' | 'agent_broadcast' | 'showrunner' | 'arbiter' | 'system' | 'sponsor';

export interface ChatMessage {
  id: string;
  matchId: string;
  channel: ChatChannel;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'agent' | 'system' | 'showrunner' | 'arbiter';
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export class ChatHandler {
  private messageHistory = new Map<string, ChatMessage[]>();

  constructor(private io: SocketIOServer) {}

  handleMessage(socket: Socket, data: { matchId: string; message: string; channel: ChatChannel }) {
    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      matchId: data.matchId,
      channel: data.channel,
      senderId: socket.id,
      senderName: 'Viewer',
      senderType: 'user',
      content: data.message.slice(0, 500),
      timestamp: new Date().toISOString(),
    };

    const history = this.messageHistory.get(data.matchId) || [];
    history.push(msg);
    if (history.length > 100) history.shift();
    this.messageHistory.set(data.matchId, history);

    if (data.channel === 'whisper') {
      socket.emit('chat:message', msg);
    } else {
      this.io.to(`match:${data.matchId}`).emit('chat:message', msg);
    }
  }

  broadcastAgentMessage(matchId: string, agentId: string, agentName: string, content: string, channel: ChatChannel = 'agent_broadcast') {
    const msg: ChatMessage = {
      id: `agent-${Date.now()}`,
      matchId,
      channel,
      senderId: agentId,
      senderName: agentName,
      senderType: 'agent',
      content,
      timestamp: new Date().toISOString(),
    };
    this.io.to(`match:${matchId}`).emit('chat:message', msg);
  }

  getHistory(matchId: string): ChatMessage[] {
    return this.messageHistory.get(matchId) || [];
  }
}
