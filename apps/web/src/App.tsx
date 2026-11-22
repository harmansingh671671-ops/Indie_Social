import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { SearchPage } from './pages/SearchPage';
import { SavedPage } from './pages/SavedPage';
import { ProfilePage } from './pages/ProfilePage';
import { EngagePage } from './pages/EngagePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AppStateProvider } from './state/AppState';
import { ToastProvider } from './components/common/Toast';
import { siteConfig } from './config/site';
import { startSiteHealth } from './lib/siteHealth';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const PAGE_TITLES: Array<[string, string]> = [
  ['/explore', 'Explore'],
  ['/search', 'Search'],
  ['/saved', 'Saved'],
  ['/profile', 'Profile'],
  ['/engage/', 'Engage'],
];

function DocumentTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    const match = PAGE_TITLES.find(([prefix]) =>
      prefix.endsWith('/') ? pathname.startsWith(prefix) : pathname === prefix,
    );
    document.title = match
      ? `${match[1]} · ${siteConfig.name}`
      : `${siteConfig.name} · ${siteConfig.tagline}`;
  }, [pathname]);
  return null;
}

export default function App() {
  // Low-priority background checks; failing sites are hidden from every page.
  useEffect(() => startSiteHealth(), []);

  return (
    <AppStateProvider>
      <ToastProvider>
        <AppShell>
          <ScrollToTop />
          <DocumentTitle />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/engage/:id" element={<EngagePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppShell>
      </ToastProvider>
    </AppStateProvider>
  );
}
