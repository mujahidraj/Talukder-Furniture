import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Filter } from 'lucide-react';
import api from '../../../lib/api';

export default function SetListPage() {
  const [sets, setSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    fetchSets();
  }, [search, currentPage]); 

  const fetchSets = async () => {
    setLoading(true);
    try {
      let url = `/sets?admin=true&q=${search}&limit=20&page=${currentPage}`;
      
      const res = await api.get(url);
      setSets(res.data.sets || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalResults(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this set?')) return;
    try {
      await api.delete(`/sets/${id}`);
      setSets(sets.filter(s => s.id !== id));
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete set.');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} sets?`)) return;
    try {
      await api.post('/sets/bulk-delete', { ids: selectedIds });
      setSelectedIds([]);
      if (selectedIds.length === sets.length && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchSets();
      }
    } catch (err: any) {
      console.error(err);
      alert(`Failed to bulk delete sets: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">Sets (Collections)</h1>
          <p className="text-sm text-gray-500">Manage your product bundles and collections.</p>
        </div>
        <div className="flex gap-3">
          {selectedIds.length > 0 && (
            <button onClick={handleBulkDelete} className="btn bg-red-600 text-white hover:bg-red-700 text-sm flex items-center gap-2">
              <Trash2 size={16} /> Delete ({selectedIds.length})
            </button>
          )}
          <Link to="/admin/sets/new" className="btn btn-primary text-sm flex items-center gap-2">
            <Plus size={16} /> Create Set
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full md:w-96 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search sets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    checked={sets.length > 0 && selectedIds.length === sets.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(sets.map(s => s.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-4">Set Details</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p>Loading sets...</p>
                    </div>
                  </td>
                </tr>
              ) : sets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No sets found matching your criteria.
                  </td>
                </tr>
              ) : (
                sets.map((set) => (
                  <tr key={set.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        checked={selectedIds.includes(set.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds([...selectedIds, set.id]);
                          } else {
                            setSelectedIds(selectedIds.filter(id => id !== set.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {set.imageUrl ? (
                            <img src={set.imageUrl} alt={set.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-gray-400 text-xs">No img</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-primary max-w-[200px] sm:max-w-[300px] truncate" title={set.name}>
                            {set.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {set.category?.name || 'Uncategorized'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {set.basePrice ? `৳${set.basePrice.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        set.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {set.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/sets/${set.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                          title="Edit Set"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(set.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Set"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 text-sm">
            <div className="text-gray-500">
              Showing <span className="font-medium text-primary">{(currentPage - 1) * 20 + 1}</span> to <span className="font-medium text-primary">{Math.min(currentPage * 20, totalResults)}</span> of <span className="font-medium text-primary">{totalResults}</span> sets
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
