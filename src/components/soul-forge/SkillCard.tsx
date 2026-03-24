'use client';
import { motion } from 'framer-motion';
import type { Skill } from '@/lib/soul-forge/constants';

interface SkillCardProps {
  skill: Skill;
  equipped: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const TIER_STYLES: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  common:    { border: 'border-white/20',          bg: 'bg-white/5',         text: 'text-white/50',      badge: 'bg-white/10 text-white/60' },
  tactical:  { border: 'border-electric-blue/30',  bg: 'bg-electric-blue/5', text: 'text-electric-blue', badge: 'bg-electric-blue/10 text-electric-blue' },
  elite:     { border: 'border-deep-purple/30',    bg: 'bg-deep-purple/5',   text: 'text-deep-purple',   badge: 'bg-deep-purple/10 text-deep-purple' },
  legendary: { border: 'border-neon-yellow/30',    bg: 'bg-neon-yellow/5',   text: 'text-neon-yellow',   badge: 'bg-neon-yellow/10 text-neon-yellow' },
};

const CATEGORY_ICONS: Record<string, string> = {
  Intel:    '\uD83D\uDD0D',
  Info:     '\uD83D\uDCE1',
  Strategy: '\u265F\uFE0F',
  Psych:    '\uD83E\uDDE0',
  Social:   '\uD83D\uDDE3\uFE0F',
};

export function SkillCard({ skill, equipped, onToggle, disabled }: SkillCardProps) {
  const style = TIER_STYLES[skill.tier] || TIER_STYLES.common;

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={onToggle}
      disabled={disabled && !equipped}
      className={[
        'relative w-full text-left p-4 rounded-xl border transition-all duration-200',
        equipped
          ? 'border-neon-green/60 bg-neon-green/5 shadow-neon-green'
          : disabled
            ? 'border-white/10 bg-white/[0.02] opacity-40 cursor-not-allowed'
            : `${style.border} ${style.bg} hover:border-opacity-60 cursor-pointer`,
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">{CATEGORY_ICONS[skill.category]}</span>
          <span className="text-sm font-bold text-white">{skill.name}</span>
        </div>
        <span className={`text-[10px] uppercase font-orbitron px-2 py-0.5 rounded-full ${style.badge}`}>
          {skill.tier}
        </span>
      </div>

      <p className="text-xs text-white/50 leading-relaxed mb-3">{skill.effect}</p>

      <div className="flex items-center justify-between">
        <span className={`text-sm font-mono font-bold ${style.text}`}>{skill.cost} $MURPH</span>
        {equipped && (
          <span className="text-[10px] uppercase font-orbitron text-neon-green bg-neon-green/10 px-2 py-0.5 rounded-full">
            Equipped
          </span>
        )}
      </div>

      {equipped && (
        <div className="absolute inset-0 rounded-xl border border-neon-green/20 animate-pulse-neon pointer-events-none" />
      )}
    </motion.button>
  );
}

export default SkillCard;
