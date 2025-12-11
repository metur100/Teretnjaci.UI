// Header.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Home, Newspaper, Navigation, AlertTriangle, FileText, Moon, Sun, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import logo from '../images/teretnjaci.png';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              <img 
                src={logo} 
                alt="Teretnjaci.ba" 
                className="logo-image"
              />
            </Link>

            <nav className="nav">
              <Link to="/" className={isActive('/') ? 'active' : ''}>
                Početna
              </Link>
              <Link 
                to="/kategorija/vijesti" 
                className={location.pathname.includes('/vijesti') ? 'active' : ''}
              >
                Vijesti
              </Link>
              <Link 
                to="/kategorija/saobracaj" 
                className={location.pathname.includes('/saobracaj') ? 'active' : ''}
              >
                Saobraćaj
              </Link>
              <Link 
                to="/kategorija/dojave" 
                className={location.pathname.includes('/dojave') ? 'active' : ''}
              >
                Dojave
              </Link>
              <Link 
                to="/kategorija/pomoc" 
                className={location.pathname.includes('/pomoc') ? 'active' : ''}
              >
                Pomoć
              </Link>
              <Link 
                to="/kategorija/oglasi" 
                className={location.pathname.includes('/oglasi') ? 'active' : ''}
              >
                Oglasi
              </Link>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <form onSubmit={handleSearch} className="search-bar">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Pretraži..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              <button
                onClick={toggleTheme}
                className="theme-toggle"
                aria-label="Toggle theme"
                title={theme === 'dark' ? 'Prebaci na svijetli režim' : 'Prebaci na tamni režim'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              {/* Admin Login Icon - Added */}
              <Link 
                to="/admin/login" 
                className="theme-toggle"
                aria-label="Admin login"
                title="Admin login"
                style={{ textDecoration: 'none' }}
              >
                <Lock size={20} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="bottom-nav-content">
          <Link to="/" className={isActive('/') ? 'active' : ''}>
            <Home />
            <span>Početna</span>
          </Link>
          <Link 
            to="/kategorija/vijesti" 
            className={location.pathname.includes('/vijesti') ? 'active' : ''}
          >
            <Newspaper />
            <span>Vijesti</span>
          </Link>
          <Link 
            to="/kategorija/dojave" 
            className={location.pathname.includes('/dojave') ? 'active' : ''}
          >
            <AlertTriangle />
            <span>Dojave</span>
          </Link>
          <Link 
            to="/kategorija/saobracaj" 
            className={location.pathname.includes('/saobracaj') ? 'active' : ''}
          >
            <Navigation />
            <span>Saobraćaj</span>
          </Link>
          <Link 
            to="/kategorija/oglasi" 
            className={location.pathname.includes('/oglasi') ? 'active' : ''}
          >
            <FileText />
            <span>Oglasi</span>
          </Link>
          {/* Admin Login Icon in Mobile Navigation - Added */}
          <Link 
            to="/admin/login" 
            className={location.pathname.includes('/admin') ? 'active' : ''}
            aria-label="Admin login"
          >
            <Lock size={20} />
            <span>Admin</span>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Header;