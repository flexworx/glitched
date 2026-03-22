'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  agentId: string;
  agentName: string;
  agentColor: string;
  channel: string;
  content: string;
  timestamp: number;
  type: 'action' | 'narrative' | 'system' | 'commentary';
}

interface MessageFeedProps {
  messages: Message[];
  maxVisible?: number;
}

export default function MessageFeed({ messages, maxVisible = 8 }: MessageFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const visible = messages.slice(-maxVisible);

  return (
    <div className="space-y-1 overflow-y-auto max-h-64 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-700">
      <AnimatePresence initial={false}>
        {visible.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, x: -10, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`text-xs rounded px-2 py-1 ${
              msg.type === 'system' ? 'bg-gray-900/50 text-gray-500 italic' :
              msg.type === 'commentary' ? 'bg-yellow-900/20 text-yellow-300' :
              'bg-black/30'
            }`}
          >
            {msg.type !== 'system' && msg.type !== 'commentary' && (
              <span className="font-bold mr-1" style={{ color: msg.agentColor }}>
                {msg.agentName}:
              </span>
            )}
            <span className={msg.type === 'system' ? 'text-gray-500' : 'text-gray-300'}>
              {msg.content}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}
