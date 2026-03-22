'use client';
interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

const sizes: Record<string, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

export function Avatar({ src, name = '?', size = 'md', color = '#00ff88', className = '' }: AvatarProps) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div className={['relative rounded-full overflow-hidden flex items-center justify-center font-bold', sizes[size], className].join(' ')}
      style={{ background: src ? undefined : `${color}20`, border: `2px solid ${color}40` }}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span style={{ color }}>{initials}</span>
      )}
    </div>
  );
}
export default Avatar;
