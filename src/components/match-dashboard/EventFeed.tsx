'use client';

import { useEffect, useRef } from 'react';
import type { SocialMessage } from '@/lib/types/glitch-engine';

interface EventFeedProps {
  events: string[];
  messages: SocialMessage[];
}

/** Classify event text into a color category by keyword matching. */
function getEventColor(event: string): string {
  const lower = event.toLowerCase();
  if (lower.includes('alliance') && (lower.includes('form') || lower.includes('join'))) return '#00D4FF';
  if (lower.includes('vote') || lower.includes('cast')) return '#FF006E';
  if (lower.includes('skill') || lower.includes('used')) return '#8B5CF6';
  if (lower.includes('eliminat')) return '#FF006E';
  if (lower.includes('challenge') || lower.includes('won') || lower.includes('result')) return '#FFD700';
  if (lower.includes('message') || lower.includes('said')) return '#9CA3AF';
  if (lower.includes('wildcard') || lower.includes('event')) return '#FF6B35';
  return '#9CA3AF';
}

function getChannelColor(channel: string): string {
  switch (channel) {
    case 'public': return '#FFFFFF';
    case 'alliance': return '#00D4FF';
    case 'dm': return '#FFD60A';
    case 'ghost': return '#8B5CF6';
    case 'referee': return '#FF6B35';
    default: return '#9CA3AF';
  }
}

function getChannelLabel(channel: string): string {
  switch (channel) {
    case 'public': return 'PUB';
    case 'alliance': return 'ALLY';
    case 'dm': return 'DM';
    case 'ghost': return 'GHOST';
    case 'referee': return 'REF';
    default: return channel.toUpperCase();
  }
}

export function EventFeed({ events, messages }: EventFeedProps) {
  const eventsEndRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Event Log */}
      <div className="flex-1 min-h-0 flex flex-col">
        <h3 className="font-orbitron text-[10px] text-gray-500 uppercase tracking-widest mb-2 flex-shrink-0">
          Event Feed
        </h3>
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
          {events.length === 0 && (
            <p className="text-xs text-gray-600 font-jetbrains italic">No events yet...</p>
          )}
          {events.map((event, i) => {
            const color = getEventColor(event);
            return (
              <div
                key={`evt-${i}`}
                className="flex gap-2 text-[11px] leading-tight animate-fade-in"
              >
                <span className="font-jetbrains text-gray-600 flex-shrink-0 w-6 text-right">
                  {i + 1}
                </span>
                <span
                  className="w-1 flex-shrink-0 rounded-full"
                  style={{ background: color }}
                />
                <span className="font-jetbrains text-gray-300 break-words min-w-0">
                  {event}
                </span>
              </div>
            );
          })}
          <div ref={eventsEndRef} />
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 min-h-0 flex flex-col">
        <h3 className="font-orbitron text-[10px] text-gray-500 uppercase tracking-widest mb-2 flex-shrink-0">
          Messages
        </h3>
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
          {messages.length === 0 && (
            <p className="text-xs text-gray-600 font-jetbrains italic">No messages yet...</p>
          )}
          {messages.map((msg, i) => {
            const channelColor = getChannelColor(msg.channel);
            return (
              <div
                key={msg.id || `msg-${i}`}
                className="rounded bg-arena-surface/50 px-2 py-1.5 animate-fade-in"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className="font-jetbrains text-[9px] px-1 py-0.5 rounded border"
                    style={{
                      color: channelColor,
                      borderColor: `${channelColor}40`,
                      background: `${channelColor}10`,
                    }}
                  >
                    {getChannelLabel(msg.channel)}
                  </span>
                  <span className="font-space-grotesk text-[11px] font-bold text-white">
                    {msg.from}
                  </span>
                  {msg.toAgentId && (
                    <span className="font-jetbrains text-[9px] text-gray-500">
                      {'\u2192'} {msg.toAgentId}
                    </span>
                  )}
                  <span className="font-jetbrains text-[9px] text-gray-600 ml-auto">
                    R{msg.round}
                  </span>
                </div>
                <p className="font-jetbrains text-[11px] text-gray-300 leading-tight">
                  {msg.text}
                </p>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}

export default EventFeed;
