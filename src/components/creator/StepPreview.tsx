'use client';

import { useState } from 'react';
import type { CreatorWizardState } from '@/types/agent';
import { AgentPreviewCard } from './AgentPreviewCard';

interface StepPreviewProps {
  state: CreatorWizardState;
  onNext: () => void;
  onBack: () => void;
  onGoToStep: (step: number) => void;
}

const INTERVIEW_QUESTIONS = [
  'What is your primary strategy for surviving the first 5 turns?',
  'How do you decide who to trust in the arena?',
  'Describe your ideal endgame scenario.',
];

interface InterviewAnswer {
  question: string;
  answer: string;
}

function generateAnswer(question: string, state: CreatorWizardState): string {
  const traits = state.traits;
  const machiavellianism = traits.machiavellianism ?? 50;
  const alliance_loyalty = traits.alliance_loyalty ?? 50;
  const risk_tolerance = traits.risk_tolerance ?? 50;
  const planning_horizon = traits.planning_horizon ?? 50;
  const directness = traits.directness ?? 50;

  if (question.includes('strategy')) {
    if (planning_horizon > 65) {
      return `My first five turns are already mapped out. I will spend turns 1-2 gathering intelligence, turn 3 establishing a strategic alliance, and turns 4-5 positioning for the mid-game. Every action serves the long game.`;
    } else if (risk_tolerance > 65) {
      return `Strike fast, strike hard. I'll identify the weakest agent immediately and eliminate them before they can form alliances. Momentum is everything.`;
    } else {
      return `Careful observation. I'll watch the others, identify patterns, and wait for the right moment to act. Patience is a weapon.`;
    }
  }

  if (question.includes('trust')) {
    if (machiavellianism > 65) {
      return `Trust is a tool. I extend it strategically to those who can serve my goals, and I withdraw it the moment they become a liability. No one is truly an ally — only a temporary asset.`;
    } else if (alliance_loyalty > 65) {
      return `I trust those who demonstrate consistency. Actions speak louder than words. Show me loyalty through deeds, and I will defend you with everything I have.`;
    } else {
      return `Cautiously. I verify before I trust. But once trust is earned, it's absolute — until it's broken.`;
    }
  }

  if (question.includes('endgame')) {
    return `Standing alone in the arena, watching the others fall. Not through luck, but through superior strategy and the relationships I've cultivated — and the ones I've severed at precisely the right moment.`;
  }

  return `That depends entirely on the circumstances. I adapt.`;
}

export function StepPreview({ state, onNext, onBack, onGoToStep }: StepPreviewProps) {
  const [interviewRunning, setInterviewRunning] = useState(false);
  const [interviewAnswers, setInterviewAnswers] = useState<InterviewAnswer[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [interviewComplete, setInterviewComplete] = useState(false);

  const runInterview = async () => {
    setInterviewRunning(true);
    setInterviewAnswers([]);
    setCurrentQuestion(0);
    setInterviewComplete(false);

    for (let qi = 0; qi < INTERVIEW_QUESTIONS.length; qi++) {
      const question = INTERVIEW_QUESTIONS[qi];
      setCurrentQuestion(qi);
      await new Promise((r) => setTimeout(r, 600));

      const answer = generateAnswer(question, state);

      // Type out the answer
      for (let i = 0; i <= answer.length; i++) {
        setTypingText(answer.slice(0, i));
        await new Promise((r) => setTimeout(r, 15));
      }

      setInterviewAnswers((prev) => [...prev, { question, answer }]);
      setTypingText('');
      await new Promise((r) => setTimeout(r, 400));
    }

    setInterviewRunning(false);
    setInterviewComplete(true);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left: Agent preview card */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-black font-space-grotesk text-white mb-1">
            Agent Preview
          </h2>
          <p className="text-white/50 text-sm">
            Review your agent before deploying them to the arena.
          </p>
        </div>

        <AgentPreviewCard state={state} />

        {/* Edit shortcuts */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            { label: 'Edit Identity', step: 1 },
            { label: 'Edit Traits', step: 2 },
            { label: 'Edit Arena Tool', step: 3 },
            { label: 'Edit Beliefs', step: 5 },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => onGoToStep(item.step)}
              className="py-2 px-3 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/30 transition-all"
            >
              ← {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Simulated interview */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-bold font-space-grotesk text-white mb-1">
            Simulated Interview
          </h3>
          <p className="text-white/50 text-sm">
            See how your agent thinks and speaks before committing.
          </p>
        </div>

        <div className="bg-[#111118] border border-white/10 rounded-xl p-4 min-h-[300px]">
          {!interviewRunning && !interviewComplete && (
            <div className="flex flex-col items-center justify-center h-48 gap-4">
              <span className="text-4xl">🎤</span>
              <p className="text-white/40 text-sm text-center">
                Run a 3-question interview to see your agent's personality in action
              </p>
              <button
                onClick={runInterview}
                className="px-6 py-2 rounded-xl bg-[#00D4FF]/20 border border-[#00D4FF]/40 text-[#00D4FF] text-sm font-semibold hover:bg-[#00D4FF]/30 transition-all"
              >
                Start Interview
              </button>
            </div>
          )}

          {(interviewRunning || interviewComplete) && (
            <div className="space-y-4">
              {interviewAnswers.map((qa, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-xs font-bold text-[#00D4FF] uppercase tracking-wider">
                    Q{i + 1}: {qa.question}
                  </p>
                  <p className="text-sm text-white/80 font-mono leading-relaxed">
                    {qa.answer}
                  </p>
                </div>
              ))}

              {interviewRunning && typingText && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#00D4FF] uppercase tracking-wider">
                    Q{currentQuestion + 1}: {INTERVIEW_QUESTIONS[currentQuestion]}
                  </p>
                  <p className="text-sm text-white/80 font-mono leading-relaxed">
                    {typingText}
                    <span className="animate-pulse">|</span>
                  </p>
                </div>
              )}

              {interviewComplete && (
                <button
                  onClick={runInterview}
                  className="text-xs text-white/30 hover:text-white/60 transition-colors mt-2"
                >
                  Run again
                </button>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all text-sm font-semibold"
          >
            ← Back
          </button>
          <button
            onClick={onNext}
            className="flex-1 py-3 rounded-xl font-bold text-black text-sm font-space-grotesk transition-all bg-[#39FF14] hover:bg-[#39FF14]/90 shadow-[0_0_20px_rgba(57,255,20,0.3)]"
          >
            Looks Good — Deploy Agent →
          </button>
        </div>
      </div>
    </div>
  );
}

export default StepPreview;
