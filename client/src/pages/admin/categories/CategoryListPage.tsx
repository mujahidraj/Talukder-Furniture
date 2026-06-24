import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, ChevronRight, ChevronDown, X, CornerDownRight } from 'lucide-react';
import api from '../../../lib/api';

export default function CategoryListPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCats, setExpandedCats] = useState<Record<number, boolean>>({});
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newSubCategory, setNewSubCategory] = useState({ name: '', parentId: '' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
      // Expand all by default
      const expanded: Record<number, boolean> = {};
      data.forEach((c: any) => { expanded[c.id] = true; });
      setExpandedCats(expanded);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setNewSubCategory({ name: cat.name, parentId: cat.parentId ? cat.parentId.toString() : '' });
    setShowModal(true);
  };

  const handleAddSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, {
          name: newSubCategory.name,
          parentId: newSubCategory.parentId ? parseInt(newSubCategory.parentId, 10) : null,
        });
      } else {
        await api.post('/categories', {
          name: newSubCategory.name,
          parentId: newSubCategory.parentId ? parseInt(newSubCategory.parentId, 10) : null,
        });
      }
      setShowModal(false);
      setEditingId(null);
      setNewSubCategory({ name: '', parentId: '' });
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert(`Failed to ${editingId ? 'edit' : 'add'} sub-category`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, isMain: boolean) => {
    const msg = isMain 
      ? 'Are you sure you want to delete this main category? WARNING: This will also delete all sub-categories and ALL PRODUCTS within them!' 
      : 'Are you sure you want to delete this sub-category? WARNING: This will also delete ALL PRODUCTS within it!';
      
    if (window.confirm(msg)) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories();
      } catch (err: any) {
        console.error(err);
        alert(`Failed to delete: ${err.response?.data?.error || err.message}`);
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">Categories</h1>
          <p className="text-sm text-gray-500">Manage product sub-categories under main collections.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setEditingId(null); setNewSubCategory({ name: '', parentId: '' }); setShowModal(true); }}
            className="btn btn-outline text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add Main Category
          </button>
          <button 
            onClick={() => { setEditingId(null); setNewSubCategory({ name: '', parentId: categories[0]?.id?.toString() || '' }); setShowModal(true); }}
            className="btn btn-primary text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add Sub-Category
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between">
          <div className="relative w-full sm:w-96">
            <input 
              type="text" 
              placeholder="Search categories..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold w-1/3">Name</th>
                <th className="p-4 font-semibold">Slug</th>
                <th className="p-4 font-semibold">Products</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center animate-pulse">Loading categories...</td></tr>
              ) : categories.map((cat) => (
                <React.Fragment key={cat.id}>
                  {/* Main Category Row */}
                  <tr className="bg-gray-50/50 hover:bg-gray-50 transition-colors group">
                    <td className="p-4 font-semibold text-primary flex items-center gap-2 cursor-pointer select-none" onClick={() => toggleExpand(cat.id)}>
                      {expandedCats[cat.id] ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                      {cat.name} <span className="text-xs font-normal text-gray-400 ml-2">({cat.children?.length || 0} sub-categories)</span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{cat.slug}</td>
                    <td className="p-4 text-sm font-medium text-gray-700">
                      <span className="bg-blue-50 text-blue-700 py-1 px-2.5 rounded-full">{cat.totalProducts || 0}</span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(cat); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Edit size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(cat.id, true); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>

                  {/* Sub Categories Rows */}
                  {expandedCats[cat.id] && cat.children?.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-4 pl-12 text-gray-700 flex items-center gap-3">
                        <CornerDownRight size={16} className="text-gray-300" />
                        {sub.name}
                      </td>
                      <td className="p-4 text-sm text-gray-500">{sub.slug}</td>
                      <td className="p-4 text-sm font-medium text-gray-700">
                        <span className="bg-gray-100 text-gray-700 py-1 px-2.5 rounded-full">{sub._count?.products || 0}</span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {sub.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(sub)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(sub.id, false)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Sub-Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-primary">
                {editingId 
                  ? (newSubCategory.parentId ? 'Edit Sub-Category' : 'Edit Main Category') 
                  : (newSubCategory.parentId !== '' ? 'Add Sub-Category' : 'Add Main Category')}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubCategory} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category (Leave empty for Main Category)</label>
                  <select
                    value={newSubCategory.parentId}
                    onChange={(e) => setNewSubCategory({...newSubCategory, parentId: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                  >
                    <option value="">None (Main Category)</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={newSubCategory.name}
                    onChange={(e) => setNewSubCategory({...newSubCategory, name: e.target.value})}
                    placeholder="e.g. Office Chairs"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
