import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, ArrowUp, Contact } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{ backgroundColor: '#1a1a1a', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', padding: '80px 24px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '110px' }} className="flex-col md:flex-row">
        
        {/* Column 1: Brand & Contact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 400, color: '#fff' }}>
            Talukder Furniture
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: '#d0d0d0', fontSize: '13px', lineHeight: 1.6 }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Contact size={16} style={{ marginTop: '3px', flexShrink: 0 }} />
              <span>Talukder Group of Industries, House #21, Road #21, Nikunja 2, Dhaka-1229,<br/>Bangladesh</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Phone size={16} style={{ flexShrink: 0 }} />
              <span>+880 1966-333355</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Mail size={16} style={{ flexShrink: 0 }} />
              <span>info@talukder-group.com.bd</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <a href="#" style={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="#" style={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
              </svg>
            </a>
            <a href="#" style={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="#" style={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </a>
          </div>
        </div>

        {/* Column 2: Categories */}
        <div style={{ borderLeft: '1px solid #333', paddingLeft: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 400, color: '#fff' }}>
            Categories
          </h2>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0, margin: 0 }}>
            {['Office Furniture', 'Home Furniture', 'Hospital Furniture', 'Industrial Furniture'].map(item => (
              <li key={item}>
                <Link to={`/shop?q=${item.toLowerCase().replace(/ /g, '-')}`} style={{ color: '#d0d0d0', fontSize: '13px', textDecoration: 'none' }}>{item}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Customer Services */}
        <div style={{ borderLeft: '1px solid #333', paddingLeft: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 400, color: '#fff' }}>
            Customer Services
          </h2>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              { name: 'Shipping', path: '/shipping' },
              { name: 'Return & Refund', path: '/returns' },
              { name: 'Privacy Policy', path: '/privacy' },
              { name: 'Terms of Use', path: '/terms' },
              { name: 'Contact Us', path: '/contact' },
            ].map(item => (
              <li key={item.name}>
                <Link to={item.path} style={{ color: '#d0d0d0', fontSize: '13px', textDecoration: 'none' }}>{item.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Information */}
        <div style={{ borderLeft: '1px solid #333', paddingLeft: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 400, color: '#fff' }}>
            Information
          </h2>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              { name: 'About Us', path: '/about' },
              { name: 'Our Stores', path: '/stores' },
              { name: 'License & Certificates', path: '/license' },
              { name: 'Career', path: '/career' },
            ].map(item => (
              <li key={item.name}>
                <Link to={item.path} style={{ color: '#d0d0d0', fontSize: '13px', textDecoration: 'none' }}>{item.name}</Link>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div style={{ backgroundColor: '#111', padding: '24px' }}>
        <div style={{ maxWidth: '1800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
          <p style={{ color: '#fff', fontSize: '13px', margin: 0, fontWeight: 300 }}>
            Copyright ©{currentYear} Talukder. All Rights Reserved.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button 
              onClick={scrollToTop}
              style={{ 
                width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#222', 
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff', transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#222'}
            >
              <ArrowUp size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
