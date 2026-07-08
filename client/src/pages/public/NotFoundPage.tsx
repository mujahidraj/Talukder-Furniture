import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Search } from 'lucide-react';
import useSearchStore from '../../stores/useSearchStore';

export default function NotFoundPage() {
  const { openSearch } = useSearchStore();

  return (
    <div className="bg-secondary min-h-[80vh] flex items-center justify-center py-20 px-4">
      <div className="text-center max-w-lg mx-auto">
        <div className="relative inline-block mb-8 flex flex-col items-center">
          <img src="/ICON SET/LOGO.gif" alt="Not Found" className="w-72 h-72 object-contain mb-[-3rem] relative z-10" />
          <h1 className="text-9xl font-serif font-bold text-gray-200 tracking-widest">404</h1>
        </div>
        
        <h2 className="text-3xl font-serif font-bold text-primary mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8 text-lg">
          It looks like you've wandered off the map. The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn btn-primary flex items-center justify-center gap-2">
            <Home size={18} /> Return Home
          </Link>
          <button 
            onClick={openSearch}
            className="btn btn-outline flex items-center justify-center gap-2"
          >
            <Search size={18} /> Search Products
          </button>
        </div>
      </div>
    </div>
  );
}
