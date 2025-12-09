import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Truck, Search, Home, Newspaper, Navigation, AlertTriangle, HelpCircle, FileText } from 'lucide-react';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

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
              <Truck />
              <span>Teretnjaci.ba</span>
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

            <form onSubmit={handleSearch} className="search-bar">
              <Search size={18} />
              <input
                type="text"
                placeholder="Pretraži vijesti..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
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
        </div>
      </nav>
    </>
  );
};

export default Header;