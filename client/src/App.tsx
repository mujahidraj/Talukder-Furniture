import { Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './pages/admin/AdminLayout';

// Eagerly loaded pages (critical path)
import HomePage from './pages/public/HomePage';

// Lazily loaded public pages
const ShopPage = lazy(() => import('./pages/public/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/public/ProductDetailPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const FaqPage = lazy(() => import('./pages/public/FaqPage'));
const StoreListPage = lazy(() => import('./pages/public/StoreListPage'));
const WishlistPage = lazy(() => import('./pages/public/WishlistPage'));
const CareerPage = lazy(() => import('./pages/public/CareerPage'));
const StaticContentPage = lazy(() => import('./pages/public/StaticContentPage'));
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage'));

// Lazily loaded admin pages
const AdminLoginPage = lazy(() => import('./pages/admin/LoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/DashboardPage'));
const AdminProducts = lazy(() => import('./pages/admin/products/ProductListPage'));
const AdminProductForm = lazy(() => import('./pages/admin/products/ProductFormPage'));
const AdminBulkImport = lazy(() => import('./pages/admin/products/BulkImportPage'));
const AdminCategories = lazy(() => import('./pages/admin/categories/CategoryListPage'));
const AdminStores = lazy(() => import('./pages/admin/stores/StoreListPage'));
const AdminStoreForm = lazy(() => import('./pages/admin/stores/StoreFormPage'));
const AdminJobs = lazy(() => import('./pages/admin/jobs/JobListPage'));
const AdminJobForm = lazy(() => import('./pages/admin/jobs/JobFormPage'));
const AdminFaqs = lazy(() => import('./pages/admin/faqs/FaqListPage'));
const AdminFaqForm = lazy(() => import('./pages/admin/faqs/FaqFormPage'));
const AdminHeroSlides = lazy(() => import('./pages/admin/heroSlides/HeroSlideListPage'));
const AdminHeroSlideForm = lazy(() => import('./pages/admin/heroSlides/HeroSlideFormPage'));
const AdminTrustBadges = lazy(() => import('./pages/admin/trustBadges/TrustBadgeListPage'));
const AdminTeamMembers = lazy(() => import('./pages/admin/team/TeamListPage'));
const AdminLeads = lazy(() => import('./pages/admin/leads/LeadsPage'));
const AdminUsers = lazy(() => import('./pages/admin/users/AdminUserListPage'));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-3 border-border rounded-full border-t-accent animate-spin" />
      <p className="text-text-secondary text-sm">Loading...</p>
    </div>
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:categorySlug" element={<ShopPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faqs" element={<FaqPage />} />
          <Route path="/stores" element={<StoreListPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/career" element={<CareerPage />} />
          <Route path="/terms" element={<StaticContentPage />} />
          <Route path="/privacy" element={<StaticContentPage />} />
          <Route path="/shipping" element={<StaticContentPage />} />
          <Route path="/returns" element={<StaticContentPage />} />
          <Route path="/license" element={<StaticContentPage />} />
          <Route path="/warranty" element={<StaticContentPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="products/bulk-import" element={<AdminBulkImport />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="stores" element={<AdminStores />} />
          <Route path="stores/new" element={<AdminStoreForm />} />
          <Route path="stores/edit/:id" element={<AdminStoreForm />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="jobs/new" element={<AdminJobForm />} />
          <Route path="jobs/:id/edit" element={<AdminJobForm />} />
          <Route path="faqs" element={<AdminFaqs />} />
          <Route path="faqs/new" element={<AdminFaqForm />} />
          <Route path="faqs/:id/edit" element={<AdminFaqForm />} />
          <Route path="hero-slides" element={<AdminHeroSlides />} />
          <Route path="hero-slides/new" element={<AdminHeroSlideForm />} />
          <Route path="hero-slides/:id/edit" element={<AdminHeroSlideForm />} />
          <Route path="trust-badges" element={<AdminTrustBadges />} />
          <Route path="team" element={<AdminTeamMembers />} />
          <Route path="leads" element={<AdminLeads />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<PublicLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
