import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function FallbackRedirect() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <Navigate
      to={currentUser.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'}
      replace
    />
  );
}