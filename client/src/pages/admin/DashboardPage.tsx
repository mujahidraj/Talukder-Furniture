import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  MessageSquare, 
  TrendingUp, 
  Eye, 
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Grid,
  Store,
  Briefcase,
  Star,
  UploadCloud,
  Layers,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Image,
  FileText,
  DollarSign,
  Hash,
  Palette
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import useAuthStore from '../../stores/useAuthStore';

export default function DashboardPage() {
  const { admin } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = () => {
    setLoading(true);
    setError(null);
    api.get('/admin/dashboard')
      .then(res => {
        setStats(res.data);
      })
      .catch(err => {
        console.error('Failed to load dashboard stats:', err);
        setError(err.response?.status === 429 ? 'Too many requests. Please try again later.' : 'Failed to load dashboard stats');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-gray-200 rounded-xl"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{error || 'Something went wrong'}</p>
        <button onClick={fetchStats} className="px-4 py-2 bg-accent text-white rounded hover:bg-[#E51C2A] transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Products', value: stats.totalProducts, icon: Package, change: stats.productsChange, isPositive: true, link: '/admin/products' },
    { title: 'Active Products', value: stats.activeProducts, icon: CheckCircle, change: 0, isPositive: true, accent: 'text-emerald-500', accentBg: 'bg-emerald-50', link: '/admin/products?status=active' },
    { title: 'Inactive Products', value: stats.inactiveProducts, icon: XCircle, change: 0, isPositive: false, accent: 'text-red-500', accentBg: 'bg-red-50', link: '/admin/products?status=inactive' },
    { title: 'Incomplete Data', value: stats.incompleteProducts, icon: AlertTriangle, change: 0, isPositive: false, accent: 'text-amber-500', accentBg: 'bg-amber-50', link: '/admin/products/incomplete' },
    { title: 'New Inquiries', value: stats.totalLeads, icon: MessageSquare, change: stats.leadsChange, isPositive: true, link: '/admin/leads' },
    { title: 'Product Views', value: stats.totalViews.toLocaleString(), icon: Eye, change: stats.viewsChange, isPositive: true, link: '/admin/products' },
    { title: 'Inquiry Rate', value: stats.inquiryRate, icon: TrendingUp, change: stats.inquiryRateChange, isPositive: true, link: '/admin/leads' },
    { title: 'Categories', value: stats.totalCategories, icon: Grid, change: 0, isPositive: true, link: '/admin/categories' },
    { title: 'Physical Stores', value: stats.totalStores, icon: Store, change: 0, isPositive: true, link: '/admin/stores' },
    { title: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, change: 0, isPositive: true, link: '/admin/jobs' },
    { title: 'Featured Products', value: stats.featuredProducts, icon: Star, change: 0, isPositive: true, link: '/admin/products?featured=true' },
    { title: 'Total Sets', value: stats.totalSets || 0, icon: Layers, change: 0, isPositive: true, link: '/admin/sets' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-primary mb-8">Dashboard Overview</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          const iconColor = (stat as any).accent || 'text-accent';
          const iconBg = (stat as any).accentBg || 'bg-gray-50';
          return (
            <Link key={idx} to={(stat as any).link || '/admin'} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${iconBg} ${iconColor} group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                {stat.change !== 0 && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    <span>{Math.abs(stat.change)}%</span>
                  </div>
                )}
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Leads */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-primary text-lg">Recent Inquiries</h2>
            <button className="text-sm text-accent hover:text-primary font-medium transition-colors">View All</button>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recentLeads.map((lead: any) => (
              <div key={lead.id} className="p-6 flex items-start justify-between hover:bg-gray-50 transition-colors">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold flex-shrink-0">
                    {lead.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">{lead.name}</h4>
                    <p className="text-sm text-gray-500 mb-1">{lead.email}</p>
                    <p className="text-sm text-gray-700 font-medium">Sub: {lead.subject}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(lead.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-primary text-lg">Most Viewed Products</h2>
            <Link to="/admin/products" className="text-sm text-accent hover:text-primary font-medium transition-colors">View All</Link>
          </div>
          <div className="p-6 space-y-6">
            {stats.topProducts.map((product: any, idx: number) => (
              <div key={product.id} className="flex items-center gap-4">
                <div className="text-2xl font-bold text-gray-200">0{idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-primary truncate">{product.name}</h4>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                <div className="text-sm font-medium text-accent">
                  {product.views.toLocaleString()} <span className="text-gray-400 text-xs">views</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Data Health Widget */}
      {stats.missingDataBreakdown && (
        <div className="mt-8 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-500">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="font-bold text-primary text-lg">Product Data Health</h2>
                <p className="text-sm text-gray-500">Products missing important information</p>
              </div>
            </div>
            <Link to="/admin/products/incomplete" className="text-sm text-accent hover:text-primary font-medium transition-colors">Fix Products →</Link>
          </div>
          <div className="p-6">
            {/* Overall completeness bar */}
            {(() => {
              const complete = stats.totalProducts > 0
                ? Math.round(((stats.totalProducts - stats.incompleteProducts) / stats.totalProducts) * 100)
                : 100;
              return (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Completeness</span>
                    <span className={`text-sm font-bold ${complete >= 80 ? 'text-emerald-600' : complete >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                      {complete}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${complete >= 80 ? 'bg-emerald-500' : complete >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${complete}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {stats.totalProducts - stats.incompleteProducts} of {stats.totalProducts} products have complete data
                  </p>
                </div>
              );
            })()}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Missing Price', count: stats.missingDataBreakdown.missingPrice, icon: DollarSign, color: 'text-red-500', bg: 'bg-red-50' },
                { label: 'No Images', count: stats.missingDataBreakdown.missingImages, icon: Image, color: 'text-orange-500', bg: 'bg-orange-50' },
                { label: 'No Overview', count: stats.missingDataBreakdown.missingOverview, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'No Materials', count: stats.missingDataBreakdown.missingMaterials, icon: Palette, color: 'text-purple-500', bg: 'bg-purple-50' },
                { label: 'Missing SKU', count: stats.missingDataBreakdown.missingSku, icon: Hash, color: 'text-gray-500', bg: 'bg-gray-50' },
              ].map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <div key={idx} className={`p-4 rounded-xl border ${item.count > 0 ? 'border-gray-200' : 'border-gray-100'} flex flex-col items-center text-center transition-all hover:shadow-md`}>
                    <div className={`p-2.5 rounded-full ${item.bg} ${item.color} mb-3`}>
                      <ItemIcon size={18} />
                    </div>
                    <span className={`text-2xl font-bold ${item.count > 0 ? 'text-primary' : 'text-gray-300'}`}>{item.count}</span>
                    <span className="text-xs text-gray-500 mt-1 font-medium">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Second Row of Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-6 flex flex-col">
          <h2 className="font-bold text-primary text-lg mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <Link to="/admin/products/new" className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100 text-center group">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <Package size={20} className="text-accent" />
              </div>
              <span className="text-sm font-medium text-primary">Add Product</span>
            </Link>
            {admin?.role === 'SUPER_ADMIN' && (
              <Link to="/admin/products/bulk-import" className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100 text-center group">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud size={20} className="text-blue-500" />
                </div>
                <span className="text-sm font-medium text-primary">Bulk Import</span>
              </Link>
            )}
            <Link to="/admin/leads" className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100 text-center group">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <MessageSquare size={20} className="text-green-500" />
              </div>
              <span className="text-sm font-medium text-primary">View Leads</span>
            </Link>
            {admin?.role === 'SUPER_ADMIN' && (
              <Link to="/admin/users" className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100 text-center group">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <Users size={20} className="text-purple-500" />
                </div>
                <span className="text-sm font-medium text-primary">Manage Users</span>
              </Link>
            )}
          </div>
        </div>

        {/* Recent Products */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-primary text-lg">Recently Added Products</h2>
            <Link to="/admin/products" className="text-sm text-accent hover:text-primary font-medium transition-colors">View All</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recentProducts?.map((product: any) => (
              <div key={product.id} className="p-4 px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Package size={20} className="text-gray-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">{product.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">{product.sku || 'No SKU'}</span>
                      <span className="text-xs text-gray-500">{product.category}</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">
                  {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {(!stats.recentProducts || stats.recentProducts.length === 0) && (
              <div className="p-6 text-center text-gray-500">No products added yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Third Row: Recent Bulk Imports */}
      {admin?.role === 'SUPER_ADMIN' && (
        <div className="mt-8 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-primary text-lg">Recent Bulk Imports</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-sm text-gray-600">File Name</th>
                  <th className="p-4 font-semibold text-sm text-gray-600">Status</th>
                  <th className="p-4 font-semibold text-sm text-gray-600">Imported</th>
                  <th className="p-4 font-semibold text-sm text-gray-600">Failed</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentImports?.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-primary">{log.fileName}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.status === 'completed' && log.failCount === 0 ? 'bg-green-100 text-green-700' :
                        log.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-green-600 font-medium">{log.successCount}</td>
                    <td className="p-4 text-sm text-red-600 font-medium">{log.failCount}</td>
                    <td className="p-4 text-sm text-gray-500 text-right">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {(!stats.recentImports || stats.recentImports.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">No recent imports found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
