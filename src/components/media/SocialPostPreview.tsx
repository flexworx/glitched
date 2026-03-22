'use client';

interface SocialPostPreviewProps {
  platform: 'twitter' | 'discord' | 'telegram';
  content: string;
  agentName?: string;
  agentColor?: string;
}

export function SocialPostPreview({ platform, content, agentName, agentColor = '#00ff88' }: SocialPostPreviewProps) {
  const PLATFORM_STYLES = {
    twitter: { bg:'#15202b', border:'#1DA1F2', icon:'𝕏' },
    discord: { bg:'#36393f', border:'#5865F2', icon:'💬' },
    telegram: { bg:'#212d3b', border:'#0088cc', icon:'✈️' },
  };
  const style = PLATFORM_STYLES[platform];

  return (
    <div className="rounded-xl p-4 border" style={{ background: style.bg, borderColor: style.border + '40' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">{style.icon}</span>
        <span className="text-xs text-white/40 capitalize">{platform} Preview</span>
      </div>
      {agentName && (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: agentColor + '20', color: agentColor }}>
            {agentName[0]}
          </div>
          <span className="text-sm font-bold text-white">{agentName}</span>
          <span className="text-xs text-white/30">@glitched_gg</span>
        </div>
      )}
      <p className="text-sm text-white/80 leading-relaxed">{content}</p>
    </div>
  );
}
export default SocialPostPreview;
