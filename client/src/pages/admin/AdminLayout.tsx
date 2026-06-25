import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Grid, 
  Store, 
  Briefcase, 
  HelpCircle, 
  Image as ImageIcon, 
  FileText, 
  MessageSquare,
  LogOut,
  Menu,
  X,
  Upload,
  Users
} from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';
import useUIStore from '../../stores/useUIStore';

const adminLinks = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Bulk Import', path: '/admin/products/bulk-import', icon: Upload },
  { name: 'Categories', path: '/admin/categories', icon: Grid },
  { name: 'Stores', path: '/admin/stores', icon: Store },
  { name: 'Job Posts', path: '/admin/jobs', icon: Briefcase },
  { name: 'Leads / Inbox', path: '/admin/leads', icon: MessageSquare },
  { name: 'Hero Slides', path: '/admin/hero-slides', icon: ImageIcon },
  { name: 'FAQs', path: '/admin/faqs', icon: HelpCircle },
  { name: 'Users', path: '/admin/users', icon: Users },
];

export default function AdminLayout() {
  const { token, admin, logout, checkAuth } = useAuthStore();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists in localStorage, if not redirect to login
    if (!localStorage.getItem('admin_token')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!localStorage.getItem('admin_token')) {
    return null; // Don't render until redirected
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white text-primary border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col h-full shadow-xl md:shadow-none`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
              <Link to="/admin" className="flex items-center gap-2 flex-1">
                <img src="/furniture_logo.jpg" alt="Talukder Furniture" className="h-[35px] w-auto object-contain" />
                <span className="text-lg md:text-xl font-serif font-bold text-primary tracking-tight hidden md:block">
                  Talukder <span className="text-accent">Admin</span>
                </span>
              </Link>
          <button className="md:hidden text-gray-500 hover:text-primary" onClick={closeMobileMenu}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto py-4 custom-scrollbar">
          <nav className="px-4 space-y-1">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.exact}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                      isActive 
                        ? 'bg-black text-white shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                    }`
                  }
                >
                  <Icon size={18} />
                  {link.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold border border-accent/20">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">{admin?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500 truncate">{admin?.email || 'admin@talukder.com'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10 shadow-sm flex-shrink-0">
          <button 
            className="md:hidden text-gray-500 hover:text-primary focus:outline-none p-2 -ml-2"
            onClick={toggleMobileMenu}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1 flex justify-end items-center gap-4">
            <Link 
              to="/" 
              target="_blank" 
              className="text-sm font-medium text-gray-500 hover:text-accent transition-colors"
            >
              View Live Site
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
