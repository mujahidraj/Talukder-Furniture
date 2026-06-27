import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import useSearchStore from '../../stores/useSearchStore';
import api from '../../lib/api';

export default function SearchOverlay() {
  const { isOpen, closeSearch } = useSearchStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/products?q=${encodeURIComponent(query)}&limit=8`);
        setResults(res.data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 500);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      closeSearch();
      navigate(`/shop?q=${encodeURIComponent(query)}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white/95 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="container-custom py-6 flex justify-end">
        <button 
          onClick={closeSearch}
          className="p-2 text-gray-500 hover:text-accent transition-colors bg-gray-100 rounded-full"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-grow flex flex-col items-center pt-10 px-4 pb-20">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-8 text-center">What are you looking for?</h2>
        
        <form onSubmit={handleSearch} className="w-full max-w-3xl relative mb-12">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for furniture, collections, or materials..."
            className="w-full text-xl md:text-2xl bg-transparent border-b-2 border-gray-300 py-4 pr-12 focus:outline-none focus:border-accent transition-colors placeholder:text-gray-400"
          />
          <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent p-2">
            <Search size={28} />
          </button>
        </form>

        <div className="w-full max-w-5xl">
          {loading ? (
            <div className="flex justify-center py-10">
              <img src="/LOGO.gif" alt="Searching..." className="w-24 h-24 object-contain" />
            </div>
          ) : results.length > 0 ? (
            <div>
              <div className="flex justify-between items-end mb-6">
                <h3 className="font-semibold text-gray-500">Products ({results.length})</h3>
                <button 
                  onClick={handleSearch}
                  className="text-sm font-medium text-accent hover:text-primary flex items-center gap-1"
                >
                  View All <ArrowRight size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {results.map(product => (
                  <div 
                    key={product.id} 
                    className="group cursor-pointer"
                    onClick={() => { closeSearch(); navigate(`/products/${product.slug}`); }}
                  >
                    <div style={{
                      aspectRatio: '1', overflow: 'hidden',
                      backgroundColor: '#ffffff', borderRadius: '8px',
                      marginBottom: '16px', border: '1px solid #f0f0f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '9px'
                    }}>
                      {product.images?.[0] ? (
                        <img 
                          src={product.images[0].url} 
                          alt={product.name} 
                          style={{
                            maxWidth: '100%', maxHeight: '100%', borderRadius: '2%', objectFit: 'contain',
                            transition: 'transform 0.3s'
                          }}
                          className="group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base md:text-[18px] font-semibold text-[#444] leading-snug mb-1.5 truncate group-hover:text-accent transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-lg md:text-[20px] font-bold text-[#1a1a1a]">
                        {product.basePrice && product.discountPercentage > 0 
                          ? `৳ ${(product.basePrice * (1 - product.discountPercentage / 100)).toLocaleString()}`
                          : (product.priceDisplay || `৳ ${product.basePrice || product.price || 0}`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : query.length >= 2 ? (
            <div className="text-center py-10">
              <p className="text-xl text-gray-500 mb-2">No results found for "{query}"</p>
              <p className="text-gray-400">Try checking your spelling or using different keywords.</p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <span className="text-gray-400 font-medium mr-2">Popular Searches:</span>
              {['Sofa', 'Dining Table', 'Bed Frame', 'Leather', 'Oak'].map(term => (
                <button 
                  key={term}
                  onClick={() => setQuery(term)}
                  className="text-sm px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-accent hover:text-white transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
