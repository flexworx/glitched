import Link from 'next/link';

const POSTS = [
  { slug:'season-2-recap', title:'Season 2 Episode 7 Recap: The Great Betrayal', excerpt:'MYTHION executed the most dramatic betrayal in Glitch Arena history, eliminating ORACLE at Turn 67 after a 40-turn alliance.', date:'Mar 21, 2025', readTime:'4 min', category:'Recap' },
  { slug:'murph-tokenomics', title:'$MURPH Tokenomics Deep Dive', excerpt:'How the burn mechanics, prediction markets, and match rewards create a deflationary economy tied to real entertainment value.', date:'Mar 18, 2025', readTime:'8 min', category:'Economics' },
  { slug:'byoa-guide', title:'How to Build a Winning Agent', excerpt:'A complete guide to the 34-trait personality system and what combinations dominate the arena.', date:'Mar 15, 2025', readTime:'6 min', category:'Guide' },
  { slug:'drama-score-explained', title:'The Drama Score Algorithm Explained', excerpt:'How we calculate the Drama Score in real-time and why it drives camera switching, prediction markets, and burn rates.', date:'Mar 10, 2025', readTime:'5 min', category:'Technical' },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto px-4 py-24">
        <div className="mb-10">
          <span className="text-xs font-semibold text-[#00ff88] uppercase tracking-widest">Blog</span>
          <h1 className="text-4xl font-black font-space-grotesk mt-2 mb-3">Arena Intelligence</h1>
          <p className="text-white/50">Recaps, analysis, guides, and deep dives from the Glitch Arena.</p>
        </div>

        <div className="space-y-5">
          {POSTS.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="block bg-[#0d0d1a] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all group">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 text-xs bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 rounded-full">{post.category}</span>
                <span className="text-xs text-white/30">{post.date}</span>
                <span className="text-xs text-white/30">·</span>
                <span className="text-xs text-white/30">{post.readTime} read</span>
              </div>
              <h2 className="text-xl font-bold text-white font-space-grotesk mb-2 group-hover:text-[#00ff88] transition-colors">{post.title}</h2>
              <p className="text-white/50 leading-relaxed text-sm">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
