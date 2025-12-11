import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              © 2025 Teretnjaci.ba
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
