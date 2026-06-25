import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, X, UploadCloud } from 'lucide-react';
import api from '../../../lib/api';

export default function ProductFormPage() {
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
    priceDisplay: '',
    basePrice: '',
    discountPercentage: '',
    categoryId: '',
    isActive: true,
    isFeatured: false,
    overview: '',
    keyFeatures: '',
    materials: '',
    careMaintenance: '',
    warrantyInfo: '',
    returnExchangePolicy: '',
    metaTitle: '',
    metaDescription: '',
  });

  const [images, setImages] = useState<any[]>([]);
  const [colors, setColors] = useState<{name: string, hex: string}[]>([]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');

  const [categories, setCategories] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch categories
    api.get('/categories').then(res => setCategories(res.data)).catch(console.error);

    if (isEditing) {
      api.get(`/products/admin/${id}`)
        .then(res => {
          const product = res.data;
          setFormData({
            name: product.name || '',
            sku: product.sku || '',
            priceDisplay: product.priceDisplay || '',
            basePrice: product.basePrice?.toString() || '',
            discountPercentage: product.discountPercentage?.toString() || '',
            categoryId: product.categoryId?.toString() || '',
            isActive: product.isActive ?? true,
            isFeatured: product.isFeatured || false,
            overview: product.overview || '',
            keyFeatures: product.keyFeatures || '',
            materials: product.materials || '',
            careMaintenance: product.careMaintenance || '',
            warrantyInfo: product.warrantyInfo || '',
            returnExchangePolicy: product.returnExchangePolicy || '',
            metaTitle: product.metaTitle || '',
            metaDescription: product.metaDescription || '',
          });
          setImages(product.images || []);
          setColors(product.colors || []);
        })
        .catch(err => {
          console.error(err);
          alert('Failed to load product');
          navigate('/admin/products');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: string | boolean = value;
    if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'isActive') {
      parsedValue = value === 'true';
    }

    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const payload = {
        ...formData,
        categoryId: parseInt(formData.categoryId, 10),
        sku: formData.sku.trim() || null,
        basePrice: formData.basePrice ? parseFloat(formData.basePrice) : null,
        discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : null,
        images: images.map(img => img.url),
        colors: colors.length > 0 ? colors : [],
      };

      if (isEditing) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      navigate('/admin/products');
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 409) {
        setErrorMessage('You cannot add duplicate data. A product with this name or Product Code already exists.');
      } else {
        setErrorMessage('Failed to save product. Please check all fields.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingImage(true);
    try {
      // Create a specific axios instance or config if needed, but api.post usually handles FormData
      const res = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImages(prev => [...prev, { url: api.defaults.baseURL?.replace('/api', '') + res.data.url }]);
    } catch (err) {
      console.error(err);
      alert('Failed to upload image.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setColors(prev => [...prev, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName('');
    setNewColorHex('#000000');
  };

  const removeColor = (indexToRemove: number) => {
    setColors(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  if (loading) {
    return <div className="p-8 text-center animate-pulse text-gray-500">Loading product details...</div>;
  }

  return (
    <>
      {errorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <span className="text-red-600 text-2xl font-bold">!</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Duplicate Data Detected</h3>
            <p className="text-sm text-gray-500 mb-6">{errorMessage}</p>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="w-full btn btn-primary"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/products" className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-primary transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-primary">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn bg-black text-white hover:bg-gray-900 transition-colors flex items-center gap-2 px-4 py-2 rounded-lg">
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Product'}
        </button>
      </div>

      <div className="space-y-8">
        
        {/* Section 1: Basic Information */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-primary border-b border-gray-100 pb-4 mb-6">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input 
                type="text" name="name" required value={formData.name} onChange={handleChange}
                placeholder="e.g. Luxury Oak Dining Table"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Code</label>
              <input 
                type="text" name="sku" value={formData.sku} onChange={handleChange}
                placeholder="e.g. TBL-OAK-001"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Price (Legacy/Override)</label>
              <input 
                type="text" name="priceDisplay" value={formData.priceDisplay} onChange={handleChange}
                placeholder="e.g. ৳ 45,000"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (Numeric) *</label>
              <input 
                type="number" name="basePrice" required min="0" step="0.01" value={formData.basePrice} onChange={handleChange}
                placeholder="e.g. 45000"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage (%)</label>
              <input 
                type="number" name="discountPercentage" min="0" max="100" step="0.01" value={formData.discountPercentage} onChange={handleChange}
                placeholder="e.g. 15 for 15% off"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select 
                name="categoryId" value={formData.categoryId} onChange={handleChange} required
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              >
                <option value="">Select a Sub-Category...</option>
                {categories.map(cat => (
                  <optgroup key={cat.id} label={cat.name}>
                    {cat.children?.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visibility Status</label>
              <select 
                name="isActive" value={formData.isActive.toString()} onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              >
                <option value="true">Active (Visible to public)</option>
                <option value="false">Draft (Hidden)</option>
              </select>
            </div>
            
            {/* Featured Checkbox */}
            <div className="md:col-span-2 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${formData.isFeatured ? 'bg-accent' : 'bg-gray-200'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isFeatured ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary">
                  Featured Product (Show this on the Homepage "Top Picks" section)
                </span>
              </label>
            </div>

          </div>
        </div>

        {/* Section 2: Detailed Descriptions */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-primary border-b border-gray-100 pb-4 mb-6">Product Details</h2>
          <p className="text-sm text-gray-500 mb-6">Enter plain text in these fields. They will automatically be formatted neatly on the product page.</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">General Overview</label>
              <textarea
                name="overview" rows={3} value={formData.overview} onChange={handleChange}
                placeholder="A short, catchy description of the product."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Materials Used</label>
              <textarea
                name="materials" rows={2} value={formData.materials} onChange={handleChange}
                placeholder="e.g. Solid Mahogany wood, Premium fabric upholstery..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Features & Dimensions</label>
              <textarea
                name="keyFeatures" rows={4} value={formData.keyFeatures} onChange={handleChange}
                placeholder="e.g.&#10;- Length: 80 inches&#10;- Scratch-resistant surface&#10;- Built-in storage"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Care & Maintenance</label>
                <textarea
                  name="careMaintenance" rows={3} value={formData.careMaintenance} onChange={handleChange}
                  placeholder="How should the customer clean or maintain this?"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Info</label>
                <textarea
                  name="warrantyInfo" rows={3} value={formData.warrantyInfo} onChange={handleChange}
                  placeholder="e.g. 5 Years structural warranty"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Return & Exchange Policy</label>
              <textarea
                name="returnExchangePolicy" rows={3} value={formData.returnExchangePolicy} onChange={handleChange}
                placeholder="e.g. 7 days easy return policy"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
            </div>

          </div>
        </div>

        {/* Section 3: Media Gallery */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
            <h2 className="text-lg font-bold text-primary">Media Gallery</h2>
            <span className="text-sm text-gray-500">{images.length} images uploaded</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                <img src={img.url} alt="Product" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button type="button" onClick={() => removeImage(idx)} className="p-1.5 bg-white text-red-500 rounded hover:bg-red-50">
                    <X size={16} />
                  </button>
                </div>
                {idx === 0 && <span className="absolute top-2 left-2 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded">Thumbnail</span>}
              </div>
            ))}
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-accent hover:bg-accent/5 transition-colors flex flex-col items-center justify-center text-gray-500 hover:text-accent gap-2"
            >
              {uploadingImage ? (
                <div className="w-6 h-6 border-2 border-gray-300 border-t-accent rounded-full animate-spin" />
              ) : (
                <>
                  <UploadCloud size={24} />
                  <span className="text-xs font-medium">Upload Image</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-4">First image will be used as the product thumbnail.</p>
        </div>

        {/* Section 4: Color Options */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-primary border-b border-gray-100 pb-4 mb-6">Color Options</h2>
          <div className="flex items-end gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Color Name</label>
              <input 
                type="text" value={newColorName} onChange={(e) => setNewColorName(e.target.value)}
                placeholder="e.g. Charcoal Black"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hex Code</label>
              <input 
                type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)}
                className="w-16 h-[46px] p-1 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
              />
            </div>
            <button 
              type="button" 
              onClick={handleAddColor}
              disabled={!newColorName.trim()}
              className="px-6 py-2.5 bg-secondary text-primary font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Add Color
            </button>
          </div>

          {colors.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {colors.map((color, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full py-1 pl-1 pr-3">
                  <div className="w-6 h-6 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: color.hex }}></div>
                  <span className="text-sm font-medium text-gray-700">{color.name}</span>
                  <button 
                    type="button" 
                    onClick={() => removeColor(idx)}
                    className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No color options added yet. If left empty, no colors will be shown.</p>
          )}
        </div>

        {/* Section 5: SEO */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-primary border-b border-gray-100 pb-4 mb-6">Search Engine Optimization (SEO)</h2>
          <p className="text-sm text-gray-500 mb-6">These details control how your product appears on Google and social media. If left blank, defaults will be used.</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input 
                type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange}
                placeholder="e.g. Luxury Oak Dining Table | Talukder Furniture"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
              <p className="text-xs text-gray-400 mt-1">Recommended length: 50-60 characters.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea
                name="metaDescription" rows={3} value={formData.metaDescription} onChange={handleChange}
                placeholder="e.g. Buy the premium Luxury Oak Dining Table from Talukder Furniture. Free delivery inside Dhaka..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
              <p className="text-xs text-gray-400 mt-1">Recommended length: 150-160 characters.</p>
            </div>
          </div>
        </div>

      </div>
      </form>
    </>
  );
}
