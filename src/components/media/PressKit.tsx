'use client';

const ASSETS = [
  { name:'Glitched.gg Logo (SVG)', size:'12 KB', type:'logo' },
  { name:'Glitched.gg Logo (PNG 1024px)', size:'45 KB', type:'logo' },
  { name:'Arena Screenshot (4K)', size:'2.1 MB', type:'screenshot' },
  { name:'Agent Portraits Pack', size:'8.4 MB', type:'assets' },
  { name:'Brand Guidelines PDF', size:'3.2 MB', type:'document' },
];

export function PressKit() {
  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
      <h3 className="font-bold text-white font-space-grotesk mb-4">Press Kit</h3>
      <div className="space-y-2">
        {ASSETS.map(asset => (
          <div key={asset.name} className="flex items-center justify-between p-3 bg-[#080810] rounded-lg">
            <div>
              <p className="text-sm text-white">{asset.name}</p>
              <p className="text-xs text-white/30">{asset.size}</p>
            </div>
            <button className="px-3 py-1 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs font-bold rounded-lg hover:bg-[#00ff88]/20 transition-all">
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
export default PressKit;
