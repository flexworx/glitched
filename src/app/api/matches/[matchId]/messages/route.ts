/**
 * GET /api/matches/[matchId]/messages
 * Returns match messages from the message bus — supports channel filtering and pagination.
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';
import { ok, handleApiError } from '@/lib/api/response';
import { MessageChannel } from '@prisma/client';
export const dynamic = 'force-dynamic';

// Map friendly channel aliases used in the UI to actual MessageChannel enum values
const CHANNEL_MAP: Record<string, MessageChannel> = {
  showrunner:      MessageChannel.PUBLIC_BROADCAST,
  arbiter:         MessageChannel.REFEREE_CHANNEL,
  agent_broadcast: MessageChannel.PUBLIC_BROADCAST,
  system:          MessageChannel.BIG_SCREEN,
  wildcard:        MessageChannel.PUBLIC_BROADCAST,
  spectator:       MessageChannel.SPECTATOR_CHAT,
  bigscreen:       MessageChannel.BIG_SCREEN,
  big_screen:      MessageChannel.BIG_SCREEN,
  referee:         MessageChannel.REFEREE_CHANNEL,
  PUBLIC_BROADCAST: MessageChannel.PUBLIC_BROADCAST,
  BIG_SCREEN:       MessageChannel.BIG_SCREEN,
  REFEREE_CHANNEL:  MessageChannel.REFEREE_CHANNEL,
  SPECTATOR_CHAT:   MessageChannel.SPECTATOR_CHAT,
  OPERATOR_WHISPER: MessageChannel.OPERATOR_WHISPER,
  TEAM_CHANNEL:     MessageChannel.TEAM_CHANNEL,
  FRIEND_GROUP:     MessageChannel.FRIEND_GROUP,
  DIRECT_MESSAGE:   MessageChannel.DIRECT_MESSAGE,
};

export async function GET(
  req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '60', 10), 200);
    const before = searchParams.get('before') ?? undefined;
    const channelsParam = searchParams.get('channels');

    const channelEnums: MessageChannel[] | undefined = channelsParam
      ? [...new Set(
          channelsParam.split(',').map(c => CHANNEL_MAP[c.trim()]).filter((c): c is MessageChannel => !!c)
        )]
      : undefined;

    const messages = await prisma.matchMessage.findMany({
      where: {
        matchId: params.matchId,
        ...(channelEnums && channelEnums.length > 0 ? { channel: { in: channelEnums } } : {}),
        ...(before ? { timestamp: { lt: new Date(before) } } : {}),
      },
      orderBy: { timestamp: 'asc' },
      take: limit,
      select: {
        id: true,
        channel: true,
        senderId: true,
        content: true,
        timestamp: true,
        metadata: true,
        isBigScreen: true,
        sender: {
          select: { id: true, name: true, signatureColor: true, archetype: true },
        },
      },
    });

    return ok({
      messages: messages.map(m => ({
        id: m.id,
        channel: m.channel,
        senderId: m.senderId,
        senderName: m.sender.name,
        senderType: m.channel === MessageChannel.REFEREE_CHANNEL ? 'arbiter'
          : m.channel === MessageChannel.BIG_SCREEN ? 'system' : 'agent',
        content: m.content,
        timestamp: m.timestamp.toISOString(),
        metadata: m.metadata,
        isBigScreen: m.isBigScreen,
        agentColor: m.sender.signatureColor,
      })),
      count: messages.length,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
