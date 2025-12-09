import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Truck, FileText, Users, LogOut, Home } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout, isOwner } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '250px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <Truck size={32} color="var(--primary)" />
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Teretnjaci.ba</span>
        </Link>

        <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '0.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Prijavljen kao
          </p>
          <p style={{ fontWeight: 'bold' }}>{user?.fullName}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{user?.role}</p>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              transition: 'background-color 0.2s'
            }}
          >
            <Home size={20} />
            <span>Početna stranica</span>
          </Link>

          <Link
            to="/admin/clanci"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: location.pathname.includes('/admin/clanci') ? 'var(--bg-tertiary)' : 'transparent',
              transition: 'background-color 0.2s'
            }}
          >
            <FileText size={20} />
            <span>Članci</span>
          </Link>

          {isOwner() && (
            <Link
              to="/admin/admini"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                backgroundColor: location.pathname.includes('/admin/admini') ? 'var(--bg-tertiary)' : 'transparent',
                transition: 'background-color 0.2s'
              }}
            >
              <Users size={20} />
              <span>Admini</span>
            </Link>
          )}
        </nav>

        <button
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{ justifyContent: 'center', width: '100%' }}
        >
          <LogOut size={18} />
          Odjava
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', backgroundColor: 'var(--bg-primary)' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
