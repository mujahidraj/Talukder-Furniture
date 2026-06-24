import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Navigation, Package, RotateCcw, LifeBuoy, BadgePercent } from 'lucide-react';
import api from '../../lib/api';
import Loader from '../../components/ui/Loader';

export default function StoreListPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const { data } = await api.get('/stores');
        const activeStores = data.filter((s: any) => s.isActive);
        if (activeStores.length > 0) {
          setStores(activeStores.map((s: any) => ({
            id: s.id,
            name: s.name,
            address: s.address,
            phone: s.phone || 'Phone not provided',
            hours: s.hours || 'Sat-Thu: 10am - 8pm | Fri: 3pm - 8pm',
            image: s.imageUrl || 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=800&q=80',
            mapUrl: s.mapUrl
          })));
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch stores, falling back to mock data.', err);
      }

      // Mock data for UI scaffolding fallback
      setStores([
        { 
          id: 'mock1', 
          name: 'Gulshan Flagship Showroom', 
          address: 'Gulshan Avenue, Gulshan 1, Dhaka 1212', 
          phone: '+880 1711 123456', 
          hours: 'Sat-Thu: 10am - 8pm | Fri: 3pm - 8pm',
          image: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=800&q=80'
        },
        { 
          id: 'mock2', 
          name: 'Dhanmondi Outlet', 
          address: 'Satmasjid Road, Dhanmondi, Dhaka 1209', 
          phone: '+880 1711 654321', 
          hours: 'Sat-Thu: 10am - 8pm | Fri: 3pm - 8pm',
          image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
        },
        { 
          id: 'mock3', 
          name: 'Chattogram Studio', 
          address: 'GEC Circle, Nasirabad, Chattogram 4000', 
          phone: '+880 1819 987654', 
          hours: 'Sat-Thu: 10am - 8pm | Fri: Closed',
          image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80'
        }
      ]);
    };

    fetchStores().finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Banner */}
      <div className="relative py-20 px-4 md:px-8 xl:px-12 overflow-hidden mb-16">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1920&q=80" 
            alt="Our Stores Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto">
          <h1 className="text-4xl md:text-5xl text-white font-serif mb-3 drop-shadow-md">Our Stores</h1>
          <div className="text-white/90 text-sm font-medium drop-shadow-md">
            <Link to="/" className="hover:text-white">Homepage</Link> <span className="mx-2">&gt;</span> Stores
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 xl:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Find a Store</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Experience our craftsmanship in person. Visit one of our showrooms to see, touch, and feel the quality of our furniture.
          </p>
        </div>

        {loading ? (
          <Loader text="Loading Showrooms..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stores.map((store) => (
              <div key={store.id} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="h-64 overflow-hidden">
                  <img 
                    src={store.image} 
                    alt={store.name} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h2 className="text-2xl font-serif font-bold text-primary mb-6">{store.name}</h2>
                  
                  <div className="space-y-4 mb-8 flex-grow text-gray-600">
                    <div className="flex items-start gap-3">
                      <MapPin size={20} className="text-primary flex-shrink-0 mt-1" />
                      <span>{store.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={20} className="text-primary flex-shrink-0" />
                      <span>{store.phone}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock size={20} className="text-primary flex-shrink-0 mt-1" />
                      <span>{store.hours}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (store.mapUrl) {
                        window.open(store.mapUrl, '_blank');
                      } else {
                        window.open(`https://maps.google.com/?q=${encodeURIComponent(store.address)}`, '_blank');
                      }
                    }}
                    className="btn btn-outline w-full flex justify-center items-center gap-2 mt-auto"
                  >
                    <Navigation size={18} /> Get Directions
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4 Feature Icons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-24 border-t border-b border-gray-100 py-16">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Package size={40} className="text-[#1a1a1a] mb-6" strokeWidth={1.5} />
            <h4 className="text-2xl font-serif text-[#1a1a1a] mb-3">Free & fast delivery</h4>
            <p className="text-sm md:text-base text-gray-500">No extra costs, just the price you see.</p>
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <RotateCcw size={40} className="text-[#1a1a1a] mb-6" strokeWidth={1.5} />
            <h4 className="text-2xl font-serif text-[#1a1a1a] mb-3">14-Day Returns</h4>
            <p className="text-sm md:text-base text-gray-500">Risk-free shopping with easy returns.</p>
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <LifeBuoy size={40} className="text-[#1a1a1a] mb-6" strokeWidth={1.5} />
            <h4 className="text-2xl font-serif text-[#1a1a1a] mb-3">24/7 Support</h4>
            <p className="text-sm md:text-base text-gray-500">24/7 support, always here just for you</p>
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <BadgePercent size={40} className="text-[#1a1a1a] mb-6" strokeWidth={1.5} />
            <h4 className="text-2xl font-serif text-[#1a1a1a] mb-3">Member Discounts</h4>
            <p className="text-sm md:text-base text-gray-500">Special prices for our loyal customers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
