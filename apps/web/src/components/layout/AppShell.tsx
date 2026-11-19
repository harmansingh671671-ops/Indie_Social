import { ArrowRight, Sparkles } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { TopBar } from './TopBar';
import { SideRail } from './SideRail';
import { MobileNav } from './MobileNav';
import { CreateModal } from './CreateModal';

export function AppShell({ children }: { children: ReactNode }) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        <Sparkles size={16} /> Skip to content <ArrowRight size={16} />
      </a>
      <TopBar />
      <SideRail onCreate={() => setCreateOpen(true)} />
      <main className="app__main" id="main">
        {children}
      </main>
      <MobileNav onCreate={() => setCreateOpen(true)} />
      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
