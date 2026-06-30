import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import SearchOverlay from './SearchOverlay';
import SEO from '../seo/SEO';
import useUIStore from '../../stores/useUIStore';

export default function PublicLayout() {
  const { pathname } = useLocation();
  const setIsHomePage = useUIStore((state) => state.setIsHomePage);
  const isHomePage = pathname === '/';

  // Tell the store whether we're on the homepage (for transparent navbar)
  useEffect(() => {
    setIsHomePage(isHomePage);
    return () => setIsHomePage(false);
  }, [isHomePage, setIsHomePage]);

  // For non-home pages, hide the splash screen once the layout mounts.
  // HomePage handles its own splash dismissal after data loads.
  useEffect(() => {
    if (!isHomePage) {
      (window as any).__hideSplash?.();
    }
  }, [pathname, isHomePage]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SEO />
      <Header />
      {/* Homepage has no top padding — hero goes under the transparent navbar */}
      <main className={`flex-grow ${isHomePage ? '' : 'pt-[70px] lg:pt-[80px]'}`}>
        <Outlet />
      </main>
      <Footer />
      <SearchOverlay />
    </div>
  );
}
