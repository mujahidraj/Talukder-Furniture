import React from 'react';
import { Link } from 'react-router-dom';
import { Package, RotateCcw, HeadphonesIcon, BadgePercent, Box, Feather, Layers, Send } from 'lucide-react';
import SEO from '../../components/seo/SEO';

const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const TwitterIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function AboutPage() {
  return (
    <div className="bg-secondary min-h-screen pt-28 pb-20 font-sans">
      <SEO 
        title="About Us"
        description="Learn more about Talukder Furniture's legacy of premium craftsmanship, our mission, and our dedication to providing the best furniture in Bangladesh."
        url="/about"
      />
      
      {/* Hero Section */}
      <div className="relative py-20 px-4 md:px-8 xl:px-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=1920&q=80"
            alt="About Us Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto">
          <h1 className="text-4xl md:text-5xl text-white font-serif mb-3 drop-shadow-md">About Us</h1>
          <div className="text-white/90 text-sm font-medium drop-shadow-md">
            <Link to="/" className="hover:text-white">Homepage</Link> <span className="mx-2">&gt;</span> About Us
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 xl:px-12 pt-16">

        {/* We Are Talukder Section */}
        <div className="text-center max-w-5xl mx-auto mb-12">
          <h2 className="text-5xl font-serif text-[#1a1a1a] mb-6">We Are Talukder</h2>
          <p className="text-gray-600 leading-[1.8] text-base md:text-lg">
            Talukder Group of Industries had started its journey since July, 1973. Founder chairman Mr. Nurul Islam Talukder established Talukder foundry Ltd (TFL) with a vision of large-scale Industrialization. Now Talukder Group is a successful brand name as well as a flagship corporate name in corporate world with great achievement with the dedicated service to all her stakeholders and partners. Under the leadership of Managing Director Mr. Samsul Arifin, Talukder Group of Industries becomes the largest partner of LGED, JICA and PEDP4 in furnishing Primary Schools all over the Country.
          </p>
        </div>

        {/* Hero Image */}
        <div className="mb-16">
          <img
            src="https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=1600&q=80"
            alt="Bedroom Set"
            className="w-full h-auto object-cover max-h-[600px]"
          />
        </div>

        {/* Mission / Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div>
            <h3 className="text-4xl font-serif text-[#1a1a1a] mb-4">Our Mission</h3>
            <p className="text-gray-600 text-base md:text-lg leading-[1.8]">
              Our mission is to ensure the best-suited products for our customers, meeting their needs without causing any dissatisfaction. We strive to create job opportunities for our people by providing the right platform to discover and utilize their potential. As we believe that human resources are the most valuable asset of any organization, we are committed to ensuring the highest level of employee satisfaction.
            </p>
          </div>
          <div>
            <h3 className="text-4xl font-serif text-[#1a1a1a] mb-4">Our Vision</h3>
            <p className="text-gray-600 text-base md:text-lg leading-[1.8]">
              Furniture industry is a fast-growing sector of Bangladesh in terms of employment and production. The main objective of Talukder group is to serve the customers with best quality of products and provide employment facility. The objective of Group is to grow equally in accordance with market demand and always be viable technically, financially and in environmental aspects.
            </p>
          </div>
        </div>

        {/* 4 Feature Icons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24 border-t border-b border-gray-100 py-16">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Package size={40} className="text-[#1a1a1a] mb-6" strokeWidth={1.5} />
            <h4 className="text-2xl font-serif text-[#1a1a1a] mb-3">Free & fast delivery</h4>
            <p className="text-sm md:text-base text-gray-500">No extra costs, just the price you see.</p>
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <RotateCcw size={40} className="text-[#1a1a1a] mb-6" strokeWidth={1.5} />
            <h4 className="text-2xl font-serif text-[#1a1a1a] mb-3">14-Day Returns</h4>
            <p className="text-sm md:text-base text-gray-500">Risk-free shopping with easy returns.</p>
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <HeadphonesIcon size={40} className="text-[#1a1a1a] mb-6" strokeWidth={1.5} />
            <h4 className="text-2xl font-serif text-[#1a1a1a] mb-3">24/7 Support</h4>
            <p className="text-sm md:text-base text-gray-500">24/7 support, always here just for you</p>
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <BadgePercent size={40} className="text-[#1a1a1a] mb-6" strokeWidth={1.5} />
            <h4 className="text-2xl font-serif text-[#1a1a1a] mb-3">Member Discounts</h4>
            <p className="text-sm md:text-base text-gray-500">Special prices for our loyal customers.</p>
          </div>
        </div>

        {/* Excellent Design */}
        <div className="flex flex-col md:flex-row gap-16 items-center mb-24">
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&h=1100&q=80"
              alt="Cabinet"
              className="w-full h-auto object-cover rounded shadow-sm"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-4xl font-serif text-black mb-6">Excellent Design</h2>
            <p className="text-gray-600 text-base md:text-lg leading-[1.8] mb-12">
              We create products using the finest materials and continuously push boundaries with unique styles and forms to craft the ultimate design products.
            </p>

            <div className="space-y-10">
              <div className="flex gap-6">
                <div className="flex-shrink-0 mt-1">
                  <Box size={32} className="text-[#1a1a1a]" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-bold text-[#1a1a1a] text-xl md:text-2xl mb-2">Form</h4>
                  <p className="text-base md:text-lg text-gray-500 leading-[1.8]">We carefully consider every detail, giving our design a feeling of unexpected quality in every detail.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0 mt-1">
                  <Feather size={32} className="text-[#1a1a1a]" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-bold text-[#1a1a1a] text-xl md:text-2xl mb-2">Feel</h4>
                  <p className="text-base md:text-lg text-gray-500 leading-[1.8]">In addition to the look, our products balance functionality with great materials, appealing to the senses.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0 mt-1">
                  <Layers size={32} className="text-[#1a1a1a]" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-bold text-[#1a1a1a] text-xl md:text-2xl mb-2">Functionality</h4>
                  <p className="text-base md:text-lg text-gray-500 leading-[1.8]">Combining practical and conceptual usage to find the perfect solutions for any home lifestyle.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meet Our Teams */}
        <div className="mb-24 text-center">
          <h2 className="text-4xl font-serif text-[#1a1a1a] mb-4">Meet Our Teams</h2>
          <p className="text-gray-500 text-base mb-14">Discover exceptional experiences through testimonials from our satisfied customers.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-left group cursor-pointer">
              <div className="bg-[#e4e8ea] aspect-[4/3] mb-4 rounded-lg shadow-sm relative overflow-hidden">
                <div className="absolute right-4 top-4 bg-white/95 p-2 rounded-2xl flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shadow-md">
                  <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:text-[#1a1a1a] hover:bg-gray-50 transition-all" aria-label="Facebook"><FacebookIcon size={16} /></a>
                  <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:text-[#1a1a1a] hover:bg-gray-50 transition-all" aria-label="Twitter"><TwitterIcon size={16} /></a>
                  <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:text-[#1a1a1a] hover:bg-gray-50 transition-all" aria-label="Instagram"><InstagramIcon size={16} /></a>
                  <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:text-[#1a1a1a] hover:bg-gray-50 transition-all" aria-label="Telegram"><Send size={16} strokeWidth={1.5} /></a>
                </div>
              </div>
              <h4 className="font-serif text-[#1a1a1a] uppercase text-lg mb-1 inline-block relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:left-0 after:bg-[#1a1a1a] after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">ALHAJ MD NURUL ISLAM TALUKDER</h4>
              <p className="text-sm font-serif text-gray-600">Chairman</p>
            </div>
            <div className="text-left group cursor-pointer">
              <div className="bg-[#a8a49c] aspect-[4/3] mb-4 rounded-lg shadow-sm relative overflow-hidden">
                <div className="absolute right-4 top-4 bg-white/95 p-2 rounded-2xl flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shadow-md">
                  <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:text-[#1a1a1a] hover:bg-gray-50 transition-all" aria-label="Facebook"><FacebookIcon size={16} /></a>
                  <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:text-[#1a1a1a] hover:bg-gray-50 transition-all" aria-label="Twitter"><TwitterIcon size={16} /></a>
                  <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:text-[#1a1a1a] hover:bg-gray-50 transition-all" aria-label="Instagram"><InstagramIcon size={16} /></a>
                  <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:text-[#1a1a1a] hover:bg-gray-50 transition-all" aria-label="Telegram"><Send size={16} strokeWidth={1.5} /></a>
                </div>
              </div>
              <h4 className="font-serif text-[#1a1a1a] uppercase text-lg mb-1 inline-block relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:left-0 after:bg-[#1a1a1a] after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">MR MD SAMSUL ARIFIN</h4>
              <p className="text-sm font-serif text-gray-600">Managing Director</p>
            </div>
            <div className="text-left group cursor-pointer">
              <div className="bg-[#a8a49c] aspect-[4/3] mb-4 rounded-lg shadow-sm relative overflow-hidden">
                <div className="absolute right-4 top-4 bg-white/95 p-2 rounded-2xl flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shadow-md">
                  <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:text-[#1a1a1a] hover:bg-gray-50 transition-all" aria-label="Facebook"><FacebookIcon size={16} /></a>
                  <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:text-[#1a1a1a] hover:bg-gray-50 transition-all" aria-label="Twitter"><TwitterIcon size={16} /></a>
                  <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:text-[#1a1a1a] hover:bg-gray-50 transition-all" aria-label="Instagram"><InstagramIcon size={16} /></a>
                  <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:text-[#1a1a1a] hover:bg-gray-50 transition-all" aria-label="Telegram"><Send size={16} strokeWidth={1.5} /></a>
                </div>
              </div>
              <h4 className="font-serif text-[#1a1a1a] text-lg mb-1 inline-block relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:left-0 after:bg-[#1a1a1a] after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">Mrs Shaila Akter</h4>
              <p className="text-sm font-serif text-gray-600">Chief Executive Officer</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
