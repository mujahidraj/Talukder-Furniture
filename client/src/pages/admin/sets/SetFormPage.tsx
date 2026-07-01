import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, X, UploadCloud, Search } from 'lucide-react';
import api from '../../../lib/api';

export default function SetFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    basePrice: '',
    discountPercentage: '',
    isActive: true,
  });

  const [imageUrl, setImageUrl] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch categories
    api.get('/categories').then(res => setCategories(res.data)).catch(console.error);

    // Fetch products
    api.get('/products?admin=true&limit=1000')
      .then(res => setAvailableProducts(res.data.products || []))
      .catch(console.error);

    if (isEditing) {
      api.get(`/sets/admin/${id}`)
        .then(res => {
          const setItem = res.data;
          setFormData({
            name: setItem.name || '',
            categoryId: setItem.categoryId?.toString() || '',
            description: setItem.description || '',
            basePrice: setItem.basePrice?.toString() || '',
            discountPercentage: setItem.discountPercentage?.toString() || '',
            isActive: setItem.isActive ?? true,
          });
          setImageUrl(setItem.imageUrl || '');
          setImageUrls(setItem.imageUrls || []);
          if (setItem.products) {
            setSelectedProductIds(setItem.products.map((p: any) => p.id));
          }
        })
        .catch(err => {
          console.error(err);
          alert('Failed to load set');
          navigate('/admin/sets');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | boolean = value;
    if (name === 'isActive') {
      parsedValue = value === 'true';
    }

    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const handleProductToggle = (productId: number) => {
    setSelectedProductIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('folder', 'sets');

        const res = await api.post('/admin/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        newUrls.push(res.data.url);
      }
      
      setImageUrls(prev => {
        const updated = [...prev, ...newUrls];
        return updated;
      });
      
      if (!imageUrl && newUrls.length > 0) {
        setImageUrl(newUrls[0]);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      if (imageUrl === prev[index]) {
        setImageUrl(updated.length > 0 ? updated[0] : '');
      }
      return updated;
    });
  };

  const setPrimaryImage = (url: string) => {
    setImageUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    const payload = {
      ...formData,
      categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null,
      basePrice: formData.basePrice ? parseFloat(formData.basePrice) : null,
      discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : null,
      imageUrl,
      imageUrls,
      productIds: selectedProductIds,
    };

    try {
      if (isEditing) {
        await api.put(`/sets/${id}`, payload);
      } else {
        await api.post('/sets', payload);
      }
      navigate('/admin/sets');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.error || 'An error occurred while saving the set.');
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  // Flatten categories
  const flatCats: any[] = [];
  categories.forEach(main => {
    flatCats.push(main);
    if (main.children) {
      main.children.forEach((sub: any) => flatCats.push({ ...sub, name: `— ${sub.name}` }));
    }
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/sets" className="p-2 -ml-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-primary">
              {isEditing ? 'Edit Set' : 'Create New Set'}
            </h1>
            <p className="text-sm text-gray-500">
              {isEditing ? 'Update set details and products' : 'Add a new collection of products'}
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-bold text-primary border-b border-gray-100 pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Set Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g. Royal Bedroom Set"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">-- Select Category --</option>
                {flatCats.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="isActive"
                value={formData.isActive.toString()}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="true">Active (Visible to users)</option>
                <option value="false">Draft (Hidden)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (৳)</label>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Optional custom price for the whole set"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
              <input
                type="number"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g. 10"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Describe the set..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-bold text-primary border-b border-gray-100 pb-2">Set Images</h2>
          <div className="flex flex-col gap-4">
            
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className={`relative aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 ${imageUrl === url ? 'border-primary shadow-md' : 'border-gray-200'}`}>
                    <img src={url} alt={`Set Image ${idx + 1}`} className="w-full h-full object-cover" />
                    
                    {imageUrl !== url && (
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(url)}
                        className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 text-xs font-medium text-gray-700 rounded shadow-sm hover:bg-white"
                      >
                        Set Primary
                      </button>
                    )}
                    {imageUrl === url && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-xs font-medium text-white rounded shadow-sm">
                        Primary
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 shadow-sm transition-colors"
                      title="Remove Image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex flex-col items-start gap-2 pt-2">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="btn btn-outline text-sm flex items-center gap-2"
              >
                <UploadCloud size={16} />
                {uploadingImage ? 'Uploading...' : 'Upload Set Images'}
              </button>
              <p className="text-xs text-gray-500">You can select multiple images. 16:9 Aspect ratio recommended.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h2 className="text-lg font-bold text-primary">Included Products</h2>
            <span className="text-sm text-gray-500">{selectedProductIds.length} selected</span>
          </div>
          
          <div className="relative pt-2">
            <div className="absolute inset-y-0 left-0 pl-3 top-2 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-2">
            {availableProducts.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku?.toLowerCase().includes(productSearch.toLowerCase())).map(product => {
              const isSelected = selectedProductIds.includes(product.id);
              return (
                <div 
                  key={product.id}
                  onClick={() => handleProductToggle(product.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-3 ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // handled by div click
                    className="rounded border-gray-300 text-primary focus:ring-primary pointer-events-none"
                  />
                  <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200"></div>
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium text-gray-800 truncate" title={product.name}>{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sku || 'No SKU'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/admin/sets')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary px-8 flex items-center gap-2"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Save size={18} />
            )}
            {saving ? 'Saving...' : 'Save Set'}
          </button>
        </div>
      </form>
    </div>
  );
}
