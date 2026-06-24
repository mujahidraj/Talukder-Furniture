import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../../lib/api';

export default function FaqListPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFaqs = async () => {
    try {
      const { data } = await api.get('/faqs');
      setFaqs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await api.delete(`/faqs/${id}`);
        fetchFaqs();
      } catch (err) {
        console.error(err);
        alert('Failed to delete FAQ');
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">Frequently Asked Questions</h1>
          <p className="text-sm text-gray-500">Manage FAQs displayed on the website.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/admin/faqs/new"
            className="btn btn-primary text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Add New FAQ
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Question</th>
                <th className="p-4 font-semibold">Group / Category</th>
                <th className="p-4 font-semibold text-center">Order</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center animate-pulse text-gray-500">Loading FAQs...</td></tr>
              ) : faqs.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No FAQs found.</td></tr>
              ) : faqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{faq.question}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">{faq.answer}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Tag size={14} className="text-gray-400" />
                      {faq.groupName}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                      {faq.order}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/faqs/${faq.id}/edit`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                        <Edit size={16} />
                      </Link>
                      <button onClick={() => handleDelete(faq.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete">
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
