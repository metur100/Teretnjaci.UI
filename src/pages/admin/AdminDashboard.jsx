import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FileText, Users, LogOut, Home, Menu, X, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../images/teretnjaci.png';

const AdminDashboard = () => {
  const { user, logout, isOwner } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Mobile Header */}
      {isMobile && (
        <div className="admin-mobile-header">
          <button
            onClick={toggleSidebar}
            className="mobile-menu-button"
          >
            <Menu size={24} />
          </button>
          
          <Link to="/" className="mobile-logo">
            <img 
              src={logo}
              alt="Teretnjaci.ba" 
              className="admin-logo-mobile"
            />
          </Link>
          
          <div style={{ width: '48px', opacity: 0 }}></div>
        </div>
      )}

      {/* Sidebar Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''} ${!isMobile ? 'desktop-only' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/" className="sidebar-logo">
            <img 
              src={logo} 
              alt="Teretnjaci.ba" 
              className="admin-logo-sidebar"
            />
          </Link>
          
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="close-sidebar-button"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* User Info */}
        <div className="user-info-card">
          <p className="user-info-label">Prijavljen kao</p>
          <p className="user-info-name">{user?.fullName}</p>
          <p className="user-info-role">{user?.role}</p>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav">
          <Link
            to="/"
            className={`admin-nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <Home size={20} />
            <span>Početna stranica</span>
          </Link>

          <Link
            to="/admin/clanci"
            className={`admin-nav-link ${location.pathname.includes('/admin/clanci') ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <FileText size={20} />
            <span>Članci</span>
          </Link>

          {isOwner() && (
            <Link
              to="/admin/admini"
              className={`admin-nav-link ${location.pathname.includes('/admin/admini') ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <Users size={20} />
              <span>Admini</span>
            </Link>
          )}
        </nav>

        {/* Theme Toggle */}
        <div style={{ 
          padding: '1rem 0',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          marginTop: 'auto'
        }}>
          <button
            onClick={toggleTheme}
            className="btn btn-secondary"
            style={{ 
              width: '100%',
              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Svijetli režim' : 'Tamni režim'}</span>
          </button>
        </div>

        {/* Logout Button */}
        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="btn btn-secondary logout-btn"
          >
            <LogOut size={18} />
            Odjava
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;