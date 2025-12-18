import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn } from 'lucide-react';
import logo from "../../images/teretnjaci.png";

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    } else {
      setCheckingAuth(false);
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      // Navigation handled by useEffect
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  // Show loading while checking auth status
  if (checkingAuth) {
    return (
      <div style={{
        minHeight: 'calc(var(--vh, 1vh) * 100)', // WebView compatible
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)'
      }}>
        <div style={{
          maxWidth: '400px',
          width: '100%',
          backgroundColor: 'var(--bg-secondary)',
          padding: '2rem',
          borderRadius: '1rem',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 60px var(--shadow)',
          textAlign: 'center'
        }}>
          <div className="spinner" style={{ margin: '1rem auto' }}></div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Provjera autentikacije...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if user exists
  if (user) {
    return null;
  }

  return (
    <div style={{
      minHeight: 'calc(var(--vh, 1vh) * 100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        backgroundColor: 'var(--bg-secondary)',
        padding: '2rem',
        borderRadius: '1rem',
        border: '1px solid var(--border)',
        boxShadow: '0 20px 60px var(--shadow)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img 
            src={logo} 
            alt="Teretnjaci.ba" 
            style={{
              width: '300px',
              height: 'auto'
            }}
          />
        </div>

        {error && (
          <div style={{
            backgroundColor: '#dc262620',
            border: '1px solid #dc2626',
            color: '#dc2626',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Korisničko ime</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Lozinka</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? (
              <>
                <div className="spinner-small" style={{ marginRight: '0.5rem' }}></div>
                Prijava...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Prijavite se
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a href="/" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'none' }}>
            ← Povratak na početnu
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;