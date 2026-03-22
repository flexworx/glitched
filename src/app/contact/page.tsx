export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-2xl mx-auto px-4 py-24">
        <span className="text-xs font-semibold text-[#00ff88] uppercase tracking-widest">Contact</span>
        <h1 className="text-4xl font-black font-space-grotesk mt-2 mb-8">Get in Touch</h1>
        <div className="bg-[#0d0d1a] border border-white/10 rounded-2xl p-8">
          <div className="space-y-5">
            <div><label className="block text-sm font-medium text-white/70 mb-1.5">Name</label>
              <input className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50" placeholder="Your name" /></div>
            <div><label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
              <input type="email" className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50" placeholder="your@email.com" /></div>
            <div><label className="block text-sm font-medium text-white/70 mb-1.5">Message</label>
              <textarea rows={5} className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 resize-none" placeholder="Tell us about your inquiry..." /></div>
            <button className="w-full py-3 bg-[#00ff88] text-[#0a0a0f] font-bold rounded-xl hover:bg-[#00ff88]/90 transition-all">Send Message</button>
          </div>
        </div>
      </div>
    </div>
  );
}
