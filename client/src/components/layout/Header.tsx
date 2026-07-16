import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
        const activeCategories = res.data.filter((cat: any) => cat.isActive !== false);
        const dynamicLinks = activeCategories.map((cat: any) => {
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
            const activeChildren = cat.children.filter((sub: any) => sub.isActive !== false);
            if (activeChildren.length > 0) {
              megaMenu = activeChildren.map((sub: any) => {
                const links = [];
                if (sub.children && sub.children.length > 0) {
                  const activeSubChildren = sub.children.filter((subSub: any) => subSub.isActive !== false);
                  links.push(...activeSubChildren.map((subSub: any) => ({
                  label: subSub.name,
                  path: `/shop?category=${subSub.slug}`
                })));
              }
              links.push({
                label: `Shop All ${sub.name}`,
                path: `/shop?category=${sub.slug}`
              });

              return {
                title: sub.name,
                links
              };
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

        api.get('/sets?limit=50').then(setRes => {
          const sets = setRes.data.sets || [];
          
          let collectionsMenu = null;
          if (sets.length > 0) {
            const categoriesWithSets = new Map();

            sets.forEach((s: any) => {
              if (s.category && s.category.name) {
                if (!categoriesWithSets.has(s.category.slug)) {
                  categoriesWithSets.set(s.category.slug, {
                    label: s.category.name,
                    path: `/shop?category=${s.category.slug}&type=sets`
                  });
                }
              }
            });

            const links = Array.from(categoriesWithSets.values());

            collectionsMenu = {
              name: 'Collections',
              path: '/shop?type=sets',
              hasDropdown: links.length > 0,
              megaMenu: links.length > 0 ? [
                {
                  title: 'Shop Sets by Category',
                  links: links
                }
              ] : undefined
            };
          }

          if (collectionsMenu) {
            setNavLinks([collectionsMenu, ...dynamicLinks, companyMenu]);
          } else {
            setNavLinks([...dynamicLinks, companyMenu]);
          }
          setLoadingNav(false);
        }).catch(err => {
          console.error(err);
          setNavLinks([...dynamicLinks, companyMenu]);
          setLoadingNav(false);
        });
      })
      .catch(err => {
        console.error(err);
        setLoadingNav(false);
      });
  }, []);

  const isActive = (path: string) => {
    if (path === '#') return false;
    if (path === '/') return location.pathname === '/';

    if (path.includes('?')) {
      const [pPath, pQuery] = path.split('?');
      if (location.pathname !== pPath) return false;
      
      const targetParams = new URLSearchParams(pQuery);
      const currentParams = new URLSearchParams(location.search);
      
      let isMatch = true;
      targetParams.forEach((value, key) => {
        if (currentParams.get(key) !== value) {
          isMatch = false;
        }
      });
      return isMatch;
    }

    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isLinkOrChildActive = (link: any) => {
    if (isActive(link.path)) return true;
    
    if (link.megaMenu) {
      for (const column of link.megaMenu) {
        if (column.links) {
          for (const subLink of column.links) {
            const path = typeof subLink === 'string' ? `/shop?search=${encodeURIComponent(subLink)}` : subLink.path;
            if (isActive(path)) return true;
          }
        }
      }
    }
    return false;
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
          : 'bg-white/90 backdrop-blur-md border-b border-gray-100/50 shadow-sm'
        }`}
      onMouseLeave={() => setHoveredNav(null)}
    >
      <div 
        className="flex items-center justify-between relative px-4 md:px-8 xl:px-12 w-full transition-all duration-500 h-[90px]"
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
          <div className="overflow-hidden rounded-md transition-all duration-500 flex items-center">
            <img
              src="/ICON%20SET/Talukder-Furniture-LTD.png"
              alt="Talukder Furniture"
              className="object-contain transition-all duration-500 h-[70px] md:h-[90px]"
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
            navLinks.map((link) => {
              const isHighlighted = (hoveredNav || navLinks.find(l => isLinkOrChildActive(l))?.name) === link.name;
              const linkTextColor = isHighlighted && !isTransparent ? 'text-[#E32227]' : textColor;
              
              return (
              <div
                key={link.name}
                className="h-full flex items-center px-3 xl:px-4 relative group cursor-pointer"
                onMouseEnter={() => setHoveredNav(link.name)}
              >
                {link.hasDropdown ? (
                  <div
                    className="flex items-center gap-1.5 py-1 relative"
                    onClick={(e) => {
                      e.preventDefault();
                      setHoveredNav(hoveredNav === link.name ? null : link.name);
                    }}
                  >
                    <span className={`text-[12px] xl:text-[13px] font-bold uppercase tracking-[0.1em] ${linkTextColor} whitespace-nowrap transition-colors duration-300`}>
                      {link.name}
                    </span>
                    <motion.div
                      animate={{ rotate: hoveredNav === link.name ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center"
                    >
                      <ChevronDown size={14} className={`${linkTextColor} transition-colors duration-300`} strokeWidth={2.5} />
                    </motion.div>
                    
                    {/* Animated Underline */}
                    {isHighlighted && (
                      <motion.div
                        layoutId="nav-underline"
                        className={`absolute left-0 right-0 -bottom-[4px] h-[2px] ${isTransparent ? 'bg-white' : 'bg-[#E32227]'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </div>
                ) : (
                  <Link to={link.path} className="flex items-center gap-1.5 py-1 relative group-hover:opacity-100">
                    <span className={`text-[12px] xl:text-[13px] font-bold uppercase tracking-[0.1em] ${linkTextColor} whitespace-nowrap transition-colors duration-300`}>
                      {link.name}
                    </span>
                    
                    {/* Animated Underline */}
                    {isHighlighted && (
                      <motion.div
                        layoutId="nav-underline"
                        className={`absolute left-0 right-0 -bottom-[4px] h-[2px] ${isTransparent ? 'bg-white' : 'bg-[#E32227]'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                )}
              </div>
              );
            })
          )}
        </nav>

        {/* Right Icons */}
        <div className="flex items-center gap-1 xl:gap-3 flex-shrink-0">
          <button
            onClick={openSearch}
            className={`${textColor} ${textColorHover} transition-all duration-300 w-[42px] h-[42px] flex items-center justify-center rounded-full hover:bg-black/5 active:scale-95`}
            aria-label="Search"
          >
            <Search size={18} strokeWidth={2} />
          </button>
          <Link
            to="/wishlist"
            className={`${textColor} ${textColorHover} transition-all duration-300 relative w-[42px] h-[42px] flex items-center justify-center rounded-full hover:bg-black/5 active:scale-95`}
            aria-label="Wishlist"
          >
            <Heart size={18} strokeWidth={2} />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#E32227] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                {wishlistCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {hoveredNav && navLinks.find(n => n.name === hoveredNav)?.megaMenu && (
          <motion.div
            initial={{ opacity: 0, y: -15, rotateX: -5 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -15, rotateX: -5 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute top-[90px] left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg z-40 overflow-y-auto overflow-x-hidden custom-scrollbar origin-top"
            style={{ minHeight: 'auto', maxHeight: 'calc(100vh - 90px)' }}
          >
            <div className="max-w-[1800px] mx-auto px-4 md:px-8 xl:px-12 py-6 flex">
              {/* Left Side: Columns */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-6 lg:pr-8">
                {navLinks.find(n => n.name === hoveredNav)?.megaMenu?.map((column: any, idx: number) => (
                  <div key={idx} className="flex flex-col">
                    <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-3 pb-2 border-b border-gray-100/70 flex items-center justify-between group cursor-default">
                      {column.title}
                    </h3>
                    <ul className="space-y-1.5">
                      {column.links.map((link: any, lIdx: number) => (
                        <motion.li 
                          key={lIdx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: lIdx * 0.05 + idx * 0.1 }}
                        >
                          <Link
                            to={typeof link === 'string' ? `/shop?search=${encodeURIComponent(link)}` : link.path}
                            className="text-[14px] text-gray-700 font-medium hover:text-[#E32227] flex items-center group/link transition-colors duration-300"
                            onClick={() => setHoveredNav(null)}
                          >
                            <span className="w-0 opacity-0 overflow-hidden group-hover/link:w-4 group-hover/link:opacity-100 transition-all duration-300 ease-out flex items-center justify-start text-[#E32227]">
                              <ArrowRight size={12} strokeWidth={3} />
                            </span>
                            <span className="transform group-hover/link:translate-x-1 transition-transform duration-300 ease-out">
                              {typeof link === 'string' ? link : link.label}
                            </span>
                          </Link>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Right Side: Promotional Banner (Desktop only) */}
              <div className="hidden lg:block w-[260px] xl:w-[300px] shrink-0 border-l border-gray-100 pl-6 xl:pl-8">
                <div className="relative w-full h-full min-h-[220px] flex flex-col items-center justify-center group rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-white">
                  {/* Local Background Image */}
                  <img 
                    src="/Images/hospital_furniture.png" 
                    alt="Furniture Background" 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-white/10" />
                  
                  {/* Logo GIF */}
                  <div className="relative z-10">
                    <img 
                      src="/ICON%20SET/LOGO.gif" 
                      alt="Talukder Furniture Logo" 
                      className="w-32 h-32 object-contain mb-1 mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => { e.currentTarget.src = "/ICON SET/LOGO.gif"; }}
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center text-center px-4 pb-3">
                    <span className="text-[#E32227] text-[10px] font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                       <span className="w-4 h-[2px] bg-[#E32227] rounded-full"></span> 
                       Featured
                       <span className="w-4 h-[2px] bg-[#E32227] rounded-full"></span> 
                    </span>
                    <h4 className="text-[24px] font-bold text-gray-900 mb-3 leading-tight tracking-tight">
                      Talukder Exclusives
                    </h4>
                    <p className="text-[13px] text-gray-700 font-medium mb-6 leading-relaxed max-w-[240px]">
                      Experience the finest craftsmanship and modern designs with our latest collection.
                    </p>
                    <Link 
                      to="/shop" 
                      className="text-[12px] font-bold text-[#E32227] uppercase tracking-[0.15em] flex items-center gap-2 hover:text-[#b3191d] transition-colors pb-1 border-b-2 border-[#E32227]/30 hover:border-[#E32227] group/link"
                      onClick={() => setHoveredNav(null)}
                    >
                      Explore All Furniture <ArrowRight size={14} className="group-hover/link:translate-x-1.5 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="lg:hidden absolute top-[70px] left-0 right-0 bg-white border-t border-gray-100 shadow-lg py-4 px-6 flex flex-col space-y-1 max-h-[80vh] overflow-auto z-50 origin-top"
          >
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
              <AnimatePresence>
                {link.megaMenu && hoveredNav === link.name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="pl-4 py-2 space-y-4 bg-gray-50 overflow-hidden"
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
