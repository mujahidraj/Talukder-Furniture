import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import useSearchStore from '../../stores/useSearchStore';
import useWishlistStore from '../../stores/useWishlistStore';
import useUIStore from '../../stores/useUIStore';
import api from '../../lib/api';

const companyMenu = {
  name: 'Company\n',
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
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [navLinks, setNavLinks] = useState<any[]>([companyMenu]);
  const [loadingNav, setLoadingNav] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Fetch categories from API
    api.get('/categories')
      .then(res => {
        const dynamicLinks = res.data.map((cat: any) => {
          let name = cat.name.replace(/furniture|room|collection/gi, '').trim();
          
          // Specific renames
          if (name.toLowerCase() === 'bed') name = 'Bedroom';
          if (name.toLowerCase() === 'others') name = 'More';

          // Add newline before last word if there are multiple words, to mimic the UI style
          const words = name.split(' ');
          if (words.length > 1) {
            name = words.slice(0, -1).join(' ') + '\n' + words[words.length - 1];
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
        
        // Add a "Furnitures" (previously "Shop All") root item
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
        isScrolled ? 'shadow-sm' : ''
      }`}
      onMouseLeave={() => setHoveredNav(null)}
    >
      <div 
        className="flex items-center justify-between h-[90px] lg:h-[105px] relative px-4 md:px-8 xl:px-12 w-full"
        style={{ maxWidth: '1800px', margin: '0 auto' }}
      >
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 -ml-2 text-primary"
          onClick={toggleMobileMenu}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Exact Logo Match */}
        <Link to="/" className="flex flex-col items-center flex-shrink-0" onClick={() => setHoveredNav(null)}>
          <div className="flex flex-col items-center">
            <img src="/furniture_logo.jpg" alt="Talukder Furniture" className="h-[45px] md:h-[55px] w-auto object-contain" />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center justify-center flex-1 mx-8 h-full">
          {loadingNav ? (
            <div className="flex gap-8 items-center h-full">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 w-16 lg:w-20 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            navLinks.map((link) => (
              <div
                key={link.name}
                className="h-full flex items-center px-4 xl:px-5 relative group cursor-pointer"
                onMouseEnter={() => setHoveredNav(link.name)}
              >
                {link.hasDropdown ? (
                  <div className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                    hoveredNav === link.name || isActive(link.path) ? 'border-[#1a1a1a]' : 'border-transparent'
                  }`}>
                    <span className="text-[14px] xl:text-[15px] font-semibold text-[#1a1a1a] whitespace-pre text-center leading-tight">
                      {link.name}
                    </span>
                    <ChevronDown size={14} className="text-[#1a1a1a] mt-1" strokeWidth={2} />
                  </div>
                ) : (
                  <Link to={link.path} className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                    hoveredNav === link.name || isActive(link.path) ? 'border-[#1a1a1a]' : 'border-transparent'
                  }`}>
                    <span className="text-[14px] xl:text-[15px] font-semibold text-[#1a1a1a] whitespace-pre text-center leading-tight">
                      {link.name}
                    </span>
                  </Link>
                )}
              </div>
            ))
          )}
        </nav>

        {/* Right Icons */}
        <div className="flex items-center gap-4 xl:gap-6 flex-shrink-0">
          <button
            onClick={openSearch}
            className="text-[#1a1a1a] hover:text-gray-500 transition-colors"
            aria-label="Search"
          >
            <Search size={22} strokeWidth={1.5} />
          </button>
          <Link
            to="/wishlist"
            className="text-[#1a1a1a] hover:text-gray-500 transition-colors relative"
            aria-label="Wishlist"
          >
            <Heart size={22} strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E32227] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {wishlistCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mega Menu Dropdown Overlay */}
      <div 
        className={`absolute top-[105px] left-0 w-full bg-[#f8f9fa] border-t border-gray-200 transition-all duration-300 ease-in-out shadow-lg z-40 ${
          hoveredNav && navLinks.find(n => n.name === hoveredNav)?.megaMenu 
            ? 'opacity-100 visible' 
            : 'opacity-0 invisible'
        }`}
        style={{ minHeight: '300px' }}
      >
        <div className="max-w-[1800px] mx-auto px-12 py-10">
          {navLinks.find(n => n.name === hoveredNav)?.megaMenu && (
            <div className="flex justify-between w-full">
              {navLinks.find(n => n.name === hoveredNav)?.megaMenu?.map((column, idx) => (
                <div key={idx} className="flex-1 px-4">
                  <h3 className="text-[14px] font-semibold text-[#003580] mb-5 flex items-center gap-1">
                    {column.title} <ArrowRight size={14} className="text-[#003580]" strokeWidth={2.5}/>
                  </h3>
                  <ul className="space-y-3">
                    {column.links.map((link: any, lIdx: number) => (
                      <li key={lIdx}>
                        <Link 
                          to={typeof link === 'string' ? `/shop?search=${encodeURIComponent(link)}` : link.path} 
                          className={`text-[13px] transition-colors inline-block relative after:content-[''] after:absolute after:w-full after:h-[1px] after:bottom-[-2px] after:left-0 after:bg-[#003580] after:transition-transform after:duration-300 hover:after:scale-x-100 hover:text-[#003580] ${
                            typeof link !== 'string' && isActive(link.path)
                              ? 'text-[#003580] after:scale-x-100 after:origin-bottom-left'
                              : 'text-[#4a4a4a] after:scale-x-0 after:origin-bottom-right hover:after:origin-bottom-left'
                          }`}
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
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-[80px] left-0 right-0 bg-white border-t border-gray-100 shadow-lg py-4 px-6 flex flex-col space-y-1 max-h-[80vh] overflow-auto z-50">
          {navLinks.map((link, index) => (
            <div key={link.name} className="flex flex-col">
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <Link
                  to={link.path}
                  onClick={closeMobileMenu}
                  className="text-sm font-medium text-[#1a1a1a] whitespace-pre flex-1"
                >
                  {link.name.replace('\n', ' ')}
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
                  {link.megaMenu.map((column, idx) => (
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
