










import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SouqPage from './pages/SouqPage';
import CreatorsHubPage from './pages/CreatorsHubPage';
import InspirationGalleryPage from './pages/InspirationGalleryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ArtisanDetailPage from './pages/ArtisanDetailPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';
import ArtisanDashboardPage from './pages/ArtisanDashboardPage';
import ManageProjectsPage from './pages/ManageProjectsPage';
import UploadWorkPage from './pages/UploadWorkPage';
import EditProjectPage from './pages/EditProjectPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminManageProductsPage from './pages/AdminManageProductsPage';
import AdminManageProjectsPage from './pages/AdminManageProjectsPage';
import AdminManageUsersPage from './pages/AdminManageUsersPage';
import AdminManageAdminsPage from './pages/AdminManageAdminsPage';
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';
import LoadingSpinner from './components/LoadingSpinner';

import ProtectedRoute from './components/ProtectedRoute';
import { useTranslation } from './i18n';
import { useAuth } from './context/AuthContext';
import EditArtisanProfilePage from './pages/EditArtisanProfilePage';
import CartPage from './pages/CartPage';
import AdminEditProjectPage from './pages/AdminEditProjectPage';
import AdminEditProductPage from './pages/AdminEditProductPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import AdminManageArticlesPage from './pages/AdminManageArticlesPage';


const App: React.FC = () => {
    const { lang } = useTranslation();
    const { isInitializing } = useAuth();
    
    useEffect(() => {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }, [lang]);

    if (isInitializing) {
      return <LoadingSpinner fullScreen text="Initializing Session..." />
    }

  return (
      <div className="bg-stone-50 min-h-screen flex flex-col font-sans text-elw-charcoal">
          <Routes>
            {/* Public-facing site with Header and Footer */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/souq" element={<SouqPage />} />
              <Route path="/creators" element={<CreatorsHubPage />} />
              <Route path="/inspiration" element={<InspirationGalleryPage />} />
              <Route path="/articles" element={<ArticlesPage />} />
              <Route path="/articles/:articleId" element={<ArticleDetailPage />} />
              <Route path="/souq/:productId" element={<ProductDetailPage />} />
              <Route path="/creators/:artisanId" element={<ArtisanDetailPage />} />
              <Route path="/inspiration/:projectId" element={<ProjectDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/cart" element={<CartPage />} />

              {/* Profile page is public-facing but protected */}
              <Route element={<ProtectedRoute allowedRoles={['user', 'artisan', 'admin']} />}>
                  <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Artisan dashboard is also protected */}
               <Route element={<ProtectedRoute allowedRoles={['artisan']} />}>
                  <Route path="/artisan/dashboard" element={<ArtisanDashboardPage />} />
                  <Route path="/artisan/projects" element={<ManageProjectsPage />} />
                  <Route path="/artisan/upload" element={<UploadWorkPage />} />
                  <Route path="/artisan/edit/:projectId" element={<EditProjectPage />} />
                  <Route path="/artisan/edit-profile" element={<EditArtisanProfilePage />} />
              </Route>
            </Route>
            
            {/* Admin Section with its own dedicated layout */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="products" element={<AdminManageProductsPage />} />
                <Route path="edit-product/:productId" element={<AdminEditProductPage />} />
                <Route path="projects" element={<AdminManageProjectsPage />} />
                <Route path="edit-project/:projectId" element={<AdminEditProjectPage />} />
                <Route path="users" element={<AdminManageUsersPage />} />
                <Route path="admins" element={<AdminManageAdminsPage />} />
                <Route path="articles" element={<AdminManageArticlesPage />} />
              </Route>
            </Route>

            {/* Standalone pages without the main layout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

          </Routes>
      </div>
  );
};

export default App;