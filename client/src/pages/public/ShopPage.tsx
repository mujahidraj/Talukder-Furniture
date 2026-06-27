import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, SlidersHorizontal, ChevronDown, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const categoryParam = searchParams.get('category');
  const sortParam = searchParams.get('sort') || 'newest';
  const priceParam = searchParams.get('price') || 'all';
  const stockParam = searchParams.get('stock') || 'all';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const qParam = searchParams.get('q') || searchParams.get('search');

  const MOCK_CATEGORIES = [
    { id: 1, name: 'Office Furniture', slug: 'office-furniture' },
    { id: 2, name: 'Home Furniture', slug: 'home-furniture' },
    { id: 3, name: 'Hospital Furniture', slug: 'hospital-furniture' },
  ];

  const MOCK_PRODUCTS = [
    {
      id: 1,
      name: 'Executive Director Table',
      slug: 'executive-director-table',
      price: 450,
      priceDisplay: '$450.00',
      description: 'Premium executive table with a sleek wooden finish.',
      category: { name: 'Office Furniture' },
      stockStatus: 'instock',
      images: [{ url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6ea?auto=format&fit=crop&w=800&q=80' }]
    },
    {
      id: 2,
      name: 'Ergonomic Office Chair',
      slug: 'ergonomic-office-chair',
      price: 150,
      priceDisplay: '$150.00',
      description: 'Adjustable ergonomic chair for long hours of work.',
      category: { name: 'Office Furniture' },
      stockStatus: 'preorder',
      images: [{ url: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=800&q=80' }]
    },
    {
      id: 3,
      name: 'Luxury Living Room Sofa',
      slug: 'luxury-living-room-sofa',
      price: 890,
      priceDisplay: '$890.00',
      description: 'Comfortable 3-seater sofa for the modern living room.',
      category: { name: 'Home Furniture' },
      stockStatus: 'instock',
      images: [{ url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80' }]
    },
    {
      id: 4,
      name: 'Modern Wardrobe',
      slug: 'modern-wardrobe',
      price: 520,
      priceDisplay: '$520.00',
      description: 'Spacious wooden wardrobe with sliding doors.',
      category: { name: 'Home Furniture' },
      stockStatus: 'instock',
      images: [{ url: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=800&q=80' }]
    }
  ];

  useEffect(() => {
    // Fetch Categories
    api.get('/categories').then(res => {
      // Flatten categories for the dropdown, or just use main categories
      const flatCats: any[] = [];
      res.data.forEach((main: any) => {
        flatCats.push(main);
        if (main.children) {
          main.children.forEach((sub: any) => flatCats.push({ ...sub, name: `— ${sub.name}` }));
        }
      });
      setCategories(flatCats);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);

    // Build query params
    const params = new URLSearchParams();
    if (categoryParam) params.append('category', categoryParam);
    if (qParam) params.append('q', qParam);

    // Handle Sort
    if (sortParam === 'price_asc') params.append('sort', 'price_asc');
    else if (sortParam === 'price_desc') params.append('sort', 'price_desc');
    else if (sortParam === 'name_asc') params.append('sort', 'name_asc');
    else if (sortParam === 'newest') params.append('sort', 'newest');

    params.append('limit', '20');
    params.append('page', pageParam.toString());

    if (priceParam && priceParam !== 'all') params.append('price', priceParam);

    api.get(`/products?${params.toString()}`)
      .then(res => {
        setProducts(res.data.products || []);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, [categoryParam, sortParam, priceParam, stockParam, pageParam, qParam]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    searchParams.set('sort', e.target.value);
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'all') {
      searchParams.delete('price');
    } else {
      searchParams.set('price', e.target.value);
    }
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'all') {
      searchParams.delete('stock');
    } else {
      searchParams.set('stock', e.target.value);
    }
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const handleCategoryChange = (slug: string) => {
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  useEffect(() => {
    const handleScroll = () => {
      // The toolbar sits right below the 350px hero banner
      // The header is ~105px, so sticking happens around 250px scroll
      setIsSticky(window.scrollY > 250);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-secondary min-h-screen pb-20">
      {/* Hero Banner Section */}
      <div
        className="relative w-full h-[250px] md:h-[350px] flex items-center mb-12"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 md:px-8 xl:px-12">
          <h1 className="text-5xl md:text-6xl font-serif text-white mb-4 drop-shadow-md">Shop</h1>
          <div className="text-sm text-gray-100 drop-shadow-md">
            <Link to="/" className="hover:text-white transition-colors">Homepage</Link>
            <span className="mx-2">&gt;</span>
            <span className="text-white">Shop</span>
          </div>
        </div>
      </div>

      {/* Toolbar Wrapper - Full width transition container */}
      <div
        className={`sticky top-[90px] lg:top-[104px] z-30 transition-all duration-500 ease-in-out ${isSticky
            ? 'w-full bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200 py-3'
            : 'w-full bg-transparent py-0 mb-8'
          }`}
      >
        <div className={`transition-all duration-500 ease-in-out mx-auto ${isSticky ? 'max-w-full px-4 md:px-8 xl:px-12' : 'max-w-[1800px] px-4 md:px-8 xl:px-12'
          }`}>
          <div className={`flex flex-col xl:flex-row justify-between items-center gap-4 transition-all duration-500 ease-in-out ${isSticky ? 'bg-transparent' : 'bg-white p-4 rounded-xl border border-gray-100 shadow-sm'
            }`}>
            {/* Mobile Filter Toggle */}
            <div className="flex xl:hidden w-full items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 text-primary font-medium px-4 min-h-[44px]"
              >
                <Filter size={18} /> Filter
              </button>

              {/* Mobile Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort:</span>
                <div className="relative">
                  <select
                    value={sortParam}
                    onChange={handleSortChange}
                    className="appearance-none bg-transparent text-sm py-1 pl-2 pr-6 font-medium text-primary focus:outline-none cursor-pointer"
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Left Side: Filters */}
            <div className={`flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 w-full xl:w-auto ${showFilters ? 'flex' : 'hidden xl:flex'}`}>
              <div className="hidden xl:flex items-center gap-2 mr-2">
                <Filter size={18} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filter:</span>
                {qParam && (
                  <span className="ml-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-primary flex items-center gap-1">
                    Search: "{qParam}"
                    <button onClick={() => {
                      searchParams.delete('q');
                      searchParams.delete('search');
                      setSearchParams(searchParams);
                    }} className="ml-1 text-gray-400 hover:text-red-500">
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:flex gap-3 w-full sm:w-auto">
                {/* Category Dropdown */}
                <div className="relative w-full sm:w-auto flex-1 sm:flex-none">
                  <select
                    value={categoryParam || 'all'}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-sm py-2.5 sm:py-2 pl-3 pr-8 rounded focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Price Range Dropdown */}
                <div className="relative w-full sm:w-auto flex-1 sm:flex-none">
                  <select
                    value={priceParam}
                    onChange={handlePriceChange}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-sm py-2.5 sm:py-2 pl-3 pr-8 rounded focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="all">Any Price</option>
                    <option value="0-10000">Under ৳ 10,000</option>
                    <option value="10000-25000">৳ 10,000 - ৳ 25,000</option>
                    <option value="25000-50000">৳ 25,000 - ৳ 50,000</option>
                    <option value="50000-100000">৳ 50,000 - ৳ 1,00,000</option>
                    <option value="100000+">More than ৳ 1,00,000</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Availability Dropdown */}
                <div className="relative w-full sm:w-auto flex-1 sm:flex-none">
                  <select
                    value={stockParam}
                    onChange={handleStockChange}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-sm py-2.5 sm:py-2 pl-3 pr-8 rounded focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="all">Availability</option>
                    <option value="instock">In Stock</option>
                    <option value="preorder">Pre-order</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Reset Filters Button */}
                {(categoryParam || priceParam !== 'all' || stockParam !== 'all') && (
                  <button
                    onClick={() => {
                      searchParams.delete('category');
                      searchParams.delete('price');
                      searchParams.delete('stock');
                      searchParams.delete('search');
                      searchParams.delete('q');
                      setSearchParams(searchParams);
                    }}
                    className="text-sm font-medium text-gray-500 hover:text-red-600 underline py-2.5 sm:py-2 px-2 text-center sm:text-left transition-colors whitespace-nowrap"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Right Side: View & Sort */}
            <div className={`flex flex-wrap items-center justify-between w-full xl:w-auto gap-4 ${showFilters ? 'hidden xl:flex' : 'hidden xl:flex'}`}>
              <div className="text-sm text-gray-500 hidden sm:block">
                Showing {products.length} results
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 border-r pr-4">
                  <span className="text-sm text-gray-500">View:</span>
                  <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-primary' : 'text-gray-400 hover:text-primary'}`}>
                    <LayoutGrid size={20} />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100 text-primary' : 'text-gray-400 hover:text-primary'}`}>
                    <List size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 hidden sm:inline-block">Sort:</span>
                  <div className="relative">
                    <select
                      value={sortParam}
                      onChange={handleSortChange}
                      className="appearance-none bg-gray-50 border border-gray-200 text-sm py-2 pl-3 pr-8 rounded focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                    >
                      <option value="newest">Newest</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="name_asc">Name: A to Z</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid Container */}
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 xl:px-12 mt-8">
        <main className="w-full">
          {/* Product Grid/List */}
          {loading ? (
            <div className={`grid gap-4 sm:gap-6 md:gap-10 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse flex flex-col">
                  <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg border border-gray-100">
              <h3 className="text-xl font-bold text-primary mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your filters or category selection.</p>
            </div>
          ) : (
            <motion.div layout className={`grid gap-4 sm:gap-6 md:gap-10 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
              <AnimatePresence mode="popLayout">
                {products.map(product => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    key={product.id}
                    className={`group ${viewMode === 'list' ? 'flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white p-4 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300' : 'flex flex-col gap-0 bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md md:hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 h-full pb-4 md:pb-5'}`}
                  >
                    <Link to={`/products/${product.slug}`} className={`relative overflow-hidden bg-gray-50 block ${viewMode === 'list' ? 'w-full sm:w-1/3 aspect-[4/3] sm:aspect-square rounded-xl' : 'w-full aspect-[4/3] mb-3 md:mb-5'}`}>
                      {product.images && product.images.length > 0 ? (
                        <>
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          {product.images[1] && (
                            <img
                              src={product.images[1].url}
                              alt={product.name}
                              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                            />
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                      )}
                    </Link>

                    <div className={`${viewMode === 'list' ? 'flex flex-col justify-center flex-1' : 'flex flex-col flex-1 justify-start px-4 md:px-5'}`}>
                      <Link to={`/products/${product.slug}`} className="hover:text-accent transition-colors">
                        <h3 className={`font-bold text-primary ${viewMode === 'list' ? 'text-lg sm:text-2xl mb-1 sm:mb-2 line-clamp-2 sm:line-clamp-none' : 'text-sm md:text-lg leading-snug md:truncate mb-1 line-clamp-2 md:line-clamp-1'}`}>{product.name}</h3>
                      </Link>
                      {product.category && (
                        <span className="text-[11px] sm:text-sm text-gray-500 mb-1.5 sm:mb-2 block">{product.category.name}</span>
                      )}

                      {viewMode === 'list' && (
                        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                          {product.overview?.replace(/<[^>]+>/g, '') || 'No description available.'}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-auto">
                        <div className={`flex items-center gap-1.5 sm:gap-2 ${viewMode === 'list' ? 'flex-row' : 'flex-col items-start gap-0.5'}`}>
                          {product.basePrice ? (
                            <>
                              <span className={`font-semibold text-[#1a1a1a] ${viewMode === 'list' ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'}`}>
                                {product.discountPercentage > 0
                                  ? `৳ ${(product.basePrice * (1 - product.discountPercentage / 100)).toLocaleString()}`
                                  : `৳ ${product.basePrice.toLocaleString()}`
                                }
                              </span>
                              {product.discountPercentage > 0 && (
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <span className="text-[10px] sm:text-xs text-gray-400 line-through">৳ {product.basePrice.toLocaleString()}</span>
                                  <span className="text-[9px] sm:text-[10px] bg-red-100 text-red-600 font-bold px-1 sm:px-1.5 py-0.5 rounded">-{product.discountPercentage}%</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <span className={`font-semibold text-[#1a1a1a] ${viewMode === 'list' ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'}`}>
                              {product.priceDisplay || `$${product.price}`}
                            </span>
                          )}
                        </div>
                        {viewMode === 'list' && (
                          <Link to={`/products/${product.slug}`} className="btn btn-outline btn-sm rounded-lg hidden sm:flex">
                            View Details
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center mt-12">
              {/* Mobile: Prev / Page X of Y / Next */}
              <nav className="flex sm:hidden items-center gap-4">
                <button
                  disabled={pageParam === 1}
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('page', (pageParam - 1).toString());
                    setSearchParams(newParams);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 font-medium hover:border-accent hover:text-accent disabled:opacity-50 transition-colors"
                >
                  Prev
                </button>
                <span className="text-sm font-medium text-gray-700">
                  {pageParam} / {totalPages}
                </span>
                <button
                  disabled={pageParam === totalPages}
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('page', (pageParam + 1).toString());
                    setSearchParams(newParams);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 font-medium hover:border-accent hover:text-accent disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </nav>

              {/* Desktop: Full pagination with truncated page numbers */}
              <nav className="hidden sm:flex items-center gap-2">
                <button
                  disabled={pageParam === 1}
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('page', (pageParam - 1).toString());
                    setSearchParams(newParams);
                  }}
                  className="w-10 h-10 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:text-accent hover:border-accent disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-colors"
                >
                  &laquo;
                </button>
                {(() => {
                  const pages: (number | string)[] = [];
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (pageParam > 3) pages.push('...');
                    for (let i = Math.max(2, pageParam - 1); i <= Math.min(totalPages - 1, pageParam + 1); i++) {
                      pages.push(i);
                    }
                    if (pageParam < totalPages - 2) pages.push('...');
                    pages.push(totalPages);
                  }
                  return pages.map((pageNum, idx) =>
                    typeof pageNum === 'string' ? (
                      <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-400">…</span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => {
                          const newParams = new URLSearchParams(searchParams);
                          newParams.set('page', pageNum.toString());
                          setSearchParams(newParams);
                        }}
                        className={`w-10 h-10 rounded font-medium flex items-center justify-center transition-colors ${pageParam === pageNum
                            ? 'bg-accent text-white'
                            : 'border border-gray-200 text-gray-500 hover:text-accent hover:border-accent'
                          }`}
                      >
                        {pageNum}
                      </button>
                    )
                  );
                })()}
                <button
                  disabled={pageParam === totalPages}
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('page', (pageParam + 1).toString());
                    setSearchParams(newParams);
                  }}
                  className="w-10 h-10 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:text-accent hover:border-accent disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-colors"
                >
                  &raquo;
                </button>
              </nav>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
