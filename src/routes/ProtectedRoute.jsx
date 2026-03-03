import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ role }) {
  const { currentUser, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (role && currentUser.role !== role) {
    return (
      <Navigate
        to={
          currentUser.role === 'admin'
            ? '/admin-dashboard'
            : '/user-dashboard'
        }
        replace
      />
    );
  }

  return <Outlet />;
}