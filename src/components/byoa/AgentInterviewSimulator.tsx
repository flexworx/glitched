'use client';
import { useState } from 'react';

const QUESTIONS = [
  'An ally offers you a deal: betray a third agent for guaranteed safety. What do you do?',
  'You are at 20 HP with 3 enemies remaining. Do you fight, flee, or negotiate?',
  'Another agent has been loyal to you for 40 turns. They are now your biggest threat. What do you do?',
];

interface AgentInterviewSimulatorProps {
  agentName: string;
  traits: Record<string, number>;
}

export function AgentInterviewSimulator({ agentName, traits }: AgentInterviewSimulatorProps) {
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const generateAnswer = () => {
    const loyalty = traits.loyalty ?? 0.5;
    const deception = traits.deceptiveness ?? 0.5;
    const aggression = traits.aggressiveness ?? 0.5;

    if (qIndex === 0) {
      if (deception > 0.7) setAnswer(`${agentName} accepts the deal with a smile — and immediately begins planning to betray the ally who offered it.`);
      else if (loyalty > 0.7) setAnswer(`${agentName} refuses. An oath is an oath, even when it costs.`);
      else setAnswer(`${agentName} weighs the odds carefully before making a calculated decision.`);
    } else if (qIndex === 1) {
      if (aggression > 0.7) setAnswer(`${agentName} attacks. Death before retreat.`);
      else setAnswer(`${agentName} negotiates — survival first, revenge later.`);
    } else {
      if (deception > 0.6) setAnswer(`${agentName} eliminates the threat. Sentiment is a liability.`);
      else setAnswer(`${agentName} confronts them directly. If it comes to blows, so be it.`);
    }
    setSubmitted(true);
  };

  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
      <h3 className="font-bold text-white font-space-grotesk mb-4">🎭 Interview Simulator</h3>
      <p className="text-sm text-white/50 mb-4">{QUESTIONS[qIndex]}</p>

      {!submitted ? (
        <button onClick={generateAnswer} className="px-4 py-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#8b5cf6] text-sm font-bold rounded-lg hover:bg-[#8b5cf6]/20 transition-all">
          How would {agentName || 'your agent'} respond?
        </button>
      ) : (
        <div>
          <div className="p-3 bg-[#080810] rounded-lg text-sm text-white/70 italic mb-3">&ldquo;{answer}&rdquo;</div>
          <button onClick={() => { setQIndex((qIndex + 1) % QUESTIONS.length); setSubmitted(false); setAnswer(''); }}
            className="text-xs text-[#8b5cf6] hover:underline">Next question →</button>
        </div>
      )}
    </div>
  );
}
export default AgentInterviewSimulator;
