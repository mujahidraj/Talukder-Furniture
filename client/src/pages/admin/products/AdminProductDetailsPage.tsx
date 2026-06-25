import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Eye, Tag, Grid, Star, FileText, CheckCircle2, XCircle, Clock, Info } from 'lucide-react';
import api from '../../../lib/api';

export default function AdminProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/admin/${id}`);
        setProduct(data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-red-500 mb-4">{error || 'Product not found'}</p>
        <button onClick={() => navigate('/admin/products')} className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Products
        </button>
      </div>
    );
  }

  const mainImage = product.images?.[selectedImage]?.url || '/placeholder.jpg';
  const hasDiscount = product.discountPercentage > 0;
  const currentPrice = hasDiscount 
    ? product.basePrice * (1 - product.discountPercentage / 100)
    : product.basePrice;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Actions */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <button 
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors font-medium text-sm"
        >
          <ArrowLeft size={18} />
          Back to List
        </button>
        <div className="flex gap-3">
          <a 
            href={`/products/${product.slug}`} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200"
          >
            <Eye size={16} />
            View Live
          </a>
          <Link 
            to={`/admin/products/${product.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Edit size={16} />
            Edit Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Images */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 aspect-square flex items-center justify-center p-4">
            <img 
              src={mainImage} 
              alt={product.name} 
              className="w-full h-full object-contain"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((img: any, idx: number) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? 'border-primary' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-primary">{product.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 ${
                  product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {product.isActive ? 'Active' : 'Draft'}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Tag size={16} />
                  <span>ID: <span className="font-medium text-gray-900">{product.id}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Tag size={16} />
                  <span>SKU: <span className="font-medium text-gray-900">{product.sku || 'N/A'}</span></span>
                </div>
                {product.category && (
                  <div className="flex items-center gap-1.5">
                    <Grid size={16} />
                    <span>Category: 
                      <span className="font-medium text-gray-900 ml-1">
                        {product.category.parent ? `${product.category.parent.name} > ${product.category.name}` : product.category.name}
                      </span>
                    </span>
                  </div>
                )}
                {product.isFeatured && (
                  <div className="flex items-center gap-1.5 text-accent">
                    <Star size={16} className="fill-current" />
                    <span className="font-bold">Featured</span>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-gray-100 w-full" />

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Pricing</h3>
              <div className="flex items-end gap-3">
                {product.basePrice ? (
                  <>
                    <span className="text-3xl font-bold text-primary">৳ {currentPrice.toLocaleString()}</span>
                    {hasDiscount && (
                      <>
                        <span className="text-lg text-gray-400 line-through mb-1">৳ {product.basePrice.toLocaleString()}</span>
                        <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-1 rounded mb-1">
                          -{product.discountPercentage}% OFF
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-2xl font-bold text-primary">{product.priceDisplay || 'Price not set'}</span>
                )}
              </div>
            </div>

            <div className="h-px bg-gray-100 w-full" />

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Views:</span>
                    <span className="font-medium">{product.viewCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Enquiries:</span>
                    <span className="font-medium">{product.enquiryCount}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Timestamps</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start justify-between">
                    <span className="text-gray-600 flex items-center gap-1"><Clock size={14} /> Created:</span>
                    <span className="font-medium">{new Date(product.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-gray-600 flex items-center gap-1"><Clock size={14} /> Updated:</span>
                    <span className="font-medium">{new Date(product.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">SEO & System Links</h3>
            
            <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-50 text-sm">
              <span className="sm:w-1/3 font-medium text-gray-500">URL Slug</span>
              <span className="sm:w-2/3 text-gray-900 bg-gray-50 px-2 py-1 rounded font-mono text-xs overflow-hidden text-ellipsis">{product.slug}</span>
            </div>

            <div className="flex flex-col py-2 border-b border-gray-50 text-sm">
              <span className="font-medium text-gray-500 mb-1">Meta Title</span>
              <span className="text-gray-900">{product.metaTitle || <span className="text-gray-400 italic">Not set (defaults to product name)</span>}</span>
            </div>

            <div className="flex flex-col py-2 text-sm">
              <span className="font-medium text-gray-500 mb-1">Meta Description</span>
              <span className="text-gray-900">{product.metaDescription || <span className="text-gray-400 italic">Not set</span>}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attributes & Variations */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
            <Info className="text-gray-400" />
            <h2 className="text-lg font-bold text-primary">Attributes</h2>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col py-2 border-b border-gray-50 text-sm">
              <span className="font-medium text-gray-500 mb-1">Materials</span>
              <span className="text-gray-900">{product.materials || <span className="text-gray-400 italic">Not specified</span>}</span>
            </div>
            
            <div className="flex flex-col py-2 border-b border-gray-50 text-sm">
              <span className="font-medium text-gray-500 mb-2">Available Colors</span>
              {product.colors && product.colors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c: any, i: number) => (
                    <div key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full text-xs font-medium">
                      <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: c.hex }}></div>
                      {c.name}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400 italic">No colors specified</span>
              )}
            </div>

            <div className="flex flex-col py-2 text-sm">
              <span className="font-medium text-gray-500 mb-2">Available Sizes</span>
              {product.sizes && product.sizes.length > 0 ? (
                <ul className="space-y-1 list-disc list-inside text-gray-900">
                  {product.sizes.map((s: any, i: number) => (
                    <li key={i}><strong>{s.label}:</strong> {s.dimensions}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-400 italic">No sizes specified</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rich Text Sections */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <FileText className="text-gray-400" />
            <h2 className="text-lg font-bold text-primary">Content Sections</h2>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {[
            { title: 'Overview', content: product.overview },
            { title: 'Key Features', content: product.keyFeatures },
            { title: 'Care & Maintenance', content: product.careMaintenance },
            { title: 'Warranty Info', content: product.warrantyInfo },
            { title: 'Return & Exchange Policy', content: product.returnExchangePolicy }
          ].map((section, idx) => (
            <div key={idx} className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <h3 className="text-sm font-bold text-gray-700">{section.title}</h3>
              </div>
              <div className="md:col-span-3">
                {section.content ? (
                  <div 
                    className="prose prose-sm max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                ) : (
                  <span className="text-gray-400 italic text-sm">Not provided</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
