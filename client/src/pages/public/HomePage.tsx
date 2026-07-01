import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ChevronRight, ChevronLeft, Truck, RotateCcw, Headphones, Award, ArrowRight, Phone } from 'lucide-react';
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

  catOffice: '/Images/magnific_using-img1-as-the-exact-f_vupdjS1a47.png', // Maps to p3 (Director Table)
  catLiving: '/Images/freepik_edit_Using-img1-as-the-exact-furniture-reference-a-sofa (1).png', // Maps to p5 (Sofa)
  catDining: '/Images/freepik_edit_Using-img1-as-the-exact-furniture-reference-a-dini (1).png',
  catBed: '/Images/freepik_edit_Using-img1-as-the-exact-furniture-reference-keep-t.png', // Maps to br1 (Bedroom)
  catKids: '/Images/kids_room.png',
  catIndustrial: '/Images/industrial_furniture.png',
  catHospital: '/Images/hospital_furniture.png', // Hospital bed

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
    title: 'Made for creating\ntasty memories',
    subtitle: 'Bundle of satisfaction',
    image: IMG.heroBed,
    link: '/shop?category=dining-room',
  },
  {
    id: 2,
    title: 'Crafted for\nyour comfort',
    subtitle: 'Premium furniture collection',
    image: IMG.sideLeft,
    link: '/shop?category=office',
  },
  {
    id: 3,
    title: 'Design that\ninspires living',
    subtitle: 'Modern elegance for every space',
    image: IMG.heroLiving,
    link: '/shop?category=living-room',
  },
  {
    id: 4,
    title: 'Sleep in\npure luxury',
    subtitle: 'Bedroom sets that define comfort',
    image: IMG.sideRightBottom,
    link: '/shop?category=bedroom',
  },
  {
    id: 5,
    title: 'Where work\nmeets style',
    subtitle: 'Elevate your office space',
    image: IMG.p5,
    link: '/shop?category=office',
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
  const newestSwiperRef = useRef<SwiperType | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [newestProducts, setNewestProducts] = useState<any[]>([]);
  const [dynamicHeroSlides, setDynamicHeroSlides] = useState<any[]>([]);
  const [loadingHero, setLoadingHero] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNewest, setLoadingNewest] = useState(true);

  useEffect(() => {
    // Fetch general featured products
    api.get('/products?isFeatured=true&limit=8').then(res => {
      setFeaturedProducts(res.data.products || []);
    }).catch(console.error).finally(() => setLoadingFeatured(false));

    // Fetch newest products
    api.get('/products?sortBy=createdAt&order=desc&limit=8').then(res => {
      setNewestProducts(res.data.products || []);
    }).catch(console.error).finally(() => setLoadingNewest(false));

    // Fetch active hero slides
    api.get('/hero-slides?active=true').then(res => {
      setDynamicHeroSlides(res.data || []);
    }).catch(console.error).finally(() => setLoadingHero(false));
  }, []);

  const finalHeroSlides = dynamicHeroSlides.length > 0 ? dynamicHeroSlides : heroSlides;
  const isLoading = loadingHero || loadingFeatured || loadingNewest;

  // Hide splash screen once data is loaded
  useEffect(() => {
    if (!isLoading) {
      (window as any).__hideSplash?.();
    }
  }, [isLoading]);

  if (isLoading) {
    // The splash screen from index.html is still visible — no need for a duplicate loader
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SEO
        title="Home"
        description="Talukder Furniture — Premium craftsmanship for your home."
      />

      {/* ═══════════════════════════════════════════
          1. HERO SECTION — Full Viewport, HATIL Style
         ═══════════════════════════════════════════ */}
      <section className="relative w-full h-screen overflow-hidden">
        {!loadingHero && (
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{
              clickable: true,
              el: '.hatil-hero-pagination',
              bulletClass: 'hatil-hero-bullet',
              bulletActiveClass: 'hatil-hero-bullet-active',
            }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            speed={1200}
            loop={true}
            slidesPerView={1}
            spaceBetween={0}
            className="w-full h-full"
          >
            {finalHeroSlides.map((slide: any, index: number) => (
              <SwiperSlide key={`${slide.id}-${index}`}>
                {({ isActive }) => (
                  <div className="relative w-full h-screen">
                    {/* Full-bleed background image */}
                    <img
                      src={slide.imageUrl || slide.image}
                      alt={slide.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Dark gradient overlay for text readability */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 30%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0.3) 100%)',
                      }}
                    />

                    {/* Text content — closer to bottom */}
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 md:pb-24 text-center z-10 px-0">
                      <motion.h1
                        initial={{ opacity: 0, y: 50 }}
                        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                        className="text-white text-3xl sm:text-3xl md:text-5xl lg:text-4xl font-bold leading-[1.3] whitespace-pre-line mb-6 tracking-wide max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-4"
                        style={{
                          fontFamily: "'Inter', 'Segoe UI', sans-serif",
                          textShadow: '0 2px 20px rgba(0,0,0,0.3)',
                          letterSpacing: '0.03em',
                        }}
                      >
                        {slide.title}
                      </motion.h1>

                      {/* Horizontal divider line */}
                      <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={isActive ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                        className="w-[280px] sm:w-[350px] md:w-[450px] h-[1px] bg-white/60 mb-5"
                      />

                      {/* Subtitle */}
                      <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                        className="text-white/80 text-lg sm:text-xl md:text-2xl font-light tracking-wide max-w-md md:max-w-lg lg:max-w-xl px-4"
                        style={{
                          fontFamily: "'Inter', 'Segoe UI', sans-serif",
                          textShadow: '0 1px 8px rgba(0,0,0,0.3)',
                        }}
                      >
                        {slide.subtitle || 'Bundle of satisfaction'}
                      </motion.p>

                      {/* CTA Button */}
                      {(slide.ctaLink || slide.link) && (
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.65 }}
                          className="mt-8 sm:mt-10"
                        >
                          <Link
                            to={slide.ctaLink || slide.link}
                            className="inline-flex items-center justify-center bg-white text-[#1a1a1a] px-4 md:px-8 py-2 md:py-3 text-[10px] sm:text-xs md:text-sm font-semibold tracking-[0.15em] uppercase hover:bg-black hover:text-white transition-all duration-500 shadow-lg"
                          >
                            {slide.ctaText || 'Explore Collection'}
                          </Link>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Dot Pagination — bottom center */}
        <div className="hatil-hero-pagination absolute bottom-8 left-0 right-0 z-20 flex justify-center items-center gap-2" />

        {/* Floating Phone Number — bottom left */}
        <div className="absolute bottom-6 left-6 md:left-10 z-20 flex items-center gap-2.5">
          <Phone size={16} className="text-white/80" strokeWidth={1.5} />
          <span
            className="text-white/80 text-xs md:text-sm font-light tracking-wider"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
          >
            +880 1966-333355
          </span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          2. POPULAR FURNITURE (HATIL Style)
         ═══════════════════════════════════════════ */}
      <section style={{ padding: '100px 0 80px', backgroundColor: 'white' }}>
        <div className="w-full max-w-[1800px] mx-auto px-6 xl:px-12">
          {/* Heading */}
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl md:text-3xl font-light text-[#1a1a1a]" style={{ fontFamily: "'Inter', sans-serif" }}>
              Popular Furniture
            </h2>
            <ArrowRight size={22} className="text-[#1a1a1a]" strokeWidth={1.5} />
          </div>

          {/* 7-column grid layout for desktop, responsive grid for mobile */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-5 lg:gap-6 pb-4">
            {categoryPills.map((cat) => (
              <Link
                key={cat.slug}
                to={`/shop?category=${cat.slug}`}
                className="flex flex-col items-center gap-3 group w-full"
                style={{ textDecoration: 'none' }}
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-[#f5f5f5] transition-shadow duration-300 group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="text-[13px] md:text-[14px] text-[#444] font-normal text-center whitespace-nowrap">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          3. OUR PICKS FOR YOU
         ═══════════════════════════════════════════ */}
      <section style={{ padding: '80px 0 120px', backgroundColor: 'white' }}>
        <div className="w-full max-w-[1800px] mx-auto px-6 xl:px-12">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl md:text-5xl font-serif text-[#1a1a1a] mb-4">
              Our Picks For You
            </h2>
            <p className="text-[15px] md:text-[17px] font-light text-gray-500 tracking-wide uppercase">
              Fresh styles just in! Elevate your look
            </p>
          </div>

          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-8 sm:pb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {(featuredProducts.length > 0 ? featuredProducts : products).map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="group relative block w-[260px] sm:w-auto snap-start shrink-0"
              >
                {/* Image Container */}
                <div className="relative w-full aspect-square bg-[#f5f5f5] mb-5 overflow-hidden">
                  <img
                    src={product.images && product.images.length > 0 ? product.images[0].url : product.image || IMG.p1}
                    alt={product.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                  />
                  {product.images && product.images.length > 1 && (
                    <img
                      src={product.images[1].url}
                      alt={product.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                    />
                  )}
                  {/* Hover Overlay 'View Details' Button */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-[#1a1a1a] text-[13px] font-semibold tracking-wider uppercase px-6 py-3 shadow-lg">
                      View Details
                    </span>
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex flex-col flex-1 justify-start px-2">
                  <h3 className="font-medium text-[#1a1a1a] text-[15px] md:text-[16px] leading-snug line-clamp-2 mb-2 group-hover:text-[#E32227] transition-colors duration-300">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-[#1a1a1a] text-[16px]">
                      {product.basePrice && product.discountPercentage > 0
                        ? `৳ ${(product.basePrice * (1 - product.discountPercentage / 100)).toLocaleString()}`
                        : (product.priceDisplay || `৳ ${product.basePrice || product.price}`)}
                    </span>
                    {product.basePrice && product.discountPercentage > 0 && (
                      <span className="text-[12px] sm:text-[13px] text-gray-400 line-through">
                        ৳ {product.basePrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4. EDITORIAL SPLIT BANNER — Elevate Living
         ═══════════════════════════════════════════ */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 xl:px-12">

          {/* Top Split Section */}
          <div className="flex flex-col lg:flex-row items-stretch min-h-[500px] lg:min-h-[700px]">
            {/* Left Content Area — Deep Charcoal */}
            <div className="w-full lg:w-[45%] bg-[#141414] p-12 lg:p-20 xl:p-28 flex flex-col justify-center relative">
              <span className="text-[#a0a0a0] uppercase tracking-[0.3em] text-[12px] font-bold mb-6 block">
                Exclusive Collection
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-[4rem] font-serif text-white leading-[1.1] mb-8">
                Elevate Your<br />Everyday Living
              </h2>
              <p className="text-[16px] lg:text-[18px] text-gray-400 font-light mb-12 max-w-[400px] leading-relaxed">
                Immerse yourself in spaces designed with passion and crafted for absolute perfection. Experience true luxury.
              </p>
              <Link to="/shop" className="group inline-flex items-center gap-4 self-start text-white text-[14px] tracking-[0.2em] uppercase font-semibold">
                <span className="border-b border-transparent group-hover:border-white transition-colors duration-300 pb-0.5">
                  Explore Spaces
                </span>
                <span className="w-8 h-[1px] bg-white group-hover:w-12 transition-all duration-300"></span>
              </Link>
            </div>

            {/* Right Perfectly Packed Grid Image Gallery */}
            <div className="w-full lg:w-[55%] bg-white p-2 h-[500px] lg:h-auto">
              <div className="grid grid-cols-3 grid-rows-4 gap-2 w-full h-full">
                {[
                  { src: '/Images/Elevate-section/03.jpg', span: 'col-span-1 row-span-2' },
                  { src: '/Images/Elevate-section/37.png', span: 'col-span-1 row-span-2' },
                  { src: '/Images/Elevate-section/TFL-BKS-102-WD-1.jpg', span: 'col-span-1 row-span-3' },
                  { src: '/Images/Elevate-section/TFL-CFT-102-WD-1.jpg', span: 'col-span-2 row-span-2' },
                  { src: '/Images/Elevate-section/TFL-SOF-104-WD-1.jpg', span: 'col-span-1 row-span-1' },
                ].map((img, i) => (
                  <div key={i} className={`relative group overflow-hidden bg-gray-100 ${img.span}`}>
                    <img
                      src={img.src}
                      alt="Gallery Snapshot"
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Products Strip */}
          <div className="w-full mt-16 lg:mt-24 relative curated-slider-wrapper">
            <div className="flex items-center justify-between mb-10 border-b border-gray-200 pb-4">
              <h3 className="text-2xl lg:text-3xl font-serif text-[#1a1a1a]">Featured Pieces</h3>
              <div className="flex items-center gap-4">
                <button className="uniqueness-prev w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <button className="uniqueness-next w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <Swiper
              modules={[Navigation, Autoplay]}
              navigation={{
                nextEl: '.uniqueness-next',
                prevEl: '.uniqueness-prev',
              }}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              loop={true}
              spaceBetween={30}
              breakpoints={{
                320: { slidesPerView: 1.2, spaceBetween: 16 },
                768: { slidesPerView: 2.5, spaceBetween: 24 },
                1024: { slidesPerView: 4, spaceBetween: 30 },
                1280: { slidesPerView: 5, spaceBetween: 30 },
              }}
            >
              {[
                { id: 30, name: 'Andaman-184', price: '৳ 32,100', image: '/Images/Featured-product/TFL-CMT-102-LB-1.webp' },
                { id: 31, name: 'Anderson-279', price: '৳ 38,150', image: '/Images/Featured-product/TFL-DNT-110-WD-1.webp' },
                { id: 32, name: 'Lucan-309', price: '৳ 18,849', image: '/Images/Featured-product/TFL-DVN-102-FR.webp' },
                { id: 33, name: 'Kenneth-313', price: '৳ 30,650', image: '/Images/Featured-product/TFL-IRS-102-WD-1.webp' },
                { id: 34, name: 'Low Back Chair', price: '৳ 12,500', image: '/Images/Featured-product/TFL-SRK-108-WD-1.webp' },
                { id: 35, name: 'Andaman-184', price: '৳ 32,100', image: '/Images/Featured-product/TFL-CMT-102-LB-1.webp' },
                { id: 36, name: 'Anderson-279', price: '৳ 38,150', image: '/Images/Featured-product/TFL-DNT-110-WD-1.webp' },
                { id: 37, name: 'Lucan-309', price: '৳ 18,849', image: '/Images/Featured-product/TFL-DVN-102-FR.webp' },
                { id: 38, name: 'Kenneth-313', price: '৳ 30,650', image: '/Images/Featured-product/TFL-IRS-102-WD-1.webp' },
                { id: 39, name: 'Low Back Chair', price: '৳ 12,500', image: '/Images/Featured-product/TFL-SRK-108-WD-1.webp' },
              ].map((product) => (
                <SwiperSlide key={product.id}>
                  <Link to="/shop" className="block group">
                    <div className="w-full aspect-square bg-[#f5f5f5] mb-4 overflow-hidden relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <h4 className="font-medium text-[#1a1a1a] text-[15px] mb-1 group-hover:text-[#E32227] transition-colors">{product.name}</h4>
                    <p className="font-semibold text-gray-500 text-[14px]">{product.price}</p>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          5. NEWEST ARRIVALS
         ═══════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="w-full max-w-[1700px] mx-auto px-6 xl:px-12 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
            <div>
              <h2 className="text-3xl md:text-[2.75rem] font-serif text-[#1a1a1a] mb-2">
                Newest Arrivals
              </h2>
              <p className="text-sm md:text-[17px] text-[#555]">Fresh styles just in! Elevate your look.</p>
            </div>
            <Link to="/shop" className="text-sm md:text-[15px] text-[#1a1a1a] font-semibold border-b-[1.5px] border-[#1a1a1a] pb-0.5 hover:text-[#E32227] hover:border-[#E32227] transition-colors">
              View All Products
            </Link>
          </div>

          <div className="relative group/slider px-0 md:px-4">
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={24}
              slidesPerView={1.2}
              loop={true}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              breakpoints={{ 480: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}
              onSwiper={(swiper) => { newestSwiperRef.current = swiper; }}
            >
              {(newestProducts.length > 0 ? newestProducts : livingRoomMockProducts).map((product) => (
                <SwiperSlide key={product.id}>
                  <Link to={`/products/${product.slug}`} className="block group">
                    <div className="w-full aspect-[4/3] bg-[#f8f8f8] mb-4 rounded-md overflow-hidden relative">
                      <img
                        src={product.images && product.images.length > 0 ? product.images[0].url : product.image || IMG.p5}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-multiply"
                      />
                    </div>
                    <h3 className="text-[16px] md:text-[18px] font-semibold text-[#1a1a1a] mb-1">{product.name}</h3>
                    <p className="text-[17px] md:text-[19px] font-bold text-[#1a1a1a]">
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
              onClick={() => newestSwiperRef.current?.slidePrev()}
              className="hidden md:flex absolute -left-8 top-[40%] -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-[#e0e0e0] items-center justify-center cursor-pointer transition-all text-[#1a1a1a] hover:border-[#1a1a1a] hover:shadow-lg opacity-0 group-hover/slider:opacity-100"
            >
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => newestSwiperRef.current?.slideNext()}
              className="hidden md:flex absolute -right-8 top-[40%] -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-[#e0e0e0] items-center justify-center cursor-pointer transition-all text-[#1a1a1a] hover:border-[#1a1a1a] hover:shadow-lg opacity-0 group-hover/slider:opacity-100"
            >
              <ChevronRight size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          6. SHOP BY CATEGORY (Perfect Grid)
         ═══════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-[#fafafa] border-y border-gray-100">
        <div className="w-full max-w-[1700px] mx-auto px-6 xl:px-12">

          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-[2.75rem] font-serif text-[#1a1a1a] mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-500 text-[16px] md:text-[18px]">
              Explore our curated collections for every space in your home
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 lg:gap-10">
            {categoryPills.map((cat, idx) => (
              <Link
                key={idx}
                to={`/shop?category=${cat.slug}`}
                className="group flex flex-col items-center w-[130px] sm:w-[150px] lg:w-[180px]"
              >
                <div className="w-full aspect-square rounded-full bg-white mb-5 p-2 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-100 group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] group-hover:border-gray-200 transition-all duration-500">
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      loading="lazy"
                      className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
                  </div>
                </div>
                <h4 className="text-[#1a1a1a] font-medium text-[15px] lg:text-[16px] text-center group-hover:text-[#E32227] transition-colors">
                  {cat.name}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          7. SIGNATURE COLLECTIONS (Visual Redesign)
         ═══════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="w-full max-w-[1700px] mx-auto px-6 xl:px-12">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 lg:mb-16 gap-8">
            <div className="max-w-3xl">
              <h2 className="text-4xl md:text-5xl lg:text-[4rem] font-serif text-[#1a1a1a] mb-6 tracking-tight leading-tight">
                Signature Collections
              </h2>
              <p className="text-gray-500 text-lg md:text-xl">
                Explore our carefully crafted interior design collections, each tailored to bring elegance and functionality to your spaces.
              </p>
            </div>
            <Link to="/shop" className="hidden md:flex items-center gap-2 border-b border-[#1a1a1a] pb-1 text-[#1a1a1a] font-medium hover:text-[#E32227] hover:border-[#E32227] transition-all whitespace-nowrap">
              Explore All Collections <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {[
              { name: 'Talukder Prestige Collection', img: '/Images/Signature-section/03.jpg', span: 'md:col-span-2 aspect-[16/9] lg:aspect-[21/9]' },
              { name: 'Cozy Sofa Collection', img: '/Images/Signature-section/06.jpg', span: 'aspect-[4/3] md:aspect-square lg:aspect-[4/3]' },
              { name: 'Dining Elegance Collection', img: '/Images/Signature-section/15.jpg', span: 'aspect-[4/3] md:aspect-square lg:aspect-[4/3]' },
              { name: 'Comfortable Bedroom Collection', img: '/Images/Signature-section/BST-113.webp', span: 'md:col-span-2 aspect-[16/9] lg:aspect-[21/9]' },
            ].map((col, idx) => (
              <Link key={idx} to={`/shop?category=${col.name.split(' ')[0].toLowerCase()}`} className={`group relative block overflow-hidden rounded-xl ${col.span}`}>
                <img
                  src={col.img}
                  alt={col.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

                {/* Text Content */}
                <div className="absolute bottom-0 left-0 w-full p-8 lg:p-12">
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif text-white mb-3 lg:mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    {col.name}
                  </h3>
                  <div className="flex items-center gap-2 text-white/90 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75 transform translate-y-4 group-hover:translate-y-0">
                    <span className="text-sm font-medium tracking-wider uppercase">View Collection</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════
          8. TRUST BADGES
         ═══════════════════════════════════════════ */}
      <section style={{ padding: '180px 0', backgroundColor: 'white' }}>
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
