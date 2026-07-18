import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, X, UploadCloud, Search, Package } from 'lucide-react';
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
    sku: '',
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
  const [initialSetProducts, setInitialSetProducts] = useState<any[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch categories
    api.get('/categories?admin=true').then(res => setCategories(res.data)).catch(console.error);

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
            sku: setItem.sku || '',
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
            setInitialSetProducts(setItem.products);
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
      name: formData.name,
      sku: formData.sku || null,
      categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null,
      description: formData.description || null,
      basePrice: formData.basePrice ? parseFloat(formData.basePrice) : null,
      discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : null,
      isActive: formData.isActive,
      imageUrl: imageUrl || null,
      imageUrls: imageUrls,
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

  // Flatten categories recursively to support sub-sub-categories
  const flattenCategories = (cats: any[], level = 0): any[] => {
    const result: any[] = [];
    const prefix = '—'.repeat(level);
    cats.forEach(cat => {
      result.push({ ...cat, name: level > 0 ? `${prefix} ${cat.name}` : cat.name });
      if (cat.children && cat.children.length > 0) {
        result.push(...flattenCategories(cat.children, level + 1));
      }
    });
    return result;
  };

  const flatCats = flattenCategories(categories);

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Collection / Set Name *</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none" placeholder="e.g. Minimalist Dining Set" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Set SKU / Code</label>
              <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono" placeholder="e.g. SET-109" />
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
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/5 rounded-lg text-primary">
                <Package size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Included Products</h2>
            </div>
            <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full border border-primary/20">
              {selectedProductIds.length} selected
            </span>
          </div>
          
          {selectedProductIds.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-3 pb-2 border-b border-gray-100">
              {selectedProductIds.map(id => {
                const product = availableProducts.find(p => p.id === id) || initialSetProducts.find(p => p.id === id) || { id, name: `Product #${id}` };
                return (
                  <div key={product.id} className="group flex items-center gap-3 bg-white border border-gray-200 pr-3 py-1.5 rounded-full text-sm shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-50 flex-shrink-0 ml-1 border border-gray-100 shadow-inner">
                      {product.images?.[0] ? (
                        <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-medium">N/A</div>
                      )}
                    </div>
                    <div className="flex flex-col max-w-[200px]">
                      <span className="font-semibold truncate leading-tight text-gray-800 transition-colors group-hover:text-primary" title={product.name}>{product.name}</span>
                      <span className="text-[10px] text-gray-400 font-medium tracking-wide leading-tight mt-0.5">ID: {product.id} {product.sku ? `• ${product.sku}` : ''}</span>
                    </div>
                    <button type="button" onClick={() => handleProductToggle(product.id)} className="text-gray-400 hover:text-red-500 transition-all duration-200 p-1.5 ml-1 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200">
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="relative pt-3">
            <div className="absolute inset-y-0 left-0 pl-3 top-2 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400 transition-colors group-focus-within:text-primary" />
            </div>
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm transition-all duration-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 placeholder:text-gray-400"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[450px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent pr-4">
            {availableProducts.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku?.toLowerCase().includes(productSearch.toLowerCase())).map(product => {
              const isSelected = selectedProductIds.includes(product.id);
              return (
                <div 
                  key={product.id}
                  onClick={() => handleProductToggle(product.id)}
                  className={`group relative p-3 border rounded-xl cursor-pointer transition-all duration-300 flex items-center gap-4 overflow-hidden ${isSelected ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/40 shadow-[0_4px_12px_rgba(227,34,39,0.08)]' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5'}`}
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-primary transform transition-transform duration-300 origin-left ${isSelected ? 'scale-x-100' : 'scale-x-0'}" style={{ transform: isSelected ? 'scaleX(1)' : 'scaleX(0)' }}></div>
                  
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // handled by div click
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary pointer-events-none transition-all duration-300"
                    />
                  </div>
                  
                  <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden shadow-sm relative">
                    {product.images?.[0] ? (
                      <img src={product.images[0].url} alt={product.name} className={`w-full h-full object-cover transition-transform duration-500 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Package size={16} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-2">
                    <p className={`text-sm font-semibold truncate transition-colors duration-300 ${isSelected ? 'text-primary' : 'text-gray-800 group-hover:text-primary'}`} title={product.name}>{product.name}</p>
                    <p className="text-xs text-gray-500 font-medium tracking-wide mt-0.5 truncate">{product.sku || 'NO SKU'}</p>
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
