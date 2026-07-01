import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Heart, Share2, ShieldCheck, Truck, Ruler, X, Phone, ShoppingBag, Info, ExternalLink, MessageSquare, ArrowLeft } from 'lucide-react';
import api from '../../lib/api';
import useWishlistStore from '../../stores/useWishlistStore';
import SEO from '../../components/seo/SEO';

// Simple Image Magnifier Component
const ImageMagnifier = ({
  src,
  width,
  height,
  magnifierHeight = 250,
  magnifierWidth = 250,
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
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          zIndex: 50
        }}
      ></div>
    </div>
  );
};

// Side Drawer for Full Product Details
const ProductDrawer = ({ product, isOpen, onClose }: { product: any, isOpen: boolean, onClose: () => void }) => {
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSizeIdx, setActiveSizeIdx] = useState(0);

  // Enquiry state for this specific product
  const [isEnquireOpen, setIsEnquireOpen] = useState(false);
  const [enquiryStatus, setEnquiryStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [enquiryForm, setEnquiryForm] = useState({ name: '', phone: '', email: '', message: '' });

  const { items, addItem, removeItem } = useWishlistStore();
  const isWishlisted = product ? items.includes(product.id) : false;
  const drawerRef = useRef<HTMLDivElement>(null);

  // Reset states when a new product is opened
  useEffect(() => {
    if (isOpen) {
      setActiveImage(0);
      setActiveTab('overview');
      setActiveSizeIdx(0);
      setIsEnquireOpen(false);
      setEnquiryStatus('idle');
      setEnquiryForm({ name: '', phone: '', email: '', message: '' });
      if (drawerRef.current) drawerRef.current.scrollTop = 0;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, product]);

  if (!product) return null;

  const handleWishlistToggle = () => {
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
        email: enquiryForm.email || 'no-email@provided.com',
        phone: enquiryForm.phone,
        message: enquiryForm.message,
        referenceNumber: product.sku || product.id?.toString() || '',
        category: product.name,
        source: 'product-enquiry'
      });
      setEnquiryStatus('success');
      setTimeout(() => {
        setIsEnquireOpen(false);
        setEnquiryStatus('idle');
        setEnquiryForm({ name: '', phone: '', email: '', message: '' });
      }, 2000);
    } catch (err) {
      console.error('Failed to submit enquiry:', err);
      alert('Failed to send enquiry. Please try again.');
      setEnquiryStatus('idle');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'features', label: 'Features & Dimensions' },
    { id: 'materials', label: 'Materials' },
    { id: 'care', label: 'Care' },
    { id: 'warranty', label: 'Warranty' },
    { id: 'policy', label: 'Returns' },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-500 ease-in-out ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed inset-y-0 right-0 w-full max-w-[800px] bg-white z-[110] shadow-2xl transform transition-transform duration-500 ease-in-out overflow-y-auto flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Drawer Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between z-20">
          <h2 className="text-xl font-serif font-bold text-primary truncate pr-4">{product.name}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 md:p-10 flex-1">
          <div className="flex flex-col gap-10">
            {/* Top Section: Images & Basic Info */}
            <div className="flex flex-col md:flex-row gap-8">
              {/* Image Gallery */}
              <div className="w-full md:w-1/2 flex flex-col-reverse md:flex-row gap-4">
                {product.images && product.images.length > 1 && (
                  <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto snap-x snap-mandatory md:w-20 flex-shrink-0 scrollbar-hide max-h-[400px] pr-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {product.images.map((img: any, idx: number) => (
                      <button
                        key={img.id}
                        onClick={() => setActiveImage(idx)}
                        className={`relative flex-shrink-0 w-16 h-16 md:w-full md:h-20 snap-center rounded-lg overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-accent' : 'border-transparent hover:border-gray-300'}`}
                      >
                        <img src={img.url} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                <div className="relative flex-1 aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                  {product.images && product.images.length > 0 ? (
                    <ImageMagnifier src={product.images[activeImage].url} magnifierWidth={150} magnifierHeight={150} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image Available</div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="w-full md:w-1/2 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    {(() => {
                      const currentPrice = product.sizes?.[activeSizeIdx]?.price || product.basePrice;
                      if (currentPrice) {
                        return (
                          <>
                            <div className="flex items-center gap-3">
                              <span className="text-3xl font-bold text-[#1a1a1a]">
                                {product.discountPercentage > 0
                                  ? `৳ ${(currentPrice * (1 - product.discountPercentage / 100)).toLocaleString()}`
                                  : `৳ ${currentPrice.toLocaleString()}`
                                }
                              </span>
                            </div>
                            {product.discountPercentage > 0 && (
                              <span className="text-gray-400 line-through text-sm mt-1 font-medium">
                                ৳ {currentPrice.toLocaleString()} (-{product.discountPercentage}%)
                              </span>
                            )}
                          </>
                        );
                      } else {
                        return <span className="text-3xl font-bold text-[#1a1a1a]">{product.priceDisplay || `$${product.price}`}</span>;
                      }
                    })()}
                  </div>
                </div>

                <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">Code: {product.sku || 'N/A'}</p>

                {/* Sizes */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-6">
                    <span className="block text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wider">Sizes</span>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setActiveSizeIdx(idx)}
                          className={`px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${activeSizeIdx === idx ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-700 hover:border-black'}`}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-6">
                    <span className="block text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wider">Colors</span>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color: any, idx: number) => (
                        <div key={idx} className="group relative flex items-center justify-center">
                          <div
                            className="w-8 h-8 rounded-full border border-gray-200 hover:ring-2 hover:ring-offset-2 hover:ring-accent cursor-pointer shadow-sm transition-all"
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

                <div className="prose prose-sm text-gray-600 mb-8 line-clamp-4" dangerouslySetInnerHTML={{ __html: product.overview || '' }} />

                {/* Actions */}
                <div className="flex flex-col gap-3 mt-auto">
                  <button
                    onClick={handleWishlistToggle}
                    className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-black text-black hover:bg-black hover:text-white font-medium rounded transition-colors"
                  >
                    <Heart size={18} className={isWishlisted ? "fill-current text-[#E32227] border-none" : ""} />
                    {isWishlisted ? 'Saved to Wishlist' : 'Save for Later'}
                  </button>
                  <button
                    onClick={() => setIsEnquireOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-accent text-white font-medium rounded hover:bg-red-700 transition-colors"
                  >
                    <MessageSquare size={18} />
                    Enquire About This Item
                  </button>
                  <Link
                    to={`/products/${product.slug}`}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-500 hover:text-primary transition-colors mt-2"
                  >
                    View Independent Page <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Section: Tabs */}
            <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm mt-4">
              <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 md:flex-1 py-4 px-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeTab === tab.id
                      ? 'bg-gray-50 text-accent border-b-2 border-accent'
                      : 'bg-white text-gray-500 hover:text-primary hover:bg-gray-50'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="p-6 min-h-[250px] prose max-w-none text-gray-600 text-sm">
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
                  <div dangerouslySetInnerHTML={{ __html: product.warrantyInfo || '<p>This product comes with a standard 10-year manufacturing warranty.</p>' }} />
                )}
                {activeTab === 'policy' && (
                  <div dangerouslySetInnerHTML={{ __html: product.returnExchangePolicy || '<p><strong>Returns:</strong> We accept returns within 30 days of delivery.</p>' }} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Enquiry Overlay */}
        {isEnquireOpen && (
          <div className="absolute inset-0 bg-white z-30 flex flex-col animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-xl text-primary">Enquire About This Item</h3>
              <button onClick={() => setIsEnquireOpen(false)} className="text-gray-400 hover:text-red-500">
                <ArrowLeft size={24} className="rotate-180" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-white">
                  {product.images?.[0]?.url ? (
                    <img src={product.images[0].url} alt={product.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No Image</div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-primary">{product.name}</h4>
                  <div className="text-sm text-gray-500">Code: {product.sku || 'N/A'}</div>
                </div>
              </div>

              {enquiryStatus === 'success' ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck size={40} />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Enquiry Sent!</h4>
                  <p className="text-gray-600">Our team will get back to you shortly regarding this product.</p>
                  <button onClick={() => setIsEnquireOpen(false)} className="mt-8 btn btn-outline">Go Back</button>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-5 max-w-md mx-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                    <input type="text" required value={enquiryForm.name} onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })} placeholder="John Doe" className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-accent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input type="tel" required value={enquiryForm.phone} onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })} placeholder="+880 1..." className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-accent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" value={enquiryForm.email} onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })} placeholder="john@example.com" className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-accent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Message *</label>
                    <textarea required rows={4} value={enquiryForm.message} onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })} placeholder="I would like to know more about..." className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-accent outline-none resize-none"></textarea>
                  </div>
                  <button type="submit" disabled={enquiryStatus === 'submitting'} className="w-full btn py-4 flex justify-center items-center bg-black text-white hover:bg-gray-900 border-none rounded mt-4">
                    {enquiryStatus === 'submitting' ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : 'Send Enquiry'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};


