import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../../lib/api';

export default function StoreListPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStores = async () => {
    try {
      const { data } = await api.get('/stores');
      setStores(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      try {
        await api.delete(`/stores/${id}`);
        fetchStores();
      } catch (err) {
        console.error(err);
        alert('Failed to delete store');
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">Stores</h1>
          <p className="text-sm text-gray-500">Manage physical store locations and contact details.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/admin/stores/new"
            className="btn btn-primary text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add Store
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Store Details</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold text-center">Order</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center animate-pulse text-gray-500">Loading stores...</td></tr>
              ) : stores.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No stores found.</td></tr>
              ) : stores.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {store.imageUrl ? (
                        <img src={store.imageUrl} alt={store.name} className="w-12 h-12 rounded object-cover border border-gray-200" />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center border border-gray-200">
                          <MapPin size={20} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{store.name}</div>
                        <div className="text-sm text-gray-500 line-clamp-1 max-w-[250px]">{store.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      {store.phone && <div className="flex items-center gap-1 text-gray-600"><Phone size={12} /> {store.phone}</div>}
                      {store.email && <div className="text-gray-500 mt-0.5">{store.email}</div>}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-sm font-medium text-gray-600">{store.order}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${store.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {store.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/stores/${store.id}/edit`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                        <Edit size={16} />
                      </Link>
                      <button onClick={() => handleDelete(store.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
