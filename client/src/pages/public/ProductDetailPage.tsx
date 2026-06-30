import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Share2, ChevronRight, Ruler, ShieldCheck, Truck, X } from 'lucide-react';
import api from '../../lib/api';
import useWishlistStore from '../../stores/useWishlistStore';
import SEO from '../../components/seo/SEO';

// Simple Image Magnifier Component
const ImageMagnifier = ({
  src,
  width,
  height,
  magnifierHeight = 200,
  magnifierWidth = 200,
  zoomLevel = 2.0
}: {
  src: string;
  width?: string;
  height?: string;
  magnifierHeight?: number;
  magnifierWidth?: number;
  zoomLevel?: number;
}) => {
  const [[x, y], setXY] = useState([0, 0]);
  const [[imgWidth, imgHeight], setSize] = useState([0, 0]);
  const [showMagnifier, setShowMagnifier] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        height: height || '100%',
        width: width || '100%',
        cursor: showMagnifier ? 'none' : 'auto'
      }}
    >
      <img
        src={src}
        style={{ height: height || '100%', width: width || '100%', objectFit: 'contain' }}
        onMouseEnter={(e) => {
          const elem = e.currentTarget;
          const { width, height } = elem.getBoundingClientRect();
          setSize([width, height]);
          setShowMagnifier(true);
        }}
        onMouseMove={(e) => {
          const elem = e.currentTarget;
          const { top, left } = elem.getBoundingClientRect();
          const x = e.pageX - left - window.pageXOffset;
          const y = e.pageY - top - window.pageYOffset;
          setXY([x, y]);
        }}
        onMouseLeave={() => {
          setShowMagnifier(false);
        }}
        alt="Magnifiable Product"
      />

      <div
        style={{
          display: showMagnifier ? '' : 'none',
          position: 'absolute',
          pointerEvents: 'none',
          height: `${magnifierHeight}px`,
          width: `${magnifierWidth}px`,
          top: `${y - magnifierHeight / 2}px`,
          left: `${x - magnifierWidth / 2}px`,
          opacity: '1',
          border: '2px solid white',
          backgroundColor: 'white',
          backgroundImage: `url('${src}')`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${imgWidth * zoomLevel}px ${imgHeight * zoomLevel}px`,
          backgroundPositionX: `${-x * zoomLevel + magnifierWidth / 2}px`,
          backgroundPositionY: `${-y * zoomLevel + magnifierHeight / 2}px`,
          borderRadius: '50%',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          zIndex: 50
        }}
      ></div>
    </div>
  );
};

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSizeIdx, setActiveSizeIdx] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  // Enquiry Modal State
  const [isEnquireOpen, setIsEnquireOpen] = useState(false);
  const [enquiryStatus, setEnquiryStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const { items, addItem, removeItem } = useWishlistStore();
  const isWishlisted = product ? items.includes(product.id) : false;

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    api.get(`/products/${slug}`)
      .then(res => {
        setProduct(res.data);

        // Fetch related products from the same category
        if (res.data.category?.slug) {
          api.get(`/products?category=${res.data.category.slug}&limit=4`)
            .then(relatedRes => {
              // Filter out the current product from related products
              const filtered = relatedRes.data.products?.filter((p: any) => p.id !== res.data.id).slice(0, 4) || [];
              setRelatedProducts(filtered);
            })
            .catch(console.error);
        }
      })
      .catch(err => {
        console.error('Failed to fetch product:', err);
        setProduct(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  // View tracking effect
  useEffect(() => {
    if (product?.slug) {
      // Fire and forget view increment
      api.post(`/products/${product.slug}/view`).catch(() => {
        // Silently ignore errors for analytics tracking
      });
    }
  }, [product?.slug]);

  const handleWishlistToggle = () => {
    if (!product) return;
    if (isWishlisted) {
      removeItem(product.id);
    } else {
      addItem({
        id: product.id,
        name: product.name,
        priceDisplay: product.priceDisplay || `$${product.price}`,
        image: product.images?.[0]?.url || '',
        slug: product.slug
      });
    }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryStatus('submitting');

    try {
      await api.post('/leads', {
        name: enquiryForm.name,
        email: enquiryForm.email || 'no-email@provided.com', // API requires email, provide fallback if empty
        phone: enquiryForm.phone,
        message: enquiryForm.message,
        referenceNumber: product?.sku || product?.id?.toString() || '',
        category: product?.name || 'Product Enquiry',
        source: 'product-enquiry'
      });

      setEnquiryStatus('success');
      // Reset form after a delay
      setTimeout(() => {
        setIsEnquireOpen(false);
        setEnquiryStatus('idle');
        setEnquiryForm({ name: '', phone: '', email: '', message: '' });
      }, 2000);
    } catch (err) {
      console.error('Failed to submit enquiry:', err);
      alert('Failed to send enquiry. Please try again or contact us directly.');
      setEnquiryStatus('idle');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-secondary">
        <img src="/LOGO.gif" alt="Loading..." className="w-56 h-56 object-contain" />
        <p className="mt-4 text-sm font-serif italic tracking-[0.15em] text-[#1a1a1a]">Loading&hellip;</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-secondary min-h-screen pt-20 pb-20 container-custom text-center">
        <h1 className="text-4xl font-serif font-bold text-primary mb-4">Product Not Found</h1>
        <p className="text-gray-500 mb-8">The product you are looking for does not exist or has been removed.</p>
        <Link to="/shop" className="btn btn-primary">Return to Shop</Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Product Overview' },
    { id: 'features', label: 'Key Features & Dimensions' },
    { id: 'materials', label: 'Materials Used' },
    { id: 'care', label: 'Care & Maintenance' },
    { id: 'warranty', label: 'Warranty Info' },
    { id: 'policy', label: 'Return & Exchange Policy' },
  ];

  return (
    <div className="bg-white min-h-screen pb-20">
      <SEO
        title={product.metaTitle || product.name}
        description={product.metaDescription || product.overview || `Buy the premium ${product.name} from Talukder Furniture Ltd.`}
        type="product"
        image={product.images && product.images.length > 0 ? product.images[0].url : undefined}
        url={`/product/${product.slug}`}
        schema={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "image": product.images ? product.images.map((img: any) => img.url) : [],
          "description": product.metaDescription || product.overview || `Buy the premium ${product.name} from Talukder Furniture Ltd.`,
          "sku": product.productCode,
          "offers": {
            "@type": "Offer",
            "url": `https://talukderfurniture.com/product/${product.slug}`,
            "priceCurrency": "BDT",
            "price": product.basePrice,
            "itemCondition": "https://schema.org/NewCondition",
            "availability": product.stockStatus === 'IN_STOCK' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          }
        }}
      />

      {/* Breadcrumb */}
      <div className="bg-secondary py-4 border-b border-gray-100">
        <div className="max-w-[1700px] mx-auto px-4 md:px-8 xl:px-12 text-sm text-gray-500 flex items-center gap-2">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop" className="hover:text-accent transition-colors">Shop</Link>
          <ChevronRight size={14} />
          {product.category && (
            <>
              <Link to={`/shop?category=${product.category.slug}`} className="hover:text-accent transition-colors">
                {product.category.name}
              </Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className="text-primary font-medium truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-4 md:px-8 xl:px-12 pt-8 md:pt-12">
        <div className="flex flex-col md:flex-row gap-10 lg:gap-16">
          {/* Image Gallery */}
          <div className="md:w-1/2 lg:w-3/5 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto snap-x snap-mandatory md:w-24 lg:w-28 flex-shrink-0 scrollbar-hide max-h-[600px] pr-1 md:pr-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {product.images.map((img: any, idx: number) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(idx)}
                    className={`relative flex-shrink-0 w-20 md:w-full snap-center aspect-square rounded-lg overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-accent' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={img.url} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="relative flex-1 aspect-square md:aspect-[4/3] rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
              {product.images && product.images.length > 0 ? (
                <ImageMagnifier src={product.images[activeImage].url} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image Available</div>
              )}
              {product.isFeatured && (
                <div className="absolute top-4 left-4 bg-accent text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded shadow-sm">
                  Featured
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="md:w-1/2 lg:w-2/5 flex flex-col">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-2">{product.name}</h1>

            <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-4 mb-6">
              <div className="flex flex-col">
                {(() => {
                  const currentPrice = product.sizes?.[activeSizeIdx]?.price || product.basePrice;
                  if (currentPrice) {
                    return (
                      <>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl md:text-3xl font-bold text-[#1a1a1a]">
                            {product.discountPercentage > 0
                              ? `৳ ${(currentPrice * (1 - product.discountPercentage / 100)).toLocaleString()}`
                              : `৳ ${currentPrice.toLocaleString()}`
                            }
                          </span>
                          {product.discountPercentage > 0 && (
                            <span className="bg-red-100 text-red-600 text-[11px] md:text-sm font-bold px-2 py-1 rounded">
                              -{product.discountPercentage}% OFF
                            </span>
                          )}
                        </div>
                        {product.discountPercentage > 0 && (
                          <span className="text-gray-400 line-through text-xs md:text-sm mt-1 font-medium">
                            ৳ {currentPrice.toLocaleString()}
                          </span>
                        )}
                      </>
                    );
                  } else {
                    return <span className="text-2xl font-bold text-[#1a1a1a]">{product.priceDisplay || `$${product.price}`}</span>;
                  }
                })()}
              </div>
              <span className="text-[11px] md:text-sm text-gray-500 uppercase tracking-widest bg-secondary px-3 py-1.5 rounded-full mt-1">
                Product Code: {product.sku}
              </span>
            </div>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <span className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Available Sizes / Dimensions</span>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSizeIdx(idx)}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${activeSizeIdx === idx ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-700 hover:border-black'}`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <span className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Available Colors</span>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color: any, idx: number) => (
                    <div key={idx} className="group relative flex items-center justify-center">
                      <div
                        className="w-10 h-10 rounded-full border border-gray-200 hover:ring-2 hover:ring-offset-2 hover:ring-accent cursor-pointer shadow-sm transition-all"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                        {color.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="prose prose-sm text-gray-600 mb-8" dangerouslySetInnerHTML={{ __html: product.overview || '' }} />

            {/* Actions */}
            <div className="flex flex-col gap-4 mt-auto">
              <button
                onClick={handleWishlistToggle}
                className={`btn flex items-center justify-center gap-2 w-full py-4 text-lg bg-black text-white hover:bg-gray-900 transition-colors`}
              >
                <Heart size={20} className={isWishlisted ? "fill-current" : ""} />
                {isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
              </button>

              <button
                onClick={() => setIsEnquireOpen(true)}
                className="btn w-full py-4 text-lg text-center bg-black text-white hover:bg-gray-900 border-black"
              >
                Enquire About This Item
              </button>
            </div>

            {/* Features list */}
            <ul className="mt-8 space-y-4 border-t border-gray-100 pt-8">
              <li className="flex items-center gap-3 text-gray-600">
                <Truck size={20} className="text-primary" />
                <span>Free nationwide delivery on orders over $500</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <ShieldCheck size={20} className="text-primary" />
                <span>10-year warranty on solid wood frames</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <Ruler size={20} className="text-primary" />
                <span>Custom dimensions available upon request</span>
              </li>
            </ul>

            {/* Share */}
            <div className="mt-8 flex items-center gap-4 border-t border-gray-100 pt-6">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Share</span>
              <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-gray-600 hover:bg-accent hover:text-white transition-colors">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* 5-Tab Info Section */}
        <div className="mt-20 border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 md:flex-1 py-3 md:py-4 px-5 md:px-6 text-sm md:text-base font-semibold whitespace-nowrap transition-colors ${activeTab === tab.id
                  ? 'bg-secondary text-accent border-b-2 border-accent'
                  : 'bg-white text-gray-500 hover:text-primary hover:bg-gray-50'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-5 md:p-12 min-h-[300px] prose max-w-none text-gray-600 text-sm md:text-base">
            {activeTab === 'overview' && (
              <div dangerouslySetInnerHTML={{ __html: product.overview || '<p>No detailed overview provided.</p>' }} />
            )}
            {activeTab === 'features' && (
              <div>
                {(() => {
                  const defaultDim = product.sizes?.[0]?.dimensions;
                  const activeDim = product.sizes?.[activeSizeIdx]?.dimensions || product.sizes?.[activeSizeIdx]?.label;

                  if (product.keyFeatures === defaultDim && activeDim) {
                    return <p>{activeDim}</p>;
                  }

                  return (
                    <>
                      <div dangerouslySetInnerHTML={{ __html: product.keyFeatures || '<p>Key features information is currently unavailable.</p>' }} />
                      {activeDim && (
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <strong className="text-gray-900 block mb-2">Selected Size Dimensions:</strong>
                          <p>{activeDim}</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
            {activeTab === 'materials' && (
              <div dangerouslySetInnerHTML={{ __html: product.materials || '<p>Material information is currently unavailable.</p>' }} />
            )}
            {activeTab === 'care' && (
              <div dangerouslySetInnerHTML={{ __html: product.careMaintenance || '<p>Wipe clean with a damp cloth. Avoid harsh chemicals.</p>' }} />
            )}
            {activeTab === 'warranty' && (
              <div dangerouslySetInnerHTML={{ __html: product.warrantyInfo || '<p>This product comes with a standard 10-year manufacturing warranty covering defects in materials and workmanship for solid wood frames, and a 1-year warranty for upholstery.</p>' }} />
            )}
            {activeTab === 'policy' && (
              <div dangerouslySetInnerHTML={{ __html: product.returnExchangePolicy || '<p><strong>Returns:</strong> We accept returns within 30 days of delivery. Custom-made or modified pieces are non-returnable unless there is a manufacturing defect.</p>' }} />
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <h2 className="text-3xl font-serif font-bold text-primary mb-8 text-center">Recommended For You</h2>
            <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 snap-x snap-mandatory pb-4 sm:pb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {relatedProducts.map((p) => (
                <div key={p.id} className="group flex flex-col w-[160px] sm:w-auto snap-start shrink-0">
                  <Link to={`/products/${p.slug}`} className="relative aspect-[4/3] overflow-hidden rounded-lg mb-4 bg-gray-100 block">
                    {p.images && p.images.length > 0 ? (
                      <img
                        src={p.images[0].url}
                        alt={p.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                    )}
                  </Link>
                  <Link to={`/products/${p.slug}`} className="hover:text-accent transition-colors">
                    <h3 className="font-bold text-primary text-sm sm:text-lg truncate">{p.name}</h3>
                  </Link>
                  {p.category && (
                    <span className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">{p.category.name}</span>
                  )}
                  <span className="font-semibold text-[#1a1a1a] text-sm sm:text-base">{p.priceDisplay || `$${p.price}`}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enquiry Modal */}
      {isEnquireOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-xl text-primary">Enquire About This Item</h3>
              <button
                onClick={() => setIsEnquireOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 p-4 bg-secondary/50 rounded-lg border border-gray-100">
                <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-white">
                  {product.images?.[0]?.url ? (
                    <img src={product.images[0].url} alt={product.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No Image</div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-primary">{product.name}</h4>
                  <div className="text-sm text-gray-500">Product Code: {product.sku || 'N/A'}</div>
                </div>
              </div>

              {enquiryStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck size={32} />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Enquiry Sent!</h4>
                  <p className="text-gray-600">Thank you for reaching out. Our team will get back to you shortly regarding this product.</p>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={enquiryForm.name}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={enquiryForm.phone}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                        placeholder="+880 1..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={enquiryForm.email}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Message *</label>
                    <textarea
                      required
                      rows={4}
                      value={enquiryForm.message}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                      placeholder="I would like to know more about the delivery time and customization options..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none resize-none"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={enquiryStatus === 'submitting'}
                    className="w-full btn py-3 flex justify-center items-center bg-black text-white hover:bg-gray-900 border-none"
                  >
                    {enquiryStatus === 'submitting' ? (
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                      'Send Enquiry'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
