import { Link } from 'react-router-dom';

const Footer = ({ style }) => {
  return (
    <footer className="footer" style={style}>
      <div className="container">
        <div className="footer-content">
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              © 2026 Teretnjaci.ba
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
              Developed by{' '}
              <a 
                href="https://medinturkes.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'var(--primary-color)', textDecoration: 'none' }}
                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
              >
                Medin Turkes
              </a>
            </p>
          </div>
          <nav className="footer-links">
            <Link to="/kategorija/vijesti">Vijesti</Link>
            <Link to="/kategorija/saobracaj">Saobraćaj</Link>
            <Link to="/kategorija/dojave">Dojave</Link>
            <Link to="/kategorija/pomoc">Pomoć</Link>
            <Link to="/kategorija/oglasi">Oglasi</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;