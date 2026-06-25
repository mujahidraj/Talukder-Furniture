import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ChevronRight, ChevronLeft, Truck, RotateCcw, Headphones, Award, ArrowRight } from 'lucide-react';
import type { Swiper as SwiperType } from 'swiper';
import SEO from '../../components/seo/SEO';
import api from '../../lib/api';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

/* ================================================================
   IMAGE SOURCES — Using picsum.photos for reliability
   In production, these will be replaced by real product images
   ================================================================ */

const IMG = {
  heroBed: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=1200&q=80',
  heroLiving: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80',
  sideLeft: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=600&q=80',
  sideRightTop: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=400&q=80',
  sideRightBottom: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6ea?auto=format&fit=crop&w=400&q=80',
  
  catOffice: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=200&q=80', // Maps to p3 (Director Table)
  catLiving: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=200&q=80', // Maps to p5 (Sofa)
  catDining: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=200&q=80',
  catBed: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=200&q=80', // Maps to br1 (Bedroom)
  catKids: 'https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=200&q=80',
  catIndustrial: 'https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&w=200&q=80',
  catHospital: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=200&q=80', // Hospital bed
  
  p1: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=400&q=80',
  p2: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80',
  p3: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80',
  p4: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
  p5: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=400&q=80',
  p6: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=400&q=80',
  p7: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=400&q=80',
  p8: 'https://images.unsplash.com/photo-1506898667547-42e22a46e125?auto=format&fit=crop&w=400&q=80',
  
  curatedBig: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80',
  curatedChair: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80',
  
  br1: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=400&q=80',
  br2: 'https://images.unsplash.com/photo-1522771730844-47fb5bd199dd?auto=format&fit=crop&w=400&q=80',
  br3: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=400&q=80',
  br4: 'https://images.unsplash.com/photo-1556020685-e631933dfd8c?auto=format&fit=crop&w=400&q=80',
  
  tagShoe: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=100&q=80',
  tagTV: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=100&q=80',
  tagBook: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=100&q=80',
  tagBed: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=100&q=80',
  tagRead: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6ea?auto=format&fit=crop&w=100&q=80',
};

/* ====== DATA ====== */

const heroSlides = [
  {
    id: 1,
    title: 'Talukder Bedroom\nSet',
    image: IMG.heroBed,
    link: '/products/bedroom-sets',
  },
  {
    id: 2,
    title: 'Premium Office\nFurniture',
    image: IMG.sideLeft,
    link: '/products/office-furniture',
  },
  {
    id: 3,
    title: 'Modern Dining\nCollection',
    image: IMG.sideRightTop,
    link: '/products/dining',
  },
  {
    id: 4,
    title: 'Elegant Living\nSpaces',
    image: IMG.sideRightBottom,
    link: '/products/living-room',
  },
  {
    id: 5,
    title: 'Luxury Office\nSetup',
    image: IMG.p5,
    link: '/products/office-furniture',
  },
];

const categoryPills = [
  { name: 'Office Furniture', slug: 'office', image: IMG.catOffice },
  { name: 'Living Furniture', slug: 'living-room', image: IMG.catLiving },
  { name: 'Dining Room', slug: 'dining-room', image: IMG.catDining },
  { name: 'Bed Room', slug: 'bedroom', image: IMG.catBed },
  { name: 'Kids Room', slug: 'study-room', image: IMG.catKids },
  { name: 'Industrial Furniture', slug: 'industrial', image: IMG.catIndustrial },
  { name: 'Hospital Furniture', slug: 'hospital', image: IMG.catHospital },
];

