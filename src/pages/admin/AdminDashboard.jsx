import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Truck, FileText, Users, LogOut, Home, Menu, X, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const { user, logout, isOwner } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
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
      {/* Mobile Header - Burger button properly aligned */}
      {isMobile && (
        <div className="admin-mobile-header">
          <button
            onClick={toggleSidebar}
            className="mobile-menu-button"
            style={{ 
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '0.375rem'
            }}
          >
            <Menu size={24} />
          </button>
          
          <Link to="/" className="mobile-logo">
            <Truck size={28} color="var(--primary)" />
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Teretnjaci.ba</span>
          </Link>
          
          {/* Empty div for proper alignment - keeps the logo centered */}
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
            <Truck size={32} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Teretnjaci.ba</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Admin panel</div>
            </div>
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

        {/* User Info - Improved alignment */}
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