import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, Menu, X, ChevronDown, ArrowRight, Phone } from 'lucide-react';
import useSearchStore from '../../stores/useSearchStore';
import useWishlistStore from '../../stores/useWishlistStore';
import useUIStore from '../../stores/useUIStore';
import api from '../../lib/api';

const companyMenu = {
  name: 'Company',
  path: '#',
  hasDropdown: true,
  megaMenu: [
    {
      title: 'Information',
      links: [
        { label: 'About Us', path: '/about' },
        { label: 'Contact Us', path: '/contact' },
        { label: 'Our Stores', path: '/stores' },
        { label: 'Careers', path: '/career' }
      ]
    },
    {
      title: 'Customer Service',
      links: [
        { label: 'FAQ', path: '/faqs' },
        { label: 'Shipping Policy', path: '/shipping' },
        { label: 'Warranty', path: '/warranty' },
        { label: 'Privacy Policy', path: '/privacy' }
      ]
    }
  ]
};

export default function Header() {
  const { openSearch } = useSearchStore();
  const wishlistCount = useWishlistStore((state) => state.getCount());
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, isHomePage } = useUIStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [navLinks, setNavLinks] = useState<any[]>([companyMenu]);
  const [loadingNav, setLoadingNav] = useState(true);
  const location = useLocation();

  // Determine if we should use transparent mode
  // Goes solid when: scrolled, mobile menu open, or a mega menu dropdown is open
  const hasMegaMenuOpen = hoveredNav && navLinks.find(n => n.name === hoveredNav)?.megaMenu;
  const isTransparent = isHomePage && !isScrolled && !isMobileMenuOpen && !hasMegaMenuOpen;

  useEffect(() => {
    // Fetch categories from API
    api.get('/categories')
      .then(res => {
        const dynamicLinks = res.data.map((cat: any) => {
          let name = cat.name.replace(/furniture|room|collection/gi, '').trim();

          // Specific renames
          if (name.toLowerCase() === 'bed') name = 'Bedroom';
          if (name.toLowerCase() === 'others') name = 'More';

          // Keep single-line names (no newline splitting like before)
          const words = name.split(' ');
          if (words.length > 1) {
            name = words.join(' ');
          }

          let megaMenu;
          if (cat.children && cat.children.length > 0) {
            megaMenu = [];
            for (let i = 0; i < cat.children.length; i += 4) {
              const chunk = cat.children.slice(i, i + 4);
              megaMenu.push({
                title: i === 0 ? 'Categories' : 'More',
                links: chunk.map((sub: any) => ({
                  label: sub.name,
                  path: `/shop?category=${sub.slug}`
                }))
              });
            }
          }

          return {
            name,
            path: `/shop?category=${cat.slug}`,
            hasDropdown: !!megaMenu,
            megaMenu
          };
        });

        // Add a "Furnitures" root item
        const shopMenu = {
          name: 'Furnitures',
          path: '/shop',
          hasDropdown: false
        };

        setNavLinks([shopMenu, ...dynamicLinks, companyMenu]);
      })
      .catch(console.error)
      .finally(() => setLoadingNav(false));
  }, []);

  const isActive = (path: string) => {
    if (path === '#') return false;
    if (path === '/') return location.pathname === '/';

    if (path.includes('?')) {
      const [pPath, pQuery] = path.split('?');
      return location.pathname === pPath && location.search.includes(pQuery);
    }

    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamic color classes
  const textColor = isTransparent ? 'text-white' : 'text-[#1a1a1a]';
  const textColorHover = isTransparent ? 'hover:text-white/70' : 'hover:text-gray-500';
  const borderActiveColor = isTransparent ? 'border-white' : 'border-[#1a1a1a]';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isTransparent
          ? 'bg-transparent'
          : 'bg-white shadow-sm'
        }`}
      onMouseLeave={() => setHoveredNav(null)}
    >
      <div 
        className="flex items-center justify-between h-[90px] relative px-4 md:px-8 xl:px-12 w-full"
        style={{ maxWidth: '1800px', margin: '0 auto' }}
      >
        {/* Mobile Menu Button */}
        <button
          className={`lg:hidden p-2 -ml-2 ${textColor} min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors duration-300`}
          onClick={toggleMobileMenu}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center flex-shrink-0" onClick={() => setHoveredNav(null)}>
          <div className="overflow-hidden rounded-md transition-all duration-300">
            <img
              src="/Talukder-Furniture-LTD.png"
              alt="Talukder Furniture"
              className="h-[90px] md:h-[130px] object-contain transition-all duration-300"
            />
          </div>
        </Link>

        {/* Desktop Navigation — single line, clean */}
        <nav className="hidden lg:flex items-center justify-center flex-1 mx-6 h-full">
          {loadingNav ? (
            <div className="flex gap-6 items-center h-full">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`h-3 w-16 rounded animate-pulse ${isTransparent ? 'bg-white/30' : 'bg-gray-200'}`} />
              ))}
            </div>
          ) : (
            navLinks.map((link) => (
              <div
                key={link.name}
                className="h-full flex items-center px-3 xl:px-4 relative group cursor-pointer"
                onMouseEnter={() => setHoveredNav(link.name)}
              >
                {link.hasDropdown ? (
                  <div
                    className={`flex items-center gap-1 pb-0.5 border-b-2 transition-all duration-300 ${hoveredNav === link.name || isActive(link.path) ? borderActiveColor : 'border-transparent'
                      }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setHoveredNav(hoveredNav === link.name ? null : link.name);
                    }}
                  >
                    <span className={`text-[16px] xl:text-[17px] font-medium ${textColor} whitespace-nowrap transition-colors duration-300`}>
                      {link.name}
                    </span>
                    <ChevronDown size={12} className={`${textColor} transition-colors duration-300`} strokeWidth={2} />
                  </div>
                ) : (
                  <Link to={link.path} className={`flex items-center gap-1 pb-0.5 border-b-2 transition-all duration-300 ${hoveredNav === link.name || isActive(link.path) ? borderActiveColor : 'border-transparent'
                    }`}>
                    <span className={`text-[16px] xl:text-[17px] font-medium ${textColor} whitespace-nowrap transition-colors duration-300`}>
                      {link.name}
                    </span>
                  </Link>
                )}
              </div>
            ))
          )}
        </nav>

        {/* Right Icons */}
        <div className="flex items-center gap-1 xl:gap-3 flex-shrink-0">
          <button
            onClick={openSearch}
            className={`${textColor} ${textColorHover} transition-colors duration-300 min-w-[40px] min-h-[40px] flex items-center justify-center`}
            aria-label="Search"
          >
            <Search size={20} strokeWidth={1.5} />
          </button>
          <Link
            to="/wishlist"
            className={`${textColor} ${textColorHover} transition-colors duration-300 relative min-w-[40px] min-h-[40px] flex items-center justify-center`}
            aria-label="Wishlist"
          >
            <Heart size={20} strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-[#E32227] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {wishlistCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mega Menu Dropdown Overlay */}
      <div
        className={`absolute top-[90px] left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200/50 transition-all duration-300 ease-in-out shadow-lg z-40 ${hoveredNav && navLinks.find(n => n.name === hoveredNav)?.megaMenu
            ? 'opacity-100 visible'
            : 'opacity-0 invisible'
          }`}
        style={{ minHeight: '280px' }}
      >
        <div className="max-w-[1800px] mx-auto px-4 md:px-8 xl:px-12 py-10 flex">
          {navLinks.find(n => n.name === hoveredNav)?.megaMenu && (
            <>
              {/* Left Side: Columns */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-10 lg:pr-10">
                {navLinks.find(n => n.name === hoveredNav)?.megaMenu?.map((column: any, idx: number) => (
                  <div key={idx} className="flex flex-col">
                    <h3 className="text-[13px] uppercase tracking-[0.1em] font-semibold text-[#1a1a1a] mb-6 pb-3 border-b border-gray-100 flex items-center justify-between group cursor-default">
                      {column.title}
                      <ArrowRight size={14} className="text-gray-300 transition-transform group-hover:translate-x-1" strokeWidth={2} />
                    </h3>
                    <ul className="space-y-3.5">
                      {column.links.map((link: any, lIdx: number) => (
                        <li key={lIdx}>
                          <Link
                            to={typeof link === 'string' ? `/shop?search=${encodeURIComponent(link)}` : link.path}
                            className="text-[14px] text-gray-500 hover:text-[#E32227] hover:pl-2 transition-all duration-300 block"
                            onClick={() => setHoveredNav(null)}
                          >
                            {typeof link === 'string' ? link : link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Right Side: Promotional Banner (Desktop only) */}
              <div className="hidden lg:block w-[320px] xl:w-[380px] shrink-0 border-l border-gray-100 pl-8 xl:pl-10">
                <div className="relative w-full h-full min-h-[300px] bg-gray-900 rounded-xl overflow-hidden group">
                  {/* Background Image */}
                  <img 
                    src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80" 
                    alt="Featured Furniture" 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                  />
                  {/* Dark Gradient Overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <span className="text-white text-[11px] font-bold uppercase tracking-wider mb-2">Featured</span>
                    <h4 className="text-[26px] font-light text-white mb-3 leading-[1.2]" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Crafted for <br/>Your Comfort
                    </h4>
                    <p className="text-[13px] text-gray-200 mb-6 leading-relaxed">
                      Discover our latest collection of premium furniture designed for modern living.
                    </p>
                    <Link 
                      to="/shop" 
                      className="text-[12px] font-semibold text-white uppercase tracking-[0.1em] flex items-center gap-2 hover:text-[#E32227] transition-colors w-fit pb-1 border-b border-white hover:border-[#E32227]"
                      onClick={() => setHoveredNav(null)}
                    >
                      Explore More <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-[70px] left-0 right-0 bg-white border-t border-gray-100 shadow-lg py-4 px-6 flex flex-col space-y-1 max-h-[80vh] overflow-auto z-50">
          {navLinks.map((link) => (
            <div key={link.name} className="flex flex-col">
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <Link
                  to={link.path}
                  onClick={closeMobileMenu}
                  className="text-sm font-medium text-[#1a1a1a] flex-1"
                >
                  {link.name}
                </Link>
                {link.hasDropdown && (
                  <button
                    onClick={() => setHoveredNav(hoveredNav === link.name ? null : link.name)}
                    className="p-2 -mr-2"
                  >
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition-transform ${hoveredNav === link.name ? 'rotate-180' : ''}`}
                    />
                  </button>
                )}
              </div>
              {/* Mobile Submenu */}
              {link.megaMenu && hoveredNav === link.name && (
                <div className="pl-4 py-2 space-y-4 bg-gray-50">
                  {link.megaMenu.map((column: any, idx: number) => (
                    <div key={idx}>
                      <h4 className="text-xs font-bold text-[#003580] mb-2">{column.title}</h4>
                      <ul className="space-y-2">
                        {column.links.map((subLink: any, subIdx: number) => (
                          <li key={subIdx}>
                            <Link
                              to={typeof subLink === 'string' ? `/shop?search=${encodeURIComponent(subLink)}` : subLink.path}
                              onClick={closeMobileMenu}
                              className="text-[13px] text-gray-600 hover:text-primary block py-1"
                            >
                              {typeof subLink === 'string' ? subLink : subLink.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
