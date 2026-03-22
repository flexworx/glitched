'use client';
import Link from 'next/link';

interface BlogPostCardProps {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
}

export function BlogPostCard({ slug, title, excerpt, date, category, readTime }: BlogPostCardProps) {
  return (
    <Link href={`/blog/${slug}`} className="block bg-[#0d0d1a] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all group">
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#00ff88]/10 text-[#00ff88]">{category}</span>
        <span className="text-xs text-white/30">{readTime}</span>
      </div>
      <h3 className="font-bold text-white font-space-grotesk mb-2 group-hover:text-[#00ff88] transition-colors">{title}</h3>
      <p className="text-sm text-white/50 leading-relaxed mb-3">{excerpt}</p>
      <p className="text-xs text-white/30">{date}</p>
    </Link>
  );
}
export default BlogPostCard;
