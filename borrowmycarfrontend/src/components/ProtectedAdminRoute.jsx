import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthProvider';

const ProtectedAdminRoute = ({ children }) => {
  const { isAdminAuthenticated, adminUser, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAdminAuthenticated || !adminUser || adminUser.role !== 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;