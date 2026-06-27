import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, HeartCrack, ArrowRight } from 'lucide-react';
import useWishlistStore from '../../stores/useWishlistStore';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Banner */}
      <div className="relative py-20 px-4 md:px-8 xl:px-12 overflow-hidden mb-16">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1920&q=80" 
            alt="Wishlist Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto">
          <h1 className="text-4xl md:text-5xl text-white font-serif mb-3 drop-shadow-md">Your Wishlist</h1>
          <div className="text-white/90 text-sm font-medium drop-shadow-md">
            <Link to="/" className="hover:text-white">Homepage</Link> <span className="mx-2">&gt;</span> Wishlist
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 xl:px-12">
        {/* Header */}
        <div className="mb-10 flex justify-end border-b border-gray-200 pb-6">
          
          {items.length > 0 && (
            <button 
              onClick={clearWishlist}
              className="text-sm text-red-500 hover:text-red-700 font-semibold flex items-center gap-2 transition-colors"
            >
              <Trash2 size={16} /> Clear Wishlist
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <HeartCrack size={48} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-primary mb-4">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md">
              You haven't saved any items yet. Browse our collections and click the heart icon to save your favorite pieces here.
            </p>
            <Link to="/shop" className="btn btn-primary flex items-center gap-2">
              Start Browsing <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden group flex flex-col">
                <Link to={`/products/${item.slug}`} className="relative aspect-square block bg-gray-50">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      removeItem(item.id);
                    }}
                    className="absolute top-3 right-3 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-white hover:scale-110 shadow-sm transition-all z-10"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={18} />
                  </button>
                </Link>
                
                <div className="p-5 flex flex-col flex-grow">
                  <Link to={`/products/${item.slug}`} className="hover:text-accent transition-colors">
                    <h3 className="font-bold text-primary text-lg mb-2 truncate">{item.name}</h3>
                  </Link>
                  <span className="font-semibold text-[#1a1a1a] mb-4">{item.priceDisplay}</span>
                  
                  <Link 
                    to={`/products/${item.slug}`} 
                    className="mt-auto btn btn-outline w-full text-center py-2"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State Recommendations */}
        {items.length === 0 && (
          <div className="mt-24">
            <h3 className="text-2xl font-serif font-bold text-primary mb-8 text-center">Popular Categories to Explore</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { name: 'Living Room', slug: 'living-room', img: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=80' },
                { name: 'Bedroom', slug: 'bedroom', img: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=600&q=80' },
                { name: 'Dining', slug: 'dining', img: 'https://images.unsplash.com/photo-1617806118233-18e1c094f11c?auto=format&fit=crop&w=600&q=80' }
              ].map(cat => (
                <Link key={cat.slug} to={`/shop?category=${cat.slug}`} className="group relative h-64 rounded-xl overflow-hidden block">
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors z-10" />
                  <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <span className="text-white font-serif font-bold text-2xl tracking-wide">{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
