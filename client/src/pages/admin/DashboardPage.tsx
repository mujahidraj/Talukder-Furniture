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
  Star
} from 'lucide-react';
import api from '../../lib/api';

export default function DashboardPage() {
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
        <button onClick={fetchStats} className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Products', value: stats.totalProducts, icon: Package, change: stats.productsChange, isPositive: true },
    { title: 'New Inquiries', value: stats.totalLeads, icon: MessageSquare, change: stats.leadsChange, isPositive: true },
    { title: 'Product Views', value: stats.totalViews.toLocaleString(), icon: Eye, change: stats.viewsChange, isPositive: true },
    { title: 'Inquiry Rate', value: stats.inquiryRate, icon: TrendingUp, change: stats.inquiryRateChange, isPositive: true },
    { title: 'Categories', value: stats.totalCategories, icon: Grid, change: 0, isPositive: true },
    { title: 'Physical Stores', value: stats.totalStores, icon: Store, change: 0, isPositive: true },
    { title: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, change: 0, isPositive: true },
    { title: 'Featured Products', value: stats.featuredProducts, icon: Star, change: 0, isPositive: true },
  ];

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-primary mb-8">Dashboard Overview</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-gray-50 text-accent">
                  <Icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  <span>{Math.abs(stat.change)}%</span>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
            </div>
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
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-primary text-lg">Most Viewed Products</h2>
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
    </div>
  );
}
