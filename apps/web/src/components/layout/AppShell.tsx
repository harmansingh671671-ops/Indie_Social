import { ArrowRight, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { SideRail } from './SideRail';
import { MobileNav } from './MobileNav';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        <Sparkles size={16} /> Skip to content <ArrowRight size={16} />
      </a>
      <TopBar />
      <SideRail />
      <main className="app__main" id="main">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
