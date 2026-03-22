'use client';

interface PageHeaderProps {
  label?: string;
  title: string;
  description?: string;
  badge?: string;
  badgeColor?: string;
  action?: React.ReactNode;
}

export function PageHeader({ label, title, description, badge, badgeColor = '#00ff88', action }: PageHeaderProps) {
  return (
    <div className="mb-10 flex items-start justify-between">
      <div>
        {label && <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: badgeColor }}>{label}</span>}
        <h1 className="text-4xl font-black font-space-grotesk text-white mt-1 mb-2">{title}</h1>
        {description && <p className="text-white/50 max-w-xl leading-relaxed">{description}</p>}
        {badge && (
          <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-bold border"
            style={{ background: badgeColor + '10', color: badgeColor, borderColor: badgeColor + '30' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: badgeColor }} />
            {badge}
          </span>
        )}
      </div>
      {action && <div className="flex-shrink-0 ml-4">{action}</div>}
    </div>
  );
}
export default PageHeader;
