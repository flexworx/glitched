'use client';
import { useState } from 'react';

const MOCK_MESSAGES = [
  { id:'m1', user:'glitch_prophet', channel:'arena', message:'PRIMUS is going to betray VANGUARD this turn, calling it now', time:'2s ago', flagged:false },
  { id:'m2', user:'arena_oracle', channel:'predictions', message:'All in on CERBERUS, 500 MURPH', time:'30s ago', flagged:false },
  { id:'m3', user:'shadow_broker', channel:'arena', message:'SPAM SPAM SPAM BUY CRYPTO', time:'1m ago', flagged:true },
];

export function ChatMonitor() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white font-space-grotesk">Live Chat Monitor</h3>
        <span className="text-xs text-white/30">{messages.filter(m => m.flagged).length} flagged</span>
      </div>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.id} className={['p-3 rounded-lg border text-sm', msg.flagged ? 'bg-red-500/5 border-red-500/20' : 'bg-[#080810] border-white/5'].join(' ')}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-white text-xs">{msg.user}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/20 capitalize">{msg.channel}</span>
                <span className="text-xs text-white/20">{msg.time}</span>
                {msg.flagged && <span className="text-xs text-red-400 font-bold">🚩 FLAGGED</span>}
              </div>
            </div>
            <p className="text-white/60">{msg.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
export default ChatMonitor;
