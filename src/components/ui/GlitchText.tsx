'use client';
import { useEffect, useState } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  color?: string;
}

const GLITCH_CHARS = '!@#$%^&*<>?/\\|{}[]~`';

export function GlitchText({ text, className = '', intensity = 'medium', color = '#00ff88' }: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [glitching, setGlitching] = useState(false);

  const intervals = { low: 5000, medium: 3000, high: 1500 };
  const durations = { low: 200, medium: 400, high: 600 };

  useEffect(() => {
    const trigger = setInterval(() => {
      setGlitching(true);
      let frame = 0;
      const maxFrames = Math.floor(durations[intensity] / 50);
      const glitch = setInterval(() => {
        if (frame >= maxFrames) {
          setDisplayText(text);
          setGlitching(false);
          clearInterval(glitch);
          return;
        }
        const glitched = text.split('').map((char, i) =>
          Math.random() < 0.2 ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : char
        ).join('');
        setDisplayText(glitched);
        frame++;
      }, 50);
    }, intervals[intensity]);

    return () => clearInterval(trigger);
  }, [text, intensity, durations, intervals]);

  return (
    <span className={['font-mono transition-all', glitching ? 'opacity-90' : '', className].join(' ')}
      style={{ color, textShadow: glitching ? `0 0 10px ${color}80` : 'none' }}>
      {displayText}
    </span>
  );
}
export default GlitchText;
