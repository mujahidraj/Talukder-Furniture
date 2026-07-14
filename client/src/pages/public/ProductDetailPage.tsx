import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Share2, ChevronRight, Ruler, ShieldCheck, Truck, X, Copy, Check, ChevronLeft } from 'lucide-react';
import api from '../../lib/api';
import useWishlistStore from '../../stores/useWishlistStore';
import SEO from '../../components/seo/SEO';
import FormattedText from '../../components/ui/FormattedText';
import sanitizeHtml from '../../lib/sanitize';

// ─── Image Magnifier ────────────────────────────────────────────────────────
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

// ─── Main Page Component ────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSizeIdx, setActiveSizeIdx] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

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

  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setImageLoaded(false);

    api.get(`/products/${slug}`)
      .then(res => {
        setProduct(res.data);

        // Fetch related products from the same category
        if (res.data.category?.slug) {
          api.get(`/products?category=${res.data.category.slug}&limit=5`)
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

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
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

  // ─── Loading State ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-secondary">
        <img src="/ICON SET/LOGO.gif" alt="Loading..." className="w-56 h-56 object-contain" />
        <p className="mt-4 text-sm font-serif italic tracking-[0.15em] text-[#1a1a1a]">Loading&hellip;</p>
      </div>
    );
  }

  // ─── Not Found ──────────────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="bg-secondary min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <img src="/ICON SET/LOGO.gif" alt="Not Found" className="w-80 h-80 object-contain mb-2" />
        <h1 className="text-4xl font-serif font-bold text-primary mb-3">Product Not Found</h1>
        <p className="text-gray-500 mb-8 max-w-md">The product you are looking for does not exist or has been removed.</p>
        <Link to="/shop" className="btn btn-primary px-8 py-3">Return to Shop</Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'features', label: 'Features & Dimensions' },
    { id: 'materials', label: 'Materials' },
    { id: 'care', label: 'Care Guide' },
    { id: 'warranty', label: 'Warranty' },
    { id: 'policy', label: 'Return Policy' },
  ];

  const currentPrice = product.sizes?.[activeSizeIdx]?.price || product.basePrice;
  const hasDiscount = product.discountPercentage > 0;
  const discountedPrice = hasDiscount ? (currentPrice * (1 - product.discountPercentage / 100)) : currentPrice;

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-white min-h-screen pt-[20px] md:pt-[10px]">
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

      {/* ━━━ Breadcrumb ━━━ */}
      <div className="border-b border-gray-100 bg-[#faf9f7]">
        <div className="max-w-[1700px] mx-auto px-4 md:px-8 xl:px-12 py-3.5">
          <div className="flex items-center gap-1.5 text-xs tracking-wide text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <Link to="/" className="hover:text-primary transition-colors duration-200">Home</Link>
            <ChevronRight size={12} className="flex-shrink-0" />
            <Link to="/shop" className="hover:text-primary transition-colors duration-200">Shop</Link>
            {product.category && (
              <>
                <ChevronRight size={12} className="flex-shrink-0" />
                <Link to={`/shop?category=${product.category.slug}`} className="hover:text-primary transition-colors duration-200">
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight size={12} className="flex-shrink-0" />
            <span className="text-primary font-medium truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      {/* ━━━ Main Product Section ━━━ */}
      <div className="max-w-[1700px] mx-auto px-4 md:px-8 xl:px-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 xl:gap-20 pt-6 md:pt-10 pb-16 md:pb-24">

          {/* ── Image Gallery ── */}
          <div className="lg:w-[58%] xl:w-[60%]">
            <div className="lg:sticky lg:top-24">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#f5f3f0] group">
                {product.images && product.images.length > 0 ? (
                  <div className="w-full h-full" style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.4s ease' }}>
                    <ImageMagnifier src={product.images[activeImage].url} />
                    <img
                      src={product.images[activeImage].url}
                      alt=""
                      className="hidden"
                      onLoad={() => setImageLoaded(true)}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg font-serif italic">
                    No Image Available
                  </div>
                )}

                {/* Image loading skeleton */}
                {!imageLoaded && product.images?.length > 0 && (
                  <div className="absolute inset-0 skeleton" />
                )}

                {/* Featured Badge */}
                {product.isFeatured && (
                  <div className="absolute top-5 left-5 bg-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-lg">
                    Featured
                  </div>
                )}

                {/* Discount Badge */}
                {hasDiscount && (
                  <div className="absolute top-5 right-5 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg tracking-wider">
                    -{product.discountPercentage}%
                  </div>
                )}

                {/* Image Navigation Arrows */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-700 hover:bg-white hover:scale-105 transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setActiveImage(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-700 hover:bg-white hover:scale-105 transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {product.images && product.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                    {activeImage + 1} / {product.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {product.images && product.images.length > 1 && (
                <div className="mt-4 flex gap-2.5 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {product.images.map((img: any, idx: number) => (
                    <button
                      key={img.id || idx}
                      onClick={() => { setActiveImage(idx); setImageLoaded(false); }}
                      className={`relative flex-shrink-0 w-[72px] h-[72px] md:w-20 md:h-20 rounded-xl overflow-hidden transition-all duration-300 ${
                        activeImage === idx
                          ? 'ring-2 ring-primary ring-offset-2 scale-[1.02]'
                          : 'ring-1 ring-gray-200 opacity-60 hover:opacity-100 hover:ring-gray-400'
                      }`}
                    >
                      <img src={img.url} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Product Info Panel ── */}
          <div className="lg:w-[42%] xl:w-[40%] flex flex-col">
            {/* Category & SKU header */}
            <div className="flex items-center justify-between mb-4">
              {product.category && (
                <Link
                  to={`/shop?category=${product.category.slug}`}
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 hover:text-primary transition-colors duration-200"
                >
                  {product.category.name}
                </Link>
              )}
              <span className="text-[11px] font-mono tracking-wider text-gray-300">
                {product.sku}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl md:text-[2.5rem] font-serif font-bold text-primary leading-tight mb-5">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6 md:mb-8">
              {currentPrice ? (
                <>
                  <span className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
                    ৳ {Math.round(discountedPrice).toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-lg text-gray-300 line-through font-medium mb-0.5">
                        ৳ {currentPrice.toLocaleString()}
                      </span>
                      <span className="text-sm font-bold text-red-500 bg-red-50 px-4 py-1.5 rounded-full mb-0.5 tracking-wider">
                        -{product.discountPercentage}% OFF
                      </span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-3xl font-bold text-primary">{product.priceDisplay || `$${product.price}`}</span>
              )}
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-gray-200 via-gray-200 to-transparent mb-8" />

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-primary uppercase tracking-[0.15em]">Size / Dimension</span>
                  <span className="text-xs text-gray-400">{product.sizes.length} available</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((size: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSizeIdx(idx)}
                      className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                        activeSizeIdx === idx
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'bg-[#f5f3f0] text-gray-600 hover:bg-gray-200 hover:text-primary'
                      }`}
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
                <span className="block text-xs font-bold text-primary uppercase tracking-[0.15em] mb-3">
                  Color Options
                </span>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color: any, idx: number) => (
                    <div key={idx} className="group relative">
                      <div
                        className="w-9 h-9 rounded-full cursor-pointer shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-md ring-2 ring-offset-2 ring-transparent hover:ring-gray-300"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 bg-primary text-white text-[10px] py-1 px-2.5 rounded-md whitespace-nowrap z-10 pointer-events-none font-medium">
                        {color.name}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overview text */}
            {product.overview && (
              <div className="prose prose-sm text-gray-500 leading-relaxed mb-8 [&_p]:mb-2 [&_strong]:text-primary" dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.overview) }} />
            )}

            {/* ── Action Buttons ── */}
            <div className="flex flex-col gap-3 mb-8">
              <button
                onClick={() => setIsEnquireOpen(true)}
                className="w-full py-4 px-8 bg-primary text-white text-sm font-bold uppercase tracking-[0.15em] rounded-xl hover:bg-gray-900 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 active:scale-[0.98]"
              >
                Enquire About This Item
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleWishlistToggle}
                  className={`flex-1 py-3.5 px-6 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all duration-300 active:scale-[0.98] ${
                    isWishlisted
                      ? 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100'
                      : 'bg-[#f5f3f0] text-gray-600 hover:bg-gray-200 hover:text-primary border border-transparent'
                  }`}
                >
                  <Heart size={18} className={isWishlisted ? "fill-current" : ""} />
                  {isWishlisted ? 'Saved' : 'Wishlist'}
                </button>

                <button
                  onClick={handleShare}
                  className="py-3.5 px-5 bg-[#f5f3f0] text-gray-600 rounded-xl hover:bg-gray-200 hover:text-primary transition-all duration-300 flex items-center gap-2 text-sm font-semibold active:scale-[0.98] border border-transparent"
                >
                  {linkCopied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  {linkCopied ? 'Copied!' : 'Share'}
                </button>
              </div>
            </div>

            {/* ── Trust Signals ── */}
            <div className="bg-[#faf9f7] rounded-2xl p-5 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  <Truck size={17} className="text-primary" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-primary block">Free Delivery</span>
                  <span className="text-xs text-gray-400">Nationwide on orders over ৳50,000</span>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={17} className="text-primary" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-primary block">10-Year Warranty</span>
                  <span className="text-xs text-gray-400">On solid wood frames</span>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  <Ruler size={17} className="text-primary" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-primary block">Custom Dimensions</span>
                  <span className="text-xs text-gray-400">Available upon request</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ━━━ Tabs Section ━━━ */}
        <div className="border-t border-gray-100 pt-12 md:pt-16 pb-16 md:pb-24">
          {/* Tab Headers */}
          <div ref={tabsRef} className="relative flex overflow-x-auto scrollbar-hide border-b border-gray-200 mb-10 md:mb-14" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-shrink-0 py-4 px-5 md:px-8 text-sm font-semibold whitespace-nowrap transition-colors duration-300 ${
                  activeTab === tab.id
                    ? 'text-primary'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
                {/* Active indicator */}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-[2px] bg-primary transition-all duration-300 ${
                    activeTab === tab.id ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl">
            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed [&_p]:mb-4 [&_h2]:text-primary [&_h3]:text-primary [&_strong]:text-primary [&_li]:mb-1">
              {activeTab === 'overview' && (
                <FormattedText content={product.overview} defaultText="<p>No detailed overview provided.</p>" />
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
                        <FormattedText content={product.keyFeatures} defaultText="<p>Key features information is currently unavailable.</p>" />
                        {activeDim && (
                          <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-2 mb-3">
                              <Ruler size={16} className="text-primary" />
                              <strong className="text-primary text-sm uppercase tracking-wider">Selected Size Dimensions</strong>
                            </div>
                            <p className="text-gray-600 bg-[#faf9f7] px-5 py-3 rounded-xl">{activeDim}</p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
              {activeTab === 'materials' && (
                <FormattedText content={product.materials} defaultText="<p>Material information is currently unavailable.</p>" />
              )}
              {activeTab === 'care' && (
                <FormattedText content={product.careMaintenance} defaultText="<p>Wipe clean with a damp cloth. Avoid harsh chemicals.</p>" />
              )}
              {activeTab === 'warranty' && (
                <FormattedText content={product.warrantyInfo} defaultText="<p>This product comes with a standard 10-year manufacturing warranty covering defects in materials and workmanship for solid wood frames, and a 1-year warranty for upholstery.</p>" />
              )}
              {activeTab === 'policy' && (
                <FormattedText content={product.returnExchangePolicy} defaultText="<p><strong>Returns:</strong> We accept returns within 30 days of delivery. Custom-made or modified pieces are non-returnable unless there is a manufacturing defect.</p>" />
              )}
            </div>
          </div>
        </div>

        {/* ━━━ Related Products ━━━ */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-gray-100 pt-16 md:pt-20 pb-20 md:pb-28">
            <div className="text-center mb-10 md:mb-14">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 block mb-2">You May Also Like</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">Recommended For You</h2>
            </div>
            <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7 snap-x snap-mandatory pb-4 sm:pb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {relatedProducts.map((p, idx) => (
                <div key={p.id || p._id || p.slug || idx} className="group flex flex-col w-[200px] sm:w-auto snap-start shrink-0">
                  <Link to={`/products/${p.slug}`} className="relative aspect-[4/3] overflow-hidden rounded-xl mb-4 bg-[#f5f3f0] block">
                    {p.images && p.images.length > 0 ? (
                      <img
                        src={p.images[0].url}
                        alt={p.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 font-serif italic">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                  </Link>
                  <Link to={`/products/${p.slug}`} className="group/link">
                    <h3 className="font-bold text-primary text-sm md:text-base truncate group-hover/link:text-gray-600 transition-colors duration-200">{p.name}</h3>
                  </Link>
                  {p.category && (
                    <span className="text-[11px] text-gray-400 mb-1 tracking-wide">{p.category.name}</span>
                  )}
                  <span className="font-bold text-primary text-sm md:text-base">
                    {p.basePrice
                      ? `৳ ${(p.discountPercentage > 0
                          ? Math.round(p.basePrice * (1 - p.discountPercentage / 100))
                          : p.basePrice
                        ).toLocaleString()}`
                      : p.priceDisplay || 'Contact for Price'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ━━━ Enquiry Modal ━━━ */}
      {isEnquireOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsEnquireOpen(false); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" style={{ animation: 'fadeIn 0.2s ease' }} />

          {/* Modal */}
          <div
            className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            style={{ animation: 'slideUp 0.3s ease' }}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-xl text-primary">Enquire About This Item</h3>
                <p className="text-xs text-gray-400 mt-0.5">We'll get back to you within 24 hours</p>
              </div>
              <button
                onClick={() => setIsEnquireOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Product Summary */}
            <div className="px-6 pt-5">
              <div className="flex items-center gap-4 p-3.5 bg-[#faf9f7] rounded-xl border border-gray-100">
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white shadow-sm">
                  {product.images?.[0]?.url ? (
                    <img src={product.images[0].url} alt={product.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-xs">No Img</div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-primary text-sm truncate">{product.name}</h4>
                  <div className="text-[11px] text-gray-400 font-mono">{product.sku || 'N/A'}</div>
                </div>
                {currentPrice && (
                  <span className="ml-auto font-bold text-primary text-sm whitespace-nowrap">
                    ৳ {Math.round(discountedPrice).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {enquiryStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-primary mb-2">Enquiry Sent!</h4>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">Thank you for reaching out. Our team will get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={enquiryForm.name}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-[#faf9f7] border border-gray-200 rounded-xl text-sm text-primary placeholder:text-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">Phone *</label>
                      <input
                        type="tel"
                        required
                        value={enquiryForm.phone}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                        placeholder="+880 1..."
                        className="w-full px-4 py-3 bg-[#faf9f7] border border-gray-200 rounded-xl text-sm text-primary placeholder:text-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">Email</label>
                      <input
                        type="email"
                        value={enquiryForm.email}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 bg-[#faf9f7] border border-gray-200 rounded-xl text-sm text-primary placeholder:text-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5">Message *</label>
                    <textarea
                      required
                      rows={3}
                      value={enquiryForm.message}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                      placeholder="I would like to know more about delivery time and customization options..."
                      className="w-full px-4 py-3 bg-[#faf9f7] border border-gray-200 rounded-xl text-sm text-primary placeholder:text-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 resize-none"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={enquiryStatus === 'submitting'}
                    className="w-full py-3.5 bg-primary text-white text-sm font-bold uppercase tracking-[0.15em] rounded-xl hover:bg-gray-900 transition-all duration-300 disabled:opacity-60 flex items-center justify-center"
                  >
                    {enquiryStatus === 'submitting' ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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

      {/* Modal Animations (inline keyframes) */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}


