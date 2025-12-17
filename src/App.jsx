// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminArticles from './pages/admin/AdminArticles';
import AdminArticleForm from './pages/admin/AdminArticleForm';
import AdminUsers from './pages/admin/AdminUsers';
import ProtectedRoute from './components/ProtectedRoute';
import CategoryPage from './pages/CategoryPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <NavigationHandler />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="kategorija/:slug" element={<CategoryPage />} />
              <Route path="clanak/:slug" element={<ArticleDetail />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminArticles />} />
              <Route path="clanci" element={<AdminArticles />} />
              <Route path="clanci/novi" element={<AdminArticleForm />} />
              <Route path="clanci/uredi/:id" element={<AdminArticleForm />} />
              <Route
                path="admini"
                element={
                  <ProtectedRoute requireOwner>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function NavigationHandler() {
  const location = useLocation();

  useEffect(() => {
    const canGoBack = window.history.length > 1;
    
    // Method 2: Using standard Android JavaScript interface
    if (window.Android && window.Android.onRouteChange) {
      window.Android.onRouteChange(canGoBack);
    }
  }, [location]);

  return null;
}

function setVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVh();
window.addEventListener('resize', setVh);

