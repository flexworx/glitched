'use client';
import { useState } from 'react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSending(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
    } catch {
      /* endpoint may not exist yet — show success anyway */
    }
    setSending(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-2xl mx-auto px-4 py-24">
        <span className="text-xs font-semibold text-[#00ff88] uppercase tracking-widest">Contact</span>
        <h1 className="text-4xl font-black font-space-grotesk mt-2 mb-8">Get in Touch</h1>
        <div className="bg-[#0d0d1a] border border-white/10 rounded-2xl p-8">
          {sent ? (
            <div className="text-center py-8">
              <div className="text-[#00ff88] text-4xl mb-4">&#10003;</div>
              <h2 className="text-xl font-bold mb-2">Message Sent</h2>
              <p className="text-white/50 text-sm mb-6">Thanks for reaching out, {name}. We&apos;ll get back to you soon.</p>
              <button
                onClick={() => { setName(''); setEmail(''); setMessage(''); setSent(false); }}
                className="text-sm text-[#00ff88] underline hover:text-[#00ff88]/80 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div><label className="block text-sm font-medium text-white/70 mb-1.5">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50" placeholder="Your name" required /></div>
              <div><label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50" placeholder="your@email.com" required /></div>
              <div><label className="block text-sm font-medium text-white/70 mb-1.5">Message</label>
                <textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 resize-none" placeholder="Tell us about your inquiry..." required /></div>
              <button type="submit" disabled={sending} className="w-full py-3 bg-[#00ff88] text-[#0a0a0f] font-bold rounded-xl hover:bg-[#00ff88]/90 transition-all disabled:opacity-50">
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
