import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  DollarSign,
  Image,
  FileText,
  Palette,
  Hash,
  ExternalLink,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react';
import api from '../../../lib/api';

interface IncompleteProduct {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  category: string;
  isActive: boolean;
  missingFields: string[];
  missingCount: number;
  updatedAt: string;
}

const FIELD_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  Price: { icon: DollarSign, color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Missing Price' },
  Images: { icon: Image, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', label: 'No Images' },
  Overview: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', label: 'No Overview' },
  Materials: { icon: Palette, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', label: 'No Materials' },
  SKU: { icon: Hash, color: 'text-gray-600', bg: 'bg-gray-100 border-gray-300', label: 'Missing SKU' },
};

const ALL_FIELDS = ['Price', 'Images', 'Overview', 'Materials', 'SKU'];

export default function IncompleteProductsPage() {
  const [data, setData] = useState<{ total: number; products: IncompleteProduct[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState<string>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/admin/dashboard/incomplete-products')
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load incomplete products'))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = data?.products?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterField === 'all' || p.missingFields.includes(filterField);
    return matchesSearch && matchesFilter;
  }) || [];

  const fieldCounts = ALL_FIELDS.reduce((acc, field) => {
    acc[field] = data?.products?.filter(p => p.missingFields.includes(field)).length || 0;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-12 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">Incomplete Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data?.total || 0} products with missing information
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {ALL_FIELDS.map(field => {
          const config = FIELD_CONFIG[field];
          const Icon = config.icon;
          const isActive = filterField === field;
          return (
            <button
              key={field}
              onClick={() => setFilterField(isActive ? 'all' : field)}
              className={`p-3 rounded-xl border text-center transition-all hover:shadow-md cursor-pointer ${
                isActive ? `${config.bg} ring-2 ring-offset-1 ring-current ${config.color}` : 'border-gray-100 bg-white'
              }`}
            >
              <div className={`inline-flex p-2 rounded-full ${isActive ? '' : config.bg.split(' ')[0]} ${config.color} mb-2`}>
                <Icon size={16} />
              </div>
              <div className={`text-xl font-bold ${fieldCounts[field] > 0 ? 'text-primary' : 'text-gray-300'}`}>
                {fieldCounts[field]}
              </div>
              <div className="text-xs text-gray-500 font-medium">{config.label}</div>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name, category, or SKU..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            <Filter size={16} />
            {filterField === 'all' ? 'All Issues' : FIELD_CONFIG[filterField]?.label}
            <ChevronDown size={14} />
          </button>
          {showFilterDropdown && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-10 min-w-[180px]">
              <button
                onClick={() => { setFilterField('all'); setShowFilterDropdown(false); }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${filterField === 'all' ? 'font-semibold text-accent' : 'text-gray-700'}`}
              >
                All Issues ({data?.total || 0})
              </button>
              {ALL_FIELDS.map(field => (
                <button
                  key={field}
                  onClick={() => { setFilterField(field); setShowFilterDropdown(false); }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${filterField === field ? 'font-semibold text-accent' : 'text-gray-700'}`}
                >
                  <span>{FIELD_CONFIG[field].label}</span>
                  <span className="text-xs text-gray-400">{fieldCounts[field]}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500 mb-4">
        Showing {filteredProducts.length} of {data?.total || 0} incomplete products
        {filterField !== 'all' && (
          <button onClick={() => setFilterField('all')} className="ml-2 text-accent hover:underline">
            Clear filter
          </button>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-semibold text-sm text-gray-600">Product</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Category</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Status</th>
                <th className="p-4 font-semibold text-sm text-gray-600">Missing Data</th>
                <th className="p-4 font-semibold text-sm text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div>
                      <h4 className="font-semibold text-primary text-sm">{product.name}</h4>
                      <span className="text-xs text-gray-400">
                        {product.sku ? `SKU: ${product.sku}` : 'No SKU'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-600">{product.category}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      product.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {product.missingFields.map((field: string) => {
                        const config = FIELD_CONFIG[field];
                        if (!config) return null;
                        const FieldIcon = config.icon;
                        return (
                          <span key={field} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.color}`}>
                            <FieldIcon size={12} />
                            {field}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      to={`/admin/products/${product.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors"
                    >
                      Fix Now
                      <ExternalLink size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    <AlertTriangle size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No incomplete products found</p>
                    <p className="text-sm mt-1">
                      {searchTerm || filterField !== 'all'
                        ? 'Try adjusting your search or filter'
                        : 'All products have complete data! 🎉'
                      }
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
