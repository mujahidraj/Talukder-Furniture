import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../lib/api';
import sanitizeHtml from '../../lib/sanitize';

export default function StaticContentPage() {
  const location = useLocation();
  const path = location.pathname.replace('/', '');
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Map route paths to friendly titles
  const titleMap: Record<string, string> = {
    'terms': 'Terms of Use',
    'privacy': 'Privacy Policy',
    'shipping': 'Shipping Information',
    'returns': 'Returns & Exchanges',
    'license': 'Licensing Agreement',
    'warranty': 'Warranty Information'
  };

  const pageTitle = titleMap[path] || 'Information';

  useEffect(() => {
    window.scrollTo(0, 0);
    
    let pageBody = '';
    
    if (path === 'shipping') {
      pageBody = `
        <div class="max-w-4xl mx-auto">
          <p class="text-lg text-gray-600 mb-10 text-center max-w-2xl mx-auto">We understand that receiving your furniture in perfect condition is just as important as choosing it. Here is everything you need to know about our shipping and delivery process.</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
              <div class="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-full -z-10 group-hover:bg-primary/5 transition-colors"></div>
              <div class="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              </div>
              <h3 class="text-xl font-bold text-primary mb-3 font-serif">Standard Delivery</h3>
              <p class="text-gray-600 leading-relaxed">Enjoy reliable standard delivery across the country. Typically takes <strong class="text-primary">3-5 business days</strong> for in-stock items. Our team ensures careful handling at every step.</p>
            </div>
            
            <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
              <div class="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-full -z-10 group-hover:bg-primary/5 transition-colors"></div>
              <div class="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </div>
              <h3 class="text-xl font-bold text-primary mb-3 font-serif">Express Delivery</h3>
              <p class="text-gray-600 leading-relaxed">Need it sooner? Opt for our express delivery service at checkout for delivery within <strong class="text-primary">1-2 business days</strong> in select metropolitan areas.</p>
            </div>
          </div>

          <div class="bg-[#1a1a1a] text-white rounded-2xl p-8 md:p-12 mb-16 relative overflow-hidden">
            <div class="absolute top-0 right-0 opacity-10">
              <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <h2 class="text-3xl font-serif mb-6 text-white">White Glove Assembly Service</h2>
            <p class="text-gray-300 text-lg mb-6 max-w-2xl">We don't just drop boxes at your door. Our premium White Glove delivery includes carrying the items to your room of choice, complete assembly by our professionals, and removal of all packaging materials.</p>
            <ul class="space-y-3 text-gray-300">
              <li class="flex items-center gap-3"><svg class="text-green-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Room of Choice Delivery</li>
              <li class="flex items-center gap-3"><svg class="text-green-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Full Professional Assembly</li>
              <li class="flex items-center gap-3"><svg class="text-green-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Packaging Removal</li>
            </ul>
          </div>

          <div class="space-y-8">
            <h2 class="text-2xl font-serif font-bold text-primary border-b border-gray-100 pb-4">Frequently Asked Questions</h2>
            
            <div>
              <h4 class="font-bold text-lg text-gray-900 mb-2">How can I track my order?</h4>
              <p class="text-gray-600">Once your order is dispatched, you will receive an SMS and email with a live tracking link. Our delivery team will also call you 30 minutes prior to arrival.</p>
            </div>
            
            <div>
              <h4 class="font-bold text-lg text-gray-900 mb-2">What if my item arrives damaged?</h4>
              <p class="text-gray-600">While rare, if your item arrives damaged, please refuse the delivery or contact our support team within 24 hours with photos. We will arrange an immediate replacement.</p>
            </div>
          </div>
        </div>
      `;
    } else if (path === 'returns') {
      pageBody = `
        <div class="max-w-3xl mx-auto">
          <p class="text-lg text-gray-600 mb-8">We stand behind the quality of our furniture. If you are not completely satisfied with your purchase, we're here to help.</p>
          <h2 class="text-2xl font-serif font-bold text-primary mb-4 mt-8">14-Day Return Policy</h2>
          <p class="text-gray-600 mb-4">You have 14 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.</p>
        </div>
      `;
    } else {
      // Default text for terms, privacy, etc.
      pageBody = `
        <div class="max-w-3xl mx-auto prose prose-lg text-gray-600 prose-headings:font-serif prose-headings:text-primary prose-a:text-accent">
          <h2>1. Introduction</h2>
          <p>Welcome to Talukder Furniture. These terms and conditions outline the rules and regulations for the use of our website and services.</p>
          
          <h2>2. Intellectual Property Rights</h2>
          <p>Other than the content you own, under these terms, Talukder Furniture and/or its licensors own all the intellectual property rights and materials contained in this website.</p>
          
          <h2>3. Restrictions</h2>
          <p>You are specifically restricted from all of the following:</p>
          <ul>
            <li>Publishing any website material in any other media</li>
            <li>Selling, sublicensing and/or otherwise commercializing any website material</li>
            <li>Publicly performing and/or showing any website material</li>
          </ul>
        </div>
      `;
    }

    setContent({
      title: pageTitle,
      body: pageBody,
      lastUpdated: 'June 1, 2024'
    });
    setLoading(false);
  }, [path, pageTitle]);

  return (
    <div className="bg-secondary min-h-screen pb-24">
      {/* Beautiful Hero Banner */}
      <div 
        className="relative w-full h-[250px] md:h-[300px] flex items-center justify-center mb-16"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 drop-shadow-lg">{pageTitle}</h1>
          <div className="w-16 h-1 bg-white mx-auto rounded-full mb-4"></div>
          {content?.lastUpdated && (
            <p className="text-white/80 text-sm md:text-base font-medium tracking-widest uppercase">
              Last Updated: {content.lastUpdated}
            </p>
          )}
        </div>
      </div>

      <div className="container-custom max-w-5xl">

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
            
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ) : (
          <div 
            className="w-full"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content?.body || '') }}
          />
        )}
      </div>
    </div>
  );
}
