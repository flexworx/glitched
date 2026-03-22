'use client';
import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';

export function DashboardLayout({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Header />
      <main className={['pt-16 pb-20 md:pb-0', className].join(' ')}>{children}</main>
      <Footer />
      <MobileNav />
    </div>
  );
}
export default DashboardLayout;
