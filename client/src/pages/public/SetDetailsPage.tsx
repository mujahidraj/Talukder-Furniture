import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Heart, Share2, ShieldCheck, Truck, Ruler, X, Phone, ShoppingBag, Info, ExternalLink, MessageSquare, ArrowLeft, Wrench } from 'lucide-react';
import api from '../../lib/api';
import useWishlistStore from '../../stores/useWishlistStore';
import FormattedText from '../../components/ui/FormattedText';
import SEO from '../../components/seo/SEO';
import sanitizeHtml from '../../lib/sanitize';

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
                              <span className="text-red-700 line-through text-sm mt-1 font-semibold">
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
                          className={`px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${activeSizeIdx === idx ? 'border-accent bg-accent text-white' : 'border-gray-200 text-gray-700 hover:border-[#E51C2A] hover:text-[#E51C2A]'}`}
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
                          <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity bg-accent text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                            {color.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {/* Actions */}
                <div className="flex flex-col gap-3 mt-auto">
                  <button
                    onClick={handleWishlistToggle}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-accent text-white hover:bg-[#E51C2A] font-medium rounded transition-colors"
                  >
                    <Heart size={18} className={isWishlisted ? "fill-current text-[#E32227] border-none" : ""} />
                    {isWishlisted ? 'Saved to Wishlist' : 'Save for Later'}
                  </button>
                  <button
                    onClick={() => setIsEnquireOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-accent text-white font-medium rounded hover:bg-[#E51C2A] transition-colors"
                  >
                    <MessageSquare size={18} />
                    Enquire About This Item
                  </button>
                  <Link
                    to={`/products/${product.slug}`}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-500 hover:text-[#E51C2A] transition-colors mt-2"
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
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.overview || '<p>No detailed overview provided.</p>') }} />
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
                          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.keyFeatures || '<p>Key features information is currently unavailable.</p>') }} />
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
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.materials || '<p>Material information is currently unavailable.</p>') }} />
                )}
                {activeTab === 'care' && (
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.careMaintenance || '<p>Wipe clean with a damp cloth. Avoid harsh chemicals.</p>') }} />
                )}
                {activeTab === 'warranty' && (
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.warrantyInfo || '<p>This product comes with a standard 10-year manufacturing warranty.</p>') }} />
                )}
                {activeTab === 'policy' && (
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.returnExchangePolicy || '<p><strong>Returns:</strong> We accept returns within 30 days of delivery.</p>') }} />
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
                  <button type="submit" disabled={enquiryStatus === 'submitting'} className="w-full btn py-4 flex justify-center items-center bg-accent text-white hover:bg-[#E51C2A] border-none rounded mt-4">
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


