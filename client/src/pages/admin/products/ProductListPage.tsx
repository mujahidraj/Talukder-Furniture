import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Filter, Eye } from 'lucide-react';
import api from '../../../lib/api';

export default function ProductListPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFeatured, setFilterFeatured] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [sort, search, filterStatus, filterFeatured, filterCategory, currentPage]); 

  useEffect(() => {
    api.get('/categories').then(res => {
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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/products?admin=true&sort=${sort}&q=${search}&limit=20&page=${currentPage}`;
      if (filterStatus !== 'all') url += `&status=${filterStatus}`;
      if (filterFeatured !== 'all') url += `&isFeatured=${filterFeatured}`;
      if (filterCategory !== 'all') url += `&category=${filterCategory}`;
      
      const res = await api.get(url);
      setProducts(res.data.products || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalResults(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete product.');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;
    try {
      await api.post('/products/bulk-delete', { ids: selectedIds });
      setSelectedIds([]);
      // If we deleted all items on the current page and we are not on the first page, go back one page
      if (selectedIds.length === products.length && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchProducts();
      }
    } catch (err: any) {
      console.error(err);
      alert(`Failed to bulk delete products: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">Products</h1>
          <p className="text-sm text-gray-500">Manage your catalog, pricing, and inventory.</p>
        </div>
        <div className="flex gap-3">
          {selectedIds.length > 0 && (
            <button onClick={handleBulkDelete} className="btn bg-red-600 text-white hover:bg-red-700 text-sm flex items-center gap-2">
              <Trash2 size={16} /> Delete ({selectedIds.length})
            </button>
          )}
          <Link to="/admin/products/bulk-import" className="btn btn-outline text-sm hidden sm:inline-flex">
            Bulk Import
          </Link>
          <Link to="/admin/products/new" className="btn bg-black text-white hover:bg-gray-900 text-sm flex items-center gap-2 transition-colors">
            <Plus size={16} /> Add Product
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col gap-4">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Search products by name or Product Code..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              className="border border-gray-200 rounded-lg text-sm px-3 py-2 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent flex-1 min-w-[140px]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setCurrentPage(1); }}
              className="border border-gray-200 rounded-lg text-sm px-3 py-2 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent flex-1 min-w-[140px]"
            >
              <option value="newest">Newest</option>
              <option value="views-desc">Views (High to Low)</option>
              <option value="views-asc">Views (Low to High)</option>
              <option value="enquiries-desc">Enquiries (High to Low)</option>
              <option value="enquiries-asc">Enquiries (Low to High)</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="border border-gray-200 rounded-lg text-sm px-3 py-2 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent flex-1 min-w-[120px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
            <select
              value={filterFeatured}
              onChange={(e) => { setFilterFeatured(e.target.value); setCurrentPage(1); }}
              className="border border-gray-200 rounded-lg text-sm px-3 py-2 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent flex-1 min-w-[130px]"
            >
              <option value="all">Any Featured</option>
              <option value="true">Featured Only</option>
            </select>
          </div>
        </div>

        {/* Desktop Table — hidden on mobile */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === products.length && products.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(products.map(p => p.id));
                      else setSelectedIds([]);
                    }}
                    className="rounded border-gray-300 text-accent focus:ring-accent"
                  />
                </th>
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Product Code</th>
                <th className="p-4 font-semibold">Discounted Price</th>
                <th className="p-4 font-semibold">Views</th>
                <th className="p-4 font-semibold">Enquiries</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="w-4 h-4 bg-gray-200 rounded"></div></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/3"></div></td>
                    <td className="p-4"><div className="h-6 bg-gray-200 rounded-full w-16"></div></td>
                    <td className="p-4"><div className="h-8 bg-gray-200 rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className={`hover:bg-gray-50 transition-colors group ${selectedIds.includes(product.id) ? 'bg-gray-50' : ''}`}>
                    <td className="p-4">
                      <input 
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds([...selectedIds, product.id]);
                          else setSelectedIds(selectedIds.filter(id => id !== product.id));
                        }}
                        className="rounded border-gray-300 text-accent focus:ring-accent"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400">No Img</div>
                          )}
                        </div>
                        <div>
                          <Link to={`/admin/products/${product.id}`} className="font-semibold text-primary hover:underline block">{product.name}</Link>
                          {product.isFeatured && <span className="text-[10px] uppercase tracking-wider text-accent font-bold">Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{product.sku}</td>
                    <td className="p-4 text-sm font-medium text-gray-900">
                      {product.basePrice 
                        ? (
                          <div className="flex flex-col">
                            {product.discountPercentage > 0 
                              ? <span>৳ {(product.basePrice * (1 - product.discountPercentage / 100)).toLocaleString()} <span className="text-xs text-red-500 font-bold ml-1">-{product.discountPercentage}%</span></span>
                              : <span>৳ {product.basePrice.toLocaleString()}</span>
                            }
                          </div>
                        )
                        : product.priceDisplay || '-'}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900 text-center">
                      <span className="bg-blue-50 text-blue-700 py-1 px-2.5 rounded-full">{product.viewCount || 0}</span>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900 text-center">
                      <span className="bg-purple-50 text-purple-700 py-1 px-2.5 rounded-full">{product.enquiryCount || 0}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/admin/products/${product.id}`} className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded" title="View Details">
                          <Eye size={16} />
                        </Link>
                        <Link to={`/admin/products/${product.id}/edit`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(product.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No products found. Add your first product to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View — visible only on mobile */}
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="p-4">
                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox"
                    checked={selectedIds.includes(product.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds([...selectedIds, product.id]);
                      else setSelectedIds(selectedIds.filter(id => id !== product.id));
                    }}
                    className="rounded border-gray-300 text-accent focus:ring-accent mt-1 flex-shrink-0"
                  />
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400">No Img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/admin/products/${product.id}`} className="font-semibold text-primary text-sm truncate block hover:underline">{product.name}</Link>
                    <p className="text-xs text-gray-500 mt-0.5">{product.sku || 'No SKU'}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">
                        {product.basePrice 
                          ? (product.discountPercentage > 0 
                              ? <>৳ {(product.basePrice * (1 - product.discountPercentage / 100)).toLocaleString()} <span className="text-[10px] text-red-500 font-bold">-{product.discountPercentage}%</span></>
                              : <>৳ {product.basePrice.toLocaleString()}</>
                            )
                          : product.priceDisplay || '-'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Draft'}
                      </span>
                      {product.isFeatured && <span className="text-[10px] uppercase tracking-wider text-accent font-bold">Featured</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                      <span className="bg-blue-50 text-blue-700 py-0.5 px-2 rounded-full font-medium">{product.viewCount || 0} views</span>
                      <span className="bg-purple-50 text-purple-700 py-0.5 px-2 rounded-full font-medium">{product.enquiryCount || 0} enquiries</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <Link to={`/admin/products/${product.id}`} className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg">
                      <Eye size={18} />
                    </Link>
                    <Link to={`/admin/products/${product.id}/edit`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit size={18} />
                    </Link>
                    <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No products found. Add your first product to get started.
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-100 text-sm text-gray-500">
          <div className="text-center sm:text-left mb-3 sm:mb-0">
            Showing {totalResults === 0 ? 0 : (currentPage - 1) * 20 + 1} to {Math.min(currentPage * 20, totalResults)} of {totalResults} results
          </div>
          {totalPages > 1 && (
            <>
              {/* Mobile: Simple Prev / Page X of Y / Next */}
              <div className="flex sm:hidden items-center justify-between mt-3">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  Prev
                </button>
                <span className="text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  Next
                </button>
              </div>

              {/* Desktop: Full pagination with page numbers */}
              <div className="hidden sm:flex items-center justify-end gap-1 mt-3">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  Prev
                </button>
                {(() => {
                  const pages: (number | string)[] = [];
                  if (totalPages <= 5) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (currentPage > 3) pages.push('...');
                    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                      pages.push(i);
                    }
                    if (currentPage < totalPages - 2) pages.push('...');
                    pages.push(totalPages);
                  }
                  return pages.map((pageNum, idx) =>
                    typeof pageNum === 'string' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-400">…</span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 border rounded transition-colors ${
                          currentPage === pageNum 
                            ? 'bg-black text-white border-black font-semibold' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  );
                })()}
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
