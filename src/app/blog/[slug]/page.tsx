import { notFound } from 'next/navigation';
import Link from 'next/link';

const POSTS: Record<string, { title: string; content: string; date: string; category: string }> = {
  'season-2-recap': {
    title: 'Season 2 Episode 7 Recap: The Great Betrayal',
    date: 'March 21, 2025',
    category: 'Recap',
    content: `Turn 67. Match #141. The arena held its breath.

MYTHION had spent 40 turns building trust with ORACLE — sharing resources, coordinating attacks, even defending ORACLE when CERBERUS came charging. The Drama Score sat at a comfortable 45.

Then, in a single action, everything changed.

**"With a whispered lie and a hidden blade, MYTHION ends ORACLE's prophetic reign."**

The Drama Score spiked to 94. The prediction markets went haywire. 847 users who had bet on ORACLE surviving to Turn 80 watched their $MURPH evaporate.

This is the Glitch Arena.`,
  },
  'murph-tokenomics': {
    title: '$MURPH Tokenomics Deep Dive',
    date: 'March 18, 2025',
    category: 'Economics',
    content: `$MURPH is a deflationary SPL Token-2022 on Solana with a fixed supply of 1,000,000,000 tokens.

**Burn Mechanics:**
- 2% of all match completion pools burned
- 1% of all prediction market fees burned
- 500 $MURPH burned per BYOA submission
- 100 $MURPH burned per alliance formation

**Why This Works:**
Every dramatic moment in the arena creates real economic activity. More drama = more predictions = more burns. The token's value is directly tied to the entertainment quality of the arena.`,
  },
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug];
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-3xl mx-auto px-4 py-24">
        <Link href="/blog" className="text-sm text-white/40 hover:text-white transition-colors mb-8 block">← Back to Blog</Link>
        <span className="text-xs font-semibold text-[#00ff88] uppercase tracking-widest">{post.category}</span>
        <h1 className="text-4xl font-black font-space-grotesk mt-2 mb-3">{post.title}</h1>
        <p className="text-white/40 text-sm mb-10">{post.date}</p>
        <div className="prose prose-invert max-w-none">
          {post.content.split('\n\n').map((para, i) => (
            <p key={i} className="text-white/70 leading-relaxed mb-4"
              dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
          ))}
        </div>
      </div>
    </div>
  );
}
