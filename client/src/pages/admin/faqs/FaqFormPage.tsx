import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../../lib/api';

export default function FaqFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    groupName: '',
    question: '',
    answer: '',
    order: 0,
  });

  useEffect(() => {
    if (isEdit) {
      const fetchFaq = async () => {
        try {
          const { data } = await api.get(`/faqs/${id}`);
          setFormData({
            groupName: data.groupName || '',
            question: data.question || '',
            answer: data.answer || '',
            order: data.order || 0,
          });
        } catch (err) {
          console.error(err);
          alert('Failed to fetch FAQ details');
          navigate('/admin/faqs');
        } finally {
          setLoading(false);
        }
      };
      fetchFaq();
    }
  }, [id, navigate, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (isEdit) {
        await api.put(`/faqs/${id}`, formData);
      } else {
        await api.post('/faqs', formData);
      }
      navigate('/admin/faqs');
    } catch (err) {
      console.error(err);
      alert(`Failed to ${isEdit ? 'update' : 'create'} FAQ`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center animate-pulse">Loading FAQ data...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/faqs')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-primary">
              {isEdit ? 'Edit FAQ' : 'Add New FAQ'}
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
            <input
              type="text"
              name="question"
              required
              value={formData.question}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              placeholder="e.g. What is your return policy?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group / Category *</label>
            <input
              type="text"
              name="groupName"
              required
              value={formData.groupName}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              placeholder="e.g. Orders & Returns"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Answer *</label>
            <textarea
              name="answer"
              required
              value={formData.answer}
              onChange={handleChange}
              rows={6}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-y"
              placeholder="Provide a detailed and helpful answer..."
            />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save FAQ'}
          </button>
        </div>
      </form>
    </div>
  );
}
