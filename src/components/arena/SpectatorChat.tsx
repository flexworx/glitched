'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  username: string;
  content: string;
  timestamp: number;
  type: 'chat' | 'prediction' | 'reaction';
}

interface SpectatorChatProps {
  matchId: string;
  messages: ChatMessage[];
  onSendMessage?: (content: string) => void;
}

export default function SpectatorChat({ matchId, messages, onSendMessage }: SpectatorChatProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage?.(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Spectator Chat</span>
        <span className="text-xs text-gray-600">{messages.length} messages</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-800">
        <AnimatePresence initial={false}>
          {messages.slice(-50).map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs"
            >
              <span className="text-gray-500">{msg.username}: </span>
              <span className={msg.type === 'prediction' ? 'text-yellow-400' : msg.type === 'reaction' ? 'text-green-400' : 'text-gray-300'}>
                {msg.content}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {onSendMessage && (
        <div className="p-2 border-t border-gray-800 flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Send a message..."
            className="flex-1 bg-gray-900 text-xs text-white px-3 py-1.5 rounded-lg border border-gray-700 focus:outline-none focus:border-green-500"
          />
          <button
            onClick={handleSend}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
