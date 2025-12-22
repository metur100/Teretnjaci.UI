import { Link } from 'react-router-dom';

const Footer = ({ style }) => {
  return (
    <footer className="footer" style={style}>
      <div className="container">
        <div className="footer-content">
          <div className="footer-grid">
            {/* About Section */}
            <div className="footer-section">
              <h3>Teretnjaci.ba</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                © 2026 Teretnjaci.ba
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
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

            {/* Contact Info */}
            <div className="footer-section">
              <h3>Kontakt</h3>
              <div className="contact-info">
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <a 
                    href="mailto:info@teretnjaci.ba"
                    style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
                    onMouseOver={(e) => e.target.style.color = 'var(--primary-color)'}
                    onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
                  >
                    info@teretnjaci.ba
                  </a>
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Tuzla, Bosna i Hercegovina
                </p>
              </div>
            </div>

            {/* Legal */}
            <div className="footer-section">
              <h3>Pravne informacije</h3>
              <nav className="footer-links-vertical">
                <Link to="/politika-privatnosti">Politika privatnosti</Link>
                <Link to="/uslovi-koristenja">Uslovi korištenja</Link>
              </nav>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;