const products = [
  { id: 1, name: 'Laminated Office Cupboard', price: '৳ 0.00', slug: 'laminated-office-cupboard-1', image: IMG.p1 },
  { id: 2, name: 'Laminated Office Cupboard', price: '৳ 0.00', slug: 'laminated-office-cupboard-2', image: IMG.p2 },
  { id: 3, name: 'MD Director Table', price: '৳ 0.00', slug: 'md-director-table-1', image: IMG.p3 },
  { id: 4, name: 'MD Director Table', price: '৳ 0.00', slug: 'md-director-table-2', image: IMG.p4 },
  { id: 5, name: 'Luxury Office Sofa Set (3+1+1 Seater)', price: '৳ 0.00', slug: 'luxury-office-sofa-1', image: IMG.p5 },
  { id: 6, name: 'Luxury Office Sofa Set (3+1+1 Seater)', price: '৳ 0.00', slug: 'luxury-office-sofa-2', image: IMG.p6 },
  { id: 7, name: 'Waiting Office Sofa', price: '৳ 0.00', slug: 'waiting-office-sofa-1', image: IMG.p7 },
  { id: 8, name: 'Waiting Office Sofa', price: '৳ 0.00', slug: 'waiting-office-sofa-2', image: IMG.p8 },
];

const livingRoomMockProducts = [
  { id: 10, name: 'Living Room Sofa', price: '৳ 0.00', slug: 'living-sofa-1', image: IMG.p5 },
  { id: 11, name: 'Living Room Sofa', price: '৳ 0.00', slug: 'living-sofa-2', image: IMG.p6 },
  { id: 12, name: 'Waiting Sofa', price: '৳ 0.00', slug: 'waiting-sofa-1', image: IMG.p7 },
  { id: 13, name: 'Waiting Sofa', price: '৳ 0.00', slug: 'waiting-sofa-2', image: IMG.p8 },
];

