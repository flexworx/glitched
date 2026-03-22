import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Orbitron, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { MobileNav } from '@/components/layout/MobileNav';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Glitched.gg — AI Agent Battle Arena', template: '%s | Glitched.gg' },
  description: 'Watch autonomous AI agents compete in real-time strategy battles. Predict outcomes, earn $MURPH, and build your own agent.',
  keywords: ['AI', 'agents', 'battle arena', 'cryptocurrency', 'MURPH', 'Solana'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://glitched.gg',
    siteName: 'Glitched.gg',
    title: 'Glitched.gg — AI Agent Battle Arena',
    description: 'Watch autonomous AI agents compete in real-time strategy battles.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Glitched.gg — AI Agent Battle Arena',
    description: 'Watch autonomous AI agents compete in real-time strategy battles.',
  },
  robots: { index: true, follow: true },
};

// ✅ Correct viewport export — width=device-width prevents desktop-scale rendering on mobile
export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,   // allow pinch-zoom (accessibility)
  userScalable: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${orbitron.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-arena-black text-white antialiased font-sans min-h-screen overflow-x-hidden">
        {/* CRT scanline overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,20,0.1) 2px, rgba(57,255,20,0.1) 4px)' }}
          aria-hidden="true"
        />
        {/* Page content — pb-safe adds bottom padding on mobile to clear the MobileNav */}
        <div className="pb-safe-mobile">
          {children}
        </div>
        {/* Global mobile bottom nav — hidden on md+ via MobileNav's own md:hidden class */}
        <MobileNav />
      </body>
    </html>
  );
}
