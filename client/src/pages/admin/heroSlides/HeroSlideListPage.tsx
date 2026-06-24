import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../../lib/api';

export default function HeroSlideListPage() {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const res = await api.get('/hero-slides');
      setSlides(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;
    try {
      await api.delete(`/hero-slides/${id}`);
      setSlides(slides.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete slide.');
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const res = await api.put(`/hero-slides/${id}`, { isActive: !currentStatus });
      setSlides(slides.map(s => s.id === id ? res.data : s));
    } catch (err) {
      console.error(err);
      alert('Failed to toggle status.');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">Hero Slides</h1>
          <p className="text-sm text-gray-500">Manage the homepage banner slides.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/hero-slides/new" className="btn bg-black text-white hover:bg-gray-900 text-sm flex items-center gap-2 transition-colors">
            <Plus size={16} /> Add Slide
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold w-24">Image</th>
                <th className="p-4 font-semibold">Details</th>
                <th className="p-4 font-semibold">Order</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : slides.length > 0 ? (
                slides.map((slide) => (
                  <tr key={slide.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <div className="w-20 h-12 rounded overflow-hidden bg-gray-100">
                        <img src={slide.imageUrl.startsWith('http') ? slide.imageUrl : `${import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:5000'}${slide.imageUrl}`} alt={slide.title || 'Slide'} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-primary">{slide.title || '(No Title)'}</p>
                      {slide.subtitle && <p className="text-sm text-gray-500">{slide.subtitle}</p>}
                      {slide.ctaText && <span className="inline-block mt-1 text-xs bg-gray-100 px-2 py-0.5 rounded">{slide.ctaText} &rarr; {slide.ctaLink}</span>}
                    </td>
                    <td className="p-4 text-sm font-medium">{slide.order}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleToggleActive(slide.id, slide.isActive)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          slide.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {slide.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/admin/hero-slides/${slide.id}/edit`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(slide.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No slides found. Click "Add Slide" to create your first banner.
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
