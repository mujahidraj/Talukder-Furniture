import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import SearchOverlay from './SearchOverlay';
import SEO from '../seo/SEO';

export default function PublicLayout() {
  const { pathname } = useLocation();

  // For non-home pages, hide the splash screen once the layout mounts.
  // HomePage handles its own splash dismissal after data loads.
  useEffect(() => {
    if (pathname !== '/') {
      (window as any).__hideSplash?.();
    }
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SEO />
      <Header />
      <main className="flex-grow pt-[90px] lg:pt-[105px]">
        <Outlet />
      </main>
      <Footer />
      <SearchOverlay />
    </div>
  );
}
