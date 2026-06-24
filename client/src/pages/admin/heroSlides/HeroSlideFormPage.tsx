import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Loader2, Save } from 'lucide-react';
import api from '../../../lib/api';

export default function HeroSlideFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [order, setOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      fetchSlide(id);
    }
  }, [id]);

  const fetchSlide = async (slideId: string) => {
    try {
      const res = await api.get(`/hero-slides/${slideId}`);
      const s = res.data;
      setTitle(s.title || '');
      setSubtitle(s.subtitle || '');
      setCtaText(s.ctaText || '');
      setCtaLink(s.ctaLink || '');
      setOrder(s.order?.toString() || '0');
      setIsActive(s.isActive);
      setImageUrl(s.imageUrl || '');
    } catch (err) {
      console.error(err);
      alert('Failed to fetch slide');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEdit && !imageFile && !imageUrl) {
      alert('An image is required for the slide.');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      if (title) formData.append('title', title);
      if (subtitle) formData.append('subtitle', subtitle);
      if (ctaText) formData.append('ctaText', ctaText);
      if (ctaLink) formData.append('ctaLink', ctaLink);
      formData.append('order', order);
      formData.append('isActive', isActive.toString());

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      }

      if (isEdit) {
        await api.put(`/hero-slides/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/hero-slides', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      navigate('/admin/hero-slides');
    } catch (err) {
      console.error(err);
      alert('Failed to save slide');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/hero-slides" className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">{isEdit ? 'Edit Slide' : 'Add New Slide'}</h1>
          <p className="text-sm text-gray-500">{isEdit ? 'Update banner details.' : 'Upload a new hero banner.'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Slide Image (Required)</label>
          <div className="flex items-start gap-6">
            <div className="w-64 h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
              {imageUrl ? (
                <img 
                  src={imageUrl.startsWith('blob:') || imageUrl.startsWith('http') ? imageUrl : `${import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:5000'}${imageUrl}`} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">1200x600 recommended</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <div className="flex-1 text-sm text-gray-500">
              <p className="mb-2 font-medium text-gray-700">Image Guidelines:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>High resolution (e.g. 1920x800)</li>
                <li>Landscape orientation</li>
                <li>Keep main subjects centered</li>
                <li>Max file size: 5MB</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              type="text" 
              value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="e.g. Talukder Bedroom Set"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <input 
              type="text" 
              value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="e.g. Comfort and style meet to blissful perfection"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
            <input 
              type="text" 
              value={ctaText} onChange={(e) => setCtaText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="e.g. Explore Collection"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Link</label>
            <input 
              type="text" 
              value={ctaLink} onChange={(e) => setCtaLink(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="e.g. /shop?category=bedroom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
            <input 
              type="number" 
              value={order} onChange={(e) => setOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div className="flex items-center mt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Slide is Active</span>
            </label>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
          <Link to="/admin/hero-slides" className="btn btn-outline text-sm">Cancel</Link>
          <button type="submit" disabled={saving} className="btn bg-black text-white hover:bg-gray-900 text-sm flex items-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isEdit ? 'Update Slide' : 'Create Slide'}
          </button>
        </div>

      </form>
    </div>
  );
}