export default function SetDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [setItem, setSetItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal / Drawer state
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Set Enquiry Modal State
  const [isSetEnquireOpen, setIsSetEnquireOpen] = useState(false);
  const [enquiryStatus, setEnquiryStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [enquiryForm, setEnquiryForm] = useState({ name: '', phone: '', email: '', message: '' });

  // Hero Slider State
  const [heroIdx, setHeroIdx] = useState(0);

  // No auto slider effect needed anymore

  useEffect(() => {
    setLoading(true);
    api.get(`/sets/${slug}`)
      .then(res => {
        const data = res.data;
        if (!data.imageUrls) data.imageUrls = [];
        if (data.imageUrls.length === 0 && data.imageUrl) data.imageUrls = [data.imageUrl];
        setSetItem(data);
      })
      .catch(err => {
        console.error(err);
        navigate('/404');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug, navigate]);

  const handleSetEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryStatus('submitting');
    try {
      await api.post('/leads', {
        name: enquiryForm.name,
        email: enquiryForm.email || 'no-email@provided.com',
        phone: enquiryForm.phone,
        message: enquiryForm.message,
        referenceNumber: `SET-${setItem?.id || ''}`,
        category: setItem?.name || 'Set Enquiry',
        source: 'product-enquiry'
      });
      setEnquiryStatus('success');
      setTimeout(() => {
        setIsSetEnquireOpen(false);
        setEnquiryStatus('idle');
        setEnquiryForm({ name: '', phone: '', email: '', message: '' });
      }, 2000);
    } catch (err) {
      console.error('Failed to submit enquiry:', err);
      alert('Failed to send enquiry.');
      setEnquiryStatus('idle');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100vh] bg-white">
        <img src="/LOGO.gif" alt="Loading..." className="w-56 h-56 object-contain" />
        <p className="mt-4 text-sm font-serif italic tracking-[0.15em] text-gray-500">Curating Collection...</p>
      </div>
    );
  }

  if (!setItem) return null;

  const discountedPrice = setItem.discountPercentage
    ? setItem.basePrice * (1 - setItem.discountPercentage / 100)
    : setItem.basePrice;

  const heroImages = setItem.imageUrls?.length > 0 ? setItem.imageUrls : ['https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1920&q=80'];
  const currentHeroImage = heroImages[heroIdx % heroImages.length];

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-20 pt-[90px]">
      <SEO
        title={`${setItem.name} | Talukder Furniture Collections`}
        description={setItem.description || `Explore the ${setItem.name} collection.`}
        type="product"
        image={setItem.imageUrls?.[0]}
        url={`/collections/${setItem.slug}`}
      />

      {/* Collection Header (Moved from inside image) */}
      <div className="max-w-[1700px] mx-auto px-4 md:px-8 xl:px-12 pt-4 pb-6 text-center flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-serif text-primary mb-4">{setItem.name}</h1>
        
        <div className="flex items-center gap-4 text-gray-500 text-sm md:text-base">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop?type=sets" className="hover:text-primary transition-colors">Collections</Link>
          {setItem.category && (
            <>
              <ChevronRight size={14} />
              <Link to={`/shop?category=${setItem.category.slug}&type=sets`} className="hover:text-primary transition-colors">
                {setItem.category.name}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Set Image Gallery */}
      <div className="max-w-[1700px] mx-auto px-4 md:px-8 xl:px-12 py-4 flex flex-col items-center">
        <div className="w-full max-w-5xl">
          <div className="relative aspect-[4/5] md:aspect-video bg-white rounded-2xl overflow-hidden border border-gray-100 mb-6 shadow-sm">
            <ImageMagnifier src={heroImages[heroIdx]} />
          </div>
          
          {heroImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide justify-center">
              {heroImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setHeroIdx(idx)}
                  className={`relative w-24 h-24 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${idx === heroIdx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-300'}`}
                >
                  <img src={img} alt={`${setItem.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Set Summary Bar */}
      <div className="sticky top-[90px] z-30 bg-white border-b border-gray-100 shadow-sm py-4">
        <div className="max-w-[1700px] mx-auto px-4 md:px-8 xl:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-primary">{setItem.name}</h2>
            <div className="hidden md:block h-6 w-px bg-gray-200"></div>
            {setItem.basePrice && (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-900">৳ {discountedPrice.toLocaleString()}</span>
                {setItem.discountPercentage > 0 && (
                  <span className="text-sm text-gray-400 line-through">৳ {setItem.basePrice.toLocaleString()}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsSetEnquireOpen(true)}
              className="flex-1 md:flex-none btn bg-primary text-white hover:bg-gray-900 px-8 py-2.5 rounded-full text-sm font-medium transition-colors"
            >
              Enquire About Collection
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1700px] mx-auto px-4 md:px-8 xl:px-12 py-16">

        {/* Set Description */}
        {setItem.description && (
          <div className="max-w-3xl mx-auto text-center mb-24">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">About the Collection</h3>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-serif">
              "{setItem.description}"
            </p>
          </div>
        )}

        {/* Pieces in this Collection - GRID */}
        {setItem.products && setItem.products.length > 0 && (
          <div>
            <div className="flex items-end justify-between mb-10 border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-3xl font-serif font-bold text-primary">Shop The Look</h3>
                <p className="text-gray-500 mt-2">Discover the individual pieces that make up this stunning collection.</p>
              </div>
              <span className="text-sm font-medium text-gray-400 hidden sm:block">{setItem.products.length} Items</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
              {setItem.products.map((product: any) => (
                <div key={product.id} className="group cursor-pointer flex flex-col h-full" onClick={() => setSelectedProduct(product)}>
                  <div className="relative aspect-square mb-6 overflow-hidden bg-gray-100 rounded-xl">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 mix-blend-multiply"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                    )}
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-black text-xs font-bold tracking-wider uppercase px-6 py-3 shadow-xl rounded-full flex items-center gap-2">
                        View Details <ArrowLeft size={14} className="rotate-180" />
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 text-center px-4">
                    <h4 className="text-lg font-serif font-bold text-gray-900 group-hover:text-accent transition-colors mb-2 line-clamp-2">
                      {product.name}
                    </h4>
                    <div className="mt-auto">
                      {product.basePrice ? (
                        <p className="font-semibold text-gray-700">
                          ৳{product.discountPercentage > 0
                            ? (product.basePrice * (1 - product.discountPercentage / 100)).toLocaleString()
                            : product.basePrice.toLocaleString()
                          }
                        </p>
                      ) : (
                        <p className="font-semibold text-gray-700">{product.priceDisplay || `$${product.price}`}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Slide-out Drawer for Product Details */}
      <ProductDrawer
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Set Enquiry Modal (for the whole collection) */}
      {isSetEnquireOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-xl text-primary">Enquire About Collection</h3>
              <button onClick={() => setIsSetEnquireOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-2">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 p-4 bg-secondary/50 rounded-lg border border-gray-100">
                <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-white">
                  {setItem.imageUrls?.[0] ? (
                    <img src={setItem.imageUrls[0]} alt={setItem.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No Image</div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-primary">{setItem.name}</h4>
                  <div className="text-sm text-gray-500">Collection Set</div>
                </div>
              </div>

              {enquiryStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck size={32} />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Enquiry Sent!</h4>
                  <p className="text-gray-600">Our team will get back to you shortly regarding this collection.</p>
                </div>
              ) : (
                <form onSubmit={handleSetEnquirySubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                    <input type="text" required value={enquiryForm.name} onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })} placeholder="John Doe" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <input type="tel" required value={enquiryForm.phone} onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })} placeholder="+880 1..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input type="email" value={enquiryForm.email} onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })} placeholder="john@example.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Message *</label>
                    <textarea required rows={4} value={enquiryForm.message} onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })} placeholder="I would like to know more about customizing this collection..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none resize-none"></textarea>
                  </div>
                  <button type="submit" disabled={enquiryStatus === 'submitting'} className="w-full btn py-3 flex justify-center items-center bg-black text-white hover:bg-gray-900 border-none">
                    {enquiryStatus === 'submitting' ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : 'Send Enquiry'}
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
