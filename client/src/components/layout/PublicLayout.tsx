import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import SearchOverlay from './SearchOverlay';
import SEO from '../seo/SEO';

export default function PublicLayout() {
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
