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

  console.log('ProtectedRoute check:', {
    userExists: !!user,
    userRole,
    isOwner,
    isAdmin,
    currentPath: location.pathname,
    requireOwner
  });

  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requireOwner && !isOwner) {
    console.log('User is not owner, redirecting to admin dashboard');
    return <Navigate to="/admin/clanci" replace />;
  }

  // Also check if user is admin for any admin route
  if (!isAdmin && location.pathname.startsWith('/admin')) {
    console.log('User is not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('Access granted for:', user?.fullName || user?.FullName);
  return children;
};

export default ProtectedRoute;