// Custom Formatter to make the Set Description look ultra-premium with Tabs
const SetDescriptionFormatter = ({ content }: { content: string }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!content) return null;

  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  const overviewLines: string[] = [];
  const materialLines: string[] = [];
  const measurementLines: string[] = [];

  let currentSection = 'overview';

  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('material & finish') || lowerLine.includes('materials & finish')) {
      currentSection = 'material';
      return; // skip the header line itself
    }
    if (lowerLine.includes('measurements')) {
      currentSection = 'measurements';
      return; // skip the header line itself
    }

    if (currentSection === 'overview') overviewLines.push(line);
    else if (currentSection === 'material') materialLines.push(line);
    else if (currentSection === 'measurements') measurementLines.push(line);
  });

  const renderSectionLines = (sectionLines: string[], sectionType: string) => {
    return (
      <div className="flex flex-col gap-4 animate-fade-in pt-2">
        {sectionLines.map((line, idx) => {
          // Heading / Subtitle
          if (idx === 0 && sectionType === 'overview' && !line.includes(':') && !line.toLowerCase().includes('material')) {
            return <h4 key={`desc-${idx}`} className="text-xl md:text-2xl font-serif text-gray-800 mb-2 leading-snug">{line}</h4>;
          }

          // Key-Value pairs
          if (line.includes(':')) {
            const [key, ...rest] = line.split(':');
            const value = rest.join(':').trim();
            return (
              <div key={`desc-${idx}`} className="text-sm md:text-base leading-relaxed text-gray-600 bg-gray-50/50 p-4 rounded-xl border border-gray-100/50 hover:border-gray-200 transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
                <strong className="text-gray-900 font-bold tracking-wide">{key.trim()}:</strong> <span className="text-gray-600">{value}</span>
              </div>
            );
          }

          // Standard paragraph
          return (
            <p key={`desc-${idx}`} className="text-sm md:text-base leading-relaxed text-gray-600 pl-1">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'material', label: 'Material & Finish' },
    { id: 'measurements', label: 'Measurements' }
  ];

  return (
    <div>
      <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200 mb-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {tabs.map((tab) => {
          if (tab.id === 'material' && materialLines.length === 0) return null;
          if (tab.id === 'measurements' && measurementLines.length === 0) return null;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative py-4 px-6 text-sm font-bold tracking-wide transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'text-accent' : 'text-gray-400 hover:text-[#E51C2A]'
              }`}
            >
              {tab.label}
              <span
                className={`absolute bottom-0 left-0 right-0 h-[2px] bg-accent transition-all duration-300 ${
                  activeTab === tab.id ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                }`}
              />
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && renderSectionLines(overviewLines, 'overview')}
      {activeTab === 'material' && renderSectionLines(materialLines, 'material')}
      {activeTab === 'measurements' && renderSectionLines(measurementLines, 'measurements')}
    </div>
  );
};


export default function SetDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [setItem, setSetItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedSets, setRelatedSets] = useState<any[]>([]);

  // Modal / Drawer state
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Set Enquiry Modal State
  const [isSetEnquireOpen, setIsSetEnquireOpen] = useState(false);
  const [enquiryStatus, setEnquiryStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [enquiryForm, setEnquiryForm] = useState({ name: '', phone: '', email: '', message: '' });

  // Hero Slider State
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    api.get(`/sets/${slug}`)
      .then(res => {
        const data = res.data;
        if (!data.imageUrls) data.imageUrls = [];
        if (data.imageUrls.length === 0 && data.imageUrl) data.imageUrls = [data.imageUrl];
        setSetItem(data);

        // Fetch related sets
        const categorySlug = data.category?.slug;
        const url = categorySlug ? `/sets?category=${categorySlug}&limit=5` : `/sets?limit=5`;
        api.get(url)
          .then(relatedRes => {
            const setsArray = relatedRes.data.sets || [];
            const filtered = setsArray.filter((s: any) => s.id !== data.id).slice(0, 4);
            setRelatedSets(filtered);
          })
          .catch(console.error);
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
        <img src="/ICON SET/LOGO.gif" alt="Loading..." className="w-56 h-56 object-contain" />
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
    <div className="bg-gradient-to-b from-white via-sky-50 to-blue-50 min-h-screen pb-20 pt-[76px]">
      <SEO
        title={`${setItem.name} | Talukder Furniture Collections`}
        description={setItem.description || `Explore the ${setItem.name} collection.`}
        type="product"
        image={setItem.imageUrls?.[0]}
        url={`/collections/${setItem.slug}`}
      />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 xl:px-12 pt-0 pb-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-3 text-gray-500 text-sm mb-6 font-medium">
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

        {/* Top Title Section */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-primary mb-3 leading-tight">{setItem.name}</h1>
          {setItem.sku && (
            <div className="text-gray-500 tracking-widest text-xs uppercase font-bold">
              SKU: <span className="text-gray-900">{setItem.sku}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-12 xl:gap-16">
          {/* Left Column: Image Gallery */}
          <div className="w-full lg:w-[60%]">
            <div className="relative w-full bg-white rounded-2xl overflow-hidden mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
              <ImageMagnifier src={heroImages[heroIdx]} height="auto" />
            </div>
            
            {heroImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 pt-2 scrollbar-hide">
                {heroImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setHeroIdx(idx)}
                    className={`relative w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 ${idx === heroIdx ? 'ring-2 ring-primary ring-offset-2 opacity-100' : 'opacity-60 hover:opacity-100 border border-gray-200'}`}
                  >
                    <img src={img} alt={`${setItem.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="w-full lg:w-[40%] flex flex-col">
            <div className="sticky top-[120px]">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-3xl font-bold text-gray-900">৳ {discountedPrice.toLocaleString()}</span>
                {setItem.discountPercentage > 0 && (
                  <span className="text-lg text-red-700 line-through font-semibold">৳ {setItem.basePrice.toLocaleString()}</span>
                )}
              </div>

              {/* Items in this Collection (Moved to Right Sidebar) */}
              {setItem.products && setItem.products.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-primary mb-4 border-b border-gray-200 pb-2">Includes {setItem.products.length} Items</h3>
                  <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {setItem.products.map((product: any) => (
                      <div key={product.id} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:border-primary transition-colors group" onClick={() => setSelectedProduct(product)}>
                        <div className="w-20 h-20 bg-[#f8f8f8] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                           {product.images?.[0] ? (
                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Image</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h4>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {product.basePrice ? (
                              <>
                                <span className="text-sm font-bold text-primary">
                                  ৳{(product.discountPercentage > 0 ? product.basePrice * (1 - product.discountPercentage / 100) : product.basePrice).toLocaleString()}
                                </span>
                                {product.discountPercentage > 0 && (
                                  <>
                                    <span className="text-xs text-red-700 line-through font-semibold">
                                      ৳{product.basePrice.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] font-bold text-white bg-[#E32227] px-1.5 py-0.5 rounded uppercase tracking-wider">
                                      -{product.discountPercentage}%
                                    </span>
                                  </>
                                )}
                              </>
                            ) : (
                              <span className="text-sm font-bold text-primary">
                                {product.priceDisplay || `$${product.price}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#E51C2A] group-hover:text-white transition-colors flex-shrink-0">
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsSetEnquireOpen(true)}
                  className="w-full btn bg-accent text-white hover:bg-[#E51C2A] py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3"
                >
                  <MessageSquare size={18} />
                  Enquire About Collection
                </button>
                <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-500 font-medium">
                  <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-accent" /> Premium Quality</span>
                  <span className="flex items-center gap-2"><Truck size={16} className="text-accent" /> Secure Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Set Description Section (Moved Below) */}
        {setItem.description && (
          <div className="mt-16 md:mt-24 w-full bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-2xl md:text-3xl font-serif text-primary mb-8 font-bold border-b border-gray-100 pb-4">Collection Details</h3>
            <SetDescriptionFormatter content={setItem.description} />
          </div>
        )}

        {/* Recommended Collections */}
        {relatedSets.length > 0 && (
          <div className="mt-24 md:mt-32 pb-12">
            <div className="flex flex-col items-center text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-serif text-primary mb-4">You May Also Like</h3>
              <div className="w-12 h-1 bg-accent mb-6 rounded-full"></div>
              <p className="text-gray-500 max-w-2xl text-lg">Explore other beautiful collections that might catch your eye.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedSets.map((set) => (
                <Link key={set.id} to={`/collections/${set.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                    {set.imageUrls && set.imageUrls.length > 0 ? (
                      <img src={set.imageUrls[0]} alt={set.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                    )}
                    {set.discountPercentage > 0 && (
                      <div className="absolute top-4 left-4 bg-accent text-white px-3 py-1 text-xs font-bold rounded-full shadow-md">
                        -{set.discountPercentage}%
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h4 className="text-lg font-serif font-bold text-gray-900 group-hover:text-primary transition-colors mb-1.5 line-clamp-2">{set.name}</h4>
                    {set.category && <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">{set.category.name}</p>}
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-bold text-primary text-lg">
                          {set.basePrice ? `৳${(set.discountPercentage > 0 ? Math.round(set.basePrice * (1 - set.discountPercentage/100)) : set.basePrice).toLocaleString()}` : 'View Details'}
                        </span>
                        {set.basePrice && set.discountPercentage > 0 && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px] text-red-700 line-through font-semibold">
                              ৳{set.basePrice.toLocaleString()}
                            </span>
                            <span className="text-[9px] bg-[#E32227] text-white font-bold tracking-wider px-1 py-0.5 rounded-sm uppercase">-{set.discountPercentage}%</span>
                          </div>
                        )}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#E51C2A] group-hover:text-white transition-colors">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
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
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all">
            <div className="bg-gray-50 px-8 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-xl text-primary font-serif">Enquire About Collection</h3>
              <button onClick={() => setIsSetEnquireOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-200">
                <X size={24} />
              </button>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-5 mb-8 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#f8f8f8] border border-gray-50">
                  {setItem.imageUrls?.[0] ? (
                    <img src={setItem.imageUrls[0]} alt={setItem.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No Image</div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-primary font-serif text-lg">{setItem.name}</h4>
                  <div className="text-sm text-gray-500 mt-1 font-medium tracking-wide uppercase">Collection Set</div>
                </div>
              </div>

              {enquiryStatus === 'success' ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck size={40} />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-3 font-serif">Enquiry Sent!</h4>
                  <p className="text-gray-600">Our team will get back to you shortly regarding this collection.</p>
                </div>
              ) : (
                <form onSubmit={handleSetEnquirySubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name *</label>
                    <input type="text" required value={enquiryForm.name} onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })} placeholder="John Doe" className="w-full px-5 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all bg-gray-50 focus:bg-white" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number *</label>
                      <input type="tel" required value={enquiryForm.phone} onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })} placeholder="+880 1..." className="w-full px-5 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all bg-gray-50 focus:bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                      <input type="email" value={enquiryForm.email} onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })} placeholder="john@example.com" className="w-full px-5 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all bg-gray-50 focus:bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Message *</label>
                    <textarea required rows={4} value={enquiryForm.message} onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })} placeholder="I would like to know more about customizing this collection..." className="w-full px-5 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none resize-none transition-all bg-gray-50 focus:bg-white"></textarea>
                  </div>
                  <button type="submit" disabled={enquiryStatus === 'submitting'} className="w-full btn py-4 mt-2 flex justify-center items-center bg-accent text-white hover:bg-[#E51C2A] border-none rounded-xl text-sm font-bold tracking-widest uppercase transition-all shadow-lg">
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


