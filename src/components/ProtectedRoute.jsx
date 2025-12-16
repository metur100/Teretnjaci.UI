import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireOwner = false }) => {
  const { user, loading, getUserProperty } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Provjera autentikacije...</p>
      </div>
    );
  }

  // Check if user exists (handle both camelCase and PascalCase)
  const userRole = getUserProperty('role');
  const isOwner = userRole === 'Owner';
  const isAdmin = userRole === 'Admin' || userRole === 'Owner';

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requireOwner && !isOwner) {
    return <Navigate to="/admin/clanci" replace />;
  }

  // Also check if user is admin for any admin route
  if (!isAdmin && location.pathname.startsWith('/admin')) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;