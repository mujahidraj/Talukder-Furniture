import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../lib/api';

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
    
    // Completely static content
    setContent({
      title: pageTitle,
      body: `
        <h2>1. Introduction</h2>
        <p>Welcome to Talukder Furniture. These terms and conditions outline the rules and regulations for the use of our website and services. By accessing this website, we assume you accept these terms and conditions. Do not continue to use Talukder Furniture if you do not agree to take all of the terms and conditions stated on this page.</p>
        
        <h2>2. Intellectual Property Rights</h2>
        <p>Other than the content you own, under these terms, Talukder Furniture and/or its licensors own all the intellectual property rights and materials contained in this website. You are granted limited license only for purposes of viewing the material contained on this website.</p>
        
        <h2>3. Restrictions</h2>
        <p>You are specifically restricted from all of the following:</p>
        <ul>
          <li>Publishing any website material in any other media</li>
          <li>Selling, sublicensing and/or otherwise commercializing any website material</li>
          <li>Publicly performing and/or showing any website material</li>
          <li>Using this website in any way that is or may be damaging to this website</li>
          <li>Using this website in any way that impacts user access to this website</li>
        </ul>
        
        <h2>4. Your Content</h2>
        <p>In these Website Standard Terms and Conditions, "Your Content" shall mean any audio, video text, images or other material you choose to display on this website. By displaying Your Content, you grant Talukder Furniture a non-exclusive, worldwide irrevocable, sub licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.</p>
        
        <h2>5. No warranties</h2>
        <p>This website is provided "as is," with all faults, and Talukder Furniture express no representations or warranties, of any kind related to this website or the materials contained on this website. Also, nothing contained on this website shall be interpreted as advising you.</p>
      `,
      lastUpdated: 'June 1, 2024'
    });
    setLoading(false);
  }, [path, pageTitle]);

  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="container-custom max-w-3xl">
        <div className="mb-12 border-b border-gray-100 pb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">{pageTitle}</h1>
          {content?.lastUpdated && (
            <p className="text-gray-500 text-sm uppercase tracking-widest">Last Updated: {content.lastUpdated}</p>
          )}
        </div>

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
            className="prose prose-lg max-w-none text-gray-600 prose-headings:font-serif prose-headings:text-primary prose-a:text-accent"
            dangerouslySetInnerHTML={{ __html: content?.body || '' }}
          />
        )}
      </div>
    </div>
  );
}
