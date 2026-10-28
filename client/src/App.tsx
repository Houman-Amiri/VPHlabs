import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/UiStates';
import { RequireAuth, RequireRole } from './components/auth/RouteGuards';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ServicesPage } from './pages/ServicesPage';
import { ArticlesPage } from './pages/ArticlesPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminArticlesPage } from './pages/admin/AdminArticlesPage';
import { AdminBannersPage } from './pages/admin/AdminBannersPage';
import { AdminTeamPage } from './pages/admin/AdminTeamPage';
import { AdminContentPage } from './pages/admin/AdminContentPage';
import { AdminMessagesPage } from './pages/admin/AdminMessagesPage';
import { useSiteStore } from './store/useSiteStore';
import { useAuthStore } from './store/useAuthStore';

function ScrollToTopOnNavigate() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

export function App() {
  const fetchBootstrap = useSiteStore((s) => s.fetchBootstrap);
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    fetchBootstrap();
    checkSession();
  }, [fetchBootstrap, checkSession]);

  return (
    <div className="app-shell">
      <ScrollToTopOnNavigate />
      <Navbar />

      <main id="main-content" className="app-main">
        <Routes>
          {/* Public Separated Pages (React Router v6 matches case-insensitively: /contact & /Contact, /articles/:id & /Articles/:id) */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:id" element={<ArticleDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Admin Auth & Protected Dynamic CMS */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<RequireAuth />}>
            <Route
              path="/admin"
              element={
                <RequireRole role="admin">
                  <AdminLayout />
                </RequireRole>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="articles" element={<AdminArticlesPage />} />
              <Route path="banners" element={<AdminBannersPage />} />
              <Route path="team" element={<AdminTeamPage />} />
              <Route path="content" element={<AdminContentPage />} />
              <Route path="messages" element={<AdminMessagesPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
      <ToastContainer />
    </div>
  );
}

export default App;
