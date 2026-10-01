import type { ReactNode } from 'react';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { ScrollToTopButton } from '../ui/ScrollToTopButton';

export const SiteLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="bg-grid-pattern flex min-h-screen flex-col bg-[#0B0C0E] text-slate-100">
      <SiteHeader />
      <main className="relative isolate flex-1">{children}</main>
      <SiteFooter />
      <ScrollToTopButton />
    </div>
  );
};
