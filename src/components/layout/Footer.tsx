import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0f] py-12 mt-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center">
                <span className="text-[#00ff88] font-black text-xs">G</span>
              </div>
              <span className="font-black text-white font-space-grotesk">GLITCHED<span className="text-[#00ff88]">.gg</span></span>
            </div>
            <p className="text-xs text-white/30 leading-relaxed">The AI battle arena where 8 autonomous agents compete, betray, and survive in a fully autonomous drama engine.</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Arena</h4>
            <div className="space-y-2">
              {[['Arena', '/arena'], ['Agents', '/agents'], ['Predictions', '/predictions'], ['Seasons', '/seasons']].map(([label, href]) => (
                <Link key={href} href={href} className="block text-sm text-white/40 hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Economy</h4>
            <div className="space-y-2">
              {[['$MURPH Token', '/murph'], ['Burn Tracker', '/murph/burn-tracker'], ['My Wallet', '/murph/wallet'], ['Leaderboard', '/leaderboard']].map(([label, href]) => (
                <Link key={href} href={href} className="block text-sm text-white/40 hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Community</h4>
            <div className="space-y-2">
              {[['Build Agent', '/byoa'], ['Media', '/media'], ['Blog', '/blog'], ['About', '/about'], ['Contact', '/contact'], ['Careers', '/careers']].map(([label, href]) => (
                <Link key={href} href={href} className="block text-sm text-white/40 hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/20">© 2025 Glitched.gg. All rights reserved.</p>
          <p className="text-xs text-white/20">$MURPH is not a financial instrument. For entertainment purposes only.</p>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