const quickTags = [
  { name: 'Director Table', image: IMG.p3 },
  { name: 'File Cabinet', image: IMG.p2 },
  { name: 'Office Almirah', image: IMG.p1 },
  { name: 'Conference Table', image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=100&q=80' },
  { name: 'Shoe Rack', image: IMG.tagShoe },
  { name: 'TV Cabinet', image: IMG.tagTV },
  { name: 'Reading Table', image: IMG.tagRead },
];

const signatureCollections = [
  'Talukder Prestige Collection',
  'Cozy Sofa Collection',
  'Dining Elegance Collection',
  'Comfortable Bedroom Collection',
];

const trustBadges = [
  { icon: Truck, title: 'Free & fast delivery', desc: 'No extra cost, just the price you see' },
  { icon: RotateCcw, title: '14-Day Returns', desc: 'Risk-free shopping with easy returns' },
  { icon: Headphones, title: '24/7 Support', desc: '24/7 support, always here just for you' },
  { icon: Award, title: 'Member Discounts', desc: 'Special prices for our loyal customers' },
];

/* ====== COMPONENT ====== */

export default function HomePage() {
  const livingRoomSwiperRef = useRef<SwiperType | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [livingRoomProducts, setLivingRoomProducts] = useState<any[]>([]);
  const [dynamicHeroSlides, setDynamicHeroSlides] = useState<any[]>([]);
  const [loadingHero, setLoadingHero] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingLivingRoom, setLoadingLivingRoom] = useState(true);

  useEffect(() => {
    // Fetch general featured products
    api.get('/products?isFeatured=true&limit=8').then(res => {
      setFeaturedProducts(res.data.products || []);
    }).catch(console.error).finally(() => setLoadingFeatured(false));

    // Fetch living room category products
    api.get('/products?category=living-room&limit=10').then(res => {
      setLivingRoomProducts(res.data.products || []);
    }).catch(console.error).finally(() => setLoadingLivingRoom(false));

    // Fetch active hero slides
    api.get('/hero-slides?active=true').then(res => {
      setDynamicHeroSlides(res.data || []);
    }).catch(console.error).finally(() => setLoadingHero(false));
  }, []);

  const finalHeroSlides = dynamicHeroSlides.length > 0 ? dynamicHeroSlides : heroSlides;
  const isLoading = loadingHero || loadingFeatured || loadingLivingRoom;

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <SEO title="Home" description="Loading..." />
        {/* Skeleton Hero */}
        <div className="w-full h-[550px] md:h-[calc(100vh-160px)] md:min-h-[550px] bg-gray-200 animate-pulse rounded-b-2xl relative flex flex-col items-center justify-center px-5">
          <div className="w-3/4 md:w-1/2 h-12 md:h-16 bg-gray-300 rounded mb-4" />
          <div className="w-1/2 md:w-1/3 h-12 md:h-16 bg-gray-300 rounded mb-6" />
          <div className="w-5/6 md:w-1/2 h-4 md:h-5 bg-gray-300 rounded mb-8" />
          <div className="w-40 h-10 md:h-12 bg-gray-300 rounded-full" />
        </div>
        
        {/* Skeleton Categories */}
        <div className="py-[60px] max-w-[1200px] mx-auto w-full px-5">
          <div className="grid grid-cols-2 md:hidden gap-y-8 gap-x-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-[120px] h-[60px] bg-gray-200 rounded-full animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
              </div>
            ))}
          </div>
          <div className="hidden md:flex flex-col gap-10 items-center">
            <div className="flex gap-10">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-32 h-16 lg:w-40 lg:h-20 bg-gray-200 rounded-full animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Skeleton Products */}
        <div className="py-[40px] max-w-[1800px] mx-auto w-full px-6 xl:px-12">
          <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-2 animate-pulse" />
          <div className="h-5 bg-gray-200 rounded w-48 mx-auto mb-8 animate-pulse" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-[48px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4 animate-pulse" />
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SEO
        title="Home"
        description="Talukder Furniture — Premium craftsmanship for your home."
      />

      {/* ═══════════════════════════════════════════
          1. HERO SECTION (Continuous Carousel)
         ═══════════════════════════════════════════ */}
      <section style={{ width: '100%', overflow: 'hidden', paddingBottom: '60px', backgroundColor: 'transparent' }}>
        <div style={{ width: '100%', position: 'relative' }}>
          {!loadingHero && (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation={{
              prevEl: '.hero-prev',
              nextEl: '.hero-next',
            }}
            pagination={{ clickable: true, el: '.hero-pagination' }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            speed={1200}
            loop={true}
            centeredSlides={true}
            breakpoints={{
              320: { slidesPerView: 1.1, spaceBetween: 12 },
              768: { slidesPerView: 1.2, spaceBetween: 20 },
              1024: { slidesPerView: 1.4, spaceBetween: 24 }
            }}
            style={{ paddingBottom: '0px' }}
          >
            {finalHeroSlides.map((slide, index) => (
              <SwiperSlide key={`${slide.id}-${index}`} style={{ height: 'auto', display: 'flex' }}>
                {({ isActive }) => (
                  <div className="relative w-full h-[550px] md:h-[calc(100vh-160px)] md:min-h-[550px] rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                    <img
                      src={slide.imageUrl ? (slide.imageUrl.startsWith('http') ? slide.imageUrl : `${import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:5000'}${slide.imageUrl}`) : slide.image}
                      alt={slide.title}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {/* Gradient overlay only on the active slide to make text readable */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: isActive ? 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' : 'transparent',
                      transition: 'background 1.2s ease'
                    }} />

                    {/* Framer Motion Text content */}
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                      zIndex: 10, padding: '0 20px', marginTop: '20px',
                      pointerEvents: isActive ? 'auto' : 'none'
                    }}>
                      <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                        className="text-white text-3xl md:text-5xl lg:text-[3.5rem] font-[400] mb-3 md:mb-4 whitespace-pre-line leading-tight md:leading-[1.1] font-serif"
                        style={{
                          textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                        }}
                      >
                        {slide.title}
                      </motion.h1>

                      <motion.p
                        initial={{ opacity: 0, y: 40 }}
                        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                        className="text-white text-xs md:text-sm max-w-[300px] md:max-w-[500px] mb-6 md:mb-8 font-light"
                        style={{
                          textShadow: '0 1px 4px rgba(0,0,0,0.5)'
                        }}
                      >
                        {slide.subtitle || 'Get superior support and better posture with ergonomic chairs for long work hours'}
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
                      >
                        <Link
                          to={slide.ctaLink || slide.link || '/shop'}
                          className="inline-flex items-center gap-2 bg-white/60 hover:bg-white/80 text-[#1a1a1a] px-6 py-2.5 md:px-8 md:py-3.5 text-[13px] md:text-[15px] font-semibold rounded-full transition-all no-underline shadow-[0_4px_15px_rgba(0,0,0,0.1)] backdrop-blur-sm"
                        >
                          {slide.ctaText || 'Explore Collection'} <ArrowRight size={16} strokeWidth={2.5} />
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}

            {/* Navigation Arrows positioned on the side slides */}
            <button className="hero-prev absolute left-[2%] md:left-[4%] top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/10 md:bg-white/20 hover:bg-white/60 backdrop-blur-sm transition-all flex items-center justify-center border-none cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-[#1a1a1a]">
              <ChevronLeft className="w-5 h-5 md:w-7 md:h-7" strokeWidth={1.5} />
            </button>
            <button className="hero-next absolute right-[2%] md:right-[4%] top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/10 md:bg-white/20 hover:bg-white/60 backdrop-blur-sm transition-all flex items-center justify-center border-none cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-[#1a1a1a]">
              <ChevronRight className="w-5 h-5 md:w-7 md:h-7" strokeWidth={1.5} />
            </button>

            {/* Custom Pagination wrapper */}
            <div className="hero-pagination" style={{
              position: 'absolute', bottom: '35px', left: 0, right: 0, zIndex: 20,
              display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center'
            }}></div>
          </Swiper>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          2. CATEGORY PILLS (Responsive Flex Layout)
         ═══════════════════════════════════════════ */}
      <section style={{ padding: '60px 0', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>

          {/* MOBILE VIEW: 2 Column Grid */}
          <div className="grid grid-cols-2 gap-y-8 gap-x-4 md:hidden">
            {categoryPills.map((cat) => (
              <Link key={cat.slug} to={`/shop?category=${cat.slug}`} className="flex flex-col items-center gap-3 text-decoration-none">
                <div className="w-[120px] h-[60px] rounded-full overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.1)] shrink-0">
                  <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span className="text-[15px] text-[#1a1a1a] font-serif text-center">{cat.name}</span>
              </Link>
            ))}
          </div>

          {/* DESKTOP VIEW: 2-3-2 Layout */}
          <div className="hidden md:flex flex-col gap-10">
            {/* Row 1 */}
            <div className="flex justify-center gap-10 lg:gap-20 flex-wrap">
              {categoryPills.slice(0, 2).map((cat) => (
                <Link key={cat.slug} to={`/shop?category=${cat.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none' }}>
                  <div className="w-32 h-16 lg:w-40 lg:h-20 rounded-full overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.1)] shrink-0">
                    <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span className="text-lg lg:text-[22px] text-[#1a1a1a] font-serif whitespace-nowrap">{cat.name}</span>
                </Link>
              ))}
            </div>

            {/* Row 2 */}
            <div className="flex justify-center gap-10 lg:gap-16 flex-wrap">
              {categoryPills.slice(2, 5).map((cat) => (
                <Link key={cat.slug} to={`/shop?category=${cat.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none' }}>
                  <div className="w-32 h-16 lg:w-40 lg:h-20 rounded-full overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.1)] shrink-0">
                    <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span className="text-lg lg:text-[22px] text-[#1a1a1a] font-serif whitespace-nowrap">{cat.name}</span>
                </Link>
              ))}
            </div>

            {/* Row 3 */}
            <div className="flex justify-center gap-10 lg:gap-20 flex-wrap">
              {categoryPills.slice(5, 7).map((cat) => (
                <Link key={cat.slug} to={`/shop?category=${cat.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none' }}>
                  <div className="w-32 h-16 lg:w-40 lg:h-20 rounded-full overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.1)] shrink-0">
                    <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span className="text-lg lg:text-[22px] text-[#1a1a1a] font-serif whitespace-nowrap">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════
          3. OUR PICKS FOR YOU
         ═══════════════════════════════════════════ */}
      <section style={{ padding: '40px 0 50px', backgroundColor: 'white' }}>
        <div className="w-full max-w-[1800px] mx-auto px-6 xl:px-12">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 className="text-3xl md:text-[2.5rem] font-serif font-bold italic text-[#1a1a1a] mb-2">
              Our Picks For You
            </h2>
            <p className="text-sm md:text-[18px] text-[#777]">Fresh styles just in! Elevate your look</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-[48px]">
            {(featuredProducts.length > 0 ? featuredProducts : products).map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                style={{ textDecoration: 'none', color: '#333' }}
              >
                <div style={{
                  aspectRatio: '1', overflow: 'hidden',
                  backgroundColor: '#ffffffff', borderRadius: '8px',
                  marginBottom: '16px', border: '1px solid #f0f0f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '9px'
                }}>
                  <img
                    src={product.images && product.images.length > 0 ? product.images[0].url : product.image || IMG.p1}
                    alt={product.name}
                    style={{
                      maxWidth: '100%', maxHeight: '100%', borderRadius: '2%', objectFit: 'contain',
                      transition: 'transform 0.3s'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                </div>
                <h3 className="text-base md:text-[18px] font-semibold text-[#444] leading-snug mb-1.5">
                  {product.name}
                </h3>
                <p className="text-lg md:text-[20px] font-bold text-[#1a1a1a]">
                  {product.basePrice && product.discountPercentage > 0 
                    ? `৳ ${(product.basePrice * (1 - product.discountPercentage / 100)).toLocaleString()}`
                    : (product.priceDisplay || `৳ ${product.basePrice || product.price}`)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4. SPLIT BANNER — Start With These Curated Spaces
         ═══════════════════════════════════════════ */}
      <section style={{ padding: '80px 0', backgroundColor: '#f9f9f9' }}>
        <div className="w-full max-w-[1800px] mx-auto px-6 xl:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[80px] xl:gap-[120px] items-center">

            {/* Left — Large Rounded Image */}
            <div className="lg:col-span-8" style={{ height: '680px', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
              <img
                src={IMG.curatedBig}
                alt="Curated Space"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Right — Content and Slider */}
            <div className="lg:col-span-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <h2 style={{
                fontSize: '3rem', fontFamily: "'Playfair Display', serif",
                fontWeight: 400, color: '#1a1a1a', marginBottom: '16px', lineHeight: 1.1
              }}>
                Start With These<br />Curated Spaces
              </h2>
              <p style={{ fontSize: '15px', color: '#666', marginBottom: '48px', fontWeight: 300 }}>
                Comfort and style meet to blissful perfection
              </p>

              {/* Slider Area */}
              <div style={{ width: '100%', maxWidth: '550px', position: 'relative' }} className="curated-slider-wrapper">
                <style>{`
                  .curated-slider-wrapper .swiper-pagination-bullet {
                    background: transparent;
                    border: 1px solid #1a1a1a;
                    opacity: 1;
                    width: 8px;
                    height: 8px;
                    margin: 0 6px !important;
                  }
                  .curated-slider-wrapper .swiper-pagination-bullet-active {
                    background: transparent;
                    border: 2px solid #1a1a1a;
                    position: relative;
                  }
                  .curated-slider-wrapper .swiper-pagination-bullet-active::after {
                    content: '';
                    position: absolute;
                    top: 50%; left: 50%; transform: translate(-50%, -50%);
                    width: 3px; height: 3px;
                    background: #1a1a1a;
                    border-radius: 50%;
                  }
                `}</style>
                <Swiper
                  modules={[Pagination, Autoplay]}
                  pagination={{ clickable: true, el: '.curated-pagination' }}
                  autoplay={{ delay: 3000 }}
                  loop={true}
                  spaceBetween={20}
                  slidesPerView={1}
                >
                  {[
                    { id: 20, name: 'Low Back Chair', price: '৳ 0.00', image: IMG.curatedChair },
                    { id: 21, name: 'Executive Chair', price: '৳ 0.00', image: IMG.p7 },
                    { id: 22, name: 'Visitor Chair', price: '৳ 0.00', image: IMG.p8 }
                  ].map((product) => (
                    <SwiperSlide key={product.id}>
                      <div style={{ width: '100%' }}>
                        <div style={{
                          backgroundColor: 'white', borderRadius: '16px',
                          aspectRatio: '16/10', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: '24px', marginBottom: '24px'
                        }}>
                          <img
                            src={product.image}
                            alt={product.name}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          />
                        </div>
                        <h4 style={{ fontSize: '15px', fontWeight: 500, color: '#333', marginBottom: '4px' }}>{product.name}</h4>
                        <p style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>{product.price}</p>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                <div className="curated-pagination" style={{ display: 'flex', marginTop: '32px' }}></div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
      {/* ═══════════════════════════════════════════
          5. OUR EXCLUSIVE LIVING ROOM SET
         ═══════════════════════════════════════════ */}
      <section style={{ padding: '80px 0', backgroundColor: 'white' }}>
        <div className="w-full max-w-[1800px] mx-auto px-6 xl:px-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 md:mb-10">
            <div>
              <h2 className="text-3xl md:text-[2.5rem] font-serif text-[#1a1a1a] mb-2">
                Our Exclusive Living Room Set
              </h2>
              <p className="text-sm md:text-[18px] text-[#777]">Fresh styles just in! Elevate your look.</p>
            </div>
            <Link to="/shop?category=living-room" className="text-sm md:text-[15px] text-[#1a1a1a] font-medium border-b border-[#1a1a1a] pb-1 hover:opacity-70 transition-opacity">
              View All Products
            </Link>
          </div>

          <div className="relative md:px-[80px]">
            <Swiper
              modules={[Navigation]}
              spaceBetween={20}
              slidesPerView={1.2}
              breakpoints={{ 480: { slidesPerView: 2, spaceBetween: 20 }, 768: { slidesPerView: 3, spaceBetween: 30 }, 1024: { slidesPerView: 4, spaceBetween: 30 } }}
              onSwiper={(swiper) => { livingRoomSwiperRef.current = swiper; }}
            >
              {(livingRoomProducts.length > 0 ? livingRoomProducts : livingRoomMockProducts).map((product) => (
                <SwiperSlide key={product.id}>
                  <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none', color: '#333', display: 'block' }}>
                    <div style={{
                      aspectRatio: '16/10', overflow: 'hidden',
                      marginBottom: '16px', borderRadius: '8px'
                    }}>
                      <img src={product.images && product.images.length > 0 ? product.images[0].url : product.image || IMG.p5} alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <h3 className="text-base md:text-[18px] font-semibold text-[#444] mb-1.5">{product.name}</h3>
                    <p className="text-lg md:text-[20px] font-bold text-[#1a1a1a]">
                      {product.basePrice && product.discountPercentage > 0 
                        ? `৳ ${(product.basePrice * (1 - product.discountPercentage / 100)).toLocaleString()}`
                        : (product.priceDisplay || `৳ ${product.basePrice || product.price}`)}
                    </p>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Nav arrows outside the Swiper */}
            <button
              onClick={() => livingRoomSwiperRef.current?.slidePrev()}
              className="hidden md:flex absolute left-0 top-[40%] -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white border border-[#e0e0e0] items-center justify-center cursor-pointer transition-all text-[#1a1a1a] hover:border-[#1a1a1a] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
            >
              <ChevronLeft size={24} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => livingRoomSwiperRef.current?.slideNext()}
              className="hidden md:flex absolute right-0 top-[40%] -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white border border-[#e0e0e0] items-center justify-center cursor-pointer transition-all text-[#1a1a1a] hover:border-[#1a1a1a] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
            >
              <ChevronRight size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          6. QUICK CATEGORY TAGS
         ═══════════════════════════════════════════ */}
      <section style={{ padding: '40px 0', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-track {
            display: flex;
            width: max-content;
            animation: marquee 30s linear infinite;
          }
          .marquee-track:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div style={{ width: '100%', margin: '0 auto' }}>
          <div className="marquee-track">
            {[...quickTags, ...quickTags, ...quickTags].map((tag, idx) => (
              <Link
                key={idx}
                to={`/shop?q=${tag.name.toLowerCase().replace(/ /g, '-')}`}
                style={{ display: 'flex', alignItems: 'center', gap: '20px', textDecoration: 'none', color: '#1a1a1a', margin: '0 60px' }}
              >
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  overflow: 'hidden', backgroundColor: '#f8f8f8', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <img src={tag.image} alt={tag.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span style={{ fontSize: '26px', fontWeight: 400, color: '#1a1a1a', whiteSpace: 'nowrap' }}>{tag.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          7. SIGNATURE COLLECTIONS
         ═══════════════════════════════════════════ */}
      <section style={{ padding: '80px 0', backgroundColor: 'white' }}>
        <div className="w-full max-w-[1800px] mx-auto px-6 xl:px-12">
          <div style={{
            backgroundColor: '#1a1a1a', borderRadius: '24px',
            display: 'flex', flexDirection: 'column'
          }} className="py-[60px] px-[40px] lg:py-[100px] lg:px-[120px]">
            <div style={{ marginBottom: '60px' }}>
              <h2 style={{ fontSize: '3rem', fontFamily: "'Playfair Display', serif", fontWeight: 400, color: '#fdfbf7', marginBottom: '16px' }}>
                Discover Our Signature Interior Collections
              </h2>
              <p style={{ fontSize: '15px', color: '#a0a0a0', maxWidth: '650px', lineHeight: 1.6 }}>
                Explore our carefully crafted interior design collections, each tailored to bring elegance and functionality to your spaces.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {signatureCollections.map((collection, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '36px 0', borderBottom: idx === signatureCollections.length - 1 ? 'none' : '1px solid #333'
                }}>
                  <span style={{ fontSize: '28px', fontFamily: "'Playfair Display', serif", fontWeight: 400, color: '#e0e0e0' }}>{collection}</span>
                  <Link
                    to="/shop"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      fontSize: '12px', fontWeight: 500, color: '#a0a0a0',
                      border: '1px solid #555', padding: '10px 24px',
                      borderRadius: '40px', textDecoration: 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#fff'; }}
                    onMouseOut={(e) => { e.currentTarget.style.color = '#a0a0a0'; e.currentTarget.style.borderColor = '#555'; }}
                  >
                    View More <ArrowRight size={14} style={{ transform: 'rotate(-45deg)' }} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          8. TRUST BADGES
         ═══════════════════════════════════════════ */}
      <section style={{ padding: '100px 0', backgroundColor: 'white' }}>
        <div className="w-full max-w-[1800px] mx-auto px-6 xl:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[40px] xl:gap-[80px]">
            {trustBadges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                  <Icon size={48} strokeWidth={1.5} style={{ color: '#1a1a1a', marginBottom: '24px' }} />
                  <h3 style={{ fontSize: '24px', fontFamily: "'Playfair Display', serif", fontWeight: 400, color: '#1a1a1a', marginBottom: '12px' }}>{badge.title}</h3>
                  <p style={{ fontSize: '15px', color: '#777', lineHeight: 1.6 }}>{badge.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
